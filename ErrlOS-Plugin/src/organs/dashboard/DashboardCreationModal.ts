import { Modal, Setting, App } from "obsidian";

/**
 * Modal asking for consent before creating dashboard file
 */
export class DashboardCreationModal extends Modal {
	private dashboardPath: string;
	private onConsent: (create: boolean, customPath?: string) => void;
	private createConsented: boolean = false;

	constructor(
		app: App,
		dashboardPath: string,
		onConsent: (create: boolean, customPath?: string) => void
	) {
		super(app);
		this.dashboardPath = dashboardPath;
		this.onConsent = onConsent;
	}

	onOpen(): void {
		const { contentEl, titleEl } = this;
		titleEl.setText("Create Dashboard File?");

		contentEl.createEl("p", {
			text: `The Dashboard file doesn't exist at: ${this.dashboardPath}`,
		});

		contentEl.createEl("p", {
			text: "The Dashboard organ needs this file to display the Errl OS dashboard. Would you like to create it?",
		});

		contentEl.createEl("h4", { text: "What will be created:" });
		const list = contentEl.createEl("ul");
		list.createEl("li", {
			text: `A markdown file at: ${this.dashboardPath}`,
		});
		list.createEl("li", {
			text: "Parent directories will be created if they don't exist",
		});
		list.createEl("li", {
			text: "The file will contain the Errl OS dashboard with organ cards and system information",
		});

		const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });

		new Setting(buttonContainer)
			.addButton((button) => {
				button.setButtonText("Cancel").onClick(() => {
					this.onConsent(false);
					this.close();
				});
			})
			.addButton((button) => {
				button
					.setButtonText("Create")
					.setCta()
					.onClick(() => {
						this.onConsent(true);
						this.close();
					});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		if (!this.createConsented) {
			this.onConsent(false);
		}
	}
}

