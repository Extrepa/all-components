/**
 * AvatarPlugin - Avatar modification plugin interface
 *
 * Base class for avatar modification plugins
 */
export class AvatarPlugin {
    /**
     * Create a new AvatarPlugin
     * @param {Object} config - Plugin configuration
     */
    constructor(config = {}) {
        this.id = config.id || `avatar_plugin_${Date.now()}`;
        this.name = config.name || 'Avatar Plugin';
        this.version = config.version || '1.0.0';
        this.description = config.description || '';

        // Plugin state
        this.enabled = false;
    }

    /**
     * Initialize plugin
     * @param {Object} api - Plugin API
     */
    async initialize(api) {
        this.api = api;
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
        this.api = null;
    }

    /**
     * Modify avatar (called when avatar is created)
     * @param {Object} avatar - Avatar instance
     * @returns {Object} Modified avatar
     */
    modifyAvatar(avatar) {
        // Override in subclasses
        return avatar;
    }
}
