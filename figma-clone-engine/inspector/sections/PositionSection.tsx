import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DesignState, FrameNode, SceneNode } from '../../../types';
import { SectionId } from '../types';

interface PositionSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const PositionSection: React.FC<PositionSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush
}) => {
  return (
    <div className="border-b border-gray-700/50">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left transition-all"
      >
        <span className="text-[11px] font-medium text-gray-300">Position</span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500 transition-transform" />
        ) : (
          <ChevronRight size={14} className="text-gray-500 transition-transform" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-4">X</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={Math.round(node.x)}
                disabled={!!(node.parent && (state.nodes[node.parent] as FrameNode)?.layoutMode !== 'NONE')}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], x: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-4">Y</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={Math.round(node.y)}
                disabled={!!(node.parent && (state.nodes[node.parent] as FrameNode)?.layoutMode !== 'NONE')}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], y: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-12">Rotation</span>
            <input 
              className="bg-transparent w-full text-xs outline-none text-white" 
              value={Math.round(node.rotation)}
              onChange={(e) => {
                const val = Number(e.target.value);
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], rotation: val } as any } 
                }));
              }}
              onBlur={() => onHistoryPush(state)}
            />
            <span className="text-[10px] text-gray-500">°</span>
          </div>
        </div>
      )}
    </div>
  );
};

