import { Organ } from "../organs/base/Organ";
import { ErrlKernel } from "../kernel/ErrlKernel";

/**
 * Dependency check result
 */
export interface DependencyCheckResult {
	canEnable: boolean;
	missingRequired: string[];
	missingOptional: string[];
	conflicts: string[];
	warnings: string[];
}

/**
 * Dependency checker for organs
 * Validates that organ dependencies are satisfied before enabling
 */
export class DependencyChecker {
	/**
	 * Check if an organ can be enabled based on its dependencies
	 */
	static checkDependencies(kernel: ErrlKernel, organ: Organ): DependencyCheckResult {
		const result: DependencyCheckResult = {
			canEnable: true,
			missingRequired: [],
			missingOptional: [],
			conflicts: [],
			warnings: [],
		};

		// Check dependencies from documentation
		const documentation = organ.getDocumentation?.();
		const dependencies = documentation?.dependencies;

		// Also check getDependencies method (backwards compatibility)
		// Access protected method via type assertion for backward compatibility
		const legacyDependencies = (organ as any).getDependencies?.();

		// Use documentation dependencies if available, otherwise try legacy method
		let required: string[] = [];
		let optional: string[] = [];
		let conflicts: string[] = [];

		if (dependencies) {
			required = dependencies.required || [];
			optional = dependencies.optional || [];
			conflicts = dependencies.conflicts || [];
		} else if (legacyDependencies) {
			// Legacy format: assume all are required
			required = legacyDependencies;
		}

		// If no dependencies declared, assume it can be enabled
		if (required.length === 0 && optional.length === 0 && conflicts.length === 0) {
			return result;
		}
		const registry = kernel.getRegistry();

		// Check required dependencies
		if (required && required.length > 0) {
			for (const depId of required) {
				const depOrgan = registry.get(depId);
				if (!depOrgan) {
					result.missingRequired.push(depId);
					result.canEnable = false;
				} else if (!kernel.isOrganEnabled(depId)) {
					result.missingRequired.push(depId);
					result.canEnable = false;
				}
			}
		}

		// Check optional dependencies (warnings only)
		if (optional && optional.length > 0) {
			for (const depId of optional) {
				const depOrgan = registry.get(depId);
				if (!depOrgan) {
					result.missingOptional.push(depId);
					result.warnings.push(`Optional dependency "${depId}" not found in registry`);
				} else if (!kernel.isOrganEnabled(depId)) {
					result.missingOptional.push(depId);
					result.warnings.push(`Optional dependency "${depId}" is not enabled. Some features may not work as expected.`);
				}
			}
		}

		// Check conflicts
		if (conflicts && conflicts.length > 0) {
			for (const conflictId of conflicts) {
				if (kernel.isOrganEnabled(conflictId)) {
					result.conflicts.push(conflictId);
					result.canEnable = false;
				}
			}
		}

		return result;
	}

	/**
	 * Get user-friendly message explaining dependency issues
	 */
	static getDependencyMessage(result: DependencyCheckResult, organName: string): string {
		const messages: string[] = [];

		if (!result.canEnable) {
			if (result.missingRequired.length > 0) {
				messages.push(`Required dependencies not enabled: ${result.missingRequired.join(", ")}`);
			}
			if (result.conflicts.length > 0) {
				messages.push(`Conflicting organs enabled: ${result.conflicts.join(", ")}`);
			}
		}

		if (result.missingOptional.length > 0) {
			messages.push(`Optional dependencies not enabled: ${result.missingOptional.join(", ")} (features may be limited)`);
		}

		if (messages.length === 0) {
			return `${organName} can be enabled.`;
		}

		return `${organName} cannot be enabled:\n${messages.join("\n")}`;
	}

	/**
	 * Check all dependencies for all enabled organs
	 * Useful for validating system state after settings changes
	 */
	static validateAllDependencies(kernel: ErrlKernel): Array<{ organId: string; result: DependencyCheckResult }> {
		const results: Array<{ organId: string; result: DependencyCheckResult }> = [];

		for (const organ of kernel.getRegistry().getAll()) {
			if (kernel.isOrganEnabled(organ.getId())) {
				const result = this.checkDependencies(kernel, organ);
				results.push({ organId: organ.getId(), result });
			}
		}

		return results;
	}
}

