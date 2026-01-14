# Testing Documentation

This document provides comprehensive testing guides, checklists, and results for the Universal Component Extractor.

## Table of Contents

1. [Testing Guide](#testing-guide)
2. [Test Checklists](#test-checklists)
3. [Test Results](#test-results)
4. [Code Analysis System Testing](#code-analysis-system-testing)

---

## Testing Guide

### AI Provider Testing

#### Ollama Provider

**Prerequisites:**
- Ollama installed and running
- At least one model downloaded (e.g., `ollama pull llama3.2`)

**Test Cases:**

- [x] **Basic Extraction**
  - Paste simple HTML code
  - Select Ollama provider
  - Choose model (e.g., llama3.2)
  - Click "Extract Component"
  - Verify extraction completes successfully
  - Verify code is generated in all tabs (HTML, CSS, TSX, JS)

- [x] **Streaming Progress**
  - Start extraction
  - Verify code appears progressively (streaming)
  - Verify UI updates in real-time
  - Verify no UI freezing during extraction

- [x] **Error Handling**
  - Stop Ollama service
  - Attempt extraction
  - Verify clear error message displayed
  - Verify error suggests checking Ollama is running

- [x] **Model Selection**
  - Switch between different Ollama models
  - Verify extraction works with each model
  - Verify settings persist after app restart

#### Gemini Provider

**Prerequisites:**
- Valid Gemini API key

**Test Cases:**

- [x] **API Key Configuration**
  - Enter Gemini API key in settings
  - Save settings
  - Verify key is stored (masked in UI)
  - Verify settings persist after app restart

- [x] **Basic Extraction**
  - Select Gemini provider
  - Choose model (e.g., gemini-2.5-flash)
  - Extract component
  - Verify successful extraction

- [x] **Rate Limiting**
  - Make multiple rapid extraction requests
  - Verify rate limit error handling
  - Verify user-friendly error message

- [x] **Invalid API Key**
  - Enter invalid API key
  - Attempt extraction
  - Verify appropriate error message

#### OpenAI Provider

**Prerequisites:**
- Valid OpenAI API key

**Test Cases:**

- [x] **API Key Configuration**
  - Enter OpenAI API key
  - Save settings
  - Verify settings persist

- [x] **Model Selection**
  - Test with gpt-5.1 (if available on your account)
  - Test with gpt-4.1-mini or gpt-4o
  - Test with gpt-3.5-turbo
  - Verify all models work correctly

- [x] **Extraction Quality**
  - Extract complex React component
  - Verify TSX output is valid
  - Verify code quality is good

#### Anthropic Provider

**Prerequisites:**
- Valid Anthropic API key

**Test Cases:**

- [x] **API Key Configuration**
  - Enter Anthropic API key
  - Save settings
  - Verify settings persist

- [x] **Model Selection**
  - Test with claude-opus-4-20250514 or claude-sonnet-4-20250514 (if available on your account)
  - Test with claude-3.5-sonnet-20241022
  - Test with claude-3-haiku-20240307
  - Verify all models work correctly

---

## Preview Mode Testing

### Browser Preview

**Test Cases:**

- [x] **HTML-Only Content**
  - Extract HTML-only component (no JS)
  - Verify preview mode switches to Browser
  - Verify HTML renders correctly
  - Verify CSS styles applied

- [x] **No JavaScript Execution**
  - Verify JavaScript is not executed in Browser mode
  - Verify console shows no JS errors

### Vanilla JS Preview

**Test Cases:**

- [x] **Basic HTML/CSS/JS**
  - Extract simple HTML component
  - Verify preview renders correctly
  - Verify styles are applied
  - Verify JavaScript executes

- [x] **Console Logs**
  - Add console.log to extracted JS
  - Verify logs appear in console panel
  - Verify log levels (info, warn, error) work

- [x] **Error Display**
  - Introduce syntax error in JS
  - Verify error appears in preview
  - Verify error message is clear

### Canvas Preview

**Test Cases:**

- [x] **Three.js Scenes**
  - Extract Three.js component
  - Verify preview mode switches to Canvas
  - Verify 3D scene renders
  - Verify OrbitControls work (if present)
  - Verify scene is interactive

- [x] **p5.js Sketches**
  - Extract p5.js component
  - Verify preview mode switches to Canvas
  - Verify sketch animates correctly
  - Verify setup() and draw() functions work

- [x] **Library Loading**
  - Verify Three.js loads from local path
  - Verify p5.js loads from local path
  - Verify no CDN dependencies
  - Verify blob URLs work correctly
  - Verify ES modules load successfully

### React Preview

**Test Cases:**

- [x] **React Component Rendering**
  - Extract React component
  - Verify preview mode switches to React
  - Verify component renders correctly
  - Verify React hooks work (useState, useEffect)

- [x] **Babel Compilation**
  - Extract TSX component
  - Verify Babel compiles successfully
  - Verify no compilation errors

- [x] **Error Boundaries**
  - Introduce runtime error in React component
  - Verify error boundary catches error
  - Verify error message displayed

---

## Code Analysis System Testing

### Code Analysis Panel

**Test Cases:**

- [x] **Code Type Detection**
  - Paste HTML code → Verify detects "HTML"
  - Paste React code → Verify detects "React/TSX"
  - Paste Three.js code → Verify detects "Three.js"
  - Paste p5.js code → Verify detects "p5.js"
  - Paste vanilla JS → Verify detects "Vanilla JavaScript"

- [x] **Completeness Detection**
  - Paste complete HTML document → Verify "Complete"
  - Paste code fragment → Verify "Fragment"
  - Paste code snippet → Verify "Snippet"

- [x] **Error Detection**
  - Paste code with syntax errors → Verify errors shown
  - Paste code with unclosed brackets → Verify error detected
  - Paste code with missing dependencies → Verify warnings shown

- [x] **Wrapping Recommendations**
  - Paste Three.js fragment → Verify wrapping recommended
  - Paste p5.js setup/draw → Verify wrapping recommended
  - Paste complete HTML → Verify no wrapping needed
  - Paste React code → Verify no wrapping needed

- [x] **Action Buttons**
  - Verify "Preview As-Is" appears when code can be previewed
  - Verify "Wrap & Preview" appears when wrapping recommended
  - Verify "Extract Component" always available
  - Verify buttons work correctly

### Preview Workflow

**Test Cases:**

- [x] **Preview As-Is**
  - Paste complete HTML code
  - Click "Preview As-Is"
  - Verify preview appears without modifications
  - Verify code renders correctly

- [x] **Wrap & Preview**
  - Paste Three.js fragment
  - Click "Wrap & Preview"
  - Verify code is wrapped in HTML structure
  - Verify Three.js library loads
  - Verify preview works correctly

- [x] **Extract from Analysis**
  - Paste code
  - View analysis panel
  - Click "Extract Component"
  - Verify extraction starts
  - Verify analysis panel closes

---

## File Upload Testing

### Single File Upload

**Test Cases:**

- [x] **HTML File**
  - Upload .html file
  - Verify file appears in file list
  - Verify content loads in textarea
  - Verify file type detected correctly

- [x] **CSS File**
  - Upload .css file
  - Verify file appears correctly
  - Verify content accessible

- [x] **JavaScript File**
  - Upload .js file
  - Verify file appears correctly
  - Verify content accessible

- [x] **React Component File**
  - Upload .tsx or .jsx file
  - Verify file type detected
  - Verify content accessible

- [x] **Three.js File**
  - Upload .3js file
  - Verify file type detected
  - Verify content accessible

### Multiple File Upload

**Test Cases:**

- [x] **Multiple Files Selection**
  - Select multiple files at once
  - Verify all files appear in file list
  - Verify all files are accessible

- [x] **Drag and Drop**
  - Drag multiple files onto input area
  - Verify files are accepted
  - Verify visual feedback during drag
  - Verify files appear after drop

- [x] **File Removal**
  - Upload multiple files
  - Remove one file
  - Verify file is removed from list
  - Verify other files remain

- [x] **File Replacement**
  - Upload file with same name
  - Verify file is replaced (not duplicated)
  - Verify content updates

---

## Export Functionality Testing

### Individual File Exports

**Test Cases:**

- [x] **Download HTML**
  - Extract component
  - Click "Download .html"
  - Verify file downloads
  - Verify file contains correct content
  - Verify file is standalone (includes CSS/JS inline)

- [x] **Download TSX**
  - Extract React component
  - Click "Download .tsx"
  - Verify file downloads
  - Verify file contains valid TSX
  - Verify file can be imported in React project

- [x] **Download JS**
  - Extract component
  - Click "Download .js"
  - Verify file downloads
  - Verify file contains valid JavaScript

- [x] **Download CSS**
  - Extract component with styles
  - Click "Download .css" (from code display)
  - Verify file downloads
  - Verify CSS is valid

### ZIP Export

**Test Cases:**

- [x] **Full ZIP Export**
  - Extract component
  - Click "Full .zip"
  - Verify ZIP downloads
  - Extract ZIP and verify structure:
    - index.html
    - ComponentName.css
    - ComponentName.js
    - ComponentName.tsx
    - ComponentName.scss
    - README.md
  - Verify all files are valid

- [x] **ZIP with Multiple Files**
  - Extract complex component
  - Export as ZIP
  - Verify all file types included
  - Verify file structure is correct

### JSON Export

**Test Cases:**

- [x] **Data JSON Export**
  - Extract component
  - Click "Data .json"
  - Verify JSON downloads
  - Verify JSON contains all extracted data
  - Verify JSON can be imported back

- [x] **JSON Import**
  - Export component as JSON
  - Clear app
  - Import JSON file
  - Verify component restores correctly
  - Verify preview works

### 3D Scene Export

**Test Cases:**

- [x] **Three.js Scene Export**
  - Extract Three.js component
  - Switch to Vanilla JS preview (required for export)
  - Click "Export 3D Scene"
  - Verify JSON downloads
  - Verify JSON contains scene data
  - Verify JSON can be loaded in Three.js

- [x] **Export Button State**
  - Extract React component
  - Verify "Export 3D Scene" button is disabled
  - Switch to Vanilla JS preview
  - Verify button becomes enabled

---

## Blob URL and Preview Button Testing

### Blob URL Implementation

**Test Cases:**

- [x] **Three.js with OrbitControls**
  - Click "Three.js Cube" example button
  - Click "Preview"
  - Verify: NO "Unexpected end of input" errors
  - Verify: NO "about:srcdoc" errors
  - Verify: "Three.js loaded: true" appears
  - Verify: "OrbitControls loaded and attached: true" appears
  - Verify: 3D cube renders and is interactive

- [x] **Three.js without OrbitControls**
  - Paste Three.js code without OrbitControls
  - Click "Preview"
  - Verify: Cube renders and rotates
  - Verify: No OrbitControls errors

- [x] **p5.js Sketch**
  - Click "p5.js Sketch" example button
  - Click "Preview"
  - Verify: p5.js sketch renders and animates
  - Verify: No module loading errors

- [x] **Blob URL Creation**
  - Open DevTools → Network tab
  - Click "Preview" on any code
  - Verify: iframe `src` starts with `blob:http://...` (not `about:srcdoc`)
  - Verify: No network errors for module loading

- [x] **Module Resolution**
  - Check iframe source in DevTools
  - Verify: `importmap` uses absolute URLs
  - Verify: ES modules load successfully

- [x] **Memory Management**
  - Preview code → Change code → Preview again
  - Verify: New blob URL is created (old one is revoked)
  - Verify: No memory leaks

### Preview Button Functionality

**Test Cases:**

- [x] **Framework Detection**
  - Paste Three.js code → Click Preview → Verify: `previewMode` is `'canvas'`
  - Paste React code → Click Preview → Verify: `previewMode` is `'react'`
  - Paste HTML → Click Preview → Verify: `previewMode` is `'browser'`
  - Paste vanilla JS → Click Preview → Verify: `previewMode` is `'vanilla'`

- [x] **Code Parsing**
  - Paste HTML with `<style>` and `<script>` tags
  - Click "Preview"
  - Verify: HTML, CSS, and JS are separated correctly
  - Verify: Preview shows styled HTML with working JavaScript

- [x] **Example Buttons Behavior**
  - Click any example button
  - Verify: Input box fills with example code
  - Verify: NO preview appears automatically
  - Verify: NO extracted code appears automatically
  - Click "Preview" → Verify: Preview appears correctly

---

## Error Handling Testing

### Network Errors

**Test Cases:**

- [x] **API Connection Failure**
  - Disconnect internet
  - Attempt extraction with API provider
  - Verify clear error message
  - Verify error suggests checking connection

- [x] **Ollama Not Running**
  - Stop Ollama service
  - Attempt extraction
  - Verify error message
  - Verify helpful troubleshooting tips

### Invalid Input

**Test Cases:**

- [x] **Empty Input**
  - Clear textarea
  - Click "Extract Component"
  - Verify error message
  - Verify button is disabled when empty

- [x] **Invalid Code**
  - Paste malformed code
  - Attempt extraction
  - Verify AI handles gracefully
  - Verify error messages are helpful

- [x] **Unsupported File Type**
  - Attempt to upload unsupported file
  - Verify error or rejection message

### AI Errors

**Test Cases:**

- [x] **Rate Limiting**
  - Make rapid extraction requests
  - Verify rate limit error handling
  - Verify user-friendly message

- [x] **Safety Filters**
  - Attempt extraction with flagged content
  - Verify safety filter error message
  - Verify helpful guidance

- [x] **Invalid API Key**
  - Enter invalid API key
  - Attempt extraction
  - Verify authentication error
  - Verify clear error message

---

## UI/UX Testing

### Responsive Design

**Test Cases:**

- [x] **Desktop Layout**
  - Test on large screen (1920x1080+)
  - Verify layout is optimal
  - Verify no horizontal scrolling

- [x] **Tablet Layout**
  - Test on tablet-sized screen (1024x768)
  - Verify layout adapts
  - Verify usability maintained

- [x] **Mobile Layout**
  - Test on mobile-sized screen (375x667)
  - Verify layout is usable
  - Verify touch interactions work

### Accessibility

**Test Cases:**

- [x] **Keyboard Navigation**
  - Navigate entire app with keyboard only
  - Verify all interactive elements accessible
  - Verify focus indicators visible

- [x] **Screen Reader**
  - Test with screen reader
  - Verify ARIA labels present
  - Verify content is readable

- [x] **Color Contrast**
  - Verify text contrast meets WCAG AA
  - Verify interactive elements have clear focus states

### User Experience

**Test Cases:**

- [x] **Loading States**
  - Start extraction
  - Verify loading spinner appears
  - Verify "Analyzing..." text shows
  - Verify button is disabled during loading

- [x] **Progress Feedback**
  - Start extraction
  - Verify code streams in progressively
  - Verify UI updates smoothly
  - Verify no UI freezing

- [x] **Modal Interactions**
  - Open settings modal
  - Verify backdrop click closes modal
  - Verify Escape key closes modal
  - Verify focus trap works

- [x] **Tab Navigation**
  - Switch between tabs
  - Verify content loads correctly
  - Verify active tab indicator works
  - Verify keyboard navigation works

---

## Performance Testing

### Load Times

**Test Cases:**

- [x] **Initial Load**
  - Measure app load time
  - Verify loads within 3 seconds
  - Verify no blocking operations

- [x] **Library Loading**
  - Measure Three.js load time
  - Measure p5.js load time
  - Measure Babel load time
  - Verify libraries load from local paths

### Extraction Performance

**Test Cases:**

- [x] **Small Component**
  - Extract simple component (< 100 lines)
  - Measure extraction time
  - Verify completes within reasonable time

- [x] **Large Component**
  - Extract complex component (> 1000 lines)
  - Measure extraction time
  - Verify streaming works smoothly
  - Verify no UI freezing

- [x] **Multiple Files**
  - Upload 10+ files
  - Extract component
  - Verify performance is acceptable
  - Verify memory usage is reasonable

### Preview Performance

**Test Cases:**

- [x] **Preview Rendering**
  - Extract component
  - Measure preview render time
  - Verify renders within 1 second

- [x] **Preview Updates**
  - Edit extracted code
  - Verify preview updates smoothly
  - Verify debouncing works (no excessive updates)

---

## Test Results

### Build Tests

**Results:**
- ✅ TypeScript Compilation: Electron main process compiles successfully
- ✅ Electron preload script compiles successfully
- ✅ React app TypeScript checks pass
- ✅ No linter errors found
- ✅ `npm run build:electron` completes successfully
- ✅ Electron files generated in `dist-electron/`
- ✅ React app built in `dist/`
- ✅ All dependencies installed correctly

### Blob URL Implementation

**Results:**
- ✅ Switched from `srcDoc` to blob URLs for iframe content
- ✅ Added blob URL creation with proper cleanup
- ✅ Updated CSP to allow http: and https: origins for ES module imports
- ✅ Maintained absolute URL paths for Three.js/OrbitControls modules
- ✅ No "about:srcdoc" errors
- ✅ ES modules load successfully with blob URLs
- ✅ Memory management working correctly

### Preview Button Implementation

**Results:**
- ✅ Added "Preview" button next to "Extract Component" button
- ✅ Implemented `handlePreviewClick` with framework detection
- ✅ Code parsing (HTML/CSS/JS separation) working
- ✅ Automatic preview mode selection working
- ✅ ExtractedCode object creation for preview working
- ✅ Example buttons only fill input (no auto-preview/extract)

### Code Analysis System

**Results:**
- ✅ Code type detection working correctly
- ✅ Completeness checking functional
- ✅ Error detection operational
- ✅ Wrapping needs analysis accurate
- ✅ Preview mode suggestions correct
- ✅ Action buttons appear based on analysis

---

## Test Results Template

When running tests, use this template to document results:

```
## Test Run: [Date]

### Environment
- OS: [Operating System]
- Browser/Electron: [Version]
- Node: [Version]
- AI Provider: [Provider and Model]

### Results Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Skipped: [Number]

### Failed Tests
[List any failed tests with details]

### Notes
[Any additional observations]
```

---

## Continuous Testing

### Before Each Release

1. Run full test suite
2. Test on multiple platforms (if applicable)
3. Test with all AI providers
4. Verify all export formats work
5. Check for performance regressions
6. Test code analysis system
7. Test preview modes (Browser/Vanilla/Canvas/React)
8. Test wrapping functionality

### After Major Changes

1. Run relevant test section
2. Verify no regressions in related features
3. Update test documentation if needed

---

## Reporting Issues

When you find a bug during testing:

1. Document the exact steps to reproduce
2. Note expected vs actual behavior
3. Include screenshots if applicable
4. Note environment details (OS, version, etc.)
5. Report in issue tracker or document in project notes

---

## Success Criteria

✅ All Three.js examples load without errors
✅ OrbitControls works correctly
✅ No "about:srcdoc" errors in console
✅ Preview button detects frameworks correctly
✅ Example buttons only fill input (no auto-preview/extract)
✅ Blob URLs are used instead of srcDoc
✅ ES modules load successfully with blob URLs
✅ Code analysis system works correctly
✅ Wrapping functionality works as expected
✅ All preview modes function correctly
✅ No console errors or warnings
✅ Memory usage is stable (no leaks)

