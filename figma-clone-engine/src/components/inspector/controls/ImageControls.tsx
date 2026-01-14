import React from 'react';
import { Upload } from 'lucide-react';
import { DesignState, SceneNode } from '../../../types';

interface ImageControlsProps {
  node: SceneNode;
  id: string;
  state: DesignState;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  node,
  id,
  state,
  onStateChange,
  onHistoryPush
}) => {
  return (
    <div className="px-2 py-2 mb-2 bg-gray-800/30 rounded space-y-2">
      <button className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">
        <Upload size={14} />
        Replace image
      </button>
      <div>
        <div className="text-[10px] text-gray-500 mb-1">Fill Mode</div>
        <select
          className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none"
          value={(node as any).imageFillMode || 'fill'}
          onChange={(e) => {
            onStateChange((p: DesignState) => ({
              ...p,
              nodes: { ...p.nodes, [id]: { ...p.nodes[id], imageFillMode: e.target.value } as any }
            }));
            onHistoryPush(state);
          }}
        >
          <option value="fill">Fill</option>
          <option value="fit">Fit</option>
          <option value="crop">Crop</option>
          <option value="tile">Tile</option>
        </select>
      </div>
    </div>
  );
};

