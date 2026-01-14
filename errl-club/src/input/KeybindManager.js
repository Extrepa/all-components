/**
 * KeybindManager - Centralized keybind registration and handling
 */
export class KeybindManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.keybinds = new Map(); // Map of key+modifiers -> callback
        this.descriptions = new Map(); // Map of key+modifiers -> description
        this.setupEventHandling();
    }

    setupEventHandling() {
        // Override InputManager's keydown handler to check keybinds first
        // We need to intercept the keydown event before InputManager processes it
        // This is done by wrapping the document keydown listener
        const originalHandleKeyDown = this.inputManager.handleKeyDown.bind(this.inputManager);
        this.inputManager.handleKeyDown = (event) => {
            // Always update key state FIRST (before checking keybinds)
            // This ensures movement keys work even if keybinds are registered
            const key = event.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') {
                this.inputManager.keys.w = true;
            }
            if (key === 'a' || key === 'arrowleft') {
                this.inputManager.keys.a = true;
            }
            if (key === 's' || key === 'arrowdown') {
                this.inputManager.keys.s = true;
            }
            if (key === 'd' || key === 'arrowright') {
                this.inputManager.keys.d = true;
            }
            if (key === 'shift') {
                this.inputManager.keys.shift = true;
            }
            if (key === 'control') {
                this.inputManager.keys.ctrl = true;
            }
            if (key === ' ') {
                this.inputManager.keys.space = true;
                event.preventDefault();
            }

            // Check keybinds after updating key state
            if (this.handleKey(event)) {
                // Keybind was handled, key state already updated above
                // Don't call original handler to avoid duplicate callbacks
                return;
            }

            // No keybind matched, call original handler for callbacks
            // Key state already updated above, so skip that part
            const callback = this.inputManager.keyCallbacks.get(key);
            if (callback) {
                callback(event);
            }
        };
    }

    /**
     * Register a keybind
     * @param {string} key - The key to bind (e.g., 'w', 'space', 'tab')
     * @param {object} modifiers - Object with shift, ctrl, alt booleans
     * @param {function} callback - Function to call when keybind is triggered
     * @param {string} description - Description for help/controls display
     */
    registerKeybind(key, modifiers = {}, callback, description = '') {
        const keyLower = key.toLowerCase();
        const keybindId = this.getKeybindId(keyLower, modifiers);
        this.keybinds.set(keybindId, callback);
        if (description) {
            this.descriptions.set(keybindId, description);
        }
    }

    /**
     * Get unique ID for a keybind combination
     */
    getKeybindId(key, modifiers) {
        const shift = modifiers.shift ? 'shift' : '';
        const ctrl = modifiers.ctrl ? 'ctrl' : '';
        const alt = modifiers.alt ? 'alt' : '';
        return `${shift}-${ctrl}-${alt}-${key}`.replace(/^-|-$/g, '');
    }

    /**
     * Handle a keydown event and check for matching keybinds
     * @param {KeyboardEvent} event - The keyboard event
     * @returns {boolean} - True if a keybind was matched and executed
     */
    handleKey(event) {
        const key = event.key.toLowerCase();
        const modifiers = {
            shift: event.shiftKey,
            ctrl: event.ctrlKey || event.metaKey, // Support Cmd on Mac
            alt: event.altKey,
        };

        const keybindId = this.getKeybindId(key, modifiers);
        const callback = this.keybinds.get(keybindId);

        if (callback) {
            try {
                callback(event);
                return true;
            } catch (error) {
                console.error('Error executing keybind callback:', error);
                return true; // Still return true to prevent default behavior
            }
        }

        return false;
    }

    /**
     * Get all registered keybinds with descriptions
     * @returns {Array} - Array of {key, modifiers, description} objects
     */
    getAllKeybinds() {
        const result = [];
        for (const [keybindId, description] of this.descriptions.entries()) {
            const parts = keybindId.split('-');
            const key = parts[parts.length - 1];
            const modifiers = {
                shift: parts.includes('shift'),
                ctrl: parts.includes('ctrl'),
                alt: parts.includes('alt'),
            };
            result.push({ key, modifiers, description });
        }
        return result;
    }
}
