# Rainbow Rider

A Unity 2D game project featuring a rainbow slug character and chunk-based gameplay.

## Overview

Rainbow Rider is a Unity 2D game project built with Unity's Universal Render Pipeline (URP). The project features a rainbow slug character, chunk-based gameplay mechanics, and uses Unity's Input System for controls.

## Project Type

- **Type**: Unity 2D Game
- **Engine**: Unity 6000.2.10f1 (Unity 6)
- **Render Pipeline**: Universal Render Pipeline (URP) 17.2.0
- **Input System**: Unity Input System 1.14.2

## Quick Start

### Prerequisites

- **Unity Editor**: 6000.2.10f1 (Unity 6)
- Unity Input System package (1.14.2)
- Universal Render Pipeline (URP) package (17.2.0)

### Setup

1. **Open in Unity:**
   - Open Unity Hub
   - Add project from `rainbowrider/rainbowrider/` directory
   - Unity will import and configure the project

2. **Verify Packages:**
   - Unity will automatically resolve packages from `Packages/manifest.json`
   - Wait for package import to complete

3. **Open Scene:**
   - Navigate to `Assets/Scenes/SampleScene.unity` or `Assets/_Scenes/GameScene.unity`
   - Press Play to test

## Project Structure

```
rainbowrider/
├── rainbowrider/          # Unity project root
│   ├── Assets/            # Game assets
│   │   ├── _Scenes/       # Game scenes
│   │   ├── _Scripts/      # C# scripts
│   │   ├── _Sprites/      # Sprite assets and prefabs
│   │   ├── _Prefabs/      # Prefab assets
│   │   └── Settings/      # URP and render settings
│   ├── Library/           # Unity cache (1.9GB - should be gitignored)
│   ├── Logs/              # Unity logs
│   ├── Packages/          # Package manifests
│   ├── ProjectSettings/   # Unity project settings
│   └── UserSettings/      # User-specific settings
├── docs/                  # Project documentation
├── INDEX.md               # Workspace index
└── PROJECT_STATUS.md      # Project status
```

## Key Assets

- **RainbowSlug.prefab** - Main character prefab
- **chunk_square.prefab** - Chunk/square prefab for gameplay
- **GameScene.unity** - Main game scene
- **SampleScene.unity** - Sample/test scene

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs

### Technical Documentation

- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

## Development

### Unity Project Structure

The project uses Unity's standard folder structure:
- **Assets/**: All game assets (scenes, scripts, sprites, prefabs)
- **Library/**: Unity-generated cache files (should be gitignored - 1.9GB)
- **ProjectSettings/**: Unity project configuration
- **Packages/**: Package manifests (managed by Unity Package Manager)

### Important Notes

- **Library/ folder**: Contains 1.9GB of Unity cache files that should be gitignored
- **.meta files**: Unity generates .meta files for all assets (13,944 files)
- **C# Scripts**: 7,576 C# script files in the project

## Build Instructions

1. Open project in Unity Editor
2. Select build target (File → Build Settings)
3. Configure build settings
4. Click "Build" to create executable

## License

See project files for license information.
