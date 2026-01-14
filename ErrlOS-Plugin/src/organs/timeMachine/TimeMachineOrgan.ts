import { Organ, OrganConfigurationStatus } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, TFolder, Notice } from "obsidian";
import { FileUtils } from "../../utils/fileUtils";
import { ErrorHandler, ErrorCategory } from "../../utils/ErrorHandler";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Time Machine Organ - Session logging
 * Preserves creative memory with session logs
 */
export class TimeMachineOrgan extends Organ {
	private logPath: string = "ErrlOS/Logs/";
	private sessionNotesPath: string = "ErrlOS/Logs/Sessions/";
	private timeMachineBasePath: string = "ErrlOS/Time-Machine.base";

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "timeMachine";
	}

	getName(): string {
		return "Time Machine";
	}

	getDocumentation() {
		return {
			purpose: "Provides timestamped logging system for tracking events and creating chronological records",
			description: "Time Machine organ provides a logging capability that other organs and the system can use to record events with timestamps. It creates dated log files in a configured directory, allowing chronological tracking of system activity, organ events, and user actions. Other organs can use the shared logging API to write to these logs.",
			phase: "Phase 2: Stability",
			capabilities: [
				{
					name: "Log Events",
					description: "Logs events with timestamps to dated log files (via shared API, used by other organs)",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Logs/YYYY-MM-DD.md (configurable base path)",
					when: "When first log entry is written for a given date",
					userControl: "Base path configurable in settings. Files created automatically as needed.",
					example: "Log file created at ErrlOS/Logs/2024-12-21.md for today's logs",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Logs/YYYY-MM-DD.md (configurable base path)",
					when: "When any organ or system component writes a log entry",
					userControl: "Logging happens automatically when organs use the shared logging API. No direct user control.",
					example: "Log entry appended to today's log file",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "timeMachineLogPath",
					name: "Time Machine Log Path",
					description: "Base directory path where dated log files are stored",
					default: "ErrlOS/Logs/",
					affects: ["Log file location"],
				},
			],
			useCases: [
				{
					scenario: "Track system events",
					steps: [
						"Enable Time Machine organ",
						"Other organs automatically use logging API",
						"Log files are created with dated filenames",
						"Review log files to see chronological event history",
					],
					expectedOutcome: "Chronological log of system and organ events",
				},
				{
					scenario: "Review activity from specific date",
					steps: [
						"Navigate to configured log directory",
						"Open log file for desired date (YYYY-MM-DD.md)",
						"Review timestamped entries from that day",
					],
					expectedOutcome: "All logged events from specified date",
				},
			],
			commonIssues: [
				{
					problem: "No log files being created",
					cause: "No organs are using the logging API, or log path is misconfigured",
					solution: "Check timeMachineLogPath setting, ensure other organs are enabled and logging events",
				},
				{
					problem: "Log files in wrong location",
					cause: "timeMachineLogPath setting points to wrong directory",
					solution: "Update timeMachineLogPath in settings to desired directory",
				},
			],
			dependencies: {
				required: [],
				optional: ["All other organs (can use logging API)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		// Load settings
		const settings = this.kernel.getSettings();
		this.logPath = settings.timeMachineLogPath || "ErrlOS/Logs/";
		this.sessionNotesPath = `${this.logPath}Sessions/`;
		this.timeMachineBasePath = settings.timeMachineBasePath || "ErrlOS/Time-Machine.base";
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
			id: "create-session-log",
			name: "Create Session Log",
			callback: () => {
				this.createSessionLog();
			},
		});

		this.plugin.addCommand({
			id: "view-time-machine",
			name: "View Time Machine",
			callback: () => {
				this.viewTimeMachine();
			},
		});

		this.plugin.addCommand({
			id: "time-machine-open-base",
			name: "Open Time Machine Base",
			callback: () => {
				this.openTimeMachineBase();
			},
		});
	}

	/**
	 * Create a session log entry
	 * 
	 * Creates or appends to a date-based log file with a new session entry.
	 * Opens the log file for editing after creation.
	 * 
	 * @throws Error if log file cannot be created or modified
	 */
	private async createSessionLog(): Promise<void> {
		const today = new Date();
		const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
		const logFileName = `${dateStr}.md`;
		const logFilePath = `${this.logPath}${logFileName}`;

		try {
			// Ensure log directory exists
			await FileUtils.ensureDirectoryExists(this.plugin.app, this.logPath);

			// Get or create log file
			let logFile = this.plugin.app.vault.getAbstractFileByPath(logFilePath) as TFile;
			
			if (!logFile) {
				// Create new log file with header
				try {
					const header = `# Session Log - ${today.toLocaleDateString("en-US", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}\n\n`;
					logFile = await this.plugin.app.vault.create(logFilePath, header);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "createSessionLog", 
						filePath: logFilePath 
					});
					
					// If file was created between check and create, get it
					if (errorInfo.category === ErrorCategory.RaceCondition) {
						logFile = this.plugin.app.vault.getAbstractFileByPath(logFilePath) as TFile;
						if (!logFile) {
							const notFoundError = ErrorHandler.handleError(
								new Error(`File exists error but file not found: ${logFilePath}`),
								{ operation: "createSessionLog", filePath: logFilePath }
							);
							ErrorHandler.showErrorNotice(notFoundError);
							throw new Error(notFoundError.userMessage);
						}
						// File exists, continue to append
					} else {
						console.error(`[Errl OS] Failed to create log file ${logFilePath}:`, errorInfo.message, errorInfo.context);
						ErrorHandler.showErrorNotice(errorInfo);
						throw new Error(errorInfo.userMessage);
					}
				}
			}

			// Read current content
			let content: string;
			try {
				content = await this.plugin.app.vault.read(logFile);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "createSessionLog", 
					filePath: logFilePath,
					action: "read"
				});
				console.error(`[Errl OS] Failed to read log file ${logFilePath}:`, errorInfo.message, errorInfo.context);
				ErrorHandler.showErrorNotice(errorInfo);
				throw new Error(errorInfo.userMessage);
			}
			
			// Add new session entry
			const timestamp = today.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});
			
			const sessionEntry = `\n---\n\n## ${timestamp}\n\n*Add your session notes here*\n\n`;
			
			// Append session entry
			try {
				await this.plugin.app.vault.modify(logFile, content + sessionEntry);
			} catch (error) {
				console.error(`[Errl OS] Failed to modify log file ${logFilePath}:`, error);
				throw new Error(`Failed to append session entry: ${error instanceof Error ? error.message : String(error)}`);
			}

			// If Bases are enabled, also create a per-session note with frontmatter
			const settings = this.kernel.getSettings();
			if (settings.basesEnabled?.timeMachine) {
				await this.createSessionNote(today, timestamp);
			}

			// Open the log file for editing
			try {
				await this.plugin.app.workspace.getLeaf(true).openFile(logFile);
			} catch (error) {
				console.error(`[Errl OS] Failed to open log file ${logFilePath}:`, error);
				// Continue even if opening fails
			}
			
			// Move cursor to the new entry (optional - may not work in all Obsidian versions)
			try {
				const { MarkdownView } = require("obsidian");
				const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = (activeView as any).editor;
					if (editor) {
						const lineCount = editor.lineCount();
						if (lineCount > 2) {
							editor.setCursor(lineCount - 2, 0); // Move to the line with "*Add your session notes here*"
						}
					}
				}
			} catch (e) {
				// Ignore if MarkdownView is not available
			}

			new Notice("Session log created");
		} catch (error) {
			console.error("[Errl OS] Error creating session log:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			new Notice(`Failed to create session log: ${errorMessage}`);
			throw error;
		}
	}

	/**
	 * View Time Machine (open logs directory or index)
	 * 
	 * Opens the Time Machine index file, creating it if it doesn't exist.
	 * 
	 * @throws Error if index file cannot be created or opened
	 */
	private async viewTimeMachine(): Promise<void> {
		try {
			// Try to open a log index file, or create one
			const indexPath = `${this.logPath}Time-Machine-Index.md`;
			let indexFile = this.plugin.app.vault.getAbstractFileByPath(indexPath) as TFile;

			if (!indexFile) {
				// Create index file
				try {
					await FileUtils.ensureDirectoryExists(this.plugin.app, this.logPath);
					const indexContent = `# Time Machine Index\n\n*Session logs are stored here*\n\n`;
					indexFile = await this.plugin.app.vault.create(indexPath, indexContent);
				} catch (error) {
					// If file was created between check and create, get it
					if (error instanceof Error && error.message.includes("already exists")) {
						indexFile = this.plugin.app.vault.getAbstractFileByPath(indexPath) as TFile;
						if (!indexFile) {
							console.error(`[Errl OS] Index file exists error but file not found: ${indexPath}`);
							throw new Error(`Failed to create index file: File exists but cannot be accessed`);
						}
						// File exists, continue
					} else {
						console.error(`[Errl OS] Failed to create Time Machine index at ${indexPath}:`, error);
						throw new Error(`Failed to create index file: ${error instanceof Error ? error.message : String(error)}`);
					}
				}
			}

			try {
				await this.plugin.app.workspace.getLeaf(true).openFile(indexFile);
				new Notice("Time Machine opened");
			} catch (error) {
				console.error(`[Errl OS] Failed to open Time Machine index:`, error);
				new Notice("Time Machine: Error opening index. Check console for details.");
			}
		} catch (error) {
			console.error("[Errl OS] Error viewing Time Machine:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			new Notice(`Failed to open Time Machine: ${errorMessage}`);
		}
	}

	/**
	 * Get recent session logs
	 * 
	 * @param count - Maximum number of recent logs to return (default: 5)
	 * @returns Array of log files, sorted by most recent first
	 */
	async getRecentLogs(count: number = 5): Promise<TFile[]> {
		const logs: TFile[] = [];
		const logDir = this.plugin.app.vault.getAbstractFileByPath(this.logPath);
		
		if (!logDir || !(logDir instanceof TFolder)) {
			return logs;
		}

		// Get all log files
		for (const child of logDir.children) {
			if (child instanceof TFile && child.extension === "md" && child.name !== "Time-Machine-Index.md") {
				logs.push(child);
			}
		}

		// Sort by modification time, most recent first
		logs.sort((a, b) => {
			const aTime = a.stat?.mtime || 0;
			const bTime = b.stat?.mtime || 0;
			return bTime - aTime;
		});

		return logs.slice(0, count);
	}

	// Status reporting methods
	protected getDescription(): string {
		return "Session logging system. Preserves creative memory with date-based session logs. Tracks work over time.";
	}

	protected getPhase() {
		return "Phase 2: Stability" as const;
	}

	protected async getConfigurationStatus(): Promise<OrganConfigurationStatus | undefined> {
		const settings = this.kernel.getSettings();
		const path = settings.timeMachineLogPath || this.logPath;
		
		if (!path || path.trim() === "") {
			return {
				configured: false,
				issues: ["Log path not configured. Set timeMachineLogPath in settings."]
			};
		}

		// Check if log directory exists or can be created
		const folder = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!folder || !(folder instanceof TFolder)) {
			// Directory doesn't exist, but that's okay - we'll create it
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
		}

		return { configured: true };
	}

	/**
	 * Create a per-session note with frontmatter
	 */
	private async createSessionNote(startTime: Date, timestamp: string): Promise<void> {
		try {
			// Ensure session notes directory exists
			await FileUtils.ensureDirectoryExists(this.plugin.app, this.sessionNotesPath);

			// Create session note filename with timestamp
			const sessionId = startTime.toISOString().replace(/[:.]/g, "-");
			const sessionFileName = `session-${sessionId}.md`;
			const sessionFilePath = `${this.sessionNotesPath}${sessionFileName}`;

			// Check if file already exists
			const existingFile = this.plugin.app.vault.getAbstractFileByPath(sessionFilePath);
			if (existingFile instanceof TFile) {
				// Session note already exists, skip
				return;
			}

			// Build frontmatter
			const frontmatter = [
				"---",
				"type: session",
				`start: ${startTime.toISOString()}`,
				`date: ${startTime.toISOString().split("T")[0]}`,
				"end: ",
				"duration: ",
				"---",
				"",
			].join("\n");

			const content = frontmatter + `# Session - ${timestamp}\n\n*Add your session notes here*\n\n`;

			// Create session note
			await this.plugin.app.vault.create(sessionFilePath, content);
		} catch (error) {
			// Silently fail - don't break session log creation
			console.error(`[Time Machine] Failed to create session note:`, error);
		}
	}

	/**
	 * Open the Time Machine Base
	 */
	private async openTimeMachineBase(): Promise<void> {
		try {
			const baseFile = await this.ensureTimeMachineBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openTimeMachineBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open time machine base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure Time Machine Base exists, creating it if necessary
	 */
	private async ensureTimeMachineBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.timeMachineBasePath || this.timeMachineBasePath;

		// Check if Bases are enabled for time machine
		if (!settings.basesEnabled?.timeMachine) {
			throw new Error("Time Machine Base is disabled in settings");
		}

		const baseConfig: BaseConfig = {
			filters: `note.type = "session"`,
			properties: {
				start: { displayName: "Start Time", type: "date", format: "absolute", sortable: true },
				end: { displayName: "End Time", type: "date", format: "absolute", sortable: true },
				duration: { displayName: "Duration", type: "number", sortable: true },
				date: { displayName: "Date", type: "date", format: "short", sortable: true },
				durationMinutes: { displayName: "Duration (Minutes)", type: "number", sortable: true },
				durationHours: { displayName: "Duration (Hours)", type: "number", format: "short", sortable: true },
				sessionDate: { displayName: "Session Date", type: "date", format: "short", sortable: true },
				isToday: { displayName: "Is Today", type: "boolean", sortable: true },
				isThisWeek: { displayName: "Is This Week", type: "boolean", sortable: true },
			},
			formulas: {
				durationMinutes: `if(note.end AND note.start, (note.end - note.start) / 60000, note.duration)`,
				durationHours: `if(note.end AND note.start, (note.end - note.start) / 3600000, note.duration / 60)`,
				sessionDate: `date(note.start)`,
				isToday: `date(note.start) = date.now()`,
				isThisWeek: `date(note.start) >= date.now() - 7 days`,
			},
			views: [
				{
					type: "table",
					name: "All Sessions",
					order: ["note.start", "note.date", "file.name"],
				},
				{
					type: "table",
					name: "By Date",
					groupBy: "note.date",
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "Recent Sessions",
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "Today's Sessions",
					filter: `isToday = true`,
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "This Week",
					filter: `isThisWeek = true`,
					order: ["note.start", "file.name"],
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}
}

