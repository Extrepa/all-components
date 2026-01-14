import { DesignState, FrameNode, NodeId } from '../types';
import { generateId, createColor } from './helpers';

export const getAbsolutePosition = (nodeId: string, nodes: Record<string, any>): { x: number; y: number } => {
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
};

export const handleGroup = (
  state: DesignState
): DesignState => {
  if (state.selection.length < 2) return state;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (!node) return;
    const absPos = getAbsolutePosition(id, state.nodes);
    const width = (node as any).width || 100;
    const height = (node as any).height || 100;
    minX = Math.min(minX, absPos.x);
    minY = Math.min(minY, absPos.y);
    maxX = Math.max(maxX, absPos.x + width);
    maxY = Math.max(maxY, absPos.y + height);
  });
  
  if (minX === Infinity) return state;
  
  const padding = 20;
  const newId = generateId();
  const newFrame: FrameNode = {
    id: newId,
    type: 'FRAME',
    name: 'Frame',
    parent: null,
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(30, 30, 30, 1),
    children: [],
    cornerRadius: 0,
    layoutMode: 'NONE',
    itemSpacing: 0,
    padding: 0
  };
  
  const newNodes = { ...state.nodes, [newId]: newFrame };
  const newRootIds = [...state.rootIds, newId];
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (!node || node.parent) return;
    
    const absPos = getAbsolutePosition(id, newNodes);
    newNodes[id] = {
      ...node,
      parent: newId,
      x: absPos.x - newFrame.x,
      y: absPos.y - newFrame.y
    } as any;
    
    newFrame.children.push(id);
    const index = newRootIds.indexOf(id);
    if (index > -1) {
      newRootIds.splice(index, 1);
    }
  });
  
  return {
    ...state,
    nodes: { ...newNodes, [newId]: { ...newFrame, children: newFrame.children } },
    rootIds: newRootIds,
    selection: [newId]
  };
};

export const handleUngroup = (
  state: DesignState
): DesignState => {
  if (state.selection.length === 0) return state;
  
  const newNodes = { ...state.nodes };
  const newRootIds = [...state.rootIds];
  const newSelection: NodeId[] = [];
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (!node || (node.type !== 'FRAME' && node.type !== 'COMPONENT')) return;
    
    const frame = node as FrameNode;
    const absPos = getAbsolutePosition(id, newNodes);
    
    frame.children.forEach(childId => {
      const child = newNodes[childId];
      if (!child) return;
      
      newNodes[childId] = {
        ...child,
        parent: null,
        x: absPos.x + child.x,
        y: absPos.y + child.y
      } as any;
      
      newRootIds.push(childId);
      newSelection.push(childId);
    });
    
    delete newNodes[id];
    const index = newRootIds.indexOf(id);
    if (index > -1) {
      newRootIds.splice(index, 1);
    }
  });
  
  return {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: newSelection.length > 0 ? newSelection : []
  };
};

export const handleFrameSelection = (
  state: DesignState
): DesignState => {
  if (state.selection.length === 0) return state;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (!node) return;
    const absPos = getAbsolutePosition(id, state.nodes);
    const width = (node as any).width || 100;
    const height = (node as any).height || 100;
    minX = Math.min(minX, absPos.x);
    minY = Math.min(minY, absPos.y);
    maxX = Math.max(maxX, absPos.x + width);
    maxY = Math.max(maxY, absPos.y + height);
  });
  
  if (minX === Infinity) return state;
  
  const padding = 20;
  const newId = generateId();
  const newFrame: FrameNode = {
    id: newId,
    type: 'FRAME',
    name: 'Frame',
    parent: null,
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(30, 30, 30, 1),
    children: [],
    cornerRadius: 0,
    layoutMode: 'NONE',
    itemSpacing: 0,
    padding: 0
  };
  
  const newNodes = { ...state.nodes, [newId]: newFrame };
  const newRootIds = [...state.rootIds, newId];
  
  state.selection.forEach(id => {
    const node = state.nodes[id];
    if (!node || node.parent) return;
    
    const absPos = getAbsolutePosition(id, newNodes);
    newNodes[id] = {
      ...node,
      parent: newId,
      x: absPos.x - newFrame.x,
      y: absPos.y - newFrame.y
    } as any;
    
    newFrame.children.push(id);
    const index = newRootIds.indexOf(id);
    if (index > -1) {
      newRootIds.splice(index, 1);
    }
  });
  
  return {
    ...state,
    nodes: { ...newNodes, [newId]: { ...newFrame, children: newFrame.children } },
    rootIds: newRootIds,
    selection: [newId]
  };
};

