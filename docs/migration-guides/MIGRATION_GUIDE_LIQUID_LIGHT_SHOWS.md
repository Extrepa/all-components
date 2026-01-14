# Migration Guide: Liquid Light Shows Consolidation

**Created:** 2027-01-07  
**Priority:** High  
**Complexity:** Low  
**Estimated Time:** 1 week

---

## Overview

This guide covers consolidating two liquid light show projects into one. The advanced version (`psychedelic-liquid-light-show`) is significantly more feature-rich than the simple version (`liquid-light-show-simulator`).

**Current State:**
- `liquid-light-show-simulator` - Simple Canvas2D blob simulation
- `psychedelic-liquid-light-show` - Advanced two-phase fluid simulation with PIXI.js/WebGL

**Target State:**
- Archive `liquid-light-show-simulator` (or merge unique features)
- Keep `psychedelic-liquid-light-show` as the primary implementation

---

## Current State Analysis

### `liquid-light-show-simulator`

**Location:** [`liquid-light-show-simulator/`](liquid-light-show-simulator/)

**Technology:**
- TypeScript + Vite
- Canvas2D rendering
- Simple blob simulation

**Features:**
- Multiple soft blobs that drift
- Additive blending and gradients
- Pointer interaction (push blobs)
- Basic wobble and hue shifting

**Code Structure:**
- `src/simulation/blobs.ts` - Blob simulation logic
- `src/main.ts` - Application entry point
- Simple, focused implementation

**Size:** Small (~500 lines)

---

### `psychedelic-liquid-light-show`

**Location:** [`psychedelic-liquid-light-show/`](psychedelic-liquid-light-show/)

**Technology:**
- React 19 + TypeScript + Vite
- PIXI.js v8 + WebGL shaders
- Canvas2D fallback
- Google Gemini AI

**Features:**
- Two-phase fluid simulation (oil/water)
- Realistic physics (buoyancy, surface tension, refraction)
- AI-powered color palette generation
- Post-processing effects (chromatic aberration, grain)
- Video export (WebM)
- Gallery system
- Session persistence
- 13 built-in presets
- Advanced brush system

**Code Structure:**
- Comprehensive React component structure
- Shader-based rendering
- AI integration
- Export systems

**Size:** Large (~5000+ lines)

---

## Decision: Archive vs. Merge

### Recommendation: Archive Simple Version

**Reasoning:**
1. Advanced version has all features of simple version
2. Advanced version is actively maintained
3. Simple version serves as learning/reference
4. No unique features in simple version that aren't in advanced

**Alternative: Merge Unique Features**
- If simple version has unique features, merge them first
- Then archive simple version

---

## Step-by-Step Migration Process

### Step 1: Analyze for Unique Features

1. **Compare features**
   - List all features in simple version
   - Check if advanced version has equivalent
   - Identify any unique features

2. **Document findings**
   - Create comparison document
   - Note any unique features
   - Decide: archive or merge

### Step 2: Merge Unique Features (if any)

**If unique features found:**

1. **Extract unique code**
   - Identify unique algorithms or features
   - Extract to separate files

2. **Integrate into advanced version**
   - Add features to `psychedelic-liquid-light-show`
   - Test thoroughly
   - Update documentation

3. **Test integration**
   - Verify features work
   - Performance testing
   - Visual regression testing

### Step 3: Archive Simple Version

1. **Create archive documentation**
   ```markdown
   # liquid-light-show-simulator - ARCHIVED
   
   This project has been archived. For the active implementation, see:
   [psychedelic-liquid-light-show](../psychedelic-liquid-light-show/)
   
   Archived: 2027-01-07
   Reason: Superseded by advanced version
   ```

2. **Move to archive location** (optional)
   ```bash
   # Option 1: Keep in place, mark as archived
   # Option 2: Move to archive folder
   mv liquid-light-show-simulator archive/liquid-light-show-simulator
   ```

3. **Update project references**
   - Update `PROJECTS_DASHBOARD.md`
   - Update `PROJECT_RELATIONSHIPS.md`
   - Update any documentation referencing it

### Step 4: Update Documentation

1. **Update advanced version README**
   - Note that it supersedes simple version
   - Link to archived version for reference

2. **Update project dashboard**
   - Mark simple version as archived
   - Update status

---

## Code Examples

### Simple Version (Archived)

```typescript
// liquid-light-show-simulator/src/simulation/blobs.ts
export function createBlobs(count: number): Blob[] {
  // Simple blob creation
}

export function updateBlobs(
  blobs: Blob[],
  dt: number,
  width: number,
  height: number,
  pointer?: { x: number; y: number }
): Blob[] {
  // Simple update logic
}
```

### Advanced Version (Active)

```typescript
// psychedelic-liquid-light-show/src/simulation/fluid.ts
export class FluidSimulation {
  // Advanced two-phase fluid simulation
  // Oil/water separation
  // Surface tension
  // Refraction
  // Thin-film interference
}
```

**The advanced version has all capabilities of the simple version and more.**

---

## Testing Checklist

### Before Archiving

- [ ] Unique features identified (if any)
- [ ] Unique features merged (if any)
- [ ] Advanced version tested
- [ ] Documentation updated

### After Archiving

- [ ] Archive documentation created
- [ ] Project references updated
- [ ] Dashboard updated
- [ ] No broken links

---

## Rollback Procedures

### If Issues Occur

1. **Restore Simple Version**
   ```bash
   # If moved to archive
   mv archive/liquid-light-show-simulator liquid-light-show-simulator
   ```

2. **Update Documentation**
   - Revert archive status
   - Update references

3. **Continue Using Both**
   - Keep both versions active if needed
   - Document use cases for each

---

## Migration Timeline

**Day 1:**
- Analyze for unique features
- Document findings
- Make decision

**Day 2-3:**
- Merge unique features (if any)
- Test integration

**Day 4-5:**
- Archive simple version
- Update documentation
- Update project references

---

## Success Criteria

- [ ] Decision made (archive or merge)
- [ ] Unique features merged (if any)
- [ ] Simple version archived
- [ ] Documentation updated
- [ ] No broken references
- [ ] Advanced version is primary implementation

---

## References

- [Architecture Decision Record](docs/decisions/003-liquid-light-show-merge.md)
- [Project Similarity Analysis](PROJECT_SIMILARITY_ANALYSIS.md)
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
