/**
 * VisualizerRoom - Visualizer/lighting room implementation
 *
 * A room focused on visual effects, lighting displays, and audio-reactive visuals
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from '../../config/constants.js';
import { VisualizerRoomObject } from '../../interactions/RoomSpecificObjects.js';

export class VisualizerRoom extends BaseRoom {
    /**
     * Create a new VisualizerRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional, will create default if not provided)
     */
    constructor(scene, definition = null) {
        // Create default definition if not provided
        if (!definition) {
            definition = VisualizerRoom.createDefaultDefinition();
        }

        super(scene, definition);
    }

    /**
     * Create default room definition for VisualizerRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        return new RoomDefinition({
            id: 'visualizer_room',
            name: 'Visualizer Room',
            type: 'visualizer',
            size: ROOM_SIZE,
            height: WALL_HEIGHT,
            bounds: {
                minX: -ROOM_SIZE / 2,
                maxX: ROOM_SIZE / 2,
                minZ: -ROOM_SIZE / 2,
                maxZ: ROOM_SIZE / 2,
                minY: 0,
                maxY: WALL_HEIGHT,
            },
            spawnPoints: [
                { position: new THREE.Vector3(0, 0.7, 0), name: 'Center' },
                { position: new THREE.Vector3(8, 0.7, 0), name: 'Right Side' },
                { position: new THREE.Vector3(-8, 0.7, 0), name: 'Left Side' },
            ],
            lighting: {
                ambient: { color: 0x202020, intensity: 0.3 },
                directional: {
                    color: 0xffffff,
                    intensity: 0.5,
                    position: new THREE.Vector3(0, 10, 0),
                },
                pointLights: [
                    {
                        color: 0x00ffff,
                        intensity: 1.0,
                        position: new THREE.Vector3(-5, 5, 0),
                        distance: 15,
                    },
                    {
                        color: 0xff00ff,
                        intensity: 1.0,
                        position: new THREE.Vector3(5, 5, 0),
                        distance: 15,
                    },
                ],
                spotLights: [],
            },
            fog: {
                enabled: true,
                color: 0x000000,
                near: 5,
                far: 25,
            },
            particles: {
                enabled: true,
                intensity: 1.5,
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: true,
            },
            description: 'A room dedicated to visual effects and audio-reactive lighting displays',
            tags: ['visualizer', 'lighting', 'effects', 'audio-reactive'],
            maxPlayers: 30,
        });
    }

    /**
     * Load the room (override to add VisualizerRoom-specific setup)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        // Call parent load first
        await super.load();

        // VisualizerRoom-specific setup
        // Add room-specific interactive objects
        const lightControl1 = new VisualizerRoomObject(this.scene, new THREE.Vector3(-5, 1, 0), {
            name: 'Light Control Panel 1',
        });
        lightControl1.mesh.userData.objectId = 'visualizer_light_control_1';
        this.registerRoomObject(lightControl1);

        const lightControl2 = new VisualizerRoomObject(this.scene, new THREE.Vector3(5, 1, 0), {
            name: 'Light Control Panel 2',
        });
        lightControl2.mesh.userData.objectId = 'visualizer_light_control_2';
        this.registerRoomObject(lightControl2);

        console.log('VisualizerRoom: Visualizer room loaded');
    }

    /**
     * Update room (override for VisualizerRoom-specific updates)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Call parent update
        super.update(deltaTime, elapsedTime);

        // VisualizerRoom-specific updates
        // Audio-reactive lighting, visual effects, etc.
    }
}
