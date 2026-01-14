import { App, TFile, TFolder } from "obsidian";
import { ErrorHandler, ErrorCategory } from "./ErrorHandler";

/**
 * Utility functions for file operations with comprehensive error handling
 */
export class FileUtils {
	/**
	 * Ensure a directory exists, creating it if necessary
	 * Enhanced with better error handling
	 */
	static async ensureDirectoryExists(app: App, dirPath: string): Promise<void> {
		// Validate path first
		const validation = ErrorHandler.validateFolderPath(dirPath);
		if (!validation.valid) {
			throw new Error(`Invalid directory path: ${validation.error}`);
		}

		const dir = app.vault.getAbstractFileByPath(dirPath);
		if (!dir) {
			// Create the directory, handling the case where it might already exist
			try {
				await app.vault.createFolder(dirPath);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { dirPath, operation: "ensureDirectoryExists" });
				
				// If folder already exists (race condition), that's fine - verify it
				if (errorInfo.category === ErrorCategory.RaceCondition) {
					const existingDir = app.vault.getAbstractFileByPath(dirPath);
					if (existingDir instanceof TFolder) {
						// Folder exists, which is what we want - no error
						return;
					}
				}
				
				// For other errors, rethrow with context
				throw new Error(`Failed to create directory "${dirPath}": ${errorInfo.message}`);
			}
		} else if (!(dir instanceof TFolder)) {
			throw new Error(`Path ${dirPath} exists but is not a directory`);
		}
	}

	/**
	 * Ensure the parent directory of a file path exists
	 * Creates all parent directories in the path if needed
	 * Enhanced with error handling
	 */
	static async ensureParentDirectoryExists(app: App, filePath: string): Promise<void> {
		// Validate file path first
		const validation = ErrorHandler.validateFilePath(filePath);
		if (!validation.valid) {
			throw new Error(`Invalid file path: ${validation.error}`);
		}

		const parts = filePath.split("/");
		if (parts.length > 1) {
			// Build up the path, creating each directory level
			let currentPath = "";
			for (let i = 0; i < parts.length - 1; i++) {
				if (i === 0) {
					currentPath = parts[i];
				} else {
					currentPath = `${currentPath}/${parts[i]}`;
				}
				if (currentPath) {
					try {
						await this.ensureDirectoryExists(app, currentPath);
					} catch (error) {
						const errorInfo = ErrorHandler.handleError(error, { 
							filePath, 
							currentPath, 
							operation: "ensureParentDirectoryExists" 
						});
						throw new Error(`Failed to create parent directory "${currentPath}" for file "${filePath}": ${errorInfo.message}`);
					}
				}
			}
		}
	}

	/**
	 * Get or create a file, returning its content
	 * Enhanced with error handling and race condition handling
	 */
	static async getOrCreateFile(
		app: App,
		filePath: string,
		defaultContent: string = ""
	): Promise<TFile> {
		// Validate path
		const validation = ErrorHandler.validateFilePath(filePath);
		if (!validation.valid) {
			throw new Error(`Invalid file path: ${validation.error}`);
		}

		let file = app.vault.getAbstractFileByPath(filePath) as TFile;
		if (!file) {
			try {
				await this.ensureParentDirectoryExists(app, filePath);
				file = await app.vault.create(filePath, defaultContent);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { filePath, operation: "getOrCreateFile" });
				
				// Handle race condition: file might have been created by another process
				if (errorInfo.category === ErrorCategory.RaceCondition) {
					file = app.vault.getAbstractFileByPath(filePath) as TFile;
					if (file) {
						return file;
					}
				}
				
				throw new Error(`Failed to create file "${filePath}": ${errorInfo.message}`);
			}
		}
		return file;
	}

	/**
	 * Sanitize a file name to prevent security issues
	 * Removes invalid characters, path traversal sequences, and limits length
	 * 
	 * @param name - The file name to sanitize
	 * @returns Sanitized file name safe for use
	 */
	static sanitizeFileName(name: string): string {
		if (!name || typeof name !== 'string') {
			return 'unnamed';
		}

		const sanitized = name
			.replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid characters
			.replace(/\.\./g, '') // Remove path traversal sequences
			.replace(/^\.+/, '') // Remove leading dots
			.replace(/\.+$/, '') // Remove trailing dots
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.trim()
			.substring(0, 200); // Limit length to prevent issues

		// Ensure we have a valid name
		if (!sanitized || sanitized.length === 0) {
			return 'unnamed';
		}

		return sanitized;
	}

	/**
	 * Safely read a file with error handling
	 */
	static async safeReadFile(app: App, filePath: string): Promise<string | null> {
		try {
			const validation = ErrorHandler.validateFilePath(filePath);
			if (!validation.valid) {
				console.error(`[Errl OS] Invalid file path: ${validation.error}`);
				return null;
			}

			const file = app.vault.getAbstractFileByPath(filePath);
			if (!file || !(file instanceof TFile)) {
				console.error(`[Errl OS] File not found: ${filePath}`);
				return null;
			}

			return await app.vault.read(file);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { filePath, operation: "safeReadFile" });
			console.error(`[Errl OS] Failed to read file "${filePath}":`, errorInfo.message);
			return null;
		}
	}

	/**
	 * Safely write to a file with error handling and race condition protection
	 */
	static async safeWriteFile(
		app: App,
		filePath: string,
		content: string,
		createIfMissing: boolean = false
	): Promise<boolean> {
		try {
			const validation = ErrorHandler.validateFilePath(filePath);
			if (!validation.valid) {
				console.error(`[Errl OS] Invalid file path: ${validation.error}`);
				return false;
			}

			const file = app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				await app.vault.modify(file, content);
				return true;
			} else if (createIfMissing) {
				await this.ensureParentDirectoryExists(app, filePath);
				await app.vault.create(filePath, content);
				return true;
			} else {
				console.error(`[Errl OS] File not found and createIfMissing is false: ${filePath}`);
				return false;
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { filePath, operation: "safeWriteFile" });
			
			// Handle race condition: file might have been created/modified by another process
			if (errorInfo.category === ErrorCategory.RaceCondition && createIfMissing) {
				const file = app.vault.getAbstractFileByPath(filePath);
				if (file instanceof TFile) {
					try {
						await app.vault.modify(file, content);
						return true;
					} catch (retryError) {
						console.error(`[Errl OS] Retry also failed for "${filePath}":`, retryError);
					}
				}
			}
			
			console.error(`[Errl OS] Failed to write file "${filePath}":`, errorInfo.message);
			return false;
		}
	}

	/**
	 * Check if a file exists
	 */
	static fileExists(app: App, filePath: string): boolean {
		if (!filePath || typeof filePath !== 'string') {
			return false;
		}

		const file = app.vault.getAbstractFileByPath(filePath);
		return file instanceof TFile;
	}

	/**
	 * Check if a folder exists
	 */
	static folderExists(app: App, folderPath: string): boolean {
		if (!folderPath || typeof folderPath !== 'string') {
			return false;
		}

		const folder = app.vault.getAbstractFileByPath(folderPath);
		return folder instanceof TFolder;
	}
}

