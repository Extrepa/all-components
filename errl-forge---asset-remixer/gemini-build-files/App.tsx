
import React, { useState } from 'react';
import { AssetLibrary } from './components/AssetLibrary';
import { AssetEditor } from './components/AssetEditor';
import { GameAsset, Preset, AssetMetadata, MapleData } from './types';
import { ASSET_PRESETS } from './constants';
import { generateAssetImage, generateAssetMetadata, getAIService } from './services/aiService';
import { AIProviderType } from './services/aiProvider';
import { getMapleSpriteUrl } from './services/mapleStoryService';
import { imageUrlToBase64 } from './utils';
import { Hammer } from 'lucide-react';

const INITIAL_ASSET: GameAsset = {
  id: 'new-1',
  name: 'New Asset',
  type: 'monster',
  originalPrompt: 'A mysterious pixel art creature, maple story style, white background',
  remixPrompt: 'A mysterious pixel art creature, maple story style, white background',
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

  const handleSelectPreset = (preset: Preset) => {
    setCurrentAsset({
      ...INITIAL_ASSET,
      id: Date.now().toString(),
      name: preset.name,
      type: preset.type,
      originalPrompt: preset.basePrompt,
      remixPrompt: preset.basePrompt,
      imageUrl: preset.imageUrl, 
      status: 'idle'
    });
  };

  const handleSelectMapleAsset = async (asset: MapleData) => {
    const spriteUrl = getMapleSpriteUrl(asset.id, asset.category);
    
    let finalSourceUrl = spriteUrl;
    try {
        const base64 = await imageUrlToBase64(spriteUrl);
        finalSourceUrl = `data:image/png;base64,${base64}`;
    } catch (e) {
        console.warn("Could not convert maple asset to base64 immediately:", e);
    }

    // Determine asset type logic
    let assetType: GameAsset['type'] = 'monster';
    if (asset.category === 'item' || asset.category === 'equip') assetType = 'item';
    if (asset.category === 'npc') assetType = 'npc';
    if (asset.category === 'map') assetType = 'background';

    // Tailor the prompt based on category
    let promptDescriptor = `A ${asset.name} from MapleStory`;
    if (asset.category === 'item') promptDescriptor = `A game icon for ${asset.name}`;
    if (asset.category === 'equip') promptDescriptor = `A wearable ${asset.name} equipment`;
    if (asset.category === 'pet') promptDescriptor = `A cute pet ${asset.name} creature`;
    if (asset.category === 'map') promptDescriptor = `A level background or environment art for ${asset.name}`;
    if (asset.category === 'hair' || asset.category === 'face') promptDescriptor = `A character customization style: ${asset.name}`;

    setCurrentAsset({
      ...INITIAL_ASSET,
      id: `maple-${asset.category}-${asset.id}`,
      name: asset.name,
      type: assetType,
      sourceImageUrl: finalSourceUrl,
      imageUrl: undefined, 
      originalPrompt: `${promptDescriptor}, pixel art style`,
      remixPrompt: `A remixed version of ${asset.name}, neon aesthetic, dripping paint style, high quality 2d game asset`,
      status: 'idle'
    });
  };

  const handleNewCustom = () => {
    setCurrentAsset(INITIAL_ASSET);
  };

  const handleUpdateAsset = (updates: Partial<GameAsset>) => {
    setCurrentAsset(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    if (currentAsset.status === 'generating') return;

    setCurrentAsset(prev => ({ ...prev, status: 'generating' }));

    try {
      // Set the provider before generating
      getAIService({ type: aiProvider });

      // 1. Generate Image
      let inputImageBase64: string | undefined = undefined;
      
      if (currentAsset.sourceImageUrl) {
        if (currentAsset.sourceImageUrl.startsWith('data:')) {
            inputImageBase64 = currentAsset.sourceImageUrl.split(',')[1];
        } else {
            inputImageBase64 = await imageUrlToBase64(currentAsset.sourceImageUrl);
        }
      }

      const imageUri = await generateAssetImage(currentAsset.remixPrompt, inputImageBase64);

      // 2. Generate Metadata
      const metadata = await generateAssetMetadata(currentAsset.name, currentAsset.remixPrompt);

      setCurrentAsset(prev => ({
        ...prev,
        imageUrl: imageUri,
        metadata: metadata,
        status: 'complete'
      }));
    } catch (error) {
      console.error("Generation failed:", error);
      setCurrentAsset(prev => ({ ...prev, status: 'error' }));
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f13] text-gray-100 overflow-hidden font-sans">
      <AssetLibrary 
        onSelectPreset={handleSelectPreset} 
        onSelectMapleAsset={handleSelectMapleAsset}
        onNewCustom={handleNewCustom}
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
          <div className="flex items-center gap-4">
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as AIProviderType)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <div className="text-xs text-gray-500 font-mono">
               v0.3.5-beta (GMS v210)
            </div>
          </div>
        </header>

        <AssetEditor 
          asset={currentAsset}
          onUpdateAsset={handleUpdateAsset}
          onGenerate={handleGenerate}
        />
      </main>
    </div>
  );
};

export default App;
