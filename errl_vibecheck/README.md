<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌡️ VibeCheck

**VibeCheck** is an AI-powered visual coding playground that allows you to quickly batch test prompts with visual outputs. Generate code in multiple formats (P5.js, SVG, HTML, GLSL shaders, Three.js, etc.) using Google's Gemini AI models and compare results side-by-side.

[View in AI Studio](https://ai.studio/apps/drive/1FGHFKcNeY42VKcObcXOKS1mXyQd7Ih1W) | [Documentation](./docs/README.md)

## ✨ Features

- 🎨 **Multiple Output Modes**: Generate code in 7+ different formats (P5.js, SVG, HTML, Shaders, 3D Wireframes, 3D Voxels, Images)
- 🤖 **AI Model Comparison**: Compare outputs from different Gemini models (Flash, Pro, etc.)
- 📦 **Batch Generation**: Generate multiple variations of the same prompt simultaneously
- 🖼️ **Visual Rendering**: Real-time rendering of generated code in sandboxed iframes
- 🔍 **Search & Filter**: Search prompts and code, filter by mode/model, sort by various criteria
- 📥 **Export**: Copy code to clipboard, download as files, export rounds as JSON
- ⌨️ **Keyboard Shortcuts**: Quick access with Escape, Cmd+K, Cmd+F
- 🎵 **Audio Feedback**: Sound effects for typing and success states
- 🖥️ **Screensaver Mode**: Beautiful fullscreen display mode with animated transitions
- ⭐ **Favorites System**: Save and organize favorite outputs
- 📤 **Sharing**: Share collections and individual results via URLs
- 🔄 **Versus Mode**: Side-by-side comparison of different AI models

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs/README.md) folder.

**New to this project?** See [Additions Since AI Studio](./ADDITIONS_SINCE_AISTUDIO.md) for a complete list of all features and changes added.

- **[Features](./docs/FEATURES.md)** - Complete feature list
- **[Usage Guide](./docs/USAGE.md)** - How to use VibeCheck
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture
- **[Development Guide](./docs/DEVELOPMENT.md)** - Contributing and development
- **[Modes](./docs/MODES.md)** - Available output modes
- **[Models](./docs/MODELS.md)** - Supported AI models
- And more...

## 🛠️ Development

See the [Development Guide](./docs/DEVELOPMENT.md) for:
- How to add new modes
- How to add new models
- Code style guidelines
- Testing approach
- Debugging tips

## 📦 Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Use Cases

- **Creative Coding**: Quickly prototype visual ideas with AI
- **Model Comparison**: Test which AI model works best for your prompts
- **Learning**: Explore different coding styles and techniques
- **Inspiration**: Browse curated collections of generated content
- **Experimentation**: Batch test variations to find the perfect output

## 🏗️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Tone.js** - Audio synthesis
- **Google Gemini API** - AI code generation

## 📄 License

SPDX-License-Identifier: Apache-2.0

## 🤝 Contributing

Contributions are welcome! Please see the [Development Guide](./docs/DEVELOPMENT.md) for details.

## 🔗 Links

- [AI Studio App](https://ai.studio/apps/drive/1FGHFKcNeY42VKcObcXOKS1mXyQd7Ih1W)
- [Documentation](./docs/README.md)
- [Next Steps](./docs/NEXT_STEPS.md) - Recommended improvements

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs
