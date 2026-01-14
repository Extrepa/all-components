/**
 * BasePanel - Base panel class with common functionality
 *
 * Provides common panel methods, event handling, and styling
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class BasePanel {
    /**
     * Create a new BasePanel
     * @param {Object} config - Configuration
     * @param {string} config.id - Panel ID
     * @param {string} config.title - Panel title
     * @param {Object} config.position - Position {x, y}
     * @param {Object} config.size - Size {width, height}
     * @param {Object} config.style - Custom CSS styles
     */
    constructor(config = {}) {
        this.id = config.id || `panel_${Date.now()}`;
        this.title = config.title || '';
        this.position = config.position || { x: 0, y: 0 };
        this.size = config.size || { width: 300, height: 200 };
        this.style = config.style || {};

        // Panel state
        this.visible = false;
        this.enabled = true;
        this.zIndex = 0;

        // DOM element
        this.element = null;

        // Event handlers
        this.onShow = null;
        this.onHide = null;
        this.onUpdate = null;
        this.onRender = null;

        // Create DOM element
        this.createElement();
    }

    /**
     * Create DOM element
     * @private
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'ui-panel';
        this.element.style.cssText = `
            position: fixed;
            left: ${this.position.x}px;
            top: ${this.position.y}px;
            width: ${this.size.width}px;
            height: ${this.size.height}px;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: ${DESIGN_SYSTEM.spacing.padding};
            color: ${DESIGN_SYSTEM.colors.text};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            display: none;
            z-index: ${this.zIndex};
            box-shadow: ${DESIGN_SYSTEM.shadows.panel};
            box-sizing: border-box;
            overflow: hidden;
            ${this.getCustomStyles()}
        `;

        // Add title if provided
        if (this.title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'ui-panel-title';
            titleElement.textContent = this.title;
            titleElement.style.cssText = `
                font-size: ${DESIGN_SYSTEM.typography.titleSize};
                font-weight: ${DESIGN_SYSTEM.typography.titleWeight};
                margin-bottom: ${DESIGN_SYSTEM.spacing.margin};
                color: ${DESIGN_SYSTEM.colors.title};
                border-bottom: ${DESIGN_SYSTEM.borders.titleBorderBottom};
                padding-bottom: ${DESIGN_SYSTEM.spacing.titlePaddingBottom};
            `;
            this.element.appendChild(titleElement);
        }

        // Add content container
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'ui-panel-content';
        this.element.appendChild(this.contentElement);

        document.body.appendChild(this.element);
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
     * Show the panel
     */
    show() {
        try {
            if (this.visible) {
                return;
            }

            this.visible = true;
            if (this.element) {
                this.element.style.display = 'block';
                // Apply scaling if UI scaling system is available
                this.applyScaling();
            }

            if (this.onShow) {
                this.onShow();
            }
        } catch (error) {
            console.error(`BasePanel: Error showing panel ${this.id}:`, error);
            // Show user-friendly error if notification system is available
            if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
                window.gameSystems.notificationSystem.show(
                    `Failed to show ${this.title || 'panel'}. Please try again.`,
                    'error',
                    3000
                );
            }
        }
    }

    /**
     * Apply UI scaling to this panel
     * @private
     */
    applyScaling() {
        if (!this.element) {
            return;
        }

        // Check for global UI scaling system
        if (typeof window !== 'undefined' && window.uiScalingSystem) {
            window.uiScalingSystem.registerElement(this.element);
        }
    }

    /**
     * Hide the panel
     */
    hide() {
        try {
            if (!this.visible) {
                return;
            }

            this.visible = false;
            if (this.element) {
                this.element.style.display = 'none';
            }

            if (this.onHide) {
                this.onHide();
            }
        } catch (error) {
            console.error(`BasePanel: Error hiding panel ${this.id}:`, error);
            // Continue - hiding failure is less critical than showing failure
        }
    }

    /**
     * Check if panel is visible
     * @returns {boolean} True if visible
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Update panel (called every frame)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
    }

    /**
     * Render panel (called every frame)
     */
    render() {
        if (this.onRender) {
            this.onRender();
        }
    }

    /**
     * Handle UI event
     * @param {string} eventType - Event type
     * @param {Object} eventData - Event data
     * @returns {boolean} True if event was handled
     */
    handleEvent(eventType, eventData) {
        // Override in subclasses
        return false;
    }

    /**
     * Set panel position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.position = { x, y };
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        }
    }

    /**
     * Set panel size
     * @param {number} width - Width
     * @param {number} height - Height
     */
    setSize(width, height) {
        this.size = { width, height };
        if (this.element) {
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
        }
    }

    /**
     * Set z-index
     * @param {number} zIndex - Z-index value
     */
    setZIndex(zIndex) {
        this.zIndex = zIndex;
        if (this.element) {
            this.element.style.zIndex = zIndex;
        }
    }

    /**
     * Focus handler
     */
    onFocus() {
        if (this.element) {
            this.element.style.borderColor = '#00ff00';
            this.element.style.boxShadow = '0 4px 20px rgba(0, 255, 0, 0.5)';
        }
    }

    /**
     * Blur handler
     */
    onBlur() {
        if (this.element) {
            this.element.style.borderColor = '#00ffff';
            this.element.style.boxShadow = '0 4px 20px rgba(0, 255, 255, 0.3)';
        }
    }

    /**
     * Destroy panel (cleanup)
     */
    destroy() {
        this.hide();

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.contentElement = null;
    }

    /**
     * Get content element
     * @returns {HTMLElement} Content element
     */
    getContentElement() {
        return this.contentElement;
    }
}
