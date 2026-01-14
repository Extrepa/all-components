# FX Tools Consolidation Decision

**Date:** 2026-01-09  
**Status:** Decision Document

## Analysis

### FX Tools Comparison

**1. ErrlFXLab**
- **Type:** Creative coding and visual effects experimentation
- **Features:** 23 JavaScript modules, modular refactoring system
- **Purpose:** Creative coding laboratory for experimenting with visual effects
- **Tech:** Vanilla JavaScript, P5.js, modular architecture

**2. errl_vibecheck**
- **Type:** AI-powered visual coding playground
- **Features:** Multiple rendering modes (P5.js, SVG, GLSL, Three.js), AI code generation, batch testing
- **Purpose:** AI-powered code generation and visual output comparison
- **Tech:** React, Google Gemini AI, multiple rendering engines

**3. multi-tool-app FX Lab Mode**
- **Type:** Simple animation vibes system
- **Features:** 5 basic vibes (pulse, glow, float, shake, rotation), audio-reactive support
- **Purpose:** Apply simple animations to assets within unified workflow
- **Tech:** Framer Motion, integrated with SVG Editor and Scene Maker

## Decision

### Keep All Three Tools Separate

**Reasoning:**
1. **Different Purposes:**
   - ErrlFXLab: Creative coding experimentation
   - errl_vibecheck: AI-powered code generation and comparison
   - multi-tool-app FX Lab: Simple animation vibes for assets

2. **Different Complexity:**
   - ErrlFXLab: 23 JS modules, advanced creative coding
   - errl_vibecheck: AI integration, multiple rendering modes
   - multi-tool-app FX Lab: Simple vibes (5 effects)

3. **Different Use Cases:**
   - ErrlFXLab: Standalone creative coding experiments
   - errl_vibecheck: AI-powered visual code generation
   - multi-tool-app FX Lab: Integrated workflow (SVG → FX → Scene)

## Recommendation

**Do NOT deprecate ErrlFXLab or errl_vibecheck** in favor of multi-tool-app FX Lab.

**Rationale:**
- They serve fundamentally different purposes
- multi-tool-app FX Lab is for simple asset animations
- ErrlFXLab and errl_vibecheck are advanced creative coding tools
- No significant overlap that would justify deprecation

## Action Items

1. ✅ Document decision (this file)
2. Update PROJECT_SIMILARITY_ANALYSIS.md with this decision
3. Update PROJECT_RELATIONSHIPS.md to clarify relationships
4. Keep all three tools as separate projects

---

**Note:** This decision may be revisited if multi-tool-app FX Lab is enhanced to include creative coding capabilities, but for now, all three tools serve distinct purposes.
