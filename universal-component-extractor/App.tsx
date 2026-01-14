
import React, { useState, useCallback, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import CodeDisplay from './components/CodeDisplay';
import PreviewDisplay, { PreviewRef } from './components/PreviewDisplay';
import SettingsModal from './components/SettingsModal';
import WelcomeModal from './components/WelcomeModal';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import CancelWarningModal from './components/CancelWarningModal';
import FileTree from './components/FileTree';
import CodeBrowser from './components/CodeBrowser';
import AnalysisTab from './components/AnalysisTab';
import CodeAnnotations from './components/CodeAnnotations';
import ConsolePanel, { LogEntry } from './components/ConsolePanel';
import { LoadingSpinner, ZipIcon, JsonIcon, HtmlIcon, CubeIcon, FileCodeIcon, FileJsIcon } from './components/icons';
import { extractComponentFromHtml, AISettings } from './services/aiService';
import { ExtractedCode, UploadedFile } from './types';
import { detectFileType } from './utils/fileTypeDetector';
import { createCombinedInput } from './utils/contentAggregator';
import { EXAMPLE_CODES } from './utils/exampleCode';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { debounce } from './utils/performance';
import { isThreeJsCode, isP5JsCode, isJsonCode, wrapThreeJsCode, wrapP5JsCode, wrapJsonCode } from './utils/codeWrapper';
import { analyzeCode, CodeAnalysis } from './utils/codeAnalyzer';
import { ensureCdns, buildFullProjectFiles, buildReactComponentPresetFiles, buildVanillaWidgetPresetFiles, buildViteReactPresetFiles, buildNextJsPresetFiles } from './utils/exportHelpers';
import CodeAnalysisPanel from './components/CodeAnalysisPanel';
import InputPane from './components/InputPane';
import OutputPane from './components/OutputPane';

const DEFAULT_HTML = `<!-- Example: A simple 3D Card or Component -->
<div class="card">
  <div class="content">
    <h3>Universal Extractor</h3>
    <p>Paste HTML, React, Three.js, or JSON.</p>
    <button>Magic ✨</button>
  </div>
</div>

<style>
.card {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  padding: 2px;
  border-radius: 16px;
  width: 300px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.content {
  background: #1f2937;
  padding: 2rem;
  border-radius: 14px;
  color: white;
  text-align: center;
}
h3 { margin: 0 0 0.5rem 0; }
p { color: #9ca3af; font-size: 0.9rem; margin-bottom: 1.5rem; }
button {
  background: white;
  color: #6366f1;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}
button:active { transform: scale(0.95); }
</style>`;

/**
 * Main App Component
 * 
 * Data Flow:
 * 1. User pastes code → htmlInput state
 * 2. User clicks Preview → analyzeCode() → CodeAnalysisPanel shows results
 * 3. User chooses action:
 *    - Preview As-Is → parseCodeForPreview() → extractedCode state → PreviewDisplay
 *    - Wrap & Preview → parseCodeForPreview(wrap=true) → extractedCode state → PreviewDisplay
 *    - Extract → handleProcessClick() → aiService → extractedCode state → CodeDisplay
 * 4. PreviewDisplay renders code in iframe with blob URL
 * 5. Extract shows structured code in tabs (HTML/CSS/TSX/JS)
 * 
 * State Management:
 * - htmlInput: Raw user input
 * - extractedCode: Parsed/processed code for preview/extract
 * - codeAnalysis: Analysis results from analyzeCode()
 * - previewMode: Determines how PreviewDisplay renders (vanilla/react/browser/canvas)
 */
function App() {
  const [htmlInput, setHtmlInput] = useState<string>(DEFAULT_HTML);
  const [extractedCode, setExtractedCode] = useState<ExtractedCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [componentName, setComponentName] = useState<string>('MyComponent');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<'vanilla' | 'react' | 'browser' | 'canvas'>('vanilla');
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [activeTab, setActiveTab] = useState<string>('HTML');
  const [mainTab, setMainTab] = useState<'codebrowser' | 'extracted' | 'analysis'>('extracted');
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'ollama',
    apiKeys: {},
    model: 'llama3.2',
    ollamaUrl: 'http://localhost:11434',
    extractionStyle: 'refactor',
    interactionMode: 'extract',
  });
  const [previewLogs, setPreviewLogs] = useState<LogEntry[]>([]);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [extractionHistory, setExtractionHistory] = useState<ExtractedCode[]>([]);
  
  const previewRef = useRef<PreviewRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from Electron store (or use defaults)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings) {
          setAiSettings(settings);
        }
      }).catch(() => {
        // Fallback to defaults if Electron API fails
        console.log('Using default settings (web mode)');
      });
    } else {
      // Try localStorage as fallback for web mode
      const saved = localStorage.getItem('aiSettings');
      if (saved) {
        try {
          setAiSettings(JSON.parse(saved));
        } catch {
          // Use defaults if parse fails
        }
      }
    }
  }, []);

  // Check if welcome modal should be shown on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dontShowWelcome = localStorage.getItem('dontShowWelcome');
      if (dontShowWelcome !== 'true') {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          setShowWelcomeModal(true);
        }, 500);
      }
    }
  }, []);

  const handleDontShowWelcome = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dontShowWelcome', 'true');
    }
  };

  const handleProcessClick = useCallback(async () => {
    // Check if extraction is already in progress
    if (isLoading) {
      setShowCancelWarning(true);
      setPendingAction(() => () => {
        setShowCancelWarning(false);
        handleProcessClick();
      });
      return;
    }

    // Use multi-file content if available, otherwise use htmlInput
    let inputContent = htmlInput;
    
    if (uploadedFiles.length > 0) {
      // Aggregate multiple files
      inputContent = createCombinedInput(uploadedFiles);
    } else if (!htmlInput.trim()) {
      setError("Please paste some code or import a file first.");
      return;
    }
    
    // Create new AbortController for this extraction
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    setError(null);
    setExtractedCode(null); // Clear previous result
    
    // Initialize with empty structure so UI shows up immediately
    const initialStructure: ExtractedCode = {
        html: '',
        css: '',
        scss: '',
        tsx: '',
        vanillaJs: '',
        explanation: 'Generating...',
        componentName: 'MyComponent',
        framework: 'vanilla',
        originalFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        // For textarea-only extractions, keep a snapshot of the original source for diff view
        originalSource: uploadedFiles.length === 0 ? htmlInput : undefined,
    };
    setExtractedCode(initialStructure);

    if (!importedFileName && uploadedFiles.length === 0) {
        setComponentName('MyComponent');
    }

    let hasAutoSwitched = false;

    try {
      const finalResult = await extractComponentFromHtml(inputContent, aiSettings, abortController.signal, (partialData) => {
          // This callback runs on every stream chunk
          
          // Auto-update settings based on streaming framework detection (Side effect outside updater)
          if (!hasAutoSwitched && partialData.framework) {
              const fw = partialData.framework.toLowerCase();
              if (fw === 'react') {
                   setPreviewMode('react');
                   setActiveTab('TSX');
                   hasAutoSwitched = true;
              } else if (fw === 'threejs' || fw === 'p5.js') {
                   setPreviewMode('canvas');
                   setActiveTab('JS');
                   hasAutoSwitched = true;
              }
          }
          
          // Also check actual code content for better detection during streaming (fallback if framework not set)
          // IMPORTANT: Check vanillaJs FIRST for Three.js/p5.js (these take precedence over React)
          if (!hasAutoSwitched) {
              // Priority: Check vanillaJs for Three.js/p5.js FIRST (before React detection)
              if (partialData.vanillaJs && partialData.vanillaJs.trim()) {
                  const jsLower = partialData.vanillaJs.toLowerCase();
                  if (jsLower.includes('three.') || jsLower.includes('new three.scene') ||
                      jsLower.includes('new three.webglrenderer') || jsLower.includes('webglrenderer') || 
                      jsLower.includes('perspectivecamera') || jsLower.includes('orbitcontrols') ||
                      jsLower.includes('createcanvas') || jsLower.includes('function setup') ||
                      jsLower.includes('function draw') || jsLower.includes('new p5')) {
                      setPreviewMode('canvas');
                      setActiveTab('JS');
                      hasAutoSwitched = true;
                  }
              }
              
              // Only check for React in TSX if no Three.js/p5.js detected above
              if (!hasAutoSwitched && partialData.tsx && partialData.tsx.trim()) {
                  const tsxLower = partialData.tsx.toLowerCase();
                  // Make sure it's actually React, not Three.js in TSX
                  const hasReactSyntax = tsxLower.includes('react') || tsxLower.includes('usestate') || 
                      tsxLower.includes('useeffect') || (tsxLower.includes('return') && tsxLower.includes('<'));
                  const hasThreeJsInTsx = tsxLower.includes('three.') || tsxLower.includes('webglrenderer');
                  
                  if (hasReactSyntax && !hasThreeJsInTsx) {
                      setPreviewMode('react');
                      setActiveTab('TSX');
                      hasAutoSwitched = true;
                  }
              }
          }
          
          if (partialData.componentName && !importedFileName) {
              setComponentName(partialData.componentName);
          }

          setExtractedCode(prev => ({ ...prev, ...partialData } as ExtractedCode));
      });

      // After extraction completes, switch to Extracted Code tab and set default tab
      if (finalResult) {
          setMainTab('extracted');
          
          // Smart auto-detection based on extracted code content
          const detectPreviewModeFromExtracted = (code: ExtractedCode): 'vanilla' | 'react' | 'browser' | 'canvas' => {
              // Priority 1: Check framework field from AI (but validate against content)
              if (code.framework) {
                  const fw = code.framework.toLowerCase();
                  // Only trust framework if it matches the content
                  if ((fw === 'threejs' || fw === 'p5.js') && code.vanillaJs && code.vanillaJs.trim()) {
                      return 'canvas';
                  }
                  if (fw === 'html' && (!code.vanillaJs || !code.vanillaJs.trim()) && 
                      (!code.tsx || !code.tsx.trim())) {
                      return 'browser';
                  }
              }
              
              // Priority 2: Check vanillaJs FIRST for Three.js/p5.js (these take precedence over React)
              if (code.vanillaJs && code.vanillaJs.trim()) {
                  const jsLower = code.vanillaJs.toLowerCase();
                  
                  // Three.js detection: check for THREE usage
                  if (jsLower.includes('three.') || jsLower.includes('new three.scene') || 
                      jsLower.includes('new three.webglrenderer') || jsLower.includes('webglrenderer') || 
                      jsLower.includes('perspectivecamera') || jsLower.includes('orbitcontrols')) {
                      return 'canvas'; // Canvas mode for Three.js, even if TSX exists
                  }
                  
                  // p5.js detection: check for p5 functions
                  if (jsLower.includes('createcanvas') || jsLower.includes('function setup') || 
                      jsLower.includes('function draw') || jsLower.includes('new p5')) {
                      return 'canvas'; // Canvas mode for p5.js, even if TSX exists
                  }
              }
              
              // Priority 3: Check TSX for React (only if no Three.js/p5.js detected above)
              if (code.tsx && code.tsx.trim()) {
                  const tsxLower = code.tsx.toLowerCase();
                  // Make sure it's actually React, not just TSX with Three.js
                  const hasReactSyntax = tsxLower.includes('react') || tsxLower.includes('usestate') || 
                      tsxLower.includes('useeffect') || (tsxLower.includes('return') && tsxLower.includes('<'));
                  // Make sure it's not Three.js in TSX
                  const hasThreeJsInTsx = tsxLower.includes('three.') || tsxLower.includes('webglrenderer');
                  
                  if (hasReactSyntax && !hasThreeJsInTsx) {
                      return 'react';
                  }
              }
              
              // HTML-only detection: has HTML but no JavaScript
              if (code.html && code.html.trim() && (!code.vanillaJs || !code.vanillaJs.trim()) && 
                  (!code.tsx || !code.tsx.trim())) {
                  return 'browser';
              }
              
              // Default to vanilla for other cases
              return 'vanilla';
          };
          
          // Set preview mode based on intelligent detection
          const detectedMode = detectPreviewModeFromExtracted(finalResult);
          if (!hasAutoSwitched || previewMode !== detectedMode) {
              setPreviewMode(detectedMode);
              
              // Set appropriate active tab based on mode and content
              if (detectedMode === 'react' && finalResult.tsx && finalResult.tsx.trim()) {
                  setActiveTab('TSX');
              } else if (detectedMode === 'canvas' && finalResult.vanillaJs && finalResult.vanillaJs.trim()) {
                  setActiveTab('JS');
              } else if (finalResult.html && finalResult.html.trim()) {
                  setActiveTab('HTML');
              } else if (finalResult.css && finalResult.css.trim()) {
                  setActiveTab('CSS');
              } else if (finalResult.vanillaJs && finalResult.vanillaJs.trim()) {
                  setActiveTab('JS');
              }
          } else {
              // If mode was already set, just update the active tab if needed
              if (finalResult.html && finalResult.html.trim()) {
                  setActiveTab('HTML');
              } else if (finalResult.css && finalResult.css.trim()) {
                  setActiveTab('CSS');
              } else if (finalResult.tsx && finalResult.tsx.trim()) {
                  setActiveTab('TSX');
              } else if (finalResult.vanillaJs && finalResult.vanillaJs.trim()) {
                  setActiveTab('JS');
              }
          }

          // Finalize extractedCode state and push a snapshot into history
          const resultForState: ExtractedCode = {
              ...initialStructure,
              ...finalResult,
          };
          setExtractedCode(resultForState);
          setExtractionHistory(prev => {
              const next = [...prev, resultForState];
              const MAX_HISTORY = 5;
              return next.slice(-MAX_HISTORY);
          });
      }

    } catch (err) {
      // Check if error is due to abort
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
        console.log('Extraction cancelled by user');
        setError(null);
        setExtractedCode(null);
        return;
      }
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during extraction.");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [htmlInput, importedFileName, uploadedFiles, aiSettings, isLoading]);

  // Handle extract from analysis panel
  const handleExtractFromAnalysis = useCallback(() => {
    setShowAnalysisPanel(false);
    // Trigger the normal extract flow
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      if (!isLoading && (htmlInput.trim() || uploadedFiles.length > 0)) {
        handleProcessClick();
      }
    }, 0);
  }, [htmlInput, uploadedFiles, isLoading, handleProcessClick]);

  const handleCancelExtraction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError(null);
      setExtractedCode(null);
      abortControllerRef.current = null;
    }
  }, []);

  const handleSaveSettings = useCallback(async (settings: AISettings) => {
    setAiSettings(settings);
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.saveSettings(settings);
      } catch (error) {
        console.error('Failed to save settings:', error);
        // Still update local state even if save fails
      }
    } else {
      // In web mode, save to localStorage as fallback
      localStorage.setItem('aiSettings', JSON.stringify(settings));
    }
  }, []);

  // Helper function to determine preview mode from ExtractedCode
  // This handles wrapped code correctly by checking framework and isCompleteHtml
  const getPreviewModeFromExtractedCode = useCallback((extractedCode: ExtractedCode, fallbackMode: 'vanilla' | 'react' | 'browser' | 'canvas' = 'vanilla'): 'vanilla' | 'react' | 'browser' | 'canvas' => {
    // PRIORITY 1: If it's a complete HTML document (uploaded file or wrapped), check what it contains
    if (extractedCode.isCompleteHtml) {
      const html = extractedCode.html || '';
      const htmlLower = html.toLowerCase();
      
      // Check if it's wrapped Three.js/p5.js code
      if (extractedCode.framework) {
        const fw = extractedCode.framework.toLowerCase();
        if (fw === 'threejs' || fw === 'p5.js') {
          return 'canvas'; // Wrapped Three.js/p5.js should use canvas mode
        }
        if (fw === 'html') {
          // HTML framework means it's HTML/CSS, use browser mode
          return 'browser';
        }
      }
      
      // Check if complete HTML contains Three.js or p5.js code
      if (htmlLower.includes('three.js') || htmlLower.includes('three.min.js') || 
          htmlLower.includes('three/') || htmlLower.includes('webglrenderer') ||
          htmlLower.includes('p5.js') || htmlLower.includes('p5.min.js') ||
          htmlLower.includes('function setup') || htmlLower.includes('function draw')) {
        return 'canvas'; // Complete HTML with Three.js/p5.js should use canvas mode
      }
      
      // Check if it's wrapped JSON code
      if (html.includes('JSON Preview')) {
        return 'browser'; // JSON wrapped code should use browser mode
      }
      
      // Check if it's HTML with CSS but no JavaScript - use browser mode
      const hasCss = htmlLower.includes('<style') || htmlLower.includes('style=');
      const hasJs = htmlLower.includes('<script') || htmlLower.includes('function') || 
                    htmlLower.includes('const ') || htmlLower.includes('let ');
      if (hasCss && !hasJs) {
        return 'browser'; // HTML with CSS only should use browser mode
      }
      
      // Default for complete HTML files: use browser mode
      return 'browser'; // Complete HTML files should use browser mode
    }
    
    // For non-wrapped code, check framework field
    if (extractedCode.framework) {
      const fw = extractedCode.framework.toLowerCase();
      if (fw === 'react') {
        return 'react';
      }
      if (fw === 'threejs' || fw === 'p5.js') {
        return 'canvas';
      }
    }
    
    // Check content to determine mode
    if (extractedCode.tsx && extractedCode.tsx.trim()) {
      return 'react';
    }
    
    if (extractedCode.vanillaJs && extractedCode.vanillaJs.trim()) {
      const js = extractedCode.vanillaJs.toLowerCase();
      if (js.includes('three.') || js.includes('p5.') || js.includes('setup()') || js.includes('draw()')) {
        return 'canvas';
      }
      return 'vanilla';
    }
    
    // HTML-only content
    if (extractedCode.html && extractedCode.html.trim() && 
        !extractedCode.vanillaJs && !extractedCode.tsx) {
      return 'browser';
    }
    
    return fallbackMode;
  }, []);

  // Helper function to parse code and create ExtractedCode object
  const parseCodeForPreview = useCallback((inputCode: string, shouldWrap: boolean = false): ExtractedCode => {
    let codeToParse = inputCode;
    let isWrapped = false;
    
    // PRIORITY 1: Check if input is already a complete HTML document
    // This MUST be checked BEFORE any parsing or wrapping
    const trimmedInput = inputCode.trim();
    const isCompleteHtmlDocument = trimmedInput.includes('<!DOCTYPE') && 
                                    trimmedInput.includes('<html') && 
                                    trimmedInput.includes('</html>');
    
    // For complete HTML documents: parse for display, but keep original for preview
    if (isCompleteHtmlDocument && !shouldWrap) {
      // Parse for display purposes (so users can see HTML/CSS/JS in tabs)
      let css = '';
      let js = '';
      
      // Extract CSS from <style> tags for display
      const styleMatch = inputCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatch) {
        css = styleMatch.map(m => m.replace(/<\/?style[^>]*>/gi, '')).join('\n\n');
      }
      
      // Extract JavaScript from <script> tags for display
      const scriptMatch = inputCode.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatch) {
        js = scriptMatch.map(m => m.replace(/<\/?script[^>]*>/gi, '')).join('\n\n');
      }
      
      return {
        html: inputCode.trim(), // Keep original complete HTML for preview - DO NOT MODIFY
        css: css.trim(), // Parsed CSS for display in tabs
        scss: '',
        vanillaJs: js.trim(), // Parsed JS for display in tabs
        tsx: '',
        explanation: `Preview of complete HTML document. Parsed for display, original used for preview.`,
        componentName: 'Preview',
        framework: 'html', // Mark as HTML framework
        isCompleteHtml: true // Flag as complete HTML document - preview will use original
      };
    }
    
    // Auto-wrap code snippets that need HTML structure, even if shouldWrap=false
    // This ensures snippets (Three.js, p5.js, JSON) can be previewed properly
    // BUT: Only wrap if it's actually Three.js/p5.js/JSON code, NOT HTML/CSS
    // Check for HTML structure first - if it has HTML tags, don't auto-wrap
    const hasHtmlTags = trimmedInput.includes('<div') || trimmedInput.includes('<span') ||
                        trimmedInput.includes('<button') || trimmedInput.includes('<p>') ||
                        trimmedInput.includes('<h1') || trimmedInput.includes('<h2') ||
                        trimmedInput.includes('<body') || trimmedInput.includes('<head') ||
                        trimmedInput.includes('<style');
    
    const needsWrapping = !isCompleteHtmlDocument && !hasHtmlTags && (
      isThreeJsCode(inputCode) || 
      isP5JsCode(inputCode) || 
      isJsonCode(inputCode)
    );
    
    // Wrap if explicitly requested OR if code needs wrapping to function
    if (shouldWrap || needsWrapping) {
      if (isThreeJsCode(inputCode)) {
        codeToParse = wrapThreeJsCode(inputCode);
        isWrapped = true;
      } else if (isP5JsCode(inputCode)) {
        codeToParse = wrapP5JsCode(inputCode);
        isWrapped = true;
      } else if (isJsonCode(inputCode)) {
        codeToParse = wrapJsonCode(inputCode);
        isWrapped = true;
      }
    }
    
    // If code was wrapped, preserve it as a complete HTML document
    if (isWrapped && (codeToParse.includes('<!DOCTYPE') || codeToParse.includes('<html'))) {
      // Determine framework from wrapping type only (no broader detection here)
      let framework: 'html' | 'react' | 'threejs' | 'p5js' | 'vanilla' = 'vanilla';
      if (isThreeJsCode(inputCode)) {
        framework = 'threejs';
      } else if (isP5JsCode(inputCode)) {
        framework = 'p5.js';
      } else if (isJsonCode(inputCode)) {
        // JSON wrapped code - we'll use 'html' as framework since it's just HTML display
        framework = 'html';
      }
      
      return {
        html: codeToParse, // Complete wrapped HTML document
        css: '', // Empty - CSS is in the HTML
        scss: '',
        vanillaJs: '', // Empty - JS is in the HTML
        tsx: '',
        explanation: `Preview of wrapped ${framework === 'threejs' ? 'Three.js' : framework === 'p5.js' ? 'p5.js' : 'JSON'} code. The code has been automatically wrapped in a complete HTML document with necessary libraries for preview.`,
        componentName: 'Preview',
        framework: framework === 'threejs' ? 'threejs' : framework === 'p5.js' ? 'p5.js' : 'html',
        isCompleteHtml: true // Flag to indicate this is a complete HTML document
      };
    }
    
    // Parse and create ExtractedCode object (for non-wrapped code)
    let html = '';
    let css = '';
    let js = '';
    let tsx = '';
    
    // Extract CSS from <style> tags
    const styleMatch = codeToParse.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      css = styleMatch.map(m => m.replace(/<\/?style[^>]*>/gi, '')).join('\n\n');
      // Remove style tags from HTML
      html = codeToParse.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    } else {
      html = codeToParse;
    }
    
    // Extract JavaScript from <script> tags
    const scriptMatch = codeToParse.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatch) {
      js = scriptMatch.map(m => m.replace(/<\/?script[^>]*>/gi, '')).join('\n\n');
      // Remove script tags from HTML
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    }
    
    // Clean up HTML - remove any remaining script/style tags
    html = html.replace(/<\/?(script|style)[^>]*>/gi, '');
    
    // If no HTML structure found but there's code, determine whether it's TSX or JS
    // This is for splitting purposes only - framework/preview mode detection is handled externally via codeAnalyzer
    if (!html.trim() || (!html.includes('<') && inputCode.trim())) {
      // Check if it looks like TSX (has JSX-like syntax) for splitting purposes
      const lowerCode = inputCode.toLowerCase();
      const hasJsxSyntax = (lowerCode.includes('return') && (lowerCode.includes('<') || lowerCode.includes('jsx'))) ||
                           lowerCode.includes('import react') ||
                           lowerCode.includes('from react');
      
      if (hasJsxSyntax) {
        tsx = inputCode;
        html = '';
        js = '';
      } else {
        js = inputCode;
        html = '';
      }
    }
    
    // For Three.js/p5.js code fragments (already handled above if wrapped), or pure JS fragments
    if ((isThreeJsCode(inputCode) || isP5JsCode(inputCode)) && !js && !html.includes('<')) {
      js = inputCode;
      html = '';
    }
    
    // Framework detection is handled externally via codeAnalyzer.suggestedPreviewMode
    // For non-wrapped code, default to 'vanilla' - the actual preview mode will be determined
    // by codeAnalyzer (for preview path) or detectPreviewModeFromExtracted (for post-extraction path)
    // This framework value is informational only and won't affect preview mode selection
    
    return {
      html: html.trim(),
      css: css.trim(),
      scss: '',
      vanillaJs: js.trim(),
      tsx: tsx.trim(),
      explanation: `Preview of code. Click "Extract" to get detailed analysis and structured code.`,
      componentName: 'Preview',
      framework: 'vanilla', // Default - actual preview mode determined externally
      isCompleteHtml: false // Not a complete HTML document
    };
  }, []);

  // Handle Preview button click - automatically analyze, wrap if needed, and show preview
  const handlePreviewClick = useCallback(() => {
    if (!htmlInput.trim()) return;
    
    const inputCode = htmlInput.trim();
    
    // Check if it's a complete HTML document FIRST (before analysis)
    const isCompleteHtmlDocument = inputCode.includes('<!DOCTYPE') && 
                                    inputCode.includes('<html') && 
                                    inputCode.includes('</html>');
    
    // For complete HTML documents, skip analysis and go straight to preview
    if (isCompleteHtmlDocument) {
      // Parse for display (extract CSS/JS for tabs) but keep original HTML for preview
      let css = '';
      let js = '';
      
      // Extract CSS from <style> tags for display
      const styleMatch = inputCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatch) {
        css = styleMatch.map(m => m.replace(/<\/?style[^>]*>/gi, '')).join('\n\n');
      }
      
      // Extract JavaScript from <script> tags for display
      const scriptMatch = inputCode.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatch) {
        js = scriptMatch.map(m => m.replace(/<\/?script[^>]*>/gi, '')).join('\n\n');
      }
      
      const previewCode: ExtractedCode = {
        html: inputCode.trim(), // Keep original complete HTML for preview - CRITICAL
        css: css.trim(), // Parsed CSS for display in tabs
        scss: '',
        vanillaJs: js.trim(), // Parsed JS for display in tabs
        tsx: '',
        explanation: `Preview of complete HTML document.`,
        componentName: 'Preview',
        framework: 'html',
        isCompleteHtml: true // Flag as complete HTML - preview will use original directly
      };
      
      setPreviewMode('browser'); // Complete HTML files should use browser mode
      setMainTab('extracted');
      setActiveTab('HTML');
      setExtractedCode(previewCode);
      setComponentName('Preview');
      setShowAnalysisPanel(false);
      setError(null);
      return;
    }
    
    // For non-complete HTML, analyze and determine if wrapping is needed
    const analysis = analyzeCode(inputCode);
    setCodeAnalysis(analysis);
    
    // Automatically determine if wrapping is needed and preview
    // If code needs wrapping (Three.js/p5.js/JSON snippets), auto-wrap
    // Otherwise, preview as-is
    const needsWrapping = analysis.wrappingNeeds.needsWrapping && 
                          (analysis.codeType === 'threejs' || 
                           analysis.codeType === 'p5js' || 
                           analysis.codeType === 'json');
    
    const previewCode = parseCodeForPreview(inputCode, needsWrapping);
    
    // Determine preview mode from the parsed code (handles wrapped code correctly)
    const previewMode = getPreviewModeFromExtractedCode(previewCode, analysis.suggestedPreviewMode);
    setPreviewMode(previewMode);
    
    // Switch to extracted tab to show preview
    setMainTab('extracted');
    
    // Set appropriate active tab based on code type
    if (analysis.codeType === 'react') {
      setActiveTab('TSX');
    } else if (analysis.codeType === 'threejs' || analysis.codeType === 'p5js') {
      setActiveTab('JS');
    } else if (analysis.codeType === 'html' || analysis.codeType === 'mixed') {
      setActiveTab('HTML');
    } else if (analysis.codeType === 'json') {
      setActiveTab('HTML'); // JSON wrapped code shows as HTML
    }
    
    setExtractedCode(previewCode);
    setComponentName('Preview');
    setShowAnalysisPanel(false); // Don't show analysis panel - go straight to preview
    setError(null); // Clear any previous errors
  }, [htmlInput, parseCodeForPreview, getPreviewModeFromExtractedCode]);

  // Handle preview as-is (no wrapping)
  const handlePreviewAsIs = useCallback(() => {
    if (!codeAnalysis) return;
    
    const inputCode = htmlInput.trim();
    const previewCode = parseCodeForPreview(inputCode, false);
    
    // Determine preview mode AFTER parsing (in case code was auto-wrapped)
    // If code was wrapped, use the wrapped code's framework to determine mode
    // Otherwise, use the analysis suggested mode
    const previewMode = getPreviewModeFromExtractedCode(previewCode, codeAnalysis.suggestedPreviewMode);
    setPreviewMode(previewMode);
    
    // Switch to extracted tab to show preview
    setMainTab('extracted');
    
    // Set appropriate active tab
    if (codeAnalysis.codeType === 'react') {
      setActiveTab('TSX');
    } else if (codeAnalysis.codeType === 'threejs' || codeAnalysis.codeType === 'p5js') {
      setActiveTab('JS');
    } else if (codeAnalysis.codeType === 'html' || codeAnalysis.codeType === 'mixed') {
      setActiveTab('HTML');
    }
    
    setExtractedCode(previewCode);
    setComponentName('Preview');
    setShowAnalysisPanel(false);
    setError(null); // Clear any previous errors
  }, [codeAnalysis, htmlInput, parseCodeForPreview, getPreviewModeFromExtractedCode]);

  // Handle wrap and preview
  const handleWrapAndPreview = useCallback(() => {
    if (!codeAnalysis) return;
    
    const inputCode = htmlInput.trim();
    const previewCode = parseCodeForPreview(inputCode, true);
    
    // Determine preview mode AFTER wrapping
    // Wrapped code should use its framework to determine mode (canvas for Three.js/p5.js, browser for JSON)
    const previewMode = getPreviewModeFromExtractedCode(previewCode, codeAnalysis.suggestedPreviewMode);
    setPreviewMode(previewMode);
    
    // Switch to extracted tab to show preview
    setMainTab('extracted');
    
    // Set appropriate active tab
    if (codeAnalysis.codeType === 'threejs' || codeAnalysis.codeType === 'p5js') {
      setActiveTab('JS');
    } else {
      setActiveTab('HTML');
    }
    
    setExtractedCode(previewCode);
    setComponentName('Preview');
    setShowAnalysisPanel(false);
    setError(null); // Clear any previous errors
  }, [codeAnalysis, htmlInput, parseCodeForPreview, getPreviewModeFromExtractedCode]);


  const handleClearClick = useCallback(() => {
    setHtmlInput('');
    setExtractedCode(null);
    setError(null);
    setComponentName('MyComponent');
    setImportedFileName(null);
    setUploadedFiles([]);
    setActiveFileId(null);
    setActiveTab('HTML');
    setPreviewMode('vanilla');
    setCodeAnalysis(null);
    setShowAnalysisPanel(false);
    setPreviewLogs([]);
    // Reset main tab if there's nothing to show
    setMainTab('extracted'); // Keep as extracted since it's the default view
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const fileName = file.name;
        const fileType = detectFileType(fileName);
        
        // Check if it's a saved component JSON
        if (file.name.toLowerCase().endsWith('.json')) {
            try {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed === 'object' && ('html' in parsed || 'css' in parsed)) {
                    const restoredCode: ExtractedCode = {
                        html: parsed.html || '',
                        css: parsed.css || '',
                        scss: parsed.scss || '',
                        tsx: parsed.tsx || '',
                        vanillaJs: parsed.vanillaJs || '',
                        explanation: parsed.explanation || 'Imported from JSON data.',
                        componentName: parsed.componentName || 'MyComponent',
                        framework: parsed.framework
                    };
                    setExtractedCode(restoredCode);
                    setHtmlInput(content);
                    if (parsed.componentName) setComponentName(parsed.componentName);
                    
                    const fw = parsed.framework?.toLowerCase();
                    if (fw === 'react') {
                        setActiveTab('TSX');
                        setPreviewMode('react');
                    } else if (fw === 'threejs' || fw === 'p5.js') {
                        setActiveTab('JS');
                        setPreviewMode('vanilla');
                    } else {
                        setActiveTab('HTML');
                        setPreviewMode('vanilla');
                    }

                    setError(null);
                    return;
                }
            } catch (jsonErr) {
                console.log("Uploaded JSON is source code, not a saved component.");
            }
        }
        
        // Create UploadedFile object
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: fileName,
          type: fileType,
          content: content,
          lastModified: file.lastModified,
          size: file.size,
        };
        
        // Add to uploaded files array
        setUploadedFiles(prev => {
          // Check if file with same name already exists
          const existingIndex = prev.findIndex(f => f.name === fileName);
          if (existingIndex >= 0) {
            // Replace existing file
            const updated = [...prev];
            updated[existingIndex] = uploadedFile;
            return updated;
          }
          return [...prev, uploadedFile];
        });
        
        setActiveFileId(uploadedFile.id);
        setImportedFileName(fileName);
        
        // If single file, also update htmlInput for backward compatibility
        if (uploadedFiles.length === 0) {
          setHtmlInput(content);
          
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
          const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '');
          if (safeName) setComponentName(safeName);
        }
        
        setExtractedCode(null);
        setError(null);
      }
    };
    reader.readAsText(file);
  };
  
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach(file => processFile(file));
  };
  
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(updated.length > 0 ? updated[0].id : null);
      }
      if (updated.length === 0) {
        setImportedFileName(null);
        setHtmlInput('');
      }
      return updated;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    triggerDownload(blob, filename);
  };

  const getSafeName = () => componentName.trim().replace(/[^a-zA-Z0-9-_ ]/g, '') || 'Component';

  // ensureCdns is now shared via utils/exportHelpers

  const getExportRecommendation = () => {
      const fw = extractedCode?.framework?.toLowerCase();
      if (fw === 'react') return "Recommended: **Download .tsx** for modern React apps, or **Full .zip** for a configured project.";
      if (fw === 'threejs' || fw === 'p5.js') return "Recommended: **Single .html** for instant preview, or **Download .js** to integrate into existing sites.";
      return "Recommended: **Single .html** for standalone use, or **Full .zip** for structure.";
  };

  // Keyboard shortcuts - defined after all handlers
  useKeyboardShortcuts([
    {
      ...APP_SHORTCUTS.EXTRACT,
      action: () => {
        if (!isLoading && (htmlInput.trim() || uploadedFiles.length > 0)) {
          handleProcessClick();
        }
      },
    },
    {
      ...APP_SHORTCUTS.CLEAR,
      action: handleClearClick,
    },
    {
      ...APP_SHORTCUTS.SETTINGS,
      action: () => setShowSettings(true),
    },
    {
      ...APP_SHORTCUTS.HELP,
      action: () => {
        if (showWelcomeModal) {
          setShowWelcomeModal(false);
        }
        setShowKeyboardShortcuts(true);
      },
    },
    {
      ...APP_SHORTCUTS.IMPORT,
      action: triggerFileUpload,
    },
    {
      ...APP_SHORTCUTS.EXPORT_ZIP,
      action: () => {
        if (extractedCode) {
          handleDownloadZip();
        }
      },
    },
    {
      ...APP_SHORTCUTS.EXPORT_HTML,
      action: () => {
        if (extractedCode) {
          handleDownloadSingleHtml();
        }
      },
    },
  ], !showSettings && !showWelcomeModal && !showExplanationModal && !showKeyboardShortcuts);

  const handleCodeUpdate = (key: keyof ExtractedCode, newValue: string) => {
      setExtractedCode(prev => prev ? ({ ...prev, [key]: newValue }) : null);
  };

  const handleDownloadZip = useCallback(async () => {
    if (!extractedCode) return;
    try {
      const safeName = getSafeName();
      const zip = new JSZip();
      const files = buildFullProjectFiles(extractedCode, safeName);

      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      triggerDownload(content, `${safeName}.zip`);
    } catch (err) {
      console.error(err);
    }
  }, [extractedCode, componentName]);

  const handleDownloadJson = useCallback(() => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      const dataToSave = {
          ...extractedCode,
          componentName: safeName
      };
      const jsonString = JSON.stringify(dataToSave, null, 2);
      handleDownloadText(jsonString, `${safeName}.json`, 'application/json');
  }, [extractedCode, componentName]);

  const handleDownloadReactPresetZip = useCallback(async () => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      const files = buildReactComponentPresetFiles(extractedCode, safeName);
      if (Object.keys(files).length === 0) {
        console.warn('React preset not available: no TSX output found.');
        return;
      }
      try {
        const zip = new JSZip();
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, `${safeName}-react.zip`);
      } catch (err) {
        console.error(err);
      }
  }, [extractedCode, componentName]);

  const handleDownloadVanillaPresetZip = useCallback(async () => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      const files = buildVanillaWidgetPresetFiles(extractedCode, safeName);
      try {
        const zip = new JSZip();
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, `${safeName}-vanilla.zip`);
      } catch (err) {
        console.error(err);
      }
  }, [extractedCode, componentName]);

  const handleDownloadViteReactPresetZip = useCallback(async () => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      const files = buildViteReactPresetFiles(extractedCode, safeName);
      if (Object.keys(files).length === 0) {
        console.warn('Vite React preset not available: no TSX output found.');
        return;
      }
      try {
        const zip = new JSZip();
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, `${safeName}-vite-react.zip`);
      } catch (err) {
        console.error(err);
      }
  }, [extractedCode, componentName]);

  const handleDownloadNextJsPresetZip = useCallback(async () => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      const files = buildNextJsPresetFiles(extractedCode, safeName);
      if (Object.keys(files).length === 0) {
        console.warn('Next.js preset not available: no TSX output found.');
        return;
      }
      try {
        const zip = new JSZip();
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, `${safeName}-nextjs.zip`);
      } catch (err) {
        console.error(err);
      }
  }, [extractedCode, componentName]);

  const handleDownloadSingleHtml = useCallback(() => {
      if (!extractedCode) return;
      const safeName = getSafeName();
      
      // If it's a complete HTML document (wrapped code), use it directly
      if (extractedCode.isCompleteHtml && extractedCode.html.trim()) {
          const htmlWithTitle = extractedCode.html.replace(
              /<title>.*?<\/title>/i,
              `<title>${safeName}</title>`
          );
          handleDownloadText(htmlWithTitle, `${safeName}.html`, 'text/html');
          return;
      }
      
      // Otherwise, construct HTML from parts with inline CSS/JS
      const finalHtmlFragment = ensureCdns(extractedCode.html, extractedCode.vanillaJs);
      
      const singleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <style>
        ${extractedCode.css}
    </style>
</head>
<body>
    ${finalHtmlFragment}
    <script>
        ${extractedCode.vanillaJs}
    </script>
</body>
</html>`;
    handleDownloadText(singleHtml, `${safeName}.html`, 'text/html');
  }, [extractedCode, componentName]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 lg:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient tracking-tight">
                Universal Component Extractor
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-400 hidden sm:block">
                Reverse-engineer components from HTML, React, Three.js, or JSON
              </p>
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors flex items-center gap-2 text-sm"
                title="Keyboard Shortcuts (Shift + ?)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Shortcuts
              </button>
              <button
                onClick={() => setShowWelcomeModal(true)}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors flex items-center gap-2 text-sm"
                title="Welcome / Help"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors flex items-center gap-2 text-sm"
                title="AI Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {aiSettings.provider === 'ollama' ? 'Ollama' : aiSettings.provider.toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Left Column: Input */}
          <InputPane
            htmlInput={htmlInput}
            setHtmlInput={setHtmlInput}
            isLoading={isLoading}
            error={error}
            uploadedFiles={uploadedFiles}
            importedFileName={importedFileName}
            fileInputRef={fileInputRef}
            codeAnalysis={codeAnalysis}
            showAnalysisPanel={showAnalysisPanel}
            previewLogs={previewLogs}
            extractedCode={extractedCode}
            isDragging={isDragging}
            showExplanationModal={showExplanationModal}
            getExportRecommendation={getExportRecommendation}
            onPreviewClick={handlePreviewClick}
            onProcessClick={handleProcessClick}
            onClearClick={handleClearClick}
            onFileUpload={handleFileUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPreviewAsIs={handlePreviewAsIs}
            onWrapAndPreview={handleWrapAndPreview}
            onExtractFromAnalysis={handleExtractFromAnalysis}
            onCloseAnalysisPanel={() => setShowAnalysisPanel(false)}
            onClearLogs={() => setPreviewLogs([])}
            onExampleClick={(code) => {
              setHtmlInput(code);
              setUploadedFiles([]);
              setActiveFileId(null);
              setImportedFileName(null);
              // Clear any previous extraction/preview state specific to the prior snippet
              setExtractedCode(null);
              setError(null);
            }}
            triggerFileUpload={triggerFileUpload}
            handleCancelExtraction={handleCancelExtraction}
            setShowExplanationModal={setShowExplanationModal}
            setUploadedFiles={setUploadedFiles}
            setActiveFileId={setActiveFileId}
            setImportedFileName={setImportedFileName}
            analyzeCode={analyzeCode}
            setCodeAnalysis={setCodeAnalysis}
            setPreviewMode={setPreviewMode}
            setShowAnalysisPanel={setShowAnalysisPanel}
            interactionMode={aiSettings.interactionMode}
            provider={aiSettings.provider}
            model={aiSettings.model}
          />

          {/* Right Column: Output */}
          <OutputPane
            extractedCode={extractedCode}
            extractionHistory={extractionHistory}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            componentName={componentName}
            setComponentName={setComponentName}
            mainTab={mainTab}
            setMainTab={setMainTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            previewLogs={previewLogs}
            uploadedFiles={uploadedFiles}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            previewRef={previewRef}
            onDownloadZip={handleDownloadZip}
            onDownloadSingleHtml={handleDownloadSingleHtml}
            onDownloadJson={handleDownloadJson}
            onDownloadText={handleDownloadText}
            onDownloadReactPresetZip={handleDownloadReactPresetZip}
            onDownloadVanillaPresetZip={handleDownloadVanillaPresetZip}
            onDownloadViteReactPresetZip={handleDownloadViteReactPresetZip}
            onDownloadNextJsPresetZip={handleDownloadNextJsPresetZip}
            onCodeUpdate={handleCodeUpdate}
            onSceneExport={(json) => {
              const safeName = getSafeName();
              handleDownloadText(json, `${safeName}_scene.json`, 'application/json');
            }}
            onLogsChange={setPreviewLogs}
            getSafeName={getSafeName}
          />
        </main>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          currentSettings={aiSettings}
        />

        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onDontShowAgain={handleDontShowWelcome}
          onOpenSettings={() => {
            setShowWelcomeModal(false);
            setShowSettings(true);
          }}
        />

        <KeyboardShortcutsHelp
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />

        <CancelWarningModal
          isOpen={showCancelWarning}
          onClose={() => {
            setShowCancelWarning(false);
            setPendingAction(null);
          }}
          onConfirm={() => {
            if (pendingAction) {
              // Cancel current extraction first
              handleCancelExtraction();
              // Then execute pending action after a brief delay
              setTimeout(() => {
                pendingAction();
                setPendingAction(null);
              }, 100);
            }
          }}
          actionType={pendingAction ? 'extract' : 'example'}
        />
      </div>
    </div>
  );
}

export default App;
