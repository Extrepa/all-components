# React Preview System Setup

## Quick Start

The React preview system needs to be either:
1. **Built** (for static serving) - Recommended
2. **Running dev server** (for development)

### Option 1: Build Static Version (Recommended)

```bash
cd preview
npm run build
```

This creates a `dist/` folder with the built version. The `preview.html` will automatically use this when the dev server isn't running.

### Option 2: Run Dev Server

```bash
cd preview
npm run dev
```

This starts the Vite dev server on port 5174. The `preview.html` will automatically detect and use it.

## How It Works

The `preview.html` automatically:
1. Checks if dev server is running on port 5174
2. If not, uses the built version from `preview/dist/`
3. Shows helpful error if neither is available

## Troubleshooting

### 404 Errors for `main.tsx`

This means the source files are being loaded instead of the built version. Solution:
- Run `npm run build` in the `preview/` directory
- Or start the dev server with `npm run dev`

### Preview Areas Are Blank

- Check browser console for errors
- Ensure preview system is built or dev server is running
- Verify component names match the catalog

---

**End of Setup Guide**
