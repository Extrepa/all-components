import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { FloatingTopNav } from './components/FloatingTopNav';
import { LayersPanel } from './components/LayersPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { BottomDock } from './components/BottomDock';
import { FileMenu } from './components/FileMenu';
import { ContextMenu } from './components/ContextMenu';
import { AlignmentGuides } from './components/AlignmentGuides';
import { Rulers } from './components/Rulers';
import { 
  DesignState, SceneNode, FrameNode, TextNode, RectangleNode,
  Point, Color, NodeId, ToolType, ImageNode, InstanceNode, VectorNode, CommentNode
} from './types';
import type { Interaction, PanInteraction } from './types/interaction';
import { createColor, generateId, hexToColor, colorToCss, snapToGrid } from './utils/helpers';
import { migrateDesignState } from './utils/migration';
import { calculateLayout } from './utils/layout';
import { generateCSS, generateReact } from './utils/codeGeneration';
import { isFrameNode, isTextNode, isVectorNode, isImageNode, isInstanceNode, isCommentNode, hasWidth, hasHeight, hasDimensions, hasFill } from './utils/typeGuards';
import { Canvas } from './components/Canvas';
import { screenToWorld, getAbsolutePosition, wrapText } from './utils/canvasHelpers';
import { findParentFrameAtPoint } from './utils/interactionHelpers';
import {
  createFrameNode, createRectangleNode, createTextNode, createLineNode,
  createEllipseNode, createPolygonNode, createStarNode, createSectionNode,
  createSliceNode, createCommentNode, addNodeToState
} from './utils/toolCreators';
import { useInteraction } from './hooks/useInteraction';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistory } from '@/shared/hooks';
import { handleSave as saveFile, handleSaveAs as saveAsFile, handleLoad as loadFile, handleExport as exportFile, handleImport as importFile } from './utils/fileOperations';
import { handleCopy as copyNodes, handleCut as cutNodes, handlePaste as pasteNodes, handleDelete as deleteNodes, handleDuplicate as duplicateNodes } from './utils/editOperations';
import { handleZoomIn as zoomIn, handleZoomOut as zoomOut, handleZoomFit as zoomFit, handleZoomSelection as zoomSelection } from './utils/zoomOperations';
import { handleGroup as groupNodes, handleUngroup as ungroupNodes, handleFrameSelection as frameSelection } from './utils/groupOperations';
import { bringForward, sendBackward, bringToFront, sendToBack, lockSelection, unlockSelection, hideSelection, showSelection } from './utils/layerOperations';
import { addPage, deletePage } from './utils/pageOperations';
import { flipHorizontal, flipVertical } from './utils/transformOperations';

// Re-export types for backward compatibility
export type { DesignState, SceneNode, FrameNode, TextNode, RectangleNode, Point, Color, NodeId, ToolType };

// Initial Data
const INITIAL_STATE: DesignState = {
  viewport: { x: 50, y: 50, zoom: 1 },
  selection: [],
  rootIds: ['frame-1'],
  mode: 'DESIGN',
  projectName: 'Untitled',
  snapToGrid: true,
  gridSize: 8,
  nodes: {
    'frame-1': {
      id: 'frame-1', type: 'FRAME', name: 'Auto Layout Card', x: 100, y: 100, width: 320, height: 400, 
      rotation: 0, visible: true, locked: false, parent: null, fill: createColor(30,30,30,1), 
      children: ['text-head', 'btn-1', 'img-1'],
      cornerRadius: 12, layoutMode: 'VERTICAL', itemSpacing: 20, padding: 20
    },
    'text-head': {
      id: 'text-head', type: 'TEXT', name: 'Header', parent: 'frame-1', x: 20, y: 20,
      rotation: 0, visible: true, locked: false, content: 'Welcome Back', fontSize: 24, fill: createColor(255,255,255,1)
    },
    'img-1': {
       id: 'img-1', type: 'IMAGE', name: 'Avatar', parent: 'frame-1', x: 0, y: 0, width: 280, height: 150,
       rotation: 0, visible: true, locked: false, opacity: 1, src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4yODB4MTUwPC90ZXh0Pjwvc3ZnPg==' 
    },
    'btn-1': {
       id: 'btn-1', type: 'RECTANGLE', name: 'Submit Button', parent: 'frame-1', x: 0, y: 0, width: 280, height: 48,
       rotation: 0, visible: true, locked: false, fill: createColor(59, 130, 246, 1), cornerRadius: 6
    },
  }
};

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use shared history hook with migration and layout calculation transform
  const historyResult = useHistory(INITIAL_STATE, {
    mode: 'past-present-future',
    transform: (designState: DesignState) => {
      // Migrate nodes to ensure backward compatibility
      let migratedNodes = migrateDesignState(designState);
      
      // Calculate auto-layout for frames/components with layout mode
      let calculatedNodes = { ...migratedNodes };
      Object.keys(calculatedNodes).forEach(id => {
        const node = calculatedNodes[id];
        if (isFrameNode(node) && node.layoutMode !== 'NONE') {
          calculatedNodes = calculateLayout(id, calculatedNodes);
        }
      });
      
      return { ...designState, nodes: calculatedNodes };
    },
  });
  
  const { state, setState, pushToHistory, undo, redo, canUndo, canRedo } = historyResult;
  // pushToHistory is always present in past-present-future mode
  if (!pushToHistory) {
    throw new Error('pushToHistory is required in past-present-future mode');
  }

  const [activeTool, setActiveTool] = useState<ToolType>('SELECT');
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['position', 'layout', 'appearance', 'fill']));
  const [editingTextId, setEditingTextId] = useState<NodeId | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  const [editingTextPosition, setEditingTextPosition] = useState<Point | null>(null);
  const [clipboard, setClipboard] = useState<SceneNode[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [draggingComponentId, setDraggingComponentId] = useState<NodeId | null>(null);
  const [showRulers, setShowRulers] = useState(false);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);

  const screenToWorldLocal = useCallback((sx: number, sy: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return screenToWorld(sx - rect.left, sy - rect.top, state.viewport);
  }, [state.viewport]);

  // Tool creation handler (called from useInteraction hook)
  const handleToolCreate = useCallback((tool: ToolType, world: Point, e: React.PointerEvent): boolean => {
    if (e.button !== 0) return false;
    
    const rect = containerRef.current!.getBoundingClientRect();

    // Create new nodes with tools
    if (tool === 'FRAME' && e.button === 0) {
        const result = createFrameNode({ x: world.x, y: world.y, state });
        setInteraction({ type: 'CREATE_FRAME', startX: world.x, startY: world.y, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    if (tool === 'RECTANGLE' && e.button === 0) {
        const result = createRectangleNode({ x: world.x, y: world.y, state });
        setInteraction({ type: 'CREATE_RECTANGLE', startX: world.x, startY: world.y, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    if (tool === 'TEXT' && e.button === 0) {
        const result = createTextNode({ x: world.x, y: world.y, state });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        // Start editing immediately
        setEditingTextId(result.nodeId);
        setEditingTextValue('Text');
        setEditingTextPosition({
            x: (world.x * state.viewport.zoom) + state.viewport.x + rect.left,
            y: (world.y * state.viewport.zoom) + state.viewport.y + rect.top
        });
        return true;
    }

    // Handle LINE tool
    if ((tool === 'LINE' || tool === 'ARROW') && e.button === 0) {
        const isArrow = tool === 'ARROW';
        const result = createLineNode({ x: world.x, y: world.y, state }, isArrow);
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_LINE', startX: snappedX, startY: snappedY, nodeId: result.nodeId, isArrow });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle ELLIPSE tool
    if (tool === 'ELLIPSE' && e.button === 0) {
        const result = createEllipseNode({ x: world.x, y: world.y, state });
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_ELLIPSE', startX: snappedX, startY: snappedY, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle POLYGON tool
    if (tool === 'POLYGON' && e.button === 0) {
        const result = createPolygonNode({ x: world.x, y: world.y, state });
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_POLYGON', startX: snappedX, startY: snappedY, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle STAR tool
    if (tool === 'STAR' && e.button === 0) {
        const result = createStarNode({ x: world.x, y: world.y, state });
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_STAR', startX: snappedX, startY: snappedY, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle SECTION tool (similar to FRAME)
    if (tool === 'SECTION' && e.button === 0) {
        const result = createSectionNode({ x: world.x, y: world.y, state });
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_FRAME', startX: snappedX, startY: snappedY, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle SLICE tool (similar to FRAME but with different styling)
    if (tool === 'SLICE' && e.button === 0) {
        const result = createSliceNode({ x: world.x, y: world.y, state });
        const snappedX = snapToGrid(world.x, state.gridSize, state.snapToGrid);
        const snappedY = snapToGrid(world.y, state.gridSize, state.snapToGrid);
        setInteraction({ type: 'CREATE_FRAME', startX: snappedX, startY: snappedY, nodeId: result.nodeId });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    // Handle COMMENT tool
    if (tool === 'COMMENT' && e.button === 0) {
        const result = createCommentNode({ x: world.x, y: world.y, state });
        const { nodes, rootIds } = addNodeToState(state, result);
        const newState = {
            ...state,
            nodes,
            rootIds,
            selection: [result.nodeId]
        };
        pushToHistory(newState);
        return true;
    }

    return false;
  }, [state, containerRef, setInteraction, setState, pushToHistory, setEditingTextId, setEditingTextValue, setEditingTextPosition]);

  // Interaction handlers
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useInteraction({
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
    onToolCreate: handleToolCreate
  });

  // findParentFrameAtPoint moved to utils/interactionHelpers.ts

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const newId = generateId();
        const rect = containerRef.current!.getBoundingClientRect();
        const world = screenToWorldLocal(rect.width/2, rect.height/2);
        const imgNode: ImageNode = {
          id: newId, type: 'IMAGE', name: 'Image', parent: null,
          x: world.x, y: world.y, width: 200, height: 200, 
          rotation: 0, visible: true, locked: false, opacity: 1, src
        };
        const newState = { 
          ...state, 
          nodes: { ...state.nodes, [newId]: imgNode }, 
          rootIds: [...state.rootIds, newId], 
          selection: [newId] 
        };
        pushToHistory(newState);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Canvas rendering is now handled by the Canvas component

  // handlePointerDown, handlePointerMove, handlePointerUp are now provided by useInteraction hook

  // Save/Load functionality
  const handleSave = () => saveFile(state);
  const handleSaveAs = () => saveAsFile(state);
  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => loadFile(e, pushToHistory);
  const handleNewFile = () => {
    if (confirm('Create a new file? All unsaved changes will be lost.')) {
      pushToHistory(INITIAL_STATE);
    }
  };
  const handleExport = () => exportFile(state);
  const handleImport = () => importFile(state, pushToHistory);

  // Edit operations
  const handleCopy = () => {
    const copied = copyNodes(state);
    setClipboard(copied);
  };
  
  const handleCut = () => {
    const copied = copyNodes(state);
    setClipboard(copied);
    const newState = deleteNodes(state, pushToHistory);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };
  
  const handlePaste = () => {
    const newState = pasteNodes(state, clipboard, pushToHistory);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };
  
  const handleDelete = () => {
    const newState = deleteNodes(state, pushToHistory);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };
  
  const handleDuplicate = () => {
    const newState = duplicateNodes(state, pushToHistory);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleSelectAll = () => {
    setState((p: DesignState) => ({ ...p, selection: [...p.rootIds] }));
  };

  const handleDeselectAll = () => {
    setState((p: DesignState) => ({ ...p, selection: [] }));
  };

  // Zoom operations
  const handleZoomIn = () => setState(zoomIn);
  const handleZoomOut = () => setState(zoomOut);
  const handleZoomFit = () => {
    const newState = zoomFit(state, containerRef, getAbsolutePosition);
    if (newState !== state) {
      setState(() => newState);
    }
  };
  const handleZoomSelection = () => {
    const newState = zoomSelection(state, containerRef, getAbsolutePosition);
    if (newState !== state) {
      setState(() => newState);
    }
  };

  const handleZoom100 = () => {
    setState((p: DesignState) => ({
      ...p,
      viewport: { ...p.viewport, zoom: 1 }
    }));
  };

  // Object operations
  const handleGroup = () => {
    const newState = groupNodes(state);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  // Keyboard shortcuts are now handled by useKeyboardShortcuts hook
  useKeyboardShortcuts({
    state,
    activeTool,
    clipboard,
    setActiveTool,
    undo,
    redo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onGroup: handleGroup,
  });

  const handleUngroup = () => {
    const newState = ungroupNodes(state);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };
  const handleFrameSelection = () => {
    const newState = frameSelection(state);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleFlipHorizontal = () => {
    const newState = flipHorizontal(state);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleFlipVertical = () => {
    const newState = flipVertical(state);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  // Layer ordering operations
  const handleBringForward = () => {
    if (state.selection.length !== 1) return;
    const newState = bringForward(state, state.selection[0]);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleSendBackward = () => {
    if (state.selection.length !== 1) return;
    const newState = sendBackward(state, state.selection[0]);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleBringToFront = () => {
    if (state.selection.length !== 1) return;
    const newState = bringToFront(state, state.selection[0]);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleSendToBack = () => {
    if (state.selection.length !== 1) return;
    const newState = sendToBack(state, state.selection[0]);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleLock = () => {
    if (state.selection.length === 0) return;
    const newState = lockSelection(state, state.selection);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleUnlock = () => {
    if (state.selection.length === 0) return;
    const newState = unlockSelection(state, state.selection);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleHide = () => {
    if (state.selection.length === 0) return;
    const newState = hideSelection(state, state.selection);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  const handleShow = () => {
    if (state.selection.length === 0) return;
    const newState = showSelection(state, state.selection);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

  // Page management operations
  const handleAddPage = () => {
    const newState = addPage(state);
    pushToHistory(newState);
  };

  const handleDeletePage = (pageId: string) => {
    const newState = deletePage(state, pageId);
    if (newState !== state) {
      pushToHistory(newState);
    }
  };

                   return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden flex-col">
       {/* File Menu */}
       <FileMenu 
         isOpen={fileMenuOpen}
         onClose={() => setFileMenuOpen(false)}
         onSave={handleSave}
         onLoad={handleLoad}
         onUndo={undo}
         onRedo={redo}
         onCopy={handleCopy}
         onCut={handleCut}
         onPaste={handlePaste}
         onDelete={handleDelete}
         onDuplicate={handleDuplicate}
         onSelectAll={handleSelectAll}
         onDeselectAll={handleDeselectAll}
         onZoomIn={handleZoomIn}
         onZoomOut={handleZoomOut}
         onZoomFit={handleZoomFit}
         onZoomSelection={handleZoomSelection}
         onZoom100={handleZoom100}
         onToggleGrid={() => setState((p: DesignState) => ({ ...p, snapToGrid: !p.snapToGrid }))}
         onGroup={handleGroup}
         onUngroup={handleUngroup}
         onFrameSelection={handleFrameSelection}
         onFlipHorizontal={handleFlipHorizontal}
         onFlipVertical={handleFlipVertical}
         onNewFile={handleNewFile}
         onSaveAs={handleSaveAs}
         onExport={handleExport}
         onImport={handleImport}
         canUndo={canUndo}
         canRedo={canRedo}
       />
       
       {/* Floating Top Nav */}
       <FloatingTopNav
         state={state}
         onUndo={undo}
         onRedo={redo}
         onSave={handleSave}
         onLoad={handleLoad}
         onModeChange={(mode) => setState((p: DesignState) => ({ ...p, mode }))}
         onZoomChange={(delta) => setState((p: DesignState) => ({ 
           ...p, 
           viewport: { 
             ...p.viewport, 
             zoom: Math.max(0.1, Math.min(5, p.viewport.zoom + delta)) 
           } 
         }))}
         onToggleSnapToGrid={() => setState((p: DesignState) => ({ ...p, snapToGrid: !p.snapToGrid }))}
         canUndo={canUndo}
         canRedo={canRedo}
       />

       <div className="flex-1 flex overflow-hidden">
          <LayersPanel
            state={state}
            onSelect={(id) => setState((p: DesignState) => ({ ...p, selection: [id] }))}
            onStateChange={setState}
            fileMenuOpen={fileMenuOpen}
            onFileMenuToggle={() => setFileMenuOpen(!fileMenuOpen)}
            onComponentDragStart={(componentId) => setDraggingComponentId(componentId)}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
          />

          {/* CANVAS */}
          <Canvas
            state={state}
            hoveredId={hoveredId}
            containerRef={containerRef}
            onRef={(ref) => { canvasRef.current = ref; }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={(e) => {
              e.preventDefault();
              if (state.mode === 'DESIGN') {
                setContextMenu({ x: e.clientX, y: e.clientY });
              }
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? 0.9 : 1.1;
              const rect = containerRef.current!.getBoundingClientRect();
              const world = screenToWorldLocal(e.clientX - rect.left, e.clientY - rect.top);
              const newZoom = Math.max(0.1, Math.min(5, state.viewport.zoom * delta));
              setState((p: DesignState) => ({
                ...p,
                viewport: {
                  x: e.clientX - (world.x * newZoom),
                  y: e.clientY - (world.y * newZoom),
                  zoom: newZoom
                }
              }));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggingComponentId) {
                e.dataTransfer.dropEffect = 'copy';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingComponentId && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const screenX = e.clientX - rect.left;
                const screenY = e.clientY - rect.top;
                const world = screenToWorldLocal(screenX, screenY);
                
                const masterComponent = state.nodes[draggingComponentId];
                if (masterComponent && isFrameNode(masterComponent)) {
                  const masterFrame = masterComponent;
                  const newId = generateId();
                  
                  // Find parent frame at drop location
                  const parentFrame = findParentFrameAtPoint(world.x, world.y, state);
                  const absPos = parentFrame ? getAbsolutePosition(parentFrame.id, state.nodes) : { x: 0, y: 0 };
                  
                  const snappedX = snapToGrid(world.x - absPos.x, state.gridSize, state.snapToGrid);
                  const snappedY = snapToGrid(world.y - absPos.y, state.gridSize, state.snapToGrid);
                  
                  const newInstance: InstanceNode = {
                    id: newId,
                    type: 'INSTANCE',
                    name: `${masterComponent.name} Instance`,
                    parent: parentFrame ? parentFrame.id : null,
                    x: snappedX,
                    y: snappedY,
                    width: masterFrame.width,
                    height: masterFrame.height,
                    rotation: 0,
                    visible: true,
                    locked: false,
                    masterComponentId: draggingComponentId,
                    overrides: {}
                  };
                  
                  const newNodes = { ...state.nodes, [newId]: newInstance };
                  let newRootIds = [...state.rootIds];
                  
                  // Add to parent's children or rootIds
                  if (parentFrame) {
                    const parent = state.nodes[parentFrame.id];
                    if (isFrameNode(parent)) {
                      newNodes[parentFrame.id] = {
                        ...parent,
                        children: [...parent.children, newId]
                      };
                    }
                  } else {
                    newRootIds = [...newRootIds, newId];
                  }
                  
                  const newState = {
                    ...state,
                    nodes: newNodes,
                    rootIds: newRootIds,
                    selection: [newId]
                  };
                  pushToHistory(newState);
                }
                
                setDraggingComponentId(null);
              }
            }}
            onDragLeave={() => {
              // Only clear if actually leaving the container
              setDraggingComponentId(null);
            }}
            className={`flex-1 relative bg-[#1e1e1e] overflow-hidden ${state.mode === 'DEV' ? 'cursor-default' : activeTool === 'HAND' ? 'cursor-grab' : activeTool === 'TEXT' ? 'cursor-text' : 'cursor-default'}`}
          />
          
          {/* Rulers */}
          {showRulers && state.mode === 'DESIGN' && (
            <Rulers
              state={state}
              containerRef={containerRef}
              showRulers={showRulers}
            />
          )}
          
          {/* Alignment Guides Overlay */}
          {showAlignmentGuides && state.mode === 'DESIGN' && interaction?.type === 'DRAG' && state.selection.length === 1 && containerRef.current && (
            <AlignmentGuides
              state={state}
              containerRef={containerRef}
              getAbsolutePosition={getAbsolutePosition}
              draggedNodeId={state.selection[0]}
              dragPosition={(() => {
                if (!interaction || interaction.type !== 'DRAG' || !interaction.initialNodes[state.selection[0]]) return undefined;
                const node = state.nodes[state.selection[0]];
                const currentPos = getAbsolutePosition(state.selection[0], state.nodes);
                return { x: currentPos.x, y: currentPos.y };
              })()}
            />
          )}

          <InspectorPanel
            state={state}
            onStateChange={setState}
            onHistoryPush={pushToHistory}
            generateCSS={generateCSS}
            generateReact={generateReact}
            onZoomChange={(zoom) => setState((p: DesignState) => ({
              ...p,
              viewport: { ...p.viewport, zoom }
            }))}
          />
                   </div>

       {/* BOTTOM FLOATING DOCK */}
       <BottomDock
         state={state}
         activeTool={activeTool}
         onToolChange={setActiveTool}
         onImageUpload={handleImageUpload}
         onFileMenuToggle={() => setFileMenuOpen(!fileMenuOpen)}
       />
       
       {/* INLINE TEXT EDITING OVERLAY */}
       {editingTextId && editingTextPosition && (
           <div 
               className="fixed z-50 bg-gray-800 border border-blue-500 rounded px-2 py-1"
               style={{
                   left: `${editingTextPosition.x}px`,
                   top: `${editingTextPosition.y}px`,
                   minWidth: '200px'
               }}
           >
               <input
                   type="text"
                   value={editingTextValue}
                   onChange={(e) => setEditingTextValue(e.target.value)}
                   onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                           const node = state.nodes[editingTextId];
                           if (node && node.type === 'TEXT') {
                               const newState = {
                                   ...state,
                                   nodes: {
                                       ...state.nodes,
                                       [editingTextId]: { ...node, content: editingTextValue } as TextNode
                                   }
                               };
                                              pushToHistory(newState);
                           }
                           setEditingTextId(null);
                           setEditingTextValue('');
                           setEditingTextPosition(null);
                       } else if (e.key === 'Escape') {
                           setEditingTextId(null);
                           setEditingTextValue('');
                           setEditingTextPosition(null);
                       }
                   }}
                   onBlur={() => {
                       const node = state.nodes[editingTextId];
                       if (node && node.type === 'TEXT') {
                           const newState = {
                               ...state,
                               nodes: {
                                   ...state.nodes,
                                   [editingTextId]: { ...node, content: editingTextValue } as TextNode
                               }
                           };
                                              pushToHistory(newState);
                       }
                       setEditingTextId(null);
                       setEditingTextValue('');
                       setEditingTextPosition(null);
                   }}
                   autoFocus
                   className="bg-transparent text-white text-sm outline-none w-full"
                   style={{ fontFamily: (editingTextId && isTextNode(state.nodes[editingTextId]) ? state.nodes[editingTextId].fontFamily : null) || 'Inter, sans-serif' }}
               />
                       </div>
                   )}

       {/* CONTEXT MENU */}
       {contextMenu && state.mode === 'DESIGN' && (
         <ContextMenu
           x={contextMenu.x}
           y={contextMenu.y}
           onClose={() => setContextMenu(null)}
           onCopy={handleCopy}
           onCut={handleCut}
           onPaste={handlePaste}
           onDelete={handleDelete}
           onDuplicate={handleDuplicate}
           onGroup={handleGroup}
           onUngroup={handleUngroup}
           onLock={handleLock}
           onUnlock={handleUnlock}
           onHide={handleHide}
           onShow={handleShow}
           onBringForward={handleBringForward}
           onSendBackward={handleSendBackward}
           onBringToFront={handleBringToFront}
           onSendToBack={handleSendToBack}
           hasSelection={state.selection.length > 0}
           canGroup={state.selection.length > 1}
           canUngroup={state.selection.length === 1 && 
             (state.nodes[state.selection[0]]?.type === 'FRAME' || 
              state.nodes[state.selection[0]]?.type === 'COMPONENT')}
           canLock={state.selection.length > 0}
           isLocked={state.selection.length === 1 && state.nodes[state.selection[0]]?.locked === true}
           isHidden={state.selection.length === 1 && state.nodes[state.selection[0]]?.visible === false}
           canBringForward={state.selection.length === 1}
           canSendBackward={state.selection.length === 1}
         />
       )}
    </div>
  );
};

export default App;
