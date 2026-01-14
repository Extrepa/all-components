import React from 'react';
import { Edit, Component, Layers, Zap } from 'lucide-react';

export const VectorControls: React.FC = () => {
  return (
    <div className="px-2 py-2 mb-2 bg-gray-800/30 rounded flex items-center gap-1">
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Edit path">
        <Edit size={14} />
      </button>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Convert to shape">
        <Component size={14} />
      </button>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Flatten path">
        <Layers size={14} />
      </button>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Simplify path">
        <Zap size={14} />
      </button>
    </div>
  );
};

