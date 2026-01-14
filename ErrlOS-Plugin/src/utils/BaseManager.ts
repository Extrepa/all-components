import { App, TFile } from "obsidian";
import { FileUtils } from "./fileUtils";
import { ErrorHandler, ErrorCategory } from "./ErrorHandler";
import { BaseValidator } from "./BaseValidator";

/**
 * Base property configuration
 * Enhanced with type hints, formatting, and visibility options
 */
export interface BaseProperty {
	displayName: string;
	type?: "text" | "number" | "date" | "boolean" | "select" | "multiselect";
	format?: "relative" | "absolute" | "iso" | "short" | "long"; // For dates
	sortable?: boolean;
	visible?: boolean;
	options?: string[]; // For select/multiselect
}

/**
 * Base configuration structure
 */
export interface BaseConfig {
	filters: string;
	properties?: Record<string, BaseProperty | { displayName: string }>; // Support both enhanced and simple format
	views?: BaseView[];
	formulas?: Record<string, string>;
}

/**
 * Base view configuration
 */
export interface BaseView {
	type: "table" | "list" | "card" | "map";
	name: string;
	order?: string[];
	groupBy?: string;
	sortBy?: string;
	filter?: string;
}

/**
 * BaseManager - Utility for creating and managing Obsidian Base files
 * 
 * Base files are JSON-formatted files with .base extension that define
 * database-like views over notes in Obsidian.
 */
export class BaseManager {
	/**
	 * Ensure a Base file exists, creating it if necessary
	 * 
	 * @param app - Obsidian App instance
	 * @param basePath - Path to the Base file (e.g., "ErrlOS/Capture.base")
	 * @param config - Base configuration
	 * @returns The Base file (existing or newly created)
	 * @throws Error if Base file cannot be created or is invalid
	 */
	static async ensureBaseExists(
		app: App,
		basePath: string,
		config: BaseConfig
	): Promise<TFile> {
		// Validate config
		if (!this.validateBaseConfig(config)) {
			// Get detailed validation results
			const validationResult = BaseValidator.validateConfig(config);
			const validationMessage = BaseValidator.getValidationMessage(validationResult);
			console.error(`[BaseManager] Base configuration validation failed:\n${validationMessage}`);
			throw new Error(`Invalid Base configuration:\n${validationMessage}`);
		}

		// Log validation warnings if any
		const validationResult = BaseValidator.validateConfig(config);
		if (validationResult.warnings.length > 0) {
			console.warn(`[BaseManager] Base configuration warnings for ${basePath}:`);
			validationResult.warnings.forEach(warning => {
				console.warn(`  • ${warning}`);
			});
		}

		// Check if Base file already exists
		const existing = app.vault.getAbstractFileByPath(basePath);
		if (existing instanceof TFile) {
			// Validate existing Base file
			try {
				const existingConfig = await this.parseBaseFile(existing);
				if (existingConfig) {
					// Base exists and is valid, return it
					console.log(`[BaseManager] Base file exists and is valid: ${basePath}`);
					return existing;
				}
			} catch (error) {
				// Base file exists but is invalid - backup and recreate
				console.warn(`[BaseManager] Invalid Base file at ${basePath}, recreating...`, error);
				await this.backupAndRecreateBase(app, basePath, config);
			}
		}

		// Create new Base file
		try {
			await FileUtils.ensureParentDirectoryExists(app, basePath);
			const baseContent = JSON.stringify(config, null, "\t");
			console.log(`[BaseManager] Creating new Base file: ${basePath}`);
			console.log(`[BaseManager] Base config:`, {
				filters: config.filters,
				propertiesCount: config.properties ? Object.keys(config.properties).length : 0,
				viewsCount: config.views ? config.views.length : 0,
				formulasCount: config.formulas ? Object.keys(config.formulas).length : 0,
			});
			const baseFile = await app.vault.create(basePath, baseContent);
			console.log(`[BaseManager] Base file created successfully: ${basePath}`);
			return baseFile;
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "ensureBaseExists",
				basePath,
			});

			// Handle race condition: file might have been created by another process
			if (errorInfo.category === ErrorCategory.RaceCondition) {
				const file = app.vault.getAbstractFileByPath(basePath);
				if (file instanceof TFile) {
					return file;
				}
			}

			throw new Error(`Failed to create Base file "${basePath}": ${errorInfo.message}`);
		}
	}

	/**
	 * Open a Base file in Obsidian
	 * 
	 * @param app - Obsidian App instance
	 * @param basePath - Path to the Base file
	 * @throws Error if Base file cannot be opened
	 */
	static async openBase(app: App, basePath: string): Promise<void> {
		const file = app.vault.getAbstractFileByPath(basePath);
		if (!(file instanceof TFile)) {
			console.error(`[BaseManager] Base file not found: ${basePath}`);
			throw new Error(`Base file not found: ${basePath}`);
		}

		try {
			console.log(`[BaseManager] Opening Base file: ${basePath}`);
			await app.workspace.getLeaf(true).openFile(file);
			console.log(`[BaseManager] Base file opened successfully: ${basePath}`);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "openBase",
				basePath,
			});
			console.error(`[BaseManager] Failed to open Base file: ${basePath}`, errorInfo);
			throw new Error(`Failed to open Base file "${basePath}": ${errorInfo.message}`);
		}
	}

	/**
	 * Update the filter in an existing Base file
	 * 
	 * @param app - Obsidian App instance
	 * @param basePath - Path to the Base file
	 * @param newFilter - New filter string
	 * @throws Error if Base file cannot be updated
	 */
	static async updateBaseFilter(app: App, basePath: string, newFilter: string): Promise<void> {
		const file = app.vault.getAbstractFileByPath(basePath);
		if (!(file instanceof TFile)) {
			throw new Error(`Base file not found: ${basePath}`);
		}

		try {
			const config = await this.parseBaseFile(file);
			if (!config) {
				throw new Error("Invalid Base file format");
			}

			console.log(`[BaseManager] Updating filter in Base: ${basePath}`);
			console.log(`[BaseManager] Old filter: ${config.filters}`);
			console.log(`[BaseManager] New filter: ${newFilter}`);
			
			config.filters = newFilter;
			const updatedContent = JSON.stringify(config, null, "\t");
			await app.vault.modify(file, updatedContent);
			console.log(`[BaseManager] Filter updated successfully: ${basePath}`);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "updateBaseFilter",
				basePath,
			});
			throw new Error(`Failed to update Base filter: ${errorInfo.message}`);
		}
	}

	/**
	 * Add a view to an existing Base file
	 * 
	 * @param app - Obsidian App instance
	 * @param basePath - Path to the Base file
	 * @param view - View configuration to add
	 * @throws Error if Base file cannot be updated
	 */
	static async addView(app: App, basePath: string, view: BaseView): Promise<void> {
		const file = app.vault.getAbstractFileByPath(basePath);
		if (!(file instanceof TFile)) {
			throw new Error(`Base file not found: ${basePath}`);
		}

		try {
			const config = await this.parseBaseFile(file);
			if (!config) {
				throw new Error("Invalid Base file format");
			}

			if (!config.views) {
				config.views = [];
			}

			// Check if view with same name already exists
			const existingIndex = config.views.findIndex(v => v.name === view.name);
			if (existingIndex >= 0) {
				// Update existing view
				console.log(`[BaseManager] Updating existing view "${view.name}" in Base: ${basePath}`);
				config.views[existingIndex] = view;
			} else {
				// Add new view
				console.log(`[BaseManager] Adding new view "${view.name}" to Base: ${basePath}`);
				config.views.push(view);
			}

			const updatedContent = JSON.stringify(config, null, "\t");
			await app.vault.modify(file, updatedContent);
			console.log(`[BaseManager] View "${view.name}" added/updated successfully: ${basePath}`);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "addView",
				basePath,
			});
			throw new Error(`Failed to add view to Base: ${errorInfo.message}`);
		}
	}

	/**
	 * Validate Base configuration
	 * 
	 * @param config - Base configuration to validate
	 * @returns true if valid, false otherwise
	 */
	private static validateBaseConfig(config: BaseConfig): boolean {
		if (!config || typeof config !== "object") {
			return false;
		}

		if (!config.filters || typeof config.filters !== "string") {
			return false;
		}

		// Validate properties if present
		if (config.properties) {
			if (typeof config.properties !== "object") {
				return false;
			}
			for (const [key, value] of Object.entries(config.properties)) {
				if (!value || typeof value !== "object" || typeof value.displayName !== "string") {
					return false;
				}
				// Validate enhanced property format if used
				const prop = value as BaseProperty;
				if (prop.type && !["text", "number", "date", "boolean", "select", "multiselect"].includes(prop.type)) {
					return false;
				}
				if (prop.format && !["relative", "absolute", "iso", "short", "long"].includes(prop.format)) {
					return false;
				}
			}
		}

		// Validate views if present
		if (config.views) {
			if (!Array.isArray(config.views)) {
				return false;
			}
			for (const view of config.views) {
				if (!this.validateBaseView(view)) {
					return false;
				}
			}
		}

		// Validate formulas if present
		if (config.formulas) {
			if (typeof config.formulas !== "object") {
				return false;
			}
			for (const value of Object.values(config.formulas)) {
				if (typeof value !== "string") {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Validate Base view configuration
	 * 
	 * @param view - View configuration to validate
	 * @returns true if valid, false otherwise
	 */
	private static validateBaseView(view: BaseView): boolean {
		if (!view || typeof view !== "object") {
			return false;
		}

		const validTypes = ["table", "list", "card", "map"];
		if (!validTypes.includes(view.type)) {
			return false;
		}

		if (!view.name || typeof view.name !== "string") {
			return false;
		}

		return true;
	}

	/**
	 * Parse a Base file and return its configuration
	 * 
	 * @param file - Base file to parse
	 * @returns Base configuration or null if invalid
	 */
	private static async parseBaseFile(file: TFile): Promise<BaseConfig | null> {
		try {
			const content = await file.vault.read(file);
			const config = JSON.parse(content) as BaseConfig;

			// Validate parsed config
			if (this.validateBaseConfig(config)) {
				return config;
			}

			return null;
		} catch (error) {
			// Invalid JSON or invalid structure
			console.error(`[BaseManager] Failed to parse Base file ${file.path}:`, error);
			return null;
		}
	}

	/**
	 * Backup and recreate a corrupted Base file
	 * 
	 * @param app - Obsidian App instance
	 * @param basePath - Path to the Base file
	 * @param config - New Base configuration
	 */
	private static async backupAndRecreateBase(
		app: App,
		basePath: string,
		config: BaseConfig
	): Promise<void> {
		const file = app.vault.getAbstractFileByPath(basePath);
		if (file instanceof TFile) {
			try {
				// Create backup
				const backupPath = `${basePath}.backup.${Date.now()}`;
				const content = await app.vault.read(file);
				await app.vault.create(backupPath, content);
				console.log(`[BaseManager] Created backup at ${backupPath}`);
				console.log(`[BaseManager] Backup size: ${content.length} bytes`);

				// Delete corrupted file
				await app.vault.delete(file);
				console.log(`[BaseManager] Deleted corrupted Base file: ${basePath}`);
			} catch (error) {
				console.error(`[BaseManager] Failed to backup Base file:`, error);
				// Continue with recreation anyway
			}
		}

		// Recreate with new config
		console.log(`[BaseManager] Recreating Base file with new configuration: ${basePath}`);
		await this.ensureBaseExists(app, basePath, config);
	}
}

