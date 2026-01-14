import { SceneNode, FrameNode } from '../types';

/**
 * Calculate auto-layout for a frame or component
 */
export const calculateLayout = (nodeId: string, nodes: Record<string, SceneNode>): Record<string, SceneNode> => {
  const node = nodes[nodeId];
  if (!node || (node.type !== 'FRAME' && node.type !== 'COMPONENT')) return nodes;
  const frame = node as FrameNode;
  
  if (frame.layoutMode === 'NONE') return nodes;

  const newNodes = { ...nodes };
  const alignItems = frame.alignItems || 'stretch';
  const justifyContent = frame.justifyContent || 'start';
  
  // Calculate total content size first
  let totalMainAxis = 0;
  let maxCrossAxis = 0;
  const childSizes: Array<{ w: number; h: number }> = [];

  frame.children.forEach(childId => {
    const child = newNodes[childId];
    const childW = (child as any).width || 0;
    const childH = (child as any).height || 0;
    childSizes.push({ w: childW, h: childH });

    if (frame.layoutMode === 'HORIZONTAL') {
      totalMainAxis += childW;
      maxCrossAxis = Math.max(maxCrossAxis, childH);
    } else {
      totalMainAxis += childH;
      maxCrossAxis = Math.max(maxCrossAxis, childW);
    }
  });

  // Add spacing between items
  if (frame.children.length > 1) {
    totalMainAxis += frame.itemSpacing * (frame.children.length - 1);
  }
  
  // Calculate starting position based on justification
  let startPos = frame.padding;
  const availableSpace = (frame.layoutMode === 'HORIZONTAL' ? frame.width : frame.height) - (frame.padding * 2);
  if (justifyContent === 'center') {
    startPos = frame.padding + (availableSpace - totalMainAxis) / 2;
  } else if (justifyContent === 'end') {
    startPos = frame.padding + (availableSpace - totalMainAxis);
  } else if (justifyContent === 'space-between' && frame.children.length > 1) {
    const spaceBetween = (availableSpace - totalMainAxis) / (frame.children.length - 1);
    // Will be handled in loop
  }
  
  let cursor = startPos;

  frame.children.forEach((childId, idx) => {
    const child = newNodes[childId];
    const size = childSizes[idx];
    const childW = size.w;
    const childH = size.h;

    if (frame.layoutMode === 'HORIZONTAL') {
      let yPos = frame.padding;
      // Apply cross-axis alignment
      if (alignItems === 'center') {
        yPos = frame.padding + (maxCrossAxis - childH) / 2;
      } else if (alignItems === 'end') {
        yPos = frame.padding + (maxCrossAxis - childH);
      }
      
      // Apply main-axis justification
      let xPos = cursor;
      if (justifyContent === 'space-between' && frame.children.length > 1) {
        const totalWidth = childSizes.reduce((sum, s) => sum + s.w, 0) + (frame.itemSpacing * (frame.children.length - 1));
        const spaceBetween = (availableSpace - totalWidth) / (frame.children.length - 1);
        xPos = frame.padding + childSizes.slice(0, idx).reduce((sum, s) => sum + s.w + frame.itemSpacing + spaceBetween, 0);
      }
      
      newNodes[childId] = { ...child, x: xPos, y: yPos } as SceneNode;
      cursor += childW + frame.itemSpacing;
    } else {
      let xPos = frame.padding;
      // Apply cross-axis alignment
      if (alignItems === 'center') {
        xPos = frame.padding + (maxCrossAxis - childW) / 2;
      } else if (alignItems === 'end') {
        xPos = frame.padding + (maxCrossAxis - childW);
      }
      
      // Apply main-axis justification
      let yPos = cursor;
      if (justifyContent === 'space-between' && frame.children.length > 1) {
        const totalHeight = childSizes.reduce((sum, s) => sum + s.h, 0) + (frame.itemSpacing * (frame.children.length - 1));
        const spaceBetween = (availableSpace - totalHeight) / (frame.children.length - 1);
        yPos = frame.padding + childSizes.slice(0, idx).reduce((sum, s) => sum + s.h + frame.itemSpacing + spaceBetween, 0);
      }
      
      newNodes[childId] = { ...child, x: xPos, y: yPos } as SceneNode;
      cursor += childH + frame.itemSpacing;
    }
  });

  // Update frame size based on content
  const contentSize = Math.max(frame.padding, totalMainAxis + (frame.padding * 2));
  
  if (frame.layoutMode === 'HORIZONTAL') {
    newNodes[nodeId] = { ...frame, width: contentSize, height: maxCrossAxis + (frame.padding * 2) } as FrameNode;
  } else {
    newNodes[nodeId] = { ...frame, height: contentSize, width: maxCrossAxis + (frame.padding * 2) } as FrameNode;
  }

  return newNodes;
};

