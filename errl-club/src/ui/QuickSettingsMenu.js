/**
 * QuickSettingsMenu - Quick access menu for common settings
 *
 * Provides fast access to frequently used settings without opening full settings screen
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Slider } from './components/Slider.js';
import { Dropdown } from './components/Dropdown.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class QuickSettingsMenu {
    /**
     * Create a new QuickSettingsMenu
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.systems - Game systems object
     */
    constructor(config = {}) {
        this.onClose = config.onClose || (() => {});
        this.systems = config.systems || {};

        // Menu state
        this.isVisible = false;
        this.panel = null;

        // Create menu panel
        this.createPanel();
    }

    /**
     * Create the menu panel
     * @private
     */
    createPanel() {
        this.panel = new BasePanel({
            id: 'quick_settings_menu',
            title: 'Quick Settings',
            position: { x: window.innerWidth - 350, y: 100 },
            size: { width: 320, height: 500 },
        });

        const content = this.panel.getContentElement();
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-height: 450px;
            overflow-y: auto;
            padding-right: 8px;
        `;

        // Camera Intensity
        this.createCameraIntensitySection(content);

        // Visual Effects
        this.createVisualEffectsSection(content);

        // Audio
        this.createAudioSection(content);

        // Graphics
        this.createGraphicsSection(content);

        // Close button
        const closeButton = new Button({
            text: 'Close',
            onClick: () => {
                this.hide();
            },
        });
        content.appendChild(closeButton.getElement());
    }

    /**
     * Create camera intensity section
     * @private
     */
    createCameraIntensitySection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 12px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Camera Intensity';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Quick toggle buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 4px; margin-bottom: 8px;';

        const presets = ['low', 'medium', 'high'];
        presets.forEach((preset) => {
            const button = new Button({
                text: preset.charAt(0).toUpperCase() + preset.slice(1),
                onClick: () => {
                    if (this.systems.cameraSettings) {
                        this.systems.cameraSettings.applyPreset(preset);
                        if (this.systems.cameraController) {
                            this.systems.cameraController.updateSettings();
                        }
                        if (this.systems.settingsManager) {
                            const settingsJson = this.systems.cameraSettings.export();
                            this.systems.settingsManager.setSetting(
                                'camera',
                                JSON.parse(settingsJson)
                            );
                        }
                        if (this.systems.cameraIntensityIndicator) {
                            this.systems.cameraIntensityIndicator.update();
                        }
                        this.updateCameraButtons();
                    }
                },
            });
            button.getElement().style.cssText = 'flex: 1; font-size: 12px; padding: 6px;';
            buttonContainer.appendChild(button.getElement());
        });

        section.appendChild(buttonContainer);

        // Current preset display
        const currentDisplay = document.createElement('div');
        currentDisplay.id = 'quick_camera_preset_display';
        currentDisplay.style.cssText = 'color: #aaa; font-size: 12px; text-align: center;';
        currentDisplay.textContent = 'Current: Medium';
        section.appendChild(currentDisplay);

        container.appendChild(section);
        this.cameraButtons = buttonContainer;
        this.cameraPresetDisplay = currentDisplay;
    }

    /**
     * Create visual effects section
     * @private
     */
    createVisualEffectsSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 12px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Visual Effects';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // UV Mode toggle
        const uvToggle = this.createToggle(section, 'UV/Blacklight Mode', () => {
            if (this.systems.visualEffects) {
                const current = this.systems.visualEffects.uvMode || false;
                this.systems.visualEffects.setUVMode(!current);
                if (this.systems.visualPreferences) {
                    this.systems.visualPreferences.setUVMode(!current);
                }
            }
        });

        // Glitch Mode toggle
        const glitchToggle = this.createToggle(section, 'Glitch Mode', () => {
            if (this.systems.postProcessingManager) {
                // Check if glitch is enabled (check composer.glitchEnabled or glitchPass.enabled)
                const current =
                    this.systems.postProcessingManager.composer?.glitchEnabled ||
                    this.systems.postProcessingManager.glitchPass?.enabled ||
                    false;
                this.systems.postProcessingManager.setGlitchEnabled(!current);
                if (this.systems.visualPreferences) {
                    this.systems.visualPreferences.setGlitchMode(!current);
                }
            }
        });

        // Visualizer style quick selector
        if (this.systems.visualizerStylePicker) {
            // Get current style
            const currentStyle = this.systems.visualizerStylePicker.currentStyle || 'default';
            const styleDropdown = new Dropdown({
                label: 'Visualizer Style',
                options: [
                    { value: 'default', label: 'Default' },
                    { value: 'neon', label: 'Neon' },
                    { value: 'retro', label: 'Retro' },
                    { value: 'cyberpunk', label: 'Cyberpunk' },
                    { value: 'minimal', label: 'Minimal' },
                    { value: 'intense', label: 'Intense' },
                ],
                value: currentStyle,
                onChange: (value) => {
                    if (this.systems.visualizerStylePicker) {
                        this.systems.visualizerStylePicker.setStyle(value);
                    }
                },
            });
            section.appendChild(styleDropdown.getElement());
        }

        container.appendChild(section);
    }

    /**
     * Create audio section
     * @private
     */
    createAudioSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 12px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Audio';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Master volume slider
        // Get current volume from AudioSettings or SettingsManager
        let currentVolume = 50;
        if (this.systems.audioSettings) {
            currentVolume = this.systems.audioSettings.getMasterVolume();
        } else if (this.systems.settingsManager) {
            currentVolume = this.systems.settingsManager.getSetting('audio.masterVolume', 50);
        }

        const masterVolume = new Slider({
            label: 'Master Volume',
            min: 0,
            max: 100,
            value: currentVolume,
            onChange: (value) => {
                // Set volume via AudioSettings if available
                if (this.systems.audioSettings) {
                    this.systems.audioSettings.setMasterVolume(value);
                } else if (this.systems.settingsManager) {
                    this.systems.settingsManager.setSetting('audio.masterVolume', value);
                }
                // Apply to audio system if available
                if (this.systems.audioSystem && this.systems.audioSystem.audioContext) {
                    // Try to set volume via gain node if available
                    if (this.systems.audioSystem.audioContext.gainNode) {
                        this.systems.audioSystem.audioContext.gainNode.gain.value = value / 100;
                    }
                }
            },
        });
        section.appendChild(masterVolume.getElement());

        container.appendChild(section);
    }

    /**
     * Create graphics section
     * @private
     */
    createGraphicsSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 12px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Graphics';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Quality preset dropdown
        const qualityDropdown = new Dropdown({
            label: 'Quality Preset',
            options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'ultra', label: 'Ultra' },
            ],
            value: 'high',
            onChange: (value) => {
                if (this.systems.settingsManager) {
                    this.systems.settingsManager.setSetting('graphics.quality', value);
                }
                // Apply graphics quality (if GraphicsSettings exists)
                if (this.systems.graphicsSettings) {
                    this.systems.graphicsSettings.setQualityPreset(value);

                    // Apply preset to post-processing manager if available
                    if (
                        this.systems.postProcessingManager &&
                        window.gameSystems?.postProcessingPresets
                    ) {
                        const postPreset =
                            window.gameSystems.postProcessingPresets.getCurrentPreset();

                        // Enable/disable post-processing
                        this.systems.postProcessingManager.setPostProcessingEnabled(
                            postPreset.enabled
                        );

                        // Apply bloom settings
                        if (postPreset.enabled && this.systems.postProcessingManager.bloomPass) {
                            this.systems.postProcessingManager.setBloomIntensity(
                                postPreset.bloomIntensity
                            );
                            if (
                                this.systems.postProcessingManager.bloomPass.threshold !== undefined
                            ) {
                                this.systems.postProcessingManager.bloomPass.threshold =
                                    postPreset.bloomThreshold;
                            }
                            if (this.systems.postProcessingManager.bloomPass.radius !== undefined) {
                                this.systems.postProcessingManager.bloomPass.radius =
                                    postPreset.bloomRadius;
                            }
                        }

                        // Apply glitch settings
                        this.systems.postProcessingManager.setGlitchEnabled(
                            postPreset.enabled && postPreset.glitchIntensity > 0,
                            postPreset.glitchIntensity
                        );

                        // Apply chromatic aberration
                        this.systems.postProcessingManager.setChromaticAberration(
                            postPreset.chromaticAberrationIntensity * 0.1,
                            0.0
                        );

                        // Apply motion blur
                        if (this.systems.postProcessingManager.setMotionBlurEnabled) {
                            this.systems.postProcessingManager.setMotionBlurEnabled(
                                postPreset.motionBlurEnabled,
                                postPreset.motionBlurIntensity
                            );
                        }
                    }
                }
            },
        });
        section.appendChild(qualityDropdown.getElement());

        container.appendChild(section);
    }

    /**
     * Create a toggle button
     * @private
     */
    createToggle(container, label, onClick) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText =
            'display: flex; align-items: center; gap: 12px; margin: 8px 0;';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 12px;
            cursor: pointer;
            flex: 1;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        const button = new Button({
            text: 'Toggle',
            onClick: onClick,
        });
        button.getElement().style.cssText = 'font-size: 11px; padding: 4px 8px;';

        toggleContainer.appendChild(labelElement);
        toggleContainer.appendChild(button.getElement());
        container.appendChild(toggleContainer);

        return { labelElement, button };
    }

    /**
     * Update camera preset buttons to show current selection
     * @private
     */
    updateCameraButtons() {
        if (!this.systems.cameraSettings || !this.cameraPresetDisplay) {
            return;
        }

        const currentPreset = this.systems.cameraSettings.getCurrentPreset();
        const presetLabels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            custom: 'Custom',
        };
        this.cameraPresetDisplay.textContent = `Current: ${presetLabels[currentPreset] || currentPreset}`;

        // Update button styles to show active preset
        if (this.cameraButtons) {
            const buttons = this.cameraButtons.querySelectorAll('button');
            buttons.forEach((btn, index) => {
                const presets = ['low', 'medium', 'high'];
                if (presets[index] === currentPreset) {
                    btn.style.background = 'rgba(0, 255, 255, 0.3)';
                    btn.style.borderColor = '#00ffff';
                } else {
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }
            });
        }
    }

    /**
     * Show the quick settings menu
     */
    show() {
        if (this.panel) {
            this.panel.show();
            this.isVisible = true;
            this.updateCameraButtons();
        }
    }

    /**
     * Hide the quick settings menu
     */
    hide() {
        if (this.panel) {
            this.panel.hide();
            this.isVisible = false;
        }
        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Toggle visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Check if visible
     * @returns {boolean}
     */
    getVisible() {
        return this.isVisible;
    }

    /**
     * Destroy the menu
     */
    destroy() {
        if (this.panel) {
            this.panel.destroy();
        }
    }
}
