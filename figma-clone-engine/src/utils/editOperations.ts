import { DesignState, SceneNode, FrameNode, NodeId } from '../types';
import { generateId } from './helpers';

export const handleCopy = (state: DesignState): SceneNode[] => {
  if (state.selection.length === 0) return [];
  return state.selection.map(id => state.nodes[id]).filter(Boolean);
};

export const handleCut = (state: DesignState, setClipboard: (nodes: SceneNode[]) => void, handleDelete: () => void) => {
  const copied = handleCopy(state);
  setClipboard(copied);
  handleDelete();
};

export const handlePaste = (
  state: DesignState,
  clipboard: SceneNode[],
  pushToHistory: (state: DesignState) => void
): DesignState => {
  if (clipboard.length === 0) return state;
  
  const newNodes: Record<string, SceneNode> = { ...state.nodes };
  const newRootIds = [...state.rootIds];
  const newSelection: string[] = [];
  const offset = 20;
  
  clipboard.forEach(node => {
    const newId = generateId();
    const newNode = {
      ...node,
      id: newId,
      x: node.x + offset,
      y: node.y + offset,
      parent: null
    };
    newNodes[newId] = newNode as SceneNode;
    newRootIds.push(newId);
    newSelection.push(newId);
  });
  
  return {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: newSelection
  };
};

export const handleDelete = (
  state: DesignState,
  pushToHistory: (state: DesignState) => void
): DesignState => {
  if (state.selection.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  const newRootIds = state.rootIds.filter(id => !state.selection.includes(id));
  
  const removeNode = (nodeId: string) => {
    const node = newNodes[nodeId];
    if (!node) return;
    
    if ((node.type === 'FRAME' || node.type === 'COMPONENT')) {
      const frame = node as FrameNode;
      frame.children.forEach(childId => removeNode(childId));
    }
    
    delete newNodes[nodeId];
  };
  
  state.selection.forEach(id => removeNode(id));
  
  Object.values(newNodes).forEach(node => {
    if ((node.type === 'FRAME' || node.type === 'COMPONENT')) {
      const frame = node as FrameNode;
      frame.children = frame.children.filter(id => !state.selection.includes(id));
    }
  });
  
  return {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: []
  };
};

export const handleDuplicate = (
  state: DesignState,
  pushToHistory: (state: DesignState) => void
): DesignState => {
  if (state.selection.length === 0) return state;
  
  const newNodes: Record<string, SceneNode> = { ...state.nodes };
  const newRootIds = [...state.rootIds];
  const newSelection: string[] = [];
  const offset = 20;
  
  const duplicateNode = (nodeId: string, parentId: string | null = null): string => {
    const node = state.nodes[nodeId];
    if (!node) return '';
    
    const newId = generateId();
    const newNode = {
      ...node,
      id: newId,
      x: node.x + offset,
      y: node.y + offset,
      parent: parentId
    };
    
    newNodes[newId] = newNode as SceneNode;
    
    if ((node.type === 'FRAME' || node.type === 'COMPONENT')) {
      const frame = node as FrameNode;
      const newFrame = newNode as FrameNode;
      newFrame.children = frame.children.map(childId => duplicateNode(childId, newId));
    }
    
    return newId;
  };
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (node && !node.parent) {
      const newId = duplicateNode(id);
      newRootIds.push(newId);
      newSelection.push(newId);
    }
  });
  
  return {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: newSelection
  };
};

