import React, { useRef } from 'react';
import { Undo, Redo, Download, Upload, Minus, Plus, Code, Grid, Palette, Monitor } from 'lucide-react';
import { DesignState } from '../types';

interface FloatingTopNavProps {
  state: DesignState;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: 'DESIGN' | 'DEV') => void;
  onZoomChange: (delta: number) => void;
  onToggleSnapToGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const FloatingTopNav: React.FC<FloatingTopNavProps> = ({
  state,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onModeChange,
  onZoomChange,
  onToggleSnapToGrid,
  canUndo,
  canRedo
}) => {
  const loadInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-2xl flex items-center gap-1 px-2 py-1.5">
        {/* Mode Toggle - Only show in DESIGN mode */}
        {state.mode === 'DESIGN' && (
          <>
            <button 
              onClick={() => onModeChange('DEV')} 
              className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 flex items-center gap-1.5" 
              title="Switch to Dev Mode (Code View)"
            >
              <Monitor size={16} />
              <span className="text-xs">Dev</span>
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
          </>
        )}
        
        {/* Dev Mode Toggle - Only show in DEV mode */}
        {state.mode === 'DEV' && (
          <>
            <button 
              onClick={() => onModeChange('DESIGN')} 
              className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 flex items-center gap-1.5" 
              title="Switch to Design Mode (Design View)"
            >
              <Palette size={16} />
              <span className="text-xs">Design</span>
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
          </>
        )}

        {/* Undo/Redo */}
        <button 
          onClick={onUndo} 
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed" 
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
        >
          <Undo size={16} />
        </button>
        <button 
          onClick={onRedo} 
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed" 
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
        >
          <Redo size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        {/* Save/Load */}
        <button 
          onClick={onSave} 
          className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700" 
          title="Save Design"
        >
          <Download size={16} />
        </button>
        <label className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer" title="Load Design">
          <Upload size={16} />
          <input type="file" ref={loadInputRef} className="hidden" accept=".json" onChange={onLoad} />
        </label>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
          <button 
            onClick={() => onZoomChange(-0.1)} 
            className="hover:bg-gray-700 rounded px-1 text-gray-400 hover:text-white"
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>
          <span className="text-xs w-12 text-center text-gray-300">{Math.round(state.viewport.zoom * 100)}%</span>
          <button 
            onClick={() => onZoomChange(0.1)} 
            className="hover:bg-gray-700 rounded px-1 text-gray-400 hover:text-white"
            title="Zoom In"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {state.mode === 'DESIGN' && (
          <>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button
              onClick={onToggleSnapToGrid}
              className={`p-2 rounded ${state.snapToGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title={`Snap to Grid (${state.gridSize}px) - ${state.snapToGrid ? 'On' : 'Off'}`}
            >
              <Grid size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

