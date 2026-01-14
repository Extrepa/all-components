# Theme Lab API Reference

Complete API documentation for Theme Lab's TypeScript functions and CSS variables.

## TypeScript API

All functions are exported from `src/app.ts`. Import them as needed:

```typescript
import { setTheme, getCurrentThemeId, getThemeAsJSON } from './app';
```

### Theme Management

#### `setTheme(themeId: string): void`
Sets the active theme.

**Parameters:**
- `themeId` (string) - Theme identifier (e.g., "errl-core")

**Example:**
```typescript
setTheme("errl-deepsea");
```

#### `getCurrentThemeId(): string`
Returns the currently active theme ID.

**Returns:** `string` - Current theme ID

**Example:**
```typescript
const current = getCurrentThemeId(); // "errl-core"
```

#### `getComputedThemeTokens(themeId: string): ThemeTokens`
Gets all computed token values for a theme.

**Parameters:**
- `themeId` (string) - Theme identifier

**Returns:** `ThemeTokens` - Object with all token values

**Example:**
```typescript
import { getComputedThemeTokens } from './utils';
import type { ThemeTokens } from './types';

const tokens: ThemeTokens = getComputedThemeTokens("errl-core");
console.log(tokens.accent); // "#34e1ff"
```

### Layout Management

#### `setLayout(attribute: string, value: string): void`
Sets a layout attribute on the document element.

**Parameters:**
- `attribute` (string) - Layout attribute name (e.g., "density")
- `value` (string) - Attribute value (e.g., "compact", "cozy", "spacious")

**Example:**
```typescript
setLayout("density", "spacious");
setLayout("borders", "off");
```

**Available Attributes:**
- `density`: "compact" | "cozy" | "spacious"
- `borders`: "on" | "off"
- `shadows`: "on" | "off"
- `sidebar-bg`: "gradient" | "solid"
- `header`: "show" | "hide"

### Export Functions

#### `getThemeAsJSON(themeId: string): string`
Exports theme as JSON string.

**Parameters:**
- `themeId` (string) - Theme identifier

**Returns:** `string` - JSON string

**Example:**
```typescript
const json = getThemeAsJSON("errl-core");
console.log(json);
```

#### `getThemeAsCSS(themeId: string): string`
Exports theme as CSS block.

**Parameters:**
- `themeId` (string) - Theme identifier

**Returns:** `string` - CSS string

**Example:**
```typescript
const css = getThemeAsCSS("errl-core");
```

#### `generateCodeSnippet(format: CodeSnippetFormat): string`
Generates code snippet in specified format.

**Parameters:**
- `format` (CodeSnippetFormat) - Format type: "react" | "tailwind" | "styled-components" | "emotion" | "typescript"

**Returns:** `string` - Code snippet

**Example:**
```typescript
import type { CodeSnippetFormat } from './types';

const reactCode = generateCodeSnippet("react");
```

### Validation

#### `validateTheme(themeId: string): ValidationResults`
Validates theme for accessibility compliance.

**Parameters:**
- `themeId` (string) - Theme identifier

**Returns:** `ValidationResults` - Validation results object

**Result Type:**
```typescript
interface ValidationResults {
  themeId: string;
  themeLabel: string;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  passed: boolean;
  score: 'AAA' | 'AA' | 'Fail';
  scorePercentage?: number;
  totalChecks?: number;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  fix: string;
}
```

**Example:**
```typescript
import { validateTheme } from './app';
import type { ValidationResults } from './types';

const results: ValidationResults = validateTheme("errl-core");
if (results.passed) {
  console.log("Theme passes WCAG AA!");
}
```

#### `getContrastRatio(color1: string, color2: string): number | null`
Calculates WCAG contrast ratio between two colors.

**Parameters:**
- `color1` (string) - Hex color (e.g., "#ffffff")
- `color2` (string) - Hex color (e.g., "#000000")

**Returns:** `number | null` - Contrast ratio (1-21) or null if invalid colors

**Example:**
```typescript
import { getContrastRatio } from './utils';

const ratio = getContrastRatio("#ffffff", "#000000"); // 21
```

### Utility Functions

#### `copyToClipboard(text: string): Promise<boolean>`
Copies text to clipboard.

**Parameters:**
- `text` (string) - Text to copy

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
import { copyToClipboard } from './utils';

const success = await copyToClipboard("Hello World");
if (success) {
  console.log("Copied!");
}
```

#### `showToast(message: string, type?: ToastType): void`
Shows a toast notification.

**Parameters:**
- `message` (string) - Toast message
- `type` (ToastType, optional) - Toast type: "success" | "error" | "warning" | "info" (default: "info")

**Example:**
```typescript
import { showToast } from './utils';

showToast("Theme saved!", "success");
```

### Presets API

#### `getPresets(): Preset[]`
Gets all saved presets.

**Returns:** `Preset[]` - Array of preset objects

**Preset Type:**
```typescript
interface Preset {
  id: string;
  name: string;
  themeId: string;
  layout: LayoutState;
  createdAt: string;
}

interface LayoutState {
  density: 'compact' | 'cozy' | 'spacious';
  borders: 'on' | 'off';
  shadows: 'on' | 'off';
  'sidebar-bg': 'gradient' | 'solid';
  header: 'show' | 'hide';
}
```

**Example:**
```typescript
import { getPresets } from './app';
import type { Preset } from './types';

const presets: Preset[] = getPresets();
```

#### `savePreset(preset: Omit<Preset, 'id' | 'createdAt'>): Preset`
Saves a preset to localStorage.

**Parameters:**
- `preset` (Omit<Preset, 'id' | 'createdAt'>) - Preset object without id and createdAt

**Returns:** `Preset` - Saved preset with ID and createdAt

#### `loadPreset(preset: Preset): void`
Loads a preset (sets theme and layout).

**Parameters:**
- `preset` (Preset) - Preset object

## CSS Custom Properties API

### Color Tokens

All themes define these color tokens:

```css
--bg: /* Main background */
--bg-alt: /* Alternate background */
--surface: /* Card/component background */
--surface-alt: /* Elevated surface */
--border: /* Primary border */
--border-soft: /* Subtle border */
--accent: /* Primary accent */
--accent-alt: /* Secondary accent */
--accent-soft: /* Subtle accent background */
--accent-boost: /* High-contrast accent text */
--text: /* Primary text */
--muted: /* Muted/secondary text */
--danger: /* Error/destructive */
--success: /* Success/positive */
--border-gradient-from: /* Gradient start */
--border-gradient-to: /* Gradient end */
```

### Layout Tokens

```css
--layout-sidebar-width: /* Sidebar width */
--layout-sidebar-padding: /* Sidebar padding */
--layout-preview-padding: /* Main content padding */
--layout-preview-gap: /* Gap between cards */
--layout-card-padding-x: /* Card horizontal padding */
--layout-card-padding-y: /* Card vertical padding */
--layout-card-gap: /* Gap between card content */
```

### Shape & Timing Tokens

```css
--radius-sm: /* Small border radius */
--radius-md: /* Medium border radius */
--radius-lg: /* Large border radius */
--border-radius-card: /* Card border radius */
--shadow-soft: /* Subtle shadow */
--shadow-strong: /* Strong shadow */
--transition-fast: /* Fast transition timing */
--transition-med: /* Medium transition timing */
--border-width: /* Standard border width */
```

## Component Classes

### Buttons
- `.btn` - Base button
- `.btn-primary` - Primary action
- `.btn-outline` - Outlined style
- `.btn-ghost` - Transparent background
- `.btn-subtle` - Subtle background
- `.btn-sm` - Small size
- `.btn-danger` - Danger variant
- `.btn-success` - Success variant
- `.btn-loading` - Loading state

### Cards
- `.card` - Card container
- `.card-header` - Card header
- `.card-body` - Card content
- `.card-span` - Full-width in grid

### Inputs
- `.field` - Form field wrapper
- `.field-label` - Label text
- `.input` - Text input, select, textarea
- `.input-error` - Error state
- `.input-success` - Success state
- `.field-error` - Error field wrapper
- `.field-success` - Success field wrapper
- `.field-error-message` - Error message

### Form Controls
- `.checkbox-label` - Checkbox wrapper
- `.radio-label` - Radio wrapper
- `.toggle` - Toggle wrapper
- `.toggle-track` - Toggle track
- `.toggle-thumb` - Toggle thumb
- `.toggle-label` - Toggle label

### Progress & Loading
- `.progress-bar` - Progress container
- `.progress-fill` - Progress fill
- `.loading-spinner` - Loading spinner

### Badges
- `.badge` - Base badge
- `.badge-alt` - Alternate accent badge
- `.badge-soft` - Soft background badge

### Typography
- `.text-muted` - Muted text color
- `.text-stack` - Text stack container

## Data Attributes

### Theme Selection
```html
<html data-theme="errl-core">
```

### Layout Controls
```html
<html 
  data-density="cozy"
  data-borders="on"
  data-shadows="on"
  data-sidebar-bg="gradient"
  data-header="show">
```

## Events

### Theme Change
Theme changes update the `data-theme` attribute on `<html>`. You can listen for changes:

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      console.log('Theme changed to:', document.documentElement.getAttribute('data-theme'));
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});
```

## Constants

### THEMES Array
Array of all available themes:

```typescript
import { THEMES } from './constants';
import type { Theme } from './types';

// THEMES is a readonly array of Theme objects
const themes: readonly Theme[] = THEMES;
// [
//   { id: "errl-core", label: "Errl Core" },
//   { id: "errl-deepsea", label: "Deep Sea" },
//   // ... 25 themes total
// ]
```

## Browser Compatibility

### Required Features
- CSS Custom Properties (all modern browsers)
- LocalStorage API
- Clipboard API (with fallback)
- MutationObserver (for theme change events)
- ES2020+ JavaScript features (for TypeScript compilation)

### Supported Browsers
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

## Error Handling

All functions include error handling:
- Invalid theme IDs return default theme
- Invalid colors return null from contrast functions
- Clipboard failures fall back to execCommand
- Import validation shows clear error messages

