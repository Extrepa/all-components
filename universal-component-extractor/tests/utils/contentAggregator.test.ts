import { describe, it, expect } from 'vitest';
import { aggregateFiles, createCombinedInput } from '../../utils/contentAggregator';
import { UploadedFile } from '../../types';

describe('contentAggregator', () => {
  const createMockFile = (
    name: string,
    content: string,
    type: UploadedFile['type'] = 'html'
  ): UploadedFile => ({
    id: `test-${name}`,
    name,
    type,
    content,
    lastModified: Date.now(),
    size: content.length,
  });

  describe('aggregateFiles', () => {
    it('should return empty structure for empty array', () => {
      const result = aggregateFiles([]);
      expect(result.combinedHtml).toBe('');
      expect(result.combinedCss).toBe('');
      expect(result.combinedJs).toBe('');
      expect(result.fileStructure).toBe('');
      expect(result.dependencies).toEqual([]);
    });

    it('should combine HTML files', () => {
      const files = [
        createMockFile('index.html', '<div>Hello</div>', 'html'),
        createMockFile('about.html', '<div>About</div>', 'html'),
      ];

      const result = aggregateFiles(files);
      expect(result.combinedHtml).toContain('Hello');
      expect(result.combinedHtml).toContain('About');
      expect(result.combinedHtml).toContain('Separator');
    });

    it('should combine CSS files', () => {
      const files = [
        createMockFile('styles.css', '.class { color: red; }', 'css'),
        createMockFile('theme.css', '.theme { background: blue; }', 'css'),
      ];

      const result = aggregateFiles(files);
      expect(result.combinedCss).toContain('color: red');
      expect(result.combinedCss).toContain('background: blue');
      expect(result.combinedCss).toContain('Separator');
    });

    it('should combine JavaScript files', () => {
      const files = [
        createMockFile('app.js', 'console.log("app");', 'js'),
        createMockFile('utils.js', 'function util() {}', 'js'),
      ];

      const result = aggregateFiles(files);
      expect(result.combinedJs).toContain('app.js');
      expect(result.combinedJs).toContain('utils.js');
      expect(result.combinedJs).toContain('console.log');
      expect(result.combinedJs).toContain('function util');
    });

    it('should sort TypeScript before JavaScript', () => {
      const files = [
        createMockFile('app.js', 'console.log("js");', 'js'),
        createMockFile('types.ts', 'type MyType = string;', 'ts'),
      ];

      const result = aggregateFiles(files);
      const tsIndex = result.combinedJs.indexOf('types.ts');
      const jsIndex = result.combinedJs.indexOf('app.js');
      expect(tsIndex).toBeLessThan(jsIndex);
    });

    it('should detect dependencies from imports', () => {
      const files = [
        createMockFile('app.js', "import React from 'react';\nimport { useState } from 'react';", 'js'),
        createMockFile('utils.js', "const lodash = require('lodash');", 'js'),
      ];

      const result = aggregateFiles(files);
      expect(result.dependencies).toContain('react');
      expect(result.dependencies).toContain('lodash');
    });

    it('should generate file structure', () => {
      const files = [
        createMockFile('index.html', '<div>Test</div>', 'html'),
        createMockFile('styles.css', '.test {}', 'css'),
        createMockFile('app.js', 'console.log("test");', 'js'),
      ];

      const result = aggregateFiles(files);
      expect(result.fileStructure).toContain('File Structure');
      expect(result.fileStructure).toContain('index.html');
      expect(result.fileStructure).toContain('styles.css');
      expect(result.fileStructure).toContain('app.js');
    });

    it('should handle mixed file types', () => {
      const files = [
        createMockFile('index.html', '<div>Test</div>', 'html'),
        createMockFile('styles.css', '.test {}', 'css'),
        createMockFile('app.js', 'console.log("test");', 'js'),
        createMockFile('data.json', '{"key": "value"}', 'json'),
      ];

      const result = aggregateFiles(files);
      expect(result.combinedHtml).not.toBe('');
      expect(result.combinedCss).not.toBe('');
      expect(result.combinedJs).not.toBe('');
    });
  });

  describe('createCombinedInput', () => {
    it('should create combined input string', () => {
      const files = [
        createMockFile('index.html', '<div>Test</div>', 'html'),
        createMockFile('styles.css', '.test { color: red; }', 'css'),
        createMockFile('app.js', 'console.log("test");', 'js'),
      ];

      const result = createCombinedInput(files);
      expect(result).toContain('File Structure');
      expect(result).toContain('COMBINED CONTENT');
      expect(result).toContain('--- HTML ---');
      expect(result).toContain('--- CSS/SCSS ---');
      expect(result).toContain('--- JavaScript/TypeScript ---');
      expect(result).toContain('<div>Test</div>');
      expect(result).toContain('color: red');
      expect(result).toContain('console.log');
    });

    it('should include JSON files', () => {
      const files = [
        createMockFile('data.json', '{"key": "value"}', 'json'),
      ];

      const result = createCombinedInput(files);
      expect(result).toContain('--- JSON Data ---');
      expect(result).toContain('data.json');
      expect(result).toContain('{"key": "value"}');
    });

    it('should include dependencies in output', () => {
      const files = [
        createMockFile('app.js', "import React from 'react';", 'js'),
      ];

      const result = createCombinedInput(files);
      expect(result).toContain('Detected Dependencies');
      expect(result).toContain('react');
    });

    it('should handle empty files array', () => {
      const result = createCombinedInput([]);
      // Empty array still returns the header structure
      expect(result).toContain('COMBINED CONTENT');
      expect(result.trim()).toBe('=== COMBINED CONTENT ===');
    });
  });
});

