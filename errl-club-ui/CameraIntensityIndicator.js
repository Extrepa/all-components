/**
 * CameraIntensityIndicator - On-screen camera intensity display
 *
 * Shows current camera intensity preset in a corner of the screen
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class CameraIntensityIndicator {
    constructor(container = null) {
        this.container = container || document.body;
        this.cameraSettings = null;
        this.isVisible = false;

        // Create indicator element
        this.element = document.createElement('div');
        this.element.id = 'camera-intensity-indicator';
        this.element.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            font-size: 12px;
            color: ${DESIGN_SYSTEM.colors.accent};
            pointer-events: auto;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // Add hover effect
        this.element.addEventListener('mouseenter', () => {
            this.element.style.background = DESIGN_SYSTEM.colors.background;
            this.element.style.borderColor = DESIGN_SYSTEM.colors.accent;
            this.element.style.opacity = '0.95';
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.background = DESIGN_SYSTEM.colors.background;
            this.element.style.opacity = '1';
        });

        // Create label
        const label = document.createElement('span');
        label.textContent = 'Camera Intensity:';
        label.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.7;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        // Create value
        const value = document.createElement('span');
        value.id = 'camera-intensity-value';
        value.style.cssText = `
            font-weight: bold;
            color: ${DESIGN_SYSTEM.colors.accent};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        value.textContent = 'Medium';

        this.element.appendChild(label);
        this.element.appendChild(value);
        this.container.appendChild(this.element);

        // Click handler to open camera settings (will be set by external code)
        this.onClick = null;
        this.element.addEventListener('click', () => {
            if (this.onClick) {
                this.onClick();
            }
        });
    }

    /**
     * Set click handler to open camera settings
     * @param {Function} handler - Click handler function
     */
    setClickHandler(handler) {
        this.onClick = handler;
    }

    /**
     * Set camera settings instance
     * @param {CameraSettings} cameraSettings - CameraSettings instance
     */
    setCameraSettings(cameraSettings) {
        this.cameraSettings = cameraSettings;
        this.update();
    }

    /**
     * Update the indicator display
     */
    update() {
        if (!this.cameraSettings) {
            return;
        }

        const preset = this.cameraSettings.getCurrentPreset();
        const valueElement = this.element.querySelector('#camera-intensity-value');

        if (valueElement) {
            const presetLabels = {
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                custom: 'Custom',
            };
            valueElement.textContent = presetLabels[preset] || preset;
        }
    }

    /**
     * Show the indicator
     */
    show() {
        this.isVisible = true;
        this.element.style.opacity = '1';
    }

    /**
     * Hide the indicator
     */
    hide() {
        this.isVisible = false;
        this.element.style.opacity = '0';
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
     * Destroy the indicator
     */
    destroy() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
