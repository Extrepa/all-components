
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ZoomInIcon, ZoomOutIcon, FullScreenIcon, ExitFullScreenIcon, RefreshIcon } from './icons';
import ConsolePanel, { LogEntry } from './ConsolePanel';

interface PreviewDisplayProps {
  html: string;
  css: string;
  vanillaJs: string;
  tsx?: string;
  componentName: string;
  previewMode?: 'vanilla' | 'react' | 'browser' | 'canvas';
  onSceneExport?: (json: string) => void;
  onLogsChange?: (logs: LogEntry[]) => void;
  isCompleteHtml?: boolean; // Indicates if html contains a complete HTML document
}

export interface PreviewRef {
    triggerSceneExport: () => void;
}

// LogEntry is now imported from ConsolePanel

// Extend window interface to support Babel
declare global {
  interface Window {
    Babel: any;
  }
}

// Hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const PreviewDisplay = forwardRef<PreviewRef, PreviewDisplayProps>(({ html, css, vanillaJs, tsx, componentName, previewMode = 'vanilla', onSceneExport, onLogsChange, isCompleteHtml = false }, ref) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // Key to force iframe reload
  const blobUrlRef = useRef<string | null>(null); // Blob URL for iframe (needed for ES modules)
  
  // Babel State
  const [babelReady, setBabelReady] = useState(false);
  const [compiledCode, setCompiledCode] = useState<string | null>(null);

  // Debounce inputs to avoid re-rendering iframe too frequently during streaming
  const debouncedHtml = useDebounce(html, 500);
  const debouncedCss = useDebounce(css, 500);
  const debouncedJs = useDebounce(vanillaJs, 500);
  const debouncedTsx = useDebounce(tsx, 500);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const libraryCacheRef = useRef<Map<string, string>>(new Map()); // Cache for library content
  const [processedHtml, setProcessedHtml] = useState<string>(''); // Processed HTML with inlined libraries

  useImperativeHandle(ref, () => ({
    triggerSceneExport: () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage('EXPORT_SCENE', '*');
        }
    }
  }));

  // Load Babel Standalone once in the main window
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (window.Babel) {
            setBabelReady(true);
            return;
        }
        
        if (!document.getElementById('babel-standalone-script')) {
            const script = document.createElement('script');
            script.id = 'babel-standalone-script';
            // Load Babel from local libs directory
            script.src = '/libs/babel/babel.min.js';
            script.async = true;
            script.onload = () => {
                console.log('Babel loaded successfully');
                setBabelReady(true);
            };
            script.onerror = () => {
                console.error('Failed to load Babel from local libs');
                // Fallback to CDN if local fails
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js';
                script.onerror = () => {
                    setRuntimeError('Failed to load Babel compiler. Check your internet connection.');
                };
            };
            document.head.appendChild(script);
        }
    }
  }, []);

  // Process wrapped HTML to inline library scripts for blob URL compatibility
  useEffect(() => {
    const processWrappedHtml = async () => {
      // Always log to debug
      const trimmedHtml = debouncedHtml.trim();
      const hasDoctype = trimmedHtml.includes('<!DOCTYPE');
      const hasHtmlTags = trimmedHtml.includes('<html') && trimmedHtml.includes('</html>');
      const isWrappedCode = isCompleteHtml || (hasDoctype && hasHtmlTags);
      const hasLibraryScripts = /<script\s+[^>]*src=["'](\/libs\/[^"']+)["'][^>]*>/gi.test(trimmedHtml);
      
      console.log('PreviewDisplay: Checking if HTML needs library inlining', {
        previewMode,
        isCompleteHtml,
        hasHtml: !!trimmedHtml,
        hasDoctype,
        hasHtmlTags,
        isWrappedCode,
        hasLibraryScripts,
        htmlPreview: trimmedHtml.substring(0, 150)
      });

      // Only process for canvas mode OR if HTML contains p5.js/Three.js library scripts (wrapped code)
      // Check if HTML contains library script tags even if previewMode isn't canvas yet
      const hasP5Lib = /\/libs\/p5\//.test(trimmedHtml);
      const hasThreeLib = /\/libs\/three\//.test(trimmedHtml);
      const isCanvasCode = previewMode === 'canvas' || hasP5Lib || hasThreeLib;
      
      if (!isCanvasCode || !isWrappedCode || !trimmedHtml || !hasLibraryScripts) {
        console.log('PreviewDisplay: Skipping library inlining - conditions not met', {
          previewMode,
          previewModeIsCanvas: previewMode === 'canvas',
          hasP5Lib,
          hasThreeLib,
          isCanvasCode,
          isWrappedCode,
          hasHtml: !!trimmedHtml,
          hasLibraryScripts
        });
        setProcessedHtml(debouncedHtml);
        return;
      }

      console.log('PreviewDisplay: Processing wrapped HTML for library inlining', {
        previewMode,
        isCompleteHtml,
        hasHtml: !!trimmedHtml
      });

      // Find all script tags with src pointing to /libs/
      const scriptSrcRegex = /<script\s+[^>]*src=["'](\/libs\/[^"']+)["'][^>]*>/gi;
      const matches = Array.from(trimmedHtml.matchAll(scriptSrcRegex));
      
      if (matches.length === 0) {
        // No library scripts to inline
        setProcessedHtml(debouncedHtml);
        return;
      }

      let processed = trimmedHtml;
      const currentOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

      // Fetch and inline each library
      for (const match of matches) {
        const fullMatch = match[0];
        const libPath = match[1];
        const fullUrl = currentOrigin ? `${currentOrigin}${libPath}` : libPath;

        console.log(`PreviewDisplay: Processing library ${libPath}`, { fullUrl });

        // Check cache first
        if (libraryCacheRef.current.has(libPath)) {
          const libraryCode = libraryCacheRef.current.get(libPath)!;
          console.log(`PreviewDisplay: Using cached library ${libPath} (${libraryCode.length} chars)`);
          // Replace script src with inline script
          // Escape any </script> tags in the library code to prevent premature script tag closure
          const escapedLibraryCode = libraryCode.replace(/<\/script>/gi, '<\\/script>');
          processed = processed.replace(fullMatch, `<script>\n${escapedLibraryCode}\n</script>`);
        } else {
          try {
            console.log(`PreviewDisplay: Fetching library ${libPath} from ${fullUrl}`);
            // Fetch library content
            const response = await fetch(fullUrl);
            if (response.ok) {
              const libraryCode = await response.text();
              console.log(`PreviewDisplay: Successfully fetched library ${libPath} (${libraryCode.length} chars)`);
              // Cache it
              libraryCacheRef.current.set(libPath, libraryCode);
              // Replace script src with inline script
              // Escape any </script> tags in the library code to prevent premature script tag closure
              const escapedLibraryCode = libraryCode.replace(/<\/script>/gi, '<\\/script>');
              processed = processed.replace(fullMatch, `<script>\n${escapedLibraryCode}\n</script>`);
            } else {
              console.warn(`PreviewDisplay: Failed to fetch library ${libPath}: ${response.statusText}`);
              // Keep original script tag if fetch fails
            }
          } catch (error) {
            console.error(`PreviewDisplay: Error fetching library ${libPath}:`, error);
            // Keep original script tag if fetch fails
          }
        }
      }

      console.log('PreviewDisplay: Finished processing wrapped HTML', {
        originalLength: trimmedHtml.length,
        processedLength: processed.length,
        librariesInlined: matches.length
      });

      setProcessedHtml(processed);
    };

    processWrappedHtml();
  }, [debouncedHtml, previewMode, isCompleteHtml]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  const toggleFullScreen = () => setIsFullScreen(prev => !prev);
  const handleRefresh = () => setReloadKey(prev => prev + 1);
  
  const handleOpenInNewTab = () => {
    // Create a blob URL from the HTML content
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // Clean up the blob URL after a delay
    if (newWindow) {
      newWindow.addEventListener('load', () => {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    } else {
      // If popup was blocked, try using data URL instead
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(srcDoc)}`;
      window.open(dataUrl, '_blank');
    }
  };

  // Handle Escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Clean TSX for browser execution
  const prepareReactCode = (code: string, name: string) => {
      if (!code) return '';
      
      let cleaned = code;

      // Check if THREE is already declared in the code (to avoid duplicate declarations)
      const hasThreeDeclaration = /\b(const|let|var)\s+THREE\s*=/i.test(cleaned);

      // 1. Shim Three.js Imports (Default and Named)
      // Track if we've already added THREE declaration to avoid duplicates
      let threeDeclared = hasThreeDeclaration; // Start as true if already declared
      
      // Helper to declare THREE only once
      const declareThree = () => {
          if (!threeDeclared) {
              threeDeclared = true;
              return 'const THREE = window.THREE;';
          }
          return '';
      };
      
      // Handle esm.run/three imports
      cleaned = cleaned.replace(/import\s+\*\s+as\s+THREE\s+from\s+['"]https:\/\/esm\.run\/three['"];?/g, declareThree);
      cleaned = cleaned.replace(/import\s+THREE\s+from\s+['"]https:\/\/esm\.run\/three['"];?/g, declareThree);
      // Handle standard 'three' imports
      cleaned = cleaned.replace(/import\s+\*\s+as\s+THREE\s+from\s+['"]three['"];?/g, declareThree);
      cleaned = cleaned.replace(/import\s+THREE\s+from\s+['"]three['"];?/g, declareThree);
      
      // Handle named imports: import { Scene, Vector3 } from 'three' or 'https://esm.run/three'
      cleaned = cleaned.replace(/import\s+\{(.*?)\}\s+from\s+['"]https:\/\/esm\.run\/three['"];?/g, (match, imports) => {
          const threeDecl = declareThree();
          return threeDecl ? `${threeDecl}\nconst { ${imports} } = window.THREE;` : `const { ${imports} } = window.THREE;`;
      });
      cleaned = cleaned.replace(/import\s+\{(.*?)\}\s+from\s+['"]three['"];?/g, (match, imports) => {
          const threeDecl = declareThree();
          return threeDecl ? `${threeDecl}\nconst { ${imports} } = window.THREE;` : `const { ${imports} } = window.THREE;`;
      });

      // Check if OrbitControls is already declared in the code
      const hasOrbitControlsDeclaration = /\b(const|let|var)\s+OrbitControls\s*=/i.test(cleaned);

      // Shim OrbitControls - use window.THREE.OrbitControls (loaded asynchronously but should be available)
      // Track if OrbitControls is already declared
      let orbitControlsDeclared = hasOrbitControlsDeclaration; // Start as true if already declared
      cleaned = cleaned.replace(/import\s+\{\s*OrbitControls\s*\}\s+from\s+['"].*?['"];?/g, (match) => {
          if (orbitControlsDeclared) return '';
          orbitControlsDeclared = true;
          return 'const OrbitControls = window.THREE && window.THREE.OrbitControls ? window.THREE.OrbitControls : (function() { ' +
            'console.warn("OrbitControls may not be loaded yet. If you see errors, the OrbitControls script may still be loading."); ' +
            'return window.THREE && window.THREE.OrbitControls ? window.THREE.OrbitControls : null; ' +
            '})();';
      });

      // 2. Remove other standard imports (React, etc are handled by shim)
      cleaned = cleaned.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
      
      // 3. Normalize Exports
      cleaned = cleaned.replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1');
      cleaned = cleaned.replace(/export\s+default\s+function\s*\(/g, 'const DefaultComponent = function(');
      cleaned = cleaned.replace(/export\s+default\s+class\s+([a-zA-Z0-9_]+)/g, 'class $1');
      cleaned = cleaned.replace(/export\s+default\s+/g, 'const DefaultComponent = ');
      cleaned = cleaned.replace(/export\s+(const|function|class)\s+/g, '$1 ');

      // 4. Polyfill Optional Chaining Assignment (Babel Standalone limitation)
      // Generic fix: obj?.prop = val -> if(obj) obj.prop = val
      cleaned = cleaned.replace(
          /([\w$.\[\]\(\)]+)\?\.([\w$.]+)\s*=\s*([^;]+);/g, 
          'if ($1) { $1.$2 = $3; }'
      );
      
      // 5. Escape closing script tags
      cleaned = cleaned.replace(/<\/script>/gi, '<\\/script>');

      return `
        const { 
            useState, useEffect, useContext, useReducer, useCallback, 
            useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue 
        } = React;
        
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null, errorInfo: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            componentDidCatch(error, errorInfo) {
                console.error("React Runtime Error:", error);
                this.setState({ errorInfo });
            }
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', { style: { padding: '1rem', color: '#ef4444', fontFamily: 'monospace', fontSize: '12px', background: '#fee2e2', borderRadius: '4px' } }, 
                        React.createElement('strong', null, 'Runtime Error: '),
                        (this.state.error && this.state.error.toString())
                    );
                }
                return this.props.children;
            }
        }

        // Note: THREE and p5 are already shimmed in prepareReactCode if needed
        // Only add global shims if they weren't already declared in cleaned code
        // (prepareReactCode handles all import statements, so these are rarely needed)

        ${cleaned}

        try {
            const rootElement = document.getElementById('root');
            if (rootElement) {
                const root = ReactDOM.createRoot(rootElement);
                let ComponentToRender = undefined;
                if (typeof ${name} !== 'undefined') {
                    ComponentToRender = ${name};
                } else if (typeof DefaultComponent !== 'undefined') {
                    ComponentToRender = DefaultComponent;
                }

                if (ComponentToRender) {
                    root.render(
                        React.createElement(React.StrictMode, null,
                            React.createElement(ErrorBoundary, null, 
                                React.createElement(ComponentToRender)
                            )
                        )
                    );
                } else {
                    console.warn("React Mount: Could not find component '${name}'");
                }
            }
        } catch (err) {
            console.error("React Mount Error:", err);
        }
      `;
  };

  // Compile React Code Effect with Debounced TSX
  useEffect(() => {
    if (previewMode === 'react' && debouncedTsx && babelReady && window.Babel) {
        try {
            const prepared = prepareReactCode(debouncedTsx, componentName);
            if (!prepared || !prepared.trim()) {
                setCompiledCode(null);
                return;
            }
            
            const result = window.Babel.transform(prepared, {
                presets: ['env', 'react', 'typescript'],
                filename: 'component.tsx'
            });
            
            // Extract code safely
            const code = result?.code || '';
            
            // Validate that we got JavaScript, not HTML
            if (code && code.trim() && !code.trim().startsWith('<') && !code.includes('<!DOCTYPE') && !code.includes('<html')) {
                setCompiledCode(code);
                setRuntimeError(null);
            } else {
                console.error('Babel returned invalid output (HTML instead of JS):', code?.substring(0, 100));
                setCompiledCode(null);
                setRuntimeError('Compilation failed: Invalid output from Babel');
            }
        } catch (err: any) {
            console.error('Babel compilation error:', err);
            setCompiledCode(null);
            setRuntimeError(err?.message || 'Compilation failed');
        }
    } else if (previewMode !== 'react') {
        setCompiledCode(null);
        setRuntimeError(null);
    } else if (previewMode === 'react' && !babelReady) {
        // Reset compiled code when Babel isn't ready yet
        setCompiledCode(null);
    }
  }, [debouncedTsx, componentName, previewMode, babelReady]);

  // Reset compiled code when switching to browser mode
  useEffect(() => {
    if (previewMode === 'browser') {
      setCompiledCode(null);
      setRuntimeError(null);
    }
  }, [previewMode]);

  // Clear logs on reset or reload
  useEffect(() => {
    setLogs([{ level: 'system', message: `Preview environment initialized (${previewMode} mode).`, timestamp: Date.now() }]);
    setRuntimeError(null);
  }, [previewMode, reloadKey]);

  // Surface runtime errors in logs
  const lastRuntimeErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (runtimeError && runtimeError !== lastRuntimeErrorRef.current) {
      lastRuntimeErrorRef.current = runtimeError;
      const errorLogEntry: LogEntry = {
        level: 'error',
        message: `Runtime Error: ${runtimeError}`,
        timestamp: Date.now()
      };
      setLogs(prev => {
        // Avoid duplicates by checking if the last log is the same error
        const lastLog = prev[prev.length - 1];
        if (lastLog && lastLog.message === errorLogEntry.message && lastLog.level === 'error') {
          return prev;
        }
        return [...prev, errorLogEntry];
      });
    } else if (!runtimeError) {
      lastRuntimeErrorRef.current = null;
    }
  }, [runtimeError]);

  // Notify parent of log changes
  useEffect(() => {
    if (onLogsChange) {
      onLogsChange(logs);
    }
  }, [logs, onLogsChange]);

  // Auto-scroll console
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.source === 'preview-console') {
        const logEntry: LogEntry = {
          level: event.data.level,
          message: event.data.message,
          timestamp: Date.now(),
          stack: event.data.stack
        };
        setLogs(prev => [...prev, logEntry]);
        if (event.data.level === 'error') {
          setRuntimeError(prev => prev || event.data.message);
        }
      }
      if (event.data.type === 'SCENE_EXPORT_DATA' && onSceneExport) {
          onSceneExport(event.data.data);
          setLogs(prev => [...prev, {
            level: 'system',
            message: 'Success: 3D Scene exported to JSON.',
            timestamp: Date.now()
          }]);
      }
      if (event.data.type === 'SCENE_EXPORT_ERROR') {
          setLogs(prev => [...prev, {
              level: 'error', message: `Export Failed: ${event.data.message}`, timestamp: Date.now()
          }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSceneExport]);

  const consoleScript = `
    <script>
      (function() {
        function safeStringify(obj) {
          const seen = new WeakSet();
          return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular]';
              seen.add(value);
            }
            return value;
          }, 2);
        }
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        function send(level, args) {
          try {
            const message = args.map(arg => {
              try {
                if (arg instanceof Error) return arg.message;
                if (typeof arg === 'object') return safeStringify(arg);
                return String(arg);
              } catch(e) { return String(arg); }
            }).join(' ');
            window.parent.postMessage({ source: 'preview-console', level, message }, '*');
          } catch(e) {}
        }
        function sendWithStack(level, args, error) {
          try {
            const message = args.map(arg => {
              try {
                if (arg instanceof Error) return arg.message;
                if (typeof arg === 'object') return safeStringify(arg);
                return String(arg);
              } catch(e) { return String(arg); }
            }).join(' ');
            const stack = error && error.stack ? error.stack : null;
            window.parent.postMessage({ source: 'preview-console', level, message, stack }, '*');
          } catch(e) {}
        }
        console.log = function(...args) { originalLog.apply(console, args); send('info', args); };
        console.warn = function(...args) { originalWarn.apply(console, args); send('warn', args); };
        console.error = function(...args) { 
          originalError.apply(console, args); 
          const error = args.find(arg => arg instanceof Error);
          sendWithStack('error', args, error);
        };
        window.onerror = function(msg, url, line, col, error) { 
          sendWithStack('error', [msg], error || new Error(msg)); 
          return false; 
        };
        window.addEventListener('unhandledrejection', function(e) { 
          const reason = e.reason;
          const error = reason instanceof Error ? reason : new Error(String(reason));
          sendWithStack('error', ['Unhandled Promise Rejection: ' + error.message], error);
        });
        
        window.addEventListener('message', (event) => {
            if (event.data === 'EXPORT_SCENE') {
                if (!window.scene) {
                    window.parent.postMessage({ type: 'SCENE_EXPORT_ERROR', message: 'No global window.scene found to export. Ensure "window.scene = scene;" is in your code.' }, '*');
                    return;
                }
                
                if (typeof window.scene.toJSON !== 'function') {
                    window.parent.postMessage({ type: 'SCENE_EXPORT_ERROR', message: 'window.scene does not have a .toJSON() method.' }, '*');
                    return;
                }

                try {
                    const json = window.scene.toJSON();
                    const jsonString = JSON.stringify(json, null, 2);
                    window.parent.postMessage({ type: 'SCENE_EXPORT_DATA', data: jsonString }, '*');
                } catch(err) {
                    window.parent.postMessage({ type: 'SCENE_EXPORT_ERROR', message: 'Serialization failed: ' + err.message }, '*');
                }
            }
        });
      })();
    </script>
  `;

  const getFrameworkScripts = (content: string, origin?: string) => {
      let scripts = '';
      
      // p5.js Detection - use local library
      // NOTE: p5.js will be loaded in the body AFTER user code for global mode
      // We detect it here but don't add the script tag yet
      // (p5.js needs setup/draw defined BEFORE it loads for global mode to work)

      // Three.js Detection (Vanilla or React/TSX usage)
      // Check if user has importmap (which handles its own loading)
      const hasImportMap = content.includes('type="importmap"') || content.includes('importmap');
      const hasThreeJsCDN = content.includes('three.min.js') || content.includes('three.js') || content.includes('three.module.js');
      
      // Use local Three.js files (from public/libs/three)
      // In dev: served by Vite at /libs/three/
      // In production: served from dist/libs/three/
      // IMPORTANT: We use absolute URLs for blob URL compatibility
      // Use the parent origin passed as parameter, or fallback to current origin
      const baseOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
      const threeBasePath = baseOrigin ? `${baseOrigin}/libs/three` : '/libs/three';
      
      if (!hasThreeJsCDN && !hasImportMap) {
          // More specific detection: check for actual Three.js usage patterns
          const hasThreeJsUsage = content.includes('THREE.') || 
                                 content.includes('new THREE.') ||
                                 content.includes('THREE.Scene') ||
                                 content.includes('THREE.WebGLRenderer') ||
                                 content.includes('THREE.PerspectiveCamera') ||
                                 content.includes('THREE.OrbitControls') ||
                                 content.includes('new THREE.OrbitControls');
          const hasThreeJsKeywords = content.includes('Scene') || 
                                    content.includes('WebGLRenderer') || 
                                    content.includes('PerspectiveCamera') ||
                                    content.includes('OrbitControls');
          
          if (hasThreeJsUsage || (hasThreeJsKeywords && !content.includes('//'))) {
               const needsOrbitControls = content.includes('OrbitControls') || 
                                         content.includes('new THREE.OrbitControls') ||
                                         content.includes('THREE.OrbitControls');
               
               if (needsOrbitControls) {
                   // Load Three.js and OrbitControls using UMD build for blob URL compatibility
                   // Blob URLs have proper origins, so ES module imports should work
                   scripts += `<script src="${threeBasePath}/three.min.js"></script>`;
                   // Load OrbitControls as ES module after Three.js UMD loads
                   scripts += '<script type="importmap">';
                   scripts += '{';
                   scripts += '  "imports": {';
                   scripts += `    "three": "${threeBasePath}/three.module.js"`;
                   scripts += '  }';
                   scripts += '}';
                   scripts += '</script>';
                   scripts += '<script type="module">';
                   scripts += '  (async function() {';
                   scripts += '    // Wait for Three.js UMD to load';
                   scripts += '    function waitForThree() {';
                   scripts += '      return new Promise((resolve) => {';
                   scripts += '        if (window.THREE) {';
                   scripts += '          resolve();';
                   scripts += '        } else {';
                   scripts += '          const check = setInterval(() => {';
                   scripts += '            if (window.THREE) {';
                   scripts += '              clearInterval(check);';
                   scripts += '              resolve();';
                   scripts += '            }';
                   scripts += '          }, 10);';
                   scripts += '        }';
                   scripts += '      });';
                   scripts += '    }';
                   scripts += '    try {';
                   scripts += '      await waitForThree();';
                   scripts += '      console.log("Three.js loaded:", !!window.THREE);';
                   scripts += '      window.THREEReady = true;';
                   scripts += '      window.dispatchEvent(new CustomEvent("threeready"));';
                   scripts += `      const { OrbitControls } = await import("${threeBasePath}/controls/OrbitControls.js");`;
                   scripts += '      window.THREE.OrbitControls = OrbitControls;';
                   scripts += '      window.OrbitControlsReady = true;';
                   scripts += '      window.dispatchEvent(new CustomEvent("orbitcontrolsready"));';
                   scripts += '      console.log("OrbitControls loaded and attached:", !!window.THREE.OrbitControls);';
                   scripts += '    } catch(err) {';
                   scripts += '      console.error("Failed to load OrbitControls:", err);';
                   scripts += '      window.dispatchEvent(new CustomEvent("threeerror", { detail: err }));';
                   scripts += '    }';
                   scripts += '  })();';
                   scripts += '</script>';
               } else {
                   // For vanilla Three.js without OrbitControls, use UMD build
                   scripts += `<script src="${threeBasePath}/three.min.js"></script>`;
                   scripts += '<script>';
                   scripts += '  // Wait for Three.js UMD to load';
                   scripts += '  function checkThree() {';
                   scripts += '    if (window.THREE) {';
                   scripts += '      console.log("Three.js loaded:", !!window.THREE);';
                   scripts += '      window.THREEReady = true;';
                   scripts += '      window.dispatchEvent(new CustomEvent("threeready"));';
                   scripts += '    } else {';
                   scripts += '      setTimeout(checkThree, 10);';
                   scripts += '    }';
                   scripts += '  }';
                   scripts += '  if (document.readyState === "loading") {';
                   scripts += '    window.addEventListener("load", checkThree);';
                   scripts += '  } else {';
                   scripts += '    checkThree();';
                   scripts += '  }';
                   scripts += '</script>';
               }
          }
      } else if (hasImportMap) {
          // User has importmap - update it to use local paths if it references three
          // This preserves the user's importmap structure but uses local files
          scripts += '<script type="importmap">';
          scripts += '{';
          scripts += '  "imports": {';
          scripts += `    "three": "${threeBasePath}/three.module.js",`;
          scripts += `    "three/addons/": "${threeBasePath}/controls/"`;
          scripts += '  }';
          scripts += '}';
          scripts += '</script>';
      }
      return scripts;
  };

  // Strip ES module imports from vanilla JavaScript and replace with global variable access
  const stripImports = (code: string): string => {
    let cleaned = code;
    
    // Track if we've already declared THREE
    let threeDeclared = /\b(const|let|var)\s+THREE\s*=/i.test(cleaned);
    let orbitControlsDeclared = /\b(const|let|var)\s+OrbitControls\s*=/i.test(cleaned);
    
    // Replace import * as THREE from 'three'
    cleaned = cleaned.replace(/import\s+\*\s+as\s+THREE\s+from\s+['"]three['"];?/g, () => {
      if (!threeDeclared) {
        threeDeclared = true;
        return 'const THREE = window.THREE;';
      }
      return '';
    });
    
    // Replace import THREE from 'three'
    cleaned = cleaned.replace(/import\s+THREE\s+from\s+['"]three['"];?/g, () => {
      if (!threeDeclared) {
        threeDeclared = true;
        return 'const THREE = window.THREE;';
      }
      return '';
    });
    
    // Replace named imports from 'three'
    cleaned = cleaned.replace(/import\s+\{(.*?)\}\s+from\s+['"]three['"];?/g, (match, imports) => {
      const threeDecl = !threeDeclared ? 'const THREE = window.THREE;\n' : '';
      threeDeclared = true;
      return threeDecl + `const { ${imports.trim()} } = window.THREE;`;
    });
    
    // Replace OrbitControls imports from 'three/examples/jsm/controls/OrbitControls.js'
    cleaned = cleaned.replace(/import\s+\{?\s*OrbitControls\s*\}?\s+from\s+['"].*\/OrbitControls\.js['"];?/g, () => {
      if (!orbitControlsDeclared) {
        orbitControlsDeclared = true;
        return 'const OrbitControls = window.THREE?.OrbitControls;';
      }
      return '';
    });
    
    // Replace default imports from OrbitControls
    cleaned = cleaned.replace(/import\s+OrbitControls\s+from\s+['"].*\/OrbitControls\.js['"];?/g, () => {
      if (!orbitControlsDeclared) {
        orbitControlsDeclared = true;
        return 'const OrbitControls = window.THREE?.OrbitControls;';
      }
      return '';
    });
    
    // Remove any other ES module imports (they won't work in vanilla mode)
    cleaned = cleaned.replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '// Import removed (use global variables instead)');
    
    return cleaned;
  };

  const srcDoc = useMemo(() => {
      try {
          // Debug: Log input values
          if (process.env.NODE_ENV === 'development') {
              console.log('PreviewDisplay: Generating srcDoc', {
                  previewMode,
                  hasHtml: !!debouncedHtml?.trim(),
                  hasCss: !!debouncedCss?.trim(),
                  hasJs: !!debouncedJs?.trim(),
                  hasTsx: !!debouncedTsx?.trim(),
                  babelReady,
                  compiledCode: !!compiledCode
              });
          }
          
          // If html is a complete HTML document (wrapped code), use it directly
          // Strict check: must have DOCTYPE, html tag, and closing html tag
          // Use processedHtml if available (for canvas mode with inlined libraries), otherwise use debouncedHtml
          const htmlToUse = (previewMode === 'canvas' && processedHtml) ? processedHtml : debouncedHtml;
          const trimmedHtml = htmlToUse.trim();
          const hasDoctype = trimmedHtml.includes('<!DOCTYPE');
          const hasHtmlTags = trimmedHtml.includes('<html') && trimmedHtml.includes('</html>');
          const isCompleteDocument = isCompleteHtml || (hasDoctype && hasHtmlTags);
          
          if (isCompleteDocument && trimmedHtml) {
              // Complete HTML document - ensure it has DOCTYPE, if not add it
              let safeCompleteHtml = htmlToUse.replace(/<\/script>/gi, '<\\/script>');
              
              // If missing DOCTYPE, add it at the beginning
              if (!hasDoctype && isCompleteHtml) {
                  // Only add DOCTYPE if it's marked as complete but missing DOCTYPE
                  // This handles edge cases where wrapped code might be missing DOCTYPE
                  safeCompleteHtml = `<!DOCTYPE html>\n${safeCompleteHtml}`;
              }
              
              // Convert relative library paths and CDN URLs to absolute local URLs for blob URL context
              // This is needed for wrapped code (Three.js, p5.js) and complete HTML with ES modules
              // Get current origin for absolute URLs
              let currentOrigin = '';
              try {
                  if (typeof window !== 'undefined' && window.location && window.location.origin) {
                      currentOrigin = window.location.origin;
                  }
              } catch (e) {
                  console.warn('Could not get window.location.origin:', e);
              }
              
              if (currentOrigin) {
                  // Convert relative paths to absolute URLs (for both src and script src)
                  // Handle src="..." and src='...' attributes
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /src=["'](\/libs\/[^"']+)["']/g,
                      `src="${currentOrigin}$1"`
                  );
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /href=["'](\/libs\/[^"']+)["']/g,
                      `href="${currentOrigin}$1"`
                  );
                  // Also handle script tags with src attribute (case insensitive)
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /<script\s+[^>]*src=["'](\/libs\/[^"']+)["'][^>]*>/gi,
                      (match, path) => match.replace(`src="${path}"`, `src="${currentOrigin}${path}"`).replace(`src='${path}'`, `src='${currentOrigin}${path}'`)
                  );
                  
                  // Convert ES module importmap CDN URLs to local library paths
                  // Replace https://esm.run/three with local Three.js ES module
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /"three":\s*"https:\/\/esm\.run\/three"/g,
                      `"three": "${currentOrigin}/libs/three/three.module.js"`
                  );
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /"three\/addons\/":\s*"https:\/\/esm\.run\/three\/examples\/jsm\/"/g,
                      `"three/addons/": "${currentOrigin}/libs/three/examples/jsm/"`
                  );
                  
                  // Also handle any other esm.run URLs for three.js
                  safeCompleteHtml = safeCompleteHtml.replace(
                      /https:\/\/esm\.run\/three/g,
                      `${currentOrigin}/libs/three/three.module.js`
                  );
              }
              
              return safeCompleteHtml;
          }
          
          // Get the current origin for absolute URLs (needed for ES modules in blob URLs)
          // Must be defined BEFORE getFrameworkScripts is called
          let currentOrigin = '';
          try {
              if (typeof window !== 'undefined' && window.location && window.location.origin) {
                  currentOrigin = window.location.origin;
              }
          } catch (e) {
              console.warn('Could not get window.location.origin:', e);
          }
          
          // If origin is still empty or invalid, try to construct it from hostname
          if (!currentOrigin && typeof window !== 'undefined' && window.location) {
              try {
                  const protocol = window.location.protocol || 'http:';
                  const hostname = window.location.hostname || 'localhost';
                  const port = window.location.port;
                  currentOrigin = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
              } catch (e) {
                  console.warn('Could not construct origin:', e);
              }
          }
          
          // Final fallback - use relative paths if origin is not available
          // With blob URLs, we still need absolute URLs for ES modules
          if (!currentOrigin) {
              console.warn('No origin available, using relative paths (may not work for ES modules)');
          }
          
          const safeHtml = debouncedHtml.replace(/<\/script>/gi, '<\\/script>');
      // For vanilla JS, strip any HTML/JSX tags and ES module imports that might have been incorrectly included
      let safeJs = debouncedJs.replace(/<\/script>/gi, '<\\/script>');
      if (previewMode === 'vanilla' || previewMode === 'canvas') {
        // Remove any HTML/JSX tags from vanilla JS (these should only be in HTML, not JS)
        // This prevents "Unexpected token '<'" errors when HTML tags end up in JavaScript
        safeJs = safeJs.replace(/<[^>]*>/g, '');
        // Also remove JSX-like syntax that might have leaked in
        safeJs = safeJs.replace(/return\s*<[^>]*>/g, 'return null; // JSX removed');
        safeJs = safeJs.replace(/<[A-Z][a-zA-Z0-9]*[^>]*>/g, ''); // Remove JSX component tags
        // Strip ES module imports and replace with global variable access
        safeJs = stripImports(safeJs);
      }
      const safeTsx = debouncedTsx ? debouncedTsx.replace(/<\/script>/gi, '<\\/script>') : '';
      
      // In React mode, check TSX for framework dependencies; otherwise check HTML/JS
      // Combine all content to detect frameworks properly
      const combinedContent = previewMode === 'react' && safeTsx 
          ? safeHtml + safeJs + safeTsx  // Include TSX for React mode
          : safeHtml + safeJs;  // Just HTML/JS for vanilla mode
      
      const frameworkScripts = getFrameworkScripts(combinedContent, currentOrigin);
      
      // Store result to use for blob URL if needed
      let srcDocResult: string;
      
      // Check if user code needs OrbitControls (check both JS and TSX)
      const needsOrbitControls = safeJs.includes('OrbitControls') || 
                                 safeJs.includes('new OrbitControls') ||
                                 safeTsx.includes('OrbitControls') ||
                                 safeTsx.includes('new OrbitControls');
      
      // Check if user code needs p5.js (check for p5.js functions in JS, TSX, OR HTML for wrapped code)
      const combinedForP5Check = (safeJs || '') + (safeTsx || '') + (safeHtml || '');
      const needsP5 = combinedForP5Check.includes('createCanvas') || 
                      combinedForP5Check.includes('setup()') || 
                      combinedForP5Check.includes('draw()') || 
                      combinedForP5Check.includes('new p5') ||
                      combinedForP5Check.includes('function setup') ||
                      combinedForP5Check.includes('function draw') ||
                      combinedForP5Check.includes('p.setup') ||
                      combinedForP5Check.includes('p.draw') ||
                      combinedForP5Check.includes('p5.');

      if (previewMode === 'browser') {
          // Browser mode - just render HTML/CSS as-is, no JS execution
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:;">
                <style>
                  *, *::before, *::after { box-sizing: border-box; }
                  html, body { margin: 0; padding: 0; width: 100%; min-height: 100vh; }
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    background-color: #ffffff;
                    color: #1f2937;
                  }
                  ${debouncedCss}
                </style>
                ${consoleScript}
              </head>
              <body>
                ${safeHtml}
              </body>
            </html>
          `;
      } else if (previewMode === 'vanilla' || previewMode === 'canvas') {
          // Preview Modes:
          // - 'vanilla': HTML + CSS + JS with light theme, centered layout, padding
          //   Best for: HTML components, UI elements, traditional web content
          // - 'canvas': Same as vanilla but optimized for full-screen canvas rendering
          //   - Dark background (#0a0a0a) for better 3D/creative coding visibility
          //   - Full viewport layout (no padding, absolute positioning)
          //   - Best for: Three.js, p5.js, WebGL, full-screen canvas applications
          // Both modes use the same rendering pipeline (iframe with blob URLs)
          // The difference is purely styling/layout for optimal viewing experience
          // With blob URLs, we can use absolute URLs directly (blob URLs have proper origin)
          // CSP needs to allow ES module imports from parent origin and blob URLs
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' http: https: data: blob:; script-src 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline' http: https:; img-src 'self' data: http: https: blob:; font-src 'self' data: http: https:; connect-src 'self' http: https: ws: wss:;">
                ${frameworkScripts}
                <style>
                  *, *::before, *::after { box-sizing: border-box; }
                  html, body { margin: 0; padding: 0; width: 100%; min-height: 100vh; }
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    background-color: ${previewMode === 'canvas' ? '#0a0a0a' : '#ffffff'};
                    color: ${previewMode === 'canvas' ? '#ffffff' : '#1f2937'};
                    display: ${previewMode === 'canvas' ? 'flex' : 'grid'};
                    ${previewMode === 'canvas' ? '' : 'place-items: center;'}
                    padding: ${previewMode === 'canvas' ? '0' : '2rem'};
                    margin: 0;
                    width: 100%;
                    height: 100vh;
                    background-image: ${previewMode === 'canvas' ? 'none' : 'radial-gradient(#e5e7eb 1px, transparent 1px)'};
                    background-size: ${previewMode === 'canvas' ? 'auto' : '20px 20px'};
                    overflow: hidden;
                  }
                  img, picture, video, canvas, svg { display: block; max-width: 100%; }
                  ${debouncedCss}
                  #component-preview-root {
                    filter: ${previewMode === 'canvas' ? 'none' : 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08))'};
                    position: ${previewMode === 'canvas' ? 'absolute' : 'relative'};
                    width: ${previewMode === 'canvas' ? '100%' : 'auto'};
                    height: ${previewMode === 'canvas' ? '100%' : 'auto'};
                    max-width: 100%;
                    top: ${previewMode === 'canvas' ? '0' : 'auto'};
                    left: ${previewMode === 'canvas' ? '0' : 'auto'};
                  }
                </style>
                ${consoleScript}
              </head>
              <body>
                <div id="component-preview-root">
                  ${safeHtml && safeHtml.trim() ? safeHtml : (combinedContent && (combinedContent.includes('THREE.') || combinedContent.includes('new THREE.') || combinedContent.includes('THREE.Scene')) ? '<!-- Three.js will render here -->' : (!safeHtml && !safeJs && !safeTsx ? '<div style="padding: 2rem; text-align: center; color: #9ca3af;"><p style="margin-bottom: 0.5rem;">No content to preview.</p><p style="font-size: 0.875rem; color: #6b7280;">Paste code or extract a component to see the preview.</p></div>' : ''))}
                </div>
                ${needsP5 ? (() => {
                  // For p5.js: define setup/draw BEFORE loading p5.js (global mode requirement)
                  // Escape safeJs for use in template
                  const escapedJs = safeJs && safeJs.trim() 
                    ? safeJs.replace(/<\/script>/gi, '<\\/script>').replace(/`/g, '\\`').replace(/\${/g, '\\${')
                    : '// No JavaScript code to execute';
                  // Use absolute URL for p5.js (needed for blob URL context)
                  const p5BasePath = currentOrigin ? `${currentOrigin}/libs/p5` : '/libs/p5';
                  return `
                <!-- For p5.js global mode: define setup/draw BEFORE loading p5.js -->
                <!-- p5.js in global mode automatically calls setup() and draw() if they exist when it loads -->
                <script>
                  ${escapedJs}
                </script>
                <script>
                  (function() {
                    const p5Script = document.createElement('script');
                    p5Script.src = '${p5BasePath}/p5.min.js';
                    p5Script.onload = function() {
                      console.log('p5.js loaded successfully from local libs');
                    };
                    p5Script.onerror = function() {
                      console.warn('Failed to load p5.js from local libs, trying CDN fallback...');
                      // CDN fallback
                      const cdnScript = document.createElement('script');
                      cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
                      cdnScript.onload = function() {
                        console.log('p5.js loaded from CDN fallback');
                      };
                      cdnScript.onerror = function() {
                        console.error('Failed to load p5.js from both local and CDN');
                      };
                      document.head.appendChild(cdnScript);
                    };
                    document.head.appendChild(p5Script);
                  })();
                </script>
                `;
                })() : `
                <script>
                  // Run user code, waiting for Three.js and OrbitControls if needed
                  // Both Three.js and OrbitControls now load as ES modules (asynchronously)
                  (function() {
                    const needsOrbitControls = ${needsOrbitControls ? 'true' : 'false'};
                    // Check for Three.js in all content (HTML, JS, or comments)
                    const combinedCheck = ${JSON.stringify(combinedContent || '')};
                    const hasThreeJs = combinedCheck.includes('THREE.') || 
                                      combinedCheck.includes('new THREE.') ||
                                      combinedCheck.includes('THREE.Scene') ||
                                      combinedCheck.includes('THREE.WebGLRenderer') ||
                                      combinedCheck.includes('THREE.PerspectiveCamera') ||
                                      combinedCheck.includes('THREE.OrbitControls');
                    
                    function runUserCode() {
                      try {
                        ${safeJs && safeJs.trim() ? safeJs : 'console.warn("No JavaScript code to execute");'}
                      } catch(e) {
                        console.error("Error in user code:", e);
                        throw e;
                      }
                    }
                    
                    // If OrbitControls is needed, wait for both Three.js AND OrbitControls
                    if (needsOrbitControls) {
                      if (window.THREE && window.THREE.OrbitControls) {
                        // Already loaded
                        console.log("Three.js and OrbitControls ready");
                        runUserCode();
                      } else {
                        console.log("Waiting for Three.js and OrbitControls to load...");
                        let attempts = 0;
                        const maxAttempts = 150; // 15 seconds max wait (ES modules can take longer)
                        
                        // Set up event listeners first (most reliable)
                        const readyHandler = function() {
                          if (window.THREE && window.THREE.OrbitControls) {
                            console.log("OrbitControls ready event received");
                            runUserCode();
                            window.removeEventListener('orbitcontrolsready', readyHandler);
                          }
                        };
                        window.addEventListener('orbitcontrolsready', readyHandler, { once: true });
                        
                        // Also listen for Three.js ready (it loads first)
                        window.addEventListener('threeready', function() {
                          console.log("Three.js ready, still waiting for OrbitControls...");
                        }, { once: true });
                        
                        // Poll as fallback
                        const checkInterval = setInterval(function() {
                          attempts++;
                          if (window.THREE && window.THREE.OrbitControls) {
                            clearInterval(checkInterval);
                            window.removeEventListener('orbitcontrolsready', readyHandler);
                            console.log("Three.js and OrbitControls ready (attempt " + attempts + ")");
                            runUserCode();
                          } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            window.removeEventListener('orbitcontrolsready', readyHandler);
                            console.error("OrbitControls did not load in time!");
                            console.error("THREE available:", !!window.THREE);
                            console.error("THREE.OrbitControls available:", !!(window.THREE && window.THREE.OrbitControls));
                            if (window.THREE) {
                              console.warn("Running code anyway - THREE is available but OrbitControls is not");
                            } else {
                              console.error("ERROR: THREE is not defined!");
                            }
                            runUserCode();
                          }
                        }, 100);
                        
                        // Listen for errors
                        window.addEventListener('threeerror', function(e) {
                          clearInterval(checkInterval);
                          window.removeEventListener('orbitcontrolsready', readyHandler);
                          console.error("Three.js or OrbitControls loading error:", e.detail);
                          runUserCode(); // Run anyway
                        }, { once: true });
                      }
                    } else if (hasThreeJs) {
                      // Three.js code detected - wait for THREE to load
                      if (window.THREE) {
                        // Already loaded
                        console.log("Three.js already loaded");
                        runUserCode();
                      } else {
                        console.log("Waiting for Three.js to load...");
                        let attempts = 0;
                        const maxAttempts = 150; // 15 seconds (ES modules can take longer)
                        
                        // Listen for ready event first (most reliable)
                        window.addEventListener('threeready', function() {
                          clearInterval(checkInterval);
                          console.log("Three.js ready event received");
                          runUserCode();
                        }, { once: true });
                        
                        // Poll as fallback
                        let checkInterval = setInterval(function() {
                          attempts++;
                          if (window.THREE) {
                            clearInterval(checkInterval);
                            console.log("Three.js ready (attempt " + attempts + ")");
                            runUserCode();
                          } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            console.error("Three.js did not load in time!");
                            console.error("THREE available:", !!window.THREE);
                            if (window.THREE) {
                              console.warn("Running code anyway - THREE is available");
                            } else {
                              console.error("ERROR: THREE is not defined!");
                            }
                            runUserCode();
                          }
                        }, 100);
                        
                        // Listen for errors
                        const errorHandler = function(e) {
                          clearInterval(checkInterval);
                          console.error("Three.js loading error:", e.detail);
                          runUserCode(); // Run anyway
                        };
                        window.addEventListener('threeerror', errorHandler, { once: true });
                        
                        // Also clean up on ready event
                        const readyEventHandler = function() {
                          clearInterval(checkInterval);
                        };
                        window.addEventListener('threeready', readyEventHandler, { once: true });
                      }
                    } else {
                      // No Three.js code - run immediately
                      runUserCode();
                    }
                  })();
                </script>
                `}
              </body>
            </html>
          `;
      } else {
          // React preview mode
          if (!babelReady) {
              return `<!DOCTYPE html><html><body style="font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#666;"><div>Loading Babel compiler...</div></body></html>`;
          }
          if (!debouncedTsx || !debouncedTsx.trim()) {
              return `<!DOCTYPE html><html><body style="font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#666;"><div>No React code to preview. Extract a component first.</div></body></html>`;
          }
          if (!compiledCode) {
              return `<!DOCTYPE html><html><body style="font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#666;"><div>Compiling React code...</div></body></html>`;
          }
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:;">
                <script src="/libs/react/react.development.js"></script>
                <script src="/libs/react/react-dom.development.js"></script>
                ${frameworkScripts}
                ${needsP5 ? (() => {
                  // Load p5.js for React preview mode (instance mode, so load before React code)
                  const p5BasePath = currentOrigin ? `${currentOrigin}/libs/p5` : '/libs/p5';
                  return `
                <!-- Load p5.js library for React components (instance mode) -->
                <script>
                  (function() {
                    const p5Script = document.createElement('script');
                    p5Script.src = '${p5BasePath}/p5.min.js';
                    p5Script.onload = function() {
                      console.log('p5.js loaded successfully');
                      window.p5Ready = true;
                      window.dispatchEvent(new CustomEvent('p5ready'));
                    };
                    p5Script.onerror = function() {
                      console.warn('Failed to load p5.js from local libs, trying CDN fallback...');
                      // CDN fallback
                      const cdnScript = document.createElement('script');
                      cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
                      cdnScript.onload = function() {
                        console.log('p5.js loaded from CDN fallback');
                        window.p5Ready = true;
                        window.dispatchEvent(new CustomEvent('p5ready'));
                      };
                      cdnScript.onerror = function() {
                        console.error('Failed to load p5.js from both local and CDN');
                        window.p5Ready = false;
                        window.dispatchEvent(new CustomEvent('p5error'));
                      };
                      document.head.appendChild(cdnScript);
                    };
                    document.head.appendChild(p5Script);
                  })();
                </script>
                `;
                })() : ''} 
                <style>
                  *, *::before, *::after { box-sizing: border-box; }
                  html, body { margin: 0; padding: 0; width: 100%; min-height: 100vh; }
                  body {
                    font-family: system-ui, sans-serif;
                    background-color: #ffffff;
                    display: grid;
                    place-items: center;
                    padding: 2rem;
                    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
                    background-size: 20px 20px;
                    overflow: hidden;
                  }
                  ${debouncedCss}
                  #root { position: relative; max-width: 100%; }
                </style>
                ${consoleScript}
              </head>
              <body>
                <div id="root"></div>
                <script>
                  // Wait for libraries (Three.js, p5.js) to load if needed before running React code
                  (function() {
                    const hasThreeJs = ${(combinedContent.includes('THREE.') || combinedContent.includes('three') || combinedContent.includes('Scene') || combinedContent.includes('WebGLRenderer') || combinedContent.includes('PerspectiveCamera')) ? 'true' : 'false'};
                    const needsOrbitControlsInReact = ${(safeTsx.includes('OrbitControls') || safeTsx.includes('new OrbitControls')) ? 'true' : 'false'};
                    const needsP5InReact = ${needsP5 ? 'true' : 'false'};
                    
                    function runReactCode() {
                      try {
                        ${compiledCode || 'console.error("No compiled code available");'}
                      } catch (error) {
                        console.error('Preview execution error:', error);
                        const root = document.getElementById('root');
                        if (root) {
                          root.innerHTML = '<div style="padding: 1rem; color: #ef4444; font-family: monospace; font-size: 12px; background: #fee2e2; border-radius: 4px; max-width: 100%;"><strong>Execution Error:</strong> ' + (error.message || String(error)) + '</div>';
                        }
                      }
                    }
                    
                    // Helper to wait for all required libraries
                    function waitForLibraries(callback) {
                      const libraries = [];
                      if (hasThreeJs && needsOrbitControlsInReact) {
                        libraries.push(new Promise((resolve) => {
                          if (window.THREE && window.THREE.OrbitControls) {
                            resolve();
                          } else {
                            const check = setInterval(() => {
                              if (window.THREE && window.THREE.OrbitControls) {
                                clearInterval(check);
                                resolve();
                              }
                            }, 100);
                            window.addEventListener('orbitcontrolsready', () => {
                              clearInterval(check);
                              resolve();
                            }, { once: true });
                          }
                        }));
                      } else if (hasThreeJs) {
                        libraries.push(new Promise((resolve) => {
                          if (window.THREE) {
                            resolve();
                          } else {
                            const check = setInterval(() => {
                              if (window.THREE) {
                                clearInterval(check);
                                resolve();
                              }
                            }, 100);
                            window.addEventListener('threeready', () => {
                              clearInterval(check);
                              resolve();
                            }, { once: true });
                          }
                        }));
                      }
                      
                      if (needsP5InReact) {
                        libraries.push(new Promise((resolve) => {
                          if (window.p5 && typeof window.p5 === 'function') {
                            resolve();
                          } else if (window.p5Ready) {
                            resolve();
                          } else {
                            const check = setInterval(() => {
                              if (window.p5 && typeof window.p5 === 'function') {
                                clearInterval(check);
                                resolve();
                              } else if (window.p5Ready) {
                                clearInterval(check);
                                resolve();
                              }
                            }, 100);
                            window.addEventListener('p5ready', () => {
                              clearInterval(check);
                              resolve();
                            }, { once: true });
                            // Timeout after 5 seconds
                            setTimeout(() => {
                              clearInterval(check);
                              console.warn('p5.js did not load in time, running code anyway');
                              resolve();
                            }, 5000);
                          }
                        }));
                      }
                      
                      if (libraries.length === 0) {
                        callback();
                      } else {
                        Promise.all(libraries).then(callback);
                      }
                    }
                    
                    // Wait for all required libraries before running React code
                    waitForLibraries(runReactCode);
                  })();
                </script>
              </body>
            </html>
          `;
      }
      } catch (error: any) {
          // Fallback error page if HTML generation fails
          console.error('Error generating preview HTML:', error);
          const errorMessage = error?.message || String(error || 'Unknown error');
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Preview Error</title>
                <style>
                  body {
                    font-family: system-ui, sans-serif;
                    display: grid;
                    place-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #fee2e2;
                    color: #991b1b;
                    padding: 2rem;
                  }
                  .error-box {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    border: 2px solid #fca5a5;
                    max-width: 600px;
                  }
                  h1 { margin: 0 0 1rem 0; }
                  pre {
                    background: #f3f4f6;
                    padding: 1rem;
                    border-radius: 4px;
                    overflow: auto;
                    font-size: 12px;
                  }
                </style>
              </head>
              <body>
                <div class="error-box">
                  <h1>Preview Generation Error</h1>
                  <p>An error occurred while generating the preview HTML:</p>
                  <pre>${errorMessage}</pre>
                  <p style="margin-top: 1rem; font-size: 14px; color: #666;">
                    Please check the console for more details.
                  </p>
                </div>
              </body>
            </html>
          `;
      }
  }, [debouncedHtml, debouncedCss, debouncedJs, debouncedTsx, compiledCode, previewMode, babelReady, consoleScript, reloadKey, isCompleteHtml, processedHtml]);
  
  // Use srcdoc for browser/vanilla modes (simple HTML/CSS)
  // Also use srcdoc for canvas mode when libraries are inlined (processedHtml available)
  // Use blob URL for canvas/react modes when libraries are NOT inlined (needs ES modules, proper origin)
  const iframeSrcDoc = useMemo(() => {
      // Use srcdoc for browser/vanilla modes ONLY
      if (previewMode === 'browser' || previewMode === 'vanilla') {
          // Validate srcDoc is not empty
          if (!srcDoc || !srcDoc.trim()) {
              console.warn('PreviewDisplay: srcDoc is empty, creating fallback HTML');
              return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preview</title><style>body{font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#666;background:#1a1a1a;}p{text-align:center;color:#9ca3af;}</style></head><body><p>No content to preview yet.<br>Extract a component or paste code to see the preview.</p></body></html>`;
          }
          return srcDoc;
      }
      // For canvas/react modes, use blob URL (via iframeSrc) instead of srcdoc
      // srcdoc has size limitations (~32KB) which can't handle large libraries like p5.js (1MB+)
      return undefined;
  }, [srcDoc, previewMode]);
  
  // Create blob URL for canvas/react modes (needs ES modules support)
  const iframeSrc = useMemo(() => {
      // Revoke old blob URL if it exists
      if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
      }
      
      // For browser/vanilla modes, use srcdoc (no blob URL)
      if (previewMode === 'browser' || previewMode === 'vanilla') {
          return undefined;
      }
      
      // For React/Canvas modes with ES modules, use blob URL
      if (!srcDoc || !srcDoc.trim()) {
          console.warn('PreviewDisplay: srcDoc is empty for canvas/react mode');
          return undefined;
      }
      
      try {
          const blob = new Blob([srcDoc], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          return blobUrl;
      } catch (error) {
          console.error('PreviewDisplay: Error creating blob URL:', error);
          return undefined;
      }
  }, [srcDoc, previewMode]);
  
  // Cleanup blob URL on unmount
  useEffect(() => {
      return () => {
          if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
              blobUrlRef.current = null;
          }
      };
  }, []);

  const previewCard = (
    <div 
        className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col shadow-lg relative group transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30 ${isFullScreen ? 'fixed inset-0 z-[100] m-0 rounded-none h-screen w-screen' : 'h-[450px] mb-4'}`}
    >
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 border-b border-gray-700 shrink-0">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${runtimeError ? 'bg-red-500' : 'bg-green-400'} animate-pulse`}></div>
           Live Preview <span className="text-xs text-gray-500 ml-1">({previewMode === 'canvas' ? 'Canvas' : previewMode === 'vanilla' ? 'Vanilla JS' : previewMode === 'react' ? 'React' : 'Browser'})</span>
        </h3>
        
        <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800 rounded border border-gray-600/50 overflow-hidden mr-2">
                <button onClick={handleZoomOut} className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Zoom Out">
                    <ZoomOutIcon className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] w-8 text-center text-gray-500 font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Zoom In">
                    <ZoomInIcon className="w-3.5 h-3.5" />
                </button>
            </div>
            <button onClick={handleRefresh} className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors" title="Refresh Preview">
                <RefreshIcon className="w-4 h-4" />
            </button>
            <button onClick={handleOpenInNewTab} className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors" title="Open in New Tab">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </button>
             <button onClick={toggleFullScreen} className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors" title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                {isFullScreen ? <ExitFullScreenIcon className="w-4 h-4" /> : <FullScreenIcon className="w-4 h-4" />}
            </button>
        </div>
      </div>
      
      <div className="bg-gray-100 relative overflow-hidden flex-1">
        <div 
            className="w-full h-full origin-center transition-transform duration-200 ease-out"
            style={{ 
                width: `${100 / zoomLevel}%`, 
                height: `${100 / zoomLevel}%`, 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left'
            }}
        >
            <iframe
            key={reloadKey}
            ref={iframeRef}
            {...(previewMode === 'canvas' || previewMode === 'react' ? { src: processedHtml && previewMode === 'canvas' ? URL.createObjectURL(new Blob([processedHtml], { type: 'text/html' })) : iframeSrc } : { srcDoc: iframeSrcDoc })}
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            className="w-full h-full border-0"
            loading="lazy"
            onLoad={() => {
                // Debug: Check if iframe loaded successfully
                if (iframeRef.current?.contentWindow) {
                    console.log('PreviewDisplay: Iframe loaded successfully', {
                        previewMode,
                        hasProcessedHtml: !!processedHtml,
                        hasIframeSrcDoc: !!iframeSrcDoc,
                        iframeSrcDocLength: iframeSrcDoc?.length || 0,
                        iframeHasSrcDoc: !!iframeRef.current.getAttribute('srcdoc'),
                        iframeHasSrc: !!iframeRef.current.getAttribute('src')
                    });
                    // Try to check iframe content
                    try {
                        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
                        if (iframeDoc) {
                            const scripts = iframeDoc.querySelectorAll('script');
                            const canvas = iframeDoc.querySelector('canvas');
                            const scriptDetails = Array.from(scripts).map((script, i) => ({
                                index: i,
                                hasSrc: !!script.src,
                                src: script.src || 'inline',
                                textLength: script.textContent?.length || 0,
                                textPreview: script.textContent?.substring(0, 100) || ''
                            }));
                            console.log('PreviewDisplay: Iframe document found', {
                                hasBody: !!iframeDoc.body,
                                bodyChildren: iframeDoc.body?.children.length || 0,
                                title: iframeDoc.title,
                                scriptCount: scripts.length,
                                scriptDetails,
                                hasCanvas: !!canvas,
                                canvasWidth: canvas?.width || 0,
                                canvasHeight: canvas?.height || 0,
                                bodyHTML: iframeDoc.body?.innerHTML.substring(0, 500) || ''
                            });
                            // Check for errors in iframe console
                            if (iframeRef.current.contentWindow?.console) {
                                const originalError = iframeRef.current.contentWindow.console.error;
                                iframeRef.current.contentWindow.console.error = (...args) => {
                                    console.error('PreviewDisplay: Iframe error:', ...args);
                                    originalError.apply(iframeRef.current.contentWindow?.console, args);
                                };
                            }
                        }
                    } catch (e) {
                        console.warn('PreviewDisplay: Cannot access iframe document (CSP)', e);
                    }
                } else {
                    console.warn('PreviewDisplay: Iframe loaded but contentWindow is null');
                }
            }}
            onError={(e) => {
                console.error('PreviewDisplay: Iframe load error:', e);
                setRuntimeError('Failed to load preview. Check console for details.');
            }}
            />
        </div>
        
        {runtimeError && (
            <div className="absolute top-4 right-4 left-4 bg-red-100/90 backdrop-blur border border-red-400 text-red-800 p-3 rounded-lg shadow-xl flex items-start gap-3 z-10 animate-in fade-in slide-in-from-top-2">
                <div className="flex-1">
                    <h4 className="font-bold text-sm">Runtime Error</h4>
                    <p className="text-xs font-mono mt-1 break-all">{runtimeError}</p>
                </div>
                <button onClick={() => setRuntimeError(null)} className="text-red-500 hover:text-red-800">✕</button>
            </div>
        )}
      </div>
    </div>
  );

  const handleClearLogs = () => {
    setLogs([]);
    setRuntimeError(null);
  };

  return (
    <>
        {isFullScreen ? createPortal(previewCard, document.body) : previewCard}
    </>
  );
});

export default PreviewDisplay;
