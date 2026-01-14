import { useState, useRef } from 'react';

export const usePanelResize = (initialWidth: number = 208) => {
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleResize = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = startX - moveEvent.clientX; // Inverted for right panel
      const newWidth = Math.max(208, Math.min(600, startWidth + deltaX));
      setPanelWidth(newWidth);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return { panelWidth, setPanelWidth, panelRef, handleResize };
};

