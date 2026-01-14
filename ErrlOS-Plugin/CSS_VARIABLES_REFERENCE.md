# Errl OS CSS Variables Reference

**Last Updated:** 2025-12-15

This document lists all CSS custom properties (variables) used in the Errl OS plugin stylesheet. These variables enable theme customization and maintain consistency across the design system.

**Note:** The plugin is fully self-contained and includes all design system variables. It does not depend on external design system files.

## Grid Properties

### `--errl-grid-min-width`
- **Default:** `280px`
- **Usage:** Minimum width for grid items (cards)
- **Used in:** `.errl-grid` and all grid selectors
- **Override:** Change to adjust card minimum width

### `--errl-grid-gap`
- **Default:** `16px`
- **Usage:** Gap between grid items
- **Used in:** `.errl-grid` and all grid selectors
- **Override:** Change to adjust spacing between cards

### `--errl-grid-margin`
- **Default:** `16px`
- **Usage:** Top and bottom margin for grid container
- **Used in:** `.errl-grid` and all grid selectors
- **Override:** Change to adjust grid container margins

## Card Properties

### `--errl-card-padding`
- **Default:** `14px`
- **Usage:** Internal padding for cards
- **Used in:** `.errl-card`
- **Override:** Change to adjust card padding

### `--errl-card-border-radius`
- **Default:** `18px`
- **Usage:** Border radius for card corners
- **Used in:** `.errl-card` and `.errl-card::before`
- **Override:** Change to adjust card roundness

### `--errl-card-shadow`
- **Default:** `0 10px 30px rgba(0, 0, 0, 0.25)`
- **Usage:** Box shadow for cards (default state)
- **Used in:** `.errl-card`
- **Override:** Change to adjust card shadow

### `--errl-card-shadow-hover`
- **Default:** `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Usage:** Box shadow for cards (hover state)
- **Used in:** `.errl-card:hover`
- **Override:** Change to adjust hover shadow

## Button Properties

### `--errl-btn-padding`
- **Default:** `8px 16px`
- **Usage:** Padding for buttons in markdown views
- **Used in:** `.markdown-preview-view .errl-btn`, `.markdown-reading-view .errl-btn`, etc.
- **Override:** Change to adjust button padding in reading/editing modes

### `--errl-btn-padding-universal`
- **Default:** `8px 10px`
- **Usage:** Padding for buttons in universal context
- **Used in:** `.errl-btn` (base selector)
- **Override:** Change to adjust button padding in other contexts

### `--errl-btn-border-radius`
- **Default:** `8px`
- **Usage:** Border radius for buttons in markdown views
- **Used in:** `.markdown-preview-view .errl-btn`, `.markdown-reading-view .errl-btn`, etc.
- **Override:** Change to adjust button roundness in reading/editing modes

### `--errl-btn-border-radius-universal`
- **Default:** `12px`
- **Usage:** Border radius for buttons in universal context
- **Used in:** `.errl-btn` (base selector)
- **Override:** Change to adjust button roundness in other contexts

### `--errl-btn-font-size`
- **Default:** `0.9rem`
- **Usage:** Font size for buttons
- **Used in:** All button selectors
- **Override:** Change to adjust button text size

### `--errl-btn-font-weight`
- **Default:** `500`
- **Usage:** Font weight for buttons
- **Used in:** All button selectors
- **Override:** Change to adjust button text weight

### `--errl-btn-margin`
- **Default:** `4px 4px 4px 0`
- **Usage:** Margin for buttons in markdown views
- **Used in:** `.markdown-preview-view .errl-btn`, `.markdown-reading-view .errl-btn`, etc.
- **Override:** Change to adjust button spacing in reading/editing modes

### `--errl-btn-margin-universal`
- **Default:** `10px 10px 0 0`
- **Usage:** Margin for buttons in universal context
- **Used in:** `.errl-btn` (base selector)
- **Override:** Change to adjust button spacing in other contexts

## Typography Properties

### `--errl-card-title-font-size`
- **Default:** `1.05rem`
- **Usage:** Font size for card titles
- **Used in:** `.errl-card-title` and all card title selectors
- **Override:** Change to adjust card title size

### `--errl-card-title-font-weight`
- **Default:** `600`
- **Usage:** Font weight for card titles
- **Used in:** `.errl-card-title` and all card title selectors
- **Override:** Change to adjust card title weight

### `--errl-card-title-margin`
- **Default:** `4px`
- **Usage:** Bottom margin for card titles
- **Used in:** `.errl-card-title` and all card title selectors
- **Override:** Change to adjust spacing below card titles

### `--errl-card-sub-font-size`
- **Default:** `0.9rem`
- **Usage:** Font size for card subtitles
- **Used in:** `.errl-card-sub` and all card subtitle selectors
- **Override:** Change to adjust card subtitle size

### `--errl-card-sub-margin`
- **Default:** `12px`
- **Usage:** Bottom margin for card subtitles
- **Used in:** `.errl-card-sub` and all card subtitle selectors
- **Override:** Change to adjust spacing below card subtitles

### `--errl-placeholder-font-size`
- **Default:** `0.9rem`
- **Usage:** Font size for placeholder text
- **Used in:** `.errl-pulse-placeholder` and all placeholder selectors
- **Override:** Change to adjust placeholder text size

### `--errl-placeholder-margin`
- **Default:** `8px`
- **Usage:** Top margin for placeholder text
- **Used in:** `.errl-pulse-placeholder` and all placeholder selectors
- **Override:** Change to adjust spacing above placeholder text

## Transition Properties

### `--errl-transition-fast`
- **Default:** `0.08s ease`
- **Usage:** Fast transitions (button transforms)
- **Used in:** `.errl-btn` (universal)
- **Override:** Change to adjust fast animation speed

### `--errl-transition-normal`
- **Default:** `0.15s ease`
- **Usage:** Normal transitions (button filters)
- **Used in:** `.errl-btn` (universal)
- **Override:** Change to adjust normal animation speed

### `--errl-transition-button`
- **Default:** `0.2s ease`
- **Usage:** Button transitions in markdown views
- **Used in:** `.markdown-preview-view .errl-btn`, `.markdown-reading-view .errl-btn`, etc.
- **Override:** Change to adjust button animation speed

### `--errl-transition-card`
- **Default:** `0.2s ease`
- **Usage:** Card transitions (box shadow)
- **Used in:** `.errl-card`
- **Override:** Change to adjust card animation speed

## Design System Variables

The plugin includes all necessary design system variables for full compatibility. These variables are self-contained within the plugin and do not require external design system files.

### Core Colors

### `--color-background`
- **Default:** `rgba(20, 20, 20, 0.9)`
- **Usage:** Base background color
- **Used in:** Cards, panels
- **Alias:** `--surface` (maps to `--color-background`)

### `--color-border`
- **Default:** `#00ffff` (cyan)
- **Usage:** Border color for cards and buttons
- **Used in:** `.errl-card`, `.errl-btn`
- **Alias:** `--border` (maps to `--color-border`)

### `--color-accent`
- **Default:** `#00ffff` (cyan)
- **Usage:** Accent color for interactive elements
- **Used in:** Buttons, highlights
- **Alias:** `--accent` (maps to `--color-accent`)

### `--color-text`
- **Default:** `#ffffff` (white)
- **Usage:** Primary text color
- **Used in:** Buttons, text elements
- **Alias:** `--text` (maps to `--color-text`)

### `--color-text-faint`
- **Default:** `#999999`
- **Usage:** Muted/secondary text color
- **Used in:** Subtitles, placeholders, status indicators

### Brand Colors

### `--errl-cyan`
- **Default:** `#00ffff`
- **Usage:** Errl brand cyan color
- **Used in:** Gradient borders, status indicators, accents

### `--errl-magenta`
- **Default:** `#ff00ff`
- **Usage:** Errl brand magenta color
- **Used in:** Gradient borders, accents

### Gradient Border Colors

### `--border-gradient-from`
- **Default:** `var(--errl-cyan)` → `#00ffff`
- **Usage:** Start color for gradient borders
- **Used in:** `.errl-card::before` gradient effect

### `--border-gradient-to`
- **Default:** `var(--errl-magenta)` → `#ff00ff`
- **Usage:** End color for gradient borders
- **Used in:** `.errl-card::before` gradient effect

### Spacing (Design System Compatible)

### `--spacing-panel-padding`
- **Default:** `16px`
- **Usage:** Padding for panels and cards
- **Used in:** `.errl-card`
- **Fallback:** Falls back to `--errl-card-padding` (14px)

### `--spacing-button-padding`
- **Default:** `10px 20px`
- **Usage:** Padding for buttons
- **Used in:** `.errl-btn` (universal)
- **Fallback:** Falls back to `--errl-btn-padding-universal` (8px 10px)

### Typography (Design System Compatible)

### `--font-size-sm`
- **Default:** `14px`
- **Usage:** Small font size
- **Used in:** Buttons, form elements
- **Fallback:** Falls back to `--errl-btn-font-size` (0.9rem)

### `--font-weight-medium`
- **Default:** `500`
- **Usage:** Medium font weight
- **Used in:** Buttons, emphasized text
- **Fallback:** Falls back to `--errl-btn-font-weight` (500)

### Borders (Design System Compatible)

### `--border-radius`
- **Default:** `8px`
- **Usage:** Base border radius
- **Used in:** Cards, buttons
- **Fallback:** Falls back to `--errl-card-border-radius` (18px) or `--errl-btn-border-radius` (8px) depending on context

### Shadows (Design System Compatible)

### `--shadow-panel`
- **Default:** `0 4px 20px rgba(0, 255, 255, 0.3)`
- **Usage:** Shadow for panels and cards
- **Used in:** `.errl-card`
- **Fallback:** Falls back to `--errl-card-shadow`

### Animations (Design System Compatible)

### `--animation-duration-fast`
- **Default:** `0.2s`
- **Usage:** Fast animation duration
- **Used in:** Button transforms, card transitions
- **Fallback:** Falls back to `--errl-transition-fast` (0.08s ease)

### `--animation-duration-normal`
- **Default:** `0.3s`
- **Usage:** Normal animation duration
- **Used in:** Button filters, transitions
- **Fallback:** Falls back to `--errl-transition-normal` (0.15s ease)

### `--animation-easing-ease`
- **Default:** `ease`
- **Usage:** Easing function for animations
- **Used in:** All transitions
- **Fallback:** Falls back to `ease` (hardcoded)

## How to Override Variables

### Method 1: CSS Snippet (Recommended)

Create a CSS snippet in Obsidian:

```css
/* File: .obsidian/snippets/errl-os-custom.css */

:root {
  --errl-grid-min-width: 300px;  /* Larger cards */
  --errl-grid-gap: 20px;          /* More spacing */
  --errl-card-border-radius: 12px; /* Less rounded */
}
```

Then enable the snippet in Obsidian: Settings → Appearance → CSS snippets

### Method 2: Theme Override

If your Obsidian theme supports CSS variable overrides, add to your theme's CSS:

```css
:root {
  --errl-grid-min-width: 300px;
  --errl-grid-gap: 20px;
}
```

### Method 3: Plugin CSS Modification

Edit `styles.css` directly in the plugin directory (not recommended - will be overwritten on updates).

## Variable Fallbacks

All CSS variables have fallback values defined in the stylesheet. If a variable is not defined, the fallback value is used. This ensures the plugin works even if variables are not set.

Example:
```css
gap: var(--errl-grid-gap, 16px);
/* Uses --errl-grid-gap if defined, otherwise uses 16px */
```

## Integration with Errl Design System

The plugin is **fully self-contained** and includes all design system variables. It does not require external design system files to function.

### Variable Fallback Chain

The plugin uses a comprehensive fallback chain system:

1. **Design System Variables** (if defined externally):
   - `--surface` → `--color-background` → `--background-secondary` (Obsidian)
   - `--border` → `--color-border` → `--background-modifier-border` (Obsidian)
   - `--accent` → `--color-accent` → `--interactive-normal` (Obsidian)
   - `--text` → `--color-text` → `--text-normal` (Obsidian)

2. **Plugin-Specific Variables** (always defined):
   - `--spacing-panel-padding` → `--errl-card-padding` → `14px`
   - `--spacing-button-padding` → `--errl-btn-padding-universal` → `8px 10px`
   - `--border-radius` → `--errl-card-border-radius` → `18px` (for cards)
   - `--border-radius` → `--errl-btn-border-radius` → `8px` (for buttons)
   - `--animation-duration-fast` → `--errl-transition-fast` → `0.08s ease`
   - `--animation-duration-normal` → `--errl-transition-normal` → `0.15s ease`

3. **Obsidian Theme Variables** (final fallback):
   - All variables ultimately fall back to Obsidian's built-in theme variables if design system variables are not available.

This three-tier fallback system ensures the plugin works in any environment while respecting design system values when available.

## Best Practices

1. **Use CSS snippets** for customization (preserves updates)
2. **Test changes** in both reading and editing modes
3. **Keep values proportional** (e.g., if you increase grid gap, consider increasing card padding)
4. **Document your overrides** if working in a team

## See Also

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Architecture details
- [styles.css](styles.css) - Full stylesheet with variable definitions

