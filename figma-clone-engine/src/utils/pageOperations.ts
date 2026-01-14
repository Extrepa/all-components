import { DesignState, FrameNode, NodeId } from '../types';
import { generateId, createColor } from './helpers';
import { isFrameNode } from './typeGuards';

/**
 * Creates a new page (frame) in the design state.
 * @param state Current design state
 * @returns New design state with the added page
 */
export function addPage(state: DesignState): DesignState {
  const pageCount = state.rootIds.filter(id => {
    const node = state.nodes[id];
    return node && (node.type === 'FRAME' || node.type === 'COMPONENT');
  }).length;
  
  const newPageId = generateId();
  const newPage: FrameNode = {
    id: newPageId,
    type: 'FRAME',
    name: `Page ${pageCount + 1}`,
    parent: null,
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(255, 255, 255, 1),
    children: [],
    cornerRadius: 0,
    layoutMode: 'NONE',
    itemSpacing: 0,
    padding: 0
  };
  
  return {
    ...state,
    nodes: { ...state.nodes, [newPageId]: newPage },
    rootIds: [...state.rootIds, newPageId],
    selection: [newPageId]
  };
}

/**
 * Deletes a page and all its children from the design state.
 * Prevents deleting if it's the last page.
 * @param state Current design state
 * @param pageId ID of the page to delete
 * @returns New design state with the page removed, or the original state if deletion is not allowed
 */
export function deletePage(state: DesignState, pageId: NodeId): DesignState {
  // Prevent deleting if it's the last page
  const pages = state.rootIds.filter(id => {
    const node = state.nodes[id];
    return node && (node.type === 'FRAME' || node.type === 'COMPONENT');
  });
  
  if (pages.length <= 1) {
    // Don't allow deleting the last page
    return state;
  }
  
  // Delete the page and all its children
  const newNodes = { ...state.nodes };
  const newRootIds = state.rootIds.filter(id => id !== pageId);
  
  const removeNode = (nodeId: string) => {
    const node = newNodes[nodeId];
    if (!node) return;
    
    if ((node.type === 'FRAME' || node.type === 'COMPONENT')) {
      const frame = node as FrameNode;
      frame.children.forEach(childId => removeNode(childId));
    }
    
    delete newNodes[nodeId];
  };
  
  removeNode(pageId);
  
  // Update selection if deleted page was selected
  const newSelection = state.selection.filter(id => id !== pageId);
  
  // Select another page if the deleted one was selected
  const fallbackSelection = newSelection.length > 0 
    ? newSelection 
    : [newRootIds.find(id => {
        const node = newNodes[id];
        return node && (node.type === 'FRAME' || node.type === 'COMPONENT');
      }) || newRootIds[0]].filter(Boolean);
  
  return {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: fallbackSelection
  };
}
