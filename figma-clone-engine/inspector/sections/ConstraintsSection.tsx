import React from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize2, RefreshCw, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';

interface ConstraintsSectionProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  expanded: boolean;
  onToggle: () => void;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const ConstraintsSection: React.FC<ConstraintsSectionProps> = ({
  node,
  id,
  state,
  expanded,
  onToggle,
  onStateChange,
  onHistoryPush
}) => {
  const constraints = (node as any).constraints || { horizontal: 'left', vertical: 'top' };

  return (
    <div className="border-b border-gray-700/50">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left transition-all"
      >
        <span className="text-[11px] font-medium text-gray-300">Constraints</span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500 transition-transform" />
        ) : (
          <ChevronRight size={14} className="text-gray-500 transition-transform" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 space-y-2">
          {/* Horizontal Constraints */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1">Horizontal</div>
            <div className="grid grid-cols-5 gap-1">
              {(['left', 'center', 'right', 'left-right', 'scale'] as const).map((constraint) => {
                const icons: Record<string, React.ReactNode> = {
                  'left': <ArrowLeft size={12} />,
                  'center': <AlignHorizontalJustifyCenter size={12} />,
                  'right': <ArrowRight size={12} />,
                  'left-right': <Maximize2 size={12} />,
                  'scale': <RefreshCw size={12} />
                };
                return (
                  <button
                    key={constraint}
                    onClick={() => {
                      onStateChange((p: DesignState) => ({
                        ...p,
                        nodes: {
                          ...p.nodes,
                          [id]: {
                            ...p.nodes[id],
                            constraints: {
                              ...constraints,
                              horizontal: constraint
                            }
                          } as any
                        }
                      }));
                      onHistoryPush(state);
                    }}
                    className={`p-1.5 rounded flex items-center justify-center ${
                      constraints.horizontal === constraint
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={constraint.charAt(0).toUpperCase() + constraint.slice(1).replace('-', ' ')}
                  >
                    {icons[constraint]}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Vertical Constraints */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1">Vertical</div>
            <div className="grid grid-cols-5 gap-1">
              {(['top', 'center', 'bottom', 'top-bottom', 'scale'] as const).map((constraint) => {
                const icons: Record<string, React.ReactNode> = {
                  'top': <ArrowUp size={12} />,
                  'center': <AlignVerticalJustifyCenter size={12} />,
                  'bottom': <ArrowDown size={12} />,
                  'top-bottom': <Maximize2 size={12} />,
                  'scale': <RefreshCw size={12} />
                };
                return (
                  <button
                    key={constraint}
                    onClick={() => {
                      onStateChange((p: DesignState) => ({
                        ...p,
                        nodes: {
                          ...p.nodes,
                          [id]: {
                            ...p.nodes[id],
                            constraints: {
                              ...constraints,
                              vertical: constraint
                            }
                          } as any
                        }
                      }));
                      onHistoryPush(state);
                    }}
                    className={`p-1.5 rounded flex items-center justify-center ${
                      constraints.vertical === constraint
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={constraint.charAt(0).toUpperCase() + constraint.slice(1).replace('-', ' ')}
                  >
                    {icons[constraint]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

