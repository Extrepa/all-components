/**
 * InputField - Reusable input field component
 *
 * Supports validation and formatting
 */
import { DESIGN_SYSTEM } from '../designSystem.js';

export class InputField {
    /**
     * Create a new InputField
     * @param {Object} config - Configuration
     * @param {string} config.label - Input label
     * @param {string} config.type - Input type (default: 'text')
     * @param {string} config.placeholder - Placeholder text
     * @param {string} config.value - Initial value
     * @param {Function} config.onChange - Change handler (value) => void
     * @param {Function} config.validator - Validation function (value) => {valid: boolean, error: string}
     * @param {Function} config.formatter - Format function (value) => string
     */
    constructor(config = {}) {
        this.label = config.label || 'Input';
        this.type = config.type || 'text';
        this.placeholder = config.placeholder || '';
        this.value = config.value || '';
        this.onChange = config.onChange || (() => {});
        this.validator = config.validator || (() => ({ valid: true }));
        this.formatter = config.formatter || ((value) => value);

        // Validation state
        this.valid = true;
        this.errorMessage = '';

        // Create DOM elements
        this.container = document.createElement('div');
        this.container.className = 'ui-input-field';
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

        // Input element
        this.input = document.createElement('input');
        this.input.type = this.type;
        this.input.placeholder = this.placeholder;
        this.input.value = this.value;
        this.input.style.cssText = `
            padding: 8px 12px;
            background: ${DESIGN_SYSTEM.colors.background};
            color: ${DESIGN_SYSTEM.colors.text};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            outline: none;
        `;
        this.container.appendChild(this.input);

        // Error message
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'ui-input-error';
        this.errorElement.style.cssText = `
            color: #ff0000;
            font-size: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            display: none;
        `;
        this.container.appendChild(this.errorElement);

        // Event listeners
        this.input.addEventListener('input', (e) => {
            this.setValue(e.target.value);
        });

        this.input.addEventListener('blur', () => {
            this.validate();
        });
    }

    /**
     * Set input value
     * @param {string} value - New value
     */
    setValue(value) {
        this.value = value;
        this.input.value = value;

        // Format if formatter provided
        if (this.formatter) {
            const formatted = this.formatter(value);
            if (formatted !== value) {
                this.input.value = formatted;
                this.value = formatted;
            }
        }

        // Validate
        this.validate();

        if (this.onChange) {
            this.onChange(this.value);
        }
    }

    /**
     * Get input value
     * @returns {string} Current value
     */
    getValue() {
        return this.value;
    }

    /**
     * Validate input
     * @returns {boolean} True if valid
     */
    validate() {
        const result = this.validator(this.value);
        this.valid = result.valid;
        this.errorMessage = result.error || '';

        // Update visual state
        if (this.valid) {
            this.input.style.borderColor = '#00ffff';
            this.errorElement.style.display = 'none';
        } else {
            this.input.style.borderColor = '#ff0000';
            this.errorElement.textContent = this.errorMessage;
            this.errorElement.style.display = 'block';
        }

        return this.valid;
    }

    /**
     * Check if input is valid
     * @returns {boolean} True if valid
     */
    isValid() {
        return this.valid;
    }

    /**
     * Focus input
     */
    focus() {
        this.input.focus();
    }

    /**
     * Blur input
     */
    blur() {
        this.input.blur();
    }

    /**
     * Enable input
     */
    enable() {
        this.input.disabled = false;
        this.input.style.opacity = '1';
    }

    /**
     * Disable input
     */
    disable() {
        this.input.disabled = true;
        this.input.style.opacity = '0.5';
    }

    /**
     * Get DOM element
     * @returns {HTMLElement} Container element
     */
    getElement() {
        return this.container;
    }

    /**
     * Destroy input field (cleanup)
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
