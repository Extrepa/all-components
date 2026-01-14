/**
 * Interaction helper functions
 * Utility functions for hit detection, finding parent frames, and interaction calculations
 */

import { DesignState, SceneNode, FrameNode, Point, NodeId } from '../types';
import { getAbsolutePosition } from './canvasHelpers';
import { isFrameNode, hasWidth, hasHeight } from './typeGuards';

/**
 * Find the top-most frame at a given point in world coordinates
 */
export function findParentFrameAtPoint(
  x: number,
  y: number,
  state: DesignState
): FrameNode | null {
  // Check all frames in reverse order (top-most first)
  for (const id of [...state.rootIds].reverse()) {
    const node = state.nodes[id];
    if (isFrameNode(node)) {
      const absPos = getAbsolutePosition(id, state.nodes);
      if (x >= absPos.x && x <= absPos.x + node.width &&
          y >= absPos.y && y <= absPos.y + node.height) {
        return node;
      }
    }
  }
  return null;
}

/**
 * Find the top-most node at a given point in world coordinates
 */
export function findNodeAtPoint(
  x: number,
  y: number,
  state: DesignState
): NodeId | null {
  for (const id of [...state.rootIds].reverse()) {
    const node = state.nodes[id];
    const w = hasWidth(node) ? node.width : 100;
    const h = hasHeight(node) ? node.height : 20;
    if (x >= node.x && x <= node.x + w && y >= node.y && y <= node.y + h) {
      return id;
    }
  }
  return null;
}

/**
 * Check if a point is within a node's bounds
 */
export function isPointInNode(
  point: Point,
  node: SceneNode,
  state: DesignState
): boolean {
  const absPos = getAbsolutePosition(node.id, state.nodes);
  const w = hasWidth(node) ? node.width : 100;
  const h = hasHeight(node) ? node.height : 20;
  return (
    point.x >= absPos.x &&
    point.x <= absPos.x + w &&
    point.y >= absPos.y &&
    point.y <= absPos.y + h
  );
}

/**
 * Calculate resize handle bounds for a node
 */
export function getResizeHandleBounds(
  nodeId: NodeId,
  state: DesignState,
  viewportZoom: number
): Array<{ x: number; y: number; type: string }> {
  const node = state.nodes[nodeId];
  if (!node) return [];
  
  const absPos = getAbsolutePosition(nodeId, state.nodes);
  const width = hasWidth(node) ? node.width : 100;
  const height = hasHeight(node) ? node.height : 20;
  const hs = 8 / viewportZoom;
  
  return [
    { x: absPos.x - hs/2, y: absPos.y - hs/2, type: 'nw' }, // top-left
    { x: absPos.x + width/2 - hs/2, y: absPos.y - hs/2, type: 'n' }, // top
    { x: absPos.x + width - hs/2, y: absPos.y - hs/2, type: 'ne' }, // top-right
    { x: absPos.x + width - hs/2, y: absPos.y + height/2 - hs/2, type: 'e' }, // right
    { x: absPos.x + width - hs/2, y: absPos.y + height - hs/2, type: 'se' }, // bottom-right
    { x: absPos.x + width/2 - hs/2, y: absPos.y + height - hs/2, type: 's' }, // bottom
    { x: absPos.x - hs/2, y: absPos.y + height - hs/2, type: 'sw' }, // bottom-left
    { x: absPos.x - hs/2, y: absPos.y + height/2 - hs/2, type: 'w' }, // left
  ];
}

/**
 * Find which resize handle was clicked (if any)
 */
export function findResizeHandle(
  point: Point,
  nodeId: NodeId,
  state: DesignState,
  viewportZoom: number
): { type: string } | null {
  const handles = getResizeHandleBounds(nodeId, state, viewportZoom);
  const hs = 8 / viewportZoom;
  
  const clickedHandle = handles.find(h => 
    point.x >= h.x && point.x <= h.x + hs &&
    point.y >= h.y && point.y <= h.y + hs
  );
  
  return clickedHandle ? { type: clickedHandle.type } : null;
}
