# Errl Scene Synth — Component Tree (v1)

High-level React structure and contracts. Keep components modular and dumb where possible.

```
<ErrlApp>
  <AppShell>
    <TopBar />
    <Workspace>
      <AssetPanel />            // left
      <StageColumn>             // center
        <StageToolbar />        // viewport tools
        <GuidedSetup />         // optional wizard strip
        <SceneViewport />       // renderer + overlays
      </StageColumn>
      <RightRail>               // right
        <Tabs: Layers | Inspector | FX/Weather />
        <LayerPanel />
        <InspectorPanel />
        <FxWeatherPanel />
      </RightRail>
    </Workspace>
    <BottomBar>
      <PlaybackControls />
      <StatusChip />
    </BottomBar>
  </AppShell>
</ErrlApp>
```

## Responsibilities & Data Flow
- `useSceneStore` is the single source of truth for scene, selection, playbackTimeMs.
- `useSceneRenderer` mounts the renderer and exposes a ref; SceneViewport uses it.
- `AssetPanel` spawns entities via store; no renderer knowledge.
- `SceneViewport` handles selection, drag/transform overlays, and calls renderer.render(scene) + setPlaybackTime.
- `LayerPanel` edits layers and selection; no renderer logic.
- `InspectorPanel` edits the selected entity (transform/style/motion).
- `FxWeatherPanel` toggles global FX/weather instances.
- `TopBar` handles scene meta, templates, import/export/share; no entity transforms.
- `PlaybackControls` owns play/pause/stop and feeds playbackTimeMs to the store.

## Future Slots
- `BottomBar` can host a mini timeline.
- `RightRail` can add tabs for Presets, Assist, or Live Mode.
- `SceneViewport` can swap renderer (SVG → WebGL) via `useSceneRenderer({ factory })`.
