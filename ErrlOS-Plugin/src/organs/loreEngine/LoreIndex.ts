import { TFile, TFolder } from "obsidian";
import { LoreEntity } from "./LoreEntity";
import { App } from "obsidian";

/**
 * Lore Index - Manages entity index and auto-linking
 */
export class LoreIndex {
	private entities: Map<string, LoreEntity> = new Map();
	private app: App;
	private indexPath: string;

	constructor(app: App, indexPath: string) {
		this.app = app;
		this.indexPath = indexPath;
	}

	/**
	 * Scan vault for lore entities (files with frontmatter)
	 */
	async scanForEntities(entityPaths: string[]): Promise<LoreEntity[]> {
		const entities: LoreEntity[] = [];

		for (const entityPath of entityPaths) {
			const folder = this.app.vault.getAbstractFileByPath(entityPath);
			if (folder instanceof TFolder) {
				const folderEntities = await this.scanFolder(folder);
				entities.push(...folderEntities);
			}
		}

		// Update internal map
		entities.forEach(entity => {
			this.entities.set(entity.id, entity);
		});

		return entities;
	}

	/**
	 * Scan a folder recursively for entity files
	 */
	private async scanFolder(folder: TFolder): Promise<LoreEntity[]> {
		const entities: LoreEntity[] = [];

		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === "md") {
				const entity = await this.parseEntityFile(child);
				if (entity) {
					entities.push(entity);
				}
			} else if (child instanceof TFolder) {
				const subEntities = await this.scanFolder(child);
				entities.push(...subEntities);
			}
		}

		return entities;
	}

	/**
	 * Parse a markdown file to extract entity information
	 */
	private async parseEntityFile(file: TFile): Promise<LoreEntity | null> {
		try {
			const content = await this.app.vault.read(file);
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			
			if (!frontmatterMatch) {
				return null; // No frontmatter, not an entity
			}

			const frontmatterText = frontmatterMatch[1];
			const frontmatter: Record<string, any> = {};
			
			// Enhanced frontmatter parser (handles YAML arrays and basic types)
			let currentKey: string | null = null;
			let currentArray: string[] = [];
			let inArray = false;
			
			frontmatterText.split("\n").forEach(line => {
				const trimmed = line.trim();
				
				// Handle array items (lines starting with -)
				if (inArray && trimmed.startsWith("-")) {
					const arrayValue = trimmed.substring(1).trim();
					if (arrayValue) {
						currentArray.push(arrayValue);
					}
					return;
				}
				
				// If we were in an array, save it
				if (inArray && currentKey) {
					frontmatter[currentKey] = currentArray;
					currentArray = [];
					inArray = false;
					currentKey = null;
				}
				
				// Handle key: value pairs
				const match = trimmed.match(/^(\w+):\s*(.+)$/);
				if (match) {
					const key = match[1].trim();
					let value: any = match[2].trim();
					
					// Check if this is an array start (empty or [])
					if (value === "[]" || value === "") {
						currentKey = key;
						inArray = true;
						currentArray = [];
						return;
					}
					
					// Try to parse as boolean/number
					if (value === "true") value = true;
					else if (value === "false") value = false;
					else if (/^\d+$/.test(value)) value = parseInt(value, 10);
					
					frontmatter[key] = value;
				}
			});
			
			// Handle array at end of frontmatter
			if (inArray && currentKey) {
				frontmatter[currentKey] = currentArray;
			}

			// Check if this is a lore entity (has type field)
			if (!frontmatter.type) {
				return null;
			}

			const entity: LoreEntity = {
				id: file.basename,
				name: frontmatter.name || file.basename,
				path: file.path,
				type: frontmatter.type,
				canonStatus: frontmatter.canonStatus || "draft",
				timeline: frontmatter.timeline,
				tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
				frontmatter,
				lastModified: new Date(file.stat.mtime),
			};

			return entity;
		} catch (error) {
			console.error(`[Lore Engine] Error parsing entity file ${file.path}:`, error);
			return null;
		}
	}

	/**
	 * Find entities mentioned in text
	 */
	findEntitiesInText(text: string): LoreEntity[] {
		const matches: LoreEntity[] = [];
		const lowerText = text.toLowerCase();

		for (const entity of this.entities.values()) {
			// Check if entity name appears in text (case-insensitive)
			const nameLower = entity.name.toLowerCase();
			if (lowerText.includes(nameLower)) {
				matches.push(entity);
			}
		}

		return matches;
	}

	/**
	 * Get all entities
	 */
	getAllEntities(): LoreEntity[] {
		return Array.from(this.entities.values());
	}

	/**
	 * Get entities by type
	 */
	getEntitiesByType(type: string): LoreEntity[] {
		return Array.from(this.entities.values()).filter(e => e.type === type);
	}

	/**
	 * Get entities by canon status
	 */
	getEntitiesByCanonStatus(status: "canon" | "variant" | "draft"): LoreEntity[] {
		return Array.from(this.entities.values()).filter(e => e.canonStatus === status);
	}

	/**
	 * Get entity by ID
	 */
	getEntity(id: string): LoreEntity | undefined {
		return this.entities.get(id);
	}

	/**
	 * Generate index markdown content
	 */
	async generateIndexContent(): Promise<string> {
		const entities = this.getAllEntities();
		
		if (entities.length === 0) {
			return `# Lore Index

> No entities found. Create lore entities by adding frontmatter to markdown files.

## How to Create Entities

Add frontmatter to your markdown files:

\`\`\`yaml
---
type: character
name: Character Name
canonStatus: canon
tags: [tag1, tag2]
---
\`\`\`

## Entity Types

- \`character\` - Characters, people, beings
- \`location\` - Places, locations, settings
- \`concept\` - Ideas, concepts, themes
- \`item\` - Objects, items, artifacts
- \`event\` - Events, happenings, occurrences
`;
		}

		let content = `# Lore Index

> ${entities.length} entities found

## By Type

`;

		// Group by type
		const byType: Record<string, LoreEntity[]> = {};
		entities.forEach(entity => {
			if (!byType[entity.type]) {
				byType[entity.type] = [];
			}
			byType[entity.type].push(entity);
		});

		for (const [type, typeEntities] of Object.entries(byType)) {
			content += `### ${type.charAt(0).toUpperCase() + type.slice(1)} (${typeEntities.length})\n\n`;
			typeEntities.forEach(entity => {
				const statusIcon = entity.canonStatus === "canon" ? "✓" : entity.canonStatus === "variant" ? "~" : "?";
				content += `- ${statusIcon} [[${entity.path}|${entity.name}]]\n`;
			});
			content += "\n";
		}

		content += `## By Canon Status

### Canon (${entities.filter(e => e.canonStatus === "canon").length})
${entities.filter(e => e.canonStatus === "canon").map(e => `- [[${e.path}|${e.name}]]`).join("\n")}

### Variants (${entities.filter(e => e.canonStatus === "variant").length})
${entities.filter(e => e.canonStatus === "variant").map(e => `- [[${e.path}|${e.name}]] (${e.timeline || "unknown timeline"})`).join("\n")}

### Drafts (${entities.filter(e => e.canonStatus === "draft").length})
${entities.filter(e => e.canonStatus === "draft").map(e => `- [[${e.path}|${e.name}]]`).join("\n")}

`;

		return content;
	}

	/**
	 * Update index file
	 */
	async updateIndex(): Promise<void> {
		const content = await this.generateIndexContent();
		const indexFile = this.app.vault.getAbstractFileByPath(this.indexPath);
		
		if (indexFile instanceof TFile) {
			await this.app.vault.modify(indexFile, content);
		} else {
			// Create index file
			const folder = this.app.vault.getAbstractFileByPath(this.indexPath.split("/").slice(0, -1).join("/"));
			if (folder instanceof TFolder) {
				await this.app.vault.create(this.indexPath, content);
			}
		}
	}
}

