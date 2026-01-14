/**
 * MainClubRoom - Main club room implementation
 *
 * Extends BaseRoom with MainClubRoom-specific setup
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT, STAGE_SIZE, STAGE_HEIGHT } from '../../config/constants.js';

export class MainClubRoom extends BaseRoom {
    /**
     * Create a new MainClubRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional, will create default if not provided)
     */
    constructor(scene, definition = null) {
        // Create default definition if not provided
        if (!definition) {
            definition = MainClubRoom.createDefaultDefinition();
        }

        super(scene, definition);
    }

    /**
     * Create default room definition for MainClubRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        return new RoomDefinition({
            id: 'main_club_room',
            name: 'Main Club Room',
            type: 'club',
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
                { position: new THREE.Vector3(0, 0.7, -STAGE_SIZE / 2), name: 'Stage Center' },
                { position: new THREE.Vector3(5, 0.7, -5), name: 'Corner' },
                { position: new THREE.Vector3(-5, 0.7, -5), name: 'Other Corner' },
            ],
            lighting: {
                ambient: { color: 0x404040, intensity: 0.5 },
                directional: {
                    color: 0xffffff,
                    intensity: 0.8,
                    position: new THREE.Vector3(5, 10, 5),
                },
                pointLights: [],
                spotLights: [],
            },
            fog: {
                enabled: true,
                color: 0x000000,
                near: 10,
                far: 30,
            },
            particles: {
                enabled: true,
                intensity: 1.0,
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: true,
            },
            description: 'The main club room with stage, DJ booth, and dance floor',
            tags: ['club', 'main', 'dance'],
            maxPlayers: 50,
        });
    }

    /**
     * Load the room (override to add MainClubRoom-specific setup)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        // Call parent load first
        await super.load();

        // MainClubRoom-specific setup can be added here
        // For example, additional decorative elements, special effects, etc.

        console.log('MainClubRoom: Main club room loaded');
    }

    /**
     * Update room (override for MainClubRoom-specific updates)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Call parent update
        super.update(deltaTime, elapsedTime);

        // MainClubRoom-specific updates can be added here
    }
}
