import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { FrictionScannerOrgan } from "../friction/FrictionScannerOrgan";
import { FileUtils } from "../../utils/fileUtils";

/**
 * Session tracking data for a note
 */
export interface SessionTracking {
	path: string;
	totalActiveTime: number; // milliseconds
	visitCount: number;
	editCount: number;
	lastAccessed: Date;
	lastEdited: Date;
}

/**
 * Session Ghost Organ - Tracks time spent in notes and identifies patterns
 * Background tracking, pattern detection, suggests friction points
 */
export class SessionGhostOrgan extends Organ {
	private trackingData: Map<string, SessionTracking> = new Map();
	private trackingInterval: number = 5000; // 5 seconds
	private stallThreshold: number = 10 * 60 * 1000; // 10 minutes in milliseconds
	private dataPath: string = "ErrlOS/SessionGhost/";
	private currentNotePath: string | null = null;
	private currentNoteStartTime: number = 0;
	private trackingTimer: number | null = null;
	private saveDebounceTimer: number | null = null;
	private saveDebounceDelay: number = 30000; // Save after 30 seconds of inactivity
	private saveCount: number = 0; // Track saves for periodic saving
	private isTracking: boolean = false; // Track whether tracking is active
	private fileOpenListener: ((file: TFile) => void) | null = null;
	private activeLeafChangeListener: (() => void) | null = null;
	private modifyListener: ((file: TFile) => void) | null = null;

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "sessionGhost";
	}

	getName(): string {
		return "Session Ghost";
	}

	getDocumentation() {
		return {
			purpose: "Tracks time spent in notes and identifies patterns to detect friction points",
			description: "Session Ghost monitors note activity, tracking active time, visit count, edit frequency, and detects stalling patterns (notes with long active time but few edits). This data helps identify workflow friction points and can be integrated with Friction Scanner. Tracking must be manually started and stopped by the user.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Start Tracking",
					description: "Begin tracking session data for all notes",
					commands: ["session-ghost-start-tracking"],
				},
				{
					name: "Stop Tracking",
					description: "Stop tracking session data",
					commands: ["session-ghost-stop-tracking"],
				},
				{
					name: "View Stalling Notes",
					description: "View notes that show stalling patterns (long time, low edits)",
					commands: ["session-ghost-view-stalling-notes"],
				},
			],
			monitoring: [
				{
					what: "Active note time",
					why: "To track how long you spend in each note",
					how: "Records timestamp when note is opened, calculates elapsed time on close/switch",
					userControl: "Tracking must be manually started. Can be stopped at any time.",
				},
				{
					what: "Note visit count",
					why: "To identify frequently accessed notes",
					how: "Increments counter each time note is opened",
					userControl: "Only tracks when tracking is active",
				},
				{
					what: "Edit count and frequency",
					why: "To detect stalling patterns (long time, few edits)",
					how: "Tracks each file modification event for active note",
					userControl: "Only tracks when tracking is active",
				},
			],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/SessionGhost/tracking-data.json (configurable)",
					when: "When tracking data is first saved (after 30 seconds of inactivity or on stop)",
					userControl: "Path can be changed in settings. File created automatically when needed.",
					example: "Tracking data file created at ErrlOS/SessionGhost/tracking-data.json",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/SessionGhost/tracking-data.json (configurable)",
					when: "Periodically (debounced every 30 seconds) or when tracking stops",
					userControl: "User controls when tracking is active. Saves happen automatically in background.",
					example: "Tracking data updated with latest session information",
				},
				{
					type: "read" as const,
					path: "ErrlOS/SessionGhost/tracking-data.json (configurable)",
					when: "On organ load to restore previous tracking data",
					userControl: "Automatic on load, no user action needed",
					example: "Previous tracking data loaded on plugin reload",
				},
			],
			backgroundProcesses: [
				{
					name: "Note Activity Tracking",
					description: "Monitors active note and tracks time spent, visits, and edits",
					interval: 5000, // 5 seconds
					resourceUsage: "Minimal" as const,
					canDisable: true,
					startStop: true, // User can start/stop tracking
				},
			],
			settings: [
				{
					key: "sessionGhostTrackingInterval",
					name: "Tracking Interval",
					description: "How often (in milliseconds) to check and update tracking data",
					default: 5000,
					affects: ["Tracking accuracy", "Resource usage"],
				},
				{
					key: "sessionGhostStallThreshold",
					name: "Stall Threshold",
					description: "Minutes of inactivity before a note is considered 'stalling'",
					default: 10,
					affects: ["Stalling note detection"],
				},
				{
					key: "sessionGhostDataPath",
					name: "Data Path",
					description: "Directory where tracking data is stored",
					default: "ErrlOS/SessionGhost/",
					affects: ["File location for tracking data"],
				},
			],
			useCases: [
				{
					scenario: "Track work session",
					steps: [
						"Enable Session Ghost organ (with walkthrough)",
						"Run 'Session Ghost: Start Tracking' command",
						"Work normally - tracking happens automatically",
						"Run 'Session Ghost: Stop Tracking' when done",
						"View tracking data to see patterns",
					],
					expectedOutcome: "Complete session data saved for analysis",
				},
				{
					scenario: "Identify friction points",
					steps: [
						"Start tracking",
						"Work on various notes",
						"Run 'View Stalling Notes' command",
						"Review notes with long active time but few edits",
						"Identify workflow friction",
					],
					expectedOutcome: "List of notes showing stalling patterns",
				},
			],
			commonIssues: [
				{
					problem: "Tracking not starting",
					cause: "Tracking must be manually started - it doesn't start automatically on enable",
					solution: "Run 'Session Ghost: Start Tracking' command",
				},
				{
					problem: "No tracking data",
					cause: "Tracking hasn't been started or file path is incorrect",
					solution: "Start tracking and wait for data to be saved, or check data path in settings",
				},
				{
					problem: "Tracking data not updating",
					cause: "Tracking might have stopped or save debounce hasn't fired yet",
					solution: "Check if tracking is active, or wait up to 30 seconds for auto-save",
				},
			],
			dependencies: {
				required: [],
				optional: ["frictionScanner (can use tracking data for friction detection)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		this.trackingInterval = (settings as any).sessionGhostTrackingInterval || 5000;
		this.stallThreshold = ((settings as any).sessionGhostStallThreshold || 10) * 60 * 1000;
		this.dataPath = (settings as any).sessionGhostDataPath || "ErrlOS/SessionGhost/";
		
		// Load tracking data from file
		await this.loadTrackingData();
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
		
		// Stop tracking if active
		if (this.isTracking) {
			this.stopTracking();
		}
		
		// Stop tracking timer
		if (this.trackingTimer !== null) {
			window.clearInterval(this.trackingTimer);
			this.trackingTimer = null;
		}
		
		// Clear debounce timer
		if (this.saveDebounceTimer !== null) {
			window.clearTimeout(this.saveDebounceTimer);
			this.saveDebounceTimer = null;
		}
		
		// Save tracking data
		await this.saveTrackingData();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		
		// Don't start tracking automatically - user must explicitly start it
		// Tracking will be started via startTracking() method or command
		
		// Register commands
		await this.registerCommands();
	}

	async onDisable(): Promise<void> {
		// Stop tracking when organ is disabled
		if (this.isTracking) {
			this.stopTracking();
		}
		// Save tracking data when disabled
		await this.saveTrackingData();
		await super.onDisable();
	}

	/**
	 * Start tracking a note
	 */
	private startTrackingNote(path: string): void {
		this.stopTrackingNote(); // Stop previous note if any
		
		this.currentNotePath = path;
		this.currentNoteStartTime = Date.now();
		
		// Initialize tracking data if not exists
		if (!this.trackingData.has(path)) {
			this.trackingData.set(path, {
				path,
				totalActiveTime: 0,
				visitCount: 0,
				editCount: 0,
				lastAccessed: new Date(),
				lastEdited: new Date(),
			});
		}
		
		const tracking = this.trackingData.get(path)!;
		tracking.visitCount++;
		tracking.lastAccessed = new Date();
		
		// Start interval tracking
		this.trackingTimer = window.setInterval(() => {
			if (this.currentNotePath === path) {
				const elapsed = Date.now() - this.currentNoteStartTime;
				tracking.totalActiveTime += this.trackingInterval; // Approximate
				
				// Check for stalling pattern (long time, no edits)
				const timeSinceEdit = Date.now() - tracking.lastEdited.getTime();
				if (timeSinceEdit > this.stallThreshold && elapsed > this.stallThreshold) {
					// Note: Could generate subtle notification here
					console.log(`[Session Ghost] Possible stall detected: ${path} (${Math.floor(timeSinceEdit / 60000)} min, no edits)`);
				}
			}
		}, this.trackingInterval);
	}

	/**
	 * Stop tracking current note
	 */
	private stopTrackingNote(): void {
		if (this.currentNotePath && this.trackingTimer !== null) {
			const tracking = this.trackingData.get(this.currentNotePath);
			if (tracking) {
				const elapsed = Date.now() - this.currentNoteStartTime;
				tracking.totalActiveTime += elapsed;
				this.scheduleSave();
			}
			
			window.clearInterval(this.trackingTimer);
			this.trackingTimer = null;
		}
		this.currentNotePath = null;
		this.currentNoteStartTime = 0;
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "session-ghost-start-tracking",
			name: "Session Ghost: Start Tracking",
			callback: () => {
				this.startTracking();
			},
		});

		this.plugin.addCommand({
			id: "session-ghost-stop-tracking",
			name: "Session Ghost: Stop Tracking",
			callback: () => {
				this.stopTracking();
			},
		});

		this.plugin.addCommand({
			id: "session-ghost-view-stalling-notes",
			name: "Session Ghost: View Stalling Notes",
			callback: () => {
				const stallingNotes = this.getStallingNotes();
				if (stallingNotes.length === 0) {
					new Notice("No stalling notes found.");
				} else {
					new Notice(`Found ${stallingNotes.length} stalling notes. Check console for details.`);
					console.log("Stalling notes:", stallingNotes);
				}
			},
		});
	}

	/**
	 * Start tracking session data
	 * Sets up event listeners to track note usage and edits
	 */
	startTracking(): void {
		if (this.isTracking) {
			new Notice("Session Ghost tracking is already active.");
			return;
		}

		this.isTracking = true;

		// Start tracking when a note is opened
		this.fileOpenListener = (file: TFile) => {
			this.startTrackingNote(file.path);
		};
		this.plugin.app.workspace.on("file-open", this.fileOpenListener);

		// Stop tracking when note is closed/another opened
		this.activeLeafChangeListener = () => {
			const activeFile = this.plugin.app.workspace.getActiveFile();
			if (activeFile instanceof TFile) {
				if (activeFile.path !== this.currentNotePath) {
					this.stopTrackingNote();
					this.startTrackingNote(activeFile.path);
				}
			} else {
				this.stopTrackingNote();
			}
		};
		this.plugin.app.workspace.on("active-leaf-change", this.activeLeafChangeListener);

		// Track edits
		this.modifyListener = (file: TFile) => {
			if (file.path === this.currentNotePath) {
				this.recordEdit(file.path);
			}
		};
		this.plugin.app.vault.on("modify", this.modifyListener);

		// Start tracking current note if one is open
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (activeFile instanceof TFile) {
			this.startTrackingNote(activeFile.path);
		}

		new Notice("Session Ghost tracking started.");
		console.log("[Session Ghost] Tracking started");
	}

	/**
	 * Stop tracking session data
	 * Removes event listeners and stops current note tracking
	 */
	stopTracking(): void {
		if (!this.isTracking) {
			new Notice("Session Ghost tracking is not active.");
			return;
		}

		this.isTracking = false;

		// Remove event listeners
		if (this.fileOpenListener) {
			this.plugin.app.workspace.off("file-open", this.fileOpenListener);
			this.fileOpenListener = null;
		}
		if (this.activeLeafChangeListener) {
			this.plugin.app.workspace.off("active-leaf-change", this.activeLeafChangeListener);
			this.activeLeafChangeListener = null;
		}
		if (this.modifyListener) {
			this.plugin.app.vault.off("modify", this.modifyListener);
			this.modifyListener = null;
		}

		// Stop tracking current note
		this.stopTrackingNote();

		// Save tracking data
		this.saveTrackingData().catch(err => {
			console.error("[Session Ghost] Error saving tracking data:", err);
		});

		new Notice("Session Ghost tracking stopped.");
		console.log("[Session Ghost] Tracking stopped");
	}

	/**
	 * Check if tracking is currently active
	 */
	isTrackingActive(): boolean {
		return this.isTracking;
	}

	/**
	 * Record an edit to a note
	 */
	private recordEdit(path: string): void {
		const tracking = this.trackingData.get(path);
		if (tracking) {
			tracking.editCount++;
			tracking.lastEdited = new Date();
			this.scheduleSave();
		}
	}

	/**
	 * Get stalling notes (long active time, low edit count)
	 */
	getStallingNotes(): SessionTracking[] {
		return Array.from(this.trackingData.values())
			.filter(tracking => {
				const timeSinceEdit = Date.now() - tracking.lastEdited.getTime();
				const avgTimePerEdit = tracking.editCount > 0 
					? tracking.totalActiveTime / tracking.editCount 
					: tracking.totalActiveTime;
				return timeSinceEdit > this.stallThreshold && avgTimePerEdit > this.stallThreshold;
			})
			.sort((a, b) => b.totalActiveTime - a.totalActiveTime);
	}

	/**
	 * Get tracking data for Friction Scanner integration
	 */
	getTrackingDataForPath(path: string): SessionTracking | undefined {
		return this.trackingData.get(path);
	}

	/**
	 * Schedule a debounced save
	 */
	private scheduleSave(): void {
		// Clear existing timer
		if (this.saveDebounceTimer !== null) {
			window.clearTimeout(this.saveDebounceTimer);
		}
		
		// Schedule new save
		this.saveDebounceTimer = window.setTimeout(() => {
			this.saveTrackingData().catch(err => {
				console.error("[Session Ghost] Error saving tracking data:", err);
			});
			this.saveDebounceTimer = null;
		}, this.saveDebounceDelay);
	}

	/**
	 * Load tracking data from file
	 */
	private async loadTrackingData(): Promise<void> {
		try {
			const filePath = `${this.dataPath}tracking-data.json`;
			const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
			
			if (!file || !(file instanceof TFile)) {
				// File doesn't exist - this is expected for first run
				console.log("[Session Ghost] No existing tracking data found, starting fresh");
				return;
			}
			
			// Read and parse JSON
			let content: string;
			try {
				content = await this.plugin.app.vault.read(file);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "loadTrackingData", 
					filePath: filePath,
					action: "read"
				});
				console.error("[Session Ghost] Error reading tracking data file:", errorInfo.message, errorInfo.context);
				// Continue with empty data on read error
				return;
			}
			
			let data: any;
			try {
				data = JSON.parse(content);
			} catch (error) {
				// JSON parse error - invalid format
				if (error instanceof SyntaxError) {
					console.error("[Session Ghost] Invalid JSON in tracking data file, starting fresh:", error);
				} else {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "loadTrackingData", 
						filePath: filePath,
						action: "parse"
					});
					console.error("[Session Ghost] Error parsing tracking data:", errorInfo.message, errorInfo.context);
				}
				// Continue with empty data on parse error
				return;
			}
			
			// Validate data structure
			if (!Array.isArray(data)) {
				console.warn("[Session Ghost] Invalid tracking data format, starting fresh");
				return;
			}
			
			// Convert array to Map and parse dates
			this.trackingData.clear();
			for (const item of data) {
				if (item && item.path) {
					this.trackingData.set(item.path, {
						path: item.path,
						totalActiveTime: item.totalActiveTime || 0,
						visitCount: item.visitCount || 0,
						editCount: item.editCount || 0,
						lastAccessed: item.lastAccessed ? new Date(item.lastAccessed) : new Date(),
						lastEdited: item.lastEdited ? new Date(item.lastEdited) : new Date(),
					});
				}
			}
			
			console.log(`[Session Ghost] Loaded tracking data for ${this.trackingData.size} notes`);
		} catch (error) {
			// Handle any other errors gracefully - start fresh
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "loadTrackingData", 
				filePath: `${this.dataPath}tracking-data.json`
			});
			console.error("[Session Ghost] Error loading tracking data, starting fresh:", errorInfo.message, errorInfo.context);
			// Continue with empty data
		}
	}

	/**
	 * Save tracking data to file
	 */
	private async saveTrackingData(): Promise<void> {
		try {
			// Ensure directory exists
			await FileUtils.ensureDirectoryExists(this.plugin.app, this.dataPath);
			
			const filePath = `${this.dataPath}tracking-data.json`;
			
			// Convert Map to array for JSON serialization
			const data = Array.from(this.trackingData.values()).map(tracking => ({
				path: tracking.path,
				totalActiveTime: tracking.totalActiveTime,
				visitCount: tracking.visitCount,
				editCount: tracking.editCount,
				lastAccessed: tracking.lastAccessed.toISOString(),
				lastEdited: tracking.lastEdited.toISOString(),
			}));
			
			// Write to file
			const content = JSON.stringify(data, null, 2);
			const existingFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
			
			try {
				if (existingFile instanceof TFile) {
					await this.plugin.app.vault.modify(existingFile, content);
				} else {
					await this.plugin.app.vault.create(filePath, content);
				}
				
				this.saveCount++;
				console.log(`[Session Ghost] Saved tracking data for ${this.trackingData.size} notes (save #${this.saveCount})`);
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "saveTrackingData", 
					filePath: filePath,
					action: existingFile instanceof TFile ? "modify" : "create",
					trackingDataSize: this.trackingData.size
				});
				console.error("[Session Ghost] Error saving tracking data:", errorInfo.message, errorInfo.context);
				// Log error but continue tracking in memory - don't show notice as this is background operation
			}
		} catch (error) {
			// Handle directory creation or other errors
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "saveTrackingData", 
				filePath: `${this.dataPath}tracking-data.json`
			});
			console.error("[Session Ghost] Error saving tracking data:", errorInfo.message, errorInfo.context);
			// Continue tracking in memory even if save fails
		}
	}
}

