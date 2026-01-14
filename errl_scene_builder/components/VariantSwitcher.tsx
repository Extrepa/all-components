import React from "react";
import { useSceneStore } from "../scene/store";
import { getVariantGroupForAsset, getVariantIndex, getNextVariant, getPreviousVariant } from "../assets/errlVariants";
import { getAssetById } from "../assets/registry";

/**
 * VariantSwitcher
 * 
 * Appears after placing a variant group asset to allow switching between variants.
 * Shows left/right arrows and current variant number.
 */
export const VariantSwitcher: React.FC<{ entityId: string }> = ({ entityId }) => {
  const { scene, updateEntity } = useSceneStore();
  const entity = scene.entities.find((e) => e.id === entityId);
  
  if (!entity) return null;
  
  const group = getVariantGroupForAsset(entity.assetId);
  if (!group) return null;
  
  const currentIndex = getVariantIndex(entity.assetId) ?? 0;
  const nextVariantId = getNextVariant(entity.assetId);
  const prevVariantId = getPreviousVariant(entity.assetId);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextVariantId) {
      const nextAsset = getAssetById(nextVariantId);
      if (nextAsset) {
        updateEntity(entityId, {
          assetId: nextAsset.id,
          metadata: {
            ...entity.metadata,
            variantIndex: currentIndex + 1,
          },
        });
      }
    }
  };
  
  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prevVariantId) {
      const prevAsset = getAssetById(prevVariantId);
      if (prevAsset) {
        updateEntity(entityId, {
          assetId: prevAsset.id,
          metadata: {
            ...entity.metadata,
            variantIndex: currentIndex - 1,
          },
        });
      }
    }
  };
  
  return (
    <div className="variant-switcher" onClick={(e) => e.stopPropagation()}>
      <button
        className="variant-switcher-arrow"
        onClick={handlePrevious}
        disabled={!prevVariantId}
        title="Previous variant"
      >
        ←
      </button>
      <span className="variant-switcher-count">
        {currentIndex + 1} / {group.variantCount}
      </span>
      <button
        className="variant-switcher-arrow"
        onClick={handleNext}
        disabled={!nextVariantId}
        title="Next variant"
      >
        →
      </button>
    </div>
  );
};

