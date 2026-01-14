# Errl OS Plugin

A modular creative operating system for Obsidian, built with an organ-based architecture.

## Quick Start

1. **For Users**: See [USER_GUIDE.md](USER_GUIDE.md) - Complete user documentation
2. **For Testing**: See [MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md) - Step-by-step testing guide
3. **For Developers**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - How to extend the plugin

## Project Status

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current implementation status, known issues, and next recommendations
- **[DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md)** - Ongoing development notes and current work

## Overview

Errl OS is not a productivity system—it's a **creative ecology**. Each feature is an independent module ("organ") that can be enabled, disabled, or replaced. The system grows with use, adapting to your workflow rather than enforcing rigid structure.

## Philosophy

- Capture before organize
- Momentum before completion
- Memory before optimization
- Systems must adapt to humans

## Current Features

### Phase 1: Foundation
- **Kernel**: Core orchestrator with module registry and shared APIs
- **Dashboard**: Interactive home screen that auto-opens on vault load
  - Clickable buttons that execute commands
  - Card-based grid layout
  - Respects custom Errl design system
- **Capture**: Zero-friction idea intake
  - Hotkey: `Ctrl/Cmd + Shift + C`
  - Append-only capture (never overwrites)
  - Timestamp and tag support

### Phase 2: Stability
- **Project Pulse**: Tracks project activity
  - Status icons: 🔥 active, ✨ warm, 🌙 dormant, 🪦 abandoned
  - Configurable thresholds
  - Dashboard integration
- **Time Machine**: Session logging
  - Date-based log files
  - Multiple sessions per day
  - Dashboard integration

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs

### For Users
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user guide with all features explained
- **[QUICK_START.md](QUICK_START.md)** - Quick installation and setup guide
- **[MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md)** - Testing checklist

### For Developers
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete developer guide
- **[TESTING_PROCEDURES.md](TESTING_PROCEDURES.md)** - Testing procedures and scenarios
- **[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)** - How to build the plugin

## Installation

1. Copy plugin files to `.obsidian/plugins/errl-os/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Enable in Obsidian: Settings → Community plugins → Errl OS

3. **First-Run Wizard** (automatic on first install):
   - The setup wizard will appear automatically
   - Guides you through 5 steps:
     1. Welcome and overview
     2. Path auto-detection (finds common vault structures)
     3. Path configuration (dashboard, capture, time machine, projects, lore)
     4. Feature selection (choose which organs to enable)
     5. Completion summary
   - All essential paths are configured during setup
   - You can change settings later in Settings → Errl OS

4. Dashboard should auto-open (if enabled in wizard or settings)

5. **Manual Configuration** (if needed):
   - Go to Settings → Errl OS
   - Configure paths for features you want to use:
     - **Dashboard**: Path to dashboard file (default: `ErrlOS/Dashboard.md`)
     - **Capture**: Path to capture file (default: `ErrlOS/Capture.md`)
     - **Project Pulse**: Set the path to your projects folder (e.g., `Projects/`, `02-Projects/`)
     - **Lore Engine**: Set paths to folders containing lore entities (e.g., `Creative/Lore/`)
   - The plugin will suggest common folder locations if it detects them in your vault

## Commands

- `Errl: Open Dashboard` - Open the dashboard
- `Errl: Capture Thought` - Open capture modal
- `Errl: Refresh Dashboard` - Refresh dashboard content
- `Errl: View Project Pulse` - Show project activity summary
- `Errl: Create Session Log` - Create new session log entry
- `Errl: View Time Machine` - Open Time Machine index

## Keyboard Shortcuts

- `Ctrl/Cmd + Shift + C` - Capture thought (when Capture organ enabled)

## Architecture

Errl OS uses an **organ-based architecture**:
- Each feature is an independent "organ"
- Organs can be enabled/disabled individually
- Organs register with a central kernel
- Shared APIs available to all organs
- Easy to add new organs

### Dashboard Architecture

The dashboard uses a **three-layer approach** to ensure grid layout works in both reading and editing modes:

1. **CSS (Static)**: Base styles with `!important` flags and CSS custom properties
   - Defined in `styles.css` with comprehensive selectors
   - Uses CSS variables for theme consistency
   - Works as the foundation layer

2. **Post-Processor (Dynamic)**: Applies inline styles when markdown is rendered
   - Runs when Obsidian renders markdown (reading/preview mode)
   - Applies grid styles directly to `.errl-grid` elements
   - Styles buttons to ensure they're clickable

3. **MutationObserver + Interval (Reactive)**: Catches dynamically added elements
   - MutationObserver watches for new grid elements (scoped to dashboard view)
   - Interval check (1s) ensures styles persist if overridden
   - Only re-applies if computed style shows `display !== "grid"`

**Why this approach?**
- Obsidian's reading mode can override CSS styles during rendering
- Elements are added dynamically during markdown processing
- Mode switching requires reactive updates
- Multiple layers ensure reliability even if one layer fails

**Performance Optimizations:**
- Event delegation (single document-level click handler)
- Scoped MutationObserver (dashboard view only, not entire document)
- Throttled interval (1s max, only re-applies when needed)
- Checks computed styles before re-applying (avoids unnecessary DOM writes)

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) and the [docs/](docs/) folder for detailed architecture documentation.

## Development

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for:
- Creating new organs
- Using shared APIs
- Dashboard integration
- Best practices

## Troubleshooting

### Dashboard Grid Not Displaying in Reading Mode

**Symptoms:** Cards appear in a vertical stack instead of a grid layout

**Solutions:**
1. **Reload the plugin**: Settings → Community plugins → Toggle Errl OS OFF/ON
2. **Refresh the dashboard**: Click the "Refresh Dashboard" button
3. **Check console**: Press `Cmd + Option + I` (Mac) and look for errors
4. **Verify you're in reading mode**: Press `Cmd + E` to toggle, ensure you see formatted cards

**If still not working:**
- Check console for `[Errl OS] Applied grid styles to X grid(s)` messages
- Verify CSS file is loaded: Check that `styles.css` exists in plugin directory
- Try rebuilding: `npm run build` then copy files to plugin directory

### Buttons Not Working

**Symptoms:** Buttons don't respond to clicks

**Solutions:**
1. **Ensure reading mode**: Buttons only work in reading/preview mode, not edit mode
2. **Check console**: Look for `[Errl OS] Button clicked!` messages
3. **Verify commands exist**: Check that commands appear in Command Palette
4. **Reload plugin**: Settings → Community plugins → Toggle Errl OS OFF/ON

**If still not working:**
- Check console for command execution errors
- Verify commands are registered: Look for `[Errl OS] Dashboard commands registered` in console
- Try using Command Palette directly to test if commands work

### CSS Variables Not Working

**Symptoms:** Styles look different than expected

**Solutions:**
1. **Check CSS file**: Ensure `styles.css` has the `:root` section with CSS variables
2. **Verify fallbacks**: CSS variables have fallback values, so should work even if variables aren't defined
3. **Rebuild**: Run `npm run build` to ensure latest CSS is included

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more detailed troubleshooting.

## Status

**Version**: 0.1.0  
**Status**: Production Ready  
**Phase**: All 5 Phases Complete (16 organs implemented)

For detailed status, see [PROJECT_STATUS.md](PROJECT_STATUS.md)

## License

MIT
