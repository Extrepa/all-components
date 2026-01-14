import { Modal, Setting, App } from "obsidian";
import { OrganWalkthrough } from "./OrganWalkthrough";
import { WalkthroughStep } from "./WalkthroughStep";

/**
 * Modal for displaying organ walkthroughs
 * Guides users through understanding what an organ does before enabling it
 */
export class WalkthroughModal extends Modal {
	private walkthrough: OrganWalkthrough;
	private currentStepIndex: number = 0;
	private acknowledgedSteps: Set<number> = new Set();
	private onComplete?: (consented: boolean) => void;
	private consentGiven: boolean = false;
	private showAgain: boolean = true;

	constructor(
		app: App,
		walkthrough: OrganWalkthrough,
		onComplete?: (consented: boolean) => void
	) {
		super(app);
		this.walkthrough = walkthrough;
		this.onComplete = onComplete;
	}

	onOpen(): void {
		const { contentEl, titleEl } = this;
		titleEl.setText(`${this.walkthrough.organName} - Walkthrough`);
		contentEl.addClass("errl-walkthrough-modal");
		this.renderStep();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		if (this.onComplete) {
			this.onComplete(this.consentGiven);
		}
	}

	private renderStep(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Progress indicator
		const totalSteps = this.getTotalSteps();
		const progressEl = contentEl.createDiv({ cls: "errl-walkthrough-progress" });
		for (let i = 0; i < totalSteps; i++) {
			const stepDot = progressEl.createSpan({
				cls: `errl-walkthrough-step ${i === this.currentStepIndex ? "active" : i < this.currentStepIndex ? "completed" : ""}`,
			});
			stepDot.textContent = String(i + 1);
		}

		// Current step content
		if (this.currentStepIndex === 0) {
			this.renderOverview(contentEl);
		} else if (this.currentStepIndex === 1) {
			this.renderPurpose(contentEl);
		} else if (this.currentStepIndex === 2) {
			this.renderMonitoring(contentEl);
		} else if (this.currentStepIndex === 3) {
			this.renderFileOperations(contentEl);
		} else if (this.currentStepIndex === 4) {
			this.renderBackgroundProcesses(contentEl);
		} else if (this.currentStepIndex === 5) {
			this.renderExamples(contentEl);
		} else if (this.currentStepIndex === 6) {
			this.renderConsent(contentEl);
		}

		// Navigation buttons
		const buttonContainer = contentEl.createDiv({ cls: "errl-walkthrough-buttons" });

		if (this.currentStepIndex > 0) {
			new Setting(buttonContainer)
				.addButton((button) => {
					button.setButtonText("Previous").onClick(() => {
						this.currentStepIndex--;
						this.renderStep();
					});
				});
		}

		if (this.currentStepIndex < totalSteps - 1) {
			new Setting(buttonContainer)
				.addButton((button) => {
					const requiresAck = this.currentStepIndex === 6; // Consent step
					const canProceed = requiresAck ? this.acknowledgedSteps.has(this.currentStepIndex) : true;
					
					button
						.setButtonText("Next")
						.setCta()
						.setDisabled(!canProceed)
						.onClick(() => {
							this.currentStepIndex++;
							this.renderStep();
						});
				});
		} else {
			// Final step - Enable/Cancel buttons
			new Setting(buttonContainer)
				.addButton((button) => {
					button.setButtonText("Cancel").onClick(() => {
						this.consentGiven = false;
						this.close();
					});
				})
				.addButton((button) => {
					button
						.setButtonText("Enable")
						.setCta()
						.onClick(() => {
							this.consentGiven = true;
							this.close();
						});
				});
		}

		// "Don't show again" option (shown on consent step)
		if (this.currentStepIndex === 6) {
			new Setting(buttonContainer)
				.setName("Don't show this walkthrough again")
				.addToggle((toggle) => {
					toggle.setValue(!this.showAgain).onChange((value) => {
						this.showAgain = !value;
					});
				});
		}
	}

	private getTotalSteps(): number {
		return 7; // Overview, Purpose, Monitoring, File Operations, Background Processes, Examples, Consent
	}

	private renderOverview(container: HTMLElement): void {
		container.createEl("h3", { text: `About ${this.walkthrough.organName}` });
		container.createEl("p", {
			text: this.walkthrough.purpose,
		});

		if (this.walkthrough.dependencies.length > 0) {
			const depsSection = container.createDiv();
			depsSection.createEl("h4", { text: "Dependencies:" });
			const depsList = depsSection.createEl("ul");
			for (const dep of this.walkthrough.dependencies) {
				depsList.createEl("li", { text: dep });
			}
		}

		container.createEl("p", {
			cls: "errl-walkthrough-note",
			text: "This walkthrough will explain what this organ does, what it monitors, and what files it works with.",
		});
	}

	private renderPurpose(container: HTMLElement): void {
		container.createEl("h3", { text: "Purpose" });
		container.createEl("p", {
			text: this.walkthrough.purpose,
		});

		if (this.walkthrough.useCases.length > 0) {
			const useCasesSection = container.createDiv();
			useCasesSection.createEl("h4", { text: "Common Use Cases:" });
			const useCasesList = useCasesSection.createEl("ul");
			for (const useCase of this.walkthrough.useCases) {
				useCasesList.createEl("li", { text: useCase });
			}
		}
	}

	private renderMonitoring(container: HTMLElement): void {
		container.createEl("h3", { text: "What This Organ Monitors" });

		if (this.walkthrough.monitoring.length === 0) {
			container.createEl("p", {
				text: "This organ does not monitor or track any data.",
			});
		} else {
			const monitoringList = container.createEl("ul");
			for (const item of this.walkthrough.monitoring) {
				monitoringList.createEl("li", { text: item });
			}
		}
	}

	private renderFileOperations(container: HTMLElement): void {
		container.createEl("h3", { text: "File Operations" });

		if (this.walkthrough.fileOperations.length === 0) {
			container.createEl("p", {
				text: "This organ does not create, modify, or delete files.",
			});
		} else {
			const opsList = container.createEl("ul");
			for (const op of this.walkthrough.fileOperations) {
				const icon = op.operation === "creates" ? "➕" : op.operation === "modifies" ? "✏️" : op.operation === "deletes" ? "🗑️" : "👁️";
				const li = opsList.createEl("li");
				li.innerHTML = `${icon} <strong>${op.operation}</strong> ${op.path}<br><em>${op.description}</em>`;
			}
		}
	}

	private renderBackgroundProcesses(container: HTMLElement): void {
		container.createEl("h3", { text: "Background Processes" });

		if (this.walkthrough.backgroundProcesses.length === 0) {
			container.createEl("p", {
				text: "This organ does not run any background processes.",
			});
		} else {
			const processesList = container.createEl("ul");
			for (const process of this.walkthrough.backgroundProcesses) {
				const li = processesList.createEl("li");
				const intervalText = process.interval ? ` (runs every ${process.interval}ms)` : "";
				li.innerHTML = `<strong>${process.name}</strong>${intervalText}<br><em>${process.description}</em>${process.canControl ? "<br>✓ You can start/stop this process" : ""}`;
			}
		}
	}

	private renderExamples(container: HTMLElement): void {
		container.createEl("h3", { text: "Examples" });

		if (this.walkthrough.examples.length === 0) {
			container.createEl("p", {
				text: "No examples available.",
			});
		} else {
			const examplesList = container.createEl("ul");
			for (const example of this.walkthrough.examples) {
				examplesList.createEl("li", { text: example });
			}
		}
	}

	private renderConsent(container: HTMLElement): void {
		container.createEl("h3", { text: "Ready to Enable?" });

		const summary = container.createDiv({ cls: "errl-walkthrough-summary" });
		summary.createEl("p", {
			text: `By enabling ${this.walkthrough.organName}, you understand that:`,
		});

		const consentList = summary.createEl("ul");
		
		if (this.walkthrough.monitoring.length > 0) {
			consentList.createEl("li", {
				text: `It will monitor: ${this.walkthrough.monitoring.join(", ")}`,
			});
		}

		if (this.walkthrough.fileOperations.length > 0) {
			const ops = this.walkthrough.fileOperations.map(op => op.operation).join(", ");
			consentList.createEl("li", {
				text: `It will ${ops} files as described above`,
			});
		}

		if (this.walkthrough.backgroundProcesses.length > 0) {
			consentList.createEl("li", {
				text: `Background processes will run as described above`,
			});
		}

		consentList.createEl("li", {
			text: `You can disable this organ at any time in settings`,
		});

		// Acknowledgment checkbox
		new Setting(container)
			.setName("I understand what this organ does and consent to enabling it")
			.addToggle((toggle) => {
				toggle.onChange((value) => {
					if (value) {
						this.acknowledgedSteps.add(this.currentStepIndex);
					} else {
						this.acknowledgedSteps.delete(this.currentStepIndex);
					}
					this.renderStep(); // Re-render to update button state
				});
			});
	}

	getShowAgain(): boolean {
		return this.showAgain;
	}

	getConsentGiven(): boolean {
		return this.consentGiven;
	}
}

