import React, { useState, useEffect, useRef } from 'react';
import { MapleData, MapleCategory, MapleVersion, GameAsset } from '../types';
import { Loader2, Download, Trash2, Archive, Search, ImageOff } from 'lucide-react';
import { storageService } from '../services/storageService';
import { calculateVisibleItems } from '../utils/virtualScroll';
import { allCategories } from '../constants/categories';

interface ArchivedTabProps {
  onSelectAsset: (asset: MapleData, version: MapleVersion) => void;
  selectedAssetId?: string;
  onDeleteAsset?: (id: string, e: React.MouseEvent) => void;
}

export const ArchivedTab: React.FC<ArchivedTabProps> = ({ onSelectAsset, selectedAssetId }) => {
  const [archivedAssets, setArchivedAssets] = useState<Array<{ asset: MapleData; version: MapleVersion; timestamp: number }>>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState<MapleCategory | 'all'>('all');
  const [archivedVersionFilter, setArchivedVersionFilter] = useState<MapleVersion | 'all'>('all');
  const [archivedAssetIds, setArchivedAssetIds] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadArchivedAssets = async () => {
    setLoadingArchived(true);
    try {
      const assets = await storageService.getAllDatabaseAssets();
      setArchivedAssets(assets);
    } catch (error) {
      console.error('Failed to load archived assets:', error);
    } finally {
      setLoadingArchived(false);
    }
  };

  useEffect(() => {
    loadArchivedAssets();
  }, []);

  const filteredArchivedAssets = archivedAssets.filter(({ asset, version }) => {
    const matchesSearch = archivedSearchQuery === '' || 
      asset.name.toLowerCase().includes(archivedSearchQuery.toLowerCase());
    const matchesCategory = archivedCategoryFilter === 'all' || asset.category === archivedCategoryFilter;
    const matchesVersion = archivedVersionFilter === 'all' || version === archivedVersionFilter;
    return matchesSearch && matchesCategory && matchesVersion;
  });

  const handleToggleSelect = (assetId: string, version: MapleVersion, category: MapleCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${version}-${category}-${assetId}`;
    setArchivedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleBulkDeleteArchived = async () => {
    if (archivedAssetIds.size === 0) return;
    if (!confirm(`Remove ${archivedAssetIds.size} archived asset(s)?`)) return;
    
    try {
      for (const key of archivedAssetIds) {
        await storageService.deleteDatabaseAsset(key);
      }
      await loadArchivedAssets();
      setArchivedAssetIds(new Set());
    } catch (error) {
      console.error('Failed to delete assets:', error);
      alert('Failed to remove some assets');
    }
  };

  const handleBulkExportArchived = async () => {
    if (archivedAssetIds.size === 0) return;
    try {
      const json = await storageService.exportDatabaseAssets(Array.from(archivedAssetIds));
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archived-assets-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export assets:', error);
      alert('Failed to export assets');
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived Database Assets</div>
        <div className="flex items-center gap-2">
          {archivedAssetIds.size > 0 && (
            <>
              <button
                onClick={handleBulkExportArchived}
                className="text-xs text-indigo-400 hover:text-indigo-300"
                title="Export Selected"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleBulkDeleteArchived}
                className="text-xs text-red-400 hover:text-red-300"
                title="Remove Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-500">{archivedAssetIds.size} selected</span>
            </>
          )}
          <button
            onClick={loadArchivedAssets}
            className="text-xs text-indigo-400 hover:text-indigo-300"
            title="Refresh"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-2">
        <select
          value={archivedCategoryFilter}
          onChange={(e) => setArchivedCategoryFilter(e.target.value as MapleCategory | 'all')}
          className="flex-1 bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
        <select
          value={archivedVersionFilter}
          onChange={(e) => setArchivedVersionFilter(e.target.value as MapleVersion | 'all')}
          className="flex-1 bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Versions</option>
          <option value="210">GMS v210</option>
          <option value="177">GMS v177</option>
          <option value="95">GMS v95</option>
          <option value="83">GMS v83</option>
          <option value="62">GMS v62</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="relative mb-2">
        <input
          type="text"
          value={archivedSearchQuery}
          onChange={(e) => setArchivedSearchQuery(e.target.value)}
          placeholder="Search archived assets..."
          className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
        />
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
      </div>

      {loadingArchived ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      ) : filteredArchivedAssets.length > 0 ? (
        <>
          {archivedAssetIds.size > 0 && (
            <div className="mb-2 p-2 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-300">
              {archivedAssetIds.size} asset(s) selected. Use buttons above to export or remove.
            </div>
          )}
          {(() => {
            // Virtual scrolling for large lists (100+ items)
            const useVirtualScroll = filteredArchivedAssets.length > 100;
            
            if (useVirtualScroll && scrollContainerRef.current) {
              const containerHeight = scrollContainerRef.current.clientHeight;
              const itemHeight = 80;
              const result = calculateVisibleItems<{ asset: MapleData; version: MapleVersion; timestamp: number }>(
                filteredArchivedAssets,
                scrollTop,
                { itemHeight, containerHeight, overscan: 5 }
              );
              
              return (
                <div style={{ height: result.totalHeight, position: 'relative' }}>
                  <div style={{ transform: `translateY(${result.offsetY}px)` }}>
                    {result.visibleItems.map(({ item: { asset, version }, index }) => {
                      const key = `${version}-${asset.category}-${asset.id}`;
                      const isSelected = archivedAssetIds.has(key);
                      const isAssetSelected = selectedAssetId === `archived-${key}`;
                      return (
                        <div
                          key={key}
                          style={{ height: itemHeight }}
                          className={`group relative p-3 rounded border transition-all cursor-pointer ${
                            isAssetSelected
                              ? 'bg-indigo-900/30 border-indigo-500'
                              : isSelected
                              ? 'bg-indigo-900/20 border-indigo-500/50'
                              : 'bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border-transparent'
                          }`}
                          onClick={() => onSelectAsset(asset, version)}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => handleToggleSelect(asset.id.toString(), version, asset.category, e)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-1 ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-500'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </button>
                            {asset.imgUrl ? (
                              <img 
                                src={asset.imgUrl} 
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
                              <div className="text-xs text-gray-500 capitalize">{asset.category}</div>
                              <div className="text-[10px] text-gray-600 mt-1">v{version}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            
            // Regular rendering for smaller lists
            return filteredArchivedAssets.map(({ asset, version }) => {
              const key = `${version}-${asset.category}-${asset.id}`;
              const isSelected = archivedAssetIds.has(key);
              const isAssetSelected = selectedAssetId === `archived-${key}`;
              return (
                <div
                  key={key}
                  className={`group relative p-3 rounded border transition-all cursor-pointer ${
                    isAssetSelected
                      ? 'bg-indigo-900/30 border-indigo-500'
                      : isSelected
                      ? 'bg-indigo-900/20 border-indigo-500/50'
                      : 'bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border-transparent'
                  }`}
                  onClick={() => onSelectAsset(asset, version)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => handleToggleSelect(asset.id.toString(), version, asset.category, e)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                    {asset.imgUrl ? (
                      <img 
                        src={asset.imgUrl} 
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
                      <div className="text-xs text-gray-500 capitalize">{asset.category}</div>
                      <div className="text-[10px] text-gray-600 mt-1">v{version}</div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <Archive className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-xs">No archived assets found</p>
          <p className="text-[10px] text-gray-700 mt-1">Save database assets to archive them</p>
        </div>
      )}
    </div>
  );
};

