/**
 * NotificationSystem - Simple on-screen notification system
 *
 * Displays temporary messages to the player (e.g., camera intensity changes)
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class NotificationSystem {
    constructor(container = null) {
        this.container = container || document.body;
        this.notifications = [];
        this.nextId = 0;

        // Create notification container
        this.containerElement = document.createElement('div');
        this.containerElement.id = 'notification-container';
        this.containerElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        this.container.appendChild(this.containerElement);
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {Object} options - Options
     * @param {string} options.type - 'info', 'success', 'warning', 'error' (default: 'info')
     * @param {number} options.duration - Duration in milliseconds (default: 3000)
     * @param {string} options.color - Custom color (optional)
     * @returns {number} Notification ID
     */
    show(message, options = {}) {
        const { type = 'info', duration = 3000, color = null } = options;

        const id = this.nextId++;
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.style.cssText = `
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${this.getBorderColor(type, color)};
            color: ${DESIGN_SYSTEM.colors.text};
            padding: 12px 16px;
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            font-size: 14px;
            box-shadow: ${DESIGN_SYSTEM.shadows.panel};
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s ease;
            max-width: 100%;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        this.containerElement.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto-remove after duration
        const timeout = setTimeout(() => {
            this.remove(id);
        }, duration);

        this.notifications.push({ id, element: notification, timeout });

        return id;
    }

    /**
     * Remove a notification
     * @param {number} id - Notification ID
     */
    remove(id) {
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index === -1) {
            return;
        }

        const { element, timeout } = this.notifications[index];
        clearTimeout(timeout);

        // Animate out
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);

        this.notifications.splice(index, 1);
    }

    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach(({ id }) => this.remove(id));
    }

    /**
     * Get border color for notification type
     * @private
     */
    getBorderColor(type, customColor) {
        if (customColor) {
            return customColor;
        }

        switch (type) {
            case 'success':
                return '#00ff00';
            case 'warning':
                return '#ffaa00';
            case 'error':
                return '#ff0000';
            case 'info':
            default:
                return DESIGN_SYSTEM.colors.border;
        }
    }

    /**
     * Destroy the notification system
     */
    destroy() {
        this.clear();
        if (this.containerElement.parentNode) {
            this.containerElement.parentNode.removeChild(this.containerElement);
        }
    }
}
