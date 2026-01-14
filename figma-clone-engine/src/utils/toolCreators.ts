/**
 * Tool creation functions
 * Functions to create new nodes for each tool type
 */

import { 
  DesignState, SceneNode, FrameNode, RectangleNode, TextNode, 
  VectorNode, CommentNode, InstanceNode, ImageNode, NodeId, Point, ToolType
} from '../types';
import { createColor, generateId, snapToGrid } from './helpers';
import { findParentFrameAtPoint } from './interactionHelpers';
import { getAbsolutePosition } from './canvasHelpers';
import { isFrameNode } from './typeGuards';

/**
 * Options for creating a new node
 */
interface CreateNodeOptions {
  x: number;
  y: number;
  state: DesignState;
  parentFrame?: FrameNode | null;
}

/**
 * Result of creating a new node
 */
export interface CreateNodeResult {
  node: SceneNode;
  nodeId: NodeId;
  parentFrame: FrameNode | null;
  absPos: Point;
}

/**
 * Create a new frame node
 */
export function createFrameNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  
  const newId = generateId();
  const newNode: FrameNode = {
    id: newId,
    type: 'FRAME',
    name: 'Frame',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? x - absPos.x : x,
    y: parentFrame ? y - absPos.y : y,
    width: 200,
    height: 200,
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
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new rectangle node
 */
export function createRectangleNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  
  const newId = generateId();
  const newNode: RectangleNode = {
    id: newId,
    type: 'RECTANGLE',
    name: 'Rectangle',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? x - absPos.x : x,
    y: parentFrame ? y - absPos.y : y,
    width: 100,
    height: 100,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(59, 130, 246, 1),
    cornerRadius: 0
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new text node
 */
export function createTextNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  
  const newId = generateId();
  const newNode: TextNode = {
    id: newId,
    type: 'TEXT',
    name: 'Text',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? x - absPos.x : x,
    y: parentFrame ? y - absPos.y : y,
    rotation: 0,
    visible: true,
    locked: false,
    content: 'Text',
    fontSize: 16,
    fill: createColor(255, 255, 255, 1)
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new line/arrow node
 */
export function createLineNode(
  options: CreateNodeOptions, 
  isArrow: boolean = false
): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: VectorNode = {
    id: newId,
    type: 'VECTOR',
    name: isArrow ? 'Arrow' : 'Line',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? snappedX - absPos.x : snappedX,
    y: parentFrame ? snappedY - absPos.y : snappedY,
    width: 100,
    height: 2,
    rotation: 0,
    visible: true,
    locked: false,
    points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
    stroke: createColor(255, 255, 255, 1),
    strokeWidth: 2
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new ellipse node
 */
export function createEllipseNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: VectorNode = {
    id: newId,
    type: 'VECTOR',
    name: 'Ellipse',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? snappedX - absPos.x : snappedX,
    y: parentFrame ? snappedY - absPos.y : snappedY,
    width: 100,
    height: 100,
    rotation: 0,
    visible: true,
    locked: false,
    points: [], // Will be calculated as ellipse path
    stroke: createColor(59, 130, 246, 1),
    strokeWidth: 2,
    fill: createColor(59, 130, 246, 0.2)
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new polygon node
 */
export function createPolygonNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: VectorNode = {
    id: newId,
    type: 'VECTOR',
    name: 'Polygon',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? snappedX - absPos.x : snappedX,
    y: parentFrame ? snappedY - absPos.y : snappedY,
    width: 100,
    height: 100,
    rotation: 0,
    visible: true,
    locked: false,
    points: [], // Will be calculated as polygon path
    stroke: createColor(59, 130, 246, 1),
    strokeWidth: 2,
    fill: createColor(59, 130, 246, 0.2)
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Create a new star node
 */
export function createStarNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: VectorNode = {
    id: newId,
    type: 'VECTOR',
    name: 'Star',
    parent: null,
    x: snappedX,
    y: snappedY,
    width: 100,
    height: 100,
    rotation: 0,
    visible: true,
    locked: false,
    points: [], // Will be calculated as star path
    stroke: createColor(59, 130, 246, 1),
    strokeWidth: 2,
    fill: createColor(59, 130, 246, 0.2)
  };
  
  return { node: newNode, nodeId: newId, parentFrame: null, absPos: { x: 0, y: 0 } };
}

/**
 * Create a new section node (similar to FRAME)
 */
export function createSectionNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: FrameNode = {
    id: newId,
    type: 'FRAME',
    name: 'Section',
    parent: null,
    x: snappedX,
    y: snappedY,
    width: 200,
    height: 200,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(40, 40, 40, 1),
    children: [],
    cornerRadius: 0,
    layoutMode: 'NONE',
    itemSpacing: 0,
    padding: 0
  };
  
  return { node: newNode, nodeId: newId, parentFrame: null, absPos: { x: 0, y: 0 } };
}

/**
 * Create a new slice node (similar to FRAME but with different styling)
 */
export function createSliceNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: FrameNode = {
    id: newId,
    type: 'FRAME',
    name: 'Slice',
    parent: null,
    x: snappedX,
    y: snappedY,
    width: 200,
    height: 200,
    rotation: 0,
    visible: true,
    locked: false,
    fill: createColor(255, 255, 255, 0.1),
    children: [],
    cornerRadius: 0,
    layoutMode: 'NONE',
    itemSpacing: 0,
    padding: 0,
    borderColor: createColor(255, 0, 0, 0.5),
    borderWidth: 1,
    borderStyle: 'dashed'
  };
  
  return { node: newNode, nodeId: newId, parentFrame: null, absPos: { x: 0, y: 0 } };
}

/**
 * Create a new comment node
 */
export function createCommentNode(options: CreateNodeOptions): CreateNodeResult {
  const { x, y, state } = options;
  const parentFrame = findParentFrameAtPoint(x, y, state);
  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
  const snappedX = snapToGrid(x, state.gridSize, state.snapToGrid);
  const snappedY = snapToGrid(y, state.gridSize, state.snapToGrid);
  
  const newId = generateId();
  const newNode: CommentNode = {
    id: newId,
    type: 'COMMENT',
    name: 'Comment',
    parent: parentFrame ? parentFrame.id : null,
    x: parentFrame ? snappedX - absPos.x : snappedX,
    y: parentFrame ? snappedY - absPos.y : snappedY,
    width: 200,
    height: 120,
    rotation: 0,
    visible: true,
    locked: false,
    text: 'Add a comment...',
    resolved: false
  };
  
  return { node: newNode, nodeId: newId, parentFrame, absPos };
}

/**
 * Add a created node to the state
 * Returns updated state with the new node added
 */
export function addNodeToState(
  state: DesignState,
  result: CreateNodeResult
): { nodes: Record<NodeId, SceneNode>; rootIds: NodeId[] } {
  const { node, nodeId, parentFrame } = result;
  const newNodes = { ...state.nodes, [nodeId]: node };
  let newRootIds = [...state.rootIds];
  
  // Add to parent's children or rootIds
  if (parentFrame) {
    const parent = state.nodes[parentFrame.id];
    if (isFrameNode(parent)) {
      newNodes[parentFrame.id] = {
        ...parent,
        children: [...parent.children, nodeId]
      };
    }
  } else {
    newRootIds = [...newRootIds, nodeId];
  }
  
  return { nodes: newNodes, rootIds: newRootIds };
}
