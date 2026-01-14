import { Modal, Setting, App } from "obsidian";
import { PathDetector, DetectedPaths } from "../utils/pathDetector";
import { PathValidator } from "../utils/pathValidator";
import { ErrlKernel } from "../kernel/ErrlKernel";
import { ErrlSettings } from "./ErrlSettings";
import { ORGAN_METADATA, getOrganIds, getRecommendedOrganIds, OrganId } from "../organs/metadata";
import { ErrlOSOnboardingModal } from "../utils/ErrlOSOnboardingModal";

/**
 * First-Run Wizard
 * Guides new users through initial setup
 */
export class FirstRunWizard extends Modal {
	private kernel: ErrlKernel;
	private currentStep: number = 1;
	private totalSteps: number = 5;
	private detectedPaths: DetectedPaths;
	private selectedPaths: Map<string, string> = new Map();
	private selectedOrgans: Set<OrganId> = new Set(getRecommendedOrganIds()); // Default enabled
	private autoOpenDashboard: boolean = false; // Default to false, user can opt-in

	constructor(app: App, kernel: ErrlKernel) {
		super(app);
		this.kernel = kernel;
		this.detectedPaths = PathDetector.detectVaultStructure(app.vault);
		
		// Initialize with detected paths if available
		if (this.detectedPaths.capture) {
			this.selectedPaths.set("captureFilePath", this.detectedPaths.capture);
		} else {
			// Use default
			this.selectedPaths.set("captureFilePath", "ErrlOS/Capture.md");
		}

		this.selectedPaths.set("captureRecordFolderPath", "ErrlOS/Capture/");
		this.selectedPaths.set("captureBasePath", "ErrlOS/Capture.base");
		this.selectedPaths.set("systemBasePath", "ErrlOS/System.base");
		
		if (this.detectedPaths.timeMachine) {
			this.selectedPaths.set("timeMachineLogPath", this.detectedPaths.timeMachine);
		} else {
			// Use default
			this.selectedPaths.set("timeMachineLogPath", "ErrlOS/Logs/");
		}
		
		// Set default dashboard path
		this.selectedPaths.set("dashboardPath", "ErrlOS/Dashboard.md");
	}

	onOpen(): void {
		// Scope modal styling to Errl so we don't affect global Obsidian modals
		this.modalEl.addClass("errl-setup-modal");
		this.renderStep();
	}

	private renderStep(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Progress indicator - styled as visual dots
		const progressEl = contentEl.createDiv({ cls: "wizard-progress" });
		for (let i = 1; i <= this.totalSteps; i++) {
			const stepEl = progressEl.createDiv({ cls: `wizard-step ${i <= this.currentStep ? "active" : ""}` });
			// Number is hidden by CSS, shown only for screen readers
			stepEl.createEl("span", { text: String(i), attr: { "aria-label": `Step ${i}` } });
		}

		// Step header
		contentEl.createEl("h2", { text: `Step ${this.currentStep} of ${this.totalSteps}` });

		// Scrollable content wrapper
		const contentWrapper = contentEl.createDiv({ cls: "wizard-content" });

		switch (this.currentStep) {
			case 1:
				this.renderWelcome(contentWrapper);
				break;
			case 2:
				this.renderPathDetection(contentWrapper);
				break;
			case 3:
				this.renderPathConfiguration(contentWrapper);
				break;
			case 4:
				this.renderOrganSelection(contentWrapper);
				break;
			case 5:
				this.renderCompletion(contentWrapper);
				break;
		}

		// Navigation buttons - sticky footer
		const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
		
		if (this.currentStep > 1) {
			new Setting(buttonContainer)
				.addButton((button) => {
					button
						.setButtonText("Previous")
						.onClick(() => {
							this.currentStep--;
							this.renderStep();
						});
				});
		}

		if (this.currentStep < this.totalSteps) {
			new Setting(buttonContainer)
				.addButton((button) => {
					button
						.setButtonText("Next")
						.setCta()
						.onClick(() => {
							this.currentStep++;
							this.renderStep();
						});
				});
		} else if (this.currentStep === this.totalSteps) {
			// Complete Setup button on final step
			new Setting(buttonContainer)
				.addButton((button) => {
					button
						.setButtonText("Complete Setup")
						.setCta()
						.onClick(async () => {
							try {
								await this.applySettings();
								this.close();
								
								// Show onboarding modal after wizard completes (if enabled)
								const settings = this.kernel.getSettings();
								if (settings.showOnboardingModal) {
									// Small delay so dashboard can render first
									setTimeout(() => {
										new ErrlOSOnboardingModal(this.app, this.kernel).open();
									}, 1500);
								}
							} catch (error) {
								console.error("[Errl OS] Error completing setup:", error);
								// Show error to user
								const errorEl = contentEl.createDiv({ cls: "wizard-error" });
								errorEl.createEl("p", { text: "An error occurred while saving settings. Please try again or configure manually in settings." });
							}
						});
				});
		}
	}

	private renderWelcome(container: HTMLElement): void {
		container.createEl("h3", { text: "Welcome to Errl OS!" });
		container.createEl("p", {
			text: "Errl OS is a modular creative operating system built inside Obsidian. This wizard will help you set up the plugin for your vault.",
		});
		container.createEl("p", {
			text: "We'll guide you through:",
		});
		const list = container.createEl("ul");
		list.createEl("li", { text: "Detecting your vault structure" });
		list.createEl("li", { text: "Configuring paths for features" });
		list.createEl("li", { text: "Selecting which features to enable" });
		container.createEl("p", {
			text: "You can always change these settings later in the plugin settings.",
		});
	}

	private renderPathDetection(container: HTMLElement): void {
		container.createEl("h3", { text: "Path Auto-Detection" });
		
		const summary = PathDetector.getDetectionSummary(this.detectedPaths);
		container.createEl("p", { text: summary });

		if (Object.keys(this.detectedPaths).length === 0 || 
			(this.detectedPaths.projects?.length === 0 && 
			 this.detectedPaths.lore?.length === 0 && 
			 !this.detectedPaths.capture && 
			 !this.detectedPaths.timeMachine)) {
			container.createEl("p", {
				text: "No common vault structure was detected. You can configure paths manually in the next step or in settings later.",
			});
		} else {
			container.createEl("p", {
				text: "We found some common folder patterns. You can accept these or configure them manually in the next step.",
			});

			// Show detected paths
			if (this.detectedPaths.projects && this.detectedPaths.projects.length > 0) {
				const section = container.createDiv();
				section.createEl("h4", { text: "Project Folders:" });
				for (const projectPath of this.detectedPaths.projects) {
					const setting = new Setting(section)
						.setName(projectPath)
						.addToggle((toggle) => {
							toggle.setValue(this.selectedPaths.has("projectPulsePath") && 
								this.selectedPaths.get("projectPulsePath") === projectPath)
								.onChange((value) => {
									if (value) {
										this.selectedPaths.set("projectPulsePath", projectPath);
									} else {
										this.selectedPaths.delete("projectPulsePath");
									}
								});
						});
				}
			}

			if (this.detectedPaths.lore && this.detectedPaths.lore.length > 0) {
				const section = container.createDiv();
				section.createEl("h4", { text: "Lore Folders:" });
				for (const lorePath of this.detectedPaths.lore) {
					const setting = new Setting(section)
						.setName(lorePath)
						.addToggle((toggle) => {
							const current = this.selectedPaths.get("loreEnginePaths") || "";
							const paths = current ? current.split(",") : [];
							toggle.setValue(paths.includes(lorePath))
								.onChange((value) => {
									if (value) {
										if (!paths.includes(lorePath)) {
											paths.push(lorePath);
											this.selectedPaths.set("loreEnginePaths", paths.join(","));
										}
									} else {
										const filtered = paths.filter(p => p !== lorePath);
										if (filtered.length > 0) {
											this.selectedPaths.set("loreEnginePaths", filtered.join(","));
										} else {
											this.selectedPaths.delete("loreEnginePaths");
										}
									}
								});
						});
				}
			}
		}
	}

	private renderPathConfiguration(container: HTMLElement): void {
		container.createEl("h3", { text: "Path Configuration" });
		container.createEl("p", {
			text: "Review and configure paths for features. You can edit these later in settings.",
		});

		// Dashboard Path
		const dashboardPath = this.selectedPaths.get("dashboardPath") || "ErrlOS/Dashboard.md";
		const dashboardSection = container.createDiv();
		new Setting(dashboardSection)
			.setName("Dashboard Path")
			.setDesc("Path to the dashboard file (home screen of Errl OS)")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Dashboard.md")
					.setValue(dashboardPath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("dashboardPath", value);
						} else {
							this.selectedPaths.set("dashboardPath", "ErrlOS/Dashboard.md");
						}
					});
			});

		// Capture File Path
		const captureFilePath = this.selectedPaths.get("captureFilePath") || "ErrlOS/Capture.md";
		const captureSection = container.createDiv();
		new Setting(captureSection)
			.setName("Capture File Path")
			.setDesc("Path to the capture file (where ideas are stored)")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture.md")
					.setValue(captureFilePath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("captureFilePath", value);
						} else {
							this.selectedPaths.set("captureFilePath", "ErrlOS/Capture.md");
						}
					});
			});

		// Capture Record Folder
		const captureRecordFolderPath = this.selectedPaths.get("captureRecordFolderPath") || "ErrlOS/Capture/";
		const captureRecordSection = container.createDiv();
		new Setting(captureRecordSection)
			.setName("Capture Record Folder")
			.setDesc("Folder where per-capture notes are stored (for Bases)")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture/")
					.setValue(captureRecordFolderPath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("captureRecordFolderPath", value);
						} else {
							this.selectedPaths.set("captureRecordFolderPath", "ErrlOS/Capture/");
						}
					});
			});

		// Capture Base Path
		const captureBasePath = this.selectedPaths.get("captureBasePath") || "ErrlOS/Capture.base";
		const captureBaseSection = container.createDiv();
		new Setting(captureBaseSection)
			.setName("Capture Base Path")
			.setDesc("Path to the Bases view file for capture entries")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture.base")
					.setValue(captureBasePath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("captureBasePath", value);
						} else {
							this.selectedPaths.set("captureBasePath", "ErrlOS/Capture.base");
						}
					});
			});

		// Optional Base Paths (for other organs)
		container.createEl("h4", { text: "Optional: Additional Base Paths" });
		container.createEl("p", {
			text: "You can configure Base paths for other organs now, or set them up later in settings.",
			cls: "setting-item-description",
		});

		// Ritual Base Path
		const ritualBasePath = this.selectedPaths.get("ritualBasePath") || "ErrlOS/Rituals.base";
		const ritualBaseSection = container.createDiv();
		new Setting(ritualBaseSection)
			.setName("Ritual Base Path (Optional)")
			.setDesc("Path to the Bases view file for ritual entries")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Rituals.base")
					.setValue(ritualBasePath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("ritualBasePath", value);
						} else {
							this.selectedPaths.set("ritualBasePath", "ErrlOS/Rituals.base");
						}
					});
			});

		// Time Machine Log Path
		const timeMachineLogPath = this.selectedPaths.get("timeMachineLogPath") || "ErrlOS/Logs/";
		const timeMachineSection = container.createDiv();
		new Setting(timeMachineSection)
			.setName("Time Machine Log Path")
			.setDesc("Folder where session logs are stored")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Logs/")
					.setValue(timeMachineLogPath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("timeMachineLogPath", value);
						} else {
							this.selectedPaths.set("timeMachineLogPath", "ErrlOS/Logs/");
						}
					});
			});

		// Project Pulse Path
		const projectPulsePath = this.selectedPaths.get("projectPulsePath") || "";
		const projectPulseSection = container.createDiv();
		new Setting(projectPulseSection)
			.setName("Project Pulse Path")
			.setDesc("Folder containing your project folders (optional)")
			.addText((text) => {
				text
					.setPlaceholder("Projects/")
					.setValue(projectPulsePath)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("projectPulsePath", value);
						} else {
							this.selectedPaths.delete("projectPulsePath");
						}
					});
			});

		// Lore Engine Paths
		const lorePaths = this.selectedPaths.get("loreEnginePaths") || "";
		const loreSection = container.createDiv();
		new Setting(loreSection)
			.setName("Lore Engine Paths")
			.setDesc("Comma-separated paths to scan for lore entities (optional)")
			.addText((text) => {
				text
					.setPlaceholder("Creative/Lore/, Lore/")
					.setValue(lorePaths)
					.onChange((value) => {
						if (value) {
							this.selectedPaths.set("loreEnginePaths", value);
						} else {
							this.selectedPaths.delete("loreEnginePaths");
						}
					});
			});
	}

	private renderOrganSelection(container: HTMLElement): void {
		container.createEl("h3", { text: "Feature Selection" });
		container.createEl("p", {
			text: "Select which features (organs) you'd like to enable. You can change this later in settings.",
		});

		// Auto-open Dashboard toggle
		const autoOpenSection = container.createDiv();
		new Setting(autoOpenSection)
			.setName("Auto-open Dashboard")
			.setDesc("Automatically open the dashboard when Obsidian starts")
			.addToggle((toggle) => {
				toggle.setValue(this.autoOpenDashboard)
					.onChange((value) => {
						this.autoOpenDashboard = value;
					});
			});

		container.createEl("hr");

		for (const organ of ORGAN_METADATA) {
			const description = organ.recommended
				? `${organ.description} (recommended)`
				: organ.description;
			new Setting(container)
				.setName(organ.name)
				.setDesc(description)
				.addToggle((toggle) => {
					const isEnabled = this.selectedOrgans.has(organ.id);
					toggle.setValue(isEnabled)
						.onChange((value) => {
							try {
								if (value) {
									this.selectedOrgans.add(organ.id);
								} else {
									// Don't allow disabling dashboard or capture if they're the only ones
									if (organ.id === "dashboard" || organ.id === "capture") {
										if (this.selectedOrgans.size <= 2) {
											toggle.setValue(true);
											return;
										}
									}
									this.selectedOrgans.delete(organ.id);
								}
							} catch (error) {
								console.error(`[Errl OS] Error toggling ${organ.id}:`, error);
							}
						});
				});
		}
	}

	private async renderCompletion(container: HTMLElement): Promise<void> {
		container.createEl("h3", { text: "Setup Complete!" });
		container.createEl("p", {
			text: "Your Errl OS plugin is now configured. Here's what we've set up:",
		});

		const summary = container.createEl("ul");
		summary.createEl("li", { text: `Dashboard: ${this.selectedPaths.get("dashboardPath") || "ErrlOS/Dashboard.md"}` });
		summary.createEl("li", { text: `Capture: ${this.selectedPaths.get("captureFilePath") || "ErrlOS/Capture.md"}` });
		summary.createEl("li", { text: `Capture Records: ${this.selectedPaths.get("captureRecordFolderPath") || "ErrlOS/Capture/"}` });
		summary.createEl("li", { text: `Capture Base: ${this.selectedPaths.get("captureBasePath") || "ErrlOS/Capture.base"}` });
		summary.createEl("li", { text: `System Base: ${this.selectedPaths.get("systemBasePath") || "ErrlOS/System.base"}` });
		if (this.selectedPaths.has("ritualBasePath")) {
			summary.createEl("li", { text: `Ritual Base: ${this.selectedPaths.get("ritualBasePath")}` });
		}
		if (this.selectedPaths.has("projectPulsePath")) {
			summary.createEl("li", { text: `Project Pulse: ${this.selectedPaths.get("projectPulsePath")}` });
		}
		if (this.selectedPaths.has("loreEnginePaths")) {
			summary.createEl("li", { text: `Lore Engine: ${this.selectedPaths.get("loreEnginePaths")}` });
		}
		summary.createEl("li", { text: `Enabled ${this.selectedOrgans.size} feature(s)` });
		summary.createEl("li", { text: `Auto-open dashboard: ${this.autoOpenDashboard ? "Yes" : "No"}` });

		container.createEl("p", {
			text: "Tips:",
		});
		const tips = container.createEl("ul");
		tips.createEl("li", { text: "Use Ctrl/Cmd + Shift + C to capture ideas quickly" });
		tips.createEl("li", { text: "Open the dashboard to see all your features" });
		tips.createEl("li", { text: "You can change settings anytime in Settings → Errl OS" });
	}

	private async applySettings(): Promise<void> {
		// Apply path settings
		const updates: Partial<ErrlSettings> = {};
		
		// Essential paths (always set)
		if (this.selectedPaths.has("dashboardPath")) {
			updates.dashboardPath = this.selectedPaths.get("dashboardPath")!;
		}
		
		if (this.selectedPaths.has("captureFilePath")) {
			updates.captureFilePath = this.selectedPaths.get("captureFilePath")!;
		}

		if (this.selectedPaths.has("captureRecordFolderPath")) {
			updates.captureRecordFolderPath = this.selectedPaths.get("captureRecordFolderPath")!;
		}

		if (this.selectedPaths.has("captureBasePath")) {
			updates.captureBasePath = this.selectedPaths.get("captureBasePath")!;
		}

		if (this.selectedPaths.has("ritualBasePath")) {
			updates.ritualBasePath = this.selectedPaths.get("ritualBasePath")!;
		}

		if (this.selectedPaths.has("loreBasePath")) {
			updates.loreBasePath = this.selectedPaths.get("loreBasePath")!;
		}

		if (this.selectedPaths.has("projectPulseBasePath")) {
			updates.projectPulseBasePath = this.selectedPaths.get("projectPulseBasePath")!;
		}

		if (this.selectedPaths.has("assetBrainBasePath")) {
			updates.assetBrainBasePath = this.selectedPaths.get("assetBrainBasePath")!;
		}

		if (this.selectedPaths.has("timeMachineBasePath")) {
			updates.timeMachineBasePath = this.selectedPaths.get("timeMachineBasePath")!;
		}

		if (this.selectedPaths.has("systemBasePath")) {
			updates.systemBasePath = this.selectedPaths.get("systemBasePath")!;
		}
		
		if (this.selectedPaths.has("timeMachineLogPath")) {
			updates.timeMachineLogPath = this.selectedPaths.get("timeMachineLogPath")!;
		}
		
		// Optional paths
		if (this.selectedPaths.has("projectPulsePath")) {
			updates.projectPulsePath = this.selectedPaths.get("projectPulsePath")!;
		}
		
		if (this.selectedPaths.has("loreEnginePaths")) {
			const paths = this.selectedPaths.get("loreEnginePaths")!.split(",").map(p => p.trim()).filter(p => p.length > 0);
			updates.loreEnginePaths = paths;
		}
		
		if (this.selectedPaths.has("promotionProjectPath")) {
			updates.promotionProjectPath = this.selectedPaths.get("promotionProjectPath")!;
		}
		
		if (this.selectedPaths.has("promotionLorePath")) {
			updates.promotionLorePath = this.selectedPaths.get("promotionLorePath")!;
		}
		
		// Auto-open dashboard setting
		updates.autoOpenDashboard = this.autoOpenDashboard;

		// Apply organ settings
		const enabledOrgans: Record<OrganId, boolean> = {} as Record<OrganId, boolean>;
		const allOrgans = getOrganIds();
		
		for (const organId of allOrgans) {
			enabledOrgans[organId] = this.selectedOrgans.has(organId);
		}
		
		updates.enabledOrgans = enabledOrgans;
		updates.firstRunCompleted = true;

		await this.kernel.updateSettings(updates);
		
		// Enable/disable organs
		for (const organId of allOrgans) {
			if (this.selectedOrgans.has(organId)) {
				await this.kernel.enableOrgan(organId);
			} else {
				await this.kernel.disableOrgan(organId);
			}
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
