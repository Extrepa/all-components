# Theme Lab 🎨

A powerful design system playground for previewing, testing, and exporting theme tokens and UI components. Theme Lab provides 25 pre-built themes with a complete set of design tokens, all previewable in one interactive page.

## ✨ Features

- **25 Pre-built Themes** - From "Errl Core" to "Mono Minimal", each with unique color palettes
- **Integrated with Shared Design System** - Themes also available in `shared/design-system/src/themes.ts`
- **Live Preview** - See all components update instantly as you switch themes
- **Layout Controls** - Adjust density, borders, shadows, and more in real-time
- **Component Library** - Buttons, inputs, toggles, modals, typography, and more
- **Export & Copy** - Export themes as JSON, CSS, or copy tokens to clipboard
- **TypeScript** - Fully typed codebase for better developer experience
- **Vite** - Fast development server and build tool
- **Zero Runtime Dependencies** - Pure HTML, CSS, and TypeScript
- **Fully Responsive** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   This will start Vite dev server on http://localhost:3000

3. **Switch themes**
   - Click any theme in the left sidebar
   - Use the "🎲 Random" button for inspiration
   - Search themes using the search box

4. **Adjust layout**
   - Use the layout controls at the bottom of the sidebar
   - Try different density settings (Compact/Cozy/Spacious)
   - Toggle borders, shadows, and sidebar styles

5. **Export your theme**
   - Go to the "Export" tab
   - Export as JSON or copy CSS to clipboard
   - Generate code snippets for React, Tailwind, styled-components, Emotion, or TypeScript

## 📁 File Structure

```
theme-lab/
├── index.html              # Main HTML file
├── src/
│   ├── app.ts             # Main TypeScript application
│   ├── constants.ts       # Theme definitions and constants
│   ├── utils.ts           # Utility functions
│   └── types.ts           # TypeScript type definitions
├── shared/
│   ├── theme.css          # All 25 theme definitions + layout tokens
│   └── ui/
│       └── core.css       # Component styles wired to tokens
├── docs/                   # Comprehensive documentation
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Design Tokens

Theme Lab uses CSS custom properties (CSS variables) for all theming. Each theme defines:

### Color Tokens
- `--bg` - Main background
- `--bg-alt` - Alternate background
- `--surface` - Card/component background
- `--surface-alt` - Elevated surface (modals, etc.)
- `--border` - Primary border color
- `--border-soft` - Subtle border color
- `--accent` - Primary accent color
- `--accent-alt` - Secondary accent
- `--accent-soft` - Subtle accent background
- `--accent-boost` - High-contrast accent text
- `--text` - Primary text color
- `--muted` - Muted/secondary text
- `--danger` - Error/destructive actions
- `--success` - Success/positive actions

### Gradient Tokens
- `--border-gradient-from` - Start of border gradient
- `--border-gradient-to` - End of border gradient

### Layout Tokens
- `--layout-density` - compact | cozy | spacious
- `--layout-sidebar-width` - Sidebar width
- `--layout-preview-padding` - Main content padding
- `--layout-card-padding-x/y` - Card internal spacing
- And more...

### Shape & Timing Tokens
- `--radius-sm/md/lg` - Border radius sizes
- `--shadow-soft/strong` - Shadow definitions
- `--transition-fast/med` - Animation timings

## 🔌 Integration

### Plain HTML

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy the `dist/` folder contents to your project
3. Copy `shared/theme.css` to your project
4. Copy `shared/ui/core.css` to your project
5. Link all files in your HTML:

```html
<link rel="stylesheet" href="./shared/theme.css" />
<link rel="stylesheet" href="./shared/ui/core.css" />
<script type="module" src="./app.js"></script>
```

6. Set your theme on the `<html>` element:

```html
<html lang="en" data-theme="errl-core">
```

7. Use the component classes:

```html
<button class="btn btn-primary">Click me</button>
<div class="card">
  <div class="card-body">Content</div>
</div>
```

### React / Next.js

1. Import the CSS files:

```jsx
// In your _app.js or layout
import '../shared/theme.css';
import '../shared/ui/core.css';
```

2. Set theme dynamically:

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'errl-core');
  }, []);

  return (
    <button className="btn btn-primary">Click me</button>
  );
}
```

3. **Optional**: Use the exported TypeScript types:

```tsx
import type { ThemeTokens } from './types';

const tokens: ThemeTokens = {
  bg: '#02070a',
  accent: '#34e1ff',
  // ... etc
};
```

### Vue.js

1. Import in your main.js:

```js
import './shared/theme.css';
import './shared/ui/core.css';
```

2. Set theme in mounted hook:

```vue
<script>
export default {
  mounted() {
    this.$el.ownerDocument.documentElement.setAttribute('data-theme', 'errl-core');
  }
}
</script>
```

### Tailwind CSS

You can use Theme Lab tokens with Tailwind by configuring them in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
        // ... etc
      }
    }
  }
}
```

### CSS-in-JS (styled-components, emotion)

Extract tokens as a JavaScript object:

```js
const theme = {
  colors: {
    bg: 'var(--bg)',
    accent: 'var(--accent)',
    // ... etc
  }
};

// Use in styled-components
const Button = styled.button`
  background: ${props => props.theme.colors.accent};
`;
```

## 🎯 Available Themes

1. **Errl Core** - Default dark theme with cyan/pink accents
2. **Deep Sea** - Ocean blues and teals
3. **Sunset Fade** - Warm oranges and pinks
4. **Forest Glow** - Natural greens
5. **Night Sky** - Deep purples and blues
6. **Neon Dream** - Vibrant pink and cyan
7. **Void Core** - Pure black and white
8. **Cotton Candy** - Soft pinks and blues
9. **Gold Flux** - Warm golds and oranges
10. **Holographic** - Iridescent pastels
11. **Lava Lamp** - Red and yellow gradients
12. **Crystal Cave** - Cool blues and purples
13. **Pastel Gloom** - Muted pastels
14. **Aurora Veil** - Northern lights inspired
15. **Terminal Green** - Classic terminal aesthetic
16. **Acid Rain** - Bright lime and cyan
17. **Bubblegum** - Pink and yellow
18. **Midnight Ocean** - Deep blues and teals
19. **Desert Dusk** - Warm earth tones
20. **Mint Choc** - Mint and brown
21. **Plasma** - Purple and cyan
22. **Rainbow Orb** - Pink and cyan gradient
23. **Ice Shard** - Cool blues and whites
24. **Bruised Peach** - Peach and purple
25. **Mono Minimal** - Monochrome minimalism

## 🛠️ Adding a New Theme

1. Open `shared/theme.css`
2. Add a new theme block:

```css
:root[data-theme="your-theme-name"] {
  --bg: #02070a;
  --bg-alt: #041017;
  --surface: #071b25;
  /* ... define all tokens ... */
}
```

3. Add the theme to the `THEMES` array in `src/constants.ts`:

```typescript
export const THEMES: Theme[] = [
  // ... existing themes
  { id: "your-theme-name", label: "Your Theme Label" }
];
```

4. Restart the dev server - your theme will appear in the sidebar!

**Tip**: Use the Theme Editor (🎨 Edit button) to visually create themes, then export them as JSON.

## 📋 Component Classes

### Buttons
- `.btn` - Base button
- `.btn-primary` - Primary action
- `.btn-outline` - Outlined style
- `.btn-ghost` - Transparent background
- `.btn-subtle` - Subtle background
- `.btn-sm` - Small size

### Cards
- `.card` - Card container
- `.card-header` - Card header section
- `.card-body` - Card content section
- `.card-span` - Span full width in grid

### Inputs
- `.field` - Form field wrapper
- `.field-label` - Label text
- `.input` - Text input, select, textarea

### Toggles
- `.toggle` - Toggle wrapper
- `.toggle-track` - Toggle track
- `.toggle-thumb` - Toggle thumb
- `.toggle-label` - Toggle label

### Badges
- `.badge` - Base badge
- `.badge-alt` - Alternate accent badge
- `.badge-soft` - Soft background badge

### Typography
- `.text-muted` - Muted text color

## 🎛️ Layout Controls

Theme Lab includes layout controls that adjust spacing and appearance:

- **Density**: Compact, Cozy, or Spacious
- **Borders**: Toggle card and sidebar borders
- **Shadows**: Toggle card shadows
- **Sidebar Background**: Gradient or solid
- **Header**: Show or hide sidebar header

These are controlled via `data-*` attributes on the `<html>` element.

## 🔄 Exporting Themes

### Using the UI

1. Switch to the **Export** tab in the sidebar
2. Click **📤 JSON** to download theme as JSON file
3. Click **📋 CSS** to copy theme CSS to clipboard
4. Click **💻 Code Snippets** to generate code for:
   - React
   - Tailwind CSS
   - styled-components
   - Emotion
   - TypeScript

### Using the JavaScript API

```typescript
import { getThemeAsJSON, getThemeAsCSS, generateCodeSnippet } from './app';

// Export as JSON
const json = getThemeAsJSON('errl-core');
console.log(json);

// Export as CSS
const css = getThemeAsCSS('errl-core');
// Copy to clipboard or save to file

// Generate code snippet
const reactCode = generateCodeSnippet('react');
```

## 🐛 Troubleshooting

**Theme not applying?**
- Make sure `data-theme` attribute is set on `<html>`
- Check that `theme.css` is loaded before `core.css`
- Verify the theme ID matches exactly (case-sensitive)

**Components not styled?**
- Ensure `core.css` is loaded
- Check that you're using the correct class names
- Verify CSS custom properties are supported (all modern browsers)

**Layout controls not working?**
- Check that JavaScript is enabled
- Verify `data-*` attributes are being set on `<html>`
- Check browser console for errors

## 📝 License

This project is open source and available for use in your projects.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- More themes
- Additional components
- Better documentation
- Accessibility improvements
- Performance optimizations

## 📚 Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens (W3C)](https://www.w3.org/community/design-tokens/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Made with ❤️ for designers and developers who love beautiful, consistent design systems.**

