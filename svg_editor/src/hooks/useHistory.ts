import { useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { HistoryState } from '../types';
import { HistoryManager } from '@/shared/utils/historyManager';

// Module-level history manager - initialized per component instance via ref
export function useHistory() {
    const { state, updateState } = useAppContext();
    const managerRef = useRef<HistoryManager<HistoryState[]> | null>(null);

    // Initialize history manager with current state and sync when history changes externally
    useEffect(() => {
        if (!managerRef.current) {
            const initialHistory: HistoryState[] = state.history.length > 0 
                ? state.history 
                : [];
            managerRef.current = new HistoryManager<HistoryState[]>(initialHistory, {
                mode: 'index-based',
                maxHistory: state.maxHistory,
            });
        } else {
            // Sync manager with app state if history was modified externally
            const currentHistory = managerRef.current.getState();
            if (currentHistory.length !== state.history.length || 
                state.historyIndex !== currentHistory.length - 1) {
                // Reinitialize if out of sync (e.g., after load)
                managerRef.current = new HistoryManager<HistoryState[]>(state.history, {
                    mode: 'index-based',
                    maxHistory: state.maxHistory,
                });
            }
        }
    }, [state.history.length, state.historyIndex, state.maxHistory]);

    const saveState = useCallback(() => {
        if (!state.svgElement) return;

        const serializer = new XMLSerializer();
        const historyState: HistoryState = {
            svgData: serializer.serializeToString(state.svgElement),
            timestamp: Date.now(),
        };

        if (!managerRef.current) {
            managerRef.current = new HistoryManager<HistoryState[]>([], {
                mode: 'index-based',
                maxHistory: state.maxHistory,
            });
        }

        const currentHistory = managerRef.current.getState();
        const last = currentHistory[currentHistory.length - 1];
        if (last && last.svgData === historyState.svgData) {
            return; // No changes
        }

        // Add new state to history using HistoryManager
        const newHistory = [...currentHistory, historyState];
        managerRef.current.pushState(newHistory);
        
        const updatedHistory = managerRef.current.getState();
        const newIndex = updatedHistory.length - 1;

        updateState({
            history: updatedHistory,
            historyIndex: newIndex,
        });
    }, [state.svgElement, state.maxHistory, updateState]);

    const undo = useCallback(() => {
        if (!managerRef.current) return;
        
        const prevHistory = managerRef.current.undo();
        if (prevHistory === null) return;
        
        const newIndex = prevHistory.length - 1;
        if (newIndex >= 0 && prevHistory[newIndex]) {
            restoreState(prevHistory[newIndex]);
            updateState({ 
                history: prevHistory,
                historyIndex: newIndex 
            });
        }
    }, [updateState]);

    const redo = useCallback(() => {
        if (!managerRef.current) return;
        
        const nextHistory = managerRef.current.redo();
        if (nextHistory === null) return;
        
        const newIndex = nextHistory.length - 1;
        if (newIndex >= 0 && nextHistory[newIndex]) {
            restoreState(nextHistory[newIndex]);
            updateState({ 
                history: nextHistory,
                historyIndex: newIndex 
            });
        }
    }, [updateState]);

    const restoreState = useCallback((historyState: HistoryState) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(historyState.svgData, 'image/svg+xml');
        const svgElement = doc.documentElement as unknown as SVGSVGElement;
        
        updateState({
            svgElement,
            svgData: historyState.svgData,
        });

        // Re-extract paths and groups
        // This will be handled by the component that calls restoreState
    }, [updateState]);

    return {
        saveState,
        undo,
        redo,
        restoreState,
    };
}

