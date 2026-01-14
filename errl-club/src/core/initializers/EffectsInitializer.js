/**
 * EffectsInitializer - Handles visual effects and event system initialization
 */
import * as THREE from 'three';
import { EventSystem } from '../../effects/EventSystem.js';
import { VisualEffects } from '../../effects/VisualEffects.js';
import { VisualRecorder } from '../../systems/VisualRecorder.js';
import { WorldStateReactor } from '../../systems/WorldStateReactor.js';
import { VisualEffectSettings } from '../../config/VisualEffectSettings.js';

export class EffectsInitializer {
    /**
     * Initialize effects and event systems
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     * @param {EventBus} eventBus - The event bus instance
     * @param {SettingsManager} settingsManager - SettingsManager instance (optional)
     * @returns {Object} Object containing eventSystem, visualEffects, visualRecorder, worldStateReactor, and visualEffectSettings
     */
    static initialize(scene, camera, renderer, eventBus, settingsManager = null) {
        const eventSystem = new EventSystem(scene);

        // Create visual effect settings
        const visualEffectSettings = new VisualEffectSettings(settingsManager);

        const visualEffects = new VisualEffects(scene, camera, null, visualEffectSettings);
        const visualRecorder = new VisualRecorder(scene, camera, renderer);

        // Make visualRecorder globally available
        if (typeof window !== 'undefined') {
            window.visualRecorder = visualRecorder;
        }

        const worldStateReactor = new WorldStateReactor(scene, eventSystem, visualEffects);

        // Pass eventBus to systems that need it
        if (eventBus && eventSystem.setEventBus) {
            eventSystem.setEventBus(eventBus);
        }

        return {
            eventSystem,
            visualEffects,
            visualRecorder,
            worldStateReactor,
            visualEffectSettings,
        };
    }
}
