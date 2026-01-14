import { useEffect, useRef } from 'react';
import { useScroll, useFrame } from '@react-three/drei';
import { useScrollStore } from '../store/useScrollStore';
import { ERRL_CONFIG } from '../content/errl-config';
import { MathUtils } from 'three';

export function ScrollController() {
  const scroll = useScroll();
  const setScrollToSection = useScrollStore((state) => state.setScrollToSection);
  const targetOffsetRef = useRef<number | null>(null);

  useEffect(() => {
    // Register scroll function that works with ScrollControls
    setScrollToSection((sectionId: string) => {
      // Find section index
      const sectionIndex = ERRL_CONFIG.sections.findIndex(
        (s) => s.id === sectionId
      );

      if (sectionIndex === -1) {
        // If not found, scroll to top (hero)
        targetOffsetRef.current = 0;
        return;
      }

      // Calculate scroll offset (0-1) based on section index
      // Hero is page 0, sections start at page 1
      const totalPages = ERRL_CONFIG.sections.length + 1; // +1 for hero
      const targetPage = sectionIndex + 1; // +1 because hero is page 0
      const targetOffset = targetPage / totalPages;

      // Set target for smooth scrolling
      targetOffsetRef.current = targetOffset;
    });
  }, [scroll, setScrollToSection]);

  // Smooth scroll animation
  useFrame(() => {
    if (targetOffsetRef.current !== null && scroll.el) {
      const current = scroll.offset;
      const target = targetOffsetRef.current;
      const diff = Math.abs(current - target);
      
      if (diff < 0.001) {
        // Close enough, snap to target
        const scrollElement = scroll.el as HTMLElement;
        scrollElement.scrollTop = target * scrollElement.scrollHeight;
        targetOffsetRef.current = null;
      } else {
        // Smooth lerp towards target
        const newOffset = MathUtils.lerp(current, target, 0.1);
        const scrollElement = scroll.el as HTMLElement;
        scrollElement.scrollTop = newOffset * scrollElement.scrollHeight;
      }
    }
  });

  return null; // This is a controller component, no render
}

