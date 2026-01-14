import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ZoomDropdownProps } from './types';

export const ZoomDropdown: React.FC<ZoomDropdownProps> = ({
  zoom,
  onZoomChange,
  zoomDropdownOpen,
  setZoomDropdownOpen,
  zoomDropdownRef
}) => {
  const handleZoomChange = (newZoom: number) => {
    const constrainedZoom = Math.max(0.1, Math.min(5, newZoom));
    onZoomChange(constrainedZoom);
    setZoomDropdownOpen(false);
  };

  return (
    <div className="relative px-1.5" ref={zoomDropdownRef}>
      <button
        onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
        className="px-1.5 py-1 text-[10px] text-gray-300 hover:bg-gray-700 rounded flex items-center gap-0.5"
        title="Zoom"
      >
        {Math.round(zoom * 100)}%
        <ChevronDown size={9} />
      </button>
      {zoomDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
          <div className="px-3 py-1.5 text-xs text-gray-300 border-b border-gray-700/50">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => handleZoomChange(zoom * 1.1)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            Zoom in <span className="text-gray-500 ml-2">⌘+</span>
          </button>
          <button
            onClick={() => handleZoomChange(zoom * 0.9)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            Zoom out <span className="text-gray-500 ml-2">⌘-</span>
          </button>
          <button
            onClick={() => handleZoomChange(1)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            Zoom to fit <span className="text-gray-500 ml-2">⇧1</span>
          </button>
          <div className="border-t border-gray-700/50 my-1" />
          <button
            onClick={() => handleZoomChange(0.5)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            Zoom to 50%
          </button>
          <button
            onClick={() => handleZoomChange(1)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700 flex items-center justify-between"
          >
            Zoom to 100% <span className="text-gray-500">✓</span>
          </button>
          <button
            onClick={() => handleZoomChange(2)}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            Zoom to 200%
          </button>
        </div>
      )}
    </div>
  );
};

