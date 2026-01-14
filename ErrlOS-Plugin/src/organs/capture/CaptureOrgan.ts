import { Organ, OrganConfigurationStatus } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice, TFolder } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { CaptureModal } from "./CaptureModal";
import { FileUtils } from "../../utils/fileUtils";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Capture Organ - Zero-friction idea intake
 * Provides hotkey-triggered modal for capturing thoughts
 */
export class CaptureOrgan extends Organ {
	private captureFilePath: string = "ErrlOS/Capture.md";
	private captureRecordFolderPath: string = "ErrlOS/Capture/";
	private captureBasePath: string = "ErrlOS/Capture.base";

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "capture";
	}

	getName(): string {
		return "Capture";
	}

	getDocumentation() {
		return {
			purpose: "Zero-friction idea intake system for capturing thoughts instantly",
			description: "The Capture organ provides a hotkey-triggered modal for quickly capturing thoughts, ideas, and notes. Captured content is automatically appended to a markdown file with timestamps and optional tags. Designed for minimal friction to capture ideas before they're lost.",
			phase: "Phase 1: Foundation",
			capabilities: [
				{
					name: "Capture Thought",
					description: "Opens modal to capture text with optional tag",
					commands: ["capture-thought"],
					hotkeys: ["Mod+Shift+C"],
				},
				{
					name: "Open Capture Base",
					description: "Opens the Bases view for capture entries",
					commands: ["capture-open-base"],
				},
				{
					name: "Format Captured Text",
					description: "Formats captured text with timestamp and optional tag (capability available to other organs)",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Capture.md (configurable)",
					when: "When first capture is made and file doesn't exist",
					userControl: "Path can be changed in settings. File is created automatically on first capture.",
					example: "Capture file created at ErrlOS/Capture.md",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Capture/ (configurable folder)",
					when: "When per-capture notes are created",
					userControl: "Folder path can be changed in settings.",
					example: "Capture record created at ErrlOS/Capture/capture-YYYY-MM-DD-HHMMSS-title.md",
				},
				{
					type: "create" as const,
					path: "ErrlOS/Capture.base (configurable)",
					when: "When the Capture Base is opened and the file doesn't exist",
					userControl: "Base path can be changed in settings.",
					example: "Capture base created at ErrlOS/Capture.base",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Capture.md (configurable)",
					when: "Every time a thought is captured via command or modal",
					userControl: "User controls when to capture. Content is appended, never overwrites.",
					example: "New entry appended with timestamp and optional tag",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "captureFilePath",
					name: "Capture File Path",
					description: "Path where captured thoughts are stored",
					default: "ErrlOS/Capture.md",
					affects: ["File location for captures"],
				},
				{
					key: "captureRecordFolderPath",
					name: "Capture Record Folder",
					description: "Folder where per-capture notes are stored for Bases",
					default: "ErrlOS/Capture/",
					affects: ["Per-capture record location"],
				},
				{
					key: "captureBasePath",
					name: "Capture Base Path",
					description: "Path to the Bases view file for capture entries",
					default: "ErrlOS/Capture.base",
					affects: ["Bases view location"],
				},
			],
			useCases: [
				{
					scenario: "Quick idea capture",
					steps: [
						"Press Mod+Shift+C (or use command)",
						"Type idea/thought in modal",
						"Optionally add tag",
						"Click Capture or press Enter",
						"Thought is saved to capture file with timestamp",
					],
					expectedOutcome: "Thought captured and saved to file",
				},
				{
					scenario: "Capture with tag for organization",
					steps: [
						"Open capture modal",
						"Enter thought text",
						"Add tag (e.g., 'idea', 'todo', 'note')",
						"Capture",
					],
					expectedOutcome: "Thought saved with tag for easier filtering",
				},
			],
			commonIssues: [
				{
					problem: "Hotkey not working",
					cause: "Hotkey conflict with another plugin or Obsidian setting",
					solution: "Check hotkey settings in Obsidian settings, or use command palette instead",
				},
				{
					problem: "Capture file not found",
					cause: "File path changed or file was deleted",
					solution: "File will be recreated automatically on next capture, or check path in settings",
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
		// Update capture file path from settings
		const settings = this.kernel.getSettings();
		this.captureFilePath = settings.captureFilePath;
		this.captureRecordFolderPath = settings.captureRecordFolderPath || "ErrlOS/Capture/";
		this.captureBasePath = settings.captureBasePath || "ErrlOS/Capture.base";
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		await this.registerCommands();
		await this.registerCapabilities();
	}

	/**
	 * Register capabilities that this organ provides
	 */
	private async registerCapabilities(): Promise<void> {
		// Register format-capture capability
		this.registerCapability({
			id: "capture:format-text",
			name: "Format Captured Text",
			description: "Formats captured text with timestamp and optional tag",
			category: "formatting",
			organId: this.getId(),
			metadata: {
				parameters: {
					text: "string - The text to format",
					tag: "string (optional) - Tag to add to the entry",
				},
			},
		});

		// Register service handler for format-text capability
		this.registerService("capture:format-text", async (params) => {
			const { text, tag } = params;
			if (!text || typeof text !== "string") {
				throw new Error("Text parameter is required and must be a string");
			}

			const timestamp = new Date().toISOString();
			const tagLine = tag ? ` #${tag}` : "";
			return `---\n**${timestamp}**${tagLine}\n${text}\n`;
		});
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "capture-thought",
			name: "Capture Thought",
			hotkeys: [
				{
					modifiers: ["Mod", "Shift"],
					key: "c",
				},
			],
			callback: () => {
				this.openCaptureModal();
			},
		});

		this.plugin.addCommand({
			id: "capture-open-base",
			name: "Open Capture Base",
			callback: () => {
				this.openCaptureBase();
			},
		});
	}

	/**
	 * Open the capture modal
	 */
	private openCaptureModal(): void {
		const modal = new CaptureModal(this.plugin.app, async (text, tag) => {
			if (!text.trim()) {
				new Notice("No text captured");
				return;
			}

			try {
				await this.capture(text, tag);
				new Notice("Thought captured!");
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "capture", 
					textLength: text.length,
					hasTag: !!tag
				});
				ErrorHandler.showErrorNotice(errorInfo);
				console.error("[Errl OS] Capture error:", errorInfo.message, errorInfo.context);
			}
		});

		modal.open();
	}

	/**
	 * Capture text to the capture file (append-only)
	 */
	private async capture(text: string, tag?: string): Promise<void> {
		const settings = this.kernel.getSettings();
		const filePath = settings.captureFilePath;
		await this.kernel.getSharedAPIs().capture(text, filePath, tag);
		await this.createCaptureRecord(text, tag);

		// Publish event that a thought was captured
		this.publish("capture:thought-captured", {
			text,
			tag,
			filePath,
			timestamp: new Date().toISOString(),
		});
	}

	private async createCaptureRecord(text: string, tag?: string): Promise<void> {
		const settings = this.kernel.getSettings();
		const folderPath = settings.captureRecordFolderPath || this.captureRecordFolderPath;
		const normalizedFolder = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
		const timestamp = new Date();
		const isoTimestamp = timestamp.toISOString();
		const slug = this.buildCaptureSlug(text);
		const dateStamp = this.formatDateStamp(timestamp);
		const timeStamp = this.formatTimeStamp(timestamp);
		let baseName = `capture-${dateStamp}-${timeStamp}-${slug}`;
		let recordPath = `${normalizedFolder}${baseName}.md`;
		let attempt = 0;

		while (FileUtils.fileExists(this.plugin.app, recordPath)) {
			attempt += 1;
			baseName = `capture-${dateStamp}-${timeStamp}-${slug}-${attempt}`;
			recordPath = `${normalizedFolder}${baseName}.md`;
		}

		const frontmatterLines = [
			"---",
			"type: capture",
			`capturedAt: ${isoTimestamp}`,
		];

		if (tag && tag.trim().length > 0) {
			frontmatterLines.push("tags:", `  - ${tag.trim()}`);
		}

		frontmatterLines.push("---", "", text.trim());

		try {
			await FileUtils.ensureParentDirectoryExists(this.plugin.app, recordPath);
			await this.plugin.app.vault.create(recordPath, frontmatterLines.join("\n"));
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "createCaptureRecord", 
				recordPath 
			});
			console.error("[Errl OS] Failed to create capture record:", errorInfo.message, errorInfo.context);
		}
	}

	private buildCaptureSlug(text: string): string {
		const raw = text.trim().split(/\s+/).slice(0, 6).join(" ");
		const sanitized = FileUtils.sanitizeFileName(raw).toLowerCase();
		return sanitized.length > 0 ? sanitized : "capture";
	}

	private formatDateStamp(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	private formatTimeStamp(date: Date): string {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${hours}${minutes}${seconds}`;
	}

	private async openCaptureBase(): Promise<void> {
		try {
			const baseFile = await this.ensureCaptureBaseExists();
			if (baseFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(baseFile);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openCaptureBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open capture base:", errorInfo.message, errorInfo.context);
		}
	}

	private async ensureCaptureBaseExists() {
		const settings = this.kernel.getSettings();
		const basePath = settings.captureBasePath || this.captureBasePath;

		const baseConfig: BaseConfig = {
			filters: `note.type = "capture"`,
			properties: {
				capturedAt: { displayName: "Captured", type: "date", format: "relative", sortable: true },
				tags: { displayName: "Tags", type: "multiselect", sortable: true },
				ageInDays: { displayName: "Age (Days)", type: "number", sortable: true },
				isRecent: { displayName: "Is Recent", type: "boolean", sortable: true },
				isThisWeek: { displayName: "Is This Week", type: "boolean", sortable: true },
				isThisMonth: { displayName: "Is This Month", type: "boolean", sortable: true },
			},
			formulas: {
				ageInDays: `(date.now() - note.capturedAt) / 86400000`,
				isRecent: `date.now() - note.capturedAt < 7 days`,
				isThisWeek: `date.now() - note.capturedAt < 7 days AND date.now() - note.capturedAt >= 0 days`,
				isThisMonth: `date.now() - note.capturedAt < 30 days`,
			},
			views: [
				{
					type: "table",
					name: "All Captures",
					order: ["note.capturedAt", "note.tags", "file.name"],
				},
				{
					type: "table",
					name: "Grouped by Tags",
					groupBy: "note.tags",
					order: ["note.capturedAt", "file.name"],
				},
				{
					type: "table",
					name: "Recent Captures",
					filter: `isRecent = true`,
					order: ["note.capturedAt", "note.tags"],
				},
				{
					type: "table",
					name: "This Month",
					filter: `isThisMonth = true`,
					order: ["note.capturedAt", "note.tags"],
				},
				{
					type: "list",
					name: "Quick List",
					order: ["note.capturedAt"],
					sortBy: "note.capturedAt",
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}

	// Status reporting methods
	protected getDescription(): string {
		return "Zero-friction idea intake system. Provides hotkey-triggered modal (Cmd+Shift+C) for quickly capturing thoughts, ideas, and notes with timestamp and optional tags.";
	}

	protected getPhase() {
		return "Phase 1: Foundation" as const;
	}

	protected async getConfigurationStatus(): Promise<OrganConfigurationStatus | undefined> {
		const settings = this.kernel.getSettings();
		const path = settings.captureFilePath || this.captureFilePath;
		
		if (!path || path.trim() === "") {
			return {
				configured: false,
				issues: ["Capture file path not configured. Set captureFilePath in settings."]
			};
		}

		// Check if parent directory exists
		const parentPath = path.substring(0, path.lastIndexOf("/"));
		if (parentPath && parentPath !== path) {
			const parent = this.plugin.app.vault.getAbstractFileByPath(parentPath);
			if (!parent || !(parent instanceof TFolder)) {
				return {
					configured: false,
					issues: [`Parent directory does not exist: ${parentPath}`]
				};
			}
		}

		return { configured: true };
	}
}
