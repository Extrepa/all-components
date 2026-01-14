/**
 * Unit tests for PathValidator utility
 * 
 * Tests path validation, traversal detection, and suggestions
 */

/// <reference path="../../jest.d.ts" />

import { PathValidator } from '../../../src/utils/pathValidator';
import { MockVault, TestUtils } from '../../setup';

describe('PathValidator', () => {
	let vault: MockVault;
	
	beforeEach(() => {
		vault = TestUtils.createTestVault();
	});
	
	describe('validatePath', () => {
		describe('empty path validation', () => {
			it('should return "not configured" for empty path when not required', () => {
				const result = PathValidator.validatePath(vault as any, '', false);
				expect(result.isValid).toBe(true);
				expect(result.exists).toBe(false);
				expect(result.message).toBe('Path not configured');
			});
			
			it('should return "required" for empty path when required', () => {
				const result = PathValidator.validatePath(vault as any, '', true);
				expect(result.isValid).toBe(false);
				expect(result.exists).toBe(false);
				expect(result.message).toBe('Path is required');
			});
		});
		
		describe('path traversal detection', () => {
			it('should detect ../ in path', () => {
				const result = PathValidator.validatePath(vault as any, '../Projects/', false);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe('Path contains invalid traversal sequences');
			});
			
			it('should detect ..\\ in path', () => {
				const result = PathValidator.validatePath(vault as any, '..\\Projects\\', false);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe('Path contains invalid traversal sequences');
			});
			
			it('should detect .. in path', () => {
				const result = PathValidator.validatePath(vault as any, 'path/../other', false);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe('Path contains invalid traversal sequences');
			});
		});
		
		describe('invalid characters', () => {
			it('should detect invalid characters in path', () => {
				const result = PathValidator.validatePath(vault as any, 'Projects<test>/', false);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe('Path contains invalid characters');
			});
		});
		
		describe('existing paths', () => {
			it('should validate existing folder path', () => {
				const result = PathValidator.validatePath(vault as any, 'Projects/', false);
				expect(result.isValid).toBe(true);
				expect(result.exists).toBe(true);
				expect(result.message).toBe('Folder found');
			});
			
			it('should return "not found" for non-existent path when not required', () => {
				const result = PathValidator.validatePath(vault as any, 'NonExistent/', false);
				expect(result.isValid).toBe(true);
				expect(result.exists).toBe(false);
				expect(result.message).toContain('not found');
			});
			
			it('should return "not found" for non-existent path when required', () => {
				const result = PathValidator.validatePath(vault as any, 'NonExistent/', true);
				expect(result.isValid).toBe(false);
				expect(result.exists).toBe(false);
				expect(result.message).toContain('not found');
			});
		});
	});
	
	describe('suggestCommonPaths', () => {
		it('should suggest existing project folders', () => {
			const suggestions = PathValidator.suggestCommonPaths(vault as any);
			expect(suggestions).toContain('Projects/');
		});
		
		it('should not suggest non-existent folders', () => {
			const suggestions = PathValidator.suggestCommonPaths(vault as any);
			expect(suggestions).not.toContain('NonExistent/');
		});
	});

	describe('suggestLorePaths', () => {
		it('should suggest existing lore folders', () => {
			const suggestions = PathValidator.suggestLorePaths(vault as any);
			expect(Array.isArray(suggestions)).toBe(true);
			expect(suggestions.some(s => typeof s === 'string' && s.length > 0)).toBe(true);
		});
	});
	
	describe('validatePaths', () => {
		it('should validate multiple paths', () => {
			const paths = ['Projects/', 'NonExistent/'];
			const results = PathValidator.validatePaths(vault as any, paths, false);
			expect(results.length).toBe(2);
			expect(results[0].exists).toBe(true);
			expect(results[1].exists).toBe(false);
		});
	});
});

