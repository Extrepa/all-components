# Getting Started Guide

This guide will help you set up and run the Universal Component Extractor.

## Table of Contents

1. [Installation](#installation)
2. [Running the App](#running-the-app)
3. [Configuration](#configuration)
4. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control (if cloning from repository)

### Install Dependencies

```bash
npm install
```

This installs all required dependencies including React, Electron, TypeScript, and AI provider SDKs.

### Copy Required Libraries

```bash
npm run copy-libs
```

This copies Three.js, p5.js, Babel, React, and ReactDOM to `public/libs/` for local use.

**Note:** This runs automatically during build, but you can run it manually if needed.

---

## Running the App

### Development Mode

**Option A: Browser Mode (for testing)**
```bash
npm run dev
```
Then open http://localhost:3000 in your browser.

**Option B: Desktop App (Recommended)**
```bash
# Terminal 1
npm run dev

# Terminal 2 (wait for first terminal to start)
npm run electron:dev
```

The `electron:dev` script will:
1. Wait for the dev server to be ready
2. Launch Electron with the compiled main process
3. Open DevTools automatically

### Production Build

```bash
npm run build
```

This will:
1. Copy libraries to `public/libs/`
2. Compile TypeScript files
3. Build the React app with Vite
4. Compile Electron main process
5. Package everything into a `.dmg` file for Mac

The output will be in the `dist` folder.

---

## Configuration

### Using Ollama (Free, Recommended) 🆓

Ollama runs completely locally - no data leaves your machine and no API keys are needed.

1. **Install Ollama:**
   - Visit https://ollama.ai
   - Download and install for Mac
   - Ollama runs automatically in the background

2. **Download a Model:**
   ```bash
   ollama pull llama3.2
   ```
   
   Other recommended models:
   - `llama3.1` - More capable
   - `mistral` - Alternative option
   - `codellama` - Code-focused

3. **Verify Ollama is Running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   
   If this returns a list of models, Ollama is running correctly.

4. **Configure in App:**
   - Click the settings button (⚙️) in the top right
   - Select "Ollama" as provider
   - Model should default to "llama3.2"
   - Ollama URL should be "http://localhost:11434"
   - Click "Save Settings"

### Using API Providers (Requires API Keys)

#### Gemini (Google)

1. **Get API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key

2. **Configure in App:**
   - Click settings (⚙️)
   - Select "Gemini" as provider
   - Enter your API key
   - Choose a model (e.g., gemini-3-pro-preview or gemini-2.5-flash)
   - Save

#### OpenAI

1. **Get API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key

2. **Configure in App:**
   - Click settings (⚙️)
   - Select "OpenAI" as provider
   - Enter your API key
   - Choose a model (e.g., gpt-5.1, gpt-4.1-mini, or gpt-4o)
   - Save

#### Anthropic (Claude)

1. **Get API Key:**
   - Visit https://console.anthropic.com/
   - Create a new API key

2. **Configure in App:**
   - Click settings (⚙️)
   - Select "Anthropic" as provider
   - Enter your API key
   - Choose a model (e.g., claude-opus-4-20250514 or claude-3.5-sonnet-20241022)
   - Save

---

## Troubleshooting

### Electron Won't Start

- Make sure `npm run dev` is running first
- Check that port 3000 is available
- Verify `dist-electron/main.cjs` exists
- Try rebuilding: `npm run build:electron`
- Try deleting `node_modules` and running `npm install` again

### Ollama Connection Errors

- **Check if Ollama is running:**
  ```bash
  curl http://localhost:11434/api/tags
  ```

- **Start Ollama if needed:**
  ```bash
  ollama serve
  ```

- **Verify model is installed:**
  ```bash
  ollama list
  ```

- **Check Ollama URL in settings:**
  - Default: http://localhost:11434
  - Make sure it matches your Ollama configuration

### Build Errors

- **Ensure all dependencies installed:**
  ```bash
  npm install
  ```

- **Check TypeScript compilation:**
  ```bash
  npx tsc -p electron/tsconfig.json
  ```

- **Try cleaning and reinstalling:**
  ```bash
  rm -rf dist dist-electron node_modules
  npm install
  ```

### Port 3000 Already in Use

Change the port in `vite.config.ts` or kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill
```

### "Cannot find module" Errors

Make sure you've compiled the Electron files:
```bash
npm run build:electron
```

### Preview Not Loading

- Check console for errors
- Verify Babel is loaded (for React preview)
- Check iframe sandbox permissions
- Ensure code is valid JavaScript
- Verify libraries are in `public/libs/`

### AI Extraction Fails

- Verify API key is correct (for API providers)
- Check network connection
- Try different model
- Check provider status
- For Ollama: Ensure Ollama is running and model is installed

---

## Project Structure

```
universal-component-extractor/
├── electron/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script (IPC bridge)
│   └── tsconfig.json    # Electron TypeScript config
├── components/
│   ├── SettingsModal.tsx  # AI provider settings UI
│   └── ...              # Other components
├── services/
│   └── aiService.ts     # Multi-provider AI abstraction
├── types/
│   └── electron.d.ts    # Electron API types
├── public/
│   └── libs/            # Local libraries (Three.js, p5.js, etc.)
└── App.tsx              # Main React component
```

---

## Notes

- **Settings Storage:**
  - Electron mode: Stored in Electron's secure store
  - Web mode: Stored in localStorage
  - API keys are encrypted and never exposed in code

- **Offline Support:**
  - Preview works completely offline (all libraries are local)
  - AI extraction requires internet (except Ollama)
  - Ollama runs completely locally - no data leaves your machine

- **Security:**
  - API keys are never sent to external servers except the chosen AI provider
  - Preview runs in sandboxed iframe
  - All libraries loaded from local files (no external requests)

- **Platform Support:**
  - Currently optimized for Mac (Intel & Apple Silicon)
  - Can be extended to Windows/Linux with electron-builder configuration

---

For more detailed information, see:
- [User Workflow Guide](../WORKFLOW_USER.md)
- [Developer Workflow Guide](../WORKFLOW_DEVELOPER.md)
- [Architecture Documentation](../ARCHITECTURE.md)

