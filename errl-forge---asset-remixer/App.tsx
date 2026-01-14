
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { registerServiceWorker, isOnline } from './utils/serviceWorker';
import { AssetLibrary } from './components/AssetLibrary';
import { AssetEditor } from './components/AssetEditor';
import { Settings } from './components/Settings';
import { GameAsset, Preset, AssetMetadata, MapleData, AppError, MapleVersion } from './types';
import { ASSET_PRESETS } from './constants';
import { generateAssetImage, generateAssetMetadata, getAIService, reloadAIService } from './services/aiService';
import { AIProviderType } from './services/aiProvider';
import { getMapleSpriteUrl } from './services/mapleStoryService';
import { imageUrlToBase64 } from './utils';
import { storageService } from './services/storageService';
import { Hammer, Layers, Wifi, WifiOff, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { ThemeControls } from '@errl-design-system';

// Lazy load components that aren't always needed
const BatchGenerator = lazy(() => import('./components/BatchGenerator').then(module => ({ default: module.BatchGenerator })));

const INITIAL_ASSET: GameAsset = {
  id: 'new-1',
  name: 'New Asset',
  type: 'monster',
  originalPrompt: 'A mysterious pixel art creature, maple story style, white or transparent background',
  remixPrompt: 'A mysterious pixel art creature, maple story style, white or transparent background',
  status: 'idle',
  metadata: {
    hp: 0,
    exp: 0,
    speed: 0,
    behavior: '',
    description: '',
    hitbox: { width: 0, height: 0, offsetX: 0, offsetY: 0 },
    animations: []
  }
};

const App: React.FC = () => {
  const [currentAsset, setCurrentAsset] = useState<GameAsset>(INITIAL_ASSET);
  const [aiProvider, setAiProvider] = useState<AIProviderType>('gemini');
  const [mode, setMode] = useState<'editor' | 'batch'>('editor');
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedMapleAssetId, setSelectedMapleAssetId] = useState<string | null>(null);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setSelectedMapleAssetId(null);
    setCurrentAsset({
      ...INITIAL_ASSET,
      id: Date.now().toString(),
      name: preset.name,
      type: preset.type,
      originalPrompt: preset.basePrompt,
      remixPrompt: preset.basePrompt,
      imageUrl: preset.imageUrl,
      presetId: preset.id, // Track which preset was used
      status: 'idle'
    });
  };

  const handleSelectMapleAsset = async (asset: MapleData) => {
    // Extract version from asset.imgUrl if available, or default to v210
    // The asset.imgUrl should be set correctly from the database with the right version
    let version: MapleVersion = '210';
    if (asset.imgUrl) {
      const urlMatch = asset.imgUrl.match(/\/GMS\/(\d+)\//);
      if (urlMatch) {
        version = urlMatch[1] as MapleVersion;
      }
    }
    
    // For pets, fetch the full pet data to get image from frameBooks
    let finalSourceUrl: string;
    if (asset.category === 'pet') {
      try {
        const { fetchPetImage } = await import('./services/mapleStoryService');
        const petImage = await fetchPetImage(asset.id, version);
        if (petImage) {
          finalSourceUrl = petImage; // Already a data URL
        } else {
          // Fallback to sprite URL if pet image fetch fails
          finalSourceUrl = getMapleSpriteUrl(asset.id, asset.category, version);
        }
      } catch (e) {
        console.warn('Failed to fetch pet image, using sprite URL:', e);
        finalSourceUrl = getMapleSpriteUrl(asset.id, asset.category, version);
      }
    } else {
      // For other categories, use the full render URL (not just icon)
      // This gives us the complete sprite for remixing
      const spriteUrl = getMapleSpriteUrl(asset.id, asset.category, version);
      
      // Try to convert to base64 for better compatibility, but don't fail if it doesn't work
      try {
        const { imageUrlToBase64 } = await import('./utils');
        const base64 = await imageUrlToBase64(spriteUrl);
        if (base64) {
          finalSourceUrl = `data:image/png;base64,${base64}`;
        } else {
          finalSourceUrl = spriteUrl;
        }
      } catch (e) {
        // If conversion fails (CORS), use the URL directly
        console.warn('Could not convert sprite to base64, using URL directly:', e);
        finalSourceUrl = spriteUrl;
      }
    }

    // Determine asset type logic
    let assetType: GameAsset['type'] = 'monster';
    // All item subcategories should be 'item' type
    if (asset.category === 'item' || asset.category === 'equip' || 
        asset.category === 'glasses' || asset.category === 'earrings' || 
        asset.category === 'hat' || asset.category === 'cape' || 
        asset.category === 'gloves' || asset.category === 'shoes' || 
        asset.category === 'ring' || asset.category === 'pendant' ||
        asset.category === 'top' || asset.category === 'bottom' || 
        asset.category === 'overall' ||
        asset.category === 'face' || asset.category === 'skin' || 
        asset.category === 'pose' || asset.category === 'hair') assetType = 'item';
    if (asset.category === 'npc') assetType = 'npc';
    if (asset.category === 'map') assetType = 'background';

    // Tailor the prompt based on category
    let promptDescriptor = `A ${asset.name} from MapleStory`;
    if (asset.category === 'item') promptDescriptor = `A game icon for ${asset.name}`;
    if (asset.category === 'equip') promptDescriptor = `A wearable ${asset.name} equipment`;
    if (asset.category === 'pet') promptDescriptor = `A cute pet ${asset.name} creature`;
    if (asset.category === 'map') promptDescriptor = `A level background or environment art for ${asset.name}`;
    if (asset.category === 'hair') promptDescriptor = `A character customization style: ${asset.name}`;
    if (asset.category === 'glasses' || asset.category === 'earrings' || asset.category === 'hat' || asset.category === 'cape' || asset.category === 'gloves' || asset.category === 'shoes' || asset.category === 'ring' || asset.category === 'pendant') {
      promptDescriptor = `A ${asset.category} accessory: ${asset.name}`;
    }

    const mapleAssetId = `maple-${asset.category}-${asset.id}`;
    setSelectedMapleAssetId(mapleAssetId);
    setSelectedPresetId(null);
    setCurrentAsset({
      ...INITIAL_ASSET,
      id: mapleAssetId,
      name: asset.name,
      type: assetType,
      sourceImageUrl: finalSourceUrl,
      imageUrl: undefined, 
      originalPrompt: `${promptDescriptor}, pixel art style, white or transparent background`,
      remixPrompt: `Remix this image to look very similar to the original: keep the same subject, pose, composition, and structure. Apply Errl aesthetic with neon colors, dripping paint effects, and psychedelic softness to the ENTIRE asset - both the main subject and surroundings. Transform the colors and style while maintaining the same recognizable shape, position, and pose. Use white or transparent background.`,
      status: 'idle'
    });
  };

  const handleNewCustom = () => {
    setCurrentAsset(INITIAL_ASSET);
  };

  const handleSelectSavedAsset = (asset: GameAsset) => {
    setCurrentAsset({
      ...asset,
      status: 'idle' // Reset status when loading saved asset
    });
  };

  const handleUpdateAsset = (updates: Partial<GameAsset>) => {
    setCurrentAsset(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    if (currentAsset.status === 'generating') return;

    setCurrentAsset(prev => ({ 
      ...prev, 
      status: 'generating',
      error: undefined,
      progress: {
        imageProgress: 0,
        metadataProgress: 0,
        currentStep: 'Initializing...'
      }
    }));

    try {
      // Set the provider before generating
      getAIService({ type: aiProvider });

      // 1. Generate Image
      let inputImageBase64: string | undefined = undefined;
      
      setCurrentAsset(prev => ({
        ...prev,
        progress: {
          imageProgress: 0,
          metadataProgress: 0,
          currentStep: 'Preparing image...'
        }
      }));

      if (currentAsset.sourceImageUrl) {
        if (currentAsset.sourceImageUrl.startsWith('data:')) {
            inputImageBase64 = currentAsset.sourceImageUrl.split(',')[1];
        } else {
            // Convert URL to base64 when generating (may fail due to CORS, but that's OK)
            const base64 = await imageUrlToBase64(currentAsset.sourceImageUrl);
            if (base64) {
              inputImageBase64 = base64;
            } else {
              // If CORS blocks conversion, we'll still pass the URL for dimension detection
              // and the prompt will include dimension preservation instructions
              console.warn("Could not convert image to base64 (CORS may be blocking). Dimension preservation will still work.");
            }
        }
      }

      setCurrentAsset(prev => ({
        ...prev,
        progress: {
          imageProgress: 0,
          metadataProgress: 0,
          currentStep: 'Generating image...'
        }
      }));

      const imageUri = await generateAssetImage(currentAsset.remixPrompt, inputImageBase64, currentAsset.sourceImageUrl);

      setCurrentAsset(prev => ({
        ...prev,
        progress: {
          imageProgress: 100,
          metadataProgress: 0,
          currentStep: 'Generating metadata...'
        }
      }));

      // 2. Generate Metadata
      const metadata = await generateAssetMetadata(currentAsset.name, currentAsset.remixPrompt);

      const completedAsset: GameAsset = {
        ...currentAsset,
        imageUrl: imageUri,
        resizedImageUrl: undefined, // Only set when user manually resizes
        metadata: metadata,
        status: 'complete',
        error: undefined,
        progress: {
          imageProgress: 100,
          metadataProgress: 100,
          currentStep: 'Complete'
        },
        timestamp: Date.now()
      };

      setCurrentAsset(completedAsset);

      // Auto-save to storage
      try {
        await storageService.saveAsset(completedAsset);
      } catch (error) {
        console.warn('Failed to auto-save asset:', error);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      const appError: AppError = error && typeof error === 'object' && 'category' in error
        ? error as AppError
        : {
            category: 'unknown_error',
            message: error instanceof Error ? error.message : String(error),
            userMessage: 'Generation failed. Please try again.',
            retryable: true
          };
      
      setCurrentAsset(prev => ({ 
        ...prev, 
        status: 'error',
        error: appError,
        progress: undefined
      }));
    }
  };

  // Service Worker registration and offline monitoring
  useEffect(() => {
    // Completely disable service worker in development to prevent CORB loops
    if (import.meta.env.DEV) {
      // Unregister any existing service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister().catch(() => {});
          });
        });
      }
    } else {
      // Only register service worker in production
      registerServiceWorker().catch(console.error);
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for API key updates and reload provider
  useEffect(() => {
    const handleApiKeysUpdated = () => {
      // Reload the current provider to pick up new API keys
      reloadAIService();
    };

    window.addEventListener('apiKeysUpdated', handleApiKeysUpdated);
    return () => {
      window.removeEventListener('apiKeysUpdated', handleApiKeysUpdated);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + G: Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (currentAsset.status !== 'generating' && mode === 'editor') {
          handleGenerate();
        }
      }
      
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (currentAsset.imageUrl && mode === 'editor') {
          const link = document.createElement('a');
          link.href = currentAsset.imageUrl;
          link.download = `${currentAsset.name.toLowerCase().replace(/\s/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          const jsonStr = JSON.stringify(currentAsset.metadata, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(blob);
          const jsonLink = document.createElement('a');
          jsonLink.href = jsonUrl;
          jsonLink.download = `${currentAsset.name.toLowerCase().replace(/\s/g, '_')}_data.json`;
          document.body.appendChild(jsonLink);
          jsonLink.click();
          document.body.removeChild(jsonLink);
          URL.revokeObjectURL(jsonUrl);
        }
      }
      
      // Ctrl/Cmd + B: Toggle Batch Mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setMode(mode === 'editor' ? 'batch' : 'editor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAsset, mode]);

  return (
    <div className="flex h-screen bg-[#0f0f13] text-gray-100 overflow-hidden font-sans neon-outline m-2">
      <AssetLibrary
        onSelectPreset={handleSelectPreset}
        onSelectMapleAsset={handleSelectMapleAsset}
        onSelectSavedAsset={handleSelectSavedAsset}
        onNewCustom={handleNewCustom}
        selectedAssetId={currentAsset.id}
        selectedPresetId={selectedPresetId}
        selectedMapleAssetId={selectedMapleAssetId}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold font-pixel text-sm tracking-wide text-gray-200">
              ERRL <span className="text-indigo-400">FORGE</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOffline && (
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 h-8 bg-orange-900/30 border border-orange-500/30 rounded text-xs text-orange-400">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </div>
            )}
            {!isOffline && (
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 h-8 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-400 opacity-50">
                <Wifi className="w-3.5 h-3.5" />
                <span>Online</span>
              </div>
            )}
            <button
              onClick={() => setMode(mode === 'editor' ? 'batch' : 'editor')}
              className={`px-3 py-1.5 h-8 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                mode === 'batch' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {mode === 'editor' ? 'Batch Mode' : 'Editor Mode'}
            </button>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as AIProviderType)}
              className="h-8 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono w-24"
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <ThemeControls compact={true} />
            <button
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 flex items-center justify-center hover:bg-gray-800 rounded transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-xs text-gray-500 font-mono h-8 flex items-center">
               v0.4.0-beta (GMS v210)
            </div>
          </div>
        </header>

        {mode === 'editor' ? (
          <AssetEditor 
            asset={currentAsset}
            onUpdateAsset={handleUpdateAsset}
            onGenerate={handleGenerate}
            aiProvider={aiProvider}
          />
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          }>
            <BatchGenerator 
              provider={aiProvider}
              onAssetGenerated={(asset) => {
                setCurrentAsset(asset);
                setMode('editor');
              }}
            />
          </Suspense>
        )}
      </main>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default App;
