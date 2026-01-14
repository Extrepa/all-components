# All Components Preview

Interactive React-based preview page for browsing and previewing all components from your projects.

## Features

- 📊 **Statistics Dashboard** - View total components, projects, and files
- 🔍 **Search & Filter** - Quickly find components by name, path, or project
- 🎨 **Component Previews** - Click on components to see live previews (where available)
- 📁 **Organized by Project** - Components grouped by their source project
- 🎯 **Type Indicators** - Visual badges showing component file types (TSX, TS, JS, JSX)

## Getting Started

1. Install dependencies:
```bash
cd preview
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5174`)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Component Rendering

Currently, the preview system can render simple components from:
- `errl-portal` - Button, Card, Input
- `errl-portal-shared` - Button, Card, Input

More components can be added to the `ComponentRenderer` as needed. Components that require external dependencies (like Three.js, Zustand stores, etc.) will show a helpful error message.

## Project Structure

```
preview/
├── src/
│   ├── components/      # React components
│   ├── data/            # Component catalog
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

