import React from 'react';
import { ChevronDown, ChevronRight, Grid, Plus, Eye, Minus } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';
import { createColor, toHex, hexToColor } from '../../../utils/helpers';
import { SectionId } from '../types';

interface FillSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<SectionId>>>;
}

export const FillSection: React.FC<FillSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush,
  setExpandedSections
}) => {
  const hasFill = ('fill' in node) && (node as any).fill;

  const handleClick = () => {
    if (!hasFill) {
      onStateChange((p: DesignState) => ({ 
        ...p, 
        nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: createColor(255,255,255,1) } as any } 
      }));
      onHistoryPush(state);
      // Auto-expand fill section when adding it
      if (!expanded) {
        setExpandedSections(prev => new Set([...prev, 'fill']));
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
          <span className="text-[11px] font-medium text-gray-300">Fill</span>
          {expanded && hasFill ? (
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
              if (!hasFill) {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: createColor(255,255,255,1) } as any } 
                }));
                onHistoryPush(state);
              }
            }}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Add fill"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {expanded && hasFill && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          {/* Fill Type Selector */}
          <div className="flex gap-1 mb-1">
            <button 
              onClick={() => {
                if ((node as any).backgroundGradient) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundGradient: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`flex-1 px-2 py-1 rounded text-[10px] ${!(node as any).backgroundGradient ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Solid
            </button>
            <button 
              onClick={() => {
                if (!(node as any).backgroundGradient) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundGradient: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`flex-1 px-2 py-1 rounded text-[10px] ${(node as any).backgroundGradient ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Gradient
            </button>
          </div>
          
          {/* Solid Color */}
          {!(node as any).backgroundGradient && hasFill && (
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                value={toHex((node as any).fill || {r:0,g:0,b:0,a:1})}
                onChange={(e) => {
                  const c = hexToColor(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: c } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
              <div className="flex-1 bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
                <input 
                  className="bg-transparent w-full text-xs outline-none text-white uppercase" 
                  value={toHex((node as any).fill || {r:0,g:0,b:0,a:1})}
                  onChange={(e) => {
                    const c = hexToColor(e.target.value);
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: c } as any } 
                    }));
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
              </div>
              <div className="bg-gray-800/50 rounded px-2 py-1 w-12 flex items-center">
                <input 
                  className="bg-transparent w-full text-xs outline-none text-white text-right" 
                  value={Math.round(((node as any).fill?.a || 1) * 100)}
                  onChange={(e) => {
                    const val = Number(e.target.value) / 100;
                    const fill = (node as any).fill || {r:0,g:0,b:0,a:1};
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: {...fill, a: val} } as any } 
                    }));
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
                <span className="text-[10px] text-gray-500 ml-0.5">%</span>
              </div>
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
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], fill: undefined } as any } 
                    }));
                    onHistoryPush(state);
                  }}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                  title="Remove fill"
                >
                  <Minus size={14} />
                </button>
              </div>
            </div>
          )}
          
          {/* Gradient */}
          {(node as any).backgroundGradient && (
            <div className="space-y-1.5">
              <div className="bg-gray-800/50 rounded px-2 py-1">
                <input 
                  className="bg-transparent w-full text-xs outline-none text-white" 
                  placeholder="linear-gradient(90deg, #3b82f6, #8b5cf6)"
                  value={(node as any).backgroundGradient || ''}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundGradient: e.target.value } as any } 
                    }));
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: '→', value: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' },
                  { label: '↓', value: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' },
                  { label: '↘', value: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
                ].map(preset => (
                  <button 
                    key={preset.value}
                    onClick={() => {
                      onStateChange((p: DesignState) => ({ 
                        ...p, 
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundGradient: preset.value } as any } 
                      }));
                      onHistoryPush(state);
                    }}
                    className={`px-2 py-1 rounded text-[10px] ${(node as any).backgroundGradient === preset.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

