/**
 * GameSystemsInitializer - Handles initialization of core game systems
 *
 * Extracted from main.js to consolidate system initialization code.
 */

import * as THREE from 'three';
import { ErrlAvatar } from '../../avatar/ErrlAvatar.js';
import { ParticleSystem } from '../../particles.js';
import { CollisionSystem } from '../../systems/CollisionSystem.js';
import { InteractionSystem } from '../../systems/InteractionSystem.js';
import { PhysicsSystem } from '../../systems/PhysicsSystem.js';
import { ReplaySystem } from '../../systems/ReplaySystem.js';
import { TeleportSystem } from '../../systems/TeleportSystem.js';
import { CameraController } from '../../camera/CameraController.js';
import { EventSystem } from '../../effects/EventSystem.js';
import { VisualEffects } from '../../effects/VisualEffects.js';
import { WorldStateReactor } from '../../systems/WorldStateReactor.js';
import { VisualRecorder } from '../../systems/VisualRecorder.js';
import { STAGE_SIZE, STAGE_HEIGHT } from '../../config/constants.js';

/**
 * Initialize core game systems
 * @param {Object} params - Initialization parameters
 * @param {THREE.Scene} params.scene - Three.js scene
 * @param {THREE.Camera} params.camera - Three.js camera
 * @param {THREE.WebGLRenderer} params.renderer - Three.js renderer
 * @param {THREE.Vector3} params.avatarInitialPosition - Avatar spawn position
 * @param {Function} params.updateProgress - Loading screen progress callback
 * @param {Object} params.ROOM_SIZE - Room size constant
 * @param {Object} params.ROOM_BOUNDS - Room bounds for collision
 * @param {Object} params.AVATAR_RADIUS - Avatar radius constant
 * @returns {Object} Initialized systems
 */
export function initializeGameSystems({
    scene,
    camera,
    renderer,
    avatarInitialPosition,
    updateProgress,
    ROOM_SIZE,
    ROOM_BOUNDS,
    AVATAR_RADIUS,
}) {
    const systems = {};

    // Initialize avatar
    updateProgress(0.5, 'Creating avatar...');
    systems.avatar = new ErrlAvatar(scene, avatarInitialPosition);
    systems.avatar.randomizeColorVariant();

    // Initialize particle system
    updateProgress(0.55, 'Initializing systems...');
    systems.particleSystem = new ParticleSystem(scene);

    // Initialize particle presets (async, but doesn't block)
    systems.particlePresets = null;
    (async () => {
        const { ParticlePresets } = await import('../../config/ParticlePresets.js');
        systems.particlePresets = new ParticlePresets();
        systems.particleSystem.setPreset(systems.particlePresets.getCurrentPreset());
        window.gameSystems = window.gameSystems || {};
        window.gameSystems.particlePresets = systems.particlePresets;
        window.gameSystems.particleSystem = systems.particleSystem;
    })();

    // Initialize screen effects presets (async, but doesn't block)
    systems.screenEffectsPresets = null;
    (async () => {
        const { ScreenEffectsPresets } = await import('../../config/ScreenEffectsPresets.js');
        systems.screenEffectsPresets = new ScreenEffectsPresets();
        window.gameSystems = window.gameSystems || {};
        window.gameSystems.screenEffectsPresets = systems.screenEffectsPresets;
    })();

    // Initialize post-processing presets (async, but doesn't block)
    systems.postProcessingPresets = null;
    (async () => {
        const { PostProcessingPresets } = await import('../../config/PostProcessingPresets.js');
        systems.postProcessingPresets = new PostProcessingPresets();
        window.gameSystems = window.gameSystems || {};
        window.gameSystems.postProcessingPresets = systems.postProcessingPresets;
    })();

    // Initialize collision system
    updateProgress(0.6, 'Setting up collision and interaction...');
    systems.collisionSystem = new CollisionSystem(scene, ROOM_BOUNDS);

    // Initialize interaction system
    updateProgress(0.62, 'Initializing interaction system...');
    systems.interactionSystem = new InteractionSystem(scene, camera);

    // Initialize camera controller
    updateProgress(0.65, 'Initializing camera controller...');
    systems.cameraController = new CameraController(camera, renderer);

    // Initialize event system and visual effects
    updateProgress(0.68, 'Creating event system and visual effects...');
    systems.eventSystem = new EventSystem(scene);
    systems.visualEffects = new VisualEffects(scene, camera);

    // Initialize physics system
    updateProgress(0.7, 'Creating physics and replay systems...');
    systems.physicsSystem = new PhysicsSystem(scene);

    // Initialize replay system
    systems.replaySystem = new ReplaySystem(scene);

    // Initialize teleport system
    systems.teleportSystem = new TeleportSystem(scene);

    // Add default teleport anchors and respawn point
    systems.teleportSystem.addAnchor(new THREE.Vector3(0, 0.7, -STAGE_SIZE / 2), 'Stage Center');
    systems.teleportSystem.addAnchor(new THREE.Vector3(5, 0.7, -5), 'Corner');
    systems.teleportSystem.addAnchor(new THREE.Vector3(-5, 0.7, -5), 'Other Corner');
    systems.teleportSystem.addRespawnPoint(
        new THREE.Vector3(0, 0.7, -STAGE_SIZE / 2),
        'Main Spawn'
    );

    // Initialize world state reactor
    updateProgress(0.72, 'Initializing world state reactor...');
    systems.worldStateReactor = new WorldStateReactor(
        scene,
        systems.eventSystem,
        systems.visualEffects
    );

    // Initialize visual recorder
    updateProgress(0.74, 'Creating visual recorder...');
    systems.visualRecorder = new VisualRecorder(scene, camera, renderer);

    // Initialize replay library (async, non-blocking)
    systems.replayLibrary = null;
    (async () => {
        try {
            const { ReplayLibrary } = await import('../../systems/ReplayLibrary.js');
            systems.replayLibrary = new ReplayLibrary();
            console.log('ReplayLibrary initialized');
        } catch (error) {
            console.warn('Failed to load ReplayLibrary:', error);
        }
    })();

    return systems;
}
