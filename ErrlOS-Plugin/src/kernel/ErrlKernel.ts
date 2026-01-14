import { App, Plugin } from "obsidian";
import { ModuleRegistry } from "./ModuleRegistry";
import { SharedAPIs } from "./SharedAPIs";
import { EventBus } from "./EventBus";
import { CapabilityRegistry } from "./CapabilityRegistry";
import { ServiceRouter } from "./ServiceRouter";
import { Organ } from "../organs/base/Organ";
import { ErrlSettings, DEFAULT_SETTINGS } from "../settings/ErrlSettings";
import { DependencyChecker } from "../utils/DependencyChecker";
import { ErrorHandler } from "../utils/ErrorHandler";
import { Notice } from "obsidian";

type PlainObject = Record<string, any>;

const isPlainObject = (value: unknown): value is PlainObject => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const cloneSettings = <T>(value: T): T => {
	return JSON.parse(JSON.stringify(value));
};

const deepMergeObjects = <T>(target: T, source?: Partial<T>): T => {
	if (!source) {
		return target;
	}

	const output: PlainObject = Array.isArray(target)
		? [...(target as any)]
		: { ...(target as any) };

	for (const key of Object.keys(source) as Array<keyof T>) {
		const sourceValue = source[key];
		if (sourceValue === undefined) {
			continue;
		}

		if (Array.isArray(sourceValue)) {
			output[key as string] = [...sourceValue];
			continue;
		}

		if (isPlainObject(sourceValue)) {
			const targetValue = output[key as string];
			const base = isPlainObject(targetValue) ? { ...targetValue } : {};
			output[key as string] = deepMergeObjects(base, sourceValue as any);
			continue;
		}

		output[key as string] = sourceValue;
	}

	return output as T;
};

/**
 * Errl OS Kernel - Core orchestrator for the operating system
 * Provides module registry, command routing, and shared APIs
 */
export class ErrlKernel {
	private registry: ModuleRegistry;
	private sharedAPIs: SharedAPIs;
	private eventBus: EventBus;
	private capabilityRegistry: CapabilityRegistry;
	private serviceRouter: ServiceRouter;
	private settings: ErrlSettings;
	private plugin: Plugin;
	private app: App;
	private consentChecker?: (organ: Organ, hasSeen: boolean, showAgain: boolean) => Promise<boolean>;

	constructor(plugin: Plugin, app: App) {
		this.plugin = plugin;
		this.app = app;
		this.registry = new ModuleRegistry();
		this.sharedAPIs = new SharedAPIs(app);
		this.eventBus = new EventBus();
		this.capabilityRegistry = new CapabilityRegistry();
		this.serviceRouter = new ServiceRouter(this.capabilityRegistry, this.registry);
		this.settings = cloneSettings(DEFAULT_SETTINGS);
	}

	/**
	 * Load settings from plugin data
	 * 
	 * @throws Error if settings cannot be loaded
	 */
	async loadSettings(): Promise<void> {
		try {
			const loaded = await this.plugin.loadData();
			if (loaded) {
				const merged = deepMergeObjects(
					cloneSettings(DEFAULT_SETTINGS),
					loaded as Partial<ErrlSettings>
				);
				this.settings = merged;
			} else {
				this.settings = cloneSettings(DEFAULT_SETTINGS);
			}
		} catch (error) {
			console.error("[Errl OS] Failed to load settings:", error);
			// Continue with default settings if load fails
			this.settings = cloneSettings(DEFAULT_SETTINGS);
		}
	}

	/**
	 * Save settings to plugin data
	 * 
	 * @throws Error if settings cannot be saved
	 */
	async saveSettings(): Promise<void> {
		try {
			await this.plugin.saveData(this.settings);
		} catch (error) {
			console.error("[Errl OS] Failed to save settings:", error);
			throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Get current settings
	 * 
	 * @returns Current settings object (read-only copy)
	 */
	getSettings(): ErrlSettings {
		return this.settings;
	}

	/**
	 * Update settings with partial updates
	 * 
	 * @param updates - Partial settings object with fields to update
	 * @throws Error if settings cannot be saved
	 */
	async updateSettings(updates: Partial<ErrlSettings>): Promise<void> {
		try {
			const current = cloneSettings(this.settings);
			this.settings = deepMergeObjects(current, updates);
			await this.saveSettings();
		} catch (error) {
			console.error("[Errl OS] Failed to update settings:", error);
			throw error;
		}
	}

	/**
	 * Register an organ with the kernel
	 * 
	 * @param organ - The organ instance to register
	 */
	registerOrgan(organ: Organ): void {
		this.registry.register(organ);
	}

	/**
	 * Get the module registry
	 * 
	 * @returns The module registry instance
	 */
	getRegistry(): ModuleRegistry {
		return this.registry;
	}

	/**
	 * Get shared APIs
	 * 
	 * @returns The shared APIs instance
	 */
	getSharedAPIs(): SharedAPIs {
		return this.sharedAPIs;
	}

	/**
	 * Get the event bus
	 * 
	 * @returns The event bus instance
	 */
	getEventBus(): EventBus {
		return this.eventBus;
	}

	/**
	 * Get the capability registry
	 * 
	 * @returns The capability registry instance
	 */
	getCapabilityRegistry(): CapabilityRegistry {
		return this.capabilityRegistry;
	}

	/**
	 * Get the service router
	 * 
	 * @returns The service router instance
	 */
	getServiceRouter(): ServiceRouter {
		return this.serviceRouter;
	}

	/**
	 * Initialize the kernel and load all organs
	 * 
	 * Loads settings and initializes all registered organs, but does NOT auto-enable them.
	 * Organs must be explicitly enabled by the user through settings or commands,
	 * and will show walkthroughs before enabling.
	 * 
	 * @throws Error if initialization fails
	 */
	async initialize(): Promise<void> {
		try {
			await this.loadSettings();
			
			// Load all registered organs (but don't enable them yet)
			await this.registry.loadAll();

			// Note: We no longer auto-enable organs here. Users must explicitly enable them
			// through settings UI, which will show walkthroughs before enabling.
			// This ensures users understand what each organ does before it becomes active.
			
			// Only enable organs if user has already consented (from previous session)
			// This maintains state across reloads while still requiring initial consent
			for (const organ of this.registry.getAll()) {
				const organId = organ.getId();
				const enabled = this.settings.enabledOrgans[organId as keyof typeof this.settings.enabledOrgans];
				const hasConsent = this.settings.organConsents[organId]?.consented === true;
				
				if (enabled && hasConsent) {
					// User previously enabled and consented - enable silently
					try {
						// Directly enable without walkthrough since user already consented
						await this.registry.enable(organId);
					} catch (error) {
						console.error(`[Errl OS] Failed to enable organ ${organId} on init:`, error);
						// Continue with other organs even if one fails
					}
				} else if (enabled && !hasConsent) {
					// Enabled in settings but no consent - disable it
					// This handles the case where settings were migrated but consent wasn't recorded
					await this.updateSettings({
						enabledOrgans: {
							...this.settings.enabledOrgans,
							[organId]: false,
						},
					});
				}
			}
		} catch (error) {
			console.error("[Errl OS] Kernel initialization failed:", error);
			throw new Error(`Failed to initialize kernel: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Enable an organ (with consent check)
	 * Shows walkthrough if user hasn't seen it before or wants to see it again
	 * 
	 * @param id - The organ ID to enable
	 * @param skipWalkthrough - If true, skip walkthrough (used internally)
	 * @throws Error if organ cannot be enabled or user cancels
	 */
	async enableOrgan(id: string, skipWalkthrough: boolean = false): Promise<void> {
		const organ = this.registry.get(id);
		if (!organ) {
			throw new Error(`Organ ${id} not found`);
		}

		// Check dependencies before enabling
		const dependencyCheck = DependencyChecker.checkDependencies(this, organ);
		if (!dependencyCheck.canEnable) {
			const message = DependencyChecker.getDependencyMessage(dependencyCheck, organ.getName());
			throw new Error(message);
		}

		// Show warnings for missing optional dependencies
		if (dependencyCheck.warnings.length > 0 && !skipWalkthrough) {
			for (const warning of dependencyCheck.warnings) {
				new Notice(`Warning: ${warning}`);
			}
		}

			// Check consent and show walkthrough if needed
			if (!skipWalkthrough) {
				const hasSeenWalkthrough = this.settings.organWalkthroughsShown[id] || false;
				const showWalkthroughAgain = !this.settings.organWalkthroughsShown[id]; // Show if not seen before
				
				// Check if organ version changed (requires re-consent)
				const documentation = organ.getDocumentation?.();
				const currentVersion = documentation?.version || "1.0.0";
				const previousConsent = this.settings.organConsents[id];
				const versionChanged = previousConsent && previousConsent.version !== currentVersion;
				
				// Show walkthrough if not seen before OR if version changed
				const shouldShowWalkthrough = !hasSeenWalkthrough || versionChanged;
				
				const consented = await this.checkOrganConsent(organ, hasSeenWalkthrough, shouldShowWalkthrough);
				
				if (!consented) {
					throw new Error(`User cancelled enabling organ ${id}`);
				}

				// Record that user has seen walkthrough
				await this.updateSettings({
					organWalkthroughsShown: {
						...this.settings.organWalkthroughsShown,
						[id]: true,
					},
				});
			}

			try {
				await this.registry.enable(id);
				// Get organ version from documentation if available
				const documentation = organ.getDocumentation?.();
				const organVersion = documentation?.version || "1.0.0";

				const updates: Partial<ErrlSettings> = {
					enabledOrgans: {
						...this.settings.enabledOrgans,
						[id]: true,
					},
					organConsents: {
						...this.settings.organConsents,
						[id]: {
							consented: true,
							timestamp: Date.now(),
							version: organVersion,
						},
					},
				};
				await this.updateSettings(updates);
		} catch (error) {
			const errorInfo = ErrorHandler.handleError(error, { organId: id, operation: "enableOrgan" });
			console.error(`[Errl OS] Failed to enable organ ${id}:`, errorInfo.message);
			throw new Error(`Failed to enable organ ${id}: ${errorInfo.message}`);
		}
	}

	/**
	 * Check organ consent (private helper)
	 * Can be overridden for testing by setting consentChecker
	 */
	private async checkOrganConsent(
		organ: Organ,
		hasSeenWalkthrough: boolean,
		showWalkthroughAgain: boolean
	): Promise<boolean> {
		if (this.consentChecker) {
			return await this.consentChecker(organ, hasSeenWalkthrough, showWalkthroughAgain);
		}
		// Dynamic import to avoid circular dependencies
		const { WalkthroughHelper } = await import("../utils/WalkthroughHelper");
		return await WalkthroughHelper.checkConsent(this.app, organ, hasSeenWalkthrough, showWalkthroughAgain);
	}

	/**
	 * Set custom consent checker (for testing)
	 */
	setConsentChecker(checker: (organ: Organ, hasSeen: boolean, showAgain: boolean) => Promise<boolean>): void {
		this.consentChecker = checker;
	}

	/**
	 * Disable an organ
	 * 
	 * @param id - The organ ID to disable
	 * @throws Error if organ cannot be disabled
	 */
	async disableOrgan(id: string): Promise<void> {
		try {
			await this.registry.disable(id);
			const updates: Partial<ErrlSettings> = {
				enabledOrgans: {
					...this.settings.enabledOrgans,
					[id]: false,
				},
			};
			await this.updateSettings(updates);
		} catch (error) {
			console.error(`[Errl OS] Failed to disable organ ${id}:`, error);
			throw new Error(`Failed to disable organ ${id}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Check if an organ is enabled
	 * 
	 * @param id - The organ ID to check
	 * @returns True if the organ is enabled, false otherwise
	 */
	isOrganEnabled(id: string): boolean {
		return this.registry.isEnabled(id);
	}

	/**
	 * Get the plugin instance
	 */
	getPlugin(): Plugin {
		return this.plugin;
	}

	/**
	 * Get the app instance
	 */
	getApp(): App {
		return this.app;
	}

	/**
	 * Check if this is the first run
	 * 
	 * @returns True if first run (firstRunCompleted is false), false otherwise
	 */
	isFirstRun(): boolean {
		return !this.settings.firstRunCompleted;
	}

	/**
	 * Cleanup on unload
	 */
	async unload(): Promise<void> {
		await this.registry.unloadAll();
		this.eventBus.clear();
		this.capabilityRegistry.clear();
		this.serviceRouter.clear();
	}
}
