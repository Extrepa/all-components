# Errl OS Plugin - Troubleshooting Guide

## Plugin Failed to Load

### Step 1: Check Console for Errors

**On Mac Obsidian, access console using one of these methods:**

**Method 1 (Easiest):** Press `Cmd + Option + I`

**Method 2:** Command Palette (`Cmd + P`) → Type "Developer" or "Console"

**Method 3:** Settings → Look for "Developer" or "Advanced" section

**Method 4:** View menu → "Developer Tools" or "Toggle Developer Tools"

Once console is open:
1. Click the **Console** tab
2. Look for error messages (usually in red)
3. Look for messages starting with `[Errl OS]`
4. **Copy the full error message** - this is critical for diagnosis

### Step 2: Verify Plugin Files

Check that these files exist in `.obsidian/plugins/errl-os/`:

```
.obsidian/plugins/errl-os/
├── main.js (should be ~24KB)
├── manifest.json (236 bytes)
└── styles.css (2.4KB)
```

**Quick check:**
- Open Finder/File Manager
- Navigate to your vault folder
- Go to `.obsidian/plugins/errl-os/`
- Verify all 3 files are present

### Step 3: Check File Permissions

On macOS, files should be readable. If you see permission errors:
- Right-click the plugin folder
- Get Info
- Check "Sharing & Permissions" - should be "Read & Write"

### Step 4: Verify manifest.json

The `manifest.json` should contain:
```json
{
	"id": "errl-os",
	"name": "Errl OS",
	"version": "0.1.0",
	"minAppVersion": "0.15.0",
	"description": "A modular creative operating system for Obsidian",
	"author": "",
	"authorUrl": "",
	"fundingUrl": "",
	"isDesktopOnly": false
}
```

### Step 5: Check main.js

The `main.js` file should:
- Be approximately 24KB in size
- Start with JavaScript code (not empty)
- Not be corrupted

### Step 6: Common Issues

#### Issue: "Plugin failed to load"
**Possible causes:**
1. Missing files (main.js, manifest.json, or styles.css)
2. Corrupted main.js file
3. Syntax error in main.js
4. Manifest.json is invalid JSON
5. File permissions issue

#### Issue: "Cannot find module"
**Solution:** Rebuild the plugin:
```bash
cd /path/to/ErrlOS-Plugin
npm run build
cp main.js styles.css /path/to/vault/.obsidian/plugins/errl-os/
```

#### Issue: "SyntaxError" or "ReferenceError"
**Solution:** The main.js file may be corrupted. Rebuild and recopy.

### Step 7: Reinstall Plugin

If nothing works, try a fresh install:

1. **Disable plugin** in Obsidian settings
2. **Delete plugin folder**: `.obsidian/plugins/errl-os/`
3. **Rebuild plugin** (if you have the source):
   ```bash
   cd /Users/extrepa/Projects/ErrlOS-Plugin
   npm run build
   ```
4. **Copy files** to plugin directory:
   ```bash
   cp main.js styles.css manifest.json /Users/extrepa/Documents/ErrlVault/.obsidian/plugins/errl-os/
   ```
5. **Restart Obsidian**
6. **Enable plugin** in settings

### Step 8: Check Obsidian Version

Your Obsidian version: v1.10.6 ✅ (compatible - minAppVersion is 0.15.0)

### Step 9: Check for Conflicts

With 11 plugins enabled, check if disabling other plugins helps:
1. Disable all plugins except Errl OS
2. Restart Obsidian
3. See if Errl OS loads
4. If yes, re-enable plugins one by one to find conflict

### Step 10: Get Error Details

**What I need to help you:**
1. **Exact error message** from console
2. **File sizes** of main.js, manifest.json, styles.css
3. **Whether files exist** in the plugin directory
4. **Any other console errors** (even if not Errl OS related)

### Quick Fix: Rebuild and Recopy

If you have the source code:

```bash
# Navigate to plugin source
cd /Users/extrepa/Projects/ErrlOS-Plugin

# Rebuild
npm run build

# Copy to plugin directory
cp main.js styles.css manifest.json /Users/extrepa/Documents/ErrlVault/.obsidian/plugins/errl-os/

# Restart Obsidian
```

## Common Issues

### Dashboard Issues

#### Dashboard doesn't open automatically
**Symptoms:** Dashboard doesn't appear when Obsidian starts

**Solutions:**
1. Check Settings → Errl OS → "Auto-open dashboard" is enabled
2. Manually open: Command Palette → "Errl: Open Dashboard"
3. Check dashboard path exists: Settings → Errl OS → "Dashboard path"
4. Verify Dashboard organ is enabled

#### Dashboard buttons don't work
**Symptoms:** Clicking buttons on dashboard does nothing

**Solutions:**
1. Refresh dashboard: Click "Refresh Dashboard" button
2. Check console for errors (Help → Toggle Developer Tools)
3. Verify plugin is enabled
4. Try reloading plugin: Disable and re-enable in settings

#### Dashboard shows old content
**Symptoms:** Dashboard content doesn't update

**Solutions:**
1. Click "Refresh Dashboard" button
2. Close and reopen dashboard file
3. Check if organs are enabled (disabled organs won't show data)

### Path Configuration Issues

#### "Path not configured" messages
**Symptoms:** Dashboard or commands show "Path not configured" notices

**Solutions:**
1. Go to Settings → Errl OS
2. Use "Auto-detect paths" button if available
3. Or manually set paths to match your vault structure
4. Use "Create Folder" button if paths don't exist

#### Paths don't work after configuration
**Symptoms:** Configured paths don't work

**Solutions:**
1. Verify paths are relative to vault root (e.g., `Projects/` not `/Projects/`)
2. Check paths don't contain invalid characters
3. Ensure folders exist (use "Create Folder" button)
4. Paths should end with `/` for folders

#### Auto-detect paths doesn't find anything
**Symptoms:** Auto-detect shows no paths found

**Solutions:**
1. This is normal if your vault structure doesn't match common patterns
2. Manually configure paths instead
3. Check that folders exist in your vault

### Organ-Specific Issues

#### Project Pulse shows no projects
**Symptoms:** Project Pulse card shows "No projects found" or empty

**Solutions:**
1. Verify Project Pulse organ is enabled
2. Check project path is configured correctly
3. Ensure project folders exist in the configured path
4. Check that folders contain files (empty folders may not show)

#### Lore Engine doesn't find entities
**Symptoms:** Lore Engine scan finds no entities

**Solutions:**
1. Verify Lore Engine organ is enabled
2. Check entity paths are configured
3. Ensure files have frontmatter with `type` field
4. Check files are in configured paths
5. Run "Scan Lore Entities" command manually

#### Capture doesn't work
**Symptoms:** Capture command or hotkey doesn't work

**Solutions:**
1. Verify Capture organ is enabled
2. Check capture file path is valid
3. Check console for errors
4. Try Command Palette → "Errl: Capture Thought" instead of hotkey
5. Verify hotkey isn't conflicting with another plugin

#### Time Machine logs not appearing
**Symptoms:** Time Machine shows no logs

**Solutions:**
1. Verify Time Machine organ is enabled
2. Create a session log first: Command Palette → "Errl: Create Session Log"
3. Check log path is configured correctly
4. Verify log files exist in the log path

### Performance Issues

#### Dashboard is slow to load
**Symptoms:** Dashboard takes a long time to generate

**Solutions:**
1. Disable unused organs in settings
2. Enable low-energy mode (if Energy organ is enabled)
3. Reduce number of projects in Project Pulse path
4. Check if vault is very large (may need optimization)

#### Plugin causes Obsidian to lag
**Symptoms:** Obsidian becomes slow with plugin enabled

**Solutions:**
1. Disable unused organs
2. Check console for errors (may indicate infinite loops)
3. Reduce number of files scanned (e.g., limit Project Pulse path)
4. Report issue with console logs

### Settings Issues

#### Settings don't save
**Symptoms:** Settings revert after closing settings

**Solutions:**
1. Check console for errors
2. Verify plugin has write permissions
3. Try disabling and re-enabling plugin
4. Check if vault is read-only

#### Organ toggles don't work
**Symptoms:** Toggling organs on/off doesn't change behavior

**Solutions:**
1. Reload plugin after changing organ settings
2. Check console for errors
3. Verify organ is properly registered in main.ts
4. Restart Obsidian if needed

### File Operation Issues

#### Files not created
**Symptoms:** Commands that should create files don't work

**Solutions:**
1. Check console for errors
2. Verify paths are valid
3. Check file permissions
4. Ensure parent directories exist
5. Check if file already exists (may need to handle differently)

#### Files created in wrong location
**Symptoms:** Files appear in unexpected places

**Solutions:**
1. Check path configuration in settings
2. Verify paths are relative to vault root
3. Check for typos in paths
4. Use "Create Folder" button to ensure paths exist

## FAQ

### General Questions

**Q: Do I need to configure all paths?**  
A: No, only configure paths for organs you want to use. The plugin works with minimal configuration.

**Q: Can I use the plugin with my existing vault structure?**  
A: Yes! The plugin adapts to any vault structure. Just configure paths to match your folders.

**Q: Will the plugin modify my existing files?**  
A: The plugin only creates new files in configured paths. It doesn't modify existing files unless you use specific commands (like promotion flows).

**Q: Can I disable organs I don't use?**  
A: Yes! Disable any organs you don't need in Settings → Errl OS. This improves performance.

**Q: How do I update the plugin?**  
A: Replace the plugin files (main.js, styles.css, manifest.json) in `.obsidian/plugins/errl-os/` and restart Obsidian.

### Path Questions

**Q: What format should paths be in?**  
A: Paths should be relative to vault root and end with `/` for folders. Examples: `Projects/`, `Creative/Lore/`

**Q: Can I use absolute paths?**  
A: No, use relative paths from vault root.

**Q: What if my vault uses a different structure?**  
A: Just configure the paths to match your structure. The plugin works with any organization.

**Q: Can I have multiple paths for Lore Engine?**  
A: Yes, use comma-separated paths in the Lore Engine entity paths setting.

### Feature Questions

**Q: How does Project Pulse determine project status?**  
A: It uses file modification times. Projects modified recently are "active", older ones are "warm", "dormant", or "abandoned" based on thresholds.

**Q: How does Lore Engine find entities?**  
A: It scans configured paths for markdown files with frontmatter containing a `type` field.

**Q: What's the difference between Capture and other note-taking?**  
A: Capture is designed for quick, friction-free idea intake. It's append-only and timestamped.

**Q: Can I customize the dashboard?**  
A: Yes! You can hide cards, change layout, and reorder cards in Settings → Errl OS → Dashboard Customization.

### Troubleshooting Questions

**Q: How do I see error messages?**  
A: Open Developer Tools (Help → Toggle Developer Tools or Cmd+Option+I on Mac) and check the Console tab.

**Q: The plugin worked before but stopped working**  
A: Try reloading the plugin (disable and re-enable), or restart Obsidian. Check console for errors.

**Q: I'm getting permission errors**  
A: Check file permissions on the plugin directory and vault. On Mac, ensure files are readable.

**Q: Commands don't appear in Command Palette**  
A: Verify the organ is enabled. Try reloading the plugin. Check console for registration errors.

## Advanced Troubleshooting

### Debug Mode

To enable more detailed logging:

1. Open Developer Tools (Help → Toggle Developer Tools)
2. Go to Console tab
3. Look for messages starting with `[Errl OS]`
4. These messages help diagnose issues

### Manual Plugin Reload

1. Settings → Community plugins
2. Find "Errl OS"
3. Toggle OFF
4. Wait a moment
5. Toggle ON

### Reset Settings

If settings are corrupted:

1. Close Obsidian
2. Navigate to `.obsidian/plugins/errl-os/`
3. Delete `data.json` (if it exists)
4. Restart Obsidian
5. Reconfigure settings

### Check Plugin Version

Verify you have the correct version:

1. Settings → Community plugins
2. Find "Errl OS"
3. Check version number
4. Compare with expected version in manifest.json

## Still Not Working?

Share:
1. The exact console error message
2. File sizes in plugin directory
3. Whether you can see the files in Finder
4. Your Obsidian version
5. Which organs are enabled
6. Your vault structure (folder names)

Then I can provide a specific fix!

