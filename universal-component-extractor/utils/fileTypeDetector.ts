/**
 * File Type Detection and Categorization Utility
 * Supports all UX coding languages and file types
 */

export type FileType = 
  | 'html' 
  | 'css' 
  | 'scss' 
  | 'ts' 
  | 'tsx' 
  | 'js' 
  | 'jsx' 
  | 'json' 
  | '3js'
  | 'unknown';

export interface FileTypeInfo {
  type: FileType;
  category: 'markup' | 'stylesheet' | 'script' | 'data' | 'unknown';
  language: string;
  mimeType: string;
  description: string;
  icon: string;
}

/**
 * Detect file type from filename
 */
export function detectFileType(filename: string): FileType {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  const typeMap: Record<string, FileType> = {
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'ts': 'ts',
    'tsx': 'tsx',
    'js': 'js',
    'jsx': 'jsx',
    'mjs': 'js',
    'cjs': 'js',
    'json': 'json',
    '3js': '3js',
  };
  
  return typeMap[ext] || 'unknown';
}

/**
 * Get detailed file type information
 */
export function getFileTypeInfo(type: FileType): FileTypeInfo {
  const infoMap: Record<FileType, FileTypeInfo> = {
    html: {
      type: 'html',
      category: 'markup',
      language: 'html',
      mimeType: 'text/html',
      description: 'HTML Markup',
      icon: '📄',
    },
    css: {
      type: 'css',
      category: 'stylesheet',
      language: 'css',
      mimeType: 'text/css',
      description: 'CSS Stylesheet',
      icon: '🎨',
    },
    scss: {
      type: 'scss',
      category: 'stylesheet',
      language: 'scss',
      mimeType: 'text/x-scss',
      description: 'SCSS Stylesheet',
      icon: '🎨',
    },
    ts: {
      type: 'ts',
      category: 'script',
      language: 'typescript',
      mimeType: 'text/typescript',
      description: 'TypeScript',
      icon: '📘',
    },
    tsx: {
      type: 'tsx',
      category: 'script',
      language: 'tsx',
      mimeType: 'text/typescript-jsx',
      description: 'TypeScript React',
      icon: '⚛️',
    },
    js: {
      type: 'js',
      category: 'script',
      language: 'javascript',
      mimeType: 'text/javascript',
      description: 'JavaScript',
      icon: '📜',
    },
    jsx: {
      type: 'jsx',
      category: 'script',
      language: 'jsx',
      mimeType: 'text/javascript-jsx',
      description: 'JavaScript React',
      icon: '⚛️',
    },
    json: {
      type: 'json',
      category: 'data',
      language: 'json',
      mimeType: 'application/json',
      description: 'JSON Data',
      icon: '📋',
    },
    '3js': {
      type: '3js',
      category: 'script',
      language: 'javascript',
      mimeType: 'text/javascript',
      description: 'Three.js Script',
      icon: '🎮',
    },
    unknown: {
      type: 'unknown',
      category: 'unknown',
      language: 'text',
      mimeType: 'text/plain',
      description: 'Unknown File',
      icon: '📁',
    },
  };
  
  return infoMap[type];
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(filename: string): boolean {
  const type = detectFileType(filename);
  return type !== 'unknown';
}

/**
 * Get syntax highlighting language for file type
 */
export function getSyntaxLanguage(type: FileType): string {
  const langMap: Record<FileType, string> = {
    html: 'html',
    css: 'css',
    scss: 'scss',
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    json: 'json',
    '3js': 'javascript',
    unknown: 'text',
  };
  
  return langMap[type];
}

/**
 * Detect if file is a React component
 */
export function isReactComponent(type: FileType): boolean {
  return type === 'tsx' || type === 'jsx';
}

/**
 * Detect if file is a stylesheet
 */
export function isStylesheet(type: FileType): boolean {
  return type === 'css' || type === 'scss';
}

/**
 * Detect if file is a script
 */
export function isScript(type: FileType): boolean {
  return ['ts', 'tsx', 'js', 'jsx', '3js'].includes(type);
}

/**
 * Group files by category
 */
export function groupFilesByCategory(files: Array<{ name: string; type?: FileType }>): Record<string, Array<{ name: string; type: FileType }>> {
  const groups: Record<string, Array<{ name: string; type: FileType }>> = {
    markup: [],
    stylesheet: [],
    script: [],
    data: [],
    unknown: [],
  };
  
  files.forEach(file => {
    const type = file.type || detectFileType(file.name);
    const info = getFileTypeInfo(type);
    groups[info.category].push({ name: file.name, type });
  });
  
  return groups;
}

