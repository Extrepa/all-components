# Migration Guide: Design Systems Consolidation

**Created:** 2027-01-07  
**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 2-3 weeks

---

## Overview

This guide covers migrating from two separate design systems to a unified React-focused design system in `shared/design-system/`.

**Current State:**
- `shared/design-system/` - Vanilla JS/CSS design system (extracted from errl-club)
- `all-components/errl-design-system/` - React-focused design system with hooks

**Target State:**
- `shared/design-system/` - Unified React-focused design system
- Backward compatibility maintained during migration

---

## Current State Analysis

### `shared/design-system/`

**Location:** [`shared/design-system/`](shared/design-system/)

**Files:**
- `design-system.css` - CSS variables
- `design-system.js` - JavaScript implementation
- `design-system.ts` - TypeScript definitions
- `README.md` - Documentation

**Characteristics:**
- Vanilla JS/CSS focus
- Cyberpunk aesthetic (cyan/magenta)
- Component patterns (buttons, panels, inputs, modals)
- Extracted from `errl-club`

**Usage:**
- Direct CSS import
- JavaScript object access
- TypeScript types available

**Example:**
```typescript
import { DESIGN_SYSTEM } from '@/shared/design-system/design-system';
const bgColor = DESIGN_SYSTEM.colors.background;
```

```css
@import '@/shared/design-system/design-system.css';
.my-panel {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
}
```

---

### `all-components/errl-design-system/`

**Location:** [`all-components/errl-design-system/`](all-components/errl-design-system/)

**Files:**
- `src/core/errlDesignSystem.ts` - Core constants, types, helpers
- `src/core/ThemeProvider.tsx` - React context provider
- `src/core/useErrlTheme.ts` - Custom hook
- `src/components/ErrlWrapper.tsx` - Wrapper component
- `src/styles/errlDesignSystem.css` - CSS variables, animations

**Characteristics:**
- React-focused with hooks
- Theme management (light/dark)
- Effect modes (neon, rainbow, sparkle, gradient, fade)
- RGB gradient borders
- Ghost/transparent backgrounds

**Usage:**
```tsx
import { ThemeProvider, useErrlTheme } from '@/all-components/errl-design-system';

function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme, effect, themeColors, getErrlButtonStyle } = useErrlTheme();
  return <button style={getErrlButtonStyle('default')}>Click me</button>;
}
```

---

## Target State Design

### Unified Design System Structure

```
shared/design-system/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Main exports
│   ├── tokens.ts                   # Design tokens (merged from both)
│   ├── core/
│   │   ├── ThemeProvider.tsx       # React context provider
│   │   ├── useErrlTheme.ts         # Custom hook
│   │   └── types.ts                # TypeScript types
│   ├── components/
│   │   ├── ErrlWrapper.tsx         # Wrapper component
│   │   ├── ThemeControls.tsx       # Theme controls UI
│   │   └── index.ts
│   └── styles/
│       ├── design-system.css       # CSS variables
│       ├── animations.css           # Animations
│       └── utilities.css           # Utility classes
└── dist/                            # Build output
```

### API Design

**Design Tokens:**
```typescript
// Unified tokens combining both systems
export const DESIGN_TOKENS = {
  colors: {
    // From shared/design-system
    background: 'rgba(20, 20, 20, 0.9)',
    border: '#00ffff',
    // From errl-design-system
    themes: { dark: {...}, light: {...} },
    neon: { cyan: '#00ffff', ... },
  },
  spacing: {...},
  typography: {...},
  // ... merged from both
};
```

**React Hook:**
```typescript
// Unified hook combining both approaches
export function useErrlTheme(componentId?: string) {
  // Combines functionality from both systems
  return {
    theme: 'dark' | 'light',
    effect: 'none' | 'neon' | 'rainbow' | ...,
    themeColors: {...},
    designTokens: DESIGN_TOKENS,
    getErrlButtonStyle: (variant: string) => {...},
    getErrlCardStyle: (variant: string) => {...},
    // ... all utilities
  };
}
```

**Backward Compatibility:**
```typescript
// Maintain old exports for migration period
export { DESIGN_SYSTEM } from './legacy';
export * from './legacy';
```

---

## Step-by-Step Migration Process

### Step 1: Create Unified Structure

1. **Create new structure in `shared/design-system/`**
   ```bash
   mkdir -p shared/design-system/src/{core,components,styles}
   ```

2. **Merge design tokens**
   - Combine color palettes from both systems
   - Merge spacing, typography, borders, shadows
   - Resolve conflicts (prefer React-focused system)
   - Create `src/tokens.ts`

3. **Create unified ThemeProvider**
   - Combine functionality from both systems
   - Support both theme modes and effects
   - Create `src/core/ThemeProvider.tsx`

4. **Create unified hook**
   - Merge `useErrlTheme` functionality
   - Add utilities from `shared/design-system`
   - Create `src/core/useErrlTheme.ts`

### Step 2: Create Backward Compatibility Layer

1. **Create legacy exports**
   ```typescript
   // shared/design-system/src/legacy.ts
   export const DESIGN_SYSTEM = {
     // Export old format for compatibility
   };
   ```

2. **Maintain CSS variables**
   - Keep all CSS variables from both systems
   - Ensure no breaking changes
   - Create `src/styles/design-system.css`

### Step 3: Migrate Pilot Project

**Choose:** `errl_scene_builder` (pilot project)

1. **Update imports**
   ```typescript
   // Before
   import { DESIGN_SYSTEM } from '@/shared/design-system/design-system';
   
   // After
   import { useErrlTheme, DESIGN_TOKENS } from '@/shared/design-system';
   ```

2. **Update components**
   ```tsx
   // Before
   function MyComponent() {
     const bgColor = DESIGN_SYSTEM.colors.background;
     return <div style={{ background: bgColor }}>...</div>;
   }
   
   // After
   function MyComponent() {
     const { themeColors } = useErrlTheme();
     return <div style={{ background: themeColors.bg }}>...</div>;
   }
   ```

3. **Update CSS imports**
   ```css
   /* Before */
   @import '@/shared/design-system/design-system.css';
   
   /* After */
   @import '@/shared/design-system/src/styles/design-system.css';
   ```

4. **Test thoroughly**
   - Visual regression testing
   - Check all components
   - Verify theme switching
   - Test effects

### Step 4: Migrate Remaining Projects

**Projects to migrate:**
- `errl_vibecheck`
- `multi-tool-app`
- `figma-clone-engine`
- `errl-forge---asset-remixer`
- `errl-portal`

**Process for each:**
1. Update imports
2. Update components to use hook
3. Update CSS imports
4. Test thoroughly
5. Remove old imports

### Step 5: Cleanup

1. **Archive old design systems**
   - Move `shared/design-system/design-system.{js,ts,css}` to `shared/design-system/archive/`
   - Move `all-components/errl-design-system/` to `all-components/archive/errl-design-system/`

2. **Update documentation**
   - Update all READMEs
   - Update migration guides
   - Update examples

3. **Remove backward compatibility** (after all projects migrated)
   - Remove legacy exports
   - Clean up old code

---

## Code Examples

### Before: Using `shared/design-system`

```typescript
// Component using old design system
import { DESIGN_SYSTEM } from '@/shared/design-system/design-system';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: DESIGN_SYSTEM.colors.background,
        border: `${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border}`,
        padding: DESIGN_SYSTEM.spacing.buttonPadding,
        color: DESIGN_SYSTEM.colors.text,
      }}
    >
      {children}
    </button>
  );
}
```

### After: Using Unified Design System

```tsx
// Component using new unified design system
import { useErrlTheme } from '@/shared/design-system';
import '@/shared/design-system/src/styles/design-system.css';

function Button({ children }: { children: React.ReactNode }) {
  const { getErrlButtonStyle } = useErrlTheme();
  
  return (
    <button style={getErrlButtonStyle('default')}>
      {children}
    </button>
  );
}

// Or with ErrlWrapper
import { ErrlWrapper } from '@/shared/design-system';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <ErrlWrapper>
      <button className="errl-button">
        {children}
      </button>
    </ErrlWrapper>
  );
}
```

### Before: Using `all-components/errl-design-system`

```tsx
// Component using old React design system
import { ThemeProvider, useErrlTheme } from '@/all-components/errl-design-system';

function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme, effect, getErrlButtonStyle } = useErrlTheme();
  return <button style={getErrlButtonStyle('default')}>Click</button>;
}
```

### After: Using Unified Design System

```tsx
// Component using new unified design system
import { ThemeProvider, useErrlTheme } from '@/shared/design-system';

function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme, effect, getErrlButtonStyle } = useErrlTheme();
  return <button style={getErrlButtonStyle('default')}>Click</button>;
}
```

**Note:** API is very similar, just different import path!

---

## Testing Checklist

### Visual Regression Testing

- [ ] All components render correctly
- [ ] Colors match expected values
- [ ] Spacing is correct
- [ ] Borders and shadows render properly
- [ ] Animations work
- [ ] Theme switching works (light/dark)
- [ ] Effects work (neon, rainbow, etc.)

### Functional Testing

- [ ] ThemeProvider works
- [ ] useErrlTheme hook works
- [ ] All design tokens accessible
- [ ] CSS variables work
- [ ] Utility functions work
- [ ] Component wrappers work

### Cross-Project Testing

- [ ] Pilot project (`errl_scene_builder`) works
- [ ] All projects can import
- [ ] No breaking changes
- [ ] Performance maintained

---

## Rollback Procedures

### If Issues Occur

1. **Immediate Rollback**
   ```bash
   # Revert to old design system
   git checkout HEAD~1 shared/design-system/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Temporarily use old imports
   import { DESIGN_SYSTEM } from '@/shared/design-system/design-system';
   // or
   import { useErrlTheme } from '@/all-components/errl-design-system';
   ```

3. **Gradual Rollback**
   - Keep both systems available during migration
   - Migrate projects back one at a time if needed
   - Fix issues before continuing

### Backup Strategy

- Create git branch before migration
- Tag current state
- Keep old design systems in archive folder
- Document rollback steps

---

## Migration Timeline

**Week 1:**
- Create unified structure
- Merge design tokens
- Create backward compatibility layer

**Week 2:**
- Migrate pilot project (`errl_scene_builder`)
- Test thoroughly
- Fix issues

**Week 3:**
- Migrate remaining projects
- Update documentation
- Cleanup

---

## Success Criteria

- [ ] All projects using unified design system
- [ ] No visual regressions
- [ ] All functionality works
- [ ] Documentation updated
- [ ] Old design systems archived
- [ ] Backward compatibility removed (after migration complete)

---

## References

- [Architecture Decision Record](docs/decisions/001-design-system-consolidation.md)
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
- [Consolidation Roadmap](CONSOLIDATION_ROADMAP.md)
- [Project Similarity Analysis](PROJECT_SIMILARITY_ANALYSIS.md)
