import React from 'react';
import { ChevronRight, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Space } from 'lucide-react';
import { DesignState, SceneNode } from '../../types';
import { InspectorHeader } from './InspectorHeader';
import { InspectorTabs } from './InspectorTabs';
import { ZoomDropdown } from './ZoomDropdown';
import { InspectorTab } from './types';

interface MultiSelectionInspectorProps {
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
}

export const MultiSelectionInspector: React.FC<MultiSelectionInspectorProps> = ({
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
  setIsCollapsed
}) => {
  const selectedNodes = state.selection.map(id => state.nodes[id]).filter(Boolean);
  const commonType = selectedNodes.every(n => n.type === selectedNodes[0].type) 
    ? selectedNodes[0].type 
    : 'MIXED';

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

        <div className="p-3 space-y-1">
          {/* Multi-Selection Header */}
          <div className="px-2 py-2 mb-1">
            <div className={`text-[10px] font-semibold uppercase tracking-wide ${state.mode === 'DEV' ? 'text-green-500' : 'text-blue-400'}`}>
              {selectedNodes.length} layers
            </div>
            <div className="text-sm font-medium text-white mt-0.5">
              {commonType === 'MIXED' ? 'Mixed selection' : commonType}
            </div>
          </div>

          {state.mode === 'DESIGN' && inspectorTab === 'design' && (
            <div className="space-y-0.5">
              {/* Alignment Tools */}
              <div className="border-b border-gray-700/50">
                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-medium text-gray-300 mb-2">Align</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Left">
                      <AlignLeft size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Center">
                      <AlignCenter size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Right">
                      <AlignRight size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Top">
                      <AlignVerticalJustifyStart size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Middle">
                      <AlignVerticalJustifyCenter size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Align Bottom">
                      <AlignVerticalJustifyEnd size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Distribution Tools */}
              <div className="border-b border-gray-700/50">
                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-medium text-gray-300 mb-2">Distribute</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Distribute Horizontally">
                      <Space size={14} />
                    </button>
                    <button className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600" title="Distribute Vertically">
                      <Space size={14} className="rotate-90" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-b border-gray-700/50">
                <div className="px-2 py-1.5 space-y-1">
                  <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
                    Group selection
                  </button>
                  <button className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 text-left">
                    Frame selection
                  </button>
                </div>
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

