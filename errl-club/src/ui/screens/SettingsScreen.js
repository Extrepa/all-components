/**
 * SettingsScreen - Settings display and editing
 */
import { BasePanel } from '../BasePanel.js';
import { Button } from '../components/Button.js';
import { Slider } from '../components/Slider.js';
import { Dropdown } from '../components/Dropdown.js';
import { DESIGN_SYSTEM } from '../designSystem.js';

export class SettingsScreen extends BasePanel {
    /**
     * Create a new SettingsScreen
     * @param {Object} config - Configuration
     * @param {Function} config.onBack - Back handler
     * @param {Object} config.settingsManager - SettingsManager instance
     * @param {Object} config.uiScalingSystem - UIScalingSystem instance
     */
    constructor(config = {}) {
        super({
            id: 'settings_screen',
            title: 'Settings',
            position: { x: 100, y: 100 },
            size: { width: 600, height: 600 },
        });

        this.onBack = config.onBack || (() => {});
        this.settingsManager = config.settingsManager;
        this.uiScalingSystem = config.uiScalingSystem;

        // Create settings content
        this.createSettingsContent();
    }

    /**
     * Create settings content
     * @private
     */
    createSettingsContent() {
        const content = this.getContentElement();

        // Graphics settings
        const graphicsSection = document.createElement('div');
        graphicsSection.style.cssText = 'margin-bottom: 20px;';
        const graphicsHeader = document.createElement('h3');
        graphicsHeader.textContent = 'Graphics';
        graphicsHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        graphicsSection.appendChild(graphicsHeader);

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
                if (this.settingsManager) {
                    this.settingsManager.setSetting('graphics.quality', value);
                }
            },
        });
        graphicsSection.appendChild(qualityDropdown.getElement());

        content.appendChild(graphicsSection);

        // Performance section
        const performanceSection = document.createElement('div');
        performanceSection.style.cssText = 'margin-bottom: 20px;';
        const performanceHeader = document.createElement('h3');
        performanceHeader.textContent = 'Performance';
        performanceHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        performanceSection.appendChild(performanceHeader);

        // Performance preset selector
        const perfPresetDropdown = new Dropdown({
            label: 'Performance Preset',
            options: [
                { value: 'low', label: 'Low (30 FPS target)' },
                { value: 'medium', label: 'Medium (45 FPS target)' },
                { value: 'high', label: 'High (60 FPS target)' },
                { value: 'ultra', label: 'Ultra (120 FPS target)' },
            ],
            value: 'high',
            onChange: (value) => {
                // Apply preset via DevTools if available
                if (typeof window !== 'undefined' && window.gameSystems?.devTools) {
                    window.gameSystems.devTools.applyPerformancePreset(value);
                }
            },
        });
        performanceSection.appendChild(perfPresetDropdown.getElement());

        // Auto-adjust checkbox
        const autoAdjustContainer = document.createElement('div');
        autoAdjustContainer.style.cssText =
            'margin-top: 10px; display: flex; align-items: center; gap: 8px;';

        const autoAdjustCheckbox = document.createElement('input');
        autoAdjustCheckbox.type = 'checkbox';
        autoAdjustCheckbox.id = 'settings-auto-adjust';
        autoAdjustCheckbox.checked = false;
        autoAdjustCheckbox.addEventListener('change', (e) => {
            if (typeof window !== 'undefined' && window.gameSystems?.devTools) {
                window.gameSystems.devTools.autoAdjustEnabled = e.target.checked;
            }
        });
        autoAdjustContainer.appendChild(autoAdjustCheckbox);

        const autoAdjustLabel = document.createElement('label');
        autoAdjustLabel.htmlFor = 'settings-auto-adjust';
        autoAdjustLabel.textContent = 'Auto-adjust quality based on FPS';
        autoAdjustLabel.style.cssText = 'color: #ffffff; font-size: 12px; cursor: pointer;';
        autoAdjustContainer.appendChild(autoAdjustLabel);
        performanceSection.appendChild(autoAdjustContainer);

        // Performance note
        const perfNote = document.createElement('div');
        perfNote.style.cssText =
            'color: #888; font-size: 11px; margin-top: 8px; font-style: italic;';
        perfNote.textContent = 'Press F1 to view detailed performance metrics and recommendations.';
        performanceSection.appendChild(perfNote);

        content.appendChild(performanceSection);

        // Audio settings
        const audioSection = document.createElement('div');
        audioSection.style.cssText = 'margin-bottom: 20px;';
        audioSection.innerHTML = '<h3 style="color: #00ffff; margin-bottom: 10px;">Audio</h3>';

        // Master volume slider
        const volumeSlider = new Slider({
            label: 'Master Volume',
            min: 0,
            max: 100,
            value: 50,
            onChange: (value) => {
                if (this.settingsManager) {
                    this.settingsManager.setSetting('audio.masterVolume', value);
                }
            },
        });
        audioSection.appendChild(volumeSlider.getElement());

        content.appendChild(audioSection);

        // UI Scaling section
        if (this.uiScalingSystem) {
            const uiScalingSection = document.createElement('div');
            uiScalingSection.style.cssText = 'margin-top: 20px; margin-bottom: 20px;';
            uiScalingSection.innerHTML =
                '<h3 style="color: #00ffff; margin-bottom: 10px;">UI Scaling</h3>';

            // Scale factor slider
            const scaleValueDisplay = document.createElement('div');
            scaleValueDisplay.style.cssText = 'color: #88ccff; margin-bottom: 5px;';
            scaleValueDisplay.textContent = `Scale: ${(this.uiScalingSystem.getScale() * 100).toFixed(0)}%`;

            const scaleSlider = new Slider({
                label: 'UI Scale',
                min: 0.5,
                max: 2.0,
                step: 0.05,
                value: this.uiScalingSystem.getScale(),
                onChange: (value) => {
                    this.uiScalingSystem.setScale(value);
                    scaleValueDisplay.textContent = `Scale: ${(value * 100).toFixed(0)}%`;
                },
            });

            uiScalingSection.appendChild(scaleValueDisplay);
            uiScalingSection.appendChild(scaleSlider.getElement());

            // Preset buttons
            const presetContainer = document.createElement('div');
            presetContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 10px;';

            const presets = this.uiScalingSystem.getPresets();
            for (const [name, scale] of Object.entries(presets)) {
                const presetButton = new Button({
                    text:
                        name.charAt(0).toUpperCase() +
                        name.slice(1) +
                        ` (${(scale * 100).toFixed(0)}%)`,
                    onClick: () => {
                        this.uiScalingSystem.applyPreset(name);
                        scaleSlider.setValue(scale);
                        scaleValueDisplay.textContent = `Scale: ${(scale * 100).toFixed(0)}%`;
                    },
                });
                presetButton.getElement().style.cssText = 'flex: 1; padding: 6px; font-size: 11px;';
                presetContainer.appendChild(presetButton.getElement());
            }

            uiScalingSection.appendChild(presetContainer);

            // Accessibility note
            const accessibilityNote = document.createElement('div');
            accessibilityNote.style.cssText =
                'color: #888; font-size: 11px; margin-top: 8px; font-style: italic;';
            accessibilityNote.textContent =
                'Adjust UI scale for better readability. Changes apply immediately.';
            uiScalingSection.appendChild(accessibilityNote);

            content.appendChild(uiScalingSection);
        }

        // Back button
        const backButton = new Button({
            text: 'Back',
            onClick: () => {
                this.onBack();
            },
        });
        content.appendChild(backButton.getElement());
    }
}
