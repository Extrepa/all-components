# Errl Design System - Source File Update Pattern

This document outlines the pattern for updating source component files to use the Errl Design System.

## Overview

The Errl Design System provides:
- **Themes**: Light and dark mode support
- **Neon Colors**: Cyan, blue, purple, magenta, pink, green, yellow
- **Effects**: Neon glow, rainbow borders, sparkle animations, gradients, fading
- **RGB Gradient Borders**: Thin borders with RGB fading effects
- **Ghost/Transparent Backgrounds**: Backdrop blur with transparency

## Priority Components

Update components in this order:

1. **High Priority** (Most used components):
   - `errl-portal/ui/button.tsx`
   - `errl-portal/ui/card.tsx`
   - `errl-portal/ui/input.tsx`
   - `errl-portal-shared/ui/button.tsx`
   - `errl-portal-shared/ui/card.tsx`
   - `errl-portal-shared/ui/input.tsx`

2. **Medium Priority**:
   - `errl-portal/ui/tabs.tsx`
   - `errl-portal/ui/scroll-area.tsx`
   - `errl-portal-shared/ui/badge.tsx`
   - `errl-portal-shared/ui/tabs.tsx`
   - `errl-portal-shared/ui/scroll-area.tsx`

3. **Low Priority** (Complex components):
   - Components requiring 3D rendering
   - Components with heavy dependencies
   - Components in `Errl_Components` (shader-based)

## Update Pattern

### Step 1: Import Design System

```typescript
import { ERRL_DESIGN_SYSTEM, getErrlBorder, getErrlBackground, getErrlGlow } from './designSystem/errlDesignSystem';
```

Or if using a shared design system:

```typescript
import { ERRL_DESIGN_SYSTEM } from '@errl-design-system/core';
```

### Step 2: Replace Hardcoded Colors

**Before:**
```typescript
const buttonStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  color: '#1f2937',
};
```

**After:**
```typescript
const buttonStyle = {
  background: ERRL_DESIGN_SYSTEM.themes.dark.panel,
  border: `1px solid ${ERRL_DESIGN_SYSTEM.themes.dark.border}`,
  color: ERRL_DESIGN_SYSTEM.themes.dark.text,
};
```

### Step 3: Add Theme Support

**Pattern:**
```typescript
interface ComponentProps {
  theme?: 'light' | 'dark';
  effect?: 'none' | 'neon' | 'rainbow' | 'sparkle' | 'gradient' | 'fade';
  neonColor?: 'cyan' | 'blue' | 'purple' | 'magenta' | 'pink' | 'green' | 'yellow';
  // ... other props
}

export function Component({ theme = 'dark', effect = 'none', neonColor = 'cyan', ...props }: ComponentProps) {
  const themeColors = ERRL_DESIGN_SYSTEM.themes[theme];
  
  const style = {
    background: themeColors.panel,
    border: effect === 'neon' 
      ? `2px solid ${themeColors.accent}` 
      : `1px solid ${themeColors.border}`,
    color: themeColors.text,
    boxShadow: effect === 'neon' ? getErrlGlow(neonColor) : 'none',
  };
  
  return <div style={style}>{/* component content */}</div>;
}
```

### Step 4: Apply RGB Gradient Borders

**Pattern:**
```typescript
const borderStyle = effect === 'rainbow' || effect === 'gradient'
  ? {
      border: '1px solid transparent',
      borderImage: getErrlBorder(effect, neonColor),
      borderImageSlice: 1,
    }
  : {
      border: `1px solid ${themeColors.border}`,
    };
```

### Step 5: Add Ghost/Transparent Backgrounds

**Pattern:**
```typescript
const backgroundStyle = {
  background: themeColors.panel, // rgba(7, 27, 37, 0.9)
  backdropFilter: 'blur(10px)',
};
```

### Step 6: Apply Animations

**Pattern:**
```typescript
const animationStyle = effect === 'sparkle'
  ? { animation: 'sparkle 2s ease-in-out infinite' }
  : effect === 'fade'
  ? { animation: 'fade 2s ease-in-out infinite' }
  : {};
```

## Code Templates

### Button Component Template

```typescript
import React from 'react';
import { ERRL_DESIGN_SYSTEM, getErrlGlow, type ThemeMode, type EffectMode, type NeonColor } from './designSystem/errlDesignSystem';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  theme?: ThemeMode;
  effect?: EffectMode;
  neonColor?: NeonColor;
}

export function Button({ 
  variant = 'default', 
  size = 'md',
  theme = 'dark',
  effect = 'none',
  neonColor = 'cyan',
  className = '',
  style = {},
  ...props 
}: ButtonProps) {
  const themeColors = ERRL_DESIGN_SYSTEM.themes[theme];
  
  const baseStyle: React.CSSProperties = {
    padding: `${ERRL_DESIGN_SYSTEM.spacing.sm} ${ERRL_DESIGN_SYSTEM.spacing.md}`,
    borderRadius: ERRL_DESIGN_SYSTEM.borderStyles.radius.small,
    border: `${ERRL_DESIGN_SYSTEM.borderStyles.thin} solid ${themeColors.border}`,
    color: themeColors.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    ...style,
  };

  // Apply variant styles
  switch (variant) {
    case 'default':
      baseStyle.background = themeColors.panel;
      baseStyle.borderColor = themeColors.accent;
      if (effect === 'neon') {
        baseStyle.boxShadow = getErrlGlow(neonColor);
      }
      break;
    case 'outline':
      baseStyle.background = 'transparent';
      break;
    case 'ghost':
      baseStyle.background = 'transparent';
      baseStyle.border = 'none';
      break;
    // ... other variants
  }

  // Apply effect animations
  if (effect === 'sparkle') {
    baseStyle.animation = 'sparkle 2s ease-in-out infinite';
  } else if (effect === 'fade') {
    baseStyle.animation = 'fade 2s ease-in-out infinite';
  }

  return (
    <button
      className={className}
      style={baseStyle}
      {...props}
    />
  );
}
```

### Card Component Template

```typescript
import React from 'react';
import { ERRL_DESIGN_SYSTEM, getErrlBorder, getErrlGlow, type ThemeMode, type EffectMode } from './designSystem/errlDesignSystem';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: ThemeMode;
  effect?: EffectMode;
}

export function Card({ theme = 'dark', effect = 'none', className = '', style = {}, ...props }: CardProps) {
  const themeColors = ERRL_DESIGN_SYSTEM.themes[theme];
  
  const cardStyle: React.CSSProperties = {
    background: themeColors.panel,
    border: `1px solid ${themeColors.border}`,
    borderRadius: ERRL_DESIGN_SYSTEM.borderStyles.radius.medium,
    padding: ERRL_DESIGN_SYSTEM.spacing.lg,
    backdropFilter: 'blur(10px)',
    ...style,
  };

  // Apply RGB gradient border if effect is rainbow or gradient
  if (effect === 'rainbow' || effect === 'gradient') {
    cardStyle.border = '1px solid transparent';
    cardStyle.borderImage = getErrlBorder(effect);
    cardStyle.borderImageSlice = 1;
  }

  // Apply neon glow
  if (effect === 'neon') {
    cardStyle.boxShadow = getErrlGlow('cyan');
  }

  return (
    <div className={className} style={cardStyle} {...props} />
  );
}
```

## CSS Integration

### Add to Component CSS File

```css
/* Import Errl Design System animations */
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

@keyframes fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
}

/* Utility classes */
.neon-glow {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3);
  animation: glow 2s ease-in-out infinite;
}

.rainbow-border {
  border: 2px solid;
  border-image: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1;
}
```

## Testing Checklist

After updating a component:

- [ ] Component renders correctly in dark theme
- [ ] Component renders correctly in light theme
- [ ] All effect modes work (neon, rainbow, sparkle, gradient, fade)
- [ ] RGB gradient borders display correctly
- [ ] Neon glows are visible
- [ ] Animations perform smoothly
- [ ] Ghost/transparent backgrounds work with backdrop blur
- [ ] Component is accessible (contrast ratios, keyboard navigation)
- [ ] Component works in all supported browsers

## Migration Strategy

1. **Start with preview system**: Components are already styled in the preview system
2. **Update one component at a time**: Test thoroughly before moving to the next
3. **Maintain backward compatibility**: Add new props as optional, don't break existing usage
4. **Document changes**: Update component documentation with new props
5. **Create examples**: Show all theme/effect combinations in Storybook or docs

## Common Patterns

### Conditional Styling Based on Effect

```typescript
const getEffectStyle = (effect: EffectMode, neonColor: NeonColor) => {
  switch (effect) {
    case 'neon':
      return {
        boxShadow: getErrlGlow(neonColor),
        border: `2px solid ${ERRL_DESIGN_SYSTEM.neon[neonColor]}`,
      };
    case 'rainbow':
      return {
        border: '1px solid transparent',
        borderImage: ERRL_DESIGN_SYSTEM.borders.rainbow,
        borderImageSlice: 1,
      };
    case 'sparkle':
      return {
        animation: 'sparkle 2s ease-in-out infinite',
      };
    default:
      return {};
  }
};
```

### Theme-Aware Color Selection

```typescript
const getTextColor = (theme: ThemeMode, variant: 'primary' | 'secondary' | 'muted') => {
  const colors = ERRL_DESIGN_SYSTEM.themes[theme];
  switch (variant) {
    case 'primary':
      return colors.text;
    case 'secondary':
      return colors.accent;
    case 'muted':
      return colors.muted;
  }
};
```

## Notes

- Always use CSS variables when possible for better performance
- Consider using CSS-in-JS libraries (styled-components, emotion) for dynamic theming
- Test animations on lower-end devices to ensure performance
- Ensure accessibility: animations should respect `prefers-reduced-motion`
- Use semantic color names (accent, muted, etc.) rather than specific colors

