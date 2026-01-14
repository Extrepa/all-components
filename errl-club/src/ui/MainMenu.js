/**
 * MainMenu - Main menu overlay with Errl Club neon theme
 * Shows loading progress during initialization, then displays "Start Game" button
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class MainMenu {
    constructor() {
        this.container = null;
        this.progressBar = null;
        this.progressBarContainer = null;
        this.progressText = null;
        this.readyButton = null;
        this.particles = [];
        this.onReadyCallback = null;
        this.isReady = false;
        this.currentProgress = 0; // Track current progress to prevent downgrades
        this.create();
    }

    /**
     * Set callback for when ready button is clicked
     * @param {Function} callback - Callback function
     */
    setOnReady(callback) {
        this.onReadyCallback = callback;
    }

    /**
     * Create main menu UI
     */
    create() {
        // Add styles to head if not already added
        if (!document.getElementById('main-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'main-menu-styles';
            style.textContent = `
                @keyframes loadingPulse {
                    0%, 100% {
                        opacity: 1;
                        text-shadow: 
                            0 0 20px rgba(0, 255, 255, 0.8),
                            0 0 40px rgba(0, 255, 255, 0.5),
                            0 0 60px rgba(255, 0, 255, 0.3);
                    }
                    50% {
                        opacity: 0.8;
                        text-shadow: 
                            0 0 30px rgba(0, 255, 255, 1.0),
                            0 0 60px rgba(0, 255, 255, 0.7),
                            0 0 90px rgba(255, 0, 255, 0.5);
                    }
                }
                
                @keyframes buttonFill {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 100% 50%;
                    }
                }
                
                @keyframes buttonReady {
                    0% {
                        transform: scale(1);
                        box-shadow: 
                            0 0 20px rgba(0, 255, 255, 0.6),
                            0 0 40px rgba(255, 0, 255, 0.4),
                            inset 0 0 20px rgba(255, 255, 255, 0.2);
                    }
                    50% {
                        transform: scale(1.02);
                        box-shadow: 
                            0 0 30px rgba(0, 255, 255, 0.9),
                            0 0 60px rgba(255, 0, 255, 0.7),
                            inset 0 0 30px rgba(255, 255, 255, 0.3);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 
                            0 0 20px rgba(0, 255, 255, 0.6),
                            0 0 40px rgba(255, 0, 255, 0.4),
                            inset 0 0 20px rgba(255, 255, 255, 0.2);
                    }
                }
                
                @keyframes progressComplete {
                    0% {
                        box-shadow: 
                            0 0 10px rgba(0, 255, 255, 0.6),
                            0 0 20px rgba(255, 0, 255, 0.4);
                    }
                    50% {
                        box-shadow: 
                            0 0 20px rgba(0, 255, 255, 1.0),
                            0 0 40px rgba(255, 0, 255, 0.8),
                            0 0 60px rgba(0, 255, 255, 0.4);
                    }
                    100% {
                        box-shadow: 
                            0 0 10px rgba(0, 255, 255, 0.6),
                            0 0 20px rgba(255, 0, 255, 0.4);
                    }
                }
                
                @keyframes loadingShimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                
                @keyframes loadingFloat {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                @keyframes loadingParticle {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.container = document.createElement('div');
        this.container.id = 'main-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, #1a0a1a 0%, #0a0a0a 50%, #000000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            pointer-events: none;
            overflow: hidden;
        `;

        // Animated background particles
        this.createParticles();

        // Main content container
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: loadingFloat 3s ease-in-out infinite;
            width: 100%;
            max-width: 1200px;
            padding: 20px;
            box-sizing: border-box;
        `;

        // Title with enhanced neon effect
        const title = document.createElement('h1');
        title.textContent = 'ERRL CLUB';
        title.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.title};
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            text-shadow: 
                0 0 20px rgba(0, 255, 255, 0.8),
                0 0 40px rgba(0, 255, 255, 0.6),
                0 0 60px rgba(255, 0, 255, 0.4),
                0 0 80px rgba(0, 255, 255, 0.2);
            margin: 0 0 ${DESIGN_SYSTEM.spacing.margin} 0;
            animation: loadingPulse 2s ease-in-out infinite;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            text-align: center;
            line-height: 1.2;
        `;

        // Subtitle - same style as title
        const subtitle = document.createElement('div');
        subtitle.textContent = 'SIMULATOR';
        subtitle.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.title};
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            text-shadow: 
                0 0 20px rgba(0, 255, 255, 0.8),
                0 0 40px rgba(0, 255, 255, 0.6),
                0 0 60px rgba(255, 0, 255, 0.4),
                0 0 80px rgba(0, 255, 255, 0.2);
            margin: 0 0 60px 0;
            animation: loadingPulse 2s ease-in-out infinite;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            text-align: center;
            line-height: 1.2;
        `;

        // Progress bar container (will be hidden when progress reaches 100%)
        this.progressBarContainer = document.createElement('div');
        this.progressBarContainer.style.cssText = `
            width: 500px;
            max-width: 85%;
            margin: 40px 0 ${DESIGN_SYSTEM.spacing.margin} 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        // Progress bar with glow (chunkier/dramatic)
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 100%;
            height: 12px;
            background: rgba(0, 0, 0, 0.5);
            border: ${DESIGN_SYSTEM.borders.width} solid rgba(0, 255, 255, 0.3);
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            overflow: hidden;
            margin-bottom: ${DESIGN_SYSTEM.spacing.gap};
            box-shadow: 
                0 0 10px rgba(0, 255, 255, 0.3),
                inset 0 0 10px rgba(0, 0, 0, 0.5);
        `;

        const progressFill = document.createElement('div');
        progressFill.id = 'loading-progress-fill';
        progressFill.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, 
                rgba(0, 255, 255, 0.8) 0%,
                rgba(255, 0, 255, 1.0) 50%,
                rgba(0, 255, 255, 0.8) 100%);
            background-size: 200% 100%;
            animation: loadingShimmer 2s linear infinite;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 0 10px rgba(0, 255, 255, 0.6),
                0 0 20px rgba(255, 0, 255, 0.4);
        `;

        this.progressBar.appendChild(progressFill);

        // Progress text with enhanced styling
        this.progressText = document.createElement('div');
        this.progressText.id = 'loading-progress-text';
        this.progressText.textContent = 'Initializing...';
        this.progressText.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: clamp(0.875rem, 1.5vw, 1rem);
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            text-shadow: 
                0 0 10px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(0, 255, 255, 0.3);
            font-weight: 500;
            margin-top: ${DESIGN_SYSTEM.spacing.gap};
            margin-bottom: ${DESIGN_SYSTEM.spacing.gap};
            transition: opacity 0.3s ease-in-out;
            width: 100%;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        this.progressBarContainer.appendChild(this.progressBar);
        this.progressBarContainer.appendChild(this.progressText);

        // Ready button container (positioned right under progress bar)
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: center;
            width: 500px;
            max-width: 85%;
            margin-top: 0px;
        `;

        // Ready button (initially hidden, will show at 100%)
        this.readyButton = document.createElement('button');
        this.readyButton.textContent = 'PREPARING GAME...';
        this.readyButton.setAttribute('aria-label', 'Preparing game, please wait');
        this.readyButton.setAttribute('aria-disabled', 'true');
        this.readyButton.style.cssText = `
            width: 50%;
            padding: ${DESIGN_SYSTEM.spacing.padding} 24px;
            font-size: clamp(0.9rem, 1.5vw, 1.1rem);
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(0, 255, 255, 0.5);
            background: transparent;
            border: ${DESIGN_SYSTEM.borders.width} solid rgba(0, 255, 255, 0.3);
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0;
            display: none;
            transform: translateY(0px);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: none;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            text-shadow: none;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
            outline: none;
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        `;

        // Button hover effects
        this.readyButton.addEventListener('mouseenter', () => {
            if (!this.isReady) {
                return;
            }
            this.readyButton.style.transform = 'translateY(-2px) scale(1.05)';
            this.readyButton.style.boxShadow = `
                0 0 30px rgba(0, 255, 255, 0.8),
                0 0 60px rgba(255, 0, 255, 0.6),
                inset 0 0 30px rgba(255, 255, 255, 0.3);
            `;
        });

        this.readyButton.addEventListener('mouseleave', () => {
            if (!this.isReady) {
                return;
            }
            this.readyButton.style.transform = 'translateY(0px) scale(1)';
            this.readyButton.style.boxShadow = `
                0 0 20px rgba(0, 255, 255, 0.6),
                0 0 40px rgba(255, 0, 255, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.2);
            `;
        });

        // Button active/press effect
        this.readyButton.addEventListener('mousedown', () => {
            if (!this.isReady) {
                return;
            }
            this.readyButton.style.transform = 'translateY(0px) scale(0.98)';
        });

        this.readyButton.addEventListener('mouseup', () => {
            if (!this.isReady) {
                return;
            }
            this.readyButton.style.transform = 'translateY(-2px) scale(1.05)';
        });

        // Button click handler
        this.readyButton.addEventListener('click', () => {
            if (!this.isReady) {
                return;
            }
            this.handleReady();
        });

        // Also allow Enter key to press ready (store reference for cleanup)
        this.keydownHandler = (e) => {
            if (this.isReady && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.handleReady();
            }
        };
        document.addEventListener('keydown', this.keydownHandler);

        buttonContainer.appendChild(this.readyButton);

        contentContainer.appendChild(title);
        contentContainer.appendChild(subtitle);
        contentContainer.appendChild(this.progressBarContainer);
        contentContainer.appendChild(buttonContainer);

        this.container.appendChild(contentContainer);

        // Portal button placeholder (bottom left) - matches avatar bubble size and style
        const portalButton = document.createElement('button');
        portalButton.id = 'main-menu-portal-button';
        portalButton.setAttribute('aria-label', 'Portal (Coming soon)');
        portalButton.setAttribute('aria-disabled', 'true');
        portalButton.setAttribute('tabindex', '-1');
        // Use a muted purple color that matches the theme but looks disabled
        const portalR = 128;
        const portalG = 0;
        const portalB = 255;
        portalButton.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(${portalR}, ${portalG}, ${portalB}, 0.7);
            border: 2px solid rgba(${portalR}, ${portalG}, ${portalB}, 0.8);
            box-shadow: 
                0 0 15px rgba(${portalR}, ${portalG}, ${portalB}, 0.8),
                0 0 30px rgba(${portalR}, ${portalG}, ${portalB}, 0.4),
                inset 0 0 10px rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.6;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            outline: none;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        // Add a placeholder icon (simple portal/globe icon)
        const portalIcon = document.createElement('div');
        portalIcon.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.1);
            position: relative;
            pointer-events: none;
        `;
        // Add a simple portal effect (two curved lines)
        const portalLine1 = document.createElement('div');
        portalLine1.style.cssText = `
            position: absolute;
            top: 6px;
            left: 6px;
            width: 12px;
            height: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
        `;
        const portalLine2 = document.createElement('div');
        portalLine2.style.cssText = `
            position: absolute;
            top: 8px;
            left: 8px;
            width: 8px;
            height: 8px;
            border: 1px solid rgba(0, 255, 255, 0.4);
            border-radius: 50%;
            pointer-events: none;
        `;
        portalIcon.appendChild(portalLine1);
        portalIcon.appendChild(portalLine2);
        portalButton.appendChild(portalIcon);

        this.container.appendChild(portalButton);

        document.body.appendChild(this.container);
    }

    /**
     * Handle ready button click
     */
    handleReady() {
        if (!this.isReady) {
            return;
        }

        // Animate button press with feedback
        this.readyButton.style.transform = 'translateY(2px) scale(0.95)';
        this.readyButton.style.transition = 'all 0.1s ease-out';

        // Add a ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

        // Add ripple animation if not already in styles
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.readyButton.appendChild(ripple);

        setTimeout(() => {
            this.readyButton.style.transform = 'translateY(0px) scale(1)';
            ripple.remove();
        }, 100);

        // Call callback if set - this will start the game loop
        if (this.onReadyCallback) {
            this.onReadyCallback();
        }

        // Change button text to indicate game is starting
        this.readyButton.textContent = 'STARTING...';
        this.readyButton.style.cursor = 'wait';
        this.readyButton.style.pointerEvents = 'none';

        // Don't hide automatically - wait for explicit dismissal or game loop confirmation
        // The main menu will be hidden by the game once it's confirmed running
    }

    /**
     * Create animated background particles
     */
    createParticles() {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;
            const left = Math.random() * 100;
            const color = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${left}%;
                bottom: -10px;
                opacity: 0.6;
                box-shadow: 
                    0 0 ${size * 2}px ${color},
                    0 0 ${size * 4}px ${color};
                animation: loadingParticle ${duration}s linear infinite;
                animation-delay: ${delay}s;
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    /**
     * Update loading progress
     * @param {number} progress - Progress from 0 to 1
     * @param {string} message - Status message
     */
    updateProgress(progress, message = '') {
        // Prevent downgrading progress - once we reach 100%, don't go backwards
        if (this.currentProgress >= 1.0 && progress < 1.0) {
            // Silently ignore updates that would downgrade from 100%
            return;
        }

        // Update current progress
        this.currentProgress = Math.max(this.currentProgress, progress);

        const currentPercent = this.currentProgress * 100;

        // When progress < 100%: Show progress bar and text, hide button
        if (currentPercent < 100) {
            // Show progress bar container
            if (this.progressBarContainer) {
                this.progressBarContainer.style.display = 'flex';
            }

            // Update progress bar fill
            if (this.progressBar) {
                const fill = this.progressBar.querySelector('#loading-progress-fill');
                if (fill) {
                    const percentage = Math.min(100, Math.max(0, this.currentProgress * 100));
                    fill.style.width = `${percentage}%`;
                    fill.offsetHeight; // Force reflow

                    // Add glow effect as progress increases
                    const glowIntensity = percentage / 100;
                    fill.style.boxShadow = `
                        0 0 ${10 + glowIntensity * 10}px rgba(0, 255, 255, ${0.6 + glowIntensity * 0.4}),
                        0 0 ${20 + glowIntensity * 20}px rgba(255, 0, 255, ${0.4 + glowIntensity * 0.3})
                    `;
                }
            }

            // Show progress text
            if (this.progressText && message && this.currentProgress >= progress) {
                this.progressText.style.transition = 'opacity 0.3s ease-in-out';
                this.progressText.style.opacity = '1';
                this.progressText.textContent = message.toUpperCase();
            }

            // Hide button
            if (this.readyButton) {
                this.readyButton.style.display = 'none';
                this.readyButton.style.opacity = '0';
            }
        } else {
            // When progress = 100%: Hide progress bar and text, show button
            // Hide progress bar container completely
            if (this.progressBarContainer) {
                this.progressBarContainer.style.display = 'none';
            }

            // Hide progress text
            if (this.progressText) {
                this.progressText.style.transition = 'opacity 0.3s ease-in-out';
                this.progressText.style.opacity = '0';
                setTimeout(() => {
                    if (this.progressText) {
                        this.progressText.textContent = '';
                    }
                }, 300);
            }

            // Show ready button when progress reaches 100% (only once)
            if (this.readyButton && !this.isReady) {
                this.showReadyButton();
            }
        }
    }

    /**
     * Show ready button (fill it and enable it, change text to "Start Game")
     */
    showReadyButton() {
        if (this.isReady) {
            return;
        }

        this.isReady = true;

        // Fill it with gradient and enable it, change text to "Start Game"
        setTimeout(() => {
            if (this.readyButton) {
                // Change text to "Start Game" with smooth transition
                this.readyButton.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                this.readyButton.textContent = 'Start Game';
                this.readyButton.style.textTransform = 'uppercase';
                this.readyButton.style.letterSpacing = '0.1em';
                this.readyButton.style.fontWeight = '900';
                // Set button width
                this.readyButton.style.width = '50%';
                this.readyButton.style.minWidth = '300px';
                // Keep the same padding and size
                this.readyButton.style.padding = `${DESIGN_SYSTEM.spacing.padding} 24px`;
                this.readyButton.style.fontSize = 'clamp(0.9rem, 1.5vw, 1.1rem)';
                this.readyButton.style.fontFamily = DESIGN_SYSTEM.typography.fontFamily;

                // Fill it with gradient and enable it (smooth transition)
                this.readyButton.style.color = '#000000';
                this.readyButton.style.background = `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.accent} 0%, #ff00ff 100%)`;
                this.readyButton.style.backgroundSize = '200% 100%';
                this.readyButton.style.border = `${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border}`;
                this.readyButton.style.cursor = 'pointer';
                this.readyButton.style.pointerEvents = 'auto';
                this.readyButton.style.boxShadow = `
                    0 0 20px rgba(0, 255, 255, 0.6),
                    0 0 40px rgba(255, 0, 255, 0.4),
                    inset 0 0 20px rgba(255, 255, 255, 0.2)
                `;
                this.readyButton.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

                // Update accessibility attributes
                this.readyButton.setAttribute('aria-label', 'Start game');
                this.readyButton.setAttribute('aria-disabled', 'false');
                this.readyButton.setAttribute('tabindex', '0');

                // Add animated gradient fill effect
                this.readyButton.style.animation =
                    'buttonFill 3s ease-in-out infinite, buttonReady 2s ease-in-out infinite';

                // Show button
                this.readyButton.style.display = 'block';
                this.readyButton.style.opacity = '1';

                // Add a subtle scale pulse to draw attention
                setTimeout(() => {
                    this.readyButton.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.readyButton.style.transform = 'scale(1)';
                    }, 200);
                }, 100);

                // Focus the button for keyboard accessibility
                this.readyButton.focus();
            }
        }, 200);
    }

    /**
     * Show error message on main menu
     * @param {Error|string} error - Error object or error message
     */
    showError(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';

        // Hide progress elements
        if (this.progressBar) {
            this.progressBar.style.opacity = '0.3';
        }
        if (this.progressText) {
            this.progressText.style.opacity = '0';
        }
        if (this.readyButton) {
            this.readyButton.style.opacity = '0';
            this.readyButton.style.pointerEvents = 'none';
        }

        // Create or update error container
        let errorContainer = document.getElementById('main-menu-error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'main-menu-error-container';
            errorContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 600px;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid rgba(255, 0, 0, 0.8);
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: ${DESIGN_SYSTEM.spacing.padding};
                box-shadow: 
                    0 0 30px rgba(255, 0, 0, 0.6),
                    0 0 60px rgba(255, 0, 0, 0.4),
                    inset 0 0 20px rgba(255, 0, 0, 0.2);
                z-index: 10002;
                text-align: center;
            `;
            this.container.appendChild(errorContainer);
        }

        // Error title
        let errorTitle = errorContainer.querySelector('.error-title');
        if (!errorTitle) {
            errorTitle = document.createElement('h2');
            errorTitle.className = 'error-title';
            errorTitle.textContent = '⚠️ INITIALIZATION ERROR';
            errorTitle.style.cssText = `
                color: #ff0000;
                font-size: clamp(1.5rem, 4vw, 2.5rem);
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                text-shadow: 
                    0 0 20px rgba(255, 0, 0, 0.8),
                    0 0 40px rgba(255, 0, 0, 0.6);
                margin: 0 0 20px 0;
                font-family: 'Arial Black', 'Arial Bold', sans-serif;
            `;
            errorContainer.appendChild(errorTitle);
        }

        // Error message
        let errorMessageEl = errorContainer.querySelector('.error-message');
        if (!errorMessageEl) {
            errorMessageEl = document.createElement('div');
            errorMessageEl.className = 'error-message';
            errorMessageEl.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-size: clamp(0.875rem, 2vw, 1.125rem);
                line-height: 1.6;
                margin: 0 0 15px 0;
                word-wrap: break-word;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            errorContainer.appendChild(errorMessageEl);
        }
        errorMessageEl.textContent = errorMessage;

        // Error details (stack trace) - collapsible
        let errorDetails = errorContainer.querySelector('.error-details');
        if (!errorDetails) {
            errorDetails = document.createElement('details');
            errorDetails.className = 'error-details';
            errorDetails.style.cssText = `
                margin-top: 15px;
                text-align: left;
            `;

            const summary = document.createElement('summary');
            summary.textContent = 'Show technical details';
            summary.style.cssText = `
                color: #ff8888;
                cursor: pointer;
                font-size: 0.875rem;
                margin-bottom: 10px;
                user-select: none;
            `;
            errorDetails.appendChild(summary);

            const pre = document.createElement('pre');
            pre.className = 'error-stack';
            pre.style.cssText = `
                color: #cccccc;
                font-size: 0.75rem;
                background: rgba(0, 0, 0, 0.5);
                padding: 15px;
                border-radius: 4px;
                overflow-x: auto;
                max-height: 200px;
                overflow-y: auto;
                margin: 0;
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
                word-wrap: break-word;
            `;
            errorDetails.appendChild(pre);
            errorContainer.appendChild(errorDetails);
        }

        const stackPre = errorDetails.querySelector('.error-stack');
        if (stackPre) {
            stackPre.textContent = errorStack || 'No stack trace available';
        }

        // Instructions
        let instructions = errorContainer.querySelector('.error-instructions');
        if (!instructions) {
            instructions = document.createElement('div');
            instructions.className = 'error-instructions';
            instructions.style.cssText = `
                color: #ffaaaa;
                font-size: clamp(0.75rem, 1.5vw, 0.875rem);
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 0, 0, 0.3);
            `;
            instructions.innerHTML = `
                <p style="margin: 0 0 10px 0;">Please check the browser console for more details.</p>
                <p style="margin: 0;">Try refreshing the page. If the error persists, please report it.</p>
            `;
            errorContainer.appendChild(instructions);
        }

        // Make error container visible
        errorContainer.style.display = 'block';
    }

    /**
     * Hide main menu with enhanced fade out
     */
    hide() {
        console.log('MainMenu: hide() called', {
            hasContainer: !!this.container,
            containerId: this.container ? this.container.id : null,
        });

        // Try to get container by ID if this.container is null
        if (!this.container) {
            this.container = document.getElementById('main-menu');
            if (this.container) {
                console.log('MainMenu: Recovered container from DOM by ID');
            }
        }

        if (this.container) {
            console.log('MainMenu: Hiding main menu');

            // Immediately disable pointer events to prevent blocking interaction
            this.container.style.pointerEvents = 'none';

            // Fade out all elements
            const content = this.container.querySelector('div[style*="animation: loadingFloat"]');
            if (content) {
                content.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                content.style.opacity = '0';
                content.style.transform = 'translateY(-20px)';
            }

            // Fade out particles
            this.particles.forEach((particle) => {
                particle.style.transition = 'opacity 0.4s ease-out';
                particle.style.opacity = '0';
            });

            // Fade out container
            this.container.style.transition = 'opacity 0.8s ease-out';
            this.container.style.opacity = '0';

            // Remove after fade completes, ensuring display: none is set
            setTimeout(() => {
                if (this.container) {
                    // Ensure display is set to none
                    this.container.style.display = 'none';
                    console.log('MainMenu: Fade complete, removing from DOM');
                    this.remove();
                }
            }, 800);

            // Fallback: Force remove if still visible after a longer delay
            setTimeout(() => {
                const mainMenuElement = document.getElementById('main-menu');
                if (mainMenuElement && mainMenuElement.parentNode) {
                    console.warn('MainMenu: Fallback removal triggered - menu was still visible');
                    mainMenuElement.style.display = 'none';
                    mainMenuElement.style.pointerEvents = 'none';
                    mainMenuElement.parentNode.removeChild(mainMenuElement);
                }
            }, 2000);
        } else {
            console.warn('MainMenu: hide() called but container is null');
        }
    }

    /**
     * Remove main menu immediately
     */
    remove() {
        // Clean up keyboard event listener
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        // Remove portal button if it exists
        const portalButton = document.getElementById('main-menu-portal-button');
        if (portalButton && portalButton.parentNode) {
            portalButton.parentNode.removeChild(portalButton);
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.particles = [];
        this.readyButton = null;
        this.progressBar = null;
        this.progressBarContainer = null;
        this.progressText = null;
    }
}
