# ErrlFXLab - Consolidation Notes

**Created:** 2027-01-07  
**Project:** `ErrlFXLab`

---

## Overview

ErrlFXLab is a creative coding and visual effects experimentation tool. It has been refactored into 23 JavaScript modules and shares functionality with `errl_vibecheck` and `multi-tool-app` (FX Lab mode).

---

## Consolidation Opportunities

### Low Priority

1. **Keyboard Shortcuts**
   - Current: [`js/keyboard.js`](js/keyboard.js), [`js/command-palette.js`](js/command-palette.js)
   - Consider: `shared/hooks/useKeyboardShortcuts.ts`
   - Benefit: Shared keyboard shortcut system
   - Note: Vanilla JS project, may need adapter

2. **Export Utilities**
   - Current: Export functionality in [`js/export.js`](js/export.js)
   - Consider: `shared/utils/export/`
   - Benefit: Shared export patterns
   - Note: Vanilla JS project, may need adapter

---

## Relationship to Other Projects

### Overlaps With

- **`errl_vibecheck`** - Visual effects/FX
  - Decision: Different approaches (manual vs. AI), keep both
  - Consider: Share FX utilities if beneficial

- **`multi-tool-app`** - Has FX Lab mode
  - Decision: `multi-tool-app` is combination project, keep both
  - Consider: Share FX/vibe utilities

---

## Migration Status

- [ ] Keyboard shortcuts (if applicable, may need adapter)
- [ ] Export utilities (if applicable, may need adapter)

---

## Notes

- ErrlFXLab is vanilla JavaScript (no React)
- Modular refactoring complete (23 modules)
- Command palette system (Ctrl+K)
- Different from VibeCheck (manual vs. AI)

---

## References

- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Migration Guides](../MIGRATION_GUIDE_*.md)
