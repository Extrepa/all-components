import { App, Modal, Setting } from "obsidian";
import { AssetInfo } from "./AssetBrainOrgan";

/**
 * Modal for displaying asset list with filtering and search
 */
export class AssetListModal extends Modal {
	private assets: AssetInfo[];
	private filteredAssets: AssetInfo[];
	private searchQuery: string = "";
	private filterType: "all" | "svg" | "image" | "shader" | "code" = "all";

	constructor(app: App, assets: AssetInfo[]) {
		super(app);
		this.assets = assets;
		this.filteredAssets = assets;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("errl-os-asset-modal");

		// Title
		contentEl.createEl("h2", { text: `Asset Brain (${this.assets.length} assets)` });

		// Search and filter controls
		const controlsDiv = contentEl.createDiv("errl-asset-controls");
		
		new Setting(controlsDiv)
			.setName("Search")
			.setDesc("Search by name or path")
			.addText((text) => {
				text
					.setPlaceholder("Search assets...")
					.setValue(this.searchQuery)
					.onChange((value) => {
						this.searchQuery = value.toLowerCase();
						this.applyFilters();
					});
			});

		new Setting(controlsDiv)
			.setName("Filter by Type")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("all", "All Types")
					.addOption("svg", "SVG")
					.addOption("image", "Images")
					.addOption("shader", "Shaders")
					.addOption("code", "Code")
					.setValue(this.filterType)
					.onChange((value) => {
						this.filterType = value as any;
						this.applyFilters();
					});
			});

		// Asset list
		const listDiv = contentEl.createDiv("errl-asset-list");
		this.renderAssetList(listDiv);
	}

	private applyFilters(): void {
		this.filteredAssets = this.assets.filter(asset => {
			// Type filter
			if (this.filterType !== "all" && asset.type !== this.filterType) {
				return false;
			}

			// Search filter
			if (this.searchQuery) {
				const query = this.searchQuery.toLowerCase();
				return asset.name.toLowerCase().includes(query) ||
					asset.path.toLowerCase().includes(query);
			}

			return true;
		});

		// Re-render list
		const listDiv = this.contentEl.querySelector(".errl-asset-list");
		if (listDiv) {
			listDiv.empty();
			this.renderAssetList(listDiv as HTMLDivElement);
		}
	}

	private renderAssetList(container: HTMLDivElement): void {
		if (this.filteredAssets.length === 0) {
			container.createEl("p", {
				text: "No assets found matching your filters.",
				cls: "errl-asset-empty"
			});
			return;
		}

		// Create table
		const table = container.createEl("table", { cls: "errl-asset-table" });
		
		// Header
		const header = table.createEl("thead");
		const headerRow = header.createEl("tr");
		headerRow.createEl("th", { text: "Type" });
		headerRow.createEl("th", { text: "Name" });
		headerRow.createEl("th", { text: "Path" });
		headerRow.createEl("th", { text: "Usage" });
		headerRow.createEl("th", { text: "Actions" });

		// Body
		const body = table.createEl("tbody");
		
		for (const asset of this.filteredAssets) {
			const row = body.createEl("tr");
			
			// Type
			const typeCell = row.createEl("td");
			const typeBadge = typeCell.createEl("span", {
				text: asset.type.toUpperCase(),
				cls: `errl-asset-type errl-asset-type-${asset.type}`
			});

			// Name
			row.createEl("td", { text: asset.name });

			// Path
			const pathCell = row.createEl("td");
			const pathLink = pathCell.createEl("a", {
				text: asset.path,
				cls: "errl-asset-path"
			});
			pathLink.onclick = () => {
				this.openAsset(asset.path);
			};

			// Usage count
			row.createEl("td", { text: asset.usageCount.toString() });

			// Actions
			const actionsCell = row.createEl("td");
			const openButton = actionsCell.createEl("button", {
				text: "Open",
				cls: "mod-cta"
			});
			openButton.onclick = () => {
				this.openAsset(asset.path);
			};
		}

		// Summary
		container.createEl("p", {
			text: `Showing ${this.filteredAssets.length} of ${this.assets.length} assets`,
			cls: "errl-asset-summary"
		});
	}

	private async openAsset(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof require("obsidian").TFile) {
			await this.app.workspace.openLinkText(path, "", true);
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

