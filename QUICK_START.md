# Quick Start Guide

## Building the Preview System

The React preview system needs to be built before use. Run:

```bash
cd preview
npm run build
```

**Note:** The `package.json` is in the `preview/` directory, not the root!

## Running the Server

From the `all-components` directory:

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000/preview.html`

## Troubleshooting

### 404 Errors for `main.tsx`

This means the source `preview/index.html` is being loaded instead of the built version. Solution:
1. Run `cd preview && npm run build`
2. Refresh the browser
3. The built version uses `preview/dist/index.html` which has bundled assets

### Permission Denied

If you get permission errors:
```bash
chmod +x preview/
# Or check file permissions
ls -la preview/
```

### npm run build fails

Make sure you're in the `preview/` directory:
```bash
cd preview
npm run build
```

Not from the root `all-components/` directory!

---

**The build creates `preview/dist/index.html` with bundled assets. The preview system will automatically use this when the dev server isn't running.**
