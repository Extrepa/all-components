import { App, Modal, Setting } from "obsidian";

/**
 * Modal for capturing thoughts with zero friction
 */
export class CaptureModal extends Modal {
	private text: string = "";
	private tag: string = "";
	private onSubmit: (text: string, tag?: string) => void;

	constructor(app: App, onSubmit: (text: string, tag?: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("errl-os-capture-modal");

		contentEl.createEl("h2", { text: "Capture Thought" });

		new Setting(contentEl)
			.setName("Thought")
			.addTextArea((text) => {
				text
					.setPlaceholder("Dump your thoughts here...")
					.setValue(this.text)
					.onChange((value) => {
						this.text = value;
					});
				text.inputEl.rows = 8;
				text.inputEl.style.width = "100%";
			});

		new Setting(contentEl)
			.setName("Tag (optional)")
			.addText((text) => {
				text
					.setPlaceholder("idea, todo, note...")
					.setValue(this.tag)
					.onChange((value) => {
						this.tag = value;
					});
			});

		new Setting(contentEl).addButton((button) => {
			button
				.setButtonText("Capture")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.text, this.tag || undefined);
				});
		});

		// Focus the textarea
		const textarea = contentEl.querySelector("textarea");
		if (textarea) {
			textarea.focus();
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

