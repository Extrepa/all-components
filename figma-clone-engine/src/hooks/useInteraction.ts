/**
 * useInteraction hook
 * Handles all pointer interactions: down, move, and up
 */

import { useCallback } from 'react';
import { DesignState, SceneNode, Point, NodeId, ToolType } from '../types';
import type { Interaction, PanInteraction } from '../types/interaction';
import { screenToWorld, getAbsolutePosition } from '../utils/canvasHelpers';
import { findNodeAtPoint, findResizeHandle } from '../utils/interactionHelpers';
import { snapToGrid } from '../utils/helpers';
import { isTextNode, hasWidth, hasHeight } from '../utils/typeGuards';
import { createColor } from '../utils/helpers';

interface UseInteractionProps {
  state: DesignState;
  activeTool: ToolType;
  interaction: Interaction | null;
  setInteraction: (interaction: Interaction | null) => void;
  setState: React.Dispatch<React.SetStateAction<DesignState>>;
  pushToHistory: (state: DesignState) => void;
  setActiveTool: (tool: ToolType) => void;
  setHoveredId: (id: string | null) => void;
  setEditingTextId: (id: NodeId | null) => void;
  setEditingTextValue: (value: string) => void;
  setEditingTextPosition: (pos: Point | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  screenToWorldLocal: (sx: number, sy: number) => Point;
  onToolCreate?: (tool: ToolType, world: Point, e: React.PointerEvent) => boolean; // Returns true if handled
}

export function useInteraction({
  state,
  activeTool,
  interaction,
  setInteraction,
  setState,
  pushToHistory,
  setActiveTool,
  setHoveredId,
  setEditingTextId,
  setEditingTextValue,
  setEditingTextPosition,
  containerRef,
  canvasRef,
  screenToWorldLocal,
  onToolCreate
}: UseInteractionProps) {
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (state.mode === 'DEV') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const world = screenToWorldLocal(e.clientX - rect.left, e.clientY - rect.top);
      const hitId = findNodeAtPoint(world.x, world.y, state);
      setState((p: DesignState) => ({ ...p, selection: hitId ? [hitId] : [] }));
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, state.viewport);
    
    if (activeTool === 'HAND' || e.button === 1) {
      setInteraction({ type: 'PAN', startX: e.clientX, startY: e.clientY });
      return;
    }

    // Handle EYEDROPPER tool
    if (activeTool === 'EYEDROPPER' && e.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;
      
      const screenX = e.clientX - rectBounds.left;
      const screenY = e.clientY - rectBounds.top;
      
      // Get pixel data from canvas - need to account for DPR and viewport
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      // Canvas coordinates accounting for DPR
      const canvasX = Math.floor(screenX * dpr);
      const canvasY = Math.floor(screenY * dpr);
      
      try {
        const imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        const [r, g, b, a] = imageData.data;
        
        if (state.selection.length > 0) {
          const selectedId = state.selection[0];
          const selectedNode = state.nodes[selectedId];
          
          if (selectedNode) {
            const pickedColor = createColor(r, g, b, a / 255);
            
            const newNodes = { ...state.nodes };
            if (selectedNode.type === 'VECTOR') {
              // Update stroke color for vectors
              newNodes[selectedId] = {
                ...selectedNode,
                stroke: pickedColor
              } as SceneNode;
            } else if (selectedNode.type === 'TEXT') {
              // Update fill color for text
              newNodes[selectedId] = {
                ...selectedNode,
                fill: pickedColor
              } as SceneNode;
            } else if (['RECTANGLE', 'FRAME', 'COMPONENT'].includes(selectedNode.type)) {
              // Update fill color for shapes
              newNodes[selectedId] = {
                ...selectedNode,
                fill: pickedColor
              } as SceneNode;
            }
            
            const newState = {
              ...state,
              nodes: newNodes
            };
            pushToHistory(newState);
            
            // Switch back to SELECT tool after picking
            setActiveTool('SELECT');
          }
        }
      } catch (error) {
        console.error('Error picking color:', error);
      }
      return;
    }

    // Handle tool creation (delegated to parent)
    if (onToolCreate && onToolCreate(activeTool, world, e)) {
      return;
    }

    // Handle SCALE tool
    if (activeTool === 'SCALE' && e.button === 0 && state.selection.length > 0) {
      const selectedId = state.selection[0];
      const node = state.nodes[selectedId];
      if (node) {
        setInteraction({ 
          type: 'SCALE', 
          nodeId: selectedId,
          startX: world.x,
          startY: world.y,
          initialNode: { ...node },
          initialDistance: (() => {
            const nodeWidth = hasWidth(node) ? node.width : 100;
            const nodeHeight = hasHeight(node) ? node.height : 100;
            return Math.sqrt(Math.pow(world.x - (node.x + nodeWidth / 2), 2) + Math.pow(world.y - (node.y + nodeHeight / 2), 2));
          })()
        });
      }
      return;
    }

    // Only allow clicking on objects when SELECT tool is active
    // Other tools (FRAME, RECTANGLE, TEXT, etc.) handle their own creation logic above
    // HAND and SCALE tools have their own handling earlier in the function
    if (activeTool !== 'SELECT') {
      // For tools that create objects, they already handled their logic above
      // This check prevents SELECT behavior from interfering with creation tools
      const creationTools: ToolType[] = ['FRAME', 'RECTANGLE', 'TEXT', 'PEN', 'PENCIL', 'LINE', 'ELLIPSE', 'POLYGON', 'STAR', 'ARROW', 'SLICE', 'SECTION', 'COMMENT'];
      if (creationTools.includes(activeTool)) {
        return;
      }
    }

    const hitId = findNodeAtPoint(world.x, world.y, state);

    if (hitId && activeTool === 'SELECT') {
      const node = state.nodes[hitId];
      const absPos = getAbsolutePosition(hitId, state.nodes);
      const width = hasWidth(node) ? node.width : 100;
      const height = hasHeight(node) ? node.height : 20;
      
      // Check if clicking on resize handle (only if selected)
      const clickedHandle = state.selection.includes(hitId)
        ? findResizeHandle({ x: world.x, y: world.y }, hitId, state, state.viewport.zoom)
        : null;
      
      if (clickedHandle && state.selection.includes(hitId)) {
        // Resize interaction
        setInteraction({ 
          type: 'RESIZE', 
          nodeId: hitId,
          handle: clickedHandle.type as 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
          startX: world.x,
          startY: world.y,
          initialNode: { ...state.nodes[hitId] }
        });
        return;
      }
      
      // Double-click to edit text
      if (e.detail === 2 && isTextNode(node)) {
        setEditingTextId(hitId);
        setEditingTextValue(node.content);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setEditingTextPosition({
          x: (absPos.x * state.viewport.zoom) + state.viewport.x + rect.left,
          y: (absPos.y * state.viewport.zoom) + state.viewport.y + rect.top
        });
      }
        return;
      }
      
      // Multi-select with Shift
      if (e.shiftKey && state.selection.includes(hitId)) {
        setState((p: DesignState) => ({ ...p, selection: p.selection.filter(id => id !== hitId) }));
      } else if (e.shiftKey) {
        setState((p: DesignState) => ({ ...p, selection: [...p.selection, hitId] }));
      } else {
        setState((p: DesignState) => ({ ...p, selection: [hitId] }));
      }
      setInteraction({ type: 'DRAG', startX: world.x, startY: world.y, initialNodes: { [hitId]: { ...state.nodes[hitId] } }, nodeId: hitId } as Interaction);
    } else {
      if (!e.shiftKey) {
        setState((p: DesignState) => ({ ...p, selection: [] }));
      }
    }
  }, [state, activeTool, containerRef, canvasRef, screenToWorldLocal, setInteraction, setState, pushToHistory, setActiveTool, setEditingTextId, setEditingTextValue, setEditingTextPosition, onToolCreate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current!;
    if (!rect) return;
    const rectBounds = rect.getBoundingClientRect();
    const world = screenToWorldLocal(e.clientX - rectBounds.left, e.clientY - rectBounds.top);

    // Show hover for SELECT tool or DEV mode
    if (activeTool === 'SELECT' || state.mode === 'DEV') {
      const hitId = findNodeAtPoint(world.x, world.y, state);
      setHoveredId(hitId || null);
    } else {
      setHoveredId(null);
    }

    if (!interaction) return;

    if (interaction.type === 'PAN') {
      const dx = e.clientX - interaction.startX;
      const dy = e.clientY - interaction.startY;
      setState((p: DesignState) => ({ ...p, viewport: { ...p.viewport, x: p.viewport.x + dx, y: p.viewport.y + dy } }));
      setInteraction((p: PanInteraction | null) => {
        if (!p || p.type !== 'PAN') return p;
        return { ...p, startX: e.clientX, startY: e.clientY };
      });
    }
    else if (interaction.type === 'DRAG') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      const id = state.selection[0];
      if (interaction.initialNodes[id]) {
        const init = interaction.initialNodes[id];
        const newX = snapToGrid(init.x + dx, state.gridSize, state.snapToGrid);
        const newY = snapToGrid(init.y + dy, state.gridSize, state.snapToGrid);
        setState((p: DesignState) => ({
          ...p,
          nodes: { ...p.nodes, [id]: { ...p.nodes[id], x: newX, y: newY } }
        }));
      }
    }
    else if (interaction.type === 'CREATE_FRAME') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      let width = Math.max(Math.abs(dx), 50);
      let height = Math.max(Math.abs(dy), 50);
      let x = dx < 0 ? interaction.startX + dx : interaction.startX;
      let y = dy < 0 ? interaction.startY + dy : interaction.startY;
      
      if (state.snapToGrid) {
        x = snapToGrid(x, state.gridSize, true);
        y = snapToGrid(y, state.gridSize, true);
        width = snapToGrid(width, state.gridSize, true);
        height = snapToGrid(height, state.gridSize, true);
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: { ...p.nodes[interaction.nodeId], x, y, width, height } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'CREATE_RECTANGLE') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      let width = Math.abs(dx);
      let height = Math.abs(dy);
      let x = dx < 0 ? interaction.startX + dx : interaction.startX;
      let y = dy < 0 ? interaction.startY + dy : interaction.startY;
      
      if (state.snapToGrid) {
        x = snapToGrid(x, state.gridSize, true);
        y = snapToGrid(y, state.gridSize, true);
        width = snapToGrid(Math.max(10, width), state.gridSize, true);
        height = snapToGrid(Math.max(10, height), state.gridSize, true);
      } else {
        width = Math.max(10, width);
        height = Math.max(10, height);
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x,
            y,
            width,
            height
          } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'CREATE_LINE') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      const endX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
      const endY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
      const width = Math.abs(endX - interaction.startX);
      const height = Math.abs(endY - interaction.startY);
      
      const points = interaction.isArrow 
        ? [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width - 10, y: -5 }, { x: width - 10, y: 5 }, { x: width, y: 0 }]
        : [{ x: 0, y: 0 }, { x: width, y: height }];
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x: Math.min(interaction.startX, endX),
            y: Math.min(interaction.startY, endY),
            width: Math.max(10, width),
            height: Math.max(10, height),
            points
          } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'CREATE_ELLIPSE') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      let width = Math.abs(dx);
      let height = Math.abs(dy);
      let x = dx < 0 ? interaction.startX + dx : interaction.startX;
      let y = dy < 0 ? interaction.startY + dy : interaction.startY;
      
      if (state.snapToGrid) {
        x = snapToGrid(x, state.gridSize, true);
        y = snapToGrid(y, state.gridSize, true);
        width = snapToGrid(Math.max(10, width), state.gridSize, true);
        height = snapToGrid(Math.max(10, height), state.gridSize, true);
      } else {
        width = Math.max(10, width);
        height = Math.max(10, height);
      }
      
      // Generate ellipse points
      const points: Point[] = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        points.push({ x: width / 2 + (width / 2) * Math.cos(angle), y: height / 2 + (height / 2) * Math.sin(angle) });
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x,
            y,
            width,
            height,
            points
          } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'CREATE_POLYGON') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      let width = Math.abs(dx);
      let height = Math.abs(dy);
      let x = dx < 0 ? interaction.startX + dx : interaction.startX;
      let y = dy < 0 ? interaction.startY + dy : interaction.startY;
      
      if (state.snapToGrid) {
        x = snapToGrid(x, state.gridSize, true);
        y = snapToGrid(y, state.gridSize, true);
        width = snapToGrid(Math.max(10, width), state.gridSize, true);
        height = snapToGrid(Math.max(10, height), state.gridSize, true);
      } else {
        width = Math.max(10, width);
        height = Math.max(10, height);
      }
      
      // Generate hexagon points (6-sided polygon)
      const sides = 6;
      const radius = Math.min(width, height) / 2;
      const points: Point[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        points.push({ x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) });
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x,
            y,
            width,
            height,
            points
          } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'CREATE_STAR') {
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      let width = Math.abs(dx);
      let height = Math.abs(dy);
      let x = dx < 0 ? interaction.startX + dx : interaction.startX;
      let y = dy < 0 ? interaction.startY + dy : interaction.startY;
      
      if (state.snapToGrid) {
        x = snapToGrid(x, state.gridSize, true);
        y = snapToGrid(y, state.gridSize, true);
        width = snapToGrid(Math.max(10, width), state.gridSize, true);
        height = snapToGrid(Math.max(10, height), state.gridSize, true);
      } else {
        width = Math.max(10, width);
        height = Math.max(10, height);
      }
      
      // Generate 5-pointed star points
      const outerRadius = Math.min(width, height) / 2;
      const innerRadius = outerRadius * 0.4;
      const points: Point[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({ x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) });
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x,
            y,
            width,
            height,
            points
          } as SceneNode
        }
      }));
    }
    else if (interaction.type === 'SCALE') {
      const node = state.nodes[interaction.nodeId];
      if (!node) return;
      
      const initWidth = hasWidth(interaction.initialNode) ? interaction.initialNode.width : 100;
      const initHeight = hasHeight(interaction.initialNode) ? interaction.initialNode.height : 100;
      const centerX = interaction.initialNode.x + initWidth / 2;
      const centerY = interaction.initialNode.y + initHeight / 2;
      const currentDistance = Math.sqrt(Math.pow(world.x - centerX, 2) + Math.pow(world.y - centerY, 2));
      const scale = currentDistance / interaction.initialDistance;
      const newWidth = Math.max(10, initWidth * scale);
      const newHeight = Math.max(10, initHeight * scale);
      const newX = centerX - newWidth / 2;
      const newY = centerY - newHeight / 2;
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x: snapToGrid(newX, state.gridSize, state.snapToGrid),
            y: snapToGrid(newY, state.gridSize, state.snapToGrid),
            width: snapToGrid(newWidth, state.gridSize, state.snapToGrid),
            height: snapToGrid(newHeight, state.gridSize, state.snapToGrid)
          }
        }
      }));
    }
    else if (interaction.type === 'RESIZE') {
      const node = state.nodes[interaction.nodeId];
      if (!node) return;
      
      const dx = world.x - interaction.startX;
      const dy = world.y - interaction.startY;
      const init = interaction.initialNode;
      const initWidth = hasWidth(init) ? init.width : 100;
      const initHeight = hasHeight(init) ? init.height : 20;
      const initX = init.x;
      const initY = init.y;
      
      let newX = initX;
      let newY = initY;
      let newWidth = initWidth;
      let newHeight = initHeight;
      
      const handle = interaction.handle;
      
      // Handle resize based on which handle
      if (handle.includes('e')) { // right
        newWidth = Math.max(10, initWidth + dx);
      }
      if (handle.includes('w')) { // left
        newWidth = Math.max(10, initWidth - dx);
        newX = initX + dx;
      }
      if (handle.includes('s')) { // bottom
        newHeight = Math.max(10, initHeight + dy);
      }
      if (handle.includes('n')) { // top
        newHeight = Math.max(10, initHeight - dy);
        newY = initY + dy;
      }
      
      // Apply grid snapping if enabled
      if (state.snapToGrid) {
        newX = snapToGrid(newX, state.gridSize, true);
        newY = snapToGrid(newY, state.gridSize, true);
        newWidth = snapToGrid(newWidth, state.gridSize, true);
        newHeight = snapToGrid(newHeight, state.gridSize, true);
      }
      
      setState((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [interaction.nodeId]: {
            ...p.nodes[interaction.nodeId],
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          } as SceneNode
        }
      }));
    }
  }, [state, activeTool, interaction, containerRef, screenToWorldLocal, setState, setInteraction, setHoveredId]);

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    const wasCreatingShape = interaction?.type === 'CREATE_FRAME' || 
                             interaction?.type === 'CREATE_RECTANGLE' || 
                             interaction?.type === 'CREATE_LINE' || 
                             interaction?.type === 'CREATE_ELLIPSE' || 
                             interaction?.type === 'CREATE_POLYGON' || 
                             interaction?.type === 'CREATE_STAR' ||
                             interaction?.type === 'CREATE_SECTION' ||
                             interaction?.type === 'CREATE_SLICE';
    
    if (interaction?.type === 'DRAG' || wasCreatingShape || interaction?.type === 'RESIZE' || interaction?.type === 'SCALE') {
      pushToHistory(state);
    }
    
    // Auto-switch back to SELECT tool after placing a shape (unless Alt/Option is held)
    if (wasCreatingShape && (!e || !e.altKey)) {
      setActiveTool('SELECT');
    }
    
    setInteraction(null);
  }, [interaction, state, pushToHistory, setActiveTool, setInteraction]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
