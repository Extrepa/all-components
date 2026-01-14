import { create } from 'zustand';

interface ScrollStoreState {
  scrollToSection: (sectionId: string) => void;
  setScrollToSection: (fn: (sectionId: string) => void) => void;
}

export const useScrollStore = create<ScrollStoreState>((set) => ({
  scrollToSection: () => {
    console.warn('scrollToSection not initialized');
  },
  setScrollToSection: (fn) => set({ scrollToSection: fn }),
}));

