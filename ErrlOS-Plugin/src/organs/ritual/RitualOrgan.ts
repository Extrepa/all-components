import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice, Modal, Setting, TFile, App } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { RitualType, RitualTemplate, DEFAULT_RITUAL_TEMPLATES, processRitualTemplate } from "./RitualTypes";
import { FileUtils } from "../../utils/fileUtils";
import { EnergyOrgan } from "../energy/EnergyOrgan";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Ritual Organ - Structured transitions
 * Provides rituals for session start/end, project completion, canon declaration, and clean abandonment
 */
export class RitualOrgan extends Organ {
	private ritualLogPath: string = "ErrlOS/Rituals/";
	private ritualBasePath: string = "ErrlOS/Rituals.base";
	private templates: Map<RitualType, RitualTemplate> = new Map();

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
		// Initialize with default templates
		DEFAULT_RITUAL_TEMPLATES.forEach(template => {
			this.templates.set(template.type, template);
		});
	}

	getId(): string {
		return "ritual";
	}

	getName(): string {
		return "Ritual Engine";
	}

	getDocumentation() {
		return {
			purpose: "Provides structured rituals for session transitions, project completion, canon declaration, and clean abandonment",
			description: "Ritual Engine organ provides templated rituals for important workflow transitions. It helps structure transitions between states (session start/end, project completion, canon declaration, project abandonment) with guided templates that prompt for necessary information and create ritual log files. Rituals help maintain intentionality in creative work.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Start Session Ritual",
					description: "Performs session start ritual with guided prompts",
					commands: ["ritual-session-start"],
				},
				{
					name: "End Session Ritual",
					description: "Performs session end ritual with guided prompts",
					commands: ["ritual-session-end"],
				},
				{
					name: "Complete Project Ritual",
					description: "Performs project completion ritual",
					commands: ["ritual-project-complete"],
				},
				{
					name: "Declare Canon Ritual",
					description: "Performs canon declaration ritual",
					commands: ["ritual-canon-declare"],
				},
				{
					name: "Abandon Project Ritual",
					description: "Performs clean project abandonment ritual",
					commands: ["ritual-abandon"],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Rituals/Sessions/session-{start|end}-YYYY-MM-DD-{timestamp}.md (configurable base path)",
					when: "When session start/end ritual is performed",
					userControl: "Base path configurable in settings. Rituals performed via explicit user commands.",
					example: "Session ritual file created when ritual command is executed",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Rituals/Projects/project-complete-{name}-YYYY-MM-DD.md (configurable base path)",
					when: "When project complete ritual is performed",
					userControl: "Rituals performed via explicit user commands.",
					example: "Project completion ritual file created",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Rituals/Canon/canon-{name}-YYYY-MM-DD.md (configurable base path)",
					when: "When canon declare ritual is performed",
					userControl: "Rituals performed via explicit user commands.",
					example: "Canon declaration ritual file created",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Rituals/Abandoned/abandon-{name}-YYYY-MM-DD.md (configurable base path)",
					when: "When abandon ritual is performed",
					userControl: "Rituals performed via explicit user commands.",
					example: "Project abandonment ritual file created",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "ritualLogPath",
					name: "Ritual Log Path",
					description: "Base directory path where ritual log files are stored",
					default: "ErrlOS/Rituals/",
					affects: ["Ritual file location"],
				},
			],
			useCases: [
				{
					scenario: "Start work session",
					steps: [
						"Run 'Ritual: Start Session' command",
						"Fill in ritual template prompts",
						"Ritual file is created and opened",
						"Complete ritual template",
					],
					expectedOutcome: "Structured session start with intentional beginning",
				},
				{
					scenario: "Complete a project",
					steps: [
						"Run 'Ritual: Complete Project' command",
						"Enter project details in ritual modal",
						"Ritual file is created with completion record",
						"Momentum is stored (if Energy organ enabled)",
					],
					expectedOutcome: "Structured project completion with record and momentum reward",
				},
			],
			commonIssues: [
				{
					problem: "Ritual files not being created",
					cause: "Ritual log path misconfigured or insufficient permissions",
					solution: "Check ritualLogPath setting and ensure directory structure can be created",
				},
			],
			dependencies: {
				required: [],
				optional: ["energy (stores momentum when project is completed)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.ritualLogPath = settings.ritualLogPath || "ErrlOS/Rituals/";
		this.ritualBasePath = settings.ritualBasePath || "ErrlOS/Rituals.base";
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
			id: "ritual-session-start",
			name: "Ritual: Start Session",
			callback: () => {
				this.performRitual("session-start");
			},
		});

		this.plugin.addCommand({
			id: "ritual-session-end",
			name: "Ritual: End Session",
			callback: () => {
				this.performRitual("session-end");
			},
		});

		this.plugin.addCommand({
			id: "ritual-project-complete",
			name: "Ritual: Complete Project",
			callback: () => {
				this.performRitual("project-complete");
			},
		});

		this.plugin.addCommand({
			id: "ritual-canon-declare",
			name: "Ritual: Declare Canon",
			callback: () => {
				this.performRitual("canon-declare");
			},
		});

		this.plugin.addCommand({
			id: "ritual-abandon",
			name: "Ritual: Abandon Project",
			callback: () => {
				this.performRitual("abandon");
			},
		});

		this.plugin.addCommand({
			id: "ritual-open-base",
			name: "Open Ritual Base",
			callback: async () => {
				await this.openRitualBase();
			},
		});
	}

	/**
	 * Perform a ritual
	 */
	private async performRitual(type: RitualType): Promise<void> {
		const template = this.templates.get(type);
		if (!template) {
			new Notice(`No template found for ritual type: ${type}`);
			return;
		}

		const modal = new RitualModal(this.plugin.app, template, async (variables, content) => {
			try {
				await this.executeRitual(type, template, variables, content);
				new Notice("Ritual completed!");
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				new Notice(`Failed to execute ritual: ${errorMessage}`);
				console.error("[Ritual] Error:", error);
			}
		});
		modal.open();
	}

	/**
	 * Execute ritual (create file with ritual content)
	 */
	private async executeRitual(
		type: RitualType,
		template: RitualTemplate,
		variables: Record<string, string>,
		customContent?: string
	): Promise<void> {
		// Process template
		let content = customContent || processRitualTemplate(template.template, variables);

		// Determine file path based on type
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		let fileName: string;
		let filePath: string;
		let projectName: string | undefined;
		let entityName: string | undefined;

		switch (type) {
			case "session-start":
			case "session-end":
				fileName = `${type}-${dateStr}-${now.getTime()}.md`;
				filePath = `${this.ritualLogPath}Sessions/${fileName}`;
				break;
			case "project-complete":
				projectName = variables.projectName || "unknown";
				const sanitizedProjectName = FileUtils.sanitizeFileName(projectName);
				fileName = `project-complete-${sanitizedProjectName}-${dateStr}.md`;
				filePath = `${this.ritualLogPath}Projects/${fileName}`;
				break;
			case "canon-declare":
				entityName = variables.entityName || "unknown";
				const sanitizedEntityName = FileUtils.sanitizeFileName(entityName);
				fileName = `canon-${sanitizedEntityName}-${dateStr}.md`;
				filePath = `${this.ritualLogPath}Canon/${fileName}`;
				break;
			case "abandon":
				projectName = variables.projectName || "unknown";
				const sanitizedAbandonName = FileUtils.sanitizeFileName(projectName);
				fileName = `abandon-${sanitizedAbandonName}-${dateStr}.md`;
				filePath = `${this.ritualLogPath}Abandoned/${fileName}`;
				break;
		}

		// Build frontmatter
		const frontmatterLines = [
			"---",
			"type: ritual",
			`ritualType: ${type}`,
			`date: ${dateStr}`,
		];

		if (projectName) {
			frontmatterLines.push(`projectName: ${projectName}`);
		}

		if (entityName) {
			frontmatterLines.push(`entityName: ${entityName}`);
		}

		frontmatterLines.push("---", "");

		// Prepend frontmatter to content
		const contentWithFrontmatter = frontmatterLines.join("\n") + content;

		// Create file
		try {
			await FileUtils.ensureParentDirectoryExists(this.plugin.app, filePath);
			await this.plugin.app.vault.create(filePath, contentWithFrontmatter);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "performRitual", 
				filePath: filePath,
				ritualType: type
			});
			console.error("[Errl OS] Error creating ritual file:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
			throw new Error(errorInfo.userMessage);
		}

		// Store momentum if project was completed
		if (type === "project-complete") {
			const energyOrgan = this.kernel.getRegistry().get("energy") as EnergyOrgan | undefined;
			if (energyOrgan && this.kernel.isOrganEnabled("energy")) {
				try {
					await energyOrgan.storeMomentum(30); // Store 30 momentum for completing a project
				} catch (error) {
					console.error("[Ritual] Error storing momentum:", error);
					// Don't fail the ritual if momentum storage fails
				}
			}
		}

		// Open file
		const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
		if (file instanceof TFile) {
			await this.plugin.app.workspace.getLeaf(true).openFile(file);
		}
	}

	/**
	 * Open the Ritual Base
	 */
	private async openRitualBase(): Promise<void> {
		try {
			const baseFile = await this.ensureRitualBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openRitualBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open ritual base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure Ritual Base exists, creating it if necessary
	 */
	private async ensureRitualBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.ritualBasePath || this.ritualBasePath;

		// Check if Bases are enabled for rituals
		if (!settings.basesEnabled?.ritual) {
			throw new Error("Ritual Base is disabled in settings");
		}

		const baseConfig: BaseConfig = {
			filters: `note.type = "ritual"`,
			properties: {
				ritualType: { displayName: "Ritual Type", type: "select", sortable: true, options: ["session-start", "session-end", "project-complete", "canon-declare", "abandon"] },
				date: { displayName: "Date", type: "date", format: "short", sortable: true },
				projectName: { displayName: "Project Name", type: "text", sortable: true },
				entityName: { displayName: "Entity Name", type: "text", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Rituals",
					order: ["note.date", "note.ritualType", "file.name"],
				},
				{
					type: "table",
					name: "By Type",
					groupBy: "note.ritualType",
					order: ["note.date", "file.name"],
				},
				{
					type: "table",
					name: "By Date",
					groupBy: "note.date",
					order: ["note.ritualType", "file.name"],
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}
}

/**
 * Ritual modal for entering ritual details
 */
class RitualModal extends Modal {
	private template: RitualTemplate;
	private onSubmit: (variables: Record<string, string>, content?: string) => void;

	constructor(app: App, template: RitualTemplate, onSubmit: (variables: Record<string, string>, content?: string) => void) {
		super(app);
		this.template = template;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: this.template.name });
		contentEl.createEl("p", { text: this.template.description });

		const variables: Record<string, HTMLInputElement> = {};

		// Add variable inputs based on template type
		if (this.template.type === "project-complete" || this.template.type === "abandon") {
			new Setting(contentEl)
				.setName("Project Name")
				.setDesc("Name of the project")
				.addText((text) => {
					variables.projectName = text.inputEl;
					text.setPlaceholder("Enter project name...");
				});
		}

		if (this.template.type === "canon-declare") {
			new Setting(contentEl)
				.setName("Entity Name")
				.setDesc("Name of the entity being declared canon")
				.addText((text) => {
					variables.entityName = text.inputEl;
					text.setPlaceholder("Enter entity name...");
				});
		}

		// Preview
		const previewEl = contentEl.createEl("div", { cls: "ritual-preview" });
		previewEl.createEl("h3", { text: "Preview" });
		const previewContent = contentEl.createEl("div", { cls: "ritual-preview-content" });
		
		const updatePreview = () => {
			const vars: Record<string, string> = {};
			Object.entries(variables).forEach(([key, input]) => {
				vars[key] = input.value || "";
			});
			previewContent.innerHTML = `<pre>${processRitualTemplate(this.template.template, vars).replace(/\n/g, "<br>")}</pre>`;
		};

		// Update preview when variables change
		Object.values(variables).forEach(input => {
			input.addEventListener("input", updatePreview);
		});
		updatePreview();

		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText("Execute Ritual").onClick(() => {
					const vars: Record<string, string> = {};
					Object.entries(variables).forEach(([key, input]) => {
						vars[key] = input.value.trim();
					});
					this.onSubmit(vars);
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

