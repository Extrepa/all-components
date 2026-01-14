import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { FileUtils } from "../../utils/fileUtils";

/**
 * Reality Map Organ - Spatial thinking over hierarchical
 * Provides visual graph view of connections, clustering by theme
 */
export class RealityMapOrgan extends Organ {
	private mapPath: string = "ErrlOS/Reality-Map.md";
	private clusterByTheme: boolean = true;
	private includeTags: boolean = true;

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "realityMap";
	}

	getName(): string {
		return "Reality Map";
	}

	getDocumentation() {
		return {
			purpose: "Creates visual map of connections between notes based on links and tags",
			description: "Reality Map organ generates a visual map showing relationships between notes in your vault. It clusters notes by themes, tracks connections via links, and can include tags. The map is generated as a markdown file that displays the structure of your knowledge base, helping you understand connections and patterns in your notes.",
			phase: "Phase 3: Intelligence",
			capabilities: [
				{
					name: "Generate Reality Map",
					description: "Generates or updates the reality map file showing note connections",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "read" as const,
					path: "All markdown files in vault",
					when: "When reality map is generated",
					userControl: "User controls when to generate map (via dashboard or direct call). Can be limited by settings.",
					example: "Reads all .md files to build connection graph",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Reality-Map.md (configurable)",
					when: "When reality map is first generated",
					userControl: "Path configurable in settings. File created automatically when needed.",
					example: "Reality map file created at ErrlOS/Reality-Map.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Reality-Map.md (configurable)",
					when: "When reality map is regenerated",
					userControl: "User controls when to regenerate map.",
					example: "Reality map file updated with current vault structure",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "realityMapPath",
					name: "Reality Map Path",
					description: "Path where the reality map markdown file is stored",
					default: "ErrlOS/Reality-Map.md",
					affects: ["Map file location"],
				},
				{
					key: "realityMapClusterByTheme",
					name: "Cluster By Theme",
					description: "Group notes by theme/topic in the map",
					default: true,
					affects: ["Map organization and display"],
				},
				{
					key: "realityMapIncludeTags",
					name: "Include Tags",
					description: "Include tags in the reality map connections",
					default: true,
					affects: ["Map connections and clustering"],
				},
			],
			useCases: [
				{
					scenario: "Visualize vault structure",
					steps: [
						"Enable Reality Map organ",
						"Reality map is generated (or trigger manually)",
						"View ErrlOS/Reality-Map.md to see connections",
					],
					expectedOutcome: "Visual representation of note connections and themes",
				},
				{
					scenario: "Discover connections",
					steps: [
						"Review reality map file",
						"See how notes are clustered by theme",
						"Explore connections between notes",
					],
					expectedOutcome: "Better understanding of vault structure and relationships",
				},
			],
			commonIssues: [
				{
					problem: "Map generation is slow",
					cause: "Large vault with many files",
					solution: "Map generation reads all markdown files. For very large vaults, consider limiting scope or generating less frequently",
				},
				{
					problem: "Map not showing expected connections",
					cause: "Notes may not have links or tags configured",
					solution: "Add links between notes or enable tag inclusion in settings",
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
		this.mapPath = settings.realityMapPath || "ErrlOS/Reality-Map.md";
		this.clusterByTheme = settings.realityMapClusterByTheme !== false;
		this.includeTags = settings.realityMapIncludeTags !== false;
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		await this.registerCommands();
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "open-reality-map",
			name: "Open Reality Map",
			callback: () => {
				this.openRealityMap();
			},
		});

		this.plugin.addCommand({
			id: "generate-reality-map",
			name: "Generate Reality Map",
			callback: async () => {
				await this.generateRealityMap();
				new Notice("Reality map generated!");
			},
		});
	}

	/**
	 * Open the reality map (or create it if it doesn't exist)
	 */
	private async openRealityMap(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.mapPath);
		if (file instanceof TFile) {
			await this.plugin.app.workspace.getLeaf(true).openFile(file);
		} else {
			// Create map if it doesn't exist
			await this.generateRealityMap();
			const newFile = this.plugin.app.vault.getAbstractFileByPath(this.mapPath);
			if (newFile instanceof TFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
			}
		}
	}

	/**
	 * Generate reality map content
	 * Uses Obsidian's graph view by creating a note with graph view instructions
	 */
	private async generateRealityMap(): Promise<string> {
		// Get all markdown files
		const files = this.plugin.app.vault.getMarkdownFiles();
		
		// Group files by tags/themes
		const themeGroups: Record<string, TFile[]> = {};
		const untagged: TFile[] = [];

		for (const file of files) {
			const tags = await this.extractTags(file);
			if (tags.length > 0 && this.clusterByTheme) {
				// Use first tag as theme
				const theme = tags[0];
				if (!themeGroups[theme]) {
					themeGroups[theme] = [];
				}
				themeGroups[theme].push(file);
			} else {
				untagged.push(file);
			}
		}

		// Generate markdown content
		let content = `---
type: reality-map
---

# Reality Map

> Spatial thinking over hierarchical thinking. Use Obsidian's graph view to explore connections.

## How to Use

1. Open this note
2. Click the graph view icon in the sidebar (or press \`Ctrl/Cmd + G\`)
3. Explore connections visually

## Theme Clusters

`;

		if (this.clusterByTheme && Object.keys(themeGroups).length > 0) {
			for (const [theme, themeFiles] of Object.entries(themeGroups)) {
				content += `### ${theme} (${themeFiles.length} files)\n\n`;
				themeFiles.slice(0, 10).forEach(file => {
					content += `- [[${file.path}|${file.basename}]]\n`;
				});
				if (themeFiles.length > 10) {
					content += `- ...and ${themeFiles.length - 10} more\n`;
				}
				content += "\n";
			}
		}

		if (untagged.length > 0) {
			content += `### Untagged (${untagged.length} files)\n\n`;
			untagged.slice(0, 20).forEach(file => {
				content += `- [[${file.path}|${file.basename}]]\n`;
			});
			if (untagged.length > 20) {
				content += `- ...and ${untagged.length - 20} more\n`;
			}
			content += "\n";
		}

		content += `## Graph View Tips

- Use Obsidian's graph view to see all connections
- Filter by tags to focus on specific themes
- Use local graph view to see connections from a specific note
- Cluster view shows related notes grouped together

## Connection Discovery

The graph view helps you discover:
- Hidden connections between ideas
- Clusters of related concepts
- Isolated notes that might need linking
- Central nodes (notes with many connections)

`;

		// Save content
		try {
			await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.mapPath);
			const existingFile = this.plugin.app.vault.getAbstractFileByPath(this.mapPath);
			if (existingFile instanceof TFile) {
				try {
					await this.plugin.app.vault.modify(existingFile, content);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "generateRealityMap", 
						filePath: this.mapPath,
						action: "modify"
					});
					console.error("[Errl OS] Error updating reality map:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
					throw new Error(errorInfo.userMessage);
				}
			} else {
				try {
					await this.plugin.app.vault.create(this.mapPath, content);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "generateRealityMap", 
						filePath: this.mapPath,
						action: "create"
					});
					console.error("[Errl OS] Error creating reality map:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
					throw new Error(errorInfo.userMessage);
				}
			}

			return content;
		} catch (error) {
			// If error wasn't already handled, handle it now
			if (!(error instanceof Error && error.message.startsWith("Failed to"))) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "generateRealityMap", 
					filePath: this.mapPath
				});
				console.error("[Errl OS] Error generating reality map:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			} else {
				throw error;
			}
		}
	}

	/**
	 * Extract tags from a file
	 */
	private async extractTags(file: TFile): Promise<string[]> {
		try {
			let content: string;
			try {
				content = await this.plugin.app.vault.read(file);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "extractTags", 
					filePath: file.path,
					action: "read"
				});
				console.error("[Errl OS] Error reading file for tag extraction:", errorInfo.message, errorInfo.context);
				// Don't show notice - this is part of batch processing
				return [];
			}
			const tags: string[] = [];

			// Extract frontmatter tags
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			if (frontmatterMatch) {
				const frontmatter = frontmatterMatch[1];
				const tagMatch = frontmatter.match(/tags?:\s*\[(.*?)\]/);
				if (tagMatch) {
					const tagList = tagMatch[1].split(",").map(t => t.trim().replace(/['"]/g, ""));
					tags.push(...tagList);
				}
			}

			// Extract inline tags (#tag)
			const inlineTags = content.matchAll(/#(\w+)/g);
			for (const match of inlineTags) {
				const tag = match[1];
				if (!tags.includes(tag)) {
					tags.push(tag);
				}
			}

			return tags;
		} catch (error) {
			console.error(`[Reality Map] Error extracting tags from ${file.path}:`, error);
			return [];
		}
	}
}

