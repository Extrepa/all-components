/**
 * Migration utilities for backward compatibility
 * Ensures old saved files work with new type definitions
 */

// Type definitions (matching App.tsx)
type NodeId = string;
type Color = { r: number; g: number; b: number; a: number };

interface BaseNode {
  id: NodeId;
  name: string;
  parent: NodeId | null;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
}

interface TextNode extends BaseNode {
  type: 'TEXT';
  content: string;
  fontSize: number;
  fill: Color;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  opacity?: number;
  boxShadow?: string;
}

interface FrameNode extends BaseNode {
  type: 'FRAME' | 'COMPONENT';
  width: number;
  height: number;
  fill: Color;
  children: NodeId[];
  cornerRadius: number;
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  itemSpacing: number;
  padding: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'wrap' | 'nowrap';
  margin?: number | { top: number; right: number; bottom: number; left: number };
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

interface RectangleNode extends BaseNode {
  type: 'RECTANGLE';
  width: number;
  height: number;
  fill: Color;
  cornerRadius: number;
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

type SceneNode = TextNode | FrameNode | RectangleNode | any; // any for other node types

/**
 * Migrates a node to include default values for new optional properties
 * This ensures backward compatibility with saved files that don't have new properties
 */
export const migrateNode = (node: SceneNode): SceneNode => {
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    return {
      ...textNode,
      fontFamily: textNode.fontFamily || 'Inter, sans-serif',
      fontWeight: textNode.fontWeight || 'normal',
      textAlign: textNode.textAlign || 'left',
      textDecoration: textNode.textDecoration || 'none',
      // lineHeight and letterSpacing remain undefined if not set (no defaults)
    } as TextNode;
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    const frameNode = node as FrameNode;
    return {
      ...frameNode,
      alignItems: frameNode.alignItems || 'stretch',
      justifyContent: frameNode.justifyContent || 'start',
      flexWrap: frameNode.flexWrap || 'nowrap',
      // margin remains undefined if not set
      // Stylable properties remain undefined if not set
    } as FrameNode;
  }

  if (node.type === 'RECTANGLE') {
    const rectNode = node as RectangleNode;
    return {
      ...rectNode,
      borderStyle: rectNode.borderStyle || (rectNode.borderWidth ? 'solid' : undefined),
      // Other stylable properties remain undefined if not set
    } as RectangleNode;
  }

  // Other node types don't need migration yet
  return node;
};

/**
 * Migrates an entire design state
 */
export const migrateDesignState = (state: { nodes: Record<string, SceneNode> }): Record<string, SceneNode> => {
  const migratedNodes: Record<string, SceneNode> = {};
  
  for (const [id, node] of Object.entries(state.nodes)) {
    migratedNodes[id] = migrateNode(node);
  }
  
  return migratedNodes;
};

