# Theme Lab Quick Reference

A quick reference guide for common tasks and shortcuts.

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Random theme |
| `E` | Export theme |
| `C` | Copy CSS |
| `V` | Validate theme |
| `T` | Token reference |
| `I` | Import theme |
| `P` | Save preset |
| `1-9` | Quick theme switch |
| `↑/↓` | Navigate themes |
| `Cmd/Ctrl + K` | Command palette |
| `Cmd/Ctrl + ?` | Show shortcuts |
| `Esc` | Close modals |

## 🎨 Theme Tokens

### Color Tokens
```css
--bg                    /* Main background */
--bg-alt               /* Alternate background */
--surface              /* Card/component background */
--surface-alt          /* Elevated surface */
--border               /* Primary border */
--border-soft          /* Subtle border */
--accent               /* Primary accent */
--accent-alt           /* Secondary accent */
--accent-soft          /* Subtle accent background */
--accent-boost         /* High-contrast accent text */
--text                 /* Primary text */
--muted                /* Muted/secondary text */
--danger               /* Error/destructive */
--success              /* Success/positive */
--border-gradient-from /* Gradient start */
--border-gradient-to   /* Gradient end */
```

### Layout Tokens
```css
--layout-sidebar-width
--layout-sidebar-padding
--layout-preview-padding
--layout-preview-gap
--layout-card-padding-x
--layout-card-padding-y
--layout-card-gap
```

### Shape & Timing
```css
--radius-sm
--radius-md
--radius-lg
--border-radius-card
--shadow-soft
--shadow-strong
--transition-fast
--transition-med
--border-width
```

## 🧩 Component Classes

### Buttons
- `.btn` - Base button
- `.btn-primary` - Primary action
- `.btn-outline` - Outlined
- `.btn-ghost` - Transparent
- `.btn-subtle` - Subtle background
- `.btn-sm` - Small size
- `.btn-danger` - Danger variant
- `.btn-success` - Success variant

### Cards
- `.card` - Card container
- `.card-header` - Card header
- `.card-body` - Card content
- `.card-span` - Full-width

### Inputs
- `.field` - Field wrapper
- `.field-label` - Label
- `.input` - Input element
- `.input-error` - Error state
- `.input-success` - Success state

### Form Controls
- `.checkbox-label` - Checkbox
- `.radio-label` - Radio
- `.toggle` - Toggle switch

### Badges
- `.badge` - Base badge
- `.badge-alt` - Accent badge
- `.badge-soft` - Soft badge

## 📋 Common Tasks

### Switch Theme
```
Click theme name OR
Press 1-9 OR
Press ↑/↓ OR
Press R for random
```

### Export Theme
```
Click "Export JSON" OR
Press E OR
Click "Copy CSS" OR
Press C
```

### Validate Theme
```
Click "Validate" OR
Press V
```

### Save Preset
```
Set theme + layout
Click "Save Preset" OR
Press P
Enter name
```

### Share Theme
```
Set theme + layout
Click "Share"
Copy URL
```

## 🎯 Layout Attributes

```html
<html 
  data-theme="errl-core"
  data-density="cozy"
  data-borders="on"
  data-shadows="on"
  data-sidebar-bg="gradient"
  data-header="show">
```

### Values
- `density`: `compact` | `cozy` | `spacious`
- `borders`: `on` | `off`
- `shadows`: `on` | `off`
- `sidebar-bg`: `gradient` | `solid`
- `header`: `show` | `hide`

## 💻 JavaScript API

### Set Theme
```javascript
setTheme("errl-core");
```

### Get Tokens
```javascript
const tokens = getComputedThemeTokens("errl-core");
```

### Set Layout
```javascript
setLayout("density", "spacious");
```

### Validate
```javascript
const results = validateTheme("errl-core");
```

### Export
```javascript
const json = getThemeAsJSON("errl-core");
const css = getThemeAsCSS("errl-core");
```

## 📤 Export Formats

1. **JSON** - Complete theme definition
2. **CSS** - Theme CSS block
3. **React** - Theme object
4. **Tailwind** - Config format
5. **styled-components** - Theme provider
6. **Emotion** - Emotion theme
7. **TypeScript** - With types

## ✅ Validation Checks

- Text on background contrast (4.5:1 AA, 7:1 AAA)
- Text on surface contrast
- Muted text readability
- Accent visibility
- Button text contrast
- Link color contrast
- Border visibility
- Background/surface similarity
- Missing tokens

## 🎨 25 Themes

1. Errl Core
2. Deep Sea
3. Sunset Fade
4. Forest Glow
5. Night Sky
6. Neon Dream
7. Void Core
8. Cotton Candy
9. Gold Flux
10. Holographic
11. Lava Lamp
12. Crystal Cave
13. Pastel Gloom
14. Aurora Veil
15. Terminal Green
16. Acid Rain
17. Bubblegum
18. Midnight Ocean
19. Desert Dusk
20. Mint Choc
21. Plasma
22. Rainbow Orb
23. Ice Shard
24. Bruised Peach
25. Mono Minimal

## 🔗 Quick Links

- [Full Features](./FEATURES.md)
- [API Reference](./API.md)
- [Usage Guide](./USAGE.md)
- [Architecture](./ARCHITECTURE.md)

---

**Tip:** Bookmark this page for quick access to common tasks!

