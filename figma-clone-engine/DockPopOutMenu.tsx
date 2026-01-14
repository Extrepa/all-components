import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  isSelected?: boolean;
}

interface DockPopOutMenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export const DockPopOutMenu: React.FC<DockPopOutMenuProps> = ({
  items,
  isOpen,
  onClose,
  onSelect,
  anchorRef
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position when menu opens or anchor changes
  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      // Estimate menu width based on content (will be adjusted after render)
      // Calculate approximate width: icon (14px) + gap (6px) + text + shortcut + padding
      const maxLabelLength = items.length > 0 ? Math.max(...items.map(item => item.label.length)) : 0;
      const estimatedMenuWidth = Math.max(140, maxLabelLength * 7 + 60); // Minimum 140px, adjust based on text
      const menuItemHeight = 32;
      const menuHeight = items.length * menuItemHeight;
      const gap = 6; // Gap between dock and menu

      // Position menu above the anchor button group
      const buttonGroupLeft = anchorRect.left;
      const buttonGroupWidth = anchorRect.width;
      let top = anchorRect.top - menuHeight - gap;
      let left = buttonGroupLeft + buttonGroupWidth / 2 - estimatedMenuWidth / 2;

      // Ensure menu stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 8;
      
      // Horizontal positioning
      if (left < margin) {
        left = margin;
      } else if (left + estimatedMenuWidth > viewportWidth - margin) {
        left = viewportWidth - estimatedMenuWidth - margin;
      }
      
      // Vertical positioning - always show above
      if (top < margin) {
        top = margin;
      } else if (top + menuHeight > viewportHeight - margin) {
        top = Math.max(margin, viewportHeight - menuHeight - margin);
      }

      setPosition({ top, left });
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef, items.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on the anchor group (icon + chevron buttons)
      if (anchorRef.current && anchorRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on any chevron button in the dock
      if (target.closest && target.closest('[data-dock-chevron]')) {
        return;
      }
      
      // Close the menu
      onClose();
    };

    // Add event listener with a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !anchorRef.current) return null;

  const menuContent = (
    <div
      ref={menuRef}
      data-dock-menu
      className="fixed z-[100] bg-white border border-gray-200 rounded-md shadow-xl py-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: 'auto',
        minWidth: 'fit-content',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onSelect(item.id);
            onClose();
          }}
          className={`w-full px-2 py-2 text-xs flex items-center gap-1.5 text-left ${
            item.isSelected
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.isSelected && <Check size={14} className="shrink-0" />}
          {item.icon && (
            <span className={`shrink-0 ${item.isSelected ? 'text-white' : 'text-gray-600'}`}>
              {item.icon}
            </span>
          )}
          <span className="flex-1 whitespace-nowrap">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-gray-400 font-mono ml-1">{item.shortcut}</span>
          )}
        </button>
      ))}
    </div>
  );

  // Use portal to render at document root to avoid z-index issues
  return createPortal(menuContent, document.body);
};

