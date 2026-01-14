import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { ProjectPulseOrgan } from "../projectPulse/ProjectPulseOrgan";
import { FileUtils } from "../../utils/fileUtils";
import { SessionGhostOrgan } from "../sessionGhost/SessionGhostOrgan";

/**
 * Friction point types
 */
export type FrictionType = 
	| "capture-to-organization-gap"
	| "abandoned-project"
	| "stale-capture"
	| "missing-links"
	| "orphaned-content";

/**
 * Friction point
 */
export interface FrictionPoint {
	type: FrictionType;
	severity: "low" | "medium" | "high";
	description: string;
	suggestion: string;
	affectedPaths: string[];
	detectedAt: Date;
}

/**
 * Friction Scanner Organ - Detects friction points in workflow
 * Tracks common friction points and suggests workflow improvements
 */
export class FrictionScannerOrgan extends Organ {
	private reportPath: string = "ErrlOS/Friction-Report.md";
	private scanInterval: number = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "frictionScanner";
	}

	getName(): string {
		return "Friction Scanner";
	}

	getDocumentation() {
		return {
			purpose: "Identifies workflow friction points by analyzing note activity patterns and stalling behaviors",
			description: "Friction Scanner organ analyzes note usage patterns to detect friction points in your workflow. It identifies notes with long active time but low edit counts (stalling patterns), integrates with Session Ghost tracking data, and generates reports to help you understand where you're getting stuck in your creative process.",
			phase: "Phase 4: Adaptation",
			capabilities: [
				{
					name: "Scan for Friction",
					description: "Scans for friction points based on note activity patterns",
					commands: [],
				},
				{
					name: "Generate Friction Report",
					description: "Generates a report of identified friction points",
					commands: [],
				},
			],
			monitoring: [
				{
					what: "Note activity patterns (from Session Ghost)",
					why: "To identify stalling patterns and workflow friction",
					how: "Integrates with Session Ghost tracking data to analyze time spent vs edits made",
					userControl: "Requires Session Ghost to be enabled and tracking active. Scans happen on demand or scheduled intervals.",
				},
			],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Friction-Report.md (configurable)",
					when: "When friction report is first generated",
					userControl: "Path configurable in settings. Report generated on demand or at intervals.",
					example: "Friction report file created at ErrlOS/Friction-Report.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Friction-Report.md (configurable)",
					when: "When friction scan is run and report is updated",
					userControl: "User controls when to scan. Interval configurable in settings.",
					example: "Friction report updated with latest scan results",
				},
				{
					type: "read" as const,
					path: "Session Ghost tracking data",
					when: "When friction scan is performed",
					userControl: "Requires Session Ghost tracking data. Scan happens on demand.",
					example: "Reads Session Ghost tracking data to analyze patterns",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "frictionReportPath",
					name: "Friction Report Path",
					description: "Path where friction report markdown file is stored",
					default: "ErrlOS/Friction-Report.md",
					affects: ["Report file location"],
				},
				{
					key: "frictionScanInterval",
					name: "Friction Scan Interval",
					description: "How often (in milliseconds) to automatically scan for friction (0 = manual only)",
					default: 604800000, // 7 days
					affects: ["Automatic scanning frequency"],
				},
			],
			useCases: [
				{
					scenario: "Identify workflow friction",
					steps: [
						"Enable Session Ghost organ and start tracking",
						"Work normally for a period of time",
						"Enable Friction Scanner organ",
						"Run friction scan (or wait for scheduled scan)",
						"Review friction report to see stalling patterns",
					],
					expectedOutcome: "Report identifying notes with friction patterns",
				},
				{
					scenario: "Review friction points",
					steps: [
						"Open friction report file",
						"Review notes with high active time but low edits",
						"Identify workflow improvements",
					],
					expectedOutcome: "Understanding of where workflow friction occurs",
				},
			],
			commonIssues: [
				{
					problem: "No friction data found",
					cause: "Session Ghost not enabled or tracking not active",
					solution: "Enable Session Ghost organ and start tracking, then wait for tracking data to accumulate",
				},
				{
					problem: "Report not generating",
					cause: "No Session Ghost tracking data available",
					solution: "Ensure Session Ghost has been tracking for some time before running friction scan",
				},
			],
			dependencies: {
				required: [],
				optional: ["sessionGhost (provides tracking data for analysis)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.reportPath = settings.frictionReportPath || "ErrlOS/Friction-Report.md";
		this.scanInterval = settings.frictionScanInterval || 7 * 24 * 60 * 60 * 1000;
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
			id: "scan-friction",
			name: "Scan for Friction",
			callback: async () => {
				const frictionPoints = await this.scanForFriction();
				await this.generateReport(frictionPoints);
				new Notice(`Found ${frictionPoints.length} friction points`);
			},
		});

		this.plugin.addCommand({
			id: "view-friction-report",
			name: "View Friction Report",
			callback: () => {
				this.viewReport();
			},
		});
	}

	/**
	 * Scan for friction points
	 */
	async scanForFriction(): Promise<FrictionPoint[]> {
		const frictionPoints: FrictionPoint[] = [];

		// 1. Check for abandoned projects
		if (this.kernel.isOrganEnabled("projectPulse")) {
			const projectPulse = this.kernel.getRegistry().get("projectPulse") as ProjectPulseOrgan | undefined;
			if (projectPulse) {
				try {
					const pulseData = await projectPulse.getPulseData();
					const abandoned = pulseData.filter(p => p.status === "abandoned");
					if (abandoned.length > 0) {
						frictionPoints.push({
							type: "abandoned-project",
							severity: "medium",
							description: `${abandoned.length} project(s) appear to be abandoned (not modified in 90+ days)`,
							suggestion: "Consider cleaning up abandoned projects or archiving them. Use Promotion Flows to move valuable content to lore.",
							affectedPaths: abandoned.map(p => p.path),
							detectedAt: new Date(),
						});
					}
				} catch (error) {
					console.error("[Friction Scanner] Error scanning projects:", error);
				}
			}
		}

		// 2. Check for stale capture entries
		const capturePath = this.kernel.getSettings().captureFilePath;
		const captureFile = this.plugin.app.vault.getAbstractFileByPath(capturePath);
		if (captureFile instanceof TFile) {
			try {
				let content: string;
				try {
					content = await this.plugin.app.vault.read(captureFile);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "detectStaleCapture", 
						filePath: capturePath,
						action: "read"
					});
					console.error("[Errl OS] Error reading capture file:", errorInfo.message, errorInfo.context);
					// Don't show notice - this is background scanning
					return frictionPoints;
				}
				const entries = content.split(/^---$/m);
				const now = Date.now();
				const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

				let staleCount = 0;
				for (const entry of entries) {
					// Try to extract date from entry
					const dateMatch = entry.match(/(\d{4}-\d{2}-\d{2})/);
					if (dateMatch) {
						const entryDate = new Date(dateMatch[1]).getTime();
						if (now - entryDate > staleThreshold) {
							staleCount++;
						}
					}
				}

				if (staleCount > 5) {
					frictionPoints.push({
						type: "stale-capture",
						severity: "low",
						description: `${staleCount} capture entries are older than 30 days`,
						suggestion: "Review old capture entries. Promote valuable ones to projects or lore, archive the rest.",
						affectedPaths: [capturePath],
						detectedAt: new Date(),
					});
				}
			} catch (error) {
				console.error("[Friction Scanner] Error scanning capture:", error);
			}
		}

		// 3. Check for capture-to-organization gap
		// This is detected if capture file is large but few projects exist
		if (captureFile instanceof TFile) {
			try {
				let captureContent: string;
				try {
					captureContent = await this.plugin.app.vault.read(captureFile);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "detectCaptureToOrganizationGap", 
						filePath: capturePath,
						action: "read"
					});
					console.error("[Errl OS] Error reading capture file:", errorInfo.message, errorInfo.context);
					// Don't show notice - this is background scanning
					return frictionPoints;
				}
				const captureSize = captureContent.length;
				const projectPulse = this.kernel.getRegistry().get("projectPulse") as ProjectPulseOrgan | undefined;
				
				if (projectPulse && captureSize > 10000) { // Large capture file
					const pulseData = await projectPulse.getPulseData();
					if (pulseData.length < 5) { // Few projects
						frictionPoints.push({
							type: "capture-to-organization-gap",
							severity: "medium",
							description: "Large capture file but few projects. Ideas may not be getting organized.",
							suggestion: "Use Promotion Flows to move captured ideas to projects. Set up regular review sessions.",
							affectedPaths: [capturePath],
							detectedAt: new Date(),
						});
					}
				}
			} catch (error) {
				console.error("[Friction Scanner] Error checking capture gap:", error);
			}
		}

		// 4. Check for stalling patterns using Session Ghost data
		if (this.kernel.isOrganEnabled("sessionGhost")) {
			const sessionGhost = this.kernel.getRegistry().get("sessionGhost") as SessionGhostOrgan | undefined;
			if (sessionGhost) {
				try {
					const stallingNotes = sessionGhost.getStallingNotes();
					if (stallingNotes.length > 0) {
						const stallingPaths = stallingNotes.slice(0, 5).map(note => note.path);
						frictionPoints.push({
							type: "missing-links", // Use existing type for now
							severity: "low",
							description: `${stallingNotes.length} note(s) show stalling patterns (long time spent, few edits).`,
							suggestion: "Consider breaking these notes into smaller sections or simplifying content. Session Ghost detected these patterns.",
							affectedPaths: stallingPaths,
							detectedAt: new Date(),
						});
					}
				} catch (error) {
					console.error("[Friction Scanner] Error checking session ghost data:", error);
				}
			}
		}

		return frictionPoints;
	}

	/**
	 * Generate friction report
	 */
	async generateReport(frictionPoints: FrictionPoint[]): Promise<void> {
		let content = `# Friction Report

> Generated: ${new Date().toLocaleDateString()}

## Summary

Found **${frictionPoints.length}** friction point(s).

`;

		if (frictionPoints.length === 0) {
			content += `✅ No friction points detected! Your workflow is running smoothly.\n`;
		} else {
			// Group by severity
			const bySeverity: Record<string, FrictionPoint[]> = {
				high: [],
				medium: [],
				low: [],
			};

			frictionPoints.forEach(point => {
				bySeverity[point.severity].push(point);
			});

			// High severity
			if (bySeverity.high.length > 0) {
				content += `## 🔴 High Priority (${bySeverity.high.length})\n\n`;
				bySeverity.high.forEach(point => {
					content += `### ${this.getFrictionTypeLabel(point.type)}\n\n`;
					content += `**Description:** ${point.description}\n\n`;
					content += `**Suggestion:** ${point.suggestion}\n\n`;
					if (point.affectedPaths.length > 0) {
						content += `**Affected:**\n`;
						point.affectedPaths.forEach(path => {
							content += `- [[${path}]]\n`;
						});
						content += `\n`;
					}
					content += `---\n\n`;
				});
			}

			// Medium severity
			if (bySeverity.medium.length > 0) {
				content += `## 🟡 Medium Priority (${bySeverity.medium.length})\n\n`;
				bySeverity.medium.forEach(point => {
					content += `### ${this.getFrictionTypeLabel(point.type)}\n\n`;
					content += `**Description:** ${point.description}\n\n`;
					content += `**Suggestion:** ${point.suggestion}\n\n`;
					if (point.affectedPaths.length > 0) {
						content += `**Affected:**\n`;
						point.affectedPaths.forEach(path => {
							content += `- [[${path}]]\n`;
						});
						content += `\n`;
					}
					content += `---\n\n`;
				});
			}

			// Low severity
			if (bySeverity.low.length > 0) {
				content += `## 🟢 Low Priority (${bySeverity.low.length})\n\n`;
				bySeverity.low.forEach(point => {
					content += `### ${this.getFrictionTypeLabel(point.type)}\n\n`;
					content += `**Description:** ${point.description}\n\n`;
					content += `**Suggestion:** ${point.suggestion}\n\n`;
					if (point.affectedPaths.length > 0) {
						content += `**Affected:**\n`;
						point.affectedPaths.forEach(path => {
							content += `- [[${path}]]\n`;
						});
						content += `\n`;
					}
					content += `---\n\n`;
				});
			}
		}

		content += `## Tips

- Review friction points regularly
- Address high-priority issues first
- Use Promotion Flows to organize captured ideas
- Archive or clean up abandoned projects
- Set up regular review sessions

`;

		// Save report
		await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.reportPath);
		const existingFile = this.plugin.app.vault.getAbstractFileByPath(this.reportPath);
		if (existingFile instanceof TFile) {
			await this.plugin.app.vault.modify(existingFile, content);
		} else {
			await this.plugin.app.vault.create(this.reportPath, content);
		}
	}

	/**
	 * View friction report
	 */
	private async viewReport(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.reportPath);
		if (file instanceof TFile) {
			await this.plugin.app.workspace.getLeaf(true).openFile(file);
		} else {
			// Generate report first
			const frictionPoints = await this.scanForFriction();
			await this.generateReport(frictionPoints);
			const newFile = this.plugin.app.vault.getAbstractFileByPath(this.reportPath);
			if (newFile instanceof TFile) {
				await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
			}
		}
	}

	/**
	 * Get human-readable label for friction type
	 */
	private getFrictionTypeLabel(type: FrictionType): string {
		switch (type) {
			case "capture-to-organization-gap":
				return "Capture to Organization Gap";
			case "abandoned-project":
				return "Abandoned Projects";
			case "stale-capture":
				return "Stale Capture Entries";
			case "missing-links":
				return "Missing Links";
			case "orphaned-content":
				return "Orphaned Content";
		}
	}
}

