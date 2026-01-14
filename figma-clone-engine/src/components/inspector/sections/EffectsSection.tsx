import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Zap, Eye, EyeOff, Grid, Plus, Minus } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';
import { SectionId } from '../types';

interface EffectsSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<SectionId>>>;
}

export const EffectsSection: React.FC<EffectsSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush,
  setExpandedSections
}) => {
  const [effectType, setEffectType] = useState<string>('drop-shadow');
  
  // Determine current effect type from node
  useEffect(() => {
    if ((node as any).boxShadow) setEffectType('drop-shadow');
    else if ((node as any).innerShadow) setEffectType('inner-shadow');
    else if ((node as any).layerBlur) setEffectType('layer-blur');
    else if ((node as any).backgroundBlur) setEffectType('background-blur');
  }, [node]);

  const hasEffect = (node as any).boxShadow || (node as any).innerShadow || (node as any).layerBlur || (node as any).backgroundBlur;

  const handleClick = () => {
    if (!hasEffect) {
      onStateChange((p: DesignState) => ({ 
        ...p, 
        nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', effectType: 'drop-shadow' } as any } 
      }));
      onHistoryPush(state);
      setEffectType('drop-shadow');
      // Auto-expand effects section when adding it
      if (!expanded) {
        setExpandedSections(prev => new Set([...prev, 'effects']));
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
          <span className="text-[11px] font-medium text-gray-300">Effects</span>
          {expanded && hasEffect ? (
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
              if (!hasEffect) {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', effectType: 'drop-shadow' } as any } 
                }));
                onHistoryPush(state);
                setEffectType('drop-shadow');
              }
            }}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Add effect"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      {expanded && hasEffect && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          {/* Effect Type Selector */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <button
              onClick={() => {
                setEffectType('drop-shadow');
                if (!(node as any).boxShadow) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', innerShadow: undefined, layerBlur: undefined, backgroundBlur: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`p-1.5 rounded text-[10px] flex items-center justify-center gap-1 ${effectType === 'drop-shadow' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <Zap size={12} />
              Drop Shadow
            </button>
            <button
              onClick={() => {
                setEffectType('inner-shadow');
                if (!(node as any).innerShadow) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], innerShadow: 'inset 0px 2px 4px rgba(0,0,0,0.1)', boxShadow: undefined, layerBlur: undefined, backgroundBlur: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`p-1.5 rounded text-[10px] flex items-center justify-center gap-1 ${effectType === 'inner-shadow' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <Eye size={12} />
              Inner Shadow
            </button>
            <button
              onClick={() => {
                setEffectType('layer-blur');
                if (!(node as any).layerBlur) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], layerBlur: 4, boxShadow: undefined, innerShadow: undefined, backgroundBlur: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`p-1.5 rounded text-[10px] flex items-center justify-center gap-1 ${effectType === 'layer-blur' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <EyeOff size={12} />
              Layer Blur
            </button>
            <button
              onClick={() => {
                setEffectType('background-blur');
                if (!(node as any).backgroundBlur) {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundBlur: 4, boxShadow: undefined, innerShadow: undefined, layerBlur: undefined } as any } 
                  }));
                  onHistoryPush(state);
                }
              }}
              className={`p-1.5 rounded text-[10px] flex items-center justify-center gap-1 ${effectType === 'background-blur' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <EyeOff size={12} />
              Background Blur
            </button>
          </div>

          {/* Dynamic Controls Based on Effect Type */}
          {effectType === 'drop-shadow' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: 'None', value: 'none' },
                  { label: 'Small', value: '0px 1px 2px rgba(0,0,0,0.05)' },
                  { label: 'Medium', value: '0px 4px 6px rgba(0,0,0,0.1)' },
                  { label: 'Large', value: '0px 10px 15px rgba(0,0,0,0.1)' },
                  { label: 'Glow', value: '0px 0px 20px rgba(59,130,246,0.5)' },
                ].map(preset => (
                  <button 
                    key={preset.value}
                    onClick={() => {
                      onStateChange((p: DesignState) => ({ 
                        ...p, 
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: preset.value === 'none' ? undefined : preset.value } as any } 
                      }));
                      onHistoryPush(state);
                    }}
                    className={`px-2 py-1 rounded text-[10px] ${(node as any).boxShadow === preset.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
                <input 
                  className="bg-transparent flex-1 text-xs outline-none text-white" 
                  placeholder="Custom shadow..."
                  value={(node as any).boxShadow || ''}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: e.target.value } as any } 
                    }));
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
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
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], boxShadow: undefined, innerShadow: undefined, layerBlur: undefined, backgroundBlur: undefined } as any } 
                      }));
                      onHistoryPush(state);
                    }}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                    title="Remove effect"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {effectType === 'inner-shadow' && (
            <div className="space-y-1.5">
              <div className="bg-gray-800/50 rounded px-2 py-1">
                <input 
                  className="bg-transparent w-full text-xs outline-none text-white" 
                  placeholder="inset 0px 2px 4px rgba(0,0,0,0.1)"
                  value={(node as any).innerShadow || ''}
                  onChange={(e) => {
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], innerShadow: e.target.value } as any } 
                    }));
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
              </div>
            </div>
          )}

          {(effectType === 'layer-blur' || effectType === 'background-blur') && (
            <div className="space-y-1.5">
              <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
                <span className="text-[10px] text-gray-500 w-12">Radius</span>
                <input 
                  className="bg-transparent w-full text-xs outline-none text-white" 
                  type="number"
                  value={(node as any).layerBlur || (node as any).backgroundBlur || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (effectType === 'layer-blur') {
                      onStateChange((p: DesignState) => ({ 
                        ...p, 
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], layerBlur: val } as any } 
                      }));
                    } else {
                      onStateChange((p: DesignState) => ({ 
                        ...p, 
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], backgroundBlur: val } as any } 
                      }));
                    }
                  }}
                  onBlur={() => onHistoryPush(state)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

