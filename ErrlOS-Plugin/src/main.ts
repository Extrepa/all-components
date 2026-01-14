import { Plugin } from "obsidian";
import { ErrlKernel } from "./kernel/ErrlKernel";
import { ORGANS } from "./organs";
import { ErrlSettingsTab } from "./settings/ErrlSettingsTab";
import { FirstRunWizard } from "./settings/FirstRunWizard";

/**
 * Errl OS Plugin - Main entry point
 * A modular creative operating system for Obsidian
 */
export default class ErrlOSPlugin extends Plugin {
	private kernel: ErrlKernel | null = null;

	async onload() {
		console.log("Loading Errl OS plugin");

		// Initialize kernel
		this.kernel = new ErrlKernel(this, this.app);

		// Register all known organs
		for (const organMetadata of ORGANS) {
			this.kernel.registerOrgan(organMetadata.create(this.kernel, this));
		}

		// Initialize kernel (loads settings and enables organs)
		await this.kernel.initialize();

		// Add settings tab
		this.addSettingTab(new ErrlSettingsTab(this.app, this, this.kernel));

		// Show first-run wizard if this is the first run
		this.app.workspace.onLayoutReady(() => {
			if (this.kernel && this.kernel.isFirstRun()) {
				const wizard = new FirstRunWizard(this.app, this.kernel);
				wizard.open();
			}
		});

		console.log("Errl OS plugin loaded");
	}

	async onunload() {
		console.log("Unloading Errl OS plugin");

		if (this.kernel) {
			await this.kernel.unload();
		}

		console.log("Errl OS plugin unloaded");
	}
}
