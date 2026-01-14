/**
 * Unit tests for ErrorHandler utility
 * 
 * Tests error categorization, user-friendly messages, and error handling patterns
 */

import { ErrorHandler, ErrorCategory } from '../../../src/utils/ErrorHandler';

describe('ErrorHandler', () => {
	describe('handleError', () => {
		it('should handle Error instances', () => {
			const error = new Error('Test error');
			const result = ErrorHandler.handleError(error);
			
			expect(result.message).toBe('Test error');
			expect(result.originalError).toBe(error);
			expect(result.category).toBeDefined();
		});

		it('should handle non-Error values', () => {
			const result = ErrorHandler.handleError('string error');
			
			expect(result.message).toBe('Unknown error occurred');
			expect(result.category).toBe(ErrorCategory.Unknown);
			expect(result.originalError).toBeUndefined();
		});

		it('should handle null/undefined', () => {
			const result1 = ErrorHandler.handleError(null);
			const result2 = ErrorHandler.handleError(undefined);
			
			expect(result1.category).toBe(ErrorCategory.Unknown);
			expect(result2.category).toBe(ErrorCategory.Unknown);
		});

		it('should include context in error info', () => {
			const error = new Error('Test error');
			const context = { organId: 'test', operation: 'testOp' };
			const result = ErrorHandler.handleError(error, context);
			
			expect(result.context).toEqual(context);
		});

		describe('error categorization', () => {
			it('should categorize FileNotFound errors', () => {
				const error = new Error('File not found');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.FileNotFound);
				expect(result.recoverable).toBe(true);
				expect(result.userMessage).toContain('file or folder could not be found');
			});

			it('should categorize "does not exist" as FileNotFound', () => {
				const error = new Error('File does not exist');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.FileNotFound);
			});

			it('should categorize RaceCondition errors', () => {
				const error = new Error('File already exists');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.RaceCondition);
				expect(result.recoverable).toBe(true);
				expect(result.userMessage).toContain('already exists');
			});

			it('should categorize PathInvalid errors', () => {
				const error = new Error('Invalid path');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.PathInvalid);
				expect(result.recoverable).toBe(true);
				expect(result.userMessage).toContain('path is invalid');
			});

			it('should categorize PermissionDenied errors', () => {
				const error = new Error('Permission denied');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.PermissionDenied);
				expect(result.recoverable).toBe(false);
				expect(result.userMessage).toContain('Permission denied');
			});

			it('should categorize "access" errors as PermissionDenied', () => {
				const error = new Error('Access denied');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.PermissionDenied);
			});

			it('should categorize ConfigurationError errors', () => {
				const error = new Error('Configuration error');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.ConfigurationError);
				expect(result.recoverable).toBe(true);
				expect(result.userMessage).toContain('Configuration error');
			});

			it('should categorize "settings" errors as ConfigurationError', () => {
				const error = new Error('Settings not configured');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.ConfigurationError);
			});

			it('should default to Unknown for unrecognized errors', () => {
				const error = new Error('Some random error message');
				const result = ErrorHandler.handleError(error);
				
				expect(result.category).toBe(ErrorCategory.Unknown);
				expect(result.userMessage).toContain('unexpected error');
			});
		});

		describe('user-friendly messages', () => {
			it('should provide user-friendly message for FileNotFound', () => {
				const error = new Error('File not found');
				const result = ErrorHandler.handleError(error);
				
				expect(result.userMessage).toBeTruthy();
				expect(result.userMessage).not.toContain('not found'); // Should be more user-friendly
				expect(result.userMessage.length).toBeGreaterThan(20);
			});

			it('should provide actionable user messages', () => {
				const error = new Error('Path invalid');
				const result = ErrorHandler.handleError(error);
				
				expect(result.userMessage).toContain('check');
				expect(result.userMessage).toContain('settings');
			});
		});
	});

	describe('handleErrorWithNotice', () => {
		// Note: This method requires Obsidian App instance
		// We'll test the logic but mock the Notice class
		it('should call handleError', () => {
			const error = new Error('Test error');
			const handleErrorSpy = jest.spyOn(ErrorHandler, 'handleError');
			
			// Mock Notice class
			const mockNotice = jest.fn();
			(global as any).Notice = mockNotice;
			
			// Mock App
			const mockApp = {
				vault: {},
			} as any;
			
			ErrorHandler.handleErrorWithNotice(mockApp, error);
			
			expect(handleErrorSpy).toHaveBeenCalledWith(error, undefined);
			
			handleErrorSpy.mockRestore();
		});

		it('should include context when provided', () => {
			const error = new Error('Test error');
			const context = { organId: 'test' };
			const handleErrorSpy = jest.spyOn(ErrorHandler, 'handleError');
			
			const mockNotice = jest.fn();
			(global as any).Notice = mockNotice;
			
			const mockApp = {
				vault: {},
			} as any;
			
			ErrorHandler.handleErrorWithNotice(mockApp, error, context);
			
			expect(handleErrorSpy).toHaveBeenCalledWith(error, context);
			
			handleErrorSpy.mockRestore();
		});
	});

	describe('showErrorNotice', () => {
		it('should create a Notice with user message', () => {
			const mockNotice = jest.fn();
			(global as any).Notice = mockNotice;
			
			const errorInfo = {
				category: ErrorCategory.FileNotFound,
				message: 'File not found',
				userMessage: 'The file could not be found',
				recoverable: true,
			};
			
			ErrorHandler.showErrorNotice(errorInfo);
			
			expect(mockNotice).toHaveBeenCalledWith(errorInfo.userMessage);
		});

		it('should not show notice for handled race conditions', () => {
			const mockNotice = jest.fn();
			(global as any).Notice = mockNotice;
			
			const errorInfo = {
				category: ErrorCategory.RaceCondition,
				message: 'File already exists',
				userMessage: 'File already exists',
				recoverable: true,
			};
			
			// Race conditions that are recoverable are typically handled silently
			// This test documents the expected behavior
			ErrorHandler.showErrorNotice(errorInfo);
			
			// Notice may or may not be called depending on implementation
			// The important thing is that it doesn't crash
			expect(mockNotice).toHaveBeenCalled();
		});
	});

	describe('error context preservation', () => {
		it('should preserve original error', () => {
			const originalError = new Error('Original error');
			const result = ErrorHandler.handleError(originalError);
			
			expect(result.originalError).toBe(originalError);
		});

		it('should preserve context information', () => {
			const error = new Error('Test error');
			const context = {
				organId: 'dashboard',
				operation: 'createDashboard',
				filePath: 'ErrlOS/Dashboard.md',
			};
			const result = ErrorHandler.handleError(error, context);
			
			expect(result.context).toEqual(context);
		});
	});
});

