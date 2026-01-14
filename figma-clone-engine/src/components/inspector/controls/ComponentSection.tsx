import React from 'react';
import { SceneNode } from '../../../types';

interface ComponentSectionProps {
  node: SceneNode;
}

export const ComponentSection: React.FC<ComponentSectionProps> = ({ node }) => {
  return (
    <div className="px-2 py-2 mb-2 bg-gray-800/30 rounded space-y-2">
      <div className="text-[10px] text-gray-500 mb-1">Component</div>
      <div className="text-xs text-gray-300">{node.name}</div>
      <div className="text-[10px] text-gray-500">Description</div>
      <textarea
        className="w-full bg-gray-800/50 rounded px-2 py-1 text-xs outline-none text-white border-none resize-none"
        rows={2}
        placeholder="Add a description..."
      />
      <div className="pt-1 border-t border-gray-700/50">
        <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
          Create variant
        </button>
      </div>
    </div>
  );
};

