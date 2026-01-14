# Setup Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn** package manager
- API keys for at least one AI provider:
  - Gemini: https://aistudio.google.com/apikey
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/

## Installation

### 1. Clone or Download

```bash
# If using git
git clone <repository-url>
cd errl-forge---asset-remixer

# Or extract the project files to a directory
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 19
- TypeScript
- Vite
- Lucide React (icons)
- @google/genai (Gemini SDK)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required: At least one AI provider API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: For OpenAI support
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For Anthropic support (metadata only)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Set default provider (defaults to 'gemini')
AI_PROVIDER=gemini
```

**Note:** The `.env.local` file is gitignored and won't be committed to version control.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Local:** http://localhost:3000
- **Network:** http://0.0.0.0:3000 (accessible from other devices on your network)

## Building for Production

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration Options

### Vite Configuration

The project uses Vite with the following configuration (`vite.config.ts`):

- **Port:** 3000
- **Host:** 0.0.0.0 (accessible from network)
- **React Plugin:** Enabled
- **Path Aliases:** `@/*` maps to project root

### TypeScript Configuration

TypeScript is configured with:
- **Target:** ES2022
- **Module:** ESNext
- **JSX:** react-jsx
- **Strict Mode:** Enabled
- **Path Mapping:** `@/*` → `./*`

## API Key Setup

### Gemini API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `.env.local`:
   ```
   GEMINI_API_KEY=AIza...
   ```

### OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   ```

**Note:** OpenAI requires billing setup for API usage.

### Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new key
5. Copy the key and add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Find and stop the process using port 3000
2. Or modify `vite.config.ts` to use a different port:
   ```typescript
   server: {
     port: 3001, // Change to available port
   }
   ```

### API Key Not Working

1. **Verify the key is correct:** Check for typos or extra spaces
2. **Check environment file:** Ensure `.env.local` is in the project root
3. **Restart dev server:** Environment variables are loaded at startup
4. **Check API quotas:** Some providers have rate limits or require billing

### Build Errors

1. **TypeScript errors:** Run `npm run build` to see detailed errors
2. **Missing dependencies:** Run `npm install` again
3. **Node version:** Ensure Node.js 18+ is installed

### CORS Issues

If you encounter CORS errors when loading external images:

- The app includes CORS handling in `utils.ts`
- Some external APIs may block browser requests
- Consider using a proxy or server-side fetching for problematic URLs

### MapleStory API Issues

If the MapleStory database is slow or unavailable:

- **v210 API:** Can be unstable (503 errors are common)
- **Solution:** Switch to v62 in the UI (more stable, smaller dataset)
- **Retry:** The app includes automatic retry logic

## Development Tips

### Hot Module Replacement

Vite provides instant HMR. Changes to files will update in the browser automatically.

### Debugging

1. **Browser DevTools:** Use React DevTools extension
2. **Console Logs:** Check browser console for errors
3. **Network Tab:** Monitor API requests and responses
4. **TypeScript Errors:** Check terminal for compilation errors

### Code Structure

```
errl-forge---asset-remixer/
├── components/          # React components
├── services/           # Business logic and API integrations
│   └── providers/      # AI provider implementations
├── docs/               # Documentation
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── types.ts            # TypeScript type definitions
├── constants.ts        # Constants and presets
├── utils.ts            # Utility functions
└── vite.config.ts      # Vite configuration
```

## Next Steps

After setup:

1. Read the [Usage Guide](./06-usage-guide.md) to learn how to use the app
2. Check the [Features](./03-features.md) documentation
3. Review the [API Reference](./04-api-reference.md) if you want to extend the code

## Production Deployment

### Static Hosting

The build output (`dist/`) can be deployed to any static hosting service:

- **Vercel:** `vercel deploy`
- **Netlify:** Drag and drop `dist/` folder
- **GitHub Pages:** Push `dist/` to `gh-pages` branch
- **Cloudflare Pages:** Connect repository

### Environment Variables in Production

For production deployments, set environment variables in your hosting platform's dashboard (not in `.env.local`).

### Build Optimization

The production build is automatically optimized:
- Code minification
- Tree shaking
- Asset optimization
- Gzip compression ready

