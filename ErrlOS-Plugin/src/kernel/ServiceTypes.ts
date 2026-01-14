/**
 * Service Types - Definitions for service requests and responses
 * 
 * Services allow modules to request functionality from other modules
 * in a structured, type-safe way.
 */

/**
 * A service request to invoke a capability
 */
export interface ServiceRequest {
	/**
	 * The capability ID to invoke
	 */
	capabilityId: string;

	/**
	 * Parameters for the service (capability-specific)
	 */
	parameters: Record<string, any>;

	/**
	 * Optional timeout in milliseconds (default: 5000)
	 */
	timeout?: number;
}

/**
 * Response from a service request
 */
export interface ServiceResponse {
	/**
	 * Whether the service request succeeded
	 */
	success: boolean;

	/**
	 * Response data (if successful)
	 */
	data?: any;

	/**
	 * Error message (if failed)
	 */
	error?: string;
}

