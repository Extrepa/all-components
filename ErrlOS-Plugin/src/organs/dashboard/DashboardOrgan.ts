import { Organ, OrganConfigurationStatus, OrganStatus } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, TFile, TFolder, MarkdownView, App, Notice } from "obsidian";
import { FileUtils } from "../../utils/fileUtils";
import { ErrorHandler, ErrorCategory } from "../../utils/ErrorHandler";
import { ProjectPulseOrgan } from "../projectPulse/ProjectPulseOrgan";
import { TimeMachineOrgan } from "../timeMachine/TimeMachineOrgan";
import { DashboardCreationModal } from "./DashboardCreationModal";
import { BaseManager, BaseConfig } from "../../utils/BaseManager";

/**
 * Dashboard Organ - The home screen of Errl OS
 * Creates and manages the dashboard markdown note
 */
export class DashboardOrgan extends Organ {
	private dashboardPath: string = "ErrlOS/Dashboard.md";
	private processedElements: WeakSet<HTMLElement> = new WeakSet();
	
	// Performance metrics (only tracked when DEBUG=true)
	private performanceMetrics = {
		postProcessorRuns: 0,
		intervalChecks: 0,
		mutationObserverTriggers: 0,
		stylesApplied: 0,
		lastWarningTime: 0,
	};

	// Event listener references for cleanup
	private layoutChangeListener: (() => void) | null = null;
	private activeLeafChangeListener: (() => void) | null = null;
	private fileOpenListener: (() => void) | null = null;
	private readingModeHandlers: Map<HTMLElement, (e: MouseEvent) => void> = new Map(); // Track reading mode handlers for cleanup
	private documentClickHandler: ((e: MouseEvent) => void) | null = null; // Track document click handler

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		super(kernel, plugin);
	}

	getId(): string {
		return "dashboard";
	}

	getName(): string {
		return "Dashboard";
	}

	getDocumentation() {
		return {
			purpose: "Central hub displaying all Errl OS organs and system status",
			description: "The Dashboard organ creates and manages a markdown file that serves as the home screen for Errl OS. It displays cards for each enabled organ, system status information, and provides quick access to organ features. The dashboard updates dynamically based on enabled organs and can be customized through settings.",
			phase: "Phase 1: Foundation",
			capabilities: [
				{
					name: "Open Dashboard",
					description: "Opens the dashboard file in the current view",
					commands: ["open-dashboard"],
				},
				{
					name: "Refresh Dashboard",
					description: "Regenerates dashboard content with current system state",
					commands: ["refresh-dashboard"],
				},
			],
			monitoring: [],
			fileOperations: [
				{
					type: "create" as const,
					path: "ErrlOS/Dashboard.md (configurable)",
					when: "When organ is enabled and dashboard file doesn't exist (with user consent)",
					userControl: "User is asked for consent before file creation. Path can be changed in settings.",
					example: "Dashboard file created at ErrlOS/Dashboard.md",
				},
				{
					type: "modify" as const,
					path: "ErrlOS/Dashboard.md (configurable)",
					when: "When refresh command is called, or when dashboard content is regenerated",
					userControl: "User controls when to refresh. Auto-refresh can be disabled in settings.",
					example: "Dashboard content updated with current organ status",
				},
			],
			backgroundProcesses: [],
			settings: [
				{
					key: "dashboardPath",
					name: "Dashboard Path",
					description: "Path where the dashboard markdown file is stored",
					default: "ErrlOS/Dashboard.md",
					affects: ["File creation location", "Auto-open behavior"],
				},
				{
					key: "autoOpenDashboard",
					name: "Auto-open Dashboard",
					description: "Automatically open dashboard when vault loads",
					default: false,
					affects: ["Vault load behavior"],
				},
			],
			useCases: [
				{
					scenario: "First-time setup",
					steps: [
						"Enable Dashboard organ (shows walkthrough)",
						"Consent to create dashboard file",
						"Dashboard file is created",
						"Dashboard opens automatically if auto-open enabled",
					],
					expectedOutcome: "Dashboard file created and accessible",
				},
				{
					scenario: "View system status",
					steps: [
						"Open dashboard via command or manually",
						"View organ cards showing enabled organs",
						"Check system monitor for organ health",
					],
					expectedOutcome: "Complete overview of Errl OS state",
				},
				{
					scenario: "Refresh dashboard after enabling new organ",
					steps: [
						"Enable a new organ via settings",
						"Run 'Refresh Dashboard' command",
						"Dashboard updates to include new organ card",
					],
					expectedOutcome: "Dashboard reflects current system state",
				},
			],
			commonIssues: [
				{
					problem: "Dashboard file not found",
					cause: "File was deleted or path changed",
					solution: "Enable dashboard organ again to recreate, or manually create file at configured path",
				},
				{
					problem: "Dashboard shows outdated information",
					cause: "Dashboard content hasn't been refreshed after changes",
					solution: "Run 'Refresh Dashboard' command to regenerate content",
				},
			],
			dependencies: {
				required: [],
				optional: ["All other organs (displays their cards when enabled)"],
				conflicts: [],
			},
		};
	}

	async onLoad(): Promise<void> {
		// Update dashboard path from settings
		const settings = this.kernel.getSettings();
		this.dashboardPath = settings.dashboardPath;

		// Don't create dashboard automatically - wait for user consent
		// Dashboard will be created when organ is enabled (if user consents)

		// Auto-open dashboard on vault load if enabled (only after user has consented)
		// This will be handled in onEnable() after user has gone through walkthrough
	}

	async onUnload(): Promise<void> {
		await super.onUnload();
		
		// Cleanup workspace event listeners
		if (this.layoutChangeListener) {
			this.plugin.app.workspace.off("layout-change", this.layoutChangeListener);
			this.layoutChangeListener = null;
		}
		if (this.activeLeafChangeListener) {
			this.plugin.app.workspace.off("active-leaf-change", this.activeLeafChangeListener);
			this.activeLeafChangeListener = null;
		}
		if (this.fileOpenListener) {
			this.plugin.app.workspace.off("file-open", this.fileOpenListener);
			this.fileOpenListener = null;
		}
		
		// Cleanup reading mode event listeners
		for (const [view, handler] of this.readingModeHandlers.entries()) {
			view.removeEventListener("click", handler, true);
			delete view.dataset.errlHandlerAttached;
		}
		this.readingModeHandlers.clear();
		this.documentClickHandler = null;
		
		// Cleanup post-processor
		// Performance metrics are tracked but not logged by default
		// Can be enabled for debugging by uncommenting:
		// console.log("[Errl OS] Dashboard performance metrics:", this.performanceMetrics);
	}

	async onEnable(): Promise<void> {
		await super.onEnable();
		
		// Check if dashboard file exists, ask for consent before creating
		const file = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath);
		if (!file || !(file instanceof TFile)) {
			// Ask user before creating
			const consented = await this.requestDashboardCreationConsent();
			if (consented) {
				await this.ensureDashboardExists();
			}
		}

		// Commands will be registered by kernel.initialize() after onEnable()
		// But we also register here to ensure they're available
		await this.registerCommands();
		this.registerMarkdownPostProcessor();
		console.log("[Errl OS] Dashboard organ enabled");

		// Handle auto-open (only if user has explicitly enabled it in settings)
		const settings = this.kernel.getSettings();
		if (settings.autoOpenDashboard) {
			this.plugin.app.workspace.onLayoutReady(() => {
				this.openDashboard();
			});
		}

		// Show onboarding modal if enabled and first run is completed
		// (Only show if not already shown after first run wizard)
		if (settings.showOnboardingModal && settings.firstRunCompleted) {
			this.plugin.app.workspace.onLayoutReady(() => {
				// Small delay so dashboard renders first
				setTimeout(() => {
					const { ErrlOSOnboardingModal } = require("../../utils/ErrlOSOnboardingModal");
					new ErrlOSOnboardingModal(this.plugin.app, this.kernel).open();
				}, 1500);
			});
		}
	}

	/**
	 * Request user consent before creating dashboard file
	 */
	private async requestDashboardCreationConsent(): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new DashboardCreationModal(
				this.plugin.app,
				this.dashboardPath,
				(create: boolean) => {
					resolve(create);
				}
			);
			modal.open();
		});
	}

	async registerCommands(): Promise<void> {
		// Register "Open Dashboard" command
		this.plugin.addCommand({
			id: "open-dashboard",
			name: "Open Dashboard",
			callback: () => {
				this.openDashboard();
			},
		});

		// Register "Refresh Dashboard" command
		this.plugin.addCommand({
			id: "refresh-dashboard",
			name: "Refresh Dashboard",
			callback: () => {
				this.refreshDashboard();
			},
		});

		// Register "Open System Base" command
		this.plugin.addCommand({
			id: "open-system-base",
			name: "Open System Base",
			callback: async () => {
				await this.openSystemBase();
			},
		});

		console.log("[Errl OS] Dashboard commands registered: open-dashboard, refresh-dashboard, open-system-base");
	}

	/**
	 * Ensure the dashboard file exists and is up to date
	 */
	private async ensureDashboardExists(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath);
		if (!file || !(file instanceof TFile)) {
			await this.createDashboard();
		} else {
			// Check if dashboard needs to be refreshed (has old content)
			try {
				const content = await this.plugin.app.vault.read(file);
				// If it has old placeholder text, refresh it
				if (content.includes("*Project Pulse organ not yet implemented*") || 
				    (content.includes("*No modules enabled*") && this.kernel.getRegistry().getEnabled().length > 0)) {
					console.log("[Errl OS] Dashboard has old content, refreshing...");
					await this.refreshDashboard();
				}
			} catch (error) {
				const errorInfo = ErrorHandler.handleError(error, { 
					operation: "ensureDashboardExists", 
					filePath: this.dashboardPath 
				});
				console.error("[Errl OS] Error checking dashboard content:", errorInfo.message, errorInfo.context);
				// If we can't read it, recreate it
				await this.createDashboard();
			}
		}
	}

	/**
	 * Create the dashboard file with initial content
	 */
	private async createDashboard(): Promise<void> {
		try {
			const content = await this.generateDashboardContent();
			await FileUtils.ensureParentDirectoryExists(this.plugin.app, this.dashboardPath);
			
			// Check if file already exists
			const existingFile = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath);
			if (existingFile instanceof TFile) {
				// File exists, just update it
				await this.plugin.app.vault.modify(existingFile, content);
				console.log("[Errl OS] Dashboard file updated");
			} else {
				// File doesn't exist, create it
				try {
					await this.plugin.app.vault.create(this.dashboardPath, content);
					console.log("[Errl OS] Dashboard file created");
				} catch (error) {
					// If file was created between check and create, just update it
					const errorInfo = ErrorHandler.handleError(error, { 
						operation: "createDashboard", 
						filePath: this.dashboardPath 
					});
					
					if (errorInfo.category === ErrorCategory.RaceCondition) {
						const file = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath) as TFile;
						if (file) {
							await this.plugin.app.vault.modify(file, content);
							console.log("[Errl OS] Dashboard file updated (race condition handled)");
						} else {
							throw new Error(`Race condition detected but file not found: ${this.dashboardPath}`);
						}
					} else {
						ErrorHandler.showErrorNotice(errorInfo);
						throw new Error(errorInfo.userMessage);
					}
				}
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "createDashboard", 
				filePath: this.dashboardPath 
			});
			console.error("[Errl OS] Error creating dashboard:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
			throw new Error(errorInfo.userMessage);
		}
	}

	/**
	 * Open the dashboard in the active leaf
	 * Note: We don't force reading mode as it can cause errors with Obsidian's API
	 * The user can switch modes manually if needed
	 */
	private async openDashboard(): Promise<void> {
		try {
			const file = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath);
			if (file instanceof TFile) {
				const leaf = this.plugin.app.workspace.getLeaf(true);
				await leaf.openFile(file);
				// Let Obsidian use its default mode - user can switch to reading mode if desired
			} else {
				const errorInfo = ErrorHandler.handleError(
					new Error(`Dashboard file not found: ${this.dashboardPath}`),
					{ operation: "openDashboard", filePath: this.dashboardPath }
				);
				ErrorHandler.showErrorNotice(errorInfo);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "openDashboard", 
				filePath: this.dashboardPath 
			});
			console.error("[Errl OS] Error opening dashboard:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
		}
	}

	/**
	 * Refresh the dashboard content
	 */
	private async refreshDashboard(): Promise<void> {
		try {
			const file = this.plugin.app.vault.getAbstractFileByPath(this.dashboardPath);
			if (file instanceof TFile) {
				const content = await this.generateDashboardContent();
				await this.plugin.app.vault.modify(file, content);
				console.log("[Errl OS] Dashboard refreshed");
				
				// Get the current view - if dashboard is open, just refresh the view
				// Don't try to force mode switching as it can cause errors
				const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView && activeView.file === file) {
					// Dashboard is already open - the content update will refresh automatically
					// No need to switch modes, let the user control that
				} else {
					// Not open or different file, open it in reading mode
					await this.openDashboard();
				}
			} else {
				// File doesn't exist, create it
				await this.createDashboard();
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { 
				operation: "refreshDashboard", 
				filePath: this.dashboardPath 
			});
			console.error("[Errl OS] Error refreshing dashboard:", errorInfo.message, errorInfo.context);
			ErrorHandler.showErrorNotice(errorInfo);
		}
	}

	/**
	 * Register markdown post-processor to wire up interactive buttons and ensure grid layout.
	 * 
	 * Uses a three-layer approach to ensure grid layout works in both reading and editing modes:
	 * 
	 * 1. CSS (static): Base styles with !important flags for maximum specificity
	 *    - Defined in styles.css with comprehensive selectors
	 *    - Uses CSS custom properties for theme consistency
	 * 
	 * 2. Post-processor (dynamic): Applies inline styles when markdown is rendered
	 *    - Runs when Obsidian renders markdown (reading/preview mode)
	 *    - Applies grid styles directly to .errl-grid elements
	 *    - Styles buttons to ensure they're clickable
	 * 
	 * 3. MutationObserver + Interval (reactive): Catches dynamically added elements
	 *    - MutationObserver watches for new grid elements added to DOM
	 *    - Scoped to dashboard view for performance
	 *    - Interval check (1s) ensures styles persist if overridden
	 *    - Only re-applies if computed style shows display !== "grid"
	 * 
	 * Why this approach?
	 * - Obsidian's reading mode can override CSS styles during rendering
	 * - Elements are added dynamically during markdown processing
	 * - Mode switching requires reactive updates
	 * - Multiple layers ensure reliability even if one layer fails
	 * 
	 * Performance: Optimized to minimize overhead
	 * - Event delegation (single document-level handler)
	 * - Scoped MutationObserver (dashboard view only)
	 * - Throttled interval (1s max, only when needed)
	 * - Checks computed styles before re-applying
	 * 
	 * @see IMPLEMENTATION_REVIEW.md for detailed architecture explanation
	 */
	private registerMarkdownPostProcessor(): void {
		// Event delegation: Single document-level click handler
		// This approach is more reliable than per-button listeners because:
		// - Works even if buttons are re-rendered by Obsidian
		// - Handles clicks on button children (text, icons)
		// - More performant (one listener vs many)
		// Store handleClick reference for cleanup
		const handleClick = async (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target) return;

			// Find the closest element with data attributes (handles clicks on button text/children)
			const cmdElement = target.closest("[data-errl-cmd]");
			const openElement = target.closest("[data-errl-open]");

			if (cmdElement) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();

				const cmd = cmdElement.getAttribute("data-errl-cmd");
				if (cmd) {
					// Command ID format: "errl-os:command-id" or just "command-id"
					const commandId = cmd.includes(":") ? cmd : `errl-os:${cmd}`;
					console.log(`[Errl OS] Button clicked! Executing command: ${commandId}`);
					
					// Try multiple methods to execute the command
					let executed = false;
					
					// Method 1: Try with full ID
					try {
						await (this.plugin.app as any).commands.executeCommandById(commandId);
						executed = true;
						console.log(`[Errl OS] Command executed successfully: ${commandId}`);
					} catch (error) {
						console.log(`[Errl OS] Method 1 failed for ${commandId}, trying alternatives...`);
					}
					
					// Method 2: Try without prefix
					if (!executed && cmd.includes(":")) {
						const withoutPrefix = cmd.split(":")[1];
						try {
							await (this.plugin.app as any).commands.executeCommandById(`errl-os:${withoutPrefix}`);
							executed = true;
							console.log(`[Errl OS] Command executed with method 2: errl-os:${withoutPrefix}`);
						} catch (error2) {
							console.log(`[Errl OS] Method 2 also failed`);
						}
					}
					
					// Method 3: Try direct command lookup
					if (!executed) {
						const commandName = cmd.includes(":") ? cmd.split(":")[1] : cmd;
						try {
							// Try to find command by name
							const commands = (this.plugin.app as any).commands;
							const command = commands.findCommand(`errl-os:${commandName}`);
							if (command) {
								await command.callback();
								executed = true;
								console.log(`[Errl OS] Command executed with method 3: ${commandName}`);
							}
						} catch (error3) {
							console.error(`[Errl OS] All methods failed for command: ${cmd}`, error3);
						}
					}
					
					if (!executed) {
						console.error(`[Errl OS] Could not execute command: ${cmd}. Available commands:`, 
							Array.from((this.plugin.app as any).commands.listCommands().map((c: any) => c.id)));
					}
				}
				return;
			}

			if (openElement) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();

				const path = openElement.getAttribute("data-errl-open");
				if (path) {
					console.log(`[Errl OS] Opening file: ${path}`);
					const file = this.plugin.app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						await this.plugin.app.workspace.getLeaf(true).openFile(file);
					} else if (file instanceof TFolder) {
						// If it's a folder, try to open the first file
						if (file.children.length > 0) {
							const firstFile = file.children.find((child): child is TFile => child instanceof TFile);
							if (firstFile) {
								await this.plugin.app.workspace.getLeaf(true).openFile(firstFile);
							}
						}
					}
				}
				return;
			}
		};

		// Store handleClick reference for cleanup
		this.documentClickHandler = handleClick;
		
		// Register global click handler with capture phase to catch events early
		// Note: registerDomEvent is automatically cleaned up by Obsidian plugin system
		this.plugin.registerDomEvent(document, "click", handleClick, true);
		
		// Also register on reading view containers specifically for reading mode
		// This ensures buttons work even if event propagation is blocked
		const registerReadingModeHandlers = () => {
			const readingViews = document.querySelectorAll(".markdown-reading-view");
			readingViews.forEach((view) => {
				// Remove any existing listeners to avoid duplicates
				const newView = view as HTMLElement;
				if (!newView.dataset.errlHandlerAttached && this.documentClickHandler) {
					newView.addEventListener("click", this.documentClickHandler, true);
					newView.dataset.errlHandlerAttached = "true";
					this.readingModeHandlers.set(newView, this.documentClickHandler);
				}
			});
		};
		
		// Register handlers immediately and on view changes
		registerReadingModeHandlers();
		
		// Store listener references for cleanup
		this.layoutChangeListener = registerReadingModeHandlers;
		this.activeLeafChangeListener = registerReadingModeHandlers;
		
		this.plugin.app.workspace.on("layout-change", this.layoutChangeListener);
		this.plugin.app.workspace.on("active-leaf-change", this.activeLeafChangeListener);

		// Helper: Apply grid styles with maximum specificity
		// Uses both setProperty (with important) and direct assignment as fallback
		// This ensures styles persist even if Obsidian tries to override them
		// Uses CSS custom properties for consistency with styles.css
		const applyGridStyles = (grid: HTMLElement) => {
			// Get CSS variable values with fallbacks
			const gap = getComputedStyle(document.documentElement).getPropertyValue("--errl-grid-gap") || "16px";
			const margin = getComputedStyle(document.documentElement).getPropertyValue("--errl-grid-margin") || "16px";
			
			// Use setProperty with important flag - FIXED: Use repeat(3, 1fr) instead of auto-fit
			grid.style.setProperty("display", "grid", "important");
			grid.style.setProperty("grid-template-columns", "repeat(3, 1fr)", "important");
			grid.style.setProperty("gap", gap, "important");
			grid.style.setProperty("width", "100%", "important");
			grid.style.setProperty("grid-auto-flow", "row", "important");
			grid.style.setProperty("grid-auto-rows", "auto", "important");
			grid.style.setProperty("align-items", "start", "important");
			grid.style.setProperty("justify-items", "stretch", "important");
			grid.style.setProperty("position", "relative", "important");
			grid.style.setProperty("flex-direction", "unset", "important");
			grid.style.setProperty("flex-wrap", "unset", "important");
			grid.style.setProperty("max-width", "none", "important");
			// Also set directly as fallback
			grid.style.display = "grid";
			grid.style.gridTemplateColumns = "repeat(3, 1fr)";
			grid.style.gap = gap;
			grid.style.width = "100%";
			grid.style.justifyItems = "stretch";
			
			// Ensure cards display properly in grid (not stretching in reading mode)
			const cards = grid.querySelectorAll(".errl-card");
			cards.forEach((card) => {
				const htmlCard = card as HTMLElement;
				// Check if we're in reading mode
				const isReadingMode = htmlCard.closest(".markdown-reading-view") !== null;
				if (isReadingMode) {
					// Reading mode: prevent stretching, allow variable heights
					htmlCard.style.setProperty("width", "100%", "important");
					htmlCard.style.setProperty("max-width", "100%", "important");
					htmlCard.style.setProperty("flex", "0 1 auto", "important");
					htmlCard.style.setProperty("align-self", "start", "important");
				} else {
					// Other modes: allow variable heights
					htmlCard.style.setProperty("width", "100%", "important");
					htmlCard.style.setProperty("max-width", "100%", "important");
					htmlCard.style.setProperty("flex", "1 1 auto", "important");
					htmlCard.style.setProperty("align-self", "start", "important");
				}
			});
		};

		// Helper: Find and style all grids in a container
		// Used by post-processor to apply styles to grids found in the rendered markdown
		const styleGrids = (container: Element | Document) => {
			const grids = container.querySelectorAll(".errl-grid");
			grids.forEach((grid) => {
				applyGridStyles(grid as HTMLElement);
			});
			return grids.length;
		};

		// Also register post-processor to style buttons
		this.plugin.registerMarkdownPostProcessor((element, context) => {
			// Only process dashboard notes
			const filePath = context.sourcePath;
			if (filePath !== this.dashboardPath) {
				return;
			}

			// Track performance metrics
			this.performanceMetrics.postProcessorRuns++;
			const stylesCount = styleGrids(element);

			// Also search in parent containers (for reading mode)
			const parent = element.parentElement;
			let parentGridCount = 0;
			if (parent) {
				parentGridCount = styleGrids(parent);
			}
			
			this.performanceMetrics.stylesApplied += stylesCount + parentGridCount;

			// Performance warning: If post-processor runs too frequently
			if (this.performanceMetrics.postProcessorRuns > 50) {
				const now = Date.now();
				// Only warn once per minute to avoid spam
				if (now - this.performanceMetrics.lastWarningTime > 60000) {
					this.performanceMetrics.lastWarningTime = now;
					console.warn(
						`[Errl OS] Performance warning: Post-processor has run ${this.performanceMetrics.postProcessorRuns} times. ` +
						`This may indicate excessive re-rendering. Consider optimizing dashboard content.`
					);
				}
			}

			// Style all buttons to make them look clickable
			const styleButton = (btn: Element) => {
				const htmlBtn = btn as HTMLElement;
				htmlBtn.style.cursor = "pointer";
				htmlBtn.style.pointerEvents = "auto";
				htmlBtn.style.position = "relative";
				htmlBtn.style.zIndex = "10";
			};

			// Find and style all command buttons
			const cmdButtons = element.querySelectorAll("[data-errl-cmd]");
			cmdButtons.forEach((btn) => {
				styleButton(btn);
			});

			// Find and style all open buttons/spans
			const openButtons = element.querySelectorAll("[data-errl-open]");
			openButtons.forEach((btn) => {
				styleButton(btn);
			});
		});

		// MutationObserver: Watch for dynamically added grid elements
		// Scoped to dashboard view container for better performance (not entire document)
		// Re-scopes when dashboard file is opened to ensure it watches the right container
		let observer: MutationObserver | null = null;
		const setupObserver = () => {
			// Try to scope to active dashboard view for better performance
			const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
			// Include both contentEl (for preview/reading) and editor container (for source mode)
			let container = document.body;
			if (activeView && activeView.file?.path === this.dashboardPath) {
				// Prefer contentEl for preview/reading mode, fallback to editor container for source mode
				container = activeView.contentEl || (activeView as any).editorEl || document.body;
			}

			observer = new MutationObserver((mutations) => {
				// Track MutationObserver triggers
				this.performanceMetrics.mutationObserverTriggers++;
				
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element;
							// Check if this is a grid or contains a grid
							if (element.classList?.contains("errl-grid")) {
								applyGridStyles(element as HTMLElement);
								this.performanceMetrics.stylesApplied++;
							}
							// Also check children
							const grids = element.querySelectorAll?.(".errl-grid");
							if (grids && grids.length > 0) {
								grids.forEach((grid) => {
									applyGridStyles(grid as HTMLElement);
									this.performanceMetrics.stylesApplied++;
								});
							}
						}
					});
				});
			});

			observer.observe(container, {
				childList: true,
				subtree: true,
			});
		};

		// Setup observer when dashboard is opened
		this.fileOpenListener = () => {
			if (observer) {
				observer.disconnect();
			}
			setupObserver();
		};
		this.plugin.app.workspace.on("file-open", this.fileOpenListener);
		setupObserver(); // Initial setup

		// Interval check: Fallback to ensure grid styles persist
		// Runs every 1 second (optimized from 200ms for better performance)
		// Only re-applies styles if computed style shows display !== "grid"
		// This catches cases where Obsidian overrides styles after initial render
		let lastCheck = 0;
		const checkInterval = setInterval(() => {
			const now = Date.now();
			// Throttle: Only check once per second max
			if (now - lastCheck < 1000) return;
			lastCheck = now;

			// Track interval checks
			this.performanceMetrics.intervalChecks++;

			// Check both document and source view containers
			const allGrids = document.querySelectorAll(".errl-grid");
			// Also check in source view if dashboard is open
			const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
			let sourceGrids: NodeListOf<Element> | [] = [];
			if (activeView && activeView.file?.path === this.dashboardPath) {
				// Try to find grids in editor container (source mode)
				const editorContainer = (activeView as any).editorEl || activeView.contentEl;
				if (editorContainer) {
					sourceGrids = editorContainer.querySelectorAll(".errl-grid");
				}
			}
			
			const grids = Array.from(allGrids).concat(Array.from(sourceGrids));
			let stylesReapplied = 0;
			grids.forEach((grid) => {
				const htmlGrid = grid as HTMLElement;
				// Only re-apply if display is not grid (avoids unnecessary DOM writes)
				const computedStyle = window.getComputedStyle(htmlGrid);
				if (computedStyle.display !== "grid") {
					applyGridStyles(htmlGrid);
					stylesReapplied++;
					this.performanceMetrics.stylesApplied++;
				}
			});

		}, 1000);

		// Clean up on unload
		this.plugin.register(() => {
			if (observer) {
				observer.disconnect();
			}
			clearInterval(checkInterval);
		});
	}

	/**
	 * Generate dashboard markdown content with interactive buttons
	 */
	/**
	 * Get ordered card list based on settings
	 */
	private getCardOrder(): string[] {
		const settings = this.kernel.getSettings();
		const defaultOrder = [
			"capture",
			"projectPulse",
			"energy",
			"context",
			"timeMachine",
			"loreEngine",
			"realityMap",
			"promotion",
			"dreamBuffer",
			"thoughtRecycler",
			"promptForge",
			"assetBrain",
			"dashboard",
			"modules",
			"frictionScanner",
		];
		
		// If custom order is set, use it; otherwise use default
		if (settings.dashboardCardOrder && settings.dashboardCardOrder.length > 0) {
			// Merge with default to ensure all cards are included
			const customOrder = [...settings.dashboardCardOrder];
			for (const cardId of defaultOrder) {
				if (!customOrder.includes(cardId)) {
					customOrder.push(cardId);
				}
			}
			return customOrder;
		}
		
		return defaultOrder;
	}

	/**
	 * Check if a card is hidden
	 */
	private isCardHidden(cardId: string): boolean {
		const settings = this.kernel.getSettings();
		return settings.dashboardHiddenCards?.includes(cardId) || false;
	}

	private async generateDashboardContent(): Promise<string> {
		const settings = this.kernel.getSettings();
		const enabledOrgans = this.kernel.getRegistry().getEnabled();
		
		// Check if low-energy mode is enabled
		const energyOrgan = this.kernel.getRegistry().get("energy") as any;
		const isLowEnergyMode = energyOrgan && this.kernel.isOrganEnabled("energy") && energyOrgan.isLowEnergyMode();
		const hiddenOrgans = isLowEnergyMode && energyOrgan.isOrganHidden ? 
			settings.energyLowModeHideOrgans || [] : [];
		
		const today = new Date().toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		// Get card order and layout
		const cardOrder = this.getCardOrder();
		const cardLayout = settings.dashboardCardLayout || "grid";
		const gridClass = isLowEnergyMode 
			? `errl-grid errl-dashboard-low-energy errl-layout-${cardLayout}` 
			: `errl-grid errl-layout-${cardLayout}`;

		let content = `---
errl_os: true
type: dashboard
---

# 🫧 Errl OS

> Boot sequence complete. Reality is slightly optional.

${!isLowEnergyMode ? `<div style="margin-bottom: 1rem;">
  <button data-errl-open="${settings.systemBasePath || "ErrlOS/System.base"}" class="errl-btn">Open System Base</button>
</div>\n` : ''}

<div class="${gridClass}">

<!-- Tier 1: Core Daily Workflow -->
${!this.isCardHidden("capture") ? `<div class="errl-card errl-card-essential">
  <div class="errl-card-title">🎯 Capture</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Quick capture for ideas, thoughts, and notes. Hotkey: Cmd+Shift+C</div>\n' : ''}  <button data-errl-cmd="errl-os:capture-thought" class="errl-btn">+ Capture Idea</button>
${!isLowEnergyMode ? `  <button data-errl-open="${settings.captureBasePath || "ErrlOS/Capture.base"}" class="errl-btn">Open Capture Base</button>\n${settings.showLegacyIndexLinks ? `  <button data-errl-open="${settings.captureFilePath}" class="errl-btn errl-btn-ghost errl-btn-legacy">Open Gravity Well</button>\n` : ''}` : ''}</div>

` : ""}`;

		// Tier 1: Project Pulse
		if (!hiddenOrgans.includes("projectPulse") && !this.isCardHidden("projectPulse")) {
			const projectPulseOrgan = this.kernel.getRegistry().get("projectPulse") as ProjectPulseOrgan | undefined;
			if (projectPulseOrgan && this.kernel.isOrganEnabled("projectPulse")) {
				content += `<div class="errl-card">
  <div class="errl-card-title">📊 Project Pulse</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Monitor project activity. See what\'s active, warm, dormant, or abandoned</div>\n' : ''}`;
				try {
					const projectPulsePath = settings.projectPulsePath || "";
					
					// Check if path is configured
					if (!projectPulsePath || projectPulsePath.trim() === "") {
						content += `  <div class="errl-pulse-placeholder">*Configure project path in settings*</div>\n`;
					} else {
						// Check if folder exists
						const projectDir = this.plugin.app.vault.getAbstractFileByPath(projectPulsePath);
						if (!projectDir || !(projectDir instanceof TFolder)) {
							content += `  <div class="errl-pulse-placeholder">*Project folder not found. Check path in settings.*</div>\n`;
						} else {
							const pulseData = await projectPulseOrgan.getPulseData();
							if (pulseData.length > 0) {
								const maxEntries = isLowEnergyMode ? 2 : 4;
								for (const project of pulseData.slice(0, maxEntries)) {
									const icon = projectPulseOrgan.getStatusIcon(project.status);
									const daysText = projectPulseOrgan.formatDaysAgo(project.daysAgo);
									
									// Get health indicator (async, but we'll show status-based icon for now)
									// Health calculation can be done on-demand when user clicks
									const healthIcon = project.status === "active" ? "🟢" : project.status === "warm" ? "🟡" : project.status === "dormant" ? "🟠" : "🔴";
									
									// Use a clickable span that will be wired up by post-processor
									content += `  - ${icon} ${healthIcon} <span data-errl-open="${project.path}" style="cursor: pointer; text-decoration: underline; color: var(--text-link);">${project.name}</span> — last touched ${daysText}\n`;
								}
								if (pulseData.length > maxEntries) {
									content += `  <div class="errl-pulse-placeholder">+${pulseData.length - maxEntries} more</div>\n`;
								}
							} else {
								content += `  <div class="errl-pulse-placeholder">*No projects found*</div>\n`;
							}
						}
					}
				} catch (error) {
					content += `  <div class="errl-pulse-placeholder">*Error loading project pulse*</div>\n`;
				}
				content += `${!isLowEnergyMode && settings.basesEnabled?.projectPulse ? `  <button data-errl-open="${settings.projectPulseBasePath || "ErrlOS/Project-Pulse.base"}" class="errl-btn">Open Project Pulse Base</button>\n` : ''}${settings.showLegacyIndexLinks ? `  <button data-errl-cmd="errl-os:view-project-pulse" class="errl-btn errl-btn-ghost errl-btn-legacy">View Project Pulse</button>\n` : ''}</div>\n\n`;
			}
		}

		// Tier 1: Energy System
		if (!hiddenOrgans.includes("energy") && !this.isCardHidden("energy")) {
			const energyOrgan = this.kernel.getRegistry().get("energy") as any;
			if (energyOrgan && this.kernel.isOrganEnabled("energy")) {
				const energyLevel = energyOrgan.getEnergyLevel ? energyOrgan.getEnergyLevel() : "medium";
				const momentum = energyOrgan.getMomentum ? energyOrgan.getMomentum() : 0;
				content += `<div class="errl-card">
  <div class="errl-card-title">⚡ Energy System</div>
${!isLowEnergyMode ? `  <div class="errl-card-sub">Track your energy level and momentum. Adjusts dashboard based on your state (${energyLevel}, momentum: ${momentum})</div>\n` : ''}  <button data-errl-cmd="errl-os:view-energy" class="errl-btn errl-btn-ghost">View Energy</button>
</div>\n\n`;
			}
		}

		// Tier 1: Today's Context
		if ((!hiddenOrgans.includes("context") || !isLowEnergyMode) && !this.isCardHidden("context")) {
			content += `<div class="errl-card">
  <div class="errl-card-title">📅 Today's Context</div>
${!isLowEnergyMode ? `  <div class="errl-card-sub">${today}</div>\n` : ''}${!isLowEnergyMode ? '  <div class="errl-pulse-placeholder">- Current focus: <em>(tap to set)</em></div>\n' : ''}</div>\n\n`;
		}

		// Tier 2: Time Machine
		if (!hiddenOrgans.includes("timeMachine") && !this.isCardHidden("timeMachine")) {
			content += `<div class="errl-card">
  <div class="errl-card-title">⏰ Time Machine</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Session logging and history. Track your work over time</div>\n' : ''}`;

			const timeMachineOrgan = this.kernel.getRegistry().get("timeMachine") as TimeMachineOrgan | undefined;
			if (timeMachineOrgan && this.kernel.isOrganEnabled("timeMachine")) {
				try {
					const logPath = settings.timeMachineLogPath || "";
					
					// Check if log path is configured (should always be set, but check anyway)
					if (!logPath || logPath.trim() === "") {
						content += `  <div class="errl-pulse-placeholder">*Configure log path in settings*</div>\n`;
					} else {
						// Check if log folder exists
						const logDir = this.plugin.app.vault.getAbstractFileByPath(logPath);
						if (!logDir || !(logDir instanceof TFolder)) {
							content += `  <div class="errl-pulse-placeholder">*Log folder not found. Check path in settings.*</div>\n`;
						} else {
							const maxEntries = isLowEnergyMode ? 2 : 4;
							// Get maxEntries + 1 to check if there are more logs
							const recentLogs = await timeMachineOrgan.getRecentLogs(maxEntries + 1);
							if (recentLogs.length > 0) {
								const hasMore = recentLogs.length > maxEntries;
								const logsToShow = recentLogs.slice(0, maxEntries);
								for (const log of logsToShow) {
									const logDate = log.basename; // YYYY-MM-DD format
									const logDisplayName = logDate.replace(/-/g, "/");
									content += `  - <span data-errl-open="${log.path}" style="cursor: pointer; text-decoration: underline; color: var(--text-link);">${logDisplayName}</span>\n`;
								}
								if (hasMore) {
									// Get total count for accurate overflow message
									const allLogs = await timeMachineOrgan.getRecentLogs(100);
									content += `  <div class="errl-pulse-placeholder">+${allLogs.length - maxEntries} more</div>\n`;
								}
								if (!isLowEnergyMode) {
									if (settings.basesEnabled?.timeMachine) {
										content += `  <button data-errl-open="${settings.timeMachineBasePath || "ErrlOS/Time-Machine.base"}" class="errl-btn">Open Time Machine Base</button>\n`;
									}
									if (settings.showLegacyIndexLinks) {
										content += `  <button data-errl-cmd="errl-os:view-time-machine" class="errl-btn errl-btn-ghost errl-btn-legacy">View Time Machine</button>\n`;
									}
								}
							} else {
								content += `  <div class="errl-pulse-placeholder">*No logs yet*</div>\n`;
								if (!isLowEnergyMode) {
									content += `  <button data-errl-cmd="errl-os:create-session-log" class="errl-btn errl-btn-ghost">Create First Log</button>\n`;
								}
							}
						}
					}
				} catch (error) {
					content += `  <div class="errl-pulse-placeholder">*Error loading logs*</div>\n`;
				}
				content += `</div>\n\n`;
			}
		}

		// Tier 2: Lore Engine
		if (!hiddenOrgans.includes("loreEngine") && !this.isCardHidden("loreEngine")) {
			const loreEngineOrgan = this.kernel.getRegistry().get("loreEngine");
			if (loreEngineOrgan && this.kernel.isOrganEnabled("loreEngine")) {
				const loreEnginePaths = settings.loreEnginePaths || [];
				content += `<div class="errl-card">
  <div class="errl-card-title">📚 Lore Engine</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Index and link entities (characters, places, concepts). Auto-linking system</div>\n' : ''}`;
				
				// Check if paths are configured
				if (loreEnginePaths.length === 0) {
					content += `  <div class="errl-pulse-placeholder">*Configure entity paths in settings*</div>\n`;
				} else {
					// Check if any paths exist
					const missingPaths: string[] = [];
					for (const path of loreEnginePaths) {
						const dir = this.plugin.app.vault.getAbstractFileByPath(path);
						if (!dir || !(dir instanceof TFolder)) {
							missingPaths.push(path);
						}
					}
					
					if (missingPaths.length === loreEnginePaths.length) {
						content += `  <div class="errl-pulse-placeholder">*Entity folders not found. Check paths in settings.*</div>\n`;
					} else if (missingPaths.length > 0) {
						content += `  <div class="errl-pulse-placeholder">*Some paths not found. Check settings.*</div>\n`;
					}
				}
				
				content += `${!isLowEnergyMode && settings.basesEnabled?.lore ? `  <button data-errl-open="${settings.loreBasePath || "ErrlOS/Lore.base"}" class="errl-btn">Open Lore Base</button>\n` : ''}${settings.showLegacyIndexLinks ? `  <button data-errl-cmd="errl-os:view-lore-index" class="errl-btn errl-btn-ghost errl-btn-legacy">View Lore Index</button>\n` : ''}</div>\n\n`;
			}
		}

		// Tier 2: Reality Map
		if (!hiddenOrgans.includes("realityMap") && !this.isCardHidden("realityMap")) {
			const realityMapOrgan = this.kernel.getRegistry().get("realityMap");
			if (realityMapOrgan && this.kernel.isOrganEnabled("realityMap")) {
				const settings = this.kernel.getSettings();
				const mapPath = (settings as any).realityMapPath || "ErrlOS/Reality-Map.md";
				content += `<div class="errl-card">
  <div class="errl-card-title">🗺️ Reality Map</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Spatial knowledge mapping. Visualize relationships in space</div>\n' : ''}  <button data-errl-open="${mapPath}" class="errl-btn errl-btn-ghost">Open Reality Map</button>
</div>\n\n`;
			}
		}

		// Tier 2: Promotion Flows
		if (!hiddenOrgans.includes("promotion") && !this.isCardHidden("promotion")) {
			const promotionOrgan = this.kernel.getRegistry().get("promotion");
			if (promotionOrgan && this.kernel.isOrganEnabled("promotion")) {
				content += `<div class="errl-card">
  <div class="errl-card-title">⬆️ Promotion Flows</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Move content between systems: Capture → Project → Lore</div>\n' : ''}  <button data-errl-cmd="errl-os:promote-content" class="errl-btn errl-btn-ghost">Promote Content</button>
</div>\n\n`;
			}
		}

		// Tier 3: Dream Buffer
		if (!hiddenOrgans.includes("dreamBuffer") && !this.isCardHidden("dreamBuffer")) {
			const dreamBufferOrgan = this.kernel.getRegistry().get("dreamBuffer");
			if (dreamBufferOrgan && this.kernel.isOrganEnabled("dreamBuffer")) {
				const settings = this.kernel.getSettings();
				const dreamPath = (settings as any).dreamBufferPath || "ErrlOS/Dream-Buffer.md";
				content += `<div class="errl-card">
  <div class="errl-card-title">💭 Dream Buffer</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Unstructured creative capture. Free-form idea dumping</div>\n' : ''}  <button data-errl-open="${dreamPath}" class="errl-btn errl-btn-ghost">Open Dream Buffer</button>
</div>\n\n`;
			}
		}

		// Tier 3: Thought Recycler
		if (!hiddenOrgans.includes("thoughtRecycler") && !this.isCardHidden("thoughtRecycler")) {
			const thoughtRecyclerOrgan = this.kernel.getRegistry().get("thoughtRecycler");
			if (thoughtRecyclerOrgan && this.kernel.isOrganEnabled("thoughtRecycler")) {
				content += `<div class="errl-card">
  <div class="errl-card-title">♻️ Thought Recycler</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Resurface forgotten ideas. Find abandoned projects and old thoughts</div>\n' : ''}  <button data-errl-cmd="errl-os:resurface-ideas" class="errl-btn errl-btn-ghost">Resurface Ideas</button>
</div>\n\n`;
			}
		}


		// Tier 3: Prompt Forge
		if (!hiddenOrgans.includes("promptForge") && !this.isCardHidden("promptForge")) {
			const promptForgeOrgan = this.kernel.getRegistry().get("promptForge");
			if (promptForgeOrgan && this.kernel.isOrganEnabled("promptForge")) {
				content += `<div class="errl-card">
  <div class="errl-card-title">🔨 Prompt Forge</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Generate and manage prompts for AI tools and creative work</div>\n' : ''}  <button data-errl-cmd="errl-os:forge-prompt" class="errl-btn errl-btn-ghost">Forge Prompt</button>
</div>\n\n`;
			}
		}

		// Tier 3: Asset Brain
		if (!hiddenOrgans.includes("assetBrain") && !this.isCardHidden("assetBrain")) {
			const assetBrainOrgan = this.kernel.getRegistry().get("assetBrain");
			if (assetBrainOrgan && this.kernel.isOrganEnabled("assetBrain")) {
				const settings = this.kernel.getSettings();
				const assetPath = (settings as any).assetBrainIndexPath || "ErrlOS/Asset-Index.md";
				content += `<div class="errl-card">
  <div class="errl-card-title">🎨 Asset Brain</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Track and index creative assets (images, shaders, code snippets)</div>\n' : ''}${!isLowEnergyMode && settings.basesEnabled?.assetBrain ? `  <button data-errl-open="${settings.assetBrainBasePath || "ErrlOS/Asset-Brain.base"}" class="errl-btn">Open Asset Brain Base</button>\n` : ''}${settings.showLegacyIndexLinks ? `  <button data-errl-open="${assetPath}" class="errl-btn errl-btn-ghost errl-btn-legacy">View Assets</button>\n` : ''}</div>\n\n`;
			}
		}

		// Tier 4: Dashboard
		if (!this.isCardHidden("dashboard")) {
			content += `<div class="errl-card errl-card-essential">
  <div class="errl-card-title">⚙️ Dashboard</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">System control and refresh. Regenerate modules + project pulse</div>\n' : ''}  <button data-errl-cmd="errl-os:refresh-dashboard" class="errl-btn">Refresh Dashboard</button>
</div>\n\n`;
		}

		// Tier 4: System Monitor
		if (!hiddenOrgans.includes("systemMonitor") && !this.isCardHidden("systemMonitor")) {
			try {
				const systemMonitorCard = await this.generateSystemMonitorCard(isLowEnergyMode);
				content += systemMonitorCard;
			} catch (error) {
				console.error("[Errl OS] Error generating system monitor card:", error);
				content += `<div class="errl-card">
  <div class="errl-card-title">🔍 System Monitor</div>
  <div class="errl-pulse-placeholder">*Error loading system monitor*</div>
</div>\n\n`;
			}
		}

		// Tier 4: Modules card (condensed)
		if (!hiddenOrgans.includes("modules") && !this.isCardHidden("modules")) {
			content += `<div class="errl-card">
  <div class="errl-card-title">🔧 Modules</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Module configuration. Turn systems on/off</div>\n' : ''}`;

		if (enabledOrgans.length === 0) {
			content += `  <div class="errl-pulse-placeholder">*No modules enabled*</div>\n`;
		} else {
			// Show all available organs with their status in condensed format
			const allOrgans = this.kernel.getRegistry().getAll();
			const organStatus: { [key: string]: boolean } = {};
			allOrgans.forEach(organ => {
				organStatus[organ.getId()] = this.kernel.isOrganEnabled(organ.getId());
			});
			
			// Ordered by importance: Core Workflow → Support Systems → Creative/Expansion
			const organNamesOrdered: [string, string][] = [
				// Core Workflow
				["dashboard", "Dashboard"],
				["capture", "Capture"],
				["projectPulse", "Project Pulse"],
				["timeMachine", "Time Machine"],
				["energy", "Energy System"],
				// Support Systems
				["frictionScanner", "Friction Scanner"],
				["ritual", "Ritual Engine"],
				["entropyDial", "Entropy Dial"],
				["thoughtRecycler", "Thought Recycler"],
				["sessionGhost", "Session Ghost"],
				// Creative/Expansion
				["dreamBuffer", "Dream Buffer"],
				["assetBrain", "Asset Brain"],
				["promptForge", "Prompt Forge"],
				["promotion", "Promotion Flows"],
				["loreEngine", "Lore Engine"],
				["realityMap", "Reality Map"]
			];
			
			// Add legend row
			content += `  <div class="errl-module-legend">\n`;
			content += `    <span class="errl-module-legend-item"><span class="errl-module-status-bubble errl-module-status-on"></span> ON</span>\n`;
			content += `    <span class="errl-module-legend-item"><span class="errl-module-status-bubble errl-module-status-off"></span> OFF</span>\n`;
			content += `  </div>\n`;
			
			// Generate HTML with grid container
			content += `  <div class="errl-module-grid">\n`;
			let moduleCount = 0;
			for (const [id, name] of organNamesOrdered) {
				const isEnabled = organStatus[id] || false;
				const statusClass = isEnabled ? "errl-module-status-on" : "errl-module-status-off";
				content += `    <div class="errl-module-item"><span class="errl-module-name">${name}</span><span class="errl-module-status-bubble ${statusClass}"></span></div>\n`;
				moduleCount++;
			}
			console.log(`[Errl OS] Dashboard: Generated ${moduleCount} modules in HTML (expected 17)`);
			content += `  </div>\n`;
		}

		// Add Settings button for quick access to module toggles
		if (!isLowEnergyMode) {
			content += `  <button data-errl-cmd="app:open-settings" class="errl-btn errl-btn-ghost">⚙️ Open Settings</button>\n`;
		}

			content += `</div>\n\n`;
		}

		// Tier 4: Friction Scanner
		if (!hiddenOrgans.includes("frictionScanner") && !this.isCardHidden("frictionScanner")) {
			const frictionOrgan = this.kernel.getRegistry().get("frictionScanner");
			if (frictionOrgan && this.kernel.isOrganEnabled("frictionScanner")) {
				content += `<div class="errl-card">
  <div class="errl-card-title">🔍 Friction Scanner</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Detect workflow friction. Find abandoned projects and missing links</div>\n' : ''}  <button data-errl-cmd="errl-os:scan-friction" class="errl-btn errl-btn-ghost">Scan Friction</button>
</div>\n\n`;
			}
		}

		// Tier 4: Ritual Engine
		if (!hiddenOrgans.includes("ritual") && !this.isCardHidden("ritual")) {
            const ritualOrgan = this.kernel.getRegistry().get("ritual");
            if (ritualOrgan && this.kernel.isOrganEnabled("ritual")) {
                content += `<div class="errl-card">
  <div class="errl-card-title">🔄 Ritual Engine</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Structured transitions: session start/end, project completion</div>\n' : ''}  <button data-errl-cmd="errl-os:create-ritual" class="errl-btn">Create Ritual</button>
${!isLowEnergyMode && settings.basesEnabled?.ritual ? `  <button data-errl-open="${settings.ritualBasePath || "ErrlOS/Rituals.base"}" class="errl-btn">Open Ritual Base</button>\n` : ''}</div>\n\n`;
            }
		}

		// Tier 4: Entropy Dial
		if (!hiddenOrgans.includes("entropyDial") && !this.isCardHidden("entropyDial")) {
			const entropyOrgan = this.kernel.getRegistry().get("entropyDial") as any;
			if (entropyOrgan && this.kernel.isOrganEnabled("entropyDial")) {
				const entropyLevel = entropyOrgan.getEntropyLevel ? entropyOrgan.getEntropyLevel() : 50;
				const entropyState = entropyOrgan.getEntropyState ? entropyOrgan.getEntropyState() : "Balanced";
				content += `<div class="errl-card">
  <div class="errl-card-title">🎲 Entropy Dial</div>
${!isLowEnergyMode ? `  <div class="errl-card-sub">Control creativity vs structure. Adjusts idea generation style (${entropyState}, ${entropyLevel}%)</div>\n` : ''}  <button data-errl-cmd="errl-os:adjust-entropy" class="errl-btn errl-btn-ghost">Adjust Entropy</button>
</div>\n\n`;
			}
		}

		// Tier 4: Session Ghost
		if (!hiddenOrgans.includes("sessionGhost") && !this.isCardHidden("sessionGhost")) {
			const sessionGhostOrgan = this.kernel.getRegistry().get("sessionGhost");
			if (sessionGhostOrgan && this.kernel.isOrganEnabled("sessionGhost")) {
				// Check if tracking is active
				const isTracking = (sessionGhostOrgan as any).isTrackingActive?.() || false;
				const trackingStatus = isTracking ? '<span class="errl-session-ghost-status errl-session-ghost-active">● Tracking</span>' : '<span class="errl-session-ghost-status errl-session-ghost-inactive">○ Not Tracking</span>';
				const trackingButtonCmd = isTracking ? "session-ghost-stop-tracking" : "session-ghost-start-tracking";
				content += `<div class="errl-card">
  <div class="errl-card-title">👻 Session Ghost ${trackingStatus}</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Track active notes and sessions. See what you\'re working on</div>\n' : ''}  <button data-errl-cmd="${trackingButtonCmd}" class="errl-btn errl-btn-ghost">${isTracking ? 'Stop Tracking' : 'Start Tracking'}</button>
  <button data-errl-cmd="view-session-ghost" class="errl-btn errl-btn-ghost">View Sessions</button>
</div>\n\n`;
			}
		}

		content += `</div>
`;

		return content;
	}

	/**
	 * Generate System Monitor card content
	 * Collects status from all organs and displays health indicators, configuration issues, and runtime errors
	 */
	private async generateSystemMonitorCard(isLowEnergyMode: boolean): Promise<string> {
		const allOrgans = this.kernel.getRegistry().getAll();
		
		// Collect status from all organs with error handling
		const statuses: OrganStatus[] = [];
		for (const organ of allOrgans) {
			try {
				const status = await organ.getStatus();
				statuses.push(status);
			} catch (error) {
				// If getStatus() itself throws, create a minimal error status
				const errorMessage = error instanceof Error ? error.message : String(error);
				statuses.push({
					organId: organ.getId(),
					organName: organ.getName(),
					enabled: organ.isEnabled(),
					health: "error",
					description: "Error getting status",
					phase: "Phase 1: Foundation",
					runtimeError: `Failed to get status: ${errorMessage}`,
				});
			}
		}

		// Group by phase
		const byPhase: Record<string, OrganStatus[]> = {
			"Phase 1: Foundation": [],
			"Phase 2: Stability": [],
			"Phase 3: Intelligence": [],
			"Phase 4: Adaptation": [],
			"Phase 5: Weird Power": [],
		};

		for (const status of statuses) {
			if (byPhase[status.phase]) {
				byPhase[status.phase].push(status);
			} else {
				byPhase[status.phase] = [status];
			}
		}

		// Calculate overall health
		let healthyCount = 0;
		let warningCount = 0;
		let errorCount = 0;
		let unknownCount = 0;
		const errors: Array<{ name: string; error: string }> = [];

		for (const status of statuses) {
			if (status.runtimeError) {
				errorCount++;
				errors.push({ name: status.organName, error: status.runtimeError });
			} else {
				switch (status.health) {
					case "healthy":
						healthyCount++;
						break;
					case "warning":
						warningCount++;
						break;
					case "error":
						errorCount++;
						break;
					default:
						unknownCount++;
						break;
				}
			}

			// Also check configuration issues
			if (status.configurationStatus?.issues && status.configurationStatus.issues.length > 0) {
				errorCount++;
			} else if (status.configurationStatus?.warnings && status.configurationStatus.warnings.length > 0) {
				warningCount++;
			}
		}

		const total = statuses.length;
		let overallHealth = "🟢 Good";
		if (errorCount > 0) {
			overallHealth = "🔴 Critical";
		} else if (warningCount > 0) {
			overallHealth = "🟡 Warning";
		} else if (unknownCount > total / 2) {
			overallHealth = "⚪ Unknown";
		}

		// Generate card content
		let cardContent = `<div class="errl-card">
  <div class="errl-card-title">🔍 System Monitor</div>
${!isLowEnergyMode ? '  <div class="errl-card-sub">Organ health and status overview</div>\n' : ''}
  <div class="errl-system-health">
    System Health: ${overallHealth} (${healthyCount} healthy, ${warningCount} warnings, ${errorCount} errors${unknownCount > 0 ? `, ${unknownCount} unknown` : ""})
  </div>
`;

		// Show runtime errors prominently
		if (errors.length > 0) {
			cardContent += `\n  <div class="errl-system-errors">
    🔴 Runtime Errors:
`;
			for (const err of errors) {
				cardContent += `    - <strong>${err.name}</strong>: ${err.error}\n`;
			}
			cardContent += `  </div>\n`;
		}

		// Group by phase with collapsible details
		const phaseOrder = [
			"Phase 1: Foundation",
			"Phase 2: Stability",
			"Phase 3: Intelligence",
			"Phase 4: Adaptation",
			"Phase 5: Weird Power",
		];

		for (const phase of phaseOrder) {
			const phaseOrgans = byPhase[phase] || [];
			if (phaseOrgans.length === 0) continue;

			const phaseHealthy = phaseOrgans.filter(s => s.health === "healthy" && !s.runtimeError).length;
			const phaseTotal = phaseOrgans.length;

			cardContent += `\n  <details>
    <summary><strong>${phase}</strong> (${phaseHealthy}/${phaseTotal} healthy)</summary>
`;

			for (const status of phaseOrgans) {
				const healthIcon = status.runtimeError 
					? "🔴" 
					: status.health === "healthy" 
						? "🟢" 
						: status.health === "warning" 
							? "🟡" 
							: status.health === "error" 
								? "🔴" 
								: "⚪";

				cardContent += `    - ${healthIcon} <strong>${status.organName}</strong>`;
				
				if (status.enabled) {
					cardContent += ` (ON)`;
				} else {
					cardContent += ` (OFF)`;
				}

				if (!isLowEnergyMode && status.description) {
					cardContent += ` — ${status.description}`;
				}

				// Show configuration issues
				if (status.configurationStatus) {
					if (status.configurationStatus.issues && status.configurationStatus.issues.length > 0) {
						cardContent += `\n      <span style="color: var(--text-error);">❌ Issues: ${status.configurationStatus.issues.join("; ")}</span>`;
					}
					if (status.configurationStatus.warnings && status.configurationStatus.warnings.length > 0) {
						cardContent += `\n      <span style="color: var(--text-warning);">⚠️ Warnings: ${status.configurationStatus.warnings.join("; ")}</span>`;
					}
				}

				// Show runtime error
				if (status.runtimeError) {
					cardContent += `\n      <span style="color: var(--text-error);">🔴 Error: ${status.runtimeError}</span>`;
				}

				cardContent += `\n`;
			}

			cardContent += `  </details>\n`;
		}

		cardContent += `\n  <button data-errl-cmd="errl-os:refresh-dashboard" class="errl-btn errl-btn-ghost">Refresh Status</button>
</div>

`;

		return cardContent;
	}

	// Status reporting methods
	protected getDescription(): string {
		return "Home screen of Errl OS. Creates and manages the dashboard markdown note with interactive cards for all organs.";
	}

	protected getPhase() {
		return "Phase 1: Foundation" as const;
	}

	protected async getConfigurationStatus(): Promise<OrganConfigurationStatus | undefined> {
		const settings = this.kernel.getSettings();
		const path = settings.dashboardPath || this.dashboardPath;
		
		if (!path || path.trim() === "") {
			return {
				configured: false,
				issues: ["Dashboard path not configured"]
			};
		}

		// Check if dashboard file exists or can be created
		const file = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!file) {
			// File doesn't exist, but that's okay - we'll create it
			// Check if parent directory exists
			const parentPath = path.substring(0, path.lastIndexOf("/"));
			if (parentPath && parentPath !== path) {
				const parent = this.plugin.app.vault.getAbstractFileByPath(parentPath);
				if (!parent || !(parent instanceof TFolder)) {
					return {
						configured: false,
						issues: [`Parent directory does not exist: ${parentPath}`]
					};
				}
			}
		}

		return { configured: true };
	}

	/**
	 * Open the System Base (master Base tracking all ErrlOS data)
	 */
	private async openSystemBase(): Promise<void> {
		try {
			const baseFile = await this.ensureSystemBaseExists();
			if (baseFile) {
				await BaseManager.openBase(this.plugin.app, baseFile.path);
			}
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { operation: "openSystemBase" });
			ErrorHandler.showErrorNotice(errorInfo);
			console.error("[Errl OS] Failed to open system base:", errorInfo.message, errorInfo.context);
		}
	}

	/**
	 * Ensure System Base exists, creating it if necessary
	 * System Base tracks all ErrlOS data across all organs
	 */
	private async ensureSystemBaseExists(): Promise<TFile> {
		const settings = this.kernel.getSettings();
		const basePath = settings.systemBasePath || "ErrlOS/System.base";

		// Comprehensive filter covering all ErrlOS data types
		const baseConfig: BaseConfig = {
			filters: `note.type in ["capture", "ritual", "lore", "project", "session"] OR file.extension in ["svg", "png", "jpg", "jpeg", "glsl"]`,
			properties: {
				type: { displayName: "Type" },
				organ: { displayName: "Organ" },
				created: { displayName: "Created" },
				modified: { displayName: "Modified" },
				status: { displayName: "Status" },
				tags: { displayName: "Tags" },
				ageInDays: { displayName: "Age (Days)" },
				isRecent: { displayName: "Is Recent" },
			},
			formulas: {
				// Cross-organ formulas for common metrics
				ageInDays: `if(note.capturedAt, (date.now() - note.capturedAt) / 86400000, if(note.lastTouched, (date.now() - note.lastTouched) / 86400000, if(note.start, (date.now() - note.start) / 86400000, 0)))`,
				isRecent: `if(note.capturedAt, date.now() - note.capturedAt < 7 days, if(note.lastTouched, date.now() - note.lastTouched < 7 days, if(note.start, date.now() - note.start < 7 days, false)))`,
			},
			views: [
				{
					type: "table",
					name: "All ErrlOS Data",
					order: ["note.type", "file.name", "file.mtime"],
				},
				{
					type: "table",
					name: "By Type",
					groupBy: "note.type",
					order: ["file.name", "file.mtime"],
				},
				{
					type: "table",
					name: "By Organ",
					groupBy: "note.organ",
					order: ["note.type", "file.name"],
				},
				{
					type: "table",
					name: "Recent Activity",
					order: ["file.mtime", "file.name"],
				},
				{
					type: "table",
					name: "By Status",
					groupBy: "note.status",
					order: ["note.type", "file.name"],
				},
				{
					type: "table",
					name: "Recent Items",
					filter: `isRecent = true`,
					order: ["file.mtime", "file.name"],
				},
			],
		};

		return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
	}
}
