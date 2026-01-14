
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, Lock, Unlock, GripVertical } from 'lucide-react';
import { useSceneStore } from '../scene/store';
import { getAssetById } from '../assets/registry';
import { SceneEntity } from '../scene/types';

export const LayerPanel: React.FC = () => {
  const scene = useSceneStore((s) => s.scene);
  const selectedEntityIds = useSceneStore((s) => s.selectedEntityIds);
  const setSelectedEntities = useSceneStore((s) => s.setSelectedEntities);
  const updateEntity = useSceneStore((s) => s.updateEntity);
  const updateLayer = useSceneStore((s) => s.updateLayer);
  const removeEntity = useSceneStore((s) => s.removeEntity);
  const reorderEntityInLayer = useSceneStore((s) => s.reorderEntityInLayer);

  const handleSelectEntity = (entityId: string, multi: boolean) => {
    if (multi) {
      if (selectedEntityIds.includes(entityId)) {
        setSelectedEntities(selectedEntityIds.filter((id) => id !== entityId));
      } else {
        setSelectedEntities([...selectedEntityIds, entityId]);
      }
    } else {
      setSelectedEntities([entityId]);
    }
  };

  // Sort layers by zIndex (top to bottom in panel = highest to lowest zIndex)
  const sortedLayers = [...scene.layers].sort((a, b) => b.zIndex - a.zIndex);

  // Group entities by layer
  const entitiesByLayer = React.useMemo(() => {
    const groups: Record<string, SceneEntity[]> = {};
    scene.entities.forEach((entity) => {
      if (!groups[entity.layerId]) {
        groups[entity.layerId] = [];
      }
      groups[entity.layerId].push(entity);
    });
    // Sort entities within each layer (top to bottom = highest to lowest in layer)
    Object.keys(groups).forEach((layerId) => {
      groups[layerId].sort((a, b) => {
        const layer = scene.layers.find((l) => l.id === layerId);
        if (!layer) return 0;
        // Entities are rendered in order, so we maintain their order
        return 0;
      });
    });
    return groups;
  }, [scene.entities, scene.layers]);

  const renderEntity = (entity: SceneEntity, layerId: string) => {
    const asset = getAssetById(entity.assetId);
    const isSelected = selectedEntityIds.includes(entity.id);
    const entitiesInLayer = entitiesByLayer[layerId] || [];
    const entityIndex = entitiesInLayer.findIndex((e) => e.id === entity.id);
    const canMoveUp = entityIndex < entitiesInLayer.length - 1;
    const canMoveDown = entityIndex > 0;

    return (
      <div
        key={entity.id}
        onClick={(e) => handleSelectEntity(entity.id, e.shiftKey || e.metaKey || e.ctrlKey)}
        className={`
          layer-entity-row
          flex items-center gap-1 px-1 py-0.5 text-xs select-none
          ${isSelected 
            ? 'bg-[#5be0ff]/15 text-white cursor-pointer' 
            : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 cursor-grab active:cursor-grabbing'}
        `}
        data-entity-id={entity.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', entity.id);
          (e.currentTarget as HTMLElement).style.opacity = '0.5';
        }}
        onDragEnd={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
      >
        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateEntity(entity.id, { style: { ...entity.style, opacity: entity.style.opacity === 0 ? 1 : 0 } });
          }}
          className="layer-control-icon"
          title={entity.style.opacity !== 0 ? "Hide" : "Show"}
        >
          {entity.style.opacity !== 0 ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
          )}
        </button>

        {/* Lock toggle (placeholder - entities don't have lock yet) */}
        <div className="layer-control-icon opacity-0 pointer-events-none">
          <Lock className="w-3.5 h-3.5" />
        </div>
        
        {/* Thumbnail */}
        <div className="layer-thumbnail">
          {asset ? (
            <img 
              src={asset.filePath} 
              alt={asset.label} 
              className="w-full h-full object-contain" 
              onError={(e) => (e.currentTarget.style.display = 'none')} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600">
              {entity.assetId.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Layer name */}
        <span className="flex-1 truncate min-w-0">{asset?.label || entity.assetId}</span>
        
        {/* Drag handle - visual indicator only, row itself is draggable */}
        <div
          className={`layer-drag-handle ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity cursor-grab`}
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-2.5 h-2.5 text-zinc-500" />
        </div>
        
        {/* Delete button (only on hover/select) */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            removeEntity(entity.id); 
          }}
          className={`layer-delete-btn ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity ml-auto`}
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const LayerRow: React.FC<{ layer: typeof scene.layers[0] }> = ({ layer }) => {
    if (!layer) return null;
    const entities = entitiesByLayer[layer.id] || [];
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(layer.name);

    return (
      <div key={layer.id} className="layer-group">
        {/* Layer header */}
        <div className="layer-header">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { visible: !layer.visible });
            }}
            className="layer-control-icon"
            title={layer.visible ? "Hide layer" : "Show layer"}
          >
            {layer.visible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { locked: !layer.locked });
            }}
            className="layer-control-icon"
            title={layer.locked ? "Unlock layer" : "Lock layer"}
          >
            {layer.locked ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Layer name - editable */}
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => {
                updateLayer(layer.id, { name: editName });
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateLayer(layer.id, { name: editName });
                  setIsEditingName(false);
                } else if (e.key === 'Escape') {
                  setEditName(layer.name);
                  setIsEditingName(false);
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-zinc-300 px-1"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 truncate text-xs font-medium text-zinc-300 cursor-text"
              onDoubleClick={() => setIsEditingName(true)}
            >
              {layer.name}
            </span>
          )}
        </div>

        {/* Entities in layer */}
        {entities.length > 0 && (
          <div 
            className="layer-entities"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedEntityId = e.dataTransfer.getData('text/plain');
              if (!draggedEntityId) return;
              
              const dropTarget = (e.target as HTMLElement).closest('.layer-entity-row');
              if (dropTarget) {
                const targetEntityId = dropTarget.getAttribute('data-entity-id');
                if (targetEntityId && targetEntityId !== draggedEntityId) {
                  // Determine direction based on position
                  const draggedIndex = entities.findIndex(e => e.id === draggedEntityId);
                  const targetIndex = entities.findIndex(e => e.id === targetEntityId);
                  if (draggedIndex !== -1 && targetIndex !== -1) {
                    const direction = draggedIndex < targetIndex ? 'down' : 'up';
                    const steps = Math.abs(draggedIndex - targetIndex);
                    // Move step by step to the target position
                    for (let i = 0; i < steps; i++) {
                      reorderEntityInLayer(draggedEntityId, direction);
                    }
                  }
                }
              } else {
                // Dropped on container, move to end
                const draggedIndex = entities.findIndex(e => e.id === draggedEntityId);
                if (draggedIndex >= 0 && draggedIndex < entities.length - 1) {
                  const steps = entities.length - 1 - draggedIndex;
                  for (let i = 0; i < steps; i++) {
                    reorderEntityInLayer(draggedEntityId, 'down');
                  }
                }
              }
            }}
          >
            {entities.map((entity) => renderEntity(entity, layer.id))}
          </div>
        )}
      </div>
    );
  };

  const renderLayer = (layer: typeof scene.layers[0]) => {
    return <LayerRow key={layer.id} layer={layer} />;
  };

  return (
    <div className="layer-panel">
      {sortedLayers.length === 0 ? (
        <div className="layer-panel-empty">
          <div className="text-zinc-600 text-xs text-center py-8">
            No layers yet.<br/>Drag assets from the left!
          </div>
        </div>
      ) : (
        <div className="layer-panel-list">
          {sortedLayers.map(renderLayer)}
        </div>
      )}
    </div>
  );
};
