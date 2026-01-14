import { ServiceRequest, ServiceResponse } from "./ServiceTypes";
import { CapabilityRegistry } from "./CapabilityRegistry";
import { ModuleRegistry } from "./ModuleRegistry";
import { Organ } from "../organs/base/Organ";

/**
 * Service Router - Routes service requests to appropriate handlers
 * 
 * Allows modules to register service handlers for their capabilities
 * and routes requests from other modules to those handlers.
 */
export class ServiceRouter {
	private handlers: Map<string, ServiceHandler> = new Map();
	private capabilityRegistry: CapabilityRegistry;
	private moduleRegistry: ModuleRegistry;

	constructor(capabilityRegistry: CapabilityRegistry, moduleRegistry: ModuleRegistry) {
		this.capabilityRegistry = capabilityRegistry;
		this.moduleRegistry = moduleRegistry;
	}

	/**
	 * Register a service handler for a capability
	 * 
	 * @param capabilityId - The capability ID to handle
	 * @param handler - Async function that handles the service request
	 */
	registerService(capabilityId: string, handler: (params: Record<string, any>) => Promise<any>): void {
		// Verify capability exists
		const capability = this.capabilityRegistry.get(capabilityId);
		if (!capability) {
			throw new Error(`Cannot register service for unknown capability: ${capabilityId}`);
		}

		// Verify organ is enabled
		const organ = this.moduleRegistry.get(capability.organId);
		if (!organ || !organ.isEnabled()) {
			throw new Error(`Cannot register service for capability from disabled organ: ${capabilityId}`);
		}

		this.handlers.set(capabilityId, {
			capabilityId,
			handler,
			organId: capability.organId,
		});
	}

	/**
	 * Unregister a service handler
	 * 
	 * @param capabilityId - The capability ID to unregister
	 */
	unregisterService(capabilityId: string): void {
		this.handlers.delete(capabilityId);
	}

	/**
	 * Request a service
	 * 
	 * @param serviceRequest - The service request
	 * @returns Promise that resolves to the service response
	 */
	async request(serviceRequest: ServiceRequest): Promise<ServiceResponse> {
		const { capabilityId, parameters, timeout = 5000 } = serviceRequest;

		// Check if capability exists
		const capability = this.capabilityRegistry.get(capabilityId);
		if (!capability) {
			return {
				success: false,
				error: `Capability not found: ${capabilityId}`,
			};
		}

		// Check if organ is enabled
		const organ = this.moduleRegistry.get(capability.organId);
		if (!organ || !organ.isEnabled()) {
			return {
				success: false,
				error: `Capability provider is not enabled: ${capability.organId}`,
			};
		}

		// Check if handler exists
		const serviceHandler = this.handlers.get(capabilityId);
		if (!serviceHandler) {
			return {
				success: false,
				error: `No service handler registered for capability: ${capabilityId}`,
			};
		}

		// Execute handler with timeout
		try {
			const result = await Promise.race([
				serviceHandler.handler(parameters),
				new Promise<never>((_, reject) => {
					setTimeout(() => reject(new Error(`Service request timed out after ${timeout}ms`)), timeout);
				}),
			]);

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`[Errl OS] Service request failed for ${capabilityId}:`, error);
			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	/**
	 * Unregister all services for an organ
	 * Useful for cleanup when an organ is unloaded
	 * 
	 * @param organId - The organ ID
	 */
	unregisterByOrgan(organId: string): void {
		const capabilitiesToRemove: string[] = [];
		
		for (const [capabilityId, handler] of this.handlers.entries()) {
			if (handler.organId === organId) {
				capabilitiesToRemove.push(capabilityId);
			}
		}

		for (const capabilityId of capabilitiesToRemove) {
			this.handlers.delete(capabilityId);
		}
	}

	/**
	 * Clear all service handlers
	 * Useful for cleanup on unload
	 */
	clear(): void {
		this.handlers.clear();
	}

	/**
	 * Get the number of registered service handlers
	 * Useful for debugging
	 */
	getHandlerCount(): number {
		return this.handlers.size;
	}
}

/**
 * Internal service handler structure
 */
interface ServiceHandler {
	capabilityId: string;
	organId: string;
	handler: (params: Record<string, any>) => Promise<any>;
}

