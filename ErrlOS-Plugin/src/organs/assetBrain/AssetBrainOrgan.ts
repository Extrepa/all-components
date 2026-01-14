import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { AssetListModal } from "./AssetListModal";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Asset information
 */
export interface AssetInfo {
	path: string;
	name: string;
	type: "svg" | "image" | "shader" | "code";
	extension: string;
	size: number;
	lastModified: Date;
	usageCount: number; // Number of notes that reference this asset
}

/**
 * Asset Brain Organ - Tracks creative assets (SVGs, images, shaders)
 */
export class AssetBrainOrgan extends Organ {
	private scanPaths: string[] = [];
	private assetExtensions: string[] = [".svg", ".png", ".jpg", ".jpeg", ".glsl"];
	private indexPath: string = "ErrlOS/Asset-Index.md";
	private assetBrainBasePath: string = "ErrlOS/Asset-Brain.base";
	private assetIndex: Map<string, AssetInfo> = new Map();

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "assetBrain";
	}

	getName(): string {
		return "Asset Brain";
	}

	getDocumentation() {
		return {
			purpose: "Indexes and tracks non-markdown assets (images, SVGs, shaders, etc.) for easy discovery and reuse",
			description: "Asset Brain organ scans configured paths for non-markdown assets (images, SVGs, GLSL shaders, etc.) and creates an index of these assets. It helps you discover and reuse assets across your vault, preventing duplicate asset creation and making it easy to find existing assets.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Scan for Assets",
					description: "Scans configured paths for assets and updates index",
					commands: [],
				},
				{
					name: "View Asset Index",
					description: "Opens the asset index file",
					commands: [],
				},
				{
					name: "View Asset List",
					description: "Opens modal showing all indexed assets",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "read" as const,
					path: "Configured assetBrainScanPaths (asset directories)",
					when: "When asset scan is performed",
					userControl: "Paths configurable in settings. Scanning happens on demand.",
					example: "Reads asset directories to find supported file types",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Asset-Index.md (configurable)",
					when: "When asset index is first generated",
					userControl: "Path configurable in settings. File created automatically when needed.",
					example: "Asset index file created at ErrlOS/Asset-Index.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Asset-Index.md (configurable)",
					when: "When asset scan is performed and index is updated",
					userControl: "User controls when to scan. Index updated on demand.",
					example: "Asset index updated with latest scan results",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "assetBrainScanPaths",
					name: "Asset Brain Scan Paths",
					description: "Array of folder paths to scan for assets",
					default: [],
					affects: ["Which directories are scanned for assets"],
				},
				{
					key: "assetBrainAssetExtensions",
					name: "Asset Extensions",
					description: "Array of file extensions to index as assets",
					default: [".svg", ".png", ".jpg", ".jpeg", ".glsl"],
					affects: ["Which file types are indexed"],
				},
				{
					key: "assetBrainIndexPath",
					name: "Asset Index Path",
					description: "Path where asset index markdown file is stored",
					default: "ErrlOS/Asset-Index.md",
					affects: ["Index file location"],
				},
			],
			useCases: [
				{
					scenario: "Index vault assets",
					steps: [
						"Configure assetBrainScanPaths in settings",
						"Enable Asset Brain organ",
						"Run asset scan (or triggered automatically)",
						"View asset index to see all indexed assets",
					],
					expectedOutcome: "Complete index of all assets in configured paths",
				},
				{
					scenario: "Find existing asset",
					steps: [
						"Open asset index or asset list modal",
						"Browse or search for asset",
						"Access asset directly from index",
					],
					expectedOutcome: "Easy discovery and access to existing assets",
				},
			],
			commonIssues: [
				{
					problem: "No assets found",
					cause: "Scan paths not configured or no supported file types in paths",
					solution: "Check assetBrainScanPaths setting and ensure directories contain supported file types",
				},
				{
					problem: "Assets not being indexed",
					cause: "File extensions not in assetBrainAssetExtensions list",
					solution: "Add desired file extensions to assetBrainAssetExtensions setting",
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
		this.scanPaths = (settings as any).assetBrainScanPaths || [];
		this.assetExtensions = (settings as any).assetBrainAssetExtensions || [".svg", ".png", ".jpg", ".jpeg", ".glsl"];
		this.indexPath = (settings as any).assetBrainIndexPath || "ErrlOS/Asset-Index.md";
		this.assetBrainBasePath = settings.assetBrainBasePath || "ErrlOS/Asset-Brain.base";
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
			id: "scan-assets",
			name: "Scan for Assets",
			callback: () => {
				this.scanAssets();
			},
		});

		this.plugin.addCommand({
			id: "view-assets-for-project",
			name: "View Assets for Project",
			callback: () => {
				this.viewAssetsForProject();
			},
		});

		this.plugin.addCommand({
			id: "view-all-assets",
			name: "View All Assets",
			callback: () => {
				this.viewAllAssets();
			},
		});

		this.plugin.addCommand({
			id: "asset-brain-open-base",
			name: "Open Asset Brain Base",
			callback: () => {
				this.openAssetBrainBase();
			},
		});
	}

	/**
	 * Scan vault for assets
	 */
	async scanAssets(): Promise<void> {
		const allFiles = this.plugin.app.vault.getFiles();
		const assets: AssetInfo[] = [];

		for (const file of allFiles) {
			const ext = file.extension.toLowerCase();
			if (this.assetExtensions.includes(`.${ext}`)) {
				const stat = await this.plugin.app.vault.adapter.stat(file.path);
				const usageCount = await this.countAssetUsage(file.path);
				
				assets.push({
					path: file.path,
					name: file.basename,
					type: this.getAssetType(ext),
					extension: ext,
					size: stat?.size || 0,
					lastModified: new Date(stat?.mtime || file.stat.mtime),
					usageCount,
				});
			}
		}

		// Update index
		assets.forEach(asset => {
			this.assetIndex.set(asset.path, asset);
		});

		new Notice(`Scanned ${assets.length} assets`);
	}

	/**
	 * Count how many notes reference an asset
	 */
	private async countAssetUsage(assetPath: string): Promise<number> {
		const assetName = assetPath.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
		const allFiles = this.plugin.app.vault.getMarkdownFiles();
		let count = 0;

		for (const file of allFiles) {
			try {
				let content: string;
				try {
					content = await this.plugin.app.vault.read(file);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "getReferenceCount", 
						filePath: file.path,
						action: "read"
					});
					console.error("[Errl OS] Error reading file for reference count:", errorInfo.message, errorInfo.context);
					// Don't show notice - this is batch processing
					continue;
				}
				// Check for links like [[asset-path]] or [[asset-name]]
				if (content.includes(`[[${assetPath}]]`) || content.includes(`[[${assetName}]]`)) {
					count++;
				}
			} catch (error) {
				// Skip files that can't be read
			}
		}

		return count;
	}

	/**
	 * Get asset type from extension
	 */
	private getAssetType(ext: string): "svg" | "image" | "shader" | "code" {
		if (ext === "svg") return "svg";
		if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
		if (["glsl", "frag", "vert"].includes(ext)) return "shader";
		return "code";
	}

	/**
	 * Get assets for a project (assets in project folder or referenced)
	 */
	async getAssetsForProject(projectPath: string): Promise<AssetInfo[]> {
		const assets: AssetInfo[] = [];
		
		for (const [path, asset] of this.assetIndex.entries()) {
			if (path.startsWith(projectPath) || asset.usageCount > 0) {
				assets.push(asset);
			}
		}

		return assets;
	}

	/**
	 * View assets for current project
	 */
	private async viewAssetsForProject(): Promise<void> {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file. Open a project file first.");
			return;
		}

		const projectPath = activeFile.path.split("/").slice(0, -1).join("/");
		const assets = await this.getAssetsForProject(projectPath);
		
		if (assets.length === 0) {
			new Notice("No assets found for this project");
			return;
		}

		// Open modal with asset list
		new AssetListModal(this.plugin.app, assets).open();
	}

	/**
	 * View all assets
	 */
	private viewAllAssets(): void {
		const assets = Array.from(this.assetIndex.values());
		
		if (assets.length === 0) {
			new Notice("No assets found. Run 'Scan for Assets' first.");
			return;
		}

		// Open modal with all assets
		new AssetListModal(this.plugin.app, assets).open();
	}

	/**
	 * Open the Asset Brain Base
	 */
	private async openAssetBrainBase(): Promise<void> {
		try {
			const baseFile = await this.ensureAssetBrainBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openAssetBrainBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open asset brain base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure Asset Brain Base exists, creating it if necessary
	 */
	private async ensureAssetBrainBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.assetBrainBasePath || this.assetBrainBasePath;

		// Check if Bases are enabled for asset brain
		if (!settings.basesEnabled?.assetBrain) {
			throw new Error("Asset Brain Base is disabled in settings");
		}

		// Build extension filter - Obsidian Bases uses file.extension property
		// Convert extensions like ".svg" to "svg" for the filter
		const extensions = this.assetExtensions.map(ext => ext.replace(/^\./, ""));
		const extensionFilter = extensions.map(ext => `"${ext}"`).join(", ");
		
		const baseConfig: BaseConfig = {
			filters: `file.extension in [${extensionFilter}]`,
			properties: {
				name: { displayName: "Asset Name", type: "text", sortable: true },
				type: { displayName: "Type", type: "text", sortable: true },
				extension: { displayName: "Extension", type: "select", sortable: true },
				size: { displayName: "Size", type: "number", sortable: true },
				lastModified: { displayName: "Last Modified", type: "date", format: "relative", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Assets",
					order: ["file.name", "file.extension", "file.mtime"],
				},
				{
					type: "table",
					name: "By Extension",
					groupBy: "file.extension",
					order: ["file.name", "file.mtime"],
				},
				{
					type: "table",
					name: "Recently Modified",
					order: ["file.mtime", "file.name"],
				},
				{
					type: "card",
					name: "Asset Gallery",
					order: ["file.name", "file.extension"],
					groupBy: "file.extension",
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}
}

