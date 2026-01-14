/**
 * RoomStateManager - Manages room state persistence
 *
 * Saves and loads room states (object states, lighting, particles, etc.)
 */
export class RoomStateManager {
    /**
     * Create a new RoomStateManager
     * @param {SettingsManager} settingsManager - SettingsManager for persistence
     */
    constructor(settingsManager) {
        this.settingsManager = settingsManager;

        // Room states: Map<roomId, roomState>
        this.roomStates = new Map();

        // Load saved states
        this.load();
    }

    /**
     * Save room state
     * @param {string} roomId - Room ID
     * @param {Object} roomState - Room state object
     */
    saveRoomState(roomId, roomState) {
        this.roomStates.set(roomId, {
            ...roomState,
            savedAt: Date.now(),
        });

        this.persist();
    }

    /**
     * Get room state
     * @param {string} roomId - Room ID
     * @returns {Object|null} Room state, or null if not found
     */
    getRoomState(roomId) {
        return this.roomStates.get(roomId) || null;
    }

    /**
     * Save object state for a room
     * @param {string} roomId - Room ID
     * @param {string} objectId - Object ID
     * @param {Object} objectState - Object state
     */
    saveObjectState(roomId, objectId, objectState) {
        let roomState = this.roomStates.get(roomId);
        if (!roomState) {
            roomState = {
                objects: {},
                lighting: {},
                particles: {},
                savedAt: Date.now(),
            };
            this.roomStates.set(roomId, roomState);
        }

        if (!roomState.objects) {
            roomState.objects = {};
        }

        roomState.objects[objectId] = {
            ...objectState,
            savedAt: Date.now(),
        };

        this.persist();
    }

    /**
     * Get object state for a room
     * @param {string} roomId - Room ID
     * @param {string} objectId - Object ID
     * @returns {Object|null} Object state, or null if not found
     */
    getObjectState(roomId, objectId) {
        const roomState = this.roomStates.get(roomId);
        if (!roomState || !roomState.objects) {
            return null;
        }
        return roomState.objects[objectId] || null;
    }

    /**
     * Save lighting state for a room
     * @param {string} roomId - Room ID
     * @param {Object} lightingState - Lighting state
     */
    saveLightingState(roomId, lightingState) {
        let roomState = this.roomStates.get(roomId);
        if (!roomState) {
            roomState = {
                objects: {},
                lighting: {},
                particles: {},
                savedAt: Date.now(),
            };
            this.roomStates.set(roomId, roomState);
        }

        roomState.lighting = {
            ...lightingState,
            savedAt: Date.now(),
        };

        this.persist();
    }

    /**
     * Get lighting state for a room
     * @param {string} roomId - Room ID
     * @returns {Object|null} Lighting state, or null if not found
     */
    getLightingState(roomId) {
        const roomState = this.roomStates.get(roomId);
        return roomState ? roomState.lighting : null;
    }

    /**
     * Save particle state for a room
     * @param {string} roomId - Room ID
     * @param {Object} particleState - Particle state
     */
    saveParticleState(roomId, particleState) {
        let roomState = this.roomStates.get(roomId);
        if (!roomState) {
            roomState = {
                objects: {},
                lighting: {},
                particles: {},
                savedAt: Date.now(),
            };
            this.roomStates.set(roomId, roomState);
        }

        roomState.particles = {
            ...particleState,
            savedAt: Date.now(),
        };

        this.persist();
    }

    /**
     * Get particle state for a room
     * @param {string} roomId - Room ID
     * @returns {Object|null} Particle state, or null if not found
     */
    getParticleState(roomId) {
        const roomState = this.roomStates.get(roomId);
        return roomState ? roomState.particles : null;
    }

    /**
     * Reset room state
     * @param {string} roomId - Room ID
     */
    resetRoomState(roomId) {
        this.roomStates.delete(roomId);
        this.persist();
    }

    /**
     * Reset all room states
     */
    resetAllStates() {
        this.roomStates.clear();
        this.persist();
    }

    /**
     * Load states from storage
     * @private
     */
    load() {
        if (!this.settingsManager) {
            return;
        }

        try {
            const saved = this.settingsManager.getSetting('roomStates', {});

            // Restore room states
            for (const [roomId, roomState] of Object.entries(saved)) {
                this.roomStates.set(roomId, roomState);
            }
        } catch (error) {
            console.error('RoomStateManager: Failed to load states:', error);
        }
    }

    /**
     * Persist states to storage
     * @private
     */
    persist() {
        if (!this.settingsManager) {
            return;
        }

        try {
            const saved = {};
            for (const [roomId, roomState] of this.roomStates.entries()) {
                saved[roomId] = roomState;
            }
            this.settingsManager.setSetting('roomStates', saved);
        } catch (error) {
            console.error('RoomStateManager: Failed to persist states:', error);
        }
    }
}
