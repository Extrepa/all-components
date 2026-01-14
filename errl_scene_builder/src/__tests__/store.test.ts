import { describe, expect, it, beforeEach } from "vitest";
import { useSceneStore } from "../scene/store";
import { createBaseScene } from "../scene/types";

describe("scene store", () => {
  beforeEach(() => {
    useSceneStore.setState({
      scene: createBaseScene(),
      selectedEntityIds: [],
      selectedLayerId: undefined,
      playbackTimeMs: 0,
    });
  });

  it("adds an entity and can select it", () => {
    const { addEntity, setSelectedEntities, selectedEntityIds } = useSceneStore.getState();
    const id = "entity_test";
    addEntity({
      id,
      assetId: "ERRL_CHAR_HEAD_OG",
      layerId: "layer_main",
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1, rotation: 0 },
      style: { opacity: 1, blendMode: "normal" },
      motion: [],
    });
    setSelectedEntities([id]);
    expect(useSceneStore.getState().scene.entities.some((e) => e.id === id)).toBe(true);
    expect(selectedEntityIds).toBeDefined();
    expect(useSceneStore.getState().selectedEntityIds).toEqual([id]);
  });

  it("updates playback time", () => {
    useSceneStore.getState().setPlaybackTime(500);
    expect(useSceneStore.getState().playbackTimeMs).toBe(500);
  });

  it("reorders layers and rewrites zIndex", () => {
    const state = useSceneStore.getState();
    const ids = state.scene.layers.map((l) => l.id).reverse();
    state.reorderLayers(ids);
    const reordered = useSceneStore.getState().scene.layers;
    expect(reordered[0].zIndex).toBe(0);
    expect(reordered[0].id).toBe(ids[0]);
  });
});
