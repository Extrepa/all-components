/**
 * Canvas component
 * Wrapper component for the canvas element with rendering logic
 */

import { useRef, useEffect } from 'react';
import { DesignState } from '../types';
import { useCanvas } from '../hooks/useCanvas';

interface CanvasProps {
  state: DesignState;
  hoveredId: string | null;
  onRef?: (ref: HTMLCanvasElement | null) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e?: React.PointerEvent) => void;
  onWheel?: (e: React.WheelEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * Canvas component that handles rendering of the design canvas
 */
export function Canvas({ 
  state, 
  hoveredId, 
  onRef, 
  containerRef: externalContainerRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onDragOver,
  onDrop,
  onDragLeave,
  onContextMenu,
  className
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const { renderScene } = useCanvas({ state, hoveredId, canvasRef, containerRef });

  useEffect(() => {
    if (onRef) {
      onRef(canvasRef.current);
    }
  }, [onRef, canvasRef.current]);

  useEffect(() => {
    renderScene();
  }, [renderScene]);

  return (
    <div 
      ref={containerRef} 
      className={className || "flex-1 relative bg-[#1e1e1e] overflow-hidden"}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block touch-none"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}
