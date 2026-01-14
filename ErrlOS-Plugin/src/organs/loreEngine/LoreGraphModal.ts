import { Modal, App } from "obsidian";
import { LoreEntity } from "./LoreEntity";
import { LoreEngineOrgan } from "./LoreEngineOrgan";
import { LoreRelationship } from "./LoreRelationship";

/**
 * Lore Graph Modal
 * Displays a visual relationship graph for lore entities
 */
export class LoreGraphModal extends Modal {
	private entities: LoreEntity[];
	private organ: LoreEngineOrgan;
	private selectedEntity: LoreEntity | null = null;
	private minStrength: number = 20;

	constructor(app: App, entities: LoreEntity[], organ: LoreEngineOrgan) {
		super(app);
		this.entities = entities;
		this.organ = organ;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Lore Relationship Graph" });

		// Entity selector
		const entitySelector = contentEl.createDiv();
		entitySelector.createEl("label", { text: "Select Entity:", attr: { for: "entity-select" } });
		const select = entitySelector.createEl("select", { attr: { id: "entity-select" } });
		
		select.createEl("option", { text: "All Entities", attr: { value: "" } });
		for (const entity of this.entities) {
			select.createEl("option", { text: `${entity.name} (${entity.type})`, attr: { value: entity.id } });
		}

		select.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			if (target.value) {
				this.selectedEntity = this.entities.find(e => e.id === target.value) || null;
			} else {
				this.selectedEntity = null;
			}
			this.renderGraph();
		});

		// Strength filter
		const strengthFilter = contentEl.createDiv();
		strengthFilter.createEl("label", { text: "Minimum Relationship Strength:", attr: { for: "strength-filter" } });
		const strengthInput = strengthFilter.createEl("input", {
			attr: {
				id: "strength-filter",
				type: "number",
				min: "0",
				max: "100",
				value: this.minStrength.toString(),
			},
		});

		strengthInput.addEventListener("change", (e) => {
			const target = e.target as HTMLInputElement;
			this.minStrength = parseInt(target.value) || 0;
			this.renderGraph();
		});

		// Graph container
		const graphContainer = contentEl.createDiv({ cls: "lore-graph-container" });
		graphContainer.id = "lore-graph";

		this.renderGraph();
	}

	private renderGraph(): void {
		const graphContainer = document.getElementById("lore-graph");
		if (!graphContainer) return;

		graphContainer.empty();

		if (this.selectedEntity) {
			// Show relationships for selected entity
			const relationships = this.organ.getRelatedEntities(this.selectedEntity.name, this.minStrength);
			
			graphContainer.createEl("h3", { text: `Relationships for ${this.selectedEntity.name}` });
			
			if (relationships.length === 0) {
				graphContainer.createEl("p", { text: "No relationships found above the minimum strength threshold." });
				return;
			}

			// Create relationship list
			const list = graphContainer.createEl("ul", { cls: "lore-relationship-list" });
			
			for (const rel of relationships) {
				const entity = this.entities.find(e => e.id === rel.entity2);
				if (!entity) continue;

				const listItem = list.createEl("li", { cls: "lore-relationship-item" });
				
				// Entity name and type
				const entityInfo = listItem.createDiv({ cls: "relationship-entity" });
				entityInfo.createEl("strong", { text: entity.name });
				entityInfo.createEl("span", { text: ` (${entity.type})`, cls: "entity-type" });

				// Relationship strength bar
				const strengthBar = listItem.createDiv({ cls: "relationship-strength" });
				const bar = strengthBar.createDiv({ cls: "strength-bar" });
				bar.style.width = `${rel.strength}%`;
				strengthBar.createEl("span", { text: `${rel.strength}%`, cls: "strength-value" });

				// Relationship type
				listItem.createEl("div", { text: `Type: ${rel.type}`, cls: "relationship-type" });

				// Details
				if (rel.details) {
					listItem.createEl("div", { text: rel.details, cls: "relationship-details" });
				}

				// Click to open entity
				listItem.style.cursor = "pointer";
				listItem.addEventListener("click", () => {
					this.app.workspace.openLinkText(entity.path, "", true);
				});
			}
		} else {
			// Show all entities with their relationship counts
			graphContainer.createEl("h3", { text: "All Entities" });
			
			const entityList = graphContainer.createEl("ul", { cls: "lore-entity-list" });
			
			for (const entity of this.entities) {
				const relationships = this.organ.getRelatedEntities(entity.name, this.minStrength);
				
				const listItem = entityList.createEl("li", { cls: "lore-entity-item" });
				listItem.createEl("strong", { text: entity.name });
				listItem.createEl("span", { text: ` (${entity.type}) - ${relationships.length} relationships`, cls: "entity-info" });
				
				listItem.style.cursor = "pointer";
				listItem.addEventListener("click", () => {
					this.selectedEntity = entity;
					const select = document.getElementById("entity-select") as HTMLSelectElement;
					if (select) {
						select.value = entity.id;
					}
					this.renderGraph();
				});
			}
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

