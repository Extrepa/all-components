/**
 * Modal - Reusable modal component
 *
 * Handles overlay, close handling, and content display
 */
import { DESIGN_SYSTEM, generatePanelStyles, generateTitleStyles } from '../designSystem.js';

export class Modal {
    /**
     * Create a new Modal
     * @param {Object} config - Configuration
     * @param {string} config.title - Modal title
     * @param {HTMLElement|string} config.content - Modal content (element or HTML string)
     * @param {Function} config.onClose - Close handler
     * @param {boolean} config.closable - Whether modal can be closed (default: true)
     * @param {string} config.size - Modal size ('small', 'medium', 'large', or custom {width, height})
     */
    constructor(config = {}) {
        this.title = config.title || 'Modal';
        this.content = config.content || '';
        this.onClose = config.onClose || (() => {});
        this.closable = config.closable !== false;

        // Size configuration
        const sizePresets = {
            small: { width: 400, height: 300 },
            medium: { width: 600, height: 400 },
            large: { width: 800, height: 600 },
        };

        if (typeof config.size === 'string' && sizePresets[config.size]) {
            this.size = sizePresets[config.size];
        } else if (typeof config.size === 'object') {
            this.size = config.size;
        } else {
            this.size = sizePresets.medium;
        }

        // Modal state
        this.visible = false;

        // Create DOM elements
        this.createElements();
    }

    /**
     * Create DOM elements
     * @private
     */
    createElements() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'ui-modal-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;

        // Modal container
        this.modal = document.createElement('div');
        this.modal.className = 'ui-modal';
        this.modal.style.cssText = `
            ${generatePanelStyles({
                width: `${this.size.width}px`,
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
            })}
        `;

        // Header
        this.header = document.createElement('div');
        this.header.className = 'ui-modal-header';
        this.header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${DESIGN_SYSTEM.spacing.padding};
            border-bottom: ${DESIGN_SYSTEM.borders.titleBorderBottom};
        `;

        // Title
        this.titleElement = document.createElement('h2');
        this.titleElement.textContent = this.title;
        this.titleElement.style.cssText = `
            ${generateTitleStyles({
                fontSize: '20px',
                margin: '0',
            })}
        `;
        this.header.appendChild(this.titleElement);

        // Close button
        if (this.closable) {
            this.closeButton = document.createElement('button');
            this.closeButton.textContent = '×';
            this.closeButton.style.cssText = `
                background: transparent;
                border: none;
                color: ${DESIGN_SYSTEM.colors.text};
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            this.closeButton.addEventListener('click', () => {
                this.close();
            });
            this.header.appendChild(this.closeButton);
        }

        this.modal.appendChild(this.header);

        // Content
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-modal-content';
        this.contentElement.style.cssText = `
            padding: ${DESIGN_SYSTEM.spacing.padding};
            overflow-y: auto;
            flex: 1;
            color: ${DESIGN_SYSTEM.colors.text};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        // Set content
        if (typeof this.content === 'string') {
            this.contentElement.innerHTML = this.content;
        } else if (this.content instanceof HTMLElement) {
            this.contentElement.appendChild(this.content);
        }

        this.modal.appendChild(this.contentElement);
        this.overlay.appendChild(this.modal);

        // Close on overlay click
        if (this.closable) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }

        // Close on Escape key
        if (this.closable) {
            this.escapeHandler = (e) => {
                if (e.key === 'Escape' && this.visible) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }
    }

    /**
     * Show modal
     */
    show() {
        if (this.visible) {
            return;
        }

        this.visible = true;
        this.overlay.style.display = 'flex';
        document.body.appendChild(this.overlay);
    }

    /**
     * Close modal
     */
    close() {
        if (!this.visible) {
            return;
        }

        this.visible = false;
        this.overlay.style.display = 'none';

        if (this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Check if modal is visible
     * @returns {boolean} True if visible
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Set modal content
     * @param {HTMLElement|string} content - New content
     */
    setContent(content) {
        this.content = content;
        this.contentElement.innerHTML = '';

        if (typeof content === 'string') {
            this.contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentElement.appendChild(content);
        }
    }

    /**
     * Get content element
     * @returns {HTMLElement} Content element
     */
    getContentElement() {
        return this.contentElement;
    }

    /**
     * Destroy modal (cleanup)
     */
    destroy() {
        this.close();

        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}
