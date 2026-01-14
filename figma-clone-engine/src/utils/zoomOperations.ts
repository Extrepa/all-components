import { DesignState, Point } from '../types';

export const getAbsolutePosition = (nodeId: string, nodes: Record<string, any>): Point => {
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

export const handleZoomIn = (state: DesignState): DesignState => ({
  ...state,
  viewport: { ...state.viewport, zoom: Math.min(5, state.viewport.zoom * 1.2) }
});

export const handleZoomOut = (state: DesignState): DesignState => ({
  ...state,
  viewport: { ...state.viewport, zoom: Math.max(0.1, state.viewport.zoom / 1.2) }
});

export const handleZoomFit = (
  state: DesignState,
  containerRef: React.RefObject<HTMLDivElement>,
  getAbsolutePosition: (nodeId: string, nodes: Record<string, any>) => Point
): DesignState => {
  if (state.rootIds.length === 0) return state;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  state.rootIds.forEach(id => {
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
  
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return state;
  
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const padding = 50;
  const zoomX = (rect.width - padding * 2) / contentWidth;
  const zoomY = (rect.height - padding * 2) / contentHeight;
  const newZoom = Math.min(zoomX, zoomY, 5);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    ...state,
    viewport: {
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
      zoom: newZoom
    }
  };
};

export const handleZoomSelection = (
  state: DesignState,
  containerRef: React.RefObject<HTMLDivElement>,
  getAbsolutePosition: (nodeId: string, nodes: Record<string, any>) => Point
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
  
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return state;
  
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const padding = 50;
  const zoomX = (rect.width - padding * 2) / contentWidth;
  const zoomY = (rect.height - padding * 2) / contentHeight;
  const newZoom = Math.min(zoomX, zoomY, 5);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    ...state,
    viewport: {
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
      zoom: newZoom
    }
  };
};

