import { BaseConfig, BaseProperty } from "./BaseManager";

/**
 * BaseValidator - Validates Base configurations and provides helpful error messages
 */
export class BaseValidator {
	/**
	 * Validate a Base configuration and return detailed validation results
	 */
	static validateConfig(config: BaseConfig): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check required fields
		if (!config.filters || typeof config.filters !== "string" || config.filters.trim() === "") {
			errors.push("Base configuration must have a non-empty 'filters' field");
		}

		// Validate properties
		if (config.properties) {
			for (const [key, prop] of Object.entries(config.properties)) {
				const propResult = this.validateProperty(key, prop);
				errors.push(...propResult.errors);
				warnings.push(...propResult.warnings);
			}
		}

		// Validate views
		if (config.views) {
			config.views.forEach((view, index) => {
				const viewResult = this.validateView(view, index);
				errors.push(...viewResult.errors);
				warnings.push(...viewResult.warnings);
			});
		}

		// Validate formulas
		if (config.formulas) {
			for (const [key, formula] of Object.entries(config.formulas)) {
				const formulaResult = this.validateFormula(key, formula);
				errors.push(...formulaResult.errors);
				warnings.push(...formulaResult.warnings);
			}
		}

		// Check for common issues
		warnings.push(...this.checkCommonIssues(config));

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Validate a property configuration
	 */
	private static validateProperty(key: string, prop: BaseProperty | { displayName: string }): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check required displayName
		if (!prop.displayName || typeof prop.displayName !== "string") {
			errors.push(`Property "${key}" must have a 'displayName' field`);
		}

		// If enhanced property, validate additional fields
		if ("type" in prop && prop.type) {
			const validTypes = ["text", "number", "date", "boolean", "select", "multiselect"];
			if (!validTypes.includes(prop.type)) {
				errors.push(`Property "${key}" has invalid type "${prop.type}". Valid types: ${validTypes.join(", ")}`);
			}

			// Validate format for date types
			if (prop.type === "date" && prop.format) {
				const validFormats = ["relative", "absolute", "iso", "short", "long"];
				if (!validFormats.includes(prop.format)) {
					warnings.push(`Property "${key}" has invalid date format "${prop.format}". Valid formats: ${validFormats.join(", ")}`);
				}
			}

			// Validate options for select/multiselect
			if ((prop.type === "select" || prop.type === "multiselect") && !prop.options) {
				warnings.push(`Property "${key}" is a ${prop.type} type but has no 'options' array defined`);
			}
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Validate a view configuration
	 */
	private static validateView(view: any, index: number): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check required fields
		if (!view.type) {
			errors.push(`View at index ${index} is missing required 'type' field`);
		} else {
			const validTypes = ["table", "list", "card", "map"];
			if (!validTypes.includes(view.type)) {
				errors.push(`View at index ${index} has invalid type "${view.type}". Valid types: ${validTypes.join(", ")}`);
			}
		}

		if (!view.name || typeof view.name !== "string") {
			errors.push(`View at index ${index} is missing required 'name' field`);
		}

		// Check order array
		if (view.order && !Array.isArray(view.order)) {
			errors.push(`View "${view.name}" has invalid 'order' field (must be an array)`);
		}

		// Check groupBy
		if (view.groupBy && typeof view.groupBy !== "string") {
			errors.push(`View "${view.name}" has invalid 'groupBy' field (must be a string)`);
		}

		// Check sortBy
		if (view.sortBy && typeof view.sortBy !== "string") {
			errors.push(`View "${view.name}" has invalid 'sortBy' field (must be a string)`);
		}

		// Check filter
		if (view.filter && typeof view.filter !== "string") {
			errors.push(`View "${view.name}" has invalid 'filter' field (must be a string)`);
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Validate a formula
	 */
	private static validateFormula(key: string, formula: string): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		if (!formula || typeof formula !== "string" || formula.trim() === "") {
			errors.push(`Formula "${key}" is empty or invalid`);
		}

		// Check for common syntax issues
		if (formula.includes("date.now()") && !formula.includes("date(")) {
			warnings.push(`Formula "${key}" uses date.now() - verify Obsidian Bases supports this syntax`);
		}

		if (formula.includes(" days") && !formula.includes("duration(")) {
			warnings.push(`Formula "${key}" uses "days" unit - may need duration() function or milliseconds`);
		}

		// Check for unbalanced parentheses
		const openParens = (formula.match(/\(/g) || []).length;
		const closeParens = (formula.match(/\)/g) || []).length;
		if (openParens !== closeParens) {
			errors.push(`Formula "${key}" has unbalanced parentheses`);
		}

		// Check for common typos
		if (formula.includes("note.") && !formula.match(/note\.\w+/)) {
			warnings.push(`Formula "${key}" uses note. but may have invalid property reference`);
		}

		return { valid: errors.length === 0, errors, warnings };
	}

	/**
	 * Check for common configuration issues
	 */
	private static checkCommonIssues(config: BaseConfig): string[] {
		const warnings: string[] = [];

		// Check if properties are referenced in views but not defined
		if (config.views && config.properties) {
			const propertyKeys = Object.keys(config.properties);
			config.views.forEach(view => {
				if (view.order) {
					view.order.forEach(prop => {
						// Remove note. or file. prefix for checking
						const cleanProp = prop.replace(/^(note|file)\./, "");
						if (!propertyKeys.includes(cleanProp) && !prop.startsWith("file.") && !prop.startsWith("note.")) {
							warnings.push(`View "${view.name}" references property "${prop}" in order, but it's not defined in properties`);
						}
					});
				}
			});
		}

		// Check if formulas reference properties that don't exist
		if (config.formulas && config.properties) {
			const propertyKeys = Object.keys(config.properties);
			Object.keys(config.formulas).forEach(formulaKey => {
				if (!propertyKeys.includes(formulaKey)) {
					warnings.push(`Formula "${formulaKey}" is defined but not in properties - it may not display in views`);
				}
			});
		}

		// Check if filter references properties that might not exist
		if (config.filters) {
			const filterProps = config.filters.match(/(note|file)\.\w+/g) || [];
			if (config.properties) {
				const propertyKeys = Object.keys(config.properties);
				filterProps.forEach(prop => {
					const cleanProp = prop.replace(/^(note|file)\./, "");
					if (!propertyKeys.includes(cleanProp) && !prop.startsWith("file.")) {
						// This is just informational, not an error
					}
				});
			}
		}

		return warnings;
	}

	/**
	 * Get a user-friendly validation message
	 */
	static getValidationMessage(result: ValidationResult): string {
		if (result.valid && result.warnings.length === 0) {
			return "Base configuration is valid";
		}

		let message = "";
		if (!result.valid) {
			message += "Base configuration has errors:\n";
			result.errors.forEach(error => {
				message += `  • ${error}\n`;
			});
		}

		if (result.warnings.length > 0) {
			message += "\nWarnings:\n";
			result.warnings.forEach(warning => {
				message += `  • ${warning}\n`;
			});
		}

		return message.trim();
	}
}

/**
 * Validation result
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

