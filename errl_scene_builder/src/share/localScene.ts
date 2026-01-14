import { ErrlScene } from "../scene/types";

const STORAGE_KEY = "errl-scene-data";

export const saveSceneToLocal = (scene: ErrlScene) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
  } catch (e) {
    console.warn("Failed to save scene", e);
  }
};

export const loadSceneFromLocal = (): ErrlScene | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ErrlScene;
  } catch (e) {
    console.warn("Failed to load scene", e);
    return null;
  }
};

export const clearSceneLocal = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear scene", e);
  }
};
