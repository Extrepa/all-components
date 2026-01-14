import { ExtractedCode } from '../types';

/**
 * Ensure required local libraries (like p5.js) are present in the HTML fragment.
 * Currently only injects p5.js with a local path + CDN fallback.
 */
export const ensureCdns = (html: string, jsCode: string): string => {
  let updatedHtml = html;

  const addLocalWithFallback = (localPath: string, cdnPath: string) => (
    `<script src="${localPath}" onerror="this.onerror=null;this.src='${cdnPath}'"></script>\n`
  );

  // Prefer local libraries, fall back to CDN only if the local path fails to load
  if ((jsCode.includes('new p5') || jsCode.includes('createCanvas')) && !updatedHtml.includes('p5.min.js')) {
    updatedHtml = addLocalWithFallback(
      '/libs/p5/p5.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js'
    ) + updatedHtml;
  }

  // Three.js is now loaded via ES modules in PreviewDisplay - no script tag needed
  return updatedHtml;
};

export type ExportFileMap = Record<string, string>;

/**
 * Build the file set for a full project ZIP (current default behavior).
 */
export const buildFullProjectFiles = (extracted: ExtractedCode, safeName: string): ExportFileMap => {
  const files: ExportFileMap = {};

  if (extracted.isCompleteHtml && extracted.html.trim()) {
    // Update title in the complete HTML document
    const htmlWithTitle = extracted.html.replace(/<title>.*?<\/title>/i, `<title>${safeName}</title>`);
    files['index.html'] = htmlWithTitle;
    files[`${safeName}.css`] = extracted.css || '';
    files[`${safeName}.scss`] = extracted.scss || '';
    files[`${safeName}.tsx`] = extracted.tsx || '';
    files[`${safeName}.js`] = extracted.vanillaJs || '';
    files['README.md'] = extracted.explanation || '';
    return files;
  }

  const finalHtmlFragment = ensureCdns(extracted.html, extracted.vanillaJs);

  const runnableHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <link rel="stylesheet" href="./${safeName}.css">
</head>
<body>
    ${finalHtmlFragment}
    <script src="./${safeName}.js"></script>
</body>
</html>`;

  files['index.html'] = runnableHtml;
  files[`${safeName}.css`] = extracted.css;
  files[`${safeName}.scss`] = extracted.scss;
  files[`${safeName}.tsx`] = extracted.tsx;
  files[`${safeName}.js`] = extracted.vanillaJs;
  files['README.md'] = extracted.explanation;

  return files;
};

/**
 * Build a minimal React component preset (.tsx + .css + README).
 */
export const buildReactComponentPresetFiles = (extracted: ExtractedCode, safeName: string): ExportFileMap => {
  const files: ExportFileMap = {};
  const tsx = extracted.tsx?.trim();

  if (!tsx) {
    // Fallback: no TSX available, leave map empty and let caller decide how to handle
    return files;
  }

  files[`${safeName}.tsx`] = tsx;
  if (extracted.css?.trim()) {
    files[`${safeName}.css`] = extracted.css;
  }
  files['README.md'] = extracted.explanation || `React component preset generated for ${safeName}.`;
  return files;
};

/**
 * Build a vanilla widget preset: index.html + JS + CSS (no SCSS or TSX).
 */
export const buildVanillaWidgetPresetFiles = (extracted: ExtractedCode, safeName: string): ExportFileMap => {
  const files: ExportFileMap = {};

  const finalHtmlFragment = ensureCdns(extracted.html, extracted.vanillaJs);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <link rel="stylesheet" href="./${safeName}.css">
</head>
<body>
    ${finalHtmlFragment}
    <script src="./${safeName}.js"></script>
</body>
</html>`;

  files['index.html'] = indexHtml;
  files[`${safeName}.css`] = extracted.css || '';
  files[`${safeName}.js`] = extracted.vanillaJs || '';
  files['README.md'] = extracted.explanation || `Vanilla widget preset generated for ${safeName}.`;

  return files;
};

/**
 * Build a Vite React preset: src/components/*.tsx + *.css + README.
 */
export const buildViteReactPresetFiles = (extracted: ExtractedCode, safeName: string): ExportFileMap => {
  const files: ExportFileMap = {};
  const tsx = extracted.tsx?.trim();

  if (!tsx) {
    return files;
  }

  const componentFileName = `${safeName}.tsx`;
  const cssFileName = extracted.css?.trim() ? `${safeName}.css` : null;

  files[`src/components/${componentFileName}`] = tsx;
  if (cssFileName) {
    files[`src/components/${cssFileName}`] = extracted.css!;
  }

  const componentName = safeName || 'MyComponent';
  const usageSnippet = `// Example usage in src/App.tsx
import React from 'react';
import { ${componentName} } from './components/${componentName}';
${cssFileName ? `import './components/${componentName}.css';
` : ''}export function App() {
  return <${componentName} />;
}
`;

  files['README.md'] =
    extracted.explanation ||
    `Vite React preset generated for ${componentName}.

Files:
- src/components/${componentFileName}${cssFileName ? `
- src/components/${cssFileName}` : ''}

You can import and render the component from your Vite React app. Example:

${usageSnippet}`;

  return files;
};

/**
 * Build a Next.js preset: components/*.tsx + components/*.module.css + README.
 */
export const buildNextJsPresetFiles = (extracted: ExtractedCode, safeName: string): ExportFileMap => {
  const files: ExportFileMap = {};
  const tsx = extracted.tsx?.trim();

  if (!tsx) {
    return files;
  }

  const componentFileName = `${safeName}.tsx`;
  const cssFileName = extracted.css?.trim() ? `${safeName}.module.css` : null;

  files[`components/${componentFileName}`] = tsx;
  if (cssFileName) {
    files[`components/${cssFileName}`] = extracted.css!;
  }

  const componentName = safeName || 'MyComponent';
  const usageSnippet = `// Example usage in a Next.js page (app router)
import React from 'react';
import { ${componentName} } from '../components/${componentName}';
${cssFileName ? `import '../components/${componentName}.module.css';
` : ''}export default function Page() {
  return <${componentName} />;
}
`;

  files['README.md'] =
    extracted.explanation ||
    `Next.js preset generated for ${componentName}.

Files:
- components/${componentFileName}${cssFileName ? `
- components/${cssFileName}` : ''}

You can import and render the component from your Next.js app. Example (app router):

${usageSnippet}`;

  return files;
};
