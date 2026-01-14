/**
 * Slider - Reusable slider component
 *
 * Supports value range, step, and formatting
 */
import { DESIGN_SYSTEM } from '../designSystem.js';

export class Slider {
    /**
     * Create a new Slider
     * @param {Object} config - Configuration
     * @param {string} config.label - Slider label
     * @param {number} config.min - Minimum value (default: 0)
     * @param {number} config.max - Maximum value (default: 100)
     * @param {number} config.value - Initial value (default: min)
     * @param {number} config.step - Step value (default: 1)
     * @param {Function} config.onChange - Change handler (value) => void
     * @param {Function} config.format - Value formatter (value) => string (default: value.toString())
     */
    constructor(config = {}) {
        this.label = config.label || 'Slider';
        this.min = config.min || 0;
        this.max = config.max || 100;
        this.value = config.value !== undefined ? config.value : this.min;
        this.step = config.step || 1;
        this.onChange = config.onChange || (() => {});
        this.format = config.format || ((value) => value.toString());

        // Clamp initial value
        this.value = Math.max(this.min, Math.min(this.max, this.value));

        // Create DOM elements
        this.container = document.createElement('div');
        this.container.className = 'ui-slider';
        this.container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 8px 0;
        `;

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.textContent = this.label;
        this.labelElement.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.container.appendChild(this.labelElement);

        // Slider container
        this.sliderContainer = document.createElement('div');
        this.sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${DESIGN_SYSTEM.spacing.gap};
        `;

        // Input range
        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.min = this.min;
        this.input.max = this.max;
        this.input.step = this.step;
        this.input.value = this.value;
        this.input.style.cssText = `
            flex: 1;
            height: 6px;
            background: rgba(51, 51, 51, 0.8);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        `;

        // Style the slider track and thumb
        this.input.style.setProperty('--track-color', 'rgba(51, 51, 51, 0.8)');
        this.input.style.setProperty('--thumb-color', DESIGN_SYSTEM.colors.border);

        // Value display
        this.valueElement = document.createElement('span');
        this.valueElement.className = 'ui-slider-value';
        this.valueElement.textContent = this.format(this.value);
        this.valueElement.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            min-width: 50px;
            text-align: right;
        `;

        this.sliderContainer.appendChild(this.input);
        this.sliderContainer.appendChild(this.valueElement);
        this.container.appendChild(this.sliderContainer);

        // Event listener
        this.input.addEventListener('input', (e) => {
            this.setValue(parseFloat(e.target.value));
        });
    }

    /**
     * Set slider value
     * @param {number} value - New value
     */
    setValue(value) {
        const clamped = Math.max(this.min, Math.min(this.max, value));
        const stepped = Math.round(clamped / this.step) * this.step;

        if (this.value !== stepped) {
            this.value = stepped;
            this.input.value = stepped;
            this.valueElement.textContent = this.format(stepped);

            if (this.onChange) {
                this.onChange(stepped);
            }
        }
    }

    /**
     * Get current value
     * @returns {number} Current value
     */
    getValue() {
        return this.value;
    }

    /**
     * Get DOM element
     * @returns {HTMLElement} Container element
     */
    getElement() {
        return this.container;
    }

    /**
     * Destroy slider (cleanup)
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
