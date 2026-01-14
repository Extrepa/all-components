/**
 * TutorialOverlay - Visual overlay for tutorial steps
 *
 * Displays tutorial instructions, highlights elements, and provides navigation
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class TutorialOverlay {
    /**
     * Create a new TutorialOverlay
     * @param {Object} config - Configuration
     * @param {Function} config.onNext - Next step handler
     * @param {Function} config.onPrevious - Previous step handler
     * @param {Function} config.onSkip - Skip tutorial handler
     * @param {Function} config.onComplete - Complete tutorial handler
     */
    constructor(config = {}) {
        this.onNext = config.onNext || (() => {});
        this.onPrevious = config.onPrevious || (() => {});
        this.onSkip = config.onSkip || (() => {});
        this.onComplete = config.onComplete || (() => {});

        // Overlay state
        this.isVisible = false;
        this.currentStep = null;

        // Create overlay elements
        this.createOverlay();
    }

    /**
     * Create overlay DOM elements
     * @private
     */
    createOverlay() {
        // Main overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            pointer-events: none;
            display: none;
        `;

        // Dark backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            pointer-events: auto;
        `;
        this.overlay.appendChild(this.backdrop);

        // Tutorial panel
        this.panel = document.createElement('div');
        this.panel.style.cssText = `
            position: absolute;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: ${DESIGN_SYSTEM.spacing.padding};
            max-width: 500px;
            color: ${DESIGN_SYSTEM.colors.text};
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            pointer-events: auto;
            box-shadow: ${DESIGN_SYSTEM.shadows.panel};
        `;
        this.overlay.appendChild(this.panel);

        // Title
        this.titleElement = document.createElement('div');
        this.titleElement.style.cssText = `
            font-size: ${DESIGN_SYSTEM.typography.titleSize};
            font-weight: ${DESIGN_SYSTEM.typography.titleWeight};
            color: ${DESIGN_SYSTEM.colors.title};
            margin-bottom: ${DESIGN_SYSTEM.spacing.margin};
        `;
        this.panel.appendChild(this.titleElement);

        // Description
        this.descriptionElement = document.createElement('div');
        this.descriptionElement.style.cssText = `
            font-size: 16px;
            color: ${DESIGN_SYSTEM.colors.text};
            margin-bottom: 16px;
            line-height: 1.5;
        `;
        this.panel.appendChild(this.descriptionElement);

        // Instructions
        this.instructionsElement = document.createElement('div');
        this.instructionsElement.style.cssText = `
            font-size: 14px;
            color: #aaa;
            margin-bottom: 20px;
            padding: 12px;
            background: rgba(0, 255, 255, 0.1);
            border-left: 3px solid ${DESIGN_SYSTEM.colors.border};
            border-radius: 4px;
        `;
        this.panel.appendChild(this.instructionsElement);

        // Step indicator
        this.stepIndicator = document.createElement('div');
        this.stepIndicator.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-bottom: 20px;
            text-align: center;
        `;
        this.panel.appendChild(this.stepIndicator);

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: space-between;
        `;

        // Previous button
        this.prevButton = document.createElement('button');
        this.prevButton.textContent = 'Previous';
        this.prevButton.style.cssText = `
            padding: 10px 20px;
            background: rgba(0, 255, 255, 0.2);
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: 4px;
            color: ${DESIGN_SYSTEM.colors.accent};
            cursor: pointer;
            font-size: 14px;
            flex: 1;
        `;
        this.prevButton.addEventListener('click', () => this.onPrevious());
        this.prevButton.addEventListener('mouseenter', () => {
            this.prevButton.style.background = 'rgba(0, 255, 255, 0.3)';
        });
        this.prevButton.addEventListener('mouseleave', () => {
            this.prevButton.style.background = 'rgba(0, 255, 255, 0.2)';
        });
        buttonsContainer.appendChild(this.prevButton);

        // Next button
        this.nextButton = document.createElement('button');
        this.nextButton.textContent = 'Next';
        this.nextButton.style.cssText = `
            padding: 10px 20px;
            background: rgba(0, 255, 255, 0.3);
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: 4px;
            color: ${DESIGN_SYSTEM.colors.accent};
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            flex: 1;
        `;
        this.nextButton.addEventListener('click', () => this.onNext());
        this.nextButton.addEventListener('mouseenter', () => {
            this.nextButton.style.background = 'rgba(0, 255, 255, 0.4)';
        });
        this.nextButton.addEventListener('mouseleave', () => {
            this.nextButton.style.background = 'rgba(0, 255, 255, 0.3)';
        });
        buttonsContainer.appendChild(this.nextButton);

        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.textContent = 'Skip Tutorial';
        this.skipButton.style.cssText = `
            padding: 10px 20px;
            background: transparent;
            border: 2px solid #888;
            border-radius: 4px;
            color: #888;
            cursor: pointer;
            font-size: 12px;
            margin-top: 8px;
            width: 100%;
        `;
        this.skipButton.addEventListener('click', () => this.onSkip());
        this.skipButton.addEventListener('mouseenter', () => {
            this.skipButton.style.color = '#aaa';
            this.skipButton.style.borderColor = '#aaa';
        });
        this.skipButton.addEventListener('mouseleave', () => {
            this.skipButton.style.color = '#888';
            this.skipButton.style.borderColor = '#888';
        });

        this.panel.appendChild(buttonsContainer);
        this.panel.appendChild(this.skipButton);

        document.body.appendChild(this.overlay);
    }

    /**
     * Show a tutorial step
     * @param {Object} stepData - Step data
     * @param {string} stepData.title - Step title
     * @param {string} stepData.description - Step description
     * @param {string} stepData.instructions - Step instructions
     * @param {string} stepData.highlight - Element selector to highlight
     * @param {Object} stepData.position - Overlay position {x, y}
     * @param {number} stepData.stepNumber - Current step number
     * @param {number} stepData.totalSteps - Total steps
     * @param {boolean} stepData.canSkip - Whether tutorial can be skipped
     */
    showStep(stepData) {
        this.currentStep = stepData;

        // Update content
        this.titleElement.textContent = stepData.title || 'Tutorial';
        this.descriptionElement.textContent = stepData.description || '';
        this.instructionsElement.textContent = stepData.instructions || '';
        this.stepIndicator.textContent = `Step ${stepData.stepNumber} of ${stepData.totalSteps}`;

        // Position panel
        if (stepData.position) {
            if (typeof stepData.position.x === 'string' && stepData.position.x.includes('%')) {
                this.panel.style.left = stepData.position.x;
            } else {
                this.panel.style.left = `${stepData.position.x}px`;
            }
            if (typeof stepData.position.y === 'string' && stepData.position.y.includes('%')) {
                this.panel.style.top = stepData.position.y;
            } else {
                this.panel.style.top = `${stepData.position.y}px`;
            }
            this.panel.style.transform = 'translate(-50%, -50%)';
        } else {
            // Default: center of screen
            this.panel.style.left = '50%';
            this.panel.style.top = '50%';
            this.panel.style.transform = 'translate(-50%, -50%)';
        }

        // Show/hide skip button
        this.skipButton.style.display = stepData.canSkip ? 'block' : 'none';

        // Update button states
        this.prevButton.disabled = stepData.stepNumber === 1;
        this.prevButton.style.opacity = stepData.stepNumber === 1 ? '0.5' : '1';
        this.prevButton.style.cursor = stepData.stepNumber === 1 ? 'not-allowed' : 'pointer';

        // Show overlay
        this.overlay.style.display = 'block';
        this.isVisible = true;

        // Highlight element if specified
        if (stepData.highlight) {
            this.highlightElement(stepData.highlight);
        }
    }

    /**
     * Highlight an element
     * @param {string} selector - CSS selector or element reference
     * @private
     */
    highlightElement(selector) {
        // Remove previous highlight
        this.removeHighlight();

        let element = null;
        if (typeof selector === 'string') {
            element = document.querySelector(selector);
        } else if (selector instanceof HTMLElement) {
            element = selector;
        }

        if (element) {
            // Create highlight effect
            const rect = element.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.id = 'tutorial-highlight';
            highlight.style.cssText = `
                position: fixed;
                left: ${rect.left}px;
                top: ${rect.top}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                border: 3px solid ${DESIGN_SYSTEM.colors.border};
                border-radius: 4px;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                pointer-events: none;
                z-index: 9999;
                animation: tutorialPulse 2s infinite;
            `;

            // Add pulse animation
            if (!document.getElementById('tutorial-animations')) {
                const style = document.createElement('style');
                style.id = 'tutorial-animations';
                style.textContent = `
                    @keyframes tutorialPulse {
                        0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
                        50% { box-shadow: 0 0 30px rgba(0, 255, 255, 1); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(highlight);
            this.highlightElement = highlight;
        }
    }

    /**
     * Remove highlight
     * @private
     */
    removeHighlight() {
        if (this.highlightElement && this.highlightElement.parentNode) {
            this.highlightElement.parentNode.removeChild(this.highlightElement);
            this.highlightElement = null;
        }
    }

    /**
     * Hide the overlay
     */
    hide() {
        this.overlay.style.display = 'none';
        this.isVisible = false;
        this.removeHighlight();
        this.currentStep = null;
    }

    /**
     * Destroy the overlay
     */
    destroy() {
        this.removeHighlight();
        if (this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}
