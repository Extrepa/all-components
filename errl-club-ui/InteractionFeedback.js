/**
 * InteractionFeedback - Visual feedback for interactions
 *
 * Shows success/failure messages, cooldown indicators, and interaction state
 */
export class InteractionFeedback {
    /**
     * Create a new InteractionFeedback
     * @param {Object} config - Configuration
     * @param {HTMLElement} config.container - Container element (default: document.body)
     */
    constructor(config = {}) {
        this.container = config.container || document.body;
        this.feedbackQueue = [];
        this.activeFeedbacks = [];

        // Create feedback container
        this.createContainer();
    }

    /**
     * Create feedback container
     * @private
     */
    createContainer() {
        this.containerElement = document.createElement('div');
        this.containerElement.id = 'interaction-feedback-container';
        this.containerElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        `;
        this.container.appendChild(this.containerElement);
    }

    /**
     * Show feedback message
     * @param {Object} config - Feedback configuration
     * @param {string} config.message - Feedback message
     * @param {string} config.type - Feedback type ('success', 'error', 'info', 'warning')
     * @param {number} config.duration - Display duration in ms (default: 2000)
     * @param {string} config.icon - Icon text (optional)
     */
    show(config) {
        const { message, type = 'info', duration = 2000, icon = null } = config;

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `interaction-feedback feedback-${type}`;
        feedback.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${this.getColorForType(type)};
            border-radius: 8px;
            padding: 12px 20px;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 14px;
            color: ${this.getColorForType(type)};
            pointer-events: none;
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            max-width: 300px;
            text-align: center;
        `;

        // Add icon if provided
        if (icon) {
            const iconElement = document.createElement('span');
            iconElement.textContent = icon;
            iconElement.style.cssText = 'font-size: 18px;';
            feedback.appendChild(iconElement);
        }

        // Add message
        const messageElement = document.createElement('span');
        messageElement.textContent = message;
        feedback.appendChild(messageElement);

        this.containerElement.appendChild(feedback);
        this.activeFeedbacks.push(feedback);

        // Animate in
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0) scale(1)';
        });

        // Auto-remove after duration
        setTimeout(() => {
            this.removeFeedback(feedback);
        }, duration);
    }

    /**
     * Show success feedback
     * @param {string} message - Success message
     * @param {number} duration - Display duration
     */
    showSuccess(message, duration = 2000) {
        this.show({
            message,
            type: 'success',
            duration,
            icon: '✓',
        });
    }

    /**
     * Show error feedback
     * @param {string} message - Error message
     * @param {number} duration - Display duration
     */
    showError(message, duration = 2000) {
        this.show({
            message,
            type: 'error',
            duration,
            icon: '✗',
        });
    }

    /**
     * Show info feedback
     * @param {string} message - Info message
     * @param {number} duration - Display duration
     */
    showInfo(message, duration = 2000) {
        this.show({
            message,
            type: 'info',
            duration,
            icon: 'ℹ',
        });
    }

    /**
     * Show warning feedback
     * @param {string} message - Warning message
     * @param {number} duration - Display duration
     */
    showWarning(message, duration = 2000) {
        this.show({
            message,
            type: 'warning',
            duration,
            icon: '⚠',
        });
    }

    /**
     * Remove a feedback element
     * @private
     */
    removeFeedback(feedback) {
        const index = this.activeFeedbacks.indexOf(feedback);
        if (index > -1) {
            this.activeFeedbacks.splice(index, 1);
        }

        // Animate out
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(-20px) scale(0.9)';

        // Remove from DOM after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }

    /**
     * Get color for feedback type
     * @private
     */
    getColorForType(type) {
        const colors = {
            success: '#00ff00',
            error: '#ff0000',
            info: '#00ffff',
            warning: '#ffaa00',
        };
        return colors[type] || colors.info;
    }

    /**
     * Clear all feedbacks
     */
    clear() {
        this.activeFeedbacks.forEach((feedback) => {
            this.removeFeedback(feedback);
        });
        this.activeFeedbacks = [];
    }

    /**
     * Show cooldown indicator
     * @param {Object} config - Cooldown configuration
     * @param {string} config.message - Cooldown message
     * @param {number} config.duration - Cooldown duration in seconds
     * @param {string} config.interactionId - Unique interaction ID
     */
    showCooldown(config) {
        const { message, duration, interactionId } = config;
        const cooldownId = `cooldown-${interactionId || Date.now()}`;

        // Remove existing cooldown if present
        const existing = document.getElementById(cooldownId);
        if (existing) {
            existing.remove();
        }

        // Create cooldown element
        const cooldown = document.createElement('div');
        cooldown.id = cooldownId;
        cooldown.className = 'interaction-feedback feedback-cooldown';
        cooldown.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ffaa00;
            border-radius: 8px;
            padding: 12px 20px;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 14px;
            color: #ffaa00;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(255, 170, 0, 0.3);
            max-width: 300px;
            text-align: center;
        `;

        const messageElement = document.createElement('span');
        messageElement.textContent = message || 'Cooldown';
        cooldown.appendChild(messageElement);

        const timerElement = document.createElement('span');
        timerElement.className = 'cooldown-timer';
        timerElement.style.cssText = 'font-weight: bold; min-width: 40px;';
        timerElement.textContent = `${duration.toFixed(1)}s`;
        cooldown.appendChild(timerElement);

        this.containerElement.appendChild(cooldown);
        this.activeFeedbacks.push(cooldown);

        // Animate in
        requestAnimationFrame(() => {
            cooldown.style.opacity = '1';
            cooldown.style.transform = 'translateY(0) scale(1)';
        });

        // Update timer
        let remaining = duration;
        const updateInterval = setInterval(() => {
            remaining -= 0.1;
            if (remaining <= 0) {
                clearInterval(updateInterval);
                this.removeFeedback(cooldown);
            } else {
                timerElement.textContent = `${remaining.toFixed(1)}s`;
            }
        }, 100);
    }

    /**
     * Show range indicator
     * @param {Object} config - Range indicator configuration
     * @param {number} config.distance - Current distance to target
     * @param {number} config.maxDistance - Maximum interaction distance
     * @param {string} config.targetName - Name of the target (optional)
     */
    showRangeIndicator(config) {
        const { distance, maxDistance, targetName } = config;
        const rangeId = 'range-indicator';

        // Remove existing range indicator if present
        const existing = document.getElementById(rangeId);
        if (existing) {
            existing.remove();
        }

        const normalizedDistance = Math.min(1, distance / maxDistance);
        const isInRange = distance <= maxDistance;

        // Create range indicator element
        const rangeIndicator = document.createElement('div');
        rangeIndicator.id = rangeId;
        rangeIndicator.className = 'interaction-feedback feedback-range';
        rangeIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid ${isInRange ? '#00ff00' : '#ff0000'};
            border-radius: 8px;
            padding: 8px 16px;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 12px;
            color: ${isInRange ? '#00ff00' : '#ff0000'};
            pointer-events: none;
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const labelElement = document.createElement('span');
        labelElement.textContent = targetName ? `${targetName}: ` : 'Distance: ';
        rangeIndicator.appendChild(labelElement);

        const distanceElement = document.createElement('span');
        distanceElement.style.cssText = 'font-weight: bold;';
        distanceElement.textContent = `${distance.toFixed(1)}m / ${maxDistance.toFixed(1)}m`;
        rangeIndicator.appendChild(distanceElement);

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        `;
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: ${(1 - normalizedDistance) * 100}%;
            background: ${isInRange ? '#00ff00' : '#ff0000'};
            transition: width 0.1s linear;
        `;
        progressBar.appendChild(progressFill);
        rangeIndicator.appendChild(progressBar);

        document.body.appendChild(rangeIndicator);

        // Store reference for updates
        this.rangeIndicator = {
            element: rangeIndicator,
            distanceElement,
            progressFill,
        };
    }

    /**
     * Update range indicator
     * @param {number} distance - Current distance
     * @param {number} maxDistance - Maximum interaction distance
     */
    updateRangeIndicator(distance, maxDistance) {
        if (!this.rangeIndicator) {
            return;
        }

        const normalizedDistance = Math.min(1, distance / maxDistance);
        const isInRange = distance <= maxDistance;

        this.rangeIndicator.distanceElement.textContent = `${distance.toFixed(1)}m / ${maxDistance.toFixed(1)}m`;
        this.rangeIndicator.progressFill.style.width = `${(1 - normalizedDistance) * 100}%`;
        this.rangeIndicator.progressFill.style.background = isInRange ? '#00ff00' : '#ff0000';
        this.rangeIndicator.element.style.borderColor = isInRange ? '#00ff00' : '#ff0000';
        this.rangeIndicator.element.style.color = isInRange ? '#00ff00' : '#ff0000';
    }

    /**
     * Hide range indicator
     */
    hideRangeIndicator() {
        if (this.rangeIndicator && this.rangeIndicator.element) {
            this.rangeIndicator.element.remove();
            this.rangeIndicator = null;
        }
    }

    /**
     * Destroy the feedback system
     */
    destroy() {
        this.clear();
        this.hideRangeIndicator();
        if (this.containerElement && this.containerElement.parentNode) {
            this.containerElement.parentNode.removeChild(this.containerElement);
        }
    }
}
