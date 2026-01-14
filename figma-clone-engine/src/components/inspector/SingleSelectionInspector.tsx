import React from 'react';
import { ChevronRight } from 'lucide-react';
import { DesignState, SceneNode } from '../../types';
import { InspectorHeader } from './InspectorHeader';
import { InspectorTabs } from './InspectorTabs';
import { ZoomDropdown } from './ZoomDropdown';
import { DevModeInspector } from './DevModeInspector';
import { InspectorTab, SectionId } from './types';
import { PositionSection } from './sections/PositionSection';
import { LayoutSection } from './sections/LayoutSection';
import { ConstraintsSection } from './sections/ConstraintsSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { FillSection } from './sections/FillSection';
import { StrokeSection } from './sections/StrokeSection';
import { EffectsSection } from './sections/EffectsSection';
import { TypographySection } from './sections/TypographySection';
import { VariablesSection } from './sections/VariablesSection';
import { StylesSection } from './sections/StylesSection';
import { ExportSection } from './sections/ExportSection';
import { PrototypeTabContent } from './sections/PrototypeTabContent';
import { ShapeControls } from './controls/ShapeControls';
import { ImageControls } from './controls/ImageControls';
import { VectorControls } from './controls/VectorControls';
import { ComponentSection } from './controls/ComponentSection';
import { InstanceSection } from './controls/InstanceSection';
import { FrameControls } from './controls/FrameControls';
import { RectangleControls } from './controls/RectangleControls';

interface SingleSelectionInspectorProps {
  state: DesignState;
  node: SceneNode;
  id: string;
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
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<SectionId>>>;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  generateCSS: (node: SceneNode) => string;
  generateReact: (node: SceneNode) => string;
}

export const SingleSelectionInspector: React.FC<SingleSelectionInspectorProps> = ({
  state,
  node,
  id,
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
  toggleSection,
  setExpandedSections,
  onStateChange,
  onHistoryPush,
  generateCSS,
  generateReact
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

        <div className="p-3 space-y-1">
          {/* Node Header with Object-Specific Controls */}
          <div className="px-2 py-2 mb-1 flex items-center justify-between">
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-wide ${state.mode === 'DEV' ? 'text-green-500' : 'text-blue-400'}`}>
                {node.type}
              </div>
              <div className="text-sm font-medium text-white mt-0.5">
                {node.name}
              </div>
            </div>
            {/* Object-Type-Specific Controls - Right-aligned in header row */}
            {state.mode === 'DESIGN' && inspectorTab === 'design' && (
              <div className="flex items-center gap-1">
                {node.type === 'FRAME' && <FrameControls node={node} onStateChange={onStateChange} state={state} onHistoryPush={onHistoryPush} />}
                {node.type === 'RECTANGLE' && <RectangleControls node={node} onStateChange={onStateChange} />}
              </div>
            )}
          </div>

          {/* Additional Node-Type-Specific Sections */}
          {state.mode === 'DESIGN' && inspectorTab === 'design' && (
            <>
              {node.type === 'IMAGE' && (
                <ImageControls
                  node={node}
                  id={id}
                  state={state}
                  onStateChange={onStateChange}
                  onHistoryPush={onHistoryPush}
                />
              )}
              {node.type === 'VECTOR' && <VectorControls />}
              {node.type === 'COMPONENT' && <ComponentSection node={node} />}
              {node.type === 'INSTANCE' && <InstanceSection node={node} state={state} />}
            </>
          )}

          {/* Design Tab Content */}
          {state.mode === 'DESIGN' && inspectorTab === 'design' && (
            <div className="space-y-0">
              <PositionSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('position')}
                onToggle={() => toggleSection('position')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
              />
              
              <LayoutSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('layout')}
                onToggle={() => toggleSection('layout')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
              />

              <ConstraintsSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('constraints')}
                onToggle={() => toggleSection('constraints')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
              />

              <AppearanceSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('appearance')}
                onToggle={() => toggleSection('appearance')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
              />
              
              <FillSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('fill')}
                onToggle={() => toggleSection('fill')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
                setExpandedSections={setExpandedSections}
              />

              <StrokeSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('stroke')}
                onToggle={() => toggleSection('stroke')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
                setExpandedSections={setExpandedSections}
              />
              
              <EffectsSection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('effects')}
                onToggle={() => toggleSection('effects')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
                setExpandedSections={setExpandedSections}
              />

              <TypographySection
                node={node}
                id={id}
                state={state}
                expanded={expandedSections.has('typography')}
                onToggle={() => toggleSection('typography')}
                onStateChange={onStateChange}
                onHistoryPush={onHistoryPush}
              />
            </div>
          )}

          {/* Variables, Styles, Export Sections */}
          {state.mode === 'DESIGN' && inspectorTab === 'design' && (
            <>
              <VariablesSection
                expanded={expandedSections.has('variables')}
                onToggle={() => toggleSection('variables')}
              />

              <StylesSection
                expanded={expandedSections.has('styles')}
                onToggle={() => toggleSection('styles')}
              />

              <ExportSection
                node={node}
                nodes={state.nodes}
                expanded={expandedSections.has('export')}
                onToggle={() => toggleSection('export')}
              />
            </>
          )}

          {/* Prototype Tab Content */}
          {state.mode === 'DESIGN' && inspectorTab === 'prototype' && (
            <PrototypeTabContent
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
          )}

          {/* DEV MODE INSPECTOR */}
          {state.mode === 'DEV' && (
            <DevModeInspector
              node={node}
              generateCSS={generateCSS}
              generateReact={generateReact}
            />
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
