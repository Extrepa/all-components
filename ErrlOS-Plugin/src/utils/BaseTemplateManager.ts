import { App, TFile, TFolder } from "obsidian";
import { BaseTemplate, DEFAULT_BASE_TEMPLATES } from "./BaseTemplate";
import { BaseConfig, BaseManager } from "./BaseManager";
import { FileUtils } from "./fileUtils";
import { ErrorHandler } from "./ErrorHandler";

/**
 * BaseTemplateManager - Manages Base templates and template instantiation
 */
export class BaseTemplateManager {
	private static customTemplatesPath = "ErrlOS/.templates/bases/";

	/**
	 * Get a template by ID
	 */
	static async getTemplate(id: string, app: App): Promise<BaseTemplate | null> {
		// Check default templates first
		const defaultTemplate = DEFAULT_BASE_TEMPLATES.find(t => t.id === id);
		if (defaultTemplate) {
			return defaultTemplate;
		}

		// Check custom templates
		return await this.getCustomTemplate(id, app);
	}

	/**
	 * List all available templates, optionally filtered by category
	 */
	static async listTemplates(app: App, category?: "organ" | "system" | "custom"): Promise<BaseTemplate[]> {
		const templates: BaseTemplate[] = [];

		// Add default templates
		if (!category || category === "organ") {
			templates.push(...DEFAULT_BASE_TEMPLATES.filter(t => t.category === "organ"));
		}
		if (!category || category === "custom") {
			templates.push(...DEFAULT_BASE_TEMPLATES.filter(t => t.category === "custom"));
		}

		// Add custom templates
		const customTemplates = await this.listCustomTemplates(app);
		if (!category || category === "custom") {
			templates.push(...customTemplates);
		}

		return templates;
	}

	/**
	 * Instantiate a template to create a Base configuration
	 * Supports variable substitution in filters and other string fields
	 */
	static async instantiateTemplate(
		templateId: string,
		app: App,
		variables?: Record<string, string>
	): Promise<BaseConfig> {
		const template = await this.getTemplate(templateId, app);
		if (!template) {
			throw new Error(`Template not found: ${templateId}`);
		}

		// Validate required variables
		if (template.variables) {
			for (const [key, varDef] of Object.entries(template.variables)) {
				if (varDef.required && (!variables || !variables[key])) {
					throw new Error(`Required variable missing: ${key}`);
				}
			}
		}

		// Deep clone the config
		const config: BaseConfig = JSON.parse(JSON.stringify(template.config));

		// Substitute variables in filters
		if (variables) {
			config.filters = this.substituteVariables(config.filters, variables);

			// Substitute variables in view filters
			if (config.views) {
				config.views = config.views.map(view => ({
					...view,
					filter: view.filter ? this.substituteVariables(view.filter, variables) : undefined,
				}));
			}
		}

		return config;
	}

	/**
	 * Substitute variables in a string (e.g., "{{type}}" -> actual value)
	 */
	private static substituteVariables(str: string, variables: Record<string, string>): string {
		let result = str;
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
			result = result.replace(regex, value);
		}
		return result;
	}

	/**
	 * Create a Base from a template
	 */
	static async createBaseFromTemplate(
		app: App,
		templateId: string,
		basePath: string,
		variables?: Record<string, string>
	): Promise<TFile> {
		const config = await this.instantiateTemplate(templateId, app, variables);
		return await BaseManager.ensureBaseExists(app, basePath, config);
	}

	/**
	 * Save a custom template
	 */
	static async saveCustomTemplate(app: App, template: BaseTemplate): Promise<void> {
		// Ensure custom templates directory exists
		await FileUtils.ensureParentDirectoryExists(app, `${this.customTemplatesPath}${template.id}.json`);

		// Save template as JSON file
		const templatePath = `${this.customTemplatesPath}${template.id}.json`;
		const content = JSON.stringify(template, null, "\t");
		
		try {
			const existing = app.vault.getAbstractFileByPath(templatePath);
			if (existing instanceof TFile) {
				await app.vault.modify(existing, content);
			} else {
				await app.vault.create(templatePath, content);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "saveCustomTemplate",
				templatePath,
			});
			throw new Error(`Failed to save custom template: ${errorInfo.message}`);
		}
	}

	/**
	 * Delete a custom template
	 */
	static async deleteCustomTemplate(app: App, templateId: string): Promise<void> {
		const templatePath = `${this.customTemplatesPath}${templateId}.json`;
		const file = app.vault.getAbstractFileByPath(templatePath);
		
		if (file instanceof TFile) {
			try {
				await app.vault.delete(file);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, {
					operation: "deleteCustomTemplate",
					templatePath,
				});
				throw new Error(`Failed to delete custom template: ${errorInfo.message}`);
			}
		}
	}

	/**
	 * Get a custom template by ID
	 */
	private static getCustomTemplate(id: string, app: App): BaseTemplate | null {
		const templatePath = `${this.customTemplatesPath}${id}.json`;
		const file = app.vault.getAbstractFileByPath(templatePath);
		
		if (file instanceof TFile) {
			try {
				// Read and parse template (synchronous for now, could be async)
				// Note: This is a simplified version - in practice, you might want async
				return null; // Placeholder - would need async file reading
			} catch (error) {
				console.error(`Failed to load custom template ${id}:`, error);
				return null;
			}
		}
		
		return null;
	}

	/**
	 * List all custom templates
	 */
	private static async listCustomTemplates(app: App): Promise<BaseTemplate[]> {
		const templates: BaseTemplate[] = [];
		const templateDir = app.vault.getAbstractFileByPath(this.customTemplatesPath);
		
		if (templateDir && !(templateDir instanceof TFile)) {
			// It's a folder (TFolder)
			const folder = templateDir as TFolder;
			const files = folder.children || [];
			for (const file of files) {
				if (file instanceof TFile && file.extension === "json") {
					try {
						const content = await app.vault.read(file);
						const template = JSON.parse(content) as BaseTemplate;
						templates.push(template);
					} catch (error) {
						console.error(`Failed to load template from ${file.path}:`, error);
					}
				}
			}
		}
		
		return templates;
	}

	/**
	 * Create a template from an existing Base
	 */
	static async createTemplateFromBase(
		app: App,
		basePath: string,
		templateId: string,
		templateName: string,
		description: string
	): Promise<BaseTemplate> {
		const baseFile = app.vault.getAbstractFileByPath(basePath);
		if (!(baseFile instanceof TFile)) {
			throw new Error(`Base file not found: ${basePath}`);
		}

		try {
			const content = await app.vault.read(baseFile);
			const config = JSON.parse(content) as BaseConfig;

			const template: BaseTemplate = {
				id: templateId,
				name: templateName,
				description,
				category: "custom",
				config,
			};

			await this.saveCustomTemplate(app, template);
			return template;
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, {
				operation: "createTemplateFromBase",
				basePath,
			});
			throw new Error(`Failed to create template from Base: ${errorInfo.message}`);
		}
	}
}

