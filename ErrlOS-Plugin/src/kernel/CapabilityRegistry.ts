import { Capability } from "./CapabilityTypes";

/**
 * Capability Registry - Central registry for module capabilities
 * 
 * Allows modules to register what they can do and enables discovery
 * of capabilities by other modules.
 */
export class CapabilityRegistry {
	private capabilities: Map<string, Capability> = new Map();
	private capabilitiesByOrgan: Map<string, Set<string>> = new Map();
	private capabilitiesByCategory: Map<string, Set<string>> = new Map();

	/**
	 * Register a capability
	 * 
	 * @param capability - The capability to register
	 * @throws Error if capability ID already exists
	 */
	register(capability: Capability): void {
		if (this.capabilities.has(capability.id)) {
			throw new Error(`Capability ${capability.id} is already registered`);
		}

		this.capabilities.set(capability.id, capability);

		// Index by organ
		if (!this.capabilitiesByOrgan.has(capability.organId)) {
			this.capabilitiesByOrgan.set(capability.organId, new Set());
		}
		this.capabilitiesByOrgan.get(capability.organId)!.add(capability.id);

		// Index by category
		if (!this.capabilitiesByCategory.has(capability.category)) {
			this.capabilitiesByCategory.set(capability.category, new Set());
		}
		this.capabilitiesByCategory.get(capability.category)!.add(capability.id);
	}

	/**
	 * Unregister a capability
	 * 
	 * @param capabilityId - The capability ID to unregister
	 */
	unregister(capabilityId: string): void {
		const capability = this.capabilities.get(capabilityId);
		if (!capability) {
			return;
		}

		this.capabilities.delete(capabilityId);

		// Remove from organ index
		const organSet = this.capabilitiesByOrgan.get(capability.organId);
		if (organSet) {
			organSet.delete(capabilityId);
			if (organSet.size === 0) {
				this.capabilitiesByOrgan.delete(capability.organId);
			}
		}

		// Remove from category index
		const categorySet = this.capabilitiesByCategory.get(capability.category);
		if (categorySet) {
			categorySet.delete(capabilityId);
			if (categorySet.size === 0) {
				this.capabilitiesByCategory.delete(capability.category);
			}
		}
	}

	/**
	 * Get a capability by ID
	 * 
	 * @param capabilityId - The capability ID
	 * @returns The capability, or undefined if not found
	 */
	get(capabilityId: string): Capability | undefined {
		return this.capabilities.get(capabilityId);
	}

	/**
	 * Get all capabilities
	 * 
	 * @returns Array of all registered capabilities
	 */
	getAll(): Capability[] {
		return Array.from(this.capabilities.values());
	}

	/**
	 * Find capabilities by category
	 * 
	 * @param category - The category to search for
	 * @returns Array of capabilities in that category
	 */
	findByCategory(category: string): Capability[] {
		const capabilityIds = this.capabilitiesByCategory.get(category);
		if (!capabilityIds) {
			return [];
		}

		const capabilities: Capability[] = [];
		for (const id of capabilityIds) {
			const capability = this.capabilities.get(id);
			if (capability) {
				capabilities.push(capability);
			}
		}
		return capabilities;
	}

	/**
	 * Find capabilities by organ
	 * 
	 * @param organId - The organ ID to search for
	 * @returns Array of capabilities provided by that organ
	 */
	findByOrgan(organId: string): Capability[] {
		const capabilityIds = this.capabilitiesByOrgan.get(organId);
		if (!capabilityIds) {
			return [];
		}

		const capabilities: Capability[] = [];
		for (const id of capabilityIds) {
			const capability = this.capabilities.get(id);
			if (capability) {
				capabilities.push(capability);
			}
		}
		return capabilities;
	}

	/**
	 * Search capabilities by keyword
	 * Searches in name, description, and category
	 * 
	 * @param keyword - The keyword to search for (case-insensitive)
	 * @returns Array of matching capabilities
	 */
	search(keyword: string): Capability[] {
		const lowerKeyword = keyword.toLowerCase();
		const results: Capability[] = [];

		for (const capability of this.capabilities.values()) {
			if (
				capability.name.toLowerCase().includes(lowerKeyword) ||
				capability.description.toLowerCase().includes(lowerKeyword) ||
				capability.category.toLowerCase().includes(lowerKeyword) ||
				capability.id.toLowerCase().includes(lowerKeyword)
			) {
				results.push(capability);
			}
		}

		return results;
	}

	/**
	 * Unregister all capabilities for an organ
	 * Useful for cleanup when an organ is unloaded
	 * 
	 * @param organId - The organ ID
	 */
	unregisterByOrgan(organId: string): void {
		const capabilityIds = this.capabilitiesByOrgan.get(organId);
		if (!capabilityIds) {
			return;
		}

		// Create a copy of the set to avoid modification during iteration
		const idsToRemove = Array.from(capabilityIds);
		for (const id of idsToRemove) {
			this.unregister(id);
		}
	}

	/**
	 * Clear all capabilities
	 * Useful for cleanup on unload
	 */
	clear(): void {
		this.capabilities.clear();
		this.capabilitiesByOrgan.clear();
		this.capabilitiesByCategory.clear();
	}

	/**
	 * Get the number of registered capabilities
	 * Useful for debugging
	 */
	getCount(): number {
		return this.capabilities.size;
	}
}

