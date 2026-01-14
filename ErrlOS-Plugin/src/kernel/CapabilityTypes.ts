/**
 * Capability Types - Definitions for module capabilities
 * 
 * Capabilities represent what a module can do - its "skills" that can be
 * discovered and used by other modules.
 */

/**
 * A capability that a module can provide
 */
export interface Capability {
	/**
	 * Unique identifier for this capability
	 * Format: "organId:capabilityName" (e.g., "capture:format-text")
	 */
	id: string;

	/**
	 * Human-readable name for this capability
	 */
	name: string;

	/**
	 * Description of what this capability does
	 */
	description: string;

	/**
	 * Category for grouping similar capabilities
	 * Examples: "formatting", "analysis", "data", "transformation", "query"
	 */
	category: string;

	/**
	 * ID of the organ that provides this capability
	 */
	organId: string;

	/**
	 * Optional metadata about the capability
	 * Can include parameter schemas, examples, etc.
	 */
	metadata?: Record<string, any>;
}

