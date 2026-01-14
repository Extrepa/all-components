import { Modal, Setting, App } from "obsidian";
import { ErrlKernel } from "../kernel/ErrlKernel";

/**
 * ErrlOS Onboarding Modal
 * Shows helpful information about how to use ErrlOS when user opens Obsidian
 */
export class ErrlOSOnboardingModal extends Modal {
	private kernel: ErrlKernel;
	private dontShowAgain: boolean = false;

	constructor(app: App, kernel: ErrlKernel) {
		super(app);
		this.kernel = kernel;
	}

	onOpen(): void {
		this.modalEl.addClass("errl-onboarding-modal");
		this.render();
	}

	private render(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Header
		contentEl.createEl("h2", { 
			text: "🫧 Welcome to Errl OS",
			cls: "errl-onboarding-header"
		});
		contentEl.createEl("p", {
			text: "Your creative operating system is ready.",
			cls: "errl-onboarding-subheader"
		});

		// Scrollable content
		const scrollContent = contentEl.createDiv({ cls: "errl-onboarding-content" });
		
		// Section 1: What You're Looking At
		this.renderSection(scrollContent, {
			title: "📊 The Dashboard",
			content: `This is your Errl OS dashboard - your home screen for creative work.

**What you see:**
• Cards for each enabled feature (called "organs")
• Quick action buttons (like "Capture Idea")
• Status information (project activity, energy level)
• Links to your data (Base buttons)

The dashboard updates automatically as you work. You can:
• Click buttons to perform actions
• Click Base buttons to view your data
• Customize which cards appear in Settings`
		});

		// Section 2: Quick Actions
		this.renderSection(scrollContent, {
			title: "⚡ Quick Start",
			content: `**1. Capture an Idea**
• Press Cmd+Shift+C (Mac) or Ctrl+Shift+C (Windows/Linux)
• Or click the "Capture Idea" button on the Capture card
• Type your idea and press Enter

**2. View Your Data**
• Look for "Open [Feature] Base" buttons on cards
• Bases show your data in organized tables
• You can filter, group, and sort to find what you need
• Click any row to open that note/file

**3. Work on Projects**
• Open Project Pulse Base to see all your projects
• Projects are grouped by status (active, warm, dormant)
• Click a project to open its folder`
		});

		// Section 3: Organs and Bases
		this.renderSection(scrollContent, {
			title: "🔧 Organs = Features | 📊 Bases = Views",
			content: `**ORGANS** are the features that do work:
• Capture Organ: Captures your ideas, creates capture files
• Project Pulse Organ: Scans projects, calculates status
• Lore Engine Organ: Scans lore files, builds entity index
• And 12 more features...

**BASES** are views over your data:
• Capture Base: See all your captures in a table, grouped by tags
• Project Pulse Base: See all projects, grouped by status
• Lore Base: See all lore entities, organized by type

**Think of it this way:**
• Organs = The workers (they create and manage your data)
• Bases = The windows (they show you your data in organized ways)

Not all organs have Bases - some just do actions (like Energy, Friction Scanner).
Bases are optional - you can disable them in Settings if you prefer markdown files.`
		});

		// Section 4: Common Workflows
		this.renderSection(scrollContent, {
			title: "📝 Your Daily Workflow",
			content: `**MORNING:**
1. Open dashboard (you're here!)
2. Check Project Pulse Base - see what projects are active
3. Review recent captures in Capture Base (last 7 days)
4. Start a session log: Click "Create Session Log" on Time Machine card

**DURING WORK:**
• Capture ideas as they come: Cmd+Shift+C
• Work on projects: Open from Project Pulse Base
• Update lore: Create/edit lore entities, scan periodically
• Save assets: Save to configured paths, scan periodically

**END OF DAY:**
• Complete session log: Fill in what you accomplished
• Create rituals: Use "Create Ritual" for session end, project completion
• Review dashboard: Check status of all your work`
		});

		// Section 5: Getting Help
		this.renderSection(scrollContent, {
			title: "❓ Need Help?",
			content: `**SETTINGS:**
• Obsidian Settings → Errl OS
• Configure paths, enable/disable features
• Toggle Base views on/off

**COMMANDS:**
• Command Palette: Cmd/Ctrl+P
• Type "Errl:" to see all commands

**DOCUMENTATION:**
• USER_GUIDE.md: Complete user guide
• BASES_FORMAT.md: How Bases work

**QUICK TIP:**
Most features have Base views - look for "Open [Feature] Base" buttons on dashboard cards.`
		});

		// Footer
		const footer = contentEl.createDiv({ cls: "errl-onboarding-footer" });
		
		// Checkbox
		new Setting(footer)
			.setName("Don't show this again")
			.addToggle((toggle) => {
				toggle.setValue(this.dontShowAgain);
				toggle.onChange((value) => {
					this.dontShowAgain = value;
				});
			});

		// Buttons
		const buttonContainer = footer.createDiv({ cls: "errl-onboarding-buttons" });
		
		new Setting(buttonContainer)
			.addButton((button) => {
				button
					.setButtonText("Open Settings")
					.onClick(() => {
						// Open settings - the plugin's settings tab will be available
						// User can navigate to Errl OS settings manually
						(this.app as any).setting?.open();
						this.close();
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Got it!")
					.setCta()
					.onClick(() => {
						this.handleClose();
					});
			});
	}

	private renderSection(container: HTMLElement, section: { title: string; content: string }): void {
		const sectionEl = container.createDiv({ cls: "errl-onboarding-section" });
		sectionEl.createEl("h3", { text: section.title, cls: "errl-onboarding-section-title" });
		const contentDiv = sectionEl.createDiv({ cls: "errl-onboarding-section-content" });
		
		// Parse content with simple markdown-like formatting
		const lines = section.content.split('\n');
		lines.forEach(line => {
			const trimmed = line.trim();
			if (!trimmed) {
				contentDiv.createEl("br");
			} else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
				const strong = contentDiv.createEl("strong", { text: trimmed.replace(/\*\*/g, '') });
				strong.style.display = "block";
				strong.style.marginTop = "0.5rem";
			} else if (trimmed.startsWith('•')) {
				const listItem = contentDiv.createEl("div", { text: trimmed.substring(1).trim() });
				listItem.style.marginLeft = "1.5rem";
				listItem.style.marginTop = "0.25rem";
			} else if (trimmed.match(/^\d+\./)) {
				const listItem = contentDiv.createEl("div", { text: trimmed });
				listItem.style.marginLeft = "1.5rem";
				listItem.style.marginTop = "0.25rem";
			} else {
				const para = contentDiv.createEl("p", { text: trimmed });
				para.style.margin = "0.5rem 0";
			}
		});
	}

	private async handleClose(): Promise<void> {
		if (this.dontShowAgain) {
			await this.kernel.updateSettings({
				showOnboardingModal: false,
			});
		}
		this.close();
	}
}

