/**
 * Environment - Environment configuration (dev, staging, prod)
 *
 * Handles environment config, feature flags, and API endpoints
 */
export class Environment {
    /**
     * Get current environment
     * @returns {string} Environment name ('development', 'staging', 'production')
     */
    static getEnvironment() {
        // Check for explicit environment variable
        if (import.meta.env?.MODE) {
            return import.meta.env.MODE;
        }

        // Check for NODE_ENV
        if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
            return process.env.NODE_ENV;
        }

        // Default to development
        return 'development';
    }

    /**
     * Check if in development mode
     * @returns {boolean} True if development
     */
    static isDevelopment() {
        return this.getEnvironment() === 'development';
    }

    /**
     * Check if in production mode
     * @returns {boolean} True if production
     */
    static isProduction() {
        return this.getEnvironment() === 'production';
    }

    /**
     * Get API endpoint
     * @returns {string} API endpoint URL
     */
    static getAPIEndpoint() {
        const env = this.getEnvironment();

        const endpoints = {
            development: 'http://localhost:3000/api',
            staging: 'https://staging-api.errl.club/api',
            production: 'https://api.errl.club/api',
        };

        return endpoints[env] || endpoints.development;
    }

    /**
     * Get WebSocket endpoint
     * @returns {string} WebSocket endpoint URL
     */
    static getWebSocketEndpoint() {
        const env = this.getEnvironment();

        const endpoints = {
            development: 'ws://localhost:3000',
            staging: 'wss://staging-api.errl.club',
            production: 'wss://api.errl.club',
        };

        return endpoints[env] || endpoints.development;
    }

    /**
     * Get feature flags
     * @returns {Object} Feature flags object
     */
    static getFeatureFlags() {
        const env = this.getEnvironment();

        // Default feature flags
        const flags = {
            multiplayer: env !== 'development', // Enable multiplayer in staging/prod
            analytics: env === 'production', // Enable analytics in production
            errorReporting: env === 'production', // Enable error reporting in production
            plugins: true, // Enable plugins
            debugMode: env === 'development', // Enable debug mode in development
        };

        // Override with environment-specific flags
        if (import.meta.env?.VITE_FEATURE_FLAGS) {
            try {
                const envFlags = JSON.parse(import.meta.env.VITE_FEATURE_FLAGS);
                Object.assign(flags, envFlags);
            } catch (error) {
                console.warn('Environment: Failed to parse feature flags:', error);
            }
        }

        return flags;
    }

    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} True if enabled
     */
    static isFeatureEnabled(feature) {
        const flags = this.getFeatureFlags();
        return flags[feature] === true;
    }

    /**
     * Get build configuration
     * @returns {Object} Build configuration
     */
    static getBuildConfig() {
        return {
            environment: this.getEnvironment(),
            version: import.meta.env?.VITE_APP_VERSION || '1.0.0',
            buildTime: import.meta.env?.VITE_BUILD_TIME || new Date().toISOString(),
            commitHash: import.meta.env?.VITE_COMMIT_HASH || 'unknown',
        };
    }
}
