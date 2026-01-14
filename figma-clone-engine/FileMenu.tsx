import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';

interface MenuSubItem {
  id: string;
  label?: string;
  shortcut?: string;
  onClick?: () => void;
  hasArrow?: boolean;
  disabled?: boolean;
  isDivider?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  hasArrow?: boolean;
  subItems?: MenuSubItem[];
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

interface FileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onLoad?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onZoomSelection?: () => void;
  onZoom100?: () => void;
  onToggleGrid?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onFrameSelection?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onNewFile?: () => void;
  onSaveAs?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const FileMenu: React.FC<FileMenuProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onLoad,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectAll,
  onDeselectAll,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomSelection,
  onZoom100,
  onToggleGrid,
  onGroup,
  onUngroup,
  onFrameSelection,
  onFlipHorizontal,
  onFlipVertical,
  onNewFile,
  onSaveAs,
  onExport,
  onImport,
  canUndo = false,
  canRedo = false
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 64, left: 16 });
  const menuRef = useRef<HTMLDivElement>(null);
  const preferencesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          preferencesRef.current && !preferencesRef.current.contains(event.target as Node)) {
        onClose();
        setPreferencesOpen(false);
        setExpandedItems(new Set());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Calculate menu position relative to button (top-4 left-4 = 16px, 16px)
      // Button is 40px wide (p-2 = 8px padding each side + 16px icon = 32px, plus border)
      const buttonLeft = 16;
      const buttonTop = 16;
      const buttonWidth = 40;
      const menuWidth = 240;
      const menuMaxHeight = window.innerHeight * 0.8;
      
      let left = buttonLeft;
      let top = buttonTop + buttonWidth + 8; // 8px gap
      
      // Ensure menu fits within viewport
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16; // 16px margin from right
      }
      if (left < 0) left = 16;
      
      if (top + menuMaxHeight > window.innerHeight) {
        top = Math.max(16, window.innerHeight - menuMaxHeight - 16);
      }
      
      setMenuPosition({ top, left });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMenuItemClick = (id: string, action?: () => void) => {
    if (action) {
      action();
      onClose();
    } else {
      toggleExpanded(id);
    }
  };

  const menuItems: MenuItem[] = [
    { 
      id: 'file', 
      label: 'File', 
      hasArrow: true,
      subItems: [
        { id: 'new', label: 'New file', shortcut: '⌘N', onClick: () => onNewFile && onNewFile() },
        { id: 'new-window', label: 'New window', shortcut: '⌘⇧N', onClick: () => window.open(window.location.href, '_blank') },
        { id: 'open', label: 'Open...', shortcut: '⌘O', onClick: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => onLoad && onLoad(e as any);
          input.click();
        }},
        { id: 'open-recent', label: 'Open recent', hasArrow: true, onClick: () => console.log('Open recent') },
        { id: 'divider1', isDivider: true },
        { id: 'save', label: 'Save', shortcut: '⌘S', onClick: () => onSave && onSave() },
        { id: 'save-as', label: 'Save as...', shortcut: '⌘⇧S', onClick: () => onSaveAs && onSaveAs() },
        { id: 'save-version', label: 'Save version', onClick: () => onSave && onSave() },
        { id: 'divider2', isDivider: true },
        { id: 'import', label: 'Import...', onClick: () => onImport && onImport() },
        { id: 'export', label: 'Export...', shortcut: '⌘E', onClick: () => onExport && onExport() },
        { id: 'export-selection', label: 'Export selection', shortcut: '⌘⇧E', onClick: () => onExport && onExport() },
        { id: 'divider3', isDivider: true },
        { id: 'duplicate', label: 'Duplicate file', shortcut: '⌘D', onClick: () => onDuplicate && onDuplicate() },
        { id: 'rename', label: 'Rename file', onClick: () => {
          const newName = prompt('Enter new file name:', 'Untitled');
          if (newName) console.log('Rename to:', newName);
        }},
        { id: 'move-to', label: 'Move to...', onClick: () => console.log('Move to') },
        { id: 'divider4', isDivider: true },
        { id: 'close', label: 'Close file', shortcut: '⌘W', onClick: () => {
          if (confirm('Are you sure you want to close this file?')) {
            window.location.reload();
          }
        }},
      ]
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      hasArrow: true,
      subItems: [
        { id: 'undo', label: 'Undo', shortcut: '⌘Z', onClick: () => onUndo && onUndo(), disabled: !canUndo },
        { id: 'redo', label: 'Redo', shortcut: '⌘⇧Z', onClick: () => onRedo && onRedo(), disabled: !canRedo },
        { id: 'divider1', isDivider: true },
        { id: 'cut', label: 'Cut', shortcut: '⌘X', onClick: () => onCut && onCut() },
        { id: 'copy', label: 'Copy', shortcut: '⌘C', onClick: () => onCopy && onCopy() },
        { id: 'paste', label: 'Paste', shortcut: '⌘V', onClick: () => onPaste && onPaste() },
        { id: 'paste-over', label: 'Paste over selection', shortcut: '⌘⇧V', onClick: () => onPaste && onPaste() },
        { id: 'divider2', isDivider: true },
        { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D', onClick: () => onDuplicate && onDuplicate() },
        { id: 'delete', label: 'Delete', shortcut: '⌫', onClick: () => onDelete && onDelete() },
        { id: 'divider3', isDivider: true },
        { id: 'select-all', label: 'Select all', shortcut: '⌘A', onClick: () => onSelectAll && onSelectAll() },
        { id: 'deselect-all', label: 'Deselect all', shortcut: '⌘⇧A', onClick: () => onDeselectAll && onDeselectAll() },
        { id: 'select-same', label: 'Select same', onClick: () => console.log('Select same') },
        { id: 'divider4', isDivider: true },
        { id: 'find-replace', label: 'Find and replace', shortcut: '⌘F', onClick: () => {
          const searchTerm = prompt('Find:');
          if (searchTerm) console.log('Searching for:', searchTerm);
        }},
      ]
    },
    { 
      id: 'view', 
      label: 'View', 
      hasArrow: true,
      subItems: [
        { id: 'zoom-in', label: 'Zoom in', shortcut: '⌘+', onClick: () => onZoomIn && onZoomIn() },
        { id: 'zoom-out', label: 'Zoom out', shortcut: '⌘-', onClick: () => onZoomOut && onZoomOut() },
        { id: 'zoom-fit', label: 'Zoom to fit', shortcut: '⇧1', onClick: () => onZoomFit && onZoomFit() },
        { id: 'zoom-selection', label: 'Zoom to selection', shortcut: '⇧2', onClick: () => onZoomSelection && onZoomSelection() },
        { id: 'zoom-100', label: 'Zoom to 100%', shortcut: '⌘0', onClick: () => onZoom100 && onZoom100() },
        { id: 'divider1', isDivider: true },
        { id: 'show-grid', label: 'Show grid', shortcut: '⌘\'', onClick: () => onToggleGrid && onToggleGrid() },
        { id: 'show-rulers', label: 'Show rulers', shortcut: '⌘R', onClick: () => console.log('Show rulers') },
        { id: 'show-outlines', label: 'Show outlines', shortcut: '⌘⇧O', onClick: () => console.log('Show outlines') },
        { id: 'divider2', isDivider: true },
        { id: 'show-ui', label: 'Show UI', shortcut: '⌘.', onClick: () => console.log('Show UI') },
        { id: 'presentation', label: 'Presentation mode', shortcut: '⌘⇧P', onClick: () => console.log('Presentation mode') },
      ]
    },
    { 
      id: 'object', 
      label: 'Object', 
      hasArrow: true,
      subItems: [
        { id: 'transform', label: 'Transform', hasArrow: true, onClick: () => console.log('Transform') },
        { id: 'flip-horizontal', label: 'Flip horizontal', shortcut: '⌘⇧H', onClick: () => onFlipHorizontal && onFlipHorizontal() },
        { id: 'flip-vertical', label: 'Flip vertical', shortcut: '⌘⇧V', onClick: () => onFlipVertical && onFlipVertical() },
        { id: 'divider1', isDivider: true },
        { id: 'align-left', label: 'Align left', shortcut: '⌘⇧←', onClick: () => console.log('Align left') },
        { id: 'align-center', label: 'Align center', shortcut: '⌘⇧↑', onClick: () => console.log('Align center') },
        { id: 'align-right', label: 'Align right', shortcut: '⌘⇧→', onClick: () => console.log('Align right') },
        { id: 'align-top', label: 'Align top', shortcut: '⌘⇧↓', onClick: () => console.log('Align top') },
        { id: 'divider2', isDivider: true },
        { id: 'distribute-horizontal', label: 'Distribute horizontal', onClick: () => console.log('Distribute horizontal') },
        { id: 'distribute-vertical', label: 'Distribute vertical', onClick: () => console.log('Distribute vertical') },
        { id: 'divider3', isDivider: true },
        { id: 'group', label: 'Group', shortcut: '⌘G', onClick: () => onGroup && onGroup() },
        { id: 'ungroup', label: 'Ungroup', shortcut: '⌘⇧G', onClick: () => onUngroup && onUngroup() },
        { id: 'frame-selection', label: 'Frame selection', shortcut: '⌘⌥G', onClick: () => onFrameSelection && onFrameSelection() },
        { id: 'divider4', isDivider: true },
        { id: 'mask', label: 'Mask', shortcut: '⌘⌃M', onClick: () => console.log('Mask') },
        { id: 'use-as-mask', label: 'Use as mask', onClick: () => console.log('Use as mask') },
      ]
    },
    { 
      id: 'text', 
      label: 'Text', 
      hasArrow: true,
      subItems: [
        { id: 'font-family', label: 'Font family', hasArrow: true, onClick: () => console.log('Font family') },
        { id: 'font-size', label: 'Font size', hasArrow: true, onClick: () => console.log('Font size') },
        { id: 'font-weight', label: 'Font weight', hasArrow: true, onClick: () => console.log('Font weight') },
        { id: 'divider1', isDivider: true },
        { id: 'bold', label: 'Bold', shortcut: '⌘B', onClick: () => console.log('Bold') },
        { id: 'italic', label: 'Italic', shortcut: '⌘I', onClick: () => console.log('Italic') },
        { id: 'underline', label: 'Underline', shortcut: '⌘U', onClick: () => console.log('Underline') },
        { id: 'strikethrough', label: 'Strikethrough', shortcut: '⌘⇧X', onClick: () => console.log('Strikethrough') },
        { id: 'divider2', isDivider: true },
        { id: 'align-left', label: 'Align left', shortcut: '⌘⇧L', onClick: () => console.log('Text align left') },
        { id: 'align-center', label: 'Align center', shortcut: '⌘⇧C', onClick: () => console.log('Text align center') },
        { id: 'align-right', label: 'Align right', shortcut: '⌘⇧R', onClick: () => console.log('Text align right') },
        { id: 'align-justify', label: 'Justify', shortcut: '⌘⇧J', onClick: () => console.log('Justify') },
        { id: 'divider3', isDivider: true },
        { id: 'letter-spacing', label: 'Letter spacing', onClick: () => console.log('Letter spacing') },
        { id: 'line-height', label: 'Line height', onClick: () => console.log('Line height') },
        { id: 'paragraph-spacing', label: 'Paragraph spacing', onClick: () => console.log('Paragraph spacing') },
      ]
    },
    { 
      id: 'arrange', 
      label: 'Arrange', 
      hasArrow: true,
      subItems: [
        { id: 'bring-forward', label: 'Bring forward', shortcut: '⌘]', onClick: () => console.log('Bring forward') },
        { id: 'bring-to-front', label: 'Bring to front', shortcut: '⌘⇧]', onClick: () => console.log('Bring to front') },
        { id: 'send-backward', label: 'Send backward', shortcut: '⌘[', onClick: () => console.log('Send backward') },
        { id: 'send-to-back', label: 'Send to back', shortcut: '⌘⇧[', onClick: () => console.log('Send to back') },
        { id: 'divider1', isDivider: true },
        { id: 'lock', label: 'Lock', shortcut: '⌘⇧L', onClick: () => console.log('Lock') },
        { id: 'unlock', label: 'Unlock', shortcut: '⌘⇧⌥L', onClick: () => console.log('Unlock') },
        { id: 'divider2', isDivider: true },
        { id: 'hide', label: 'Hide', shortcut: '⌘⇧H', onClick: () => console.log('Hide') },
        { id: 'show', label: 'Show', shortcut: '⌘⇧⌥H', onClick: () => console.log('Show') },
      ]
    },
    { 
      id: 'vector', 
      label: 'Vector', 
      hasArrow: true,
      subItems: [
        { id: 'union', label: 'Union', shortcut: '⌘⌥U', onClick: () => console.log('Union') },
        { id: 'subtract', label: 'Subtract', shortcut: '⌘⌥S', onClick: () => console.log('Subtract') },
        { id: 'intersect', label: 'Intersect', shortcut: '⌘⌥I', onClick: () => console.log('Intersect') },
        { id: 'exclude', label: 'Exclude', shortcut: '⌘⌥X', onClick: () => console.log('Exclude') },
        { id: 'divider1', isDivider: true },
        { id: 'flatten', label: 'Flatten', onClick: () => console.log('Flatten') },
        { id: 'outline-stroke', label: 'Outline stroke', shortcut: '⌘⇧O', onClick: () => console.log('Outline stroke') },
        { id: 'divider2', isDivider: true },
        { id: 'simplify', label: 'Simplify', onClick: () => console.log('Simplify') },
        { id: 'reverse-path', label: 'Reverse path', onClick: () => console.log('Reverse path') },
      ]
    },
    { 
      id: 'plugins', 
      label: 'Plugins', 
      hasArrow: true,
      subItems: [
        { id: 'browse', label: 'Browse plugins', onClick: () => console.log('Browse plugins') },
        { id: 'manage', label: 'Manage plugins', onClick: () => console.log('Manage plugins') },
        { id: 'divider1', isDivider: true },
        { id: 'run-last', label: 'Run last plugin', shortcut: '⌘⌥P', onClick: () => console.log('Run last plugin') },
      ]
    },
    { 
      id: 'widgets', 
      label: 'Widgets', 
      hasArrow: true,
      subItems: [
        { id: 'browse', label: 'Browse widgets', onClick: () => console.log('Browse widgets') },
        { id: 'manage', label: 'Manage widgets', onClick: () => console.log('Manage widgets') },
        { id: 'divider1', isDivider: true },
        { id: 'run-last', label: 'Run last widget', onClick: () => console.log('Run last widget') },
      ]
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      hasArrow: true,
      isHighlighted: hoveredItem === 'preferences',
      onMouseEnter: () => {
        setHoveredItem('preferences');
        setPreferencesOpen(true);
      }
    },
    { 
      id: 'libraries', 
      label: 'Libraries', 
      hasArrow: true,
      subItems: [
        { id: 'browse', label: 'Browse libraries', onClick: () => console.log('Browse libraries') },
        { id: 'add-library', label: 'Add library', onClick: () => console.log('Add library') },
        { id: 'divider1', isDivider: true },
        { id: 'publish', label: 'Publish library', onClick: () => console.log('Publish library') },
        { id: 'update', label: 'Update library', onClick: () => console.log('Update library') },
      ]
    },
    { 
      id: 'desktop', 
      label: 'Open in desktop app', 
      hasArrow: false,
      onClick: () => console.log('Open in desktop app')
    },
    { 
      id: 'help', 
      label: 'Help and account', 
      hasArrow: true,
      subItems: [
        { id: 'help-center', label: 'Help center', onClick: () => console.log('Help center') },
        { id: 'shortcuts', label: 'Keyboard shortcuts', shortcut: '⌘?', onClick: () => console.log('Keyboard shortcuts') },
        { id: 'divider1', isDivider: true },
        { id: 'account', label: 'Account settings', onClick: () => console.log('Account settings') },
        { id: 'sign-out', label: 'Sign out', onClick: () => console.log('Sign out') },
      ]
    },
  ];

  const preferencesItems = [
    { id: 'snap-geometry', label: 'Snap to geometry', checked: true },
    { id: 'snap-objects', label: 'Snap to objects', checked: true },
    { id: 'snap-pixel', label: 'Snap to pixel grid', checked: true, shortcut: '⇧⌘\'' },
    { id: 'divider1', isDivider: true },
    { id: 'keep-tool', label: 'Keep tool selected after use', checked: false },
    { id: 'highlight-layers', label: 'Highlight layers on hover', checked: true },
    { id: 'rename-duplicated', label: 'Rename duplicated layers', checked: true },
    { id: 'show-dimensions', label: 'Show dimensions on objects', checked: true },
    { id: 'hide-canvas-ui', label: 'Hide canvas UI during changes', checked: true },
    { id: 'smart-quotes', label: 'Use smart quotes/symbols', checked: true },
    { id: 'flip-objects', label: 'Flip objects while resizing', checked: true },
    { id: 'keyboard-zoom', label: 'Keyboard zooms into selection', checked: false },
    { id: 'invert-zoom', label: 'Invert zoom direction', checked: false },
    { id: 'ctrl-click', label: 'Ctrl+click opens right click menus', checked: false },
    { id: 'number-opacity', label: 'Use number keys for opacity', checked: true },
    { id: 'old-shortcuts', label: 'Use old shortcuts for outlines', checked: false },
    { id: 'audio-notifications', label: 'Play audio notifications in AI chat', checked: true },
    { id: 'open-links', label: 'Open links in desktop app', checked: false },
    { id: 'divider2', isDivider: true },
    { id: 'scroll-zoom', label: 'Use scroll wheel zoom', checked: false },
    { id: 'right-click-pan', label: 'Right-click and drag to pan', checked: false },
    { id: 'divider3', isDivider: true },
    { id: 'theme', label: 'Theme', hasArrow: true },
    { id: 'color-profile', label: 'Color profile...', hasArrow: false },
    { id: 'keyboard-layout', label: 'Keyboard layout...', hasArrow: false },
    { id: 'accessibility', label: 'Accessibility settings...', hasArrow: false },
    { id: 'permissions', label: 'Permissions and helpers...', hasArrow: false },
    { id: 'nudge-amount', label: 'Nudge amount...', hasArrow: false },
  ];

  return (
    <>
      {/* Main Menu */}
      <div 
        ref={menuRef}
        className="fixed z-[60] bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-2xl min-w-[240px] max-h-[80vh] overflow-y-auto py-1"
        style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
      >
        {/* Actions Search - Header */}
        <div className="px-3 py-2 border-b border-gray-700/50">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Actions..."
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-8 py-1.5 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
              ⌘K
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {/* Help text for actions */}
          <div className="px-3 py-1.5 text-xs text-gray-400">
            You can click on actions
          </div>
          
          {menuItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id}>
                <div
                  onMouseEnter={() => {
                    if (item.onMouseEnter) {
                      item.onMouseEnter();
                    } else if (item.id !== 'preferences') {
                      setHoveredItem(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.id !== 'preferences') {
                      setHoveredItem(null);
                    }
                  }}
                  onClick={() => handleMenuItemClick(item.id, item.onClick)}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                    item.isHighlighted 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <span className="text-[10px] text-gray-500">{item.shortcut}</span>
                    )}
                    {hasSubItems && (
                      isExpanded ? (
                        <ChevronDown size={12} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={12} className="text-gray-500" />
                      )
                    )}
                  </div>
                </div>

                {/* Submenu Items */}
                {hasSubItems && isExpanded && (
                  <div className="bg-gray-800/30 pl-4">
                    {item.subItems!.map((subItem) => {
                      if (subItem.isDivider) {
                        return <div key={subItem.id} className="border-t border-gray-700/50 my-1 mx-3" />;
                      }

                      return (
                        <div
                          key={subItem.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (subItem.onClick && !subItem.disabled) {
                              subItem.onClick();
                              onClose();
                            }
                          }}
                          className={`px-3 py-1.5 text-xs flex items-center justify-between ${
                            subItem.disabled 
                              ? 'cursor-not-allowed text-gray-500 opacity-50' 
                              : 'cursor-pointer text-gray-300 hover:bg-gray-700/50'
                          } ${subItem.hasArrow ? '' : ''}`}
                        >
                          <span>{subItem.label}</span>
                          <div className="flex items-center gap-2">
                            {subItem.shortcut && (
                              <span className="text-[10px] text-gray-500">{subItem.shortcut}</span>
                            )}
                            {subItem.hasArrow && (
                              <ChevronRight size={12} className="text-gray-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences Submenu */}
      {preferencesOpen && menuRef.current && (
        <div
          ref={preferencesRef}
          className="fixed z-[60] bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-2xl min-w-[280px] max-h-[80vh] overflow-y-auto py-1"
          style={{ 
            top: `${menuPosition.top}px`, 
            left: `${menuPosition.left + (menuRef.current?.offsetWidth || 240) + 8}px` 
          }}
          onMouseEnter={() => setPreferencesOpen(true)}
          onMouseLeave={() => {
            setPreferencesOpen(false);
            setHoveredItem(null);
          }}
        >
          {preferencesItems.map((item) => {
            if (item.isDivider) {
              return <div key={item.id} className="border-t border-gray-700/50 my-1" />;
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  console.log(`Toggle ${item.label}`);
                  onClose();
                }}
                className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                  item.checked
                    ? 'text-gray-300 hover:bg-gray-700/50'
                    : 'text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.checked && <span className="text-cyan-400">✓</span>}
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.shortcut && (
                    <span className="text-[10px] text-gray-500">{item.shortcut}</span>
                  )}
                  {item.hasArrow && (
                    <ChevronRight size={12} className="text-gray-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
