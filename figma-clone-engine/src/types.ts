/**
 * Shared types for the Figma Clone Engine
 */

export type Point = { x: number; y: number };
export type Color = { r: number; g: number; b: number; a: number };
export type NodeId = string;

export interface BaseNode {
  id: NodeId;
  name: string;
  parent: NodeId | null;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  // Constraints
  constraints?: {
    horizontal: 'left' | 'center' | 'right' | 'left-right' | 'scale';
    vertical: 'top' | 'center' | 'bottom' | 'top-bottom' | 'scale';
  };
  // Blend Mode
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';
}

export interface FrameNode extends BaseNode {
  type: 'FRAME' | 'COMPONENT'; 
  width: number;
  height: number;
  fill: Color;
  children: NodeId[];
  cornerRadius: number;
  // Auto-Layout Props
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  itemSpacing: number; // Gap
  padding: number;
  // Layout Extensions
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'wrap' | 'nowrap';
  margin?: number | { top: number; right: number; bottom: number; left: number };
  // Frame-specific
  clipContent?: boolean;
  overflow?: 'visible' | 'hidden' | 'scroll';
  // Stylable Properties
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

export interface RectangleNode extends BaseNode {
  type: 'RECTANGLE';
  width: number;
  height: number;
  fill: Color;
  cornerRadius: number;
  // Stylable Properties (shared with other nodes)
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

export interface TextNode extends BaseNode {
  type: 'TEXT';
  content: string;
  fontSize: number;
  fill: Color;
  // Typography Extensions
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  // Stylable Properties
  opacity?: number;
  boxShadow?: string;
}

export interface VectorNode extends BaseNode {
  type: 'VECTOR';
  width: number;
  height: number;
  points: Point[];
  stroke: Color;
  strokeWidth: number;
  // Vector-specific
  strokeAlign?: 'inside' | 'center' | 'outside';
  strokeCap?: 'round' | 'square' | 'flat';
  strokeJoin?: 'miter' | 'round' | 'bevel';
  strokeDashArray?: number[];
  fill?: Color;
}

export interface ImageNode extends BaseNode {
  type: 'IMAGE';
  width: number;
  height: number;
  src: string;
  opacity: number;
  // Image-specific
  imageFillMode?: 'fill' | 'fit' | 'crop' | 'tile';
  imageFills?: Array<{ type: 'image'; src: string; scaleMode: 'fill' | 'fit' | 'crop' | 'tile' }>;
}

export interface InstanceNode extends BaseNode {
  type: 'INSTANCE';
  masterComponentId: NodeId;
  width: number;
  height: number;
  overrides: Record<string, any>; 
}

export interface CommentNode extends BaseNode {
  type: 'COMMENT';
  width: number;
  height: number;
  text: string;
  author?: string;
  resolved?: boolean;
}

export type SceneNode = FrameNode | RectangleNode | TextNode | VectorNode | InstanceNode | ImageNode | CommentNode;

export interface DesignState {
  nodes: Record<NodeId, SceneNode>;
  rootIds: NodeId[];
  selection: NodeId[];
  viewport: { x: number; y: number; zoom: number };
  mode: 'DESIGN' | 'DEV';
  projectName?: string; // Default: "Untitled"
  snapToGrid: boolean; // Grid snapping enabled/disabled
  gridSize: number;    // Grid size in pixels (default: 8)
}

export type ToolType = 'SELECT' | 'FRAME' | 'RECTANGLE' | 'TEXT' | 'PEN' | 'HAND' | 'LINE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'ARROW' | 'SLICE' | 'SECTION' | 'SCALE' | 'PENCIL' | 'COMMENT' | 'EYEDROPPER';

