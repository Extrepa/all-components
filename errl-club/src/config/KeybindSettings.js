/**
 * KeybindSettings - Keybind persistence and validation
 */
import { SettingsManager } from './SettingsManager.js';

export class KeybindSettings {
    /**
     * Create a new KeybindSettings
     * @param {SettingsManager} settingsManager - SettingsManager instance
     */
    constructor(settingsManager) {
        this.settingsManager = settingsManager;

        // Default keybinds
        this.defaultKeybinds = {
            'move.forward': 'w',
            'move.backward': 's',
            'move.left': 'a',
            'move.right': 'd',
            jump: ' ',
            run: 'shift',
            crouch: 'control',
            dance: 'shift+d',
            interact: 'e',
            showControls: 'h',
        };

        // Initialize defaults
        this.initializeDefaults();
    }

    /**
     * Initialize default settings
     * @private
     */
    initializeDefaults() {
        // Load keybinds or use defaults
        const stored = this.settingsManager.getSetting('keybinds', {});

        // Merge with defaults (stored takes precedence)
        const keybinds = { ...this.defaultKeybinds, ...stored };
        this.settingsManager.setSetting('keybinds', keybinds);
    }

    /**
     * Get a keybind
     * @param {string} action - Action name
     * @returns {string} Keybind string
     */
    getKeybind(action) {
        const keybinds = this.settingsManager.getSetting('keybinds', {});
        return keybinds[action] || this.defaultKeybinds[action] || null;
    }

    /**
     * Set a keybind
     * @param {string} action - Action name
     * @param {string} keybind - Keybind string
     * @returns {boolean} True if set successfully (false if conflict)
     */
    setKeybind(action, keybind) {
        // Validate keybind
        if (!this.validateKeybind(keybind)) {
            console.warn('KeybindSettings: Invalid keybind:', keybind);
            return false;
        }

        // Check for conflicts
        const keybinds = this.settingsManager.getSetting('keybinds', {});
        for (const [otherAction, otherKeybind] of Object.entries(keybinds)) {
            if (otherAction !== action && otherKeybind === keybind) {
                console.warn('KeybindSettings: Keybind conflict:', action, 'with', otherAction);
                return false;
            }
        }

        // Set keybind
        keybinds[action] = keybind;
        this.settingsManager.setSetting('keybinds', keybinds);
        return true;
    }

    /**
     * Validate a keybind
     * @param {string} keybind - Keybind string
     * @returns {boolean} True if valid
     */
    validateKeybind(keybind) {
        if (!keybind || typeof keybind !== 'string') {
            return false;
        }

        // Basic validation - can be extended
        return keybind.length > 0;
    }

    /**
     * Reset keybind to default
     * @param {string} action - Action name
     */
    resetKeybind(action) {
        if (this.defaultKeybinds[action]) {
            this.setKeybind(action, this.defaultKeybinds[action]);
        }
    }

    /**
     * Reset all keybinds to defaults
     */
    resetAllKeybinds() {
        this.settingsManager.setSetting('keybinds', { ...this.defaultKeybinds });
    }

    /**
     * Get all keybinds
     * @returns {Object} All keybinds
     */
    getAllKeybinds() {
        return { ...this.settingsManager.getSetting('keybinds', {}) };
    }

    /**
     * Get default keybinds
     * @returns {Object} Default keybinds
     */
    getDefaultKeybinds() {
        return { ...this.defaultKeybinds };
    }
}
