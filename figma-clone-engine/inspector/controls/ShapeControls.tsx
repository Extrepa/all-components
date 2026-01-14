import React from 'react';
import { Layers, Component, Image, Merge, MinusCircle, X, Scissors, Edit } from 'lucide-react';

export const ShapeControls: React.FC = () => {
  return (
    <div className="px-2 py-2 mb-2 bg-gray-800/30 rounded flex items-center gap-1">
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Select matching layers">
        <Layers size={14} />
      </button>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Create component">
        <Component size={14} />
      </button>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Use as mask">
        <Image size={14} />
      </button>
      {/* Boolean Operations */}
      <div className="flex items-center gap-0.5 border-l border-gray-600 pl-1">
        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Union">
          <Merge size={14} />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Subtract">
          <MinusCircle size={14} />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Intersect">
          <X size={14} />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Exclude">
          <Scissors size={14} />
        </button>
      </div>
      <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Edit object">
        <Edit size={14} />
      </button>
    </div>
  );
};

