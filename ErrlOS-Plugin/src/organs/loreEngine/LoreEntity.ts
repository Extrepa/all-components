/**
 * Lore Entity - Represents a canonical entity in the lore system
 */
export interface LoreEntity {
	/** Unique identifier (usually filename without extension) */
	id: string;
	/** Display name */
	name: string;
	/** File path */
	path: string;
	/** Entity type (character, location, concept, etc.) */
	type: string;
	/** Canon status: 'canon', 'variant', 'draft' */
	canonStatus: "canon" | "variant" | "draft";
	/** Timeline/variant identifier (for variants) */
	timeline?: string;
	/** Tags for categorization */
	tags: string[];
	/** Frontmatter data */
	frontmatter: Record<string, any>;
	/** Last modified date */
	lastModified: Date;
}

/**
 * Entity recognition result
 */
export interface EntityMatch {
	entity: LoreEntity;
	/** Text that matched (for highlighting) */
	matchedText: string;
	/** Position in text (for auto-linking) */
	position?: number;
}

