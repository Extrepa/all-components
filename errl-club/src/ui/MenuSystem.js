/**
 * MenuSystem - Menu navigation and screen management
 *
 * Handles menu navigation, screen transitions, and back button handling
 */
import { BasePanel } from './BasePanel.js';

export class MenuSystem {
    /**
     * Create a new MenuSystem
     * @param {UIManager} uiManager - UIManager instance
     */
    constructor(uiManager) {
        this.uiManager = uiManager;

        // Screen management
        this.screens = new Map(); // Map<screenId, screen>
        this.screenStack = []; // Stack for navigation
        this.currentScreen = null;

        // Transition settings
        this.transitionDuration = 300; // ms
        this.transitionType = 'fade'; // 'fade', 'slide', 'none'
    }

    /**
     * Register a screen
     * @param {string} screenId - Screen identifier
     * @param {Object} screen - Screen instance (must extend BasePanel or have show/hide methods)
     */
    registerScreen(screenId, screen) {
        if (this.screens.has(screenId)) {
            console.warn('MenuSystem: Screen already registered:', screenId);
            return;
        }

        this.screens.set(screenId, screen);

        // Register with UIManager if it's a panel
        if (this.uiManager && screen instanceof BasePanel) {
            this.uiManager.registerPanel(screenId, screen);
        }
    }

    /**
     * Show a screen
     * @param {string} screenId - Screen identifier
     * @param {Object} options - Options {replace: boolean, transition: boolean}
     * @returns {Promise<void>} Resolves when screen is shown
     */
    async showScreen(screenId, options = {}) {
        const screen = this.screens.get(screenId);
        if (!screen) {
            console.warn('MenuSystem: Screen not found:', screenId);
            return;
        }

        // Hide current screen
        if (this.currentScreen && this.currentScreen !== screenId) {
            await this.hideScreen(this.currentScreen, options.transition !== false);
        }

        // Show new screen
        if (screen.show) {
            screen.show();
        }

        // Update stack
        if (options.replace) {
            // Replace current screen in stack
            if (this.screenStack.length > 0) {
                this.screenStack[this.screenStack.length - 1] = screenId;
            } else {
                this.screenStack.push(screenId);
            }
        } else {
            // Push to stack
            this.screenStack.push(screenId);
        }

        this.currentScreen = screenId;

        // Focus screen
        if (this.uiManager) {
            this.uiManager.setFocus(screenId);
        }
    }

    /**
     * Hide a screen
     * @param {string} screenId - Screen identifier
     * @param {boolean} transition - Whether to use transition (default: true)
     * @returns {Promise<void>} Resolves when screen is hidden
     */
    async hideScreen(screenId, transition = true) {
        const screen = this.screens.get(screenId);
        if (!screen) {
            return;
        }

        if (screen.hide) {
            screen.hide();
        }

        if (this.currentScreen === screenId) {
            this.currentScreen = null;
        }
    }

    /**
     * Navigate back (pop screen stack)
     * @returns {Promise<void>} Resolves when navigation is complete
     */
    async goBack() {
        if (this.screenStack.length <= 1) {
            // Can't go back from first screen
            return;
        }

        // Pop current screen
        this.screenStack.pop();

        // Show previous screen
        const previousScreenId = this.screenStack[this.screenStack.length - 1];
        if (previousScreenId) {
            await this.showScreen(previousScreenId, { replace: true });
        }
    }

    /**
     * Get current screen
     * @returns {string|null} Current screen ID
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Get screen
     * @param {string} screenId - Screen identifier
     * @returns {Object|null} Screen instance, or null if not found
     */
    getScreen(screenId) {
        return this.screens.get(screenId) || null;
    }

    /**
     * Clear all screens
     */
    clear() {
        for (const screenId of this.screens.keys()) {
            this.hideScreen(screenId, false);
        }
        this.screenStack = [];
        this.currentScreen = null;
    }
}
