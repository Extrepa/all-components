import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { ERRL_CONFIG } from '../content/errl-config';

interface BubblePositionSyncProps {
  onPositionsUpdate: (positions: Map<string, [number, number, number]>) => void;
}

export function BubblePositionSync({ onPositionsUpdate }: BubblePositionSyncProps) {
  const { size, viewport } = useThree();
  const updateIntervalRef = useRef<number>();

  useEffect(() => {
    const updatePositions = () => {
      const positions = new Map<string, [number, number, number]>();

      ERRL_CONFIG.navigationBubbles.forEach((bubble) => {
        // Find the actual DOM button element
        const buttonElement = document.querySelector(
          `button[data-bubble-id="${bubble.id}"]`
        ) as HTMLElement;

        if (buttonElement) {
          const rect = buttonElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Convert pixel coordinates to world coordinates
          const px = (centerX / size.width) * viewport.width - viewport.width / 2;
          const py = -(centerY / size.height) * viewport.height + viewport.height / 2;

          positions.set(bubble.id, [px, py, 0.1]);
        }
      });

      if (positions.size > 0) {
        onPositionsUpdate(positions);
      }
    };

    // Initial update
    updatePositions();

    // Update on window resize
    const handleResize = () => {
      setTimeout(updatePositions, 100); // Small delay to let DOM settle
    };
    window.addEventListener('resize', handleResize);

    // Periodic updates (in case DOM changes)
    updateIntervalRef.current = window.setInterval(updatePositions, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [size, viewport, onPositionsUpdate]);

  return null;
}

