# Creative Coding Projects Gallery

A web application for viewing and exploring 17 creative coding projects, including GLSL fragment shaders and P5.js interactive sketches.

## Overview

This project transforms exported creative coding project files into a navigable web gallery. The application provides a modern interface for browsing, viewing, and exploring generative art projects.

## Features

- **17 Creative Projects**
  - 5 GLSL fragment shaders (Three.js rendering)
  - 12 P5.js interactive sketches
- **Modern Web Interface**
  - Dark theme optimized for visual projects
  - Responsive design
  - Smooth transitions and animations
- **Navigation & Discovery**
  - Category filtering (All, GLSL, Overhead Projector, Oil & Water)
  - Search functionality
  - Hash-based routing for direct project links
- **Individual Project Pages**
  - Standalone HTML pages for each project
  - Project metadata display
  - Direct links back to gallery

## Quick Start

1. **Open the application**
   ```
   Open index.html in a web browser
   ```

2. **View projects**
   - Browse by category using the sidebar
   - Click any project card to view it
   - Use search to find specific projects

3. **Direct project access**
   - Individual project pages are in `projects/glsl/` and `projects/p5/`
   - Each can be opened standalone or linked directly

## Project Structure

### Production Files (Required on Server)
```
ProjectStarters/
├── index.html              # Main application entry point
├── css/
│   └── styles.css          # Application styles
├── js/                     # Runtime scripts only
│   ├── app.js              # Main application controller
│   ├── glsl-viewer.js      # GLSL shader renderer
│   └── project-loader.js   # Project data loader
├── data/
│   └── projects.json       # Consolidated project metadata (17 projects)
└── projects/
    ├── glsl/               # 5 GLSL shader HTML pages
    │   ├── lava-lamp.html
    │   ├── metal-cymatics-1.html
    │   ├── metal-cymatics-2.html
    │   ├── hypnotic.html
    │   └── menger-void.html
    └── p5/                 # 12 P5.js sketch HTML pages
        ├── overhead-projector-1.html through overhead-projector-4.html
        └── oil-water-1.html through oil-water-8.html
```

### Development Files (Not Required on Server)
```
├── scripts/                 # Development scripts
│   ├── extract-projects.js # Extract from JSON → projects.json
│   ├── generate-pages.js   # Generate HTML pages
│   ├── simplify-slugs.js   # Simplify project slugs
│   └── add-menger-void.js  # Example: Add single project
├── dev/
│   └── source/             # Source JSON files (16 files)
└── docs/                   # Documentation (13 files)
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Dependencies

All dependencies are loaded via CDN (no build step required):

- **Three.js** (r128) - For GLSL shader rendering
- **p5.js** (v1.7.0) - For P5.js sketches

## Browser Support

Modern browsers with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Project Categories

### GLSL Shaders (5)
- Inside of Lava Lamp - Metaball blending, raymarching
- Metal Cymatics v1 & v2 - Chladni figures, metallic reflections
- Hypnotic Pattern - Spiral patterns, color gradients
- Menger Void Fractal - Menger Sponge SDF, raymarching

### P5.js Sketches (12)
- **Overhead Projector Series (4)** - Interactive drawing simulations
- **Oil & Water Series (8)** - Fluid physics simulations

## Technical Details

### GLSL Shader Format
- Uses Three.js for rendering
- Requires uniforms: `u_resolution` (vec2), `u_time` (float)
- Fragment shader only (vertex shader auto-generated)

### P5.js Sketch Format
- Standard p5.js setup/draw functions
- Canvas size: 800x600 (adjustable per project)
- Loaded via iframe for isolation

### Data Format
- Projects stored in `data/projects.json`
- Each project includes: prompt, mode, model, srcCode, metadata
- Organized by categories for easy filtering

## Adding New Projects

See `docs/adding-projects.md` for detailed instructions on adding new projects.

## Development

### Extracting Projects from JSON
```bash
node scripts/extract-projects.js
```

### Generating HTML Pages
```bash
node scripts/generate-pages.js
```

### Adding a New GLSL Shader
```bash
node scripts/add-menger-void.js  # (example - modify for your project)
```

## License

Creative coding projects - use as inspiration and learning resource.

## Credits

- Original projects generated using generative AI tools
- Menger-Void shader extracted from standalone HTML file
- All projects follow creative coding best practices
