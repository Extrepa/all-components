/**
 * Canvas helper functions
 * Utility functions for canvas operations and coordinate transformations
 */

import { Point, SceneNode } from '../types';

/**
 * Convert screen coordinates to world coordinates
 * @param sx - Screen X coordinate
 * @param sy - Screen Y coordinate
 * @param viewport - Viewport position and zoom
 * @returns World coordinates
 */
export function screenToWorld(
  sx: number,
  sy: number,
  viewport: { x: number; y: number; zoom: number }
): Point {
  return {
    x: (sx - viewport.x) / viewport.zoom,
    y: (sy - viewport.y) / viewport.zoom
  };
}


/**
 * Get absolute position of a node (accounting for parent positions)
 * @param nodeId - ID of the node
 * @param nodes - All nodes in the scene
 * @returns Absolute position of the node
 */
export function getAbsolutePosition(
  nodeId: string,
  nodes: Record<string, SceneNode>
): Point {
  const node = nodes[nodeId];
  if (!node) return { x: 0, y: 0 };
  let x = node.x;
  let y = node.y;
  let current = node;
  while (current.parent) {
    const parent = nodes[current.parent];
    if (!parent) break;
    x += parent.x;
    y += parent.y;
    current = parent;
  }
  return { x, y };
}

/**
 * Wrap text to fit within a maximum width
 * @param ctx - Canvas rendering context
 * @param text - Text to wrap
 * @param maxWidth - Maximum width in pixels
 * @returns Array of text lines
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
