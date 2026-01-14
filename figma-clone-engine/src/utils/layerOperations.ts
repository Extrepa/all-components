/**
 * Layer ordering operations (Z-index management)
 */

import { DesignState, NodeId, SceneNode, FrameNode } from '../types';

/**
 * Get the parent's children array for a node
 */
function getSiblingArray(state: DesignState, nodeId: NodeId): NodeId[] | null {
  const node = state.nodes[nodeId];
  if (!node) return null;
  
  if (node.parent) {
    const parent = state.nodes[node.parent];
    if (parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT')) {
      return (parent as FrameNode).children;
    }
  } else {
    return state.rootIds;
  }
  
  return null;
}

/**
 * Get the index of a node in its sibling array
 */
function getNodeIndex(siblings: NodeId[], nodeId: NodeId): number {
  return siblings.indexOf(nodeId);
}

/**
 * Bring node forward (move up one position in z-order)
 */
export function bringForward(state: DesignState, nodeId: NodeId): DesignState {
  const siblings = getSiblingArray(state, nodeId);
  if (!siblings) return state;
  
  const index = getNodeIndex(siblings, nodeId);
  if (index === -1 || index === siblings.length - 1) return state; // Already at front
  
  const newSiblings = [...siblings];
  [newSiblings[index], newSiblings[index + 1]] = [newSiblings[index + 1], newSiblings[index]];
  
  return updateSiblingArray(state, nodeId, newSiblings);
}

/**
 * Send node backward (move down one position in z-order)
 */
export function sendBackward(state: DesignState, nodeId: NodeId): DesignState {
  const siblings = getSiblingArray(state, nodeId);
  if (!siblings) return state;
  
  const index = getNodeIndex(siblings, nodeId);
  if (index === -1 || index === 0) return state; // Already at back
  
  const newSiblings = [...siblings];
  [newSiblings[index], newSiblings[index - 1]] = [newSiblings[index - 1], newSiblings[index]];
  
  return updateSiblingArray(state, nodeId, newSiblings);
}

/**
 * Bring node to front (move to end of array)
 */
export function bringToFront(state: DesignState, nodeId: NodeId): DesignState {
  const siblings = getSiblingArray(state, nodeId);
  if (!siblings) return state;
  
  const index = getNodeIndex(siblings, nodeId);
  if (index === -1 || index === siblings.length - 1) return state; // Already at front
  
  const newSiblings = [...siblings];
  newSiblings.splice(index, 1);
  newSiblings.push(nodeId);
  
  return updateSiblingArray(state, nodeId, newSiblings);
}

/**
 * Send node to back (move to start of array)
 */
export function sendToBack(state: DesignState, nodeId: NodeId): DesignState {
  const siblings = getSiblingArray(state, nodeId);
  if (!siblings) return state;
  
  const index = getNodeIndex(siblings, nodeId);
  if (index === -1 || index === 0) return state; // Already at back
  
  const newSiblings = [...siblings];
  newSiblings.splice(index, 1);
  newSiblings.unshift(nodeId);
  
  return updateSiblingArray(state, nodeId, newSiblings);
}

/**
 * Update the sibling array (either rootIds or parent's children)
 */
function updateSiblingArray(state: DesignState, nodeId: NodeId, newSiblings: NodeId[]): DesignState {
  const node = state.nodes[nodeId];
  if (!node) return state;
  
  if (node.parent) {
    const parent = state.nodes[node.parent];
    if (parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT')) {
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [node.parent]: {
            ...parent,
            children: newSiblings
          } as FrameNode
        }
      };
    }
  } else {
    return {
      ...state,
      rootIds: newSiblings
    };
  }
  
  return state;
}

/**
 * Lock/unlock a node
 */
export function toggleLock(state: DesignState, nodeId: NodeId): DesignState {
  const node = state.nodes[nodeId];
  if (!node) return state;
  
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        locked: !node.locked
      }
    }
  };
}

/**
 * Apply toggle lock to multiple nodes
 */
export function toggleLockSelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  return nodeIds.reduce((acc, id) => toggleLock(acc, id), state);
}

/**
 * Lock all selected nodes
 */
export function lockSelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  nodeIds.forEach(id => {
    const node = newNodes[id];
    if (node && !node.locked) {
      newNodes[id] = { ...node, locked: true };
    }
  });
  
  return { ...state, nodes: newNodes };
}

/**
 * Unlock all selected nodes
 */
export function unlockSelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  nodeIds.forEach(id => {
    const node = newNodes[id];
    if (node && node.locked) {
      newNodes[id] = { ...node, locked: false };
    }
  });
  
  return { ...state, nodes: newNodes };
}

/**
 * Show/hide a node
 */
export function toggleVisibility(state: DesignState, nodeId: NodeId): DesignState {
  const node = state.nodes[nodeId];
  if (!node) return state;
  
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        visible: !node.visible
      }
    }
  };
}

/**
 * Apply toggle visibility to multiple nodes
 */
export function toggleVisibilitySelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  return nodeIds.reduce((acc, id) => toggleVisibility(acc, id), state);
}

/**
 * Hide all selected nodes
 */
export function hideSelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  nodeIds.forEach(id => {
    const node = newNodes[id];
    if (node && node.visible) {
      newNodes[id] = { ...node, visible: false };
    }
  });
  
  return { ...state, nodes: newNodes };
}

/**
 * Show all selected nodes
 */
export function showSelection(state: DesignState, nodeIds: NodeId[]): DesignState {
  if (nodeIds.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  nodeIds.forEach(id => {
    const node = newNodes[id];
    if (node && !node.visible) {
      newNodes[id] = { ...node, visible: true };
    }
  });
  
  return { ...state, nodes: newNodes };
}
