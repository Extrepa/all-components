# Build Verification Checklist

**Purpose:** Standard checklist for verifying builds across all project types.

## Project Types

### Vite Projects
Standard build command: `npm run build`

**Checklist:**
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes successfully
- [ ] Build output exists in `dist/` or configured output directory
- [ ] No TypeScript compilation errors
- [ ] No build warnings (or warnings are acceptable)
- [ ] Bundle sizes are reasonable
- [ ] Source maps generated (if applicable)

**Common Issues:**
- Missing dependencies
- TypeScript configuration errors
- Import resolution issues
- Missing environment variables

### Next.js Projects
Standard build command: `npm run build`

**Checklist:**
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes successfully
- [ ] `.next/` directory created
- [ ] No build errors
- [ ] Static pages generated correctly
- [ ] API routes compile correctly

**Common Issues:**
- Missing environment variables
- Image optimization issues
- Route configuration errors

### Electron Projects
Standard build command: `npm run build:electron` or `npm run build`

**Checklist:**
- [ ] Main process builds successfully
- [ ] Renderer process builds successfully
- [ ] Preload scripts compile correctly
- [ ] Electron packaging works (if applicable)
- [ ] Native dependencies compile (if applicable)

**Common Issues:**
- Native module compilation errors
- Electron version mismatches
- Path resolution issues

### Vanilla JavaScript Projects
**Checklist:**
- [ ] No syntax errors
- [ ] All dependencies available
- [ ] Build script works (if exists)
- [ ] Files are properly linked

## Build Verification Steps

1. **Install Dependencies**
   ```bash
   cd [project-name]
   npm install
   ```

2. **Run Build**
   ```bash
   npm run build
   ```

3. **Verify Output**
   - Check build output directory exists
   - Verify files are generated
   - Check bundle sizes

4. **Check for Errors**
   - Review console output
   - Check for TypeScript errors
   - Verify no missing dependencies

5. **Test Build Output**
   - Serve build output locally
   - Verify application runs
   - Check for runtime errors

## Common Build Issues and Fixes

### TypeScript Errors
- **Issue:** Type errors in TypeScript files
- **Fix:** Update types, fix type definitions, adjust tsconfig.json

### Missing Dependencies
- **Issue:** Module not found errors
- **Fix:** Install missing packages, check package.json

### Import Resolution Errors
- **Issue:** Cannot resolve import paths
- **Fix:** Check path aliases, update vite.config.ts or tsconfig.json

### Bundle Size Issues
- **Issue:** Bundle too large
- **Fix:** Code splitting, tree-shaking, remove unused dependencies

### Environment Variables
- **Issue:** Missing environment variables
- **Fix:** Create .env file, check environment variable usage

## Build Output Verification

### Expected Outputs
- Production build files
- Source maps (if configured)
- Asset files (images, fonts, etc.)
- Manifest files (if applicable)

### File Structure
```
dist/
├── index.html
├── assets/
│   ├── [hash].js
│   ├── [hash].css
│   └── [hash].png
└── ...
```

## Notes

- Always test builds in clean environment
- Check for platform-specific issues
- Verify build works on target deployment platform
- Keep build times reasonable
