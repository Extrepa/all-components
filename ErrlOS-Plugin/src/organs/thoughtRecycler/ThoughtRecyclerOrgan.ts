import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, Notice, Modal, Setting, App } from "obsidian";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { ProjectPulseOrgan } from "../projectPulse/ProjectPulseOrgan";
import { EntropyDialOrgan } from "../entropy/EntropyDialOrgan";
import { EnergyOrgan } from "../energy/EnergyOrgan";

/**
 * Thought/idea that can be resurfaced
 */
export interface RecycledThought {
	path: string;
	name: string;
	content: string;
	age: number; // days since last modified
	ageCategory: "recent" | "forgotten" | "ancient";
}

/**
 * Thought Recycler Organ - Resurfaces forgotten ideas
 * Scans old notes and reintroduces them gently
 */
export class ThoughtRecyclerOrgan extends Organ {
	private scanPaths: string[] = [];
	private thresholds: { recent: number; forgotten: number; ancient: number } = {
		recent: 30,
		forgotten: 90,
		ancient: 365,
	};

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "thoughtRecycler";
	}

	getName(): string {
		return "Thought Recycler";
	}

	getDocumentation() {
		return {
			purpose: "Recycles old thoughts and captures that haven't been developed, resurfacing them for reconsideration",
			description: "Thought Recycler organ scans old capture entries and identifies thoughts that haven't been developed. It categorizes thoughts by age (recent, forgotten, ancient) and can resurface them for reconsideration. Helps prevent losing valuable ideas that were captured but never developed into projects or lore.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Scan for Recyclable Thoughts",
					description: "Scans configured paths for old thoughts that can be recycled",
					commands: [],
				},
				{
					name: "View Recyclable Thoughts",
					description: "Shows thoughts that can be recycled",
					commands: [],
				},
			],
			monitoring: [
				{
					what: "Capture file entries and their timestamps",
					why: "To identify old thoughts that haven't been developed",
					how: "Scans configured capture paths and categorizes entries by age",
					userControl: "Paths configurable in settings. Scanning happens on demand or can be scheduled.",
				},
			],
			fileOperations: [
				{
					type: "read" as const,
					path: "Configured thoughtRecyclerScanPaths (typically capture files)",
					when: "When recyclable thoughts scan is performed",
					userControl: "Paths configurable in settings. Scanning happens on demand.",
					example: "Reads capture files to find old entries",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "thoughtRecyclerScanPaths",
					name: "Thought Recycler Scan Paths",
					description: "Array of file paths to scan for recyclable thoughts",
					default: ["ErrlOS/Capture.md"],
					affects: ["Which files are scanned for old thoughts"],
				},
				{
					key: "thoughtRecyclerThresholds.recent",
					name: "Recent Threshold (days)",
					description: "Thoughts newer than this are considered 'recent'",
					default: 30,
					affects: ["Thought categorization"],
				},
				{
					key: "thoughtRecyclerThresholds.forgotten",
					name: "Forgotten Threshold (days)",
					description: "Thoughts older than recent but newer than this are 'forgotten'",
					default: 90,
					affects: ["Thought categorization"],
				},
				{
					key: "thoughtRecyclerThresholds.ancient",
					name: "Ancient Threshold (days)",
					description: "Thoughts older than this are 'ancient'",
					default: 365,
					affects: ["Thought categorization"],
				},
			],
			useCases: [
				{
					scenario: "Resurface old ideas",
					steps: [
						"Enable Thought Recycler organ",
						"Run scan for recyclable thoughts",
						"Review forgotten/ancient thoughts",
						"Promote valuable old thoughts to projects",
					],
					expectedOutcome: "Old ideas resurfaced for reconsideration",
				},
				{
					scenario: "Clean up capture file",
					steps: [
						"Scan for recyclable thoughts",
						"Review and promote valuable ones",
						"Archive or remove truly obsolete thoughts",
					],
					expectedOutcome: "Capture file cleaned up, valuable thoughts preserved",
				},
			],
			commonIssues: [
				{
					problem: "No recyclable thoughts found",
					cause: "Scan paths not configured or no old entries in capture files",
					solution: "Check thoughtRecyclerScanPaths setting and ensure capture files contain old entries",
				},
			],
			dependencies: {
				required: [],
				optional: ["capture (source of thoughts to recycle)", "promotion (can promote recycled thoughts)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		this.scanPaths = (settings as any).thoughtRecyclerScanPaths || ["ErrlOS/Capture.md"];
		this.thresholds = (settings as any).thoughtRecyclerThresholds || {
			recent: 30,
			forgotten: 90,
			ancient: 365,
		};
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
			id: "resurface-forgotten-ideas",
			name: "Resurface Forgotten Ideas",
			callback: () => {
				this.resurfaceIdeas();
			},
		});
	}

	/**
	 * Scan for forgotten ideas
	 */
	async scanForForgottenIdeas(): Promise<RecycledThought[]> {
		const thoughts: RecycledThought[] = [];
		const now = Date.now();

		// Scan Capture file
		const capturePath = this.kernel.getSettings().captureFilePath;
		const captureFile = this.plugin.app.vault.getAbstractFileByPath(capturePath);
		if (captureFile instanceof TFile) {
			try {
				let content: string;
				try {
					content = await this.plugin.app.vault.read(captureFile);
				} catch (error) {
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "resurfaceIdeas", 
						filePath: capturePath,
						action: "read"
					});
					console.error("[Errl OS] Error reading capture file:", errorInfo.message, errorInfo.context);
					ErrorHandler.showErrorNotice(errorInfo);
					return [];
				}
				const entries = content.split(/^---$/m);
				
				for (const entry of entries) {
					// Try to extract date from entry
					const dateMatch = entry.match(/(\d{4}-\d{2}-\d{2})/);
					if (dateMatch) {
						const entryDate = new Date(dateMatch[1]).getTime();
						const age = (now - entryDate) / (1000 * 60 * 60 * 24); // days
						
						if (age >= this.thresholds.forgotten) {
							const entryContent = entry.trim();
							if (entryContent.length > 0) {
								// Extract first line as name
								const firstLine = entryContent.split("\n")[0].replace(/^#+\s*/, "").trim();
								thoughts.push({
									path: capturePath,
									name: firstLine || "Unnamed idea",
									content: entryContent.substring(0, 200), // First 200 chars
									age: Math.floor(age),
									ageCategory: age >= this.thresholds.ancient ? "ancient" : "forgotten",
								});
							}
						}
					}
				}
			} catch (error) {
				console.error("[Thought Recycler] Error scanning capture:", error);
			}
		}

		// Scan Project Pulse for abandoned projects
		if (this.kernel.isOrganEnabled("projectPulse")) {
			const projectPulse = this.kernel.getRegistry().get("projectPulse") as ProjectPulseOrgan | undefined;
			if (projectPulse) {
				try {
					const pulseData = await projectPulse.getPulseData();
					const abandoned = pulseData.filter(p => p.status === "abandoned");
					
					for (const project of abandoned) {
						thoughts.push({
							path: project.path,
							name: project.name,
							content: `Abandoned project last modified ${project.daysAgo} days ago`,
							age: project.daysAgo,
							ageCategory: project.daysAgo >= this.thresholds.ancient ? "ancient" : "forgotten",
						});
					}
				} catch (error) {
					console.error("[Thought Recycler] Error scanning projects:", error);
				}
			}
		}

		// Apply Entropy Dial if enabled (shuffle and limit)
		if (this.kernel.isOrganEnabled("entropyDial")) {
			const entropyDial = this.kernel.getRegistry().get("entropyDial") as EntropyDialOrgan | undefined;
			if (entropyDial) {
				return entropyDial.applyEntropyToSuggestions(thoughts);
			}
		}

		return thoughts;
	}

	/**
	 * Resurface ideas - show modal with forgotten ideas
	 */
	private async resurfaceIdeas(): Promise<void> {
		const thoughts = await this.scanForForgottenIdeas();
		
		if (thoughts.length === 0) {
			new Notice("No forgotten ideas found. Everything is fresh!");
			return;
		}

		// Check if low-energy mode is enabled (show fewer suggestions)
		let displayThoughts = thoughts;
		if (this.kernel.isOrganEnabled("energy")) {
			const energyOrgan = this.kernel.getRegistry().get("energy") as EnergyOrgan | undefined;
			if (energyOrgan && energyOrgan.isLowEnergyMode()) {
				displayThoughts = thoughts.slice(0, 3); // Show only 3 in low-energy mode
			}
		}

		const modal = new ThoughtRecyclerModal(this.plugin.app, displayThoughts);
		modal.open();
	}

	/**
	 * Get age category label
	 */
	private getAgeCategoryLabel(category: "recent" | "forgotten" | "ancient"): string {
		switch (category) {
			case "recent":
				return "Recent";
			case "forgotten":
				return "Forgotten";
			case "ancient":
				return "Ancient";
		}
	}
}

/**
 * Modal showing recycled thoughts
 */
class ThoughtRecyclerModal extends Modal {
	private thoughts: RecycledThought[];

	constructor(app: App, thoughts: RecycledThought[]) {
		super(app);
		this.thoughts = thoughts;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "🔄 Forgotten Ideas" });
		contentEl.createEl("p", { 
			text: `Found ${this.thoughts.length} idea(s) that haven't been looked at in a while.` 
		});

		this.thoughts.forEach((thought, index) => {
			const ageLabel = thought.age >= 365 ? "ancient" : thought.age >= 90 ? "forgotten" : "recent";
			const ageText = thought.age >= 365 
				? `${Math.floor(thought.age / 365)} year(s)` 
				: `${Math.floor(thought.age)} day(s)`;
			
			const setting = new Setting(contentEl)
				.setName(thought.name)
				.setDesc(`${ageText} old — ${thought.content.substring(0, 100)}...`);
			
			setting.addButton((button) => {
				button.setButtonText("Open")
					.onClick(() => {
						const file = this.app.vault.getAbstractFileByPath(thought.path);
						if (file instanceof TFile) {
							this.app.workspace.getLeaf(true).openFile(file);
						}
						this.close();
					});
			});
		});

		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText("Close").onClick(() => {
					this.close();
				});
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

