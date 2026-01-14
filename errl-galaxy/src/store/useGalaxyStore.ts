import { create } from 'zustand';

interface GalaxyState {
  targetNodeId: string | null;
  setTargetNodeId: (id: string | null) => void;
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  targetNodeId: null,
  setTargetNodeId: (id) => set({ targetNodeId: id }),
}));