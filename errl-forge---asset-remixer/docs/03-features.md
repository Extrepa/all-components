# Features

## Core Features

### 1. AI-Powered Asset Generation

#### Text-to-Image Generation
- Generate game assets from text descriptions
- Support for multiple AI providers (Gemini, OpenAI)
- Automatic aspect ratio handling (1:1 for sprites)
- Base64 image output for immediate use

#### Image-to-Image Remixing
- Upload or select source images
- Remix existing assets with custom styles
- Preserve source composition while applying new aesthetics
- Support for MapleStory asset remixing

### 2. Automatic Metadata Generation

The system automatically generates game-ready metadata including:

- **Stats:**
  - HP (Health Points)
  - EXP (Experience Points)
  - Speed (Movement speed)

- **Gameplay Data:**
  - Behavior description (AI movement patterns)
  - Flavor text/description

- **Collision Data:**
  - Hitbox dimensions (width, height)
  - Hitbox offsets (offsetX, offsetY)

- **Animation Data:**
  - Suggested animation keys (e.g., 'idle', 'walk', 'die')

### 3. MapleStory Asset Integration

#### Database Browsing
- Access to MapleStory.io API
- Support for multiple GMS versions: v210, v177, v95, v83, v62
- Browse by category:
  - Mobs (monsters)
  - NPCs
  - Pets
  - Maps
  - Items
  - Equipment
  - Hair styles
  - Item Subcategories: Glasses, Earrings, Hat, Cape, Gloves, Shoes, Ring, Pendant

#### Search & Filter
- Real-time search with debouncing
- Category-based filtering
- "Browse All" mode for full database access
- Infinite scroll pagination

#### Asset Selection
- Click to select any MapleStory asset
- Automatic sprite URL generation
- Base64 conversion for AI processing
- Smart prompt generation based on category

### 4. Multi-Provider AI Support

#### Supported Providers

**Gemini (Google)**
- ✅ Image generation (gemini-2.5-flash-image)
- ✅ Metadata generation (gemini-2.5-flash)
- ✅ Image-to-image remixing
- ✅ Structured JSON output

**OpenAI**
- ✅ Image generation (DALL-E 3)
- ✅ Metadata generation (GPT-4o-mini)
- ⚠️ Limited image-to-image support (prompt enhancement)

**Anthropic (Claude)**
- ❌ Image generation (not supported)
- ✅ Metadata generation (Claude 3.5 Sonnet)
- Best for text-based metadata only

#### Provider Switching
- Dropdown selector in header
- Real-time provider switching
- No need to restart application
- Provider name displayed in UI

### 5. Style Modifiers

16 MapleStory-themed Errl style injection buttons in a 4x4 grid for rapid aesthetic changes. Each style references a real MapleStory area color scheme inverted to Errl aesthetic. Hover tooltips show color swatches with RGB codes for each style's color palette.

- **Maple (Henesys):** UV pink/magenta gradients, dripping paint, neon glow
- **Chibi (Ellinia):** Acid blue/electric cyan, cute neon glow, iridescent sheens
- **Magic (Sleepywood):** Lime glow yellow/opalescent purple, magical spell effects
- **Fire (Perion):** Opalescent purple/acid blue, burning neon effects
- **Ice (El Nath):** UV pink/opalescent orange, frozen neon effects
- **Shadow (Kerning):** Lime glow yellow/emerald, neon shadows
- **Warrior (Leafre):** Acid blue/electric cyan, heavy neon armor effects
- **Archer (Mu Lung):** Bright cyan/teal, bow with neon trails
- **Pirate (Nautilus):** Cyan/teal, nautical neon effects
- **Neon (Ariant):** Electric blue/opalescent purple, cyberpunk urban style
- **Pixel (Classic):** Glitchy neon pixels, chunky neon blocks
- **Crystal (Aqua Road):** Opalescent orange/UV pink, prismatic neon refraction
- **Glitch (Ludibrium):** Dark glitch with neon accents, digital corruption
- **Void (Magatia):** Bright gold/lime glow, ethereal glow
- **Toxic (Herb Town):** UV pink toxic glow, radioactive neon effects
- **Vapor (Orbis):** Opalescent purple vaporwave, synthwave in neon

All styles apply Errl aesthetic to the entire asset while preserving structure and pose.

### 6. Asset Presets

Pre-configured templates for quick starts with visual thumbnails:

- Green Slime (monster) - 32x24 dimensions
- Orange Mushroom (monster) - 32x32 dimensions
- Red Ribbon Pig (monster) - 32x32 dimensions
- Tree Stump (monster) - 32x32 dimensions
- Health Potion (item) - 32x32 dimensions
- Brick Platform (platform) - 32x32 dimensions

Each preset includes:
- Visual thumbnail preview (48x48px in library)
- Optimized base prompt
- Asset type classification
- Ready-to-generate configuration
- Predefined target dimensions for automatic resizing

### 7. Visual Preview

#### Image Display
- High-quality image preview
- Pixel-perfect rendering
- Hitbox overlay visualization (toggleable)
- Source vs. generated indicator
- Side-by-side comparison view (Before/After)
- Automatic resizing with side-by-side display of generated and resized versions
- Dimension display (auto-detected from source/generated image)

#### Metadata Preview
- JSON code view
- Syntax highlighting (green terminal style)
- Copy to clipboard functionality
- Formatted for readability

### 8. Export Functionality

#### Multi-Format Export
- **Image Formats:** PNG and JPEG
- **Size Options:** 
  - Small (Original Size) - Resized to match source dimensions
  - Large (Generated Size) - Full AI-generated resolution
  - Both Sizes - Downloads both versions
- **Metadata:** JSON file with all game data
- **All Formats & Sizes:** One-click download of everything

#### Export Process
- Dropdown menu with organized options
- Automatic filename generation with size suffix
- Downloads files with appropriate delays to prevent browser blocking
- Ready for Phaser 3 integration

### 9. Archive Download

#### Bulk Download
- Download entire category archives
- JSON format for offline use
- Progress tracking during download
- Handles large datasets (50,000+ items)

#### Use Cases
- Offline asset browsing
- Local development
- Backup and archival
- Custom tooling integration

### 10. User Interface

#### Design Philosophy
- Cyberpunk-inspired dark theme
- Pixel art aesthetic
- Modern, responsive layout
- Intuitive navigation

#### Key UI Elements
- **Header:** Branding, provider selector, version info, batch mode toggle, settings
- **Sidebar:** Asset library with tabs (Presets, Maple DB, My Assets, Archive) with shimmery dividers
  - Base Models section with visual thumbnails (48x48px previews)
  - Thumbnails display preset previews when image files are available
- **Main Panel:** Editor with compact visual/metadata toggle in preview panel top-left
- **Controls:** Generation, export, style modifiers, hitbox editor, animation generator
- **Consistent Button Sizing:** All buttons in rows have uniform heights (h-8 for standard buttons)
- **Always-Visible Buttons:** All action buttons (Animate, Hitbox, Resize, Export) always visible, grayed out until results available
- **Neon Outline:** Subtle rainbow gradient shimmer border around entire application

#### Responsive Features
- Scrollable panels
- Custom scrollbar styling
- Loading states and animations
- Error state displays
- Empty state handling
- Consistent spacing and alignment throughout

## Advanced Features

### 1. Smart Prompt Generation

When selecting MapleStory assets, the system automatically:
- Detects asset category
- Generates appropriate prompt descriptors
- Suggests remix prompts with style modifiers
- Handles different asset types intelligently

### 2. Error Recovery

- Structured error handling with categorized error types
- Automatic retry for API failures with exponential backoff
- Circuit breaker pattern to prevent cascading failures
- Fallback metadata on generation errors
- Graceful degradation
- User-friendly error messages with actionable guidance
- Retry buttons for failed operations

### 3. Performance Optimizations

- IndexedDB persistent caching for MapleStory data
- Response caching for API calls
- Debounced search input (800ms)
- Lazy image loading with intersection observer
- Infinite scroll pagination
- Prefetching of next page results
- Efficient base64 conversion

### 4. Type Safety

- Full TypeScript implementation
- Strict type checking
- Interface-based architecture
- Compile-time error detection

## Feature Comparison

| Feature | Gemini | OpenAI | Anthropic |
|---------|--------|--------|-----------|
| Image Generation | ✅ | ✅ | ❌ |
| Image Remixing | ✅ | ⚠️ | ❌ |
| Metadata Generation | ✅ | ✅ | ✅ |
| Structured Output | ✅ | ✅ | ⚠️ |
| Cost Efficiency | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## Limitations

1. **Anthropic:** No image generation support
2. **OpenAI:** Limited image-to-image remixing (uses prompt enhancement)
3. **MapleStory API:** v210 can be unstable (503 errors)
4. **Browser Only:** No server-side processing
5. **CORS:** Some external images may have CORS restrictions

### 11. Enhanced Error Handling

#### Structured Error System
- Categorized error types (API errors, network errors, timeout errors, rate limits, etc.)
- User-friendly error messages with actionable guidance
- Provider-specific error handling and messaging
- Retry functionality for recoverable errors

#### Error Display
- Visual error indicators in UI
- Detailed error context (provider, operation, retryable status)
- Retry buttons for failed operations
- Rate limit handling with wait times

### 12. Loading Progress Indicators

#### Progress Tracking
- Real-time progress bars for image and metadata generation
- Step-by-step status messages ("Generating image...", "Generating metadata...")
- Progress percentages for each operation
- Visual feedback during long-running operations

### 13. API Stability Improvements

#### Circuit Breaker Pattern
- Automatic circuit breaking for failing APIs (v210 only)
- Only activates when v210 database version is selected
- Half-open state for recovery testing
- Prevents cascading failures
- Other versions (v62, v83, v95, v177) do not use circuit breaker

#### Exponential Backoff
- Intelligent retry logic with exponential backoff and jitter
- Request queuing for v210 API to respect rate limits
- Automatic fallback to v62 when v210 is consistently failing
- Failed request caching to avoid repeated failures

### 14. Performance Optimizations

#### IndexedDB Caching
- Persistent caching of MapleStory data in browser
- 24-hour cache TTL with automatic cleanup
- Faster subsequent loads for frequently accessed data

#### Optimized Loading
- Improved debouncing (800ms) for search input
- Prefetching of next page results
- Intersection observer for lazy image loading
- Virtual scrolling ready architecture

#### Asset Deduplication
- Automatic deduplication of database assets when loading pages
- Prevents duplicate assets from appearing in MAPLE DB tab
- Deduplication of archived assets in Archive tab
- Uses unique keys: `${category}-${id}` for database assets, `${version}-${category}-${id}` for archived assets

### 15. Local Storage & Asset Management

#### Asset Persistence
- Automatic saving of generated assets to IndexedDB
- "My Assets" tab in AssetLibrary for browsing saved assets
- Asset deletion and management
- Export/import functionality for asset collections

#### Asset History & Versioning
- Complete version history for each asset
- History viewer in AssetEditor
- Revert to previous versions
- Timestamp tracking for all versions

### 16. Batch Generation System

#### Batch Job Management
- Create batch jobs with multiple asset definitions
- Job queue system with concurrency limits
- Progress tracking (X of Y complete)
- Pause/resume functionality
- Automatic saving of batch results

#### Batch Operations
- Generate multiple assets from presets or custom prompts
- Retry failed items
- Export batch results as JSON
- Real-time progress monitoring

### 17. Custom Style Presets

#### Preset Management
- Create custom style presets combining multiple modifiers
- Save/load presets from local storage
- Preset preview and quick application
- Share presets via export/import
- Preset deletion and management

### 18. Animation Frame Generation

#### Animation Sequences
- Generate multiple frames for animations (idle, walk, run, jump, attack, etc.)
- Configurable frame counts (4, 8, 12 frames)
- Frame-specific prompt variations for consistent animation
- Support for multiple animation types per asset
- Preview animation sequences

#### Animation Types
- Idle: Subtle breathing or swaying
- Walk/Run: Side-scrolling movement cycles
- Jump: Ascending and descending phases
- Attack: Wind-up, swing, and follow-through
- Hurt/Die: Reaction animations

### 19. Sprite Sheet Export

#### Sprite Sheet Generation
- Combine multiple frames into sprite sheets
- Multiple layout options:
  - Horizontal (all frames in a row)
  - Vertical (all frames in a column)
  - Grid (configurable columns/rows)
- Phaser 3 compatible metadata generation
- Export as PNG + JSON

#### Export Formats
- Individual frame downloads
- Complete sprite sheet with metadata
- Game engine ready formats

### 20. Animation Preview & Playback

#### Live Preview
- Play animation sequences directly in the UI
- Adjustable playback speed (Fast, Normal, Slow)
- Visual indicator showing current frame
- Loop playback for continuous viewing
- Stop/play controls for each animation

#### Preview Features
- Large preview window during playback
- Frame counter display
- Highlighted current frame in grid
- Smooth frame transitions

### 21. Keyboard Shortcuts

#### Available Shortcuts
- **Ctrl/Cmd + G:** Generate asset
- **Ctrl/Cmd + E:** Export asset (PNG + JSON)
- **Ctrl/Cmd + B:** Toggle Batch Mode

#### Smart Activation
- Shortcuts disabled when typing in inputs
- Context-aware (only work in appropriate modes)
- Visual help tooltip in editor

### 22. Enhanced My Assets Management

#### Search & Filter
- Real-time search in saved assets
- Filter by name or type
- Clear search functionality

#### Bulk Operations
- Select multiple assets with checkboxes
- Bulk delete selected assets
- Bulk export selected assets as JSON
- Selection counter display

#### Performance
- Virtual scrolling for large lists (100+ items)
- Only renders visible items for better performance
- Smooth scrolling with overscan for seamless experience

### 23. Advanced Hitbox Editor

#### Visual Editor
- Drag-and-drop hitbox positioning
- Corner resize handles for precise adjustment
- Real-time visual feedback with red overlay
- Canvas-based editing interface
- Dropdown menu access (Edit Hitbox, Show/Hide Hitbox)

#### Features
- Direct numeric input for exact values
- Reset to original hitbox
- Save changes to asset metadata
- Visual corner handles for resizing
- Toggle overlay visibility without opening editor

### 26. Image Resizing & Dimension Management

#### Manual Resize
- Small icon-only resize button (always visible, grayed out until result available)
- Resizes generated image to match original source dimensions or preset sizes
- Side-by-side display of generated (large) and resized (original size) versions
- Both versions can be exported independently or together
- Preset-based resizing: Assets generated from base models automatically resize to game-ready dimensions (e.g., 32x24 for slimes, 32x32 for items)

#### Dimension Display
- Auto-detected dimensions from source or generated image
- Width and height inputs (editable but not recommended)
- Real-time dimension detection when images change
- Displays empty/placeholder when dimensions unavailable

#### Visual Comparison
- Side-by-side view when resized version exists
- Labels: "Generated" (large) and "Resized" (original size)
- Both versions support hitbox overlay
- Comparison view also shows both versions side-by-side

#### Saved Assets Display
- Resized preview shown under saved assets when available
- Dimension information displayed (width × height)
- Visual indicator for assets that have been resized

### 24. Web Worker Performance

#### Sprite Sheet Generation
- Off-main-thread processing
- Progress reporting during generation
- Non-blocking UI during heavy operations
- Better performance for large sprite sheets

### 25. Service Worker & Offline Support

#### Offline Capabilities
- Service Worker for offline functionality
- Caches static assets (HTML, CSS, JS)
- Caches API responses for offline access
- Automatic cache management and cleanup
- Disabled in development mode for easier debugging

#### Features
- Works offline after initial load
- Cached assets available without internet
- Offline indicator in UI
- Automatic cache updates when online
- Progressive Web App (PWA) support

#### Cache Strategy
- Static assets: Cache-first strategy
- API responses: Network-first with cache fallback
- Generated assets: Stored in IndexedDB (always available)
- Automatic cache versioning and cleanup

### 27. UI Enhancements & Visual Polish

#### Auto-Scroll with Visual Indicators
- Auto-scroll on hover near edges of scrollable category rows
- Subtle arrow indicators (ChevronLeft/ChevronRight) that appear and glow when hovering in scroll zones
- Smooth scrolling animation (2px per frame)
- Arrows positioned absolutely on left/right edges with indigo glow effect

#### Shimmery Dividers
- Animated shimmer effect on tab dividers (ARCHIVE/MAPLE DB/MY ASSETS)
- Shimmer borders on panel dividers for visual definition
- CSS animation with gradient movement for subtle motion

#### Style Button Tooltips
- Hover tooltips on style modifier buttons showing:
  - Area name (e.g., "Henesys → Errl Style")
  - Color swatches with RGB codes for border and text colors
  - Selected state colors when applicable
- Smart positioning to prevent cutoff (left-aligned for left column, right-aligned for right column, centered for middle)

#### Compact Preview Tabs
- Visual/Metadata toggle moved to top-left of preview panel
- Compact design (text-[8px], reduced padding)
- Semi-transparent background with backdrop blur
- High z-index to stay above preview content

#### Always-Visible Action Buttons
- All header buttons (Animate, Hitbox, Resize, Export) always visible
- Animate, Hitbox, and Resize grayed out until asset generation completes
- Generate button and Status chip on left side
- Action buttons (Animate, Hitbox, Resize, Export) on right side
- Consistent spacing and layout

#### Neon App Outline
- Subtle rainbow gradient shimmer border around entire application
- 1px border with animated gradient (pink → blue → cyan → green → yellow → orange)
- Rounded corners (12px border-radius)
- Minimal glow for subtle effect
- Continuous animation for shimmer effect

#### Saved Assets Enhancements
- Dimension information displayed for resized assets
- Resized preview thumbnail shown when available
- Visual separation with border for resized preview section

## Future Feature Ideas

- [ ] Collaboration features
- [ ] Advanced hitbox editor
- [ ] Animation preview (playback)
- [ ] Integration with game engines
- [ ] Asset marketplace/sharing
- [ ] Plugin architecture for custom providers

