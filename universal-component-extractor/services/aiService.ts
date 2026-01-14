import { ExtractedCode } from '../types';
import { formatErrorMessage, isRetryableError, retryWithBackoff } from '../utils/errorHandler';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'ollama';

export type InteractionMode = 'extract' | 'explain' | 'review';

export interface AISettings {
  provider: AIProvider;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
  model: string;
  ollamaUrl?: string;
  // Controls how aggressively the extractor refactors the code
  // - 'minimal': keep structure, fix obvious issues, light cleanup
  // - 'refactor': modernize and simplify more aggressively (default)
  extractionStyle?: 'minimal' | 'refactor';
  // Primary mode of interaction with the code
  // - 'extract': full extraction + refactor (default)
  // - 'explain': emphasize explanation/analysis, lighter transformations
  // - 'review': structured review/feedback, highlight issues and suggestions
  interactionMode?: InteractionMode;
}

// Base prompt template - will be customized per provider
const getBasePrompt = () => `
You are an expert senior frontend engineer and technical educator.
Your task is to analyze any provided web component source code (HTML, JSX, TSX, Vue, Svelte, Vanilla JS, Three.js scripts, p5.js sketches, or JSON data) and "reverse engineer" it into a clean, standalone, and dependency-free version.

**Core Objectives:**
1.  **Identify & Clean:** Recognize the technology used (e.g., React, Three.js, p5.js, pure CSS) and strip away build-step dependencies, proprietary imports, and clutter.
2.  **Recreate for Preview:** Generate a version that runs natively in a browser using local library paths.
3.  **Modernize:** Refactor CSS to use variables and modernize JavaScript (ES6+).
4.  **Explain:** Teach the user how it works.

**Detailed Instructions:**

1.  **Analyze Framework:** Determine if the source is primarily 'react', 'threejs', 'p5.js', 'vanilla', 'vue', or 'svelte'.
    
    **p5.js Detection:** Specifically look for these patterns to identify p5.js code:
    - \`function setup()\` or \`setup = () =>\` - p5.js setup function
    - \`function draw()\` or \`draw = () =>\` - p5.js draw function
    - \`new p5(...)\` - p5.js instance creation
    - \`p.setup\`, \`p.draw\` - p5.js instance mode patterns
    - p5.js-specific functions: \`createCanvas\`, \`background\`, \`rect\`, \`ellipse\`, \`fill\`, \`stroke\`, \`noLoop\`, \`loop\`, etc.
    - If you detect \`setup()\` and/or \`draw()\` functions along with p5.js-specific functions, classify as 'p5.js'.

2.  **Extract/Generate HTML:** 
    - Create the minimal semantic HTML structure required.
    - **Auto-Container:** If the input is just JS/TSX (e.g., a Three.js scene), generate the necessary <canvas> or container <div>.
    - **Library References:** If the code relies on libraries like Three.js, React, ReactDOM, GSAP, p5.js, or Anime.js, you MUST use local library paths (NOT CDNs). For example:
      - Three.js: DO NOT use script tags for Three.js. The preview system automatically loads Three.js as an ES module. Simply use THREE. in your code without any import statements or script tags. OrbitControls will also be loaded automatically if detected.
      - React/ReactDOM: These will be loaded automatically by the preview system, do not include script tags
    - **Cleanliness:** Remove \`<html>\`, \`<body>\`, and all inline \`style="..."\` attributes.

3.  **Extract & Refactor CSS:** 
    - Extract all styling into a single CSS block.
    - **Variables:** You MUST use CSS Variables (:root) for colors, spacing, border-radius, and fonts.
    - **Responsiveness:** Ensure the component is responsive.
    - **Classes:** Replace inline styles with meaningful class names.

4.  **Generate SCSS:** Provide a SCSS version of the CSS using nesting and variables.

5.  **Analyze & Recreate JavaScript (Two Versions):**
    a. **React Component (TSX):** A modern, functional React component.
       - **NO OPTIONAL CHAINING ASSIGNMENT:** Do NOT use optional chaining on the left-hand side of assignments (e.g., \`ref.current?.prop = value\` is INVALID). You MUST use \`if (ref.current) ref.current.prop = value\` instead.
       - **p5.js in React (CRITICAL):** If the input code contains p5.js \`setup()\` and/or \`draw()\` functions, you **MUST** convert them to a React component using \`useEffect\` with p5.js instance mode:
         - **Detection:** If you see \`function setup()\` or \`function draw()\` functions, this is p5.js code that needs React conversion.
         - **Conversion Pattern:** Convert \`setup()\` and \`draw()\` functions into a p5.js instance mode sketch within a \`useEffect\` hook:
           \`\`\`tsx
           const mountRef = useRef<HTMLDivElement>(null);
           
           useEffect(() => {
             if (!mountRef.current) return;
             
             const sketch = (p: p5) => {
               p.setup = () => {
                 // Convert setup() function body here
                 // Example: p.createCanvas(400, 400);
               };
               
               p.draw = () => {
                 // Convert draw() function body here
                 // Example: p.background(220);
               };
             };
             
             const p5Instance = new p5(sketch, mountRef.current);
             
             return () => {
               p5Instance.remove();
             };
           }, []);
           \`\`\`
         - **Important:** 
           - DO NOT use external libraries like \`react-p5\` or \`@p5-wrapper/react\`
           - DO NOT use global mode (defining \`setup\`/\`draw\` as global functions)
           - MUST use instance mode (\`new p5(sketch, element)\`) to work within React lifecycle
           - MUST call \`p5Instance.remove()\` in the cleanup function to prevent memory leaks
           - MUST use a ref (\`mountRef\`) to attach the p5 instance to a DOM element
           - The p5.js library will be automatically loaded by the preview system
         - **Variable Conversion:** Convert global p5.js variables (like \`width\`, \`height\`, \`mouseX\`, \`mouseY\`) to use the instance parameter (e.g., \`p.width\`, \`p.height\`, \`p.mouseX\`, \`p.mouseY\`)
         - **Function Conversion:** Convert p5.js functions to use the instance (e.g., \`createCanvas(400, 400)\` becomes \`p.createCanvas(400, 400)\`)
    
    b. **Vanilla JavaScript (Preview Compatible):**
       - **NO IMPORTS:** This script runs directly in the browser. Do NOT use \`import\` or \`export\`.
       - **Execution Safety:** Wrap your code in \`window.addEventListener('DOMContentLoaded', () => { ... })\` or ensure it waits for libraries to load before running.
       - **Library Globals:** Assume global variables exist from locally loaded libraries (e.g., use \`new THREE.Scene()\` or \`new p5(...)\`). Libraries are loaded from local paths, not CDNs.
       - **p5.js Specifics:** If using p5.js, you **MUST** use **Instance Mode** (e.g., \`new p5(p => { p.setup = ... })\`) to ensure it runs safely within the preview frame without polluting the global scope.
       - **Cleanup:** If the original code imported assets (images/models) that are not available, replace them with placeholders or simple geometric shapes (for 3D) to ensure no runtime errors occur.
       - **Resizing:** If it's a 3D scene or canvas, ensure you add a window 'resize' event listener to handle aspect ratio updates.
       - **3D Export Support (CRITICAL):** If using Three.js, you **MUST** assign the main scene object to the global \`window.scene\` variable (e.g., \`window.scene = scene;\`) at the very end of your script. This allows the extractor to export the scene.

6.  **Educational Explanation:**
    - Write a concise but technical explanation (Markdown supported).
    - Identify the core technique.

7.  **Naming:**
    - Suggest a short, PascalCase name.

8.  **Build Approach:** Recommend the best build tool (Vite, Webpack, Parcel, Rollup) for this component, list required dependencies, and provide configuration tips.

9.  **Code Simplification:** Explain what was simplified, removed dependencies, modernized patterns, and performance optimizations.

10. **Active Code Analysis:** Identify which code sections are actually executed, point out dead code, and explain the execution flow.

11. **How It Works:** Provide a step-by-step explanation of the component's operation, architecture, data flow, and lifecycle.

12. **Editable Sections:** Identify what can be safely edited (styling, text, config), warn about sections requiring caution (event handlers, state), and list customization points.

**OUTPUT FORMAT:**
Do NOT output JSON. You MUST output the content wrapped in the following XML-style tags. Ensure the content inside is raw text/code.

<FRAMEWORK>react|threejs|p5.js|vanilla|vue|svelte</FRAMEWORK>
<COMPONENT_NAME>PascalCaseName</COMPONENT_NAME>
<CODE_HTML>
... html content ...
</CODE_HTML>
<CODE_CSS>
... css content ...
</CODE_CSS>
<CODE_SCSS>
... scss content ...
</CODE_SCSS>
<CODE_TSX>
... react component content ...
</CODE_TSX>
<CODE_VANILLA>
... vanilla js content ...
</CODE_VANILLA>
<EXPLANATION>
... markdown explanation ...
</EXPLANATION>
<BUILD_APPROACH>
... build tool recommendations, dependencies, configuration ...
</BUILD_APPROACH>
<CODE_SIMPLIFICATION>
... what was simplified, removed, modernized ...
</CODE_SIMPLIFICATION>
<ACTIVE_CODE>
... active code analysis, execution flow ...
</ACTIVE_CODE>
<HOW_IT_WORKS>
... step-by-step explanation, architecture, data flow ...
</HOW_IT_WORKS>
<EDITABLE_SECTIONS>
... what can be edited safely, warnings, customization points ...
</EDITABLE_SECTIONS>
`;

// Provider-specific prompt customizations
const getGeminiPrompt = () => getBasePrompt();

const getStyleGuidance = (style: 'minimal' | 'refactor' = 'refactor') => {
  if (style === 'minimal') {
    return `**Extraction Style: Minimal**\n\n- Preserve the original structure and naming where reasonable.\n- Fix obvious bugs and missing pieces required to run in the preview.\n- Avoid large rewrites or heavy abstraction; make only necessary, focused improvements.`;
  }
  return `**Extraction Style: Refactor (default)**\n\n- Feel free to modernize and simplify the code significantly.\n- Prefer idiomatic React hooks, modern JavaScript, and CSS variables.\n- Remove dead code and unnecessary abstractions to produce a clean, teachable result.`;
};

const getModeGuidance = (mode: InteractionMode = 'extract') => {
  switch (mode) {
    case 'explain':
      return `**Interaction Mode: Explain**\n\n- Focus on explaining what the code does, its structure, and key behaviors.\n- Prioritize clear, didactic EXPLANATION, HOW_IT_WORKS, and ACTIVE_CODE sections.\n- Make only light, necessary code changes to keep the original behavior.`;
    case 'review':
      return `**Interaction Mode: Review**\n\n- Act as a senior reviewer: identify risks, code smells, and improvement opportunities.\n- Emphasize BUILD_APPROACH, CODE_SIMPLIFICATION, and EDITABLE_SECTIONS with concrete suggestions.\n- You may propose refactors, but keep the original intent clear and explain trade-offs.`;
    case 'extract':
    default:
      return `**Interaction Mode: Extract (default)**\n\n- Perform a full extraction and refactor suitable for reuse and preview.\n- Balance code quality with fidelity to the original behavior.`;
  }
};

const getOpenAIPrompt = () => getBasePrompt() + `
**Important for OpenAI models:**
- Be precise and follow the output format exactly.
- Ensure all code blocks are complete and functional.
- Pay special attention to the XML tag structure - do not include any text outside the tags.
`;

const getAnthropicPrompt = () => getBasePrompt() + `
**Important for Claude models:**
- Follow the XML tag structure precisely.
- Ensure all code is production-ready and well-formatted.
- Be thorough in your analysis sections.
`;

const getOllamaPrompt = () => getBasePrompt() + `
**Important for Ollama models:**
- Output the XML tags in order as specified.
- Keep code examples clear and well-commented.
- Focus on generating complete, working code.
`;

const getModelGuidance = (provider: AIProvider, model: string): string => {
  const m = model.toLowerCase();
  switch (provider) {
    case 'gemini': {
      // Newer 3.x / 2.5 models first
      if (m.includes('3-pro')) {
        return `**Model: Gemini 3 Pro**\n- You can lean into deep reasoning and long-context analysis.\n- Still keep outputs focused on the requested tags and avoid unnecessary rambling.`;
      }
      if (m.includes('2.5-pro')) {
        return `**Model: Gemini 2.5 Pro**\n- Prefer higher-quality explanations and careful refactors over sheer speed.`;
      }
      if (m.includes('2.5-flash-lite')) {
        return `**Model: Gemini 2.5 Flash Lite**\n- Prioritize speed and brevity; keep explanations compact and code-first.`;
      }
      if (m.includes('2.5-flash')) {
        return `**Model: Gemini 2.5 Flash**\n- Balance speed with quality; keep explanations focused and avoid verbosity.`;
      }
      if (m.includes('flash')) {
        return `**Model: Gemini Flash**\n- Prioritize speed and concise outputs.\n- Keep explanations focused and avoid unnecessary verbosity.`;
      }
      if (m.includes('pro')) {
        return `**Model: Gemini Pro**\n- You can provide more detailed explanations and nuanced recommendations.`;
      }
      return '';
    }
    case 'openai': {
      if (m.includes('gpt-5.1')) {
        return `**Model: GPT-5.1**\n- Use strong, stepwise reasoning where helpful, but keep the final answer tight and code-centric.\n- Avoid over-explaining trivial details; focus depth on tricky parts of the component.`;
      }
      if (m.includes('gpt-5-mini')) {
        return `**Model: GPT-5 Mini**\n- Optimize for speed and cost; keep explanations short and emphasize concrete code changes.`;
      }
      if (m.includes('gpt-4.1')) {
        return `**Model: GPT-4.1 family**\n- Provide solid reasoning with moderate verbosity.\n- Prefer direct, actionable suggestions over long narratives.`;
      }
      if (m.includes('gpt-4o')) {
        return `**Model: GPT-4o**\n- Use strong reasoning and provide rich explanations where helpful.`;
      }
      if (m.includes('gpt-3.5')) {
        return `**Model: GPT-3.5**\n- Keep responses efficient and avoid overly long analysis sections.`;
      }
      return '';
    }
    case 'anthropic': {
      if (m.includes('opus-4')) {
        return `**Model: Claude 4 Opus**\n- You can offer deep, thorough analysis, but keep code samples tight and practical.`;
      }
      if (m.includes('sonnet-4')) {
        return `**Model: Claude 4 Sonnet**\n- Balance depth and speed; focus on clear structure and practical recommendations.`;
      }
      if (m.includes('3.7-sonnet')) {
        return `**Model: Claude 3.7 Sonnet**\n- Provide well-structured explanations without excessive length.`;
      }
      if (m.includes('3.5-haiku')) {
        return `**Model: Claude 3.5 Haiku**\n- Favor brevity and clarity; keep feedback concise and code-focused.`;
      }
      if (m.includes('3.5-sonnet')) {
        return `**Model: Claude 3.5 Sonnet**\n- Provide balanced analysis: detailed where needed, concise elsewhere.`;
      }
      if (m.includes('opus')) {
        return `**Model: Claude Opus**\n- Offer deep, thorough analysis, but keep code samples tight and practical.`;
      }
      if (m.includes('haiku')) {
        return `**Model: Claude Haiku**\n- Favor brevity and clarity over exhaustive detail.`;
      }
      return '';
    }
    case 'ollama': {
      if (m.includes('llama3')) {
        return `**Model: Llama 3**\n- Balance explanation with code; avoid extremely long narrative sections.`;
      }
      if (m.includes('codellama')) {
        return `**Model: Code Llama**\n- Focus on code quality and clear comments; keep prose concise.`;
      }
      if (m.includes('phi4')) {
        return `**Model: Phi-4**\n- Emphasize compact, efficient solutions and minimal boilerplate.`;
      }
      if (m.includes('gemma')) {
        return `**Model: Gemma**\n- Favor readable, well-organized code and modest explanation length.`;
      }
      return '';
    }
    default:
      return '';
  }
};

// Gemini Provider
async function extractWithGemini(
  sourceCode: string,
  apiKey: string,
  model: string,
  extractionStyle: 'minimal' | 'refactor' = 'refactor',
  interactionMode: InteractionMode = 'extract',
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const effectiveModel = model || 'gemini-2.5-flash';
  const prompt = getGeminiPrompt();
  const styleGuidance = getStyleGuidance(extractionStyle);
  const modeGuidance = getModeGuidance(interactionMode);
  const modelGuidance = getModelGuidance('gemini', effectiveModel);
  const fullPrompt = `${prompt}\n\n${styleGuidance}\n\n${modeGuidance}${modelGuidance ? `\n\n${modelGuidance}` : ''}\n\n**Input Source Code:**\n---\n${sourceCode}\n---`;

  const resultStream = await ai.models.generateContentStream({
    model: effectiveModel,
    contents: fullPrompt,
  });

  // Wrap stream to check abort signal
  const abortableStream = {
    async *[Symbol.asyncIterator]() {
      try {
        for await (const chunk of resultStream) {
          if (abortSignal?.aborted) {
            throw new Error('Extraction aborted');
          }
          yield chunk;
        }
      } catch (error: any) {
        if (abortSignal?.aborted) {
          throw new Error('Extraction aborted');
        }
        throw error;
      }
    },
  };

  return processStream(abortableStream, abortSignal, onProgress);
}

// OpenAI Provider
async function extractWithOpenAI(
  sourceCode: string,
  apiKey: string,
  model: string,
  extractionStyle: 'minimal' | 'refactor' = 'refactor',
  interactionMode: InteractionMode = 'extract',
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const prompt = getOpenAIPrompt();
  const styleGuidance = getStyleGuidance(extractionStyle);
  const modeGuidance = getModeGuidance(interactionMode);
  const modelGuidance = getModelGuidance('openai', model);
  const fullPrompt = `${prompt}\n\n${styleGuidance}\n\n${modeGuidance}${modelGuidance ? `\n\n${modelGuidance}` : ''}\n\n**Input Source Code:**\n---\n${sourceCode}\n---`;

  const stream = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [{ role: 'user', content: fullPrompt }],
    stream: true,
  }, {
    signal: abortSignal,
  });

  const textStream = {
    async *[Symbol.asyncIterator]() {
      try {
        for await (const chunk of stream) {
          if (abortSignal?.aborted) {
            throw new Error('Extraction aborted');
          }
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            yield { text: content };
          }
        }
      } catch (error: any) {
        if (abortSignal?.aborted) {
          throw new Error('Extraction aborted');
        }
        throw error;
      }
    },
  };

  return processStream(textStream, abortSignal, onProgress);
}

// Anthropic Provider
async function extractWithAnthropic(
  sourceCode: string,
  apiKey: string,
  model: string,
  extractionStyle: 'minimal' | 'refactor' = 'refactor',
  interactionMode: InteractionMode = 'extract',
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey });

  const prompt = getAnthropicPrompt();
  const styleGuidance = getStyleGuidance(extractionStyle);
  const modeGuidance = getModeGuidance(interactionMode);
  const modelGuidance = getModelGuidance('anthropic', model);
  const fullPrompt = `${prompt}\n\n${styleGuidance}\n\n${modeGuidance}${modelGuidance ? `\n\n${modelGuidance}` : ''}\n\n**Input Source Code:**\n---\n${sourceCode}\n---`;

  const stream = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: fullPrompt }],
    stream: true,
  });

  const textStream = {
    async *[Symbol.asyncIterator]() {
      try {
        for await (const chunk of stream) {
          if (abortSignal?.aborted) {
            throw new Error('Extraction aborted');
          }
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            yield { text: chunk.delta.text };
          }
        }
      } catch (error: any) {
        if (abortSignal?.aborted) {
          throw new Error('Extraction aborted');
        }
        throw error;
      }
    },
  };

  return processStream(textStream, abortSignal, onProgress);
}

// Ollama Provider (Local)
async function extractWithOllama(
  sourceCode: string,
  model: string,
  ollamaUrl: string,
  extractionStyle: 'minimal' | 'refactor' = 'refactor',
  interactionMode: InteractionMode = 'extract',
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const prompt = getOllamaPrompt();
  const styleGuidance = getStyleGuidance(extractionStyle);
  const modeGuidance = getModeGuidance(interactionMode);
  const modelGuidance = getModelGuidance('ollama', model);
  const fullPrompt = `${prompt}\n\n${styleGuidance}\n\n${modeGuidance}${modelGuidance ? `\n\n${modelGuidance}` : ''}\n\n**Input Source Code:**\n---\n${sourceCode}\n---`;

  // Retry with backoff for network errors
  let response: Response;
  try {
    response = await retryWithBackoff(
      async () => {
        const res = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'llama3.2',
            prompt: fullPrompt,
            stream: true,
          }),
          signal: abortSignal,
        });

        if (!res.ok) {
          throw new Error(`Ollama error: ${res.statusText}. Make sure Ollama is running and the model is installed.`);
        }

        return res;
      },
      {
        maxRetries: 2,
        retryDelay: 1000,
        shouldRetry: (error) => {
          const errorStr = String(error).toLowerCase();
          return errorStr.includes('network') || errorStr.includes('fetch') || errorStr.includes('failed');
        },
      }
    );
  } catch (error) {
    // If retry fails, throw with user-friendly message
    throw new Error(`Ollama error: ${error instanceof Error ? error.message : 'Connection failed'}. Make sure Ollama is running and the model is installed.`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  const textStream = {
    async *[Symbol.asyncIterator]() {
      if (!reader) return;
      try {
        while (true) {
          if (abortSignal?.aborted) {
            reader.cancel();
            throw new Error('Extraction aborted');
          }
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                yield { text: parsed.response };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } catch (error: any) {
        if (abortSignal?.aborted) {
          throw new Error('Extraction aborted');
        }
        throw error;
      }
    },
  };

  return processStream(textStream, abortSignal, onProgress);
}

// Stream processing helper
async function processStream(
  stream: AsyncIterable<{ text: string }>,
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const currentData: ExtractedCode = {
    html: '',
    css: '',
    scss: '',
    tsx: '',
    vanillaJs: '',
    explanation: '',
    componentName: 'MyComponent',
    framework: 'vanilla',
    buildApproach: '',
    codeSimplification: '',
    activeCode: '',
    howItWorks: '',
    editableSections: '',
  };

  let buffer = '';

  try {
    for await (const chunk of stream) {
      if (abortSignal?.aborted) {
        throw new Error('Extraction aborted');
      }
      
      const text = chunk.text;
      if (text) {
        buffer += text;
      }

    const extractTag = (tag: string, key: keyof ExtractedCode) => {
      // Match opening tag, content, and closing tag
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 's');
      const match = buffer.match(regex);
      if (match && match[1]) {
        let newValue = match[1].trim();
        
        // Remove any stray closing tags that might have been included
        newValue = newValue.replace(new RegExp(`<\/?${tag}>`, 'gi'), '');
        // Remove any other stray XML tags
        newValue = newValue.replace(/<\/?(CODE_HTML|CODE_CSS|CODE_SCSS|CODE_TSX|CODE_VANILLA|FRAMEWORK|COMPONENT_NAME|EXPLANATION|BUILD_APPROACH|CODE_SIMPLIFICATION|ACTIVE_CODE|HOW_IT_WORKS|EDITABLE_SECTIONS)>/gi, '');
        
        // Only update if we got more content
        if (newValue.length > (currentData[key] || '').length) {
          // @ts-ignore - dynamic assignment
          currentData[key] = newValue;
        }
      }
    };

    extractTag('FRAMEWORK', 'framework');
    extractTag('COMPONENT_NAME', 'componentName');
    extractTag('CODE_HTML', 'html');
    extractTag('CODE_CSS', 'css');
    extractTag('CODE_SCSS', 'scss');
    extractTag('CODE_TSX', 'tsx');
    extractTag('CODE_VANILLA', 'vanillaJs');
    extractTag('EXPLANATION', 'explanation');
    extractTag('BUILD_APPROACH', 'buildApproach');
    extractTag('CODE_SIMPLIFICATION', 'codeSimplification');
    extractTag('ACTIVE_CODE', 'activeCode');
    extractTag('HOW_IT_WORKS', 'howItWorks');
      extractTag('EDITABLE_SECTIONS', 'editableSections');

      if (onProgress) {
        onProgress({ ...currentData });
      }
    }
  } catch (error: any) {
    if (abortSignal?.aborted || error?.message === 'Extraction aborted') {
      throw new Error('Extraction aborted');
    }
    throw error;
  }

  return currentData;
}

// Main export function
export async function extractComponentFromHtml(
  sourceCode: string,
  settings: AISettings,
  abortSignal?: AbortSignal,
  onProgress?: (partial: Partial<ExtractedCode>) => void
): Promise<ExtractedCode> {
  const extractionStyle: 'minimal' | 'refactor' = settings.extractionStyle || 'refactor';
  const interactionMode: InteractionMode = settings.interactionMode || 'extract';
  try {
    // Check if already aborted
    if (abortSignal?.aborted) {
      throw new Error('Extraction aborted');
    }

    switch (settings.provider) {
      case 'gemini':
        if (!settings.apiKeys.gemini) {
          throw new Error('Gemini API key is required');
        }
        return await extractWithGemini(
          sourceCode,
          settings.apiKeys.gemini,
          settings.model,
          extractionStyle,
          interactionMode,
          abortSignal,
          onProgress
        );

      case 'openai':
        if (!settings.apiKeys.openai) {
          throw new Error('OpenAI API key is required');
        }
        return await extractWithOpenAI(
          sourceCode,
          settings.apiKeys.openai,
          settings.model,
          extractionStyle,
          interactionMode,
          abortSignal,
          onProgress
        );

      case 'anthropic':
        if (!settings.apiKeys.anthropic) {
          throw new Error('Anthropic API key is required');
        }
        return await extractWithAnthropic(
          sourceCode,
          settings.apiKeys.anthropic,
          settings.model,
          extractionStyle,
          interactionMode,
          abortSignal,
          onProgress
        );

      case 'ollama':
        return await extractWithOllama(
          sourceCode,
          settings.model,
          settings.ollamaUrl || 'http://localhost:11434',
          extractionStyle,
          interactionMode,
          abortSignal,
          onProgress
        );

      default:
        throw new Error(`Unknown provider: ${settings.provider}`);
    }
  } catch (error: any) {
    console.error(`Error calling ${settings.provider} API:`, error);
    
    // Use centralized error formatting
    const errorMessage = formatErrorMessage(error);
    throw new Error(errorMessage);
  }
}

