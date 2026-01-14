import React from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { SceneNode } from '../../types';

interface DevModeInspectorProps {
  node: SceneNode;
  generateCSS: (node: SceneNode) => string;
  generateReact: (node: SceneNode) => string;
}

export const DevModeInspector: React.FC<DevModeInspectorProps> = ({
  node,
  generateCSS,
  generateReact
}) => {
  return (
    <div className="space-y-3 pt-2">
      {/* Tabs: Inspect / Plugins */}
      <div className="flex border-b border-gray-700/50 px-2">
        <button className="px-3 py-2 text-xs font-medium text-white border-b-2 border-green-500">
          Inspect
        </button>
        <button className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-gray-300">
          Plugins
        </button>
      </div>

      {/* Layer Properties Section */}
      <div className="px-2 space-y-3">
        {/* Box Model Visualization */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Layer properties</span>
            <ChevronDown size={12} className="text-gray-500" />
          </div>
          <div className="bg-[#0d0d0d] p-4 rounded border border-gray-800 relative">
            {/* Border (outer) */}
            <div className="border-2 border-gray-600 rounded-lg p-3 relative">
              <div className="absolute -top-2 left-2 px-1 bg-[#0d0d0d] text-[10px] text-gray-500">Border</div>
              {/* Padding (middle) */}
              <div className="border border-gray-700 rounded p-2 relative">
                <div className="absolute -top-2 left-2 px-1 bg-[#0d0d0d] text-[10px] text-gray-500">Padding</div>
                {/* Content (inner) */}
                <div className="border border-dashed border-gray-600 rounded p-2 min-h-[40px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Layout</span>
          </div>
          <div className="bg-[#0d0d0d] rounded border border-gray-800">
            {/* List/Code Tabs */}
            <div className="flex border-b border-gray-800">
              <button className="px-3 py-1.5 text-[10px] text-gray-400 hover:text-gray-300">List</button>
              <button className="px-3 py-1.5 text-[10px] text-white border-b-2 border-green-500">Code</button>
              <div className="ml-auto px-3 py-1.5">
                <select className="bg-transparent text-[10px] text-gray-500 border-none outline-none">
                  <option>CSS</option>
                  <option>SCSS</option>
                </select>
              </div>
            </div>
            {/* CSS Properties */}
            <div className="p-3 font-mono text-[10px] text-green-400 space-y-1">
              <div>display: <span className="text-gray-500">[placeholder]</span></div>
              <div>height: <span className="text-gray-500">[placeholder]</span></div>
              <div>padding: <span className="text-gray-500">[placeholder]</span></div>
              <div>justify-content: <span className="text-gray-500">[placeholder]</span></div>
              <div>align-items: <span className="text-gray-500">[placeholder]</span></div>
              <div>gap: <span className="text-gray-500">[placeholder]</span></div>
              <div>flex: <span className="text-gray-500">[placeholder]</span></div>
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Colors</span>
          </div>
          <div className="space-y-1.5">
            {[
              { color: '#1e1e1e', label: 'Dark Gray' },
              { color: '#2c2c2c', label: 'Medium Gray' },
              { color: '#4b5563', label: 'Light Gray' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-4 h-4 rounded border border-gray-700" style={{ backgroundColor: item.color }}></div>
                <div className="h-2 bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets Section */}
        <div>
          <button className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Assets</span>
            <ChevronRight size={12} className="text-gray-500" />
          </button>
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-8 h-8 bg-gray-700 rounded shrink-0"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Blocks (Enhanced) */}
      <div className="px-2 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">CSS</span>
            <Copy size={12} className="text-gray-500 hover:text-white cursor-pointer"/>
          </div>
          <div className="bg-[#0d0d0d] p-3 rounded border border-gray-800 font-mono text-[10px] text-green-400 whitespace-pre overflow-x-auto">
            {generateCSS(node)}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">React / JSX</span>
            <Copy size={12} className="text-gray-500 hover:text-white cursor-pointer"/>
          </div>
          <div className="bg-[#0d0d0d] p-3 rounded border border-gray-800 font-mono text-[10px] text-blue-400 whitespace-pre overflow-x-auto">
            {generateReact(node)}
          </div>
        </div>
      </div>
    </div>
  );
};

