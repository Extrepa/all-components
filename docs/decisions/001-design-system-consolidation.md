# ADR 001: Design System Consolidation

**Status:** Proposed  
**Date:** 2027-01-07  
**Deciders:** Development Team

---

## Context

Two design systems exist in the workspace:
1. `shared/design-system/` - Vanilla JS/CSS design system (extracted from errl-club)
2. `all-components/errl-design-system/` - React-focused design system with hooks

Both have similar cyberpunk/neon aesthetics but different implementations. This causes:
- Inconsistency across projects
- Maintenance burden (fix bugs in two places)
- Confusion about which to use
- Duplication of design tokens

---

## Decision

**Consolidate into unified React-focused design system in `shared/design-system/`**

**Approach:**
1. Merge both design systems
2. Choose React-focused as primary (most projects use React)
3. Maintain backward compatibility during migration
4. Archive old design systems after migration

---

## Consequences

### Positive

- ✅ Single source of truth
- ✅ Consistent styling across projects
- ✅ Reduced maintenance burden
- ✅ Clear usage guidelines
- ✅ Better documentation

### Negative

- ⚠️ Migration effort required
- ⚠️ Potential breaking changes
- ⚠️ Need backward compatibility layer
- ⚠️ Testing required

### Risks

- **High:** Visual regressions if migration not careful
- **Medium:** Breaking changes if backward compatibility not maintained
- **Low:** Performance impact (minimal)

---

## Alternatives Considered

### Alternative 1: Keep Both Separate

**Pros:**
- No migration effort
- No risk of breaking changes

**Cons:**
- Continued duplication
- Maintenance burden
- Confusion about which to use

**Decision:** Rejected - duplication and maintenance burden too high

### Alternative 2: Keep Vanilla JS as Primary

**Pros:**
- Works without React
- Simpler for non-React projects

**Cons:**
- Most projects use React
- Less feature-rich
- Would need React wrapper

**Decision:** Rejected - most projects use React, React-focused is more feature-rich

### Alternative 3: Create New Unified System

**Pros:**
- Clean slate
- No legacy baggage

**Cons:**
- More work
- Lose existing work
- Higher risk

**Decision:** Rejected - better to merge existing systems

---

## Implementation

See [MIGRATION_GUIDE_DESIGN_SYSTEMS.md](../migration-guides/MIGRATION_GUIDE_DESIGN_SYSTEMS.md) for detailed implementation plan.

---

## References

- [Migration Guide: Design Systems](../migration-guides/MIGRATION_GUIDE_DESIGN_SYSTEMS.md)
- [Project Similarity Analysis](../analysis/PROJECT_SIMILARITY_ANALYSIS.md)
- [Consolidation Strategy](../consolidation/CONSOLIDATION_STRATEGY.md)
