import { describe, it, expect } from 'vitest';
import { EXAMPLE_CODES } from '../../utils/exampleCode';

describe('exampleCode', () => {
  describe('EXAMPLE_CODES', () => {
    it('should have example codes defined', () => {
      expect(EXAMPLE_CODES).toBeDefined();
      expect(Array.isArray(EXAMPLE_CODES)).toBe(true);
      expect(EXAMPLE_CODES.length).toBeGreaterThan(0);
    });

    it('should have required properties for each example', () => {
      EXAMPLE_CODES.forEach((example) => {
        expect(example).toHaveProperty('name');
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('code');
        expect(example).toHaveProperty('category');
        expect(example).toHaveProperty('color');
        expect(typeof example.name).toBe('string');
        expect(typeof example.description).toBe('string');
        expect(typeof example.code).toBe('string');
        expect(typeof example.color).toBe('string');
        expect(['html', 'react', 'threejs', 'p5js', 'vanilla', 'svg']).toContain(example.category);
      });
    });

    it('should have exactly 9 examples', () => {
      expect(EXAMPLE_CODES.length).toBe(9);
    });

    it('should have Gradient Button example', () => {
      const gradientBtn = EXAMPLE_CODES.find((e) => e.name === 'Gradient Button');
      expect(gradientBtn).toBeDefined();
      expect(gradientBtn?.category).toBe('html');
      expect(gradientBtn?.color).toBe('red');
      expect(gradientBtn?.code).toContain('gradient-btn');
    });

    it('should have Todo List example', () => {
      const todoList = EXAMPLE_CODES.find((e) => e.name === 'Todo List');
      expect(todoList).toBeDefined();
      expect(todoList?.category).toBe('react');
      expect(todoList?.color).toBe('blue');
      expect(todoList?.code).toContain('React');
      expect(todoList?.code).toContain('useState');
    });

    it('should have 3D Sphere example', () => {
      const sphere = EXAMPLE_CODES.find((e) => e.name === '3D Sphere');
      expect(sphere).toBeDefined();
      expect(sphere?.category).toBe('threejs');
      expect(sphere?.color).toBe('purple');
      expect(sphere?.code).toContain('THREE');
      expect(sphere?.code).toContain('Sphere');
    });

    it('should have Particle System example', () => {
      const particles = EXAMPLE_CODES.find((e) => e.name === 'Particle System');
      expect(particles).toBeDefined();
      expect(particles?.category).toBe('p5js');
      expect(particles?.color).toBe('green');
      expect(particles?.code).toContain('setup');
      expect(particles?.code).toContain('draw');
    });

    it('should have Wave Animation example', () => {
      const wave = EXAMPLE_CODES.find((e) => e.name === 'Wave Animation');
      expect(wave).toBeDefined();
      expect(wave?.category).toBe('vanilla');
      expect(wave?.color).toBe('yellow');
      expect(wave?.code).toContain('<script');
    });

    it('should have SVG Animation example', () => {
      const svg = EXAMPLE_CODES.find((e) => e.name === 'SVG Animation');
      expect(svg).toBeDefined();
      expect(svg?.category).toBe('svg');
      expect(svg?.color).toBe('cyan');
      expect(svg?.code).toContain('<svg');
    });

    it('should have 3D Voxels example', () => {
      const voxels = EXAMPLE_CODES.find((e) => e.name === '3D Voxels');
      expect(voxels).toBeDefined();
      expect(voxels?.category).toBe('threejs');
      expect(voxels?.color).toBe('indigo');
      expect(voxels?.code).toContain('THREE');
      expect(voxels?.code).toContain('voxel');
    });

    it('should have 3D Wireframe example', () => {
      const wireframe = EXAMPLE_CODES.find((e) => e.name === '3D Wireframe');
      expect(wireframe).toBeDefined();
      expect(wireframe?.category).toBe('threejs');
      expect(wireframe?.color).toBe('orange');
      expect(wireframe?.code).toContain('THREE');
      expect(wireframe?.code).toContain('wireframe');
    });

    it('should have Shader Effect example', () => {
      const shader = EXAMPLE_CODES.find((e) => e.name === 'Shader Effect');
      expect(shader).toBeDefined();
      expect(shader?.category).toBe('threejs');
      expect(shader?.color).toBe('teal');
      expect(shader?.code).toContain('THREE');
      expect(shader?.code).toContain('shader');
    });

    it('should have non-empty code for all examples', () => {
      EXAMPLE_CODES.forEach((example) => {
        expect(example.code.length).toBeGreaterThan(0);
        expect(example.code.trim()).not.toBe('');
      });
    });

    it('should have non-empty names and descriptions', () => {
      EXAMPLE_CODES.forEach((example) => {
        expect(example.name.trim().length).toBeGreaterThan(0);
        expect(example.description.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

