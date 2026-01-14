/**
 * CameraSettingsUI - Comprehensive camera intensity and behavior settings UI
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Slider } from './components/Slider.js';
import { Dropdown } from './components/Dropdown.js';
import { CAMERA_SETTINGS_CONFIG } from '../config/CameraSettingsConfig.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class CameraSettingsUI extends BasePanel {
    /**
     * Create a new CameraSettingsUI
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.cameraSettings - CameraSettings instance
     * @param {Object} config.cameraController - CameraController instance
     * @param {Object} config.settingsManager - SettingsManager instance (optional)
     */
    constructor(config = {}) {
        super({
            id: 'camera_settings_ui',
            title: 'Camera Intensity Settings',
            position: { x: 100, y: 100 },
            size: { width: 700, height: 600 },
        });

        this.onClose = config.onClose || (() => {});
        this.onSettingsChange = config.onSettingsChange || (() => {});
        this.cameraSettings = config.cameraSettings;
        this.cameraController = config.cameraController;
        this.settingsManager = config.settingsManager;

        // UI state
        this.sliders = new Map();
        this.currentPreset = 'medium';
        this.isCustom = false;
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
        const content = this.getContentElement();
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-height: 550px;
            overflow-y: auto;
            padding-right: 8px;
        `;

        // Preset selector
        this.createPresetSelector(content);

        // Collapsible sections
        this.createBasicMovementSection(content);
        this.createAdvancedMovementSection(content);
        this.createCameraEffectsSection(content);
        this.createModeSpecificSection(content);
        this.createPostProcessingSection(content);

        // Action buttons
        this.createActionButtons(content);
    }

    /**
     * Create preset selector
     * @private
     */
    createPresetSelector(container) {
        const presetSection = document.createElement('div');
        presetSection.style.cssText = 'margin-bottom: 16px;';

        const presetLabel = document.createElement('div');
        presetLabel.textContent = 'Intensity Preset';
        presetLabel.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        presetSection.appendChild(presetLabel);

        const presetDropdown = new Dropdown({
            label: '',
            options: [
                { value: 'low', label: 'Low - Minimal Movement' },
                { value: 'medium', label: 'Medium - Balanced' },
                { value: 'high', label: 'High - Full Intensity' },
                { value: 'custom', label: 'Custom' },
            ],
            value: this.currentPreset,
            onChange: (value) => {
                if (value !== 'custom') {
                    this.applyPreset(value);
                } else {
                    this.isCustom = true;
                }
            },
        });

        presetSection.appendChild(presetDropdown.getElement());
        container.appendChild(presetSection);

        this.presetDropdown = presetDropdown;
    }

    /**
     * Create basic movement controls section
     * @private
     */
    createBasicMovementSection(container) {
        const section = this.createCollapsibleSection(container, 'Basic Movement Controls');

        CAMERA_SETTINGS_CONFIG.basicMovement.forEach((setting) => {
            const slider = this.createSlider(section.content, setting);
            this.sliders.set(setting.key, slider);
        });
    }

    /**
     * Create advanced movement controls section
     * @private
     */
    createAdvancedMovementSection(container) {
        const section = this.createCollapsibleSection(container, 'Advanced Movement Controls');

        CAMERA_SETTINGS_CONFIG.advancedMovement.forEach((setting) => {
            const slider = this.createSlider(section.content, setting);
            this.sliders.set(setting.key, slider);
        });

        // Toggles for this section
        CAMERA_SETTINGS_CONFIG.toggles.advancedMovement.forEach((toggle) => {
            const toggleControl = this.createToggle(section.content, toggle.label, toggle.key);
            this.sliders.set(toggle.key, toggleControl);
        });
    }

    /**
     * Create camera effects controls section
     * @private
     */
    createCameraEffectsSection(container) {
        const section = this.createCollapsibleSection(container, 'Camera Effects Controls');

        CAMERA_SETTINGS_CONFIG.cameraEffects.forEach((setting) => {
            const slider = this.createSlider(section.content, setting);
            this.sliders.set(setting.key, slider);
        });

        // Toggles for this section
        CAMERA_SETTINGS_CONFIG.toggles.cameraEffects.forEach((toggle) => {
            const toggleControl = this.createToggle(section.content, toggle.label, toggle.key);
            this.sliders.set(toggle.key, toggleControl);
        });
    }

    /**
     * Create mode-specific controls section
     * @private
     */
    createModeSpecificSection(container) {
        const section = this.createCollapsibleSection(container, 'Mode-Specific Controls');

        CAMERA_SETTINGS_CONFIG.modeSpecific.forEach((setting) => {
            const slider = this.createSlider(section.content, setting);
            this.sliders.set(setting.key, slider);
        });
    }

    /**
     * Create post-processing camera effects section
     * @private
     */
    createPostProcessingSection(container) {
        const section = this.createCollapsibleSection(container, 'Post-Processing Camera Effects');

        CAMERA_SETTINGS_CONFIG.postProcessing.forEach((setting) => {
            const slider = this.createSlider(section.content, setting);
            this.sliders.set(setting.key, slider);
        });

        // Toggles for this section
        CAMERA_SETTINGS_CONFIG.toggles.postProcessing.forEach((toggle) => {
            const toggleControl = this.createToggle(section.content, toggle.label, toggle.key);
            this.sliders.set(toggle.key, toggleControl);
        });
    }

    /**
     * Create a collapsible section
     * @private
     */
    createCollapsibleSection(container, title) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 12px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;

        const header = document.createElement('div');
        header.textContent = title;
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
            padding: 4px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        const content = document.createElement('div');
        content.style.cssText = 'margin-top: 8px; display: block;';

        let isExpanded = true;
        header.addEventListener('click', () => {
            isExpanded = !isExpanded;
            content.style.display = isExpanded ? 'block' : 'none';
            header.textContent = isExpanded ? title : title + ' ▼';
        });
        header.textContent = title + ' ▼';

        section.appendChild(header);
        section.appendChild(content);
        container.appendChild(section);

        return { section, header, content };
    }

    /**
     * Create a slider control
     * @private
     */
    createSlider(container, config) {
        const currentValue = this.cameraSettings.getSetting(config.key, config.min);

        const slider = new Slider({
            label: config.label,
            min: config.min,
            max: config.max,
            value: currentValue,
            step: config.step,
            format: config.format,
            onChange: (value) => {
                this.cameraSettings.setSetting(config.key, value);
                this.isCustom = true;
                this.presetDropdown.setValue('custom');

                if (this.realTimePreview && this.cameraController) {
                    this.cameraController.updateSettings();
                }

                // Notify of settings change
                this.onSettingsChange();
            },
        });

        container.appendChild(slider.getElement());
        return slider;
    }

    /**
     * Create a toggle control
     * @private
     */
    createToggle(container, label, key) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText =
            'display: flex; align-items: center; gap: 12px; margin: 8px 0;';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = 'color: #ffffff; font-size: 14px; cursor: pointer;';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.cameraSettings.getSetting(key, false);
        checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';

        checkbox.addEventListener('change', () => {
            this.cameraSettings.setSetting(key, checkbox.checked);
            this.isCustom = true;
            this.presetDropdown.setValue('custom');

            if (this.realTimePreview && this.cameraController) {
                this.cameraController.updateSettings();
            }

            // Notify of settings change
            this.onSettingsChange();
        });

        labelElement.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });

        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(labelElement);
        container.appendChild(toggleContainer);

        return {
            checkbox,
            labelElement,
            setValue: (value) => {
                checkbox.checked = value;
            },
            getValue: () => checkbox.checked,
        };
    }

    /**
     * Create action buttons
     * @private
     */
    createActionButtons(container) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText =
            'display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #00ffff;';

        // Real-time preview toggle
        const previewToggle = this.createToggle(buttonContainer, 'Real-Time Preview', 'preview');
        previewToggle.checkbox.checked = this.realTimePreview;
        previewToggle.checkbox.addEventListener('change', () => {
            this.realTimePreview = previewToggle.checkbox.checked;
        });

        // Reset button
        const resetButton = new Button({
            text: 'Reset to Defaults',
            onClick: () => {
                this.cameraSettings.reset();
                this.loadSettings();
                if (this.cameraController) {
                    this.cameraController.updateSettings();
                }
                this.presetDropdown.setValue('medium');
            },
        });
        buttonContainer.appendChild(resetButton.getElement());

        // Save button
        const saveButton = new Button({
            text: 'Save',
            onClick: () => {
                this.saveSettings();
                this.onClose();
            },
        });
        buttonContainer.appendChild(saveButton.getElement());

        // Cancel button
        const cancelButton = new Button({
            text: 'Cancel',
            onClick: () => {
                this.loadSettings(); // Reload to discard changes
                this.onClose();
            },
        });
        buttonContainer.appendChild(cancelButton.getElement());

        container.appendChild(buttonContainer);
    }

    /**
     * Apply a preset
     * @private
     */
    applyPreset(presetName) {
        if (this.cameraSettings.applyPreset(presetName)) {
            this.currentPreset = presetName;
            this.isCustom = false;
            this.loadSettings();

            if (this.realTimePreview && this.cameraController) {
                this.cameraController.updateSettings();
            }

            // Notify of settings change
            this.onSettingsChange();
        }
    }

    /**
     * Load settings into UI
     * @private
     */
    loadSettings() {
        const settings = this.cameraSettings.getSettings();

        this.sliders.forEach((slider, key) => {
            if (
                key === 'microJitterEnabled' ||
                key === 'bassReactiveShakeEnabled' ||
                key === 'motionBlurEnabled'
            ) {
                // Toggle controls
                if (slider.setValue) {
                    slider.setValue(settings[key] || false);
                }
            } else {
                // Slider controls
                if (slider.setValue) {
                    slider.setValue(settings[key] || 0);
                }
            }
        });

        // Update preset dropdown
        const currentPreset = this.cameraSettings.getCurrentPreset();
        this.presetDropdown.setValue(currentPreset);
    }

    /**
     * Save settings to persistence
     * @private
     */
    saveSettings() {
        if (this.settingsManager && this.cameraSettings) {
            const settingsJson = this.cameraSettings.export();
            const settingsData = JSON.parse(settingsJson);
            this.settingsManager.setSetting('camera', settingsData);
        }

        // Also update camera controller
        if (this.cameraController) {
            this.cameraController.updateSettings();
        }

        // Notify of settings change
        this.onSettingsChange();
    }

    /**
     * Show the camera settings UI
     */
    show() {
        super.show();
        this.loadSettings();
    }

    /**
     * Get content element
     * @returns {HTMLElement} Content element
     */
    getContentElement() {
        return this.contentElement;
    }
}
