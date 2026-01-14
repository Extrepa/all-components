/**
 * CameraSettings - Comprehensive camera intensity and behavior controls
 *
 * Provides intensity presets and individual controls for all camera aspects
 */
export class CameraSettings {
    constructor() {
        // Intensity presets
        this.presets = {
            low: this.createLowPreset(),
            medium: this.createMediumPreset(),
            high: this.createHighPreset(),
        };

        // Current settings (starts with medium preset)
        this.currentSettings = this.presets.medium;
        this.currentPreset = 'medium';
        this.isCustom = false;

        // Default values (for reset)
        this.defaults = this.createMediumPreset();
    }

    /**
     * Create low intensity preset
     */
    createLowPreset() {
        return {
            // Basic Movement Controls
            sensitivity: 0.005, // Very low mouse sensitivity
            zoomSpeed: 0.3, // Slower zoom
            autoAlignSpeed: 1.0, // Slower auto-align
            springStiffness: 0.05, // Very smooth, slow movement
            springDamping: 0.9, // High damping for stability

            // Advanced Movement Controls
            followSmoothness: 0.05, // Very smooth following
            distanceTransitionSpeed: 0.1, // Slow distance changes
            angleTransitionSpeed: 0.1, // Slow angle changes
            autoAlignDelay: 3.0, // Longer delay before auto-align
            microJitterAmount: 0.0, // No micro jitter
            microJitterEnabled: false, // Disabled

            // Camera Effects Controls
            shakeIntensityMultiplier: 0.0, // No shake
            shakeDecayRate: 10.0, // Fast decay if any shake
            bassReactiveShakeEnabled: false, // Disabled
            audioReactiveEnabled: false, // Audio-reactive camera disabled
            audioReactiveIntensity: 0.0, // No audio-reactive intensity
            audioReactiveSmoothing: 0.9, // Very smooth (not used if disabled)
            wildMomentEffectsIntensity: 0.0, // No wild effects
            cameraRollTiltAmount: 0.0, // No roll/tilt
            headBobAmount: 0.0, // No head bob
            headBobSpeed: 0.0, // No head bob

            // Mode-Specific Controls
            cinematicOrbitSpeed: 0.1, // Slow orbit
            cinematicOrbitRadius: 10, // Standard radius
            lockOnTransitionSpeed: 0.1, // Slow lock-on
            freecamMovementSpeed: 0.5, // Slower freecam
            freecamRotationSpeed: 0.3, // Slower freecam rotation

            // Post-Processing Camera Effects
            chromaticAberrationIntensity: 0.0, // No chromatic aberration
            glitchEffectIntensity: 0.0, // No glitch
            motionBlurEnabled: false, // No motion blur
            screenShakeFromEffects: 0.0, // No screen shake
            visualDistortionIntensity: 0.0, // No distortion
        };
    }

    /**
     * Create medium intensity preset
     */
    createMediumPreset() {
        return {
            // Basic Movement Controls
            sensitivity: 0.01, // Standard sensitivity (from CAMERA_CONFIG)
            zoomSpeed: 0.5, // Standard zoom (from CAMERA_CONFIG)
            autoAlignSpeed: 2.0, // Standard auto-align (from CAMERA_CONFIG)
            springStiffness: 0.15, // Standard spring (from CAMERA_CONFIG)
            springDamping: 0.8, // Standard damping (from CAMERA_CONFIG)

            // Advanced Movement Controls
            followSmoothness: 0.1, // Moderate smoothness
            distanceTransitionSpeed: 0.2, // Moderate transition
            angleTransitionSpeed: 0.2, // Moderate transition
            autoAlignDelay: 2.0, // Standard delay
            microJitterAmount: 0.001, // Subtle jitter
            microJitterEnabled: false, // Disabled by default

            // Camera Effects Controls
            shakeIntensityMultiplier: 0.5, // Moderate shake
            shakeDecayRate: 5.0, // Standard decay
            bassReactiveShakeEnabled: true, // Enabled
            audioReactiveEnabled: true, // Audio-reactive camera enabled
            audioReactiveIntensity: 0.7, // Moderate audio-reactive intensity
            audioReactiveSmoothing: 0.8, // Smooth transitions
            wildMomentEffectsIntensity: 0.5, // Moderate wild effects
            cameraRollTiltAmount: 0.05, // Subtle roll/tilt
            headBobAmount: 0.0, // No head bob
            headBobSpeed: 0.0, // No head bob

            // Mode-Specific Controls
            cinematicOrbitSpeed: 0.2, // Standard orbit (from CameraController)
            cinematicOrbitRadius: 10, // Standard radius
            lockOnTransitionSpeed: 0.2, // Standard lock-on
            freecamMovementSpeed: 1.0, // Standard freecam
            freecamRotationSpeed: 0.5, // Standard freecam rotation

            // Post-Processing Camera Effects
            chromaticAberrationIntensity: 0.3, // Moderate chromatic aberration
            glitchEffectIntensity: 0.5, // Moderate glitch
            motionBlurEnabled: false, // Disabled by default
            screenShakeFromEffects: 0.3, // Moderate screen shake
            visualDistortionIntensity: 0.3, // Moderate distortion
        };
    }

    /**
     * Create high intensity preset
     */
    createHighPreset() {
        return {
            // Basic Movement Controls
            sensitivity: 0.02, // Higher sensitivity
            zoomSpeed: 0.8, // Faster zoom
            autoAlignSpeed: 4.0, // Faster auto-align
            springStiffness: 0.3, // Stiffer, more responsive
            springDamping: 0.6, // Less damping, more reactive

            // Advanced Movement Controls
            followSmoothness: 0.2, // Less smooth, more responsive
            distanceTransitionSpeed: 0.4, // Faster transitions
            angleTransitionSpeed: 0.4, // Faster transitions
            autoAlignDelay: 1.0, // Shorter delay
            microJitterAmount: 0.002, // More jitter (from CameraController default)
            microJitterEnabled: true, // Enabled

            // Camera Effects Controls
            shakeIntensityMultiplier: 1.0, // Full shake
            shakeDecayRate: 3.0, // Slower decay
            bassReactiveShakeEnabled: true, // Enabled
            wildMomentEffectsIntensity: 1.0, // Full wild effects
            cameraRollTiltAmount: 0.1, // More roll/tilt
            headBobAmount: 0.05, // Head bob
            headBobSpeed: 2.0, // Head bob speed

            // Mode-Specific Controls
            cinematicOrbitSpeed: 0.4, // Faster orbit
            cinematicOrbitRadius: 12, // Larger radius
            lockOnTransitionSpeed: 0.4, // Faster lock-on
            freecamMovementSpeed: 2.0, // Faster freecam
            freecamRotationSpeed: 1.0, // Faster freecam rotation

            // Post-Processing Camera Effects
            chromaticAberrationIntensity: 1.0, // Full chromatic aberration
            glitchEffectIntensity: 1.0, // Full glitch
            motionBlurEnabled: true, // Enabled
            screenShakeFromEffects: 1.0, // Full screen shake
            visualDistortionIntensity: 1.0, // Full distortion
        };
    }

    /**
     * Apply a preset
     * @param {string} presetName - 'low', 'medium', or 'high'
     */
    applyPreset(presetName) {
        if (this.presets[presetName]) {
            this.currentSettings = { ...this.presets[presetName] };
            this.currentPreset = presetName;
            this.isCustom = false;
            return true;
        }
        return false;
    }

    /**
     * Get current settings
     * @returns {Object} Current camera settings
     */
    getSettings() {
        return { ...this.currentSettings };
    }

    /**
     * Update a specific setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    setSetting(key, value) {
        if (key in this.currentSettings) {
            this.currentSettings[key] = value;
            this.isCustom = true;
            this.currentPreset = 'custom';
            return true;
        }
        return false;
    }

    /**
     * Update multiple settings at once
     * @param {Object} settings - Object with key: value pairs
     */
    setSettings(settings) {
        let changed = false;
        for (const [key, value] of Object.entries(settings)) {
            if (key in this.currentSettings) {
                this.currentSettings[key] = value;
                changed = true;
            }
        }
        if (changed) {
            this.isCustom = true;
            this.currentPreset = 'custom';
        }
        return changed;
    }

    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Setting value
     */
    getSetting(key, defaultValue = null) {
        return this.currentSettings[key] !== undefined ? this.currentSettings[key] : defaultValue;
    }

    /**
     * Reset to default (medium) preset
     */
    reset() {
        this.applyPreset('medium');
    }

    /**
     * Get current preset name
     * @returns {string} Current preset name or 'custom'
     */
    getCurrentPreset() {
        return this.isCustom ? 'custom' : this.currentPreset;
    }

    /**
     * Check if settings match a preset
     * @param {string} presetName - Preset name to check
     * @returns {boolean} True if settings match preset
     */
    matchesPreset(presetName) {
        if (!this.presets[presetName]) {
            return false;
        }

        const preset = this.presets[presetName];
        for (const key in preset) {
            if (Math.abs(this.currentSettings[key] - preset[key]) > 0.001) {
                return false;
            }
        }
        return true;
    }

    /**
     * Export settings as JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify({
            settings: this.currentSettings,
            preset: this.getCurrentPreset(),
        });
    }

    /**
     * Import settings from JSON
     * @param {string} jsonString - JSON string
     * @returns {boolean} True if import successful
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.settings) {
                this.setSettings(data.settings);
                if (data.preset && this.presets[data.preset]) {
                    // Check if imported settings match a preset
                    const tempSettings = { ...this.currentSettings };
                    this.applyPreset(data.preset);
                    if (this.matchesPreset(data.preset)) {
                        this.currentPreset = data.preset;
                        this.isCustom = false;
                    } else {
                        this.currentSettings = tempSettings;
                        this.isCustom = true;
                        this.currentPreset = 'custom';
                    }
                }
                return true;
            }
        } catch (error) {
            console.error('Error importing camera settings:', error);
        }
        return false;
    }

    /**
     * Get all available presets
     * @returns {Array<string>} Array of preset names
     */
    getAvailablePresets() {
        return Object.keys(this.presets);
    }

    /**
     * Get preset values (for comparison)
     * @param {string} presetName - Preset name
     * @returns {Object|null} Preset values or null
     */
    getPreset(presetName) {
        return this.presets[presetName] ? { ...this.presets[presetName] } : null;
    }
}
