# Theme Integration Notes

**Date:** 2026-01-09  
**Status:** Integration Complete

## Theme Integration Status

The 25 themes from theme-lab have been integrated into the unified design system at `shared/design-system/src/themes.ts`.

## Current Setup

### theme-lab
- **Local Themes:** `shared/theme.css` (CSS custom properties)
- **Purpose:** Design system playground and testing
- **Status:** Keeps local copy for offline testing and CSS-based preview

### shared/design-system
- **Integrated Themes:** `src/themes.ts` (TypeScript definitions)
- **Purpose:** Programmatic theme access for React/TypeScript projects
- **Status:** All 25 themes available via `getThemeColors()`, `getThemeNames()`, `hasTheme()`

## Usage

### In theme-lab (CSS-based)
```html
<html data-theme="errl-core">
  <!-- Uses CSS custom properties from shared/theme.css -->
</html>
```

### In React/TypeScript projects
```typescript
import { getThemeColors, getThemeNames } from '@/shared/design-system';

// Get all theme names
const themes = getThemeNames();

// Get specific theme colors
const colors = getThemeColors('errl-core');
```

## Theme List

All 25 themes are available in both locations:

1. errl-core (default)
2. errl-deepsea
3. errl-sunset
4. errl-forest
5. errl-night-sky
6. errl-neon-dream
7. errl-void
8. errl-cotton-candy
9. errl-gold
10. errl-holographic
11. errl-lava-lamp
12. errl-crystal-cave
13. errl-pastel-gloom
14. errl-aurora
15. errl-terminal
16. errl-acid-rain
17. errl-bubblegum
18. errl-midnight-ocean
19. errl-desert-dusk
20. errl-mint-choc
21. errl-plasma
22. errl-rainbow-orb
23. errl-ice
24. errl-bruised-peach
25. errl-mono

## Future Options

### Option 1: Keep Both (Current)
- theme-lab: CSS-based for visual testing
- shared/design-system: TypeScript for programmatic access
- **Benefit:** Best of both worlds, offline testing possible

### Option 2: Reference Shared Themes
- theme-lab could import from shared/design-system
- Generate CSS from TypeScript definitions
- **Benefit:** Single source of truth
- **Trade-off:** Requires build step, less portable

### Option 3: Generate CSS from TypeScript
- Create build script to generate theme.css from themes.ts
- **Benefit:** Single source of truth, both formats available
- **Trade-off:** Requires build step

## Recommendation

**Keep current setup (Option 1)** - theme-lab serves as a visual testing playground and benefits from having a local CSS copy for offline use. The TypeScript integration in shared/design-system serves React/TypeScript projects that need programmatic access.

## Notes

- Both implementations are kept in sync manually
- If themes change, update both locations
- Consider automated sync in the future if themes change frequently
