# Overview

## What is Errl Forge?

**Errl Forge** is a developer tool for synthesizing, remixing, and exporting game assets using AI. It's specifically designed to create assets inspired by MapleStory's art style, with support for neon-drip and other aesthetic modifications.

The tool combines:
- **AI-powered image generation** from text prompts or source images
- **Automatic metadata generation** for game integration (stats, hitboxes, animations)
- **MapleStory asset integration** via the MapleStory.io API
- **Multi-provider AI support** (Gemini, OpenAI, Anthropic)
- **Offline support** via Service Worker (Progressive Web App)
- **Batch processing** for generating multiple assets
- **Animation generation** for sprite sequences
- **Advanced hitbox editor** with visual drag-and-drop

## Core Purpose

Errl Forge was built to streamline the creation of game assets for **Errl Story**, a MapleStory-inspired 2D side-scrolling game. It eliminates the need for manual asset creation and metadata writing by:

1. Generating pixel art assets from text descriptions
2. Remixing existing MapleStory assets with custom aesthetics
3. Automatically generating game-ready metadata (HP, EXP, speed, hitboxes, animations)
4. Exporting assets in formats ready for Phaser 3 game integration

## Key Capabilities

### 🎨 Asset Generation
- Generate new assets from text prompts
- Remix existing MapleStory assets with custom styles
- Support for multiple asset types: monsters, items, NPCs, platforms, backgrounds

### 🤖 AI Integration
- Multi-provider support (switch between AI models)
- Image generation with optional source image input
- Intelligent metadata generation based on asset descriptions

### 🗄️ Asset Library
- Browse MapleStory asset database (GMS v62, v177, v95, v83, v210)
- Search and filter by category
- Download full category archives
- Preset templates with visual thumbnails for quick starts

### 🎯 Game-Ready Output
- Automatic hitbox calculation
- Visual hitbox editor with drag-and-drop
- Animation key suggestions
- Animation frame generation (idle, walk, run, jump, attack, etc.)
- Sprite sheet export with Phaser 3 compatible metadata
- Game stats (HP, EXP, speed)
- Behavior descriptions
- Export as PNG + JSON

### ⚡ Performance & Offline
- Service Worker for offline functionality
- IndexedDB for persistent asset storage
- Virtual scrolling for large lists
- Web Workers for heavy operations
- Request queuing and circuit breaker patterns
- Automatic caching strategies

### 🎬 Batch & Animation
- Batch generation for multiple assets
- Animation sequence generation
- Sprite sheet export with multiple layouts
- Animation preview and playback
- Custom style presets

## Target Audience

- **Game Developers** creating 2D side-scrolling games
- **Indie Developers** needing quick asset generation
- **MapleStory Modders** wanting to remix existing assets
- **AI Enthusiasts** experimenting with image generation

## Technology Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS (CDN)
- **Icons:** Lucide React
- **AI Providers:** Google Gemini, OpenAI, Anthropic
- **External API:** MapleStory.io
- **Storage:** IndexedDB (via idb library)
- **Service Worker:** Offline support and PWA capabilities
- **Web Workers:** Background processing for sprite sheets

## Project Philosophy

Errl Forge follows these principles:

1. **Developer-First:** Built for developers who need quick, game-ready assets
2. **Extensible:** Easy to add new AI providers or features
3. **Type-Safe:** Full TypeScript support for reliability
4. **Modern UI:** Cyberpunk-inspired dark theme with pixel art aesthetics
5. **Performance:** Optimized for fast asset generation and browsing

## What Makes It Unique?

- **Dual Generation Modes:** Both text-to-image and image-to-image remixing
- **Game Integration Focus:** Generates metadata, not just images
- **MapleStory Integration:** Direct access to thousands of existing assets
- **Style Injection:** Quick style modifiers (neon, drip, glitch, void)
- **Multi-Provider:** Not locked to a single AI service
- **Offline Capable:** Works offline as a Progressive Web App
- **Batch Processing:** Generate multiple assets efficiently
- **Animation Workflow:** Complete animation frame generation and sprite sheet export
- **Visual Hitbox Editor:** Drag-and-drop hitbox editing with real-time preview

