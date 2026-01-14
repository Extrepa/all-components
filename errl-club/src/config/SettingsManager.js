/**
 * SettingsManager - Persistent settings management
 *
 * Handles settings storage, validation, and change events
 */
export class SettingsManager {
    /**
     * Create a new SettingsManager
     * @param {string} storageKey - localStorage key (default: 'errl_club_settings')
     */
    constructor(storageKey = 'errl_club_settings') {
        this.storageKey = storageKey;

        // Settings storage
        this.settings = {};

        // Change listeners: Map<keyPath, Set<callback>>
        this.listeners = new Map();

        // Load settings from storage
        this.load();
    }

    /**
     * Get a setting value
     * @param {string} keyPath - Setting key path (e.g., 'graphics.quality')
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Setting value
     */
    getSetting(keyPath, defaultValue = null) {
        const keys = keyPath.split('.');
        let value = this.settings;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value !== undefined ? value : defaultValue;
    }

    /**
     * Set a setting value
     * @param {string} keyPath - Setting key path
     * @param {*} value - Setting value
     */
    setSetting(keyPath, value) {
        const keys = keyPath.split('.');
        let current = this.settings;

        // Navigate/create nested structure
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        // Set value
        const lastKey = keys[keys.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;

        // Save to storage
        this.save();

        // Notify listeners
        this.notifyListeners(keyPath, value, oldValue);
    }

    /**
     * Subscribe to setting changes
     * @param {string} keyPath - Setting key path (supports wildcards, e.g., 'graphics.*')
     * @param {Function} callback - Callback function (value, oldValue, keyPath) => void
     * @returns {Function} Unsubscribe function
     */
    subscribe(keyPath, callback) {
        if (!this.listeners.has(keyPath)) {
            this.listeners.set(keyPath, new Set());
        }

        this.listeners.get(keyPath).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(keyPath);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(keyPath);
                }
            }
        };
    }

    /**
     * Notify listeners of setting change
     * @param {string} keyPath - Setting key path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     * @private
     */
    notifyListeners(keyPath, newValue, oldValue) {
        // Notify exact match
        const exactListeners = this.listeners.get(keyPath);
        if (exactListeners) {
            exactListeners.forEach((callback) => {
                try {
                    callback(newValue, oldValue, keyPath);
                } catch (error) {
                    console.error('SettingsManager: Error in listener:', error);
                }
            });
        }

        // Notify wildcard matches
        for (const [pattern, listeners] of this.listeners.entries()) {
            if (this.matchesPattern(keyPath, pattern)) {
                listeners.forEach((callback) => {
                    try {
                        callback(newValue, oldValue, keyPath);
                    } catch (error) {
                        console.error('SettingsManager: Error in listener:', error);
                    }
                });
            }
        }
    }

    /**
     * Check if key path matches pattern (supports wildcards)
     * @param {string} keyPath - Key path
     * @param {string} pattern - Pattern
     * @returns {boolean} True if matches
     * @private
     */
    matchesPattern(keyPath, pattern) {
        if (pattern === keyPath) {
            return true;
        }

        // Simple wildcard matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(keyPath);
    }

    /**
     * Load settings from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.settings = JSON.parse(stored);
            }
        } catch (error) {
            console.error('SettingsManager: Failed to load settings:', error);
            this.settings = {};
        }
    }

    /**
     * Save settings to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('SettingsManager: Failed to save settings:', error);
        }
    }

    /**
     * Reset settings to defaults
     * @param {Object} defaults - Default settings object
     */
    reset(defaults = {}) {
        this.settings = { ...defaults };
        this.save();

        // Notify all listeners
        for (const [keyPath] of this.listeners.entries()) {
            this.notifyListeners(keyPath, this.getSetting(keyPath), null);
        }
    }

    /**
     * Get all settings
     * @returns {Object} All settings
     */
    getAllSettings() {
        return { ...this.settings };
    }
}
