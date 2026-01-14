import { App, Plugin, PluginSettingTab, Setting, Notice } from "obsidian";
import { createHelpButtonFromOrgan } from "../utils/HelpButton";
import { CommandHelpModal } from "../utils/CommandHelpModal";
import { Organ } from "../organs/base/Organ";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";
import { ErrlKernel } from "../kernel/ErrlKernel";
import { ErrlSettings } from "./ErrlSettings";
import { PathValidator } from "../utils/pathValidator";
import { PathDetector } from "../utils/pathDetector";
import { PathDetectionModal } from "./PathDetectionModal";
import { FileUtils } from "../utils/fileUtils";
import { LayeredControlHelper, ControlLevel } from "../utils/LayeredControlHelper";
import { ORGAN_METADATA } from "../organs/metadata";

/**
 * Settings tab for Errl OS
 */
export class ErrlSettingsTab extends PluginSettingTab {
	private kernel: ErrlKernel;

	constructor(app: App, plugin: Plugin, kernel: ErrlKernel) {
		super(app, plugin);
		this.kernel = kernel;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Errl OS Settings" });

		// View All Commands button
		new Setting(containerEl)
			.setName("View All Commands")
			.setDesc("Browse all available commands from enabled organs with search and filtering")
			.addButton((button) => {
				button
					.setButtonText("View All Commands")
					.setCta()
					.onClick(() => {
						const modal = new CommandHelpModal(this.app, this.kernel);
						modal.open();
					});
			});

		// Path auto-detection button
		new Setting(containerEl)
			.setName("Auto-detect paths")
			.setDesc("Automatically detect common folder patterns in your vault")
			.addButton((button) => {
				button
					.setButtonText("Detect Paths")
					.setCta()
					.onClick(() => {
						this.showPathDetectionModal();
					});
			});

		const settings = this.kernel.getSettings();

		// Dashboard settings
		new Setting(containerEl)
			.setName("Dashboard path")
			.setDesc("Path to the dashboard note")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Dashboard.md")
					.setValue(settings.dashboardPath)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							dashboardPath: value,
						});
					});
			});

		new Setting(containerEl)
			.setName("Auto-open dashboard")
			.setDesc("Automatically open dashboard when vault loads")
			.addToggle((toggle) => {
				toggle.setValue(settings.autoOpenDashboard).onChange(async (value) => {
					await this.kernel.updateSettings({
						autoOpenDashboard: value,
					});
				});
			});

		// Capture settings
		new Setting(containerEl)
			.setName("Capture file path")
			.setDesc("Path to the capture file")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture.md")
					.setValue(settings.captureFilePath)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							captureFilePath: value,
						});
					});
			});

		new Setting(containerEl)
			.setName("Capture record folder")
			.setDesc("Folder where per-capture notes are stored for Bases")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture/")
					.setValue(settings.captureRecordFolderPath || "ErrlOS/Capture/")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							captureRecordFolderPath: value,
						});
					});
			});

		new Setting(containerEl)
			.setName("Capture base path")
			.setDesc("Path to the Bases view file for capture entries")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Capture.base")
					.setValue(settings.captureBasePath || "ErrlOS/Capture.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							captureBasePath: value,
						});
					});
			});

		// Bases settings section
		containerEl.createEl("hr", { cls: "errl-settings-divider" });
		containerEl.createEl("h3", { text: "📊 Bases Settings", cls: "errl-settings-section-header" });
		containerEl.createEl("p", { 
			text: "Configure Obsidian Bases integration. Bases provide database-like views over your notes for better organization and filtering.", 
			cls: "errl-settings-section-desc" 
		});

		// Base feature flags - Collapsible section
		const featureFlagsContainer = containerEl.createDiv({ cls: "errl-fine-grained-controls errl-fine-grained-bases" });
		const featureFlagsHeader = featureFlagsContainer.createDiv({ cls: "errl-collapsible-header" });
		featureFlagsHeader.createEl("h4", { text: "🔧 Enable Bases per Organ" });
		featureFlagsHeader.style.cursor = "pointer";
		
		const featureFlagsContent = featureFlagsContainer.createDiv({ cls: "errl-collapsible-content" });
		featureFlagsContent.style.display = "block"; // Expanded by default
		
		// Toggle collapse on header click
		let featureFlagsExpanded = true;
		featureFlagsHeader.addEventListener("click", () => {
			featureFlagsExpanded = !featureFlagsExpanded;
			featureFlagsContent.style.display = featureFlagsExpanded ? "block" : "none";
		});
		
		new Setting(featureFlagsContent)
			.setName("🎯 Enable Capture Base")
			.setDesc("Create and manage Base view for capture entries")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.capture ?? true)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								capture: value,
							},
						});
					});
			});

		new Setting(featureFlagsContent)
			.setName("🔮 Enable Ritual Base")
			.setDesc("Create and manage Base view for ritual entries")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.ritual ?? true)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								ritual: value,
							},
						});
					});
			});

		new Setting(featureFlagsContent)
			.setName("📚 Enable Lore Base")
			.setDesc("Create and manage Base view for lore entities")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.lore ?? false)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								lore: value,
							},
						});
					});
			});

		new Setting(featureFlagsContent)
			.setName("📊 Enable Project Pulse Base")
			.setDesc("Create and manage Base view for project status")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.projectPulse ?? false)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								projectPulse: value,
							},
						});
					});
			});

		new Setting(featureFlagsContent)
			.setName("🎨 Enable Asset Brain Base")
			.setDesc("Create and manage Base view for assets")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.assetBrain ?? false)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								assetBrain: value,
							},
						});
					});
			});

		new Setting(featureFlagsContent)
			.setName("⏰ Enable Time Machine Base")
			.setDesc("Create and manage Base view for session logs")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.basesEnabled?.timeMachine ?? false)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							basesEnabled: {
								...settings.basesEnabled,
								timeMachine: value,
							},
						});
					});
			});

		// Base paths - Collapsible section
		const basePathsContainer = containerEl.createDiv({ cls: "errl-fine-grained-controls errl-fine-grained-bases-paths" });
		const basePathsHeader = basePathsContainer.createDiv({ cls: "errl-collapsible-header" });
		basePathsHeader.createEl("h4", { text: "📁 Base File Paths" });
		basePathsHeader.style.cursor = "pointer";
		
		const basePathsContent = basePathsContainer.createDiv({ cls: "errl-collapsible-content" });
		basePathsContent.style.display = "block"; // Expanded by default
		
		// Toggle collapse on header click
		let basePathsExpanded = true;
		basePathsHeader.addEventListener("click", () => {
			basePathsExpanded = !basePathsExpanded;
			basePathsContent.style.display = basePathsExpanded ? "block" : "none";
		});
		
		new Setting(basePathsContent)
			.setName("Ritual base path")
			.setDesc("Path to the Bases view file for ritual entries")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Rituals.base")
					.setValue(settings.ritualBasePath || "ErrlOS/Rituals.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							ritualBasePath: value,
						});
					});
			});

		new Setting(basePathsContent)
			.setName("Lore base path")
			.setDesc("Path to the Bases view file for lore entities")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Lore.base")
					.setValue(settings.loreBasePath || "ErrlOS/Lore.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							loreBasePath: value,
						});
					});
			});

		new Setting(basePathsContent)
			.setName("Project Pulse base path")
			.setDesc("Path to the Bases view file for project status")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Project-Pulse.base")
					.setValue(settings.projectPulseBasePath || "ErrlOS/Project-Pulse.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							projectPulseBasePath: value,
						});
					});
			});

		new Setting(basePathsContent)
			.setName("Asset Brain base path")
			.setDesc("Path to the Bases view file for assets")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Asset-Brain.base")
					.setValue(settings.assetBrainBasePath || "ErrlOS/Asset-Brain.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							assetBrainBasePath: value,
						});
					});
			});

		new Setting(basePathsContent)
			.setName("Time Machine base path")
			.setDesc("Path to the Bases view file for session logs")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Time-Machine.base")
					.setValue(settings.timeMachineBasePath || "ErrlOS/Time-Machine.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							timeMachineBasePath: value,
						});
					});
			});

		// System Base path
		new Setting(basePathsContent)
			.setName("System Base path")
			.setDesc("Path to the System Base file (tracks all ErrlOS data across organs)")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/System.base")
					.setValue(settings.systemBasePath || "ErrlOS/System.base")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							systemBasePath: value,
						});
					});
			});

		// Legacy index links toggle
		basePathsContent.createEl("hr", { cls: "errl-settings-divider" });
		new Setting(basePathsContent)
			.setName("Show Legacy Index Links")
			.setDesc("Display legacy markdown index links alongside Base buttons. Bases are recommended for most use cases.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.showLegacyIndexLinks ?? false)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							showLegacyIndexLinks: value,
						});
					});
			});

		// Base Templates section
		containerEl.createEl("hr", { cls: "errl-settings-divider" });
		containerEl.createEl("h3", { text: "📋 Base Templates", cls: "errl-settings-section-header" });
		containerEl.createEl("p", { 
			text: "Manage reusable Base templates for creating new Bases", 
			cls: "errl-settings-section-desc" 
		});
		new Setting(containerEl)
			.setName("Manage Templates")
			.setDesc("View, create, and manage Base templates")
			.addButton((button) => {
				button
					.setButtonText("Open Template Manager")
					.setCta()
					.onClick(() => {
						const { BaseTemplateModal } = require("../utils/BaseTemplateModal");
						new BaseTemplateModal(this.app).open();
					});
			});

		// Onboarding modal toggle
		containerEl.createEl("hr", { cls: "errl-settings-divider" });
		containerEl.createEl("h3", { text: "📚 Onboarding", cls: "errl-settings-section-header" });
		containerEl.createEl("p", { 
			text: "Help and guidance settings", 
			cls: "errl-settings-section-desc" 
		});
		new Setting(containerEl)
			.setName("Show Onboarding Modal")
			.setDesc("Show helpful onboarding modal when opening Obsidian. Explains how to use the dashboard and features.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.showOnboardingModal ?? true)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							showOnboardingModal: value,
						});
					});
			});

		// Project Pulse settings
		const projectPulseSetting = new Setting(containerEl)
			.setName("Project Pulse path")
			.setDesc("Path to scan for projects (folder containing project folders). Leave empty to disable.")
			.addText((text) => {
				text
					.setPlaceholder("Projects/")
					.setValue(settings.projectPulsePath)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							projectPulsePath: value,
						});
						// Validate and update description
						this.updateProjectPulseValidation(projectPulseSetting, value);
					});
			});
		
		// Initial validation
		this.updateProjectPulseValidation(projectPulseSetting, settings.projectPulsePath);

		new Setting(containerEl)
			.setName("Active threshold (days)")
			.setDesc("Projects modified within this many days are considered active")
			.addText((text) => {
				text
					.setPlaceholder("3")
					.setValue(settings.pulseThresholds.active.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							await this.kernel.updateSettings({
								pulseThresholds: {
									...settings.pulseThresholds,
									active: num,
								},
							});
						}
					});
			});

		new Setting(containerEl)
			.setName("Warm threshold (days)")
			.setDesc("Projects modified within this many days are considered warm")
			.addText((text) => {
				text
					.setPlaceholder("14")
					.setValue(settings.pulseThresholds.warm.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							await this.kernel.updateSettings({
								pulseThresholds: {
									...settings.pulseThresholds,
									warm: num,
								},
							});
						}
					});
			});

		new Setting(containerEl)
			.setName("Dormant threshold (days)")
			.setDesc("Projects modified within this many days are considered dormant")
			.addText((text) => {
				text
					.setPlaceholder("90")
					.setValue(settings.pulseThresholds.dormant.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							await this.kernel.updateSettings({
								pulseThresholds: {
									...settings.pulseThresholds,
									dormant: num,
								},
							});
						}
					});
			});

		// Time Machine settings
		new Setting(containerEl)
			.setName("Time Machine log path")
			.setDesc("Path where session logs are stored")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Logs/")
					.setValue(settings.timeMachineLogPath)
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							timeMachineLogPath: value,
						});
					});
			});

		// Lore Engine settings
		const loreEnginePathsSetting = new Setting(containerEl)
			.setName("Lore Engine entity paths")
			.setDesc("Comma-separated paths to scan for lore entities. Leave empty to disable.")
			.addText((text) => {
				text
					.setPlaceholder("Creative/Lore/, Lore/")
					.setValue(settings.loreEnginePaths?.join(", ") || "")
					.onChange(async (value) => {
						const paths = value.split(",").map(p => p.trim()).filter(p => p.length > 0);
						await this.kernel.updateSettings({
							loreEnginePaths: paths,
						});
						// Validate and update description
						this.updateLoreEnginePathsValidation(loreEnginePathsSetting, paths);
					});
			});
		
		// Initial validation
		this.updateLoreEnginePathsValidation(loreEnginePathsSetting, settings.loreEnginePaths || []);

		new Setting(containerEl)
			.setName("Lore Engine index path")
			.setDesc("Path to the auto-generated lore index file")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Lore-Index.md")
					.setValue(settings.loreEngineIndexPath || "ErrlOS/Lore-Index.md")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							loreEngineIndexPath: value,
						});
					});
			});

		new Setting(containerEl)
			.setName("Lore Engine auto-link")
			.setDesc("Automatically detect and link entities in text")
			.addToggle((toggle) => {
				toggle.setValue(settings.loreEngineAutoLink !== false).onChange(async (value) => {
					await this.kernel.updateSettings({
						loreEngineAutoLink: value,
					});
				});
			});

		// Reality Map settings
		new Setting(containerEl)
			.setName("Reality Map path")
			.setDesc("Path to the reality map note")
			.addText((text) => {
				text
					.setPlaceholder("ErrlOS/Reality-Map.md")
					.setValue(settings.realityMapPath || "ErrlOS/Reality-Map.md")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							realityMapPath: value,
						});
					});
			});

		new Setting(containerEl)
			.setName("Reality Map cluster by theme")
			.setDesc("Group files by tags/themes in the map")
			.addToggle((toggle) => {
				toggle.setValue(settings.realityMapClusterByTheme !== false).onChange(async (value) => {
					await this.kernel.updateSettings({
						realityMapClusterByTheme: value,
					});
				});
			});

		new Setting(containerEl)
			.setName("Reality Map include tags")
			.setDesc("Include tag information in the map")
			.addToggle((toggle) => {
				toggle.setValue(settings.realityMapIncludeTags !== false).onChange(async (value) => {
					await this.kernel.updateSettings({
						realityMapIncludeTags: value,
					});
				});
			});

		// Promotion settings
		const promotionProjectSetting = new Setting(containerEl)
			.setName("Promotion project path")
			.setDesc("Path where promoted projects are created. Leave empty to disable promotion to projects.")
			.addText((text) => {
				text
					.setPlaceholder("Projects/")
					.setValue(settings.promotionProjectPath || "")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							promotionProjectPath: value,
						});
						this.updatePromotionPathValidation(promotionProjectSetting, value, "project");
					});
			});
		
		this.updatePromotionPathValidation(promotionProjectSetting, settings.promotionProjectPath || "", "project");

		const promotionLoreSetting = new Setting(containerEl)
			.setName("Promotion lore path")
			.setDesc("Path where promoted lore content is created. Leave empty to disable promotion to lore.")
			.addText((text) => {
				text
					.setPlaceholder("Creative/Lore/")
					.setValue(settings.promotionLorePath || "")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							promotionLorePath: value,
						});
						this.updatePromotionPathValidation(promotionLoreSetting, value, "lore");
					});
			});
		
		this.updatePromotionPathValidation(promotionLoreSetting, settings.promotionLorePath || "", "lore");

		// Dashboard Customization
		containerEl.createEl("h3", { text: "Dashboard Customization" });

		new Setting(containerEl)
			.setName("Card Layout")
			.setDesc("Choose how cards are displayed on the dashboard")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("grid", "Grid")
					.addOption("list", "List")
					.setValue(settings.dashboardCardLayout || "grid")
					.onChange(async (value) => {
						await this.kernel.updateSettings({
							dashboardCardLayout: value as "grid" | "list",
						});
					});
			});

		// Card visibility toggles
		const cardIds = [
			{ id: "capture", name: "Capture" },
			{ id: "projectPulse", name: "Project Pulse" },
			{ id: "energy", name: "Energy System" },
			{ id: "context", name: "Today's Context" },
			{ id: "timeMachine", name: "Time Machine" },
			{ id: "loreEngine", name: "Lore Engine" },
			{ id: "realityMap", name: "Reality Map" },
			{ id: "promotion", name: "Promotion Flows" },
			{ id: "dreamBuffer", name: "Dream Buffer" },
			{ id: "thoughtRecycler", name: "Thought Recycler" },
			{ id: "promptForge", name: "Prompt Forge" },
			{ id: "assetBrain", name: "Asset Brain" },
			{ id: "dashboard", name: "Dashboard" },
			{ id: "modules", name: "Modules" },
			{ id: "frictionScanner", name: "Friction Scanner" },
		];

		containerEl.createEl("p", {
			text: "Show/Hide Cards:",
			cls: "setting-item-description",
		});

		for (const card of cardIds) {
			const isHidden = settings.dashboardHiddenCards?.includes(card.id) || false;
			new Setting(containerEl)
				.setName(card.name)
				.setDesc(`Show or hide the ${card.name} card on the dashboard`)
				.addToggle((toggle) => {
					toggle.setValue(!isHidden).onChange(async (value) => {
						const hiddenCards = settings.dashboardHiddenCards || [];
						if (value) {
							// Show card - remove from hidden list
							const updated = hiddenCards.filter(id => id !== card.id);
							await this.kernel.updateSettings({
								dashboardHiddenCards: updated,
							});
						} else {
							// Hide card - add to hidden list
							if (!hiddenCards.includes(card.id)) {
								await this.kernel.updateSettings({
									dashboardHiddenCards: [...hiddenCards, card.id],
								});
							}
						}
					});
				});
		}

		// Render layered control UI (global → feature → fine-grained)
		try {
			await this.renderLayeredControls(containerEl);
		} catch (error) {
			console.error("[Errl OS] Error rendering layered controls:", error);
			// Fallback: Show basic organ toggles
			this.renderBasicOrganToggles(containerEl);
		}
	}

	/**
	 * Render layered control UI (global → feature → fine-grained)
	 */
	private async renderLayeredControls(containerEl: HTMLElement): Promise<void> {
		const settings = this.kernel.getSettings();

		// Get all controls organized by level
		const { global, features } = await LayeredControlHelper.getAllControls(this.kernel);

		// Tier 1: Global Controls
		containerEl.createEl("h3", { text: "🌐 Global Controls", cls: "errl-settings-section-header" });
		containerEl.createEl("p", { 
			text: global.description, 
			cls: "errl-settings-section-desc" 
		});

		for (const control of global.controls) {
			this.renderControl(containerEl, control, settings);
		}

		// Divider
		containerEl.createEl("hr", { cls: "errl-settings-divider" });

		// Tier 2: Feature-Level Controls (Organs)
		containerEl.createEl("h3", { text: "⚙️ Organ Controls", cls: "errl-settings-section-header" });
		containerEl.createEl("p", { 
			text: "Enable or disable organs and configure basic settings", 
			cls: "errl-settings-section-desc" 
		});

		for (const feature of features) {
			const organId = feature.id;
			const isEnabled = settings.enabledOrgans[organId as keyof typeof settings.enabledOrgans];
			
			// Feature-level toggle (enable/disable)
			const featureSetting = new Setting(containerEl)
				.setName(feature.name)
				.setDesc(feature.description)
				.setClass(`errl-feature-control errl-feature-${organId}`)
				.addToggle((toggle) => {
					toggle.setValue(isEnabled || false).onChange(async (value) => {
						try {
							if (value) {
								await this.kernel.enableOrgan(organId);
							} else {
								await this.kernel.disableOrgan(organId);
							}
							// Refresh display to show updated state and enable/disable fine-grained controls
							this.display();
						} catch (error) {
							console.error(`[Errl OS] Error toggling ${organId}:`, error);
							new Notice(`Failed to ${value ? "enable" : "disable"} ${feature.name}`);
							// Reset toggle on error
							toggle.setValue(!value);
						}
					});
				});

			// Add help button
			const organInstance = this.kernel.getRegistry().get(organId) as Organ | undefined;
			if (organInstance) {
				try {
					createHelpButtonFromOrgan(featureSetting, this.app, organInstance as { getName: () => string; getDocumentation?: () => OrganDocumentation | undefined });
				} catch (err) {
					console.error(`[Errl OS] Error creating help button for ${organId}:`, err);
				}
			}

			// Tier 3: Fine-Grained Controls (only show if organ is enabled)
			if (isEnabled && feature.controls.length > 1) {
				// Create collapsible section for fine-grained controls
				const fineGrainedContainer = containerEl.createDiv({ 
					cls: `errl-fine-grained-controls errl-fine-grained-${organId}` 
				});
				
				// Collapsible header
				const collapsibleHeader = fineGrainedContainer.createDiv({ 
					cls: "errl-collapsible-header",
					text: `▶ ${feature.name} Settings`
				});
				collapsibleHeader.style.cursor = "pointer";
				collapsibleHeader.style.fontSize = "0.95rem";
				collapsibleHeader.style.color = "var(--text-muted)";
				collapsibleHeader.style.marginTop = "0.5rem";
				collapsibleHeader.style.marginBottom = "0.5rem";
				collapsibleHeader.style.padding = "0.5rem";
				collapsibleHeader.style.borderRadius = "4px";
				collapsibleHeader.style.backgroundColor = "var(--background-modifier-hover)";

				const fineGrainedContent = fineGrainedContainer.createDiv({ 
					cls: "errl-collapsible-content",
					attr: { style: "display: none; padding-left: 1.5rem; margin-top: 0.5rem;" }
				});

				let isExpanded = false;
				collapsibleHeader.onClickEvent(() => {
					isExpanded = !isExpanded;
					if (isExpanded) {
						fineGrainedContent.style.display = "block";
						collapsibleHeader.textContent = `▼ ${feature.name} Settings`;
					} else {
						fineGrainedContent.style.display = "none";
						collapsibleHeader.textContent = `▶ ${feature.name} Settings`;
					}
				});

				// Render fine-grained controls (skip the enable toggle, it's already shown)
				for (const control of feature.controls) {
					if (control.level === ControlLevel.FineGrained) {
						this.renderControl(fineGrainedContent, control, settings);
					}
				}
			}
		}
	}

	/**
	 * Render a single control item
	 */
	private renderControl(containerEl: HTMLElement, control: any, settings: ErrlSettings): void {
		const currentValue = this.getSettingValue(settings, control.settingKey || control.id);
		const resolvedValue = currentValue !== undefined ? currentValue : control.default;

		switch (control.type) {
			case "toggle":
				new Setting(containerEl)
					.setName(control.name)
					.setDesc(control.description)
					.addToggle((toggle) => {
						const initialValue = resolvedValue !== undefined ? resolvedValue : false;
						toggle.setValue(initialValue).onChange(async (value) => {
							await this.updateSetting(control.settingKey || control.id, value);
						});
					});
				break;

			case "input":
				new Setting(containerEl)
					.setName(control.name)
					.setDesc(control.description)
					.addText((text) => {
						const initialValue = resolvedValue !== undefined ? resolvedValue : "";
						text.setValue(String(initialValue)).onChange(async (value) => {
							await this.updateSetting(control.settingKey || control.id, value);
						});
					});
				break;

			case "slider":
				new Setting(containerEl)
					.setName(control.name)
					.setDesc(control.description)
					.addSlider((slider) => {
						const initialValue = resolvedValue !== undefined ? resolvedValue : control.min || 0;
						slider
							.setLimits(control.min || 0, control.max || 100, control.step || 1)
							.setValue(initialValue)
							.onChange(async (value) => {
								await this.updateSetting(control.settingKey || control.id, value);
							});
					});
				break;

			case "dropdown":
				new Setting(containerEl)
					.setName(control.name)
					.setDesc(control.description)
					.addDropdown((dropdown) => {
						if (control.options) {
							control.options.forEach((opt: { value: string; label: string }) => {
								dropdown.addOption(opt.value, opt.label);
							});
						}
						const initialValue = resolvedValue !== undefined ? resolvedValue : (control.options?.[0]?.value ?? "");
						dropdown.setValue(String(initialValue)).onChange(async (value) => {
							await this.updateSetting(control.settingKey || control.id, value);
						});
					});
				break;
		}
	}

	/**
	 * Get setting value from nested settings object
	 */
	private getSettingValue(settings: ErrlSettings, key: string): any {
		if (key.includes(".")) {
			const keys = key.split(".");
			let value: any = settings;
			for (const k of keys) {
				value = value?.[k as keyof typeof value];
				if (value === undefined) break;
			}
			return value;
		}
		return (settings as any)[key];
	}

	/**
	 * Update a setting value
	 */
	private async updateSetting(key: string, value: any): Promise<void> {
		if (key.includes(".")) {
			// Nested setting
			const keys = key.split(".");
			const update: any = {};
			let current = update;
			for (let i = 0; i < keys.length - 1; i++) {
				current[keys[i]] = {};
				current = current[keys[i]];
			}
			current[keys[keys.length - 1]] = value;
			await this.kernel.updateSettings(update);
		} else {
			await this.kernel.updateSettings({ [key]: value } as Partial<ErrlSettings>);
		}
	}

	/**
	 * Fallback: Render basic organ toggles (used if layered controls fail)
	 */
	private renderBasicOrganToggles(containerEl: HTMLElement): void {
		const settings = this.kernel.getSettings();
		containerEl.createEl("h3", { text: "Organs" });

		for (const organ of ORGAN_METADATA) {
			const isEnabled = settings.enabledOrgans[organ.id as keyof typeof settings.enabledOrgans];
			const description = `${organ.description} (${organ.phase})`;
			const setting = new Setting(containerEl)
				.setName(organ.name)
				.setDesc(description)
				.addToggle((toggle) => {
					toggle.setValue(isEnabled || false).onChange(async (value) => {
						try {
							if (value) {
								await this.kernel.enableOrgan(organ.id);
							} else {
								await this.kernel.disableOrgan(organ.id);
							}
							this.display();
						} catch (error) {
							console.error(`[Errl OS] Error toggling ${organ.id}:`, error);
							toggle.setValue(!value);
						}
					});
				});

			const organInstance = this.kernel.getRegistry().get(organ.id) as Organ | undefined;
			if (organInstance) {
				try {
					createHelpButtonFromOrgan(setting, this.app, organInstance as { getName: () => string; getDocumentation?: () => OrganDocumentation | undefined });
				} catch (err) {
					console.error(`[Errl OS] Error creating help button for ${organ.id}:`, err);
				}
			}
		}
	}

	/**
	 * Show path detection modal
	 */
	private showPathDetectionModal(): void {
		const detectedPaths = PathDetector.detectVaultStructure(this.app.vault);
		const modal = new PathDetectionModal(
			this.app,
			detectedPaths,
			async (selectedPaths: Map<string, string>) => {
				// Apply selected paths to settings
				const updates: Partial<ErrlSettings> = {};
				
				if (selectedPaths.has("projectPulsePath")) {
					updates.projectPulsePath = selectedPaths.get("projectPulsePath")!;
				}
				
				if (selectedPaths.has("loreEnginePaths")) {
					const paths = selectedPaths.get("loreEnginePaths")!.split(",").map(p => p.trim()).filter(p => p.length > 0);
					updates.loreEnginePaths = paths;
				}
				
				if (selectedPaths.has("captureFilePath")) {
					updates.captureFilePath = selectedPaths.get("captureFilePath")!;
				}
				
				if (selectedPaths.has("timeMachineLogPath")) {
					updates.timeMachineLogPath = selectedPaths.get("timeMachineLogPath")!;
				}
				
				if (selectedPaths.has("promotionProjectPath")) {
					updates.promotionProjectPath = selectedPaths.get("promotionProjectPath")!;
				}
				
				if (selectedPaths.has("promotionLorePath")) {
					updates.promotionLorePath = selectedPaths.get("promotionLorePath")!;
				}
				
				await this.kernel.updateSettings(updates);
				new Notice("Paths configured successfully!");
				this.display(); // Refresh settings display
			},
			() => {
				// Skip - do nothing
			}
		);
		modal.open();
	}

	/**
	 * Create folder for a path
	 */
	private async createFolderForPath(path: string): Promise<void> {
		try {
			await FileUtils.ensureDirectoryExists(this.app, path);
			new Notice(`Folder created: ${path}`);
			// Refresh validation
			this.display();
		} catch (error) {
			new Notice(`Failed to create folder: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Update Project Pulse path validation display
	 */
	private updateProjectPulseValidation(setting: Setting, path: string): void {
		const validation = PathValidator.validatePath(this.app.vault, path, false);
		let desc = "Path to scan for projects (folder containing project folders). Leave empty to disable.";
		
		if (path && !validation.exists) {
			const suggestions = PathValidator.suggestCommonPaths(this.app.vault);
			if (suggestions.length > 0) {
				desc += `\n⚠️ Path not found. Suggestions: ${suggestions.join(", ")}`;
			} else {
				desc += `\n⚠️ Path not found: "${path}"`;
			}
			// Add create folder button
			setting.addButton((button) => {
				button
					.setButtonText("Create Folder")
					.setCta()
					.onClick(async () => {
						await this.createFolderForPath(path);
					});
			});
		} else if (!path) {
			const suggestions = PathValidator.suggestCommonPaths(this.app.vault);
			if (suggestions.length > 0) {
				desc += `\n💡 Common locations: ${suggestions.join(", ")}`;
			}
		} else {
			// Path exists - remove any create button
			setting.setDesc(desc);
		}
		
		setting.setDesc(desc);
	}

	/**
	 * Update Lore Engine paths validation display
	 */
	private updateLoreEnginePathsValidation(setting: Setting, paths: string[]): void {
		let desc = "Comma-separated paths to scan for lore entities. Leave empty to disable.";
		
		if (paths.length > 0) {
			const invalidPaths: string[] = [];
			for (const path of paths) {
				const validation = PathValidator.validatePath(this.app.vault, path, false);
				if (!validation.exists) {
					invalidPaths.push(path);
				}
			}
			
			if (invalidPaths.length > 0) {
				const suggestions = PathValidator.suggestLorePaths(this.app.vault);
				if (suggestions.length > 0) {
					desc += `\n⚠️ Some paths not found. Suggestions: ${suggestions.join(", ")}`;
				} else {
					desc += `\n⚠️ Paths not found: ${invalidPaths.join(", ")}`;
				}
			}
		} else {
			const suggestions = PathValidator.suggestLorePaths(this.app.vault);
			if (suggestions.length > 0) {
				desc += `\n💡 Common locations: ${suggestions.join(", ")}`;
			}
		}
		
		setting.setDesc(desc);
	}

	/**
	 * Update Promotion path validation display
	 */
	private updatePromotionPathValidation(setting: Setting, path: string, type: "project" | "lore"): void {
		const validation = PathValidator.validatePath(this.app.vault, path, false);
		let desc = type === "project" 
			? "Path where promoted projects are created. Leave empty to disable promotion to projects."
			: "Path where promoted lore content is created. Leave empty to disable promotion to lore.";
		
		if (path && !validation.exists) {
			const suggestions = type === "project" 
				? PathValidator.suggestCommonPaths(this.app.vault)
				: PathValidator.suggestLorePaths(this.app.vault);
			if (suggestions.length > 0) {
				desc += `\n⚠️ Path not found. Suggestions: ${suggestions.join(", ")}`;
			} else {
				desc += `\n⚠️ Path not found: "${path}"`;
			}
			// Add create folder button
			setting.addButton((button) => {
				button
					.setButtonText("Create Folder")
					.setCta()
					.onClick(async () => {
						await this.createFolderForPath(path);
					});
			});
		} else if (!path) {
			const suggestions = type === "project" 
				? PathValidator.suggestCommonPaths(this.app.vault)
				: PathValidator.suggestLorePaths(this.app.vault);
			if (suggestions.length > 0) {
				desc += `\n💡 Common locations: ${suggestions.join(", ")}`;
			}
		} else {
			// Path exists - remove any create button
			setting.setDesc(desc);
		}
		
		setting.setDesc(desc);
	}
}
