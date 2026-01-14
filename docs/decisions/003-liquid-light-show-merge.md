# ADR 003: Liquid Light Show Consolidation

**Status:** Approved  
**Date:** 2027-01-07  
**Deciders:** Development Team

---

## Context

Two liquid light show projects exist:
1. `liquid-light-show-simulator` - Simple Canvas2D blob simulation (~500 lines)
2. `psychedelic-liquid-light-show` - Advanced two-phase fluid simulation with PIXI.js/WebGL (~5000+ lines)

The advanced version has all features of the simple version plus:
- Realistic physics (buoyancy, surface tension, refraction)
- AI-powered color palette generation
- Post-processing effects
- Video export
- Gallery system
- Session persistence
- 13 built-in presets
- Advanced brush system

---

## Decision

**Archive `liquid-light-show-simulator` and keep `psychedelic-liquid-light-show` as the primary implementation**

**Reasoning:**
1. Advanced version has all features of simple version
2. Advanced version is actively maintained and more feature-rich
3. Simple version serves as learning/reference only
4. No unique features in simple version that need preservation
5. Maintaining both creates confusion about which to use

**Action:**
- Archive `liquid-light-show-simulator` project
- Document as superseded by advanced version
- Update all references to point to `psychedelic-liquid-light-show`
- Keep simple version in archive for reference/learning

---

## Consequences

### Positive

- ✅ Single implementation to maintain
- ✅ Clear which project to use
- ✅ Reduced confusion
- ✅ Focus development on advanced version

### Negative

- ⚠️ Lose simple reference implementation
- ⚠️ May need to reference archived code for learning

### Risks

- **Low:** Need for simple version arises (mitigated by keeping archive)

---

## Alternatives Considered

### Alternative 1: Merge Features

**Pros:**
- Single codebase
- All features in one place

**Cons:**
- Simple version has no unique features
- Would add complexity without benefit
- Advanced version already supersedes

**Decision:** Rejected - no unique features to merge

### Alternative 2: Keep Both Active

**Pros:**
- Simple version available for learning
- Lightweight option available

**Cons:**
- Maintenance burden
- Confusion about which to use
- Duplication

**Decision:** Rejected - advanced version is clearly superior

---

## Implementation

1. Create archive documentation
2. Update project references
3. Mark `liquid-light-show-simulator` as archived
4. Update consolidation notes

---

## References

- [Migration Guide: Liquid Light Shows](../migration-guides/MIGRATION_GUIDE_LIQUID_LIGHT_SHOWS.md)
- [Project Similarity Analysis](../analysis/PROJECT_SIMILARITY_ANALYSIS.md)
