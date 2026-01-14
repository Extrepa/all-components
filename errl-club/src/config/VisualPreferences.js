/**
 * VisualPreferences - Visual preference settings with persistence
 *
 * Manages UV mode, visualizer style, and glitch mode preferences
 */
export class VisualPreferences {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;

        // Default preferences
        this.preferences = {
            uvMode: false,
            visualizerStyle: 'default',
            glitchMode: false,
        };

        // Presets
        this.presets = {
            default: {
                uvMode: false,
                visualizerStyle: 'default',
                glitchMode: false,
            },
            neon: {
                uvMode: false,
                visualizerStyle: 'neon',
                glitchMode: false,
            },
            cyberpunk: {
                uvMode: true,
                visualizerStyle: 'cyberpunk',
                glitchMode: true,
            },
            minimal: {
                uvMode: false,
                visualizerStyle: 'minimal',
                glitchMode: false,
            },
            intense: {
                uvMode: true,
                visualizerStyle: 'intense',
                glitchMode: true,
            },
            retro: {
                uvMode: false,
                visualizerStyle: 'retro',
                glitchMode: false,
            },
        };

        this.currentPreset = 'default';
        this.isCustom = false;

        // Load saved preferences
        this.load();
    }

    /**
     * Get current preferences
     * @returns {Object} Current preferences
     */
    getPreferences() {
        return { ...this.preferences };
    }

    /**
     * Get a specific preference value
     * @param {string} key - Preference key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Preference value
     */
    getPreference(key, defaultValue = null) {
        return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
    }

    /**
     * Set UV mode preference
     * @param {boolean} enabled - UV mode enabled
     */
    setUVMode(enabled) {
        if (this.preferences.uvMode !== enabled) {
            this.preferences.uvMode = enabled;
            this.isCustom = true;
            this.currentPreset = 'custom';
            this.save();
        }
    }

    /**
     * Set visualizer style preference
     * @param {string} style - Visualizer style ('default', 'neon', 'retro', 'cyberpunk', 'minimal', 'intense')
     */
    setVisualizerStyle(style) {
        const validStyles = ['default', 'neon', 'retro', 'cyberpunk', 'minimal', 'intense'];
        if (validStyles.includes(style) && this.preferences.visualizerStyle !== style) {
            this.preferences.visualizerStyle = style;
            this.isCustom = true;
            this.currentPreset = 'custom';
            this.save();
        }
    }

    /**
     * Set glitch mode preference
     * @param {boolean} enabled - Glitch mode enabled
     */
    setGlitchMode(enabled) {
        if (this.preferences.glitchMode !== enabled) {
            this.preferences.glitchMode = enabled;
            this.isCustom = true;
            this.currentPreset = 'custom';
            this.save();
        }
    }

    /**
     * Apply a preset
     * @param {string} presetName - Preset name ('default', 'neon', 'cyberpunk', 'minimal', 'intense', 'retro')
     * @returns {boolean} True if preset applied
     */
    applyPreset(presetName) {
        if (!this.presets[presetName]) {
            console.warn('VisualPreferences: Preset not found:', presetName);
            return false;
        }

        const preset = this.presets[presetName];
        this.preferences.uvMode = preset.uvMode;
        this.preferences.visualizerStyle = preset.visualizerStyle;
        this.preferences.glitchMode = preset.glitchMode;
        this.currentPreset = presetName;
        this.isCustom = false;
        this.save();
        return true;
    }

    /**
     * Get current preset name
     * @returns {string} Current preset name or 'custom'
     */
    getCurrentPreset() {
        return this.isCustom ? 'custom' : this.currentPreset;
    }

    /**
     * Get all available presets
     * @returns {Array<string>} Array of preset names
     */
    getAvailablePresets() {
        return Object.keys(this.presets);
    }

    /**
     * Get preset values
     * @param {string} presetName - Preset name
     * @returns {Object|null} Preset values or null
     */
    getPreset(presetName) {
        return this.presets[presetName] ? { ...this.presets[presetName] } : null;
    }

    /**
     * Check if current preferences match a preset
     * @param {string} presetName - Preset name to check
     * @returns {boolean} True if preferences match preset
     */
    matchesPreset(presetName) {
        if (!this.presets[presetName]) {
            return false;
        }

        const preset = this.presets[presetName];
        return (
            this.preferences.uvMode === preset.uvMode &&
            this.preferences.visualizerStyle === preset.visualizerStyle &&
            this.preferences.glitchMode === preset.glitchMode
        );
    }

    /**
     * Export preferences as JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify({
            preferences: this.preferences,
        });
    }

    /**
     * Import preferences from JSON
     * @param {string} jsonString - JSON string
     * @returns {boolean} True if import successful
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.preferences) {
                // Validate and merge preferences
                if (typeof data.preferences.uvMode === 'boolean') {
                    this.preferences.uvMode = data.preferences.uvMode;
                }
                if (typeof data.preferences.visualizerStyle === 'string') {
                    const validStyles = [
                        'default',
                        'neon',
                        'retro',
                        'cyberpunk',
                        'minimal',
                        'intense',
                    ];
                    if (validStyles.includes(data.preferences.visualizerStyle)) {
                        this.preferences.visualizerStyle = data.preferences.visualizerStyle;
                    }
                }
                if (typeof data.preferences.glitchMode === 'boolean') {
                    this.preferences.glitchMode = data.preferences.glitchMode;
                }
                return true;
            }
        } catch (error) {
            console.error('Error importing visual preferences:', error);
        }
        return false;
    }

    /**
     * Reset to default preferences
     */
    reset() {
        this.applyPreset('default');
    }

    /**
     * Update preferences to match current preset (if changed externally)
     * @private
     */
    updatePresetMatch() {
        // Check if current preferences match any preset
        for (const presetName in this.presets) {
            if (this.matchesPreset(presetName)) {
                this.currentPreset = presetName;
                this.isCustom = false;
                return;
            }
        }
        // No match found, mark as custom
        this.isCustom = true;
        this.currentPreset = 'custom';
    }

    /**
     * Load preferences from SettingsManager
     * @private
     */
    load() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('visualPreferences', null);
        if (saved) {
            this.import(JSON.stringify(saved));
        }
    }

    /**
     * Save preferences to SettingsManager
     * @private
     */
    save() {
        if (!this.settingsManager) {
            return;
        }

        const preferencesJson = this.export();
        const preferencesData = JSON.parse(preferencesJson);
        this.settingsManager.setSetting('visualPreferences', preferencesData);
    }
}
