
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GameAsset, AssetMetadata } from '../types';
import { STYLE_MODIFIERS, STYLE_BUTTON_CONFIG, PRESET_SIZES } from '../constants';
import { Wand2, Download, RefreshCw, Zap, Save, Code, ArrowRight, AlertCircle, X, History, Clock, Star, Plus, Trash2, Film, Box, Loader2, ChevronDown, Image as ImageIcon, FileJson, Minimize2, RotateCcw, ChevronRight, Scissors } from 'lucide-react';
import { getAIService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { AnimationSequence } from '../types';
import { AIProviderType } from '../services/aiProvider';

// Lazy load components that aren't always visible
const AnimationGenerator = lazy(() => import('./AnimationGenerator').then(module => ({ default: module.AnimationGenerator })));
const HitboxEditor = lazy(() => import('./HitboxEditor').then(module => ({ default: module.HitboxEditor })));

interface AssetEditorProps {
  asset: GameAsset;
  onUpdateAsset: (updates: Partial<GameAsset>) => void;
  onGenerate: () => void;
  aiProvider?: AIProviderType;
}

export const AssetEditor: React.FC<AssetEditorProps> = ({ asset, onUpdateAsset, onGenerate, aiProvider = 'gemini' }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'history'>('visual');
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof STYLE_MODIFIERS | 'none'>('none');
  const [history, setHistory] = useState<GameAsset[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customPresets, setCustomPresets] = useState<Array<{ id: string; name: string; modifiers: string[]; description?: string }>>([]);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [selectedModifiersForPreset, setSelectedModifiersForPreset] = useState<string[]>([]);
  const [showAnimationGenerator, setShowAnimationGenerator] = useState(false);
  const [showHitboxEditor, setShowHitboxEditor] = useState(false);
  const [showHitboxOverlay, setShowHitboxOverlay] = useState(false);
  const [showHitboxMenu, setShowHitboxMenu] = useState(false);
  const [showResizeMenu, setShowResizeMenu] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [previousResizedUrl, setPreviousResizedUrl] = useState<string | undefined>(undefined);
  const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({ width: null, height: null });
  const [gridDensity, setGridDensity] = useState(20); // Grid size in pixels (default 20px)
  const [customResizeWidth, setCustomResizeWidth] = useState<number | ''>('');
  const [customResizeHeight, setCustomResizeHeight] = useState<number | ''>('');
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [showRemoveBgMenu, setShowRemoveBgMenu] = useState(false);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | undefined>(undefined);
  const [bgRemovalThreshold, setBgRemovalThreshold] = useState(240); // Brightness threshold for background removal

  // Apply style modifier to prompt when selection changes
  useEffect(() => {
    if (asset.status === 'idle' || asset.status === 'complete') {
       // Optional: Logic to reset prompt if needed
    }
  }, [selectedStyle]);

  // Load history when asset changes
  useEffect(() => {
    if (asset.id && asset.id !== 'new-1') {
      loadHistory();
    }
  }, [asset.id]);

  // Detect dimensions from source or generated image
  useEffect(() => {
    const detectDimensions = async () => {
      const imageToCheck = asset.sourceImageUrl || asset.imageUrl;
      if (imageToCheck) {
        try {
          const { getImageDimensions } = await import('../utils');
          const dims = await getImageDimensions(imageToCheck);
          if (dims && dims.width > 0 && dims.height > 0) {
            setDimensions({ width: dims.width, height: dims.height });
          } else {
            setDimensions({ width: null, height: null });
          }
        } catch (error) {
          console.warn('Failed to detect dimensions:', error);
          setDimensions({ width: null, height: null });
        }
      } else {
        setDimensions({ width: null, height: null });
      }
    };
    detectDimensions();
  }, [asset.sourceImageUrl, asset.imageUrl]);

  // Load custom presets on mount
  useEffect(() => {
    loadCustomPresets();
  }, []);

  const loadCustomPresets = async () => {
    try {
      const presets = await storageService.getAllPresets();
      setCustomPresets(presets);
    } catch (error) {
      console.error('Failed to load custom presets:', error);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName || selectedModifiersForPreset.length === 0) {
      alert('Please enter a name and select at least one modifier');
      return;
    }

    try {
      const preset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newPresetName,
        modifiers: selectedModifiersForPreset,
        description: newPresetDescription
      };

      await storageService.savePreset(preset);
      await loadCustomPresets();
      setNewPresetName('');
      setNewPresetDescription('');
      setSelectedModifiersForPreset([]);
      setShowPresetManager(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset');
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (confirm('Delete this custom preset?')) {
      try {
        await storageService.deletePreset(id);
        await loadCustomPresets();
      } catch (error) {
        console.error('Failed to delete preset:', error);
        alert('Failed to delete preset');
      }
    }
  };

  const handleApplyPreset = (preset: { modifiers: string[] }) => {
    const combinedModifiers = preset.modifiers.map(mod => STYLE_MODIFIERS[mod as keyof typeof STYLE_MODIFIERS] || mod).join(', ');
    const newPrompt = asset.originalPrompt + (combinedModifiers ? `, ${combinedModifiers}` : '');
    onUpdateAsset({ remixPrompt: newPrompt });
    setSelectedStyle('none'); // Reset style selector since we're using a preset
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const assetHistory = await storageService.getAssetHistory(asset.id);
      setHistory(assetHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRevertToVersion = (versionAsset: GameAsset) => {
    if (confirm('Load this version? Current changes will be lost.')) {
      onUpdateAsset({
        ...versionAsset,
        status: 'idle',
        error: undefined
      });
      setShowHistory(false);
    }
  };

  const handleStyleChange = (style: keyof typeof STYLE_MODIFIERS | 'none') => {
    setSelectedStyle(style);
    let newPrompt = asset.originalPrompt;
    if (style !== 'none') {
      newPrompt += `, ${STYLE_MODIFIERS[style]}`;
    }
    onUpdateAsset({ remixPrompt: newPrompt });
  };

  const downloadAsset = (format: 'png' | 'jpeg' | 'json' | 'all' = 'all', size: 'small' | 'large' | 'both' = 'both') => {
    if (!asset.imageUrl && format !== 'json') return;
    
    const baseName = asset.name.toLowerCase().replace(/\s/g, '_');

    // Helper to convert image to format
    const convertAndDownload = (imageUrl: string, format: 'png' | 'jpeg', sizeLabel: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const sizeSuffix = sizeLabel ? `_${sizeLabel}` : '';
          link.download = `${baseName}${sizeSuffix}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, mimeType, format === 'jpeg' ? 0.95 : undefined);
      };
      img.src = imageUrl;
    };

    if (format === 'png' || format === 'all') {
      if (size === 'small' || size === 'both') {
        if (asset.resizedImageUrl) {
          // Small delay to allow previous download to start
          setTimeout(() => convertAndDownload(asset.resizedImageUrl!, 'png', 'small'), size === 'both' ? 100 : 0);
        } else if (asset.imageUrl) {
          convertAndDownload(asset.imageUrl, 'png', 'small');
        }
      }
      if (size === 'large' || size === 'both') {
        if (asset.imageUrl) {
          setTimeout(() => convertAndDownload(asset.imageUrl!, 'png', 'large'), size === 'both' ? 200 : 0);
        }
      }
    }

    if (format === 'jpeg' || format === 'all') {
      if (size === 'small' || size === 'both') {
        if (asset.resizedImageUrl) {
          setTimeout(() => convertAndDownload(asset.resizedImageUrl!, 'jpeg', 'small'), size === 'both' ? 100 : 0);
        } else if (asset.imageUrl) {
          convertAndDownload(asset.imageUrl, 'jpeg', 'small');
        }
      }
      if (size === 'large' || size === 'both') {
        if (asset.imageUrl) {
          setTimeout(() => convertAndDownload(asset.imageUrl!, 'jpeg', 'large'), size === 'both' ? 200 : 0);
        }
      }
    }

    if (format === 'json' || format === 'all') {
      if (asset.metadata) {
        const jsonStr = JSON.stringify(asset.metadata, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(blob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `${baseName}_data.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
      }
    }

    setShowExportMenu(false);
  };

  const handleResize = async (targetWidth: number, targetHeight: number) => {
    if (!asset.imageUrl || isResizing) return;
    
    setIsResizing(true);
    try {
      const { resizeImage } = await import('../utils');
      // Store current resized URL before resizing for undo
      if (asset.resizedImageUrl) {
        setPreviousResizedUrl(asset.resizedImageUrl);
      }
      const resizedImageUrl = await resizeImage(asset.imageUrl, targetWidth, targetHeight);
      onUpdateAsset({ resizedImageUrl });
      setShowResizeMenu(false);
    } catch (error) {
      console.error('Failed to resize image:', error);
      alert('Failed to resize image. Please try again.');
    } finally {
      setIsResizing(false);
    }
  };

  const handleResizeToOriginal = async () => {
    if (!asset.imageUrl || isResizing) return;
    
    let targetWidth: number;
    let targetHeight: number;
    
    // Check if asset was generated from a preset
    if (asset.presetId && PRESET_SIZES[asset.presetId]) {
      const presetSize = PRESET_SIZES[asset.presetId];
      targetWidth = presetSize.width;
      targetHeight = presetSize.height;
    } else if (asset.sourceImageUrl) {
      // Fall back to source image dimensions
      const { getImageDimensions } = await import('../utils');
      const originalDims = await getImageDimensions(asset.sourceImageUrl);
      if (originalDims && originalDims.width > 0 && originalDims.height > 0) {
        targetWidth = originalDims.width;
        targetHeight = originalDims.height;
      } else {
        alert('Could not determine target dimensions');
        return;
      }
    } else {
      alert('No preset or source image found for resizing');
      return;
    }
    
    await handleResize(targetWidth, targetHeight);
  };

  const handleUndoResize = () => {
    // Store current resized URL before undoing (in case user wants to undo the undo)
    const currentResized = asset.resizedImageUrl;
    if (previousResizedUrl) {
      // Restore previous resized image
      onUpdateAsset({ resizedImageUrl: previousResizedUrl });
      // Store current as previous for potential redo
      if (currentResized) {
        setPreviousResizedUrl(currentResized);
      }
    } else {
      // If no previous URL, remove the resized image
      onUpdateAsset({ resizedImageUrl: undefined });
      // Store current as previous in case user wants to restore it
      if (currentResized) {
        setPreviousResizedUrl(currentResized);
      }
    }
    setShowResizeMenu(false);
  };

  const handleRemoveBackground = async (threshold?: number) => {
    if (!asset.imageUrl || isRemovingBackground) return;
    
    setIsRemovingBackground(true);
    try {
      // Store current image for undo
      setPreviousImageUrl(asset.imageUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = asset.imageUrl!;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const thresholdValue = threshold ?? bgRemovalThreshold;
      
      // Background removal: make white/light pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        // If pixel brightness exceeds threshold, make it transparent
        // Higher threshold = more aggressive (removes lighter pixels)
        // Lower threshold = less aggressive (only removes very white pixels)
        if (brightness > thresholdValue) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const newImageUrl = canvas.toDataURL('image/png');
      
      // Update the asset with the background-removed image
      onUpdateAsset({ imageUrl: newImageUrl });
      setShowRemoveBgMenu(false);
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to remove background. Please try again.');
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleUndoBackgroundRemoval = () => {
    if (previousImageUrl) {
      onUpdateAsset({ imageUrl: previousImageUrl });
      setPreviousImageUrl(undefined);
      setShowRemoveBgMenu(false);
    }
  };

  // Determine what to display in the visual tab
  const displayImage = asset.imageUrl || asset.sourceImageUrl;
  const isSource = !asset.imageUrl && !!asset.sourceImageUrl;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
      if (showHitboxMenu && !target.closest('.hitbox-menu-container')) {
        setShowHitboxMenu(false);
      }
      if (showResizeMenu && !target.closest('.resize-menu-container')) {
        setShowResizeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu, showHitboxMenu, showResizeMenu]);


  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900/50 overflow-hidden">
      {/* Header Section (2 Rows) */}
      <div className="flex flex-col shrink-0 bg-gray-900 border-b border-gray-800">
        
        {/* Row 1: Title */}
        <div className="h-12 flex items-center justify-between px-6 border-b border-gray-800/50 shimmer-border">
          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
            <h1 className="text-lg font-bold text-white font-pixel tracking-tighter truncate" title={asset.name}>
              {asset.name || 'Untitled Asset'}
            </h1>
          </div>
        </div>

        {/* Row 2: Controls */}
        <div className="h-12 flex items-center justify-between pl-6 pr-2 bg-gray-900/30">
          {/* Left: Generate and Status */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onGenerate}
              disabled={asset.status === 'generating'}
              className="flex items-center justify-center gap-2 px-4 py-1.5 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 whitespace-nowrap"
            >
              {asset.status === 'generating' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {isSource ? 'REMIX SOURCE' : 'GENERATE'}
            </button>
            {/* Status Chip */}
            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              asset.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 
              asset.status === 'error' ? 'bg-red-500/20 text-red-400' : 
              'bg-green-500/20 text-green-400'
            }`}>
              {asset.status}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAnimationGenerator(true)}
              disabled={asset.status !== 'complete' || !asset.imageUrl}
              className="flex items-center justify-center gap-2 px-3 py-1.5 h-8 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-xs transition-colors whitespace-nowrap min-w-[80px]"
              title="Generate Animation Frames"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Animate</span>
            </button>
            <div className="relative hitbox-menu-container">
              <button
                onClick={() => setShowHitboxMenu(!showHitboxMenu)}
                disabled={asset.status !== 'complete' || !asset.imageUrl || !asset.metadata}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 h-8 rounded font-medium text-xs transition-colors whitespace-nowrap min-w-[80px] ${
                  asset.status === 'complete' && asset.imageUrl && asset.metadata
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
                }`}
                title="Hitbox Options"
              >
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hitbox</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showHitboxMenu && asset.status === 'complete' && asset.imageUrl && asset.metadata && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[160px]">
                  <button
                    onClick={() => {
                      setShowHitboxEditor(true);
                      setShowHitboxMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Box className="w-3.5 h-3.5" />
                    Edit Hitbox
                  </button>
                  {asset.metadata?.hitbox && (
                    <button
                      onClick={() => {
                        setShowHitboxOverlay(!showHitboxOverlay);
                        setShowHitboxMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 flex items-center gap-2 ${
                        showHitboxOverlay ? 'text-red-400' : 'text-gray-300'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      {showHitboxOverlay ? 'Hide' : 'Show'} Hitbox
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative remove-bg-menu-container">
              <button
                onClick={() => setShowRemoveBgMenu(!showRemoveBgMenu)}
                disabled={asset.status !== 'complete' || !asset.imageUrl || isRemovingBackground}
                className={`flex items-center justify-center px-2 py-1.5 h-8 rounded font-medium text-xs transition-colors ${
                  asset.status === 'complete' && asset.imageUrl
                    ? 'bg-teal-600 hover:bg-teal-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
                }`}
                title="Remove Background Options"
              >
                {isRemovingBackground ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Scissors className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              {showRemoveBgMenu && asset.status === 'complete' && asset.imageUrl && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[200px]">
                  <button
                    onClick={() => handleRemoveBackground()}
                    disabled={isRemovingBackground}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Remove Background (Default)
                  </button>
                  <button
                    onClick={() => handleRemoveBackground(220)}
                    disabled={isRemovingBackground}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Remove Background (Aggressive)
                  </button>
                  <button
                    onClick={() => handleRemoveBackground(250)}
                    disabled={isRemovingBackground}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Remove Background (Light)
                  </button>
                  {/* Threshold Slider */}
                  <div className="border-t border-gray-700 my-1" />
                  <div className="px-3 py-2">
                    <div className="text-[10px] text-gray-400 mb-2 font-bold uppercase">Threshold: {bgRemovalThreshold}</div>
                    <input
                      type="range"
                      min="200"
                      max="255"
                      value={bgRemovalThreshold}
                      onChange={(e) => setBgRemovalThreshold(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                      <span>Aggressive</span>
                      <span>Light</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBackground(bgRemovalThreshold)}
                      disabled={isRemovingBackground}
                      className="w-full mt-2 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-3 h-3" />
                      Apply with Threshold {bgRemovalThreshold}
                    </button>
                  </div>
                  {/* Undo Option */}
                  {previousImageUrl && (
                    <>
                      <div className="border-t border-gray-700 my-1" />
                      <button
                        onClick={handleUndoBackgroundRemoval}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-700 flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Undo Background Removal
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="relative resize-menu-container">
              <button
                onClick={() => setShowResizeMenu(!showResizeMenu)}
                disabled={asset.status !== 'complete' || !asset.imageUrl || isResizing}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 h-8 rounded font-medium text-xs transition-colors whitespace-nowrap min-w-[80px] ${
                  asset.status === 'complete' && asset.imageUrl
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
                }`}
                title="Resize Options"
              >
                {isResizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Resize</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showResizeMenu && asset.status === 'complete' && asset.imageUrl && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[180px]">
                  {/* Resize to Original/Preset Size */}
                  {(asset.sourceImageUrl || asset.presetId) && (
                    <button
                      onClick={handleResizeToOriginal}
                      disabled={isResizing}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      {asset.presetId && PRESET_SIZES[asset.presetId]
                        ? `To ${PRESET_SIZES[asset.presetId].width}x${PRESET_SIZES[asset.presetId].height} (Preset)`
                        : 'To Original Size'}
                    </button>
                  )}
                  {/* Common sprite sizes */}
                  <button
                    onClick={() => handleResize(32, 32)}
                    disabled={isResizing}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    To 32x32
                  </button>
                  <button
                    onClick={() => handleResize(64, 64)}
                    disabled={isResizing}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    To 64x64
                  </button>
                  <button
                    onClick={() => handleResize(16, 16)}
                    disabled={isResizing}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    To 16x16
                  </button>
                  <button
                    onClick={() => handleResize(48, 48)}
                    disabled={isResizing}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    To 48x48
                  </button>
                  {/* Custom Resize Option */}
                  <div className="border-t border-gray-700 my-1" />
                  <div className="px-3 py-2">
                    <div className="text-[10px] text-gray-400 mb-2 font-bold uppercase">Custom Size</div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-[9px] text-gray-500 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={customResizeWidth}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : '';
                            setCustomResizeWidth(val);
                          }}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="W"
                          min="1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[9px] text-gray-500 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={customResizeHeight}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : '';
                            setCustomResizeHeight(val);
                          }}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="H"
                          min="1"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof customResizeWidth === 'number' && typeof customResizeHeight === 'number' && customResizeWidth > 0 && customResizeHeight > 0) {
                          handleResize(customResizeWidth, customResizeHeight);
                        }
                      }}
                      disabled={isResizing || typeof customResizeWidth !== 'number' || typeof customResizeHeight !== 'number' || customResizeWidth <= 0 || customResizeHeight <= 0}
                      className="w-full px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <Minimize2 className="w-3 h-3" />
                      Resize to {customResizeWidth && customResizeHeight ? `${customResizeWidth}x${customResizeHeight}` : 'Custom'}
                    </button>
                  </div>
                  {/* Undo Resize */}
                  {asset.resizedImageUrl && (
                    <>
                      <div className="border-t border-gray-700 my-1" />
                      <button
                        onClick={handleUndoResize}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-700 flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Undo Resize
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="relative export-menu-container">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!asset.imageUrl && !asset.metadata}
                className="flex items-center justify-center gap-2 px-3 py-1.5 h-8 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-xs transition-colors whitespace-nowrap min-w-[80px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[180px]">
                  {asset.imageUrl && (
                    <>
                      <div className="px-3 py-2 text-[10px] text-gray-500 uppercase font-bold border-b border-gray-700">PNG</div>
                      {asset.resizedImageUrl && (
                        <>
                          <button
                            onClick={() => downloadAsset('png', 'small')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Small (Original Size)
                          </button>
                          <button
                            onClick={() => downloadAsset('png', 'large')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Large (Generated Size)
                          </button>
                          <button
                            onClick={() => downloadAsset('png', 'both')}
                            className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-gray-700 font-bold"
                          >
                            Both Sizes
                          </button>
                        </>
                      )}
                      {!asset.resizedImageUrl && (
                        <button
                          onClick={() => downloadAsset('png', 'large')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          PNG
                        </button>
                      )}
                      <div className="border-t border-gray-700 my-1"></div>
                      <div className="px-3 py-2 text-[10px] text-gray-500 uppercase font-bold border-b border-gray-700">JPEG</div>
                      {asset.resizedImageUrl && (
                        <>
                          <button
                            onClick={() => downloadAsset('jpeg', 'small')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Small (Original Size)
                          </button>
                          <button
                            onClick={() => downloadAsset('jpeg', 'large')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Large (Generated Size)
                          </button>
                          <button
                            onClick={() => downloadAsset('jpeg', 'both')}
                            className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-gray-700 font-bold"
                          >
                            Both Sizes
                          </button>
                        </>
                      )}
                      {!asset.resizedImageUrl && (
                        <button
                          onClick={() => downloadAsset('jpeg', 'large')}
                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          JPEG
                        </button>
                      )}
                    </>
                  )}
                  {asset.metadata && (
                    <>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={() => downloadAsset('json')}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        JSON
                      </button>
                    </>
                  )}
                  {asset.imageUrl && asset.metadata && (
                    <>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={() => downloadAsset('all', 'both')}
                        className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-gray-700 font-bold"
                      >
                        All Formats & Sizes
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Controls */}
        <div className="w-80 border-r border-gray-800 shimmer-border bg-gray-900/80 p-6 overflow-y-auto shrink-0 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Core Settings */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asset Name</label>
              <input 
                type="text" 
                value={asset.name}
                onChange={(e) => onUpdateAsset({ name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asset Type</label>
              <select
                value={asset.type}
                onChange={(e) => onUpdateAsset({ type: e.target.value as GameAsset['type'] })}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                disabled={!!asset.sourceImageUrl} // Disable if from database (type is set from category)
                title={asset.sourceImageUrl ? "Type is set from database category" : "Select the asset type for proper dimensions and references"}
              >
                <option value="monster">Monster</option>
                <option value="item">Item</option>
                <option value="npc">NPC</option>
                <option value="platform">Platform</option>
                <option value="background">Background</option>
              </select>
              {asset.sourceImageUrl && (
                <p className="text-[10px] text-gray-600 mt-1 italic">
                  Type set from database category
                </p>
              )}
            </div>

             {/* Style Remixes */}
             <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Errl Style Injection</label>
                <button
                  onClick={() => setShowPresetManager(!showPresetManager)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  title="Manage Custom Presets"
                >
                  <Star className="w-3 h-3" />
                </button>
              </div>
              
              {/* Custom Presets */}
              {customPresets.length > 0 && (
                <div className="mb-2 space-y-1">
                  {customPresets.map((preset) => (
                    <div key={preset.id} className="flex items-center gap-1">
                      <button
                        onClick={() => handleApplyPreset(preset)}
                        className="flex-1 text-left px-2 py-1 rounded border border-gray-700 bg-gray-800 hover:border-indigo-500 text-xs text-gray-300 hover:text-white transition-all truncate"
                        title={preset.description || preset.name}
                      >
                        <Star className="w-2.5 h-2.5 inline mr-1 text-yellow-400" />
                        {preset.name}
                      </button>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="p-1 hover:bg-red-900/30 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Preset Manager */}
              {showPresetManager && (
                <div className="mb-3 p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400">Create Custom Preset</span>
                    <button
                      onClick={() => setShowPresetManager(false)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset Name"
                    className="w-full mb-2 bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-xs"
                  />
                  <textarea
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full mb-2 bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-xs h-16 resize-none"
                  />
                  <div className="text-xs text-gray-500 mb-2">Select modifiers:</div>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {(Object.keys(STYLE_MODIFIERS) as Array<keyof typeof STYLE_MODIFIERS>).map((style, index) => {
                      const config = STYLE_BUTTON_CONFIG[style];
                      const isSelected = selectedModifiersForPreset.includes(style);
                      const primaryColor = config.colors.border.replace('rgba(', '').replace(')', '').split(',');
                      const secondaryColor = config.colors.text;
                      const borderRgb = primaryColor.length >= 3 ? `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})` : config.colors.border;
                      
                      // Determine column position (0-3)
                      const column = index % 4;
                      const tooltipPosition = column === 0 ? 'left-0' : column === 3 ? 'right-0' : 'left-1/2 transform -translate-x-1/2';
                      
                      return (
                        <div key={style} className="relative group">
                          <button
                            onClick={() => {
                              setSelectedModifiersForPreset(prev =>
                                prev.includes(style)
                                  ? prev.filter(s => s !== style)
                                  : [...prev, style]
                              );
                            }}
                            className="h-7 rounded border text-[9px] font-bold uppercase transition-all leading-tight hover:opacity-80 flex items-center justify-center text-center px-0.5 py-0 w-full"
                            style={{
                              backgroundColor: isSelected ? config.colors.selectedBg : config.colors.bg,
                              borderColor: isSelected ? config.colors.selectedBorder : config.colors.border,
                              color: isSelected ? config.colors.selectedText : config.colors.text
                            }}
                          >
                            {config.label}
                          </button>
                          {/* Tooltip with colors */}
                          <div className={`absolute bottom-full ${tooltipPosition} mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50`}>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 min-w-[200px]">
                              <div className="text-xs font-bold text-white mb-2">{config.area} → Errl Style</div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-600"
                                    style={{ backgroundColor: borderRgb }}
                                  ></div>
                                  <span className="text-[10px] text-gray-400 font-mono">{borderRgb}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-600"
                                    style={{ backgroundColor: secondaryColor }}
                                  ></div>
                                  <span className="text-[10px] text-gray-400 font-mono">{secondaryColor}</span>
                                </div>
                                {isSelected && (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded border border-gray-600"
                                        style={{ backgroundColor: config.colors.selectedBorder }}
                                      ></div>
                                      <span className="text-[10px] text-gray-400 font-mono">{config.colors.selectedBorder}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded border border-gray-600"
                                        style={{ backgroundColor: config.colors.selectedText }}
                                      ></div>
                                      <span className="text-[10px] text-gray-400 font-mono">{config.colors.selectedText}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleSavePreset}
                    className="w-full h-8 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Save Preset
                  </button>
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STYLE_MODIFIERS) as Array<keyof typeof STYLE_MODIFIERS>).map((style, index) => {
                  const config = STYLE_BUTTON_CONFIG[style];
                  const isSelected = selectedStyle === style;
                  // Extract color codes from the color strings
                  const primaryColor = config.colors.border.replace('rgba(', '').replace(')', '').split(',');
                  const secondaryColor = config.colors.text;
                  const borderRgb = primaryColor.length >= 3 ? `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})` : config.colors.border;
                  
                  // Determine column position (0-3)
                  const column = index % 4;
                  const tooltipPosition = column === 0 ? 'left-0' : column === 3 ? 'right-0' : 'left-1/2 transform -translate-x-1/2';
                  
                  return (
                    <div key={style} className="relative group">
                      <button
                        onClick={() => handleStyleChange(isSelected ? 'none' : style)}
                        className="h-7 rounded border text-[9px] font-bold uppercase transition-all leading-tight hover:opacity-80 flex items-center justify-center text-center px-0.5 py-0 w-full"
                        style={{
                          backgroundColor: isSelected ? config.colors.selectedBg : config.colors.bg,
                          borderColor: isSelected ? config.colors.selectedBorder : config.colors.border,
                          color: isSelected ? config.colors.selectedText : config.colors.text
                        }}
                      >
                        {config.label}
                      </button>
                      {/* Tooltip with colors */}
                      <div className={`absolute bottom-full ${tooltipPosition} mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50`}>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 min-w-[200px]">
                          <div className="text-xs font-bold text-white mb-2">{config.area} → Errl Style</div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border border-gray-600"
                                style={{ backgroundColor: borderRgb }}
                              ></div>
                              <span className="text-[10px] text-gray-400 font-mono">{borderRgb}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border border-gray-600"
                                style={{ backgroundColor: secondaryColor }}
                              ></div>
                              <span className="text-[10px] text-gray-400 font-mono">{secondaryColor}</span>
                            </div>
                            {isSelected && (
                              <>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-600"
                                    style={{ backgroundColor: config.colors.selectedBorder }}
                                  ></div>
                                  <span className="text-[10px] text-gray-400 font-mono">{config.colors.selectedBorder}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-600"
                                    style={{ backgroundColor: config.colors.selectedText }}
                                  ></div>
                                  <span className="text-[10px] text-gray-400 font-mono">{config.colors.selectedText}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Generation Prompt</label>
                <span className="text-[10px] text-indigo-400">{getAIService().getProviderName()}</span>
              </div>
              <textarea 
                value={asset.remixPrompt}
                onChange={(e) => onUpdateAsset({ remixPrompt: e.target.value })}
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded p-3 text-gray-300 text-sm focus:border-indigo-500 focus:outline-none resize-none font-mono"
              />
            </div>

            {/* Dimensions */}
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-bold text-gray-400 uppercase">Dimensions</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={dimensions.width !== null ? dimensions.width : ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      if (val !== null && val > 0) {
                        setDimensions(prev => ({ ...prev, width: val }));
                      } else {
                        setDimensions(prev => ({ ...prev, width: null }));
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Auto"
                    disabled={!asset.sourceImageUrl && !asset.imageUrl}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={dimensions.height !== null ? dimensions.height : ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      if (val !== null && val > 0) {
                        setDimensions(prev => ({ ...prev, height: val }));
                      } else {
                        setDimensions(prev => ({ ...prev, height: null }));
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Auto"
                    disabled={!asset.sourceImageUrl && !asset.imageUrl}
                    min="1"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed italic">
                Auto-detected from source. Editing not recommended.
              </p>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-bold text-gray-400 uppercase">Shortcuts</span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div><kbd className="px-1 py-0.5 bg-gray-900 rounded text-[10px]">Ctrl+G</kbd> Generate</div>
                <div><kbd className="px-1 py-0.5 bg-gray-900 rounded text-[10px]">Ctrl+E</kbd> Export</div>
                <div><kbd className="px-1 py-0.5 bg-gray-900 rounded text-[10px]">Ctrl+B</kbd> Batch Mode</div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 bg-[#1a1a20] relative overflow-hidden flex items-center justify-center min-w-0">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', 
                 backgroundSize: `${gridDensity}px ${gridDensity}px` 
               }} 
          />
          
          {/* Grid Density Slider - Bottom Left */}
          <div className="absolute bottom-2 left-2 z-20 bg-gray-900/90 backdrop-blur-sm rounded border border-gray-700/50 p-2 flex items-center gap-2 min-w-[200px]">
            <span className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap">Grid</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={gridDensity}
              onChange={(e) => setGridDensity(parseInt(e.target.value, 10))}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-gray-300 font-mono min-w-[40px] text-right">
              {gridDensity}px
            </span>
          </div>
          
          {/* Tabs - Top Left */}
          <div className="absolute top-2 left-2 z-20 flex bg-gray-900/90 backdrop-blur-sm rounded border border-gray-700/50 p-0.5">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all flex items-center justify-center ${activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              VISUAL
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all flex items-center justify-center ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              METADATA
            </button>
            {asset.id && asset.id !== 'new-1' && history.length > 0 && (
              <button 
                onClick={() => {
                  setActiveTab('history');
                  setShowHistory(true);
                }}
                className={`px-1 py-0.5 rounded text-[8px] font-bold transition-all flex items-center justify-center ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title={`${history.length} versions`}
              >
                <History className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          
          {activeTab === 'visual' ? (
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-full px-4 py-4">
              {/* Error Display */}
              {asset.status === 'error' && asset.error && (
                <div className="w-full max-w-2xl mb-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-red-400">Generation Failed</h3>
                        {asset.error.provider && (
                          <span className="text-xs text-gray-500">{asset.error.provider}</span>
                        )}
                      </div>
                      <p className="text-sm text-red-300 mb-3">{asset.error.userMessage}</p>
                      {asset.error.retryable && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={onGenerate}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry
                          </button>
                          {asset.error.retryAfter && (
                            <span className="text-xs text-gray-500">
                              Wait {asset.error.retryAfter}s before retrying
                            </span>
                          )}
                        </div>
                      )}
                      {asset.error.category === 'provider_error' && asset.error.provider === 'Anthropic' && (
                        <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                          💡 Tip: Switch to Gemini or OpenAI in the header to generate images.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {asset.status === 'generating' && asset.progress && (
                <div className="w-full max-w-2xl mb-4 bg-indigo-900/20 border border-indigo-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-indigo-400 mb-1">{asset.progress.currentStep}</p>
                      <div className="flex gap-4">
                        {asset.progress.imageProgress !== undefined && (
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">Image</span>
                              <span className="text-xs text-gray-400">{asset.progress.imageProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${asset.progress.imageProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {asset.progress.metadataProgress !== undefined && (
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">Metadata</span>
                              <span className="text-xs text-gray-400">{asset.progress.metadataProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${asset.progress.metadataProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {displayImage ? (
                <div className="flex flex-col items-center gap-4 max-w-full">
                  {asset.sourceImageUrl && asset.imageUrl && (
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="h-8 bg-indigo-900/30 px-3 py-1 rounded text-xs text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50 transition-colors flex items-center justify-center"
                    >
                      {showComparison ? 'Hide' : 'Show'} Comparison
                    </button>
                  )}
                  
                  {showComparison && asset.sourceImageUrl && asset.imageUrl ? (
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl items-center">
                      {/* Before (Source) */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Before</div>
                        <div className="relative group max-w-full">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-20 blur"></div>
                          <img 
                            src={asset.sourceImageUrl} 
                            alt={`${asset.name} - Source`} 
                            className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.warn('Source image failed to load:', asset.sourceImageUrl);
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="w-6 h-6 text-indigo-400" />
                      </div>
                      
                      {/* After (Remixed) - Show side-by-side if resized exists */}
                      {asset.resizedImageUrl ? (
                        <div className="flex-1 flex gap-4 items-center">
                          {/* Generated (Large) */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Generated</div>
                            <div className="relative group max-w-full">
                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                              <img 
                                src={asset.imageUrl} 
                                alt={`${asset.name} - Generated`} 
                                className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              {/* Hitbox Overlay */}
                              {showHitboxOverlay && asset.metadata?.hitbox && (
                                <div 
                                  className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                                  style={{
                                      top: '50%',
                                      left: '50%',
                                      width: `${asset.metadata.hitbox.width || 32}px`,
                                      height: `${asset.metadata.hitbox.height || 32}px`,
                                      transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>
                          
                          {/* Chevron Icon */}
                          <div className="flex items-center justify-center shrink-0">
                            <ChevronRight className="w-6 h-6 text-indigo-400" />
                          </div>
                          
                          {/* Resized (Original Size) */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Resized</div>
                            <div className="relative group max-w-full">
                              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                              <img 
                                src={asset.resizedImageUrl} 
                                alt={`${asset.name} - Resized`} 
                                className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              {/* Hitbox Overlay */}
                              {showHitboxOverlay && asset.metadata?.hitbox && (
                                <div 
                                  className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                                  style={{
                                      top: '50%',
                                      left: '50%',
                                      width: `${asset.metadata.hitbox.width || 32}px`,
                                      height: `${asset.metadata.hitbox.height || 32}px`,
                                      transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-gray-400 mb-2 font-bold uppercase">After</div>
                          <div className="relative group max-w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                            <img 
                              src={asset.imageUrl} 
                              alt={`${asset.name} - Remixed`} 
                              className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            
                            {/* Hitbox Overlay */}
                            {showHitboxOverlay && asset.metadata?.hitbox && (
                              <div 
                                className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    width: `${asset.metadata.hitbox.width || 32}px`,
                                    height: `${asset.metadata.hitbox.height || 32}px`,
                                    transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                                }}
                              ></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {isSource && (
                        <>
                          <div className="bg-blue-900/30 px-3 py-1 rounded text-xs text-blue-300 border border-blue-500/30 mb-2">
                            Source Asset Loaded - Ready to Remix
                          </div>
                          {/* Show source image when selected but not remixed yet */}
                          <div className="relative group max-w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-20 blur"></div>
                            <img 
                              src={asset.sourceImageUrl} 
                              alt={`${asset.name} - Source`} 
                              className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.warn('Source image failed to load:', asset.sourceImageUrl);
                              }}
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Show side-by-side when resized version exists */}
                      {!isSource && asset.resizedImageUrl && asset.imageUrl ? (
                        <div className="flex gap-4 items-center">
                          {/* Generated (Large) */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Generated</div>
                            <div className="relative group max-w-full">
                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                              <img 
                                src={asset.imageUrl} 
                                alt={`${asset.name} - Generated`} 
                                className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              {/* Hitbox Overlay */}
                              {showHitboxOverlay && asset.metadata?.hitbox && (
                                <div 
                                  className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                                  style={{
                                      top: '50%',
                                      left: '50%',
                                      width: `${asset.metadata.hitbox.width || 32}px`,
                                      height: `${asset.metadata.hitbox.height || 32}px`,
                                      transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>
                          
                          {/* Chevron Icon */}
                          <div className="flex items-center justify-center shrink-0">
                            <ChevronRight className="w-6 h-6 text-indigo-400" />
                          </div>
                          
                          {/* Resized (Original Size) */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Resized</div>
                            <div className="relative group max-w-full">
                              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                              <img 
                                src={asset.resizedImageUrl} 
                                alt={`${asset.name} - Resized`} 
                                className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-xl image-pixelated max-w-full max-h-[400px] object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              {/* Hitbox Overlay */}
                              {showHitboxOverlay && asset.metadata?.hitbox && (
                                <div 
                                  className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                                  style={{
                                      top: '50%',
                                      left: '50%',
                                      width: `${asset.metadata.hitbox.width || 32}px`,
                                      height: `${asset.metadata.hitbox.height || 32}px`,
                                      transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : !isSource ? (
                        /* Single image view when no resized version and not a source */
                        <div className="relative group max-w-full">
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                          <img 
                            src={displayImage} 
                            alt={asset.name} 
                            className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-2xl image-pixelated max-w-full max-h-[500px] object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.warn('Display image failed to load:', displayImage);
                              // Try to show a fallback or error state
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          
                          {/* Hitbox Overlay (only for final assets) */}
                          {showHitboxOverlay && asset.metadata?.hitbox && (
                            <div 
                              className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                              style={{
                                  top: '50%',
                                  left: '50%',
                                  width: `${asset.metadata.hitbox.width || 32}px`,
                                  height: `${asset.metadata.hitbox.height || 32}px`,
                                  transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox.offsetX || 0}px, ${asset.metadata.hitbox.offsetY || 0}px)`
                              }}
                            ></div>
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : asset.status !== 'error' ? (
                <div className="text-center text-gray-600">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">?</span>
                  </div>
                  <p className="font-pixel text-xs">NO ASSET GENERATED</p>
                </div>
              ) : null}
            </div>
          ) : activeTab === 'code' ? (
            <div className="w-full h-full p-8 z-10 overflow-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <Code className="w-3 h-3" /> JSON Preview
                  </span>
                  <button 
                     onClick={() => navigator.clipboard.writeText(JSON.stringify(asset.metadata, null, 2))}
                     className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-green-400 overflow-auto max-h-[600px] custom-scrollbar">
                  {JSON.stringify(asset.metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="w-full h-full p-8 z-10 overflow-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                    <History className="w-3 h-3" /> Version History
                  </span>
                  <button 
                     onClick={() => {
                       setActiveTab('visual');
                       setShowHistory(false);
                     }}
                     className="text-xs text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((version, index) => (
                        <div
                          key={version.timestamp || index}
                          className="p-4 bg-gray-800 rounded border border-gray-700 hover:border-indigo-500 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            {version.imageUrl && (
                              <img
                                src={version.imageUrl}
                                alt={version.name}
                                className="w-24 h-24 object-contain rounded bg-gray-900 border border-gray-700 pixelated"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-bold text-white text-sm">{version.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {version.timestamp ? new Date(version.timestamp).toLocaleString() : 'Unknown date'}
                                    {version.version && (
                                      <span className="px-1.5 py-0.5 bg-indigo-900/30 text-indigo-400 rounded text-[10px]">
                                        v{version.version}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRevertToVersion(version)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-colors"
                                >
                                  Load This Version
                                </button>
                              </div>
                              <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                                {version.remixPrompt}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                      <History className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">No version history</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation Generator Overlay */}
      {showAnimationGenerator && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            }>
              <AnimationGenerator
              assetName={asset.name}
              basePrompt={asset.remixPrompt}
              assetType={asset.type}
              sourceImageUrl={asset.sourceImageUrl}
              provider={aiProvider}
              onComplete={(sequences: AnimationSequence[]) => {
                console.log('Animation sequences generated:', sequences);
                setShowAnimationGenerator(false);
              }}
              onCancel={() => setShowAnimationGenerator(false)}
            />
            </Suspense>
          </div>
        </div>
      )}

      {/* Hitbox Editor Overlay */}
      {showHitboxEditor && asset.imageUrl && asset.metadata && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        }>
          <HitboxEditor
          imageUrl={asset.imageUrl}
          metadata={asset.metadata}
          onSave={(hitbox) => {
            onUpdateAsset({
              metadata: {
                ...asset.metadata,
                hitbox
              }
            });
          }}
          onClose={() => setShowHitboxEditor(false)}
        />
        </Suspense>
      )}
    </div>
  );
};
