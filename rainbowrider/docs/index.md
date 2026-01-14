# Documentation Index

**Project:** rainbowrider
**Category:** D
**Last Updated:** 2026-01-10

## Documentation Structure

This directory contains detailed documentation for the rainbowrider project.

### Core Documentation

- [Architecture](architecture.md) - Technical architecture and design
- [Project Structure](project-structure.md) - File organization and structure
- [Completion Checklist](completion-checklist.md) - Task tracking and completion status

### Unity Project Documentation

**Project Type:** Unity 2D Game

**Key Components:**
- Unity Universal Render Pipeline (URP)
- Unity Input System
- 2D Sprite-based gameplay
- Chunk-based game mechanics

**Project Structure:**
- `Assets/_Scenes/` - Game scenes (GameScene.unity)
- `Assets/_Scripts/` - C# scripts (7,576 files)
- `Assets/_Sprites/` - Sprite assets and prefabs (RainbowSlug, chunk_square)
- `Assets/_Prefabs/` - Prefab assets
- `Assets/Settings/` - URP and render settings
- `Library/` - Unity cache (1.9GB - should be gitignored)
- `ProjectSettings/` - Unity project configuration
- `Packages/` - Package manifests and lock files

**Unity Version:** Unity 6000.2.10f1 (Unity 6)

**Build Instructions:**
1. Open project in Unity 6 (6000.2.10f1)
2. Open `Assets/_Scenes/GameScene.unity`
3. Configure build settings (File → Build Settings)
4. Select target platform (WebGL, Windows, macOS, Linux)
5. Click Build

**Run Instructions:**
- In Unity Editor: Press Play button
- Built executable: Run the generated executable for your platform

**Important Notes:**
- Library folder (1.9GB) contains Unity-generated cache files
- Should be added to .gitignore to reduce repository size
- Contains PackageCache, Bee, Artifacts, BurstCache, and other Unity build artifacts

### Core Documentation

- [Architecture](architecture.md) - Technical architecture and design
- [Project Structure](project-structure.md) - File organization and structure
- [Completion Checklist](completion-checklist.md) - Task tracking and completion status

## Quick Links

- [Project INDEX](../INDEX.md) - Workspace index
- [Project Status](../PROJECT_STATUS.md) - Current project status
- [README](../README.md) - Main project documentation

## Documentation Status

This documentation structure is being set up as part of the portfolio documentation initiative. Additional documentation will be added as the project progresses.
