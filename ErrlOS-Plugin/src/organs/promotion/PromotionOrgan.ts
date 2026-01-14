import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, TFolder, Notice, Modal, Setting, App } from "obsidian";
import { FileUtils } from "../../utils/fileUtils";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { LoreEngineOrgan } from "../loreEngine/LoreEngineOrgan";

/**
 * Promotion type
 */
export type PromotionType = "capture-to-project" | "project-to-lore" | "capture-to-lore";

/**
 * Promotion history entry
 */
export interface PromotionHistory {
	date: Date;
	type: PromotionType;
	sourcePath: string;
	targetPath: string;
	content: string;
}

/**
 * Promotion Organ - Smooth transitions between capture → projects → lore
 * Tracks promotion history and provides promotion commands
 */
export class PromotionOrgan extends Organ {
	private historyPath: string = "ErrlOS/Promotion-History.md";
	private projectPath: string = "";
	private lorePath: string = "";

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "promotion";
	}

	getName(): string {
		return "Promotion Flows";
	}

	getDocumentation() {
		return {
			purpose: "Tracks content promotion lifecycle from draft to canon",
			description: "Promotion organ monitors content as it moves through different stages (draft, review, canon). It tracks promotion history, manages content lifecycle, and helps organize creative work by tracking which content has been promoted to different status levels. Works with Lore Engine to track canon status changes.",
			phase: "Phase 3: Intelligence",
			capabilities: [
				{
					name: "Promote Capture to Project",
					description: "Promotes captured content to a project folder",
					commands: ["promote-capture-to-project"],
				},
				{
					name: "Promote Project to Lore",
					description: "Promotes project content to lore/ canon",
					commands: ["promote-project-to-lore"],
				},
				{
					name: "Promote Capture to Lore",
					description: "Promotes captured content directly to lore/ canon",
					commands: ["promote-capture-to-lore"],
				},
				{
					name: "View Promotion History",
					description: "Opens the promotion history file",
					commands: ["view-promotion-history"],
				},
			],
			monitoring: [
				{
					what: "Content promotion events",
					why: "To track lifecycle of content from draft to canon",
					how: "Listens for promotion events and records them in history file",
					userControl: "Promotion happens through commands. History is automatically tracked.",
				},
			],
			fileOperations: [
				{
					type: "create" as const,
					path: "Configured project/lore paths (based on promotion type)",
					when: "When content is promoted via commands",
					userControl: "Paths configurable in settings. Promotion happens via explicit user commands.",
					example: "New file created in project or lore folder when content is promoted",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Promotion-History.md (configurable)",
					when: "When first promotion is recorded",
					userControl: "Path configurable in settings. File created automatically when needed.",
					example: "Promotion history file created at ErrlOS/Promotion-History.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Promotion-History.md (configurable)",
					when: "When content promotion commands are executed",
					userControl: "Promotion commands record history automatically.",
					example: "Promotion entry added to history file",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "promotionHistoryPath",
					name: "Promotion History Path",
					description: "Path where promotion history markdown file is stored",
					default: "ErrlOS/Promotion-History.md",
					affects: ["History file location"],
				},
				{
					key: "promotionProjectPath",
					name: "Promotion Project Path",
					description: "Path to project folder for tracking project promotions",
					default: "",
					affects: ["Where content is promoted when promoting to project"],
				},
				{
					key: "promotionLorePath",
					name: "Promotion Lore Path",
					description: "Path to lore folder for tracking lore promotions",
					default: "",
					affects: ["Where content is promoted when promoting to lore"],
				},
			],
			useCases: [
				{
					scenario: "Promote captured idea to project",
					steps: [
						"Capture an idea using Capture organ",
						"Run 'Promote Capture to Project' command",
						"Enter name and content (or use current selection)",
						"Content is moved to project folder and history is recorded",
					],
					expectedOutcome: "Captured content promoted to project folder with history entry",
				},
				{
					scenario: "Track content lifecycle",
					steps: [
						"Promote content through stages: capture → project → lore",
						"Review promotion history file to see full lifecycle",
					],
					expectedOutcome: "Complete history of content progression",
				},
			],
			commonIssues: [
				{
					problem: "Promotion paths not configured",
					cause: "promotionProjectPath or promotionLorePath not set",
					solution: "Configure promotion paths in settings before promoting content",
				},
				{
					problem: "Promotion history not being recorded",
					cause: "History file creation failed or path is invalid",
					solution: "Check promotionHistoryPath setting and ensure directory exists",
				},
			],
			dependencies: {
				required: [],
				optional: ["loreEngine (can trigger lore scan after promotion)", "capture (source of content to promote)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.historyPath = settings.promotionHistoryPath || "ErrlOS/Promotion-History.md";
		this.projectPath = settings.promotionProjectPath || "";
		this.lorePath = settings.promotionLorePath || "";
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		await this.registerCommands();
		this.subscribeToEvents();
	}

	/**
	 * Subscribe to relevant events from other modules
	 */
	private subscribeToEvents(): void {
		// Subscribe to project events
		this.subscribe("project:status-changed", (data) => {
			console.log("[Errl OS] Promotion: Project status changed", data);
		});

		this.subscribe("project:abandoned", (data) => {
			console.log("[Errl OS] Promotion: Project abandoned", data);
		});
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "promote-capture-to-project",
			name: "Promote Capture to Project",
			callback: () => {
				this.openPromotionModal("capture-to-project");
			},
		});

		this.plugin.addCommand({
			id: "promote-project-to-lore",
			name: "Promote Project to Lore",
			callback: () => {
				this.openPromotionModal("project-to-lore");
			},
		});

		this.plugin.addCommand({
			id: "promote-capture-to-lore",
			name: "Promote Capture to Lore",
			callback: () => {
				this.openPromotionModal("capture-to-lore");
			},
		});

		this.plugin.addCommand({
			id: "view-promotion-history",
			name: "View Promotion History",
			callback: () => {
				this.viewPromotionHistory();
			},
		});
	}

	/**
	 * Open promotion modal
	 */
	private openPromotionModal(type: PromotionType): void {
		const modal = new PromotionModal(this.plugin.app, type, async (name, content) => {
			try {
				await this.promote(type, name, content);
				new Notice("Promoted successfully!");
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				new Notice(`Failed to promote: ${errorMessage}`);
				console.error("[Promotion] Error:", error);
			}
		});
		modal.open();
	}

	/**
	 * Promote content to target location
	 */
	private async promote(type: PromotionType, name: string, content: string): Promise<void> {
		let targetPath: string;
		let sourcePath: string = "";

		switch (type) {
			case "capture-to-project":
				if (!this.projectPath || this.projectPath.trim() === "") {
					throw new Error("Project path not configured. Set it in Settings → Errl OS.");
				}
				// Check if project folder exists
				const projectDir = this.plugin.app.vault.getAbstractFileByPath(this.projectPath);
				if (!projectDir || !(projectDir instanceof TFolder)) {
					throw new Error(`Project folder not found at "${this.projectPath}". Configure path in Settings → Errl OS.`);
				}
				sourcePath = this.kernel.getSettings().captureFilePath;
				const sanitizedProjectName = FileUtils.sanitizeFileName(name);
				targetPath = `${this.projectPath}${sanitizedProjectName}/README.md`;
				break;
			case "project-to-lore":
				if (!this.lorePath || this.lorePath.trim() === "") {
					throw new Error("Lore path not configured. Set it in Settings → Errl OS.");
				}
				// Check if lore folder exists
				const loreDir = this.plugin.app.vault.getAbstractFileByPath(this.lorePath);
				if (!loreDir || !(loreDir instanceof TFolder)) {
					throw new Error(`Lore folder not found at "${this.lorePath}". Configure path in Settings → Errl OS.`);
				}
				// Get current file if in a project
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile) {
					sourcePath = activeFile.path;
					const sanitizedLoreName1 = FileUtils.sanitizeFileName(name);
					targetPath = `${this.lorePath}${sanitizedLoreName1}.md`;
				} else {
					throw new Error("No active file to promote");
				}
				break;
			case "capture-to-lore":
				if (!this.lorePath || this.lorePath.trim() === "") {
					throw new Error("Lore path not configured. Set it in Settings → Errl OS.");
				}
				// Check if lore folder exists
				const loreDir2 = this.plugin.app.vault.getAbstractFileByPath(this.lorePath);
				if (!loreDir2 || !(loreDir2 instanceof TFolder)) {
					throw new Error(`Lore folder not found at "${this.lorePath}". Configure path in Settings → Errl OS.`);
				}
				sourcePath = this.kernel.getSettings().captureFilePath;
				const sanitizedLoreName2 = FileUtils.sanitizeFileName(name);
				targetPath = `${this.lorePath}${sanitizedLoreName2}.md`;
				break;
		}

		// Create target file
		await FileUtils.ensureParentDirectoryExists(this.plugin.app, targetPath);
		const existingFile = this.plugin.app.vault.getAbstractFileByPath(targetPath);
		
		if (existingFile instanceof TFile) {
			// Append to existing file
			try {
				const existingContent = await this.plugin.app.vault.read(existingFile);
				const newContent = `${existingContent}\n\n---\n\n## Promoted: ${new Date().toLocaleDateString()}\n\n${content}`;
				await this.plugin.app.vault.modify(existingFile, newContent);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "promote", 
					filePath: targetPath,
					action: "modify",
					promotionType: type
				});
				console.error("[Errl OS] Error promoting content:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			}
		} else {
			// Create new file
			try {
				const fileContent = type === "project-to-lore" || type === "capture-to-lore"
					? `---
type: ${type === "project-to-lore" ? "lore" : "lore"}
promoted: true
promotedFrom: ${sourcePath}
promotedDate: ${new Date().toISOString()}
---

# ${name}

${content}
`
					: `# ${name}

${content}

---
*Promoted from capture on ${new Date().toLocaleDateString()}*
`;
				await this.plugin.app.vault.create(targetPath, fileContent);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "promote", 
					filePath: targetPath,
					action: "create",
					promotionType: type
				});
				console.error("[Errl OS] Error promoting content:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			}
		}

		// Record in history
		await this.recordPromotion({
			date: new Date(),
			type,
			sourcePath,
			targetPath,
			content,
		});

		// If promoting to lore, use Lore Engine service to find related entities
		if (type === "project-to-lore" || type === "capture-to-lore") {
			// Try to find related lore entities using the service
			const relatedEntitiesResponse = await this.requestService("loreEngine:find-related", {
				text: content,
			});

			if (relatedEntitiesResponse.success && relatedEntitiesResponse.data) {
				console.log(`[Errl OS] Promotion: Found ${relatedEntitiesResponse.data.length} related lore entities`);
			}

			// If Lore Engine is enabled, trigger scan
			if (this.kernel.isOrganEnabled("loreEngine")) {
				const loreEngine = this.kernel.getRegistry().get("loreEngine") as LoreEngineOrgan | undefined;
				if (loreEngine) {
					await loreEngine.scanEntities();
					await loreEngine.updateIndex();
				}
			}
		}

		// Publish event that content was promoted
		this.publish("promotion:content-created", {
			type,
			name,
			sourcePath,
			targetPath,
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Record promotion in history
	 */
	private async recordPromotion(history: PromotionHistory): Promise<void> {
		try {
			const historyFile = this.plugin.app.vault.getAbstractFileByPath(this.historyPath);
			const entry = `## ${history.date.toLocaleDateString()} - ${history.type}

- **From:** ${history.sourcePath}
- **To:** ${history.targetPath}
- **Type:** ${history.type}

\`\`\`
${history.content.substring(0, 200)}${history.content.length > 200 ? "..." : ""}
\`\`\`

---

`;

			if (historyFile instanceof TFile) {
				try {
					const existingContent = await this.plugin.app.vault.read(historyFile);
					await this.plugin.app.vault.modify(historyFile, entry + existingContent);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "recordPromotion", 
						filePath: this.historyPath,
						action: "modify"
					});
					console.error("[Errl OS] Error recording promotion:", errorInfo.message, errorInfo.context);
					// Don't throw - history recording failure shouldn't block promotion
				}
			} else {
				try {
					await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.historyPath);
					await this.plugin.app.vault.create(this.historyPath, `# Promotion History\n\n${entry}`);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "recordPromotion", 
						filePath: this.historyPath,
						action: "create"
					});
					console.error("[Errl OS] Error recording promotion:", errorInfo.message, errorInfo.context);
					// Don't throw - history recording failure shouldn't block promotion
				}
			}
		} catch (error) {
			// Handle any other errors in history recording
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "recordPromotion", 
				filePath: this.historyPath
			});
			console.error("[Errl OS] Error recording promotion:", errorInfo.message, errorInfo.context);
			// Don't throw - history recording failure shouldn't block promotion
		}
	}

	/**
	 * View promotion history
	 */
	private async viewPromotionHistory(): Promise<void> {
		try {
			const file = this.plugin.app.vault.getAbstractFileByPath(this.historyPath);
			if (file instanceof TFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(file);
			} else {
				// Create empty history
				try {
					await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.historyPath);
					await this.plugin.app.vault.create(this.historyPath, "# Promotion History\n\n> No promotions yet.\n");
					const newFile = this.plugin.app.vault.getAbstractFileByPath(this.historyPath);
					if (newFile instanceof TFile) {
						await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
					}
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "viewPromotionHistory", 
						filePath: this.historyPath,
						action: "create"
					});
					console.error("[Errl OS] Error creating promotion history:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
				}
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "viewPromotionHistory", 
				filePath: this.historyPath
			});
			console.error("[Errl OS] Error viewing promotion history:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
		}
	}
}

/**
 * Promotion modal for entering promotion details
 */
class PromotionModal extends Modal {
	private type: PromotionType;
	private onSubmit: (name: string, content: string) => void;

	constructor(app: App, type: PromotionType, onSubmit: (name: string, content: string) => void) {
		super(app);
		this.type = type;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: `Promote: ${this.getTypeLabel()}` });

		let nameInput: HTMLInputElement;
		let contentInput: HTMLTextAreaElement;

		new Setting(contentEl)
			.setName("Name")
			.setDesc("Name for the promoted item")
			.addText((text) => {
				nameInput = text.inputEl;
				text.setPlaceholder("Enter name...");
			});

		new Setting(contentEl)
			.setName("Content")
			.setDesc("Content to promote (or leave empty to use current selection)")
			.addTextArea((text) => {
				contentInput = text.inputEl;
				text.setPlaceholder("Enter content or leave empty to use selection...");
				text.inputEl.rows = 10;
			});

		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText("Promote").onClick(() => {
					const name = nameInput.value.trim();
					const content = contentInput.value.trim();

					if (!name) {
						new Notice("Name is required");
						return;
					}

					// If content is empty, try to get selection
					let finalContent = content;
					if (!finalContent) {
						const { MarkdownView } = require("obsidian");
						const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
						if (activeView && "editor" in activeView) {
							const editor = (activeView as any).editor;
							const selection = editor.getSelection();
							if (selection) {
								finalContent = selection;
							} else {
								finalContent = editor.getValue();
							}
						}
					}

					if (!finalContent) {
						new Notice("Content is required");
						return;
					}

					this.onSubmit(name, finalContent);
					this.close();
				});
			})
			.addButton((button) => {
				button.setButtonText("Cancel").onClick(() => {
					this.close();
				});
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private getTypeLabel(): string {
		switch (this.type) {
			case "capture-to-project":
				return "Capture → Project";
			case "project-to-lore":
				return "Project → Lore";
			case "capture-to-lore":
				return "Capture → Lore";
		}
	}
}

