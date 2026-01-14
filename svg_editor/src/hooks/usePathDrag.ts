import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useHistory } from './useHistory';
import { usePathExtraction } from './usePathExtraction';
import { useSVGRenderer } from './useSVGRenderer';

export function usePathDrag() {
    const { state, updateState } = useAppContext();
    const { saveState } = useHistory();
    const { extractPaths } = usePathExtraction();
    const { renderSVG } = useSVGRenderer();
    
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const dragStartPositionsRef = useRef<Array<{ id: string; x: number; y: number; transform: string }>>([]);

    const screenToSVG = useCallback((svg: SVGSVGElement, screenX: number, screenY: number) => {
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = screenX;
        svgPoint.y = screenY;
        const ctm = svg.getScreenCTM();
        if (ctm) {
            const inverseCTM = ctm.inverse();
            const svgCoord = svgPoint.matrixTransform(inverseCTM);
            return { x: svgCoord.x, y: svgCoord.y };
        }
        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
            const [minX, minY, width, height] = viewBox.split(' ').map(Number);
            const scaleX = width / svgRect.width;
            const scaleY = height / svgRect.height;
            const x = (screenX - svgRect.left) * scaleX + minX;
            const y = (screenY - svgRect.top) * scaleY + minY;
            return { x, y };
        }
        return {
            x: screenX - svgRect.left,
            y: screenY - svgRect.top
        };
    }, []);

    const handlePathMouseDown = useCallback((e: MouseEvent) => {
        // Only drag when move tool is active and drag is enabled
        if (state.currentTool !== 'move' || !state.pathDragEnabled) return;
        
        const target = e.target as SVGPathElement;
        if (target.tagName !== 'path' || !target.id) return;

        const pathId = target.id;
        const isSelected = state.selectedPaths.has(pathId);

        // If not selected, don't start drag (let selection handle it)
        if (!isSelected) return;

        // Path is selected - start drag
        e.preventDefault();
        e.stopPropagation();

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg) return;

        isDraggingRef.current = true;
        const startPoint = screenToSVG(svg, e.clientX, e.clientY);
        dragStartRef.current = startPoint;

        // Store initial positions of all selected paths
        dragStartPositionsRef.current = Array.from(state.selectedPaths).map(id => {
            const path = state.paths.find(p => p.id === id);
            if (!path) return null;
            try {
                const bbox = path.element.getBBox();
                return {
                    id: id,
                    x: bbox.x,
                    y: bbox.y,
                    transform: path.transform || ''
                };
            } catch (e) {
                return null;
            }
        }).filter((p): p is { id: string; x: number; y: number; transform: string } => p !== null);

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        target.style.cursor = 'grabbing';
        updateState({ isDraggingPath: true, dragStartPoint: startPoint });
    }, [state.currentTool, state.pathDragEnabled, state.selectedPaths, state.paths, screenToSVG, updateState]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current || !dragStartRef.current) return;

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg) return;

        const currentPoint = screenToSVG(svg, e.clientX, e.clientY);
        let deltaX = currentPoint.x - dragStartRef.current.x;
        let deltaY = currentPoint.y - dragStartRef.current.y;

        // Apply grid snapping if enabled
        if (state.snapToGrid) {
            deltaX = Math.round(deltaX / state.gridSize) * state.gridSize;
            deltaY = Math.round(deltaY / state.gridSize) * state.gridSize;
        }

        // Update all selected paths
        dragStartPositionsRef.current.forEach(startPos => {
            const path = state.paths.find(p => p.id === startPos.id);
            if (!path || !path.element) return;

            // Calculate new transform
            let newTransform = '';
            if (startPos.transform) {
                // Parse existing transform
                const matches = startPos.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (matches) {
                    const tx = parseFloat(matches[1]) + deltaX;
                    const ty = parseFloat(matches[2]) + deltaY;
                    newTransform = `translate(${tx},${ty})`;
                } else {
                    newTransform = `translate(${deltaX},${deltaY}) ${startPos.transform}`;
                }
            } else {
                newTransform = `translate(${deltaX},${deltaY})`;
            }

            path.element.setAttribute('transform', newTransform);
            path.transform = newTransform;
        });

        renderSVG();
    }, [state.snapToGrid, state.gridSize, state.paths, screenToSVG, renderSVG]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;
        document.body.style.userSelect = '';

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg || !dragStartRef.current) return;

        // Calculate final delta
        const endPoint = screenToSVG(svg, e.clientX, e.clientY);
        let deltaX = endPoint.x - dragStartRef.current.x;
        let deltaY = endPoint.y - dragStartRef.current.y;

        // Apply grid snapping if enabled
        if (state.snapToGrid) {
            deltaX = Math.round(deltaX / state.gridSize) * state.gridSize;
            deltaY = Math.round(deltaY / state.gridSize) * state.gridSize;
        }

        // Only save state if there was actual movement
        if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            saveState();
        }

        // Update all selected paths with final position
        dragStartPositionsRef.current.forEach(startPos => {
            const path = state.paths.find(p => p.id === startPos.id);
            if (!path || !path.element) return;

            // Calculate new transform
            let newTransform = '';
            if (startPos.transform) {
                const matches = startPos.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (matches) {
                    const tx = parseFloat(matches[1]) + deltaX;
                    const ty = parseFloat(matches[2]) + deltaY;
                    newTransform = `translate(${tx},${ty})`;
                } else {
                    newTransform = `translate(${deltaX},${deltaY}) ${startPos.transform}`;
                }
            } else {
                newTransform = `translate(${deltaX},${deltaY})`;
            }

            path.element.setAttribute('transform', newTransform);
            path.transform = newTransform;
        });

        extractPaths();
        renderSVG();
        
        dragStartRef.current = null;
        dragStartPositionsRef.current = [];
        updateState({ isDraggingPath: false, dragStartPoint: null });
    }, [state.snapToGrid, state.gridSize, state.paths, screenToSVG, saveState, extractPaths, renderSVG, updateState]);

    useEffect(() => {
        if (!state.svgElement || !state.pathDragEnabled) return;

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg');
        if (!svg) return;

        // Attach mousedown to paths
        const handlePathDown = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            handlePathMouseDown(mouseEvent);
        };

        svg.addEventListener('mousedown', handlePathDown, true);

        // Global mouse move and up handlers
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            svg.removeEventListener('mousedown', handlePathDown, true);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [state.svgElement, state.pathDragEnabled, handlePathMouseDown, handleMouseMove, handleMouseUp]);

    return {
        // Hook manages drag state internally
    };
}

