# Universal Component Extractor - Desktop App

A powerful desktop application for extracting and reverse-engineering web components from HTML, React, Three.js, or JSON. Now available as a native Mac app with support for multiple AI providers including free local models!

## ✨ Version 2.0.5 - Latest Update

**Latest Improvements:**
- 🎯 **Interaction Modes** - Extract, Explain, and Review modes for different AI use cases
- 📦 **Framework Export Presets** - Vite React and Next.js project structure exports
- 📊 **Extraction History** - Track and compare last 5 extractions with improved diffs
- 🤖 **Enhanced AI Model Selection** - Model-specific guidance and better UX
- 🔍 **Per-File Diff Selection** - Compare specific files from multi-file projects
- 📚 **Comprehensive Use Cases** - 20 detailed use cases with workflows and improvements

**Version 2.0 Features:**
- 📁 **Multi-File Upload** - Upload and manage multiple files simultaneously
- 🔍 **Code Browser** - Browse files with syntax highlighting and search
- 📊 **Analysis Tab** - Detailed insights about extracted components
- 🎯 **Enhanced Console** - Improved error tracking with stack traces
- ✏️ **Code Editing** - Edit extracted code with syntax highlighting
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 📦 **Local Libraries** - All libraries installed locally for offline support

See [docs/project-status.md](./docs/project-status.md) for version history and update notes.

## Features

- 🖥️ **Native Desktop App** - Runs as a standalone Mac application (no browser needed)
- 🤖 **Multiple AI Providers** - Choose from Gemini, OpenAI, Anthropic, or Ollama (free local)
- 💰 **Cost-Effective** - Use Ollama for free local AI processing
- 🎨 **Component Extraction** - Extract clean, modern components from any source
- 📦 **Multiple Export Formats** - Export as HTML, TSX, JS, SCSS, or full project ZIP
- 🔄 **Live Preview** - See your extracted components in real-time
- 📁 **Multi-File Support** - Upload and extract from multiple files at once
- 🔍 **Code Analysis** - Get detailed insights about your components
- 🎯 **Enhanced Console** - Better error tracking and debugging

## Installation

### Prerequisites

- Node.js 18+ and npm
- For local AI: [Ollama](https://ollama.ai) (optional but recommended for free usage)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **For Development:**
   ```bash
   # Terminal 1: Start the dev server
   npm run dev
   
   # Terminal 2: Start Electron (in a new terminal)
   npm run electron:dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```
   
   This will create a `.dmg` file in the `dist` folder that you can install on your Mac.

## Configuration

### Using Ollama (Free & Recommended)

**Step 1: Install Ollama**
- Visit [ollama.ai](https://ollama.ai) and download the Mac installer
- Run the installer and follow the setup instructions
- Ollama will start automatically as a background service

**Step 2: Download a Model**
Open Terminal and run:
```bash
ollama pull llama3.2
```

This downloads the Llama 3.2 model (about 2GB). Other good options:
- `ollama pull llama3.1` - Larger, more capable
- `ollama pull mistral` - Fast and efficient
- `ollama pull codellama` - Great for code tasks

**Step 3: Configure in App**
1. Open the app
2. Click the settings button (⚙️) in the top right
3. Select "Ollama" as your provider
4. Choose your model (default: llama3.2)
5. Verify Ollama URL is `http://localhost:11434`
6. Click "Save Settings"

**Verify Ollama is Running:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it:
ollama serve
```

**Note:** Ollama runs completely locally - no data leaves your machine and it's completely free!

### Using API Providers

1. Open settings (⚙️ button)
2. Select your provider (Gemini, OpenAI, or Anthropic)
3. Enter your API key
4. Choose your model
5. Save settings

## Usage

1. **Paste or import** your HTML, JSX, TSX, Three.js, or JSON code
2. Click **"Extract Component"**
3. The AI will analyze and extract a clean, modern version
4. **Preview** the component in real-time
5. **Export** in your preferred format

## Supported Providers

- **Ollama** (Free, Local) – Common tags: llama3.2, llama3.1, mistral, codellama, phi3, gemma2, qwen2.5 (you can also type any other valid Ollama model name)
- **Gemini** – Models: gemini-3-pro-preview, gemini-2.5-pro, gemini-2.5-flash, gemini-1.5-flash
- **OpenAI** – Models: gpt-5.1, gpt-5-mini, gpt-4.1-mini, gpt-4o, gpt-3.5-turbo
- **Anthropic** – Models: claude-opus-4-20250514, claude-sonnet-4-20250514, claude-3.5-sonnet-20241022, claude-3-haiku-20240307

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Complete documentation index with links to all docs

### Quick Start
- **[User Guide](docs/USER_GUIDE.md)** - Complete user guide (installation, features, workflows, troubleshooting)
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Complete developer guide (setup, architecture, workflows, best practices)

### Reference Documentation
- **[Changelog](CHANGELOG.md)** - Version history
- **[Use Cases](docs/USE_CASES.md)** - 20 detailed use cases with workflows and improvements
- **[Documentation README](docs/README.md)** - Complete documentation index

### Technical Documentation
- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

See [Documentation Index](docs/index.md) for complete list of all documentation files.

## Project Structure

```
├── electron/          # Electron main process and preload scripts
├── components/        # React components
│   ├── AnalysisTab.tsx
│   ├── CodeBrowser.tsx
│   ├── ConsolePanel.tsx
│   ├── FileTree.tsx
│   └── ...
├── services/          # AI service abstraction layer
├── utils/            # Utility functions
│   ├── fileTypeDetector.ts
│   └── contentAggregator.ts
├── types/            # TypeScript type definitions
└── App.tsx           # Main application component
```

## Building

The app uses Electron Builder to create a native Mac application:

```bash
npm run build
```

The built app will be in the `dist` folder as a `.dmg` file.

## Development

- `npm run dev` - Start Vite dev server
- `npm run electron:dev` - Start Electron in development mode
- `npm run build` - Build for production

## License

MIT
