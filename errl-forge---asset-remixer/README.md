<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nQnB5YOWmQOSt21H1lyu7R1ucXNgnEV6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API keys in `.env.local`:
   ```bash
   # Required: At least one AI provider API key
   GEMINI_API_KEY=your_gemini_api_key_here
   # Optional: For OpenAI support
   OPENAI_API_KEY=your_openai_api_key_here
   # Optional: For Anthropic support (metadata only, no image generation)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   # Optional: Set default provider (gemini, openai, or anthropic)
   AI_PROVIDER=gemini
   ```

   Get your API keys:
   - **Gemini**: https://aistudio.google.com/apikey
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/

3. Run the app:
   ```bash
   npm run dev
   ```

## Supported AI Providers

The app supports multiple AI providers for image generation and metadata creation:

- **Gemini** (Google) - Full support for image generation and metadata
- **OpenAI** (DALL-E 3) - Full support for image generation and metadata
- **Anthropic** (Claude) - Metadata generation only (no image generation)

You can switch between providers using the dropdown in the app header.

## Key Features

### Core Capabilities
- **AI-Powered Generation:** Generate game assets from text prompts or remix existing MapleStory assets
- **Multi-Provider Support:** Switch between Gemini, OpenAI, and Anthropic
- **Automatic Metadata:** Game-ready stats, hitboxes, and animation data
- **MapleStory Integration:** Browse and remix thousands of MapleStory assets

### Advanced Features
- **Batch Generation:** Generate multiple assets at once with progress tracking
- **Animation Frames:** Create sprite sequences for idle, walk, run, jump, attack, and more
- **Animation Preview:** Play animations directly in the UI with adjustable speed
- **Sprite Sheets:** Export animations as sprite sheets with Phaser 3 compatible metadata (Web Worker powered)
- **Local Storage:** Auto-save generated assets with version history
- **Custom Presets:** Create and save custom style combinations
- **Advanced Hitbox Editor:** Visual drag-and-drop hitbox editing with real-time preview
- **Enhanced Error Handling:** User-friendly error messages with retry functionality
- **Performance Optimized:** IndexedDB caching, request queuing, circuit breaker patterns (v210 only), virtual scrolling, asset deduplication
- **Offline Support:** Service Worker enables offline functionality (Progressive Web App)

### User Experience
- **Progress Indicators:** Real-time progress bars for generation operations
- **Asset History:** View and revert to previous versions of assets
- **My Assets Tab:** Browse and manage all saved assets with search and bulk operations
- **Batch Mode:** Dedicated interface for batch operations
- **Animation Generator:** Integrated animation frame generation workflow
- **Keyboard Shortcuts:** Ctrl+G (Generate), Ctrl+E (Export), Ctrl+B (Batch Mode)
- **Offline Indicator:** Visual feedback for online/offline status
- **Virtual Scrolling:** Smooth performance with large asset lists
- **Auto-Scroll Indicators:** Subtle arrow indicators for scrollable category rows
- **Style Tooltips:** Color swatches and RGB codes on hover for style modifiers
- **Preset Thumbnails:** Visual previews (48x48px) for base model presets in the library
- **Preset-Based Resizing:** Automatic resizing to game-ready dimensions for base model assets
- **Neon App Outline:** Subtle rainbow gradient shimmer border around application
- **Compact UI:** Optimized button layouts and spacing for better workflow

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs with links to all documentation

### Build & Setup

- [Build Instructions](BUILD_INSTRUCTIONS.md) - How to build the project
- [Gemini Build Package](GEMINI_BUILD_PACKAGE.md) - Gemini build package documentation
- [Project Files](PROJECT_FILES.md) - Project file structure
- [File Checklist](FILE_CHECKLIST.md) - File organization checklist

### Technical Documentation

- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure
