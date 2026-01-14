# Deployment Guide

This guide explains how to deploy the Creative Coding Projects Gallery to a web server.

## Production Files (Required on Server)

These files and directories must be uploaded to your server:

```
ProjectStarters/
├── index.html              # Main application entry point
├── README.md               # Project documentation
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application controller
│   ├── glsl-viewer.js      # GLSL shader renderer
│   └── project-loader.js   # Project data loader
├── data/
│   └── projects.json       # Project metadata (required)
└── projects/
    ├── glsl/               # GLSL shader HTML pages (5 files)
    └── p5/                 # P5.js sketch HTML pages (12 files)
```

## Development Files (Not Required on Server)

These files are for development only and can be excluded from server deployment:

```
dev/
└── source/                 # Source JSON files (16 files)
scripts/                    # Development scripts (4 files)
docs/                       # Documentation (13 files)
```

## Quick Deployment Steps

1. **Upload Production Files**
   ```bash
   # Upload these directories/files to your web server:
   - index.html
   - css/
   - js/ (only app.js, glsl-viewer.js, project-loader.js)
   - data/projects.json
   - projects/
   ```

2. **Verify File Structure**
   - Ensure `index.html` is in the root directory
   - Verify `js/`, `css/`, `data/`, and `projects/` directories exist
   - Check that all 17 project HTML files are present

3. **Test the Application**
   - Open `index.html` in a browser
   - Verify projects load correctly
   - Test navigation and project viewing

## Server Requirements

- **Web Server**: Any standard web server (Apache, Nginx, etc.)
- **No Backend Required**: This is a static site
- **No Build Step**: Files can be served directly
- **CDN Dependencies**: Three.js and p5.js load from CDN

## File Permissions

Ensure files are readable by the web server:
```bash
chmod 644 index.html css/*.css js/*.js data/*.json projects/**/*.html
chmod 755 css js data projects projects/glsl projects/p5
```

## Optional: Exclude Development Files

If using version control, you can exclude development files:

```gitignore
# Development files
dev/
scripts/
docs/
```

## Adding New Projects (Development)

To add new projects, use the development scripts locally:

```bash
# 1. Place new JSON files in dev/source/
# 2. Extract projects
node scripts/extract-projects.js

# 3. Generate HTML pages
node scripts/generate-pages.js

# 4. Upload updated files to server:
#    - data/projects.json
#    - projects/glsl/ or projects/p5/ (new HTML files)
```

## Troubleshooting

### Projects Not Loading
- Verify `data/projects.json` exists and is valid JSON
- Check browser console for JavaScript errors
- Ensure all project HTML files are present

### Missing Dependencies
- Verify CDN links in `index.html` are accessible
- Check network tab for failed resource loads

### Path Issues
- Ensure relative paths are correct
- Check that `js/`, `css/`, `data/`, and `projects/` are in the same directory as `index.html`

## Production Checklist

- [ ] All production files uploaded
- [ ] `data/projects.json` is present and valid
- [ ] All 17 project HTML files are present
- [ ] Application loads without errors
- [ ] Projects display correctly
- [ ] Navigation works
- [ ] Search functionality works
- [ ] Category filtering works
