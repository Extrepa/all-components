# Figma Clone Engine - Consolidation Notes

**Created:** 2027-01-07  
**Project:** `figma-clone-engine`

---

## Overview

Figma Clone Engine is a high-performance design tool with vector editing, component architecture, and export capabilities. It shares patterns with multiple projects.

---

## Consolidation Opportunities

### High Priority

1. **History Hook** ✅ **COMPLETED**
   - ~~Current: [`src/hooks/useDesignHistory.ts`](src/hooks/useDesignHistory.ts)~~ (removed)
   - Migrated to: `shared/hooks/useHistory.ts`
   - Pattern: Past/present/future with migration and layout calculation via `transform` option
   - Migration Guide: [MIGRATION_GUIDE_HISTORY_HOOKS.md](../MIGRATION_GUIDE_HISTORY_HOOKS.md)

2. **Export Utilities**
   - Current: [`src/utils/fileOperations.ts`](src/utils/fileOperations.ts)
   - Migrate to: `shared/utils/export/`
   - Formats: PNG, SVG, JPG with multiple scales
   - Migration Guide: [MIGRATION_GUIDE_EXPORT_UTILITIES.md](../MIGRATION_GUIDE_EXPORT_UTILITIES.md)

### Medium Priority

3. **Scene Graph Utilities**
   - Current: Normalized state in [`src/App.tsx`](src/App.tsx)
   - Consider: `shared/utils/scene/`
   - Benefit: Shared scene graph patterns

4. **Interaction Utilities**
   - Current: Drag/drop, selection, transform in [`src/App.tsx`](src/App.tsx)
   - Consider: `shared/utils/interaction/`
   - Benefit: Shared interaction patterns

---

## Relationship to Other Projects

### Overlaps With

- **`svg_editor`** - Vector editing capabilities
  - Decision: Different focus (design tool vs. SVG editor)
  - Consider: Share vector utilities if beneficial

- **`multi-tool-app`** - Scene building, export
  - Decision: Different focus
  - Consider: Share utilities

---

## Migration Status

- [x] History hook migrated ✅ (2027-01-07)
- [x] Export utilities migrated ✅ (2027-01-07 - JSON export)
- [ ] Scene graph utilities migrated (if applicable)
- [ ] Interaction utilities migrated (if applicable)

---

## Notes

- Figma Clone Engine is a comprehensive design tool
- Has extensive keyboard shortcuts system
- Uses normalized state pattern (good for sharing)
- Export with multiple scales (unique feature)

---

## References

- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Migration Guides](../MIGRATION_GUIDE_*.md)
