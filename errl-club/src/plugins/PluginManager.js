/**
 * PluginManager - Plugin loader and lifecycle management
 *
 * Handles plugin loading, enabling, disabling, and isolation
 */
export class PluginManager {
    /**
     * Create a new PluginManager
     * @param {Object} config - Configuration
     * @param {boolean} config.enableSandboxing - Enable security sandboxing (default: true)
     */
    constructor(config = {}) {
        this.config = {
            enableSandboxing: config.enableSandboxing !== false,
        };

        // Plugin storage: Map<pluginId, plugin>
        this.plugins = new Map();

        // Plugin states: Map<pluginId, 'loaded' | 'enabled' | 'disabled'>
        this.pluginStates = new Map();

        // Plugin dependencies: Map<pluginId, Array<dependencyId>>
        this.dependencies = new Map();
    }

    /**
     * Load a plugin
     * @param {string} pluginId - Plugin identifier
     * @param {string|Object} pluginSource - Plugin source (URL or plugin object)
     * @param {Array} dependencies - Plugin dependencies (default: [])
     * @returns {Promise<Object>} Resolves with loaded plugin
     */
    async loadPlugin(pluginId, pluginSource, dependencies = []) {
        if (this.plugins.has(pluginId)) {
            console.warn('PluginManager: Plugin already loaded:', pluginId);
            return this.plugins.get(pluginId);
        }

        try {
            let plugin;

            if (typeof pluginSource === 'string') {
                // Load from URL
                const module = await import(pluginSource);
                plugin = module.default || module;
            } else {
                // Use provided plugin object
                plugin = pluginSource;
            }

            // Validate plugin
            if (!this.validatePlugin(plugin)) {
                throw new Error('PluginManager: Invalid plugin structure');
            }

            // Check dependencies
            for (const depId of dependencies) {
                if (!this.plugins.has(depId)) {
                    throw new Error(`PluginManager: Missing dependency: ${depId}`);
                }
            }

            // Store dependencies
            this.dependencies.set(pluginId, dependencies);

            // Initialize plugin
            if (plugin.initialize) {
                await plugin.initialize();
            }

            // Store plugin
            this.plugins.set(pluginId, plugin);
            this.pluginStates.set(pluginId, 'loaded');

            console.log('PluginManager: Plugin loaded:', pluginId);
            return plugin;
        } catch (error) {
            console.error('PluginManager: Failed to load plugin:', pluginId, error);
            throw error;
        }
    }

    /**
     * Validate plugin structure
     * @param {Object} plugin - Plugin object
     * @returns {boolean} True if valid
     * @private
     */
    validatePlugin(plugin) {
        if (!plugin || typeof plugin !== 'object') {
            return false;
        }

        // Plugin must have at least an id
        if (!plugin.id || typeof plugin.id !== 'string') {
            return false;
        }

        return true;
    }

    /**
     * Enable a plugin
     * @param {string} pluginId - Plugin identifier
     */
    enablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.warn('PluginManager: Plugin not found:', pluginId);
            return;
        }

        if (this.pluginStates.get(pluginId) === 'enabled') {
            return;
        }

        // Check dependencies are enabled
        const deps = this.dependencies.get(pluginId) || [];
        for (const depId of deps) {
            if (this.pluginStates.get(depId) !== 'enabled') {
                console.warn('PluginManager: Dependency not enabled:', depId);
                return;
            }
        }

        // Enable plugin
        if (plugin.enable) {
            plugin.enable();
        }

        this.pluginStates.set(pluginId, 'enabled');
        console.log('PluginManager: Plugin enabled:', pluginId);
    }

    /**
     * Disable a plugin
     * @param {string} pluginId - Plugin identifier
     */
    disablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.warn('PluginManager: Plugin not found:', pluginId);
            return;
        }

        if (this.pluginStates.get(pluginId) === 'disabled') {
            return;
        }

        // Disable plugin
        if (plugin.disable) {
            plugin.disable();
        }

        this.pluginStates.set(pluginId, 'disabled');
        console.log('PluginManager: Plugin disabled:', pluginId);
    }

    /**
     * Unload a plugin
     * @param {string} pluginId - Plugin identifier
     */
    unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.warn('PluginManager: Plugin not found:', pluginId);
            return;
        }

        // Disable first
        this.disablePlugin(pluginId);

        // Unload plugin
        if (plugin.unload) {
            plugin.unload();
        }

        this.plugins.delete(pluginId);
        this.pluginStates.delete(pluginId);
        this.dependencies.delete(pluginId);

        console.log('PluginManager: Plugin unloaded:', pluginId);
    }

    /**
     * Get plugin
     * @param {string} pluginId - Plugin identifier
     * @returns {Object|null} Plugin instance, or null if not found
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId) || null;
    }

    /**
     * Get all plugins
     * @returns {Array} Array of plugin objects
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get plugin state
     * @param {string} pluginId - Plugin identifier
     * @returns {string|null} Plugin state, or null if not found
     */
    getPluginState(pluginId) {
        return this.pluginStates.get(pluginId) || null;
    }
}
