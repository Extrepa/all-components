/**
 * Unit tests for FileUtils utility
 * 
 * Tests file operations and sanitization
 */

import { FileUtils } from '../../../src/utils/fileUtils';
import { MockApp, TestUtils } from '../../setup';

describe('FileUtils', () => {
	let app: MockApp;
	
	beforeEach(() => {
		app = TestUtils.createTestApp();
	});
	
	describe('sanitizeFileName', () => {
		it('should return "unnamed" for null input', () => {
			const result = FileUtils.sanitizeFileName(null as any);
			expect(result).toBe('unnamed');
		});
		
		it('should return "unnamed" for undefined input', () => {
			const result = FileUtils.sanitizeFileName(undefined as any);
			expect(result).toBe('unnamed');
		});
		
		it('should return "unnamed" for empty string', () => {
			const result = FileUtils.sanitizeFileName('');
			expect(result).toBe('unnamed');
		});
		
		it('should remove invalid characters', () => {
			const result = FileUtils.sanitizeFileName('test<file>name');
			expect(result).not.toContain('<');
			expect(result).not.toContain('>');
		});
		
		it('should remove path traversal sequences', () => {
			const result = FileUtils.sanitizeFileName('../test');
			expect(result).not.toContain('..');
		});
		
		it('should remove leading dots', () => {
			const result = FileUtils.sanitizeFileName('...test');
			expect(result).not.toMatch(/^\.+/);
		});
		
		it('should remove trailing dots', () => {
			const result = FileUtils.sanitizeFileName('test...');
			expect(result).not.toMatch(/\.+$/);
		});
		
		it('should replace spaces with hyphens', () => {
			const result = FileUtils.sanitizeFileName('test file name');
			expect(result).toBe('test-file-name');
		});
		
		it('should limit length to 200 characters', () => {
			const longName = 'a'.repeat(300);
			const result = FileUtils.sanitizeFileName(longName);
			expect(result.length).toBeLessThanOrEqual(200);
		});
		
		it('should handle complex invalid input', () => {
			const result = FileUtils.sanitizeFileName('../../test<file>name|with:invalid*chars');
			expect(result).not.toContain('..');
			expect(result).not.toContain('<');
			expect(result).not.toContain('>');
			expect(result).not.toContain('|');
			expect(result).not.toContain(':');
			expect(result).not.toContain('*');
		});
	});
	
	describe('ensureDirectoryExists', () => {
		it('should create directory if it does not exist', async () => {
			await FileUtils.ensureDirectoryExists(app as any, 'NewFolder/');
			const folder = app.vault.getAbstractFileByPath('NewFolder/');
			expect(folder).not.toBeNull();
		});
		
		it('should not error if directory already exists', async () => {
			await app.vault.createFolder('ExistingFolder/');
			const result = FileUtils.ensureDirectoryExists(app as any, 'ExistingFolder/');
			await expect(result).resolves.not.toThrow();
		});
	});
	
	describe('ensureParentDirectoryExists', () => {
		it('should create parent directory for file path', async () => {
			await FileUtils.ensureParentDirectoryExists(app as any, 'ParentFolder/file.md');
			const folder = app.vault.getAbstractFileByPath('ParentFolder/');
			expect(folder).not.toBeNull();
		});
		
		it('should create nested parent directories', async () => {
			await FileUtils.ensureParentDirectoryExists(app as any, 'Level1/Level2/Level3/file.md');
			const folder1 = app.vault.getAbstractFileByPath('Level1/');
			const folder2 = app.vault.getAbstractFileByPath('Level1/Level2/');
			const folder3 = app.vault.getAbstractFileByPath('Level1/Level2/Level3/');
			expect(folder1).not.toBeNull();
			expect(folder2).not.toBeNull();
			expect(folder3).not.toBeNull();
		});
		
		it('should not error if parent directories already exist', async () => {
			await app.vault.createFolder('ExistingParent/');
			const result = FileUtils.ensureParentDirectoryExists(app as any, 'ExistingParent/file.md');
			await expect(result).resolves.not.toThrow();
		});
		
		it('should handle file path with no parent directory', async () => {
			const result = FileUtils.ensureParentDirectoryExists(app as any, 'file.md');
			await expect(result).resolves.not.toThrow();
		});
	});
	
	describe('getOrCreateFile', () => {
		it('should return existing file if it exists', async () => {
			const existingFile = await app.vault.create('existing.md', 'existing content');
			const file = await FileUtils.getOrCreateFile(app as any, 'existing.md', 'default');
			expect(file).toBeDefined();
			expect(file.path).toBe('existing.md');
		});
		
		it('should create file with default content if it does not exist', async () => {
			const file = await FileUtils.getOrCreateFile(app as any, 'newfile.md', 'default content');
			expect(file).toBeDefined();
			expect(file.path).toBe('newfile.md');
			// Verify file was created by checking vault
			const createdFile = app.vault.getAbstractFileByPath('newfile.md');
			expect(createdFile).not.toBeNull();
			if (createdFile && 'content' in createdFile) {
				expect(createdFile.content).toBe('default content');
			}
		});
		
		it('should create parent directories when creating new file', async () => {
			const file = await FileUtils.getOrCreateFile(app as any, 'ParentFolder/newfile.md', 'content');
			expect(file).toBeDefined();
			const folder = app.vault.getAbstractFileByPath('ParentFolder/');
			expect(folder).not.toBeNull();
		});
		
		it('should use empty string as default content if not provided', async () => {
			const file = await FileUtils.getOrCreateFile(app as any, 'emptyfile.md');
			expect(file).toBeDefined();
			// Verify file was created with empty content
			const createdFile = app.vault.getAbstractFileByPath('emptyfile.md');
			expect(createdFile).not.toBeNull();
			if (createdFile && 'content' in createdFile) {
				expect(createdFile.content).toBe('');
			}
		});
	});
});

