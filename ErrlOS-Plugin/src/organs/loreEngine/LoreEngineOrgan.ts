import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, TFolder, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { LoreIndex } from "./LoreIndex";
import { LoreEntity } from "./LoreEntity";
import { FileUtils } from "../../utils/fileUtils";
import { LoreRelationship, LoreRelationshipCalculator } from "./LoreRelationship";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Lore Engine Organ - Maintains living canon without rigidity
 * Provides entity recognition, auto-linking, and canon tracking
 */
export class LoreEngineOrgan extends Organ {
	private entityPaths: string[] = [];
	private indexPath: string = "ErrlOS/Lore-Index.md";
	private loreBasePath: string = "ErrlOS/Lore.base";
	private loreIndex: LoreIndex | null = null;
	private autoLinkEnabled: boolean = true;

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "loreEngine";
	}

	getName(): string {
		return "Lore Engine";
	}

	getDocumentation() {
		return {
			purpose: "Maintains living canon by recognizing entities, tracking relationships, and managing lore consistency",
			description: "The Lore Engine organ scans markdown files for lore entities (characters, locations, concepts, items, events) defined in frontmatter. It builds an index of entities, tracks relationships between them, and provides capabilities for finding related entities. It can optionally auto-link entity names in text. Entity scanning is manual - users must explicitly trigger scans.",
			phase: "Phase 3: Intelligence",
			capabilities: [
				{
					name: "Scan Lore Entities",
					description: "Scans configured paths for markdown files with frontmatter entities",
					commands: ["scan-lore-entities"],
				},
				{
					name: "Update Lore Index",
					description: "Regenerates the lore index file with current entity data",
					commands: ["update-lore-index"],
				},
				{
					name: "View Lore Index",
					description: "Opens the lore index markdown file",
					commands: ["view-lore-index"],
				},
				{
					name: "View Lore Relationship Graph",
					description: "Opens modal showing relationship graph between entities",
					commands: ["view-lore-relationship-graph"],
				},
				{
					name: "Find Related Entities",
					description: "Finds entities related to a given entity (capability available to other organs)",
					commands: [],
				},
			],
			monitoring: [
				{
					what: "Markdown files with frontmatter",
					why: "To identify and index lore entities (characters, locations, concepts, etc.)",
					how: "Scans configured paths when user runs scan command (manual, not automatic)",
					userControl: "Scan must be manually triggered. Paths configurable in settings.",
				},
			],
			fileOperations: [
				{
					type: "read" as const,
					path: "Configured loreEnginePaths (markdown files)",
					when: "When user runs 'Scan Lore Entities' command",
					userControl: "User controls when to scan. Scan is manual, not automatic.",
					example: "Reads all .md files in configured paths to find entities",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Lore-Index.md (configurable)",
					when: "When first index is generated (after scan)",
					userControl: "Path configurable in settings. File created automatically when needed.",
					example: "Lore index file created at ErrlOS/Lore-Index.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Lore-Index.md (configurable)",
					when: "When 'Update Lore Index' command is run, or after scanning",
					userControl: "User controls when to update index via command.",
					example: "Index file updated with current entity data",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "loreEnginePaths",
					name: "Lore Engine Paths",
					description: "Array of folder paths to scan for lore entities",
					default: [],
					affects: ["Which files are scanned for entities"],
				},
				{
					key: "loreEngineIndexPath",
					name: "Lore Index Path",
					description: "Path where the lore index markdown file is stored",
					default: "ErrlOS/Lore-Index.md",
					affects: ["Index file location"],
				},
				{
					key: "loreEngineAutoLink",
					name: "Auto-Link Entities",
					description: "Automatically link entity names in text (default: false, requires opt-in)",
					default: false,
					affects: ["Text processing behavior"],
				},
			],
			useCases: [
				{
					scenario: "Index existing lore entities",
					steps: [
						"Configure loreEnginePaths in settings (folders containing entity files)",
						"Ensure entity files have frontmatter with type, name, canonStatus, etc.",
						"Run 'Scan Lore Entities' command",
						"Entities are indexed and relationship graph is built",
						"Index file is created/updated automatically",
					],
					expectedOutcome: "All entities indexed and available in lore index",
				},
				{
					scenario: "Find related entities",
					steps: [
						"Ensure entities are scanned and indexed",
						"Use 'Find Related Entities' capability or view relationship graph",
						"Review entities related to a specific entity",
					],
					expectedOutcome: "List of related entities based on relationships and tags",
				},
				{
					scenario: "Enable auto-linking",
					steps: [
						"Enable auto-link setting in Errl OS settings",
						"Entity names in text are automatically linked to entity files",
					],
					expectedOutcome: "Entity names become clickable links in markdown",
				},
			],
			commonIssues: [
				{
					problem: "No entities found after scan",
					cause: "Paths not configured, or files don't have proper frontmatter",
					solution: "Check loreEnginePaths in settings, ensure files have frontmatter with 'type' and 'name' fields",
				},
				{
					problem: "Scan command does nothing",
					cause: "Paths not configured or folders don't exist",
					solution: "Configure loreEnginePaths in settings to point to folders containing entity files",
				},
				{
					problem: "Auto-linking not working",
					cause: "Auto-link setting is disabled (defaults to false)",
					solution: "Enable 'loreEngineAutoLink' setting in Errl OS settings",
				},
			],
			dependencies: {
				required: [],
				optional: [],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.entityPaths = settings.loreEnginePaths || [];
		this.indexPath = settings.loreEngineIndexPath || "ErrlOS/Lore-Index.md";
		this.loreBasePath = settings.loreBasePath || "ErrlOS/Lore.base";
		this.autoLinkEnabled = settings.loreEngineAutoLink !== false;

		// Initialize index
		this.loreIndex = new LoreIndex(this.plugin.app, this.indexPath);
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		await this.registerCommands();
		await this.registerCapabilities();
		this.subscribeToEvents();
		
		// Don't auto-scan on enable - user must manually trigger scan
		// This ensures user understands what will be scanned before it happens
		// await this.scanEntities();
		// await this.updateIndex();
	}

	/**
	 * Register capabilities that this organ provides
	 */
	private async registerCapabilities(): Promise<void> {
		// Register find-related-entities capability
		this.registerCapability({
			id: "loreEngine:find-related",
			name: "Find Related Lore Entities",
			description: "Finds lore entities related to a given entity or text",
			category: "query",
			organId: this.getId(),
			metadata: {
				parameters: {
					entityName: "string (optional) - Name of entity to find relations for",
					text: "string (optional) - Text to find entities mentioned in",
				},
			},
		});

		// Register analyze-lore-connections capability
		this.registerCapability({
			id: "loreEngine:analyze-connections",
			name: "Analyze Lore Connections",
			description: "Analyzes connections and relationships between lore entities",
			category: "analysis",
			organId: this.getId(),
			metadata: {
				parameters: {
					entityName: "string - Name of entity to analyze connections for",
				},
			},
		});

		// Register service handlers
		this.registerService("loreEngine:find-related", async (params) => {
			const { entityName, text } = params;
			
			if (!this.loreIndex) {
				throw new Error("Lore index not initialized");
			}

			if (text && typeof text === "string") {
				// Find entities mentioned in text
				return this.loreIndex.findEntitiesInText(text);
			} else if (entityName && typeof entityName === "string") {
				// Find entities related to a specific entity
				const allEntities = this.loreIndex.getAllEntities();
				const targetEntity = allEntities.find(e => 
					e.name.toLowerCase() === entityName.toLowerCase()
				);
				
				if (!targetEntity) {
					return [];
				}

				// Get related entities with relationship strength
				const relationships = this.getRelatedEntities(entityName, 0);
				return relationships.map(rel => {
					const entity = allEntities.find(e => e.id === rel.entity2);
					return entity!;
				}).filter(e => e !== undefined);
			} else {
				throw new Error("Either entityName or text parameter is required");
			}
		});

		this.registerService("loreEngine:analyze-connections", async (params) => {
			const { entityName } = params;
			
			if (!entityName || typeof entityName !== "string") {
				throw new Error("entityName parameter is required and must be a string");
			}

			if (!this.loreIndex) {
				throw new Error("Lore index not initialized");
			}

			const allEntities = this.loreIndex.getAllEntities();
			const targetEntity = allEntities.find(e => 
				e.name.toLowerCase() === entityName.toLowerCase()
			);
			
			if (!targetEntity) {
				throw new Error(`Entity not found: ${entityName}`);
			}

			// Analyze connections with relationship strength
			const relationships = this.getRelatedEntities(entityName, 0);
			
			const connections = {
				entity: targetEntity,
				relationships: relationships,
				relatedByType: [] as Array<{ entity: LoreEntity; strength: number }>,
				relatedByCanon: [] as Array<{ entity: LoreEntity; strength: number }>,
				relatedByTags: [] as Array<{ entity: LoreEntity; strength: number }>,
			};

			for (const rel of relationships) {
				const entity = allEntities.find(e => e.id === rel.entity2);
				if (!entity) continue;

				const relData = { entity, strength: rel.strength };

				if (rel.type === "shared-type") {
					connections.relatedByType.push(relData);
				} else if (rel.type === "shared-canon") {
					connections.relatedByCanon.push(relData);
				} else if (rel.type === "shared-tags") {
					connections.relatedByTags.push(relData);
				}
			}

			return connections;
		});
	}

	/**
	 * Subscribe to relevant events from other modules
	 */
	private subscribeToEvents(): void {
		// Subscribe to promotion events to potentially update lore index
		this.subscribe("promotion:content-created", (data) => {
			console.log("[Errl OS] Lore Engine: Content promoted, could update lore index");
			// Could trigger a rescan or update
		});
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "scan-lore-entities",
			name: "Scan Lore Entities",
			callback: async () => {
				try {
					// Check if paths are configured
					if (!this.entityPaths || this.entityPaths.length === 0) {
						new Notice("Lore Engine: Paths not configured. Set them in Settings → Errl OS.");
						return;
					}

					// Check if any paths exist
					const missingPaths: string[] = [];
					for (const path of this.entityPaths) {
						const dir = this.plugin.app.vault.getAbstractFileByPath(path);
						if (!dir || !(dir instanceof TFolder)) {
							missingPaths.push(path);
						}
					}

					if (missingPaths.length === this.entityPaths.length) {
						new Notice(`Lore Engine: No folders found at configured paths. Check paths in Settings → Errl OS.`);
						return;
					} else if (missingPaths.length > 0) {
						new Notice(`Lore Engine: Some paths not found: ${missingPaths.join(", ")}. Check paths in Settings → Errl OS.`);
					}

					await this.scanEntities();
					await this.updateIndex();
					new Notice("Lore entities scanned!");
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "scanLoreEntities",
						entityPaths: this.entityPaths
					});
					console.error("[Errl OS] Error scanning lore entities:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
				}
			},
		});

		this.plugin.addCommand({
			id: "update-lore-index",
			name: "Update Lore Index",
			callback: async () => {
				try {
					await this.updateIndex();
					new Notice("Lore index updated!");
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "updateLoreIndex",
						indexPath: this.indexPath
					});
					console.error("[Errl OS] Error updating lore index:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
				}
			},
		});

		this.plugin.addCommand({
			id: "view-lore-index",
			name: "View Lore Index",
			callback: () => {
				this.openIndex();
			},
		});

		this.plugin.addCommand({
			id: "view-lore-relationship-graph",
			name: "View Lore Relationship Graph",
			callback: async () => {
				await this.showRelationshipGraph();
			},
		});

		this.plugin.addCommand({
			id: "lore-open-base",
			name: "Open Lore Base",
			callback: async () => {
				await this.openLoreBase();
			},
		});

		this.plugin.addCommand({
			id: "lore-migrate-frontmatter",
			name: "Lore: Migrate Frontmatter",
			callback: async () => {
				await this.migrateLoreFrontmatter();
			},
		});
	}

	/**
	 * Show relationship graph modal
	 */
	private async showRelationshipGraph(): Promise<void> {
		if (!this.loreIndex) {
			new Notice("Lore Engine: No entities found. Scan entities first.");
			return;
		}

		const { LoreGraphModal } = await import("./LoreGraphModal");
		const allEntities = this.loreIndex.getAllEntities();
		
		if (allEntities.length === 0) {
			new Notice("Lore Engine: No entities found. Scan entities first.");
			return;
		}

		const modal = new LoreGraphModal(this.plugin.app, allEntities, this);
		modal.open();
	}

	/**
	 * Scan vault for lore entities
	 */
	async scanEntities(): Promise<LoreEntity[]> {
		try {
			if (!this.loreIndex) {
				this.loreIndex = new LoreIndex(this.plugin.app, this.indexPath);
			}

			const entities = await this.loreIndex.scanForEntities(this.entityPaths);
			console.log(`[Lore Engine] Found ${entities.length} entities`);
			return entities;
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "scanEntities",
				entityPaths: this.entityPaths,
				indexPath: this.indexPath
			});
			console.error("[Errl OS] Error scanning lore entities:", errorInfo.message, errorInfo.context);
			// Don't show notice here - let the calling command handle it
			throw new Error(errorInfo.userMessage);
		}
	}

	/**
	 * Update the lore index file
	 */
	async updateIndex(): Promise<void> {
		try {
			if (!this.loreIndex) {
				await this.scanEntities();
			}

			if (this.loreIndex) {
				await this.loreIndex.updateIndex();
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "updateIndex",
				indexPath: this.indexPath
			});
			console.error("[Errl OS] Error updating lore index:", errorInfo.message, errorInfo.context);
			// Don't show notice here - let the calling command handle it
			throw new Error(errorInfo.userMessage);
		}
	}

	/**
	 * Open the lore index
	 */
	private async openIndex(): Promise<void> {
		try {
			const file = this.plugin.app.vault.getAbstractFileByPath(this.indexPath);
			if (file instanceof TFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(file);
			} else {
				// Create index if it doesn't exist
				try {
					await this.updateIndex();
					const newFile = this.plugin.app.vault.getAbstractFileByPath(this.indexPath);
					if (newFile instanceof TFile) {
						await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
					} else {
						const errorInfo = ErrorHandler.handleError(
							new Error(`Index file not found after creation: ${this.indexPath}`),
							{ operation: "openIndex", filePath: this.indexPath }
						);
						ErrorHandler.showErrorNotice(errorInfo);
					}
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "openIndex", 
						filePath: this.indexPath,
						action: "create"
					});
					console.error("[Errl OS] Error creating index:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
				}
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "openIndex", 
				filePath: this.indexPath
			});
			console.error("[Errl OS] Error opening index:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
		}
	}

	/**
	 * Open the Lore Base
	 */
	private async openLoreBase(): Promise<void> {
		try {
			const baseFile = await this.ensureLoreBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openLoreBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open lore base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure Lore Base exists, creating it if necessary
	 */
	private async ensureLoreBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.loreBasePath || this.loreBasePath;

		// Check if Bases are enabled for lore
		if (!settings.basesEnabled?.lore) {
			throw new Error("Lore Base is disabled in settings");
		}

		const baseConfig: BaseConfig = {
			filters: `note.type = "lore"`,
			properties: {
				name: { displayName: "Name", type: "text", sortable: true },
				loreType: { displayName: "Type", type: "select", sortable: true, options: ["character", "location", "concept", "item", "event"] },
				canonStatus: { displayName: "Canon Status", type: "select", sortable: true, options: ["canon", "variant", "draft"] },
				timeline: { displayName: "Timeline", type: "text", sortable: true },
				tags: { displayName: "Tags", type: "multiselect", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Lore",
					order: ["note.loreType", "note.canonStatus", "note.name"],
				},
				{
					type: "table",
					name: "By Type",
					groupBy: "note.loreType",
					order: ["note.name"],
				},
				{
					type: "table",
					name: "By Canon Status",
					groupBy: "note.canonStatus",
					order: ["note.loreType", "note.name"],
				},
				{
					type: "table",
					name: "Canon Only",
					filter: `note.canonStatus = "canon"`,
					order: ["note.loreType", "note.name"],
				},
				{
					type: "card",
					name: "Lore Cards",
					order: ["note.name", "note.loreType"],
					groupBy: "note.loreType",
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}

	/**
	 * Migration helper: Add frontmatter to lore files that don't have it
	 * This is an optional utility to help migrate existing lore files
	 */
	private async migrateLoreFrontmatter(): Promise<void> {
		const settings = this.kernel.getSettings();
		const paths = settings.loreEnginePaths || this.entityPaths;

		if (paths.length === 0) {
			new Notice("No lore paths configured. Please configure paths in settings first.");
			return;
		}

		try {
			// Scan for files without frontmatter
			const filesNeedingMigration: TFile[] = [];
			
			for (const path of paths) {
				const folder = this.plugin.app.vault.getAbstractFileByPath(path);
				if (folder instanceof TFolder) {
					const files = this.getAllMarkdownFiles(folder);
					for (const file of files) {
						const content = await this.plugin.app.vault.read(file);
						// Check if file has frontmatter
						if (!content.match(/^---\n[\s\S]*?\n---/)) {
							filesNeedingMigration.push(file);
						}
					}
				}
			}

			if (filesNeedingMigration.length === 0) {
				new Notice("All lore files already have frontmatter!");
				return;
			}

			// Ask for confirmation
			const confirmed = confirm(
				`Found ${filesNeedingMigration.length} file(s) without frontmatter. ` +
				`Add basic frontmatter to these files? This will infer type from folder structure.`
			);

			if (!confirmed) {
				return;
			}

			// Migrate files
			let migrated = 0;
			for (const file of filesNeedingMigration) {
				try {
					const content = await this.plugin.app.vault.read(file);
					const inferredType = this.inferLoreType(file.path, paths);
					
					const frontmatter = [
						"---",
						"type: lore",
						`name: ${file.basename}`,
						`loreType: ${inferredType}`,
						"canonStatus: draft",
						"---",
						"",
					].join("\n");

					const newContent = frontmatter + content;
					await this.plugin.app.vault.modify(file, newContent);
					migrated++;
				} catch (error) {
					console.error(`[Lore Engine] Failed to migrate ${file.path}:`, error);
				}
			}

			new Notice(`Migrated ${migrated} of ${filesNeedingMigration.length} file(s).`);
			
			// Update index after migration
			if (migrated > 0) {
				await this.updateIndex();
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "migrateLoreFrontmatter" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Error migrating lore frontmatter:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Get all markdown files recursively from a folder
	 */
	private getAllMarkdownFiles(folder: TFolder): TFile[] {
		const files: TFile[] = [];
		
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === "md") {
				files.push(child);
			} else if (child instanceof TFolder) {
				files.push(...this.getAllMarkdownFiles(child));
			}
		}
		
		return files;
	}

	/**
	 * Infer lore type from file path and configured paths
	 */
	private inferLoreType(filePath: string, configuredPaths: string[]): string {
		// Try to infer from folder structure
		const pathLower = filePath.toLowerCase();
		
		if (pathLower.includes("character") || pathLower.includes("char")) {
			return "character";
		}
		if (pathLower.includes("location") || pathLower.includes("place")) {
			return "location";
		}
		if (pathLower.includes("concept")) {
			return "concept";
		}
		if (pathLower.includes("item") || pathLower.includes("object")) {
			return "item";
		}
		if (pathLower.includes("event")) {
			return "event";
		}
		
		// Default to concept if can't infer
		return "concept";
	}

	/**
	 * Get all entities (for dashboard integration)
	 */
	getAllEntities(): LoreEntity[] {
		if (!this.loreIndex) {
			return [];
		}
		return this.loreIndex.getAllEntities();
	}

	/**
	 * Get entities by type
	 */
	getEntitiesByType(type: string): LoreEntity[] {
		if (!this.loreIndex) {
			return [];
		}
		return this.loreIndex.getEntitiesByType(type);
	}

	/**
	 * Get entities by canon status
	 */
	getEntitiesByCanonStatus(status: "canon" | "variant" | "draft"): LoreEntity[] {
		if (!this.loreIndex) {
			return [];
		}
		return this.loreIndex.getEntitiesByCanonStatus(status);
	}

	/**
	 * Find entities mentioned in text (for auto-linking)
	 */
	findEntitiesInText(text: string): LoreEntity[] {
		if (!this.loreIndex || !this.autoLinkEnabled) {
			return [];
		}
		return this.loreIndex.findEntitiesInText(text);
	}

	/**
	 * Get related entities with relationship strength
	 * 
	 * @param entityName - Name of entity to find relations for
	 * @param minStrength - Minimum relationship strength (0-100)
	 * @returns Array of related entities with relationship data
	 */
	getRelatedEntities(entityName: string, minStrength: number = 0): LoreRelationship[] {
		if (!this.loreIndex) {
			return [];
		}

		const allEntities = this.loreIndex.getAllEntities();
		const targetEntity = allEntities.find(e => 
			e.name.toLowerCase() === entityName.toLowerCase()
		);

		if (!targetEntity) {
			return [];
		}

		const relationships: LoreRelationship[] = [];

		for (const entity of allEntities) {
			if (entity.id === targetEntity.id) continue;

			const strength = LoreRelationshipCalculator.calculateStrength(
				targetEntity,
				entity,
				allEntities
			);

			if (strength >= minStrength) {
				relationships.push({
					entity1: targetEntity.id,
					entity2: entity.id,
					strength: strength,
					type: LoreRelationshipCalculator.getRelationshipType(targetEntity, entity),
					details: this.getRelationshipDetails(targetEntity, entity, strength),
				});
			}
		}

		// Sort by strength (highest first)
		relationships.sort((a, b) => b.strength - a.strength);

		return relationships;
	}

	/**
	 * Calculate relationship strength between two entities
	 */
	calculateRelationshipStrength(entity1: LoreEntity, entity2: LoreEntity): number {
		if (!this.loreIndex) {
			return 0;
		}

		const allEntities = this.loreIndex.getAllEntities();
		return LoreRelationshipCalculator.calculateStrength(entity1, entity2, allEntities);
	}

	/**
	 * Get relationship details for display
	 */
	private getRelationshipDetails(
		entity1: LoreEntity,
		entity2: LoreEntity,
		strength: number
	): string {
		const details: string[] = [];

		const sharedTags = entity1.tags.filter(tag => entity2.tags.includes(tag));
		if (sharedTags.length > 0) {
			details.push(`Shared tags: ${sharedTags.join(", ")}`);
		}

		if (entity1.type === entity2.type) {
			details.push(`Same type: ${entity1.type}`);
		}

		if (entity1.canonStatus === entity2.canonStatus) {
			details.push(`Same canon status: ${entity1.canonStatus}`);
		}

		return details.join("; ") || `Strength: ${strength}`;
	}
}

