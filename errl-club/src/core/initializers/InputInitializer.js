/**
 * InputInitializer - Handles input and keybind manager setup
 */
import { InputManager } from '../../input/InputManager.js';
import { KeybindManager } from '../../input/KeybindManager.js';

export class InputInitializer {
    /**
     * Initialize input managers
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @returns {Object} Object containing inputManager and keybindManager
     */
    static initialize(canvas) {
        const inputManager = new InputManager(canvas);
        const keybindManager = new KeybindManager(inputManager);

        return { inputManager, keybindManager };
    }
}
