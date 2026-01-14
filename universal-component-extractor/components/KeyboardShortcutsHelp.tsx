import React from 'react';
import { APP_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { ...APP_SHORTCUTS.EXTRACT, keys: `${modifierKey} + E` },
    { ...APP_SHORTCUTS.CLEAR, keys: `${modifierKey} + K` },
    { ...APP_SHORTCUTS.SETTINGS, keys: `${modifierKey} + ,` },
    { ...APP_SHORTCUTS.HELP, keys: 'Shift + ?' },
    { ...APP_SHORTCUTS.IMPORT, keys: `${modifierKey} + I` },
    { ...APP_SHORTCUTS.EXPORT_ZIP, keys: `${modifierKey} + Shift + Z` },
    { ...APP_SHORTCUTS.EXPORT_HTML, keys: `${modifierKey} + Shift + H` },
    { key: 'Escape', description: 'Close modals', keys: 'Esc' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">⌨️</span>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm font-mono text-gray-200 shadow-inner">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>💡 Tip:</strong> Keyboard shortcuts are disabled when modals are open. 
              Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd> to close modals and re-enable shortcuts.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

