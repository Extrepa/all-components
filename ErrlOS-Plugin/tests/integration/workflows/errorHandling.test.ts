/**
 * Integration tests for error handling workflows
 * 
 * Tests error handling across organ operations and file system interactions
 */

/// <reference path="../../jest.d.ts" />

import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../../src/organs/dashboard/DashboardOrgan';
import { CaptureOrgan } from '../../../src/organs/capture/CaptureOrgan';
import { ErrorHandler, ErrorCategory } from '../../../src/utils/ErrorHandler';
import { MockApp, TestUtils } from '../../setup';

describe('Error Handling Workflow', () => {
	let kernel: ErrlKernel;
	let app: MockApp;
	let plugin: any;

	beforeEach(async () => {
		app = TestUtils.createTestApp();
		plugin = {
			loadData: async () => ({}),
			saveData: async () => {},
			app: app,
			addCommand: jest.fn(),
		};
		kernel = new ErrlKernel(plugin as any, app as any);
		await kernel.initialize();
	});

	describe('ErrorHandler Integration', () => {
		it('should categorize file not found errors', () => {
			const error = new Error('File not found');
			const errorInfo = ErrorHandler.handleError(error);
			
			expect(errorInfo.category).toBe(ErrorCategory.FileNotFound);
			expect(errorInfo.recoverable).toBe(true);
		});

		it('should categorize race condition errors', () => {
			const error = new Error('File already exists');
			const errorInfo = ErrorHandler.handleError(error);
			
			expect(errorInfo.category).toBe(ErrorCategory.RaceCondition);
			expect(errorInfo.recoverable).toBe(true);
		});

		it('should provide user-friendly error messages', () => {
			const error = new Error('File not found');
			const errorInfo = ErrorHandler.handleError(error);
			
			expect(errorInfo.userMessage).toBeTruthy();
			expect(errorInfo.userMessage.length).toBeGreaterThan(20);
			expect(errorInfo.userMessage).not.toContain('not found'); // Should be user-friendly
		});

		it('should preserve error context', () => {
			const error = new Error('Test error');
			const context = { organId: 'dashboard', operation: 'create' };
			const errorInfo = ErrorHandler.handleError(error, context);
			
			expect(errorInfo.context).toEqual(context);
		});
	});

	describe('Organ Error Handling', () => {
		it('should handle file creation errors gracefully', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			kernel.registerOrgan(organ);
			await kernel.enableOrgan('dashboard', true);
			
			// Mock vault to throw error
			const originalCreate = app.vault.create;
			app.vault.create = jest.fn().mockRejectedValue(new Error('Permission denied'));
			
			// Should handle error gracefully
			try {
				await (organ as any).createDashboard();
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error);
				expect(errorInfo.category).toBe(ErrorCategory.PermissionDenied);
			}
			
			// Restore
			app.vault.create = originalCreate;
		});

		it('should handle invalid path errors', () => {
			const validation = ErrorHandler.validateFilePath('../invalid');
			expect(validation.valid).toBe(false);
			expect(validation.error).toContain('path traversal');
		});

		it('should handle empty path errors', () => {
			const validation = ErrorHandler.validateFilePath('');
			expect(validation.valid).toBe(false);
			expect(validation.error).toBeTruthy();
		});
	});

	describe('Error Recovery', () => {
		it('should recover from race conditions', async () => {
			const error = new Error('File already exists');
			const errorInfo = ErrorHandler.handleError(error);
			
			expect(errorInfo.recoverable).toBe(true);
			expect(errorInfo.category).toBe(ErrorCategory.RaceCondition);
		});

		it('should not recover from permission errors', () => {
			const error = new Error('Permission denied');
			const errorInfo = ErrorHandler.handleError(error);
			
			expect(errorInfo.recoverable).toBe(false);
			expect(errorInfo.category).toBe(ErrorCategory.PermissionDenied);
		});
	});
});

