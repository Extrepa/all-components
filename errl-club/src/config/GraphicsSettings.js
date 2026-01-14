/**
 * GraphicsSettings - Graphics quality presets and post-processing toggles
 */
import { SettingsManager } from './SettingsManager.js';

export class GraphicsSettings {
    /**
     * Create a new GraphicsSettings
     * @param {SettingsManager} settingsManager - SettingsManager instance
     */
    constructor(settingsManager) {
        this.settingsManager = settingsManager;

        // Quality presets
        this.presets = {
            low: {
                quality: 'low',
                bloom: false,
                ssao: false,
                glitch: false,
                chromaticAberration: false,
                resolution: 0.5,
                fpsTarget: 30,
                effectQuality: 0.3, // Reduced particle counts and effects
                particleMultiplier: 0.3,
                lightingQuality: 0.5,
                lodEnabled: true,
                lodDistance: { high: 0, medium: 10, low: 20 },
            },
            medium: {
                quality: 'medium',
                bloom: true,
                ssao: false,
                glitch: false,
                chromaticAberration: false,
                resolution: 0.75,
                fpsTarget: 60,
                effectQuality: 0.6,
                particleMultiplier: 0.6,
                lightingQuality: 0.7,
                lodEnabled: true,
                lodDistance: { high: 0, medium: 15, low: 30 },
            },
            high: {
                quality: 'high',
                bloom: true,
                ssao: true,
                glitch: true,
                chromaticAberration: true,
                resolution: 1.0,
                fpsTarget: 60,
                effectQuality: 1.0,
                particleMultiplier: 1.0,
                lightingQuality: 1.0,
                lodEnabled: false,
                lodDistance: { high: 0, medium: 20, low: 40 },
            },
            ultra: {
                quality: 'ultra',
                bloom: true,
                ssao: true,
                glitch: true,
                chromaticAberration: true,
                resolution: 1.0,
                fpsTarget: 120,
                effectQuality: 1.2,
                particleMultiplier: 1.2,
                lightingQuality: 1.0,
                lodEnabled: false,
                lodDistance: { high: 0, medium: 25, low: 50 },
            },
        };

        // Initialize defaults
        this.initializeDefaults();
    }

    /**
     * Initialize default settings
     * @private
     */
    initializeDefaults() {
        const currentQuality = this.settingsManager.getSetting('graphics.quality', 'high');
        const preset = this.presets[currentQuality] || this.presets.high;

        // Set defaults if not already set
        if (!this.settingsManager.getSetting('graphics.bloom')) {
            this.settingsManager.setSetting('graphics.bloom', preset.bloom);
        }
        if (!this.settingsManager.getSetting('graphics.ssao')) {
            this.settingsManager.setSetting('graphics.ssao', preset.ssao);
        }
        if (!this.settingsManager.getSetting('graphics.glitch')) {
            this.settingsManager.setSetting('graphics.glitch', preset.glitch);
        }
        if (!this.settingsManager.getSetting('graphics.chromaticAberration')) {
            this.settingsManager.setSetting(
                'graphics.chromaticAberration',
                preset.chromaticAberration
            );
        }
        if (!this.settingsManager.getSetting('graphics.resolution')) {
            this.settingsManager.setSetting('graphics.resolution', preset.resolution);
        }
        if (!this.settingsManager.getSetting('graphics.fpsTarget')) {
            this.settingsManager.setSetting('graphics.fpsTarget', preset.fpsTarget);
        }
        if (!this.settingsManager.getSetting('graphics.effectQuality')) {
            this.settingsManager.setSetting('graphics.effectQuality', preset.effectQuality);
        }
        if (!this.settingsManager.getSetting('graphics.particleMultiplier')) {
            this.settingsManager.setSetting(
                'graphics.particleMultiplier',
                preset.particleMultiplier
            );
        }
        if (!this.settingsManager.getSetting('graphics.lightingQuality')) {
            this.settingsManager.setSetting('graphics.lightingQuality', preset.lightingQuality);
        }
        if (!this.settingsManager.getSetting('graphics.lodEnabled')) {
            this.settingsManager.setSetting('graphics.lodEnabled', preset.lodEnabled);
        }
        if (!this.settingsManager.getSetting('graphics.lodDistance')) {
            this.settingsManager.setSetting('graphics.lodDistance', preset.lodDistance);
        }
    }

    /**
     * Set quality preset
     * @param {string} preset - Preset name ('low', 'medium', 'high', 'ultra')
     */
    setQualityPreset(preset) {
        const presetConfig = this.presets[preset];
        if (!presetConfig) {
            console.warn('GraphicsSettings: Unknown preset:', preset);
            return;
        }

        this.settingsManager.setSetting('graphics.quality', preset);
        this.settingsManager.setSetting('graphics.bloom', presetConfig.bloom);
        this.settingsManager.setSetting('graphics.ssao', presetConfig.ssao);
        this.settingsManager.setSetting('graphics.glitch', presetConfig.glitch);
        this.settingsManager.setSetting(
            'graphics.chromaticAberration',
            presetConfig.chromaticAberration
        );
        this.settingsManager.setSetting('graphics.resolution', presetConfig.resolution);
        this.settingsManager.setSetting('graphics.fpsTarget', presetConfig.fpsTarget);
        this.settingsManager.setSetting('graphics.effectQuality', presetConfig.effectQuality);
        this.settingsManager.setSetting(
            'graphics.particleMultiplier',
            presetConfig.particleMultiplier
        );
        this.settingsManager.setSetting('graphics.lightingQuality', presetConfig.lightingQuality);
        this.settingsManager.setSetting('graphics.lodEnabled', presetConfig.lodEnabled);
        this.settingsManager.setSetting('graphics.lodDistance', presetConfig.lodDistance);

        // Integrate with new preset systems if available
        this.applyPresetsToSystems(preset);
    }

    /**
     * Apply graphics quality preset to all related preset systems
     * @param {string} preset - Graphics quality preset name
     * @private
     */
    applyPresetsToSystems(preset) {
        // Map graphics quality to other preset systems
        const presetMapping = {
            low: {
                postProcessing: 'low',
                particles: 'minimal',
                screenEffects: 'minimal',
            },
            medium: {
                postProcessing: 'medium',
                particles: 'subtle',
                screenEffects: 'subtle',
            },
            high: {
                postProcessing: 'high',
                particles: 'normal',
                screenEffects: 'normal',
            },
            ultra: {
                postProcessing: 'ultra',
                particles: 'intense',
                screenEffects: 'intense',
            },
        };

        const mapping = presetMapping[preset];
        if (!mapping) {
            return;
        }

        // Apply post-processing preset
        if (window.gameSystems?.postProcessingPresets) {
            const postPreset = window.gameSystems.postProcessingPresets.getPreset(
                mapping.postProcessing
            );
            window.gameSystems.postProcessingPresets.setPreset(mapping.postProcessing);

            // Apply to PostProcessingManager if available
            if (window.gameSystems?.postProcessingManager) {
                window.gameSystems.postProcessingManager.setPostProcessingEnabled(
                    postPreset.enabled
                );
                window.gameSystems.postProcessingManager.setBloomIntensity(
                    postPreset.bloomIntensity
                );
                window.gameSystems.postProcessingManager.setGlitchEnabled(
                    postPreset.glitchEnabled,
                    postPreset.glitchIntensity
                );
                window.gameSystems.postProcessingManager.setChromaticAberration(
                    postPreset.chromaticAberrationIntensity
                );
                window.gameSystems.postProcessingManager.setSSAOEnabled(postPreset.ssaoEnabled);
                window.gameSystems.postProcessingManager.setMotionBlurEnabled(
                    postPreset.motionBlurEnabled,
                    postPreset.motionBlurIntensity
                );
            }
        }

        // Apply particle preset
        if (window.gameSystems?.particlePresets && window.gameSystems?.particleSystem) {
            const particlePreset = window.gameSystems.particlePresets.getPreset(mapping.particles);
            window.gameSystems.particlePresets.setPreset(mapping.particles);
            window.gameSystems.particleSystem.setPreset(particlePreset);
        }

        // Apply screen effects preset
        if (window.gameSystems?.screenEffectsPresets) {
            window.gameSystems.screenEffectsPresets.setPreset(mapping.screenEffects);

            // Apply screen effects to environment if available
            if (window.gameSystems?.environmentEffects) {
                const screenPreset = window.gameSystems.screenEffectsPresets.getCurrentPreset();
                window.gameSystems.environmentEffects.setScreenEffectIntensity(
                    screenPreset.screenEffectIntensity
                );
                window.gameSystems.environmentEffects.screenAnimationSpeed =
                    screenPreset.screenAnimationSpeed;
            }
        }
    }

    /**
     * Get current quality preset
     * @returns {string} Current preset name
     */
    getQualityPreset() {
        return this.settingsManager.getSetting('graphics.quality', 'high');
    }

    /**
     * Get current quality (alias for getQualityPreset)
     * @returns {string} Current preset name
     */
    getCurrentQuality() {
        return this.getQualityPreset();
    }

    /**
     * Set quality preset (alias for setQualityPreset)
     * @param {string} preset - Preset name
     */
    setQuality(preset) {
        this.setQualityPreset(preset);
    }

    /**
     * Get setting value
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value
     * @returns {*} Setting value
     */
    getSetting(key, defaultValue = null) {
        return this.settingsManager.getSetting(key, defaultValue);
    }

    /**
     * Set setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    setSetting(key, value) {
        this.settingsManager.setSetting(key, value);
    }

    /**
     * Toggle post-processing effect
     * @param {string} effect - Effect name ('bloom', 'ssao', 'glitch', 'chromaticAberration')
     */
    toggleEffect(effect) {
        const current = this.settingsManager.getSetting(`graphics.${effect}`, false);
        this.settingsManager.setSetting(`graphics.${effect}`, !current);
    }

    /**
     * Get all graphics settings
     * @returns {Object} Graphics settings object
     */
    getSettings() {
        return {
            quality: this.getQualityPreset(),
            bloom: this.settingsManager.getSetting('graphics.bloom', false),
            ssao: this.settingsManager.getSetting('graphics.ssao', false),
            glitch: this.settingsManager.getSetting('graphics.glitch', false),
            chromaticAberration: this.settingsManager.getSetting(
                'graphics.chromaticAberration',
                false
            ),
            resolution: this.settingsManager.getSetting('graphics.resolution', 1.0),
            fpsTarget: this.settingsManager.getSetting('graphics.fpsTarget', 60),
            effectQuality: this.settingsManager.getSetting('graphics.effectQuality', 1.0),
            particleMultiplier: this.settingsManager.getSetting('graphics.particleMultiplier', 1.0),
            lightingQuality: this.settingsManager.getSetting('graphics.lightingQuality', 1.0),
            lodEnabled: this.settingsManager.getSetting('graphics.lodEnabled', false),
            lodDistance: this.settingsManager.getSetting('graphics.lodDistance', {
                high: 0,
                medium: 15,
                low: 30,
            }),
        };
    }

    /**
     * Get effect quality multiplier (for scaling particle counts, etc.)
     * @returns {number} Quality multiplier (0.0 to 1.2)
     */
    getEffectQuality() {
        return this.settingsManager.getSetting('graphics.effectQuality', 1.0);
    }

    /**
     * Get particle multiplier (for scaling particle counts)
     * @returns {number} Particle multiplier (0.0 to 1.2)
     */
    getParticleMultiplier() {
        return this.settingsManager.getSetting('graphics.particleMultiplier', 1.0);
    }

    /**
     * Get lighting quality multiplier
     * @returns {number} Lighting quality (0.0 to 1.0)
     */
    getLightingQuality() {
        return this.settingsManager.getSetting('graphics.lightingQuality', 1.0);
    }

    /**
     * Task 1.4: Get LOD settings
     * @returns {Object} LOD settings {enabled, distances}
     */
    getLODSettings() {
        const quality = this.getQualityPreset();
        const preset = this.presets[quality];
        return {
            enabled: this.settingsManager.getSetting('graphics.lodEnabled', preset.lodEnabled),
            distances: this.settingsManager.getSetting('graphics.lodDistance', preset.lodDistance),
        };
    }

    /**
     * Task 1.4: Set LOD enabled state
     * @param {boolean} enabled - Whether LOD is enabled
     */
    setLODEnabled(enabled) {
        this.settingsManager.setSetting('graphics.lodEnabled', enabled);
    }

    /**
     * Task 1.4: Set LOD distances
     * @param {Object} distances - LOD distances {high, medium, low}
     */
    setLODDistances(distances) {
        this.settingsManager.setSetting('graphics.lodDistance', distances);
    }
}
