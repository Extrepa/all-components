import { useEffect } from 'react';
import type { DesignState, ToolType, NodeId, SceneNode } from '../types';

export interface UseKeyboardShortcutsProps {
  state: DesignState;
  activeTool: ToolType;
  clipboard: SceneNode[];
  setActiveTool: (tool: ToolType) => void;
  undo: () => void;
  redo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup: () => void;
}

/**
 * Hook to handle keyboard shortcuts for the design editor.
 * 
 * Tool shortcuts:
 * - V: Select tool
 * - F: Frame tool
 * - R: Rectangle tool
 * - T: Text tool
 * - H: Hand tool
 * - P: Pen tool
 * - I: Eyedropper tool
 * 
 * Edit shortcuts:
 * - Ctrl/Cmd+Z: Undo
 * - Ctrl/Cmd+Shift+Z / Ctrl/Cmd+Y: Redo
 * - Ctrl/Cmd+C: Copy
 * - Ctrl/Cmd+V: Paste
 * - Ctrl/Cmd+D: Duplicate
 * - Ctrl/Cmd+G: Group
 * - Delete/Backspace: Delete selected
 */
export function useKeyboardShortcuts({
  state,
  activeTool,
  clipboard,
  setActiveTool,
  undo,
  redo,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onGroup,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Tool shortcuts (single key)
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setActiveTool('SELECT');
        return;
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveTool('FRAME');
        return;
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setActiveTool('RECTANGLE');
        return;
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setActiveTool('TEXT');
        return;
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setActiveTool('HAND');
        return;
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveTool('PEN');
        return;
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setActiveTool('EYEDROPPER');
        return;
      }

      // Edit shortcuts (modifier keys required)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd+Z
      if (modifierKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if (modifierKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Only process edit shortcuts in DESIGN mode
      if (state.mode !== 'DESIGN') {
        return;
      }

      // Copy: Ctrl/Cmd+C
      if (modifierKey && e.key === 'c') {
        if (state.selection.length > 0) {
          e.preventDefault();
          onCopy();
        }
        return;
      }

      // Paste: Ctrl/Cmd+V (only when modifier key is held, not when 'V' is pressed alone for tool selection)
      if (modifierKey && e.key === 'v') {
        if (clipboard.length > 0) {
          e.preventDefault();
          onPaste();
        }
        return;
      }

      // Duplicate: Ctrl/Cmd+D
      if (modifierKey && e.key === 'd') {
        if (state.selection.length > 0) {
          e.preventDefault();
          onDuplicate();
        }
        return;
      }

      // Group: Ctrl/Cmd+G
      if (modifierKey && e.key === 'g') {
        if (state.selection.length > 1) {
          e.preventDefault();
          onGroup();
        }
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection.length > 0) {
          e.preventDefault();
          onDelete();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, activeTool, clipboard, setActiveTool, undo, redo, onCopy, onPaste, onDuplicate, onDelete, onGroup]);
}
