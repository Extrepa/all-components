/**
 * InteractionPrompt - Visual prompt for interactable objects
 *
 * Displays "Press E to interact" when player is near an interactable object
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class InteractionPrompt {
    /**
     * Create a new InteractionPrompt
     * @param {Object} config - Configuration
     * @param {HTMLElement} config.container - Container element (default: document.body)
     */
    constructor(config = {}) {
        this.container = config.container || document.body;
        this.currentTarget = null;
        this.isVisible = false;

        // Create prompt element
        this.createPrompt();
    }

    /**
     * Create prompt DOM element
     * @private
     */
    createPrompt() {
        this.element = document.createElement('div');
        this.element.id = 'interaction-prompt';
        this.element.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px 24px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            font-size: 16px;
            color: ${DESIGN_SYSTEM.colors.accent};
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: ${DESIGN_SYSTEM.shadows.panel};
        `;

        // Key indicator
        const keyIndicator = document.createElement('div');
        keyIndicator.style.cssText = `
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid ${DESIGN_SYSTEM.colors.border};
            border-radius: 4px;
            padding: 4px 8px;
            font-weight: bold;
            font-size: 14px;
            min-width: 24px;
            text-align: center;
        `;
        keyIndicator.textContent = 'E';
        this.element.appendChild(keyIndicator);

        // Text
        const text = document.createElement('span');
        text.id = 'interaction-prompt-text';
        text.textContent = 'to interact';
        text.style.cssText = `color: ${DESIGN_SYSTEM.colors.text};`;
        this.element.appendChild(text);

        // Object name (optional)
        this.objectNameElement = document.createElement('div');
        this.objectNameElement.id = 'interaction-prompt-object-name';
        this.objectNameElement.style.cssText = `
            font-size: 12px;
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.7;
            margin-top: 4px;
            text-align: center;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.element.appendChild(this.objectNameElement);

        this.container.appendChild(this.element);
    }

    /**
     * Show prompt for an interactable object
     * @param {Object} target - Interactable target object
     * @param {string} target.name - Object name (optional)
     * @param {string} target.action - Action text (optional, default: "interact")
     * @param {string} target.key - Key to press (optional, default: "E")
     */
    show(target = null) {
        if (this.currentTarget === target && this.isVisible) {
            return; // Already showing for this target
        }

        this.currentTarget = target;

        if (target) {
            // Update text
            const textElement = this.element.querySelector('#interaction-prompt-text');
            const action = target.action || 'interact';
            const key = target.key || 'E';

            // Update key indicator
            const keyIndicator = this.element.querySelector('div');
            if (keyIndicator) {
                keyIndicator.textContent = key;
            }

            if (textElement) {
                textElement.textContent = `to ${action}`;
            }

            // Update object name
            if (target.name && this.objectNameElement) {
                this.objectNameElement.textContent = target.name;
                this.objectNameElement.style.display = 'block';
            } else if (this.objectNameElement) {
                this.objectNameElement.style.display = 'none';
            }

            // Show with animation
            this.element.style.opacity = '1';
            this.element.style.transform = 'translateX(-50%) translateY(0)';
            this.isVisible = true;
        } else {
            this.hide();
        }
    }

    /**
     * Hide the prompt
     */
    hide() {
        if (!this.isVisible) {
            return;
        }

        this.element.style.opacity = '0';
        this.element.style.transform = 'translateX(-50%) translateY(10px)';
        this.isVisible = false;
        this.currentTarget = null;

        // Clear after transition
        setTimeout(() => {
            if (!this.isVisible) {
                this.objectNameElement.textContent = '';
            }
        }, 300);
    }

    /**
     * Update prompt (called each frame)
     * @param {Object} target - Current interactable target
     */
    update(target) {
        if (target) {
            this.show(target);
        } else {
            this.hide();
        }
    }

    /**
     * Set custom prompt text
     * @param {string} text - Custom text
     */
    setText(text) {
        const textElement = this.element.querySelector('#interaction-prompt-text');
        if (textElement) {
            textElement.textContent = text;
        }
    }

    /**
     * Set custom key indicator
     * @param {string} key - Key to display
     */
    setKey(key) {
        const keyIndicator = this.element.querySelector('div');
        if (keyIndicator) {
            keyIndicator.textContent = key;
        }
    }

    /**
     * Destroy the prompt
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
