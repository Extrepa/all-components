import { ErrlScene } from "../scene/types";

export type SharedScene = {
  shareId: string;
  scene: ErrlScene;
  createdAt: string;
};

const STORAGE_KEY = "errl_shared_scenes";

const readStore = (): Record<string, SharedScene> => {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SharedScene>;
  } catch {
    return {};
  }
};

const writeStore = (data: Record<string, SharedScene>) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveSharedScene = (scene: ErrlScene): SharedScene => {
  const shareId = "errl-" + Math.random().toString(36).slice(2, 6);
  const shared: SharedScene = {
    shareId,
    scene,
    createdAt: new Date().toISOString(),
  };
  const store = readStore();
  store[shareId] = shared;
  writeStore(store);
  return shared;
};

export const loadSharedScene = async (shareId: string): Promise<SharedScene | null> => {
  const store = readStore();
  return store[shareId] || null;
};
