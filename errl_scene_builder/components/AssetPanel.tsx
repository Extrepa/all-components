import React from "react";
import { assetRegistry, AssetDefinition, AssetVariantGroup, getAssetById } from "../assets/registry";
import { variantGroups } from "../assets/errlVariants";
import { useSceneStore } from "../scene/store";
import { getThumbnailPath, hasThumbnail } from "../utils/thumbnailPath";

/**
 * AssetPanel
 *
 * Lists all assets from the registry, grouped by category, and spawns them into the scene.
 * Spawning uses a default transform (centered) and default style/motion if provided by the registry.
 */
type Props = {
  onAddAsset?: (asset: AssetDefinition) => void;
  onSelectAssetForPlacement?: (asset: AssetDefinition) => void;
};

const CATEGORY_ORDER: AssetCategory[] = [
  "ERRL_CREW",
  "WEARABLES",
  "PROPS",
  "STRUCTURES",
  "FLORA",
  "DECOR",
  "LIGHTING",
  "FX",
  "GOO",
  "UI",
  "BACKGROUNDS",
  "TREATS_MISC",
];

const CATEGORY_META: Record<
  AssetCategory,
  { label: string; icon: string; background: string; accent: string }
> = {
  ERRL_CREW: { label: "Errl Crew", icon: "😮", background: "rgba(78,205,196,0.08)", accent: "#4ecdc4" },
  WEARABLES: { label: "Wearables", icon: "🧢", background: "rgba(196,181,253,0.08)", accent: "#c4b5fd" },
  PROPS: { label: "Props", icon: "📦", background: "rgba(251,189,96,0.08)", accent: "#fbbf24" },
  STRUCTURES: { label: "Structures", icon: "🏗️", background: "rgba(129,140,248,0.08)", accent: "#818cf8" },
  FLORA: { label: "Flora", icon: "🌿", background: "rgba(134,239,172,0.08)", accent: "#84cc16" },
  DECOR: { label: "Decor", icon: "🎀", background: "rgba(244,114,182,0.08)", accent: "#f472b6" },
  LIGHTING: { label: "Lighting", icon: "💡", background: "rgba(147,197,253,0.08)", accent: "#60a5fa" },
  FX: { label: "FX & Weather", icon: "✨", background: "rgba(192,132,252,0.08)", accent: "#c084fc" },
  GOO: { label: "Goo & Blobs", icon: "💧", background: "rgba(110,231,183,0.08)", accent: "#34d399" },
  UI: { label: "UI & Icons", icon: "🕹️", background: "rgba(148,163,184,0.08)", accent: "#94a3b8" },
  BACKGROUNDS: { label: "Backgrounds", icon: "🌌", background: "rgba(99,102,241,0.08)", accent: "#6366f1" },
  TREATS_MISC: { label: "Treats & Misc", icon: "🍕", background: "rgba(248,196,113,0.08)", accent: "#f8c471" },
};

export const AssetPanel: React.FC<Props> = ({ onAddAsset, onSelectAssetForPlacement }) => {
  const addEntity = useSceneStore((s) => s.addEntity);
  const [brokenIds, setBrokenIds] = React.useState<Record<string, boolean>>({});
  const [query, setQuery] = React.useState("");
  // Track which category is currently expanded (only one at a time)
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const categoryRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  // Track hover timeouts for delayed expansion
  const hoverTimeoutsRef = React.useRef<Record<string, NodeJS.Timeout>>({});
  // Track if auto-expansion should be enabled (disabled on initial load)
  const [enableAutoExpand, setEnableAutoExpand] = React.useState(false);

  const assetsByCategory = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = assetRegistry;
    
    // Show ALL assets including variant assets - no filtering
    // All 700+ Errl assets will be displayed with lazy loading
    
    // Apply text search filter
    if (q) {
      list = list.filter((asset) => {
        const haystack = [
          asset.label,
          asset.id,
          asset.category,
          ...(asset.tags ?? []),
        ];
        return haystack.some((value) => value?.toLowerCase().includes(q));
      });
    }
    
    return list.reduce<Record<AssetCategory, AssetDefinition[]>>((acc, asset) => {
      const bucket = asset.category;
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket]!.push(asset);
      return acc;
    }, {} as Record<AssetCategory, AssetDefinition[]>);
  }, [query]);

  const handleAdd = (asset: AssetDefinition) => {
    if (onSelectAssetForPlacement) {
      // Enter preview mode
      onSelectAssetForPlacement(asset);
    } else {
      // Fallback to immediate placement
      const layerId = "layer_main";
      const entity = {
        id: "entity_" + Math.random().toString(36).slice(2, 8),
        assetId: asset.id,
        layerId,
        transform: { x: 512, y: 512, scaleX: 1, scaleY: 1, rotation: 0 },
        style: { opacity: 1, blendMode: "normal" },
        motion: [],
      };
      addEntity(entity);
      onAddAsset?.(asset);
    }
  };

  // Determine which category should be expanded (manual click takes precedence, then hover)
  const isCategoryExpanded = (category: string) => {
    // Manual selection takes highest precedence
    if (hasManualSelection && expandedCategory === category) {
      return true;
    }
    // Then use hover state
    if (hoveredCategory === category) {
      return true;
    }
    // Otherwise check if this is the expanded category (for manual selection without hasManualSelection flag)
    return expandedCategory === category;
  };

  // Track if user has manually clicked a category (to prevent auto-collapse)
  const [hasManualSelection, setHasManualSelection] = React.useState(false);

  // Handle category click
  const handleCategoryClick = (category: string) => {
    // Clear any pending hover timeout for this category
    if (hoverTimeoutsRef.current[category]) {
      clearTimeout(hoverTimeoutsRef.current[category]);
      delete hoverTimeoutsRef.current[category];
    }
    // Clear hover state when clicking
    setHoveredCategory(null);
    
    if (expandedCategory === category) {
      setExpandedCategory(null);
      setHasManualSelection(false);
    } else {
      setExpandedCategory(category);
      setHasManualSelection(true);
    }
  };

  // Scroll-based auto-expansion using IntersectionObserver
  // Only enabled after user interaction to prevent auto-expansion on initial load
  React.useEffect(() => {
    // Don't auto-expand if disabled, user is hovering, or has manually selected
    if (!enableAutoExpand || hoveredCategory || hasManualSelection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the category that's most visible in the viewport center
        let mostVisible: { category: string; ratio: number } | null = null;
        
        entries.forEach((entry) => {
          const category = entry.target.getAttribute('data-category');
          if (category && entry.isIntersecting && entry.intersectionRatio > 0.4) {
            if (!mostVisible || entry.intersectionRatio > mostVisible.ratio) {
              mostVisible = { category, ratio: entry.intersectionRatio };
            }
          }
        });

        // Auto-expand the most visible category
        if (mostVisible) {
          setExpandedCategory((prev) => {
            // Only update if different to avoid unnecessary re-renders
            return prev !== mostVisible!.category ? mostVisible!.category : prev;
          });
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '-30% 0px -30% 0px', // Only trigger when category is in center 40% of viewport
        threshold: [0, 0.4, 0.6, 0.8, 1.0],
      }
    );

    // Observe all category sections
    const refs = Object.values(categoryRefs.current).filter(Boolean) as HTMLDivElement[];
    refs.forEach((ref) => observer.observe(ref));

    return () => observer.disconnect();
  }, [enableAutoExpand, hoveredCategory, hasManualSelection]);

  // Cleanup hover timeouts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(hoverTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <aside className="dock">
      <div className="dock-header">
        <div className="dock-sub">Pick objects to decorate your scene</div>
        <div className="search-row inline">
          <input
            className="input"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="dock-scroll" ref={scrollContainerRef}>
        {CATEGORY_ORDER.map((category) => {
          const assets = assetsByCategory[category] ?? [];
          if (assets.length === 0) return null;
          const meta = CATEGORY_META[category];
          const isExpanded = isCategoryExpanded(category);
          return (
            <section
              key={category}
              ref={(el) => {
                categoryRefs.current[category] = el;
              }}
              data-category={category}
              className="dock-section category-block"
              style={{ background: meta.background, borderColor: meta.accent }}
              onMouseEnter={() => {
                // Clear any existing timeout for this category
                if (hoverTimeoutsRef.current[category]) {
                  clearTimeout(hoverTimeoutsRef.current[category]);
                }
                // Set hovered category after 300ms delay
                hoverTimeoutsRef.current[category] = setTimeout(() => {
                  setHoveredCategory(category);
                  delete hoverTimeoutsRef.current[category];
                }, 300);
              }}
              onMouseLeave={() => {
                // Clear timeout if mouse leaves before delay completes
                if (hoverTimeoutsRef.current[category]) {
                  clearTimeout(hoverTimeoutsRef.current[category]);
                  delete hoverTimeoutsRef.current[category];
                }
                // Only clear hover state if not manually expanded
                if (!hasManualSelection || expandedCategory !== category) {
                  setHoveredCategory(null);
                }
              }}
            >
            <button
              className="dock-section-header"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick(category);
                // Enable auto-expand after first user interaction
                if (!enableAutoExpand) {
                  setEnableAutoExpand(true);
                }
              }}
              style={{ color: meta.accent }}
            >
              <span className="dock-section-title">
                <span className="emoji">{meta.icon}</span>
                <span>{meta.label}</span>
              </span>
              <span className="chevron">{isExpanded ? "▾" : "▸"}</span>
            </button>
            {isExpanded && (
              <div className="asset-grid tight">
                {/* Show variant groups first for ERRL_CREW category */}
                {category === "ERRL_CREW" &&
                  variantGroups
                    .filter((group) => {
                      // Apply search filter
                      const q = query.trim().toLowerCase();
                      if (q) {
                        const haystack = [
                          group.label,
                          group.id,
                          group.description || "",
                          ...(group.tags ?? []),
                        ];
                        if (!haystack.some((value) => value?.toLowerCase().includes(q))) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .map((group) => (
                      <VariantGroupButton
                        key={group.id}
                        group={group}
                        onAdd={handleAdd}
                        onSelectForPlacement={onSelectAssetForPlacement}
                      />
                    ))}
                {/* Then show regular assets */}
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    className="asset-card compact"
                    onClick={() => handleAdd(asset)}
                    title={`${asset.label} (${asset.id})`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ assetId: asset.id })
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    <div className="thumb-wrapper asset-thumb-bg">
                      <AssetThumb
                        asset={asset}
                        broken={brokenIds[asset.id]}
                        markBroken={() =>
                          setBrokenIds((prev) => ({ ...prev, [asset.id]: true }))
                        }
                      />
                    </div>
                    <div className="asset-meta compact">
                      <div className="asset-label">{asset.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
          );
        })}
      </div>
    </aside>
  );
};

const VariantGroupButton: React.FC<{
  group: AssetVariantGroup;
  onAdd: (asset: AssetDefinition) => void;
  onSelectForPlacement?: (asset: AssetDefinition) => void;
}> = ({ group, onAdd, onSelectForPlacement }) => {
  const addEntity = useSceneStore((s) => s.addEntity);
  
  const handleClick = () => {
    // Get the first variant (will be placed, user can switch after)
    const firstVariantId = group.variantAssetIds[0];
    const firstVariant = getAssetById(firstVariantId);
    if (!firstVariant) return;
    
    if (onSelectForPlacement) {
      onSelectForPlacement(firstVariant);
    } else {
      const layerId = "layer_main";
      const entity = {
        id: "entity_" + Math.random().toString(36).slice(2, 8),
        assetId: firstVariant.id,
        layerId,
        transform: { x: 512, y: 512, scaleX: 1, scaleY: 1, rotation: 0 },
        style: { opacity: 1, blendMode: "normal" },
        motion: [],
        metadata: {
          variantGroupId: group.id,
          variantIndex: 0,
        },
      };
      addEntity(entity);
      onAdd(firstVariant);
    }
  };
  
  // Try to use group thumbnail first, fallback to variant thumbnail
  const getGroupThumbnailPath = (groupId: string, folderPath: string): string | null => {
    // Map group IDs (ERRL_VARIANT_GROUP_{FOLDER_NAME}) to group thumbnail filenames
    const groupThumbnailMap: Record<string, string> = {
      'ERRL_VARIANT_GROUP_ERRL_30_DYNAMIC_INDIVIDUAL_TRANSPARENT': 'group-01-errl-30-dynamic.svg',
      'ERRL_VARIANT_GROUP_ERRL_50_GRID_POSES_INDIVIDUAL_TRANSPARENT': 'group-02-errl-50-grid-poses.svg',
      'ERRL_VARIANT_GROUP_ERRL_50_GRID_REF_INDIVIDUAL_TRANSPARENT': 'group-03-errl-50-grid-ref.svg',
      'ERRL_VARIANT_GROUP_RANDOM_DYNAMIC_INDIVIDUAL_TRANSPARENT': 'group-04-random-dynamic.svg',
      'ERRL_VARIANT_GROUP_ERRL_20_VISCOUS_BODY_V2_INDIVIDUAL_TRANSPARENT': 'group-05-viscous-body-v2.svg',
      'ERRL_VARIANT_GROUP_ERRL_30_DYNAMIC_INDIVIDUAL_ERRL_ONLY': 'group-06-errl-only-30-dynamic.svg',
      'ERRL_VARIANT_GROUP_ERRL_50_GRID_POSES_INDIVIDUAL_ERRL_ONLY': 'group-07-errl-only-50-grid-poses.svg',
      'ERRL_VARIANT_GROUP_ERRL_50_GRID_REF_INDIVIDUAL_ERRL_ONLY': 'group-08-errl-only-50-grid-ref.svg',
      'ERRL_VARIANT_GROUP_ERRL_50_RANDOM_DYNAMIC_INDIVIDUAL_ERRL_ONLY': 'group-09-errl-only-random-dynamic.svg',
    };
    
    // Check exact match first
    let thumbnailFile = groupThumbnailMap[groupId];
    
    // If not found, try to match by folder path pattern
    if (!thumbnailFile) {
      const folderName = folderPath.split('/').pop() || '';
      if (folderName.includes('errl-30-dynamic') && folderPath.includes('ErrlOnly')) {
        thumbnailFile = 'group-06-errl-only-30-dynamic.svg';
      } else if (folderName.includes('errl-50-grid-poses') && folderPath.includes('ErrlOnly')) {
        thumbnailFile = 'group-07-errl-only-50-grid-poses.svg';
      } else if (folderName.includes('errl-50-grid-ref') && folderPath.includes('ErrlOnly')) {
        thumbnailFile = 'group-08-errl-only-50-grid-ref.svg';
      } else if (folderName.includes('random-dynamic') && folderPath.includes('ErrlOnly')) {
        thumbnailFile = 'group-09-errl-only-random-dynamic.svg';
      }
    }
    
    if (thumbnailFile) {
      return `/svgs/thumbnails/${thumbnailFile}`;
    }
    return null;
  };
  
  const groupThumbnailPath = getGroupThumbnailPath(group.id, group.folderPath);
  
  // Fallback: Get thumbnail from the last variant (most centered, matches folder item count)
  const thumbnailVariantIndex = group.variantAssetIds.length - 1;
  const thumbnailVariantId = group.variantAssetIds[thumbnailVariantIndex];
  const thumbnailVariant = getAssetById(thumbnailVariantId);
  const [broken, setBroken] = React.useState(false);
  
  // Determine which thumbnail to use
  const thumbnailSrc = groupThumbnailPath || (thumbnailVariant && hasThumbnail(thumbnailVariant.filePath) ? getThumbnailPath(thumbnailVariant.filePath) : thumbnailVariant?.filePath);
  
  return (
    <button
      className="asset-card compact variant-group"
      onClick={handleClick}
      title={`${group.label} - ${group.variantCount} variants${group.hasFaces ? "" : " (body only - no face)"}`}
    >
      <div className="thumb-wrapper asset-thumb-bg" style={{ pointerEvents: 'none' }}>
        {thumbnailSrc && !broken ? (
          <div className="asset-thumb" aria-hidden style={{ pointerEvents: 'none' }}>
            <img
              src={thumbnailSrc}
              alt={group.label}
              className="variant-thumbnail-enlarged"
              style={{ pointerEvents: 'none' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.warn(`Failed to load thumbnail for ${group.id}:`, {
                  attemptedSrc: target.src,
                  groupThumbnailPath,
                  thumbnailSrc,
                  groupId: group.id
                });
                
                // Fallback chain: group thumbnail -> variant thumbnail -> variant SVG
                if (groupThumbnailPath && target.src.includes('group-')) {
                  // Group thumbnail failed, try variant thumbnail
                  if (thumbnailVariant) {
                    const variantThumb = hasThumbnail(thumbnailVariant.filePath) ? getThumbnailPath(thumbnailVariant.filePath) : thumbnailVariant.filePath;
                    console.log(`Falling back to variant thumbnail: ${variantThumb}`);
                    target.src = variantThumb;
                  } else {
                    setBroken(true);
                  }
                } else if (thumbnailVariant && hasThumbnail(thumbnailVariant.filePath) && !target.src.includes('.svg')) {
                  // Variant PNG thumbnail failed, try SVG
                  console.log(`Falling back to variant SVG: ${thumbnailVariant.filePath}`);
                  target.src = thumbnailVariant.filePath;
                } else {
                  setBroken(true);
                }
              }}
              onLoad={() => {
                if (import.meta.env.DEV && groupThumbnailPath) {
                  console.log(`✅ Loaded thumbnail for ${group.id}: ${thumbnailSrc}`);
                }
              }}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="asset-thumb fallback" aria-hidden style={{ pointerEvents: 'none' }}>
            <div className="asset-initials">{group.label.slice(0, 2)}</div>
          </div>
        )}
      </div>
      <div className="asset-meta compact">
        <div className="asset-label">{group.label}</div>
        <div className="asset-variant-count">
          {group.variantCount} variant{group.variantCount !== 1 ? "s" : ""}
          {!group.hasFaces && " • Body only"}
        </div>
      </div>
    </button>
  );
};

const AssetThumb: React.FC<{ asset: AssetDefinition; broken?: boolean; markBroken: () => void }> = ({
  asset,
  broken,
  markBroken,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  // Lazy load using IntersectionObserver
  React.useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );
    
    observer.observe(imgRef.current);
    
    return () => observer.disconnect();
  }, []);
  
  if (broken) {
    return (
      <div className="asset-thumb fallback" aria-hidden>
        <div className="asset-initials">{asset.label.slice(0, 2)}</div>
      </div>
    );
  }
  
  // Use thumbnail if available, otherwise fall back to SVG
  const imageSrc = hasThumbnail(asset.filePath) ? getThumbnailPath(asset.filePath) : asset.filePath;
  
  return (
    <div className="asset-thumb" aria-hidden style={{ pointerEvents: 'none' }}>
      {isVisible ? (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={asset.label}
          style={{ pointerEvents: 'none' }}
          onError={(e) => {
            // If thumbnail fails, try falling back to SVG
            if (hasThumbnail(asset.filePath) && imageSrc !== asset.filePath) {
              (e.target as HTMLImageElement).src = asset.filePath;
            } else {
              markBroken();
            }
          }}
          loading="lazy"
        />
      ) : (
        <div ref={imgRef} className="asset-thumb-placeholder" style={{ 
          width: '100%', 
          height: '100%', 
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: 'rgba(255, 255, 255, 0.3)'
        }}>
          {asset.label.slice(0, 2)}
        </div>
      )}
    </div>
  );
};
