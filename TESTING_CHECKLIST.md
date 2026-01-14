# Testing Checklist

**Date:** 2026-01-09  
**Purpose:** Comprehensive testing of all 205 components and preview functionality

---

## Component Coverage Testing

### Test All 205 Components

#### Errl_Components (20 components)
- [ ] BubbleButton - React preview
- [ ] BubbleMesh - React preview
- [ ] BubblePositionSync - React preview
- [ ] errl-config - Code preview (TS)
- [ ] ErrlContentLayout - React preview
- [ ] ErrlPage - React preview
- [ ] ErrorBoundary - React preview
- [ ] ExplosionSystem - React preview
- [ ] index - Code preview (TS)
- [ ] InstancedBubbleSystem - React preview
- [ ] landing - React preview
- [ ] main - React preview
- [ ] PerformanceMonitor - React preview
- [ ] ProjectorRig - React preview
- [ ] ScrollController - React preview
- [ ] TriggerButton - React preview
- [ ] TrippyScene - React preview
- [ ] useErrlInteractions - Code preview (TS)
- [ ] useHypnoStore - Code preview (TS)
- [ ] useScrollStore - Code preview (TS)

#### errl_scene_builder (45 components)
- [ ] Test all 45 components
- [ ] Verify React components preview correctly
- [ ] Verify TS files show code preview
- [ ] Check special files (routes.tsx, main.tsx, etc.)

#### errl_vibecheck (11 components)
- [ ] Test all 11 components
- [ ] Verify React previews work
- [ ] Check error handling for complex components

#### errl-club-ui (50 components)
- [ ] Test all 50 components
- [ ] Verify JS components show code preview
- [ ] Check component files in subdirectories

#### errl-forge (12 components)
- [ ] Test all 12 components
- [ ] Verify React previews

#### errl-portal (5 components)
- [ ] button - React preview (lowercase name)
- [ ] card - React preview
- [ ] input - React preview
- [ ] scroll-area - React preview
- [ ] tabs - React preview

#### errl-portal-shared (15 components)
- [ ] Test all 15 components
- [ ] Verify project components preview
- [ ] Check SVG utilities

#### figma-clone-engine (41 components)
- [ ] Test all 41 components
- [ ] Verify inspector components
- [ ] Check hooks and utilities

#### errl-design-system (6 components)
- [ ] Test all 6 components
- [ ] Verify theme components

---

## Test by Component Type

### TSX Components (React)
- [ ] All TSX components load in iframe
- [ ] Component name matching works (case variations)
- [ ] Error messages are helpful
- [ ] Timeout handling works
- [ ] Retry mechanism works

### JSX Components (React)
- [ ] All JSX components load in iframe
- [ ] Same as TSX tests

### TS Files (Code Preview)
- [ ] Code preview shows correctly
- [ ] Syntax highlighting works
- [ ] Truncation works (5000 char limit)
- [ ] "Show more" button works
- [ ] JSON formatting works for .ts files with JSON content

### JS Files (Code Preview)
- [ ] Code preview shows correctly
- [ ] Syntax highlighting works
- [ ] Same as TS tests

### Special File Types
- [ ] GLSL files show with GLSL syntax
- [ ] CSS files show with CSS syntax
- [ ] JSON files show formatted
- [ ] Markdown files render (basic)

---

## Feature Testing

### Preview Functionality
- [ ] Click card toggles preview
- [ ] Double click opens modal
- [ ] Preview toggle button works
- [ ] Preview expands/collapses smoothly
- [ ] Preview state persists on reload
- [ ] Multiple previews can be open
- [ ] Concurrent preview limit works (max 5)
- [ ] Oldest preview auto-collapses when limit reached

### Performance
- [ ] Preview caching works
- [ ] Cached previews load instantly
- [ ] Iframe unloading works on collapse
- [ ] Memory usage acceptable with 10+ previews
- [ ] No performance degradation with many components

### Error Handling
- [ ] Preview system not running - shows helpful error
- [ ] Network errors - retry mechanism works
- [ ] File not found - shows error with path
- [ ] Component import errors - shows detailed error
- [ ] Timeout errors - retry works
- [ ] Component name mismatch - tries variations

### Syntax Highlighting
- [ ] TypeScript code highlighted
- [ ] JavaScript code highlighted
- [ ] GLSL code highlighted
- [ ] CSS code highlighted
- [ ] JSON formatted correctly
- [ ] Works in dark mode
- [ ] Works in light mode

---

## Error Scenario Testing

### Preview System Not Available
- [ ] Shows error message
- [ ] Instructions to start preview system
- [ ] Error is user-friendly

### Network Errors
- [ ] Retry mechanism works (2 retries)
- [ ] Error message after retries
- [ ] Network timeout handled

### File Not Found
- [ ] 404 errors handled
- [ ] Error shows file path
- [ ] Helpful error message

### Component Import Errors
- [ ] Missing dependencies detected
- [ ] Syntax errors detected
- [ ] Path resolution errors
- [ ] Detailed error messages

### Timeout Scenarios
- [ ] 5 second timeout works
- [ ] Retry on timeout
- [ ] Error after max retries

---

## Browser Compatibility Testing

### Chrome/Edge (Chromium)
- [ ] Iframe loading works
- [ ] localStorage works
- [ ] Fetch API works
- [ ] CSS animations smooth
- [ ] Syntax highlighting works
- [ ] Dark mode works
- [ ] All features functional

### Firefox
- [ ] Same tests as Chrome
- [ ] Verify iframe security
- [ ] localStorage compatibility

### Safari
- [ ] Same tests as Chrome
- [ ] Verify iframe behavior
- [ ] localStorage compatibility

### Mobile Browsers
- [ ] Touch interactions work
- [ ] Preview cards responsive
- [ ] Preview iframes work
- [ ] Performance acceptable

---

## Integration Testing

### React Preview System Integration
- [ ] Embedded mode works
- [ ] URL parameters parsed correctly
- [ ] Component loads in iframe
- [ ] Theme works in embedded mode
- [ ] Error handling in embedded mode

### Catalog Sync
- [ ] Main catalog matches React catalog
- [ ] Component counts match
- [ ] Sync script works
- [ ] No missing components

---

## Performance Testing

### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Preview load < 1 second (cached)
- [ ] Preview load < 5 seconds (uncached)
- [ ] Search response < 300ms

### Memory Usage
- [ ] No memory leaks
- [ ] Iframe cleanup works
- [ ] Cache size reasonable
- [ ] Memory stable with many previews

### Network
- [ ] Minimal redundant requests
- [ ] Cache headers respected
- [ ] Retry doesn't spam requests

---

## User Experience Testing

### Interactions
- [ ] Click interactions smooth
- [ ] Hover effects work
- [ ] Keyboard shortcuts work
- [ ] Mobile touch works

### Visual
- [ ] Dark mode looks good
- [ ] Light mode looks good
- [ ] Transitions smooth
- [ ] Loading states visible
- [ ] Error states clear

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (basic)
- [ ] Color contrast adequate
- [ ] Focus indicators visible

---

## Regression Testing

### Previous Features
- [ ] Filtering still works
- [ ] Sorting still works
- [ ] Search still works
- [ ] Favorites still work
- [ ] Export still works
- [ ] Theme toggle still works

---

## Test Results Template

For each component, record:
- Component name: ___________
- Project: ___________
- Type: ___________
- Preview works: [ ] Yes [ ] No
- Error message (if any): ___________
- Notes: ___________

---

## Sign-Off

**Testing Status:** [ ] Complete [ ] In Progress [ ] Not Started

**Date:** ___________

**Tester:** ___________

**Issues Found:** ___________

---

**End of Testing Checklist**
