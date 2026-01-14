import { App, Modal, TextAreaComponent, ButtonComponent } from "obsidian";

/**
 * Dream Buffer Modal - Logic-free capture interface
 * No structure, no tags, just raw creative input
 */
export class DreamBufferModal extends Modal {
	private onSubmit: (content: string) => void;

	constructor(app: App, onSubmit: (content: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Minimal, dream-like styling
		contentEl.addClass("dream-buffer-modal");

		contentEl.createEl("h2", { text: "💭 Dream Buffer" });
		contentEl.createEl("p", { 
			text: "No structure. No tags. Just raw thoughts and imagery.",
			cls: "dream-buffer-subtitle"
		});

		const textArea = new TextAreaComponent(contentEl);
		textArea.setPlaceholder("Let your thoughts flow...");
		textArea.inputEl.rows = 15;
		textArea.inputEl.style.width = "100%";
		textArea.inputEl.style.minHeight = "300px";
		textArea.inputEl.style.fontSize = "16px";
		textArea.inputEl.style.fontFamily = "inherit";
		textArea.inputEl.style.border = "none";
		textArea.inputEl.style.background = "transparent";
		textArea.inputEl.style.resize = "vertical";

		const buttonContainer = contentEl.createEl("div", { cls: "dream-buffer-buttons" });

		const captureButton = new ButtonComponent(buttonContainer);
		captureButton.setButtonText("Capture Dream").setCta().onClick(() => {
			const content = textArea.getValue().trim();
			if (content) {
				this.onSubmit(content);
				this.close();
			}
		});

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText("Cancel").onClick(() => {
			this.close();
		});

		// Focus text area
		setTimeout(() => {
			textArea.inputEl.focus();
		}, 100);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.removeClass("dream-buffer-modal");
	}
}

