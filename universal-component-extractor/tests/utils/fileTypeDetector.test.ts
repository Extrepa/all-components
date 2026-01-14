import { describe, it, expect } from 'vitest';
import {
  detectFileType,
  getFileTypeInfo,
  isSupportedFileType,
  getSyntaxLanguage,
  isReactComponent,
  isStylesheet,
  isScript,
  groupFilesByCategory,
} from '../../utils/fileTypeDetector';

describe('fileTypeDetector', () => {
  describe('detectFileType', () => {
    it('should detect HTML files', () => {
      expect(detectFileType('index.html')).toBe('html');
      expect(detectFileType('page.htm')).toBe('html');
    });

    it('should detect CSS files', () => {
      expect(detectFileType('styles.css')).toBe('css');
    });

    it('should detect SCSS files', () => {
      expect(detectFileType('styles.scss')).toBe('scss');
      expect(detectFileType('styles.sass')).toBe('scss');
    });

    it('should detect JavaScript files', () => {
      expect(detectFileType('script.js')).toBe('js');
      expect(detectFileType('module.mjs')).toBe('js');
      expect(detectFileType('common.cjs')).toBe('js');
    });

    it('should detect TypeScript files', () => {
      expect(detectFileType('file.ts')).toBe('ts');
    });

    it('should detect React files', () => {
      expect(detectFileType('component.jsx')).toBe('jsx');
      expect(detectFileType('component.tsx')).toBe('tsx');
    });

    it('should detect JSON files', () => {
      expect(detectFileType('data.json')).toBe('json');
    });

    it('should detect Three.js files', () => {
      expect(detectFileType('scene.3js')).toBe('3js');
    });

    it('should return unknown for unsupported files', () => {
      expect(detectFileType('file.txt')).toBe('unknown');
      expect(detectFileType('file.pdf')).toBe('unknown');
      expect(detectFileType('file')).toBe('unknown');
    });

    it('should handle case insensitivity', () => {
      expect(detectFileType('FILE.HTML')).toBe('html');
      expect(detectFileType('Component.TSX')).toBe('tsx');
    });
  });

  describe('getFileTypeInfo', () => {
    it('should return correct info for HTML', () => {
      const info = getFileTypeInfo('html');
      expect(info.type).toBe('html');
      expect(info.category).toBe('markup');
      expect(info.language).toBe('html');
      expect(info.mimeType).toBe('text/html');
    });

    it('should return correct info for CSS', () => {
      const info = getFileTypeInfo('css');
      expect(info.category).toBe('stylesheet');
      expect(info.language).toBe('css');
    });

    it('should return correct info for React files', () => {
      const tsxInfo = getFileTypeInfo('tsx');
      expect(tsxInfo.category).toBe('script');
      expect(tsxInfo.language).toBe('tsx');

      const jsxInfo = getFileTypeInfo('jsx');
      expect(jsxInfo.category).toBe('script');
      expect(jsxInfo.language).toBe('jsx');
    });

    it('should return correct info for unknown files', () => {
      const info = getFileTypeInfo('unknown');
      expect(info.type).toBe('unknown');
      expect(info.category).toBe('unknown');
    });
  });

  describe('isSupportedFileType', () => {
    it('should return true for supported files', () => {
      expect(isSupportedFileType('file.html')).toBe(true);
      expect(isSupportedFileType('file.css')).toBe(true);
      expect(isSupportedFileType('file.js')).toBe(true);
      expect(isSupportedFileType('file.tsx')).toBe(true);
    });

    it('should return false for unsupported files', () => {
      expect(isSupportedFileType('file.txt')).toBe(false);
      expect(isSupportedFileType('file.pdf')).toBe(false);
    });
  });

  describe('getSyntaxLanguage', () => {
    it('should return correct syntax language', () => {
      expect(getSyntaxLanguage('html')).toBe('html');
      expect(getSyntaxLanguage('css')).toBe('css');
      expect(getSyntaxLanguage('tsx')).toBe('tsx');
      expect(getSyntaxLanguage('js')).toBe('javascript');
      expect(getSyntaxLanguage('3js')).toBe('javascript');
    });
  });

  describe('isReactComponent', () => {
    it('should return true for React file types', () => {
      expect(isReactComponent('tsx')).toBe(true);
      expect(isReactComponent('jsx')).toBe(true);
    });

    it('should return false for non-React file types', () => {
      expect(isReactComponent('js')).toBe(false);
      expect(isReactComponent('ts')).toBe(false);
      expect(isReactComponent('html')).toBe(false);
    });
  });

  describe('isStylesheet', () => {
    it('should return true for stylesheet types', () => {
      expect(isStylesheet('css')).toBe(true);
      expect(isStylesheet('scss')).toBe(true);
    });

    it('should return false for non-stylesheet types', () => {
      expect(isStylesheet('html')).toBe(false);
      expect(isStylesheet('js')).toBe(false);
    });
  });

  describe('isScript', () => {
    it('should return true for script types', () => {
      expect(isScript('js')).toBe(true);
      expect(isScript('ts')).toBe(true);
      expect(isScript('tsx')).toBe(true);
      expect(isScript('jsx')).toBe(true);
      expect(isScript('3js')).toBe(true);
    });

    it('should return false for non-script types', () => {
      expect(isScript('html')).toBe(false);
      expect(isScript('css')).toBe(false);
      expect(isScript('json')).toBe(false);
    });
  });

  describe('groupFilesByCategory', () => {
    it('should group files by category', () => {
      const files = [
        { name: 'index.html', type: 'html' as const },
        { name: 'styles.css', type: 'css' as const },
        { name: 'script.js', type: 'js' as const },
        { name: 'data.json', type: 'json' as const },
      ];

      const groups = groupFilesByCategory(files);

      expect(groups.markup).toHaveLength(1);
      expect(groups.markup[0].name).toBe('index.html');
      expect(groups.stylesheet).toHaveLength(1);
      expect(groups.stylesheet[0].name).toBe('styles.css');
      expect(groups.script).toHaveLength(1);
      expect(groups.script[0].name).toBe('script.js');
      expect(groups.data).toHaveLength(1);
      expect(groups.data[0].name).toBe('data.json');
    });

    it('should detect file type if not provided', () => {
      const files = [
        { name: 'index.html' },
        { name: 'styles.css' },
      ];

      const groups = groupFilesByCategory(files);

      expect(groups.markup).toHaveLength(1);
      expect(groups.markup[0].type).toBe('html');
      expect(groups.stylesheet).toHaveLength(1);
      expect(groups.stylesheet[0].type).toBe('css');
    });

    it('should handle empty array', () => {
      const groups = groupFilesByCategory([]);
      expect(groups.markup).toHaveLength(0);
      expect(groups.stylesheet).toHaveLength(0);
      expect(groups.script).toHaveLength(0);
      expect(groups.data).toHaveLength(0);
    });
  });
});

