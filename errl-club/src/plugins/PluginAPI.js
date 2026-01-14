/**
 * PluginAPI - Plugin API surface with security sandboxing
 *
 * Provides safe API access for plugins with restrictions
 */
export class PluginAPI {
    /**
     * Create a new PluginAPI
     * @param {Object} gameSystems - Game systems to expose
     * @param {Object} config - Configuration
     * @param {boolean} config.enableSandboxing - Enable sandboxing (default: true)
     */
    constructor(gameSystems, config = {}) {
        this.config = {
            enableSandboxing: config.enableSandboxing !== false,
        };

        this.gameSystems = gameSystems;

        // API version
        this.version = '1.0.0';

        // Restricted operations
        this.restrictedOperations = new Set([
            'eval',
            'Function',
            'XMLHttpRequest',
            'fetch',
            'WebSocket',
        ]);
    }

    /**
     * Get API object for plugin
     * @returns {Object} API object
     */
    getAPI() {
        return {
            version: this.version,
            systems: this.getSystemAPI(),
            events: this.getEventAPI(),
            utils: this.getUtilsAPI(),
        };
    }

    /**
     * Get system API (read-only access to game systems)
     * @returns {Object} System API
     * @private
     */
    getSystemAPI() {
        return {
            scene: this.createReadOnlyProxy(this.gameSystems.scene),
            camera: this.createReadOnlyProxy(this.gameSystems.camera),
            renderer: this.createReadOnlyProxy(this.gameSystems.renderer),
        };
    }

    /**
     * Get event API
     * @returns {Object} Event API
     * @private
     */
    getEventAPI() {
        const eventBus = this.gameSystems.eventBus;
        if (!eventBus) {
            return {
                on: () => {},
                off: () => {},
                emit: () => {},
            };
        }

        return {
            on: (event, callback) => {
                if (this.config.enableSandboxing) {
                    // Validate event name (prevent dangerous events)
                    if (this.isRestrictedEvent(event)) {
                        console.warn('PluginAPI: Restricted event:', event);
                        return;
                    }
                }
                return eventBus.on(event, callback);
            },
            off: (event, callback) => eventBus.off(event, callback),
            emit: (event, data) => {
                if (this.config.enableSandboxing) {
                    if (this.isRestrictedEvent(event)) {
                        console.warn('PluginAPI: Restricted event:', event);
                        return;
                    }
                }
                return eventBus.emit(event, data);
            },
        };
    }

    /**
     * Get utilities API
     * @returns {Object} Utils API
     * @private
     */
    getUtilsAPI() {
        return {
            log: (message) => {
                console.log('[Plugin]', message);
            },
            warn: (message) => {
                console.warn('[Plugin]', message);
            },
            error: (message) => {
                console.error('[Plugin]', message);
            },
        };
    }

    /**
     * Create read-only proxy for object
     * @param {Object} obj - Object to proxy
     * @returns {Proxy} Read-only proxy
     * @private
     */
    createReadOnlyProxy(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        return new Proxy(obj, {
            get: (target, prop) => {
                const value = target[prop];
                if (typeof value === 'object' && value !== null) {
                    return this.createReadOnlyProxy(value);
                }
                return value;
            },
            set: () => {
                console.warn('PluginAPI: Attempted to modify read-only object');
                return false;
            },
        });
    }

    /**
     * Check if event is restricted
     * @param {string} event - Event name
     * @returns {boolean} True if restricted
     * @private
     */
    isRestrictedEvent(event) {
        const restrictedPrefixes = ['system.', 'admin.', 'internal.'];
        return restrictedPrefixes.some((prefix) => event.startsWith(prefix));
    }
}
