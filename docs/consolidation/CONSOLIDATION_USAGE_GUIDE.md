# Consolidation Infrastructure - Usage Guide

**Date:** 2026-01-09  
**Status:** ✅ Ready to Use  
**Purpose:** Practical guide for using the consolidated infrastructure

---

## 🚀 Quick Start

This guide shows you how to actually use the infrastructure created during consolidation.

---

## 🎨 Using Themes

### Option 1: Direct Import (TypeScript/React)

```typescript
// Import theme functions
import { getThemeColors, getThemeNames, hasTheme } from '@/shared/design-system';

// Get all available theme names
const allThemes = getThemeNames();
console.log(allThemes); // ['errl-core', 'errl-deepsea', 'errl-sunset', ...]

// Get colors for a specific theme
const colors = getThemeColors('errl-core');
if (colors) {
  console.log(colors.bg);        // '#02070a'
  console.log(colors.accent);    // '#34e1ff'
  console.log(colors.text);      // '#ecf9ff'
}

// Check if theme exists
if (hasTheme('errl-void')) {
  const voidColors = getThemeColors('errl-void');
  // Use theme colors
}
```

### Option 2: Use in React Component

```tsx
import { getThemeColors, type ThemeColors } from '@/shared/design-system';
import { useState, useEffect } from 'react';

function ThemedComponent() {
  const [themeName, setThemeName] = useState('errl-core');
  const [colors, setColors] = useState<ThemeColors | null>(null);

  useEffect(() => {
    const themeColors = getThemeColors(themeName);
    setColors(themeColors);
  }, [themeName]);

  if (!colors) return null;

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      padding: '1rem'
    }}>
      <h2 style={{ color: colors.accent }}>Themed Component</h2>
      <button
        onClick={() => setThemeName('errl-void')}
        style={{
          backgroundColor: colors.accent,
          color: colors.bg
        }}
      >
        Change Theme
      </button>
    </div>
  );
}
```

### Option 3: Apply Theme to CSS Variables

```typescript
import { getThemeColors } from '@/shared/design-system';

function applyThemeToDocument(themeName: string) {
  const colors = getThemeColors(themeName);
  if (!colors) return;

  const root = document.documentElement;
  root.style.setProperty('--theme-bg', colors.bg);
  root.style.setProperty('--theme-bg-alt', colors.bgAlt);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-border', colors.border);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-muted', colors.muted);
}

// Use it
applyThemeToDocument('errl-core');
```

### Available Themes (25 total)

1. `errl-core` (default)
2. `errl-deepsea`
3. `errl-sunset`
4. `errl-forest`
5. `errl-night-sky`
6. `errl-neon-dream`
7. `errl-void`
8. `errl-cotton-candy`
9. `errl-gold`
10. `errl-holographic`
11. `errl-lava-lamp`
12. `errl-crystal-cave`
13. `errl-pastel-gloom`
14. `errl-aurora`
15. `errl-terminal`
16. `errl-acid-rain`
17. `errl-bubblegum`
18. `errl-midnight-ocean`
19. `errl-desert-dusk`
20. `errl-mint-choc`
21. `errl-plasma`
22. `errl-rainbow-orb`
23. `errl-ice`
24. `errl-bruised-peach`
25. `errl-mono`

---

## 📦 Using Gallery Template

### Step 1: Copy Template

```bash
cp shared/templates/gallery/index.html.template my-gallery/index.html
```

### Step 2: Customize

Edit `index.html` and update:
- Title and description
- Component data in the JavaScript section
- Color scheme (CSS variables)
- Grid columns (CSS)

### Step 3: Add Your Components

Update the `components` array:

```javascript
const components = [
  {
    name: 'My Component',
    category: 'UI',
    tags: ['button', 'interactive'],
    thumbnail: 'path/to/thumbnail.png',
    description: 'A great component',
    demoUrl: 'path/to/demo.html'
  },
  // ... more components
];
```

### Step 4: Generate Thumbnails (Optional)

```bash
cd my-gallery
node ../../shared/tools/thumbgen/generate-thumbs.js ./components ./thumbnails
```

### Features Included
- ✅ Dark theme (customizable)
- ✅ Responsive grid layout
- ✅ Search functionality
- ✅ Category filtering
- ✅ Tag filtering
- ✅ Hover effects
- ✅ Modal preview
- ✅ Keyboard navigation

---

## 🎬 Using Scene Templates

### Available Templates

1. **LAB_INTRO.json** - Laboratory introduction scene
2. **GRANDMA_TV.json** - Grandma's TV scene
3. **FESTIVAL_STAGE.json** - Festival stage scene
4. **VOID_ORBS.json** - Void orbs scene
5. **SHRINE_ALTAR.json** - Shrine altar scene

### Usage in multi-tool-app

```typescript
import LAB_INTRO from '@/shared/templates/scenes/LAB_INTRO.json';

// Load template into scene
function loadSceneTemplate() {
  const scene = {
    ...LAB_INTRO,
    // Override specific properties if needed
    camera: { ...LAB_INTRO.camera, zoom: 1.2 }
  };
  
  // Use scene in your application
  setScene(scene);
}
```

### Usage in Other Projects

```typescript
// Import scene template
import FESTIVAL_STAGE from '@/shared/templates/scenes/FESTIVAL_STAGE.json';

// Adapt to your scene format
const myScene = {
  name: FESTIVAL_STAGE.name,
  description: FESTIVAL_STAGE.description,
  assets: FESTIVAL_STAGE.assets,
  // ... adapt to your schema
};
```

### Template Structure

Each template includes:
- Scene metadata (name, description)
- Asset references
- Layer configuration
- Transform data
- Camera settings
- Effects configuration

---

## ⚙️ Using Configuration Templates

### Package.json Template

**Location:** `shared/config/package.json.template`

```bash
# Copy to new project
cp shared/config/package.json.template my-project/package.json

# Edit and customize
# - Update project name
# - Update description
# - Add project-specific dependencies
```

**Standardized Versions:**
- React: `^19.2.1`
- Vite: `^7.2.4`
- Zustand: `^5.0.8`
- TailwindCSS: `^4.1.17`
- TypeScript: `^5.7.2`

### Vite Config Template

**Location:** `shared/config/vite.config.template.ts`

```bash
# Copy to new project
cp shared/config/vite.config.template.ts my-project/vite.config.ts

# Customize for your project
# - Update alias paths
# - Add plugins
# - Configure build options
```

### TypeScript Config Template

**Location:** `shared/config/tsconfig.json.template`

```bash
# Copy to new project
cp shared/config/tsconfig.json.template my-project/tsconfig.json

# Customize if needed
# - Update paths
# - Adjust compiler options
```

---

## 📝 Using Documentation Templates

### README Template

**Location:** `_Resources/_Templates/README.md.template`

```bash
# Copy to new project
cp _Resources/_Templates/README.md.template my-project/README.md

# Fill in placeholders:
# - [Project Name]
# - [Project Description]
# - [Features List]
# - [Installation Instructions]
# - [Usage Examples]
```

### INDEX Template

**Location:** `_Resources/_Templates/INDEX.md.template`

```bash
# Copy to new project
cp _Resources/_Templates/INDEX.md.template my-project/INDEX.md

# Fill in:
# - Project metadata
# - Directory structure
# - Key files explanation
```

### PROJECT_STATUS Template

**Location:** `_Resources/_Templates/PROJECT_STATUS.md.template`

```bash
# Copy to new project
cp _Resources/_Templates/PROJECT_STATUS.md.template my-project/PROJECT_STATUS.md

# Update:
# - Current status
# - What's working
# - What needs work
# - Next steps
```

---

## 🖼️ Using Thumbnail Generator

### Basic Usage

```bash
# Generate thumbnails for all components in a directory
node shared/tools/thumbgen/generate-thumbs.js ./components ./thumbnails
```

### With Options

```bash
# Custom viewport size
node shared/tools/thumbgen/generate-thumbs.js \
  --source ./components \
  --output ./thumbnails \
  --width 400 \
  --height 300
```

### Parameters

- `--source` or first argument: Source directory (default: `./components`)
- `--output` or second argument: Output directory (default: `./thumbnails`)
- `--width`: Viewport width (default: 300)
- `--height`: Viewport height (default: 200)

### Supported Formats

- HTML files (renders to PNG)
- SVG files (converts to PNG)
- Images (resizes to thumbnail)

---

## 📁 File Paths Reference

### Themes
```
shared/design-system/src/themes.ts
shared/design-system/src/index.ts (exports)
```

### Templates
```
shared/templates/gallery/index.html.template
shared/templates/scenes/*.json (5 files)
shared/config/*.template (3 files)
_Resources/_Templates/*.template (3 files)
```

### Tools
```
shared/tools/thumbgen/generate-thumbs.js
shared/tools/thumbgen/package.json
shared/tools/thumbgen/README.md
```

### Archive
```
_archive/deprecated/README.md (archive policy)
```

---

## 🔧 Integration Examples

### Example 1: New React Project

```bash
# 1. Create project
mkdir my-project && cd my-project

# 2. Copy config templates
cp ../shared/config/package.json.template ./package.json
cp ../shared/config/vite.config.template.ts ./vite.config.ts
cp ../shared/config/tsconfig.json.template ./tsconfig.json

# 3. Copy doc templates
cp ../_Resources/_Templates/README.md.template ./README.md
cp ../_Resources/_Templates/INDEX.md.template ./INDEX.md
cp ../_Resources/_Templates/PROJECT_STATUS.md.template ./PROJECT_STATUS.md

# 4. Install dependencies
npm install

# 5. Use themes
# In your component:
import { getThemeColors } from '@/shared/design-system';
const colors = getThemeColors('errl-core');
```

### Example 2: Add Gallery to Existing Project

```bash
# 1. Copy gallery template
cp ../shared/templates/gallery/index.html.template ./public/gallery.html

# 2. Generate thumbnails
node ../shared/tools/thumbgen/generate-thumbs.js ./components ./public/thumbnails

# 3. Update gallery.html with your component data
# Edit the JavaScript section with your components
```

### Example 3: Use Scene Template

```typescript
// In multi-tool-app or similar
import LAB_INTRO from '@/shared/templates/scenes/LAB_INTRO.json';

// Load as starting point
const initialScene = LAB_INTRO;

// Or adapt to your format
const adaptedScene = {
  layers: LAB_INTRO.layers.map(layer => ({
    ...layer,
    // Adapt properties
  }))
};
```

---

## ✅ Checklist: Setting Up New Project

- [ ] Copy `package.json.template` → `package.json`
- [ ] Copy `vite.config.template.ts` → `vite.config.ts`
- [ ] Copy `tsconfig.json.template` → `tsconfig.json`
- [ ] Copy `README.md.template` → `README.md`
- [ ] Copy `INDEX.md.template` → `INDEX.md`
- [ ] Copy `PROJECT_STATUS.md.template` → `PROJECT_STATUS.md`
- [ ] Fill in all placeholders
- [ ] Install dependencies: `npm install`
- [ ] Import themes if needed: `import { getThemeColors } from '@/shared/design-system'`
- [ ] Test that everything works

---

## 🎯 Quick Reference

### Import Themes
```typescript
import { getThemeColors, getThemeNames, hasTheme } from '@/shared/design-system';
```

### Get Theme Colors
```typescript
const colors = getThemeColors('errl-core');
```

### List All Themes
```typescript
const themes = getThemeNames();
```

### Check Theme Exists
```typescript
if (hasTheme('errl-void')) { /* ... */ }
```

### Generate Thumbnails
```bash
node shared/tools/thumbgen/generate-thumbs.js [source] [output]
```

---

## 📚 Additional Resources

- **Quick Reference:** `CONSOLIDATION_QUICK_REFERENCE.md`
- **Theme Integration Notes:** `theme-lab/THEME_INTEGRATION_NOTES.md`
- **Gallery Template README:** `shared/templates/gallery/README.md`
- **Scene Templates README:** `shared/templates/scenes/README.md`
- **Thumbnail Generator README:** `shared/tools/thumbgen/README.md`

---

## 🆘 Troubleshooting

### Themes not found?
- Check import path: `@/shared/design-system`
- Verify `shared/design-system/src/themes.ts` exists
- Check TypeScript path aliases in `tsconfig.json`

### Gallery template not working?
- Ensure all CSS variables are defined
- Check JavaScript console for errors
- Verify component data format matches template

### Thumbnail generator failing?
- Install dependencies: `cd shared/tools/thumbgen && npm install`
- Check file paths are correct
- Ensure source directory contains HTML/SVG files

---

**Status:** ✅ All infrastructure ready and tested  
**Last Updated:** 2026-01-09
