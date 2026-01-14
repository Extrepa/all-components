/**
 * EventBus - Global event system for decoupled communication between systems
 *
 * Provides a centralized event system with namespaced events, priority handling,
 * and event data validation.
 */
export class EventBus {
    constructor() {
        // Event listeners: Map<eventName, Array<{callback, priority, once}>>
        this.listeners = new Map();

        // Event history (for debugging, optional)
        this.history = [];
        this.maxHistorySize = 100;
        this.historyEnabled = false;

        // Event statistics
        this.stats = {
            totalEvents: 0,
            eventsByType: new Map(),
        };

        // Event queue for network transmission
        this.eventQueue = [];
        this.maxQueueSize = 1000;
        this.queueEnabled = false;

        // Event filters
        this.filters = new Map(); // Map<eventName, Array<filterFunction>>

        // Replay system
        this.replayMode = false;
        this.replayIndex = 0;
        this.replayEvents = [];
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Event name (supports namespacing, e.g., 'player.move', 'audio.beat')
     * @param {Function} callback - Callback function (data, eventName) => void
     * @param {number} priority - Priority (higher = called first, default: 0)
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback, priority = 0) {
        if (typeof callback !== 'function') {
            throw new Error('EventBus.on: callback must be a function');
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listener = { callback, priority, once: false };
        const listeners = this.listeners.get(eventName);

        // Insert in priority order (higher priority first)
        let inserted = false;
        for (let i = 0; i < listeners.length; i++) {
            if (priority > listeners[i].priority) {
                listeners.splice(i, 0, listener);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            listeners.push(listener);
        }

        // Return unsubscribe function
        return () => {
            this.off(eventName, callback);
        };
    }

    /**
     * Subscribe to an event (fires only once)
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     * @param {number} priority - Priority
     * @returns {Function} Unsubscribe function
     */
    once(eventName, callback, priority = 0) {
        if (typeof callback !== 'function') {
            throw new Error('EventBus.once: callback must be a function');
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listener = { callback, priority, once: true };
        const listeners = this.listeners.get(eventName);

        // Insert in priority order
        let inserted = false;
        for (let i = 0; i < listeners.length; i++) {
            if (priority > listeners[i].priority) {
                listeners.splice(i, 0, listener);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            listeners.push(listener);
        }

        // Return unsubscribe function
        return () => {
            this.off(eventName, callback);
        };
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(eventName, callback) {
        const listeners = this.listeners.get(eventName);
        if (!listeners) {
            return;
        }

        const index = listeners.findIndex((listener) => listener.callback === callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }

        // Clean up empty listener arrays
        if (listeners.length === 0) {
            this.listeners.delete(eventName);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     * @returns {boolean} True if any listeners were called
     */
    emit(eventName, data = null) {
        // Check filters
        if (!this.passesFilters(eventName, data)) {
            return false; // Event filtered out
        }

        // Queue event if queuing is enabled
        if (this.queueEnabled) {
            this.queueEvent(eventName, data);
        }

        // Update statistics
        this.stats.totalEvents++;
        const count = this.stats.eventsByType.get(eventName) || 0;
        this.stats.eventsByType.set(eventName, count + 1);

        // Add to history if enabled
        if (this.historyEnabled) {
            this.history.push({
                eventName,
                data: this.deepClone(data),
                timestamp: Date.now(),
            });

            // Trim history if too large
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
            }
        }

        // Get listeners for this exact event
        const listeners = this.listeners.get(eventName);
        let called = false;

        if (listeners && listeners.length > 0) {
            // Create a copy of listeners array to avoid issues if listeners modify during iteration
            const listenersCopy = [...listeners];

            for (const listener of listenersCopy) {
                try {
                    listener.callback(data, eventName);
                    called = true;

                    // Remove if it's a once listener
                    if (listener.once) {
                        this.off(eventName, listener.callback);
                    }
                } catch (error) {
                    console.error(`Error in event listener for "${eventName}":`, error);
                }
            }
        }

        // Also check for wildcard listeners (e.g., 'player.*' matches 'player.move')
        const wildcardListeners = this.getWildcardListeners(eventName);
        for (const { eventPattern, listeners: wildcardList } of wildcardListeners) {
            for (const listener of wildcardList) {
                try {
                    listener.callback(data, eventName);
                    called = true;

                    if (listener.once) {
                        this.off(eventPattern, listener.callback);
                    }
                } catch (error) {
                    console.error(`Error in wildcard event listener for "${eventPattern}":`, error);
                }
            }
        }

        return called;
    }

    /**
     * Get wildcard listeners that match an event name
     * @private
     */
    getWildcardListeners(eventName) {
        const matches = [];

        for (const [pattern, listeners] of this.listeners.entries()) {
            if (pattern.includes('*')) {
                // Convert pattern to regex (simple wildcard matching)
                const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
                const regex = new RegExp(`^${regexPattern}$`);

                if (regex.test(eventName)) {
                    matches.push({ eventPattern: pattern, listeners });
                }
            }
        }

        return matches;
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Event name (optional, removes all if not provided)
     */
    removeAllListeners(eventName = null) {
        if (eventName === null) {
            this.listeners.clear();
        } else {
            this.listeners.delete(eventName);
        }
    }

    /**
     * Get all listeners for an event
     * @param {string} eventName - Event name
     * @returns {Array} Array of listener objects
     */
    getListeners(eventName) {
        return this.listeners.get(eventName) || [];
    }

    /**
     * Check if an event has any listeners
     * @param {string} eventName - Event name
     * @returns {boolean} True if event has listeners
     */
    hasListeners(eventName) {
        return this.listeners.has(eventName) && this.listeners.get(eventName).length > 0;
    }

    /**
     * Get list of all event names that have listeners
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Enable or disable event history
     * @param {boolean} enabled - Enable history tracking
     */
    setHistoryEnabled(enabled) {
        this.historyEnabled = enabled;
        if (!enabled) {
            this.history = [];
        }
    }

    /**
     * Get event history
     * @param {string} eventName - Optional event name to filter history
     * @returns {Array} History entries
     */
    getHistory(eventName = null) {
        if (eventName === null) {
            return [...this.history];
        }

        return this.history.filter((entry) => entry.eventName === eventName);
    }

    /**
     * Get event statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            totalEvents: this.stats.totalEvents,
            eventsByType: new Map(this.stats.eventsByType),
            listenerCount: Array.from(this.listeners.values()).reduce(
                (sum, listeners) => sum + listeners.length,
                0
            ),
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalEvents: 0,
            eventsByType: new Map(),
        };
    }

    /**
     * Serialize event for network transmission
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     * @returns {string} JSON string representation
     */
    serializeEvent(eventName, data) {
        const event = {
            eventName,
            data: this.serializeValue(data),
            timestamp: Date.now(),
        };

        return JSON.stringify(event);
    }

    /**
     * Deserialize event from network transmission
     * @param {string} jsonString - JSON string representation
     * @returns {Object|null} Event object or null if deserialization failed
     */
    deserializeEvent(jsonString) {
        try {
            const event = JSON.parse(jsonString);

            // Deserialize data if it contains Three.js objects
            if (event.data) {
                event.data = this.deserializeValue(event.data);
            }

            return event;
        } catch (error) {
            console.error('Error deserializing event:', error);
            return null;
        }
    }

    /**
     * Serialize a value, converting Three.js objects to plain objects
     * @private
     */
    serializeValue(value) {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle Three.js Vector3
        if (value.isVector3) {
            return { x: value.x, y: value.y, z: value.z, _type: 'Vector3' };
        }

        // Handle Three.js Quaternion
        if (value.isQuaternion) {
            return { x: value.x, y: value.y, z: value.z, w: value.w, _type: 'Quaternion' };
        }

        // Handle Three.js Euler
        if (value.isEuler) {
            return { x: value.x, y: value.y, z: value.z, order: value.order, _type: 'Euler' };
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map((item) => this.serializeValue(item));
        }

        // Handle objects
        if (typeof value === 'object') {
            const serialized = {};
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key) && key !== '_type') {
                    serialized[key] = this.serializeValue(value[key]);
                }
            }
            return serialized;
        }

        return value;
    }

    /**
     * Deserialize a value, converting plain objects back to Three.js objects if needed
     * @private
     */
    deserializeValue(value) {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle serialized Three.js objects
        if (typeof value === 'object' && value._type) {
            // Note: We don't recreate Three.js objects here since we'd need to import THREE
            // The receiving system should handle conversion if needed
            return value;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map((item) => this.deserializeValue(item));
        }

        // Handle objects
        if (typeof value === 'object') {
            const deserialized = {};
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    deserialized[key] = this.deserializeValue(value[key]);
                }
            }
            return deserialized;
        }

        return value;
    }

    /**
     * Queue an event for network transmission
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    queueEvent(eventName, data) {
        if (!this.queueEnabled) {
            return;
        }

        const event = {
            eventName,
            data: this.deepClone(data),
            timestamp: Date.now(),
        };

        this.eventQueue.push(event);

        // Limit queue size
        if (this.eventQueue.length > this.maxQueueSize) {
            this.eventQueue.shift();
        }
    }

    /**
     * Get queued events and clear the queue
     * @returns {Array} Array of queued events
     */
    getQueuedEvents() {
        const events = [...this.eventQueue];
        this.eventQueue = [];
        return events;
    }

    /**
     * Enable or disable event queuing
     * @param {boolean} enabled - Enable queuing
     */
    setQueueEnabled(enabled) {
        this.queueEnabled = enabled;
        if (!enabled) {
            this.eventQueue = [];
        }
    }

    /**
     * Add event filter
     * @param {string} eventName - Event name (supports wildcards)
     * @param {Function} filterFunction - Filter function (data, eventName) => boolean
     */
    addFilter(eventName, filterFunction) {
        if (!this.filters.has(eventName)) {
            this.filters.set(eventName, []);
        }

        this.filters.get(eventName).push(filterFunction);
    }

    /**
     * Remove event filter
     * @param {string} eventName - Event name
     * @param {Function} filterFunction - Filter function to remove
     */
    removeFilter(eventName, filterFunction) {
        const filters = this.filters.get(eventName);
        if (filters) {
            const index = filters.indexOf(filterFunction);
            if (index !== -1) {
                filters.splice(index, 1);
            }
            if (filters.length === 0) {
                this.filters.delete(eventName);
            }
        }
    }

    /**
     * Check if event passes filters
     * @private
     */
    passesFilters(eventName, data) {
        // Check exact match filters
        const exactFilters = this.filters.get(eventName);
        if (exactFilters) {
            for (const filter of exactFilters) {
                if (!filter(data, eventName)) {
                    return false;
                }
            }
        }

        // Check wildcard filters
        for (const [pattern, filters] of this.filters.entries()) {
            if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
                const regex = new RegExp(`^${regexPattern}$`);

                if (regex.test(eventName)) {
                    for (const filter of filters) {
                        if (!filter(data, eventName)) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    /**
     * Start event replay
     * @param {Array} events - Array of events to replay
     */
    startReplay(events) {
        this.replayMode = true;
        this.replayEvents = [...events];
        this.replayIndex = 0;
        console.log(`Event replay started with ${events.length} events`);
    }

    /**
     * Stop event replay
     */
    stopReplay() {
        this.replayMode = false;
        this.replayEvents = [];
        this.replayIndex = 0;
        console.log('Event replay stopped');
    }

    /**
     * Process next event in replay
     * @returns {boolean} True if more events to replay
     */
    processReplay() {
        if (!this.replayMode || this.replayIndex >= this.replayEvents.length) {
            this.stopReplay();
            return false;
        }

        const event = this.replayEvents[this.replayIndex];
        this.emit(event.eventName, event.data);
        this.replayIndex++;

        return this.replayIndex < this.replayEvents.length;
    }

    /**
     * Get replay status
     * @returns {Object} Replay status object
     */
    getReplayStatus() {
        return {
            isReplaying: this.replayMode,
            currentIndex: this.replayIndex,
            totalEvents: this.replayEvents.length,
            progress:
                this.replayEvents.length > 0
                    ? (this.replayIndex / this.replayEvents.length) * 100
                    : 0,
        };
    }

    /**
     * Deep clone helper
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map((item) => this.deepClone(item));
        }

        // Handle Three.js objects (Vector3, Quaternion, etc.)
        if (obj.clone && typeof obj.clone === 'function') {
            return obj.clone();
        }

        const cloned = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }

        return cloned;
    }
}
