import { Modal, App } from "obsidian";
import { ErrlKernel } from "../kernel/ErrlKernel";
import { Organ } from "../organs/base/Organ";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";

/**
 * Command information for display
 */
interface CommandInfo {
	organId: string;
	organName: string;
	commandId: string;
	commandName: string;
	description: string;
	hotkeys?: string[];
	capabilityName?: string;
}

/**
 * Command Help Modal - Shows all available commands with search/filter
 */
export class CommandHelpModal extends Modal {
	private kernel: ErrlKernel;
	private commands: CommandInfo[] = [];

	constructor(app: App, kernel: ErrlKernel) {
		super(app);
		this.kernel = kernel;
		this.collectCommands();
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("errl-command-help-modal");

		// Title
		contentEl.createEl("h2", { text: "Errl OS Commands" });
		contentEl.createEl("p", { 
			text: "All available commands from enabled organs. Use the search box to filter.",
			cls: "errl-command-help-intro"
		});

		// Search box
		const searchContainer = contentEl.createEl("div", { cls: "errl-command-search-container" });
		const searchInput = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Search commands...",
			cls: "errl-command-search-input"
		});

		// Filter by organ
		const filterContainer = contentEl.createEl("div", { cls: "errl-command-filter-container" });
		filterContainer.createEl("label", { text: "Filter by organ:", cls: "errl-command-filter-label" });
		const organFilter = filterContainer.createEl("select", { cls: "errl-command-filter-select" });
		organFilter.createEl("option", { text: "All organs", value: "" });
		
		const uniqueOrgans = Array.from(new Set(this.commands.map(c => c.organName))).sort();
		uniqueOrgans.forEach(organName => {
			organFilter.createEl("option", { text: organName, value: organName });
		});

		// Commands container
		const commandsContainer = contentEl.createEl("div", { cls: "errl-commands-container" });

		// Render function
		const renderCommands = (filteredCommands: CommandInfo[]) => {
			commandsContainer.empty();

			if (filteredCommands.length === 0) {
				commandsContainer.createEl("p", { 
					text: "No commands found matching your search.",
					cls: "errl-command-help-empty"
				});
				return;
			}

			// Group by organ
			const byOrgan: Record<string, CommandInfo[]> = {};
			filteredCommands.forEach(cmd => {
				if (!byOrgan[cmd.organName]) {
					byOrgan[cmd.organName] = [];
				}
				byOrgan[cmd.organName].push(cmd);
			});

			// Render each organ's commands
			Object.keys(byOrgan).sort().forEach(organName => {
				const organSection = commandsContainer.createEl("div", { cls: "errl-command-organ-section" });
				organSection.createEl("h3", { text: organName, cls: "errl-command-organ-title" });

				const commandsList = organSection.createEl("ul", { cls: "errl-command-list" });
				byOrgan[organName].forEach(cmd => {
					const li = commandsList.createEl("li", { cls: "errl-command-item" });
					
					// Command name
					const nameEl = li.createEl("div", { cls: "errl-command-name" });
					nameEl.createEl("strong", { text: cmd.commandName });
					
					// Command ID (smaller, muted)
					li.createEl("div", { 
						text: `ID: ${cmd.commandId}`,
						cls: "errl-command-id"
					});

					// Description
					if (cmd.description) {
						li.createEl("div", { 
							text: cmd.description,
							cls: "errl-command-description"
						});
					}

					// Hotkeys
					if (cmd.hotkeys && cmd.hotkeys.length > 0) {
						const hotkeyEl = li.createEl("div", { cls: "errl-command-hotkeys" });
						hotkeyEl.createEl("span", { text: "Hotkeys: " });
						cmd.hotkeys.forEach((hotkey, idx) => {
							hotkeyEl.createEl("kbd", { text: hotkey });
							if (idx < cmd.hotkeys!.length - 1) {
								hotkeyEl.createEl("span", { text: " or " });
							}
						});
					}

					// Capability name (if different from command name)
					if (cmd.capabilityName && cmd.capabilityName !== cmd.commandName) {
						li.createEl("div", { 
							text: `Capability: ${cmd.capabilityName}`,
							cls: "errl-command-capability"
						});
					}
				});
			});
		};

		// Initial render
		renderCommands(this.commands);

		// Search handler
		searchInput.addEventListener("input", (e) => {
			const query = (e.target as HTMLInputElement).value.toLowerCase();
			const organFilterValue = organFilter.value;
			
			const filtered = this.commands.filter(cmd => {
				const matchesSearch = !query || 
					cmd.commandName.toLowerCase().includes(query) ||
					cmd.description.toLowerCase().includes(query) ||
					cmd.commandId.toLowerCase().includes(query) ||
					cmd.organName.toLowerCase().includes(query);
				
				const matchesOrgan = !organFilterValue || cmd.organName === organFilterValue;
				
				return matchesSearch && matchesOrgan;
			});
			
			renderCommands(filtered);
		});

		// Organ filter handler
		organFilter.addEventListener("change", () => {
			const query = searchInput.value.toLowerCase();
			const organFilterValue = organFilter.value;
			
			const filtered = this.commands.filter(cmd => {
				const matchesSearch = !query || 
					cmd.commandName.toLowerCase().includes(query) ||
					cmd.description.toLowerCase().includes(query) ||
					cmd.commandId.toLowerCase().includes(query) ||
					cmd.organName.toLowerCase().includes(query);
				
				const matchesOrgan = !organFilterValue || cmd.organName === organFilterValue;
				
				return matchesSearch && matchesOrgan;
			});
			
			renderCommands(filtered);
		});

		// Stats
		contentEl.createEl("div", { 
			text: `Total: ${this.commands.length} commands from ${uniqueOrgans.length} organs`,
			cls: "errl-command-help-stats"
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.removeClass("errl-command-help-modal");
	}

	/**
	 * Collect all commands from all enabled organs
	 */
	private collectCommands(): void {
		const allOrgans = this.kernel.getRegistry().getAll();
		
		for (const organ of allOrgans) {
			if (!this.kernel.isOrganEnabled(organ.getId())) {
				continue; // Skip disabled organs
			}

			const documentation = organ.getDocumentation?.();
			if (!documentation || !documentation.capabilities) {
				continue;
			}

			// Extract commands from capabilities
			documentation.capabilities.forEach(cap => {
				if (cap.commands && cap.commands.length > 0) {
					cap.commands.forEach(commandId => {
						// Try to get command name from Obsidian's command registry
						const commandName = this.getCommandName(commandId, cap.name);
						
						this.commands.push({
							organId: organ.getId(),
							organName: organ.getName(),
							commandId: commandId,
							commandName: commandName,
							description: cap.description,
							hotkeys: cap.hotkeys,
							capabilityName: cap.name,
						});
					});
				}
			});
		}

		// Sort by organ name, then command name
		this.commands.sort((a, b) => {
			if (a.organName !== b.organName) {
				return a.organName.localeCompare(b.organName);
			}
			return a.commandName.localeCompare(b.commandName);
		});
	}

	/**
	 * Get command name from Obsidian's command registry or use capability name
	 */
	private getCommandName(commandId: string, capabilityName: string): string {
		try {
			// Try to get from Obsidian's command registry
			const commands = (this.app as any).commands;
			if (commands) {
				// Command ID format: "errl-os:command-id" or just "command-id"
				const fullId = commandId.includes(":") ? commandId : `errl-os:${commandId}`;
				const command = commands.findCommand?.(fullId);
				if (command && command.name) {
					return command.name;
				}
			}
		} catch (error) {
			// Fall through to capability name
		}

		// Fallback to capability name or formatted command ID
		if (capabilityName) {
			return capabilityName;
		}

		// Format command ID as name
		return commandId
			.split(/[-_]/)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}
}

