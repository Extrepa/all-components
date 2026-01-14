/**
 * Unit tests for BaseManager utility
 * 
 * Tests Base file creation, validation, and management
 */

import { BaseManager, BaseConfig } from '../../../src/utils/BaseManager';
import { MockApp, TestUtils } from '../../setup';
import { TFile } from 'obsidian';

describe('BaseManager', () => {
	let app: MockApp;
	
	beforeEach(() => {
		app = TestUtils.createTestApp();
	});

	describe('ensureBaseExists', () => {
		it('should create a new Base file if it does not exist', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
				properties: {
					capturedAt: { displayName: 'Captured' },
					tags: { displayName: 'Tags' },
				},
				views: [
					{
						type: 'table',
						name: 'Captures',
						order: ['note.capturedAt', 'note.tags'],
					},
				],
			};

			const result = await BaseManager.ensureBaseExists(app as any, basePath, config);

			expect(result).toBeDefined();
			expect(result.path).toBe(basePath);
			
			// Verify file was created
			const file = app.vault.getAbstractFileByPath(basePath);
			expect(file).toBeDefined();
			expect(file).not.toBeNull();
			if (file) {
				expect(file.type).toBe('file');
			}
		});

		it('should return existing Base file if it already exists', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			// Create Base file first
			const firstResult = await BaseManager.ensureBaseExists(app as any, basePath, config);
			
			// Try to create again
			const secondResult = await BaseManager.ensureBaseExists(app as any, basePath, config);

			expect(secondResult).toBe(firstResult);
			expect(secondResult.path).toBe(basePath);
		});

		it('should create parent directories if they do not exist', async () => {
			const basePath = 'ErrlOS/Subfolder/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			await BaseManager.ensureBaseExists(app as any, basePath, config);

			// Verify parent directory exists
			const parentDir = app.vault.getAbstractFileByPath('ErrlOS/Subfolder');
			expect(parentDir).toBeDefined();
		});

		it('should throw error for invalid Base config', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const invalidConfig = {
				// Missing required 'filters' field
				properties: {},
			} as any;

			await expect(
				BaseManager.ensureBaseExists(app as any, basePath, invalidConfig)
			).rejects.toThrow('Invalid Base configuration');
		});

		it('should handle invalid JSON in existing Base file', async () => {
			const basePath = 'ErrlOS/Capture.base';
			
			// Create a file with invalid JSON
			await app.vault.create(basePath, 'invalid json content {');

			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			// Should recreate the Base file
			const result = await BaseManager.ensureBaseExists(app as any, basePath, config);
			
			expect(result).toBeDefined();
			expect(result.path).toBe(basePath);
			
			// Verify file content is valid JSON
			const content = await app.vault.read(result);
			expect(() => JSON.parse(content)).not.toThrow();
		});
	});

	describe('openBase', () => {
		it('should open an existing Base file', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			await BaseManager.ensureBaseExists(app as any, basePath, config);

			// Should not throw
			await expect(
				BaseManager.openBase(app as any, basePath)
			).resolves.not.toThrow();
		});

		it('should throw error if Base file does not exist', async () => {
			const basePath = 'ErrlOS/Nonexistent.base';

			await expect(
				BaseManager.openBase(app as any, basePath)
			).rejects.toThrow('Base file not found');
		});
	});

	describe('updateBaseFilter', () => {
		it('should update filter in existing Base file', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			await BaseManager.ensureBaseExists(app as any, basePath, config);

			const newFilter = 'note.type = "capture" AND note.tags = "important"';
			await BaseManager.updateBaseFilter(app as any, basePath, newFilter);

			// Verify filter was updated
			const file = app.vault.getAbstractFileByPath(basePath) as TFile;
			const content = await app.vault.read(file);
			const parsed = JSON.parse(content) as BaseConfig;
			
			expect(parsed.filters).toBe(newFilter);
		});

		it('should throw error if Base file does not exist', async () => {
			const basePath = 'ErrlOS/Nonexistent.base';

			await expect(
				BaseManager.updateBaseFilter(app as any, basePath, 'new filter')
			).rejects.toThrow('Base file not found');
		});
	});

	describe('addView', () => {
		it('should add a new view to Base file', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
				views: [],
			};

			await BaseManager.ensureBaseExists(app as any, basePath, config);

			const newView = {
				type: 'table' as const,
				name: 'Grouped by Tags',
				groupBy: 'note.tags',
				order: ['note.capturedAt'],
			};

			await BaseManager.addView(app as any, basePath, newView);

			// Verify view was added
			const file = app.vault.getAbstractFileByPath(basePath) as TFile;
			const content = await app.vault.read(file);
			const parsed = JSON.parse(content) as BaseConfig;
			
			expect(parsed.views).toBeDefined();
			expect(parsed.views?.length).toBe(1);
			expect(parsed.views?.[0].name).toBe('Grouped by Tags');
		});

		it('should update existing view if view with same name exists', async () => {
			const basePath = 'ErrlOS/Capture.base';
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
				views: [
					{
						type: 'table',
						name: 'Captures',
						order: ['note.capturedAt'],
					},
				],
			};

			await BaseManager.ensureBaseExists(app as any, basePath, config);

			const updatedView = {
				type: 'table' as const,
				name: 'Captures',
				order: ['note.tags', 'note.capturedAt'],
			};

			await BaseManager.addView(app as any, basePath, updatedView);

			// Verify view was updated, not duplicated
			const file = app.vault.getAbstractFileByPath(basePath) as TFile;
			const content = await app.vault.read(file);
			const parsed = JSON.parse(content) as BaseConfig;
			
			expect(parsed.views?.length).toBe(1);
			expect(parsed.views?.[0].order).toEqual(['note.tags', 'note.capturedAt']);
		});

		it('should throw error if Base file does not exist', async () => {
			const basePath = 'ErrlOS/Nonexistent.base';

			await expect(
				BaseManager.addView(app as any, basePath, {
					type: 'table',
					name: 'Test View',
				})
			).rejects.toThrow('Base file not found');
		});
	});

	describe('Base config validation', () => {
		it('should accept valid Base config with all fields', () => {
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
				properties: {
					capturedAt: { displayName: 'Captured' },
					tags: { displayName: 'Tags' },
				},
				views: [
					{
						type: 'table',
						name: 'Captures',
						order: ['note.capturedAt'],
					},
				],
				formulas: {
					status: 'if(note.tags.contains("important"), "high", "normal")',
				},
			};

			// Should not throw when creating
			expect(async () => {
				await BaseManager.ensureBaseExists(app as any, 'test.base', config);
			}).not.toThrow();
		});

		it('should accept minimal Base config with only filters', () => {
			const config: BaseConfig = {
				filters: 'note.type = "capture"',
			};

			// Should not throw when creating
			expect(async () => {
				await BaseManager.ensureBaseExists(app as any, 'test.base', config);
			}).not.toThrow();
		});
	});
});

