# ADR 004: Three.js Utilities Evaluation

**Status:** Approved  
**Date:** 2027-01-07  
**Deciders:** Development Team

---

## Context

Multiple projects use Three.js for 3D graphics:
- `errl-fluid` - React Three Fiber for fluid simulation
- `ErrlFXLab` - Three.js for 3D wireframe visualization
- `psychedelic-liquid-light-show` - Three.js for 3D dropper component
- `universal-component-extractor` - Three.js examples in preview system

Each project uses Three.js in different ways with different patterns.

---

## Decision

**Do not create shared Three.js utilities**

**Reasoning:**
1. Each project uses Three.js for different purposes
2. Usage patterns are highly project-specific
3. No common patterns that would benefit from sharing
4. Three.js is a large library - utilities would add complexity without clear benefit
5. Projects already have working implementations

**Action:**
- Keep Three.js usage project-specific
- Document usage patterns in project-specific docs
- No shared utilities needed

---

## Consequences

### Positive

- ✅ No unnecessary abstraction
- ✅ Projects maintain flexibility
- ✅ No added complexity
- ✅ Clear ownership

### Negative

- ⚠️ No shared patterns (but patterns are too different anyway)

### Risks

- **Low:** Future need for shared utilities (can be addressed then)

---

## Alternatives Considered

### Alternative 1: Create Shared Utilities

**Pros:**
- Potential code reuse
- Consistent patterns

**Cons:**
- Patterns too different across projects
- Would add complexity
- Low benefit

**Decision:** Rejected - patterns too different, low benefit

---

## Implementation

1. Document decision
2. Update consolidation notes
3. Keep Three.js usage project-specific

---

## References

- [Consolidation Strategy](../consolidation/CONSOLIDATION_STRATEGY.md)
- [Project Similarity Analysis](../analysis/PROJECT_SIMILARITY_ANALYSIS.md)
