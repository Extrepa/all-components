import React from 'react';
import { ChevronDown, ChevronRight, Grid, Plus, Eye, Minus, Settings, AlignLeft } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';
import { createColor, toHex, hexToColor } from '../../../utils/helpers';
import { SectionId } from '../types';

interface StrokeSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<SectionId>>>;
}

export const StrokeSection: React.FC<StrokeSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush,
  setExpandedSections
}) => {
  const hasStroke = (node as any).borderWidth && (node as any).borderColor;

  const handleClick = () => {
    if (!hasStroke) {
      onStateChange((p: DesignState) => ({ 
        ...p, 
        nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderWidth: 1, borderColor: createColor(0,0,0,1), borderStyle: 'solid' } as any } 
      }));
      onHistoryPush(state);
      // Auto-expand stroke section when adding it
      if (!expanded) {
        setExpandedSections(prev => new Set([...prev, 'stroke']));
      }
    } else {
      onToggle();
    }
  };

  return (
    <div className="border-b border-gray-700/50">
      <div className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30">
        <button 
          onClick={handleClick}
          className="flex-1 flex items-center justify-between text-left transition-all"
        >
          <span className="text-[11px] font-medium text-gray-300">Stroke</span>
          {expanded && hasStroke ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronRight size={14} className="text-gray-500" />
          )}
        </button>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Styles"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!hasStroke) {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderWidth: 1, borderColor: createColor(0,0,0,1), borderStyle: 'solid' } as any } 
                }));
                onHistoryPush(state);
              }
            }}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Add stroke"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {expanded && hasStroke && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border border-gray-600"
              value={toHex((node as any).borderColor || {r:0,g:0,b:0,a:1})}
              onChange={(e) => {
                const c = hexToColor(e.target.value);
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderColor: c } as any } 
                }));
              }}
              onBlur={() => onHistoryPush(state)}
            />
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1 flex-1">
              <span className="text-[10px] text-gray-500 w-8">Width</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={typeof (node as any).borderWidth === 'number' ? (node as any).borderWidth : (node as any).borderWidth.top}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderWidth: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
            <select 
              className="bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
              value={(node as any).borderStyle || 'solid'}
              onChange={(e) => {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderStyle: e.target.value } as any } 
                }));
                onHistoryPush(state);
              }}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                title="Toggle visibility"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderWidth: undefined, borderColor: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                title="Remove stroke"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
          {/* Position Dropdown */}
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-12">Position</span>
            <select 
              className="bg-transparent flex-1 text-xs outline-none text-white border-none"
              value={(node as any).strokeAlign || 'outside'}
              onChange={(e) => {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], strokeAlign: e.target.value } as any } 
                }));
                onHistoryPush(state);
              }}
            >
              <option value="outside">Outside</option>
              <option value="inside">Inside</option>
              <option value="center">Center</option>
            </select>
          </div>
          {/* Weight with icons */}
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-12">Weight</span>
            <input 
              className="bg-transparent flex-1 text-xs outline-none text-white" 
              value={typeof (node as any).borderWidth === 'number' ? (node as any).borderWidth : (node as any).borderWidth?.top || 1}
              onChange={(e) => {
                const val = Number(e.target.value);
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], borderWidth: val } as any } 
                }));
              }}
              onBlur={() => onHistoryPush(state)}
            />
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                title="Settings"
              >
                <Settings size={14} />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                title="Alignment"
              >
                <AlignLeft size={14} />
              </button>
            </div>
          </div>
          {/* Vector-specific stroke controls */}
          {node.type === 'VECTOR' && (
            <>
              <div>
                <div className="text-[10px] text-gray-500 mb-1">Stroke Align</div>
                <select
                  className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
                  value={(node as any).strokeAlign || 'center'}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({
                      ...p,
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], strokeAlign: e.target.value } as any }
                    }));
                    onHistoryPush(state);
                  }}
                >
                  <option value="inside">Inside</option>
                  <option value="center">Center</option>
                  <option value="outside">Outside</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1">Stroke Cap</div>
                <select
                  className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
                  value={(node as any).strokeCap || 'round'}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({
                      ...p,
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], strokeCap: e.target.value } as any }
                    }));
                    onHistoryPush(state);
                  }}
                >
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1">Stroke Join</div>
                <select
                  className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
                  value={(node as any).strokeJoin || 'miter'}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({
                      ...p,
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], strokeJoin: e.target.value } as any }
                    }));
                    onHistoryPush(state);
                  }}
                >
                  <option value="miter">Miter</option>
                  <option value="round">Round</option>
                  <option value="bevel">Bevel</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

