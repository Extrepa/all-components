# Errl Scene Builder - Consolidation Notes

**Created:** 2027-01-07  
**Project:** `errl_scene_builder`

---

## Overview

Errl Scene Builder is a scene synthesis application with asset panels, layers, templates, and export. It shares functionality with `multi-tool-app` (Scene Maker mode).

---

## Consolidation Opportunities

### High Priority

1. **History Hook** ✅ **COMPLETED**
   - ~~Current: History embedded in Zustand store~~ (migrated)
   - Migrated to: `shared/utils/historyManager.ts` (HistoryManager class for Zustand stores)
   - Pattern: Past/present/future in Zustand store
   - Migration Guide: [MIGRATION_GUIDE_HISTORY_HOOKS.md](../MIGRATION_GUIDE_HISTORY_HOOKS.md)

2. **Design System** ✅ **PILOT MIGRATION COMPLETE**
   - Current: Custom CSS variables in `src/styles.css`
   - Migrated to: `shared/design-system/` (ThemeProvider integrated, CSS imported)
   - Benefit: Consistent styling, theme management
   - Migration Guide: [MIGRATION_GUIDE_DESIGN_SYSTEMS.md](../MIGRATION_GUIDE_DESIGN_SYSTEMS.md)
   - Status: ThemeProvider added, CSS imported. Full component migration can happen incrementally.

### Medium Priority

3. **Export Utilities** ✅ **COMPLETED**
   - ~~Current: Custom export implementations~~ (migrated)
   - Migrated to: `shared/utils/export/`
   - Formats: JSON, SVG, PNG (with SVG-to-PNG conversion)
   - Migration Guide: [MIGRATION_GUIDE_EXPORT_UTILITIES.md](../MIGRATION_GUIDE_EXPORT_UTILITIES.md)
   - Status: Basic exports migrated, specialized export functions use shared utilities

4. **Scene Graph Utilities**
   - Current: Scene store in [`src/scene/store.ts`](src/scene/store.ts)
   - Consider: `shared/utils/scene/`
   - Benefit: Shared scene graph patterns

---

## Relationship to Other Projects

### Overlaps With

- **`multi-tool-app`** - Has Scene Maker mode
  - Decision: `multi-tool-app` is combination project, keep both
  - Consider: Share scene graph utilities

---

## Migration Status

- [x] History hook migrated ✅ (2027-01-07)
- [x] Design system migrated ✅ (2027-01-07 - Pilot: ThemeProvider integrated)
- [x] Export utilities migrated ✅ (2027-01-07)
- [ ] Scene graph utilities migrated (if applicable)

---

## Notes

- Scene Builder is a standalone scene synthesis tool
- `multi-tool-app` combines scene building with other features
- Both can coexist, but should share utilities

---

## References

- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Migration Guides](../MIGRATION_GUIDE_*.md)
