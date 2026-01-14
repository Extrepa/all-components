/**
 * Event Bus - Pub/Sub messaging system for inter-module communication
 * 
 * Enables modules to publish and subscribe to events in a decoupled way.
 * Supports event namespacing (e.g., "project:created", "energy:changed")
 * and wildcard subscriptions for listening to all events.
 */
export class EventBus {
	private handlers: Map<string, Set<EventHandler>> = new Map();
	private subscriptionCounter: number = 0;
	private subscriptions: Map<string, SubscriptionInfo> = new Map();

	/**
	 * Subscribe to an event
	 * 
	 * @param event - Event name (supports wildcard "*" for all events)
	 * @param handler - Function to call when event is published
	 * @returns Subscription ID for unsubscribing
	 */
	subscribe(event: string, handler: (data?: any) => void): string {
		const subscriptionId = `sub_${++this.subscriptionCounter}_${Date.now()}`;
		
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set());
		}
		
		const handlerSet = this.handlers.get(event)!;
		const eventHandler: EventHandler = {
			id: subscriptionId,
			handler,
		};
		
		handlerSet.add(eventHandler);
		
		// Store subscription info for cleanup
		this.subscriptions.set(subscriptionId, {
			event,
			handler: eventHandler,
		});
		
		return subscriptionId;
	}

	/**
	 * Subscribe to an event once (automatically unsubscribes after first call)
	 * 
	 * @param event - Event name
	 * @param handler - Function to call when event is published
	 * @returns Subscription ID
	 */
	once(event: string, handler: (data?: any) => void): string {
		const subscriptionId = this.subscribe(event, (data) => {
			handler(data);
			this.unsubscribe(subscriptionId);
		});
		return subscriptionId;
	}

	/**
	 * Unsubscribe from an event
	 * 
	 * @param subscriptionId - The subscription ID returned from subscribe()
	 */
	unsubscribe(subscriptionId: string): void {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) {
			return;
		}
		
		const handlerSet = this.handlers.get(subscription.event);
		if (handlerSet) {
			handlerSet.delete(subscription.handler);
			// Clean up empty sets
			if (handlerSet.size === 0) {
				this.handlers.delete(subscription.event);
			}
		}
		
		this.subscriptions.delete(subscriptionId);
	}

	/**
	 * Publish an event to all subscribers
	 * 
	 * @param event - Event name
	 * @param data - Optional data to pass to handlers
	 */
	publish(event: string, data?: any): void {
		// Get specific event handlers
		const specificHandlers = this.handlers.get(event);
		if (specificHandlers) {
			for (const eventHandler of specificHandlers) {
				try {
					eventHandler.handler(data);
				} catch (error) {
					console.error(`[Errl OS] Error in event handler for ${event}:`, error);
				}
			}
		}
		
		// Get wildcard handlers (subscribe to "*")
		const wildcardHandlers = this.handlers.get("*");
		if (wildcardHandlers) {
			for (const eventHandler of wildcardHandlers) {
				try {
					eventHandler.handler({ event, data });
				} catch (error) {
					console.error(`[Errl OS] Error in wildcard event handler for ${event}:`, error);
				}
			}
		}
	}

	/**
	 * Clear all subscriptions and handlers
	 * Useful for cleanup on unload
	 */
	clear(): void {
		this.handlers.clear();
		this.subscriptions.clear();
		this.subscriptionCounter = 0;
	}

	/**
	 * Get the number of active subscriptions
	 * Useful for debugging
	 */
	getSubscriptionCount(): number {
		return this.subscriptions.size;
	}

	/**
	 * Get the number of handlers for a specific event
	 * Useful for debugging
	 */
	getHandlerCount(event: string): number {
		return this.handlers.get(event)?.size || 0;
	}
}

/**
 * Internal event handler structure
 */
interface EventHandler {
	id: string;
	handler: (data?: any) => void;
}

/**
 * Subscription information for cleanup
 */
interface SubscriptionInfo {
	event: string;
	handler: EventHandler;
}

