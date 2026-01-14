/**
 * NetworkEventBus - Bridges network events to game EventBus
 *
 * Handles event serialization, filtering, and routing between network and game events
 */
export class NetworkEventBus {
    /**
     * Create a new NetworkEventBus
     * @param {EventBus} eventBus - Game EventBus instance
     * @param {NetworkClient} networkClient - NetworkClient instance
     */
    constructor(eventBus, networkClient) {
        this.eventBus = eventBus;
        this.networkClient = networkClient;

        // Event configuration: Map<eventName, {syncable, priority, filter}>
        this.eventConfig = new Map();

        // Local event tracking (to prevent echo)
        this.localEventIds = new Set();
        this.localEventTimeout = 5000; // Clear local events after 5 seconds

        // Event statistics
        this.stats = {
            eventsSent: 0,
            eventsReceived: 0,
            eventsFiltered: 0,
        };
    }

    /**
     * Register an event as syncable
     * @param {string} eventName - Event name (supports wildcards, e.g., 'player.*')
     * @param {Object} config - Configuration
     * @param {boolean} config.syncable - Whether to sync this event (default: true)
     * @param {number} config.priority - Event priority (default: 0)
     * @param {Function} config.filter - Filter function (eventData) => boolean (default: always true)
     */
    registerEvent(eventName, config = {}) {
        this.eventConfig.set(eventName, {
            syncable: config.syncable !== false,
            priority: config.priority || 0,
            filter: config.filter || (() => true),
        });
    }

    /**
     * Emit a local event (may be synced to network)
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     * @param {string} eventId - Optional event ID (for echo prevention)
     */
    emitLocal(eventName, eventData = {}, eventId = null) {
        // Generate event ID if not provided
        if (!eventId) {
            eventId = `${eventName}_${Date.now()}_${Math.random()}`;
        }

        // Track as local event
        this.localEventIds.add(eventId);

        // Clear old local events
        setTimeout(() => {
            this.localEventIds.delete(eventId);
        }, this.localEventTimeout);

        // Emit to local EventBus
        if (this.eventBus) {
            this.eventBus.emit(eventName, { ...eventData, _eventId: eventId });
        }

        // Check if event should be synced
        if (this.shouldSync(eventName, eventData)) {
            this.syncEvent(eventName, eventData, eventId);
            this.stats.eventsSent++;
        }
    }

    /**
     * Receive a network event (from remote client)
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     * @param {string} eventId - Event ID
     */
    receiveNetwork(eventName, eventData = {}, eventId = null) {
        // Check if this is a local event (echo prevention)
        if (eventId && this.localEventIds.has(eventId)) {
            this.stats.eventsFiltered++;
            return; // Ignore echo
        }

        // Emit to local EventBus
        if (this.eventBus) {
            this.eventBus.emit(eventName, { ...eventData, _eventId: eventId, _fromNetwork: true });
        }

        this.stats.eventsReceived++;
    }

    /**
     * Check if an event should be synced
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     * @returns {boolean} True if should sync
     * @private
     */
    shouldSync(eventName, eventData) {
        if (!this.networkClient || !this.networkClient.isConnected()) {
            return false;
        }

        // Check exact match
        const config = this.eventConfig.get(eventName);
        if (config) {
            if (!config.syncable) {
                return false;
            }
            if (config.filter && !config.filter(eventData)) {
                return false;
            }
            return true;
        }

        // Check wildcard patterns
        for (const [pattern, config] of this.eventConfig.entries()) {
            if (this.matchesPattern(eventName, pattern)) {
                if (!config.syncable) {
                    return false;
                }
                if (config.filter && !config.filter(eventData)) {
                    return false;
                }
                return true;
            }
        }

        // Default: don't sync unknown events
        return false;
    }

    /**
     * Check if event name matches pattern (supports wildcards)
     * @param {string} eventName - Event name
     * @param {string} pattern - Pattern (e.g., 'player.*')
     * @returns {boolean} True if matches
     * @private
     */
    matchesPattern(eventName, pattern) {
        if (pattern === eventName) {
            return true;
        }

        // Simple wildcard matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(eventName);
    }

    /**
     * Sync event to network
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     * @param {string} eventId - Event ID
     * @private
     */
    syncEvent(eventName, eventData, eventId) {
        if (!this.networkClient) {
            return;
        }

        // Check if connected (if method exists)
        if (
            typeof this.networkClient.isConnected === 'function' &&
            !this.networkClient.isConnected()
        ) {
            return;
        }

        // Serialize event
        const serialized = this.serializeEvent(eventName, eventData, eventId);

        // Send via network
        this.networkClient.send('event', serialized);
    }

    /**
     * Serialize event for network transmission
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     * @param {string} eventId - Event ID
     * @returns {Object} Serialized event
     * @private
     */
    serializeEvent(eventName, eventData, eventId) {
        // Remove internal fields
        const cleanData = { ...eventData };
        delete cleanData._eventId;
        delete cleanData._fromNetwork;

        return {
            name: eventName,
            data: cleanData,
            id: eventId,
            timestamp: Date.now(),
        };
    }

    /**
     * Setup default event configurations
     */
    setupDefaultEvents() {
        // Player events (always sync)
        this.registerEvent('player.joined', { syncable: true, priority: 10 });
        this.registerEvent('player.left', { syncable: true, priority: 10 });
        this.registerEvent('player.updated', { syncable: true, priority: 5 });

        // Game events (syncable)
        this.registerEvent('event.blackout', { syncable: true, priority: 8 });
        this.registerEvent('event.strobe', { syncable: true, priority: 8 });
        this.registerEvent('event.wave', { syncable: true, priority: 8 });

        // Local-only events (don't sync)
        this.registerEvent('audio.*', { syncable: false });
        this.registerEvent('ui.*', { syncable: false });
        this.registerEvent('camera.*', { syncable: false });
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            registeredEvents: this.eventConfig.size,
        };
    }
}
