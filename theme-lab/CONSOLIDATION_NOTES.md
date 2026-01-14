# Theme-Lab - Consolidation Notes

**Created:** 2026-01-09  
**Project:** theme-lab

---

## Overview

Theme-lab is a design system playground tool for testing, previewing, and exporting themes. It contains 25 pre-built themes with CSS custom properties that could be integrated into the unified design system.

## Consolidation Opportunities

### High Priority

1. **Integrate 25 Themes into Unified Design System** ⚠️ HIGH PRIORITY
   - Current: 25 themes in `shared/theme.css`
   - Theme naming: "errl-core", "errl-deepsea", etc. (matches design system)
   - Architecture: CSS custom properties (compatible with design system)
   - Target: `shared/design-system/src/tokens.ts` or new themes file
   - Complexity: Medium (extract and integrate)
   - Status: ⏳ Planned (part of design system consolidation)

**Action Items:**
1. Extract 25 theme definitions from `shared/theme.css`
2. Analyze theme structure and token naming
3. Integrate into unified design system
4. Ensure compatibility with existing design system structure
5. Update theme-lab to optionally reference shared themes (or keep local copy for offline testing)
6. Document theme integration process

### Medium Priority

2. **Design System Integration**
   - Current: theme-lab is a standalone tool for testing themes
   - Relationship: Part of design system consolidation effort
   - Opportunity: Integrate themes into unified design system
   - Benefit: 25 themes available to all projects
   - Complexity: Medium
   - Status: ⏳ Planned

## Relationship to Design System Consolidation

**Current Design System Consolidation:**
- `shared/design-system/` + `all-components/errl-design-system/` → Unified design system
- Status: In progress

**Theme-Lab Themes:**
- 25 pre-built themes using CSS custom properties
- "errl-*" naming convention (matches design system)
- Complete design token system (colors, gradients, layout, shape, timing)
- Compatible with design system architecture

**Integration Strategy:**
1. Keep theme-lab as separate testing tool (its purpose is testing/preview)
2. Extract 25 themes from theme-lab
3. Integrate themes into unified design system
4. theme-lab can continue to use themes for testing (shared or local copy)
5. Other projects can use themes from unified design system

## Consolidation Status

- [x] Project analyzed for consolidation opportunities
- [x] Themes identified for integration
- [x] Relationship to design system consolidation documented
- [ ] Themes extracted from theme-lab (planned)
- [ ] Themes integrated into unified design system (planned)
- [ ] Theme-lab updated to reference shared themes (planned)
- [ ] Documentation updated (planned)

## Recommendations

1. **Keep theme-lab as separate tool** - Its purpose is testing/previewing themes
2. **Integrate 25 themes** - Extract and add to unified design system (high priority)
3. **Bidirectional benefit** - theme-lab tests themes, other projects use them
4. **Part of design system consolidation** - Should happen as part of design system consolidation effort

## Notes

- theme-lab is a TOOL for testing themes, not a design system itself
- 25 themes should be integrated into unified design system
- theme-lab can continue to use themes for testing (shared or local copy)
- Integration should happen as part of design system consolidation

---

## References

- [NEW_PROJECTS_CONSOLIDATION_ANALYSIS.md](../NEW_PROJECTS_CONSOLIDATION_ANALYSIS.md)
- [Design System Consolidation](../docs/migration-guides/MIGRATION_GUIDE_DESIGN_SYSTEMS.md)
- [PROJECT_RELATIONSHIPS.md](../PROJECT_RELATIONSHIPS.md)
