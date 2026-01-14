import { Vault, TFile, TFolder } from "obsidian";

/**
 * Validation result for path validation
 */
export interface ValidationResult {
	isValid: boolean;
	exists: boolean;
	message: string;
	suggestions: string[];
}

/**
 * Path validation utility
 * Provides path validation and suggestions for common folder patterns
 */
export class PathValidator {
	/**
	 * Validate a path
	 * 
	 * @param vault - The Obsidian vault instance
	 * @param path - The path to validate
	 * @param mustExist - Whether the path must exist to be valid
	 * @returns Validation result with status, message, and suggestions
	 */
	static validatePath(vault: Vault, path: string, mustExist: boolean = false): ValidationResult {
		// Empty path validation
		if (!path || path.trim() === "") {
			return {
				isValid: !mustExist,
				exists: false,
				message: mustExist ? "Path is required" : "Path not configured",
				suggestions: this.suggestCommonPaths(vault),
			};
		}

		// Check if path exists
		const file = vault.getAbstractFileByPath(path);
		const exists = file !== null;
		const isFolder = file instanceof TFolder;
		const isFile = file instanceof TFile;

		// Path format validation (basic checks)
		// Check for path traversal attempts
		const hasPathTraversal = /\.\.(\/|\\)/.test(path) || path.includes('..');
		if (hasPathTraversal) {
			return {
				isValid: false,
				exists: false,
				message: "Path contains invalid traversal sequences",
				suggestions: [],
			};
		}

		// Check for invalid characters
		const hasInvalidChars = /[<>:"|?*]/.test(path);
		if (hasInvalidChars) {
			return {
				isValid: false,
				exists: false,
				message: "Path contains invalid characters",
				suggestions: [],
			};
		}

		// If must exist, check existence
		if (mustExist && !exists) {
			return {
				isValid: false,
				exists: false,
				message: `Path not found: "${path}"`,
				suggestions: this.suggestCommonPaths(vault),
			};
		}

		// Path exists and is valid
		if (exists) {
			return {
				isValid: true,
				exists: true,
				message: isFolder ? "Folder found" : "File found",
				suggestions: [],
			};
		}

		// Path doesn't exist but that's okay (not required)
		return {
			isValid: true,
			exists: false,
			message: "Path not found (will be created if needed)",
			suggestions: this.suggestCommonPaths(vault),
		};
	}

	/**
	 * Suggest common folder patterns based on vault structure
	 * 
	 * @param vault - The Obsidian vault instance
	 * @returns Array of suggested paths that exist in the vault
	 */
	static suggestCommonPaths(vault: Vault): string[] {
		const suggestions: string[] = [];
		const commonPatterns = [
			"Projects/",
			"projects/",
			"02-Projects/",
			"Projects",
			"projects",
			"02-Projects",
		];

		// Check which patterns exist
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFolder) {
				suggestions.push(pattern);
			}
		}

		// Also check root-level folders that might be project folders
		const root = vault.getRoot();
		if (root) {
			for (const child of root.children) {
				if (child instanceof TFolder) {
					const name = child.name.toLowerCase();
					// Check if it looks like a projects folder
					if (name.includes("project") && !suggestions.includes(child.path)) {
						suggestions.push(child.path);
					}
				}
			}
		}

		return suggestions;
	}

	/**
	 * Suggest common lore/creative folder patterns
	 * 
	 * @param vault - The Obsidian vault instance
	 * @returns Array of suggested paths for lore/creative content
	 */
	static suggestLorePaths(vault: Vault): string[] {
		const suggestions: string[] = [];
		const commonPatterns = [
			"03-Creative/Lore Hub/",
			"Creative/Lore/",
			"Lore/",
			"lore/",
			"Creative/",
			"creative/",
		];

		// Check which patterns exist
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFolder) {
				suggestions.push(pattern);
			}
		}

		// Also check root-level folders
		const root = vault.getRoot();
		if (root) {
			for (const child of root.children) {
				if (child instanceof TFolder) {
					const name = child.name.toLowerCase();
					if ((name.includes("lore") || name.includes("creative")) && !suggestions.includes(child.path)) {
						suggestions.push(child.path);
					}
				}
			}
		}

		return suggestions;
	}

	/**
	 * Validate multiple paths (for lore engine paths array)
	 * 
	 * @param vault - The Obsidian vault instance
	 * @param paths - Array of paths to validate
	 * @param mustExist - Whether paths must exist to be valid
	 * @returns Array of validation results
	 */
	static validatePaths(vault: Vault, paths: string[], mustExist: boolean = false): ValidationResult[] {
		return paths.map(path => this.validatePath(vault, path, mustExist));
	}
}

