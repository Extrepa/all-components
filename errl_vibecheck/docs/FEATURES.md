# Features

## Core Features

### 1. Multi-Mode Code Generation
Generate code in multiple formats:
- **P5.js** - Creative coding sketches with animation and interactivity
- **SVG** - Vector graphics and illustrations
- **HTML/JS** - Full web applications and interactive components
- **GLSL Shaders** - Fragment shaders for visual effects
- **Three.js Wireframes** - 3D wireframe scenes
- **Three.js Voxels** - 3D voxel-based scenes
- **Images** - Direct image generation (when supported)

### 2. AI Model Selection
Choose from multiple Gemini models:
- **Flash-Lite 2.5** - Fastest, lightweight model
- **Flash 2.5** - Fast with optional thinking mode
- **Pro 2.5** - More capable, with thinking
- **Pro 3** - Latest preview model with advanced capabilities

### 3. Batch Generation
- Generate multiple variations of the same prompt
- Configurable batch size (default: 3)
- All outputs displayed in a feed for easy comparison

### 4. Versus Mode
- Compare outputs from different AI models side-by-side
- Select multiple models to generate simultaneously
- Default: Flash and Pro 3 comparison

### 5. Visual Rendering
- Real-time rendering of generated code in sandboxed iframes
- Automatic syntax highlighting for code display
- Error handling and display
- Lazy loading for performance optimization

### 6. Fullscreen Mode
- View individual outputs in fullscreen
- Optional code overlay
- Animation controls
- Sound effects toggle

### 7. Screensaver Mode
- Beautiful fullscreen display mode
- Multiple layout options (1x1, 1x2, 2x1, 2x2, 3x2)
- Animated transitions between outputs
- Typing animation for prompts
- Code scrolling animation
- Auto-hiding controls with idle detection
- Sound effects for typing and transitions

### 8. Collections
- Browse curated collections of generated content
- Share collections via URL
- Switch between collections seamlessly
- Collections stored in Google Cloud Storage

### 9. Favorites System
- Mark favorite outputs with star icon
- Filter feed to show only favorites
- Persistent favorites storage

### 10. Preset Prompts
- Pre-configured prompts for each mode
- Quick-start templates for common use cases
- Shuffled display for variety

### 11. Audio Feedback
- Sound effects powered by Tone.js
- Typing sounds during code generation
- Success sounds on completion
- Toggleable audio controls
- Different sound presets for different actions

### 12. URL-Based Navigation
- Deep linking to specific results
- Shareable collection URLs
- Hash-based routing for direct access

### 13. Persistent Storage
- Local storage for user rounds
- Persists settings and preferences
- Automatic cleanup of failed outputs

### 14. Performance Optimizations
- Lazy loading of renderers
- Intersection observer for visibility detection
- Rate limiting for API calls
- Retry logic with exponential backoff
- Concurrent request limiting

### 15. Error Handling
- Graceful error display
- Retry mechanism (up to 5 attempts)
- Timeout protection (193 seconds)
- Error state indicators

### 16. Responsive Design
- Works on desktop and mobile
- Touch-friendly interface
- Adaptive layouts for screensaver mode

### 17. Code Scaffolding
- Automatic wrapping of generated code
- Mode-specific HTML scaffolding
- Library injection (P5.js, Three.js, etc.)
- Proper viewport and styling setup

### 18. Export Format
- Structured export format for results
- Includes metadata, code, timing, and model info
- JSON-based data structure

### 19. Sorting
- Sort by newest/oldest
- Sort by prompt (A-Z, Z-A)
- Sort by mode
- Sort by generation speed (fastest/slowest)
- Real-time sorting with filter/search

### 20. Keyboard Shortcuts
- **Escape**: Exit fullscreen/screensaver mode
- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + F**: Focus search input (alternative)

## UI/UX Features

- Clean, minimalist interface
- Material Design icons
- Space Mono font for code
- Dark theme optimized
- Smooth animations and transitions
- Keyboard shortcuts (Escape to exit screensaver)
- Tooltips for actions
- Loading states and indicators

