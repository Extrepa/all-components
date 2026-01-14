# Project Structure Documentation

**Project:** svg_editor
**Last Updated:** 2026-01-09

## Directory Structure
```
svg_editor/
- `BROWSER_TEST_RESULTS.md`
- `CHANGES_SUMMARY.md`
- `CODE_REVIEW_NOTES.md`
- `FILE_LOADING_FIX.md`
- `FINAL_REVIEW_NOTES.md`
- `FIXES_APPLIED.md`
- `IMPLEMENTATION_REVIEW.md`
- `IMPLEMENTATION_VERIFICATION.md`
- `INDEX.md`
- `MIGRATION_PROGRESS.md`
- `PROJECT_STATUS.md`
- `README.md`
- `README_SETUP.md`
- `SERVER_SHUTDOWN_LOG.md`
- `SETUP_VERIFICATION.md`
  ... (15 more items)
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

### Core Files
- `index.html` - Main HTML entry point
- `app.js` - Complete application (all 25+ tools)
- `styles.css` - All styling

### Tool Organization
- Single Page Application
- All tools in one interface
- Shared SVG state
- Non-destructive editing
- Real-time preview

## File Naming Conventions

- JavaScript: camelCase (e.g., `app.js`)
- HTML: lowercase (e.g., `index.html`)
- CSS: lowercase (e.g., `styles.css`)

## Import/Export Structure

- Vanilla JavaScript
- DOM API for SVG manipulation
- FileReader for uploads
- Clipboard API for copy
- Blob API for downloads
