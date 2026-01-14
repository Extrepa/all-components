# Errl AI Chatbot

A chat-based Errl persona chatbot with Ollama integration. Embodies Errl's personality (empathy-first, permanent wonder, playful) with beautiful Errl-styled UI.

## Features

- **Direct Ollama Integration**: Chat directly with local LLM models via Ollama
- **Errl Personality System**: System prompts crafted from Errl's story guide
- **Beautiful Errl UI**: Styled with Errl design system (cyan-magenta gradients, glows, animations)
- **Streaming Responses**: Real-time streaming of AI responses
- **Message Persistence**: Chat history saved to localStorage
- **Model Selection**: Choose from available Ollama models
- **Connection Status**: Visual indicator for Ollama connection

## Prerequisites

- Node.js 18+ and npm
- Ollama installed and running ([Install Ollama](https://ollama.ai))
- At least one Ollama model installed (e.g., `ollama pull llama3.2`)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Make sure Ollama is running: `ollama serve`
2. Pull a model if needed: `ollama pull llama3.2`
3. Start the dev server: `npm run dev`
4. Open http://localhost:5173 in your browser
5. Start chatting with Errl!

## Project Structure

```
errl-ai-chatbot/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ErrlAvatar.tsx
│   │   └── InputBar.tsx
│   ├── services/
│   │   ├── ollama.ts        # Ollama API client
│   │   └── personality.ts   # Errl personality system
│   ├── hooks/
│   │   └── useChat.ts       # Chat state management
│   ├── styles/
│   │   ├── errl-theme.css   # Errl design system
│   │   └── index.css        # Base styles
│   └── App.tsx
├── public/
└── package.json
```

## Configuration

The chatbot connects to Ollama at `http://localhost:11434` by default. To change this, edit `src/services/ollama.ts`.

Default model is `llama3.2`. You can select different models from the dropdown in the chat interface.

## Future Enhancements

- Integration with ERRL-AI RAG backend for lore-aware responses
- Multiple Errl variants (Wavy Errl, Festival Errl modes)
- Conversation export
- Realm-specific knowledge contexts

## Related Projects

- **ERRL-AI RAG Backend**: `/Users/extrepa/Desktop/Android 69 - Jan 2027/ErrlGPT/ERRL-AI/` - Vector search over Errl canon
- **Errl Portal**: Integration target at `/Users/extrepa/Projects/errl-portal`

## License

Private project - Errl Universe
