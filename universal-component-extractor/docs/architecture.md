# Architecture Documentation

**Project:** universal-component-extractor
**Type:** Desktop App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **Electron**
- **React**
### Project Type

Desktop App

## Architecture Overview

universal-component-extractor is a desktop application for extracting and reverse-engineering web components from HTML, React, Three.js, or JSON. Available as a native Mac app with support for multiple AI providers.

### Core Architecture

**Technical Stack:**
- Electron - Desktop app framework
- React - UI framework
- TypeScript - Type safety
- Vite - Build tool

**AI Provider Support:**
- Gemini (Google) - Full support
- OpenAI (DALL-E 3) - Full support
- Anthropic (Claude) - Metadata only
- Ollama - Free local AI (recommended)

### Component Structure

**Main Process (Electron):**
- Window management
- File system access
- Native app integration

**Render Process (React):**
- UI components
- Code browser
- Analysis tab
- Console panel
- File tree

**Services:**
- AI service abstraction layer
- Multi-provider support
- Request handling

**Features:**
- Multi-file upload
- Code browser with syntax highlighting
- Analysis tab with insights
- Enhanced console with stack traces
- Code editing with syntax highlighting
- Extraction history (last 5)
- Framework export presets (Vite React, Next.js)

## Key Design Decisions

### Multi-Provider AI Support
- **Rationale**: Flexibility and cost-effectiveness
- **Benefit**: Use free local AI (Ollama) or paid cloud services
- **Implementation**: Service abstraction layer

### Desktop App (Electron)
- **Rationale**: Native app experience
- **Benefit**: Better file system access, native feel
- **Platform**: Mac (with .dmg installer)
- **Build**: Electron builder for .dmg creation
- **Distribution**: Native macOS app bundle

### Local Libraries
- **Rationale**: Offline support
- **Benefit**: Works without internet (with Ollama)
- **Implementation**: All libraries installed locally

## Dependencies
- `@anthropic-ai/sdk` - Anthropic API
- `@babel/standalone` - Code transformation
- `@google/genai` - Gemini API
- `diff` - Code diffing
- `electron-store` - Persistent storage
- `jszip` - ZIP file creation
- `openai` - OpenAI API
- `prismjs` - Syntax highlighting

## Design Patterns

### Service Abstraction
- AI providers abstracted behind service layer
- Easy to add new providers
- Consistent API across providers

### Multi-File Support
- Upload multiple files
- Extract from multiple sources
- Compare extractions

## Performance Considerations

### Local Processing
- Ollama runs completely locally
- No data leaves machine
- Fast processing for local models

### Efficient Rendering
- Syntax highlighting optimized
- Virtual scrolling for large files
- Efficient diff rendering

## Security

### API Key Management
- Secure storage via Electron
- No keys in code
- User-controlled configuration

### Local Processing Option
- Ollama runs locally
- No data transmission
- Privacy-focused

## Related Documentation

- [User Guide](USER_GUIDE.md) - Complete user documentation
- [Developer Guide](DEVELOPER_GUIDE.md) - Developer documentation
- [Project Structure](project-structure.md) - File organization
