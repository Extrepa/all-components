# User Workflow Guide

This guide walks you through common workflows and use cases for the Universal Component Extractor. Follow these step-by-step instructions to get the most out of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Workflows](#basic-workflows)
3. [Advanced Workflows](#advanced-workflows)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)

---

## Getting Started

### First-Time Setup

1. **Install the Application**
   - Download and install the Universal Component Extractor
   - Launch the application

2. **Configure AI Provider**
   - Click the settings button (⚙️) in the top right corner
   - Choose your AI provider:
     - **Ollama** (Recommended - Free & Local)
     - **Gemini** (Requires API key)
     - **OpenAI** (Requires API key)
     - **Anthropic** (Requires API key)
   - Enter your API key if required
   - Select your preferred model
   - Click "Save Settings"

3. **Set Up Ollama (Recommended)**
   ```bash
   # Install Ollama from https://ollama.ai
   # Then download a model:
   ollama pull llama3.2
   ```
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - In the app, select Ollama as your provider
   - Choose your model (e.g., llama3.2)

---

## Basic Workflows

### Workflow 0: Understanding Your Code (NEW - Code Analysis)

**Use Case:** You've pasted code from the web and want to understand what it is, if it needs wrapping, and what you can do with it.

**Steps:**

1. **Paste Your Code**
   - Paste any code into the input textarea
   - Can be HTML, React, Three.js, p5.js, vanilla JS, or mixed

2. **Click Preview Button**
   - Click the "Preview" button (purple button above the input)
   - The code analysis panel will appear

3. **Review the Analysis**
   - **Code Type**: See what type of code was detected (HTML, React, Three.js, etc.)
   - **Completeness**: Check if it's complete, a fragment, or just a snippet
   - **Errors/Warnings**: See any syntax errors or missing dependencies
   - **Wrapping Needs**: Understand if wrapping is recommended and why
   - **Dependencies**: See what libraries are needed
   - **Recommendations**: Get actionable advice

4. **Choose Your Action**
   - **Preview As-Is**: If code is complete and doesn't need wrapping
   - **Wrap & Preview**: If code needs HTML structure (Three.js/p5.js fragments)
   - **Extract**: Use AI to analyze and extract structured component code

**Understanding Wrapping:**
- **When Needed**: Code fragments (Three.js/p5.js without HTML, JS that manipulates DOM without HTML structure)
- **What It Does**: Adds necessary HTML structure and library script tags
- **Why**: Some code needs a complete HTML page to run properly
- **User Control**: Wrapping is never automatic - you decide!

**Example Scenarios:**
- **Three.js fragment**: "Wrap & Preview" adds HTML, container div, and Three.js library
- **Complete HTML**: "Preview As-Is" works immediately
- **React component**: "Preview As-Is" - React code is automatically compiled
- **p5.js setup/draw**: "Wrap & Preview" adds HTML and p5.js library

---

### Workflow 1: Extracting from HTML/CSS/JS

**Use Case:** You have a standalone HTML file with embedded CSS and JavaScript, and you want to extract it as a clean, modern component.

**Steps:**

1. **Prepare Your Code**
   - Open your HTML file
   - Copy the entire content (HTML, CSS, and JavaScript)

2. **Input the Code**
   - Paste the code into the input textarea on the left side
   - Or click "Import" and select your HTML file

3. **Optional: Analyze First**
   - Click "Preview" to see code analysis
   - Understand what type of code it is
   - See if there are any issues
   - Choose to preview or extract

4. **Extract the Component**
   - Click the "Extract Component" button
   - Wait for the AI to analyze and extract (this may take 30-60 seconds)
   - Watch as the code streams in progressively

4. **Review the Results**
   - **Preview Tab**: See your component rendered live
   - **Extracted Code Tab**: Review the extracted HTML, CSS, TSX, and JS
   - **Analysis Tab**: Read the AI's explanation and recommendations

5. **Export Your Component**
   - **Single HTML**: Click "Single .html" for a standalone file
   - **Full ZIP**: Click "Full .zip" for a complete project structure
   - **Individual Files**: Use the download buttons in each code tab

**Tips:**
- The AI will automatically modernize your CSS with variables
- JavaScript will be refactored to ES6+ syntax
- React component (TSX) will be generated automatically

---

### Workflow 2: Extracting from React Components

**Use Case:** You have a React component file (JSX/TSX) and want to extract it as a clean, standalone component.

**Steps:**

1. **Input Your React Code**
   - Paste your React component code
   - Or upload your .jsx or .tsx file

2. **Extract the Component**
   - Click "Extract Component"
   - The AI will analyze your React code

3. **Review in React Preview**
   - The preview will automatically switch to "React Preview" mode
   - Verify the component renders correctly
   - Check the console for any errors

4. **Use the Extracted Code**
   - **TSX Tab**: Get the cleaned React component
   - **Download .tsx**: Export for use in your React project
   - The component will be dependency-free and ready to use

**Tips:**
- The AI removes build-step dependencies
- Props and state management are preserved
- Hooks (useState, useEffect) are maintained

---

### Workflow 3: Extracting from Three.js Scenes

**Use Case:** You have a Three.js scene and want to extract it as a clean, standalone component.

**Steps:**

1. **Input Your Three.js Code**
   - Paste your Three.js code
   - Or upload your .3js or .js file containing Three.js code

2. **Extract the Component**
   - Click "Extract Component"
   - The AI will detect Three.js usage

3. **Preview in Canvas Mode**
   - The preview will automatically switch to "Canvas" mode
   - Interact with the 3D scene using OrbitControls
   - Verify the scene renders correctly

4. **Export Options**
   - **Download .js**: Get the vanilla JavaScript version
   - **Export 3D Scene**: Export the scene as JSON (switch to Vanilla JS preview first)
   - **Full .zip**: Get complete project with all files

**Tips:**
- Three.js is automatically loaded - no imports needed
- OrbitControls are automatically detected and loaded
- The scene is assigned to `window.scene` for export capability

---

### Workflow 4: Working with Multiple Files

**Use Case:** You have a project with multiple files (HTML, CSS, JS, etc.) and want to extract them as a single component.

**Steps:**

1. **Upload Multiple Files**
   - Click "Import" button
   - Select multiple files (or drag and drop them)
   - Files will appear in the file list

2. **Browse Your Files**
   - Click the "Code Browser" tab
   - Navigate through your files
   - Review each file's content

3. **Understanding Preview vs Extract with Multiple Files**
   - **Preview Button**: Only previews the content currently in the textarea (single file)
     - Useful for quickly testing one file at a time
     - A hint will appear below the Preview button when multiple files are uploaded
   - **Extract Component Button**: Analyzes and extracts from ALL uploaded files together
     - The AI combines all files intelligently
     - Understands file structure and relationships
     - Best for extracting complete multi-file projects

4. **Extract from All Files**
   - Click "Extract Component"
   - The AI will analyze all files together
   - It will understand the file structure and relationships

5. **Review Combined Results**
   - The extracted code will combine all your files intelligently
   - File structure will be preserved in the output
   - Dependencies will be detected automatically

**Tips:**
- Files are automatically categorized (markup, stylesheet, script, data)
- The AI understands file relationships
- You can remove individual files before extraction
- Use Preview for single-file testing, Extract for multi-file projects

---

### Workflow 5: Using Example Code

**Use Case:** You want to quickly try the extraction feature or learn how it works.

**Steps:**

1. **Choose an Example**
   - Scroll down to the "Example Code" section
   - Click any example button:
     - Simple Card (HTML/CSS)
     - React Counter (React)
     - Three.js Cube (Three.js)
     - p5.js Sketch (p5.js)
     - Vanilla JS Animation (Vanilla JS)

2. **Code Loads Automatically**
   - The code will appear in the textarea
   - Preview mode will switch automatically
   - For Three.js/p5.js, a preview will appear immediately

3. **Extract the Component**
   - Click "Extract Component"
   - See how the AI analyzes and improves the code

4. **Learn from Results**
   - Review the Analysis tab for explanations
   - See how the code was modernized
   - Understand the extraction process

**Tips:**
- Examples are great for learning the tool
- Use them as templates for your own code
- Modify examples before extraction to see how AI handles changes

---

## Advanced Workflows

### Workflow 6: Extracting from JSON Data

**Use Case:** You have JSON data that represents a component structure, and you want to convert it to code.

**Steps:**

1. **Input JSON Data**
   - Paste your JSON into the textarea
   - Or upload a .json file

2. **Extract the Component**
   - Click "Extract Component"
   - The AI will interpret the JSON structure
   - It will generate appropriate HTML/CSS/JS

3. **Review Generated Code**
   - Check if the structure matches your expectations
   - Modify if needed using the code editor

**Tips:**
- JSON should represent component structure
- The AI can handle various JSON formats
- Complex nested structures are supported

---

### Workflow 7: Editing Extracted Code

**Use Case:** You want to modify the extracted code before exporting.

**Steps:**

1. **Extract Your Component**
   - Follow any extraction workflow above

2. **Navigate to Extracted Code Tab**
   - Click the "Extracted Code" tab
   - Select the code tab you want to edit (HTML, CSS, TSX, JS)

3. **Edit the Code**
   - Click the "Edit" button (if available)
   - Make your changes directly in the code editor
   - Changes are saved automatically

4. **Preview Your Changes**
   - Switch to Preview tab
   - Your changes will be reflected in real-time
   - Verify everything works correctly

5. **Export Modified Code**
   - Use any export option
   - Your edits will be included in the export

**Tips:**
- Code editing is available in the Extracted Code tab
- Preview updates automatically
- You can edit multiple code sections

---

### Workflow 8: Exporting for Different Use Cases

**Use Case:** You want to use the extracted component in a specific project or framework.

**Steps:**

1. **Extract Your Component**
   - Complete any extraction workflow

2. **Choose Export Format**

   **For Standalone Use:**
   - Click "Single .html"
   - Get a complete HTML file with embedded CSS/JS
   - Can be opened directly in a browser

   **For React Projects (Presets + Direct Files):**
   - Click "React component (.tsx + .css)" in the **Export presets** section to download a small ZIP containing just:
     - `YourComponent.tsx` – the extracted React component
     - `YourComponent.css` – styles only for this component (when available)
     - `README.md` – short usage notes
   - Click "Vite React preset (src/components)" for a ZIP laid out as a Vite-style `src/components` folder with TSX/CSS plus README and an example `App.tsx` snippet.
   - Click "Next.js preset (components/)" for a ZIP laid out as a Next.js-style `components` folder with TSX/CSS Module plus README and an example `Page` snippet.
   - Or click "Download .tsx" in the TSX tab to grab just the component file.
   - Import into your React or Next.js project and wire up props/state as needed.

   **For Vanilla JS / Static Sites (Presets + Direct Files):**
   - Click "Vanilla widget (index.html + .js + .css)" in the **Export presets** section to download a ZIP containing:
     - `index.html` – a minimal HTML shell wired to the widget
     - `YourComponent.js` – extracted JavaScript logic
     - `YourComponent.css` – matching styles
     - `README.md` – how to drop it into a static site or existing page
   - Or click "Download .js" / "Download .css" in the respective tabs to integrate into an existing build.

   **For Complete Project:**
   - Click "Full .zip"
   - Extract the ZIP file
   - You have a complete project structure
   - Includes README with instructions

   **For Data Backup:**
   - Click "Data .json"
   - Save the complete extraction data
   - Can be imported back later

**Tips:**
- Each export format is optimized for its use case.
- Presets are the fastest path to either a React component bundle or a vanilla drop-in widget.
- Full ZIP includes all file types and a README.
- JSON export allows you to restore later and replay the extraction.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Extraction Fails or Times Out

**Possible Causes:**
- AI provider is not configured correctly
- Network connection issues (for API providers)
- Ollama is not running (for Ollama provider)
- Input code is too large or complex

**Solutions:**
1. Check your AI provider settings
2. Verify API keys are correct (for API providers)
3. Check if Ollama is running: `curl http://localhost:11434/api/tags`
4. Try breaking large code into smaller chunks
5. Check the console for detailed error messages

---

#### Issue: Preview Doesn't Render

**Possible Causes:**
- Code has syntax errors
- Required libraries aren't loading
- Preview mode is incorrect

**Solutions:**
1. Check the Console panel for errors
2. Verify the preview mode matches your code type
3. For Three.js: Ensure you're using Canvas preview mode
4. For React: Ensure you're using React preview mode
5. Try refreshing the preview (refresh button)

---

#### Issue: Exported Code Doesn't Work

**Possible Causes:**
- Missing dependencies
- Incorrect file paths
- Build configuration issues

**Solutions:**
1. Review the Analysis tab for build recommendations
2. Check the README in the ZIP export
3. Verify all dependencies are installed
4. Check file paths in the exported code
5. Review the "Build Approach" section in Analysis tab

---

#### Issue: Three.js Scene Doesn't Export

**Possible Causes:**
- Preview mode is set to React
- Scene object not assigned to window.scene

**Solutions:**
1. Switch preview mode to "Vanilla JS" or "Canvas"
2. The export button will become enabled
3. Ensure your Three.js code assigns the scene: `window.scene = scene;`
4. The AI should add this automatically during extraction

---

#### Issue: File Upload Doesn't Work

**Possible Causes:**
- File type not supported
- File is too large
- Browser/Electron permissions

**Solutions:**
1. Check supported file types: .html, .css, .js, .tsx, .jsx, .json, .3js
2. Try a smaller file
3. Check browser/Electron console for errors
4. Try drag and drop instead of file picker

---

## Best Practices

### Getting the Best Extraction Results

1. **Provide Complete Code**
   - Include all related HTML, CSS, and JavaScript
   - Don't omit important parts
   - Include comments if they provide context

2. **Use Clear Structure**
   - Well-organized code extracts better
   - Use meaningful class names
   - Separate concerns (HTML, CSS, JS)

3. **Include Context**
   - Add comments explaining complex logic
   - Describe what the component does
   - Note any special requirements

4. **Test Multiple Providers**
   - Different AI providers may give different results
   - Try Ollama (free) first
   - Compare results from different providers

### Optimizing Your Workflow

1. **Start with Examples**
   - Use example code to understand the tool
   - Modify examples to learn
   - Build confidence before extracting your own code

2. **Use Multi-File Upload**
   - Upload all related files together
   - The AI understands file relationships
   - Better results with complete context

3. **Review Analysis Tab**
   - Read the AI's explanations
   - Understand what was changed
   - Learn from the recommendations

4. **Iterate and Refine**
   - Extract, review, modify, re-extract
   - Each iteration improves the result
   - Use the code editor to make quick fixes

### Performance Tips

1. **Use Local AI (Ollama)**
   - Faster for local processing
   - No API rate limits
   - Completely free

2. **Break Large Projects into Components**
   - Extract one component at a time
   - Better results with focused extractions
   - Easier to review and modify

3. **Use Example Code for Quick Tests**
   - Examples load instantly
   - Good for testing the tool
   - No need to prepare code

---

## Quick Reference

### Keyboard Shortcuts

- **Escape**: Close modals
- **Tab**: Navigate between elements
- **Enter**: Submit forms (in modals)

### Supported File Types

- **Markup**: .html, .htm
- **Stylesheets**: .css, .scss, .sass
- **Scripts**: .js, .mjs, .cjs, .ts, .tsx, .jsx, .3js
- **Data**: .json

### Export Formats

- **Single .html**: Standalone HTML file
- **Full .zip**: Complete project structure
- **Download .tsx**: React component file
- **Download .js**: JavaScript file
- **Download .css**: Stylesheet file
- **Data .json**: Complete extraction data
- **Export 3D Scene**: Three.js scene JSON

### Preview Modes

- **Browser**: HTML-only content
- **Vanilla JS**: Standard JavaScript
- **React**: React components
- **Canvas**: Three.js and p5.js

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the **Analysis Tab** for AI-generated explanations
2. Review the **Console Panel** for error messages
3. Consult the **README.md** for general information
4. Check **[docs/testing.md](./docs/testing.md)** for known issues and solutions
5. Review the **FEATURES.md** for detailed feature documentation

---

## Next Steps

After mastering these workflows:

1. Try extracting complex components
2. Experiment with different AI providers
3. Build a library of extracted components
4. Share your results and feedback
5. Contribute improvements to the project

Happy extracting! 🚀

