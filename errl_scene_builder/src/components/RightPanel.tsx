
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Layers, Sliders, ChevronDown, ChevronRight, Play, Settings } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { InspectorPanel } from './InspectorPanel';
import { FxPanel, FxState } from './FxPanel';
import { PlaybackControls } from './PlaybackControls';
import { CanvasSettings } from './CanvasSettings';

interface RightPanelProps {
  fx: FxState;
  onFxChange: (key: keyof FxState, value: number) => void;
  rightTab?: "entity" | "fx"; // Deprecated, kept for compatibility
  setRightTab?: (tab: "entity" | "fx") => void; // Deprecated, kept for compatibility
  snapToGrid?: boolean;
  gridSize?: number;
  onToggleSnap?: () => void;
  onGridSizeChange?: (size: number) => void;
}

const AccordionItem: React.FC<{
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, onToggle, children, rightElement }) => {
  return (
    <div className="right-panel-accordion-item">
      <div
        className="right-panel-accordion-header"
        onClick={onToggle}
      >
        <div className="right-panel-accordion-title">
          <Icon className="right-panel-accordion-icon" />
          {title}
        </div>
        <div className="right-panel-accordion-controls">
            {rightElement}
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
        </div>
      </div>
      {isOpen && <div className="right-panel-accordion-content">{children}</div>}
    </div>
  );
};

export const RightPanel: React.FC<RightPanelProps> = ({ 
  fx, 
  onFxChange, 
  rightTab, 
  setRightTab,
  snapToGrid,
  gridSize,
  onToggleSnap,
  onGridSizeChange,
}) => {
  const [layersOpen, setLayersOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [motionOpen, setMotionOpen] = useState(true);
  const [canvasSettingsOpen, setCanvasSettingsOpen] = useState(false);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <AccordionItem
            title="Layers"
            icon={Layers}
            isOpen={layersOpen}
            onToggle={() => setLayersOpen(!layersOpen)}
          >
            <LayerPanel />
          </AccordionItem>

          <AccordionItem
            title="Properties"
            icon={Sliders}
            isOpen={inspectorOpen}
            onToggle={() => setInspectorOpen(!inspectorOpen)}
          >
            <InspectorPanel fx={fx} onFxChange={onFxChange} />
          </AccordionItem>
        </div>

        <div className="flex-shrink-0">
          <AccordionItem
            title="Motion"
            icon={Play}
            isOpen={motionOpen}
            onToggle={() => setMotionOpen(!motionOpen)}
          >
            <PlaybackControls />
          </AccordionItem>
          <AccordionItem
            title="Canvas"
            icon={Settings}
            isOpen={canvasSettingsOpen}
            onToggle={() => setCanvasSettingsOpen(!canvasSettingsOpen)}
          >
            <CanvasSettings
              snapToGrid={snapToGrid}
              gridSize={gridSize}
              onToggleSnap={onToggleSnap}
              onGridSizeChange={onGridSizeChange}
            />
          </AccordionItem>
        </div>
      </div>
    </div>
  );
};
