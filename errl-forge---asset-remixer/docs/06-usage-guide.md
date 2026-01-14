# Usage Guide

## Getting Started

### First Launch

1. **Start the application:** `npm run dev`
2. **Open in browser:** http://localhost:3000
3. **Select an AI provider:** Use the dropdown in the header (default: Gemini)
4. **Ensure API key is set:** Check that your selected provider's API key is in `.env.local`

## Basic Workflows

### Workflow 1: Generate from Preset

1. **Select a Preset:**
   - Click the "ARCHIVE" tab in the left sidebar (or "PRESETS" if visible)
   - Browse the "Base Models" section with visual thumbnails
   - Click on any preset (e.g., "Green Slime") to load it into the editor

2. **Customize (Optional):**
   - Edit the asset name in the editor
   - Modify the prompt in the "Generation Prompt" field
   - Apply style modifiers (Neon, Drip, Glitch, Void)

3. **Generate:**
   - Click the "GENERATE" button
   - Wait for generation to complete (status shows "generating" → "complete")

4. **Export:**
   - Click "Export" to download PNG and JSON files

### Workflow 2: Remix MapleStory Asset

1. **Browse Database:**
   - Click the "MAPLE DB" tab
   - Select a category (Mobs, NPCs, Items, etc.)
   - Choose version (v210 or v62)

2. **Search or Browse:**
   - Use search bar to find specific assets
   - Or click the globe icon to browse all items
   - Scroll to load more (infinite scroll)

3. **Select Asset:**
   - Click on any asset thumbnail
   - The source image loads in the editor

4. **Customize Remix:**
   - Edit the remix prompt
   - Apply style modifiers
   - The system automatically suggests a remix prompt

5. **Generate:**
   - Click "REMIX SOURCE" button
   - Wait for AI to remix the image

6. **Export:**
   - Download the remixed asset and metadata

### Workflow 3: Create Custom Asset

1. **Start Fresh:**
   - Click "New Custom Asset" button at bottom of sidebar

2. **Define Asset:**
   - Enter asset name
   - Write a detailed prompt describing the asset
   - Select appropriate style modifiers

3. **Generate:**
   - Click "GENERATE"
   - Review the generated image and metadata

4. **Iterate:**
   - Adjust prompt and regenerate
   - Try different style modifiers
   - Switch AI providers to compare results

## UI Components Guide

### Header

- **Left:** Brand logo and name
- **Right:** 
  - Batch Mode toggle button
  - Provider selector dropdown
  - Version info (v0.4.0-beta)

### Sidebar (Asset Library)

**ARCHIVE/PRESETS Tab:**
- Base Models section with visual thumbnails (48x48px previews)
- List of preset templates with names and types
- Click any preset to select and load into editor
- Thumbnails display when image files are available in `/public/images/presets/`

**MAPLE DB Tab:**
- Version selector (v62/v210)
- Archive download button
- Category buttons (Mobs, NPCs, etc.)
- Search bar
- Browse all button (globe icon)
- Asset grid with infinite scroll

**MY ASSETS Tab:**
- List of all saved assets
- Thumbnail previews
- Creation timestamps
- Delete button for each asset
- Refresh button

**Bottom:**
- "New Custom Asset" button

### Main Editor Panel

**Header Section:**
- Asset name and status badge
- Tab switcher (VISUAL / METADATA / HISTORY)
- Action buttons (Animate, Export, Generate)

**Left Control Panel:**
- Asset name input
- Custom style presets (with star icon)
- Style modifier buttons
- Custom preset manager
- Generation prompt editor
- AI provider info

**Right Preview Panel:**
- Visual tab: Image preview with hitbox overlay, error messages, progress indicators
- Metadata tab: JSON code view with copy button
- History tab: Version history with revert functionality

## Style Modifiers

### How to Use

1. Click a style button to apply
2. Click again to remove
3. The prompt automatically updates
4. Multiple styles can be combined (manually edit prompt)

### Available Styles

- **Neon:** Cyberpunk aesthetic with glowing outlines
- **Drip:** Melting, gooey, graffiti-style effects
- **Glitch:** Digital corruption, chromatic aberration
- **Void:** Dark cosmic theme with stars and glow

### Custom Style Presets

1. **Create Custom Preset:**
   - Click the star icon next to "Errl Style Injection"
   - Enter preset name and description
   - Select one or more style modifiers
   - Click "Save Preset"

2. **Apply Custom Preset:**
   - Click on a saved preset button
   - Prompt automatically updates with combined modifiers

3. **Manage Presets:**
   - Delete presets using the trash icon
   - Presets are saved locally and persist across sessions

### Custom Styles

Edit the prompt directly to combine styles or create custom aesthetics:
```
A neon slime with dripping paint effects, glitch aesthetic
```

## AI Provider Selection

### When to Switch Providers

- **Gemini:** Best for image remixing, structured output
- **OpenAI:** Good quality, but more expensive
- **Anthropic:** Only for metadata (no images)

### Switching Providers

1. Use dropdown in header
2. Provider changes immediately
3. Next generation uses new provider
4. UI updates to show current provider

## Advanced Features

### Batch Generation

1. **Enter Batch Mode:**
   - Click "Batch Mode" button in header
   - Batch Generator interface opens

2. **Create Batch Job:**
   - Click "New Batch" button
   - Enter job name
   - Add items (name, type, prompt)
   - Click "Create Job"

3. **Start Generation:**
   - Click play button on job
   - Monitor progress (X of Y complete)
   - Jobs process 2 items at a time

4. **Manage Jobs:**
   - Pause/resume with pause/play buttons
   - Retry failed items
   - Export results as JSON
   - Delete completed jobs

**Tips:**
- Use batch mode for generating multiple variations
- Failed items can be retried individually
- All results are auto-saved to "My Assets"

### Animation Frame Generation

1. **Generate Asset First:**
   - Create or load a completed asset
   - Asset must have status "complete"

2. **Open Animation Generator:**
   - Click "Animate" button in editor header
   - Animation Generator overlay opens

3. **Configure Animation:**
   - Select animation types (idle, walk, run, etc.)
   - Choose frame count (4, 8, or 12)
   - Review preview information

4. **Generate:**
   - Click "Generate Animations"
   - Monitor progress for each animation
   - Wait for all frames to complete

5. **Export:**
   - Download individual frames
   - Or export as sprite sheet (see below)

### Sprite Sheet Export

1. **After Generating Animations:**
   - Select layout type:
     - Horizontal (→): All frames in a row
     - Vertical (↓): All frames in a column
     - Grid (⊞): Configurable grid layout

2. **Export:**
   - Click "Sprite Sheet" button
   - Downloads PNG image and JSON metadata
   - Phaser 3 compatible format

**Sprite Sheet Metadata:**
- Frame positions and dimensions
- Animation key mappings
- Ready for game engine integration

### Local Storage & Asset Management

1. **Auto-Save:**
   - All generated assets are automatically saved
   - No manual save required

2. **Browse Saved Assets:**
   - Click "MY ASSETS" tab in sidebar
   - View all saved assets with thumbnails
   - See creation timestamps

3. **Load Saved Asset:**
   - Click on any saved asset
   - Loads into editor for editing/regeneration

4. **Delete Assets:**
   - Click trash icon on saved asset
   - Confirms before deletion

### Asset History & Versioning

1. **View History:**
   - Open a saved asset in editor
   - Click "HISTORY" tab (if history exists)
   - See all previous versions

2. **Revert to Version:**
   - Click "Load This Version" on any history entry
   - Confirms before loading
   - Current changes are lost

3. **Version Tracking:**
   - Each generation creates a new version
   - Timestamps show when each version was created
   - Version numbers increment automatically

### Archive Download

1. Select a category in MAPLE DB tab
2. Click download button (next to version selector)
3. Wait for download to complete
4. JSON file downloads with all category assets

**Use Cases:**
- Offline development
- Local asset database
- Custom tooling integration

### Hitbox Visualization

- Red overlay on generated assets
- Shows collision boundaries
- Dimensions from AI-generated metadata
- Adjust in metadata JSON if needed

### Metadata Customization

1. Switch to METADATA tab
2. View generated JSON
3. Click "Copy" to copy to clipboard
4. Manually edit if needed
5. Export includes custom metadata

## Tips & Best Practices

### Writing Effective Prompts

**Good Prompts:**
- Specific: "A green slime with big eyes and a smile"
- Style included: "pixel art style, MapleStory aesthetic"
- Background: "white background" for clean sprites
- Details: Include color, size, expression, pose

**Bad Prompts:**
- Vague: "A monster"
- Missing style: "A slime" (no art style specified)
- Too complex: Multiple conflicting styles

### Prompt Templates

```
[Description] + [Art Style] + [Background] + [Details]

Examples:
"A cute green slime monster, pixel art style, MapleStory aesthetic, white background"
"A red potion bottle, glowing liquid, 2D game icon, pixel art, white background"
```

### Style Combinations

You can combine multiple styles:
```
"A neon slime with dripping paint effects, glitch aesthetic, cyberpunk style"
```

### Asset Type Selection

Choose the correct type for better metadata:
- **Monster:** Gets HP, EXP, behavior patterns
- **Item:** Gets item-specific metadata
- **NPC:** Gets dialogue-ready descriptions
- **Platform:** Gets collision-focused metadata

### Performance Tips

1. **Use v62 for stability:** v210 can be slow/unstable
2. **Search instead of browse all:** Faster for specific assets
3. **Cache results:** Generated assets stay in memory
4. **Switch providers:** If one is slow, try another

## Common Tasks

### Regenerating Assets

1. Keep the same prompt
2. Click "GENERATE" again
3. AI will create a new variation

### Comparing Providers

1. Generate with Gemini
2. Switch to OpenAI
3. Use same prompt
4. Compare results

### Batch Workflow (New)

1. Enter Batch Mode
2. Create batch job with multiple items
3. Start generation and monitor progress
4. Export batch results as JSON
5. Or access individual assets from "My Assets"

### Remixing Multiple Times

1. Generate initial asset
2. Use generated image as source
3. Apply new style modifiers
4. Remix again for layered effects

## Troubleshooting

### Generation Fails

- **Check error message:** User-friendly messages explain the issue
- **Retry button:** Click retry if operation is retryable
- **Check API key:** Ensure it's set correctly
- **Check quota:** Some providers have rate limits
- **Try different provider:** Switch and retry
- **Simplify prompt:** Very complex prompts may fail
- **Wait for rate limits:** Error shows wait time if rate limited

### Images Don't Load

- **Check network:** Ensure internet connection
- **CORS issues:** Some external images may be blocked
- **Retry:** Click the asset again

### Metadata Missing Fields

- **Check provider:** Some providers have better structured output
- **Manual edit:** Edit JSON directly if needed
- **Regenerate:** Try generating again

### Slow Performance

- **Switch to v62:** v210 can be slow (circuit breaker may auto-fallback)
- **Circuit Breaker:** Only active for v210 database version
- **No Duplicates:** Assets are automatically deduplicated in database and archive views
- **Use search:** Instead of browsing all
- **Check API status:** Provider may be experiencing issues
- **Wait for cache:** First load is slower, subsequent loads use cache
- **Check progress indicators:** Shows what's happening during generation

## Keyboard Shortcuts

The app supports the following keyboard shortcuts (when not typing in input fields):

- **`Ctrl/Cmd + G`** - Generate asset (in editor mode)
- **`Ctrl/Cmd + E`** - Export current asset (PNG + JSON)
- **`Ctrl/Cmd + B`** - Toggle between Editor and Batch mode

**Note:** Shortcuts are disabled when typing in text inputs or textareas to avoid conflicts.

## Export Format

### Image File
- **Format:** PNG
- **Filename:** `{asset_name}.png`
- **Content:** Base64 data URL (can be used directly in code)

### Metadata File
- **Format:** JSON
- **Filename:** `{asset_name}_data.json`
- **Structure:** See `AssetMetadata` type in API reference

### Sprite Sheet Files
- **Image:** `{asset_name}-sprite-sheet.png`
- **Metadata:** `{asset_name}-sprite-sheet.json`
- **Format:** Phaser 3 compatible with frame positions and animation mappings

## Offline Mode

### How It Works

The app uses a Service Worker to provide offline functionality:

1. **First Visit:** App loads and caches essential assets
2. **Subsequent Visits:** App works offline using cached assets
3. **Generated Assets:** Always available offline (stored in IndexedDB)
4. **API Calls:** Cached responses available when offline

### Offline Indicator

- **Green "Online" badge:** Connected to internet
- **Orange "Offline" badge:** Working in offline mode
- App automatically switches between online/offline modes

### What Works Offline

- ✅ View all saved assets (from IndexedDB)
- ✅ Browse cached MapleStory assets
- ✅ Edit asset metadata
- ✅ Export saved assets
- ✅ Use hitbox editor
- ❌ Generate new assets (requires AI API)
- ❌ Remix assets (requires AI API)
- ❌ Download new MapleStory assets

### Cache Management

The Service Worker automatically:
- Caches static assets on install
- Caches API responses when online
- Cleans up old cache versions
- Updates cache when new version is available

## Integration with Game Engines

### Phaser 3 Example

**Single Asset:**
```javascript
// Load image
this.load.image('slime', 'path/to/slime.png');

// Use metadata
const metadata = {
  hp: 10,
  exp: 5,
  // ... from JSON file
};

// Create sprite with hitbox
const sprite = this.add.sprite(x, y, 'slime');
sprite.setSize(metadata.hitbox.width, metadata.hitbox.height);
```

**Sprite Sheet:**
```javascript
// Load sprite sheet
this.load.atlas('slime', 'path/to/slime-sprite-sheet.png', 'path/to/slime-sprite-sheet.json');

// Create animations
this.anims.create({
  key: 'slime-walk',
  frames: this.anims.generateFrameNames('slime', { prefix: 'walk_', start: 0, end: 7 }),
  repeat: -1
});

// Use animation
const sprite = this.add.sprite(x, y, 'slime');
sprite.play('slime-walk');
```

### Other Engines

The exported JSON is engine-agnostic and can be adapted to:
- Unity
- Godot
- GameMaker
- Custom engines

