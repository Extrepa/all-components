import React, { useState, useRef, useEffect } from 'react';
import { Code, Grid, MoreVertical, Image as ImageIcon, Merge, MinusCircle, X, Scissors, Layers } from 'lucide-react';
import { unionShapes, subtractShapes, intersectShapes, excludeShapes, flattenShapes, useAsMask } from '../../../utils/booleanOperations';

interface FrameControlsProps {
  node: any;
  onStateChange?: (updater: any) => void;
  state?: any;
  onHistoryPush?: (state: any) => void;
}

export const FrameControls: React.FC<FrameControlsProps> = ({ node, onStateChange, state, onHistoryPush }) => {
  const [ellipsisOpen, setEllipsisOpen] = useState(false);
  const ellipsisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ellipsisRef.current && !ellipsisRef.current.contains(event.target as Node)) {
        setEllipsisOpen(false);
      }
    };

    if (ellipsisOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ellipsisOpen]);

  const handleBooleanOperation = (operation: string) => {
    if (!onStateChange || !state) {
      setEllipsisOpen(false);
      return;
    }

    // Boolean operations work on multiple selected nodes
    if (operation === 'mask') {
      // Use as mask - mark node as clipping mask
      const newState = useAsMask(state, node.id, state.selection.filter((id: string) => id !== node.id));
      onStateChange(() => newState);
    } else if (state.selection.length >= 2 && state.selection.includes(node.id)) {
      // Apply boolean operation to selected nodes
      let newState;
      switch (operation) {
        case 'union':
          newState = unionShapes(state, state.selection);
          break;
        case 'subtract':
          newState = subtractShapes(state, state.selection);
          break;
        case 'intersect':
          newState = intersectShapes(state, state.selection);
          break;
        case 'exclude':
          newState = excludeShapes(state, state.selection);
          break;
        case 'flatten':
          newState = flattenShapes(state, state.selection);
          break;
        default:
          setEllipsisOpen(false);
          return;
      }
      onStateChange(() => newState);
    } else {
      // Mark node with boolean operation metadata for future use
      onStateChange((p: any) => {
        const updatedNode = { ...p.nodes[node.id] };
        (updatedNode as any).booleanOperation = operation;
        return {
          ...p,
          nodes: { ...p.nodes, [node.id]: updatedNode }
        };
      });
    }
    
    if (onHistoryPush) {
      onHistoryPush(state);
    }
    
    setEllipsisOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Code Icon */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Code"
      >
        <Code size={14} />
      </button>

      {/* Grid Icon (Components/Assets) */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Components"
      >
        <Grid size={14} />
      </button>

      {/* Ellipsis Menu */}
      <div className="relative" ref={ellipsisRef}>
        <button
          onClick={() => setEllipsisOpen(!ellipsisOpen)}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
          title="More options"
        >
          <MoreVertical size={14} />
        </button>
        {ellipsisOpen && (
          <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
            <button
              onClick={() => handleBooleanOperation('mask')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <ImageIcon size={14} />
              <span>Use as mask</span>
              <span className="ml-auto text-[10px] text-gray-500">^⌘M</span>
            </button>
            <div className="border-t border-gray-700/50 my-1" />
            <button
              onClick={() => handleBooleanOperation('union')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <Merge size={14} />
              <span>Union</span>
              <span className="ml-auto text-[10px] text-gray-500">⌥⇧U</span>
            </button>
            <button
              onClick={() => handleBooleanOperation('subtract')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <MinusCircle size={14} />
              <span>Subtract</span>
              <span className="ml-auto text-[10px] text-gray-500">⌥⇧S</span>
            </button>
            <button
              onClick={() => handleBooleanOperation('intersect')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <X size={14} />
              <span>Intersect</span>
              <span className="ml-auto text-[10px] text-gray-500">⌥⇧I</span>
            </button>
            <button
              onClick={() => handleBooleanOperation('exclude')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <Scissors size={14} />
              <span>Exclude</span>
              <span className="ml-auto text-[10px] text-gray-500">⌥⇧E</span>
            </button>
            <button
              onClick={() => handleBooleanOperation('flatten')}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <Layers size={14} />
              <span>Flatten</span>
              <span className="ml-auto text-[10px] text-gray-500">⌥⇧F</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

