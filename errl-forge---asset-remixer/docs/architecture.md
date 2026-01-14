# Architecture Documentation

**Project:** errl-forge---asset-remixer
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Google GenAI**
### Project Type

Web App

## Architecture Overview

errl-forge---asset-remixer is an AI-powered game asset generation and remixing tool. It generates game assets from text prompts or remixes existing MapleStory assets using multiple AI providers.

### Core Architecture

**Technical Stack:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Google Gemini API - AI image generation
- OpenAI (DALL-E 3) - AI image generation
- Anthropic (Claude) - Metadata generation

### Component Structure

**Core Features:**
- AI-powered asset generation
- Multi-provider support (Gemini, OpenAI, Anthropic)
- Automatic metadata generation
- MapleStory asset integration
- Batch generation
- Animation frame generation
- Sprite sheet export
- Local storage with version history
- Custom presets
- Advanced hitbox editor

**Key Components:**
- AssetEditor - Main editing interface
- AssetLibrary - Asset browsing and management
- AnimationGenerator - Animation frame generation
- BatchGenerator - Batch operations
- HitboxEditor - Visual hitbox editing

## Key Design Decisions

### Multi-Provider AI Support
- **Rationale**: Flexibility and quality options
- **Benefit**: Choose best provider for each task
- **Implementation**: Provider abstraction layer

### Game Asset Focus
- **Rationale**: Specialized for game development
- **Benefit**: Game-ready assets with metadata
- **Features**: Stats, hitboxes, animation data

### Local Storage
- **Rationale**: Offline asset management
- **Benefit**: No server required
- **Implementation**: IndexedDB and LocalStorage

## Dependencies
- `@google/genai` - Gemini API
- `jszip` - ZIP file creation
- `lucide-react` - Icons
- `react`, `react-dom` - UI framework

## Design Patterns

### Provider Pattern
- AI providers abstracted
- Easy to switch providers
- Consistent API

### Asset Management
- Version history
- Local persistence
- Efficient storage

## Performance Considerations

### IndexedDB Caching
- Efficient asset storage
- Fast retrieval
- Large asset support

### Request Queuing
- Manage API rate limits
- Efficient batch processing
- Progress tracking

## Related Documentation

- [Build Instructions](../BUILD_INSTRUCTIONS.md) - Build setup
- [Project Structure](project-structure.md) - File organization
