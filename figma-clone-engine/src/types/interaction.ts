/**
 * Interaction types for canvas interactions
 * Used for drag, resize, create, and other interactive operations
 */

import type { Point, NodeId, SceneNode } from '../types';

export type InteractionType =
  | 'PAN'
  | 'DRAG'
  | 'RESIZE'
  | 'SCALE'
  | 'CREATE_FRAME'
  | 'CREATE_RECTANGLE'
  | 'CREATE_TEXT'
  | 'CREATE_LINE'
  | 'CREATE_ELLIPSE'
  | 'CREATE_POLYGON'
  | 'CREATE_STAR'
  | 'CREATE_SECTION'
  | 'CREATE_SLICE';

export interface BaseInteraction {
  type: InteractionType;
  nodeId: NodeId;
  startX: number;
  startY: number;
}

// PAN doesn't have nodeId, so it's separate
export interface PanInteraction {
  type: 'PAN';
  startX: number;
  startY: number;
}

export interface DragInteraction extends BaseInteraction {
  type: 'DRAG';
  initialNodes: Record<NodeId, SceneNode>;
}

export interface ResizeInteraction extends BaseInteraction {
  type: 'RESIZE';
  handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  initialNode: SceneNode;
}

export interface ScaleInteraction extends BaseInteraction {
  type: 'SCALE';
  initialNode: SceneNode;
  initialDistance: number;
}

export interface CreateFrameInteraction extends BaseInteraction {
  type: 'CREATE_FRAME';
}

export interface CreateRectangleInteraction extends BaseInteraction {
  type: 'CREATE_RECTANGLE';
}

export interface CreateTextInteraction extends BaseInteraction {
  type: 'CREATE_TEXT';
}

export interface CreateLineInteraction extends BaseInteraction {
  type: 'CREATE_LINE';
  isArrow?: boolean;
}

export interface CreateEllipseInteraction extends BaseInteraction {
  type: 'CREATE_ELLIPSE';
}

export interface CreatePolygonInteraction extends BaseInteraction {
  type: 'CREATE_POLYGON';
}

export interface CreateStarInteraction extends BaseInteraction {
  type: 'CREATE_STAR';
}

export interface CreateSectionInteraction extends BaseInteraction {
  type: 'CREATE_SECTION';
}

export interface CreateSliceInteraction extends BaseInteraction {
  type: 'CREATE_SLICE';
}

export type Interaction =
  | PanInteraction
  | DragInteraction
  | ResizeInteraction
  | ScaleInteraction
  | CreateFrameInteraction
  | CreateRectangleInteraction
  | CreateTextInteraction
  | CreateLineInteraction
  | CreateEllipseInteraction
  | CreatePolygonInteraction
  | CreateStarInteraction
  | CreateSectionInteraction
  | CreateSliceInteraction;

export interface InteractionState {
  interaction: Interaction | null;
  setInteraction: (interaction: Interaction | null) => void;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e?: React.PointerEvent) => void;
}
