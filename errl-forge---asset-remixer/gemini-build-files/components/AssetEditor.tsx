
import React, { useState, useEffect } from 'react';
import { GameAsset, AssetMetadata } from '../types';
import { STYLE_MODIFIERS } from '../constants';
import { Wand2, Download, RefreshCw, Zap, Save, Code, ArrowRight } from 'lucide-react';
import { getAIService } from '../services/aiService';

interface AssetEditorProps {
  asset: GameAsset;
  onUpdateAsset: (updates: Partial<GameAsset>) => void;
  onGenerate: () => void;
}

export const AssetEditor: React.FC<AssetEditorProps> = ({ asset, onUpdateAsset, onGenerate }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof STYLE_MODIFIERS | 'none'>('none');

  // Apply style modifier to prompt when selection changes
  useEffect(() => {
    if (asset.status === 'idle' || asset.status === 'complete') {
       // Optional: Logic to reset prompt if needed
    }
  }, [selectedStyle]);

  const handleStyleChange = (style: keyof typeof STYLE_MODIFIERS | 'none') => {
    setSelectedStyle(style);
    let newPrompt = asset.originalPrompt;
    if (style !== 'none') {
      newPrompt += `, ${STYLE_MODIFIERS[style]}`;
    }
    onUpdateAsset({ remixPrompt: newPrompt });
  };

  const downloadAsset = () => {
    if (!asset.imageUrl) return;
    
    // Download Image
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `${asset.name.toLowerCase().replace(/\s/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Download JSON
    const jsonStr = JSON.stringify(asset.metadata, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(blob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `${asset.name.toLowerCase().replace(/\s/g, '_')}_data.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
  };

  // Determine what to display in the visual tab
  const displayImage = asset.imageUrl || asset.sourceImageUrl;
  const isSource = !asset.imageUrl && !!asset.sourceImageUrl;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900/50 overflow-hidden">
      {/* Header Section (2 Rows) */}
      <div className="flex flex-col shrink-0 bg-gray-900 border-b border-gray-800">
        
        {/* Row 1: Title and Status */}
        <div className="h-12 flex items-center justify-between px-6 border-b border-gray-800/50">
          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
            <h1 className="text-lg font-bold text-white font-pixel tracking-tighter truncate" title={asset.name}>
              {asset.name || 'Untitled Asset'}
            </h1>
            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              asset.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 
              asset.status === 'error' ? 'bg-red-500/20 text-red-400' : 
              'bg-green-500/20 text-green-400'
            }`}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* Row 2: Controls */}
        <div className="h-12 flex items-center justify-between px-6 bg-gray-900/30">
          {/* Left: Tabs */}
          <div className="flex bg-gray-800 rounded p-1">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              VISUAL
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              METADATA
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadAsset}
              disabled={!asset.imageUrl}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-xs transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={onGenerate}
              disabled={asset.status === 'generating'}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 whitespace-nowrap"
            >
              {asset.status === 'generating' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {isSource ? 'REMIX SOURCE' : 'GENERATE'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Controls */}
        <div className="w-80 border-r border-gray-800 bg-gray-900/80 p-6 overflow-y-auto shrink-0 custom-scrollbar">
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

             {/* Style Remixes */}
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Errl Style Injection</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STYLE_MODIFIERS) as Array<keyof typeof STYLE_MODIFIERS>).map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleChange(selectedStyle === style ? 'none' : style)}
                    className={`p-2 rounded border text-xs font-bold uppercase transition-all ${
                      selectedStyle === style 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {style}
                  </button>
                ))}
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

            {/* AI Settings Info */}
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-bold text-gray-400 uppercase">Power Level</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Using {getAIService().getProviderName()}. {isSource ? 'Remixing active source image.' : 'Generating from text.'} Metadata generated by AI model.
              </p>
            </div>

          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 bg-[#1a1a20] relative overflow-hidden flex items-center justify-center min-w-0">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
               }} 
          />
          
          {activeTab === 'visual' ? (
            <div className="relative z-10 flex flex-col items-center w-full max-w-full px-4">
              {displayImage ? (
                <div className="flex flex-col items-center gap-4 max-w-full">
                  {isSource && (
                    <div className="bg-blue-900/30 px-3 py-1 rounded text-xs text-blue-300 border border-blue-500/30 mb-2">
                      Source Asset Loaded - Ready to Remix
                    </div>
                  )}
                  
                  <div className="relative group max-w-full">
                    <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur transition duration-1000 ${isSource ? 'opacity-20' : 'group-hover:opacity-100'}`}></div>
                    <img 
                      src={displayImage} 
                      alt={asset.name} 
                      className="relative block rounded-lg bg-[#2a2a35] border border-gray-700 shadow-2xl image-pixelated max-w-full max-h-[500px] object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    
                    {/* Hitbox Overlay (only for final assets) */}
                    {!isSource && (
                      <div 
                        className="absolute border-2 border-red-500/50 bg-red-500/10 pointer-events-none"
                        style={{
                            top: '50%',
                            left: '50%',
                            width: `${asset.metadata.hitbox?.width || 32}px`,
                            height: `${asset.metadata.hitbox?.height || 32}px`,
                            transform: `translate(-50%, -50%) translate(${asset.metadata.hitbox?.offsetX || 0}px, ${asset.metadata.hitbox?.offsetY || 0}px)`
                        }}
                      ></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">?</span>
                  </div>
                  <p className="font-pixel text-xs">NO ASSET GENERATED</p>
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
