/**
 * Code Analyzer Utility
 * Analyzes pasted code to identify type, completeness, errors, and wrapping needs
 */

import { isThreeJsCode, isP5JsCode } from './codeWrapper';

export type CodeType = 
  | 'html' 
  | 'react' 
  | 'threejs' 
  | 'p5js' 
  | 'vanilla' 
  | 'css' 
  | 'json' 
  | 'svg'
  | 'mixed' 
  | 'unknown';

export type CompletenessStatus = 'complete' | 'fragment' | 'snippet' | 'unknown';

export interface CodeError {
  type: 'syntax' | 'missing-dependency' | 'incomplete' | 'warning';
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

export interface WrappingNeeds {
  needsWrapping: boolean;
  reason: string;
  suggestedWrapper?: 'threejs' | 'p5js' | 'html';
  explanation: string;
}

export interface CodeAnalysis {
  codeType: CodeType;
  completeness: CompletenessStatus;
  errors: CodeError[];
  warnings: CodeError[];
  wrappingNeeds: WrappingNeeds;
  suggestedPreviewMode: 'vanilla' | 'react' | 'browser' | 'canvas';
  recommendations: string[];
  canPreviewAsIs: boolean;
  canExtract: boolean;
  detectedDependencies: string[];
  hasHtmlStructure: boolean;
  hasCss: boolean;
  hasJavaScript: boolean;
}

/**
 * Analyze code to determine its type
 */
function detectCodeType(code: string): CodeType {
  const lower = code.toLowerCase().trim();
  
  // Check for React/TSX
  // Strong indicators: import statements or React hooks
  const hasReactImport = lower.includes('import react') || lower.includes('from react');
  const hasReactHooks = lower.includes('usestate') || lower.includes('useeffect') ||
                        lower.includes('useref') || lower.includes('usememo');
  
  // If we have strong React indicators, it's React
  if (hasReactImport || hasReactHooks) {
    return 'react';
  }
  
  // Weaker indicators: JSX patterns in function/const declarations
  if ((lower.includes('function') && lower.includes('jsx') && lower.includes('return')) ||
      (lower.includes('const') && lower.includes('=') && lower.includes('jsx'))) {
    // Make sure it's actually React, not just mentioning it
    if (lower.includes('function') && (lower.includes('jsx') || lower.includes('return <'))) {
      return 'react';
    }
    if (lower.includes('export default') && (lower.includes('jsx') || lower.includes('return <'))) {
      return 'react';
    }
  }
  
  // Check for HTML structure FIRST (before Three.js to avoid false positives)
  // HTML/CSS can contain words like "scene", "camera" in class names or content
  const hasHtmlTags = lower.includes('<html') || lower.includes('<!doctype') || 
                      lower.includes('<div') || lower.includes('<span') ||
                      lower.includes('<button') || lower.includes('<p>') ||
                      lower.includes('<h1') || lower.includes('<h2') ||
                      lower.includes('<body') || lower.includes('<head');
  
  const hasStyleTags = lower.includes('<style');
  const hasCssInStyle = hasStyleTags && (
    lower.includes('color:') || lower.includes('background:') || 
    lower.includes('margin:') || lower.includes('padding:') || lower.includes('font-')
  );
  
  // If it has HTML tags or style tags, check for mixed HTML/CSS/JS
  if (hasHtmlTags || hasStyleTags) {
    // Check if it's mixed (HTML + JS/CSS)
    const hasScript = lower.includes('<script') || 
                     (lower.includes('function') && !hasStyleTags) || 
                     lower.includes('const ') || lower.includes('let ');
    
    if (hasScript || hasStyleTags || hasCssInStyle) {
      return 'mixed';
    }
    return 'html';
  }
  
  // Check for CSS (standalone, no HTML tags)
  if (lower.includes('{') && (lower.includes('color:') || lower.includes('background:') || 
      lower.includes('margin:') || lower.includes('padding:') || lower.includes('font-'))) {
    if (!lower.includes('function') && !lower.includes('const') && !lower.includes('let') && !hasHtmlTags) {
      return 'css';
    }
  }
  
  // Check for SVG
  if (lower.includes('<svg') || lower.includes('svg xmlns') || 
      (lower.includes('viewbox') && (lower.includes('<path') || lower.includes('<circle') || lower.includes('<rect')))) {
    return 'svg';
  }
  
  // Check for JSON
  if (code.trim().startsWith('{') && code.trim().endsWith('}')) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue
    }
  }
  
  // Check for Three.js (AFTER HTML/CSS to avoid false positives from CSS class names)
  if (isThreeJsCode(code)) {
    return 'threejs';
  }
  
  // Check for p5.js
  if (isP5JsCode(code)) {
    return 'p5js';
  }
  
  // Check for shader code (GLSL)
  if (lower.includes('glsl') || lower.includes('shader') || 
      lower.includes('vertexshader') || lower.includes('fragmentshader') ||
      lower.includes('shadermaterial') || (lower.includes('uniform') && lower.includes('varying'))) {
    // If it's Three.js with shaders, it's still threejs
    if (isThreeJsCode(code)) {
      return 'threejs';
    }
    // Otherwise it could be standalone shader code
    return 'threejs'; // Shaders are typically used with Three.js
  }
  
  // Check for vanilla JavaScript
  if (lower.includes('function') || lower.includes('const ') || lower.includes('let ') || 
      lower.includes('var ') || lower.includes('document.') || lower.includes('window.')) {
    return 'vanilla';
  }
  
  return 'unknown';
}

/**
 * Check if code is complete, fragment, or snippet
 */
function checkCompleteness(code: string, codeType: CodeType): CompletenessStatus {
  const trimmed = code.trim();
  
  if (!trimmed) {
    return 'unknown';
  }
  
  // Check for HTML completeness
  if (codeType === 'html' || codeType === 'mixed') {
    const hasOpeningTags = trimmed.includes('<');
    const hasClosingTags = trimmed.includes('</');
    const hasDoctype = trimmed.includes('<!DOCTYPE') || trimmed.includes('<html');
    
    if (hasDoctype && hasOpeningTags && hasClosingTags) {
      return 'complete';
    }
    if (hasOpeningTags || hasClosingTags) {
      return 'fragment';
    }
    return 'snippet';
  }
  
  // Check for React completeness
  if (codeType === 'react') {
    const hasImport = trimmed.includes('import');
    const hasExport = trimmed.includes('export');
    const hasFunction = trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('class');
    const hasReturn = trimmed.includes('return');
    
    if (hasFunction && hasReturn) {
      return hasExport ? 'complete' : 'fragment';
    }
    return 'snippet';
  }
  
  // Check for JavaScript completeness
  if (codeType === 'vanilla' || codeType === 'threejs' || codeType === 'p5js') {
    const hasFunction = trimmed.includes('function') || trimmed.includes('=>');
    const hasStatements = trimmed.includes(';') || trimmed.includes('{') || trimmed.includes('}');
    
    if (hasFunction && hasStatements) {
      return 'fragment';
    }
    if (hasStatements) {
      return 'snippet';
    }
    return 'unknown';
  }
  
  // Check for CSS completeness
  if (codeType === 'css') {
    const hasRules = trimmed.includes('{') && trimmed.includes('}');
    return hasRules ? 'fragment' : 'snippet';
  }
  
  return 'unknown';
}

/**
 * Detect syntax errors and issues
 */
function detectErrors(code: string, codeType: CodeType): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');
  
  // Check for unclosed brackets
  let openBraces = 0;
  let openParens = 0;
  let openBrackets = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
  }
  
  if (openBraces > 0) {
    errors.push({
      type: 'syntax',
      message: `Unclosed braces: ${openBraces} opening brace(s) without closing`,
      severity: 'error'
    });
  }
  if (openParens > 0) {
    errors.push({
      type: 'syntax',
      message: `Unclosed parentheses: ${openParens} opening paren(s) without closing`,
      severity: 'error'
    });
  }
  if (openBrackets > 0) {
    errors.push({
      type: 'syntax',
      message: `Unclosed brackets: ${openBrackets} opening bracket(s) without closing`,
      severity: 'error'
    });
  }
  
  // Check for missing dependencies
  if (codeType === 'threejs') {
    // Check if OrbitControls is used but not imported/loaded
    const usesOrbitControls = code.includes('OrbitControls') || 
                              code.includes('new THREE.OrbitControls') ||
                              code.includes('OrbitControls(');
    const hasOrbitControlsImport = code.includes('import') && code.includes('OrbitControls');
    const hasOrbitControlsScript = code.includes('<script') && code.includes('OrbitControls');
    const hasOrbitControlsPath = code.includes('/libs/three') && code.includes('OrbitControls');
    
    if (usesOrbitControls && !hasOrbitControlsImport && !hasOrbitControlsScript && !hasOrbitControlsPath) {
      errors.push({
        type: 'missing-dependency',
        message: 'OrbitControls is used but may not be loaded. Make sure to include the OrbitControls script or import.',
        severity: 'warning'
      });
    }
  }
  
  if (codeType === 'react') {
    if (!code.includes('import') && !code.includes('React')) {
      errors.push({
        type: 'missing-dependency',
        message: 'React code detected but React may not be imported',
        severity: 'warning'
      });
    }
  }
  
  // Check for incomplete HTML tags
  if (codeType === 'html' || codeType === 'mixed') {
    const tagMatches = code.match(/<[^>]+>/g) || [];
    const unclosedTags: string[] = [];
    
    for (const tag of tagMatches) {
      if (!tag.includes('/') && !tag.match(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)/i)) {
        const tagName = tag.match(/<(\w+)/)?.[1];
        if (tagName && !code.includes(`</${tagName}>`)) {
          if (!unclosedTags.includes(tagName)) {
            unclosedTags.push(tagName);
          }
        }
      }
    }
    
    if (unclosedTags.length > 0) {
      errors.push({
        type: 'incomplete',
        message: `Potentially unclosed HTML tags: ${unclosedTags.join(', ')}`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
}

/**
 * Analyze wrapping needs
 */
function analyzeWrappingNeeds(code: string, codeType: CodeType, completeness: CompletenessStatus): WrappingNeeds {
  // Three.js code usually needs wrapping if it's just JS without HTML structure
  if (codeType === 'threejs') {
    const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<body');
    if (!hasHtmlStructure && completeness !== 'complete') {
      return {
        needsWrapping: true,
        reason: 'Three.js code fragment needs HTML structure to run',
        suggestedWrapper: 'threejs',
        explanation: 'Three.js code needs an HTML page with a container element and the Three.js library loaded. Wrapping will add the necessary HTML structure and script tags.'
      };
    }
  }
  
  // p5.js code needs wrapping if it's just setup/draw functions
  if (codeType === 'p5js') {
    const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE');
    if (!hasHtmlStructure && (code.includes('function setup') || code.includes('function draw'))) {
      return {
        needsWrapping: true,
        reason: 'p5.js code needs HTML structure and p5.js library to run',
        suggestedWrapper: 'p5js',
        explanation: 'p5.js code needs an HTML page with the p5.js library loaded. Wrapping will add the necessary HTML structure and script tags.'
      };
    }
  }
  
  // Vanilla JS fragments might need wrapping
  if (codeType === 'vanilla' && completeness === 'fragment') {
    const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<body');
    const hasDomManipulation = code.includes('document.') || code.includes('getElementById') || code.includes('querySelector');
    
    if (hasDomManipulation && !hasHtmlStructure) {
      return {
        needsWrapping: true,
        reason: 'JavaScript code manipulates DOM but has no HTML structure',
        suggestedWrapper: 'html',
        explanation: 'Your JavaScript code references DOM elements but there\'s no HTML structure. Wrapping will add a basic HTML page with a container element.'
      };
    }
  }
  
  // React code doesn't need wrapping (it will be compiled)
  if (codeType === 'react') {
    return {
      needsWrapping: false,
      reason: 'React code will be compiled and rendered by the preview system',
      explanation: 'React/TSX code is automatically compiled and rendered. No wrapping needed.'
    };
  }
  
  // HTML code might be complete already
  if (codeType === 'html' || codeType === 'mixed') {
    const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE');
    if (hasHtmlStructure) {
      return {
        needsWrapping: false,
        reason: 'Code already has complete HTML structure',
        explanation: 'Your code appears to be a complete HTML document. It can be previewed as-is.'
      };
    }
  }
  
  return {
    needsWrapping: false,
    reason: 'Code appears to be complete or doesn\'t require wrapping',
    explanation: 'Your code can be previewed without additional wrapping.'
  };
}

/**
 * Suggest appropriate preview mode
 */
function suggestPreviewMode(codeType: CodeType, wrappingNeeds: WrappingNeeds, code: string): 'vanilla' | 'react' | 'browser' | 'canvas' {
  if (codeType === 'react') {
    return 'react';
  }
  
  if (codeType === 'threejs' || codeType === 'p5js') {
    return 'canvas';
  }
  
  if (codeType === 'html' || codeType === 'mixed') {
    // Check actual code content to determine if it has JavaScript
    const hasScript = code.includes('<script') || 
                     code.includes('function') || 
                     code.includes('const ') || 
                     code.includes('let ') ||
                     code.includes('THREE.') ||
                     code.includes('p5.') ||
                     code.includes('setup()') ||
                     code.includes('draw()');
    
    // If it's HTML/mixed with no JavaScript, use browser mode
    if (!hasScript) {
      return 'browser';
    }
    
    // If it has Three.js or p5.js code, use canvas mode
    if (code.includes('THREE.') || code.includes('new THREE.') || 
        code.includes('p5.') || code.includes('setup()') || code.includes('draw()')) {
      return 'canvas';
    }
    
    // HTML with JavaScript but not Three.js/p5.js - use vanilla mode
    return 'vanilla';
  }
  
  return 'vanilla';
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  codeType: CodeType,
  completeness: CompletenessStatus,
  errors: CodeError[],
  wrappingNeeds: WrappingNeeds,
  code: string
): string[] {
  const recommendations: string[] = [];
  
  if (completeness === 'fragment' || completeness === 'snippet') {
    recommendations.push('This appears to be a code fragment. Consider pasting the complete code for best results.');
  }
  
  if (errors.length > 0) {
    const syntaxErrors = errors.filter(e => e.type === 'syntax' && e.severity === 'error');
    if (syntaxErrors.length > 0) {
      recommendations.push('Fix syntax errors before previewing or extracting.');
    }
  }
  
  if (wrappingNeeds.needsWrapping) {
    recommendations.push(`Wrapping recommended: ${wrappingNeeds.explanation}`);
  }
  
  if (codeType === 'threejs' && !code.includes('THREE.')) {
    recommendations.push('Make sure Three.js library is loaded. The preview system will load it automatically.');
  }
  
  if (codeType === 'p5js' && !code.includes('p5.')) {
    recommendations.push('Make sure p5.js library is loaded. The preview system will load it automatically.');
  }
  
  if (codeType === 'react' && !code.includes('import React')) {
    recommendations.push('React code will be automatically compiled. Make sure your component exports correctly.');
  }
  
  if (codeType === 'unknown') {
    recommendations.push('Could not identify code type. Try pasting more complete code or use the Extract feature for AI analysis.');
  }
  
  return recommendations;
}

/**
 * Detect dependencies from code
 */
function detectDependencies(code: string, codeType: CodeType): string[] {
  const dependencies: string[] = [];
  const lower = code.toLowerCase();
  
  if (codeType === 'threejs' || lower.includes('three')) {
    dependencies.push('three');
    if (lower.includes('orbitcontrols')) {
      dependencies.push('three/examples/jsm/controls/OrbitControls');
    }
  }
  
  if (codeType === 'p5js' || lower.includes('p5')) {
    dependencies.push('p5');
  }
  
  if (codeType === 'react' || lower.includes('react')) {
    dependencies.push('react');
    dependencies.push('react-dom');
  }
  
  // Detect npm imports
  const importMatches = code.match(/from\s+['"]([^./][^'"]*)['"]/g) || [];
  for (const match of importMatches) {
    const pkg = match.match(/['"]([^'"]+)['"]/)?.[1];
    if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/')) {
      const pkgName = pkg.split('/')[0];
      if (!dependencies.includes(pkgName)) {
        dependencies.push(pkgName);
      }
    }
  }
  
  return dependencies;
}

/**
 * Main analysis function
 */
export function analyzeCode(code: string): CodeAnalysis {
  if (!code || !code.trim()) {
    return {
      codeType: 'unknown',
      completeness: 'unknown',
      errors: [],
      warnings: [],
      wrappingNeeds: {
        needsWrapping: false,
        reason: 'No code provided',
        explanation: 'Please paste some code to analyze.'
      },
      suggestedPreviewMode: 'vanilla',
      recommendations: ['Please paste code to analyze.'],
      canPreviewAsIs: false,
      canExtract: false,
      detectedDependencies: [],
      hasHtmlStructure: false,
      hasCss: false,
      hasJavaScript: false
    };
  }
  
  const codeType = detectCodeType(code);
  const completeness = checkCompleteness(code, codeType);
  const allIssues = detectErrors(code, codeType);
  const errors = allIssues.filter(e => e.severity === 'error');
  const warnings = allIssues.filter(e => e.severity === 'warning' || e.severity === 'info');
  const wrappingNeeds = analyzeWrappingNeeds(code, codeType, completeness);
  const suggestedPreviewMode = suggestPreviewMode(codeType, wrappingNeeds, code);
  const recommendations = generateRecommendations(codeType, completeness, errors, wrappingNeeds, code);
  const detectedDependencies = detectDependencies(code, codeType);
  
  // Check what the code contains
  const hasHtmlStructure = code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<body') || code.includes('<div');
  const hasCss = code.includes('<style') || code.includes('style=') || code.includes('{') && code.includes('color:');
  const hasJavaScript = code.includes('<script') || code.includes('function') || code.includes('const ') || code.includes('let ');
  
  // Determine if code can be previewed/extracted
  const canPreviewAsIs = errors.filter(e => e.severity === 'error').length === 0 && codeType !== 'unknown';
  const canExtract = code.trim().length > 0; // Can always try to extract, even with errors
  
  return {
    codeType,
    completeness,
    errors,
    warnings,
    wrappingNeeds,
    suggestedPreviewMode,
    recommendations,
    canPreviewAsIs,
    canExtract,
    detectedDependencies,
    hasHtmlStructure,
    hasCss,
    hasJavaScript
  };
}

