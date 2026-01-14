/**
 * ShaderPlugin - Shader modification plugin interface
 *
 * Base class for shader modification plugins
 */
export class ShaderPlugin {
    /**
     * Create a new ShaderPlugin
     * @param {Object} config - Plugin configuration
     */
    constructor(config = {}) {
        this.id = config.id || `shader_plugin_${Date.now()}`;
        this.name = config.name || 'Shader Plugin';
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
     * Modify shader (called when shader is created)
     * @param {Object} shader - Shader object
     * @returns {Object} Modified shader
     */
    modifyShader(shader) {
        // Override in subclasses
        return shader;
    }
}
