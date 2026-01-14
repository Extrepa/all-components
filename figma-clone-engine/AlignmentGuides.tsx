/**
 * Alignment Guides Component
 * Shows visual guides when aligning objects
 */

import React, { useEffect, useState } from 'react';
import { DesignState, SceneNode } from '../types';

interface AlignmentGuidesProps {
  state: DesignState;
  containerRef: React.RefObject<HTMLDivElement>;
  getAbsolutePosition: (id: string, nodes: Record<string, SceneNode>) => { x: number; y: number };
  draggedNodeId?: string;
  dragPosition?: { x: number; y: number };
}

interface Guide {
  type: 'horizontal' | 'vertical';
  position: number;
  nodes: string[];
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  state,
  containerRef,
  getAbsolutePosition,
  draggedNodeId,
  dragPosition
}) => {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    if (!draggedNodeId || !dragPosition || state.selection.length !== 1) {
      setGuides([]);
      return;
    }

    const draggedNode = state.nodes[draggedNodeId];
    if (!draggedNode) {
      setGuides([]);
      return;
    }

    const newGuides: Guide[] = [];
    const threshold = 5; // Pixels threshold for alignment detection
    
    const draggedAbs = dragPosition;
    const draggedWidth = (draggedNode as any).width || 0;
    const draggedHeight = (draggedNode as any).height || 0;
    
    // Check alignment with other nodes
    const otherNodes = Object.values(state.nodes).filter(
      node => node.id !== draggedNodeId && node.visible && !node.locked
    );

    otherNodes.forEach(otherNode => {
      const otherAbs = getAbsolutePosition(otherNode.id, state.nodes);
      const otherWidth = (otherNode as any).width || 0;
      const otherHeight = (otherNode as any).height || 0;

      // Horizontal alignment checks (top, center, bottom)
      const draggedTop = draggedAbs.y;
      const draggedCenter = draggedAbs.y + draggedHeight / 2;
      const draggedBottom = draggedAbs.y + draggedHeight;
      
      const otherTop = otherAbs.y;
      const otherCenter = otherAbs.y + otherHeight / 2;
      const otherBottom = otherAbs.y + otherHeight;

      // Top alignment
      if (Math.abs(draggedTop - otherTop) < threshold) {
        newGuides.push({ type: 'horizontal', position: otherTop, nodes: [draggedNodeId, otherNode.id] });
      }
      
      // Center alignment
      if (Math.abs(draggedCenter - otherCenter) < threshold) {
        newGuides.push({ type: 'horizontal', position: otherCenter, nodes: [draggedNodeId, otherNode.id] });
      }
      
      // Bottom alignment
      if (Math.abs(draggedBottom - otherBottom) < threshold) {
        newGuides.push({ type: 'horizontal', position: otherBottom, nodes: [draggedNodeId, otherNode.id] });
      }

      // Vertical alignment checks (left, center, right)
      const draggedLeft = draggedAbs.x;
      const draggedCenterX = draggedAbs.x + draggedWidth / 2;
      const draggedRight = draggedAbs.x + draggedWidth;
      
      const otherLeft = otherAbs.x;
      const otherCenterX = otherAbs.x + otherWidth / 2;
      const otherRight = otherAbs.x + otherWidth;

      // Left alignment
      if (Math.abs(draggedLeft - otherLeft) < threshold) {
        newGuides.push({ type: 'vertical', position: otherLeft, nodes: [draggedNodeId, otherNode.id] });
      }
      
      // Center alignment
      if (Math.abs(draggedCenterX - otherCenterX) < threshold) {
        newGuides.push({ type: 'vertical', position: otherCenterX, nodes: [draggedNodeId, otherNode.id] });
      }
      
      // Right alignment
      if (Math.abs(draggedRight - otherRight) < threshold) {
        newGuides.push({ type: 'vertical', position: otherRight, nodes: [draggedNodeId, otherNode.id] });
      }
    });

    // Deduplicate guides
    const uniqueGuides = newGuides.filter((guide, index, self) =>
      index === self.findIndex(g => 
        g.type === guide.type && Math.abs(g.position - guide.position) < 1
      )
    );

    setGuides(uniqueGuides);
  }, [state.nodes, draggedNodeId, dragPosition, state.selection, getAbsolutePosition]);

  if (guides.length === 0 || !containerRef.current) return null;

  const rect = containerRef.current.getBoundingClientRect();
  const viewportX = state.viewport.x;
  const viewportY = state.viewport.y;
  const zoom = state.viewport.zoom;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: rect.width,
        height: rect.height,
      }}
    >
      {guides.map((guide, index) => {
        if (guide.type === 'horizontal') {
          const screenY = guide.position * zoom + viewportY;
          return (
            <line
              key={`h-${index}`}
              x1={0}
              y1={screenY}
              x2={rect.width}
              y2={screenY}
              stroke="#00a8ff"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.8}
            />
          );
        } else {
          const screenX = guide.position * zoom + viewportX;
          return (
            <line
              key={`v-${index}`}
              x1={screenX}
              y1={0}
              x2={screenX}
              y2={rect.height}
              stroke="#00a8ff"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.8}
            />
          );
        }
      })}
    </svg>
  );
};

