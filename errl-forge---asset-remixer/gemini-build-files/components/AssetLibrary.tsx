
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ASSET_PRESETS } from '../constants';
import { Preset, MapleData, MapleCategory, MapleVersion } from '../types';
import { Plus, Search, Ghost, Cat, User, Box, Skull, Loader2, ImageOff, Map as MapIcon, Shield, Smile, Globe, Download, AlertCircle } from 'lucide-react';
import { getPagedMapleData, getMapleSpriteUrl, downloadCategoryArchive } from '../services/mapleStoryService';

interface AssetLibraryProps {
  onSelectPreset: (preset: Preset) => void;
  onSelectMapleAsset: (asset: MapleData) => void;
  onNewCustom: () => void;
}

// -- Sub-Component for Grid Items with Image Fallback --
const AssetGridItem: React.FC<{ 
  asset: MapleData; 
  version: MapleVersion;
  onSelect: (asset: MapleData) => void; 
  innerRef?: React.Ref<HTMLButtonElement>;
}> = ({ asset, version, onSelect, innerRef }) => {
  const [imgSrc, setImgSrc] = useState(asset.imgUrl);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when asset changes (recycling component)
  useEffect(() => {
    setImgSrc(asset.imgUrl);
    setHasError(false);
    setIsLoading(true);
  }, [asset.id, asset.imgUrl]);

  const handleError = () => {
    // If the icon failed, try the full render as a fallback
    const fallbackUrl = getMapleSpriteUrl(asset.id, asset.category, version);
    
    // Avoid infinite loops if render and icon are same or both fail
    if (imgSrc !== fallbackUrl && asset.category !== 'item' && asset.category !== 'equip') {
      setImgSrc(fallbackUrl);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <button
      ref={innerRef}
      onClick={() => onSelect(asset)}
      className="flex flex-col items-center p-2 bg-gray-800/50 rounded hover:bg-gray-700 border border-transparent hover:border-indigo-500 transition-all text-center group relative overflow-hidden aspect-square justify-center"
      title={asset.name}
    >
      {!hasError ? (
        <img 
          src={imgSrc} 
          alt={asset.name} 
          onError={handleError}
          onLoad={handleLoad}
          className={`w-8 h-8 object-contain mb-1 group-hover:scale-125 transition-transform pixelated z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
          style={{imageRendering: 'pixelated'}}
        />
      ) : (
        <ImageOff className="w-6 h-6 text-gray-700 mb-1" />
      )}
      
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      <span className="text-[9px] leading-tight font-bold text-gray-400 truncate w-full z-10">{asset.name}</span>
      
      {/* Subtle BG effect on hover */}
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onSelectPreset, onSelectMapleAsset, onNewCustom }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'maple'>('presets');
  const [activeCategory, setActiveCategory] = useState<MapleCategory>('mob');
  const [activeVersion, setActiveVersion] = useState<MapleVersion>('210'); // Default to modern
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingFullDatabase, setViewingFullDatabase] = useState(false);
  
  // Infinite Scroll State
  const [items, setItems] = useState<MapleData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // Archive Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset when category, tab, or version changes
  useEffect(() => {
    if (activeTab === 'maple') {
      resetGrid();
      // For v210, we default to a "Browse All" if no search, but maybe user wants search first?
      loadData(0, activeCategory, activeVersion, '', false, true);
    }
  }, [activeCategory, activeTab, activeVersion]);

  // Handle Search Input Changes
  useEffect(() => {
    if (activeTab === 'maple') {
      // If user types, we disable "Full Database View" mode and revert to search mode
      if (searchQuery.length > 0) {
        setViewingFullDatabase(false);
      }
      
      const timeoutId = setTimeout(() => {
        resetGrid();
        loadData(0, activeCategory, activeVersion, searchQuery, viewingFullDatabase, true);
      }, 500); 
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]); 

  // Load next page
  useEffect(() => {
    if (page > 0 && activeTab === 'maple') {
      loadData(page, activeCategory, activeVersion, searchQuery, viewingFullDatabase, false);
    }
  }, [page]);

  const resetGrid = () => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setHasError(false);
    setErrorMsg('');
    setIsInitialLoad(true);
    setViewingFullDatabase(false);
  };

  const loadData = async (
    pageNum: number, 
    cat: MapleCategory, 
    ver: MapleVersion, 
    query: string, 
    fetchAll: boolean, 
    reset: boolean
  ) => {
    setLoading(true);
    setHasError(false);
    setErrorMsg('');
    try {
      const pageSize = 24; // Reduced to 24 to help with v210 API stability
      const { items: newItems, hasMore: moreAvailable } = await getPagedMapleData(cat, ver, pageNum, pageSize, query, fetchAll);
      
      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      setHasMore(moreAvailable);
    } catch (error: any) {
      console.error("Failed to load data", error);
      setHasError(true);
      setErrorMsg(error.message || "Unknown error");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleBrowseAll = () => {
    setViewingFullDatabase(true);
    setSearchQuery(''); // Clear search visual
    resetGrid();
    // Trigger load with fetchAll = true
    loadData(0, activeCategory, activeVersion, '', true, true);
  };
  
  const handleRetry = () => {
      // Simple retry is to just reload current parameters
      resetGrid();
      loadData(0, activeCategory, activeVersion, searchQuery, viewingFullDatabase, true);
  };

  const handleDownloadArchive = async () => {
      setIsDownloading(true);
      setDownloadCount(0);
      try {
          await downloadCategoryArchive(activeCategory, activeVersion, (count) => setDownloadCount(count));
      } catch (e) {
          alert("Download failed. The API might be unstable/busy (503).");
      } finally {
          setIsDownloading(false);
      }
  };

  const categories: { id: MapleCategory; label: string; icon: React.FC<any> }[] = [
    { id: 'mob', label: 'Mobs', icon: Skull },
    { id: 'npc', label: 'NPCs', icon: User },
    { id: 'pet', label: 'Pets', icon: Cat },
    { id: 'map', label: 'Maps', icon: MapIcon },
    { id: 'item', label: 'Items', icon: Box },
    { id: 'equip', label: 'Equip', icon: Shield },
    { id: 'hair', label: 'Hair', icon: Smile },
    { id: 'face', label: 'Face', icon: Smile },
  ];

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-3 text-xs font-bold font-pixel transition-colors ${activeTab === 'presets' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          ARCHIVE
        </button>
        <button 
          onClick={() => setActiveTab('maple')}
          className={`flex-1 py-3 text-xs font-bold font-pixel transition-colors ${activeTab === 'maple' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          MAPLE DB
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'presets' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Base Models</div>
            {ASSET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="w-full text-left p-3 rounded bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border border-transparent transition-all group"
              >
                <div className="font-bold text-gray-200 group-hover:text-white text-sm">{preset.name}</div>
                <div className="text-xs text-gray-500 capitalize">{preset.type}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Version Selector & Archive Downloader */}
            <div className="px-3 py-2 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">DB Ver.</span>
              <select 
                value={activeVersion} 
                onChange={(e) => setActiveVersion(e.target.value as MapleVersion)}
                className="bg-gray-800 text-xs text-white border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 flex-1 min-w-0"
              >
                <option value="210">GMS v210</option>
                <option value="62">GMS v62</option>
              </select>
              
              <button
                 onClick={handleDownloadArchive}
                 disabled={isDownloading}
                 title="Download Full Category Archive (JSON)"
                 className={`flex items-center justify-center w-7 h-7 rounded border transition-colors ${isDownloading ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                 {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            {/* Download Progress Bar */}
            {isDownloading && (
                <div className="px-3 py-1 bg-indigo-900/30 border-b border-indigo-500/30 flex items-center justify-between">
                    <span className="text-[9px] text-indigo-300 font-bold">Fetching Archive...</span>
                    <span className="text-[9px] text-indigo-300">{downloadCount} items</span>
                </div>
            )}

            {/* Category Selector */}
            <div className="flex p-2 gap-1 overflow-x-auto bg-gray-900 border-b border-gray-800 scrollbar-hide shrink-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="p-3 border-b border-gray-800 shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={viewingFullDatabase ? `Browsing All...` : (activeVersion === '210' ? `Search ${activeCategory}...` : `Filter ${activeCategory}...`)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                </div>
                <button
                  onClick={handleBrowseAll}
                  disabled={viewingFullDatabase || loading}
                  title={activeVersion === '210' ? "Browse all items from server" : "Load full list"}
                  className={`bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative ${viewingFullDatabase ? 'text-indigo-400 border-indigo-500/50 bg-indigo-900/10' : 'text-gray-400 hover:text-white'}`}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar">
              {isInitialLoad && loading ? (
                 <div className="flex flex-col items-center justify-center h-40 gap-3 text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="font-pixel text-[10px] animate-pulse">
                      {viewingFullDatabase ? 'Connecting to Database...' : 'Querying API...'}
                    </span>
                 </div>
              ) : hasError ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-400 text-center p-4">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
                      <p className="text-xs font-bold">Connection Failed</p>
                      <p className="text-[10px] mt-1 opacity-70 mb-1">{errorMsg}</p>
                      {activeVersion === '210' && (
                        <p className="text-[9px] opacity-50 mb-3 max-w-[200px]">v210 is unstable. Try switching to v62 if this persists.</p>
                      )}
                      <button 
                          onClick={() => handleRetry()}
                          className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded text-xs transition-colors"
                      >
                          Retry
                      </button>
                  </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 pb-4">
                  {items.map((asset, index) => {
                    const isLast = index === items.length - 1;
                    return (
                      <AssetGridItem 
                        key={`${asset.id}-${index}`}
                        asset={asset}
                        version={activeVersion}
                        onSelect={onSelectMapleAsset}
                        innerRef={isLast ? lastItemRef : null}
                      />
                    );
                  })}
                  {loading && !isInitialLoad && (
                     <div className="col-span-3 flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                     </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center p-4">
                  <Ghost className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No assets found.</p>
                  <p className="text-[10px] text-gray-700 mt-2">
                    {activeVersion === '210' && !viewingFullDatabase ? 'Try searching or click Globe icon to browse all.' : 'Try changing categories.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 shrink-0">
        <button
          onClick={onNewCustom}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded font-bold transition-colors text-sm shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Asset</span>
        </button>
      </div>
    </div>
  );
};
