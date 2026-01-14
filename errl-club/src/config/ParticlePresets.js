/**
 * ParticlePresets - Preset configurations for particle effects
 *
 * Provides preset configurations for different particle intensity levels:
 * - Max particles
 * - Spawn rates
 * - Particle sizes
 * - Lifetimes
 * - Colors and effects
 */

export class ParticlePresets {
    constructor() {
        // Preset configurations
        this.presets = {
            off: {
                name: 'Off',
                maxParticles: 0,
                spawnRateMultiplier: 0.0,
                sizeMultiplier: 1.0,
                lifetimeMultiplier: 1.0,
                opacityMultiplier: 1.0,
                enabled: false,
            },
            minimal: {
                name: 'Minimal',
                maxParticles: 25,
                spawnRateMultiplier: 0.25,
                sizeMultiplier: 0.7,
                lifetimeMultiplier: 0.8,
                opacityMultiplier: 0.6,
                enabled: true,
            },
            subtle: {
                name: 'Subtle',
                maxParticles: 50,
                spawnRateMultiplier: 0.5,
                sizeMultiplier: 0.85,
                lifetimeMultiplier: 0.9,
                opacityMultiplier: 0.75,
                enabled: true,
            },
            normal: {
                name: 'Normal',
                maxParticles: 100,
                spawnRateMultiplier: 1.0,
                sizeMultiplier: 1.0,
                lifetimeMultiplier: 1.0,
                opacityMultiplier: 1.0,
                enabled: true,
            },
            intense: {
                name: 'Intense',
                maxParticles: 200,
                spawnRateMultiplier: 1.5,
                sizeMultiplier: 1.2,
                lifetimeMultiplier: 1.1,
                opacityMultiplier: 1.2,
                enabled: true,
            },
            extreme: {
                name: 'Extreme',
                maxParticles: 300,
                spawnRateMultiplier: 2.0,
                sizeMultiplier: 1.5,
                lifetimeMultiplier: 1.2,
                opacityMultiplier: 1.5,
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
            const stored = localStorage.getItem('errl_club_particle_preset');
            if (stored) {
                const data = JSON.parse(stored);
                if (this.presets[data.currentPreset]) {
                    this.currentPreset = data.currentPreset;
                }
            }
        } catch (error) {
            console.warn('ParticlePresets: Failed to load preset:', error);
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
            localStorage.setItem('errl_club_particle_preset', JSON.stringify(data));
        } catch (error) {
            console.warn('ParticlePresets: Failed to save preset:', error);
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
            maxParticles: config.maxParticles || 100,
            spawnRateMultiplier: config.spawnRateMultiplier || 1.0,
            sizeMultiplier: config.sizeMultiplier || 1.0,
            lifetimeMultiplier: config.lifetimeMultiplier || 1.0,
            opacityMultiplier: config.opacityMultiplier || 1.0,
            enabled: config.enabled !== undefined ? config.enabled : true,
        };
    }
}
