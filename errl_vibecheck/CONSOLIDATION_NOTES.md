# Errl VibeCheck - Consolidation Notes

**Created:** 2027-01-07  
**Project:** `errl_vibecheck`

---

## Overview

Errl VibeCheck is an AI-powered visual coding playground that generates code in multiple formats (P5.js, SVG, HTML, GLSL, Three.js). It shares functionality with `ErrlFXLab` and `multi-tool-app` (FX Lab mode).

---

## Consolidation Opportunities

### Medium Priority

1. **AI Service Utilities** (Future)
   - Current: Direct Google Gemini API usage
   - Consider: `shared/utils/ai/` (if consensus reached)
   - Benefit: Shared AI service wrapper

2. **Design System**
   - Current: TailwindCSS styling
   - Consider: Migrate to `shared/design-system/`
   - Benefit: Consistent styling

### Low Priority

3. **Export Utilities**
   - Current: Export functionality
   - Consider: `shared/utils/export/`
   - Benefit: Shared export patterns

---

## Relationship to Other Projects

### Overlaps With

- **`ErrlFXLab`** - Visual effects/FX
  - Decision: Different approaches, keep both
  - Consider: Share FX utilities if beneficial

- **`multi-tool-app`** - Has FX Lab mode
  - Decision: `multi-tool-app` is combination project, keep both
  - Consider: Share FX/vibe utilities

- **`errl-forge---asset-remixer`** - Both use AI generation
  - Consider: Shared AI service utilities

---

## Migration Status

- [ ] Design system migrated (if applicable)
- [ ] Export utilities migrated (if applicable)
- [ ] AI service utilities (future consideration)

---

## Notes

- VibeCheck focuses on AI-powered code generation
- Uses Google Gemini API
- Multiple output formats (unique)
- Different from ErrlFXLab (which is more manual)

---

## References

- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Migration Guides](../MIGRATION_GUIDE_*.md)
