import React from 'react';
import { DesignState, SceneNode } from '../../../types';

interface InstanceSectionProps {
  node: SceneNode;
  state: DesignState;
}

export const InstanceSection: React.FC<InstanceSectionProps> = ({ node, state }) => {
  const instance = node as any;
  const masterId = instance.masterComponentId;
  const master = masterId ? state.nodes[masterId] : null;

  return (
    <div className="px-2 py-2 mb-2 bg-gray-800/30 rounded space-y-2">
      <div className="text-[10px] text-gray-500 mb-1">Instance</div>
      {master && (
        <div className="text-xs text-gray-300">
          Master: <span className="text-blue-400">{master.name}</span>
        </div>
      )}
      <div className="pt-1 border-t border-gray-700/50 space-y-1">
        <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
          Reset overrides
        </button>
        <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
          Detach instance
        </button>
        <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
          Swap instance
        </button>
      </div>
      {/* Overrides Panel */}
      {instance.overrides && Object.keys(instance.overrides).length > 0 && (
        <div className="pt-1 border-t border-gray-700/50">
          <div className="text-[10px] text-gray-500 mb-1">Overrides</div>
          {Object.entries(instance.overrides).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-400 mb-1">
              {key}: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

