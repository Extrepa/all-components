# AI Studio Gallery

A static HTML gallery showcasing 27+ visual effect demos created with AI assistance. Each demo is a standalone HTML file with interactive visual effects including liquid light projectors, bioluminescent effects, Flash UI components, fractals, and vaporwave effects.

## Overview

AI Studio Gallery is a collection of visual effect demonstrations, each contained in a single HTML file. The gallery serves as both a showcase and a reference library for creative visual effects. All demos are ready to view and can be served as a static website.

## Features

- **27+ Standalone HTML Demos** - Each demo is self-contained
- **Visual Effect Categories:**
  - Liquid light projectors
  - Bioluminescent effects
  - Flash UI components
  - Fractal visualizations
  - Vaporwave effects
  - And more...
- **Thumbnail Gallery** - Visual index with thumbnails
- **Thumbnail Generation Tool** - Automated thumbnail generation via Playwright
- **No Dependencies** - Pure HTML, CSS, and JavaScript (no build required)

## Quick Start

### Serving the Gallery

The gallery is a static HTML site. Simply serve it with any HTTP server:

**Using Python:**
```bash
cd ai-studio-gallery
python3 -m http.server 8000
# Open http://localhost:8000
```

**Using Node.js http-server:**
```bash
cd ai-studio-gallery
npx http-server -p 8000
# Open http://localhost:8000
```

**Using PHP:**
```bash
cd ai-studio-gallery
php -S localhost:8000
# Open http://localhost:8000
```

**Using Vite (if you want hot reload):**
```bash
cd ai-studio-gallery
npm install -g vite
vite
# Open http://localhost:5173
```

## Project Contents

### HTML Demos

The gallery includes 27+ standalone HTML files, each demonstrating different visual effects:

- `analog-liquid-light-projector.html`
- `bioluminescent-deep.html`
- `cosmic-tapestry.html`
- `deep-bioluminescence.html`
- `deep-liquid-drops.html`
- `design-system-switcher.html`
- `design-system-switcher-fixed.html`
- `flash-ui-bioluminescent-mineral-drip.html`
- `flash-ui-chromatic-resin-sedimentation.html`
- `flash-ui-entering-the-void-molten-dichroic.html`
- `flash-ui-errl-prismatic-gateway.html`
- `flash-ui-prism-threshold-interface.html`
- `flash-ui-prismatic-mercury-spec-sheet.html`
- `flash-ui-recursive-prismatic-diffraction.html`
- `full-screen-lava-lamp.html`
- `lava-lamp-projector.html`
- `liquid-light-projector.html`
- `living-liquid-gentle-flow.html`
- `neon-void-tarot.html`
- `oil-and-water-projector.html`
- `organic-light-drops.html`
- `quad-core-fluid-simulation.html`
- `recursive-fractal-orchard.html`
- `sentient-shard-swarm.html`
- `vaporwave-hyperspace-voxel-tunnel.html`
- `walking-errl-loader.html`
- And more...

### Index Page

The `index.html` file provides a visual gallery with:
- Grid layout of all demos
- Thumbnails for each demo
- Direct links to each HTML file
- Search/filter functionality (if implemented)
- Responsive design

### Thumbnails

The `thumbnails/` directory contains PNG thumbnails for each demo, generated automatically for the gallery index.

### Thumbnail Generation Tool

The `thumbgen/` directory contains tools for generating thumbnails:

- Uses Playwright to capture screenshots
- Automatically generates thumbnails for all HTML demos
- Outputs PNG files to `thumbnails/` directory

To generate thumbnails:
```bash
cd thumbgen
npm install
node generate-thumbs.js
```

## Project Structure

```
ai-studio-gallery/
├── index.html                # Gallery index page
├── *.html                    # Individual demo files (27+)
├── thumbnails/               # PNG thumbnails for gallery
├── thumbgen/                 # Thumbnail generation tool
│   ├── generate-thumbs.js
│   └── package.json
├── generate-index.js         # Script to generate index.html (if used)
├── README.md                 # This file
├── DEPLOY.md                 # Deployment guide
└── docs/                     # Additional documentation
```

## Deployment

### Static Hosting

Since this is a static site, it can be deployed to any static hosting service:

**GitHub Pages:**
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select root directory
4. Site will be available at `https://username.github.io/repo-name`

**Netlify:**
1. Connect GitHub repository
2. Build command: (none needed)
3. Publish directory: `/` (root)
4. Deploy automatically on push

**Vercel:**
1. Import Git repository
2. Framework preset: Other
3. Output directory: `/`
4. Deploy automatically

**Any Web Server:**
Simply upload the entire `ai-studio-gallery/` folder to your web server. All files are static and ready to serve.

### Build for Production

**No build needed!** The gallery is already ready for production. Just copy the folder to your web server.

Optional: You can minify HTML/CSS/JS files if desired, but it's not required.

## Usage

1. **View the Gallery:**
   - Open `index.html` in a browser or serve via HTTP
   - Browse through the visual effect demos
   - Click any demo to view it fullscreen

2. **Use Individual Demos:**
   - Each HTML file is standalone
   - Can be embedded in other projects
   - Can be modified and customized
   - Can be served independently

3. **Generate Thumbnails:**
   - Run thumbnail generation tool
   - Thumbnails are automatically created
   - Used by the gallery index page

## Contributing

To add a new demo:

1. Create a new HTML file with your visual effect
2. Ensure it's self-contained (includes all CSS/JS inline or in the file)
3. Generate a thumbnail using the thumbgen tool
4. Add entry to `index.html` (or regenerate if using generate-index.js)

## Technical Details

- **No Build Step:** All files are ready to use
- **No Dependencies:** Pure HTML, CSS, and JavaScript
- **Responsive:** Works on desktop, tablet, and mobile
- **Performance:** Each demo is optimized for smooth animation
- **Browser Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge)

## License

Private project.

---

**Status:** ✅ Ready to deploy as static site

**Last Updated:** 2026-01-09
