/**
 * CollectionStreakUI - Displays collection streak and combo indicators
 *
 * Shows visual indicators for streaks, combos, multipliers, and timing windows
 */
import { BasePanel } from './BasePanel.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class CollectionStreakUI extends BasePanel {
    /**
     * Create a new CollectionStreakUI
     * @param {Object} config - Configuration
     * @param {Object} config.streakSystem - CollectionStreakSystem instance
     * @param {Object} config.eventBus - EventBus instance
     */
    constructor(config = {}) {
        super({
            id: 'collection_streak_ui',
            title: '',
            position: { x: window.innerWidth / 2 - 200, y: 100 },
            size: { width: 400, height: 150 },
            style: {
                background: 'transparent',
                border: 'none',
                pointerEvents: 'none',
            },
        });

        this.streakSystem = config.streakSystem;
        this.eventBus = config.eventBus;

        // UI elements
        this.streakDisplay = null;
        this.comboDisplay = null;
        this.multiplierDisplay = null;
        this.timingBar = null;
        this.timingBarFill = null;

        // Animation state
        this.pulseAnimation = null;
        this.comboAnimation = null;

        // Create UI
        this.createContent();

        // Listen to streak events
        if (this.eventBus) {
            this.eventBus.on('collection.streakUpdate', (data) => {
                this.onStreakUpdate(data);
            });

            this.eventBus.on('collection.streakBreak', (data) => {
                this.onStreakBreak(data);
            });
        }

        // Update timing bar
        this.updateInterval = setInterval(() => {
            this.updateTimingBar();
        }, 50);
    }

    /**
     * Create UI content
     * @private
     */
    createContent() {
        const content = this.getContentElement();
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
        `;

        // Streak display
        this.streakDisplay = document.createElement('div');
        this.streakDisplay.id = 'streak-display';
        this.streakDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: #00ffff;
            text-shadow: 
                0 0 10px rgba(0, 255, 255, 0.8),
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 30px rgba(0, 255, 255, 0.3);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
        `;
        this.streakDisplay.textContent = '0x Streak';
        content.appendChild(this.streakDisplay);

        // Combo display
        this.comboDisplay = document.createElement('div');
        this.comboDisplay.id = 'combo-display';
        this.comboDisplay.style.cssText = `
            font-size: 32px;
            font-weight: bold;
            color: #ffff00;
            text-shadow: 
                0 0 10px rgba(255, 255, 0, 0.8),
                0 0 20px rgba(255, 255, 0, 0.5);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
        `;
        this.comboDisplay.textContent = 'Combo x1';
        content.appendChild(this.comboDisplay);

        // Multiplier display
        this.multiplierDisplay = document.createElement('div');
        this.multiplierDisplay.id = 'multiplier-display';
        this.multiplierDisplay.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            color: #ff00ff;
            text-shadow: 
                0 0 10px rgba(255, 0, 255, 0.8);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        this.multiplierDisplay.textContent = 'x1.0';
        content.appendChild(this.multiplierDisplay);

        // Timing window bar
        const timingContainer = document.createElement('div');
        timingContainer.style.cssText = `
            width: 300px;
            height: 8px;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            overflow: hidden;
            margin-top: 10px;
        `;

        this.timingBarFill = document.createElement('div');
        this.timingBarFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #00ff00);
            transition: width 0.1s linear;
            transform-origin: left;
        `;
        timingContainer.appendChild(this.timingBarFill);
        this.timingBar = timingContainer;
        content.appendChild(timingContainer);

        // Initially hidden
        this.element.style.display = 'none';
    }

    /**
     * Handle streak update event
     * @param {Object} data - Streak update data
     */
    onStreakUpdate(data) {
        const { streak, combo, multiplier, timeRemaining } = data;

        // Update displays
        if (streak > 0) {
            this.streakDisplay.textContent = `${streak}x Streak!`;
            this.streakDisplay.style.opacity = '1';
            this.streakDisplay.style.transform = 'scale(1.1)';

            // Pulse animation
            this.animatePulse(this.streakDisplay);
        } else {
            this.streakDisplay.style.opacity = '0';
            this.streakDisplay.style.transform = 'scale(1.0)';
        }

        if (combo > 1) {
            this.comboDisplay.textContent = `Combo x${combo}`;
            this.comboDisplay.style.opacity = '1';
            this.comboDisplay.style.transform = 'scale(1.05)';

            // Combo animation
            this.animateCombo(this.comboDisplay);
        } else {
            this.comboDisplay.style.opacity = '0';
            this.comboDisplay.style.transform = 'scale(1.0)';
        }

        if (multiplier > 1.0) {
            this.multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
            this.multiplierDisplay.style.opacity = '1';
        } else {
            this.multiplierDisplay.style.opacity = '0';
        }

        // Show UI if there's an active streak
        if (streak > 0) {
            this.element.style.display = 'block';
        }

        // Update timing bar
        this.updateTimingBar();
    }

    /**
     * Handle streak break event
     * @param {Object} data - Streak break data
     */
    onStreakBreak(data) {
        const { finalStreak, finalCombo } = data;

        // Flash red to indicate break
        this.streakDisplay.style.color = '#ff0000';
        this.streakDisplay.style.textShadow = '0 0 20px rgba(255, 0, 0, 1)';

        setTimeout(() => {
            this.streakDisplay.style.color = '#00ffff';
            this.streakDisplay.style.textShadow = `
                0 0 10px rgba(0, 255, 255, 0.8),
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 30px rgba(0, 255, 255, 0.3)
            `;
        }, 500);

        // Hide after delay
        setTimeout(() => {
            this.element.style.display = 'none';
            this.streakDisplay.style.opacity = '0';
            this.comboDisplay.style.opacity = '0';
            this.multiplierDisplay.style.opacity = '0';
        }, 2000);
    }

    /**
     * Update timing bar
     */
    updateTimingBar() {
        if (!this.streakSystem || !this.timingBarFill) {
            return;
        }

        const timeRemaining = this.streakSystem.getTimeUntilStreakBreak();
        const streakTimeout = this.streakSystem.streakTimeout;
        const percentage = Math.max(0, Math.min(100, (timeRemaining / streakTimeout) * 100));

        this.timingBarFill.style.width = `${percentage}%`;

        // Change color based on time remaining
        if (percentage > 50) {
            this.timingBarFill.style.background = 'linear-gradient(90deg, #00ffff, #00ff00)';
        } else if (percentage > 25) {
            this.timingBarFill.style.background = 'linear-gradient(90deg, #ffff00, #ffaa00)';
        } else {
            this.timingBarFill.style.background = 'linear-gradient(90deg, #ff0000, #ff6600)';
        }
    }

    /**
     * Animate pulse effect
     * @param {HTMLElement} element - Element to animate
     */
    animatePulse(element) {
        if (this.pulseAnimation) {
            clearTimeout(this.pulseAnimation);
        }

        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'pulse 0.5s ease-in-out';
        }, 10);

        this.pulseAnimation = setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    /**
     * Animate combo effect
     * @param {HTMLElement} element - Element to animate
     */
    animateCombo(element) {
        if (this.comboAnimation) {
            clearTimeout(this.comboAnimation);
        }

        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'comboPulse 0.3s ease-in-out';
        }, 10);

        this.comboAnimation = setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    /**
     * Show the UI
     */
    show() {
        this.element.style.display = 'block';
    }

    /**
     * Hide the UI
     */
    hide() {
        this.element.style.display = 'none';
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.pulseAnimation) {
            clearTimeout(this.pulseAnimation);
        }
        if (this.comboAnimation) {
            clearTimeout(this.comboAnimation);
        }
        if (this.eventBus) {
            this.eventBus.off('collection.streakUpdate', this.onStreakUpdate);
            this.eventBus.off('collection.streakBreak', this.onStreakBreak);
        }
    }
}

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        @keyframes comboPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }
    `;
    document.head.appendChild(style);
}
