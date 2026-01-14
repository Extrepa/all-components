# Theme Lab Usage Guide

Step-by-step guides for common tasks in Theme Lab.

## Getting Started

### Opening Theme Lab

**Development Mode:**
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000 in your browser
4. The app loads with the default "Errl Core" theme
5. Browse themes in the left sidebar

**Production Build:**
1. Build the project: `npm run build`
2. Preview the build: `npm run preview`
3. Or serve the `dist/` folder with any static file server

### Basic Navigation
- **Click theme name** - Switch to that theme
- **Random button** - Get a random theme
- **Search box** - Filter themes by name

## Switching Themes

### Method 1: Click Theme
1. Scroll through theme list in sidebar
2. Click any theme name
3. Preview area updates instantly

### Method 2: Random Theme
- Click the "🎲 Random" button in the sidebar
- Gets a random theme from the 25 available themes

### Method 3: Search
1. Type in search box
2. Themes filter in real-time
3. Click filtered theme

## Adjusting Layout

### Density Settings
1. Scroll to bottom of sidebar
2. Find "Density" section
3. Click: Compact, Cozy, or Spacious
4. Preview updates immediately

### Visual Toggles
1. Find "Borders & Shadows" section
2. Toggle Borders on/off
3. Toggle Shadows on/off
4. Changes apply instantly

### Sidebar Options
1. Find "Sidebar" section
2. Choose Gradient or Solid background
3. Find "Header" section
4. Show or hide header

## Exporting Themes

### Export as JSON
1. Click "📤 Export JSON" button
2. File downloads automatically
3. Save file for later use

### Copy CSS
1. Click "📋 Copy CSS" button
2. CSS copied to clipboard
3. Paste into your project

### Generate Code Snippets
1. Click "💻 Code Snippets" button
2. Select format (React, Tailwind, etc.)
3. Code copied to clipboard
4. Paste into your project

## Importing Themes

### Import from JSON
1. Click "📥 Import" button
2. Paste your theme JSON
3. Click "Import Theme"
4. Theme appears in sidebar

### JSON Format
```json
{
  "id": "my-theme",
  "label": "My Theme",
  "tokens": {
    "bg": "#02070a",
    "accent": "#34e1ff",
    "text": "#ecf9ff"
  }
}
```

## Editing Themes

### Visual Editor
1. Click "🎨 Edit Theme" button
2. Use color pickers to change colors
3. See live preview updates
4. Click "Apply Changes" to use temporarily
5. Click "Export as New Theme" to save

### Manual Editing
1. Open `shared/theme.css`
2. Find theme block
3. Edit color values
4. Refresh browser

## Saving Presets

### Create Preset
1. Set your desired theme and layout
2. Click "💾 Save Preset" button
3. Enter preset name
4. Click "Save Preset"
5. Preset saved to browser

### Load Preset
1. Click "📚 Presets" button (if available)
2. Click "Load" on desired preset
3. Theme and layout restore

### Delete Preset
1. Open Presets manager
2. Click 🗑️ on preset
3. Confirm deletion

## Validating Themes

### Run Validation
1. Click "✓ Validate" button
2. Review results modal
3. Check errors and warnings
4. Follow fix suggestions

### Understanding Results
- **AAA** - Meets highest standards
- **AA** - Meets minimum standards
- **Fail** - Has accessibility issues
- **Score** - Percentage of checks passed

## Comparing Themes

### Compare Two Themes
1. Click "⚖️ Compare" button
2. Select Theme 1 from dropdown
3. Select Theme 2 from dropdown
4. View side-by-side comparison
5. Differences highlighted in yellow

## Viewing Tokens

### Token Reference
1. Click "🎨 Tokens" button
2. Browse tokens by category
3. Click any token to copy variable name
4. See color swatches and hex values

## Using Component Playground

### Edit Components
1. Click "🧩 Playground" button
2. Edit HTML in left panel
3. See live preview in right panel
4. Click "Copy HTML" to save
5. Click "Reset" to start over

### Example HTML
```html
<button class="btn btn-primary">Click me</button>
<div class="card">
  <div class="card-body">Content</div>
</div>
```

## Testing Animations

### Animation Playground
1. Click "🎬 Animations" button
2. Hover over elements to see transitions
3. Test different timing values
4. See loading spinner

## Responsive Preview

### Change Viewport
1. Find viewport controls at top of preview
2. Click: Mobile, Tablet, Desktop, or Full
3. Preview area adjusts width
4. Test components at different sizes

## Sharing Themes

### Generate Share URL
1. Set your desired theme and layout
2. Click "🔗 Share" button
3. Copy URL from input
4. Share with others

### Load Shared Theme
1. Open shared URL
2. Theme and layout load automatically
3. URL cleans after loading

## Keyboard Shortcuts

### Quick Reference
- `R` - Random theme
- `E` - Export
- `C` - Copy CSS
- `V` - Validate
- `T` - Tokens
- `I` - Import
- `P` - Preset
- `1-9` - Quick theme switch
- `↑/↓` - Navigate themes
- `Cmd/Ctrl + K` - Command palette
- `Cmd/Ctrl + ?` - Help
- `Esc` - Close modals

### Command Palette
1. Press `Cmd/Ctrl + K`
2. Type to search commands
3. Press Enter to execute
4. Press Esc to close

## Tips & Tricks

### Power User Tips
1. Use keyboard shortcuts for speed
2. Save presets for common configurations
3. Use search to find themes quickly
4. Compare themes before choosing
5. Validate before exporting

### Workflow Suggestions
1. **Explore** - Try random themes
2. **Compare** - Compare similar themes
3. **Edit** - Customize with visual editor
4. **Validate** - Check accessibility
5. **Export** - Generate code for your project

### Best Practices
1. Always validate themes before use
2. Test responsive at different sizes
3. Check contrast for accessibility
4. Save presets for team sharing
5. Document custom themes

## Troubleshooting

### Theme Not Applying
- Check theme ID matches exactly
- Ensure `theme.css` loads before `core.css`
- Verify `data-theme` attribute on `<html>`

### Components Not Styled
- Check `core.css` is loaded
- Verify class names are correct
- Check browser console for errors

### Export Not Working
- Check browser permissions
- Try different export format
- Check browser console for errors

### Presets Not Saving
- Check browser allows localStorage
- Try clearing browser cache
- Check browser console for errors

## Advanced Usage

### Programmatic Access
```javascript
// Set theme
setTheme("errl-core");

// Get tokens
const tokens = getComputedThemeTokens("errl-core");

// Set layout
setLayout("density", "spacious");

// Validate
const results = validateTheme("errl-core");
```

### Custom Integration
1. Copy `theme.css` to your project
2. Copy `core.css` to your project
3. Set `data-theme` on `<html>`
4. Use component classes

### Extending Themes
1. Add new theme block to `theme.css`
2. Add entry to `THEMES` array
3. Refresh browser

## Getting Help

### Documentation
- See `README.md` for overview
- See `docs/` folder for detailed docs
- Check inline code comments

### Common Issues
- Check troubleshooting section
- Review error messages
- Validate theme structure

### Feature Requests
- Check `PLAN.md` for roadmap
- Review completed features
- See what's coming next

