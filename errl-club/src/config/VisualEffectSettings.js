/**
 * VisualEffectSettings - Configuration and persistence for visual effect intensity controls
 *
 * Provides granular controls for all visual effects:
 * - UV mode intensity
 * - Glitch intensity
 * - Chromatic aberration intensity
 * - Visual distortion intensity
 * - Preset system (save/load combinations)
 */

export class VisualEffectSettings {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;

        // Default settings
        this.settings = {
            uvModeIntensity: 1.0,
            glitchIntensity: 0.5,
            chromaticAberrationIntensity: 0.0,
            visualDistortionIntensity: 0.0,
            screenEffectIntensity: 1.0,
        };

        // Presets
        this.presets = {
            off: {
                name: 'Off',
                uvModeIntensity: 0.0,
                glitchIntensity: 0.0,
                chromaticAberrationIntensity: 0.0,
                visualDistortionIntensity: 0.0,
                screenEffectIntensity: 0.0,
            },
            subtle: {
                name: 'Subtle',
                uvModeIntensity: 0.3,
                glitchIntensity: 0.2,
                chromaticAberrationIntensity: 0.1,
                visualDistortionIntensity: 0.1,
                screenEffectIntensity: 0.5,
            },
            normal: {
                name: 'Normal',
                uvModeIntensity: 1.0,
                glitchIntensity: 0.5,
                chromaticAberrationIntensity: 0.0,
                visualDistortionIntensity: 0.0,
                screenEffectIntensity: 1.0,
            },
            intense: {
                name: 'Intense',
                uvModeIntensity: 1.5,
                glitchIntensity: 1.0,
                chromaticAberrationIntensity: 0.5,
                visualDistortionIntensity: 0.5,
                screenEffectIntensity: 1.5,
            },
            extreme: {
                name: 'Extreme',
                uvModeIntensity: 2.0,
                glitchIntensity: 1.5,
                chromaticAberrationIntensity: 1.0,
                visualDistortionIntensity: 1.0,
                screenEffectIntensity: 2.0,
            },
        };

        // Custom presets (user-created)
        this.customPresets = {};

        // Load from settings manager if available
        this.load();
    }

    /**
     * Get current setting value
     * @param {string} key - Setting key
     * @returns {number} Setting value
     */
    get(key) {
        return this.settings[key] !== undefined ? this.settings[key] : 0;
    }

    /**
     * Get current setting value (alias for get, for compatibility)
     * @param {string} key - Setting key
     * @returns {number} Setting value
     */
    getSetting(key) {
        return this.get(key);
    }

    /**
     * Set setting value
     * @param {string} key - Setting key
     * @param {number} value - Setting value
     */
    set(key, value) {
        if (this.settings[key] !== undefined) {
            this.settings[key] = Math.max(0, Math.min(2.0, value)); // Clamp 0-2.0
            this.save();
        }
    }

    /**
     * Set setting value (alias for set, for compatibility)
     * @param {string} key - Setting key
     * @param {number} value - Setting value
     */
    setSetting(key, value) {
        this.set(key, value);
    }

    /**
     * Get all settings (alias for getAll, for compatibility)
     * @returns {Object} Settings object
     */
    getSettings() {
        return this.getAll();
    }

    /**
     * Get all settings
     * @returns {Object} Settings object
     */
    getAll() {
        return { ...this.settings };
    }

    /**
     * Set all settings
     * @param {Object} settings - Settings object
     */
    setAll(settings) {
        Object.keys(this.settings).forEach((key) => {
            if (settings[key] !== undefined) {
                this.set(key, settings[key]);
            }
        });
    }

    /**
     * Apply preset
     * @param {string} presetName - Name of preset
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName] || this.customPresets[presetName];
        if (preset) {
            this.setAll({
                uvModeIntensity: preset.uvModeIntensity,
                glitchIntensity: preset.glitchIntensity,
                chromaticAberrationIntensity: preset.chromaticAberrationIntensity,
                visualDistortionIntensity: preset.visualDistortionIntensity,
                screenEffectIntensity: preset.screenEffectIntensity,
            });
            return true;
        }
        return false;
    }

    /**
     * Save current settings as custom preset
     * @param {string} name - Preset name
     */
    saveAsPreset(name) {
        this.customPresets[name] = {
            name: name,
            ...this.getAll(),
        };
        this.save();
    }

    /**
     * Delete custom preset
     * @param {string} name - Preset name
     */
    deletePreset(name) {
        if (this.customPresets[name]) {
            delete this.customPresets[name];
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get all available presets
     * @returns {Object} Object with preset names as keys
     */
    getPresets() {
        return { ...this.presets, ...this.customPresets };
    }

    /**
     * Get current preset name (if settings match a preset)
     * @returns {string|null} Preset name or null if no match
     */
    getCurrentPreset() {
        const current = this.getAll();
        const allPresets = this.getPresets();

        for (const [name, preset] of Object.entries(allPresets)) {
            if (
                Math.abs(preset.uvModeIntensity - current.uvModeIntensity) < 0.01 &&
                Math.abs(preset.glitchIntensity - current.glitchIntensity) < 0.01 &&
                Math.abs(
                    preset.chromaticAberrationIntensity - current.chromaticAberrationIntensity
                ) < 0.01 &&
                Math.abs(preset.visualDistortionIntensity - current.visualDistortionIntensity) <
                    0.01 &&
                Math.abs(preset.screenEffectIntensity - current.screenEffectIntensity) < 0.01
            ) {
                return name;
            }
        }

        return null;
    }

    /**
     * Load settings from storage
     */
    load() {
        if (this.settingsManager && typeof this.settingsManager.getSetting === 'function') {
            const saved = this.settingsManager.getSetting('visualEffectSettings');
            if (saved) {
                this.setAll(saved.settings || {});
                this.customPresets = saved.customPresets || {};
            }
        } else if (typeof localStorage !== 'undefined') {
            try {
                const saved = JSON.parse(localStorage.getItem('visualEffectSettings') || '{}');
                if (saved.settings) {
                    this.setAll(saved.settings);
                }
                if (saved.customPresets) {
                    this.customPresets = saved.customPresets;
                }
            } catch (error) {
                console.warn('Failed to load visual effect settings:', error);
            }
        }
    }

    /**
     * Save settings to storage
     */
    save() {
        const data = {
            settings: this.getAll(),
            customPresets: this.customPresets,
        };

        if (this.settingsManager) {
            this.settingsManager.set('visualEffectSettings', data);
        } else if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('visualEffectSettings', JSON.stringify(data));
            } catch (error) {
                console.warn('Failed to save visual effect settings:', error);
            }
        }
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.settings = {
            uvModeIntensity: 1.0,
            glitchIntensity: 0.5,
            chromaticAberrationIntensity: 0.0,
            visualDistortionIntensity: 0.0,
            screenEffectIntensity: 1.0,
        };
        this.save();
    }

    /**
     * Get intensity for an effect (maps effect names to setting keys)
     * @param {string} effectName - Effect name (e.g., 'uvMode', 'glitch', 'distortion')
     * @returns {number} Intensity value
     */
    getIntensity(effectName) {
        const mapping = {
            uvMode: 'uvModeIntensity',
            glitch: 'glitchIntensity',
            distortion: 'visualDistortionIntensity',
            chromaticAberration: 'chromaticAberrationIntensity',
            bloom: 'screenEffectIntensity', // Using screenEffectIntensity as bloom proxy
            colorGrading: 'screenEffectIntensity', // Using screenEffectIntensity as colorGrading proxy
            particleEffects: 'screenEffectIntensity', // Using screenEffectIntensity as particleEffects proxy
            laserEffects: 'screenEffectIntensity', // Using screenEffectIntensity as laserEffects proxy
            rippleEffects: 'screenEffectIntensity', // Using screenEffectIntensity as rippleEffects proxy
        };
        const key = mapping[effectName] || effectName;
        return this.get(key);
    }

    /**
     * Set intensity for an effect (maps effect names to setting keys)
     * @param {string} effectName - Effect name (e.g., 'uvMode', 'glitch', 'distortion')
     * @param {number} value - Intensity value
     */
    setIntensity(effectName, value) {
        const mapping = {
            uvMode: 'uvModeIntensity',
            glitch: 'glitchIntensity',
            distortion: 'visualDistortionIntensity',
            chromaticAberration: 'chromaticAberrationIntensity',
            bloom: 'screenEffectIntensity', // Using screenEffectIntensity as bloom proxy
            colorGrading: 'screenEffectIntensity', // Using screenEffectIntensity as colorGrading proxy
            particleEffects: 'screenEffectIntensity', // Using screenEffectIntensity as particleEffects proxy
            laserEffects: 'screenEffectIntensity', // Using screenEffectIntensity as laserEffects proxy
            rippleEffects: 'screenEffectIntensity', // Using screenEffectIntensity as rippleEffects proxy
        };
        const key = mapping[effectName] || effectName;
        this.set(key, value);
    }
}
