import { Organ } from "../organs/base/Organ";
import { ErrlKernel } from "../kernel/ErrlKernel";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";

/**
 * Control levels for layered control UI
 */
export enum ControlLevel {
	Global = "global",      // System-wide controls (all organs)
	Feature = "feature",    // Organ-level controls (enable/disable, basic settings)
	FineGrained = "fine"    // Detailed settings within an organ
}

/**
 * Control category
 */
export interface ControlCategory {
	id: string;
	name: string;
	description: string;
	level: ControlLevel;
	controls: ControlItem[];
}

/**
 * Individual control item
 */
export interface ControlItem {
	id: string;
	name: string;
	description: string;
	level: ControlLevel;
	type: "toggle" | "input" | "dropdown" | "slider" | "button";
	organId?: string; // For feature/fine-grained controls
	settingKey?: string; // Settings key this controls
	options?: Array<{ value: string; label: string }>; // For dropdowns
	min?: number;
	max?: number;
	step?: number;
	default?: any;
	requiresOrganEnabled?: boolean; // Only available when organ is enabled
}

/**
 * Helper for building layered control UI
 */
export class LayeredControlHelper {
	/**
	 * Get global controls (system-wide settings)
	 */
	static getGlobalControls(kernel: ErrlKernel): ControlCategory {
		const settings = kernel.getSettings();

		return {
			id: "global",
			name: "Global Controls",
			description: "System-wide settings that affect all organs",
			level: ControlLevel.Global,
			controls: [
				{
					id: "autoOpenDashboard",
					name: "Auto-open Dashboard",
					description: "Automatically open dashboard when vault loads",
					level: ControlLevel.Global,
					type: "toggle",
					settingKey: "autoOpenDashboard",
					default: false,
				},
			],
		};
	}

	/**
	 * Get feature-level controls for an organ (enable/disable, basic settings)
	 */
	static async getFeatureControls(
		kernel: ErrlKernel,
		organ: Organ
	): Promise<ControlCategory | null> {
		const organId = organ.getId();
		const organName = organ.getName();
		const isEnabled = kernel.isOrganEnabled(organId);
		const documentation = organ.getDocumentation?.();

		const controls: ControlItem[] = [
			{
				id: `${organId}-enable`,
				name: `Enable ${organName}`,
				description: documentation?.purpose || `Enable the ${organName} organ`,
				level: ControlLevel.Feature,
				type: "toggle",
				organId,
				settingKey: `enabledOrgans.${organId}`,
				default: false,
			},
		];

		// Add basic feature-level settings from documentation
		if (documentation?.settings) {
			for (const setting of documentation.settings) {
				// Only include if it's a basic setting (not fine-grained)
				// For now, include all settings - can be refined later
				controls.push({
					id: `${organId}-${setting.key}`,
					name: setting.name,
					description: setting.description,
					level: ControlLevel.FineGrained, // Settings are fine-grained
					type: LayeredControlHelper.inferControlType(setting.default),
					organId,
					settingKey: setting.key,
					default: setting.default,
					requiresOrganEnabled: true,
				});
			}
		}

		return {
			id: organId,
			name: organName,
			description: documentation?.description || `Controls for ${organName}`,
			level: ControlLevel.Feature,
			controls,
		};
	}

	/**
	 * Get fine-grained controls for a specific organ feature
	 */
	static async getFineGrainedControls(
		kernel: ErrlKernel,
		organ: Organ,
		featureId: string
	): Promise<ControlCategory | null> {
		const documentation = organ.getDocumentation?.();
		if (!documentation) {
			return null;
		}

		// For now, fine-grained controls are the settings from documentation
		// This can be expanded to include background process controls, etc.
		const settings = documentation.settings || [];
		const featureSettings = settings.filter(s => s.key.startsWith(featureId));

		if (featureSettings.length === 0) {
			return null;
		}

		const controls: ControlItem[] = featureSettings.map(setting => ({
			id: `${organ.getId()}-${setting.key}`,
			name: setting.name,
			description: setting.description,
			level: ControlLevel.FineGrained,
			type: LayeredControlHelper.inferControlType(setting.default),
			organId: organ.getId(),
			settingKey: setting.key,
			default: setting.default,
			requiresOrganEnabled: true,
		}));

		return {
			id: `${organ.getId()}-${featureId}`,
			name: `${featureId} Settings`,
			description: `Fine-grained controls for ${featureId}`,
			level: ControlLevel.FineGrained,
			controls,
		};
	}

	/**
	 * Get all controls organized by level
	 */
	static async getAllControls(kernel: ErrlKernel): Promise<{
		global: ControlCategory;
		features: ControlCategory[];
	}> {
		const global = this.getGlobalControls(kernel);
		const registry = kernel.getRegistry();
		const features: ControlCategory[] = [];

		for (const organ of registry.getAll()) {
			const featureControl = await this.getFeatureControls(kernel, organ);
			if (featureControl) {
				features.push(featureControl);
			}
		}

		return {
			global,
			features,
		};
	}

	/**
	 * Infer control type from default value
	 */
	static inferControlType(defaultValue: any): ControlItem["type"] {
		if (typeof defaultValue === "boolean") {
			return "toggle";
		}
		if (typeof defaultValue === "number") {
			return "slider";
		}
		if (Array.isArray(defaultValue)) {
			return "dropdown"; // Multi-select or single select
		}
		return "input";
	}
}

