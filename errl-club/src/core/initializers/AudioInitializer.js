/**
 * AudioInitializer - Handles audio system initialization
 */
import * as THREE from 'three';
import { AudioSystem } from '../../audio/AudioSystem.js';

export class AudioInitializer {
    /**
     * Initialize audio system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} effects - Effects object containing eventSystem, visualEffects, etc.
     * @param {Object} avatar - The avatar instance
     * @param {EventBus} eventBus - The event bus instance
     * @param {Object} systems - The systems object to update with footstep and collectible systems
     * @returns {AudioSystem} The initialized audio system
     */
    static initialize(scene, effects, avatar, eventBus, systems, loopManager = null) {
        // Create temporary clock for audio system initialization
        const tempClock = new THREE.Clock();
        const audioSystem = new AudioSystem(
            scene,
            tempClock,
            {
                eventSystem: effects.eventSystem,
                visualEffects: effects.visualEffects,
                visualRecorder: effects.visualRecorder,
                worldStateReactor: effects.worldStateReactor,
                avatar: avatar,
                eventBus: eventBus,
            },
            loopManager
        );

        // Set up callbacks to update systemsForUpdate when systems are initialized
        audioSystem.setOnFootstepSystemInitialized((footstepSystem) => {
            systems.footstepSystem = footstepSystem;
            if (systems.systemsForUpdate) {
                systems.systemsForUpdate.footstepSystem = footstepSystem;
            }
        });

        audioSystem.setOnCollectibleManagerInitialized((collectibleManager) => {
            systems.collectibleManager = collectibleManager;
            if (systems.systemsForUpdate) {
                systems.systemsForUpdate.collectibleManager = collectibleManager;
            }
            // Connect collection tracker if it exists
            if (systems.collectionTracker) {
                collectibleManager.setCollectionTracker(systems.collectionTracker);
            }
            // Connect rare collectible tracker if it exists
            if (systems.rareCollectibleTracker || systems._rareCollectibleTracker) {
                collectibleManager.rareCollectibleTracker =
                    systems.rareCollectibleTracker || systems._rareCollectibleTracker;
            }
        });

        return audioSystem;
    }
}
