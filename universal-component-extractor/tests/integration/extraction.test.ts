import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectFileType } from '../../utils/fileTypeDetector';
import { createCombinedInput } from '../../utils/contentAggregator';
import { UploadedFile } from '../../types';

describe('Integration: Extraction Flow', () => {
  describe('File Upload to Extraction Input', () => {
    it('should process multiple files into combined input', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          name: 'index.html',
          type: 'html',
          content: '<div class="container">Hello</div>',
          lastModified: Date.now(),
          size: 100,
        },
        {
          id: '2',
          name: 'styles.css',
          type: 'css',
          content: '.container { color: red; }',
          lastModified: Date.now(),
          size: 50,
        },
        {
          id: '3',
          name: 'app.js',
          type: 'js',
          content: 'console.log("Hello");',
          lastModified: Date.now(),
          size: 30,
        },
      ];

      // Detect file types
      files.forEach((file) => {
        const detectedType = detectFileType(file.name);
        expect(detectedType).toBe(file.type);
      });

      // Create combined input
      const combined = createCombinedInput(files);
      expect(combined).toContain('index.html');
      expect(combined).toContain('styles.css');
      expect(combined).toContain('app.js');
      expect(combined).toContain('Hello');
      expect(combined).toContain('color: red');
      expect(combined).toContain('console.log');
    });

    it('should handle React component files', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          name: 'Component.tsx',
          type: 'tsx',
          content: `import React from 'react';
function Component() {
  return <div>Test</div>;
}`,
          lastModified: Date.now(),
          size: 100,
        },
      ];

      const detectedType = detectFileType('Component.tsx');
      expect(detectedType).toBe('tsx');

      const combined = createCombinedInput(files);
      expect(combined).toContain('Component.tsx');
      expect(combined).toContain('React');
    });

    it('should handle Three.js files', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          name: 'scene.3js',
          type: '3js',
          content: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);`,
          lastModified: Date.now(),
          size: 100,
        },
      ];

      const detectedType = detectFileType('scene.3js');
      expect(detectedType).toBe('3js');

      const combined = createCombinedInput(files);
      expect(combined).toContain('scene.3js');
      expect(combined).toContain('THREE.Scene');
    });

    it('should detect dependencies from imports', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          name: 'app.js',
          type: 'js',
          content: `import React from 'react';
import { useState } from 'react';
import lodash from 'lodash';`,
          lastModified: Date.now(),
          size: 100,
        },
      ];

      const combined = createCombinedInput(files);
      expect(combined).toContain('Detected Dependencies');
      expect(combined).toContain('react');
      expect(combined).toContain('lodash');
    });

    it('should handle empty file array', () => {
      const combined = createCombinedInput([]);
      // Empty array still returns the header structure
      expect(combined).toContain('COMBINED CONTENT');
      expect(combined.trim()).toBe('=== COMBINED CONTENT ===');
    });

    it('should preserve file structure information', () => {
      const files: UploadedFile[] = [
        {
          id: '1',
          name: 'index.html',
          type: 'html',
          content: '<div>Test</div>',
          lastModified: Date.now(),
          size: 100,
        },
        {
          id: '2',
          name: 'styles.css',
          type: 'css',
          content: '.test {}',
          lastModified: Date.now(),
          size: 50,
        },
      ];

      const combined = createCombinedInput(files);
      expect(combined).toContain('File Structure');
      expect(combined).toContain('Markup Files');
      expect(combined).toContain('Stylesheet Files');
    });
  });

  describe('File Type Detection Integration', () => {
    it('should correctly categorize all file types', () => {
      const testCases = [
        { name: 'index.html', expected: 'html' },
        { name: 'styles.css', expected: 'css' },
        { name: 'theme.scss', expected: 'scss' },
        { name: 'app.js', expected: 'js' },
        { name: 'component.tsx', expected: 'tsx' },
        { name: 'component.jsx', expected: 'jsx' },
        { name: 'data.json', expected: 'json' },
        { name: 'scene.3js', expected: '3js' },
      ];

      testCases.forEach(({ name, expected }) => {
        const detected = detectFileType(name);
        expect(detected).toBe(expected);
      });
    });
  });
});

