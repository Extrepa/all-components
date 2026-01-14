# Initialization Flow

**Last Updated**: December 10, 2025  
**Architecture**: Hybrid approach (GameInitializer + main.js)

## GameInitializer Phases

```mermaid
flowchart TD
  P0[Phase 0: StateManager + EventBus<br/>Phase B Systems] --> P1[Phase 1: Scene renderer, camera]
  P1 --> P2[Phase 2: Input + Keybinds]
  P2 --> P3[Phase 3: Scene Builders]
  P3 --> P4[Phase 4: PostProcessingManager async init]
  P4 --> P5[Phase 5: Avatar]
  P5 --> P6[Phase 6: Core Systems]
  P6 --> P7[Phase 7: Interactive Environment]
  P7 --> P8[Phase 8: Effects]
  P8 --> P9[Phase 9: Audio]
  P9 --> P10[Phase 10: UI]
  P10 --> P10_5[Phase 10.5: Settings + CollectionTracker]
  P10_5 --> P11[Phase 11-14: Resize, controls, keybinds, mouse]
  P11 --> P15[Phase 15: PostFX ready + SSAO + GameLoop]
  P15 --> P16[Phase 16: Interactive registration]
  P16 --> P17[Phase 17: Audio init on user interaction]
  P17 --> P18[Phase 18: DevTools/Debug/TestMode]
  P18 --> Return[Return systems object]
```

## main.js Custom Initialization

After GameInitializer completes:

```mermaid
flowchart TD
  Systems[Extract systems from GameInitializer] --> Custom[Add custom enhancements]
  Custom --> Audio[Setup audio on user click]
  Audio --> GL[Initialize GameLoop]
  GL --> UM[Initialize UpdateManager]
  UM --> Start[Start GameLoop]
```

## Update Loop Architecture

```mermaid
flowchart LR
  GL[GameLoop] -->|calls| UM[UpdateManager]
  UM -->|uses| SU[SystemsUpdater]
  SU -->|updates| Systems[All Systems]
  Systems -->|renders via| PPM[PostProcessingManager]
  PPM -->|renders| Renderer[WebGL Renderer]
```

## Notes

- **Phase 0**: Foundation systems (StateManager, EventBus) - Phase B systems
- **Phases 1-15**: Standard initialization via GameInitializer
- **main.js**: Custom enhancements and user-interaction-dependent setup
- **GameLoop**: Manages animation loop (started after post-processing ready)
- **UpdateManager**: Coordinates system updates via SystemsUpdater
- **SystemsUpdater**: Consolidates all system update calls
- Post-processing setup runs async; game loop waits for it before starting
- SettingsManager loads camera settings; CollectionTracker wires into CollectibleManager and AudioSystem
- Dev tools are last to avoid impacting core setup; they attach to `window` for testing

## Related Documentation

- `docs/refactoring/HYBRID_APPROACH.md` - Hybrid approach details
- `docs/DEVELOPER_QUICKSTART.md` - Developer guide
- `docs/refactoring/REFACTORING_PLAN.md` - Refactoring plan
