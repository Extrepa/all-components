import { DesignState, SceneNode } from '../types';
import { getAbsolutePosition } from './canvasHelpers';
import { hasWidth, hasHeight } from './typeGuards';

/**
 * Flips selected nodes horizontally by rotating them 180 degrees.
 * @param state Current design state
 * @returns New design state with flipped nodes
 */
export function flipHorizontal(state: DesignState): DesignState {
  if (state.selection.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  
  state.selection.forEach(id => {
    const node = newNodes[id];
    if (!node) return;
    
    const absPos = getAbsolutePosition(id, newNodes);
    const width = hasWidth(node) ? node.width : 100;
    const newX = absPos.x + width;
    
    newNodes[id] = {
      ...node,
      x: node.parent ? node.x : newX,
      rotation: node.rotation + 180
    } as SceneNode;
  });
  
  return { ...state, nodes: newNodes };
}

/**
 * Flips selected nodes vertically by rotating them 180 degrees.
 * @param state Current design state
 * @returns New design state with flipped nodes
 */
export function flipVertical(state: DesignState): DesignState {
  if (state.selection.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  
  state.selection.forEach(id => {
    const node = newNodes[id];
    if (!node) return;
    
    const absPos = getAbsolutePosition(id, newNodes);
    const height = hasHeight(node) ? node.height : 100;
    const newY = absPos.y + height;
    
    newNodes[id] = {
      ...node,
      y: node.parent ? node.y : newY,
      rotation: node.rotation + 180
    } as SceneNode;
  });
  
  return { ...state, nodes: newNodes };
}
