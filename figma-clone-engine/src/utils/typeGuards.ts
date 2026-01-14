/**
 * Type guard functions for scene nodes
 * These functions provide type-safe narrowing for discriminated unions
 */

import { SceneNode, FrameNode, TextNode, RectangleNode, VectorNode, ImageNode, InstanceNode, CommentNode } from '../types';

/**
 * Type guard for FrameNode or Component
 */
export function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME' || node.type === 'COMPONENT';
}

/**
 * Type guard for TextNode
 */
export function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

/**
 * Type guard for RectangleNode
 */
export function isRectangleNode(node: SceneNode): node is RectangleNode {
  return node.type === 'RECTANGLE';
}

/**
 * Type guard for VectorNode
 */
export function isVectorNode(node: SceneNode): node is VectorNode {
  return node.type === 'VECTOR' || 
         node.type === 'LINE' || 
         node.type === 'ARROW' || 
         node.type === 'ELLIPSE' || 
         node.type === 'POLYGON' || 
         node.type === 'STAR';
}

/**
 * Type guard for ImageNode
 */
export function isImageNode(node: SceneNode): node is ImageNode {
  return node.type === 'IMAGE';
}

/**
 * Type guard for InstanceNode
 */
export function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === 'INSTANCE';
}

/**
 * Type guard for CommentNode
 */
export function isCommentNode(node: SceneNode): node is CommentNode {
  return node.type === 'COMMENT';
}

/**
 * Type guard for nodes that have width property
 */
export function hasWidth(node: SceneNode): node is SceneNode & { width: number } {
  return 'width' in node && typeof (node as any).width === 'number';
}

/**
 * Type guard for nodes that have height property
 */
export function hasHeight(node: SceneNode): node is SceneNode & { height: number } {
  return 'height' in node && typeof (node as any).height === 'number';
}

/**
 * Type guard for nodes that have both width and height properties
 */
export function hasDimensions(node: SceneNode): node is SceneNode & { width: number; height: number } {
  return hasWidth(node) && hasHeight(node);
}

/**
 * Type guard for nodes that have fill property
 */
export function hasFill(node: SceneNode): node is SceneNode & { fill: { r: number; g: number; b: number; a: number } } {
  return 'fill' in node && typeof (node as any).fill === 'object';
}
