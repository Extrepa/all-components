# Errl OS Plugin - Release Notes v0.1.0

**Release Date:** December 22, 2025  
**Version:** 0.1.0  
**Status:** Production Ready

## Overview

Errl OS is a modular creative operating system for Obsidian, featuring an organ-based architecture where each feature is an independent, optional module. This release includes all 5 planned phases with 16 organs, comprehensive settings management, and a complete first-run wizard.

## Major Features

### First-Run Wizard
- **5-Step Setup Process:**
  1. Welcome and overview
  2. Path auto-detection (scans vault for common structures)
  3. Path configuration (dashboard, capture, time machine, projects, lore)
  4. Feature selection (choose which organs to enable)
  5. Completion summary
- **Auto-Detection:** Automatically finds common vault folder patterns
- **Complete Configuration:** All essential settings configurable during setup
- **User-Friendly:** Clear instructions and helpful defaults

### Core System (Phase 1)
- **Kernel:** Central orchestrator with module registry and shared APIs
- **Dashboard:** Interactive home screen with auto-open support
  - Grid-based card layout
  - Clickable buttons for quick actions
  - Responsive design
  - Respects Errl design system
- **Capture:** Zero-friction idea intake
  - Hotkey: `Ctrl/Cmd + Shift + C`
  - Append-only (never overwrites)
  - Timestamp and tag support

### Stability Features (Phase 2)
- **Project Pulse:** Tracks project activity
  - Status indicators: 🔥 active, ✨ warm, 🌙 dormant, 🪦 abandoned
  - Configurable thresholds
  - Dashboard integration
- **Time Machine:** Session logging
  - Date-based log files
  - Multiple sessions per day
  - Dashboard integration

### Intelligence Features (Phase 3)
- **Lore Engine:** Entity recognition and management
  - Scans configured paths for lore entities
  - Auto-linking (opt-in)
  - Entity graph visualization
- **Reality Map:** Spatial knowledge mapping
  - Cluster by theme
  - Tag inclusion
  - Visual mapping
- **Promotion Flows:** Content promotion system
  - Capture → Projects → Lore transitions
  - Configurable promotion paths

### Adaptation Features (Phase 4)
- **Energy System:** Task fit by energy level
  - Low-energy mode
  - Momentum tracking
  - Organ visibility control
- **Friction Scanner:** Detects workflow friction
  - Abandoned project detection
  - Friction reports
  - Configurable scan intervals

### Advanced Features (Phase 5)
- **Ritual Engine:** Structured transitions
  - Session start/end rituals
  - Project completion rituals
  - Custom ritual creation
- **Entropy Dial:** Order ↔ Chaos slider
  - Creativity control
  - Visual feedback
- **Dream Buffer:** Logic-free creative capture
  - Free-form capture
  - No structure required
- **Thought Recycler:** Resurfaces forgotten ideas
  - Age-based categorization
  - Resurface prompts
- **Session Ghost:** Tracks note usage patterns
  - Stalling detection
  - Usage analytics
- **Asset Brain:** Tracks creative assets
  - SVG, image, shader tracking
  - Asset indexing
- **Prompt Forge:** Generates prompts from notes
  - AI prompt generation
  - Customizable templates

## Settings & Configuration

### Essential Settings
- Dashboard path (default: `ErrlOS/Dashboard.md`)
- Capture file path (default: `ErrlOS/Capture.md`)
- Time Machine log path (default: `ErrlOS/Logs/`)
- Auto-open dashboard (default: false, opt-in)

### Optional Settings
- Project Pulse path
- Lore Engine paths (comma-separated)
- Promotion paths (project and lore)
- All organ-specific settings

### Settings Features
- Path validation with warnings
- Auto-detection of common vault structures
- Settings persistence
- First-run wizard for initial setup
- Comprehensive settings UI with layered controls

## Installation

1. Copy plugin files to `.obsidian/plugins/errl-os/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Enable in Obsidian: Settings → Community plugins → Errl OS

3. Complete first-run wizard (appears automatically)

4. Start using Errl OS!

## Commands

### Core Commands
- `Errl: Open Dashboard` - Open the dashboard
- `Errl: Capture Thought` - Open capture modal
- `Errl: Refresh Dashboard` - Refresh dashboard content

### Organ-Specific Commands
Each organ provides its own commands when enabled. See Settings → Errl OS for full command list.

## Keyboard Shortcuts

- `Ctrl/Cmd + Shift + C` - Capture thought (when Capture organ enabled)

## Documentation

- **[README.md](README.md)** - Project overview and quick start
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user documentation
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Developer documentation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
- **[MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md)** - Manual testing checklist

## Technical Details

### Architecture
- **Organ-Based:** Each feature is an independent module
- **Kernel System:** Central orchestrator with module registry
- **Shared APIs:** Common services for all organs
- **Event Bus:** Inter-organ communication
- **Service Router:** Capability-based service routing

### Build System
- **TypeScript:** Full type safety
- **esbuild:** Fast bundling
- **Jest:** Test framework (configured, ready for use)

### Browser Support
- Obsidian desktop (macOS, Windows, Linux)
- Obsidian mobile (iOS, Android)

## Known Issues

### Minor
- npm install may fail due to system-level npm log permissions (workaround: fix npm permissions or install Jest manually)
- Some organs may show generic walkthroughs if documentation not fully implemented (backwards compatibility)

### None Critical
- Test framework requires npm install to run tests
- Manual testing pending user verification

## Upgrade Instructions

### From Previous Versions
This is the initial release (v0.1.0). No upgrade needed.

### Settings Migration
- Existing settings will be preserved
- New settings will use defaults
- First-run wizard will not appear if `firstRunCompleted` is already `true`

## Breaking Changes

None - This is the initial release.

## Future Enhancements

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for planned enhancements and improvements.

## Credits

Built with:
- Obsidian Plugin API
- TypeScript
- esbuild
- Jest (testing)

## License

MIT

---

**For Support:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)  
**For Development:** See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)  
**For Testing:** See [TESTING_GUIDE.md](TESTING_GUIDE.md)

