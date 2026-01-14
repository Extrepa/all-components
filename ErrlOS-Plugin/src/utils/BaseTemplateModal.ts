import { Modal, Setting, App } from "obsidian";
import { BaseTemplateManager } from "./BaseTemplateManager";
import { BaseTemplate } from "./BaseTemplate";
import { Notice } from "obsidian";

/**
 * Base Template Management Modal
 * Allows users to view, create, edit, and delete Base templates
 */
export class BaseTemplateModal extends Modal {
	private onTemplateSelected?: (template: BaseTemplate) => void;

	constructor(app: App, onTemplateSelected?: (template: BaseTemplate) => void) {
		super(app);
		this.onTemplateSelected = onTemplateSelected;
	}

	onOpen(): void {
		this.modalEl.addClass("errl-template-modal");
		this.render();
	}

	private async render(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();

		// Header
		contentEl.createEl("h2", { 
			text: "Base Templates",
			cls: "errl-modal-header"
		});
		contentEl.createEl("p", {
			text: "Manage Base templates for creating new Bases",
			cls: "errl-modal-subheader"
		});

		// Get templates
		const templates = await BaseTemplateManager.listTemplates(this.app);

		// Group by category
		const organTemplates = templates.filter(t => t.category === "organ");
		const customTemplates = templates.filter(t => t.category === "custom");

		// Organ Templates Section
		if (organTemplates.length > 0) {
			contentEl.createEl("h3", { text: "Organ Templates", cls: "errl-template-section-title" });
			contentEl.createEl("p", {
				text: "Pre-configured templates for ErrlOS organs",
				cls: "errl-template-section-desc"
			});

			for (const template of organTemplates) {
				this.renderTemplateItem(contentEl, template, false);
			}
		}

		// Custom Templates Section
		if (customTemplates.length > 0) {
			contentEl.createEl("hr", { cls: "errl-settings-divider" });
			contentEl.createEl("h3", { text: "Custom Templates", cls: "errl-template-section-title" });
			contentEl.createEl("p", {
				text: "Your custom Base templates",
				cls: "errl-template-section-desc"
			});

			for (const template of customTemplates) {
				this.renderTemplateItem(contentEl, template, true);
			}
		}

		// Actions
		contentEl.createEl("hr", { cls: "errl-settings-divider" });
		const actionsContainer = contentEl.createDiv({ cls: "errl-template-actions" });

		new Setting(actionsContainer)
			.addButton((button) => {
				button
					.setButtonText("Close")
					.setCta()
					.onClick(() => {
						this.close();
					});
			});
	}

	private renderTemplateItem(container: HTMLElement, template: BaseTemplate, isCustom: boolean): void {
		const itemContainer = container.createDiv({ cls: "errl-template-item" });
		
		// Template info
		const infoContainer = itemContainer.createDiv({ cls: "errl-template-info" });
		infoContainer.createEl("h4", { text: template.name, cls: "errl-template-name" });
		infoContainer.createEl("p", { text: template.description, cls: "errl-template-desc" });

		// Actions
		const actionsContainer = itemContainer.createDiv({ cls: "errl-template-item-actions" });
		
		if (this.onTemplateSelected) {
			new Setting(actionsContainer)
				.addButton((button) => {
					button
						.setButtonText("Use Template")
						.setCta()
						.onClick(() => {
							this.onTemplateSelected!(template);
							this.close();
						});
				});
		}

		if (isCustom) {
			new Setting(actionsContainer)
				.addButton((button) => {
					button
						.setButtonText("Delete")
						.setIcon("trash")
						.onClick(async () => {
							try {
								await BaseTemplateManager.deleteCustomTemplate(this.app, template.id);
								new Notice(`Template "${template.name}" deleted`);
								this.render(); // Refresh
							} catch (error) {
								new Notice(`Failed to delete template: ${error}`);
							}
						});
				});
		}
	}
}

