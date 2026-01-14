import { Modal, Setting, App } from "obsidian";
import { DetectedPaths } from "../utils/pathDetector";
import { PathValidator } from "../utils/pathValidator";

/**
 * Path Detection Modal
 * Displays detected paths and allows user to accept/reject them
 */
export class PathDetectionModal extends Modal {
	private detectedPaths: DetectedPaths;
	private selectedPaths: Map<string, string> = new Map();
	private onAccept: (paths: Map<string, string>) => void;
	private onSkip: () => void;

	constructor(
		app: App,
		detectedPaths: DetectedPaths,
		onAccept: (paths: Map<string, string>) => void,
		onSkip: () => void
	) {
		super(app);
		this.detectedPaths = detectedPaths;
		this.onAccept = onAccept;
		this.onSkip = onSkip;
	}

	onOpen(): void {
		const { contentEl } = this;
		// Scope modal styling to Errl so we don't affect global Obsidian modals
		this.modalEl.addClass("errl-setup-modal");
		contentEl.empty();

		contentEl.createEl("h2", { text: "Path Auto-Detection" });

		contentEl.createEl("p", {
			text: "We've detected some common folder patterns in your vault. Select which paths you'd like to use:",
		});

		// Project Pulse Path
		if (this.detectedPaths.projects && this.detectedPaths.projects.length > 0) {
			const projectSection = contentEl.createDiv();
			projectSection.createEl("h3", { text: "Project Pulse Path" });
			projectSection.createEl("p", {
				text: "Folder containing your project folders:",
				cls: "setting-item-description",
			});

			for (const projectPath of this.detectedPaths.projects) {
				const validation = PathValidator.validatePath(this.app.vault, projectPath, false);
				
				new Setting(projectSection)
					.setName(projectPath)
					.setDesc(validation.message)
					.addToggle((toggle) => {
						toggle.setValue(false).onChange((value) => {
							if (value) {
								this.selectedPaths.set("projectPulsePath", projectPath);
							} else {
								this.selectedPaths.delete("projectPulsePath");
							}
						});
					});
			}
		}

		// Lore Engine Paths
		if (this.detectedPaths.lore && this.detectedPaths.lore.length > 0) {
			const loreSection = contentEl.createDiv();
			loreSection.createEl("h3", { text: "Lore Engine Paths" });
			loreSection.createEl("p", {
				text: "Folders containing lore entities (you can select multiple):",
				cls: "setting-item-description",
			});

			for (const lorePath of this.detectedPaths.lore) {
				const validation = PathValidator.validatePath(this.app.vault, lorePath, false);
				
				new Setting(loreSection)
					.setName(lorePath)
					.setDesc(validation.message)
					.addToggle((toggle) => {
						toggle.setValue(false).onChange((value) => {
							if (value) {
								const current = this.selectedPaths.get("loreEnginePaths") || "";
								const paths = current ? current.split(",") : [];
								if (!paths.includes(lorePath)) {
									paths.push(lorePath);
									this.selectedPaths.set("loreEnginePaths", paths.join(","));
								}
							} else {
								const current = this.selectedPaths.get("loreEnginePaths") || "";
								const paths = current ? current.split(",") : [];
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

		// Capture File Path
		if (this.detectedPaths.capture) {
			const captureSection = contentEl.createDiv();
			captureSection.createEl("h3", { text: "Capture File Path" });
			
			const validation = PathValidator.validatePath(this.app.vault, this.detectedPaths.capture, false);
			
			new Setting(captureSection)
				.setName(this.detectedPaths.capture)
				.setDesc(validation.message)
				.addToggle((toggle) => {
					toggle.setValue(false).onChange((value) => {
						if (value) {
							this.selectedPaths.set("captureFilePath", this.detectedPaths.capture!);
						} else {
							this.selectedPaths.delete("captureFilePath");
						}
					});
				});
		}

		// Time Machine Path
		if (this.detectedPaths.timeMachine) {
			const timeMachineSection = contentEl.createDiv();
			timeMachineSection.createEl("h3", { text: "Time Machine Log Path" });
			
			const validation = PathValidator.validatePath(this.app.vault, this.detectedPaths.timeMachine, false);
			
			new Setting(timeMachineSection)
				.setName(this.detectedPaths.timeMachine)
				.setDesc(validation.message)
				.addToggle((toggle) => {
					toggle.setValue(false).onChange((value) => {
						if (value) {
							this.selectedPaths.set("timeMachineLogPath", this.detectedPaths.timeMachine!);
						} else {
							this.selectedPaths.delete("timeMachineLogPath");
						}
					});
				});
		}

		// Promotion Paths
		if (this.detectedPaths.promotionProject) {
			const promotionSection = contentEl.createDiv();
			promotionSection.createEl("h3", { text: "Promotion Project Path" });
			
			const validation = PathValidator.validatePath(this.app.vault, this.detectedPaths.promotionProject, false);
			
			new Setting(promotionSection)
				.setName(this.detectedPaths.promotionProject)
				.setDesc(validation.message)
				.addToggle((toggle) => {
					toggle.setValue(false).onChange((value) => {
						if (value) {
							this.selectedPaths.set("promotionProjectPath", this.detectedPaths.promotionProject!);
						} else {
							this.selectedPaths.delete("promotionProjectPath");
						}
					});
				});
		}

		if (this.detectedPaths.promotionLore) {
			const promotionLoreSection = contentEl.createDiv();
			promotionLoreSection.createEl("h3", { text: "Promotion Lore Path" });
			
			const validation = PathValidator.validatePath(this.app.vault, this.detectedPaths.promotionLore, false);
			
			new Setting(promotionLoreSection)
				.setName(this.detectedPaths.promotionLore)
				.setDesc(validation.message)
				.addToggle((toggle) => {
					toggle.setValue(false).onChange((value) => {
						if (value) {
							this.selectedPaths.set("promotionLorePath", this.detectedPaths.promotionLore!);
						} else {
							this.selectedPaths.delete("promotionLorePath");
						}
					});
				});
		}

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
		
		new Setting(buttonContainer)
			.addButton((button) => {
				button
					.setButtonText("Accept Selected")
					.setCta()
					.onClick(() => {
						this.onAccept(this.selectedPaths);
						this.close();
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Skip")
					.onClick(() => {
						this.onSkip();
						this.close();
					});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
