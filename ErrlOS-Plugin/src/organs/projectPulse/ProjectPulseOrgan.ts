import { Organ, OrganConfigurationStatus } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, TFolder, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { ProjectHealth, ProjectRecommendation } from "./ProjectHealth";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";
import { FileUtils } from "../../utils/fileUtils";

/**
 * Project status types
 */
export type ProjectStatus = "active" | "warm" | "dormant" | "abandoned";

/**
 * Project pulse data structure
 */
export interface PulseData {
	name: string;
	path: string;
	status: ProjectStatus;
	lastModified: Date;
	daysAgo: number;
}

/**
 * Project Pulse Organ - Tracks project activity
 * Shows what's alive, sleeping, or decaying based on file modification times
 */
export class ProjectPulseOrgan extends Organ {
	private projectPulsePath: string = "Projects/";
	private projectPulseBasePath: string = "ErrlOS/Project-Pulse.base";
	private thresholds = {
		active: 3,    // days
		warm: 14,     // days
		dormant: 90,  // days
	};

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "projectPulse";
	}

	getName(): string {
		return "Project Pulse";
	}

	getDocumentation() {
		return {
			purpose: "Monitors project activity and health by tracking file modification times",
			description: "Project Pulse scans configured project folders and categorizes projects as Active, Warm, or Dormant based on when files were last modified. It provides a dashboard card showing project health and activity levels. Helps users identify which projects need attention and which are inactive.",
			phase: "Phase 2: Stability",
			capabilities: [
				{
					name: "Project Health Dashboard Card",
					description: "Displays project health status in dashboard (shown when organ enabled)",
					commands: [],
				},
			],
			monitoring: [
				{
					what: "File modification times in project folders",
					why: "To determine project activity and categorize projects as active/warm/dormant",
					how: "Scans configured project folder on dashboard refresh",
					userControl: "Scans only when dashboard is generated. Path configurable in settings.",
				},
			],
			fileOperations: [
				{
					type: "read" as const,
					path: "Configured projectPulsePath folder",
					when: "When dashboard is generated or refreshed",
					userControl: "Path configurable in settings. Scanning only happens on dashboard generation.",
					example: "Reads file modification times in project folder",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "projectPulsePath",
					name: "Project Pulse Path",
					description: "Folder path containing project folders to monitor",
					default: "",
					affects: ["Which projects are monitored"],
				},
				{
					key: "pulseThresholds.active",
					name: "Active Threshold (days)",
					description: "Projects modified within this many days are considered 'Active'",
					default: 3,
					affects: ["Project categorization"],
				},
				{
					key: "pulseThresholds.warm",
					name: "Warm Threshold (days)",
					description: "Projects modified within this many days are considered 'Warm'",
					default: 14,
					affects: ["Project categorization"],
				},
				{
					key: "pulseThresholds.dormant",
					name: "Dormant Threshold (days)",
					description: "Projects modified within this many days are considered 'Dormant'",
					default: 90,
					affects: ["Project categorization"],
				},
			],
			useCases: [
				{
					scenario: "Monitor project activity",
					steps: [
						"Configure projectPulsePath in settings (folder containing project folders)",
						"Enable Project Pulse organ",
						"View dashboard to see project health card",
						"See projects categorized as Active/Warm/Dormant",
					],
					expectedOutcome: "Project health status displayed in dashboard",
				},
				{
					scenario: "Identify stale projects",
					steps: [
						"Ensure Project Pulse is enabled",
						"View dashboard project card",
						"Review Dormant projects list",
						"Decide which projects need attention",
					],
					expectedOutcome: "List of inactive projects for review",
				},
			],
			commonIssues: [
				{
					problem: "No projects showing in dashboard",
					cause: "projectPulsePath not configured or folder doesn't exist",
					solution: "Configure projectPulsePath in settings to point to folder containing project subfolders",
				},
				{
					problem: "All projects showing as dormant",
					cause: "Thresholds too low, or no recent file modifications",
					solution: "Adjust pulseThresholds in settings, or check if projects have recent modifications",
				},
			],
			dependencies: {
				required: ["dashboard (displays project card)"],
				optional: [],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		// Load settings
		const settings = this.kernel.getSettings();
		this.projectPulsePath = settings.projectPulsePath || "";
		this.projectPulseBasePath = settings.projectPulseBasePath || "ErrlOS/Project-Pulse.base";
		this.thresholds = {
			active: settings.pulseThresholds?.active || 3,
			warm: settings.pulseThresholds?.warm || 14,
			dormant: settings.pulseThresholds?.dormant || 90,
		};
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		await this.registerCommands();
		await this.registerCapabilities();
		this.subscribeToEvents();
	}

	/**
	 * Register capabilities that this organ provides
	 */
	private async registerCapabilities(): Promise<void> {
		// Register analyze-project-status capability
		this.registerCapability({
			id: "projectPulse:analyze-status",
			name: "Analyze Project Status",
			description: "Analyzes a project folder and returns its activity status",
			category: "analysis",
			organId: this.getId(),
			metadata: {
				parameters: {
					projectPath: "string - Path to the project folder to analyze",
				},
			},
		});

		// Register find-abandoned-projects capability
		this.registerCapability({
			id: "projectPulse:find-abandoned",
			name: "Find Abandoned Projects",
			description: "Finds all projects that are considered abandoned (dormant beyond threshold)",
			category: "query",
			organId: this.getId(),
			metadata: {
				parameters: {
					threshold: "number (optional) - Custom threshold in days (default: uses configured threshold)",
				},
			},
		});

		// Register service handlers
		this.registerService("projectPulse:analyze-status", async (params) => {
			const { projectPath } = params;
			if (!projectPath || typeof projectPath !== "string") {
				throw new Error("projectPath parameter is required and must be a string");
			}

			const folder = this.plugin.app.vault.getAbstractFileByPath(projectPath);
			if (!folder || !(folder instanceof TFolder)) {
				throw new Error(`Project folder not found: ${projectPath}`);
			}

			const pulseData = await this.scanProject(folder);
			if (!pulseData) {
				throw new Error(`Could not analyze project: ${projectPath}`);
			}

			return pulseData;
		});

		this.registerService("projectPulse:find-abandoned", async (params) => {
			const { threshold } = params;
			const pulseData = await this.getPulseData();
			
			// Filter for abandoned projects
			let abandoned = pulseData.filter(p => p.status === "abandoned");
			
			// If custom threshold provided, recalculate
			if (threshold && typeof threshold === "number") {
				abandoned = pulseData.filter(p => p.daysAgo > threshold);
			}

			return abandoned;
		});
	}

	/**
	 * Subscribe to relevant events from other modules
	 */
	private subscribeToEvents(): void {
		// Subscribe to capture events to potentially track project activity
		this.subscribe("capture:thought-captured", (data) => {
			// Could potentially analyze if the capture is related to a project
			// For now, just log it
			console.log("[Errl OS] Project Pulse: Thought captured, could update project activity");
		});
	}

	async registerCommands(): Promise<void> {
		this.plugin.addCommand({
			id: "view-project-pulse",
			name: "View Project Pulse",
			callback: async () => {
				try {
					await this.showPulseData();
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "viewProjectPulse",
						projectPulsePath: this.projectPulsePath
					});
					console.error("[Errl OS] Error showing pulse data:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
				}
			},
		});

		this.plugin.addCommand({
			id: "project-pulse-open-base",
			name: "Open Project Pulse Base",
			callback: async () => {
				await this.openProjectPulseBase();
			},
		});

		this.plugin.addCommand({
			id: "project-pulse-migrate-frontmatter",
			name: "Project Pulse: Migrate Frontmatter",
			callback: async () => {
				await this.migrateProjectFrontmatter();
			},
		});
	}

	/**
	 * Get pulse data for all projects
	 * 
	 * Scans the configured project directory and returns activity data
	 * for each project folder found.
	 * Publishes events for abandoned projects.
	 * 
	 * @returns Array of pulse data for all projects, sorted by most recent first
	 */
	async getPulseData(): Promise<PulseData[]> {
		try {
			const projects: PulseData[] = [];
			const projectPath = this.projectPulsePath;

			// Check if path is configured
			if (!projectPath || projectPath.trim() === "") {
				return projects;
			}

			// Get the projects directory
			const dir = this.plugin.app.vault.getAbstractFileByPath(projectPath);
			if (!dir || !(dir instanceof TFolder)) {
				return projects;
			}

			// Scan each subdirectory as a project
			for (const child of dir.children) {
				if (child instanceof TFolder) {
					try {
						const pulseData = await this.scanProject(child);
						if (pulseData) {
							projects.push(pulseData);
							
							// Optionally update frontmatter if Bases are enabled
							const settings = this.kernel.getSettings();
							if (settings.basesEnabled?.projectPulse) {
								// Update frontmatter asynchronously (don't block)
								this.updateProjectFrontmatter(pulseData).catch(error => {
									console.error(`[Project Pulse] Error updating frontmatter:`, error);
								});
							}
						}
					} catch (error) {
						const errorInfo = ErrorHandler.handleError(error, { 
							operation: "getPulseData",
							projectPath: child.path
						});
						console.error(`[Errl OS] Error scanning project ${child.name}:`, errorInfo.message, errorInfo.context);
						// Continue scanning other projects even if one fails
					}
				}
			}

			// Sort by most recently modified first
			projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

			// Publish events for status changes
			for (const project of projects) {
				if (project.status === "abandoned") {
					this.publish("project:abandoned", {
						name: project.name,
						path: project.path,
						daysAgo: project.daysAgo,
						lastModified: project.lastModified.toISOString(),
					});
				} else if (project.status === "active") {
					this.publish("project:status-changed", {
						name: project.name,
						path: project.path,
						status: project.status,
						daysAgo: project.daysAgo,
					});
				}
			}

			return projects;
		} catch (error) {
			console.error("[Errl OS] Error getting pulse data:", error);
			return [];
		}
	}

	/**
	 * Scan a project folder and return pulse data
	 */
	private async scanProject(folder: TFolder): Promise<PulseData | null> {
		let mostRecentModification = 0;
		let fileCount = 0;
		
		// Recursively find most recent file modification and count files
		const findMostRecent = (currentFolder: TFolder) => {
			for (const child of currentFolder.children) {
				if (child instanceof TFile) {
					fileCount++;
					if (child.stat && child.stat.mtime > mostRecentModification) {
						mostRecentModification = child.stat.mtime;
					}
				} else if (child instanceof TFolder) {
					findMostRecent(child);
				}
			}
		};

		findMostRecent(folder);

		if (mostRecentModification === 0) {
			return null;
		}

		const lastModified = new Date(mostRecentModification);
		const daysAgo = Math.floor((Date.now() - mostRecentModification) / (1000 * 60 * 60 * 24));
		const status = this.calculateStatus(daysAgo);

		return {
			name: folder.name,
			path: folder.path,
			status: status,
			lastModified: lastModified,
			daysAgo: daysAgo,
		};
	}

	/**
	 * Calculate project health metrics
	 * 
	 * @param project - Project pulse data
	 * @returns Project health assessment
	 */
	async calculateProjectHealth(project: PulseData): Promise<ProjectHealth> {
		const folder = this.plugin.app.vault.getAbstractFileByPath(project.path);
		if (!folder || !(folder instanceof TFolder)) {
			return {
				score: 0,
				activityScore: 0,
				fileCount: 0,
				structureScore: 0,
				status: "abandoned",
			};
		}

		// Count files
		let fileCount = 0;
		let hasReadme = false;
		const findFiles = (currentFolder: TFolder) => {
			for (const child of currentFolder.children) {
				if (child instanceof TFile) {
					fileCount++;
					if (child.basename.toLowerCase() === "readme") {
						hasReadme = true;
					}
				} else if (child instanceof TFolder) {
					findFiles(child);
				}
			}
		};
		findFiles(folder);

		// Calculate activity score (0-100, based on recency)
		let activityScore = 100;
		if (project.daysAgo > 90) {
			activityScore = 0;
		} else if (project.daysAgo > 30) {
			activityScore = 30;
		} else if (project.daysAgo > 14) {
			activityScore = 60;
		} else if (project.daysAgo > 7) {
			activityScore = 80;
		}

		// Calculate structure score (0-100)
		let structureScore = 50; // Base score
		if (hasReadme) {
			structureScore += 30;
		}
		if (fileCount > 5) {
			structureScore += 20;
		} else if (fileCount === 0) {
			structureScore = 0;
		}

		// Overall health score (weighted average)
		const score = Math.round((activityScore * 0.7) + (structureScore * 0.3));

		// Determine status
		let status: "healthy" | "needs-attention" | "abandoned";
		if (score >= 70) {
			status = "healthy";
		} else if (score >= 40) {
			status = "needs-attention";
		} else {
			status = "abandoned";
		}

		return {
			score,
			activityScore,
			fileCount,
			structureScore,
			status,
		};
	}

	/**
	 * Get project recommendations
	 * 
	 * @param project - Project pulse data
	 * @returns Array of recommendations
	 */
	async getProjectRecommendations(project: PulseData): Promise<ProjectRecommendation[]> {
		const recommendations: ProjectRecommendation[] = [];
		const health = await this.calculateProjectHealth(project);

		// Abandoned project recommendations
		if (project.status === "abandoned") {
			recommendations.push({
				type: "archive",
				message: `Project has been inactive for ${project.daysAgo} days. Consider archiving or reviving.`,
				priority: "medium",
			});
		}

		// Low activity recommendations
		if (health.activityScore < 50) {
			recommendations.push({
				type: "revive",
				message: "Project has low activity. Consider reviewing and updating.",
				priority: "high",
			});
		}

		// Structure recommendations
		if (health.structureScore < 50) {
			recommendations.push({
				type: "organize",
				message: "Project structure could be improved. Consider adding a README or organizing files.",
				priority: "low",
			});
		}

		// File count recommendations
		if (health.fileCount === 0) {
			recommendations.push({
				type: "review",
				message: "Project folder is empty. Consider adding files or removing the project.",
				priority: "high",
			});
		} else if (health.fileCount < 3) {
			recommendations.push({
				type: "document",
				message: "Project has few files. Consider documenting progress or adding more content.",
				priority: "low",
			});
		}

		return recommendations;
	}

	/**
	 * Calculate project status based on days since last modification
	 */
	private calculateStatus(daysAgo: number): ProjectStatus {
		if (daysAgo <= this.thresholds.active) {
			return "active";
		} else if (daysAgo <= this.thresholds.warm) {
			return "warm";
		} else if (daysAgo <= this.thresholds.dormant) {
			return "dormant";
		} else {
			return "abandoned";
		}
	}

	/**
	 * Get status icon emoji for a project status
	 * 
	 * @param status - The project status
	 * @returns Emoji icon representing the status
	 */
	getStatusIcon(status: ProjectStatus): string {
		switch (status) {
			case "active":
				return "🔥";
			case "warm":
				return "✨";
			case "dormant":
				return "🌙";
			case "abandoned":
				return "🪦";
			default:
				return "•";
		}
	}

	/**
	 * Format days ago text for display
	 * 
	 * @param days - Number of days ago
	 * @returns Formatted string (e.g., "today", "1d ago", "5d ago")
	 */
	formatDaysAgo(days: number): string {
		if (days === 0) {
			return "today";
		} else if (days === 1) {
			return "1d ago";
		} else {
			return `${days}d ago`;
		}
	}

	/**
	 * Show pulse data summary (for command)
	 * 
	 * Displays a notice with project status summary
	 */
	private async showPulseData(): Promise<void> {
		try {
			// Check if path is configured
			if (!this.projectPulsePath || this.projectPulsePath.trim() === "") {
				new Notice("Project Pulse: Path not configured. Set it in Settings → Errl OS.");
				return;
			}

			// Check if folder exists
			const dir = this.plugin.app.vault.getAbstractFileByPath(this.projectPulsePath);
			if (!dir || !(dir instanceof TFolder)) {
				new Notice(`Project Pulse: Folder not found at "${this.projectPulsePath}". Configure path in Settings → Errl OS.`);
				return;
			}

			const pulseData = await this.getPulseData();
			
			if (pulseData.length === 0) {
				new Notice("Project Pulse: No projects found in configured folder");
				return;
			}

			// Create a summary message
			const active = pulseData.filter((p: PulseData) => p.status === "active").length;
			const warm = pulseData.filter((p: PulseData) => p.status === "warm").length;
			const dormant = pulseData.filter((p: PulseData) => p.status === "dormant").length;
			const abandoned = pulseData.filter((p: PulseData) => p.status === "abandoned").length;

			const message = `🔥 ${active} active | ✨ ${warm} warm | 🌙 ${dormant} dormant | 🪦 ${abandoned} abandoned`;
			
			new Notice(message);
		} catch (error) {
			console.error("[Errl OS] Error showing pulse data:", error);
			new Notice("Project Pulse: Error loading data. Check console for details.");
		}
	}

	// Status reporting methods
	protected getDescription(): string {
		return "Tracks project activity status. Monitors file modification times to identify active, warm, dormant, and abandoned projects. Prevents project amnesia.";
	}

	protected getPhase() {
		return "Phase 2: Stability" as const;
	}

	protected async getConfigurationStatus(): Promise<OrganConfigurationStatus | undefined> {
		const settings = this.kernel.getSettings();
		const path = settings.projectPulsePath || this.projectPulsePath;
		
		if (!path || path.trim() === "") {
			return {
				configured: false,
				issues: ["Project path not configured. Set projectPulsePath in settings."]
			};
		}
		
		const folder = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!folder || !(folder instanceof TFolder)) {
			return {
				configured: false,
				issues: [`Project folder not found: ${path}`]
			};
		}
		
		return { configured: true };
	}

	/**
	 * Open the Project Pulse Base
	 */
	private async openProjectPulseBase(): Promise<void> {
		try {
			const baseFile = await this.ensureProjectPulseBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openProjectPulseBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open project pulse base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure Project Pulse Base exists, creating it if necessary
	 */
	private async ensureProjectPulseBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.projectPulseBasePath || this.projectPulseBasePath;

		// Check if Bases are enabled for project pulse
		if (!settings.basesEnabled?.projectPulse) {
			throw new Error("Project Pulse Base is disabled in settings");
		}

		const baseConfig: BaseConfig = {
			filters: `note.type = "project"`,
			properties: {
				name: { displayName: "Project Name", type: "text", sortable: true },
				status: { displayName: "Status", type: "select", sortable: true, options: ["active", "warm", "dormant", "abandoned"] },
				lastTouched: { displayName: "Last Touched", type: "date", format: "relative", sortable: true },
				priority: { displayName: "Priority", type: "text", sortable: true },
				computedStatus: { displayName: "Computed Status", type: "select", sortable: true },
				daysSinceTouched: { displayName: "Days Since Touched", type: "number", sortable: true },
				isActive: { displayName: "Is Active", type: "boolean", sortable: true },
				isWarm: { displayName: "Is Warm", type: "boolean", sortable: true },
			},
			formulas: {
				computedStatus: `if(date.now() - note.lastTouched < 3 days, "active", if(date.now() - note.lastTouched < 30 days, "warm", "dormant"))`,
				daysSinceTouched: `(date.now() - note.lastTouched) / 86400000`,
				isActive: `date.now() - note.lastTouched < 3 days`,
				isWarm: `date.now() - note.lastTouched >= 3 days AND date.now() - note.lastTouched < 30 days`,
			},
			views: [
				{
					type: "table",
					name: "All Projects",
					order: ["note.status", "note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "By Status",
					groupBy: "note.status",
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "Active Projects",
					filter: `note.status = "active"`,
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "By Computed Status",
					groupBy: "computedStatus",
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "Recently Active",
					filter: `isActive = true`,
					order: ["note.lastTouched", "note.name"],
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}

	/**
	 * Migration helper: Add frontmatter to project README.md files
	 * This creates or updates README.md files with project frontmatter
	 */
	private async migrateProjectFrontmatter(): Promise<void> {
		if (!this.projectPulsePath) {
			new Notice("Project Pulse path not configured. Please configure it in settings first.");
			return;
		}

		try {
			const pulseData = await this.getPulseData();
			
			if (pulseData.length === 0) {
				new Notice("No projects found. Check your project path configuration.");
				return;
			}

			// Ask for confirmation
			const confirmed = confirm(
				`Found ${pulseData.length} project(s). ` +
				`Add frontmatter to README.md files? This will create README.md if it doesn't exist.`
			);

			if (!confirmed) {
				return;
			}

			let migrated = 0;
			for (const project of pulseData) {
				try {
					const readmePath = `${project.path}/README.md`;
					const readmeFile = this.plugin.app.vault.getAbstractFileByPath(readmePath);
					
					let content = "";
					if (readmeFile instanceof TFile) {
						content = await this.plugin.app.vault.read(readmeFile);
					}

					// Check if frontmatter already exists
					if (content.match(/^---\n[\s\S]*?\n---/)) {
						// Frontmatter exists, check if it has type: project
						if (content.match(/^---\n[\s\S]*?\ntype:\s*project[\s\S]*?\n---/)) {
							// Already has project frontmatter, skip
							continue;
						}
						// Has frontmatter but not project type - we could update it, but skip for safety
						continue;
					}

					// Build frontmatter
					const frontmatter = [
						"---",
						"type: project",
						`name: ${project.name}`,
						`lastTouched: ${project.lastModified.toISOString()}`,
						`status: ${project.status}`,
						"---",
						"",
					].join("\n");

					const newContent = frontmatter + (content || `# ${project.name}\n\nProject description here.\n`);

					if (readmeFile instanceof TFile) {
						await this.plugin.app.vault.modify(readmeFile, newContent);
					} else {
						await FileUtils.ensureParentDirectoryExists(this.plugin.app, readmePath);
						await this.plugin.app.vault.create(readmePath, newContent);
					}
					
					migrated++;
				} catch (error) {
					console.error(`[Project Pulse] Failed to migrate ${project.path}:`, error);
				}
			}

			new Notice(`Migrated ${migrated} of ${pulseData.length} project(s).`);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "migrateProjectFrontmatter" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Error migrating project frontmatter:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Update project frontmatter when scanning (optional - can be called periodically)
	 * Updates lastTouched and status in existing project README.md files
	 */
	private async updateProjectFrontmatter(project: PulseData): Promise<void> {
		const readmePath = `${project.path}/README.md`;
		const readmeFile = this.plugin.app.vault.getAbstractFileByPath(readmePath);
		
		if (!(readmeFile instanceof TFile)) {
			return; // No README, skip
		}

		try {
			let content = await this.plugin.app.vault.read(readmeFile);
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			
			if (!frontmatterMatch) {
				return; // No frontmatter, skip
			}

			// Check if it's a project type
			if (!frontmatterMatch[1].includes("type: project")) {
				return; // Not a project note, skip
			}

			// Update lastTouched and status
			let frontmatter = frontmatterMatch[1];
			frontmatter = frontmatter.replace(/lastTouched:\s*.+/, `lastTouched: ${project.lastModified.toISOString()}`);
			frontmatter = frontmatter.replace(/status:\s*.+/, `status: ${project.status}`);

			// If status doesn't exist, add it
			if (!frontmatter.includes("status:")) {
				frontmatter += `\nstatus: ${project.status}`;
			}

			const newContent = `---\n${frontmatter}\n---${content.substring(frontmatterMatch[0].length)}`;
			await this.plugin.app.vault.modify(readmeFile, newContent);
		} catch (error) {
			// Silently fail - don't break pulse scanning
			console.error(`[Project Pulse] Failed to update frontmatter for ${project.path}:`, error);
		}
	}
}

