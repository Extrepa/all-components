import { Organ } from "../organs/base/Organ";
import { OrganWalkthrough } from "./OrganWalkthrough";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";
import { WalkthroughModal } from "./WalkthroughModal";
import { App } from "obsidian";

/**
 * Helper functions for organ walkthroughs
 */
export class WalkthroughHelper {
	/**
	 * Convert OrganDocumentation to OrganWalkthrough for display
	 */
	static documentationToWalkthrough(
		organ: Organ,
		documentation: OrganDocumentation
	): OrganWalkthrough {
		return {
			organId: organ.getId(),
			organName: organ.getName(),
			purpose: documentation.purpose,
			monitoring: documentation.monitoring.map(m => `${m.what} - ${m.why}`),
			fileOperations: documentation.fileOperations.map(op => ({
				operation: op.type as "creates" | "modifies" | "reads" | "deletes",
				path: op.path,
				description: `${op.when}. ${op.userControl}`,
			})),
			backgroundProcesses: documentation.backgroundProcesses.map(proc => ({
				name: proc.name,
				interval: proc.interval,
				description: proc.description,
				canControl: proc.startStop,
			})),
			dependencies: [
				...documentation.dependencies.required.map(dep => `Required: ${dep}`),
				...documentation.dependencies.optional.map(dep => `Optional: ${dep}`),
			],
			useCases: documentation.useCases.map(uc => uc.scenario),
			configurationSteps: [], // Can be populated from documentation.settings
			examples: documentation.useCases.flatMap(uc => uc.steps),
		};
	}

	/**
	 * Check if user has consented to enable an organ
	 * Shows walkthrough if needed
	 */
	static async checkConsent(
		app: App,
		organ: Organ,
		hasSeenWalkthrough: boolean,
		showWalkthroughAgain: boolean
	): Promise<boolean> {
		// If user has seen walkthrough and doesn't want to see it again, auto-consent
		if (hasSeenWalkthrough && !showWalkthroughAgain) {
			return true;
		}

		// Get walkthrough from organ
		const walkthrough = organ.getWalkthrough?.();
		if (!walkthrough) {
			// If no walkthrough provided, try to build from documentation
			const documentation = organ.getDocumentation?.();
			if (documentation) {
				const convertedWalkthrough = this.documentationToWalkthrough(organ, documentation);
				return new Promise((resolve) => {
					const modal = new WalkthroughModal(app, convertedWalkthrough, (consented) => {
						resolve(consented);
					});
					modal.open();
				});
			}
			// No walkthrough or documentation - default to requiring consent
			// For now, we'll auto-consent if no walkthrough exists (backwards compat)
			// NOTE: Requiring all organs to provide walkthrough would break backwards compatibility
			// Future enhancement: Add a setting to require walkthroughs for all organs
			return true;
		}

		// Show walkthrough modal
		return new Promise((resolve) => {
			const modal = new WalkthroughModal(app, walkthrough, (consented) => {
				resolve(consented);
			});
			modal.open();
		});
	}
}

