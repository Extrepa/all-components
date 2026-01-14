/**
 * ChillRoom - Relaxed social space implementation
 *
 * A calm, relaxed room for socializing and taking a break
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import { ChillRoomObject } from '../../interactions/RoomSpecificObjects.js';
import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from '../../config/constants.js';

export class ChillRoom extends BaseRoom {
    /**
     * Create a new ChillRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional, will create default if not provided)
     */
    constructor(scene, definition = null) {
        // Create default definition if not provided
        if (!definition) {
            definition = ChillRoom.createDefaultDefinition();
        }

        super(scene, definition);
    }

    /**
     * Create default room definition for ChillRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        return new RoomDefinition({
            id: 'chill_room',
            name: 'Chill Room',
            type: 'chill',
            size: ROOM_SIZE * 0.8, // Slightly smaller, more intimate
            height: WALL_HEIGHT * 0.9,
            bounds: {
                minX: -(ROOM_SIZE * 0.8) / 2,
                maxX: (ROOM_SIZE * 0.8) / 2,
                minZ: -(ROOM_SIZE * 0.8) / 2,
                maxZ: (ROOM_SIZE * 0.8) / 2,
                minY: 0,
                maxY: WALL_HEIGHT * 0.9,
            },
            spawnPoints: [
                { position: new THREE.Vector3(0, 0.7, 0), name: 'Center' },
                { position: new THREE.Vector3(4, 0.7, 4), name: 'Corner' },
                { position: new THREE.Vector3(-4, 0.7, -4), name: 'Other Corner' },
            ],
            lighting: {
                ambient: { color: 0x505050, intensity: 0.7 },
                directional: {
                    color: 0xffffee,
                    intensity: 0.6,
                    position: new THREE.Vector3(3, 8, 3),
                },
                pointLights: [
                    {
                        color: 0xffaa88,
                        intensity: 0.8,
                        position: new THREE.Vector3(0, 4, 0),
                        distance: 10,
                    },
                ],
                spotLights: [],
            },
            fog: {
                enabled: false,
                color: 0x000000,
                near: 1,
                far: 50,
            },
            particles: {
                enabled: true,
                intensity: 0.5, // Lower intensity for chill vibe
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: true,
            },
            description: 'A relaxed social space for taking a break and chatting',
            tags: ['chill', 'social', 'relaxed', 'lounge'],
            maxPlayers: 20,
        });
    }

    /**
     * Load the room (override to add ChillRoom-specific setup)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        // Call parent load first
        await super.load();

        // ChillRoom-specific setup
        // Add comfortable seating areas
        const seating1 = new ChillRoomObject(this.scene, new THREE.Vector3(-3, 0.25, 3), {
            name: 'Comfortable Seating Area 1',
        });
        seating1.mesh.userData.objectId = 'chill_seating_1';
        this.registerRoomObject(seating1);

        const seating2 = new ChillRoomObject(this.scene, new THREE.Vector3(3, 0.25, -3), {
            name: 'Comfortable Seating Area 2',
        });
        seating2.mesh.userData.objectId = 'chill_seating_2';
        this.registerRoomObject(seating2);

        console.log('ChillRoom: Chill room loaded');
    }

    /**
     * Update room (override for ChillRoom-specific updates)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Call parent update
        super.update(deltaTime, elapsedTime);

        // ChillRoom-specific updates
        // Gentle lighting animations, ambient effects, etc.
    }
}
