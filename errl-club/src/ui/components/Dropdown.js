/**
 * Dropdown - Reusable dropdown component
 *
 * Supports options, selection, and search
 */
import { DESIGN_SYSTEM } from '../designSystem.js';

export class Dropdown {
    /**
     * Create a new Dropdown
     * @param {Object} config - Configuration
     * @param {string} config.label - Dropdown label
     * @param {Array} config.options - Options array [{value, label}, ...]
     * @param {*} config.value - Initial selected value
     * @param {Function} config.onChange - Change handler (value) => void
     * @param {boolean} config.searchable - Enable search (default: false)
     */
    constructor(config = {}) {
        this.label = config.label || 'Dropdown';
        this.options = config.options || [];
        this.value = config.value;
        this.onChange = config.onChange || (() => {});
        this.searchable = config.searchable || false;

        // Find initial selected option
        if (this.value === undefined && this.options.length > 0) {
            this.value = this.options[0].value;
        }

        // Create DOM elements
        this.container = document.createElement('div');
        this.container.className = 'ui-dropdown';
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

        // Select element
        this.select = document.createElement('select');
        this.select.style.cssText = `
            padding: 8px 12px;
            background: rgba(51, 51, 51, 0.8);
            color: ${DESIGN_SYSTEM.colors.text};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            cursor: pointer;
            outline: none;
        `;

        // Add options - ensure options is an array
        if (!Array.isArray(this.options)) {
            console.warn('Dropdown: options must be an array, got:', typeof this.options);
            this.options = [];
        }
        this.options.forEach((option) => {
            // Validate option object
            if (!option || typeof option !== 'object') {
                console.warn('Dropdown: Invalid option:', option);
                return;
            }
            const optionElement = document.createElement('option');
            optionElement.value = option.value !== undefined ? String(option.value) : '';
            optionElement.textContent = option.label || option.value || '';
            if (option.value === this.value) {
                optionElement.selected = true;
            }
            this.select.appendChild(optionElement);
        });

        this.container.appendChild(this.select);

        // Event listener
        this.select.addEventListener('change', (e) => {
            this.setValue(e.target.value);
        });
    }

    /**
     * Set selected value
     * @param {*} value - Value to select
     */
    setValue(value) {
        if (this.value !== value) {
            this.value = value;
            this.select.value = value;

            if (this.onChange) {
                this.onChange(value);
            }
        }
    }

    /**
     * Get selected value
     * @returns {*} Selected value
     */
    getValue() {
        return this.value;
    }

    /**
     * Get selected option label
     * @returns {string} Selected option label
     */
    getSelectedLabel() {
        const option = this.options.find((opt) => opt.value === this.value);
        return option ? option.label || option.value : '';
    }

    /**
     * Add option
     * @param {*} value - Option value
     * @param {string} label - Option label
     */
    addOption(value, label) {
        this.options.push({ value, label });

        const optionElement = document.createElement('option');
        optionElement.value = value;
        optionElement.textContent = label || value;
        this.select.appendChild(optionElement);
    }

    /**
     * Remove option
     * @param {*} value - Option value to remove
     */
    removeOption(value) {
        this.options = this.options.filter((opt) => opt.value !== value);

        const optionElement = this.select.querySelector(`option[value="${value}"]`);
        if (optionElement) {
            optionElement.remove();
        }
    }

    /**
     * Get DOM element
     * @returns {HTMLElement} Container element
     */
    getElement() {
        return this.container;
    }

    /**
     * Destroy dropdown (cleanup)
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
