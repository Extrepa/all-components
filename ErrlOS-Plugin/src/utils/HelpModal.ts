import { Modal, App } from "obsidian";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";

/**
 * Help Modal - Displays organ documentation in a user-friendly format
 */
export class HelpModal extends Modal {
	private documentation: OrganDocumentation;
	private organName: string;

	constructor(app: App, organName: string, documentation: OrganDocumentation) {
		super(app);
		this.organName = organName;
		this.documentation = documentation;
	}

	onOpen(): void {
		const { contentEl, titleEl } = this;
		titleEl.setText(`${this.organName} - Help & Documentation`);
		contentEl.addClass("errl-help-modal");

		this.renderDocumentation(contentEl);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.removeClass("errl-help-modal");
	}

	private renderDocumentation(contentEl: HTMLElement): void {
		const { documentation } = this;

		// Purpose
		contentEl.createEl("h2", { text: "Purpose" });
		contentEl.createEl("p", { text: documentation.purpose, cls: "errl-help-purpose" });
		contentEl.createEl("p", { text: documentation.description, cls: "errl-help-description" });
		contentEl.createEl("div", { cls: "errl-help-divider" });

		// Phase
		contentEl.createEl("h3", { text: "Phase" });
		contentEl.createEl("p", { text: documentation.phase });

		// Capabilities
		if (documentation.capabilities && documentation.capabilities.length > 0) {
			contentEl.createEl("h3", { text: "Capabilities" });
			const capabilitiesList = contentEl.createEl("ul", { cls: "errl-help-capabilities" });
			documentation.capabilities.forEach(cap => {
				const li = capabilitiesList.createEl("li");
				li.createEl("strong", { text: cap.name + ": " });
				li.createEl("span", { text: cap.description });
				if (cap.commands && cap.commands.length > 0) {
					const cmdList = li.createEl("ul", { cls: "errl-help-commands" });
					cap.commands.forEach(cmd => {
						cmdList.createEl("li", { text: `Command: ${cmd}` });
					});
				}
				if (cap.hotkeys && cap.hotkeys.length > 0) {
					const hotkeyList = li.createEl("ul", { cls: "errl-help-hotkeys" });
					cap.hotkeys.forEach(hk => {
						hotkeyList.createEl("li", { text: `Hotkey: ${hk}` });
					});
				}
			});
		}

		// File Operations
		if (documentation.fileOperations && documentation.fileOperations.length > 0) {
			contentEl.createEl("h3", { text: "File Operations" });
			const fileOpsList = contentEl.createEl("ul", { cls: "errl-help-file-ops" });
			documentation.fileOperations.forEach(op => {
				const li = fileOpsList.createEl("li");
				li.createEl("strong", { text: `${op.type.toUpperCase()}: ` });
				li.createEl("code", { text: op.path });
				li.createEl("p", { text: `When: ${op.when}`, cls: "errl-help-when" });
				li.createEl("p", { text: `User Control: ${op.userControl}`, cls: "errl-help-control" });
				if (op.example) {
					li.createEl("p", { text: `Example: ${op.example}`, cls: "errl-help-example" });
				}
			});
		}

		// Background Processes
		if (documentation.backgroundProcesses && documentation.backgroundProcesses.length > 0) {
			contentEl.createEl("h3", { text: "Background Processes" });
			const bgList = contentEl.createEl("ul", { cls: "errl-help-background" });
			documentation.backgroundProcesses.forEach(proc => {
				const li = bgList.createEl("li");
				li.createEl("strong", { text: proc.name + ": " });
				li.createEl("span", { text: proc.description });
				if (proc.interval) {
					li.createEl("span", { text: ` (Runs every ${proc.interval}ms)`, cls: "errl-help-interval" });
				}
				li.createEl("span", { text: ` [${proc.resourceUsage} resource usage]`, cls: "errl-help-resources" });
				if (proc.canDisable) {
					li.createEl("span", { text: " [Can be disabled]", cls: "errl-help-disableable" });
				}
				if (proc.startStop) {
					li.createEl("span", { text: " [Start/Stop available]", cls: "errl-help-startstop" });
				}
			});
		}

		// Settings
		if (documentation.settings && documentation.settings.length > 0) {
			contentEl.createEl("h3", { text: "Settings" });
			const settingsList = contentEl.createEl("ul", { cls: "errl-help-settings" });
			documentation.settings.forEach(setting => {
				const li = settingsList.createEl("li");
				li.createEl("strong", { text: `${setting.name} (${setting.key}): ` });
				li.createEl("span", { text: setting.description });
				li.createEl("p", { text: `Default: ${JSON.stringify(setting.default)}`, cls: "errl-help-default" });
				if (setting.affects && setting.affects.length > 0) {
					const affectsList = li.createEl("ul", { cls: "errl-help-affects" });
					setting.affects.forEach(affect => {
						affectsList.createEl("li", { text: affect });
					});
				}
			});
		}

		// Use Cases
		if (documentation.useCases && documentation.useCases.length > 0) {
			contentEl.createEl("h3", { text: "Use Cases" });
			documentation.useCases.forEach((useCase, index) => {
				contentEl.createEl("h4", { text: `${index + 1}. ${useCase.scenario}` });
				contentEl.createEl("p", { text: `Expected Outcome: ${useCase.expectedOutcome}`, cls: "errl-help-outcome" });
				const stepsList = contentEl.createEl("ol", { cls: "errl-help-steps" });
				useCase.steps.forEach(step => {
					stepsList.createEl("li", { text: step });
				});
			});
		}

		// Common Issues
		if (documentation.commonIssues && documentation.commonIssues.length > 0) {
			contentEl.createEl("h3", { text: "Troubleshooting" });
			documentation.commonIssues.forEach(issue => {
				contentEl.createEl("h4", { text: issue.problem });
				contentEl.createEl("p", { text: `Cause: ${issue.cause}`, cls: "errl-help-cause" });
				contentEl.createEl("p", { text: `Solution: ${issue.solution}`, cls: "errl-help-solution" });
			});
		}

		// Dependencies
		if (documentation.dependencies) {
			contentEl.createEl("h3", { text: "Dependencies" });
			if (documentation.dependencies.required && documentation.dependencies.required.length > 0) {
				contentEl.createEl("p", { text: "Required: " + documentation.dependencies.required.join(", ") });
			}
			if (documentation.dependencies.optional && documentation.dependencies.optional.length > 0) {
				contentEl.createEl("p", { text: "Optional: " + documentation.dependencies.optional.join(", ") });
			}
			if (documentation.dependencies.conflicts && documentation.dependencies.conflicts.length > 0) {
				contentEl.createEl("p", { text: "Conflicts: " + documentation.dependencies.conflicts.join(", "), cls: "errl-help-conflicts" });
			}
		}

		// Monitoring
		if (documentation.monitoring && documentation.monitoring.length > 0) {
			contentEl.createEl("h3", { text: "What This Organ Monitors" });
			const monitorList = contentEl.createEl("ul", { cls: "errl-help-monitoring" });
			documentation.monitoring.forEach(mon => {
				const li = monitorList.createEl("li");
				li.createEl("strong", { text: `What: ${mon.what}` });
				li.createEl("p", { text: `Why: ${mon.why}`, cls: "errl-help-why" });
				li.createEl("p", { text: `How: ${mon.how}`, cls: "errl-help-how" });
				li.createEl("p", { text: `User Control: ${mon.userControl}`, cls: "errl-help-control" });
			});
		}
	}
}

