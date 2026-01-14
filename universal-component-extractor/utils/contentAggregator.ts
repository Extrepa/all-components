/**
 * Content Aggregator Utility
 * Intelligently combines multiple files for AI extraction
 */

import { UploadedFile } from '../types';
import { detectFileType, getFileTypeInfo, groupFilesByCategory } from './fileTypeDetector';

export interface AggregatedContent {
  combinedHtml: string;
  combinedCss: string;
  combinedJs: string;
  fileStructure: string;
  dependencies: string[];
}

/**
 * Aggregate multiple files into a single input for AI extraction
 */
export function aggregateFiles(files: UploadedFile[]): AggregatedContent {
  if (files.length === 0) {
    return {
      combinedHtml: '',
      combinedCss: '',
      combinedJs: '',
      fileStructure: '',
      dependencies: [],
    };
  }

  // Group files by category
  const groups = groupFilesByCategory(files);
  
  // Combine HTML files
  const htmlFiles = groups.markup.map(f => {
    const file = files.find(uf => uf.name === f.name);
    return file?.content || '';
  }).filter(Boolean);
  const combinedHtml = htmlFiles.join('\n\n<!-- Separator: Next File -->\n\n');

  // Combine CSS/SCSS files
  const cssFiles = groups.stylesheet.map(f => {
    const file = files.find(uf => uf.name === f.name);
    return file?.content || '';
  }).filter(Boolean);
  const combinedCss = cssFiles.join('\n\n/* Separator: Next File */\n\n');

  // Combine JavaScript/TypeScript files
  // Sort by dependencies if possible
  const scriptFiles = groups.script
    .map(f => {
      const file = files.find(uf => uf.name === f.name);
      return file ? { ...file, type: f.type } : null;
    })
    .filter((f): f is UploadedFile & { type: string } => f !== null)
    .sort((a, b) => {
      // Put TypeScript before JavaScript
      if (a.type === 'ts' || a.type === 'tsx') return -1;
      if (b.type === 'ts' || b.type === 'tsx') return 1;
      // Put JSX/TSX before plain JS/TS
      if (a.type.includes('x') && !b.type.includes('x')) return -1;
      if (b.type.includes('x') && !a.type.includes('x')) return 1;
      return 0;
    });
  
  const combinedJs = scriptFiles
    .map(f => {
      const comment = `// File: ${f.name}\n`;
      return comment + f.content;
    })
    .join('\n\n// ===== Separator: Next File =====\n\n');

  // Detect dependencies
  const dependencies = detectDependencies(files);

  // Generate file structure description
  const fileStructure = generateFileStructure(files);

  return {
    combinedHtml,
    combinedCss,
    combinedJs,
    fileStructure,
    dependencies,
  };
}

/**
 * Detect dependencies from file imports
 */
function detectDependencies(files: UploadedFile[]): string[] {
  const deps = new Set<string>();
  
  files.forEach(file => {
    const content = file.content;
    
    // Detect npm package imports
    const npmImports = content.match(/from\s+['"]([^./][^'"]*)['"]/g) || [];
    npmImports.forEach(imp => {
      const match = imp.match(/['"]([^'"]+)['"]/);
      if (match && !match[1].startsWith('.')) {
        const pkg = match[1].split('/')[0];
        if (!pkg.startsWith('@') || pkg.split('/').length === 2) {
          deps.add(pkg);
        }
      }
    });
    
    // Detect require statements
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    requires.forEach(req => {
      const match = req.match(/['"]([^'"]+)['"]/);
      if (match && !match[1].startsWith('.')) {
        const pkg = match[1].split('/')[0];
        deps.add(pkg);
      }
    });
  });
  
  return Array.from(deps);
}

/**
 * Generate a human-readable file structure description
 */
function generateFileStructure(files: UploadedFile[]): string {
  const groups = groupFilesByCategory(files);
  
  let structure = 'File Structure:\n';
  
  if (groups.markup.length > 0) {
    structure += '\nMarkup Files:\n';
    groups.markup.forEach(f => {
      const info = getFileTypeInfo(f.type);
      structure += `  - ${f.name} (${info.description})\n`;
    });
  }
  
  if (groups.stylesheet.length > 0) {
    structure += '\nStylesheet Files:\n';
    groups.stylesheet.forEach(f => {
      const info = getFileTypeInfo(f.type);
      structure += `  - ${f.name} (${info.description})\n`;
    });
  }
  
  if (groups.script.length > 0) {
    structure += '\nScript Files:\n';
    groups.script.forEach(f => {
      const info = getFileTypeInfo(f.type);
      structure += `  - ${f.name} (${info.description})\n`;
    });
  }
  
  if (groups.data.length > 0) {
    structure += '\nData Files:\n';
    groups.data.forEach(f => {
      const info = getFileTypeInfo(f.type);
      structure += `  - ${f.name} (${info.description})\n`;
    });
  }
  
  return structure;
}

/**
 * Create a combined input string for AI extraction
 */
export function createCombinedInput(files: UploadedFile[]): string {
  const aggregated = aggregateFiles(files);
  
  let combined = '';
  
  if (aggregated.fileStructure) {
    combined += aggregated.fileStructure + '\n\n';
  }
  
  if (aggregated.dependencies.length > 0) {
    combined += `Detected Dependencies: ${aggregated.dependencies.join(', ')}\n\n`;
  }
  
  combined += '=== COMBINED CONTENT ===\n\n';
  
  if (aggregated.combinedHtml) {
    combined += '--- HTML ---\n';
    combined += aggregated.combinedHtml + '\n\n';
  }
  
  if (aggregated.combinedCss) {
    combined += '--- CSS/SCSS ---\n';
    combined += aggregated.combinedCss + '\n\n';
  }
  
  if (aggregated.combinedJs) {
    combined += '--- JavaScript/TypeScript ---\n';
    combined += aggregated.combinedJs + '\n\n';
  }
  
  // Add JSON files if any
  const jsonFiles = files.filter(f => f.type === 'json');
  if (jsonFiles.length > 0) {
    combined += '--- JSON Data ---\n';
    jsonFiles.forEach(f => {
      combined += `\n// File: ${f.name}\n`;
      combined += f.content + '\n\n';
    });
  }
  
  return combined;
}

