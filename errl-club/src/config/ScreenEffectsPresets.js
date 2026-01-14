/**
 * ScreenEffectsPresets - Preset configurations for screen effects and glitch
 *
 * Provides preset configurations for different screen effect intensity levels:
 * - Glitch intensity
 * - Screen effect intensity
 * - Screen shake intensity
 * - Screen texture effects
 * - Screen animation speed
 */

export class ScreenEffectsPresets {
    constructor() {
        // Preset configurations
        this.presets = {
            off: {
                name: 'Off',
                glitchIntensity: 0.0,
                screenEffectIntensity: 0.0,
                screenShakeIntensity: 0.0,
                screenAnimationSpeed: 0.0,
                screenGlitchEnabled: false,
                enabled: false,
            },
            minimal: {
                name: 'Minimal',
                glitchIntensity: 0.1,
                screenEffectIntensity: 0.2,
                screenShakeIntensity: 0.1,
                screenAnimationSpeed: 0.5,
                screenGlitchEnabled: true,
                enabled: true,
            },
            subtle: {
                name: 'Subtle',
                glitchIntensity: 0.25,
                screenEffectIntensity: 0.4,
                screenShakeIntensity: 0.2,
                screenAnimationSpeed: 0.75,
                screenGlitchEnabled: true,
                enabled: true,
            },
            normal: {
                name: 'Normal',
                glitchIntensity: 0.5,
                screenEffectIntensity: 1.0,
                screenShakeIntensity: 0.5,
                screenAnimationSpeed: 1.0,
                screenGlitchEnabled: true,
                enabled: true,
            },
            intense: {
                name: 'Intense',
                glitchIntensity: 1.0,
                screenEffectIntensity: 1.5,
                screenShakeIntensity: 0.8,
                screenAnimationSpeed: 1.5,
                screenGlitchEnabled: true,
                enabled: true,
            },
            extreme: {
                name: 'Extreme',
                glitchIntensity: 1.5,
                screenEffectIntensity: 2.0,
                screenShakeIntensity: 1.0,
                screenAnimationSpeed: 2.0,
                screenGlitchEnabled: true,
                enabled: true,
            },
        };

        // Current preset
        this.currentPreset = 'normal';

        // Load saved preset
        this.load();
    }

    /**
     * Load preset from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem('errl_club_screen_effects_preset');
            if (stored) {
                const data = JSON.parse(stored);
                if (this.presets[data.currentPreset]) {
                    this.currentPreset = data.currentPreset;
                }
            }
        } catch (error) {
            console.warn('ScreenEffectsPresets: Failed to load preset:', error);
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
            localStorage.setItem('errl_club_screen_effects_preset', JSON.stringify(data));
        } catch (error) {
            console.warn('ScreenEffectsPresets: Failed to save preset:', error);
        }
    }

    /**
     * Get preset by name
     * @param {string} presetName - Preset name
     * @returns {Object} Preset configuration
     */
    getPreset(presetName) {
        return this.presets[presetName] || this.presets.normal;
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
            glitchIntensity: config.glitchIntensity || 0.5,
            screenEffectIntensity: config.screenEffectIntensity || 1.0,
            screenShakeIntensity: config.screenShakeIntensity || 0.5,
            screenAnimationSpeed: config.screenAnimationSpeed || 1.0,
            screenGlitchEnabled:
                config.screenGlitchEnabled !== undefined ? config.screenGlitchEnabled : true,
            enabled: config.enabled !== undefined ? config.enabled : true,
        };
    }
}
