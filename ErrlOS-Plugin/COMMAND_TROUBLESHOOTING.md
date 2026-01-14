# Command Troubleshooting - Errl OS

## Issue: Commands Not Appearing in Command Palette

### Quick Check

1. **Verify Dashboard is Enabled:**
   - Go to Settings → Errl OS
   - Check that "Dashboard" toggle is ON
   - If OFF, turn it ON and restart Obsidian

2. **Check Console:**
   - Press `Cmd + Option + I`
   - Look for: `"[Errl OS] Dashboard commands registered"`
   - If you don't see this, commands weren't registered

3. **Try Reloading Plugin:**
   - Settings → Community plugins
   - Toggle "Errl OS" OFF
   - Wait 2 seconds
   - Toggle it back ON
   - Check console for registration messages

### Command Names in Palette

Commands should appear as:
- **"Open Dashboard"** (not "Errl: Open Dashboard")
- **"Refresh Dashboard"**
- **"Capture Thought"**
- **"View Project Pulse"** (if Project Pulse enabled)
- **"Create Session Log"** (if Time Machine enabled)
- **"View Time Machine"** (if Time Machine enabled)

Obsidian automatically groups commands by plugin, so they'll be under "Errl OS" section.

### If Commands Still Don't Appear

1. **Check if Dashboard organ is enabled:**
   - Console should show: `"[Errl OS] Dashboard organ enabled"`
   - Settings → Errl OS → Dashboard toggle should be ON

2. **Check for errors:**
   - Look for any red errors in console
   - Check for `"[Errl OS] Failed to enable organ dashboard"`

3. **Manual command test:**
   - In console, try: `app.commands.executeCommandById("errl-os:open-dashboard")`
   - If this works, the command exists but isn't showing in palette
   - If this fails, command wasn't registered

### Alternative: Use Dashboard Button

If commands don't appear, you can:
1. Open the dashboard file directly: `ErrlOS/Dashboard.md`
2. Use the "Refresh Dashboard" button on the dashboard
3. The dashboard has buttons that work even if commands don't appear in palette

### Fix Applied

I've added console logging to help diagnose:
- `"[Errl OS] Dashboard organ enabled"` - Confirms organ is enabled
- `"[Errl OS] Dashboard commands registered"` - Confirms commands registered

Check your console after reloading the plugin to see these messages.

