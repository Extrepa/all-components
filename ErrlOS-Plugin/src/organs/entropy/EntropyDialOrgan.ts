import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice, Modal, Setting, App } from "obsidian";

/**
 * Entropy level (0-100)
 * 0 = Complete order, structured, organized
 * 100 = Complete chaos, creative, unpredictable
 */
export type EntropyLevel = number;

/**
 * Entropy Dial Organ - Order ↔ Chaos slider controlling suggestions
 * Affects how suggestions are generated and presented
 */
export class EntropyDialOrgan extends Organ {
	private entropyLevel: EntropyLevel = 50; // Default: balanced

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "entropyDial";
	}

	getName(): string {
		return "Entropy Dial";
	}

	getDocumentation() {
		return {
			purpose: "Controls balance between creativity (high entropy) and structure (low entropy) in idea generation",
			description: "Entropy Dial organ allows you to adjust the balance between creative chaos and structured organization. Higher entropy favors creative, free-form idea generation, while lower entropy favors structured, organized approaches. The dial setting affects how the system suggests and organizes ideas, helping you match your current creative needs.",
			phase: "Phase 5: Weird Power",
			capabilities: [
				{
					name: "Adjust Entropy",
					description: "Adjusts entropy level (0-100, where 0=structure, 100=creativity)",
					commands: [],
				},
			],
			monitoring: [],
			fileOperations: [],
			backgroundProcesses: [],
			settings: [
				{
					key: "entropyLevel",
					name: "Entropy Level",
					description: "Current entropy level (0-100, default: 50)",
					default: 50,
					affects: ["Idea generation style", "Organizational suggestions"],
				},
			],
			useCases: [
				{
					scenario: "Increase creativity for brainstorming",
					steps: [
						"Enable Entropy Dial organ",
						"Increase entropy level to 70-100",
						"System favors more creative, free-form suggestions",
					],
					expectedOutcome: "More creative, less structured idea generation",
				},
				{
					scenario: "Increase structure for organization",
					steps: [
						"Decrease entropy level to 0-30",
						"System favors more structured, organized approaches",
					],
					expectedOutcome: "More structured, organized idea handling",
				},
			],
			commonIssues: [
				{
					problem: "Entropy setting not taking effect",
					cause: "Other organs may not be respecting entropy setting",
					solution: "Entropy affects how other organs operate. Ensure relevant organs are enabled and check their entropy awareness",
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
		// Load settings when they're added
		this.entropyLevel = settings.entropyLevel || 50;
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
			id: "set-entropy",
			name: "Set Entropy Dial",
			callback: () => {
				this.openEntropyModal();
			},
		});

		this.plugin.addCommand({
			id: "increase-entropy",
			name: "Increase Entropy (More Chaos)",
			callback: () => {
				this.adjustEntropy(10);
			},
		});

		this.plugin.addCommand({
			id: "decrease-entropy",
			name: "Decrease Entropy (More Order)",
			callback: () => {
				this.adjustEntropy(-10);
			},
		});
	}

	/**
	 * Get current entropy level
	 */
	getEntropyLevel(): EntropyLevel {
		return this.entropyLevel;
	}

	/**
	 * Set entropy level
	 */
	async setEntropyLevel(level: EntropyLevel): Promise<void> {
		// Clamp to 0-100
		this.entropyLevel = Math.max(0, Math.min(100, level));
		await this.kernel.updateSettings({
			entropyLevel: this.entropyLevel,
		});
		new Notice(`Entropy set to: ${this.entropyLevel} (${this.getEntropyLabel()})`);
	}

	/**
	 * Adjust entropy by delta
	 */
	async adjustEntropy(delta: number): Promise<void> {
		await this.setEntropyLevel(this.entropyLevel + delta);
	}

	/**
	 * Get entropy label
	 */
	getEntropyLabel(): string {
		if (this.entropyLevel < 25) return "Highly Ordered";
		if (this.entropyLevel < 50) return "Ordered";
		if (this.entropyLevel < 75) return "Balanced";
		if (this.entropyLevel < 90) return "Chaotic";
		return "Highly Chaotic";
	}

	/**
	 * Check if entropy favors order
	 */
	isOrdered(): boolean {
		return this.entropyLevel < 50;
	}

	/**
	 * Check if entropy favors chaos
	 */
	isChaotic(): boolean {
		return this.entropyLevel > 50;
	}

	/**
	 * Get suggestion style based on entropy
	 * Low entropy: structured, organized, predictable
	 * High entropy: creative, unpredictable, experimental
	 */
	getSuggestionStyle(): "structured" | "balanced" | "creative" {
		if (this.entropyLevel < 33) return "structured";
		if (this.entropyLevel > 66) return "creative";
		return "balanced";
	}

	/**
	 * Filter/transform suggestions based on entropy
	 */
	applyEntropyToSuggestions<T>(suggestions: T[]): T[] {
		const style = this.getSuggestionStyle();
		
		if (style === "structured") {
			// Return first few, most relevant
			return suggestions.slice(0, Math.min(3, suggestions.length));
		} else if (style === "creative") {
			// Shuffle and return more diverse set
			const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
			return shuffled.slice(0, Math.min(5, shuffled.length));
		}
		
		// Balanced: return as-is
		return suggestions;
	}

	/**
	 * Open entropy dial modal
	 */
	private openEntropyModal(): void {
		const modal = new EntropyDialModal(this.plugin.app, this.entropyLevel, async (level) => {
			await this.setEntropyLevel(level);
		});
		modal.open();
	}
}

/**
 * Entropy dial modal
 */
class EntropyDialModal extends Modal {
	private currentLevel: EntropyLevel;
	private onSubmit: (level: EntropyLevel) => void;

	constructor(app: App, currentLevel: EntropyLevel, onSubmit: (level: EntropyLevel) => void) {
		super(app);
		this.currentLevel = currentLevel;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Entropy Dial" });
		contentEl.createEl("p", { 
			text: "Control the balance between order and chaos in suggestions. Lower = more structured, Higher = more creative." 
		});

		let sliderValue = this.currentLevel;
		const valueDisplay = contentEl.createEl("div", { 
			cls: "entropy-value-display",
			text: `Current: ${this.currentLevel} - ${this.getLabel(this.currentLevel)}`
		});

		new Setting(contentEl)
			.setName("Entropy Level")
			.setDesc("0 = Complete Order | 100 = Complete Chaos")
			.addSlider((slider) => {
				slider.setLimits(0, 100, 1)
					.setValue(this.currentLevel)
					.onChange((value) => {
						sliderValue = value;
						valueDisplay.textContent = `Current: ${value} - ${this.getLabel(value)}`;
					});
			});

		// Quick presets
		contentEl.createEl("h3", { text: "Quick Presets" });
		
		const presets = [
			{ level: 0, label: "Maximum Order", desc: "Highly structured, predictable" },
			{ level: 25, label: "Ordered", desc: "Structured with some flexibility" },
			{ level: 50, label: "Balanced", desc: "Mix of order and chaos" },
			{ level: 75, label: "Chaotic", desc: "Creative with some structure" },
			{ level: 100, label: "Maximum Chaos", desc: "Highly creative, unpredictable" },
		];

		presets.forEach(({ level, label, desc }) => {
			new Setting(contentEl)
				.setName(label)
				.setDesc(desc)
				.addButton((button) => {
					button.setButtonText(level === this.currentLevel ? "Current" : "Set")
						.setClass(level === this.currentLevel ? "mod-cta" : "")
						.onClick(() => {
							sliderValue = level;
							valueDisplay.textContent = `Current: ${level} - ${this.getLabel(level)}`;
						});
				});
		});

		new Setting(contentEl)
			.addButton((button) => {
				button.setButtonText("Apply").onClick(() => {
					this.onSubmit(sliderValue);
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

	private getLabel(level: number): string {
		if (level < 25) return "Highly Ordered";
		if (level < 50) return "Ordered";
		if (level < 75) return "Balanced";
		if (level < 90) return "Chaotic";
		return "Highly Chaotic";
	}
}

