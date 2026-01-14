# Project Structure Documentation

**Project:** ai-studio-gallery
**Last Updated:** 2026-01-09

## Directory Structure

```
ai-studio-gallery/
├── index.html                # Gallery index page with grid layout
├── README.md                 # Project overview
├── INDEX.md                  # Workspace index
├── PROJECT_STATUS.md         # Project status tracking
├── DEPLOY.md                 # Deployment guide
│
├── *.html                    # 27 standalone HTML demo files
│   ├── analog-liquid-light-projector.html
│   ├── bioluminescent-deep.html
│   ├── cosmic-tapestry.html
│   ├── deep-bioluminescence.html
│   ├── deep-liquid-drops.html
│   ├── design-system-switcher.html
│   ├── design-system-switcher-fixed.html
│   ├── flash-ui-bioluminescent-mineral-drip.html
│   ├── flash-ui-chromatic-resin-sedimentation.html
│   ├── flash-ui-entering-the-void-molten-dichroic.html
│   ├── flash-ui-errl-prismatic-gateway.html
│   ├── flash-ui-prism-threshold-interface.html
│   ├── flash-ui-prismatic-mercury-spec-sheet.html
│   ├── flash-ui-recursive-prismatic-diffraction.html
│   ├── full-screen-lava-lamp.html
│   ├── lava-lamp-projector.html
│   ├── liquid-light-projector.html
│   ├── living-liquid-gentle-flow.html
│   ├── neon-void-tarot.html
│   ├── oil-and-water-projector.html
│   ├── organic-light-drops.html
│   ├── quad-core-fluid-simulation.html
│   ├── recursive-fractal-orchard.html
│   ├── sentient-shard-swarm.html
│   ├── vaporwave-hyperspace-voxel-tunnel.html
│   └── walking-errl-loader.html
│
├── thumbnails/               # PNG thumbnail images
│   ├── *.png                 # 37 PNG thumbnail files
│   └── (one per demo file)
│
├── thumbgen/                 # Thumbnail generation tool
│   ├── package.json          # Playwright dependency
│   ├── generate-thumbs.js    # Thumbnail generation script
│   ├── .npm-cache/           # npm cache directory
│   └── .npm-logs/            # npm logs directory
│
├── generate-index.js         # Optional script to generate index.html
│
└── docs/                     # Documentation
    └── project-structure.md  # This file
```

## File Organization

### Core Files

- **Entry Point:** `index.html` - Gallery index page with grid layout
- **Demo Files:** 27 standalone HTML files, each containing a complete visual effect demo
- **Thumbnails:** 37 PNG thumbnail images (one per demo)
- **Tools:** Thumbnail generation tool in `thumbgen/` directory

### Documentation

- **Root Documentation:** 
  - `README.md` - Project overview and quick start guide
  - `INDEX.md` - Workspace index
  - `PROJECT_STATUS.md` - Project status tracking
  - `DEPLOY.md` - Deployment instructions

- **docs/ directory:** `docs/project-structure.md` (this file)

### Build and Distribution

- **No Build Required:** All files are static and ready to serve
- **Node Modules:** Only in `thumbgen/` directory (optional, for thumbnail generation)
- **No Dependencies:** Demo files are pure HTML/CSS/JS with no external dependencies

## Key Directories

### Root Directory - HTML Demo Files

**27 Standalone HTML Files:**
Each HTML file is completely self-contained and includes:
- All CSS styles (inline or in `<style>` tag)
- All JavaScript code (inline or in `<script>` tag)
- Canvas or WebGL code for graphics
- No external dependencies (no CDN links, no external resources)
- Can be opened directly in a browser or served via HTTP

**Demo Categories:**
- **Liquid Light Projectors:** `analog-liquid-light-projector.html`, `lava-lamp-projector.html`, `liquid-light-projector.html`
- **Bioluminescent Effects:** `bioluminescent-deep.html`, `deep-bioluminescence.html`, `organic-light-drops.html`
- **Flash UI Components:** `flash-ui-*.html` (7 files)
- **Fractal Visualizations:** `recursive-fractal-orchard.html`, `sentient-shard-swarm.html`
- **Vaporwave Effects:** `vaporwave-hyperspace-voxel-tunnel.html`
- **Other Effects:** Various other creative visual effects

### `index.html` - Gallery Index Page

The main gallery page that provides:

- **Grid Layout:** Visual grid of all demos with thumbnails
- **Thumbnail Display:** Each demo shown with its thumbnail image
- **Navigation:** Direct links to each HTML demo file
- **Styling:** Dark theme with gradient background
- **Responsive Design:** Works on desktop, tablet, and mobile

**Structure:**
- Header with title and description
- Grid container for demo cards
- Each card shows thumbnail, title, and link
- CSS included inline in `<style>` tag

### `thumbnails/` - Thumbnail Images

**37 PNG Files:**
- One thumbnail per HTML demo file
- Named to match demo file names (e.g., `analog-liquid-light-projector.png`)
- Generated automatically using Playwright screenshot tool
- Used by `index.html` for gallery display

**Generation:**
- Thumbnails are generated using the tool in `thumbgen/` directory
- Each thumbnail is a screenshot of the demo rendered in a headless browser
- Dimensions are standardized for consistent gallery display

### `thumbgen/` - Thumbnail Generation Tool

**Tools for generating thumbnails:**

- **package.json:** Defines Playwright as dependency
- **generate-thumbs.js:** Main script that:
  - Opens each HTML file in Playwright
  - Takes screenshot
  - Saves as PNG to `thumbnails/` directory
  - Handles errors gracefully

**Usage:**
```bash
cd thumbgen
npm install
node generate-thumbs.js
```

**Dependencies:**
- Playwright (for headless browser automation)
- Node.js (for running the script)

### `generate-index.js` - Optional Index Generator

Optional script that can generate `index.html` automatically:

- Scans directory for HTML files
- Generates gallery index with thumbnails
- Creates grid layout
- Adds links and styling

**Note:** This file may not be actively used if `index.html` is maintained manually.

## File Naming Conventions

- **HTML Files:** kebab-case (e.g., `liquid-light-projector.html`)
- **Thumbnails:** Same as HTML file name but with `.png` extension (e.g., `liquid-light-projector.png`)
- **JavaScript Files:** kebab-case (e.g., `generate-thumbs.js`, `generate-index.js`)
- **Documentation:** UPPERCASE (e.g., `README.md`, `INDEX.md`, `PROJECT_STATUS.md`)

## Technical Details

### HTML Demo Structure

Each HTML demo file typically contains:

1. **HTML Structure:**
   - `<html>`, `<head>`, `<body>` tags
   - Canvas element (for graphics rendering)
   - Or WebGL context (for 3D graphics)
   - Minimal HTML structure (content is primarily JavaScript-driven)

2. **CSS:**
   - All styles inline in `<style>` tag
   - Dark backgrounds (typically)
   - Full-screen canvas styling
   - Responsive design considerations

3. **JavaScript:**
   - All code inline in `<script>` tag
   - Canvas or WebGL rendering code
   - Animation loops (requestAnimationFrame)
   - Interactive event handlers (mouse, keyboard)
   - No external libraries or dependencies

### Technologies Used

- **Canvas API:** 2D graphics rendering
- **WebGL:** 3D graphics rendering (in some demos)
- **JavaScript:** ES6+ syntax
- **CSS:** CSS3 with modern features
- **HTML5:** Modern HTML5 structure

### Performance Considerations

- Each demo is optimized for smooth 60fps animation
- Uses `requestAnimationFrame` for animation loops
- Efficient canvas rendering techniques
- Minimal DOM manipulation
- Optimized JavaScript calculations

## Deployment Structure

When deployed, the structure remains the same:

1. All HTML files are served as-is
2. Thumbnails are served as static assets
3. No build step required
4. Can be hosted on any static hosting service
5. No server-side processing needed

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API support required
- WebGL support needed for some demos
- JavaScript enabled required
- No polyfills needed (modern browser features used)
