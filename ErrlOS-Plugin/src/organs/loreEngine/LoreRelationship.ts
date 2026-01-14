/**
 * Lore Relationship - Represents a relationship between two lore entities
 */
export interface LoreRelationship {
	entity1: string; // Entity ID
	entity2: string; // Entity ID
	strength: number; // 0-100, higher is stronger
	type: "shared-tags" | "shared-type" | "shared-canon" | "mentioned" | "proximity" | "temporal";
	details?: string; // Additional context about the relationship
}

/**
 * Relationship strength calculation utilities
 */
export class LoreRelationshipCalculator {
	/**
	 * Calculate relationship strength between two entities
	 * 
	 * @param entity1 - First entity
	 * @param entity2 - Second entity
	 * @param allEntities - All entities (for context)
	 * @returns Relationship strength (0-100)
	 */
	static calculateStrength(
		entity1: { id: string; type: string; tags: string[]; canonStatus: string; lastModified: Date },
		entity2: { id: string; type: string; tags: string[]; canonStatus: string; lastModified: Date },
		allEntities?: any[]
	): number {
		let strength = 0;

		// Shared tags (40 points max)
		const sharedTags = entity1.tags.filter(tag => entity2.tags.includes(tag));
		strength += Math.min(sharedTags.length * 10, 40);

		// Shared type (20 points)
		if (entity1.type === entity2.type) {
			strength += 20;
		}

		// Shared canon status (15 points)
		if (entity1.canonStatus === entity2.canonStatus) {
			strength += 15;
		}

		// Temporal proximity (15 points max)
		const timeDiff = Math.abs(entity1.lastModified.getTime() - entity2.lastModified.getTime());
		const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
		if (daysDiff < 7) {
			strength += 15;
		} else if (daysDiff < 30) {
			strength += 10;
		} else if (daysDiff < 90) {
			strength += 5;
		}

		// File proximity (10 points max)
		// If entities are in the same folder or nearby folders
		// This would require path analysis, simplified here
		// In a real implementation, you'd compare folder paths

		return Math.min(strength, 100);
	}

	/**
	 * Determine relationship type
	 */
	static getRelationshipType(
		entity1: { type: string; tags: string[]; canonStatus: string },
		entity2: { type: string; tags: string[]; canonStatus: string }
	): LoreRelationship["type"] {
		const sharedTags = entity1.tags.filter(tag => entity2.tags.includes(tag));
		
		if (sharedTags.length > 0) {
			return "shared-tags";
		} else if (entity1.type === entity2.type) {
			return "shared-type";
		} else if (entity1.canonStatus === entity2.canonStatus) {
			return "shared-canon";
		} else {
			return "proximity";
		}
	}
}

