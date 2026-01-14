/**
 * RoomTransition - Handles transitions between rooms
 *
 * Manages transition animations, loading states, and timing
 */
export class RoomTransition {
    /**
     * Create a new RoomTransition
     * @param {Object} config - Configuration
     * @param {string} config.type - Transition type ('fade', 'slide', 'none')
     * @param {number} config.duration - Transition duration in ms (default: 1000)
     */
    constructor(config = {}) {
        this.type = config.type || 'fade';
        this.duration = config.duration || 1000;

        // Transition state
        this.inProgress = false;
        this.progress = 0; // 0 to 1
        this.startTime = 0;

        // Callbacks
        this.onStart = null;
        this.onProgress = null;
        this.onComplete = null;

        // Loading state
        this.loading = false;
        this.loadingProgress = 0;
    }

    /**
     * Start a transition
     * @param {Function} onComplete - Callback when transition completes
     * @returns {Promise} Resolves when transition completes
     */
    start(onComplete = null) {
        if (this.inProgress) {
            console.warn('RoomTransition: Transition already in progress');
            return Promise.resolve();
        }

        this.inProgress = true;
        this.progress = 0;
        this.startTime = Date.now();

        if (this.onStart) {
            this.onStart();
        }

        return new Promise((resolve) => {
            const complete = () => {
                this.inProgress = false;
                this.progress = 1;

                if (this.onComplete) {
                    this.onComplete();
                }

                if (onComplete) {
                    onComplete();
                }

                resolve();
            };

            // Handle different transition types
            switch (this.type) {
                case 'fade':
                    this.startFadeTransition(complete);
                    break;
                case 'slide':
                    this.startSlideTransition(complete);
                    break;
                case 'none':
                    // No transition, complete immediately
                    setTimeout(complete, 0);
                    break;
                default:
                    console.warn('RoomTransition: Unknown transition type:', this.type);
                    setTimeout(complete, this.duration);
            }
        });
    }

    /**
     * Start fade transition
     * @param {Function} onComplete - Completion callback
     * @private
     */
    startFadeTransition(onComplete) {
        const canvas = document.getElementById('club-canvas');
        if (!canvas) {
            setTimeout(onComplete, this.duration);
            return;
        }

        // Create overlay for fade
        let overlay = document.getElementById('room-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'room-transition-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%);
                opacity: 0;
                pointer-events: none;
                z-index: 10000;
                transition: opacity ${this.duration / 2}ms cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(overlay);
        }

        // Add transition sound effect (if audio context available)
        this.playTransitionSound();

        // Fade out with smooth easing
        overlay.style.opacity = '1';

        setTimeout(() => {
            // Fade in
            overlay.style.opacity = '0';

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                onComplete();
            }, this.duration / 2);
        }, this.duration / 2);
    }

    /**
     * Play transition sound effect
     * @private
     */
    playTransitionSound() {
        // Create a simple transition sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Audio context not available or failed
            console.debug('RoomTransition: Could not play transition sound:', error);
        }
    }

    /**
     * Start slide transition
     * @param {Function} onComplete - Completion callback
     * @private
     */
    startSlideTransition(onComplete) {
        const canvas = document.getElementById('club-canvas');
        if (!canvas) {
            setTimeout(onComplete, this.duration);
            return;
        }

        // Create slide overlay
        let overlay = document.getElementById('room-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'room-transition-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%);
                pointer-events: none;
                z-index: 10000;
                transform: translateX(-100%);
                transition: transform ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(overlay);
        }

        // Play transition sound
        this.playTransitionSound();

        // Slide in from left
        overlay.style.transform = 'translateX(0)';

        setTimeout(() => {
            // Slide out to right
            overlay.style.transform = 'translateX(100%)';

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                onComplete();
            }, this.duration);
        }, this.duration);
    }

    /**
     * Update transition progress (called during transition)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.inProgress) {
            return;
        }

        const elapsed = Date.now() - this.startTime;
        this.progress = Math.min(1, elapsed / this.duration);

        if (this.onProgress) {
            this.onProgress(this.progress);
        }

        if (this.progress >= 1) {
            this.inProgress = false;
        }
    }

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        this.loading = true;
        this.loadingProgress = 0;

        // Create or update loading screen
        let loadingScreen = document.getElementById('room-loading-screen');
        if (!loadingScreen) {
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'room-loading-screen';
            loadingScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%);
                color: #ffffff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: 'Courier New', monospace;
            `;
            document.body.appendChild(loadingScreen);
        }

        // Enhanced loading UI with animations
        loadingScreen.innerHTML = `
            <div style="
                font-size: 32px; 
                margin-bottom: 30px;
                text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
                animation: pulse 2s ease-in-out infinite;
            ">${message}</div>
            <div style="
                width: 400px; 
                height: 6px; 
                background: rgba(0, 255, 255, 0.2); 
                border-radius: 3px; 
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">
                <div id="loading-progress-bar" style="
                    width: 0%; 
                    height: 100%; 
                    background: linear-gradient(90deg, #00ffff 0%, #ff00ff 100%);
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 10px #00ffff;
                "></div>
            </div>
            <div id="loading-percentage" style="
                margin-top: 15px;
                font-size: 18px;
                color: #88ccff;
            ">0%</div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            </style>
        `;
    }

    /**
     * Update loading progress
     * @param {number} progress - Progress from 0 to 1
     */
    updateLoadingProgress(progress) {
        this.loadingProgress = Math.max(0, Math.min(1, progress));

        const progressBar = document.getElementById('loading-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${this.loadingProgress * 100}%`;
        }

        // Update percentage display
        const percentageDisplay = document.getElementById('loading-percentage');
        if (percentageDisplay) {
            percentageDisplay.textContent = `${Math.round(this.loadingProgress * 100)}%`;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.loading = false;
        this.loadingProgress = 0;

        const loadingScreen = document.getElementById('room-loading-screen');
        if (loadingScreen && loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
        }
    }

    /**
     * Check if transition is in progress
     * @returns {boolean} True if transitioning
     */
    isInProgress() {
        return this.inProgress;
    }

    /**
     * Get current progress
     * @returns {number} Progress from 0 to 1
     */
    getProgress() {
        return this.progress;
    }
}
