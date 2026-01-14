import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export function usePanAndZoom() {
    const { state, updateState } = useAppContext();
    const isPanningRef = useRef(false);
    const panButtonRef = useRef<number | null>(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const scrollStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        const isMiddle = e.button === 1;
        const isAltPan = e.button === 2 || (e.button === 0 && state.spacePanning);
        
        if (!isMiddle && !isAltPan) return;

        isPanningRef.current = true;
        panButtonRef.current = e.button;
        startPosRef.current = { x: e.clientX, y: e.clientY };
        scrollStartRef.current = { x: wrapper.scrollLeft, y: wrapper.scrollTop };
        wrapper.style.cursor = 'grabbing';
        e.preventDefault();
    }, [state.spacePanning]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isPanningRef.current) return;

        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        wrapper.scrollLeft = scrollStartRef.current.x - dx;
        wrapper.scrollTop = scrollStartRef.current.y - dy;
    }, []);

    const handleMouseUp = useCallback(() => {
        if (!isPanningRef.current) return;

        isPanningRef.current = false;
        panButtonRef.current = null;
        
        const wrapper = document.getElementById('svgWrapper');
        if (wrapper) {
            wrapper.style.cursor = state.spacePanning ? 'grab' : '';
        }
    }, [state.spacePanning]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (!state.svgElement) return;
            
            // Don't trigger if typing in inputs
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            updateState({ spacePanning: true });
            
            const wrapper = document.getElementById('svgWrapper');
            if (wrapper && !isPanningRef.current) {
                wrapper.style.cursor = 'grab';
            }
            e.preventDefault();
        }
    }, [state.svgElement, updateState]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            updateState({ spacePanning: false });
            
            const wrapper = document.getElementById('svgWrapper');
            if (wrapper && !isPanningRef.current) {
                wrapper.style.cursor = '';
            }
        }
    }, [updateState]);

    const handleContextMenu = useCallback((e: MouseEvent) => {
        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        if (isPanningRef.current || panButtonRef.current === 2) {
            e.preventDefault();
        }
        if (state.spacePanning) {
            e.preventDefault();
        }
    }, [state.spacePanning]);

    useEffect(() => {
        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        wrapper.addEventListener('contextmenu', handleContextMenu);

        return () => {
            wrapper.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            wrapper.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp, handleContextMenu]);

    return {
        // Zoom is handled by state.currentZoom and buttons in PreviewArea
        // This hook just handles panning
    };
}

