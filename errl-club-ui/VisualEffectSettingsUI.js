/**
 * VisualEffectSettingsUI - UI for visual effect intensity controls
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Slider } from './components/Slider.js';
import { Dropdown } from './components/Dropdown.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class VisualEffectSettingsUI extends BasePanel {
    /**
     * Create a new VisualEffectSettingsUI
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.visualEffectSettings - VisualEffectSettings instance
     * @param {Object} config.visualEffects - VisualEffects instance
     * @param {Object} config.postProcessingManager - PostProcessingManager instance
     * @param {Object} config.cameraSettings - CameraSettings instance (optional, for distortion/chromatic)
     */
    constructor(config = {}) {
        super({
            id: 'visual_effect_settings_ui',
            title: 'Visual Effect Intensity',
            position: { x: 100, y: 100 },
            size: { width: 600, height: 700 },
        });

        this.onClose = config.onClose || (() => {});
        this.visualEffectSettings = config.visualEffectSettings;
        this.visualEffects = config.visualEffects;
        this.postProcessingManager = config.postProcessingManager;
        this.cameraSettings = config.cameraSettings;

        // UI state
        this.sliders = new Map();
        this.currentPreset = 'moderate';
        this.realTimePreview = true;

        // Create UI content
        this.createContent();

        // Load current settings
        this.loadSettings();
    }

    /**
     * Create UI content
     * @private
     */
    createContent() {
        const content = this.content;

        // Preset selector
        const presetContainer = document.createElement('div');
        presetContainer.style.cssText = 'margin-bottom: 20px;';

        const presetLabel = document.createElement('label');
        presetLabel.textContent = 'Preset:';
        presetLabel.style.cssText = `
            display: block;
            margin-bottom: 5px;
            color: ${DESIGN_SYSTEM.colors.text};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        presetContainer.appendChild(presetLabel);

        const presetDropdown = new Dropdown({
            options: [
                { value: 'subtle', label: 'Subtle - Minimal Effects' },
                { value: 'moderate', label: 'Moderate - Balanced' },
                { value: 'intense', label: 'Intense - Strong Effects' },
                { value: 'extreme', label: 'Extreme - Maximum Effects' },
                { value: 'custom', label: 'Custom' },
            ],
            value: this.currentPreset,
            onChange: (value) => {
                if (value !== 'custom') {
                    this.visualEffectSettings.applyPreset(value);
                    this.loadSettings();
                    this.applySettings();
                }
            },
        });
        presetContainer.appendChild(presetDropdown.element);
        content.appendChild(presetContainer);

        // UV Mode Intensity
        const uvContainer = this.createSliderSection(
            'UV Mode Intensity',
            'uvModeIntensity',
            0.0,
            1.0,
            0.01,
            (v) => `${(v * 100).toFixed(0)}%`
        );
        content.appendChild(uvContainer);

        // Glitch Intensity
        const glitchContainer = this.createSliderSection(
            'Glitch Effect Intensity',
            'glitchIntensity',
            0.0,
            1.0,
            0.05,
            (v) => `${(v * 100).toFixed(0)}%`
        );
        content.appendChild(glitchContainer);

        // Visual Distortion Intensity
        const distortionContainer = this.createSliderSection(
            'Visual Distortion Intensity',
            'visualDistortionIntensity',
            0.0,
            1.0,
            0.05,
            (v) => `${(v * 100).toFixed(0)}%`
        );
        content.appendChild(distortionContainer);

        // Chromatic Aberration Intensity
        const chromaticContainer = this.createSliderSection(
            'Chromatic Aberration Intensity',
            'chromaticAberrationIntensity',
            0.0,
            1.0,
            0.05,
            (v) => `${(v * 100).toFixed(0)}%`
        );
        content.appendChild(chromaticContainer);

        // Screen Shake Intensity
        const shakeContainer = this.createSliderSection(
            'Screen Shake Intensity',
            'screenShakeIntensity',
            0.0,
            1.0,
            0.05,
            (v) => `${(v * 100).toFixed(0)}%`
        );
        content.appendChild(shakeContainer);

        // Bloom Intensity
        const bloomContainer = this.createSliderSection(
            'Bloom Intensity',
            'bloomIntensity',
            0.0,
            3.0,
            0.1,
            (v) => v.toFixed(1)
        );
        content.appendChild(bloomContainer);

        // Screen Effect Intensity
        const screenEffectContainer = this.createSliderSection(
            'Screen Effect Intensity',
            'screenEffectIntensity',
            0.0,
            2.0,
            0.1,
            (v) => v.toFixed(1)
        );
        content.appendChild(screenEffectContainer);

        // Particle Intensity
        const particleContainer = this.createSliderSection(
            'Particle Effect Intensity',
            'particleIntensity',
            0.0,
            2.0,
            0.1,
            (v) => v.toFixed(1)
        );
        content.appendChild(particleContainer);

        // Screen Effects Preset Selector (if available)
        if (window.gameSystems?.screenEffectsPresets) {
            const screenPresetContainer = document.createElement('div');
            screenPresetContainer.style.cssText = `
                margin-bottom: 16px;
                padding: 12px;
                border: 1px solid #00ffff;
                border-radius: 4px;
            `;

            const screenPresetLabel = document.createElement('div');
            screenPresetLabel.textContent = 'Screen Effects & Glitch Preset';
            screenPresetLabel.style.cssText = `
                color: #00ffff;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
            `;
            screenPresetContainer.appendChild(screenPresetLabel);

            const screenPresetDropdown = new Dropdown({
                label: '',
                options: [
                    { value: 'off', label: 'Off - No Screen Effects' },
                    { value: 'minimal', label: 'Minimal - Very Subtle' },
                    { value: 'subtle', label: 'Subtle - Reduced Effects' },
                    { value: 'normal', label: 'Normal - Standard Effects' },
                    { value: 'intense', label: 'Intense - Strong Effects' },
                    { value: 'extreme', label: 'Extreme - Maximum Effects' },
                ],
                value: window.gameSystems.screenEffectsPresets.currentPreset,
                onChange: (value) => {
                    const preset = window.gameSystems.screenEffectsPresets.getPreset(value);
                    window.gameSystems.screenEffectsPresets.setPreset(value);

                    // Apply preset settings
                    if (this.postProcessingManager) {
                        this.postProcessingManager.setGlitchEnabled(
                            preset.screenGlitchEnabled,
                            preset.glitchIntensity
                        );
                        this.postProcessingManager.setGlitchIntensity(preset.glitchIntensity);
                    }

                    // Update environment effects if available
                    if (window.gameSystems?.environmentEffects) {
                        window.gameSystems.environmentEffects.setScreenEffectIntensity(
                            preset.screenEffectIntensity
                        );
                        window.gameSystems.environmentEffects.screenAnimationSpeed =
                            preset.screenAnimationSpeed;
                    }

                    // Update sliders to match preset
                    if (this.sliders.has('glitchIntensity')) {
                        this.sliders.get('glitchIntensity').setValue(preset.glitchIntensity);
                        this.visualEffectSettings.setSetting(
                            'glitchIntensity',
                            preset.glitchIntensity
                        );
                    }
                    if (this.sliders.has('screenEffectIntensity')) {
                        this.sliders
                            .get('screenEffectIntensity')
                            .setValue(preset.screenEffectIntensity);
                        this.visualEffectSettings.setSetting(
                            'screenEffectIntensity',
                            preset.screenEffectIntensity
                        );
                    }
                },
            });
            screenPresetContainer.appendChild(screenPresetDropdown.getElement());
            content.appendChild(screenPresetContainer);
        }

        // Post-Processing Preset Selector (if available)
        if (window.gameSystems?.postProcessingPresets && this.postProcessingManager) {
            const postPresetContainer = document.createElement('div');
            postPresetContainer.style.cssText = `
                margin-bottom: 16px;
                padding: 12px;
                border: 1px solid #00ffff;
                border-radius: 4px;
            `;

            const postPresetLabel = document.createElement('div');
            postPresetLabel.textContent = 'Post-Processing Quality Preset';
            postPresetLabel.style.cssText = `
                color: #00ffff;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
            `;
            postPresetContainer.appendChild(postPresetLabel);

            const postPresetDropdown = new Dropdown({
                label: '',
                options: [
                    { value: 'off', label: 'Off - No Post-Processing' },
                    { value: 'low', label: 'Low - Minimal Effects' },
                    { value: 'medium', label: 'Medium - Balanced' },
                    { value: 'high', label: 'High - Full Effects' },
                    { value: 'ultra', label: 'Ultra - Maximum Quality' },
                ],
                value: window.gameSystems.postProcessingPresets.currentPreset,
                onChange: (value) => {
                    const preset = window.gameSystems.postProcessingPresets.getPreset(value);
                    window.gameSystems.postProcessingPresets.setPreset(value);

                    // Apply preset settings to post-processing manager
                    if (this.postProcessingManager) {
                        // Enable/disable post-processing
                        this.postProcessingManager.setPostProcessingEnabled(preset.enabled);

                        // Apply bloom settings
                        if (preset.enabled && this.postProcessingManager.bloomPass) {
                            this.postProcessingManager.setBloomIntensity(preset.bloomIntensity);
                            if (this.postProcessingManager.bloomPass.threshold !== undefined) {
                                this.postProcessingManager.bloomPass.threshold =
                                    preset.bloomThreshold;
                            }
                            if (this.postProcessingManager.bloomPass.radius !== undefined) {
                                this.postProcessingManager.bloomPass.radius = preset.bloomRadius;
                            }
                        }

                        // Apply glitch settings
                        this.postProcessingManager.setGlitchEnabled(
                            preset.enabled && preset.glitchIntensity > 0,
                            preset.glitchIntensity
                        );

                        // Apply chromatic aberration
                        this.postProcessingManager.setChromaticAberration(
                            preset.chromaticAberrationIntensity * 0.1, // Scale to 0-0.1 range
                            0.0
                        );

                        // Apply motion blur
                        if (this.postProcessingManager.setMotionBlurEnabled) {
                            this.postProcessingManager.setMotionBlurEnabled(
                                preset.motionBlurEnabled,
                                preset.motionBlurIntensity
                            );
                        }
                    }

                    // Update sliders to match preset
                    if (this.sliders.has('bloomIntensity')) {
                        this.sliders.get('bloomIntensity').setValue(preset.bloomIntensity);
                        this.visualEffectSettings.setSetting(
                            'bloomIntensity',
                            preset.bloomIntensity
                        );
                    }
                    if (this.sliders.has('glitchIntensity')) {
                        this.sliders.get('glitchIntensity').setValue(preset.glitchIntensity);
                        this.visualEffectSettings.setSetting(
                            'glitchIntensity',
                            preset.glitchIntensity
                        );
                    }
                },
            });
            postPresetContainer.appendChild(postPresetDropdown.getElement());
            content.appendChild(postPresetContainer);
        }

        // Particle Preset Selector (if available)
        if (window.gameSystems?.particlePresets) {
            const presetContainer = document.createElement('div');
            presetContainer.style.cssText = `
                margin-bottom: 16px;
                padding: 12px;
                border: 1px solid #00ffff;
                border-radius: 4px;
            `;

            const presetLabel = document.createElement('div');
            presetLabel.textContent = 'Particle Preset';
            presetLabel.style.cssText = `
                color: #00ffff;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
            `;
            presetContainer.appendChild(presetLabel);

            const presetDropdown = new Dropdown({
                label: '',
                options: [
                    { value: 'off', label: 'Off - No Particles' },
                    { value: 'minimal', label: 'Minimal - Very Few Particles' },
                    { value: 'subtle', label: 'Subtle - Reduced Particles' },
                    { value: 'normal', label: 'Normal - Standard Particles' },
                    { value: 'intense', label: 'Intense - More Particles' },
                    { value: 'extreme', label: 'Extreme - Maximum Particles' },
                ],
                value: window.gameSystems.particlePresets.currentPreset || 'normal',
                onChange: (value) => {
                    const preset = window.gameSystems.particlePresets.getPreset(value);
                    window.gameSystems.particlePresets.setPreset(value);
                    if (window.gameSystems.particleSystem) {
                        window.gameSystems.particleSystem.setPreset(preset);
                    }
                    // Update intensity slider to match preset
                    const intensityMap = {
                        off: 0.0,
                        minimal: 0.25,
                        subtle: 0.5,
                        normal: 1.0,
                        intense: 1.5,
                        extreme: 2.0,
                    };
                    const intensity = intensityMap[value] || 1.0;
                    if (this.sliders.has('particleIntensity')) {
                        this.sliders.get('particleIntensity').setValue(intensity);
                        this.visualEffectSettings.setSetting('particleIntensity', intensity);
                    }
                },
            });
            presetContainer.appendChild(presetDropdown.getElement());
            content.appendChild(presetContainer);
        }

        // Real-time preview checkbox
        const previewContainer = document.createElement('div');
        previewContainer.style.cssText = 'margin: 20px 0; display: flex; align-items: center;';

        const previewCheckbox = document.createElement('input');
        previewCheckbox.type = 'checkbox';
        previewCheckbox.checked = this.realTimePreview;
        previewCheckbox.id = 've-preview-checkbox';
        previewCheckbox.onchange = () => {
            this.realTimePreview = previewCheckbox.checked;
        };

        const previewLabel = document.createElement('label');
        previewLabel.htmlFor = 've-preview-checkbox';
        previewLabel.textContent = 'Real-Time Preview';
        previewLabel.style.cssText = 'color: white; margin-left: 8px;';

        previewContainer.appendChild(previewCheckbox);
        previewContainer.appendChild(previewLabel);
        content.appendChild(previewContainer);

        // Buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';

        const resetButton = new Button({
            label: 'Reset to Default',
            onClick: () => {
                this.visualEffectSettings.reset();
                this.loadSettings();
                this.applySettings();
            },
        });
        buttonContainer.appendChild(resetButton.element);

        const saveButton = new Button({
            label: 'Save',
            onClick: () => {
                this.applySettings();
                this.hide();
            },
        });
        buttonContainer.appendChild(saveButton.element);

        const cancelButton = new Button({
            label: 'Cancel',
            onClick: () => {
                this.loadSettings(); // Reload to discard changes
                this.hide();
            },
        });
        buttonContainer.appendChild(cancelButton.element);

        content.appendChild(buttonContainer);
    }

    /**
     * Create a slider section
     * @private
     */
    createSliderSection(label, key, min, max, step, format) {
        const container = document.createElement('div');
        container.style.cssText = 'margin-bottom: 20px;';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 5px;
            color: ${DESIGN_SYSTEM.colors.text};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        container.appendChild(labelElement);

        const valueDisplay = document.createElement('span');
        valueDisplay.id = `ve-value-${key}`;
        valueDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-left: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        labelElement.appendChild(valueDisplay);

        const slider = new Slider({
            min: min,
            max: max,
            step: step,
            value: this.visualEffectSettings.getSetting(key),
            onChange: (value) => {
                valueDisplay.textContent = format(value);
                this.visualEffectSettings.setSetting(key, value);
                if (this.realTimePreview) {
                    this.applySetting(key, value);
                }
            },
        });
        container.appendChild(slider.element);

        // Initialize value display
        valueDisplay.textContent = format(this.visualEffectSettings.getSetting(key));

        this.sliders.set(key, slider);
        return container;
    }

    /**
     * Apply a single setting
     * @private
     */
    applySetting(key, value) {
        switch (key) {
            case 'uvModeIntensity':
                if (this.visualEffects && this.visualEffects.uvMode) {
                    this.visualEffects.setUVIntensity(value);
                }
                break;
            case 'glitchIntensity':
                if (this.postProcessingManager) {
                    this.postProcessingManager.setGlitchIntensity(value);
                }
                // Update screen effects preset if available
                if (window.gameSystems?.screenEffectsPresets) {
                    const preset = window.gameSystems.screenEffectsPresets.getCurrentPreset();
                    // Map intensity to closest preset
                    let presetName = 'normal';
                    if (value <= 0) {
                        presetName = 'off';
                    } else if (value <= 0.2) {
                        presetName = 'minimal';
                    } else if (value <= 0.4) {
                        presetName = 'subtle';
                    } else if (value <= 0.75) {
                        presetName = 'normal';
                    } else if (value <= 1.25) {
                        presetName = 'intense';
                    } else {
                        presetName = 'extreme';
                    }
                    if (presetName !== window.gameSystems.screenEffectsPresets.currentPreset) {
                        window.gameSystems.screenEffectsPresets.setPreset(presetName);
                    }
                }
                break;
            case 'screenEffectIntensity':
                // Apply to environment effects if available
                if (window.gameSystems?.environmentEffects) {
                    window.gameSystems.environmentEffects.setScreenEffectIntensity(value);
                }
                // Update screen effects preset if available
                if (window.gameSystems?.screenEffectsPresets) {
                    const preset = window.gameSystems.screenEffectsPresets.getCurrentPreset();
                    // Map intensity to closest preset
                    let presetName = 'normal';
                    if (value <= 0) {
                        presetName = 'off';
                    } else if (value <= 0.3) {
                        presetName = 'minimal';
                    } else if (value <= 0.7) {
                        presetName = 'subtle';
                    } else if (value <= 1.25) {
                        presetName = 'normal';
                    } else if (value <= 1.75) {
                        presetName = 'intense';
                    } else {
                        presetName = 'extreme';
                    }
                    if (presetName !== window.gameSystems.screenEffectsPresets.currentPreset) {
                        window.gameSystems.screenEffectsPresets.setPreset(presetName);
                    }
                }
                break;
            case 'visualDistortionIntensity':
                // Apply to camera settings if available
                if (this.cameraSettings) {
                    this.cameraSettings.setSetting('visualDistortionIntensity', value);
                }
                break;
            case 'chromaticAberrationIntensity':
                // Apply to camera settings if available
                if (this.cameraSettings) {
                    this.cameraSettings.setSetting('chromaticAberrationIntensity', value);
                }
                break;
            case 'bloomIntensity':
                if (this.postProcessingManager) {
                    this.postProcessingManager.setBloomIntensity(value);
                }
                break;
            case 'particleIntensity':
                // Apply particle intensity to particle system
                if (this.visualEffects && this.visualEffects.setParticleIntensity) {
                    this.visualEffects.setParticleIntensity(value);
                }
                // Also apply to particle system if available
                if (window.gameSystems?.particleSystem && window.gameSystems?.particlePresets) {
                    // Map intensity value (0-2) to preset
                    let presetName = 'normal';
                    if (value <= 0) {
                        presetName = 'off';
                    } else if (value <= 0.5) {
                        presetName = 'minimal';
                    } else if (value <= 0.75) {
                        presetName = 'subtle';
                    } else if (value <= 1.25) {
                        presetName = 'normal';
                    } else if (value <= 1.75) {
                        presetName = 'intense';
                    } else {
                        presetName = 'extreme';
                    }
                    const preset = window.gameSystems.particlePresets.getPreset(presetName);
                    window.gameSystems.particleSystem.setPreset(preset);
                }
                break;
        }
    }

    /**
     * Apply all settings
     * @private
     */
    applySettings() {
        const settings = this.visualEffectSettings.getSettings();

        // Apply UV intensity
        if (this.visualEffects) {
            const uvEnabled = this.visualEffects.uvMode || false;
            if (uvEnabled) {
                this.visualEffects.setUVIntensity(settings.uvModeIntensity);
            }
        }

        // Apply glitch intensity
        if (this.postProcessingManager) {
            const glitchEnabled = this.postProcessingManager.composer?.glitchEnabled || false;
            if (glitchEnabled) {
                this.postProcessingManager.setGlitchIntensity(settings.glitchIntensity);
            }
        }

        // Apply bloom intensity
        if (this.postProcessingManager) {
            this.postProcessingManager.setBloomIntensity(settings.bloomIntensity);
        }

        // Other settings would be applied similarly
    }

    /**
     * Load settings into UI
     * @private
     */
    loadSettings() {
        const settings = this.visualEffectSettings.getSettings();

        // Update all sliders
        for (const [key, slider] of this.sliders) {
            const value = settings[key] || 0;
            slider.setValue(value);
        }

        // Update preset dropdown
        this.currentPreset = this.visualEffectSettings.getCurrentPreset();
    }
}
