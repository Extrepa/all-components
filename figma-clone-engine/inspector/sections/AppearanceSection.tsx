import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Eye, Droplet } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';

interface AppearanceSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush
}) => {
  const [blendModeOpen, setBlendModeOpen] = useState(false);
  const blendModeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blendModeRef.current && !blendModeRef.current.contains(event.target as Node)) {
        setBlendModeOpen(false);
      }
    };

    if (blendModeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [blendModeOpen]);

  const blendModes = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'exclusion', label: 'Exclusion' },
  ];

  const currentBlendMode = (node as any).blendMode || 'normal';
  const currentBlendModeLabel = blendModes.find(m => m.value === currentBlendMode)?.label || 'Normal';

  return (
    <div className="border-b border-gray-700/50">
      <div className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30">
        <button 
          onClick={onToggle} 
          className="flex-1 flex items-center justify-between text-left transition-all"
        >
          <span className="text-[11px] font-medium text-gray-300">Appearance</span>
          {expanded ? (
            <ChevronDown size={14} className="text-gray-500 transition-transform" />
          ) : (
            <ChevronRight size={14} className="text-gray-500 transition-transform" />
          )}
        </button>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Toggle visibility"
            onClick={(e) => {
              e.stopPropagation();
              onStateChange((p: DesignState) => ({
                ...p,
                nodes: { ...p.nodes, [id]: { ...p.nodes[id], visible: !(p.nodes[id] as any).visible } as any }
              }));
            }}
          >
            <Eye size={14} className={node.visible ? '' : 'opacity-50'} />
          </button>
          <div className="relative" ref={blendModeRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBlendModeOpen(!blendModeOpen);
              }}
              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Blend mode"
            >
              <Droplet size={14} />
            </button>
            {blendModeOpen && (
              <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1 z-50 max-h-[300px] overflow-y-auto">
                {blendModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => {
                      onStateChange((p: DesignState) => ({
                        ...p,
                        nodes: { ...p.nodes, [id]: { ...p.nodes[id], blendMode: mode.value } as any }
                      }));
                      onHistoryPush(state);
                      setBlendModeOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left ${
                      currentBlendMode === mode.value
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-2 pb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-16">Opacity</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="1" 
              className="flex-1"
              value={((node as any).opacity !== undefined ? (node as any).opacity : 1) * 100}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], opacity: val } as any } 
                }));
              }}
              onMouseUp={() => onHistoryPush(state)}
            />
            <span className="text-[10px] text-gray-400 w-10 text-right">
              {Math.round(((node as any).opacity !== undefined ? (node as any).opacity : 1) * 100)}%
            </span>
          </div>
          <div className="bg-gray-800/50 rounded px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-gray-500 w-16">Radius</span>
            <input 
              className="bg-transparent w-full text-xs outline-none text-white" 
              value={(node as any).cornerRadius || 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                onStateChange((p: DesignState) => ({ 
                  ...p, 
                  nodes: { ...p.nodes, [id]: { ...p.nodes[id], cornerRadius: val } as any } 
                }));
              }}
              onBlur={() => onHistoryPush(state)}
            />
            {/* Unlink corners icon - four separate corner controls */}
            <button
              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Unlink corners"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8" cy="8" r="1" />
                <circle cx="16" cy="8" r="1" />
                <circle cx="8" cy="16" r="1" />
                <circle cx="16" cy="16" r="1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

