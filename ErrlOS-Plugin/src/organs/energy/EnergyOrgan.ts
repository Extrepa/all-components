import { Organ, OrganConfigurationStatus } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice, Modal, Setting, App } from "obsidian";
import { EnergyTask, EnergyLevel, EnergyCost, TimeCost, TaskType, taskFitsEnergy } from "./EnergyTask";

/**
 * Energy Organ - Support human variance with energy-aware task management
 * Tags tasks by energy/time cost, provides low energy mode
 */
export class EnergyOrgan extends Organ {
	private currentEnergyLevel: EnergyLevel = "medium";
	private lowEnergyMode: boolean = false;
	private energyThreshold: number = 2; // Tasks with energy cost <= this are "gentle"
	private momentumLevel: number = 0;
	private momentumDecayRate: number = 10; // percentage per day
	private momentumThreshold: number = 20; // minimum to cash
	private momentumLastUpdated: number = Date.now();
	private hiddenOrgansInLowEnergy: string[] = [];
	private lowEnergyDimOpacity: number = 0.85;

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "energy";
	}

	getName(): string {
		return "Energy System";
	}

	getDocumentation() {
		return {
			purpose: "Tracks and manages creative energy levels, adjusting UI and organ visibility based on energy state",
			description: "Energy System organ monitors creative energy levels and adjusts the system behavior accordingly. When energy is low, it can hide or dim less critical organs in the dashboard, helping users focus on essential functions. Energy levels can be set manually or tracked automatically, with thresholds determining when low-energy mode activates.",
			phase: "Phase 4: Adaptation",
			capabilities: [
				{
					name: "Energy Level Management",
					description: "Tracks current energy level and applies low-energy mode when threshold is met",
					commands: [],
				},
				{
					name: "Low Energy Mode",
					description: "Automatically hides or dims organs when energy is below threshold",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [],
			backgroundProcesses: [],
			settings: [
				{
					key: "energyLevel",
					name: "Energy Level",
					description: "Current energy level: 'high', 'medium', 'low'",
					default: "medium",
					affects: ["Low-energy mode activation", "Organ visibility"],
				},
				{
					key: "energyLowMode",
					name: "Low Energy Mode Enabled",
					description: "Whether low-energy mode is enabled",
					default: false,
					affects: ["Organ hiding/dimming behavior"],
				},
				{
					key: "energyThreshold",
					name: "Energy Threshold",
					description: "Energy level at which low-energy mode activates (1=low, 2=medium, 3=high)",
					default: 2,
					affects: ["When low-energy mode activates"],
				},
				{
					key: "energyLowModeHideOrgans",
					name: "Organs to Hide in Low Energy",
					description: "List of organ IDs to hide when low-energy mode is active",
					default: [],
					affects: ["Which organs are hidden in low-energy mode"],
				},
				{
					key: "energyLowModeDimOpacity",
					name: "Dim Opacity",
					description: "Opacity level for dimmed organs in low-energy mode (0-1)",
					default: 0.85,
					affects: ["Visual appearance of dimmed organs"],
				},
			],
			useCases: [
				{
					scenario: "Focus mode when energy is low",
					steps: [
						"Enable Energy System organ",
						"Set energyLevel to 'low' or enable low-energy mode",
						"Configure which organs to hide",
						"Dashboard automatically hides/dims less critical organs",
					],
					expectedOutcome: "Simplified dashboard showing only essential organs",
				},
				{
					scenario: "Manual energy tracking",
					steps: [
						"Set energyLevel in settings to current state",
						"Adjust as needed throughout the day",
						"System adapts UI based on energy level",
					],
					expectedOutcome: "UI adapts to current energy state",
				},
			],
			commonIssues: [
				{
					problem: "Low-energy mode not activating",
					cause: "energyLowMode is disabled or energy level is above threshold",
					solution: "Enable energyLowMode in settings, or lower energyThreshold, or set energyLevel to 'low'",
				},
				{
					problem: "Too many organs hidden",
					cause: "energyLowModeHideOrgans list includes too many organs",
					solution: "Remove organ IDs from energyLowModeHideOrgans list in settings",
				},
			],
			dependencies: {
				required: ["dashboard (applies energy-based UI changes)"],
				optional: [],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		const settings = this.kernel.getSettings();
		// Load settings when they're added
		this.currentEnergyLevel = (settings.energyLevel as EnergyLevel) || "medium";
		this.lowEnergyMode = settings.energyLowMode || false;
		this.energyThreshold = settings.energyThreshold || 2;
		this.momentumLevel = settings.momentumLevel || 0;
		this.momentumDecayRate = settings.momentumDecayRate || 10;
		this.momentumThreshold = settings.momentumThreshold || 20;
		this.momentumLastUpdated = settings.momentumLastUpdated || Date.now();
		this.hiddenOrgansInLowEnergy = settings.energyLowModeHideOrgans || [];
		this.lowEnergyDimOpacity = settings.energyLowModeDimOpacity || 0.85;
		
		// Apply momentum decay based on time elapsed
		await this.applyMomentumDecay();
		
		// Apply low-energy mode UI if enabled
		if (this.lowEnergyMode) {
			this.applyLowEnergyMode();
		}
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
			id: "set-energy-level",
			name: "Set Energy Level",
			callback: () => {
				this.openEnergyLevelModal();
			},
		});

		this.plugin.addCommand({
			id: "toggle-low-energy-mode",
			name: "Toggle Low Energy Mode",
			callback: () => {
				this.toggleLowEnergyMode();
			},
		});

		this.plugin.addCommand({
			id: "suggest-gentle-tasks",
			name: "Suggest Gentle Tasks",
			callback: () => {
				this.suggestGentleTasks();
			},
		});

		this.plugin.addCommand({
			id: "cash-momentum",
			name: "Cash Momentum",
			callback: () => {
				this.cashMomentum();
			},
		});

		this.plugin.addCommand({
			id: "view-momentum",
			name: "View Momentum Level",
			callback: () => {
				this.viewMomentum();
			},
		});
	}

	/**
	 * Get current energy level
	 */
	getEnergyLevel(): EnergyLevel {
		return this.currentEnergyLevel;
	}

	/**
	 * Set energy level
	 */
	async setEnergyLevel(level: EnergyLevel): Promise<void> {
		this.currentEnergyLevel = level;
		await this.kernel.updateSettings({
			energyLevel: level,
		});
		new Notice(`Energy level set to: ${level}`);
	}

	/**
	 * Check if low energy mode is enabled
	 */
	isLowEnergyMode(): boolean {
		return this.lowEnergyMode;
	}

	/**
	 * Toggle low energy mode
	 */
	async toggleLowEnergyMode(): Promise<void> {
		this.lowEnergyMode = !this.lowEnergyMode;
		await this.kernel.updateSettings({
			energyLowMode: this.lowEnergyMode,
		});
		
		// Apply or remove low-energy mode UI
		this.applyLowEnergyMode();
		
		// Notify dashboard to refresh if enabled
		if (this.kernel.isOrganEnabled("dashboard")) {
			const dashboardOrgan = this.kernel.getRegistry().get("dashboard");
			if (dashboardOrgan) {
				// Trigger dashboard refresh by accessing it (will be handled by dashboard's refresh method)
				// We'll add a method to dashboard to handle this properly
			}
		}
		
		new Notice(`Low energy mode: ${this.lowEnergyMode ? "ON" : "OFF"}`);
	}

	/**
	 * Check if an organ should be hidden in low-energy mode
	 */
	isOrganHidden(organId: string): boolean {
		if (!this.lowEnergyMode) {
			return false;
		}
		return this.hiddenOrgansInLowEnergy.includes(organId);
	}

	/**
	 * Apply low-energy mode UI changes (CSS class, dimming, etc.)
	 */
	private applyLowEnergyMode(): void {
		if (this.lowEnergyMode) {
			document.body.classList.add("errl-low-energy-mode");
			// Set CSS variable for opacity
			document.documentElement.style.setProperty("--errl-card-opacity", String(this.lowEnergyDimOpacity));
			document.documentElement.style.setProperty("--errl-button-opacity", "0.9");
		} else {
			document.body.classList.remove("errl-low-energy-mode");
			document.documentElement.style.removeProperty("--errl-card-opacity");
			document.documentElement.style.removeProperty("--errl-button-opacity");
		}
	}

	/**
	 * Filter tasks by energy level
	 */
	filterTasksByEnergy(tasks: EnergyTask[]): EnergyTask[] {
		if (this.lowEnergyMode) {
			// In low energy mode, only show gentle tasks
			return tasks.filter(task => taskFitsEnergy(task, this.currentEnergyLevel));
		}
		return tasks;
	}

	/**
	 * Get gentle tasks (low energy, quick time)
	 */
	getGentleTasks(tasks: EnergyTask[]): EnergyTask[] {
		return tasks.filter(task => 
			task.energyCost === "low" && 
			(task.timeCost === "quick" || task.timeCost === "medium")
		);
	}

	/**
	 * Open energy level modal
	 */
	private openEnergyLevelModal(): void {
		const modal = new EnergyLevelModal(this.plugin.app, this.currentEnergyLevel, async (level) => {
			await this.setEnergyLevel(level);
		});
		modal.open();
	}

	/**
	 * Suggest gentle tasks
	 */
	private suggestGentleTasks(): void {
		// This would integrate with Project Pulse or other task sources
		// For now, just show a notice
		new Notice("Gentle tasks: Look for low energy, quick tasks in your projects");
	}

	/**
	 * Parse energy metadata from frontmatter
	 */
	parseEnergyMetadata(frontmatter: Record<string, any>): Partial<EnergyTask> | null {
		if (!frontmatter.energyCost && !frontmatter.timeCost) {
			return null; // No energy metadata
		}

		return {
			energyCost: frontmatter.energyCost as EnergyCost || "medium",
			timeCost: frontmatter.timeCost as TimeCost || "medium",
			type: frontmatter.taskType as TaskType || "mixed",
			tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
		};
	}

	/**
	 * Store momentum when completing a task/project
	 * @param amount - Amount of momentum to store (0-100, default: 30)
	 */
	async storeMomentum(amount: number = 30): Promise<void> {
		const newLevel = Math.min(100, this.momentumLevel + amount);
		this.momentumLevel = newLevel;
		this.momentumLastUpdated = Date.now();
		
		await this.kernel.updateSettings({
			momentumLevel: this.momentumLevel,
			momentumLastUpdated: this.momentumLastUpdated,
		});
		
		new Notice(`Momentum stored! Level: ${this.momentumLevel}/100`);
	}

	/**
	 * Cash momentum - prompt user to assign follow-up task
	 */
	async cashMomentum(): Promise<void> {
		// Apply decay first
		await this.applyMomentumDecay();
		
		if (this.momentumLevel < this.momentumThreshold) {
			new Notice(`Not enough momentum to cash (${this.momentumLevel}/${this.momentumThreshold} minimum)`);
			return;
		}

		const modal = new MomentumCashModal(this.plugin.app, this.momentumLevel, async (amount) => {
			this.momentumLevel = Math.max(0, this.momentumLevel - amount);
			this.momentumLastUpdated = Date.now();
			
			await this.kernel.updateSettings({
				momentumLevel: this.momentumLevel,
				momentumLastUpdated: this.momentumLastUpdated,
			});
			
			new Notice(`Momentum cashed! Remaining: ${this.momentumLevel}/100`);
		}, this.getGentleTasks([])); // Would need to get actual tasks from Project Pulse
		
		modal.open();
	}

	/**
	 * View current momentum level
	 */
	private viewMomentum(): void {
		const daysSinceUpdate = (Date.now() - this.momentumLastUpdated) / (1000 * 60 * 60 * 24);
		new Notice(`Momentum: ${this.momentumLevel}/100 (${daysSinceUpdate.toFixed(1)} days since update)`);
	}

	/**
	 * Get current momentum level
	 */
	getMomentumLevel(): number {
		return this.momentumLevel;
	}

	/**
	 * Apply momentum decay based on time elapsed
	 */
	private async applyMomentumDecay(): Promise<void> {
		const now = Date.now();
		const daysElapsed = (now - this.momentumLastUpdated) / (1000 * 60 * 60 * 24);
		
		if (daysElapsed > 0 && this.momentumLevel > 0) {
			// Decay by percentage per day
			const decayAmount = this.momentumLevel * (this.momentumDecayRate / 100) * daysElapsed;
			this.momentumLevel = Math.max(0, this.momentumLevel - decayAmount);
			this.momentumLastUpdated = now;
			
			await this.kernel.updateSettings({
				momentumLevel: this.momentumLevel,
				momentumLastUpdated: this.momentumLastUpdated,
			});
		}
	}

	// Status reporting methods
	protected getDescription(): string {
		return "Tracks energy level and momentum. Supports task fit by energy level, low-energy mode, and momentum tracking to adapt the system to human variance.";
	}

	protected getPhase() {
		return "Phase 4: Adaptation" as const;
	}

	protected async getConfigurationStatus(): Promise<OrganConfigurationStatus | undefined> {
		const settings = this.kernel.getSettings();
		const warnings: string[] = [];

		// Check if energy level is valid
		if (!settings.energyLevel || !["low", "medium", "high"].includes(settings.energyLevel)) {
			warnings.push("Energy level not set or invalid. Defaulting to medium.");
		}

		// Check if momentum threshold is reasonable
		if (settings.momentumThreshold < 0 || settings.momentumThreshold > 100) {
			warnings.push("Momentum threshold should be between 0 and 100.");
		}

		// Check if decay rate is reasonable
		if (settings.momentumDecayRate < 0 || settings.momentumDecayRate > 100) {
			warnings.push("Momentum decay rate should be between 0 and 100.");
		}

		return {
			configured: warnings.length === 0,
			warnings: warnings.length > 0 ? warnings : undefined,
		};
	}
}

/**
 * Energy level modal
 */
class EnergyLevelModal extends Modal {
	private currentLevel: EnergyLevel;
	private onSubmit: (level: EnergyLevel) => void;

	constructor(app: App, currentLevel: EnergyLevel, onSubmit: (level: EnergyLevel) => void) {
		super(app);
		this.currentLevel = currentLevel;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Set Energy Level" });

		const levels: { level: EnergyLevel; label: string; desc: string }[] = [
			{ level: "very-low", label: "Very Low", desc: "Only gentle, low-energy tasks" },
			{ level: "low", label: "Low", desc: "Low to medium energy tasks" },
			{ level: "medium", label: "Medium", desc: "Most tasks (default)" },
			{ level: "high", label: "High", desc: "All tasks, including high energy" },
		];

		levels.forEach(({ level, label, desc }) => {
			new Setting(contentEl)
				.setName(label)
				.setDesc(desc)
				.addButton((button) => {
					button.setButtonText(level === this.currentLevel ? "Current" : "Set")
						.setClass(level === this.currentLevel ? "mod-cta" : "")
						.onClick(() => {
							this.onSubmit(level);
							this.close();
						});
				});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

/**
 * Momentum cash modal - allows user to cash momentum for follow-up tasks
 */
class MomentumCashModal extends Modal {
	private currentMomentum: number;
	private onSubmit: (amount: number) => void;
	private availableTasks: EnergyTask[];

	constructor(app: App, currentMomentum: number, onSubmit: (amount: number) => void, availableTasks: EnergyTask[] = []) {
		super(app);
		this.currentMomentum = currentMomentum;
		this.onSubmit = onSubmit;
		this.availableTasks = availableTasks;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Cash Momentum" });
		contentEl.createEl("p", { 
			text: `You have ${this.currentMomentum} momentum stored. Assign a follow-up task while the energy is warm.` 
		});

		if (this.availableTasks.length === 0) {
			contentEl.createEl("p", { 
				text: "No gentle tasks available. Look for low-energy, quick tasks in your projects.",
				cls: "errl-momentum-no-tasks"
			});
		} else {
			contentEl.createEl("h3", { text: "Suggested Tasks" });
			this.availableTasks.slice(0, 5).forEach((task) => {
				const setting = new Setting(contentEl)
					.setName(task.name)
					.setDesc(`${task.energyCost} energy, ${task.timeCost} time`);
				
				setting.addButton((button) => {
					button.setButtonText("Assign")
						.onClick(() => {
							// Cash 20 momentum for assigning a task
							this.onSubmit(20);
							this.close();
						});
				});
			});
		}

		// Manual cash option
		contentEl.createEl("h3", { text: "Manual Cash" });
		let cashAmount = Math.min(20, this.currentMomentum);
		const cashSetting = new Setting(contentEl)
			.setName("Cash Amount")
			.setDesc(`Cash momentum without assigning a task (1-${this.currentMomentum})`)
			.addSlider((slider) => {
				slider.setLimits(1, this.currentMomentum, 1)
					.setValue(cashAmount)
					.onChange((value) => {
						cashAmount = value;
					});
			})
			.addButton((button) => {
				button.setButtonText("Cash")
					.onClick(() => {
						this.onSubmit(cashAmount);
						this.close();
					});
			});

		new Setting(contentEl)
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

