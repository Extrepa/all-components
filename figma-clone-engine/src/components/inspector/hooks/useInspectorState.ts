import { useState, useEffect, useRef } from 'react';
import { DesignState } from '../../../types';
import { InspectorTab } from '../types';

export const useInspectorState = (state: DesignState) => {
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('design');
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const previewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(event.target as Node)) {
        setZoomDropdownOpen(false);
      }
      if (previewDropdownRef.current && !previewDropdownRef.current.contains(event.target as Node)) {
        setPreviewDropdownOpen(false);
      }
    };

    if (zoomDropdownOpen || previewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [zoomDropdownOpen, previewDropdownOpen]);

  // Auto-expand panel when object is selected
  useEffect(() => {
    if (state.selection.length > 0 && isCollapsed) {
      const node = state.nodes[state.selection[0]];
      const isRootFrame =
        state.rootIds.includes(state.selection[0]) &&
        (node.type === 'FRAME' || node.type === 'COMPONENT');

      if (!isRootFrame) {
        setIsCollapsed(false);
      }
    }
  }, [state.selection, state.nodes, state.rootIds, isCollapsed]);

  return {
    inspectorTab,
    setInspectorTab,
    zoomDropdownOpen,
    setZoomDropdownOpen,
    previewDropdownOpen,
    setPreviewDropdownOpen,
    isCollapsed,
    setIsCollapsed,
    zoomDropdownRef,
    previewDropdownRef
  };
};

