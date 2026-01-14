import React, { useEffect, useRef } from 'react';
import { Copy, Scissors, Clipboard, Trash2, CopyPlus, Group, Ungroup, Lock, Unlock, Eye, EyeOff, Layers, ArrowUp, ArrowDown } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  hasSelection: boolean;
  canGroup: boolean;
  canUngroup: boolean;
  canLock: boolean;
  isLocked: boolean;
  isHidden: boolean;
  canBringForward: boolean;
  canSendBackward: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onDuplicate,
  onGroup,
  onUngroup,
  onLock,
  onUnlock,
  onHide,
  onShow,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  hasSelection,
  canGroup,
  canUngroup,
  canLock,
  isLocked,
  isHidden,
  canBringForward,
  canSendBackward
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to fit in viewport
  const [adjustedX, adjustedY] = React.useMemo(() => {
    if (!menuRef.current) return [x, y];
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let newX = x;
    let newY = y;
    
    if (x + menuRect.width > viewportWidth) {
      newX = viewportWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > viewportHeight) {
      newY = viewportHeight - menuRect.height - 10;
    }
    
    return [Math.max(10, newX), Math.max(10, newY)];
  }, [x, y]);

  const menuItems = [
    ...(hasSelection ? [
      { id: 'copy', label: 'Copy', icon: <Copy size={14} />, shortcut: '⌘C', onClick: onCopy },
      { id: 'cut', label: 'Cut', icon: <Scissors size={14} />, shortcut: '⌘X', onClick: onCut },
      { id: 'duplicate', label: 'Duplicate', icon: <CopyPlus size={14} />, shortcut: '⌘D', onClick: onDuplicate },
    ] : []),
    { id: 'paste', label: 'Paste', icon: <Clipboard size={14} />, shortcut: '⌘V', onClick: onPaste, disabled: !hasSelection },
    ...(hasSelection ? [
      { id: 'divider1', isDivider: true },
      { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, shortcut: '⌫', onClick: onDelete },
      { id: 'divider2', isDivider: true },
      ...(canGroup ? [{ id: 'group', label: 'Group', icon: <Group size={14} />, shortcut: '⌘G', onClick: onGroup }] : []),
      ...(canUngroup ? [{ id: 'ungroup', label: 'Ungroup', icon: <Ungroup size={14} />, shortcut: '⌘⇧G', onClick: onUngroup }] : []),
      { id: 'divider3', isDivider: true },
      ...(canLock ? [
        ...(isLocked 
          ? [{ id: 'unlock', label: 'Unlock', icon: <Unlock size={14} />, onClick: onUnlock }]
          : [{ id: 'lock', label: 'Lock', icon: <Lock size={14} />, onClick: onLock }]
        ),
      ] : []),
      ...(isHidden
        ? [{ id: 'show', label: 'Show', icon: <Eye size={14} />, onClick: onShow }]
        : [{ id: 'hide', label: 'Hide', icon: <EyeOff size={14} />, onClick: onHide }]
      ),
      { id: 'divider4', isDivider: true },
      ...(canBringForward ? [{ id: 'bring-forward', label: 'Bring Forward', icon: <ArrowUp size={14} />, shortcut: '⌘]', onClick: onBringForward }] : []),
      ...(canSendBackward ? [{ id: 'send-backward', label: 'Send Backward', icon: <ArrowDown size={14} />, shortcut: '⌘[', onClick: onSendBackward }] : []),
      ...(canBringForward ? [{ id: 'bring-to-front', label: 'Bring to Front', icon: <Layers size={14} />, shortcut: '⌘⇧]', onClick: onBringToFront }] : []),
      ...(canSendBackward ? [{ id: 'send-to-back', label: 'Send to Back', icon: <Layers size={14} />, shortcut: '⌘⇧[', onClick: onSendToBack }] : []),
    ] : []),
  ].filter(Boolean);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-xl py-1 min-w-[180px]"
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems.map((item, index) => {
        if ((item as any).isDivider) {
          return <div key={`divider-${index}`} className="h-px bg-gray-700 my-1" />;
        }
        
        const menuItem = item as { id: string; label: string; icon: React.ReactNode; shortcut?: string; onClick?: () => void; disabled?: boolean };
        
        return (
          <button
            key={menuItem.id}
            onClick={() => {
              menuItem.onClick?.();
              onClose();
            }}
            disabled={menuItem.disabled}
            className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </div>
            {menuItem.shortcut && (
              <span className="text-xs text-gray-500 ml-4">{menuItem.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

