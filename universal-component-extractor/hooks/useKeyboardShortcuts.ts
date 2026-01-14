import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmdPressed = isMac ? event.metaKey : event.ctrlKey;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                       event.code === shortcut.key ||
                       event.key === shortcut.key;

      const ctrlOrCmdMatch = shortcut.ctrlOrCmd === undefined 
        ? !ctrlOrCmdPressed && !event.ctrlKey && !event.metaKey
        : shortcut.ctrlOrCmd === ctrlOrCmdPressed;

      const shiftMatch = shortcut.shift === undefined 
        ? !event.shiftKey
        : shortcut.shift === event.shiftKey;

      const altMatch = shortcut.alt === undefined 
        ? !event.altKey
        : shortcut.alt === event.altKey;

      if (keyMatch && ctrlOrCmdMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        return;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
}

// Common keyboard shortcuts for the app
export const APP_SHORTCUTS = {
  EXTRACT: { key: 'e', ctrlOrCmd: true, description: 'Extract component' },
  CLEAR: { key: 'k', ctrlOrCmd: true, description: 'Clear input' },
  SETTINGS: { key: ',', ctrlOrCmd: true, description: 'Open settings' },
  HELP: { key: '?', shift: true, description: 'Show help/welcome' },
  IMPORT: { key: 'i', ctrlOrCmd: true, description: 'Import files' },
  EXPORT_ZIP: { key: 'z', ctrlOrCmd: true, shift: true, description: 'Export as ZIP' },
  EXPORT_HTML: { key: 'h', ctrlOrCmd: true, shift: true, description: 'Export as HTML' },
  FULLSCREEN: { key: 'f', description: 'Toggle fullscreen preview' },
  REFRESH_PREVIEW: { key: 'r', ctrlOrCmd: true, description: 'Refresh preview' },
} as const;

