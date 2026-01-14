/**
 * Button - Reusable button component
 *
 * Supports states (normal, hover, pressed, disabled) and events
 */
import { DESIGN_SYSTEM } from '../designSystem.js';

export class Button {
    /**
     * Create a new Button
     * @param {Object} config - Configuration
     * @param {string} config.text - Button text
     * @param {Function} config.onClick - Click handler
     * @param {Object} config.style - Custom styles
     */
    constructor(config = {}) {
        this.text = config.text || 'Button';
        this.onClick = config.onClick || (() => {});
        this.style = config.style || {};

        // Button state
        this.state = 'normal'; // normal, hover, pressed, disabled
        this.enabled = config.enabled !== false;

        // Create DOM element
        this.element = document.createElement('button');
        this.element.className = 'ui-button';
        this.element.textContent = this.text;
        this.element.style.cssText = `
            padding: 10px 20px;
            background: rgba(51, 51, 51, 0.8);
            color: ${DESIGN_SYSTEM.colors.text};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            cursor: pointer;
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            transition: all 0.2s;
            ${this.getCustomStyles()}
        `;

        // Event listeners
        this.setupEventListeners();
    }

    /**
     * Get custom styles as CSS string
     * @returns {string} CSS styles
     * @private
     */
    getCustomStyles() {
        return Object.entries(this.style)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        if (!this.enabled) {
            return;
        }

        this.element.addEventListener('mouseenter', () => {
            if (this.state !== 'disabled') {
                this.setState('hover');
            }
        });

        this.element.addEventListener('mouseleave', () => {
            if (this.state !== 'disabled') {
                this.setState('normal');
            }
        });

        this.element.addEventListener('mousedown', () => {
            if (this.state !== 'disabled') {
                this.setState('pressed');
            }
        });

        this.element.addEventListener('mouseup', () => {
            if (this.state === 'pressed') {
                this.setState('hover');
                if (this.onClick) {
                    this.onClick();
                }
            }
        });

        this.element.addEventListener('click', (e) => {
            if (this.state !== 'disabled') {
                e.preventDefault();
                if (this.onClick) {
                    this.onClick();
                }
            }
        });
    }

    /**
     * Set button state
     * @param {string} newState - New state
     */
    setState(newState) {
        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.updateVisualState();
    }

    /**
     * Update visual state based on current state
     * @private
     */
    updateVisualState() {
        switch (this.state) {
            case 'normal':
                this.element.style.background = '#333333';
                this.element.style.borderColor = '#00ffff';
                this.element.style.transform = 'scale(1)';
                break;
            case 'hover':
                this.element.style.background = '#444444';
                this.element.style.borderColor = '#00ff00';
                this.element.style.transform = 'scale(1.05)';
                break;
            case 'pressed':
                this.element.style.background = '#222222';
                this.element.style.borderColor = '#00ffff';
                this.element.style.transform = 'scale(0.95)';
                break;
            case 'disabled':
                this.element.style.background = '#1a1a1a';
                this.element.style.borderColor = '#666666';
                this.element.style.color = '#666666';
                this.element.style.cursor = 'not-allowed';
                this.element.style.transform = 'scale(1)';
                break;
        }
    }

    /**
     * Enable button
     */
    enable() {
        this.enabled = true;
        this.setState('normal');
        this.element.disabled = false;
    }

    /**
     * Disable button
     */
    disable() {
        this.enabled = false;
        this.setState('disabled');
        this.element.disabled = true;
    }

    /**
     * Set button text
     * @param {string} text - New text
     */
    setText(text) {
        this.text = text;
        this.element.textContent = text;
    }

    /**
     * Get DOM element
     * @returns {HTMLElement} Button element
     */
    getElement() {
        return this.element;
    }

    /**
     * Destroy button (cleanup)
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
