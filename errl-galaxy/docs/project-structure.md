# Project Structure Documentation

**Project:** errl-galaxy
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-galaxy/
- `CURSOR_CONTEXT.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/`
- `next-env.d.ts`
- `package-lock.json`
- `package.json`
- `postcss.config.js`
- `public/`
  - `audio/`
- `scripts/`
- `src/`
  - `app/`
  - `components/`
  ... (5 more items)
```

## File Organization

### Core Files

- Configuration files (package.json, tsconfig.json, etc.)
- Entry points (index.html, main.js, etc.)
- Source code directories

### Documentation

- Root documentation files
- docs/ directory (this directory)
- README.md

### Build and Distribution

- Build output directories
- Distribution files
- Compiled assets

## Key Directories

### `src/` - Next.js App Directory
- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities and helpers
- `styles/` - Stylesheets

### `public/` - Public Assets
- `audio/` - Audio files

### `scripts/` - Build Scripts
- Build and utility scripts
- Asset generation scripts

## File Naming Conventions

- Next.js pages: `page.tsx`, `layout.tsx`
- React components: PascalCase (e.g., `GalaxyViewer.tsx`)
- Utilities: camelCase

## Import/Export Structure

- ES modules
- TypeScript
- Next.js App Router conventions
