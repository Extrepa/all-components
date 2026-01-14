import React from 'react';
import { User, Play, ChevronDown } from 'lucide-react';
import { InspectorHeaderProps } from './types';

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  state,
  previewDropdownOpen,
  setPreviewDropdownOpen,
  previewDropdownRef
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50">
      {/* User Icon - Left side */}
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
        <User size={14} className="text-white" />
      </div>
      
      {/* Preview, Share buttons - Right side */}
      <div className="flex items-center gap-2">
        {/* Preview Button with Dropdown */}
        <div className="relative" ref={previewDropdownRef}>
          <button
            onClick={() => setPreviewDropdownOpen(!previewDropdownOpen)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 flex items-center gap-1"
            title="Preview"
          >
            <Play size={14} />
            <ChevronDown size={10} />
          </button>
          {previewDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[150px] py-1 z-50">
              <button
                onClick={() => {
                  console.log('Present');
                  setPreviewDropdownOpen(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
              >
                Present
              </button>
              <button
                onClick={() => {
                  console.log('Preview');
                  setPreviewDropdownOpen(false);
                }}
                className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
              >
                Preview
              </button>
            </div>
          )}
        </div>
        {/* Share Button */}
        <button
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded"
          title="Share"
        >
          Share
        </button>
      </div>
    </div>
  );
};

