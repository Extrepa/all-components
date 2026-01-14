/**
 * PostProcessingPresets - Preset configurations for post-processing effects
 *
 * Provides preset configurations for different post-processing quality levels:
 * - Bloom intensity
 * - Glitch intensity
 * - Chromatic aberration intensity
 * - SSAO enabled/disabled
 * - Motion blur enabled/disabled
 * - Overall post-processing quality
 */

export class PostProcessingPresets {
    constructor() {
        // Preset configurations
        this.presets = {
            off: {
                name: 'Off',
                bloomIntensity: 0.0,
                bloomThreshold: 1.0,
                bloomRadius: 0.0,
                glitchIntensity: 0.0,
                chromaticAberrationIntensity: 0.0,
                ssaoEnabled: false,
                motionBlurEnabled: false,
                motionBlurIntensity: 0.0,
                enabled: false,
            },
            low: {
                name: 'Low',
                bloomIntensity: 0.5,
                bloomThreshold: 0.6,
                bloomRadius: 0.4,
                glitchIntensity: 0.0,
                chromaticAberrationIntensity: 0.0,
                ssaoEnabled: false,
                motionBlurEnabled: false,
                motionBlurIntensity: 0.0,
                enabled: true,
            },
            medium: {
                name: 'Medium',
                bloomIntensity: 1.0,
                bloomThreshold: 0.5,
                bloomRadius: 0.6,
                glitchIntensity: 0.3,
                chromaticAberrationIntensity: 0.2,
                ssaoEnabled: false,
                motionBlurEnabled: false,
                motionBlurIntensity: 0.0,
                enabled: true,
            },
            high: {
                name: 'High',
                bloomIntensity: 1.5,
                bloomThreshold: 0.4,
                bloomRadius: 0.8,
                glitchIntensity: 0.5,
                chromaticAberrationIntensity: 0.4,
                ssaoEnabled: true,
                motionBlurEnabled: true,
                motionBlurIntensity: 0.5,
                enabled: true,
            },
            ultra: {
                name: 'Ultra',
                bloomIntensity: 2.0,
                bloomThreshold: 0.3,
                bloomRadius: 1.0,
                glitchIntensity: 0.7,
                chromaticAberrationIntensity: 0.6,
                ssaoEnabled: true,
                motionBlurEnabled: true,
                motionBlurIntensity: 0.8,
                enabled: true,
            },
        };

        // Current preset
        this.currentPreset = 'medium';

        // Load saved preset
        this.load();
    }

    /**
     * Load preset from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem('errl_club_post_processing_preset');
            if (stored) {
                const data = JSON.parse(stored);
                if (this.presets[data.currentPreset]) {
                    this.currentPreset = data.currentPreset;
                }
            }
        } catch (error) {
            console.warn('PostProcessingPresets: Failed to load preset:', error);
        }
    }

    /**
     * Save preset to localStorage
     */
    save() {
        try {
            const data = {
                currentPreset: this.currentPreset,
            };
            localStorage.setItem('errl_club_post_processing_preset', JSON.stringify(data));
        } catch (error) {
            console.warn('PostProcessingPresets: Failed to save preset:', error);
        }
    }

    /**
     * Get preset by name
     * @param {string} presetName - Preset name
     * @returns {Object} Preset configuration
     */
    getPreset(presetName) {
        return this.presets[presetName] || this.presets.medium;
    }

    /**
     * Get current preset
     * @returns {Object} Current preset configuration
     */
    getCurrentPreset() {
        return this.getPreset(this.currentPreset);
    }

    /**
     * Set current preset
     * @param {string} presetName - Preset name
     */
    setPreset(presetName) {
        if (this.presets[presetName]) {
            this.currentPreset = presetName;
            this.save();
        }
    }

    /**
     * Get all preset names
     * @returns {string[]} Array of preset names
     */
    getPresetNames() {
        return Object.keys(this.presets);
    }

    /**
     * Create custom preset
     * @param {string} name - Preset name
     * @param {Object} config - Preset configuration
     */
    createCustomPreset(name, config) {
        this.presets[name] = {
            name: config.name || name,
            bloomIntensity: config.bloomIntensity || 1.0,
            bloomThreshold: config.bloomThreshold || 0.4,
            bloomRadius: config.bloomRadius || 0.8,
            glitchIntensity: config.glitchIntensity || 0.5,
            chromaticAberrationIntensity: config.chromaticAberrationIntensity || 0.4,
            ssaoEnabled: config.ssaoEnabled !== undefined ? config.ssaoEnabled : false,
            motionBlurEnabled:
                config.motionBlurEnabled !== undefined ? config.motionBlurEnabled : false,
            motionBlurIntensity: config.motionBlurIntensity || 0.5,
            enabled: config.enabled !== undefined ? config.enabled : true,
        };
    }
}
