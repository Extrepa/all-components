/**
 * CoreSystemsInitializer - Handles core game systems initialization
 */
import * as THREE from 'three';
import { ParticleSystem } from '../../particles.js';
import { CollisionSystem } from '../../systems/CollisionSystem.js';
import { InteractionSystem } from '../../systems/InteractionSystem.js';
import { PhysicsSystem } from '../../systems/PhysicsSystem.js';
import { CameraController } from '../../camera/CameraController.js';
import { ReplaySystem } from '../../systems/ReplaySystem.js';
import { TeleportSystem } from '../../systems/TeleportSystem.js';
import { ROOM_SIZE, WALL_HEIGHT, STAGE_SIZE } from '../../config/constants.js';

export class CoreSystemsInitializer {
    /**
     * Initialize core game systems
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     * @param {LoopManager} loopManager - Optional LoopManager for self-registration
     * @returns {Promise<Object>} Promise resolving to object containing all core systems
     */
    static async initialize(scene, camera, renderer, loopManager = null) {
        // Particle system (now self-registers with LoopManager)
        const particleSystem = new ParticleSystem(scene, loopManager);

        // Collision system (requires ROOM_BOUNDS)
        const ROOM_BOUNDS = {
            minX: -ROOM_SIZE / 2,
            maxX: ROOM_SIZE / 2,
            minZ: -ROOM_SIZE / 2,
            maxZ: ROOM_SIZE / 2,
            minY: 0,
            maxY: WALL_HEIGHT,
        };
        const collisionSystem = new CollisionSystem(scene, ROOM_BOUNDS);

        // Interaction system (now self-registers with LoopManager)
        const interactionSystem = new InteractionSystem(scene, camera, loopManager);

        // Camera settings (will be created/loaded from SettingsManager if available)
        // For now, create default CameraSettings
        const { CameraSettings } = await import('../../config/CameraSettings.js');
        const cameraSettings = new CameraSettings();

        // Camera controller (with settings)
        const cameraController = new CameraController(camera, renderer, cameraSettings);

        // Physics system (now self-registers with LoopManager)
        const physicsSystem = new PhysicsSystem(scene, loopManager);

        // Replay and teleport systems
        const replaySystem = new ReplaySystem(scene);
        const teleportSystem = new TeleportSystem(scene);

        // Add default teleport anchors
        teleportSystem.addAnchor(new THREE.Vector3(0, 0.7, -STAGE_SIZE / 2), 'Stage Center');
        teleportSystem.addAnchor(new THREE.Vector3(5, 0.7, -5), 'Corner');
        teleportSystem.addAnchor(new THREE.Vector3(-5, 0.7, -5), 'Other Corner');

        // Add default respawn point
        teleportSystem.addRespawnPoint(new THREE.Vector3(0, 0.7, -STAGE_SIZE / 2), 'Main Spawn');

        return {
            particleSystem,
            collisionSystem,
            interactionSystem,
            cameraController,
            physicsSystem,
            replaySystem,
            teleportSystem,
            ROOM_BOUNDS,
        };
    }
}
