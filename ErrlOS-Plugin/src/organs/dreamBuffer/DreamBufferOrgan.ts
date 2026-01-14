import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { DreamBufferModal } from "./DreamBufferModal";
import { FileUtils } from "../../utils/fileUtils";

/**
 * Dream Buffer Organ - Logic-free capture space for raw imagery
 * Separate from regular capture, no structure, no tags, pure creative flow
 */
export class DreamBufferOrgan extends Organ {
	private dreamBufferPath: string = "ErrlOS/Dream-Buffer.md";

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "dreamBuffer";
	}

	getName(): string {
		return "Dream Buffer";
	}

	getDocumentation() {
		return {
			purpose: "Stores dreams, half-formed ideas, and unprocessed thoughts for later incubation",
			description: "Dream Buffer organ provides a space for capturing dreams, half-formed ideas, and thoughts that aren't ready to be processed yet. It acts as an incubation space where ideas can sit until they're ready to be promoted to capture, projects, or lore. Helps prevent losing valuable but unformed thoughts.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Add to Dream Buffer",
					description: "Adds content to the dream buffer",
					commands: [],
				},
				{
					name: "View Dream Buffer",
					description: "Opens the dream buffer file",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Dream-Buffer.md (configurable)",
					when: "When first dream/idea is added to buffer",
					userControl: "Path configurable in settings. File created automatically when needed.",
					example: "Dream buffer file created at ErrlOS/Dream-Buffer.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Dream-Buffer.md (configurable)",
					when: "When content is added to dream buffer",
					userControl: "User controls when to add content. Entries added manually or via commands.",
					example: "Dream/idea entry added to buffer file",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "dreamBufferPath",
					name: "Dream Buffer Path",
					description: "Path where dream buffer markdown file is stored",
					default: "ErrlOS/Dream-Buffer.md",
					affects: ["Buffer file location"],
				},
			],
			useCases: [
				{
					scenario: "Capture half-formed idea",
					steps: [
						"Enable Dream Buffer organ",
						"Add idea/dream to buffer (via command or manual entry)",
						"Idea is stored for later incubation",
						"Review buffer later when ready to develop idea",
					],
					expectedOutcome: "Idea preserved for later development",
				},
				{
					scenario: "Incubate creative thoughts",
					steps: [
						"Add multiple dreams/ideas to buffer over time",
						"Review buffer periodically",
						"Promote developed ideas to capture or projects when ready",
					],
					expectedOutcome: "Creative thoughts preserved and developed over time",
				},
			],
			commonIssues: [
				{
					problem: "Dream buffer file not found",
					cause: "File hasn't been created yet or path is misconfigured",
					solution: "File will be created automatically when first entry is added, or check dreamBufferPath setting",
				},
			],
			dependencies: {
				required: [],
				optional: ["promotion (can promote incubated ideas to projects/lore)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.dreamBufferPath = settings.dreamBufferPath || "ErrlOS/Dream-Buffer.md";
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
			id: "dream-buffer-capture",
			name: "Dream Buffer: Capture",
			hotkeys: [
				{
					modifiers: ["Mod", "Shift"],
					key: "d",
				},
			],
			callback: () => {
				this.openDreamBuffer();
			},
		});

		this.plugin.addCommand({
			id: "dream-buffer-view",
			name: "Dream Buffer: View",
			callback: () => {
				this.viewDreamBuffer();
			},
		});

		this.plugin.addCommand({
			id: "dream-buffer-promote",
			name: "Dream Buffer: Promote to Capture",
			callback: () => {
				this.promoteToCapture();
			},
		});
	}

	/**
	 * Open dream buffer modal
	 */
	private openDreamBuffer(): void {
		const modal = new DreamBufferModal(this.plugin.app, async (content) => {
			try {
				await this.captureDream(content);
				new Notice("Dream captured!");
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				new Notice(`Failed to capture dream: ${errorMessage}`);
				console.error("[Dream Buffer] Error:", error);
			}
		});
		modal.open();
	}

	/**
	 * Capture dream content (append-only, no structure)
	 */
	private async captureDream(content: string): Promise<void> {
		await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.dreamBufferPath);
		
		const now = new Date();
		const timestamp = now.toISOString();
		const dateStr = now.toLocaleDateString();
		const timeStr = now.toLocaleTimeString();

		// Simple, unstructured format
		const entry = `---

${dateStr} ${timeStr}

${content}

`;

		const file = this.plugin.app.vault.getAbstractFileByPath(this.dreamBufferPath);
		if (file instanceof TFile) {
			// Append to existing file
			try {
				const existingContent = await this.plugin.app.vault.read(file);
				await this.plugin.app.vault.modify(file, existingContent + entry);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "addToDreamBuffer", 
					filePath: this.dreamBufferPath,
					action: "modify"
				});
				console.error("[Errl OS] Error adding to dream buffer:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			}
		} else {
			// Create new file with minimal structure
			try {
				const header = `# Dream Buffer

> Logic-free capture space. No structure. No tags. Just raw creative flow.

---
`;
				await this.plugin.app.vault.create(this.dreamBufferPath, header + entry);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "addToDreamBuffer", 
					filePath: this.dreamBufferPath,
					action: "create"
				});
				console.error("[Errl OS] Error creating dream buffer:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			}
		}
	}

	/**
	 * View dream buffer
	 */
	private async viewDreamBuffer(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.dreamBufferPath);
		if (file instanceof TFile) {
			await this.plugin.app.workspace.getLeaf(true).openFile(file);
		} else {
			// Create empty buffer
			await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.dreamBufferPath);
			await this.plugin.app.vault.create(this.dreamBufferPath, `# Dream Buffer

> Logic-free capture space. No structure. No tags. Just raw creative flow.

---
`);
			const newFile = this.plugin.app.vault.getAbstractFileByPath(this.dreamBufferPath);
			if (newFile instanceof TFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
			}
		}
	}

	/**
	 * Promote dream buffer content to regular capture
	 */
	private async promoteToCapture(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.dreamBufferPath);
		if (!(file instanceof TFile)) {
			new Notice("Dream buffer is empty");
			return;
		}

		try {
			let content: string;
			try {
				content = await this.plugin.app.vault.read(file);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "getMostRecentEntry", 
					filePath: this.dreamBufferPath,
					action: "read"
				});
				console.error("[Errl OS] Error reading dream buffer:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				return;
			}
			// Extract most recent entry (last entry before ---)
			const entries = content.split(/^---$/m);
			if (entries.length < 2) {
				new Notice("No entries to promote");
				return;
			}

			const lastEntry = entries[entries.length - 1].trim();
			if (!lastEntry) {
				new Notice("Last entry is empty");
				return;
			}

			// Use capture organ to capture
			const captureOrgan = this.kernel.getRegistry().get("capture");
			if (captureOrgan) {
				// Trigger capture with the dream content
				// Note: This would need integration with CaptureOrgan's capture method
				new Notice("Promote functionality: Select text in Dream Buffer and use regular Capture");
			} else {
				// Fallback: just open capture file
				const capturePath = this.kernel.getSettings().captureFilePath;
				const captureFile = this.plugin.app.vault.getAbstractFileByPath(capturePath);
				if (captureFile instanceof TFile) {
					await this.plugin.app.workspace.getLeaf(true).openFile(captureFile);
					new Notice("Opened capture file. Paste your dream content there.");
				}
			}
		} catch (error) {
			console.error("[Dream Buffer] Error promoting:", error);
			new Notice("Failed to promote dream content");
		}
	}
}

