/**
 * RoomTransitionUI - Enhanced UI for room transitions
 *
 * Provides loading screen, progress indicator, room name display, and smooth animations
 */
import { BasePanel } from './BasePanel.js';
import { ErrlLoader } from './ErrlLoader.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class RoomTransitionUI extends BasePanel {
    /**
     * Create a new RoomTransitionUI
     * @param {Object} config - Configuration
     * @param {Object} config.eventBus - EventBus instance
     * @param {Object} config.roomManager - RoomManager instance (optional)
     */
    constructor(config = {}) {
        super({
            id: 'room_transition_ui',
            title: '',
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            style: {
                background: 'transparent',
                border: 'none',
                pointerEvents: 'none',
                zIndex: 10000,
            },
        });

        this.eventBus = config.eventBus;
        this.roomManager = config.roomManager;

        // UI elements
        this.overlay = null;
        this.loadingScreen = null;
        this.roomNameDisplay = null;
        this.progressBar = null;
        this.progressBarFill = null;
        this.percentageDisplay = null;
        this.tipsDisplay = null;
        this.errlLoader = null;

        // State
        this.isTransitioning = false;
        this.isLoading = false;
        this.currentRoomName = '';
        this.targetRoomName = '';
        this.progress = 0;

        // Tips for loading screen
        this.tips = [
            'Tip: Explore all rooms to discover hidden collectibles!',
            'Tip: Interact with other players to boost your vibe!',
            'Tip: Collect fragments to unlock new features!',
            'Tip: Use the DevMenu (F9) to customize your experience!',
            'Tip: Try different camera modes for unique perspectives!',
        ];

        // Create UI
        this.createOverlay();
        this.createLoadingScreen();

        // Listen to room events
        if (this.eventBus) {
            this.eventBus.on('room.transitionStart', (data) => {
                this.onTransitionStart(data);
            });

            this.eventBus.on('room.transitionComplete', (data) => {
                this.onTransitionComplete(data);
            });

            this.eventBus.on('room.loading', (data) => {
                this.onLoading(data);
            });

            this.eventBus.on('room.loadingProgress', (data) => {
                this.onLoadingProgress(data);
            });

            this.eventBus.on('room.loaded', (data) => {
                this.onRoomLoaded(data);
            });
        }

        // Initially hidden
        this.hide();
    }

    /**
     * Create overlay for transitions
     * @private
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'room-transition-overlay-ui';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%);
            opacity: 0;
            pointer-events: none;
            z-index: 10000;
            transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * Create loading screen
     * @private
     */
    createLoadingScreen() {
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'room-loading-screen-ui';
        this.loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%);
            color: #ffffff;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            font-family: 'Courier New', monospace;
        `;

        // Create Errl loader
        this.errlLoader = new ErrlLoader({
            container: this.loadingScreen,
            message: '',
        });

        // Room name display
        this.roomNameDisplay = document.createElement('div');
        this.roomNameDisplay.id = 'room-name-display';
        this.roomNameDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 40px;
            text-shadow: 
                0 0 10px rgba(0, 255, 255, 0.8),
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 30px rgba(0, 255, 255, 0.3);
            color: ${DESIGN_SYSTEM.colors.accent};
            text-align: center;
            animation: pulse 2s ease-in-out infinite;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.loadingScreen.appendChild(this.roomNameDisplay);

        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 500px;
            max-width: 80vw;
            margin-bottom: 20px;
        `;

        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: rgba(0, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        `;

        this.progressBarFill = document.createElement('div');
        this.progressBarFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00ffff 0%, #ff00ff 100%);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px #00ffff;
        `;
        this.progressBar.appendChild(this.progressBarFill);
        progressContainer.appendChild(this.progressBar);
        this.loadingScreen.appendChild(progressContainer);

        // Percentage display
        this.percentageDisplay = document.createElement('div');
        this.percentageDisplay.id = 'loading-percentage-ui';
        this.percentageDisplay.style.cssText = `
            margin-bottom: 30px;
            font-size: 24px;
            color: ${DESIGN_SYSTEM.colors.accent};
            font-weight: bold;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.percentageDisplay.textContent = '0%';
        this.loadingScreen.appendChild(this.percentageDisplay);

        // Tips display
        this.tipsDisplay = document.createElement('div');
        this.tipsDisplay.id = 'loading-tips';
        this.tipsDisplay.style.cssText = `
            font-size: 16px;
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.6;
            text-align: center;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            max-width: 600px;
            padding: 0 20px;
            font-style: italic;
            animation: fadeInOut 4s ease-in-out infinite;
        `;
        this.tipsDisplay.textContent = this.getRandomTip();
        this.loadingScreen.appendChild(this.tipsDisplay);

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.loadingScreen);
    }

    /**
     * Handle transition start
     * @param {Object} data - Transition data
     */
    onTransitionStart(data) {
        this.isTransitioning = true;
        this.targetRoomName = data.roomName || 'New Room';

        // Show overlay with fade
        if (this.overlay) {
            this.overlay.style.opacity = '1';
        }
    }

    /**
     * Handle transition complete
     * @param {Object} data - Transition data
     */
    onTransitionComplete(data) {
        // Fade out overlay
        if (this.overlay) {
            this.overlay.style.opacity = '0';
        }

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    /**
     * Handle loading start
     * @param {Object} data - Loading data
     */
    onLoading(data) {
        this.isLoading = true;
        this.currentRoomName = data.roomName || 'Loading Room...';
        this.progress = 0;

        // Update room name
        if (this.roomNameDisplay) {
            this.roomNameDisplay.textContent = this.currentRoomName;
        }

        // Show Errl loader
        if (this.errlLoader) {
            this.errlLoader.setMessage(this.currentRoomName);
            this.errlLoader.show();
        }

        // Show loading screen
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
        }

        // Update progress
        this.updateProgress(0);

        // Rotate tips
        this.rotateTips();
    }

    /**
     * Handle loading progress
     * @param {Object} data - Progress data
     */
    onLoadingProgress(data) {
        const progress = data.progress || 0;
        this.updateProgress(progress);
    }

    /**
     * Handle room loaded
     * @param {Object} data - Room data
     */
    onRoomLoaded(data) {
        // Complete loading
        this.updateProgress(1);

        // Hide loading screen after a brief delay
        setTimeout(() => {
            this.hideLoading();
        }, 500);
    }

    /**
     * Update progress bar
     * @param {number} progress - Progress from 0 to 1
     */
    updateProgress(progress) {
        this.progress = Math.max(0, Math.min(1, progress));

        if (this.progressBarFill) {
            this.progressBarFill.style.width = `${this.progress * 100}%`;
        }

        if (this.percentageDisplay) {
            this.percentageDisplay.textContent = `${Math.round(this.progress * 100)}%`;
        }
    }

    /**
     * Rotate tips
     */
    rotateTips() {
        if (!this.tipsDisplay) {
            return;
        }

        let tipIndex = 0;
        const rotateInterval = setInterval(() => {
            if (!this.isLoading) {
                clearInterval(rotateInterval);
                return;
            }

            tipIndex = (tipIndex + 1) % this.tips.length;
            this.tipsDisplay.textContent = this.tips[tipIndex];
        }, 4000);
    }

    /**
     * Get random tip
     * @returns {string} Random tip
     */
    getRandomTip() {
        return this.tips[Math.floor(Math.random() * this.tips.length)];
    }

    /**
     * Show loading screen
     * @param {string} roomName - Room name to display
     */
    showLoading(roomName = 'Loading...') {
        this.onLoading({ roomName });
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        this.isLoading = false;

        // Hide Errl loader
        if (this.errlLoader) {
            this.errlLoader.hide();
        }

        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }

        // Reset progress
        this.updateProgress(0);
    }

    /**
     * Show transition overlay
     */
    showTransition() {
        if (this.overlay) {
            this.overlay.style.opacity = '1';
        }
    }

    /**
     * Hide transition overlay
     */
    hideTransition() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
        }
    }

    /**
     * Show the UI
     */
    show() {
        // Override - don't use BasePanel show
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide the UI
     */
    hide() {
        // Override - don't use BasePanel hide
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
        if (this.overlay) {
            this.overlay.style.opacity = '0';
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.errlLoader) {
            this.errlLoader.dispose();
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.loadingScreen && this.loadingScreen.parentNode) {
            this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
        if (this.eventBus) {
            this.eventBus.off('room.transitionStart', this.onTransitionStart);
            this.eventBus.off('room.transitionComplete', this.onTransitionComplete);
            this.eventBus.off('room.loading', this.onLoading);
            this.eventBus.off('room.loadingProgress', this.onLoadingProgress);
            this.eventBus.off('room.loaded', this.onRoomLoaded);
        }
    }
}
