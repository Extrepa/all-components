import { Notice, App } from "obsidian";

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
	FileNotFound = "file_not_found",
	PathInvalid = "path_invalid",
	PermissionDenied = "permission_denied",
	RaceCondition = "race_condition",
	ConfigurationError = "configuration_error",
	OperationFailed = "operation_failed",
	ResourceConflict = "resource_conflict",
	NetworkError = "network_error",
	Unknown = "unknown",
}

/**
 * Enhanced error information
 */
export interface ErrorInfo {
	category: ErrorCategory;
	message: string;
	userMessage: string; // User-friendly message
	recoverable: boolean;
	context?: Record<string, any>;
	originalError?: Error;
}

/**
 * Comprehensive error handler for Errl OS
 * Provides consistent error handling across all organs
 */
export class ErrorHandler {
	/**
	 * Handle an error and return structured error information
	 */
	static handleError(error: unknown, context?: Record<string, any>): ErrorInfo {
		const errorInfo: ErrorInfo = {
			category: ErrorCategory.Unknown,
			message: "Unknown error occurred",
			userMessage: "An unexpected error occurred. Please check the console for details.",
			recoverable: false,
			context,
			originalError: error instanceof Error ? error : undefined,
		};

		if (error instanceof Error) {
			errorInfo.message = error.message;

			// Categorize based on error message patterns
			if (error.message.includes("not found") || error.message.includes("does not exist")) {
				errorInfo.category = ErrorCategory.FileNotFound;
				errorInfo.userMessage = "The requested file or folder could not be found. Please check the path in settings.";
				errorInfo.recoverable = true;
			} else if (error.message.includes("already exists")) {
				errorInfo.category = ErrorCategory.RaceCondition;
				errorInfo.userMessage = "The file already exists. This is usually harmless and the operation will continue.";
				errorInfo.recoverable = true;
			} else if (error.message.includes("path") || error.message.includes("invalid")) {
				errorInfo.category = ErrorCategory.PathInvalid;
				errorInfo.userMessage = "The file path is invalid. Please check your settings and ensure the path is correct.";
				errorInfo.recoverable = true;
			} else if (error.message.includes("permission") || error.message.includes("access")) {
				errorInfo.category = ErrorCategory.PermissionDenied;
				errorInfo.userMessage = "Permission denied. Please check file permissions or try a different location.";
				errorInfo.recoverable = false;
			} else if (error.message.includes("configure") || error.message.includes("settings")) {
				errorInfo.category = ErrorCategory.ConfigurationError;
				errorInfo.userMessage = "Configuration error. Please check your settings and try again.";
				errorInfo.recoverable = true;
			}
		}

		return errorInfo;
	}

	/**
	 * Handle an error and show a user-friendly notice
	 */
	static handleErrorWithNotice(
		app: App,
		error: unknown,
		context?: Record<string, any>,
		showConsoleError: boolean = true
	): ErrorInfo {
		const errorInfo = this.handleError(error, context);

		// Log to console for debugging
		if (showConsoleError) {
			console.error(`[Errl OS] ${errorInfo.category}:`, errorInfo.message, context);
			if (errorInfo.originalError) {
				console.error("[Errl OS] Original error:", errorInfo.originalError);
			}
		}

		// Show user-friendly notice (but not for race conditions that are handled)
		if (errorInfo.category !== ErrorCategory.RaceCondition || !errorInfo.recoverable) {
			new Notice(errorInfo.userMessage);
		}

		return errorInfo;
	}

	/**
	 * Show a user-friendly error notice
	 * Used by organs to display error messages to users
	 */
	static showErrorNotice(errorInfo: ErrorInfo): void {
		// Don't show notice for race conditions that are handled gracefully
		if (errorInfo.category === ErrorCategory.RaceCondition && errorInfo.recoverable) {
			return;
		}
		
		new Notice(errorInfo.userMessage);
	}

	/**
	 * Wrap an async function with error handling
	 */
	static async wrapAsync<T>(
		fn: () => Promise<T>,
		context?: Record<string, any>,
		onError?: (errorInfo: ErrorInfo) => void
	): Promise<T | null> {
		try {
			return await fn();
		} catch (error) {
			const errorInfo = this.handleError(error, context);
			if (onError) {
				onError(errorInfo);
			} else {
				console.error(`[Errl OS] Unhandled error in async operation:`, errorInfo);
			}
			return null;
		}
	}

	/**
	 * Validate a file path
	 */
	static validateFilePath(path: string): { valid: boolean; error?: string } {
		if (!path || typeof path !== "string") {
			return { valid: false, error: "Path is required and must be a string" };
		}

		if (path.trim() === "") {
			return { valid: false, error: "Path cannot be empty" };
		}

		// Check for path traversal attempts
		if (path.includes("..")) {
			return { valid: false, error: "Path cannot contain '..' (path traversal)" };
		}

		// Check for invalid characters
		const invalidChars = /[<>:"|?*\x00-\x1f]/;
		if (invalidChars.test(path)) {
			return { valid: false, error: "Path contains invalid characters" };
		}

		return { valid: true };
	}

	/**
	 * Validate a folder path
	 */
	static validateFolderPath(path: string): { valid: boolean; error?: string } {
		const fileValidation = this.validateFilePath(path);
		if (!fileValidation.valid) {
			return fileValidation;
		}

		// Folder paths should end with / or be valid
		if (path.endsWith("/")) {
			return { valid: true };
		}

		// Also allow paths without trailing slash
		return { valid: true };
	}

	/**
	 * Safely execute a file operation with retry logic for race conditions
	 */
	static async safeFileOperation<T>(
		operation: () => Promise<T>,
		fallback?: () => Promise<T>,
		maxRetries: number = 1
	): Promise<T | null> {
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				const errorInfo = this.handleError(error);

				// If it's a race condition and we have a fallback, try it
				if (errorInfo.category === ErrorCategory.RaceCondition && fallback) {
					try {
						return await fallback();
					} catch (fallbackError) {
						// If fallback also fails, continue to next attempt
						if (attempt < maxRetries) {
							continue;
						}
						console.error("[Errl OS] Fallback operation also failed:", fallbackError);
						return null;
					}
				}

				// If not recoverable or out of retries, return null
				if (!errorInfo.recoverable || attempt >= maxRetries) {
					console.error("[Errl OS] File operation failed:", errorInfo);
					return null;
				}

				// Wait a bit before retry (exponential backoff)
				await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
			}
		}

		return null;
	}
}

