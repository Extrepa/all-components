import { App, TFile, TFolder, Notice } from "obsidian";
import { FileUtils } from "../utils/fileUtils";

/**
 * Shared APIs provided by the kernel to all organs
 * 
 * Provides common services like capture, logging, and file scanning
 * that can be used by any organ in the system.
 */
export class SharedAPIs {
	constructor(private app: App) {}

	/**
	 * Capture service: Append text to a capture file with timestamp
	 * 
	 * @param text - The text to capture
	 * @param filePath - Path to the capture file
	 * @param tag - Optional tag to add to the entry
	 * @throws Error if file creation or modification fails
	 */
	async capture(text: string, filePath: string, tag?: string): Promise<void> {
		try {
			const timestamp = new Date().toISOString();
			const tagLine = tag ? ` #${tag}` : "";
			const entry = `\n---\n**${timestamp}**${tagLine}\n${text}\n`;

			let file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
			
			if (!file) {
				// Ensure parent directory exists, then create the file
				try {
					await FileUtils.ensureParentDirectoryExists(this.app, filePath);
					await this.app.vault.create(filePath, `# Capture\n\n${entry}`);
				} catch (error) {
					// If file was created between check and create, read it and append
					if (error instanceof Error && error.message.includes("already exists")) {
						file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
						if (file) {
							const content = await this.app.vault.read(file);
							await this.app.vault.modify(file, content + entry);
							return; // Successfully appended
						}
					}
					console.error(`[Errl OS] Failed to create capture file at ${filePath}:`, error);
					throw new Error(`Failed to create capture file: ${error instanceof Error ? error.message : String(error)}`);
				}
			} else {
				// Append to existing file
				try {
					const content = await this.app.vault.read(file);
					await this.app.vault.modify(file, content + entry);
				} catch (error) {
					console.error(`[Errl OS] Failed to append to capture file ${filePath}:`, error);
					throw new Error(`Failed to append to capture file: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		} catch (error) {
			console.error("[Errl OS] Capture service error:", error);
			throw error;
		}
	}

	/**
	 * Logging service: Write to a log file
	 * 
	 * @param message - The log message to write
	 * @param logPath - Path to the log file
	 * @throws Error if file creation or modification fails
	 */
	async log(message: string, logPath: string): Promise<void> {
		try {
			const timestamp = new Date().toISOString();
			const logEntry = `\n[${timestamp}] ${message}`;

			let file = this.app.vault.getAbstractFileByPath(logPath) as TFile;
			
			if (!file) {
				// Ensure parent directory exists, then create the file
				try {
					await FileUtils.ensureParentDirectoryExists(this.app, logPath);
					await this.app.vault.create(logPath, `# Log\n\n${logEntry}`);
				} catch (error) {
					// If file was created between check and create, read it and append
					if (error instanceof Error && error.message.includes("already exists")) {
						file = this.app.vault.getAbstractFileByPath(logPath) as TFile;
						if (file) {
							const content = await this.app.vault.read(file);
							await this.app.vault.modify(file, content + logEntry);
							return; // Successfully appended
						}
					}
					console.error(`[Errl OS] Failed to create log file at ${logPath}:`, error);
					throw new Error(`Failed to create log file: ${error instanceof Error ? error.message : String(error)}`);
				}
			} else {
				try {
					const content = await this.app.vault.read(file);
					await this.app.vault.modify(file, content + logEntry);
				} catch (error) {
					console.error(`[Errl OS] Failed to append to log file ${logPath}:`, error);
					throw new Error(`Failed to append to log file: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		} catch (error) {
			console.error("[Errl OS] Logging service error:", error);
			throw error;
		}
	}

	/**
	 * File scanning: Get files modified within a time range
	 * 
	 * @param days - Number of days to look back
	 * @returns Array of markdown files modified within the specified time range
	 */
	getFilesModifiedSince(days: number): TFile[] {
		try {
			const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			return markdownFiles.filter(file => {
				return file.stat && file.stat.mtime >= cutoff;
			});
		} catch (error) {
			console.error(`[Errl OS] Error scanning files modified since ${days} days:`, error);
			return [];
		}
	}

	/**
	 * Get files in a directory (recursively)
	 * 
	 * @param dirPath - Path to the directory to scan
	 * @returns Array of markdown files found in the directory tree
	 */
	getFilesInDirectory(dirPath: string): TFile[] {
		try {
			const dir = this.app.vault.getAbstractFileByPath(dirPath);
			if (!dir) {
				console.warn(`[Errl OS] Directory not found: ${dirPath}`);
				return [];
			}
			
			const files: TFile[] = [];
			const traverse = (path: string) => {
				try {
					const abstractFile = this.app.vault.getAbstractFileByPath(path);
					if (abstractFile instanceof TFile && abstractFile.extension === "md") {
						files.push(abstractFile);
					} else if (abstractFile instanceof TFolder) {
						for (const child of abstractFile.children) {
							traverse(child.path);
						}
					}
				} catch (error) {
					console.error(`[Errl OS] Error traversing path ${path}:`, error);
				}
			};
			traverse(dirPath);
			return files;
		} catch (error) {
			console.error(`[Errl OS] Error getting files in directory ${dirPath}:`, error);
			return [];
		}
	}
}

