/**
 * FloatingRoom - Zero-gravity floating room with space station
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import * as THREE from 'three';

export class FloatingRoom extends BaseRoom {
    /**
     * Create a new FloatingRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional)
     */
    constructor(scene, definition = null) {
        if (!definition) {
            definition = FloatingRoom.createDefaultDefinition();
        }

        super(scene, definition);
        this.isFloatingRoom = true; // Flag for zero-gravity
    }

    /**
     * Create default room definition for FloatingRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        return new RoomDefinition({
            id: 'floating_room',
            name: 'Space Station',
            type: 'floating',
            size: 30,
            height: 30,
            bounds: {
                minX: -15,
                maxX: 15,
                minZ: -15,
                maxZ: 15,
                minY: -10,
                maxY: 20,
            },
            spawnPoints: [{ position: new THREE.Vector3(0, 5, 0), name: 'Center' }],
            lighting: {
                ambient: { color: 0x202040, intensity: 0.6 },
                directional: {
                    color: 0x88aaff,
                    intensity: 0.5,
                    position: new THREE.Vector3(10, 15, 10),
                },
                pointLights: [
                    {
                        color: 0x00ffff,
                        intensity: 1.0,
                        position: new THREE.Vector3(0, 10, 0),
                        distance: 20,
                    },
                ],
                spotLights: [],
            },
            fog: {
                enabled: true,
                color: 0x000020,
                near: 5,
                far: 50,
            },
            particles: {
                enabled: true,
                intensity: 0.8,
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: false, // No gravity!
                zeroGravity: true, // Custom setting for floating
            },
            description: 'Zero-gravity space station - float around freely!',
            tags: ['floating', 'space', 'zero-gravity'],
            maxPlayers: 30,
        });
    }

    /**
     * Load the room (override for floating room setup)
     * Note: Custom space station model removed - using procedural geometry instead
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        await super.load();

        // Custom model loading removed - using procedural room geometry from BaseRoom
        // Space station model would be loaded here if needed, but we're using procedural geometry instead
        console.log('FloatingRoom: Using procedural room geometry (custom model removed)');
    }

    /**
     * Unload the room
     */
    unload() {
        // Custom model cleanup removed - using procedural geometry from BaseRoom
        // BaseRoom.unload() will handle cleanup of procedural geometry
        super.unload();
    }
}
