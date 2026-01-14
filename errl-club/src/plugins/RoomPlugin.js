/**
 * RoomPlugin - Room modification plugin interface
 *
 * Base class for room modification plugins
 */
export class RoomPlugin {
    /**
     * Create a new RoomPlugin
     * @param {Object} config - Plugin configuration
     */
    constructor(config = {}) {
        this.id = config.id || `room_plugin_${Date.now()}`;
        this.name = config.name || 'Room Plugin';
        this.version = config.version || '1.0.0';
        this.description = config.description || '';

        // Plugin state
        this.enabled = false;
        this.room = null;
    }

    /**
     * Initialize plugin
     * @param {Object} api - Plugin API
     * @param {Object} room - Room instance
     */
    async initialize(api, room) {
        this.api = api;
        this.room = room;
    }

    /**
     * Enable plugin
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable plugin
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Unload plugin
     */
    unload() {
        this.disable();
        this.room = null;
        this.api = null;
    }

    /**
     * Update plugin (called every frame)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Override in subclasses
    }
}
