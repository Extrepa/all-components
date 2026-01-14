# Build Instructions

## System Issue

The automated `npm install` is failing due to system-level npm permissions. This needs to be run manually.

## Manual Build Steps

### 1. Install Dependencies

Open a terminal and run:
```bash
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm install
```

If you encounter permission errors, you may need to:
- Fix npm permissions: `sudo chown -R $(whoami) ~/.npm`
- Or use a node version manager (nvm, fnm, etc.)

### 2. Build the Plugin

Once dependencies are installed:
```bash
npm run build
```

This will create:
- `main.js` - The compiled plugin
- `main.js.map` - Source map (optional, for debugging)

### 3. Copy to Obsidian

Copy these files to your vault's plugin directory:
```bash
cp main.js manifest.json styles.css /Users/extrepa/Documents/ErrlVault/.obsidian/plugins/errl-os/
```

Or manually copy:
- `main.js`
- `manifest.json`
- `styles.css`

To: `/Users/extrepa/Documents/ErrlVault/.obsidian/plugins/errl-os/`

### 4. Enable in Obsidian

1. Open Obsidian
2. Go to Settings → Community plugins
3. Find "Errl OS" in the list
4. Toggle it ON

### 5. Test

1. The dashboard should auto-open (if enabled in settings)
2. Try the capture hotkey: `Ctrl/Cmd + Shift + C`
3. Click buttons on the dashboard to test interactivity

## Development Workflow

For active development:

1. **Use Hot-Reload plugin** (recommended):
   - Install "Hot-Reload" plugin in Obsidian
   - It will automatically reload your plugin when files change

2. **Or manual reload**:
   - Disable and re-enable the plugin in settings
   - Or use the command: "Reload app without saving"

3. **Watch mode** (if configured):
   ```bash
   npm run dev
   ```
   This will watch for changes and rebuild automatically.

## Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build` will show them
- Verify `tsconfig.json` is correct

### Plugin Not Loading
- Check that all three files are in the plugin directory
- Verify `manifest.json` has correct `id` field
- Check Obsidian console for errors (Help → Toggle Developer Tools)

### Buttons Not Working
- Make sure you're viewing (not editing) the dashboard note
- Check browser console for JavaScript errors
- Verify command IDs match between registration and dashboard HTML

### Dashboard Not Auto-Opening
- Check Settings → Errl OS → "Auto-open dashboard"
- Verify dashboard path is correct
- Try manually opening: Command palette → "Errl: Open Dashboard"

