# ADR 002: Shared History Hook

**Status:** Proposed  
**Date:** 2027-01-07  
**Deciders:** Development Team

---

## Context

5+ projects implement similar history/undo-redo systems:
- `figma-clone-engine` - Past/present/future pattern
- `multi-tool-app` - Past/present/future pattern (Zustand)
- `errl_scene_builder` - Index-based array pattern
- `svg_editor` - Index-based array pattern
- `psychedelic-liquid-light-show` - Index-based array pattern

All implement nearly identical functionality with slight variations. This causes:
- Code duplication
- Bugs fixed in multiple places
- Inconsistent behavior
- Maintenance burden

---

## Decision

**Create shared `useHistory` hook in `shared/hooks/useHistory.ts` supporting both patterns**

**Approach:**
1. Support both index-based and past/present/future patterns
2. Generic TypeScript implementation
3. Optional history limits
4. Optional state transformation
5. Migrate all projects to use shared hook

---

## Consequences

### Positive

- ✅ Single implementation
- ✅ Bugs fixed in one place
- ✅ Consistent behavior
- ✅ Reduced code duplication
- ✅ Better testing (comprehensive tests in one place)

### Negative

- ⚠️ Migration effort required
- ⚠️ Need to support both patterns
- ⚠️ Testing required

### Risks

- **Medium:** Data loss if migration not careful
- **Low:** Performance impact (minimal)
- **Low:** Breaking changes (API designed to be compatible)

---

## Alternatives Considered

### Alternative 1: Keep Separate Implementations

**Pros:**
- No migration effort
- No risk

**Cons:**
- Continued duplication
- Maintenance burden
- Inconsistent behavior

**Decision:** Rejected - duplication too high

### Alternative 2: Choose One Pattern

**Pros:**
- Simpler implementation
- Single pattern

**Cons:**
- Would break existing projects
- Different projects have different needs
- Migration more difficult

**Decision:** Rejected - need to support both patterns

### Alternative 3: Create Wrapper Library

**Pros:**
- Can use npm package
- Version management

**Cons:**
- More complexity
- Overkill for monorepo
- Version management overhead

**Decision:** Rejected - shared folder in monorepo is simpler

---

## Implementation

See [MIGRATION_GUIDE_HISTORY_HOOKS.md](../migration-guides/MIGRATION_GUIDE_HISTORY_HOOKS.md) for detailed implementation plan.

**Key Design:**
- Support both patterns via `mode` option
- Generic TypeScript for type safety
- Optional configuration (limits, transformation)
- Backward compatible API

---

## References

- [Migration Guide: History Hooks](../migration-guides/MIGRATION_GUIDE_HISTORY_HOOKS.md)
- [Code Patterns](../../CODE_PATTERNS.md) - History pattern
- [Consolidation Strategy](../consolidation/CONSOLIDATION_STRATEGY.md)
