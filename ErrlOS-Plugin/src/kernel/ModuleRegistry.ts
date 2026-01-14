import { Organ } from "../organs/base/Organ";
import { ErrorHandler } from "../utils/ErrorHandler";

/**
 * Registry for managing Errl OS organs
 * Enhanced with comprehensive error handling
 */
export class ModuleRegistry {
	private organs: Map<string, Organ> = new Map();
	private enabledOrgans: Set<string> = new Set();

	/**
	 * Register an organ with the registry
	 * @throws Error if organ ID is invalid or already registered
	 */
	register(organ: Organ): void {
		const id = organ.getId();
		if (!id || typeof id !== "string" || id.trim() === "") {
			throw new Error("Organ ID must be a non-empty string");
		}

		if (this.organs.has(id)) {
			throw new Error(`Organ with ID "${id}" is already registered`);
		}

		this.organs.set(id, organ);
	}

	/**
	 * Get an organ by ID
	 */
	get(id: string): Organ | undefined {
		if (!id || typeof id !== "string") {
			return undefined;
		}
		return this.organs.get(id);
	}

	/**
	 * Get all registered organs
	 */
	getAll(): Organ[] {
		return Array.from(this.organs.values());
	}

	/**
	 * Get all enabled organs
	 */
	getEnabled(): Organ[] {
		return this.getAll().filter(organ => this.isEnabled(organ.getId()));
	}

	/**
	 * Enable an organ with error handling
	 * @throws Error if organ not found or enable fails
	 */
	async enable(id: string): Promise<void> {
		const organ = this.organs.get(id);
		if (!organ) {
			throw new Error(`Organ "${id}" not found in registry`);
		}

		// Check if already enabled
		if (this.enabledOrgans.has(id)) {
			console.warn(`[Errl OS] Organ "${id}" is already enabled`);
			return;
		}

		try {
			await organ.onEnable();
			this.enabledOrgans.add(id);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { organId: id, operation: "enable" });
			console.error(`[Errl OS] Failed to enable organ "${id}":`, errorInfo.message);
			// Re-throw with context
			throw new Error(`Failed to enable organ "${id}": ${errorInfo.message}`);
		}
	}

	/**
	 * Disable an organ with error handling
	 * @throws Error if organ not found or disable fails
	 */
	async disable(id: string): Promise<void> {
		const organ = this.organs.get(id);
		if (!organ) {
			throw new Error(`Organ "${id}" not found in registry`);
		}

		// Check if already disabled
		if (!this.enabledOrgans.has(id)) {
			console.warn(`[Errl OS] Organ "${id}" is already disabled`);
			return;
		}

		try {
			await organ.onDisable();
			this.enabledOrgans.delete(id);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { organId: id, operation: "disable" });
			console.error(`[Errl OS] Failed to disable organ "${id}":`, errorInfo.message);
			// Even if disable fails, remove from enabled set to prevent inconsistent state
			this.enabledOrgans.delete(id);
			// Re-throw with context
			throw new Error(`Failed to disable organ "${id}": ${errorInfo.message}`);
		}
	}

	/**
	 * Check if an organ is enabled
	 */
	isEnabled(id: string): boolean {
		if (!id || typeof id !== "string") {
			return false;
		}
		return this.enabledOrgans.has(id);
	}

	/**
	 * Load all organs (but don't enable them yet)
	 * Continues loading even if one organ fails
	 */
	async loadAll(): Promise<void> {
		const errors: Array<{ id: string; error: string }> = [];

		for (const organ of this.organs.values()) {
			try {
				await organ.onLoad();
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { organId: organ.getId(), operation: "load" });
				console.error(`[Errl OS] Failed to load organ "${organ.getId()}":`, errorInfo.message);
				errors.push({ id: organ.getId(), error: errorInfo.message });
				// Continue loading other organs
			}
		}

		// If any organs failed to load, log summary but don't throw (graceful degradation)
		if (errors.length > 0) {
			console.warn(`[Errl OS] ${errors.length} organ(s) failed to load:`, errors);
		}
	}

	/**
	 * Unload all organs
	 * Attempts to unload all even if some fail
	 */
	async unloadAll(): Promise<void> {
		const errors: Array<{ id: string; error: string }> = [];

		for (const organ of this.organs.values()) {
			try {
				await organ.onUnload();
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { organId: organ.getId(), operation: "unload" });
				console.error(`[Errl OS] Failed to unload organ "${organ.getId()}":`, errorInfo.message);
				errors.push({ id: organ.getId(), error: errorInfo.message });
				// Continue unloading other organs
			}
		}

		// Clear enabled set
		this.enabledOrgans.clear();

		// If any organs failed to unload, log summary
		if (errors.length > 0) {
			console.warn(`[Errl OS] ${errors.length} organ(s) failed to unload:`, errors);
		}
	}
}

