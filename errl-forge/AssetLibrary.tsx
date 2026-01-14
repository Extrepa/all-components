
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Preset, MapleData, MapleCategory, MapleVersion, GameAsset } from '../types';
import { Plus, Search, Ghost, Globe, Download, AlertCircle, Loader2, ImageOff, CheckCircle, Save } from 'lucide-react';
import { getPagedMapleData, getMapleSpriteUrl } from '../services/mapleStoryService';
import { mapSubcategories, allCategories } from '../constants/categories';
import { VersionSelector } from './VersionSelector';
import { CategorySelector } from './CategorySelector';
import { PresetsTab } from './PresetsTab';
import { MyAssetsTab } from './MyAssetsTab';
import { storageService } from '../services/storageService';

interface AssetLibraryProps {
  onSelectPreset: (preset: Preset) => void;
  onSelectMapleAsset: (asset: MapleData) => void;
  onSelectSavedAsset: (asset: GameAsset) => void;
  onNewCustom: () => void;
  selectedAssetId?: string; // ID of currently selected asset (format: maple-{category}-{id})
  selectedPresetId?: string | null; // ID of currently selected preset
  selectedMapleAssetId?: string | null; // ID of currently selected maple asset
}

// -- Sub-Component for Grid Items with Image Fallback --
const AssetGridItem: React.FC<{ 
  asset: MapleData; 
  version: MapleVersion;
  onSelect: (asset: MapleData) => void;
  onSave?: (asset: MapleData) => void;
  isArchived?: boolean;
  isSelected?: boolean; // Whether this asset is currently selected
  innerRef?: React.Ref<HTMLButtonElement>;
}> = ({ asset, version, onSelect, onSave, isArchived, isSelected = false, innerRef }) => {
  const [imgSrc, setImgSrc] = useState(asset.imgUrl);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const retryCountRef = React.useRef(0);
  const petEndpointsTriedRef = React.useRef<Set<string>>(new Set());
  const MAX_RETRIES = 3; // Allow multiple retries for pets to try different endpoints

  // Reset state when asset changes (recycling component)
  useEffect(() => {
    setImgSrc(asset.imgUrl);
    setHasError(false);
    setIsLoading(true);
    retryCountRef.current = 0; // Reset retry count
    petEndpointsTriedRef.current.clear(); // Reset tried endpoints for pets
    
    // For pets, immediately try to fetch the full pet data to get the image
    if (asset.category === 'pet') {
      petEndpointsTriedRef.current.add('FETCH_FULL_DATA'); // Mark as trying
      (async () => {
        try {
          const { fetchPetImage } = await import('../services/mapleStoryService');
          const petImage = await fetchPetImage(asset.id, version);
          if (petImage) {
            setImgSrc(petImage);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn(`[Pet Thumbnail] Failed to fetch pet ${asset.id} on mount:`, e);
        }
        // If fetching failed, fall back to trying the icon URL
        if (asset.imgUrl) {
          petEndpointsTriedRef.current.add(asset.imgUrl);
        }
      })();
    } else {
      if (asset.imgUrl) {
        petEndpointsTriedRef.current.add(asset.imgUrl); // Mark initial URL as tried
      }
    }
  }, [asset.id, asset.imgUrl, asset.category, version]);

  const handleError = async () => {
    retryCountRef.current += 1;
    
    // For pets, fetch full pet data to extract image from frameBooks
    if (asset.category === 'pet') {
      // Log failed endpoint for investigation
      console.warn(`[Pet Thumbnail] Pet ${asset.id} failed to load from: ${imgSrc}`);
      
      // If we haven't tried fetching the full pet data yet, do that
      if (!petEndpointsTriedRef.current.has('FETCH_FULL_DATA')) {
        petEndpointsTriedRef.current.add('FETCH_FULL_DATA');
        
        // Import and use fetchPetImage
        const { fetchPetImage } = await import('../services/mapleStoryService');
        const petImage = await fetchPetImage(asset.id, version);
        
        if (petImage) {
          console.log(`[Pet Thumbnail] Pet ${asset.id} loaded from frameBooks`);
          setImgSrc(petImage);
          return;
        } else {
          console.warn(`[Pet Thumbnail] Pet ${asset.id} has no image in frameBooks`);
        }
      }
      
      // If fetching full data failed, try alternative endpoints as fallback
      const urlMatch = imgSrc.match(/^(https?:\/\/[^\/]+\/api\/GMS\/\d+)/);
      if (urlMatch) {
        const apiBase = urlMatch[1];
        const petId = asset.id;
        
        // List of pet endpoints to try in order (though these likely won't work)
        const petEndpoints = [
          `${apiBase}/pet/${petId}/icon`,
          `${apiBase}/pet/${petId}/stand/0`,
          `${apiBase}/pet/${petId}/render`,
          `${apiBase}/pet/${petId}/render/stand`
        ];
        
        // Find the next endpoint we haven't tried yet
        for (const endpoint of petEndpoints) {
          if (!petEndpointsTriedRef.current.has(endpoint)) {
            petEndpointsTriedRef.current.add(endpoint);
            console.log(`[Pet Thumbnail] Pet ${petId} trying fallback: ${endpoint}`);
            setImgSrc(endpoint);
            return; // Try this endpoint
          }
        }
      }
      
      // If we've tried all methods and retries exceeded, show error
      if (retryCountRef.current >= MAX_RETRIES) {
        console.error(`[Pet Thumbnail] Pet ${asset.id} failed all methods:`, Array.from(petEndpointsTriedRef.current));
        setHasError(true);
        setIsLoading(false);
        return;
      }
    } else {
      // For other categories, try the full render as a fallback
      const fallbackUrl = getMapleSpriteUrl(asset.id, asset.category, version);
      
      // Prevent infinite loops if render and icon are same or both fail
      if (imgSrc !== fallbackUrl && asset.category !== 'item' && asset.category !== 'equip') {
        setImgSrc(fallbackUrl);
        return; // Don't set hasError yet, try fallback first
      }
      
      // If all fallbacks failed, show error state
      if (retryCountRef.current >= MAX_RETRIES) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
    }
    
    // If we get here and retries exceeded, show error
    if (retryCountRef.current >= MAX_RETRIES) {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    // Log successful load for pets to track which endpoints work
    if (asset.category === 'pet') {
      console.log(`[Pet Thumbnail] Pet ${asset.id} loaded successfully from: ${imgSrc}`);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave && !isSaving) {
      setIsSaving(true);
      try {
        await onSave(asset);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="relative group">
      <button
        ref={innerRef}
        onClick={() => onSelect(asset)}
        className={`w-full flex flex-col items-center p-2 rounded transition-all text-center relative overflow-hidden aspect-square justify-center ${
          isSelected 
            ? 'bg-indigo-900/30 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20' 
            : 'bg-gray-800/50 border border-transparent hover:bg-gray-700 hover:border-indigo-500'
        }`}
        title={asset.name}
      >
      {!hasError && imgSrc ? (
        <img 
          src={imgSrc} 
          alt={asset.name} 
          onError={(e) => {
            // Prevent CORB-related crashes and infinite loops
            // Stop event propagation to prevent cascading errors
            e.stopPropagation();
            try {
              handleError();
            } catch (err) {
              // Silently fail to prevent console spam
              setHasError(true);
              setIsLoading(false);
            }
          }}
          onLoad={handleLoad}
          className={`w-8 h-8 object-contain mb-1 group-hover:scale-125 transition-transform pixelated z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
          style={{imageRendering: 'pixelated'}}
          // Don't set crossOrigin to avoid CORB issues - we don't need pixel data access
          loading="lazy" // Lazy load to reduce initial request burst
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
      
      {/* Save button overlay */}
      {onSave && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`absolute top-1 right-1 p-1.5 rounded transition-all z-20 ${
            isArchived
              ? 'bg-green-600/80 text-white'
              : 'bg-gray-900/90 text-gray-400 hover:text-white hover:bg-indigo-600/80 opacity-0 group-hover:opacity-100'
          } ${isSaving ? 'opacity-100' : ''}`}
          title={isArchived ? 'Already archived' : 'Save to archive'}
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isArchived ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Save className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onSelectPreset, onSelectMapleAsset, onSelectSavedAsset, onNewCustom, selectedAssetId, selectedPresetId, selectedMapleAssetId }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'maple' | 'myAssets' | 'archived'>('presets');
  const [activeCategory, setActiveCategory] = useState<MapleCategory>('mob');
  const [activeVersion, setActiveVersion] = useState<MapleVersion>('95'); // Default to v95
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

  // Archive Download State (for progress display)
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  
  // Map subcategory selection state
  const [selectedMapSubcategory, setSelectedMapSubcategory] = useState<string | null>(null);
  const isProgrammaticSearchRef = useRef(false); // Track if search was set programmatically (e.g., from map subcategory)

  // My Assets State
  const [savedAssets, setSavedAssets] = useState<GameAsset[]>([]);
  const [loadingSavedAssets, setLoadingSavedAssets] = useState(false);
  const [assetsSearchQuery, setAssetsSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Archived Database Assets State
  const [archivedAssets, setArchivedAssets] = useState<Array<{ asset: MapleData; version: MapleVersion; timestamp: number }>>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState<MapleCategory | 'all'>('all');
  const [archivedVersionFilter, setArchivedVersionFilter] = useState<MapleVersion | 'all'>('all');
  const [archivedAssetIds, setArchivedAssetIds] = useState<Set<string>>(new Set());
  const [archivedStatusMap, setArchivedStatusMap] = useState<Map<string, boolean>>(new Map());
  

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



  // Load archived status for current items
  useEffect(() => {
    if (activeTab === 'maple' && items.length > 0) {
      checkArchivedStatus();
    }
  }, [items, activeVersion, activeCategory]);

  const checkArchivedStatus = async () => {
    const statusMap = new Map<string, boolean>();
    await Promise.all(
      items.map(async (asset) => {
        const id = `${activeVersion}-${asset.category}-${asset.id}`;
        const isArchived = await storageService.isDatabaseAssetArchived(asset, activeVersion);
        statusMap.set(id, isArchived);
      })
    );
    setArchivedStatusMap(statusMap);
  };


  const handleSaveDatabaseAsset = async (asset: MapleData) => {
    try {
      // Just use the existing imgUrl from the asset, don't fetch a new one
      const imageUrl = asset.imgUrl || getMapleSpriteUrl(asset.id, asset.category, activeVersion);
      await storageService.saveDatabaseAsset(asset, activeVersion, imageUrl);
      
      // Update archived status
      const id = `${activeVersion}-${asset.category}-${asset.id}`;
      setArchivedStatusMap(prev => new Map(prev).set(id, true));
    } catch (error) {
      console.error('Failed to save database asset:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save asset to archive: ${errorMessage}`);
      throw error; // Re-throw so the loading state can be cleared
    }
  };


  // Reset when category, tab, or version changes (but don't auto-fetch)
  useEffect(() => {
    if (activeTab === 'maple') {
      resetGrid();
      setSearchQuery(''); // Clear search query when category changes
      // Reset map subcategory selection when switching away from map
      if (activeCategory !== 'map') {
        setSelectedMapSubcategory(null);
        // Don't clear search query here - let it persist if user comes back
      }
      // Don't auto-fetch - user must click Load button
    }
  }, [activeCategory, activeTab, activeVersion]);



  // Handle Search Input Changes with more aggressive debouncing
  useEffect(() => {
    if (activeTab === 'maple') {
      // Skip auto-search if search was set programmatically (e.g., from map subcategory click)
      if (isProgrammaticSearchRef.current) {
        isProgrammaticSearchRef.current = false; // Reset flag
        return; // Don't auto-trigger search, it's already been triggered
      }
      
      // If user types, we disable "Full Database View" mode and revert to search mode
      if (searchQuery.length > 0) {
        setViewingFullDatabase(false);
        // If items are already loaded, search immediately
        // If no items loaded yet, search will trigger when Load button is clicked
        if (items.length > 0) {
          const timeoutId = setTimeout(() => {
            resetGrid();
            loadData(0, activeCategory, activeVersion, searchQuery, viewingFullDatabase, true);
          }, 800);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [searchQuery, items.length, activeCategory]); 

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

  // Calculate how many items are needed to fill viewport
  const calculateViewportItemCount = (): number => {
    if (typeof window === 'undefined') return 12; // Default fallback
    
    // Grid is 3 columns (grid-cols-3)
    const gridCols = 3;
    // Each item is roughly square, estimate height including gap
    // Item height ~= width (square) + name text + padding
    // With gap-2 (0.5rem = 8px), each item takes roughly 100-120px height
    const estimatedItemHeight = 120;
    const gridGap = 8; // gap-2 = 0.5rem = 8px
    
    // Get viewport height, subtract header/search bar space (~200px)
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - 300; // Account for header, search, categories
    
    // Calculate rows that fit
    const rowsThatFit = Math.ceil(availableHeight / (estimatedItemHeight + gridGap));
    
    // Calculate items needed (rows * cols) + buffer for smooth scrolling
    const itemsNeeded = Math.max(12, rowsThatFit * gridCols + 6); // Minimum 12, add 6 for buffer
    
    return itemsNeeded;
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
      // For initial load (page 0), calculate viewport-based page size
      // For subsequent pages, use smaller fixed size for infinite scroll
      const pageSize = pageNum === 0 && !fetchAll 
        ? calculateViewportItemCount() 
        : 24; // Fixed size for pagination
      
      const { items: newItems, hasMore: moreAvailable } = await getPagedMapleData(cat, ver, pageNum, pageSize, query, fetchAll);
      
      // Deduplicate assets by category and id
      if (reset) {
        setItems(newItems);
      } else {
        setItems(prev => {
          const existingIds = new Set(prev.map(a => `${a.category}-${a.id}`));
          const uniqueNewItems = newItems.filter(a => !existingIds.has(`${a.category}-${a.id}`));
          return [...prev, ...uniqueNewItems];
        });
      }
      setHasMore(moreAvailable);
      
      // Don't prefetch - let infinite scroll handle it
    } catch (error: any) {
      console.error("Failed to load data", error);
      setHasError(true);
      setErrorMsg(error.message || "Unknown error");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleLoadData = () => {
    resetGrid();
    // Load with current search query (if any) or empty for initial load
    loadData(0, activeCategory, activeVersion, searchQuery, viewingFullDatabase, true);
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

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 shimmer-border flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-800 relative">
        <button 
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-3 text-xs font-bold font-pixel transition-colors relative ${activeTab === 'presets' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          ARCHIVE
          {activeTab === 'presets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 shimmer-divider"></div>}
        </button>
        <div className="w-px h-full shimmer-divider"></div>
        <button 
          onClick={() => setActiveTab('maple')}
          className={`flex-1 py-3 text-xs font-bold font-pixel transition-colors relative ${activeTab === 'maple' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          MAPLE DB
          {activeTab === 'maple' && <div className="absolute bottom-0 left-0 right-0 h-0.5 shimmer-divider"></div>}
        </button>
        <div className="w-px h-full shimmer-divider"></div>
        <button 
          onClick={() => setActiveTab('myAssets')}
          className={`flex-1 py-3 text-xs font-bold font-pixel transition-colors relative ${activeTab === 'myAssets' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          MY ASSETS
          {activeTab === 'myAssets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 shimmer-divider"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'presets' ? (
          <PresetsTab
            onSelectPreset={onSelectPreset}
            onSelectMapleAsset={onSelectMapleAsset}
            selectedPresetId={selectedPresetId}
            selectedMapleAssetId={selectedMapleAssetId}
          />
        ) : activeTab === 'myAssets' ? (
          <MyAssetsTab
            onSelectAsset={onSelectSavedAsset}
            selectedAssetId={selectedAssetId}
          />
        ) : activeTab === 'maple' ? (
          <div className="flex-1 flex flex-col h-full">
            <VersionSelector
              activeVersion={activeVersion}
              activeCategory={activeCategory}
              onVersionChange={setActiveVersion}
              isDownloading={isDownloading}
              downloadCount={downloadCount}
              onDownloadProgress={setDownloadCount}
            />

            {/* Category Selector */}
            <CategorySelector
              activeCategory={activeCategory}
              selectedMapSubcategory={selectedMapSubcategory || undefined}
              onCategoryChange={(category) => {
                setActiveCategory(category);
              }}
              onMapSubcategoryChange={(subcategoryId, searchQuery) => {
                setSelectedMapSubcategory(subcategoryId);
                isProgrammaticSearchRef.current = true; // Mark as programmatic search
                setSearchQuery(searchQuery);
                // Reset grid and load with town search
                resetGrid();
                loadData(0, 'map', activeVersion, searchQuery, false, true);
              }}
            />

            <div className="p-3 border-b border-gray-800 shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={viewingFullDatabase ? `Browsing All...` : (activeVersion === '62' ? `Filter ${activeCategory}...` : `Search ${activeCategory}...`)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                </div>
                {items.length === 0 && !loading && !hasError ? (
                  <button
                    onClick={handleLoadData}
                    disabled={loading}
                    title="Load items to fill viewport"
                    className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded px-3 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Load
                  </button>
                ) : (
                  <button
                    onClick={handleBrowseAll}
                    disabled={viewingFullDatabase || loading}
                    title={activeVersion === '62' ? "Load full list" : "Browse all items from server"}
                    className={`bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative ${viewingFullDatabase ? 'text-indigo-400 border-indigo-500/50 bg-indigo-900/10' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 min-h-0 scrollbar-hide">
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
                      {activeVersion !== '62' && (
                        <p className="text-[9px] opacity-50 mb-3 max-w-[200px]">v{activeVersion} may be unstable. Try switching to v62 if this persists.</p>
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
                        onSave={handleSaveDatabaseAsset}
                        isArchived={archivedStatusMap.get(`${activeVersion}-${asset.category}-${asset.id}`)}
                        isSelected={selectedAssetId === `maple-${asset.category}-${asset.id}`}
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
                  <p className="text-xs mb-2">No items loaded</p>
                  <p className="text-[10px] text-gray-700 mb-4">
                    Click the Load button to fetch items for this category
                  </p>
                  <button
                    onClick={handleLoadData}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Load Items
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
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
