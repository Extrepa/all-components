import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { DesignState, SceneNode } from '../types';
import { useExpandedSections } from './inspector/hooks/useExpandedSections';
import { usePanelResize } from './inspector/hooks/usePanelResize';
import { useInspectorState } from './inspector/hooks/useInspectorState';
import { MultiSelectionInspector } from './inspector/MultiSelectionInspector';
import { EmptySelectionInspector } from './inspector/EmptySelectionInspector';
import { RootFrameInspector } from './inspector/RootFrameInspector';
import { SingleSelectionInspector } from './inspector/SingleSelectionInspector';

interface InspectorPanelProps {
  state: DesignState;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  generateCSS: (node: SceneNode) => string;
  generateReact: (node: SceneNode) => string;
  onZoomChange?: (zoom: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  state,
  onStateChange,
  onHistoryPush,
  generateCSS,
  generateReact,
  onZoomChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, toggleSection, setExpandedSections] = useExpandedSections(state, isCollapsed);
  const { panelWidth, panelRef, handleResize } = usePanelResize();
  const {
    inspectorTab,
    setInspectorTab,
    previewDropdownOpen,
    setPreviewDropdownOpen,
    previewDropdownRef,
    zoomDropdownOpen,
    setZoomDropdownOpen,
    zoomDropdownRef
  } = useInspectorState(state);

  // Auto-expand the panel if it was collapsed and an object (not page) is selected
  useEffect(() => {
    if (state.selection.length > 0) {
      const node = state.nodes[state.selection[0]];
      const isRootFrame = state.rootIds.includes(state.selection[0]) && (node?.type === 'FRAME' || node?.type === 'COMPONENT');
      
      // Auto-expand the panel if it was collapsed AND an object (not page) is selected
      if (isCollapsed && !isRootFrame) {
        setIsCollapsed(false);
      }
    }
  }, [state.selection, state.nodes, state.rootIds, isCollapsed, setIsCollapsed]);

  // Handle panel collapse - Show small collapsed box when page is selected
  const isPageSelected = state.selection.length === 0 || 
    (state.selection.length === 1 && 
     state.rootIds.includes(state.selection[0]) && 
     state.nodes[state.selection[0]] && 
     (state.nodes[state.selection[0]].type === 'FRAME' || state.nodes[state.selection[0]].type === 'COMPONENT'));
  
  if (isCollapsed) {
    // Always show small collapsed box when collapsed (matches screenshot)
    return (
      <div className="flex border-l border-black shrink-0" style={{ width: '60px' }}>
        <div className="flex flex-col items-center py-3 px-2 bg-[#2c2c2c]">
          {/* User icon */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mb-3">
            <User size={16} className="text-white" />
          </div>
          {/* Expand button */}
              <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded"
            title="Expand panel"
          >
            <ChevronLeft size={14} />
              </button>
            </div>
              </div>
    );
  }

  // Multi-selection inspector
  if (state.selection.length > 1) {
    return (
      <MultiSelectionInspector
        state={state}
        panelWidth={panelWidth}
        panelRef={panelRef}
        handleResize={handleResize}
        inspectorTab={inspectorTab}
        setInspectorTab={setInspectorTab}
        previewDropdownOpen={previewDropdownOpen}
        setPreviewDropdownOpen={setPreviewDropdownOpen}
        previewDropdownRef={previewDropdownRef}
        zoomDropdownOpen={zoomDropdownOpen}
        setZoomDropdownOpen={setZoomDropdownOpen}
        zoomDropdownRef={zoomDropdownRef}
        onZoomChange={onZoomChange}
        setIsCollapsed={setIsCollapsed}
      />
    );
  }

  // Empty selection inspector (no selection)
  if (state.selection.length === 0) {
    return (
      <EmptySelectionInspector
        state={state}
        panelWidth={panelWidth}
        panelRef={panelRef}
        handleResize={handleResize}
        inspectorTab={inspectorTab}
        setInspectorTab={setInspectorTab}
        previewDropdownOpen={previewDropdownOpen}
        setPreviewDropdownOpen={setPreviewDropdownOpen}
        previewDropdownRef={previewDropdownRef}
        zoomDropdownOpen={zoomDropdownOpen}
        setZoomDropdownOpen={setZoomDropdownOpen}
        zoomDropdownRef={zoomDropdownRef}
        onZoomChange={onZoomChange}
        setIsCollapsed={setIsCollapsed}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      />
    );
  }

  const node = state.nodes[state.selection[0]];
  const id = state.selection[0];
  
  if (!node) {
    return null;
  }
  
  // Check if selected node is a root frame (page) - show page inspector
  const isRootFrame = state.rootIds.includes(id) && (node.type === 'FRAME' || node.type === 'COMPONENT');
  
  // Show page inspector if root frame is selected
  if (isRootFrame) {
    return (
      <RootFrameInspector
        state={state}
        panelWidth={panelWidth}
        panelRef={panelRef}
        handleResize={handleResize}
        inspectorTab={inspectorTab}
        setInspectorTab={setInspectorTab}
        previewDropdownOpen={previewDropdownOpen}
        setPreviewDropdownOpen={setPreviewDropdownOpen}
        previewDropdownRef={previewDropdownRef}
        zoomDropdownOpen={zoomDropdownOpen}
        setZoomDropdownOpen={setZoomDropdownOpen}
        zoomDropdownRef={zoomDropdownRef}
        onZoomChange={onZoomChange}
        setIsCollapsed={setIsCollapsed}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      />
    );
  }

  // Single selection inspector (default case)
  return (
    <SingleSelectionInspector
      state={state}
      node={node}
      id={id}
      panelWidth={panelWidth}
      panelRef={panelRef}
      handleResize={handleResize}
      inspectorTab={inspectorTab}
      setInspectorTab={setInspectorTab}
      previewDropdownOpen={previewDropdownOpen}
      setPreviewDropdownOpen={setPreviewDropdownOpen}
      previewDropdownRef={previewDropdownRef}
      zoomDropdownOpen={zoomDropdownOpen}
      setZoomDropdownOpen={setZoomDropdownOpen}
      zoomDropdownRef={zoomDropdownRef}
      onZoomChange={onZoomChange}
      setIsCollapsed={setIsCollapsed}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      setExpandedSections={setExpandedSections}
      onStateChange={onStateChange}
      onHistoryPush={onHistoryPush}
      generateCSS={generateCSS}
      generateReact={generateReact}
    />
  );
};
