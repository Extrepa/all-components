# Errl OS Plugin - User Guide

## Introduction

Errl OS is a modular creative operating system built inside Obsidian. It provides a dashboard-centric interface for managing your creative workflow, capturing ideas, tracking projects, and logging sessions.

## Installation

1. Copy the plugin files to `.obsidian/plugins/errl-os/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Open Obsidian Settings → Community plugins

3. Find "Errl OS" and toggle it ON

4. **First-Run Wizard** will appear automatically:
   - Guides you through initial setup
   - Auto-detects your vault structure
   - Configures essential paths
   - Lets you choose which features to enable
   - See "First-Run Wizard" section below for details

## Quick Start

### First Steps

1. **Complete First-Run Wizard** (if first time):
   - The wizard appears automatically when you first enable the plugin
   - Follow the 5-step setup process
   - Configure paths and select features to enable

2. **Open Dashboard**: The dashboard should auto-open when you start Obsidian (if enabled). If not, use Command Palette (`Ctrl/Cmd + P`) → "Errl: Open Dashboard"

3. **Capture an Idea**: Press `Ctrl/Cmd + Shift + C` or click "Capture Idea" on the dashboard

4. **Explore Settings**: Go to Settings → Errl OS to customize paths and enable/disable features

## First-Run Wizard

When you first enable Errl OS, a setup wizard will guide you through configuration:

### Step 1: Welcome
- Overview of what Errl OS does
- Explains the setup process

### Step 2: Path Auto-Detection
- Automatically scans your vault for common folder patterns
- Detects project folders, lore folders, capture files, and log directories
- Shows detected paths you can accept or modify

### Step 3: Path Configuration
Configure essential paths:
- **Dashboard Path**: Where the dashboard file is stored (default: `ErrlOS/Dashboard.md`)
- **Capture File Path**: Where captured ideas are stored (default: `ErrlOS/Capture.md`)
- **Time Machine Log Path**: Where session logs are stored (default: `ErrlOS/Logs/`)
- **Project Pulse Path**: Folder containing your projects (optional)
- **Lore Engine Paths**: Folders containing lore entities (optional, comma-separated)

### Step 4: Feature Selection
- Choose which organs (features) to enable
- Dashboard and Capture are recommended and enabled by default
- Toggle "Auto-open dashboard" if you want the dashboard to open automatically on startup

### Step 5: Completion
- Summary of your configuration
- Tips for getting started
- Click "Complete Setup" to finish

**Note:** You can change all these settings later in Settings → Errl OS

## Manual Configuration (Alternative)

If you prefer to configure manually or need to change settings later:

### Path Configuration

1. **Go to Settings → Errl OS**

2. **Project Pulse** (optional):
   - Set "Project Pulse path" to the folder containing your project folders
   - Examples: `Projects/`, `projects/`, `02-Projects/`
   - The plugin will scan this folder for project subfolders
   - If the path is empty or the folder doesn't exist, Project Pulse will show a helpful message

3. **Lore Engine** (optional):
   - Set "Lore Engine entity paths" to folders containing lore entities (comma-separated)
   - Examples: `Creative/Lore/`, `Lore/`, `03-Creative/Lore Hub/`
   - The plugin will scan these folders for lore entities
   - Leave empty to disable

4. **Promotion Flows** (optional):
   - Set "Promotion project path" to where promoted projects should be created
   - Set "Promotion lore path" to where promoted lore content should be created
   - Leave empty to disable promotion to that location

### Path Validation

The settings page will:
- Show warnings if paths don't exist
- Suggest common folder locations if detected in your vault
- Provide helpful messages to guide configuration

### Common Vault Structures

The plugin works with any structure. Common patterns:
- **Simple**: `Projects/`, `Lore/`
- **Numbered**: `02-Projects/`, `03-Creative/Lore Hub/`
- **Nested**: `Work/Projects/`, `Creative/Worldbuilding/Lore/`

Just configure the paths to match your structure!

## Features

### Dashboard

The dashboard is your home screen in Errl OS. It provides:

- **Quick Actions**: Buttons to capture ideas, open files, refresh content
- **Project Pulse**: See which projects are active, warm, dormant, or abandoned
- **Time Machine**: View recent session logs
- **Module Status**: See which organs are enabled/disabled

**Dashboard Cards:**
- **Capture**: Quick capture and open gravity well
- **Dashboard**: Refresh dashboard content
- **Project Pulse**: Real-time project activity (when enabled)
- **Time Machine**: Recent session logs (when enabled)
- **Modules**: Organ status display
- **Today's Context**: Daily context placeholder

### Capture Organ

Zero-friction idea intake system.

**Features:**
- Hotkey: `Ctrl/Cmd + Shift + C`
- Append-only capture (never overwrites)
- Timestamp and tag support
- Quick modal interface

**Usage:**
1. Press `Ctrl/Cmd + Shift + C`
2. Type your thought
3. Add optional tag
4. Click "Capture"

**Settings:**
- Configure capture file path (default: `ErrlOS/Capture.md`)

### Project Pulse Organ

Tracks project activity based on file modification times.

**Status Icons:**
- 🔥 **Active**: Modified within last 3 days (configurable)
- ✨ **Warm**: Modified 3-14 days ago (configurable)
- 🌙 **Dormant**: Modified 14-90 days ago (configurable)
- 🪦 **Abandoned**: Not modified in 90+ days (configurable)

**Features:**
- Scans project directories automatically
- Shows in dashboard with clickable project links
- Command: "Errl: View Project Pulse" (shows summary)

**Settings:**
- Configure project path (required - set in Settings → Errl OS)
- Adjust thresholds for active/warm/dormant status
- If path is not configured or folder doesn't exist, the dashboard will show a helpful message

**Usage:**
1. Enable Project Pulse in settings
2. Ensure you have a `Projects/` folder (or configure custom path)
3. Dashboard will show project activity automatically
4. Click project names to open them

### Time Machine Organ

Session logging system for preserving creative memory.

**Features:**
- Date-based log files (YYYY-MM-DD.md)
- Multiple sessions per day append to same file
- Auto-opens log for editing after creation
- Recent logs shown in dashboard

**Commands:**
- "Errl: Create Session Log" - Creates new session entry
- "Errl: View Time Machine" - Opens log index

**Settings:**
- Configure log path (default: `ErrlOS/Logs/`)

**Usage:**
1. Enable Time Machine in settings
2. Use Command Palette → "Errl: Create Session Log"
3. Log file opens automatically for editing
4. View recent logs in dashboard

## Settings

Access settings via: Settings → Errl OS

### Dashboard Settings
- **Dashboard path**: Where the dashboard file is stored (default: `ErrlOS/Dashboard.md`)
- **Auto-open dashboard**: Automatically open dashboard on vault load

### Capture Settings
- **Capture file path**: Where captured thoughts are stored (default: `ErrlOS/Capture.md`)

### Project Pulse Settings
- **Project Pulse path**: Root directory to scan for projects (default: `Projects/`)
- **Active threshold**: Days for active status (default: 3)
- **Warm threshold**: Days for warm status (default: 14)
- **Dormant threshold**: Days for dormant status (default: 90)

### Time Machine Settings
- **Time Machine log path**: Where session logs are stored (default: `ErrlOS/Logs/`)

### Organ Management
Toggle organs ON/OFF:
- Dashboard
- Capture
- Project Pulse
- Time Machine
- (Future organs will appear here)

## Commands

All commands accessible via Command Palette (`Ctrl/Cmd + P`):

- **Errl: Open Dashboard** - Open the dashboard
- **Errl: Capture Thought** - Open capture modal
- **Errl: Refresh Dashboard** - Refresh dashboard content
- **Errl: View Project Pulse** - Show project activity summary
- **Errl: Create Session Log** - Create new session log entry
- **Errl: View Time Machine** - Open Time Machine index

## Keyboard Shortcuts

- `Ctrl/Cmd + Shift + C` - Capture thought (when Capture organ enabled)

## Troubleshooting

### Dashboard doesn't auto-open
- Check Settings → Errl OS → "Auto-open dashboard" is enabled
- Try manually opening: Command Palette → "Errl: Open Dashboard"

### Project Pulse shows no projects
- Verify Projects folder exists (or configured path is correct)
- Check that Project Pulse organ is enabled
- Ensure folders exist in the project path

### Capture not working
- Verify Capture organ is enabled
- Check capture file path is valid
- Check console for errors (Help → Toggle Developer Tools)

### Time Machine logs not appearing
- Verify Time Machine organ is enabled
- Check log path is valid
- Create a session log first: Command Palette → "Errl: Create Session Log"

### Buttons not working
- Refresh dashboard: Click "Refresh Dashboard" button
- Check console for errors
- Verify plugin is enabled

## Tips

1. **Customize Paths**: Adjust file paths in settings to match your vault structure
2. **Enable as Needed**: Only enable organs you use to keep the system lightweight
3. **Use Hotkeys**: Learn the capture hotkey for quick idea capture
4. **Check Dashboard**: Dashboard refreshes show latest project activity
5. **Session Logs**: Create session logs regularly to track your creative process

## File Structure

Errl OS creates these files/folders:

```
ErrlOS/
├── Dashboard.md          # Main dashboard
├── Capture.md            # Captured thoughts
└── Logs/                # Session logs
    ├── YYYY-MM-DD.md    # Daily session logs
    └── Time-Machine-Index.md
```

## Philosophy

Errl OS follows these principles:

- **Capture before organize**: Get ideas down quickly
- **Momentum before completion**: Keep things moving
- **Memory before optimization**: Preserve context
- **Systems adapt to humans**: Not the other way around

## Support

For issues or questions:
1. Check console for error messages (Help → Toggle Developer Tools)
2. Review settings to ensure paths are correct
3. Verify organs are enabled
4. Check that required folders exist

## Tutorial: Your First Week with Errl OS

### Day 1: Setup and First Capture

1. **Install and Enable**
   - Install the plugin
   - Enable it in Settings → Community plugins
   - Dashboard should auto-open

2. **First Capture**
   - Press `Ctrl/Cmd + Shift + C`
   - Capture your first idea
   - Open the capture file to see it

3. **Explore Dashboard**
   - Review all available cards
   - Click around to see what's available
   - Customize card visibility in settings

### Day 2-3: Configure Paths

1. **Set Up Project Pulse**
   - Go to Settings → Errl OS
   - Use "Auto-detect paths" button if available
   - Or manually set "Project Pulse path" to your projects folder
   - Enable Project Pulse organ
   - Refresh dashboard to see projects

2. **Set Up Lore Engine** (if using)
   - Configure "Lore Engine entity paths"
   - Enable Lore Engine organ
   - Run "Scan Lore Entities" command

### Day 4-5: Use Promotion Flows

1. **Capture to Project**
   - Capture an idea
   - Use "Promote Content" command
   - Select "capture-to-project"
   - Watch it create a project folder

2. **Project to Lore**
   - When a project is ready
   - Use "Promote Content" command
   - Select "project-to-lore"
   - Creates a lore entity file

### Day 6-7: Explore Advanced Features

1. **Time Machine**
   - Create session logs
   - Review your work history
   - Track your progress

2. **Energy System**
   - Set your energy level
   - Enable low-energy mode
   - See how dashboard adapts

3. **Other Organs**
   - Try Dream Buffer for unstructured ideas
   - Use Thought Recycler to find old ideas
   - Explore Asset Brain for creative assets

## Common Workflows

### Daily Creative Workflow

1. **Morning**
   - Open dashboard
   - Review Project Pulse
   - Check Time Machine for yesterday's work

2. **During Work**
   - Capture ideas as they come (`Ctrl/Cmd + Shift + C`)
   - Work on active projects
   - Update project files

3. **Evening**
   - Create session log
   - Review captures
   - Promote ideas to projects if ready

### Project Development Workflow

1. **Idea Phase**
   - Capture idea
   - Let it sit in capture file

2. **Development Phase**
   - Promote to project when ready
   - Work on project files
   - Project Pulse tracks activity

3. **Completion Phase**
   - Promote to lore if it becomes canon
   - Or archive if abandoned

### Lore Management Workflow

1. **Create Entities**
   - Add frontmatter to markdown files
   - Include `type`, `name`, `canonStatus`, `tags`

2. **Scan and Index**
   - Run "Scan Lore Entities" command
   - View Lore Index to see all entities

3. **View Relationships**
   - Use "View Lore Relationship Graph" command
   - See how entities connect
   - Explore relationship strengths

## Tips and Tricks

### Quick Capture Tips

- Use tags in captures for easy filtering later
- Capture incomplete thoughts - you can refine later
- Use the capture file as a "second brain"

### Project Management Tips

- Keep projects organized in folders
- Use README files in projects for context
- Let Project Pulse help you identify what needs attention

### Dashboard Customization

- Hide cards you don't use often
- Change layout from grid to list if preferred
- Refresh dashboard when needed

### Path Configuration Tips

- Use the "Auto-detect paths" button for quick setup
- Use "Create Folder" button if paths don't exist
- Paths are relative to vault root

### Energy Management

- Set energy level based on your actual state
- Enable low-energy mode when tired
- Dashboard will adapt to show less

## Troubleshooting

For common issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Common quick fixes:
- **Dashboard not updating**: Click "Refresh Dashboard"
- **Paths not working**: Check Settings → Errl OS, verify paths exist
- **Organs not working**: Check if organ is enabled in settings
- **Commands not appearing**: Reload plugin (disable and re-enable)

## Version

Current version: 0.1.0

Features:
- Phase 1: Dashboard, Capture
- Phase 2: Project Pulse, Time Machine
- Phase 3: Lore Engine, Reality Map, Promotion Flows
- Phase 4: Energy System, Friction Scanner
- Phase 5: Ritual Engine, Entropy Dial, Dream Buffer, Thought Recycler, Session Ghost, Asset Brain, Prompt Forge, Idea DNA Splicer

