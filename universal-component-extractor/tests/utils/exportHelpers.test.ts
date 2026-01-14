import { describe, it, expect } from 'vitest';
import { buildFullProjectFiles, buildReactComponentPresetFiles, buildVanillaWidgetPresetFiles, buildViteReactPresetFiles, buildNextJsPresetFiles } from '../../utils/exportHelpers';
import { ExtractedCode } from '../../types';

const baseExtracted: ExtractedCode = {
  html: '<div>Test</div>',
  css: '.test { color: red; }',
  scss: '',
  tsx: 'export const Test = () => <div>Test</div>;',
  vanillaJs: 'console.log("test");',
  explanation: 'Test explanation',
};

describe('exportHelpers', () => {
  it('buildFullProjectFiles should include index.html and related assets', () => {
    const files = buildFullProjectFiles(baseExtracted, 'MyComponent');

    expect(files['index.html']).toBeDefined();
    expect(files['MyComponent.css']).toBeDefined();
    expect(files['MyComponent.js']).toBeDefined();
    expect(files['MyComponent.tsx']).toBeDefined();
    expect(files['README.md']).toBeDefined();
  });

  it('buildReactComponentPresetFiles should return TSX-centric preset', () => {
    const files = buildReactComponentPresetFiles(baseExtracted, 'MyComponent');

    expect(Object.keys(files)).toContain('MyComponent.tsx');
    expect(files['MyComponent.tsx']).toContain('Test');
    expect(files['README.md']).toBeDefined();
  });

  it('buildReactComponentPresetFiles should return empty map when no TSX', () => {
    const withoutTsx: ExtractedCode = { ...baseExtracted, tsx: '' };
    const files = buildReactComponentPresetFiles(withoutTsx, 'MyComponent');

    expect(Object.keys(files).length).toBe(0);
  });

  it('buildVanillaWidgetPresetFiles should create index.html + JS + CSS', () => {
    const files = buildVanillaWidgetPresetFiles(baseExtracted, 'MyComponent');

    expect(files['index.html']).toBeDefined();
    expect(files['MyComponent.css']).toBeDefined();
    expect(files['MyComponent.js']).toBeDefined();
    expect(files['README.md']).toBeDefined();
  });

  it('buildViteReactPresetFiles should map to src/components with TSX and optional CSS', () => {
    const files = buildViteReactPresetFiles(baseExtracted, 'MyComponent');

    expect(files['src/components/MyComponent.tsx']).toBeDefined();
    expect(files['src/components/MyComponent.css']).toBeDefined();
    expect(files['README.md']).toBeDefined();
  });

  it('buildNextJsPresetFiles should map to components with TSX and optional module CSS', () => {
    const files = buildNextJsPresetFiles(baseExtracted, 'MyComponent');

    expect(files['components/MyComponent.tsx']).toBeDefined();
    expect(files['components/MyComponent.module.css']).toBeDefined();
    expect(files['README.md']).toBeDefined();
  });
});
