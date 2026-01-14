/**
 * ReplayRecordingIndicator - Visual indicator for replay recording
 *
 * Shows recording status, time, and frame count
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class ReplayRecordingIndicator {
    /**
     * Create a new ReplayRecordingIndicator
     * @param {ReplaySystem} replaySystem - ReplaySystem instance
     */
    constructor(replaySystem = null) {
        this.replaySystem = replaySystem;
        this.isVisible = false;

        // Recording state
        this.recording = false;
        this.recordingTime = 0;
        this.frameCount = 0;
        this.maxDuration = 30; // seconds

        // UI elements
        this.container = null;
        this.statusDot = null;
        this.timeDisplay = null;
        this.frameDisplay = null;
        this.statusText = null;

        // Animation
        this.pulseAnimation = null;

        // Create UI
        this.createUI();

        // Listen to replay system events if available
        this.setupEventListeners();
    }

    /**
     * Set ReplaySystem instance
     * @param {ReplaySystem} replaySystem - ReplaySystem instance
     */
    setReplaySystem(replaySystem) {
        this.replaySystem = replaySystem;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        if (!this.replaySystem) {
            return;
        }

        // Listen for recording state changes
        // Note: ReplaySystem will need to emit events, we'll add that
        if (typeof window !== 'undefined' && window.addEventListener) {
            // Listen for custom events from ReplaySystem
            window.addEventListener('replayRecordingStarted', () => {
                this.startRecording();
            });

            window.addEventListener('replayRecordingStopped', () => {
                this.stopRecording();
            });
        }
    }

    /**
     * Create UI elements
     * @private
     */
    createUI() {
        if (typeof document === 'undefined' || !document.body) {
            setTimeout(() => this.createUI(), 100);
            return;
        }

        const hud = document.getElementById('hud');
        if (!hud) {
            setTimeout(() => this.createUI(), 100);
            return;
        }

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'replay-recording-indicator';
        this.container.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid #ff0000;
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px 12px;
            display: none;
            z-index: 1000;
            font-family: monospace;
            font-size: 11px;
            color: ${DESIGN_SYSTEM.colors.text};
            min-width: 150px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        // Status dot (pulsing red dot)
        const statusContainer = document.createElement('div');
        statusContainer.style.cssText =
            'display: flex; align-items: center; gap: 8px; margin-bottom: 4px;';

        this.statusDot = document.createElement('div');
        this.statusDot.style.cssText = `
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ff0000;
            box-shadow: 0 0 10px #ff0000;
        `;
        statusContainer.appendChild(this.statusDot);

        this.statusText = document.createElement('span');
        this.statusText.textContent = 'RECORDING';
        this.statusText.style.cssText = 'color: #ff0000; font-weight: bold;';
        statusContainer.appendChild(this.statusText);

        this.container.appendChild(statusContainer);

        // Time display
        this.timeDisplay = document.createElement('div');
        this.timeDisplay.id = 'replay-time';
        this.timeDisplay.textContent = '00:00';
        this.timeDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            margin-bottom: 2px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.container.appendChild(this.timeDisplay);

        // Frame count display
        this.frameDisplay = document.createElement('div');
        this.frameDisplay.id = 'replay-frames';
        this.frameDisplay.textContent = 'Frames: 0';
        this.frameDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.6;
            font-size: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.container.appendChild(this.frameDisplay);

        // Max duration display
        const maxDurationDisplay = document.createElement('div');
        maxDurationDisplay.id = 'replay-max-duration';
        maxDurationDisplay.textContent = 'Max: 30s';
        maxDurationDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.5;
            font-size: 9px;
            margin-top: 2px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.container.appendChild(maxDurationDisplay);

        hud.appendChild(this.container);

        // Start pulse animation
        this.startPulseAnimation();
    }

    /**
     * Start pulse animation
     * @private
     */
    startPulseAnimation() {
        if (!this.statusDot) {
            return;
        }

        // CSS animation for pulsing
        const style = document.createElement('style');
        style.id = 'replay-indicator-styles';
        if (!document.getElementById('replay-indicator-styles')) {
            style.textContent = `
                @keyframes replayPulse {
                    0%, 100% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.statusDot.style.animation = 'replayPulse 1s ease-in-out infinite';
    }

    /**
     * Start recording indicator
     */
    startRecording() {
        this.recording = true;
        this.recordingTime = 0;
        this.frameCount = 0;
        this.show();
    }

    /**
     * Stop recording indicator
     */
    stopRecording() {
        this.recording = false;
        // Keep showing for a moment, then hide
        setTimeout(() => {
            if (!this.recording) {
                this.hide();
            }
        }, 2000);
    }

    /**
     * Update indicator (called each frame)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.recording || !this.isVisible) {
            return;
        }

        // Update from ReplaySystem if available
        if (this.replaySystem) {
            this.recording = this.replaySystem.isRecording;
            if (this.replaySystem.isRecording) {
                this.recordingTime =
                    (performance.now() - this.replaySystem.recordingStartTime) / 1000;
                this.frameCount = this.replaySystem.recordedFrames.length;
                this.maxDuration = this.replaySystem.maxRecordingDuration || 30;
            }
        }

        // Update time display
        if (this.timeDisplay) {
            const minutes = Math.floor(this.recordingTime / 60);
            const seconds = Math.floor(this.recordingTime % 60);
            this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Color code based on remaining time
            const remaining = this.maxDuration - this.recordingTime;
            if (remaining < 5) {
                this.timeDisplay.style.color = '#ff0000';
            } else if (remaining < 10) {
                this.timeDisplay.style.color = '#ffff00';
            } else {
                this.timeDisplay.style.color = '#ffffff';
            }
        }

        // Update frame count
        if (this.frameDisplay) {
            this.frameDisplay.textContent = `Frames: ${this.frameCount}`;
        }

        // Update status
        if (this.statusText) {
            if (this.recording) {
                this.statusText.textContent = 'RECORDING';
                this.statusText.style.color = '#ff0000';
                if (this.statusDot) {
                    this.statusDot.style.background = '#ff0000';
                }
            } else {
                this.statusText.textContent = 'STOPPED';
                this.statusText.style.color = '#888';
                if (this.statusDot) {
                    this.statusDot.style.background = '#888';
                    this.statusDot.style.animation = 'none';
                }
            }
        }
    }

    /**
     * Show indicator
     */
    show() {
        this.isVisible = true;
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Hide indicator
     */
    hide() {
        this.isVisible = false;
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Toggle indicator visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
