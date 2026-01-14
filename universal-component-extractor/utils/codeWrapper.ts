/**
 * Code Wrapper Utilities
 * Wrap Three.js/p5.js code in HTML for preview (user-initiated only)
 */

export interface WrappingAnalysis {
  needsWrapping: boolean;
  reason: string;
  suggestedWrapper?: 'threejs' | 'p5js' | 'html';
  explanation: string;
  canWrap: boolean;
}

/**
 * Detect if code is Three.js code
 * Must be actual JavaScript code, not CSS or HTML that mentions these words
 */
export function isThreeJsCode(code: string): boolean {
  const lower = code.toLowerCase();
  
  // Strong Three.js indicators - must be JavaScript context
  const hasThreeJsNamespace = lower.includes('three.') || lower.includes('three[') ||
                               lower.includes('new three.') || lower.includes('three/');
  const hasWebGLRenderer = lower.includes('webglrenderer') || lower.includes('webgl_renderer') ||
                           lower.includes('new webglrenderer');
  const hasOrbitControls = lower.includes('orbitcontrols') && 
                           (lower.includes('new') || lower.includes('import') || lower.includes('const'));
  
  // Medium indicators - but must be in JavaScript context (not CSS)
  const hasSceneCameraRenderer = (
    (lower.includes('scene') || lower.includes('camera') || lower.includes('renderer')) &&
    (lower.includes('new') || lower.includes('const') || lower.includes('let') || lower.includes('var') ||
     lower.includes('function') || lower.includes('=>') || lower.includes('three.'))
  );
  
  // Must have JavaScript context, not just CSS class names
  const hasJavaScriptContext = lower.includes('function') || lower.includes('const ') || 
                               lower.includes('let ') || lower.includes('var ') ||
                               lower.includes('<script') || lower.includes('three.') ||
                               lower.includes('new') || lower.includes('=>');
  
  // Avoid false positives from CSS
  const isLikelyCSS = lower.includes('<style') && 
                     (lower.includes('color:') || lower.includes('background:') || 
                      lower.includes('margin:') || lower.includes('padding:'));
  
  if (isLikelyCSS && !hasThreeJsNamespace && !hasWebGLRenderer) {
    return false; // It's CSS, not Three.js
  }
  
  return hasThreeJsNamespace || hasWebGLRenderer || hasOrbitControls || 
         (hasSceneCameraRenderer && hasJavaScriptContext);
}

/**
 * Detect if code is p5.js code
 */
export function isP5JsCode(code: string): boolean {
  const lower = code.toLowerCase();
  return (
    lower.includes('function setup') ||
    lower.includes('function draw') ||
    lower.includes('p5.') ||
    lower.includes('createcanvas') ||
    lower.includes('background(') ||
    lower.includes('fill(') ||
    lower.includes('ellipse(') ||
    lower.includes('rect(')
  );
}

/**
 * Detect if code is JSON
 */
export function isJsonCode(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;
  
  // Check if it starts and ends with JSON-like brackets/braces
  const startsWithJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const endsWithJson = trimmed.endsWith('}') || trimmed.endsWith(']');
  
  if (!startsWithJson || !endsWithJson) return false;
  
  // Try to parse it as JSON
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Wrap Three.js code in HTML for preview
 */
export function wrapThreeJsCode(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Preview</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #000;
        }
        #container {
            width: 100%;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <script src="/libs/three/three.min.js"></script>
    <script src="/libs/three/OrbitControls.js"></script>
    <script>
        // Auto-detect container
        const container = document.getElementById('container');
        
        ${code}
    </script>
</body>
</html>`;
}

/**
 * Wrap p5.js code in HTML for preview
 */
export function wrapP5JsCode(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>p5.js Preview</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a1a;
        }
    </style>
</head>
<body>
    <script src="/libs/p5/p5.min.js"></script>
    <script>
        ${code}
    </script>
</body>
</html>`;
}

/**
 * Wrap JSON code in HTML for preview
 */
export function wrapJsonCode(code: string): string {
  // Escape the JSON for use in HTML/JavaScript
  const escapedJson = code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Preview</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #1a1a1a;
            color: #e5e5e5;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            margin: 0 0 1rem 0;
            color: #60a5fa;
            font-size: 1.5rem;
        }
        pre {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 1.5rem;
            overflow: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
            color: #e2e8f0;
        }
        .json-key {
            color: #7dd3fc;
        }
        .json-string {
            color: #86efac;
        }
        .json-number {
            color: #fbbf24;
        }
        .json-boolean {
            color: #f472b6;
        }
        .json-null {
            color: #a78bfa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JSON Preview</h1>
        <pre id="json-display"></pre>
    </div>
    <script>
        (function() {
            try {
                const jsonString = \`${escapedJson}\`;
                const jsonData = JSON.parse(jsonString);
                const formatted = JSON.stringify(jsonData, null, 2);
                
                // Simple syntax highlighting
                const highlighted = formatted
                    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function(match) {
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                return '<span class="json-key">' + match + '</span>';
                            }
                            return '<span class="json-string">' + match + '</span>';
                        } else if (/true|false/.test(match)) {
                            return '<span class="json-boolean">' + match + '</span>';
                        } else if (/null/.test(match)) {
                            return '<span class="json-null">' + match + '</span>';
                        } else if (/^-?\\d/.test(match)) {
                            return '<span class="json-number">' + match + '</span>';
                        }
                        return match;
                    });
                
                document.getElementById('json-display').innerHTML = highlighted;
            } catch (error) {
                document.getElementById('json-display').textContent = 'Error parsing JSON: ' + error.message + '\\n\\n' + \`${escapedJson}\`;
                document.getElementById('json-display').style.color = '#ef4444';
            }
        })();
    </script>
</body>
</html>`;
}

/**
 * Analyze if code needs wrapping and why
 * This helps users understand when and why wrapping is necessary
 */
export function analyzeWrappingNeeds(code: string): WrappingAnalysis {
  if (!code || !code.trim()) {
    return {
      needsWrapping: false,
      reason: 'No code provided',
      explanation: 'Please paste code to analyze wrapping needs.',
      canWrap: false
    };
  }

  const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<body');
  const isThreeJs = isThreeJsCode(code);
  const isP5Js = isP5JsCode(code);

  // Three.js code analysis
  if (isThreeJs) {
    if (!hasHtmlStructure) {
      return {
        needsWrapping: true,
        reason: 'Three.js code fragment needs HTML structure',
        suggestedWrapper: 'threejs',
        explanation: 'Three.js code requires an HTML page with a container element and the Three.js library loaded. Wrapping will add the necessary HTML structure, container div, and script tags to load Three.js and OrbitControls (if needed).',
        canWrap: true
      };
    } else {
      return {
        needsWrapping: false,
        reason: 'Code already has HTML structure',
        explanation: 'Your Three.js code appears to be in a complete HTML document. It can be previewed as-is, but make sure the Three.js library is loaded.',
        canWrap: false
      };
    }
  }

  // p5.js code analysis
  if (isP5Js) {
    if (!hasHtmlStructure) {
      return {
        needsWrapping: true,
        reason: 'p5.js code needs HTML structure and library',
        suggestedWrapper: 'p5js',
        explanation: 'p5.js code requires an HTML page with the p5.js library loaded. Wrapping will add the necessary HTML structure and script tag to load p5.js. Your setup() and draw() functions will work automatically in global mode.',
        canWrap: true
      };
    } else {
      return {
        needsWrapping: false,
        reason: 'Code already has HTML structure',
        explanation: 'Your p5.js code appears to be in a complete HTML document. It can be previewed as-is, but make sure the p5.js library is loaded.',
        canWrap: false
      };
    }
  }

  // Vanilla JS with DOM manipulation
  const hasDomManipulation = code.includes('document.') || 
                             code.includes('getElementById') || 
                             code.includes('querySelector') ||
                             code.includes('addEventListener');
  
  if (hasDomManipulation && !hasHtmlStructure) {
    return {
      needsWrapping: true,
      reason: 'JavaScript manipulates DOM but has no HTML structure',
      suggestedWrapper: 'html',
      explanation: 'Your JavaScript code references DOM elements (like document.getElementById) but there\'s no HTML structure. Wrapping will add a basic HTML page with a container element that your code can manipulate.',
      canWrap: true
    };
  }

  // Default: no wrapping needed
  return {
    needsWrapping: false,
    reason: 'Code appears complete or doesn\'t require wrapping',
    explanation: 'Your code can be previewed without additional wrapping. If you\'re having issues, try the Extract feature for AI-powered analysis.',
    canWrap: false
  };
}

/**
 * Wrap code based on type (explicit user action)
 * Returns wrapped code and type information
 */
export function wrapCode(code: string, wrapperType?: 'threejs' | 'p5js' | 'html' | 'json'): { wrapped: string; type: 'threejs' | 'p5js' | 'html' | 'json' | 'none' } {
  // If wrapper type is specified, use it
  if (wrapperType === 'threejs') {
    return {
      wrapped: wrapThreeJsCode(code),
      type: 'threejs'
    };
  }
  
  if (wrapperType === 'p5js') {
    return {
      wrapped: wrapP5JsCode(code),
      type: 'p5js'
    };
  }
  
  if (wrapperType === 'json') {
    return {
      wrapped: wrapJsonCode(code),
      type: 'json'
    };
  }

  // Auto-detect if no type specified
  if (isThreeJsCode(code)) {
    return {
      wrapped: wrapThreeJsCode(code),
      type: 'threejs'
    };
  }
  
  if (isP5JsCode(code)) {
    return {
      wrapped: wrapP5JsCode(code),
      type: 'p5js'
    };
  }
  
  if (isJsonCode(code)) {
    return {
      wrapped: wrapJsonCode(code),
      type: 'json'
    };
  }
  
  // No wrapping needed
  return {
    wrapped: code,
    type: 'none'
  };
}

