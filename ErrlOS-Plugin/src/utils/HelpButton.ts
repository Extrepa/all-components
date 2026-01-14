import { Setting } from "obsidian";
import { App } from "obsidian";
import { OrganDocumentation } from "../organs/base/OrganDocumentation";
import { HelpModal } from "./HelpModal";

/**
 * Creates a help button that opens documentation in a modal
 */
export function createHelpButton(
	setting: Setting,
	app: App,
	organName: string,
	documentation: OrganDocumentation
): Setting {
	return setting.addButton((button) => {
		button
			.setIcon("help-circle")
			.setTooltip(`View help and documentation for ${organName}`)
			.onClick(() => {
				const modal = new HelpModal(app, organName, documentation);
				modal.open();
			});
	});
}

/**
 * Creates a help button from an organ instance
 */
export function createHelpButtonFromOrgan(
	setting: Setting,
	app: App,
	organ: { getName: () => string; getDocumentation?: () => OrganDocumentation | undefined }
): Setting | null {
	if (!organ.getDocumentation) {
		return null;
	}

	const documentation = organ.getDocumentation();
	if (!documentation) {
		return null;
	}

	const organName = organ.getName();
	return createHelpButton(setting, app, organName, documentation);
}

