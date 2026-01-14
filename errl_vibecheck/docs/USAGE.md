# Usage Guide

## Getting Started

### Prerequisites
- Node.js installed
- Google Gemini API key

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set API key in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open browser to `http://localhost:5173`

## Basic Usage

### Generating Your First Output

1. **Choose a Mode**
   - Select from the mode selector (P5.js, SVG, HTML, etc.)
   - Each mode generates different types of code

2. **Enter a Prompt**
   - Type your creative prompt in the input field
   - Or click a preset prompt for quick start

3. **Select Model**
   - Choose between Flash (fast) or Pro (quality)
   - Toggle thinking mode if available

4. **Generate**
   - Click generate or press Enter
   - Watch as code is generated and rendered

### Batch Generation

1. **Enable Batch Mode**
   - Toggle "Batch Mode" switch
   - Set batch size (default: 3)

2. **Select Batch Model**
   - Choose model for batch generation
   - Flash-Lite recommended for speed

3. **Generate**
   - Enter prompt and generate
   - Get multiple variations at once

### Versus Mode

1. **Enable Versus Mode**
   - Toggle off "Batch Mode"
   - Select models to compare

2. **Generate**
   - Enter prompt
   - See side-by-side comparison

3. **Compare**
   - View outputs from different models
   - Check generation times
   - Compare quality

## Advanced Features

### Fullscreen Mode

1. **Enter Fullscreen**
   - Click fullscreen icon on any output
   - Or double-click the output

2. **Controls**
   - Toggle code overlay
   - Toggle animations
   - Toggle sound
   - Press Escape to exit

### Screensaver Mode

1. **Activate**
   - Click "Screensaver Mode" button
   - Or use from collection view

2. **Features**
   - Multiple layout options
   - Animated transitions
   - Typing animations
   - Auto-rotation

3. **Controls**
   - Hover to show controls
   - Toggle sound
   - Close with Escape or button

### Sorting

1. **Select Sort Option**
   - Use the sort dropdown in the header
   - Choose from:
     - **Newest first**: Most recent generations first
     - **Oldest first**: Oldest generations first
     - **Prompt A-Z**: Alphabetical by prompt
     - **Prompt Z-A**: Reverse alphabetical
     - **By Mode**: Grouped by output mode
     - **Fastest**: Quickest generations first
     - **Slowest**: Slowest generations first

2. **Combined with Filters**
   - Sorting works with search and filter
   - Results are filtered first, then sorted

### Favorites

1. **Mark Favorite**
   - Click star icon on any output
   - Star turns gold when favorited

2. **View Favorites**
   - Click "Show Favorites" button
   - Filter feed to favorites only

3. **Remove Favorite**
   - Click star again to unfavorite

### Collections

1. **Browse Collections**
   - Click collection link
   - Or use hash URL: `#vibecheckcollection{id}`

2. **Switch Collections**
   - Use dropdown in collection view
   - Navigate between collections

3. **Share Collection**
   - Click share icon
   - Copy link to clipboard
   - Share with others

## Modes Guide

### P5.js Mode
**Best for**: Interactive art, animations, games

**Tips**:
- Prompts work best with action words ("dancing", "flying", "growing")
- Mention interactivity if desired ("click to change", "follows mouse")
- Specify style ("minimalist", "retro", "neon")

**Example Prompts**:
- "cat wearing jetpack"
- "infinite runner game as a cat"
- "circle that does something unexpected when clicked"

### SVG Mode
**Best for**: Illustrations, icons, vector graphics

**Tips**:
- Be specific about style ("clean vector", "hand-drawn", "geometric")
- Mention colors if important
- Describe composition clearly

**Example Prompts**:
- "pelican riding a bicycle"
- "futuristic isometric city block"
- "zen garden with cherry blossom tree"

### HTML/JS Mode
**Best for**: Web apps, tools, interactive components

**Tips**:
- Describe functionality clearly
- Mention design style ("minimalist", "neobrutalist", "futuristic")
- Specify if it should be interactive

**Example Prompts**:
- "minimalist analog clock with gradient background"
- "simple calculator, neobrutalist design"
- "playable synthesizer piano keyboard"

### Shader Mode
**Best for**: Visual effects, procedural graphics, abstract art

**Tips**:
- Describe visual effect desired
- Mention motion if needed ("flowing", "rotating", "pulsing")
- Be specific about colors and mood

**Example Prompts**:
- "inside of lava lamp"
- "flying over shape-shifting landscape"
- "crackling electric lightning bolts"

### 3D Wireframes Mode
**Best for**: 3D structures, geometric forms, architectural visualization

**Tips**:
- Describe 3D structure clearly
- Mention if animation desired
- Specify perspective ("from above", "side view")

**Example Prompts**:
- "ferris wheel"
- "spiral staircase"
- "fractal branching 3D tree"

### 3D Voxels Mode
**Best for**: Blocky 3D scenes, Minecraft-like visuals, colorful 3D art

**Tips**:
- Describe scene composition
- Mention colors and mood
- Specify animation if needed

**Example Prompts**:
- "ocean simulation"
- "giant dancing anime robot"
- "floating island with terrain"

## Model Selection Guide

### Flash-Lite 2.5
**Use when**:
- Speed is priority
- Simple prompts
- Batch generation
- Quick iterations

**Avoid when**:
- Complex reasoning needed
- High quality required
- Multi-step generation

### Flash 2.5
**Use when**:
- Good balance of speed and quality
- General purpose
- Default choice for most cases

**Thinking mode**:
- Enable for complex prompts
- Slightly slower but better quality

### Pro 2.5 / Pro 3
**Use when**:
- Quality is priority
- Complex code generation
- Detailed requirements
- Versus comparisons

**Avoid when**:
- Speed is critical
- Simple prompts (overkill)

## Tips & Best Practices

### Writing Effective Prompts

1. **Be Specific**
   - ✅ "minimalist analog clock with gradient that shifts with second hand"
   - ❌ "clock"

2. **Mention Style**
   - ✅ "neobrutalist calculator"
   - ❌ "calculator"

3. **Specify Interactivity**
   - ✅ "circle that does something unexpected when clicked"
   - ❌ "circle"

4. **Avoid External Assets**
   - ✅ "use emojis for graphics"
   - ❌ "load image from URL"

5. **Set Constraints**
   - ✅ "no text", "auto-playing", "monochrome"
   - Helps guide generation

### Performance Tips

1. **Use Flash for Iteration**
   - Faster feedback
   - Switch to Pro for final version

2. **Batch Mode for Variations**
   - Generate multiple at once
   - Compare quickly

3. **Lazy Loading**
   - Only visible outputs render
   - Scroll to see more

4. **Close Unused Tabs**
   - Each iframe uses memory
   - Close fullscreen when done

### Troubleshooting

**Code doesn't render**:
- Check browser console for errors
- Try regenerating
- Switch models

**Generation fails**:
- Check API key
- Verify network connection
- Try simpler prompt

**Slow performance**:
- Use Flash instead of Pro
- Reduce batch size
- Close other tabs

**Audio not working**:
- Click to initialize audio (browser requirement)
- Check browser permissions
- Toggle sound in settings

## Keyboard Shortcuts

- **Escape**: Exit fullscreen/screensaver
- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + F**: Focus search input (alternative)
- **Enter**: Submit prompt (when focused)
- **Arrow keys**: Navigate (in some contexts)

## Sharing

### Share Individual Result
1. Generate output
2. Copy URL with hash: `#vibecheck_{id}`
3. Share link

### Share Collection
1. Open collection
2. Click share icon
3. Copy link
4. Share with others

### Share Feed
- Currently no direct sharing
- Use collections for curated sharing

## Limitations

### Current Limitations
- No user accounts
- No cloud save (localStorage only)
- No code editing
- No version history
- Limited to browser storage

### Code Constraints
- No external assets (images, videos, fonts)
- No network requests
- No localStorage in sandbox
- Sandboxed execution only

### API Constraints
- Rate limits apply
- Timeout after 193 seconds
- Concurrent requests limited to 1
- Retry up to 5 times

## Getting Help

- Check console for errors
- Try regenerating with different model
- Simplify prompt
- Check API key configuration
- Review error messages in UI

## Examples

See preset prompts in each mode for inspiration, or browse featured collections for high-quality examples.

