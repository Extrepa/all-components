# Theme Lab Architecture

Technical architecture and design decisions for Theme Lab.

## Overview

Theme Lab is a zero-runtime-dependency design system playground built with TypeScript, HTML, and CSS. It uses CSS custom properties (CSS variables) for theming and provides a comprehensive interface for previewing, editing, and exporting design tokens. The project uses Vite for development and build tooling.

## File Structure

```
theme-lab/
├── index.html              # Main HTML file
├── src/
│   ├── app.ts             # Main TypeScript application
│   ├── constants.ts       # Theme definitions and constants
│   ├── utils.ts           # Utility functions
│   └── types.ts           # TypeScript type definitions
├── shared/
│   ├── theme.css          # Theme definitions and tokens
│   └── ui/
│       └── core.css       # Component styles
├── docs/                  # Documentation
│   ├── FEATURES.md
│   ├── CAPABILITIES.md
│   ├── MILESTONES.md
│   ├── API.md
│   └── ARCHITECTURE.md
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project overview
```

## Core Architecture

### CSS Architecture

#### Theme System (`shared/theme.css`)
- **Base Tokens** - Shape, timing, shadows (shared across themes)
- **Layout Tokens** - Spacing, density controls
- **Theme Blocks** - 25 theme definitions using `:root[data-theme="..."]`
- **Token Inheritance** - Themes override base tokens

#### Component System (`shared/ui/core.css`)
- **Reset Styles** - Box-sizing, margin/padding reset
- **Layout System** - Grid-based app shell
- **Component Styles** - All components use CSS custom properties
- **State Variations** - Hover, focus, disabled, error, success
- **Responsive** - Media queries for mobile

### TypeScript Architecture

#### Module Organization
- **`src/app.ts`** - Main application logic, theme management, UI interactions
- **`src/constants.ts`** - Theme definitions, constants
- **`src/utils.ts`** - Utility functions (clipboard, contrast, tokens)
- **`src/types.ts`** - TypeScript type definitions

#### Feature Modules
- **Theme Management** - Switching, getting tokens
- **Layout Controls** - Density, borders, shadows
- **Export Functions** - JSON, CSS, code generation
- **Validation** - Accessibility checking
- **Presets** - Save/load functionality
- **Sharing** - URL encoding/decoding
- **UI Functions** - Modals, toasts, dropdowns
- **Token Controls** - Real-time token editing

#### Data Flow
1. User action (click, keyboard)
2. JavaScript updates `data-*` attributes on `<html>`
3. CSS selectors match attributes
4. CSS custom properties update
5. Components re-render with new tokens

### State Management

#### Theme State
- Stored in `data-theme` attribute on `<html>`
- Persists across page interactions
- Can be shared via URL

#### Layout State
- Stored in multiple `data-*` attributes
- `data-density`, `data-borders`, `data-shadows`, etc.
- Can be saved as presets

#### Preset State
- Stored in `localStorage`
- JSON format
- Includes theme + layout

## Design Patterns

### CSS Custom Properties Pattern
```css
/* Base definition */
:root {
  --accent: #34e1ff;
}

/* Theme override */
:root[data-theme="errl-deepsea"] {
  --accent: #00f0ff;
}

/* Component usage */
.btn-primary {
  background: var(--accent);
}
```

### Attribute-Based Theming
```html
<html data-theme="errl-core" data-density="cozy">
```

### Component Class Pattern
```html
<button class="btn btn-primary">Click</button>
```

## Key Design Decisions

### Why CSS Custom Properties?
- **Performance** - No JavaScript required for theme switching
- **Cascade** - Natural CSS inheritance
- **Flexibility** - Easy to override
- **Browser Support** - All modern browsers

### Why No Build Step?
- **Simplicity** - Edit and refresh
- **Accessibility** - Easy for beginners
- **Portability** - Works anywhere
- **Speed** - No compilation needed

### Why TypeScript?
- **Type Safety** - Catch errors at compile time
- **Better DX** - IntelliSense and autocomplete
- **Maintainability** - Self-documenting code
- **Modern Tooling** - Vite provides fast HMR and builds
- **Still Zero Runtime Dependencies** - Compiles to vanilla JavaScript

### Why LocalStorage for Presets?
- **Persistence** - Survives page refresh
- **Privacy** - Stays in browser
- **Simplicity** - No backend needed
- **Performance** - Instant access

## Component Architecture

### Button Component
```css
.btn {
  /* Base styles */
  padding: var(--layout-card-padding-y) var(--layout-card-padding-x);
  border-radius: 999px;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-alt));
  color: #050510;
}
```

### Card Component
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-soft);
}
```

### Input Component
```css
.input {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border);
  color: var(--text);
}

.input:focus {
  border-color: var(--accent);
}
```

## Layout System

### Grid Layout
```css
.app-shell {
  display: grid;
  grid-template-columns: var(--layout-sidebar-width) minmax(0, 1fr);
}
```

### Responsive Breakpoints
```css
@media (max-width: 880px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
}
```

## Theme System

### Theme Definition Structure
```css
:root[data-theme="theme-id"] {
  --bg: #02070a;
  --surface: #071b25;
  --accent: #34e1ff;
  /* ... all tokens ... */
}
```

### Token Categories
1. **Backgrounds** - bg, bg-alt
2. **Surfaces** - surface, surface-alt
3. **Borders** - border, border-soft
4. **Accents** - accent, accent-alt, accent-soft, accent-boost
5. **Text** - text, muted
6. **Semantic** - danger, success
7. **Gradients** - border-gradient-from, border-gradient-to

## TypeScript Patterns

### Function Organization
- Pure functions where possible
- Event-driven updates
- No global state (except THEMES array)
- Modular function groups
- Type-safe interfaces and types

### Type Safety
```typescript
// All functions are typed
function setTheme(id: string): void;
function getComputedThemeTokens(themeId: string): ThemeTokens;
function validateTheme(themeId: string): ValidationResults;
```

### Module Exports
```typescript
// Named exports for tree-shaking
export { setTheme, getCurrentThemeId, getThemeAsJSON };
export type { Theme, ThemeTokens, ValidationResults };
```

### Error Handling
```javascript
try {
  const theme = JSON.parse(importedJson);
  // Validate and apply
} catch (err) {
  showError(err.message);
}
```

### Async Patterns
```javascript
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    return fallbackCopy(text);
  }
}
```

## Performance Considerations

### CSS Performance
- **Custom Properties** - Fast, native browser support
- **Attribute Selectors** - Efficient matching
- **No JavaScript** - For theme switching

### JavaScript Performance
- **Event Delegation** - Efficient event handling
- **Debouncing** - For search input
- **Lazy Loading** - Modals load on demand

### Storage Performance
- **LocalStorage** - Fast, synchronous
- **JSON Serialization** - Efficient encoding

## Accessibility

### WCAG Compliance
- **Contrast Checking** - Automated validation
- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - Semantic HTML
- **Focus Management** - Visible focus states

### Implementation
- ARIA labels where needed
- Semantic HTML elements
- Keyboard shortcuts
- Reduced motion support

## Browser Compatibility

### CSS Features Used
- CSS Custom Properties
- CSS Grid
- Flexbox
- Attribute Selectors
- Media Queries

### TypeScript/JavaScript Features Used
- TypeScript 5.9+ (strict mode)
- ES2020+ (arrow functions, const/let, template literals, optional chaining)
- LocalStorage API
- Clipboard API
- MutationObserver
- URLSearchParams
- Vite (for development and build)

### Fallbacks
- Clipboard API → execCommand
- Modern features → Graceful degradation

## Security Considerations

### URL Sharing
- Base64 encoding (not encryption)
- No sensitive data in URLs
- Validation on load

### LocalStorage
- Browser-specific (not shared)
- No sensitive data stored
- User-controlled

### Import Validation
- JSON parsing with try/catch
- Token validation
- No code execution

## Extensibility

### Adding Themes
1. Add CSS block to `shared/theme.css`
2. Add entry to `THEMES` array in `src/constants.ts`
3. Restart dev server or rebuild

### Adding Components
1. Add HTML to preview area
2. Add styles to `core.css`
3. Use CSS custom properties

### Adding Features
1. Add JavaScript function
2. Wire up UI element
3. Update documentation

## Testing Strategy

### Manual Testing
- All themes tested
- All components tested
- All features tested
- Cross-browser testing

### Validation
- Accessibility checker
- Contrast validation
- Token validation

## Future Architecture Considerations

### Potential Improvements
- **Build Step** - For optimization
- **TypeScript** - For type safety
- **Component Framework** - For complex UIs
- **Backend** - For theme sharing
- **Database** - For theme marketplace

### Migration Path
- Current architecture supports gradual migration
- Can add build step without breaking changes
- Can add framework incrementally

## Conclusion

Theme Lab's architecture prioritizes:
1. **Simplicity** - Easy to understand and modify
2. **Performance** - Fast, native browser features
3. **Flexibility** - Easy to extend
4. **Accessibility** - WCAG compliant
5. **Portability** - Works anywhere

The zero-dependency approach makes it easy to integrate into any project while maintaining full control over the codebase.

