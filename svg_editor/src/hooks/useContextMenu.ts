import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useHistory } from './useHistory';
import { usePathExtraction } from './usePathExtraction';
import { useSVGRenderer } from './useSVGRenderer';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

export function useContextMenu() {
    const { state, updateState, setSelectedPaths, clearSelection } = useAppContext();
    const { saveState } = useHistory();
    const { extractPaths, extractGroups } = usePathExtraction();
    const { renderSVG } = useSVGRenderer();
    const { copySelectedPaths, duplicateSelectedPaths, deleteSelectedPaths } = useKeyboardShortcuts();
    const menuRef = useRef<HTMLDivElement | null>(null);

    const hideContextMenu = useCallback(() => {
        const menu = document.getElementById('contextMenu');
        if (menu) {
            menu.style.display = 'none';
        }
    }, []);

    const showContextMenu = useCallback((x: number, y: number, pathId?: string) => {
        const menu = document.getElementById('contextMenu');
        if (!menu) return;

        // Don't show if panning
        if (state.spacePanning) return;

        const selectedCount = state.selectedPaths.size;
        const path = pathId ? state.paths.find(p => p.id === pathId) : null;
        const isSelected = pathId ? state.selectedPaths.has(pathId) : false;
        const hasMultipleSelected = selectedCount > 1;

        // Build menu items
        const menuItems: string[] = [];

        if (selectedCount === 0 && !pathId) {
            // No selection - show tool options
            menuItems.push(`<div class="context-menu-item" data-action="tool-select">Select Tool</div>`);
            menuItems.push(`<div class="context-menu-item" data-action="tool-move">Move Tool</div>`);
            menuItems.push(`<div class="context-menu-item" data-action="tool-resize">Resize Tool</div>`);
        } else {
            // Has selection or path clicked
            menuItems.push(`<div class="context-menu-item" data-action="tool-move">Move</div>`);
            menuItems.push(`<div class="context-menu-item" data-action="tool-resize">Resize</div>`);
            menuItems.push(`<div class="context-menu-item" data-action="copy">Copy</div>`);
            menuItems.push(`<div class="context-menu-item" data-action="duplicate">Duplicate</div>`);
            menuItems.push(`<div class="context-menu-separator"></div>`);

            if (!isSelected && pathId) {
                menuItems.push(`<div class="context-menu-item" data-action="select" data-path-id="${pathId}">Select</div>`);
            }

            if (hasMultipleSelected) {
                menuItems.push(`<div class="context-menu-item" data-action="align-left">Align Left</div>`);
                menuItems.push(`<div class="context-menu-item" data-action="align-center">Align Center</div>`);
                menuItems.push(`<div class="context-menu-item" data-action="align-right">Align Right</div>`);
                menuItems.push(`<div class="context-menu-item" data-action="align-top">Align Top</div>`);
                menuItems.push(`<div class="context-menu-item" data-action="align-middle">Align Middle</div>`);
                menuItems.push(`<div class="context-menu-item" data-action="align-bottom">Align Bottom</div>`);
                menuItems.push(`<div class="context-menu-separator"></div>`);
            }

            menuItems.push(`<div class="context-menu-item" data-action="delete">Delete</div>`);
        }

        menu.innerHTML = menuItems.join('');

        // Position menu
        const menuWidth = 160;
        const menuHeight = menuItems.length * 32;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let menuX = Math.max(10, Math.min(x, viewportWidth - menuWidth - 10));
        let menuY = Math.max(10, Math.min(y, viewportHeight - menuHeight - 10));

        menu.style.left = `${menuX}px`;
        menu.style.top = `${menuY}px`;
        menu.style.display = 'block';

        // Handle menu item clicks
        const handleMenuClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const action = target.getAttribute('data-action');
            if (!action) return;

            e.stopPropagation();
            hideContextMenu();

            switch (action) {
                case 'tool-select':
                    updateState({ currentTool: 'select' });
                    break;
                case 'tool-move':
                    updateState({ currentTool: 'move' });
                    break;
                case 'tool-resize':
                    updateState({ currentTool: 'resize' });
                    break;
                case 'copy':
                    copySelectedPaths();
                    break;
                case 'duplicate':
                    duplicateSelectedPaths();
                    break;
                case 'delete':
                    deleteSelectedPaths();
                    break;
                case 'select':
                    const selectPathId = target.getAttribute('data-path-id');
                    if (selectPathId) {
                        clearSelection();
                        setSelectedPaths(new Set([selectPathId]));
                    }
                    break;
                case 'align-left':
                case 'align-center':
                case 'align-right':
                case 'align-top':
                case 'align-middle':
                case 'align-bottom':
                    // Open alignment tools panel
                    updateState({ currentPanel: 'alignment' });
                    break;
            }
        };

        menu.addEventListener('click', handleMenuClick);

        // Close on outside click
        setTimeout(() => {
            const closeHandler = (e: MouseEvent) => {
                if (!menu.contains(e.target as Node)) {
                    hideContextMenu();
                    document.removeEventListener('click', closeHandler);
                    menu.removeEventListener('click', handleMenuClick);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    }, [state.selectedPaths, state.paths, state.spacePanning, updateState, copySelectedPaths, duplicateSelectedPaths, deleteSelectedPaths, clearSelection, setSelectedPaths, hideContextMenu]);

    const handleContextMenu = useCallback((e: MouseEvent) => {
        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        // Don't show context menu if panning
        if (state.spacePanning) {
            e.preventDefault();
            return;
        }

        const target = e.target as HTMLElement;
        const svg = wrapper.querySelector('svg');
        if (!svg) return;

        // Check if clicking on a path
        const pathElement = target.closest('path') as SVGPathElement;
        const pathId = pathElement?.id;

        // If right-clicking on empty space (not a path) and have selection, show menu for selection
        if (!pathId && state.selectedPaths.size > 0) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY);
            return;
        }

        // If right-clicking on a path
        if (pathId) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, pathId);
        }
    }, [state.spacePanning, state.selectedPaths, showContextMenu]);

    useEffect(() => {
        if (!state.svgElement) return;

        const wrapper = document.getElementById('svgWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('contextmenu', handleContextMenu);

        return () => {
            wrapper.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [state.svgElement, handleContextMenu]);

    return {
        showContextMenu,
        hideContextMenu,
    };
}

