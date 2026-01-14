# Component Integration Guide

**Date:** 2027-01-09  
**Status:** Complete  
**Phase:** Phase 6

## Overview

Guide for integrating components from Errl_Components and errl-portal-shared into projects.

## Component Libraries

### 1. Errl_Components

**Location:** `Errl_Components/`  
**Type:** Active component library  
**Status:** Production-ready

**Components Available:**
- ErrlPage (main orchestrator)
- ProjectorRig (shader background)
- InstancedBubbleSystem (bubble rendering)
- ExplosionSystem (particle effects)
- ErrlContentLayout (content wrapper)
- BubbleButton (navigation buttons)
- BubbleMesh (individual bubbles)
- BubblePositionSync (position sync)
- ScrollController (scroll control)
- PerformanceMonitor (FPS tracking)
- TrippyScene (visual effects)
- TriggerButton (trigger buttons)
- ErrorBoundary (error handling)

**Documentation:** See `Errl_Components/docs/COMPONENT_CATALOG.md`

### 2. errl-portal-shared Projects

**Location:** `errl-portal-shared/projects/`  
**Type:** Project-specific components  
**Status:** Integrated into errl-portal

**Components Available:**
- BubbleMouseTrail
- GravityStickerField
- HolographicCursorTrail
- RippleFace
- SparkleWorkletPin

**Documentation:** See component files for usage

### 3. all-components

**Location:** `all-components/`  
**Type:** Reference library  
**Status:** Snapshot/archive (not for direct import)

**Usage:** Browse for reference, copy components as needed

## Integration Patterns

### Pattern 1: Direct Import (Errl_Components)

**When to Use:** For Errl_Components library

```tsx
// Install package (if published)
npm install @errl/components

// Import component
import { ErrlPage, BubbleButton } from '@errl/components';

// Use component
function App() {
  return <ErrlPage />;
}
```

**Current Status:** Components are in source, not published as package

### Pattern 2: Path Alias Import

**When to Use:** For local development, shared components

```tsx
// Configure path alias in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@errl/components": ["../Errl_Components/src"]
    }
  }
}

// Import component
import { ErrlPage } from '@errl/components';
```

### Pattern 3: Relative Import

**When to Use:** For project-specific shared components

```tsx
// Import from shared directory
import { GravityStickerField } from '@/shared/components/projects/gravity-sticker-field/GravityStickerField';

// Use component
<GravityStickerField />
```

**Example:** errl-portal uses this pattern for studio projects

### Pattern 4: Copy Component

**When to Use:** For all-components reference library

```tsx
// 1. Find component in all-components
// 2. Copy component file(s) to your project
// 3. Copy dependencies (stores, utilities)
// 4. Adapt for your project

// Import copied component
import { ComponentName } from './components/ComponentName';
```

## Integration Examples

### Example 1: errl-portal Studio Projects

**Location:** `errl-portal/src/apps/studio/src/app/pages/StudioProjects.tsx`

**Integration:**
```tsx
import GravityStickerField from '@/shared/components/projects/gravity-sticker-field/GravityStickerField';
import RippleFace from '@/shared/components/projects/ripple-face/RippleFace';
import SparkleWorkletPin from '@/shared/components/projects/sparkle-worklet-pin/SparkleWorkletPin';
import BubbleMouseTrail from '@/shared/components/projects/bubble-mouse-trail/BubbleMouseTrail';
import HolographicCursorTrail from '@/shared/components/projects/holographic-cursor-trail/HolographicCursorTrail';

// Usage
<Section title="Gravity Sticker Field">
  <div className="rounded-lg border border-white/10 bg-black/40 p-8">
    <GravityStickerField />
  </div>
</Section>
```

**Status:** ✅ Integrated (2027-01-09)

### Example 2: Using Errl_Components

**Integration:**
```tsx
import { ErrlPage, ErrorBoundary } from '../Errl_Components/src/components';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ErrlPage />
    </ErrorBoundary>
  );
}
```

**Requirements:**
- React 18 or 19
- @react-three/fiber
- @react-three/drei
- three.js
- zustand

## Component Dependencies

### Errl_Components Dependencies

**Required:**
- React (^18.0.0 || ^19.0.0)
- @react-three/fiber (^9.4.0)
- @react-three/drei (^10.7.7)
- three.js (peer dependency)
- zustand (for state management)

**Internal:**
- ERRL_CONFIG (content configuration)
- Zustand stores (useErrlInteractions, useScrollStore, useHypnoStore)

### errl-portal-shared Dependencies

**Varies by component:**
- React
- Various Web APIs (Worklets, etc.)
- Component-specific dependencies

## Integration Checklist

### Before Integration

- [ ] Verify component dependencies are installed
- [ ] Check React version compatibility
- [ ] Review component props and requirements
- [ ] Understand component architecture

### During Integration

- [ ] Import component correctly
- [ ] Provide required props
- [ ] Handle optional props appropriately
- [ ] Set up required stores/context if needed
- [ ] Test component functionality

### After Integration

- [ ] Verify component works as expected
- [ ] Check for console errors
- [ ] Test edge cases
- [ ] Document usage in project
- [ ] Update project dependencies if needed

## Common Integration Issues

### Issue 1: Missing Dependencies

**Symptom:** Import errors, missing modules

**Solution:**
- Install required dependencies
- Check package.json
- Verify peer dependencies

### Issue 2: Type Errors

**Symptom:** TypeScript errors on import

**Solution:**
- Check TypeScript configuration
- Verify path aliases
- Install type definitions

### Issue 3: Runtime Errors

**Symptom:** Component doesn't render or crashes

**Solution:**
- Check required props
- Verify stores/context are set up
- Check browser console for errors
- Review component documentation

### Issue 4: Performance Issues

**Symptom:** Slow rendering, frame drops

**Solution:**
- Check component performance notes
- Verify GPU acceleration
- Review useFrame optimizations
- Check for memory leaks

## Version Compatibility

### React Versions

- **Errl_Components:** React 18 or 19
- **errl-portal-shared:** Varies by component
- **Check:** Component documentation for specific requirements

### Three.js Versions

- **Errl_Components:** Compatible with @react-three/fiber ^9.4.0
- **Check:** Three.js version compatibility

## Best Practices

1. **Use TypeScript** - Components are typed
2. **Follow Patterns** - Use established integration patterns
3. **Document Usage** - Document how components are used in your project
4. **Test Thoroughly** - Test components in your environment
5. **Handle Errors** - Use ErrorBoundary for WebGL components
6. **Performance** - Monitor performance, especially for WebGL components

## Component-Specific Notes

### ErrlPage

**Requirements:**
- ERRL_CONFIG content configuration
- Zustand stores set up
- Canvas context

**Usage:** Main orchestrator, wrap your app

### ProjectorRig

**Requirements:**
- ScrollControls from @react-three/drei
- Scroll store configured

**Usage:** Background shader effect

### BubbleButton

**Requirements:**
- BubbleNav configuration
- Interaction store

**Usage:** Navigation buttons with WebGL sync

### Studio Project Components

**Requirements:**
- React
- Component-specific Web APIs

**Usage:** Standalone components, no special setup needed

## Migration Guide

### From all-components to Source

1. **Identify Component** - Find in all-components
2. **Locate Source** - Find in source project
3. **Check Version** - Source may have updates
4. **Copy or Import** - Use source version
5. **Update Dependencies** - Install required deps

### From Source to Shared

1. **Evaluate Reusability** - Is component reusable?
2. **Extract to Shared** - Move to shared directory
3. **Update Imports** - Update all projects
4. **Document** - Add to component catalog
5. **Test** - Verify in all projects

## Notes

- Errl_Components is actively maintained
- errl-portal-shared components are integrated into errl-portal
- all-components is reference only (snapshot from Dec 2024)
- Components may have different requirements
- Always check component documentation

## Related Documentation

- [Errl_Components Catalog](../Errl_Components/docs/COMPONENT_CATALOG.md)
- [All Components Catalog](../all-components/docs/COMPONENT_CATALOG.md)
- [Component Documentation Standard](./COMPONENT_DOCUMENTATION_STANDARD.md)
