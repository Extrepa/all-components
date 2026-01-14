# Instructions for Gemini - All Changes Since Cursor Editing Started

This document provides comprehensive instructions for Gemini about all changes made to the Universal Component Extractor project since editing began in Cursor. Use this as a reference when continuing development or making modifications.

## Version Information

**Current Version:** 2.0.5  
**Date:** November 2025

---

## 1. Documentation Consolidation (Major Reorganization)

### Overview
All markdown documentation files have been consolidated and reorganized to eliminate redundancy and improve navigation.

### Changes Made

#### Files Moved to Archive
The following files were moved to `docs/archive/` (preserved for reference):
- `INSTRUCTIONS.md` → Consolidated into `docs/USER_GUIDE.md`
- `WORKFLOW_USER.md` → Consolidated into `docs/USER_GUIDE.md`
- `FEATURES.md` → Consolidated into `docs/USER_GUIDE.md`
- `ARCHITECTURE.md` → Consolidated into `docs/DEVELOPER_GUIDE.md`
- `WORKFLOW_DEVELOPER.md` → Consolidated into `docs/DEVELOPER_GUIDE.md`
- `NOTES.md` → Consolidated into `docs/DEVELOPER_GUIDE.md`
- `WARP.md` → Consolidated into `docs/DEVELOPER_GUIDE.md`
- `IMPROVEMENT_PLAN.md` → Consolidated into `docs/PLANNING.md`
- `IMPROVEMENT_PLAN_REVIEW.md` → Consolidated into `docs/PLANNING.md`
- `PHASE_2_PLAN.md` → Consolidated into `docs/PLANNING.md`
- `PHASE_3_PLAN.md` → Consolidated into `docs/PLANNING.md`
- `docs/getting-started.md` → Consolidated into `docs/USER_GUIDE.md`
- `docs/bugfixes.md` → Merged into `docs/project-status.md`

#### New Consolidated Files Created
- `docs/USER_GUIDE.md` - Complete user documentation (replaces INSTRUCTIONS.md, WORKFLOW_USER.md, FEATURES.md, getting-started.md)
- `docs/DEVELOPER_GUIDE.md` - Complete developer documentation (replaces ARCHITECTURE.md, WORKFLOW_DEVELOPER.md, NOTES.md, WARP.md)
- `docs/PLANNING.md` - All planning documents consolidated (replaces IMPROVEMENT_PLAN.md, PHASE_2_PLAN.md, PHASE_3_PLAN.md, IMPROVEMENT_PLAN_REVIEW.md)
- `docs/CONSOLIDATION_SUMMARY.md` - Explains the consolidation process
- `docs/FILES_ANALYSIS.md` - Lists files that need updates or can be removed

#### Updated Files
- `README.md` - Updated to reference new consolidated documentation structure
- `docs/README.md` - Updated documentation index with new structure
- `docs/project-status.md` - Enhanced with bugfixes content

### Important Notes for Gemini
- **Always reference the new consolidated files** when looking for documentation
- **Do not reference old file names** (INSTRUCTIONS.md, WORKFLOW_USER.md, etc.) in code or documentation
- **Update any code references** that point to old documentation files (see FILES_ANALYSIS.md for files that need updates)
- **Archive location**: Original files are preserved in `docs/archive/` for historical reference only

### Files That Still Need Reference Updates
According to `docs/FILES_ANALYSIS.md`, these files need their documentation references updated:
1. `components/WelcomeModal.tsx` - References old WORKFLOW_USER.md, FEATURES.md, INSTRUCTIONS.md
2. `docs/checklist.md` - References bugfixes.md (now merged into project-status.md)
3. `docs/ai-prompts.md` - References old ARCHITECTURE.md, INSTRUCTIONS.md

---

## 2. PreviewDisplay.tsx - Major Preview System Overhaul

### Overview
The preview system was completely overhauled to use local libraries, blob URLs for ES modules, and improved framework detection.

### Key Changes

#### Local Library Loading
- **All libraries now load from local paths** (`/libs/`) instead of CDNs
- Libraries are installed via npm and copied to `public/libs/` during build
- **Three.js**: Loads from `/libs/three/` (both UMD and ES module versions)
- **p5.js**: Loads from `/libs/p5/` (version 1.9.0)
- **Babel Standalone**: Loads from `/libs/babel/` (version 7.23.10)
- **React/ReactDOM**: Loads from `/libs/react/` (UMD builds, version 18.2.0)

#### Blob URL Implementation
- **Preview now uses blob URLs** for iframe content instead of `srcdoc`
- Blob URLs provide proper origins for ES module imports
- Enables proper ES module loading for Three.js OrbitControls
- Blob URLs are created from HTML content and properly cleaned up on unmount

#### ES Module Support
- **Three.js OrbitControls** now loads as ES module after Three.js UMD loads
- Uses importmap for ES module resolution
- Proper async loading with event listeners (`threeready`, `orbitcontrolsready`)
- Fallback polling mechanism for compatibility

#### Framework Detection Improvements
- **Enhanced Three.js detection**: Checks for THREE. usage patterns, not just imports
- **p5.js detection**: Detects setup()/draw() functions and p5.js-specific functions
- **OrbitControls detection**: Checks if OrbitControls is needed before loading
- **Combined content analysis**: Analyzes HTML, JS, and TSX together for accurate detection

#### Preview Modes
- **Browser mode**: HTML/CSS only, no JS execution
- **Vanilla mode**: HTML + CSS + JS with light theme, centered layout
- **Canvas mode**: Same as vanilla but with dark background (#0a0a0a) for 3D/creative coding
- **React mode**: TSX compilation with Babel, React rendering

#### p5.js Integration
- **Global mode** for vanilla/canvas: setup/draw defined BEFORE p5.js loads
- **Instance mode** for React: Uses `new p5(sketch, element)` with useEffect
- Proper cleanup with `p5Instance.remove()` in React components
- CDN fallback if local library fails to load

#### Code Processing
- **Import stripping**: Removes ES module imports from vanilla JS, replaces with global access
- **Three.js shimming**: Converts `import THREE from 'three'` to `const THREE = window.THREE`
- **OrbitControls shimming**: Converts imports to `window.THREE.OrbitControls`
- **React code preparation**: Handles Three.js imports, removes other imports, normalizes exports
- **Optional chaining assignment fix**: Converts `obj?.prop = val` to `if (obj) obj.prop = val` (Babel limitation)

#### Error Handling
- **Runtime error display**: Shows errors in preview with dismiss button
- **Console log capture**: Captures console.log, warn, error from preview iframe
- **Error boundaries**: React error boundaries in compiled code
- **Loading states**: Shows "Loading Babel compiler..." and "Compiling React code..." states

#### Performance Improvements
- **Debounced inputs**: HTML, CSS, JS, TSX are debounced (500ms) to avoid excessive re-renders
- **Memoized srcDoc**: Preview HTML is memoized based on debounced inputs
- **Memoized blob URL**: Blob URL is memoized and only recreated when srcDoc changes
- **Proper cleanup**: Blob URLs are revoked on unmount to prevent memory leaks

### Important Notes for Gemini
- **Always use local library paths** (`/libs/`) in preview HTML generation
- **Never use CDN URLs** except as fallback (already implemented)
- **Blob URLs are required** for ES module support - don't revert to srcdoc
- **Three.js loading**: UMD first, then ES module for OrbitControls
- **p5.js loading**: Global mode requires setup/draw BEFORE library loads
- **Debouncing is critical** - don't remove debounce logic or reduce delay too much

---

## 3. aiService.ts - AI Service Enhancements

### Overview
The AI service was enhanced with interaction modes, extraction styles, model-specific guidance, and improved error handling.

### Key Changes

#### Interaction Modes
New `InteractionMode` type with three modes:
- **'extract'** (default): Full extraction and refactor
- **'explain'**: Focus on explanation, lighter code changes
- **'review'**: Structured review with suggestions and trade-offs

#### Extraction Styles
New `extractionStyle` option in `AISettings`:
- **'minimal'**: Preserve structure, fix obvious issues, light cleanup
- **'refactor'** (default): Modernize and simplify aggressively

#### Model-Specific Guidance
New `getModelGuidance()` function provides model-specific instructions:
- **Gemini models**: 3 Pro, 2.5 Pro, 2.5 Flash, Flash, Pro variants
- **OpenAI models**: GPT-5.1, GPT-5 Mini, GPT-4.1, GPT-4o, GPT-3.5
- **Anthropic models**: Claude 4 Opus, Claude 4 Sonnet, Claude 3.7 Sonnet, Claude 3.5 Sonnet/Haiku
- **Ollama models**: Llama 3, Code Llama, Phi-4, Gemma

#### Prompt System
- **Base prompt**: Comprehensive prompt template with all instructions
- **Provider-specific prompts**: Customized versions for Gemini, OpenAI, Anthropic, Ollama
- **Style guidance**: Injected into prompt based on extractionStyle
- **Mode guidance**: Injected into prompt based on interactionMode
- **Model guidance**: Injected into prompt based on selected model

#### p5.js Detection and Conversion
Enhanced prompt instructions for p5.js:
- **Detection patterns**: setup(), draw(), new p5(), p.setup, p.draw, p5.js functions
- **React conversion**: Must use instance mode with useEffect
- **Critical requirements**: No external libraries, must use refs, proper cleanup
- **Variable conversion**: Global p5 variables → instance variables (p.width, p.height, etc.)

#### Three.js Instructions
Updated instructions for Three.js:
- **No script tags**: Preview system loads Three.js automatically
- **No imports**: Use THREE. directly, no import statements
- **OrbitControls**: Automatically loaded if detected
- **3D Export**: Must assign scene to `window.scene` for export functionality

#### Error Handling
- **Centralized error formatting**: Uses `formatErrorMessage()` from errorHandler
- **Retry mechanism**: Uses `retryWithBackoff()` for network errors (Ollama)
- **Abort signal support**: All providers support cancellation via AbortSignal
- **User-friendly messages**: Errors are formatted for user display

#### Stream Processing
- **Unified stream processing**: `processStream()` handles all providers
- **Real-time updates**: `onProgress` callback provides partial results
- **Tag extraction**: Extracts XML tags (FRAMEWORK, CODE_HTML, etc.) from stream
- **Buffer management**: Accumulates text and extracts tags incrementally

### Important Notes for Gemini
- **Always include interactionMode and extractionStyle** in prompt construction
- **Model guidance is optional** - only add if model is recognized
- **Prompt structure**: Base prompt + style guidance + mode guidance + model guidance + source code
- **Stream processing**: Must handle partial tag content and accumulate properly
- **Error handling**: Always use centralized error formatting, never throw raw errors

---

## 4. Package.json Updates

### Version
- **Version updated to 2.0.5**

### Dependencies
- **@google/genai**: ^1.29.0 (Gemini SDK)
- **@babel/standalone**: ^7.23.10 (for React TSX compilation)
- **p5**: ^1.9.0 (p5.js library)
- **three**: ^0.160.0 (Three.js library)
- **react**: ^19.2.0
- **react-dom**: ^19.2.0

### Scripts
- **copy-libs**: Copies all libraries to public/libs/
- **verify-libs**: Verifies all required library files exist
- **build:electron**: Includes copy-libs and verify-libs before build

### Important Notes for Gemini
- **Always run copy-libs** before building or running in development
- **Library verification** is part of the build process
- **Local libraries are required** - don't remove copy-libs script

---

## 5. Project Status Updates

### Version 2.0.5 Features
- ✅ **Workstream D**: Framework-specific export presets (Vite React, Next.js)
- ✅ **Workstream E**: Smarter diffs & change history (extraction history, per-file diffs)
- ✅ **Workstream F**: Explain/Review interaction modes
- ✅ **AI Model Selection UX**: Enhanced model lists, visual indicators, model-specific guidance

### Technical Improvements
- ✅ New utility: `utils/diffUtils.ts` for unified diff generation
- ✅ Enhanced `utils/exportHelpers.ts` with framework-specific builders
- ✅ Updated `components/OutputPane.tsx` with history and per-file diff selection
- ✅ Updated `services/aiService.ts` with interaction modes and model guidance
- ✅ Updated `components/InputPane.tsx` with provider/model/mode indicator
- ✅ Updated `components/SettingsModal.tsx` with interaction mode selection

### Important Notes for Gemini
- **Version 2.0.5 is production-ready** - all Phase 3 workstreams complete
- **Extraction history** tracks last 5 extractions in session
- **Per-file diff selection** allows comparing specific files from multi-file projects
- **Interaction modes** are fully integrated into UI and AI service

---

## 6. Files That Need Updates

According to `docs/FILES_ANALYSIS.md`, these files still need updates:

### High Priority
1. **components/WelcomeModal.tsx**
   - Update references from WORKFLOW_USER.md, FEATURES.md, INSTRUCTIONS.md
   - Should reference `docs/USER_GUIDE.md` instead

2. **docs/checklist.md**
   - Update reference from bugfixes.md
   - Should reference `docs/project-status.md` instead

3. **docs/ai-prompts.md**
   - Update references from ARCHITECTURE.md, INSTRUCTIONS.md
   - Should reference DEVELOPER_GUIDE.md and USER_GUIDE.md

### Medium Priority
1. **metadata.json** - Verify if still needed (not referenced anywhere)
2. **docs/checklist.md** - Consider if still needed (appears to be one-time verification)

### Low Priority
1. **scripts/copy-three.js** - Can be safely deleted (replaced by copy-libs.js)

---

## 7. Development Guidelines for Gemini

### When Making Changes

1. **Documentation References**
   - Always use new consolidated file names
   - Update any old references you encounter
   - Check FILES_ANALYSIS.md for files that need updates

2. **Preview System**
   - Never use CDN URLs (except as fallback)
   - Always use local library paths (`/libs/`)
   - Maintain blob URL implementation for ES modules
   - Keep debouncing logic intact
   - Preserve framework detection improvements

3. **AI Service**
   - Always include interactionMode and extractionStyle
   - Add model-specific guidance when adding new models
   - Use centralized error handling
   - Maintain stream processing structure

4. **Library Management**
   - Libraries must be local (no CDN dependencies)
   - Run copy-libs before builds
   - Verify libraries exist before using

5. **Code Quality**
   - Follow existing patterns
   - Maintain TypeScript types
   - Update documentation when adding features
   - Test thoroughly before committing

### Testing Checklist
- ✅ All AI providers work (Ollama, Gemini, OpenAI, Anthropic)
- ✅ All preview modes work (Browser, Vanilla, Canvas, React)
- ✅ Local libraries load correctly
- ✅ ES modules work (Three.js OrbitControls)
- ✅ p5.js works in both global and instance modes
- ✅ Interaction modes work correctly
- ✅ Extraction history works
- ✅ Per-file diff selection works

---

## 8. Key Architecture Decisions

### Why Blob URLs?
- ES modules require proper origins
- Blob URLs provide proper origins for ES module imports
- Enables Three.js OrbitControls to load as ES module
- Better security than data URLs

### Why Local Libraries?
- Offline support
- Better performance (no CDN latency)
- Consistent versions
- No external dependencies

### Why Debouncing?
- Prevents excessive iframe re-renders during streaming
- Improves performance
- Reduces flickering in preview
- 500ms delay is optimal balance

### Why Interaction Modes?
- Different use cases need different AI behavior
- Extract: Full refactor for reuse
- Explain: Educational focus
- Review: Code review perspective

---

## 9. Common Pitfalls to Avoid

1. **Don't revert to CDN URLs** - Local libraries are required
2. **Don't remove blob URL implementation** - ES modules need it
3. **Don't remove debouncing** - Performance critical
4. **Don't reference old documentation files** - Use consolidated files
5. **Don't forget to run copy-libs** - Libraries won't be available
6. **Don't remove error handling** - User experience critical
7. **Don't break stream processing** - Real-time updates required

---

## 10. Future Considerations

When adding new features, consider:
- **Documentation**: Update consolidated docs, not old files
- **Local libraries**: Any new libraries must be local
- **Preview compatibility**: Ensure new features work in all preview modes
- **AI integration**: Consider if interaction modes affect new features
- **Testing**: Add tests for new functionality
- **Version bump**: Update version in package.json and docs

---

## Summary

The project has undergone significant improvements:
1. **Documentation consolidation** - Better organization, single source of truth
2. **Preview system overhaul** - Local libraries, blob URLs, ES modules, better framework detection
3. **AI service enhancements** - Interaction modes, extraction styles, model guidance
4. **Version 2.0.5** - Production-ready with all Phase 3 features complete

When continuing development:
- Reference this document for context
- Follow the guidelines above
- Update documentation references as you encounter them
- Maintain the architectural decisions
- Test thoroughly before committing

---

**Last Updated:** November 2025  
**Version:** 2.0.5  
**For Gemini:** Use this document as your primary reference for understanding recent changes and continuing development.

