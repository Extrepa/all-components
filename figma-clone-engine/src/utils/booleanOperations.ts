/**
 * Boolean Operations Utilities
 * Basic boolean operations for combining shapes
 */

import { DesignState, SceneNode, FrameNode, RectangleNode, VectorNode, NodeId } from '../types';
import { generateId } from './helpers';

/**
 * Apply boolean operation to selected nodes
 * Note: Full implementation requires path manipulation - this is a basic version
 */
export function applyBooleanOperation(
  state: DesignState,
  operation: 'union' | 'subtract' | 'intersect' | 'exclude' | 'flatten',
  nodeIds: NodeId[]
): DesignState {
  if (nodeIds.length < 2) return state;

  // For now, mark nodes with boolean operation type
  // Full implementation would require:
  // 1. Convert shapes to paths
  // 2. Apply boolean algebra algorithms
  // 3. Merge paths appropriately
  // 4. Create new combined shape

  const newNodes = { ...state.nodes };
  
  nodeIds.forEach((nodeId, index) => {
    const node = newNodes[nodeId];
    if (node) {
      // Store boolean operation metadata
      (newNodes[nodeId] as any).booleanOperation = index === 0 ? null : operation;
      (newNodes[nodeId] as any).booleanTarget = index === 0 ? null : nodeIds[0];
    }
  });

  return {
    ...state,
    nodes: newNodes
  };
}

/**
 * Union: Combine shapes into one
 */
export function unionShapes(state: DesignState, nodeIds: NodeId[]): DesignState {
  return applyBooleanOperation(state, 'union', nodeIds);
}

/**
 * Subtract: Remove overlapping areas from first shape
 */
export function subtractShapes(state: DesignState, nodeIds: NodeId[]): DesignState {
  return applyBooleanOperation(state, 'subtract', nodeIds);
}

/**
 * Intersect: Keep only overlapping areas
 */
export function intersectShapes(state: DesignState, nodeIds: NodeId[]): DesignState {
  return applyBooleanOperation(state, 'intersect', nodeIds);
}

/**
 * Exclude: Remove overlapping areas from both shapes
 */
export function excludeShapes(state: DesignState, nodeIds: NodeId[]): DesignState {
  return applyBooleanOperation(state, 'exclude', nodeIds);
}

/**
 * Flatten: Merge all shapes into a single path
 */
export function flattenShapes(state: DesignState, nodeIds: NodeId[]): DesignState {
  return applyBooleanOperation(state, 'flatten', nodeIds);
}

/**
 * Use as mask: Make first node a clipping mask for others
 */
export function useAsMask(state: DesignState, maskId: NodeId, targetIds: NodeId[]): DesignState {
  const newNodes = { ...state.nodes };
  
  targetIds.forEach(targetId => {
    const node = newNodes[targetId];
    if (node) {
      (newNodes[targetId] as any).clipMask = maskId;
    }
  });

  return {
    ...state,
    nodes: newNodes
  };
}

