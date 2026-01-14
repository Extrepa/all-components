# Errl OS Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   cd /Users/extrepa/Projects/ErrlOS-Plugin
   npm install
   ```

2. **Build the plugin:**
   ```bash
   npm run build
   ```

3. **Install in Obsidian:**
   - Copy the following files to `.obsidian/plugins/errl-os/` in your vault:
     - `main.js`
     - `manifest.json`
     - `styles.css`
   - Or create a symlink for development:
     ```bash
     ln -s /Users/extrepa/Projects/ErrlOS-Plugin /path/to/vault/.obsidian/plugins/errl-os
     ```

4. **Enable the plugin:**
   - Open Obsidian Settings
   - Go to Community plugins
   - Find "Errl OS" and enable it

## First Use

1. **Dashboard will auto-open** (if enabled in settings)

2. **Configure paths** (recommended):
   - Go to Settings → Errl OS
   - Set "Project Pulse path" to your projects folder (e.g., `Projects/`, `02-Projects/`)
   - Set "Lore Engine entity paths" if you want to use lore features
   - The plugin will suggest common locations if it finds them
   - Paths are optional - features will show helpful messages if paths aren't configured

3. **Try capturing a thought:**
   - Press `Ctrl/Cmd + Shift + C`
   - Or click "Capture Idea" button on dashboard
   - Enter your thought and optional tag
   - Click "Capture"

4. **Explore the dashboard:**
   - Click "Open Gravity Well" to see your captures
   - Click "Refresh Dashboard" to update the dashboard
   - All buttons are functional!
   - If features show "*Configure path in settings*", go to Settings → Errl OS to set them up

## Commands

- **Errl: Open Dashboard** - Opens the dashboard
- **Errl: Refresh Dashboard** - Refreshes dashboard content
- **Errl: Capture Thought** - Opens capture modal (hotkey: `Ctrl/Cmd + Shift + C`)

## Settings

Access via Settings > Errl OS:
- Enable/disable organs
- Set dashboard path (default: `ErrlOS/Dashboard.md`)
- Set capture file path (default: `ErrlOS/Capture.md`)
- **Configure paths** for features:
  - Project Pulse path (e.g., `Projects/`)
  - Lore Engine entity paths (comma-separated)
  - Promotion paths (project and lore)
- Toggle auto-open dashboard on startup

**Path Configuration Tips:**
- The plugin will validate paths and show warnings if folders don't exist
- Common folder locations will be suggested automatically
- Leave paths empty to disable features

## Troubleshooting

- **Dashboard doesn't open:** Check settings > Errl OS > "Auto-open dashboard"
- **Buttons don't work:** Make sure you're viewing the dashboard note (not editing)
- **Commands not found:** Reload the plugin (disable and re-enable)

## Development

For development with hot-reload:
1. Install the Hot-Reload plugin in Obsidian
2. Run `npm run dev` (if you set up watch mode)
3. Changes will auto-reload

## File Structure

- `ErrlOS/Dashboard.md` - Your dashboard (auto-generated)
- `ErrlOS/Capture.md` - Your capture file (where thoughts go)

