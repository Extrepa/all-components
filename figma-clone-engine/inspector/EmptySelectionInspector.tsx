import React from 'react';
import { ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, Eye, Filter, MoreVertical, Minus } from 'lucide-react';
import { DesignState } from '../../types';
import { InspectorHeader } from './InspectorHeader';
import { InspectorTabs } from './InspectorTabs';
import { ZoomDropdown } from './ZoomDropdown';
import { InspectorTab, SectionId } from './types';

interface EmptySelectionInspectorProps {
  state: DesignState;
  panelWidth: number;
  panelRef: React.RefObject<HTMLDivElement>;
  handleResize: (e: React.PointerEvent) => void;
  inspectorTab: InspectorTab;
  setInspectorTab: (tab: InspectorTab) => void;
  previewDropdownOpen: boolean;
  setPreviewDropdownOpen: (open: boolean) => void;
  previewDropdownRef: React.RefObject<HTMLDivElement>;
  zoomDropdownOpen: boolean;
  setZoomDropdownOpen: (open: boolean) => void;
  zoomDropdownRef: React.RefObject<HTMLDivElement>;
  onZoomChange?: (zoom: number) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  expandedSections: Set<SectionId>;
  toggleSection: (section: SectionId) => void;
}

export const EmptySelectionInspector: React.FC<EmptySelectionInspectorProps> = ({
  state,
  panelWidth,
  panelRef,
  handleResize,
  inspectorTab,
  setInspectorTab,
  previewDropdownOpen,
  setPreviewDropdownOpen,
  previewDropdownRef,
  zoomDropdownOpen,
  setZoomDropdownOpen,
  zoomDropdownRef,
  onZoomChange,
  setIsCollapsed,
  expandedSections,
  toggleSection
}) => {
  const handleZoomChange = (zoom: number) => {
    if (onZoomChange) {
      const constrainedZoom = Math.max(0.1, Math.min(5, zoom));
      onZoomChange(constrainedZoom);
    }
    setZoomDropdownOpen(false);
  };

  return (
    <div className="flex border-l border-black shrink-0 relative" style={{ width: `${panelWidth}px` }}>
      <div 
        ref={panelRef} 
        className={`flex flex-col shrink-0 overflow-y-auto relative ${state.mode === 'DEV' ? 'bg-[#111]' : 'bg-[#2c2c2c]'}`} 
        style={{ width: `${panelWidth}px` }}
      >
        {/* Collapse Button - Bottom left corner */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute bottom-4 left-4 z-10 p-1.5 text-gray-400 hover:text-white rounded"
          title="Collapse panel"
        >
          <ChevronRight size={14} />
        </button>
        
        {/* Header Section - Row 1: User, Preview, Share */}
        <InspectorHeader
          state={state}
          previewDropdownOpen={previewDropdownOpen}
          setPreviewDropdownOpen={setPreviewDropdownOpen}
          previewDropdownRef={previewDropdownRef}
        />

        {/* Header Section - Row 2: Design/Prototype Tabs, Zoom on right */}
        <div className="flex items-center border-b border-gray-700/50">
          <InspectorTabs
            inspectorTab={inspectorTab}
            setInspectorTab={setInspectorTab}
            state={state}
          />
          {state.mode === 'DESIGN' && (
            <ZoomDropdown
              zoom={state.viewport.zoom}
              onZoomChange={handleZoomChange}
              zoomDropdownOpen={zoomDropdownOpen}
              setZoomDropdownOpen={setZoomDropdownOpen}
              zoomDropdownRef={zoomDropdownRef}
            />
          )}
        </div>

        <div className="p-3 space-y-3">
          {/* Only show Design tab content */}
          {state.mode === 'DESIGN' && inspectorTab === 'design' && (
            <>
              {/* Page Section */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Page</div>
                
                {/* Color and Opacity */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-600" style={{ backgroundColor: '#AE00FF' }}></div>
                  <div className="flex-1 bg-gray-800/50 rounded px-2 py-1 text-xs text-gray-300">AE00FF</div>
                  <div className="bg-gray-800/50 rounded px-2 py-1 text-xs text-gray-300">100 %</div>
                  <button className="p-1 text-gray-500 hover:text-white">
                    <Eye size={14} />
                  </button>
                </div>
                
                {/* Show in exports checkbox */}
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500" />
                  <span>Show in exports</span>
                </label>
              </div>

              {/* Variables Section */}
              <div className="border-b border-gray-700/50">
                <div 
                  onClick={() => toggleSection('variables')}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Variables</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Filter variables');
                      }}
                      className="p-1 text-gray-500 hover:text-white"
                    >
                      <Filter size={12} />
                    </button>
                  </div>
                  {expandedSections.has('variables') ? (
                    <ChevronDown size={12} className="text-gray-500" />
                  ) : (
                    <ChevronRightIcon size={12} className="text-gray-500" />
                  )}
                </div>
                {expandedSections.has('variables') && (
                  <div className="px-2 pb-2 space-y-1">
                    {/* Variable Items - Each as its own section */}
                    <div className="px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/30 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-gray-600 bg-gray-700"></div>
                        <span>No variables yet</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Styles Section */}
              <div className="border-b border-gray-700/50">
                <button 
                  onClick={() => toggleSection('styles')}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Styles</span>
                  </div>
                  {expandedSections.has('styles') ? (
                    <ChevronDown size={12} className="text-gray-500" />
                  ) : (
                    <ChevronRightIcon size={12} className="text-gray-500" />
                  )}
                </button>
                {expandedSections.has('styles') && (
                  <div className="px-2 pb-2 space-y-1">
                    {/* Style Items - Each as its own section */}
                    <div className="px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/30 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-gray-600 bg-gray-700"></div>
                        <span>No styles yet</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Section */}
              <div className="border-b border-gray-700/50">
                <button 
                  onClick={() => toggleSection('export')}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Export</span>
                  {expandedSections.has('export') ? (
                    <ChevronDown size={12} className="text-gray-500" />
                  ) : (
                    <ChevronRightIcon size={12} className="text-gray-500" />
                  )}
                </button>
                {expandedSections.has('export') && (
                  <div className="px-2 pb-2 space-y-2">
                    {/* Export Preset 1 - Default */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-1">
                          1x
                          <ChevronDown size={10} />
                        </button>
                        <button className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-1">
                          PNG
                          <ChevronDown size={10} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-white">
                          <MoreVertical size={12} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-white">
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Export Button */}
                    <button 
                      onClick={() => console.log('Export page')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded"
                    >
                      Export {state.projectName || 'Untitled'}
                    </button>
                    
                    {/* Preview Link */}
                    <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300">
                      &gt; Preview
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Prototype Tab Content */}
          {state.mode === 'DESIGN' && inspectorTab === 'prototype' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400 text-center py-4">
                Prototype interactions
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                Add interactions to create prototypes
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Resize Handle */}
      <div 
        onPointerDown={handleResize}
        className="w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors shrink-0"
        title="Drag to resize"
      />
    </div>
  );
};

