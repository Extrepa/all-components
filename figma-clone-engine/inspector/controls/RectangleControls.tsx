import React, { useState, useRef, useEffect } from 'react';
import { Grid, Boxes, Moon, Layers, LayoutGrid } from 'lucide-react';

interface RectangleControlsProps {
  node: any;
  onStateChange?: (updater: any) => void;
}

export const RectangleControls: React.FC<RectangleControlsProps> = ({ node, onStateChange }) => {
  const [stylesOpen, setStylesOpen] = useState(false);
  const stylesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stylesRef.current && !stylesRef.current.contains(event.target as Node)) {
        setStylesOpen(false);
      }
    };

    if (stylesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stylesOpen]);

  return (
    <div className="flex items-center gap-1">
      {/* Grid Icon (Styles/Components) */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Styles"
      >
        <Grid size={14} />
      </button>

      {/* Boxes Icon (Instances/Variants) */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Instances"
      >
        <Boxes size={14} />
      </button>

      {/* Moon/Half-circle Icon (Mask/Blend Mode) */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Mask"
      >
        <Moon size={14} />
      </button>

      {/* Stack of Papers Icon with Dropdown (Styles/Presets) */}
      <div className="relative" ref={stylesRef}>
        <button
          onClick={() => setStylesOpen(!stylesOpen)}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white flex items-center gap-1"
          title="Styles"
        >
          <Layers size={14} />
        </button>
        {stylesOpen && (
          <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1 z-50">
            <div className="px-3 py-1.5 text-xs text-gray-400">Styles</div>
            <div className="border-t border-gray-700/50 my-1" />
            <button className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700">
              Create style
            </button>
          </div>
        )}
      </div>

      {/* Square with Four Dots (Constraints/Auto-layout) */}
      <button 
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
        title="Constraints"
      >
        <LayoutGrid size={14} />
      </button>
    </div>
  );
};

