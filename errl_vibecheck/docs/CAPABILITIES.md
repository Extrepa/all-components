# Capabilities

## What VibeCheck Can Do

### Code Generation Capabilities

#### 1. Creative Coding (P5.js)
- Generate interactive P5.js sketches
- Create animations and visual effects
- Build simple games and interactive art
- Output: 800x600 canvas with full interactivity
- No external asset dependencies

#### 2. Vector Graphics (SVG)
- Generate SVG illustrations from text prompts
- Create scalable vector graphics
- Support for complex shapes and paths
- ViewBox-based responsive design

#### 3. Web Applications (HTML/JS)
- Generate complete HTML pages
- Create interactive web components
- Build calculators, clocks, games, and tools
- Inline CSS and JavaScript
- Sandboxed execution environment

#### 4. Shader Programming (GLSL)
- Generate fragment shaders
- Create procedural graphics
- Time-based animations
- Resolution-aware shaders
- Three.js integration for rendering

#### 5. 3D Wireframes (Three.js)
- Generate Three.js wireframe scenes
- Create 3D geometric structures
- Auto-rotating camera controls
- Procedural geometry generation
- No external model dependencies

#### 6. 3D Voxels (Three.js)
- Generate voxel-based 3D scenes
- Create colorful block-based visuals
- Animated voxel scenes
- Full Three.js scene setup

#### 7. Image Generation
- Direct image generation (when model supports)
- Base64 encoded image output
- PNG format support

### AI Model Capabilities

#### Model Comparison
- Side-by-side comparison of different models
- Performance metrics (generation time)
- Quality comparison across models
- Thinking mode toggle for capable models

#### Batch Processing
- Generate multiple variations simultaneously
- Compare outputs from same model
- Parallel request handling
- Rate limit management

### Display and Presentation

#### Feed View
- Chronological feed of all generations
- Grouped by round (prompt)
- Multiple outputs per round
- Expandable/collapsible items

#### Collection View
- Curated collections of results
- Collection switching
- Shareable collection links
- Persistent collection data

#### Fullscreen View
- Immersive fullscreen display
- Code overlay toggle
- Animation controls
- Sound effects

#### Screensaver View
- Multi-tile layouts
- Animated transitions
- Typing animations
- Code scrolling effects
- Auto-rotation of content

### Data Management

#### Local Storage
- Persistent user rounds
- Settings persistence
- Favorites storage
- Automatic cleanup

#### Cloud Storage
- Collection data in Google Cloud Storage
- Shareable URLs
- Public collection access
- JSON-based data format

### Performance Capabilities

#### Optimization
- Lazy loading of renderers
- Visibility-based rendering
- Intersection observer usage
- Request rate limiting
- Concurrent request control

#### Error Recovery
- Automatic retry with exponential backoff
- Timeout protection
- Error state management
- Graceful degradation

### Audio Capabilities

#### Sound System
- Tone.js-based audio synthesis
- Multiple sound presets:
  - Typing sounds
  - New line sounds
  - Action sounds
  - Success sounds
- Volume and envelope control
- Toggleable audio

### Integration Capabilities

#### Google Gemini API
- Full API integration
- Safety settings configuration
- Multi-modal support (text + image input)
- Image output support
- Thinking mode support

#### External Libraries
- P5.js via CDN
- Three.js via CDN
- ESM.run for module loading
- No build-time dependencies for generated code

### Sharing Capabilities

#### URL Sharing
- Deep links to specific results
- Collection sharing URLs
- Hash-based routing
- Query parameter support

#### Export
- Structured JSON export format
- Export code as files (JS, HTML, SVG, GLSL)
- Copy code to clipboard
- Download rounds as JSON
- Includes all metadata
- Code and timing information
- Model and mode information

### Search & Filter Capabilities

#### Search
- Search prompts by text
- Search code content
- Real-time filtering
- Case-insensitive search

#### Filter
- Filter by output mode (P5.js, SVG, HTML, etc.)
- Filter by AI model (Flash, Pro, etc.)
- Combine search and filter
- Get unique modes/models from rounds

#### Sort
- Sort by newest/oldest (creation date)
- Sort by prompt (A-Z, Z-A)
- Sort by output mode
- Sort by generation speed (fastest/slowest)
- Real-time sorting with filters

### Keyboard Shortcuts

#### Navigation
- **Escape**: Exit fullscreen/screensaver
- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + F**: Focus search input (alternative)
- Smart detection (doesn't trigger in input fields)

