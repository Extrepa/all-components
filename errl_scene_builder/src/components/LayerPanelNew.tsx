
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Eye, EyeOff, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useSceneStore } from '../scene/store';

export const LayerPanel: React.FC = () => {
  const scene = useSceneStore((s) => s.scene);
  const selectedEntityIds = useSceneStore((s) => s.selectedEntityIds);
  const setSelectedEntities = useSceneStore((s) => s.setSelectedEntities);
  const updateEntity = useSceneStore((s) => s.updateEntity);
  const removeEntity = useSceneStore((s) => s.removeEntity);
  const reorderEntity = useSceneStore((s) => s.reorderEntity);

  // Reverse layers for display so top layer is at top of list
  // The store keeps them in Z-order (0 is bottom), so we reverse for UI
  const displayLayers = [...scene.layers].reverse();

  const handleSelect = (id: string, multi: boolean) => {
    if (multi) {
        if (selectedEntityIds.includes(id)) {
            setSelectedEntities(selectedEntityIds.filter(sid => sid !== id));
        } else {
            setSelectedEntities([...selectedEntityIds, id]);
        }
    } else {
        setSelectedEntities([id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1 min-h-[150px] max-h-[400px]">
        {displayLayers.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-xs">
            No layers yet.<br/>Drag assets from the left!
          </div>
        )}
        
        {displayLayers.map((layer) => {
            const isSelected = selectedEntityIds.includes(layer.id);
            return (
          <div
            key={layer.id}
            onClick={(e) => handleSelect(layer.id, e.shiftKey || e.metaKey)}
            className={`
              group flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer border select-none
              ${isSelected 
                ? 'bg-[#5be0ff]/10 border-[#5be0ff]/30 text-white' 
                : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateEntity(layer.id, { visible: !layer.visible });
              }}
              className="p-1 hover:text-white transition-colors opacity-50 hover:opacity-100"
            >
              {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
            </button>
            
            {/* Thumbnail */}
            <div className="w-6 h-6 bg-black/40 rounded flex items-center justify-center overflow-hidden">
                <img src={layer.assetId} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>

            <span className="flex-1 truncate text-xs font-medium">{layer.name || layer.id.slice(0, 8)}</span>
            
            <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
              <button
                onClick={(e) => { e.stopPropagation(); reorderEntity(layer.id, 'up'); }}
                className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                title="Bring Forward"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); reorderEntity(layer.id, 'down'); }}
                className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                title="Send Backward"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeEntity(layer.id); }}
                className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};
