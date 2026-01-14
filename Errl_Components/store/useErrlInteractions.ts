import { create } from 'zustand';

export interface PopEvent {
  id: string;
  x: number;
  y: number;
  time: number;
}

interface ErrlInteractionsState {
  hoveredBubbleId: string | null;
  lastPopEvent: PopEvent | null;
  setHoveredBubble: (id: string | null) => void;
  triggerPop: (id: string, x: number, y: number) => void;
}

export const useErrlInteractions = create<ErrlInteractionsState>((set) => ({
  hoveredBubbleId: null,
  lastPopEvent: null,
  setHoveredBubble: (id) => set({ hoveredBubbleId: id }),
  triggerPop: (id, x, y) =>
    set({
      lastPopEvent: {
        id,
        x,
        y,
        time: performance.now(),
      },
    }),
}));

