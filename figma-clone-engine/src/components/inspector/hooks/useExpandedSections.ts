import { useState, useEffect } from 'react';
import { DesignState, SceneNode } from '../../../types';
import { SectionId } from '../types';

export const useExpandedSections = (
  state: DesignState,
  isCollapsed: boolean
): [Set<SectionId>, (section: SectionId) => void, React.Dispatch<React.SetStateAction<Set<SectionId>>>] => {
  const getInitialExpandedSections = (): Set<SectionId> => {
    return new Set([
      'position',
      'layout',
      'constraints',
      'appearance',
      'fill',
      'stroke',
      'effects',
      'typography',
      'export',
      'component',
      'variables',
      'styles',
      'interactions',
      'prototypeSettings'
    ]);
  };

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(getInitialExpandedSections);

  // Keep all sections expanded by default when selection changes
  // Also auto-expand the panel if it was collapsed and an object (not page) is selected
  useEffect(() => {
    if (state.selection.length > 0) {
      const node = state.nodes[state.selection[0]];
      const isRootFrame =
        state.rootIds.includes(state.selection[0]) &&
        (node.type === 'FRAME' || node.type === 'COMPONENT');

      const sectionsToExpand: SectionId[] = [
        'position',
        'layout',
        'constraints',
        'appearance',
        'typography',
        'export',
        'component',
        'variables',
        'styles'
      ];

      // Add conditional sections if they exist
      if (node && 'fill' in node && (node as any).fill) {
        sectionsToExpand.push('fill');
      }
      if (node && (node as any).borderWidth && (node as any).borderColor) {
        sectionsToExpand.push('stroke');
      }
      if (
        node &&
        ((node as any).boxShadow ||
          (node as any).innerShadow ||
          (node as any).layerBlur ||
          (node as any).backgroundBlur)
      ) {
        sectionsToExpand.push('effects');
      }

      setExpandedSections(new Set(sectionsToExpand));

      // Auto-expand the panel if it was collapsed AND an object (not page) is selected
      // Note: Panel expansion is handled in the main component
    } else {
      // When nothing is selected, keep all page sections expanded
      setExpandedSections(
        new Set([
          'position',
          'layout',
          'constraints',
          'appearance',
          'fill',
          'stroke',
          'effects',
          'typography',
          'export',
          'component',
          'variables',
          'styles'
        ])
      );
    }
  }, [state.selection, state.nodes, state.rootIds]);

  const toggleSection = (section: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return [expandedSections, toggleSection, setExpandedSections];
};

