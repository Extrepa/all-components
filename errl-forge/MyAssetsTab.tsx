import React, { useState, useEffect, useRef } from 'react';
import { GameAsset } from '../types';
import { Loader2, Download, Trash2, FolderOpen, Search, ImageOff, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { calculateVisibleItems } from '../utils/virtualScroll';

interface MyAssetsTabProps {
  onSelectAsset: (asset: GameAsset) => void;
  selectedAssetId?: string;
}

export const MyAssetsTab: React.FC<MyAssetsTabProps> = ({ onSelectAsset, selectedAssetId }) => {
  const [savedAssets, setSavedAssets] = useState<GameAsset[]>([]);
  const [loadingSavedAssets, setLoadingSavedAssets] = useState(false);
  const [assetsSearchQuery, setAssetsSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadSavedAssets = async () => {
    setLoadingSavedAssets(true);
    try {
      const assets = await storageService.getAllAssets();
      setSavedAssets(assets);
    } catch (error) {
      console.error('Failed to load saved assets:', error);
    } finally {
      setLoadingSavedAssets(false);
    }
  };

  useEffect(() => {
    loadSavedAssets();
  }, []);

  const filteredSavedAssets = savedAssets.filter(asset => {
    if (!assetsSearchQuery) return true;
    return asset.name.toLowerCase().includes(assetsSearchQuery.toLowerCase()) ||
           asset.type.toLowerCase().includes(assetsSearchQuery.toLowerCase());
  });

  const handleToggleSelect = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedAssetIds.size === 0) return;
    if (!confirm(`Delete ${selectedAssetIds.size} asset(s)?`)) return;
    
    try {
      for (const id of selectedAssetIds) {
        await storageService.deleteAsset(id);
      }
      await loadSavedAssets();
      setSelectedAssetIds(new Set());
    } catch (error) {
      console.error('Failed to delete assets:', error);
      alert('Failed to delete some assets');
    }
  };

  const handleBulkExport = async () => {
    if (selectedAssetIds.size === 0) return;
    try {
      const selectedAssets = savedAssets.filter(a => selectedAssetIds.has(a.id));
      const json = JSON.stringify(selectedAssets, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export assets:', error);
      alert('Failed to export assets');
    }
  };

  const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this asset?')) return;
    try {
      await storageService.deleteAsset(id);
      await loadSavedAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset');
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved Assets</div>
        <div className="flex items-center gap-2">
          {selectedAssetIds.size > 0 && (
            <>
              <button
                onClick={handleBulkExport}
                className="text-xs text-indigo-400 hover:text-indigo-300"
                title="Export Selected"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-xs text-red-400 hover:text-red-300"
                title="Delete Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-500">{selectedAssetIds.size} selected</span>
            </>
          )}
          <button
            onClick={loadSavedAssets}
            className="text-xs text-indigo-400 hover:text-indigo-300"
            title="Refresh"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-2">
        <input
          type="text"
          value={assetsSearchQuery}
          onChange={(e) => setAssetsSearchQuery(e.target.value)}
          placeholder="Search saved assets..."
          className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
        />
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
      </div>

      {loadingSavedAssets ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      ) : filteredSavedAssets.length > 0 ? (
        <>
          {selectedAssetIds.size > 0 && (
            <div className="mb-2 p-2 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-300">
              {selectedAssetIds.size} asset(s) selected. Use buttons above to export or delete.
            </div>
          )}
          {(() => {
            // Virtual scrolling for large lists (100+ items)
            const useVirtualScroll = filteredSavedAssets.length > 100;
            
            if (useVirtualScroll && scrollContainerRef.current) {
              const containerHeight = scrollContainerRef.current.clientHeight;
              const itemHeight = 80; // Approximate height per asset item
              const result = calculateVisibleItems<GameAsset>(
                filteredSavedAssets,
                scrollTop,
                { itemHeight, containerHeight, overscan: 5 }
              );
              
              return (
                <div style={{ height: result.totalHeight, position: 'relative' }}>
                  <div style={{ transform: `translateY(${result.offsetY}px)` }}>
                    {result.visibleItems.map(({ item: asset }) => {
                      const isSelected = selectedAssetIds.has(asset.id);
                      const isAssetSelected = selectedAssetId === asset.id;
                      return (
                        <div
                          key={asset.id}
                          style={{ height: itemHeight }}
                          className={`group relative p-3 rounded border transition-all cursor-pointer ${
                            isAssetSelected
                              ? 'bg-indigo-900/30 border-indigo-500'
                              : isSelected
                              ? 'bg-indigo-900/20 border-indigo-500/50'
                              : 'bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border-transparent'
                          }`}
                          onClick={() => onSelectAsset(asset)}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => handleToggleSelect(asset.id, e)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-1 ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-500'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                            </button>
                            {asset.imageUrl ? (
                              <img 
                                src={asset.imageUrl} 
                                alt={asset.name}
                                className="w-12 h-12 object-contain rounded bg-gray-900 border border-gray-700 pixelated"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-900 border border-gray-700 flex items-center justify-center">
                                <ImageOff className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-200 group-hover:text-white text-sm truncate">{asset.name}</div>
                              <div className="text-xs text-gray-500 capitalize">{asset.type}</div>
                              {asset.timestamp && (
                                <div className="text-[10px] text-gray-600 mt-1">
                                  {new Date(asset.timestamp).toLocaleDateString()}
                                </div>
                              )}
                              {asset.resizedImageUrl && (
                                <div className="mt-2 pt-2 border-t border-gray-700/50">
                                  <div className="text-[9px] text-gray-500 mb-1">Resized Preview</div>
                                  <img 
                                    src={asset.resizedImageUrl} 
                                    alt={`${asset.name} - Resized`}
                                    className="w-16 h-16 object-contain rounded bg-gray-900 border border-gray-700 pixelated"
                                    style={{ imageRendering: 'pixelated' }}
                                    onLoad={(e) => {
                                      const img = e.currentTarget;
                                      const dims = `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}`;
                                      const dimsEl = img.nextElementSibling;
                                      if (dimsEl && dimsEl.classList.contains('resized-dims')) {
                                        dimsEl.textContent = dims;
                                      }
                                    }}
                                  />
                                  <div className="resized-dims text-[8px] text-gray-600 mt-1"></div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleDeleteAsset(asset.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            
            // Regular rendering for smaller lists
            return filteredSavedAssets.map((asset) => {
              const isSelected = selectedAssetIds.has(asset.id);
              const isAssetSelected = selectedAssetId === asset.id;
              return (
                <div
                  key={asset.id}
                  className={`group relative p-3 rounded border transition-all cursor-pointer ${
                    isAssetSelected
                      ? 'bg-indigo-900/30 border-indigo-500'
                      : isSelected
                      ? 'bg-indigo-900/20 border-indigo-500/50'
                      : 'bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border-transparent'
                  }`}
                  onClick={() => onSelectAsset(asset)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => handleToggleSelect(asset.id, e)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </button>
                    {asset.imageUrl ? (
                      <img 
                        src={asset.imageUrl} 
                        alt={asset.name}
                        className="w-12 h-12 object-contain rounded bg-gray-900 border border-gray-700 pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-900 border border-gray-700 flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-200 group-hover:text-white text-sm truncate">{asset.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{asset.type}</div>
                      {asset.timestamp && (
                        <div className="text-[10px] text-gray-600 mt-1">
                          {new Date(asset.timestamp).toLocaleDateString()}
                        </div>
                      )}
                      {asset.resizedImageUrl && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                          <div className="text-[9px] text-gray-500 mb-1">Resized Preview</div>
                          <img 
                            src={asset.resizedImageUrl} 
                            alt={`${asset.name} - Resized`}
                            className="w-16 h-16 object-contain rounded bg-gray-900 border border-gray-700 pixelated"
                            style={{ imageRendering: 'pixelated' }}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              const dims = `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}`;
                              const dimsEl = img.nextElementSibling;
                              if (dimsEl && dimsEl.classList.contains('resized-dims')) {
                                dimsEl.textContent = dims;
                              }
                            }}
                          />
                          <div className="resized-dims text-[8px] text-gray-600 mt-1"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </>
      ) : assetsSearchQuery ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-600">
          <Search className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs">No assets match "{assetsSearchQuery}"</p>
          <button
            onClick={() => setAssetsSearchQuery('')}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-600">
          <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs">No saved assets</p>
          <p className="text-[10px] text-gray-700 mt-1">Generated assets are saved automatically</p>
        </div>
      )}
    </div>
  );
};

