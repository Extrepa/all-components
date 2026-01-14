# User Instructions

## Getting Started

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **For Development**
   ```bash
   npm run electron:dev
   ```

3. **For Production Build**
   ```bash
   npm run build
   ```

### First-Time Setup

1. **Configure AI Provider**
   - Click the settings button (⚙️) in the top right
   - Choose your AI provider:
     - **Ollama** (Recommended - Free & Local)
     - **Gemini** (Requires API key)
     - **OpenAI** (Requires API key)
     - **Anthropic** (Requires API key)
   - Enter API key if required
   - Select model
   - Click "Save Settings"

2. **Set Up Ollama (Recommended)**
   ```bash
   # Install Ollama from https://ollama.ai
   # Then download a model:
   ollama pull llama3.2
   ```

## Basic Usage

### Step 1: Input Your Code

**Option A: Paste Code**
1. Click in the input textarea
2. Paste your HTML, JSX, TSX, or JavaScript code
3. Or paste JSON data

**Option B: Upload Files**
1. Click the "Import" button
2. Select one or more files
3. Or drag and drop files onto the input area

**Supported File Types:**
- HTML (.html, .htm)
- CSS (.css)
- SCSS (.scss, .sass)
- JavaScript (.js, .mjs, .cjs)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)
- Three.js (.3js)
- JSON (.json)

### Step 2: Extract Component

1. Click the **"Extract Component"** button
2. Wait for AI to analyze and extract
3. Watch the progress as code streams in

### Step 3: Preview & Review

1. **Preview Tab** (default)
   - View live preview of extracted component
   - Switch between Vanilla JS and React preview
   - Check console for errors

2. **Code Browser Tab** (if files uploaded)
   - Browse uploaded files
   - View code with syntax highlighting
   - Search within files

3. **Extracted Code Tab**
   - View extracted HTML, CSS, SCSS, TSX, JS
   - Edit code directly
   - Download individual files

4. **Analysis Tab**
   - Read build approach recommendations
   - Understand code simplifications
   - Learn how the component works
   - See what can be safely edited

### Step 4: Export

**Download Options:**
- **Full .zip**: Complete project package
- **Single .html**: Standalone HTML file
- **Individual Files**: HTML, CSS, SCSS, TSX, JS
- **Data .json**: Export as JSON
- **Export 3D Scene**: For Three.js projects

## Advanced Usage

### Multi-File Projects

1. **Upload Multiple Files**
   - Drag and drop multiple files at once
   - Or use Import button to select multiple files
   - Files are organized by type automatically

2. **Browse Files**
   - Click "Code Browser" tab
   - Use file tree to navigate
   - Select file to view code

3. **Extract from Multiple Files**
   - All uploaded files are automatically combined
   - AI analyzes the complete project
   - Extraction includes all file types

### Working with Preview

**Preview Controls:**
- **Zoom In/Out**: Adjust preview size
- **Full Screen**: Expand to full screen
- **Refresh**: Reload preview
- **Mode Toggle**: Switch Vanilla/React

**Console Panel:**
- **Expand/Collapse**: Click header to toggle
- **Filter Logs**: Use filter buttons (All, Info, Warn, Error)
- **View Stack Traces**: Click to expand error details
- **Copy Logs**: Copy individual log entries
- **Clear Console**: Click "Clear" button

### Code Editing

1. **Navigate to Extracted Code Tab**
2. **Select Code Tab** (HTML, CSS, SCSS, TSX, JS)
3. **Toggle Edit Mode**: Click edit icon (✏️)
4. **Make Changes**: Edit code directly
5. **View Mode**: Toggle back to view syntax highlighting

**Code Annotations:**
- Green: Safe to edit
- Yellow: Edit with caution
- Red: Avoid editing

### Using Analysis

**Build Approach:**
- Read tool recommendations
- Check dependency list
- Review configuration tips

**Code Simplification:**
- See what was removed
- Understand modernizations
- Check performance improvements

**Active Code:**
- Identify execution flow
- Find dead code
- Understand code usage

**How It Works:**
- Learn component architecture
- Understand data flow
- See lifecycle details

**Editable Sections:**
- Find safe editing points
- See warnings
- Learn customization options

## Tips & Best Practices

### For Best Results

1. **Provide Complete Code**
   - Include all related files
   - Don't omit dependencies
   - Include styles and scripts

2. **Use Multi-File Upload**
   - Upload HTML + CSS + JS together
   - Better context for AI
   - More accurate extraction

3. **Check Console**
   - Monitor for errors
   - Review warnings
   - Fix issues before export

4. **Review Analysis**
   - Read build recommendations
   - Understand simplifications
   - Check editable sections

5. **Test Preview**
   - Verify component works
   - Check responsive design
   - Test interactions

### Common Workflows

**Extracting a React Component:**
1. Upload .tsx or .jsx file
2. Extract component
3. Check TSX tab for React code
4. Use React Preview mode
5. Download TSX file

**Extracting a Three.js Scene:**
1. Upload Three.js code
2. Extract component
3. Check Vanilla JS preview
4. Export 3D Scene if needed
5. Download JS file

**Extracting from Website:**
1. Copy HTML from browser
2. Paste into input
3. Extract component
4. Review extracted code
5. Download as needed

**Multi-File Project:**
1. Upload all project files
2. Browse in Code Browser
3. Extract complete project
4. Review all extracted files
5. Download as ZIP

## Troubleshooting

### Preview Not Loading

**Check:**
- Console for errors
- Code syntax
- Missing dependencies
- Network connectivity (for CDNs)

**Solutions:**
- Fix syntax errors
- Add missing libraries
- Check console messages
- Refresh preview

### AI Extraction Fails

**Check:**
- AI provider settings
- API key validity
- Network connection
- Model availability

**Solutions:**
- Verify API key
- Check provider status
- Try different model
- Use Ollama for local processing

### Files Not Uploading

**Check:**
- File type support
- File size limits
- Browser permissions

**Solutions:**
- Use supported file types
- Check file size
- Allow file access permissions

### Console Errors

**Common Issues:**
- Missing dependencies
- Syntax errors
- Runtime errors
- Network errors

**Solutions:**
- Add required libraries
- Fix code syntax
- Check error messages
- Review stack traces

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter/Space**: Activate buttons
- **Escape**: Close modals
- **Arrow Keys**: Navigate file tree
- **Cmd/Ctrl + C**: Copy selected text
- **Cmd/Ctrl + V**: Paste

## File Formats

### Input Formats
- HTML, CSS, SCSS, JS, TS, JSX, TSX, JSON

### Output Formats
- HTML, CSS, SCSS, TSX, JS, ZIP, JSON

### Export Options
- Individual files
- Complete ZIP package
- Standalone HTML
- JSON data export

## Settings

### AI Provider Settings
- **Provider**: Choose AI service
- **API Key**: Enter credentials
- **Model**: Select model version
- **Ollama URL**: Configure local URL

### Preview Settings
- **Mode**: Vanilla JS or React
- **Zoom**: Adjust preview size
- **Full Screen**: Toggle full screen

## Support

For issues or questions:
1. Check console for errors
2. Review error messages
3. Check documentation
4. Verify settings

---

For feature details, see [FEATURES.md](./FEATURES.md)  
For technical info, see [ARCHITECTURE.md](./ARCHITECTURE.md)  
For getting started, see [docs/getting-started.md](./docs/getting-started.md)  
For complete documentation index, see [docs/README.md](./docs/README.md)

