import React from 'react';
import { ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight, AlignHorizontalJustifyCenter } from 'lucide-react';
import { DesignState, TextNode, SceneNode } from '../../../types';

interface TypographySectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush
}) => {
  if (node.type !== 'TEXT') return null;
  
  const textNode = node as TextNode;

  return (
    <div className="border-b border-gray-700/50">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left transition-all"
      >
        <span className="text-[11px] font-medium text-gray-300">Typography</span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500 transition-transform" />
        ) : (
          <ChevronRight size={14} className="text-gray-500 transition-transform" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-16">Font</span>
            <select 
              className="bg-transparent w-full text-xs outline-none text-white border-none"
              value={textNode.fontFamily || 'Inter, sans-serif'}
              onChange={(e) => {
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], fontFamily: e.target.value } as any } 
                }));
                onHistoryPush(state);
              }}
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-8">Size</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={textNode.fontSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], fontSize: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-8">Weight</span>
              <select 
                className="bg-transparent w-full text-xs outline-none text-white border-none"
                value={textNode.fontWeight || 'normal'}
                onChange={(e) => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], fontWeight: e.target.value } as any } 
                  }));
                  onHistoryPush(state);
                }}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-12">Line H</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={textNode.lineHeight || textNode.fontSize * 1.2}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], lineHeight: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
            <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-12">Letter</span>
              <input 
                className="bg-transparent w-full text-xs outline-none text-white" 
                value={textNode.letterSpacing || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], letterSpacing: val } as any } 
                  }));
                }}
                onBlur={() => onHistoryPush(state)}
              />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-16">Align</span>
            <div className="flex gap-1 flex-1">
              <button
                onClick={() => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], textAlign: 'left' } as any } 
                  }));
                  onHistoryPush(state);
                }}
                className={`flex-1 p-1 rounded ${textNode.textAlign === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Align Left"
              >
                <AlignLeft size={12} />
              </button>
              <button
                onClick={() => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], textAlign: 'center' } as any } 
                  }));
                  onHistoryPush(state);
                }}
                className={`flex-1 p-1 rounded ${textNode.textAlign === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Align Center"
              >
                <AlignCenter size={12} />
              </button>
              <button
                onClick={() => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], textAlign: 'right' } as any } 
                  }));
                  onHistoryPush(state);
                }}
                className={`flex-1 p-1 rounded ${textNode.textAlign === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Align Right"
              >
                <AlignRight size={12} />
              </button>
              <button
                onClick={() => {
                  onStateChange((p: DesignState) => ({ 
                    ...p, 
                    nodes: { ...p.nodes, [id]: { ...p.nodes[id], textAlign: 'justify' } as any } 
                  }));
                  onHistoryPush(state);
                }}
                className={`flex-1 p-1 rounded ${textNode.textAlign === 'justify' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Justify"
              >
                <AlignHorizontalJustifyCenter size={12} />
              </button>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-16">Deco</span>
            <div className="flex gap-1 flex-1">
              {(['none', 'underline', 'line-through'] as const).map(dec => (
                <button 
                  key={dec}
                  onClick={() => {
                    onStateChange((p: DesignState) => ({ 
                      ...p, 
                      nodes: { ...p.nodes, [id]: { ...p.nodes[id], textDecoration: dec } as any } 
                    }));
                    onHistoryPush(state);
                  }}
                  className={`flex-1 px-1 py-0.5 rounded text-[10px] ${(textNode.textDecoration || 'none') === dec ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {dec === 'none' ? '—' : dec === 'underline' ? 'U' : 'S'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

