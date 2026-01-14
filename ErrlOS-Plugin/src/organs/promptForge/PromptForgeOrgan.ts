import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice, Modal, Setting, App, TFile } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";

/**
 * Prompt type
 */
export type PromptType = "image" | "video" | "code" | "writing";

/**
 * Prompt Forge Organ - Generate prompts from notes
 */
export class PromptForgeOrgan extends Organ {
	private outputPath: string = "ErrlOS/Prompts/";

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "promptForge";
	}

	getName(): string {
		return "Prompt Forge";
	}

	getDocumentation() {
		return {
			purpose: "Generates and manages AI prompts for creative work, storing reusable prompt templates",
			description: "Prompt Forge organ helps you create, store, and reuse AI prompts for creative work. It provides a system for managing prompt templates, generating prompts from templates, and organizing prompts by type or purpose. Prompts are stored as files in a configured directory for easy access and reuse.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Generate Prompt",
					description: "Generates a prompt from a template",
					commands: [],
				},
				{
					name: "View Prompts",
					description: "Views stored prompt files",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Prompts/ (configurable base path)",
					when: "When prompts are generated or saved",
					userControl: "Base path configurable in settings. Files created when prompts are generated.",
					example: "Prompt file created at ErrlOS/Prompts/{prompt-name}.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Prompts/ (configurable base path)",
					when: "When prompts are updated",
					userControl: "User controls when to create/update prompts.",
					example: "Prompt file updated with new content",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "promptForgeOutputPath",
					name: "Prompt Forge Output Path",
					description: "Base directory path where prompt files are stored",
					default: "ErrlOS/Prompts/",
					affects: ["Prompt file location"],
				},
			],
			useCases: [
				{
					scenario: "Create reusable prompt template",
					steps: [
						"Enable Prompt Forge organ",
						"Generate or create a prompt template",
						"Save prompt to configured directory",
						"Reuse prompt template for future work",
					],
					expectedOutcome: "Reusable prompt template stored and accessible",
				},
				{
					scenario: "Generate prompt from template",
					steps: [
						"Select or load prompt template",
						"Fill in template variables",
						"Generate final prompt",
						"Use prompt for AI interactions",
					],
					expectedOutcome: "Customized prompt ready for use",
				},
			],
			commonIssues: [
				{
					problem: "Prompt files not being created",
					cause: "Output path misconfigured or insufficient permissions",
					solution: "Check promptForgeOutputPath setting and ensure directory can be created",
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
		this.outputPath = (settings as any).promptForgeOutputPath || "ErrlOS/Prompts/";
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
			id: "generate-prompt",
			name: "Generate Prompt",
			callback: () => {
				this.generatePrompt();
			},
		});
	}

	/**
	 * Generate prompt from selected note or current note
	 */
	private async generatePrompt(): Promise<void> {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file. Open a note first.");
			return;
		}

		const modal = new PromptForgeModal(this.plugin.app, activeFile, this.outputPath, this, async (prompt, type) => {
			await this.savePrompt(prompt, type, activeFile.basename);
			new Notice("Prompt generated!");
		});
		modal.open();
	}

	/**
	 * Extract context from note
	 */
	private async extractContext(file: TFile): Promise<string> {
		try {
			let content: string;
			try {
				content = await this.plugin.app.vault.read(file);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "extractContext", 
					filePath: file.path,
					action: "read"
				});
				console.error("[Errl OS] Error reading file for context extraction:", errorInfo.message, errorInfo.context);
				// Return empty context on error
				return "";
			}
			// Extract first few paragraphs or key content
			const lines = content.split("\n").filter(line => line.trim().length > 0);
			return lines.slice(0, 10).join("\n");
		} catch (error) {
			console.error("[Prompt Forge] Error reading file:", error);
			return "";
		}
	}

	/**
	 * Generate prompt from context
	 */
	generatePromptFromContext(context: string, type: PromptType): string {
		const templates: Record<PromptType, string> = {
			image: `Generate an image based on:\n\n${context}\n\nStyle: Digital art, vibrant colors, detailed`,
			video: `Create a video concept for:\n\n${context}\n\nDuration: 30 seconds, dynamic visuals`,
			code: `Write code that:\n\n${context}\n\nLanguage: TypeScript, well-commented, modular`,
			writing: `Write a story/essay about:\n\n${context}\n\nTone: Creative, engaging, descriptive`,
		};

		return templates[type];
	}

	/**
	 * Save prompt to file
	 */
	private async savePrompt(prompt: string, type: PromptType, sourceName: string): Promise<void> {
		const dateStr = new Date().toISOString().split("T")[0];
		const fileName = `${type}-${dateStr}-${Date.now()}.md`;
		const filePath = `${this.outputPath}${fileName}`;

		const content = `# ${type} Prompt

> Generated from: ${sourceName}
> Date: ${new Date().toLocaleString()}

${prompt}
`;

		try {
			const existingFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
			if (existingFile instanceof TFile) {
				try {
					await this.plugin.app.vault.modify(existingFile, content);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "savePrompt", 
						filePath: filePath,
						action: "modify"
					});
					console.error("[Prompt Forge] Error saving prompt:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
					throw new Error(errorInfo.userMessage);
				}
			} else {
				try {
					await this.plugin.app.vault.create(filePath, content);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "savePrompt", 
						filePath: filePath,
						action: "create"
					});
					console.error("[Prompt Forge] Error creating prompt:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
					throw new Error(errorInfo.userMessage);
				}
			}
		} catch (error) {
			// If error wasn't already handled, handle it now
			if (!(error instanceof Error && error.message.startsWith("Failed to"))) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "savePrompt", 
					filePath: filePath
				});
				console.error("[Prompt Forge] Error saving prompt:", errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			} else {
				throw error;
			}
			throw error;
		}
	}
}

/**
 * Prompt Forge Modal
 */
class PromptForgeModal extends Modal {
	private file: TFile;
	private outputPath: string;
	private organ: PromptForgeOrgan;
	private onSubmit: (prompt: string, type: PromptType) => void;

	constructor(app: App, file: TFile, outputPath: string, organ: PromptForgeOrgan, onSubmit: (prompt: string, type: PromptType) => void) {
		super(app);
		this.file = file;
		this.outputPath = outputPath;
		this.organ = organ;
		this.onSubmit = onSubmit;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Generate Prompt" });
		contentEl.createEl("p", { text: `Source: ${this.file.basename}` });

		let selectedType: PromptType = "image";
		let context = "";

		// Extract context
		try {
			const content = await this.app.vault.read(this.file);
			const lines = content.split("\n").filter(line => line.trim().length > 0);
			context = lines.slice(0, 10).join("\n");
		} catch (error) {
			context = "Unable to read file";
		}

		// Prompt type selection
		new Setting(contentEl)
			.setName("Prompt Type")
			.setDesc("Select the type of prompt to generate")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("image", "Image Generation")
					.addOption("video", "Video Tools")
					.addOption("code", "Code Agent")
					.addOption("writing", "Writing Session")
					.setValue("image")
					.onChange((value) => {
						selectedType = value as PromptType;
					});
			});

		// Context preview
		contentEl.createEl("h3", { text: "Context" });
		const contextEl = contentEl.createEl("pre", {
			text: context,
			cls: "prompt-forge-context",
		});
		contextEl.style.maxHeight = "200px";
		contextEl.style.overflow = "auto";
		contextEl.style.padding = "10px";
		contextEl.style.background = "var(--background-secondary)";
		contextEl.style.borderRadius = "4px";

		// Generate button
		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText("Generate Prompt")
					.onClick(() => {
						const prompt = this.organ.generatePromptFromContext(context, selectedType);
						this.onSubmit(prompt, selectedType);
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
}

