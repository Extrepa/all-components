# Reset Errl OS Plugin Settings

## Quick Reset (Plugin Settings Only)

To reset only the Errl OS plugin settings to defaults:

1. **Close Obsidian completely**
2. **Navigate to your vault folder** (e.g., `ErrlVault`)
3. **Delete or rename the plugin data file:**
   - Path: `.obsidian/plugins/errl-os/data.json`
   - You can rename it to `data.json.backup` if you want to keep a copy
4. **Restart Obsidian**
5. The plugin will use `DEFAULT_SETTINGS` from the code

## Full Reset (All Obsidian Settings)

To reset ALL Obsidian settings (appearance, plugins, workspace, etc.):

⚠️ **WARNING**: This will reset ALL Obsidian settings, not just Errl OS!

1. **Close Obsidian completely**
2. **Backup your `.obsidian` folder** (recommended)
3. **Delete specific settings files** (safer):
   - `.obsidian/appearance.json` - Theme and appearance
   - `.obsidian/app.json` - Core app settings
   - `.obsidian/workspace.json` - Workspace layout
   - `.obsidian/plugins/errl-os/data.json` - Errl OS settings
4. **Or delete the entire `.obsidian` folder** (nuclear option)
5. **Restart Obsidian** - it will recreate default settings

## Reset via Terminal (macOS/Linux)

```bash
# Navigate to your vault
cd /Users/extrepa/Documents/ErrlVault

# Reset only Errl OS plugin
rm .obsidian/plugins/errl-os/data.json

# Or backup first
mv .obsidian/plugins/errl-os/data.json .obsidian/plugins/errl-os/data.json.backup
```

## Default Settings Reference

After reset, Errl OS will use these defaults:

- **Dashboard path**: `ErrlOS/Dashboard.md`
- **Capture file path**: `ErrlOS/Capture.md`
- **Project Pulse path**: (empty - disabled)
- **Time Machine log path**: `ErrlOS/Logs/`
- **Lore Engine paths**: (empty - disabled)
- **Enabled organs**: Only `dashboard` and `capture` are enabled by default
- **Auto-open dashboard**: `true`
- **First run completed**: `false` (will show setup wizard)

## Verify Reset

After resetting and restarting Obsidian:

1. Open Settings → Errl OS
2. Check that all settings match the defaults above
3. If `firstRunCompleted` is `false`, the setup wizard should appear

