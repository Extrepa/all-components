import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  ErrlScene,
  SceneEntity,
  SceneLayer,
  FxInstance,
  SceneWeatherConfig,
  createBaseScene,
} from "./types";
import { HistoryManager } from "@/shared/utils/historyManager";

/**
 * Scene Store
 *
 * Central state container for the Errl Scene Builder.
 *
 * Responsibilities:
 * - Hold the current ErrlScene model (layers, entities, background, FX, weather).
 * - Track selection (selected entity IDs and the active layer).
 * - Track playback time for animation (playbackTimeMs).
 * - Expose mutation helpers for scene meta, layers, entities, FX, weather, selection.
 *
 * Design:
 * - ErrlScene is the source of truth for the canvas; renderer/UI never mutate directly.
 * - Animation is time-based only; `playbackTimeMs` drives motion, entities are immutable
 *   unless explicitly edited by user actions.
 */

/**
 * Public API for scene state. Keep this stable so renderer/UI can depend on it.
 */
export type SceneStore = {
  scene: ErrlScene;

  // Animation
  playbackTimeMs: number;
  setPlaybackTime: (ms: number) => void;

  // Selection
  selectedEntityIds: string[];
  selectedLayerId?: string;
  setSelectedEntities: (ids: string[]) => void;
  setSelectedLayer: (id?: string) => void;

  // Scene mutations
  setScene: (scene: ErrlScene) => void;
  updateSceneMeta: (partial: Partial<ErrlScene>) => void;

  // Entities
  addEntity: (entity: SceneEntity) => void;
  updateEntity: (id: string, patch: Partial<SceneEntity>) => void;
  removeEntity: (id: string) => void;
  reorderEntityInLayer: (entityId: string, direction: 'up' | 'down') => void;

  // Layers
  addLayer: (layer: SceneLayer) => void;
  updateLayer: (id: string, patch: Partial<SceneLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (orderedIds: string[]) => void;

  // FX / Weather
  addFx: (fx: FxInstance) => void;
  updateFx: (id: string, patch: Partial<FxInstance>) => void;
  removeFx: (id: string) => void;

  addWeather: (config: SceneWeatherConfig) => void;
  updateWeather: (id: string, patch: Partial<SceneWeatherConfig>) => void;
  removeWeather: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const initialScene = createBaseScene({
  entities: [
    {
      id: "entity_errl_main",
      assetId: "ERRL_CHAR_HEAD_OG",
      layerId: "layer_main",
      transform: { x: 960, y: 540, scaleX: 1, scaleY: 1, rotation: 0 },
      style: { opacity: 1, blendMode: "normal" },
      motion: [
        {
          id: "motion_float_1",
          motionId: "MOTION_FLOAT",
          enabled: true,
          params: { speed: 0.4, intensity: 0.6 },
        },
      ],
    },
  ],
});

// Create history manager instance
let historyManager = new HistoryManager<ErrlScene>(initialScene, {
  mode: 'past-present-future',
});

export const useSceneStore = create<SceneStore>()(
  devtools((set, get) => ({
    scene: initialScene,
    selectedEntityIds: [],
    selectedLayerId: undefined,
    playbackTimeMs: 0,
    canUndo: false,
    canRedo: false,

    setScene: (scene) => {
      historyManager = new HistoryManager<ErrlScene>(scene, {
        mode: 'past-present-future',
      });
      set(() => ({
        scene,
        canUndo: false,
        canRedo: false,
      }));
    },

    updateSceneMeta: (partial) =>
      set((state) => {
        const updatedScene = { ...state.scene, ...partial, updatedAt: new Date().toISOString() };
        historyManager.pushState(updatedScene);
        return {
          scene: updatedScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    setPlaybackTime: (ms) => set({ playbackTimeMs: ms }),

    addEntity: (entity) =>
      set((state) => {
        const nextScene = { ...state.scene, entities: [...state.scene.entities, entity] };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    updateEntity: (id, patch) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          entities: state.scene.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    removeEntity: (id) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          entities: state.scene.entities.filter((e) => e.id !== id),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          selectedEntityIds: state.selectedEntityIds.filter((eid) => eid !== id),
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    reorderEntityInLayer: (entityId, direction) =>
      set((state) => {
        const entity = state.scene.entities.find((e) => e.id === entityId);
        if (!entity) return state;

        // Get all entities in the same layer, sorted by current array order
        const sameLayerEntities = state.scene.entities.filter(
          (e) => e.layerId === entity.layerId
        );
        const currentIndex = sameLayerEntities.findIndex((e) => e.id === entityId);
        if (currentIndex === -1) return state;

        // Calculate new index
        const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= sameLayerEntities.length) return state;

        // Create new entities array with swapped positions
        const allEntities = [...state.scene.entities];
        const entityIndex = allEntities.findIndex((e) => e.id === entityId);
        const targetEntity = sameLayerEntities[newIndex];
        const targetIndex = allEntities.findIndex((e) => e.id === targetEntity.id);

        // Swap entities
        [allEntities[entityIndex], allEntities[targetIndex]] = [
          allEntities[targetIndex],
          allEntities[entityIndex],
        ];

        const nextScene = { ...state.scene, entities: allEntities };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    addLayer: (layer) =>
      set((state) => {
        const nextScene = { ...state.scene, layers: [...state.scene.layers, layer] };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    updateLayer: (id, patch) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          layers: state.scene.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    removeLayer: (id) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          layers: state.scene.layers.filter((l) => l.id !== id),
          entities: state.scene.entities.filter((e) => e.layerId !== id),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          selectedLayerId: state.selectedLayerId === id ? undefined : state.selectedLayerId,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    reorderLayers: (orderedIds) =>
      set((state) => {
        const idToLayer = new Map(state.scene.layers.map((l) => [l.id, l]));
        const layers = orderedIds
          .map((id, idx) => {
            const layer = idToLayer.get(id);
            return layer ? { ...layer, zIndex: idx } : undefined;
          })
          .filter(Boolean) as SceneLayer[];
        const nextScene = { ...state.scene, layers };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    setSelectedEntities: (ids) => set({ selectedEntityIds: ids }),
    setSelectedLayer: (id) => set({ selectedLayerId: id }),

    addFx: (fx) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          fx: { ...state.scene.fx, globalFx: [...state.scene.fx.globalFx, fx] },
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    updateFx: (id, patch) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          fx: {
            ...state.scene.fx,
            globalFx: state.scene.fx.globalFx.map((f) => (f.id === id ? { ...f, ...patch } : f)),
          },
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    removeFx: (id) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          fx: { ...state.scene.fx, globalFx: state.scene.fx.globalFx.filter((f) => f.id !== id) },
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    addWeather: (config) =>
      set((state) => {
        const nextScene = { ...state.scene, weather: [...state.scene.weather, config] };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    updateWeather: (id, patch) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          weather: state.scene.weather.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    removeWeather: (id) =>
      set((state) => {
        const nextScene = {
          ...state.scene,
          weather: state.scene.weather.filter((w) => w.id !== id),
        };
        historyManager.pushState(nextScene);
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    undo: () =>
      set((state) => {
        const prevScene = historyManager.undo();
        if (prevScene === null) return state;
        return {
          scene: prevScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),

    redo: () =>
      set((state) => {
        const nextScene = historyManager.redo();
        if (nextScene === null) return state;
        return {
          scene: nextScene,
          canUndo: historyManager.getCanUndo(),
          canRedo: historyManager.getCanRedo(),
        };
      }),
  }))
);
