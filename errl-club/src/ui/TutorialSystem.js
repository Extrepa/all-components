/**
 * TutorialSystem - Manages tutorial flow and progression
 *
 * Handles step-by-step tutorials, completion tracking, and tutorial state
 */
import { TutorialOverlay } from './TutorialOverlay.js';
import { TUTORIALS } from '../config/tutorials.js';

export class TutorialSystem {
    /**
     * Create a new TutorialSystem
     * @param {Object} config - Configuration
     * @param {Object} config.systems - Game systems object
     * @param {Object} config.settingsManager - SettingsManager instance
     */
    constructor(config = {}) {
        this.systems = config.systems || {};
        this.settingsManager = config.settingsManager;

        // Tutorial state
        this.currentTutorial = null;
        this.currentStepIndex = 0;
        this.completedTutorials = new Set();
        this.tutorialOverlay = null;

        // Load completed tutorials from persistence
        this.loadCompletedTutorials();

        // Create tutorial overlay
        this.tutorialOverlay = new TutorialOverlay({
            onNext: () => this.nextStep(),
            onPrevious: () => this.previousStep(),
            onSkip: () => this.skipTutorial(),
            onComplete: () => this.completeTutorial(),
        });
    }

    /**
     * Check if tutorial has been completed
     * @param {string} tutorialId - Tutorial ID
     * @returns {boolean} True if completed
     */
    isTutorialCompleted(tutorialId) {
        return this.completedTutorials.has(tutorialId);
    }

    /**
     * Check if this is first time playing
     * @returns {boolean} True if first time
     */
    isFirstTimePlayer() {
        // Check if any tutorial has been completed
        return this.completedTutorials.size === 0;
    }

    /**
     * Start a tutorial
     * @param {string} tutorialId - Tutorial ID
     * @returns {boolean} True if tutorial started
     */
    startTutorial(tutorialId) {
        const tutorial = TUTORIALS[tutorialId];
        if (!tutorial) {
            console.warn('TutorialSystem: Tutorial not found:', tutorialId);
            return false;
        }

        // Don't restart if already completed (unless forced)
        if (this.isTutorialCompleted(tutorialId) && !tutorial.allowReplay) {
            return false;
        }

        this.currentTutorial = tutorial;
        this.currentStepIndex = 0;

        // Show first step
        this.showCurrentStep();

        return true;
    }

    /**
     * Start first-time player tutorial
     * @returns {boolean} True if started
     */
    startFirstTimeTutorial() {
        if (!this.isFirstTimePlayer()) {
            return false;
        }

        // Start the main tutorial
        return this.startTutorial('firstTime');
    }

    /**
     * Show current tutorial step
     * @private
     */
    showCurrentStep() {
        if (!this.currentTutorial || !this.tutorialOverlay) {
            return;
        }

        const step = this.currentTutorial.steps[this.currentStepIndex];
        if (!step) {
            this.completeTutorial();
            return;
        }

        this.tutorialOverlay.showStep({
            title: step.title,
            description: step.description,
            instructions: step.instructions,
            highlight: step.highlight, // Element to highlight
            position: step.position, // Overlay position
            stepNumber: this.currentStepIndex + 1,
            totalSteps: this.currentTutorial.steps.length,
            canSkip: this.currentTutorial.allowSkip !== false,
        });
    }

    /**
     * Move to next step
     */
    nextStep() {
        if (!this.currentTutorial) {
            return;
        }

        this.currentStepIndex++;

        if (this.currentStepIndex >= this.currentTutorial.steps.length) {
            this.completeTutorial();
        } else {
            this.showCurrentStep();
        }
    }

    /**
     * Move to previous step
     */
    previousStep() {
        if (!this.currentTutorial) {
            return;
        }

        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.showCurrentStep();
        }
    }

    /**
     * Skip current tutorial
     */
    skipTutorial() {
        if (!this.currentTutorial) {
            return;
        }

        // Mark as completed (skipped)
        this.completedTutorials.add(this.currentTutorial.id);
        this.saveCompletedTutorials();

        // Hide overlay
        if (this.tutorialOverlay) {
            this.tutorialOverlay.hide();
        }

        this.currentTutorial = null;
        this.currentStepIndex = 0;
    }

    /**
     * Complete current tutorial
     */
    completeTutorial() {
        if (!this.currentTutorial) {
            return;
        }

        // Mark as completed
        this.completedTutorials.add(this.currentTutorial.id);
        this.saveCompletedTutorials();

        // Hide overlay
        if (this.tutorialOverlay) {
            this.tutorialOverlay.hide();
        }

        // Emit completion event
        if (this.systems.eventBus) {
            this.systems.eventBus.emit('tutorial.completed', {
                tutorialId: this.currentTutorial.id,
            });
        }

        this.currentTutorial = null;
        this.currentStepIndex = 0;
    }

    /**
     * Load completed tutorials from persistence
     * @private
     */
    loadCompletedTutorials() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('tutorials.completed', []);
        if (Array.isArray(saved)) {
            saved.forEach((id) => this.completedTutorials.add(id));
        }
    }

    /**
     * Save completed tutorials to persistence
     * @private
     */
    saveCompletedTutorials() {
        if (!this.settingsManager) {
            return;
        }

        this.settingsManager.setSetting('tutorials.completed', Array.from(this.completedTutorials));
    }

    /**
     * Reset all tutorials (for testing)
     */
    resetTutorials() {
        this.completedTutorials.clear();
        this.saveCompletedTutorials();
    }

    /**
     * Get tutorial progress
     * @param {string} tutorialId - Tutorial ID
     * @returns {Object} Progress object {completed, currentStep, totalSteps}
     */
    getTutorialProgress(tutorialId) {
        const tutorial = TUTORIALS[tutorialId];
        if (!tutorial) {
            return null;
        }

        const completed = this.isTutorialCompleted(tutorialId);
        const isActive = this.currentTutorial?.id === tutorialId;

        return {
            completed,
            currentStep: isActive ? this.currentStepIndex + 1 : 0,
            totalSteps: tutorial.steps.length,
            isActive,
        };
    }
}
