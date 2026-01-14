# SVG Editor - Consolidation Notes

**Created:** 2027-01-07  
**Project:** `svg_editor`

---

## Overview

SVG Editor is a comprehensive 25+ tool suite for SVG manipulation. It shares functionality with `multi-tool-app` (SVG Editor mode) and uses Paper.js similar to `multi-tool-app`.

---

## Consolidation Opportunities

### High Priority

1. **History Hook** ✅ **COMPLETED**
   - ~~Current: Custom history implementation~~ (migrated)
   - Migrated to: `shared/utils/historyManager.ts` (HistoryManager class)
   - Pattern: Index-based with XML serialization, maxHistory: 100
   - Migration Guide: [MIGRATION_GUIDE_HISTORY_HOOKS.md](../MIGRATION_GUIDE_HISTORY_HOOKS.md)

2. **Paper.js Utilities**
   - Current: Direct Paper.js usage throughout
   - Migrate to: `shared/utils/paper/`
   - Operations: Path manipulation, node editing
   - Migration Guide: [MIGRATION_GUIDE_PAPER_JS.md](../MIGRATION_GUIDE_PAPER_JS.md)

### Medium Priority

3. **Export Utilities**
   - Current: Export functionality in components
   - Migrate to: `shared/utils/export/`
   - Formats: SVG, PNG, JSON
   - Migration Guide: [MIGRATION_GUIDE_EXPORT_UTILITIES.md](../MIGRATION_GUIDE_EXPORT_UTILITIES.md)

### Low Priority

4. **Design System**
   - Current: Custom styling
   - Consider: Migrate to `shared/design-system/`
   - Benefit: Consistent styling across projects

---

## Relationship to Other Projects

### Overlaps With

- **`multi-tool-app`** - Has SVG Editor mode
  - Decision: `multi-tool-app` is combination project, keep both
  - Consider: Extract shared SVG utilities

- **`figma-clone-engine`** - Vector editing capabilities
  - Decision: Different focus (design tool vs. SVG editor)
  - Consider: Share vector utilities if beneficial

---

## Migration Status

- [x] History hook migrated ✅ (2027-01-07)
- [x] Keyboard shortcuts migrated ✅ (2027-01-07 - basic operations use shared hook)
- [ ] Paper.js utilities migrated
- [ ] Export utilities migrated
- [ ] Design system migrated (if applicable)

---

## Notes

- SVG Editor is a standalone, comprehensive tool
- `multi-tool-app` combines SVG editing with other features
- Both can coexist, but should share utilities
- Paper.js usage can be consolidated

---

## References

- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Migration Guides](../MIGRATION_GUIDE_*.md)
- [Consolidation Strategy](../CONSOLIDATION_STRATEGY.md)
