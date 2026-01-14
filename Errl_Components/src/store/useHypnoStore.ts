import { create } from 'zustand';

interface HypnoState {
  isHovered: boolean;
  setHovered: (hovered: boolean) => void;
}

export const useHypnoStore = create<HypnoState>((set) => ({
  isHovered: false,
  setHovered: (hovered) => set({ isHovered: hovered }),
}));
