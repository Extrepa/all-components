import React from 'react';
import { ChevronDown, ChevronRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, Space } from 'lucide-react';
import { DesignState, FrameNode, SceneNode } from '../../../types';

interface LayoutSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
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
        <span className="text-[11px] font-medium text-gray-300">Layout</span>
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
              <span className="text-[10px] text-gray-500 w-4">W</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={Math.round((node as any).width || 0)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], width: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-4">H</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={Math.round((node as any).height || 0)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], height: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
          </div>
          {(node.type === 'FRAME' || node.type === 'COMPONENT') && (() => {
            const frame = node as FrameNode;
            return (
              <>
                {frame.layoutMode !== 'NONE' && (
                  <>
                    {/* Alignment Controls */}
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-[10px] text-gray-500 mb-1">Alignment</div>
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], alignItems: 'start' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.alignItems === 'start' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Align Start"
                        >
                          <AlignVerticalJustifyStart size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], alignItems: 'center' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.alignItems === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Align Center"
                        >
                          <AlignVerticalJustifyCenter size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], alignItems: 'end' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.alignItems === 'end' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Align End"
                        >
                          <AlignVerticalJustifyEnd size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], alignItems: 'stretch' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.alignItems === 'stretch' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Stretch"
                        >
                          <AlignVerticalJustifyCenter size={14} className="rotate-90" />
                        </button>
                      </div>
                    </div>
                    {/* Justification Controls */}
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <div className="text-[10px] text-gray-500 mb-1">Justify</div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], justifyContent: 'start' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.justifyContent === 'start' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Justify Start"
                        >
                          <AlignHorizontalJustifyStart size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], justifyContent: 'center' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.justifyContent === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Justify Center"
                        >
                          <AlignHorizontalJustifyCenter size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], justifyContent: 'end' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded ${frame.justifyContent === 'end' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Justify End"
                        >
                          <AlignHorizontalJustifyEnd size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onStateChange((p: DesignState) => ({ 
                              ...p, 
                              nodes: { ...p.nodes, [id]: { ...p.nodes[id], justifyContent: 'space-between' } as any } 
                            }));
                            onHistoryPush(state);
                          }}
                          className={`p-1.5 rounded col-span-3 ${frame.justifyContent === 'space-between' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          title="Space Between"
                        >
                          <Space size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 w-8">Gap</span>
                        <input 
                          className="bg-transparent w-full text-xs outline-none text-white" 
                          value={frame.itemSpacing}
                          onChange={(e) => onStateChange((p: DesignState) => ({ 
                            ...p, 
                            nodes: { ...p.nodes, [id]: { ...p.nodes[id], itemSpacing: Number(e.target.value) } as any } 
                          }))}
                          onBlur={() => onHistoryPush(state)}
                        />
                      </div>
                      <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 w-8">Pad</span>
                        <input 
                          className="bg-transparent w-full text-xs outline-none text-white" 
                          value={frame.padding}
                          onChange={(e) => onStateChange((p: DesignState) => ({ 
                            ...p, 
                            nodes: { ...p.nodes, [id]: { ...p.nodes[id], padding: Number(e.target.value) } as any } 
                          }))}
                          onBlur={() => onHistoryPush(state)}
                        />
                      </div>
                    </div>
                  </>
                )}
                {/* Frame-specific controls */}
                <div className="space-y-1.5 pt-1 border-t border-gray-700/50">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={frame.clipContent || false}
                      onChange={(e) => {
                        onStateChange((p: DesignState) => ({
                          ...p,
                          nodes: { ...p.nodes, [id]: { ...p.nodes[id], clipContent: e.target.checked } as any }
                        }));
                        onHistoryPush(state);
                      }}
                      className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500"
                    />
                    <span>Clip content</span>
                  </label>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Overflow</div>
                    <select
                      className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
                      value={frame.overflow || 'visible'}
                      onChange={(e) => {
                        onStateChange((p: DesignState) => ({
                          ...p,
                          nodes: { ...p.nodes, [id]: { ...p.nodes[id], overflow: e.target.value } as any }
                        }));
                        onHistoryPush(state);
                      }}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="scroll">Scroll</option>
                    </select>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

