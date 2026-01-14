import React, { useRef, useState } from 'react';
import { 
  MousePointer2, Square, Type, Image as ImageIcon, PenTool, Hand,
  Component, MessageSquare, Code, Frame, Hash, ChevronUp, Scale,
  Minus, ArrowRight, Circle, Triangle, Star, Pencil, Grid, Ruler, X, Pipette
} from 'lucide-react';
import { DesignState, ToolType } from '../types';
import { DockPopOutMenu } from './DockPopOutMenu';

interface BottomDockProps {
  state: DesignState;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileMenuToggle?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  state,
  activeTool,
  onToolChange,
  onImageUpload,
  onFileMenuToggle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  
  // Refs for the entire button groups (icon + chevron)
  const moveGroupRef = useRef<HTMLDivElement>(null);
  const gridGroupRef = useRef<HTMLDivElement>(null);
  const rectangleGroupRef = useRef<HTMLDivElement>(null);
  const penGroupRef = useRef<HTMLDivElement>(null);
  
  // Refs for individual icon buttons (for tool selection)
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const gridButtonRef = useRef<HTMLButtonElement>(null);
  const rectangleButtonRef = useRef<HTMLButtonElement>(null);
  const penButtonRef = useRef<HTMLButtonElement>(null);

  if (state.mode === 'DEV') {
    return null; // No bottom dock in dev mode
  }

  const moveMenuItems = [
    { id: 'SELECT', label: 'Select', icon: <MousePointer2 size={14} />, shortcut: 'V', isSelected: activeTool === 'SELECT' },
    { id: 'HAND', label: 'Hand tool', icon: <Hand size={14} />, shortcut: 'H', isSelected: activeTool === 'HAND' },
    { id: 'SCALE', label: 'Scale', icon: <Scale size={14} />, shortcut: 'K', isSelected: activeTool === 'SCALE' },
  ];

  const gridMenuItems = [
    { id: 'SECTION', label: 'Section', icon: <Frame size={14} />, shortcut: '⇧S', isSelected: activeTool === 'SECTION' },
    { id: 'FRAME', label: 'Frame', icon: <Frame size={14} />, shortcut: 'F', isSelected: activeTool === 'FRAME' },
    { id: 'SLICE', label: 'Slice', icon: <Square size={14} />, shortcut: 'S', isSelected: activeTool === 'SLICE' },
  ];

  const rectangleMenuItems = [
    { id: 'RECTANGLE', label: 'Rectangle', icon: <Square size={14} />, shortcut: 'R', isSelected: activeTool === 'RECTANGLE' },
    { id: 'LINE', label: 'Line', icon: <Minus size={14} />, shortcut: 'L', isSelected: activeTool === 'LINE' },
    { id: 'ARROW', label: 'Arrow', icon: <ArrowRight size={14} />, shortcut: '⇧L', isSelected: activeTool === 'ARROW' },
    { id: 'ELLIPSE', label: 'Ellipse', icon: <Circle size={14} />, shortcut: 'O', isSelected: activeTool === 'ELLIPSE' },
    { id: 'POLYGON', label: 'Polygon', icon: <Triangle size={14} />, shortcut: '', isSelected: activeTool === 'POLYGON' },
    { id: 'STAR', label: 'Star', icon: <Star size={14} />, shortcut: '', isSelected: activeTool === 'STAR' },
    { id: 'IMAGE', label: 'Image/video...', icon: <ImageIcon size={14} />, shortcut: '⇧⌘K', isSelected: false },
  ];

  const penMenuItems = [
    { id: 'PEN', label: 'Pen', icon: <PenTool size={14} />, shortcut: 'P', isSelected: activeTool === 'PEN' },
    { id: 'PENCIL', label: 'Pencil', icon: <Pencil size={14} />, shortcut: '⇧P', isSelected: activeTool === 'PENCIL' },
  ];

  const handleMenuSelect = (menuId: string, itemId: string) => {
    if (menuId === 'move') {
      if (itemId === 'SELECT' || itemId === 'HAND' || itemId === 'SCALE') {
        onToolChange(itemId as ToolType);
      }
    } else if (menuId === 'grid') {
      if (itemId === 'FRAME' || itemId === 'SECTION' || itemId === 'SLICE') {
        onToolChange(itemId as ToolType);
      }
    } else if (menuId === 'rectangle') {
      if (itemId === 'RECTANGLE' || itemId === 'LINE' || itemId === 'ARROW' || itemId === 'ELLIPSE' || itemId === 'POLYGON' || itemId === 'STAR') {
        onToolChange(itemId as ToolType);
      } else if (itemId === 'IMAGE') {
        fileInputRef.current?.click();
      }
    } else if (menuId === 'pen') {
      if (itemId === 'PEN' || itemId === 'PENCIL') {
        onToolChange(itemId as ToolType);
      }
    }
  };

  // Draw Mode Dock - Completely different dock for drawing tools
  if (drawMode) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-md shadow-xl flex items-center gap-0 px-0.5 py-0.5">
          {/* Select Tool with Chevron */}
          <div ref={moveGroupRef} className="relative flex items-center">
            <button 
              ref={moveButtonRef}
              onClick={() => {
                if (openMenu === 'move') {
                  setOpenMenu(null);
                  onToolChange('SELECT');
                } else {
                  setOpenMenu('move');
                }
              }}
              className={`p-1 rounded-sm ${['SELECT', 'HAND', 'SCALE'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
              title="Select Tool (V) - Click chevron for Select, Hand, Scale"
            >
              <MousePointer2 size={16} />
            </button>
            <button
              data-dock-chevron
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu === 'move') {
                  setOpenMenu(null);
                } else {
                  setOpenMenu('move');
                }
              }}
              className={`p-0.5 rounded-sm ${['SELECT', 'HAND', 'SCALE'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              title="Show tool options"
            >
              <ChevronUp size={10} />
            </button>
            <DockPopOutMenu
              items={moveMenuItems}
              isOpen={openMenu === 'move'}
              onClose={() => setOpenMenu(null)}
              onSelect={(id) => handleMenuSelect('move', id)}
              anchorRef={moveGroupRef}
            />
          </div>

          {/* Fountain Pen Tool */}
          <button
            onClick={() => onToolChange('PEN')}
            className={`p-1 rounded-sm flex items-center justify-center ${activeTool === 'PEN' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Fountain Pen (P)"
          >
            <PenTool size={16} />
          </button>
          
          {/* Paint Brush Tool - Using a custom SVG */}
          <button
            onClick={() => onToolChange('PEN')}
            className={`p-1 rounded-sm flex items-center justify-center ${activeTool === 'PEN' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Paint Brush"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7.5 2 13.5v2a1 1 0 0 0 1 1h2l5.5-6 1.59-1.59a2 2 0 0 0 0-2.82L11 4l4.37-4.37a2.12 2.12 0 0 1 3 0z" />
              <path d="M22 2l-5 5" />
            </svg>
          </button>
          
          {/* Pencil Tool */}
          <button
            onClick={() => onToolChange('PENCIL')}
            className={`p-1 rounded-sm flex items-center justify-center ${activeTool === 'PENCIL' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Pencil (⇧P)"
          >
            <Pencil size={16} />
          </button>

          {/* Hash/Grid Tool with Chevron */}
          <div ref={gridGroupRef} className="relative flex items-center">
            <button 
              ref={gridButtonRef}
              onClick={() => {
                if (openMenu === 'grid') {
                  setOpenMenu(null);
                  onToolChange('FRAME');
                } else {
                  setOpenMenu('grid');
                }
              }}
              className={`p-1 rounded-sm flex items-center justify-center ${['FRAME', 'SECTION', 'SLICE'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
              title="Frame Tools (F) - Click chevron for Section, Frame, Slice"
            >
              <Hash size={16} />
            </button>
            <button
              data-dock-chevron
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu === 'grid') {
                  setOpenMenu(null);
                } else {
                  setOpenMenu('grid');
                }
              }}
              className={`p-0.5 rounded-sm ${['FRAME', 'SECTION', 'SLICE'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              title="Show tool options"
            >
              <ChevronUp size={10} />
            </button>
            <DockPopOutMenu
              items={gridMenuItems}
              isOpen={openMenu === 'grid'}
              onClose={() => setOpenMenu(null)}
              onSelect={(id) => handleMenuSelect('grid', id)}
              anchorRef={gridGroupRef}
            />
          </div>
          
          {/* Rectangle Tool with Chevron */}
          <div ref={rectangleGroupRef} className="relative flex items-center">
            <button 
              ref={rectangleButtonRef}
              onClick={() => {
                if (openMenu === 'rectangle') {
                  setOpenMenu(null);
                  onToolChange('RECTANGLE');
                } else {
                  setOpenMenu('rectangle');
                }
              }}
              className={`p-1 rounded-sm flex items-center justify-center ${['RECTANGLE', 'LINE', 'ARROW', 'ELLIPSE', 'POLYGON', 'STAR'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
              title="Shape Tools (R) - Click chevron for Rectangle, Line, Arrow, Ellipse, Polygon, Star"
            >
              <Square size={16} />
            </button>
            <button
              data-dock-chevron
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu === 'rectangle') {
                  setOpenMenu(null);
                } else {
                  setOpenMenu('rectangle');
                }
              }}
              className={`p-0.5 rounded-sm ${['RECTANGLE', 'LINE', 'ARROW', 'ELLIPSE', 'POLYGON', 'STAR'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              title="Show tool options"
            >
              <ChevronUp size={10} />
            </button>
            <DockPopOutMenu
              items={rectangleMenuItems}
              isOpen={openMenu === 'rectangle'}
              onClose={() => setOpenMenu(null)}
              onSelect={(id) => handleMenuSelect('rectangle', id)}
              anchorRef={rectangleGroupRef}
            />
          </div>
          
          {/* Text Tool */}
          <button 
            onClick={() => onToolChange('TEXT')} 
            className={`p-1 rounded-sm flex items-center justify-center ${activeTool === 'TEXT' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Text (T)"
          >
            <Type size={16} />
          </button>
          
          {/* Comment Bubble Tool */}
          <button 
            onClick={() => onToolChange('COMMENT')}
            className={`p-1 rounded-sm flex items-center justify-center ${activeTool === 'COMMENT' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Add Comment"
          >
            <MessageSquare size={16} />
          </button>
          
          {/* Components/Actions Tool */}
          <button 
            onClick={() => onFileMenuToggle?.()}
            className="p-1 rounded-sm flex items-center justify-center text-gray-700 hover:bg-gray-100" 
            title="Actions"
          >
            <Component size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-0.5" />
          
          {/* Draw Tool - Active in draw mode */}
          <button 
            onClick={() => setDrawMode(false)}
            className="p-1 rounded-sm flex items-center justify-center bg-gray-100 text-blue-600 hover:bg-gray-200" 
            title="Draw - Exit draw mode"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM9 12c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM15 12c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" />
            </svg>
          </button>
          
          {/* Design Tool */}
          <button 
            className="p-1 rounded-sm flex items-center justify-center text-gray-700 hover:bg-gray-100" 
            title="Design"
          >
            <Grid size={16} />
          </button>
          
          {/* Dev Tool */}
          <button 
            className="p-1 rounded-sm flex items-center justify-center text-gray-700 hover:bg-gray-100" 
            title="Dev"
          >
            <Code size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Normal Dock Mode
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl flex items-center gap-0 px-0.5 py-0.5">
        {/* Move/Select Tool with Chevron */}
        <div ref={moveGroupRef} className="relative flex items-center">
          <button 
            ref={moveButtonRef}
            onClick={() => {
              if (openMenu === 'move') {
                setOpenMenu(null);
                onToolChange('SELECT');
              } else {
                setOpenMenu('move');
              }
            }}
            className={`p-1 rounded-sm ${['SELECT', 'HAND', 'SCALE'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Select Tool (V) - Click chevron for Select, Hand, Scale"
          >
            <MousePointer2 size={16} />
          </button>
          <button
            data-dock-chevron
            onClick={(e) => {
              e.stopPropagation();
              if (openMenu === 'move') {
                setOpenMenu(null);
              } else {
                setOpenMenu('move');
              }
            }}
            className={`p-0.5 rounded-sm ${['SELECT', 'HAND', 'SCALE'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title="Show tool options"
          >
            <ChevronUp size={10} />
          </button>
          <DockPopOutMenu
            items={moveMenuItems}
            isOpen={openMenu === 'move'}
            onClose={() => setOpenMenu(null)}
            onSelect={(id) => handleMenuSelect('move', id)}
            anchorRef={moveGroupRef}
          />
        </div>

        {/* Hash/Grid Tool with Chevron */}
        <div ref={gridGroupRef} className="relative flex items-center">
          <button 
            ref={gridButtonRef}
            onClick={() => {
              if (openMenu === 'grid') {
                setOpenMenu(null);
                onToolChange('FRAME');
              } else {
                setOpenMenu('grid');
              }
            }}
            className={`p-1 rounded-sm ${['FRAME', 'SECTION', 'SLICE'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Frame Tools (F) - Click chevron for Section, Frame, Slice"
          >
            <Hash size={16} />
          </button>
          <button
            data-dock-chevron
            onClick={(e) => {
              e.stopPropagation();
              if (openMenu === 'grid') {
                setOpenMenu(null);
              } else {
                setOpenMenu('grid');
              }
            }}
            className={`p-0.5 rounded-sm ${['FRAME', 'SECTION', 'SLICE'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title="Show tool options"
          >
            <ChevronUp size={10} />
          </button>
          <DockPopOutMenu
            items={gridMenuItems}
            isOpen={openMenu === 'grid'}
            onClose={() => setOpenMenu(null)}
            onSelect={(id) => handleMenuSelect('grid', id)}
            anchorRef={gridGroupRef}
          />
        </div>
        
        {/* Rectangle Tool with Chevron */}
        <div ref={rectangleGroupRef} className="relative flex items-center">
          <button 
            ref={rectangleButtonRef}
            onClick={() => {
              if (openMenu === 'rectangle') {
                setOpenMenu(null);
                onToolChange('RECTANGLE');
              } else {
                setOpenMenu('rectangle');
              }
            }}
            className={`p-1 rounded-sm ${['RECTANGLE', 'LINE', 'ARROW', 'ELLIPSE', 'POLYGON', 'STAR'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Shape Tools (R) - Click chevron for Rectangle, Line, Arrow, Ellipse, Polygon, Star"
          >
            <Square size={16} />
          </button>
          <button
            data-dock-chevron
            onClick={(e) => {
              e.stopPropagation();
              if (openMenu === 'rectangle') {
                setOpenMenu(null);
              } else {
                setOpenMenu('rectangle');
              }
            }}
            className={`p-0.5 rounded-sm ${['RECTANGLE', 'LINE', 'ARROW', 'ELLIPSE', 'POLYGON', 'STAR'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title="Show tool options"
          >
            <ChevronUp size={10} />
          </button>
          <DockPopOutMenu
            items={rectangleMenuItems}
            isOpen={openMenu === 'rectangle'}
            onClose={() => setOpenMenu(null)}
            onSelect={(id) => handleMenuSelect('rectangle', id)}
            anchorRef={rectangleGroupRef}
          />
        </div>
        
        {/* Pen Tool with Chevron */}
        <div ref={penGroupRef} className="relative flex items-center">
          <button 
            ref={penButtonRef}
            onClick={() => {
              if (openMenu === 'pen') {
                setOpenMenu(null);
                onToolChange('PEN');
              } else {
                setOpenMenu('pen');
              }
            }}
            className={`p-1 rounded-sm ${['PEN', 'PENCIL'].includes(activeTool) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
            title="Pen Tool (P) - Click chevron for Pen, Pencil"
          >
            <PenTool size={16} />
          </button>
          <button
            data-dock-chevron
            onClick={(e) => {
              e.stopPropagation();
              if (openMenu === 'pen') {
                setOpenMenu(null);
              } else {
                setOpenMenu('pen');
              }
            }}
            className={`p-0.5 rounded-sm ${['PEN', 'PENCIL'].includes(activeTool) ? 'text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title="Show tool options"
          >
            <ChevronUp size={10} />
          </button>
          <DockPopOutMenu
            items={penMenuItems}
            isOpen={openMenu === 'pen'}
            onClose={() => setOpenMenu(null)}
            onSelect={(id) => handleMenuSelect('pen', id)}
            anchorRef={penGroupRef}
          />
        </div>
        
        {/* Text Tool - No Chevron */}
        <button 
          onClick={() => onToolChange('TEXT')} 
          className={`p-1 rounded-sm ${activeTool === 'TEXT' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
          title="Text (T)"
        >
          <Type size={16} />
        </button>
        
        {/* Eyedropper Tool - No Chevron */}
        <button 
          onClick={() => onToolChange('EYEDROPPER')} 
          className={`p-1 rounded-sm ${activeTool === 'EYEDROPPER' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} 
          title="Eyedropper (I)"
        >
          <Pipette size={16} />
        </button>
        
        {/* Actions Tool - No Chevron */}
        <button 
          onClick={() => onFileMenuToggle?.()}
          className="p-1 rounded-sm text-gray-700 hover:bg-gray-100" 
          title="Actions"
        >
          <Component size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-0.5" />
        
        {/* Draw Tool - Transforms dock to drawing mode */}
        <button 
          onClick={() => setDrawMode(true)}
          className="p-1 rounded-sm text-gray-700 hover:bg-gray-100" 
          title="Draw - Switch to drawing tools"
        >
          <Pencil size={16} />
        </button>
        
        {/* Design Tool - No Chevron */}
        <button 
          className="p-1 rounded-sm text-gray-700 hover:bg-gray-100" 
          title="Design"
        >
          <Grid size={16} />
        </button>
        
        {/* Dev Tool - No Chevron */}
        <button 
          className="p-1 rounded-sm text-gray-700 hover:bg-gray-100" 
          title="Dev"
        >
          <Code size={16} />
        </button>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onImageUpload} />
      </div>
    </div>
  );
};

