/**
 * TunnelRoom - Long tunnel-style room implementation
 *
 * A 15x30 tunnel connecting different areas of the club
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import * as THREE from 'three';
import { WALL_HEIGHT } from '../../config/constants.js';

export class TunnelRoom extends BaseRoom {
    /**
     * Create a new TunnelRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional, will create default if not provided)
     */
    constructor(scene, definition = null) {
        // Create default definition if not provided
        if (!definition) {
            definition = TunnelRoom.createDefaultDefinition();
        }

        super(scene, definition);
    }

    /**
     * Create default room definition for TunnelRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        const width = 15;
        const length = 30;

        return new RoomDefinition({
            id: 'tunnel_room',
            name: 'Tunnel Room',
            type: 'tunnel',
            size: width, // Width (X dimension)
            height: WALL_HEIGHT,
            bounds: {
                minX: -width / 2,
                maxX: width / 2,
                minZ: -length / 2,
                maxZ: length / 2,
                minY: 0,
                maxY: WALL_HEIGHT,
            },
            spawnPoints: [
                { position: new THREE.Vector3(0, 0.7, 0), name: 'Center' },
                { position: new THREE.Vector3(0, 0.7, -10), name: 'North End' },
                { position: new THREE.Vector3(0, 0.7, 10), name: 'South End' },
                { position: new THREE.Vector3(-5, 0.7, -5), name: 'West Side' },
                { position: new THREE.Vector3(5, 0.7, 5), name: 'East Side' },
            ],
            lighting: {
                ambient: { color: 0x101010, intensity: 0.2 },
                directional: {
                    color: 0x444444,
                    intensity: 0.3,
                    position: new THREE.Vector3(0, 10, 0),
                },
                pointLights: [
                    // Accent lighting along walls
                    {
                        color: 0x00ffff,
                        intensity: 0.8,
                        position: new THREE.Vector3(-width / 2 + 1, 2, -10),
                        distance: 8,
                    },
                    {
                        color: 0x00ffff,
                        intensity: 0.8,
                        position: new THREE.Vector3(width / 2 - 1, 2, -10),
                        distance: 8,
                    },
                    {
                        color: 0xff00ff,
                        intensity: 0.8,
                        position: new THREE.Vector3(-width / 2 + 1, 2, 0),
                        distance: 8,
                    },
                    {
                        color: 0xff00ff,
                        intensity: 0.8,
                        position: new THREE.Vector3(width / 2 - 1, 2, 0),
                        distance: 8,
                    },
                    {
                        color: 0x00ffff,
                        intensity: 0.8,
                        position: new THREE.Vector3(-width / 2 + 1, 2, 10),
                        distance: 8,
                    },
                    {
                        color: 0x00ffff,
                        intensity: 0.8,
                        position: new THREE.Vector3(width / 2 - 1, 2, 10),
                        distance: 8,
                    },
                ],
                spotLights: [],
            },
            fog: {
                enabled: true,
                color: 0x000000,
                near: 3,
                far: 20,
            },
            particles: {
                enabled: true,
                intensity: 0.8,
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: true,
            },
            description: 'A long tunnel connecting different areas of the club',
            tags: ['tunnel', 'connector', 'dark', 'atmospheric'],
            maxPlayers: 20,
        });
    }

    /**
     * Load the room (override to add TunnelRoom-specific setup)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        // Call parent load first
        await super.load();

        // TunnelRoom-specific setup
        // The base room will create floor and walls, but we can add tunnel-specific elements here

        console.log('TunnelRoom: Tunnel room loaded');
    }

    /**
     * Update room (override for TunnelRoom-specific updates)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Call parent update
        super.update(deltaTime, elapsedTime);

        // TunnelRoom-specific updates
        // Could add pulsing lights, atmospheric effects, etc.
    }
}
