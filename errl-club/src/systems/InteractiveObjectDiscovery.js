/**
 * InteractiveObjectDiscovery - Tracks discovery of interactive objects
 *
 * Manages object discovery state, notifications, and achievements
 */
export class InteractiveObjectDiscovery {
    /**
     * Create a new InteractiveObjectDiscovery
     * @param {SettingsManager} settingsManager - SettingsManager for persistence
     * @param {EventBus} eventBus - EventBus for events
     */
    constructor(settingsManager = null, eventBus = null) {
        this.settingsManager = settingsManager;
        this.eventBus = eventBus;

        // Discovery state: Map<roomId, Set<objectId>>
        this.discoveredObjects = new Map();

        // Object registry: Map<objectId, {roomId, name, type}>
        this.objectRegistry = new Map();

        // Statistics
        this.stats = {
            totalObjects: 0,
            discoveredObjects: 0,
            discoveriesByRoom: new Map(),
            firstDiscoveryTime: null,
            lastDiscoveryTime: null,
        };

        // Load saved discoveries
        this.load();
    }

    /**
     * Register an interactive object
     * @param {string} objectId - Unique object identifier
     * @param {string} roomId - Room ID
     * @param {string} name - Object name
     * @param {string} type - Object type
     */
    registerObject(objectId, roomId, name, type = 'generic') {
        this.objectRegistry.set(objectId, {
            roomId,
            name,
            type,
            registeredAt: Date.now(),
        });

        // Initialize room discovery set if needed
        if (!this.discoveredObjects.has(roomId)) {
            this.discoveredObjects.set(roomId, new Set());
        }

        this.stats.totalObjects++;
        this.save();
    }

    /**
     * Mark an object as discovered
     * @param {string} objectId - Object identifier
     * @param {Object} discoverer - Avatar or entity that discovered it
     */
    discoverObject(objectId, discoverer = null) {
        const objectInfo = this.objectRegistry.get(objectId);
        if (!objectInfo) {
            console.warn('InteractiveObjectDiscovery: Object not registered:', objectId);
            return false;
        }

        const roomId = objectInfo.roomId;
        const roomDiscoveries = this.discoveredObjects.get(roomId);

        if (!roomDiscoveries) {
            this.discoveredObjects.set(roomId, new Set());
        }

        // Check if already discovered
        if (this.discoveredObjects.get(roomId).has(objectId)) {
            return false; // Already discovered
        }

        // Mark as discovered
        this.discoveredObjects.get(roomId).add(objectId);
        this.stats.discoveredObjects++;

        // Update room statistics
        if (!this.stats.discoveriesByRoom.has(roomId)) {
            this.stats.discoveriesByRoom.set(roomId, 0);
        }
        this.stats.discoveriesByRoom.set(roomId, this.stats.discoveriesByRoom.get(roomId) + 1);

        // Update timestamps
        const now = Date.now();
        if (!this.stats.firstDiscoveryTime) {
            this.stats.firstDiscoveryTime = now;
        }
        this.stats.lastDiscoveryTime = now;

        // Emit discovery event
        if (this.eventBus) {
            this.eventBus.emit('object.discovered', {
                objectId,
                objectInfo,
                roomId,
                discoverer,
                timestamp: now,
            });
        }

        // Save state
        this.save();

        return true;
    }

    /**
     * Check if an object is discovered
     * @param {string} objectId - Object identifier
     * @returns {boolean} True if discovered
     */
    isDiscovered(objectId) {
        const objectInfo = this.objectRegistry.get(objectId);
        if (!objectInfo) {
            return false;
        }

        const roomId = objectInfo.roomId;
        const roomDiscoveries = this.discoveredObjects.get(roomId);
        return roomDiscoveries ? roomDiscoveries.has(objectId) : false;
    }

    /**
     * Get discovered objects for a room
     * @param {string} roomId - Room ID
     * @returns {Array} Array of discovered object IDs
     */
    getDiscoveredObjects(roomId) {
        const roomDiscoveries = this.discoveredObjects.get(roomId);
        return roomDiscoveries ? Array.from(roomDiscoveries) : [];
    }

    /**
     * Get discovery progress for a room
     * @param {string} roomId - Room ID
     * @returns {Object} Progress object {discovered, total, percentage}
     */
    getRoomProgress(roomId) {
        const discovered = this.getDiscoveredObjects(roomId).length;
        const total = Array.from(this.objectRegistry.values()).filter(
            (obj) => obj.roomId === roomId
        ).length;

        return {
            discovered,
            total,
            percentage: total > 0 ? (discovered / total) * 100 : 0,
        };
    }

    /**
     * Get overall discovery statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            discoveryRate:
                this.stats.totalObjects > 0
                    ? (this.stats.discoveredObjects / this.stats.totalObjects) * 100
                    : 0,
            discoveriesByRoom: Object.fromEntries(this.stats.discoveriesByRoom),
        };
    }

    /**
     * Load discovery state from storage
     * @private
     */
    load() {
        if (!this.settingsManager) {
            return;
        }

        try {
            const saved = this.settingsManager.getSetting('discovery.objects', {});

            // Restore discovered objects
            for (const [roomId, objectIds] of Object.entries(saved)) {
                this.discoveredObjects.set(roomId, new Set(objectIds));
            }

            // Restore statistics
            const savedStats = this.settingsManager.getSetting('discovery.stats', null);
            if (savedStats) {
                this.stats = {
                    ...this.stats,
                    ...savedStats,
                    discoveriesByRoom: new Map(savedStats.discoveriesByRoom || []),
                };
            }
        } catch (error) {
            console.error('InteractiveObjectDiscovery: Failed to load state:', error);
        }
    }

    /**
     * Save discovery state to storage
     * @private
     */
    save() {
        if (!this.settingsManager) {
            return;
        }

        try {
            // Save discovered objects
            const saved = {};
            for (const [roomId, objectIds] of this.discoveredObjects.entries()) {
                saved[roomId] = Array.from(objectIds);
            }
            this.settingsManager.setSetting('discovery.objects', saved);

            // Save statistics
            this.settingsManager.setSetting('discovery.stats', {
                ...this.stats,
                discoveriesByRoom: Array.from(this.stats.discoveriesByRoom.entries()),
            });
        } catch (error) {
            console.error('InteractiveObjectDiscovery: Failed to save state:', error);
        }
    }

    /**
     * Reset discovery state
     */
    reset() {
        this.discoveredObjects.clear();
        this.stats = {
            totalObjects: this.objectRegistry.size,
            discoveredObjects: 0,
            discoveriesByRoom: new Map(),
            firstDiscoveryTime: null,
            lastDiscoveryTime: null,
        };
        this.save();
    }
}
