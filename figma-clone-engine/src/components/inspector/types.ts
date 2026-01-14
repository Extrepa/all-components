import { DesignState, SceneNode } from '../../types';

/**
 * Inspector-related type definitions
 */

export type SectionId = 
  | 'position'
  | 'layout'
  | 'constraints'
  | 'appearance'
  | 'fill'
  | 'stroke'
  | 'effects'
  | 'typography'
  | 'export'
  | 'component'
  | 'variables'
  | 'styles'
  | 'interactions'
  | 'flowStartingPoint'
  | 'prototypeSettings';

export type InspectorTab = 'design' | 'prototype';

export interface InspectorPanelProps {
  state: DesignState;
  onStateChange: (updater: (prev: DesignState) => DesignState) => void;
  onHistoryPush: (state: DesignState) => void;
  generateCSS: (node: SceneNode) => string;
  generateReact: (node: SceneNode) => string;
  onZoomChange?: (zoom: number) => void;
}

export interface SectionWrapperProps {
  id: SectionId;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface SectionProps {
  node: SceneNode;
  onUpdate: (updates: Partial<SceneNode>) => void;
  onHistoryPush: (state: DesignState) => void;
  expanded: boolean;
  onToggle: () => void;
  state: DesignState;
  generateCSS?: (node: SceneNode) => string;
  generateReact?: (node: SceneNode) => string;
}

export interface InspectorHeaderProps {
  state: DesignState;
  previewDropdownOpen: boolean;
  setPreviewDropdownOpen: (open: boolean) => void;
  previewDropdownRef: React.RefObject<HTMLDivElement>;
}

export interface InspectorTabsProps {
  inspectorTab: InspectorTab;
  setInspectorTab: (tab: InspectorTab) => void;
  state: DesignState;
}

export interface ZoomDropdownProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  zoomDropdownOpen: boolean;
  setZoomDropdownOpen: (open: boolean) => void;
  zoomDropdownRef: React.RefObject<HTMLDivElement>;
}

