import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export function useMarqueeSelection() {
    const { state, updateState, setSelectedPaths } = useAppContext();
    const isSelectingRef = useRef(false);
    const startPointRef = useRef<{ x: number; y: number } | null>(null);
    const marqueeRectRef = useRef<SVGRectElement | null>(null);

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

    const handleMouseDown = useCallback((e: MouseEvent) => {
        // Only start marquee when select tool is active and clicking on empty space
        if (state.currentTool !== 'select') return;
        
        const target = e.target as HTMLElement;
        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg) return;

        // Don't start marquee if clicking on a path
        if (target.tagName === 'path' || target.closest('path')) return;

        // Don't start if space is held (panning)
        if (state.spacePanning) return;

        // Start marquee selection
        isSelectingRef.current = true;
        const startPoint = screenToSVG(svg, e.clientX, e.clientY);
        startPointRef.current = startPoint;

        // Create marquee rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'marquee-selection');
        rect.setAttribute('fill', 'rgba(74, 144, 226, 0.1)');
        rect.setAttribute('stroke', '#4a90e2');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('stroke-dasharray', '5,5');
        rect.setAttribute('pointer-events', 'none');
        svg.appendChild(rect);
        marqueeRectRef.current = rect;

        updateState({ isMarqueeSelecting: true, marqueeStart: startPoint });
        e.preventDefault();
    }, [state.currentTool, state.spacePanning, screenToSVG, updateState]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isSelectingRef.current || !startPointRef.current || !marqueeRectRef.current) return;

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg) return;

        const currentPoint = screenToSVG(svg, e.clientX, e.clientY);
        const x = Math.min(startPointRef.current.x, currentPoint.x);
        const y = Math.min(startPointRef.current.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - startPointRef.current.x);
        const height = Math.abs(currentPoint.y - startPointRef.current.y);

        marqueeRectRef.current.setAttribute('x', String(x));
        marqueeRectRef.current.setAttribute('y', String(y));
        marqueeRectRef.current.setAttribute('width', String(width));
        marqueeRectRef.current.setAttribute('height', String(height));
    }, [screenToSVG]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isSelectingRef.current || !startPointRef.current) return;

        const wrapper = document.getElementById('svgWrapper');
        const svg = wrapper?.querySelector('svg') as SVGSVGElement;
        if (!svg) return;

        const endPoint = screenToSVG(svg, e.clientX, e.clientY);
        const minX = Math.min(startPointRef.current.x, endPoint.x);
        const maxX = Math.max(startPointRef.current.x, endPoint.x);
        const minY = Math.min(startPointRef.current.y, endPoint.y);
        const maxY = Math.max(startPointRef.current.y, endPoint.y);

        // Find all paths within marquee bounds
        const selectedIds = new Set<string>();
        state.paths.forEach(path => {
            try {
                const bbox = path.element.getBBox();
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                if (centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY) {
                    selectedIds.add(path.id);
                }
            } catch (e) {
                // BBox might fail, skip this path
            }
        });

        // Update selection
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            // Add to existing selection
            const newSelection = new Set(state.selectedPaths);
            selectedIds.forEach(id => newSelection.add(id));
            setSelectedPaths(newSelection);
        } else {
            // Replace selection
            setSelectedPaths(selectedIds);
        }

        // Clean up
        if (marqueeRectRef.current) {
            marqueeRectRef.current.remove();
            marqueeRectRef.current = null;
        }

        isSelectingRef.current = false;
        startPointRef.current = null;
        updateState({ isMarqueeSelecting: false, marqueeStart: null });
    }, [state.paths, state.selectedPaths, screenToSVG, setSelectedPaths, updateState]);

    useEffect(() => {
        if (!state.svgElement || state.currentTool !== 'select') return;

        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            wrapper.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            
            // Clean up marquee rect if it exists
            if (marqueeRectRef.current) {
                marqueeRectRef.current.remove();
                marqueeRectRef.current = null;
            }
        };
    }, [state.svgElement, state.currentTool, handleMouseDown, handleMouseMove, handleMouseUp]);

    return {
        // Hook manages marquee selection internally
    };
}

