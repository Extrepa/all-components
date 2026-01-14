/**
 * UIManager - Centralized UI management
 *
 * Handles panel lifecycle, event handling, z-order, and focus management
 */
export class UIManager {
    /**
     * Create a new UIManager
     * @param {HTMLElement} container - Container element for UI (default: document.body)
     */
    constructor(container = null) {
        this.container = container || document.body;

        // Panel management
        this.panels = new Map(); // Map<panelId, panel>
        this.panelStack = []; // Stack for z-order
        this.focusedPanel = null;

        // Event handling
        this.eventListeners = new Map();

        // UI scaling system (will be set externally)
        this.scalingSystem = null;

        // Statistics
        this.stats = {
            panelsCreated: 0,
            panelsDestroyed: 0,
            eventsHandled: 0,
        };
    }

    /**
     * Set UI scaling system
     * @param {UIScalingSystem} scalingSystem - UIScalingSystem instance
     */
    setScalingSystem(scalingSystem) {
        this.scalingSystem = scalingSystem;
        if (scalingSystem) {
            scalingSystem.setUIManager(this);
        }
    }

    /**
     * Register a panel
     * @param {string} panelId - Unique panel identifier
     * @param {Object} panel - Panel instance (must have show, hide, update, render methods)
     * @param {number} zIndex - Z-index (default: auto-increment)
     */
    registerPanel(panelId, panel, zIndex = null) {
        if (this.panels.has(panelId)) {
            console.warn('UIManager: Panel already registered:', panelId);
            return;
        }

        // Set z-index if not provided
        if (zIndex === null) {
            zIndex = this.panelStack.length;
        }

        panel.zIndex = zIndex;
        panel.panelId = panelId;

        this.panels.set(panelId, panel);
        this.panelStack.push({ panelId, zIndex });
        this.panelStack.sort((a, b) => a.zIndex - b.zIndex);

        // Register with scaling system if available
        if (this.scalingSystem && panel.element) {
            this.scalingSystem.registerElement(panel.element);
        }

        this.stats.panelsCreated++;
    }

    /**
     * Unregister a panel
     * @param {string} panelId - Panel identifier
     */
    unregisterPanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            console.warn('UIManager: Panel not found:', panelId);
            return;
        }

        // Hide and destroy panel
        if (panel.hide) {
            panel.hide();
        }

        // Unregister from scaling system
        if (this.scalingSystem && panel.element) {
            this.scalingSystem.unregisterElement(panel.element);
        }

        if (panel.destroy) {
            panel.destroy();
        }

        // Remove from stack
        this.panelStack = this.panelStack.filter((item) => item.panelId !== panelId);

        // Remove focus if focused
        if (this.focusedPanel === panelId) {
            this.focusedPanel = null;
        }

        this.panels.delete(panelId);
        this.stats.panelsDestroyed++;
    }

    /**
     * Show a panel
     * @param {string} panelId - Panel identifier
     */
    showPanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            console.warn('UIManager: Panel not found:', panelId);
            return;
        }

        if (panel.show) {
            panel.show();
        }

        // Bring to front
        this.bringToFront(panelId);
    }

    /**
     * Hide a panel
     * @param {string} panelId - Panel identifier
     */
    hidePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            console.warn('UIManager: Panel not found:', panelId);
            return;
        }

        if (panel.hide) {
            panel.hide();
        }
    }

    /**
     * Toggle panel visibility
     * @param {string} panelId - Panel identifier
     */
    togglePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            console.warn('UIManager: Panel not found:', panelId);
            return;
        }

        if (panel.isVisible && panel.isVisible()) {
            this.hidePanel(panelId);
        } else {
            this.showPanel(panelId);
        }
    }

    /**
     * Bring panel to front
     * @param {string} panelId - Panel identifier
     */
    bringToFront(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            return;
        }

        // Find max z-index
        let maxZ = 0;
        for (const item of this.panelStack) {
            maxZ = Math.max(maxZ, item.zIndex);
        }

        // Update panel z-index
        panel.zIndex = maxZ + 1;

        // Update stack
        const stackItem = this.panelStack.find((item) => item.panelId === panelId);
        if (stackItem) {
            stackItem.zIndex = panel.zIndex;
            this.panelStack.sort((a, b) => a.zIndex - b.zIndex);
        }

        // Apply z-index to DOM if element exists
        if (panel.element) {
            panel.element.style.zIndex = panel.zIndex;
        }
    }

    /**
     * Set focused panel
     * @param {string} panelId - Panel identifier
     */
    setFocus(panelId) {
        // Remove focus from previous panel
        if (this.focusedPanel && this.focusedPanel !== panelId) {
            const prevPanel = this.panels.get(this.focusedPanel);
            if (prevPanel && prevPanel.onBlur) {
                prevPanel.onBlur();
            }
        }

        this.focusedPanel = panelId;

        // Focus new panel
        const panel = this.panels.get(panelId);
        if (panel && panel.onFocus) {
            panel.onFocus();
        }

        // Bring to front
        this.bringToFront(panelId);
    }

    /**
     * Get focused panel
     * @returns {string|null} Focused panel ID, or null
     */
    getFocus() {
        return this.focusedPanel;
    }

    /**
     * Update all panels
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        for (const panel of this.panels.values()) {
            try {
                if (panel.update && panel.isVisible && panel.isVisible()) {
                    panel.update(deltaTime);
                }
            } catch (error) {
                console.error(`UIManager: Error updating panel ${panel.id || 'unknown'}:`, error);
                // Continue updating other panels even if one fails
            }
        }
    }

    /**
     * Render all panels
     */
    render() {
        // Render in z-order
        for (const { panelId } of this.panelStack) {
            try {
                const panel = this.panels.get(panelId);
                if (panel && panel.render && panel.isVisible && panel.isVisible()) {
                    panel.render();
                }
            } catch (error) {
                console.error(`UIManager: Error rendering panel ${panelId}:`, error);
                // Continue rendering other panels even if one fails
            }
        }
    }

    /**
     * Handle UI event
     * @param {string} eventType - Event type
     * @param {Object} eventData - Event data
     */
    handleEvent(eventType, eventData) {
        this.stats.eventsHandled++;

        // Route to focused panel first
        if (this.focusedPanel) {
            const panel = this.panels.get(this.focusedPanel);
            if (panel && panel.handleEvent) {
                if (panel.handleEvent(eventType, eventData)) {
                    return; // Event handled
                }
            }
        }

        // Route to all panels (in reverse z-order for top-down handling)
        for (let i = this.panelStack.length - 1; i >= 0; i--) {
            const { panelId } = this.panelStack[i];
            const panel = this.panels.get(panelId);
            if (panel && panel.handleEvent && panel.isVisible && panel.isVisible()) {
                if (panel.handleEvent(eventType, eventData)) {
                    return; // Event handled
                }
            }
        }
    }

    /**
     * Get panel
     * @param {string} panelId - Panel identifier
     * @returns {Object|null} Panel instance, or null if not found
     */
    getPanel(panelId) {
        return this.panels.get(panelId) || null;
    }

    /**
     * Get all panels
     * @returns {Object[]} Array of all panels
     */
    getAllPanels() {
        return Array.from(this.panels.values());
    }

    /**
     * Clear all panels
     */
    clear() {
        for (const panelId of this.panels.keys()) {
            this.unregisterPanel(panelId);
        }
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            activePanels: this.panels.size,
            focusedPanel: this.focusedPanel,
        };
    }
}
