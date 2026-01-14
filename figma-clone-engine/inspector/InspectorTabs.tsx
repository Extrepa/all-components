import React from 'react';
import { InspectorTabsProps } from './types';

export const InspectorTabs: React.FC<InspectorTabsProps> = ({
  inspectorTab,
  setInspectorTab,
  state
}) => {
  if (state.mode !== 'DESIGN') {
    return null;
  }

  return (
    <div className="flex items-center border-b border-gray-700/50">
      <div className="flex flex-1">
        <button
          onClick={() => setInspectorTab('design')}
          className={`flex-1 px-3 py-2 text-xs font-medium text-center border-b-2 transition-colors ${
            inspectorTab === 'design'
              ? 'text-white border-blue-500 bg-gray-800/30'
              : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-700/30'
          }`}
        >
          Design
        </button>
        <button
          onClick={() => setInspectorTab('prototype')}
          className={`flex-1 px-3 py-2 text-xs font-medium text-center border-b-2 transition-colors ${
            inspectorTab === 'prototype'
              ? 'text-white border-blue-500 bg-gray-800/30'
              : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-700/30'
          }`}
        >
          Prototype
        </button>
      </div>
    </div>
  );
};

