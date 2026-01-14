import { Plugin } from "obsidian";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Capability } from "../../kernel/CapabilityTypes";
import { ServiceRequest, ServiceResponse } from "../../kernel/ServiceTypes";
import { OrganWalkthrough } from "../../utils/OrganWalkthrough";
import { OrganDocumentation } from "./OrganDocumentation";

/**
 * Configuration status for an organ
 */
export interface OrganConfigurationStatus {
	configured: boolean;
	issues?: string[];      // Critical problems (errors)
	warnings?: string[];    // Non-critical issues
}

/**
 * Status information for an organ
 */
export interface OrganStatus {
	organId: string;
	organName: string;
	enabled: boolean;
	health: "healthy" | "warning" | "error" | "unknown";
	description: string;
	phase: "Phase 1: Foundation" | "Phase 2: Stability" | "Phase 3: Intelligence" | "Phase 4: Adaptation" | "Phase 5: Weird Power";
	configurationStatus?: OrganConfigurationStatus;
	metrics?: Record<string, any>;
	lastActivity?: Date;
	dependencies?: string[];
	runtimeError?: string; // Captured errors from enable/disable or status collection
}

/**
 * Base class for all Errl OS organs.
 * Each organ is an independent, optional module that can be enabled/disabled.
 */
export abstract class Organ {
	protected kernel: ErrlKernel;
	protected plugin: Plugin;
	protected enabled: boolean = false;
	private eventSubscriptions: Set<string> = new Set();

	constructor(kernel: ErrlKernel, plugin: Plugin) {
		this.kernel = kernel;
		this.plugin = plugin;
	}

	/**
	 * Unique identifier for this organ
	 */
	abstract getId(): string;

	/**
	 * Human-readable name for this organ
	 */
	abstract getName(): string;

	/**
	 * Called when the organ is loaded (but may not be enabled)
	 */
	abstract onLoad(): Promise<void>;

	/**
	 * Called when the organ is unloaded
	 */
	async onUnload(): Promise<void> {
		// Cleanup event subscriptions
		this.cleanupSubscriptions();
		// Cleanup capabilities
		this.cleanupCapabilities();
		// Cleanup service handlers
		this.cleanupServices();
		// Subclasses should call super.onUnload() if they override this
	}

	/**
	 * Called when the organ is enabled
	 */
	async onEnable(): Promise<void> {
		this.enabled = true;
	}

	/**
	 * Called when the organ is disabled
	 */
	async onDisable(): Promise<void> {
		this.enabled = false;
	}

	/**
	 * Check if this organ is currently enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Register commands that this organ provides
	 * Override this method to register organ-specific commands
	 */
	async registerCommands(): Promise<void> {
		// Override in subclasses
	}

	/**
	 * Publish an event to the event bus
	 * 
	 * @param event - Event name (supports namespacing, e.g., "project:created")
	 * @param data - Optional data to pass to subscribers
	 */
	protected publish(event: string, data?: any): void {
		this.kernel.getEventBus().publish(event, data);
	}

	/**
	 * Subscribe to an event
	 * 
	 * @param event - Event name (supports wildcard "*" for all events)
	 * @param handler - Function to call when event is published
	 * @returns Subscription ID for unsubscribing
	 */
	protected subscribe(event: string, handler: (data?: any) => void): string {
		const subscriptionId = this.kernel.getEventBus().subscribe(event, handler);
		this.eventSubscriptions.add(subscriptionId);
		return subscriptionId;
	}

	/**
	 * Subscribe to an event once (automatically unsubscribes after first call)
	 * 
	 * @param event - Event name
	 * @param handler - Function to call when event is published
	 * @returns Subscription ID
	 */
	protected once(event: string, handler: (data?: any) => void): string {
		const subscriptionId = this.kernel.getEventBus().once(event, handler);
		this.eventSubscriptions.add(subscriptionId);
		return subscriptionId;
	}

	/**
	 * Unsubscribe from an event
	 * 
	 * @param subscriptionId - The subscription ID returned from subscribe()
	 */
	protected unsubscribe(subscriptionId: string): void {
		this.kernel.getEventBus().unsubscribe(subscriptionId);
		this.eventSubscriptions.delete(subscriptionId);
	}

	/**
	 * Cleanup all event subscriptions for this organ
	 * Called automatically on unload
	 */
	protected cleanupSubscriptions(): void {
		for (const subscriptionId of this.eventSubscriptions) {
			this.kernel.getEventBus().unsubscribe(subscriptionId);
		}
		this.eventSubscriptions.clear();
	}

	/**
	 * Register a capability that this organ provides
	 * 
	 * @param capability - The capability to register
	 */
	protected registerCapability(capability: Capability): void {
		this.kernel.getCapabilityRegistry().register(capability);
	}

	/**
	 * Unregister a capability
	 * 
	 * @param capabilityId - The capability ID to unregister
	 */
	protected unregisterCapability(capabilityId: string): void {
		this.kernel.getCapabilityRegistry().unregister(capabilityId);
	}

	/**
	 * Find capabilities by category and/or keyword
	 * 
	 * @param category - Optional category to filter by
	 * @param keyword - Optional keyword to search for
	 * @returns Array of matching capabilities
	 */
	protected findCapabilities(category?: string, keyword?: string): Capability[] {
		const registry = this.kernel.getCapabilityRegistry();
		
		if (category && keyword) {
			// Filter by category first, then search within results
			const categoryResults = registry.findByCategory(category);
			const lowerKeyword = keyword.toLowerCase();
			return categoryResults.filter(cap => 
				cap.name.toLowerCase().includes(lowerKeyword) ||
				cap.description.toLowerCase().includes(lowerKeyword) ||
				cap.id.toLowerCase().includes(lowerKeyword)
			);
		} else if (category) {
			return registry.findByCategory(category);
		} else if (keyword) {
			return registry.search(keyword);
		} else {
			return registry.getAll();
		}
	}

	/**
	 * Get a capability by ID
	 * 
	 * @param capabilityId - The capability ID
	 * @returns The capability, or undefined if not found
	 */
	protected queryCapability(capabilityId: string): Capability | undefined {
		return this.kernel.getCapabilityRegistry().get(capabilityId);
	}

	/**
	 * Cleanup all capabilities for this organ
	 * Called automatically on unload
	 */
	protected cleanupCapabilities(): void {
		this.kernel.getCapabilityRegistry().unregisterByOrgan(this.getId());
	}

	/**
	 * Register a service handler for a capability
	 * 
	 * @param capabilityId - The capability ID to handle
	 * @param handler - Async function that handles the service request
	 */
	protected registerService(
		capabilityId: string,
		handler: (params: Record<string, any>) => Promise<any>
	): void {
		this.kernel.getServiceRouter().registerService(capabilityId, handler);
	}

	/**
	 * Unregister a service handler
	 * 
	 * @param capabilityId - The capability ID to unregister
	 */
	protected unregisterService(capabilityId: string): void {
		this.kernel.getServiceRouter().unregisterService(capabilityId);
	}

	/**
	 * Request a service from another module
	 * 
	 * @param capabilityId - The capability ID to request
	 * @param params - Parameters for the service
	 * @param timeout - Optional timeout in milliseconds (default: 5000)
	 * @returns Promise that resolves to the service response
	 */
	protected async requestService(
		capabilityId: string,
		params: Record<string, any>,
		timeout?: number
	): Promise<ServiceResponse> {
		const request: ServiceRequest = {
			capabilityId,
			parameters: params,
			timeout,
		};
		return await this.kernel.getServiceRouter().request(request);
	}

	/**
	 * Cleanup all service handlers for this organ
	 * Called automatically on unload
	 */
	protected cleanupServices(): void {
		this.kernel.getServiceRouter().unregisterByOrgan(this.getId());
	}

	/**
	 * Get diagnostic/status information about this organ
	 * Wraps status collection in error handling to capture runtime errors
	 * 
	 * @returns Promise that resolves to organ status
	 */
	async getStatus(): Promise<OrganStatus> {
		try {
			const description = this.getDescription?.() || "No description available";
			const phase = this.getPhase?.() || "Phase 1: Foundation";
			const configurationStatus = await this.getConfigurationStatus?.();
			const metrics = await this.getMetrics?.();
			const lastActivity = await this.getLastActivity?.();
			const dependencies = this.getDependencies?.();

			// Determine health based on configuration status and errors
			let health: OrganStatus["health"] = "unknown";
			if (this.enabled) {
				if (configurationStatus) {
					if (configurationStatus.issues && configurationStatus.issues.length > 0) {
						health = "error";
					} else if (configurationStatus.warnings && configurationStatus.warnings.length > 0) {
						health = "warning";
					} else if (configurationStatus.configured) {
						health = "healthy";
					} else {
						health = "warning";
					}
				} else {
					// No configuration status means we assume it's healthy if enabled
					health = "healthy";
				}
			} else {
				// Organ is disabled, health is unknown
				health = "unknown";
			}

			return {
				organId: this.getId(),
				organName: this.getName(),
				enabled: this.enabled,
				health,
				description,
				phase,
				configurationStatus,
				metrics,
				lastActivity,
				dependencies,
			};
		} catch (error) {
			// Capture runtime errors during status collection
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				organId: this.getId(),
				organName: this.getName(),
				enabled: this.enabled,
				health: "error",
				description: this.getDescription?.() || "No description available",
				phase: this.getPhase?.() || "Phase 1: Foundation",
				runtimeError: errorMessage,
			};
		}
	}

	/**
	 * Get a human-readable description of what this organ does
	 * Override in subclasses to provide a description
	 * 
	 * @returns Description string
	 */
	protected getDescription?(): string;

	/**
	 * Get the phase this organ belongs to
	 * Override in subclasses to specify the phase
	 * 
	 * @returns Phase string
	 */
	protected getPhase?(): OrganStatus["phase"];

	/**
	 * Get configuration status for this organ
	 * Override in subclasses to check configuration
	 * 
	 * @returns Configuration status, or undefined if not applicable
	 */
	protected getConfigurationStatus?(): Promise<OrganConfigurationStatus | undefined>;

	/**
	 * Get metrics for this organ
	 * Override in subclasses to provide activity metrics
	 * 
	 * @returns Metrics object, or undefined if not applicable
	 */
	protected getMetrics?(): Promise<Record<string, any> | undefined>;

	/**
	 * Get the last activity timestamp for this organ
	 * Override in subclasses to track activity
	 * 
	 * @returns Last activity date, or undefined if not applicable
	 */
	protected getLastActivity?(): Promise<Date | undefined>;

	/**
	 * Get dependencies for this organ (other organ IDs this organ depends on)
	 * Override in subclasses to specify dependencies
	 * 
	 * @returns Array of organ IDs, or undefined if no dependencies
	 */
	protected getDependencies?(): string[] | undefined;

	/**
	 * Get walkthrough information for this organ
	 * Override in subclasses to provide walkthrough data
	 * 
	 * @returns Walkthrough information, or undefined if not implemented
	 */
	getWalkthrough?(): OrganWalkthrough | undefined;

	/**
	 * Get comprehensive documentation for this organ
	 * Override in subclasses to provide documentation
	 * 
	 * @returns Documentation information, or undefined if not implemented
	 */
	getDocumentation?(): OrganDocumentation | undefined;
}

