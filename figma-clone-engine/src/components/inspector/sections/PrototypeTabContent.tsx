import React from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { SectionId } from '../types';

interface PrototypeTabContentProps {
  expandedSections: Set<SectionId>;
  toggleSection: (section: SectionId) => void;
}

export const PrototypeTabContent: React.FC<PrototypeTabContentProps> = ({
  expandedSections,
  toggleSection
}) => {
  return (
    <div className="px-3 py-4 space-y-3">
      {/* Interactions Section */}
      <div className="border-b border-gray-700/50">
        <button 
          onClick={() => toggleSection('interactions')}
          className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left"
        >
          <span className="text-[11px] font-medium text-gray-300">Interactions</span>
          {expandedSections.has('interactions') ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronRight size={14} className="text-gray-500" />
          )}
        </button>
        {expandedSections.has('interactions') && (
          <div className="px-2 pb-2 space-y-2">
            <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left flex items-center gap-2">
              <Plus size={12} />
              Add interaction
            </button>
            <div className="text-[10px] text-gray-500 px-2">
              No interactions yet
            </div>
          </div>
        )}
      </div>

      {/* Flow Starting Point Section */}
      <div className="border-b border-gray-700/50">
        <div className="px-2 py-1.5">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500" />
            <span>Flow starting point</span>
          </label>
          <div className="text-[10px] text-gray-500 mt-1 px-2">
            Mark this frame as a starting point for prototypes
          </div>
        </div>
      </div>

      {/* Prototype Settings Section */}
      <div className="border-b border-gray-700/50">
        <button 
          onClick={() => toggleSection('prototypeSettings')}
          className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left"
        >
          <span className="text-[11px] font-medium text-gray-300">Prototype Settings</span>
          {expandedSections.has('prototypeSettings') ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronRight size={14} className="text-gray-500" />
          )}
        </button>
        {expandedSections.has('prototypeSettings') && (
          <div className="px-2 pb-2 space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500">Device frame</label>
              <select className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300">
                <option>None</option>
                <option>iPhone 14</option>
                <option>iPad</option>
                <option>Desktop</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-gray-600" defaultValue="#ffffff" />
                <input type="text" className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300" defaultValue="#ffffff" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

