/**
 * BarRoom - Bar/lounge area implementation
 *
 * A bar and lounge area for socializing and drinks
 */
import { BaseRoom } from './BaseRoom.js';
import { RoomDefinition } from '../RoomDefinition.js';
import { BarRoomObject } from '../../interactions/RoomSpecificObjects.js';
import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from '../../config/constants.js';

export class BarRoom extends BaseRoom {
    /**
     * Create a new BarRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition (optional, will create default if not provided)
     */
    constructor(scene, definition = null) {
        // Create default definition if not provided
        if (!definition) {
            definition = BarRoom.createDefaultDefinition();
        }

        super(scene, definition);
    }

    /**
     * Create default room definition for BarRoom
     * @returns {RoomDefinition} Default room definition
     */
    static createDefaultDefinition() {
        const elevation = 5.0; // Bar room is upstairs
        const roomSize = ROOM_SIZE * 0.7; // Smaller bar room

        return new RoomDefinition({
            id: 'bar_room',
            name: 'Bar Room',
            type: 'bar',
            size: roomSize,
            height: WALL_HEIGHT,
            elevation: elevation, // Upstairs elevation
            bounds: {
                minX: -roomSize / 2,
                maxX: roomSize / 2,
                minZ: -roomSize / 2,
                maxZ: roomSize / 2,
                minY: elevation,
                maxY: elevation + WALL_HEIGHT,
            },
            spawnPoints: [
                { position: new THREE.Vector3(0, elevation + 0.7, 4), name: 'Bar Front' },
                { position: new THREE.Vector3(-4, elevation + 0.7, 0), name: 'Left Seating' },
                { position: new THREE.Vector3(4, elevation + 0.7, 0), name: 'Right Seating' },
                { position: new THREE.Vector3(0, elevation + 0.7, -4), name: 'Back Area' },
                {
                    position: new THREE.Vector3(0, elevation + 0.7, -roomSize / 2 + 1),
                    name: 'Porch Overlook',
                }, // Porch area
                {
                    position: new THREE.Vector3(-3, elevation + 0.7, -roomSize / 2 + 1),
                    name: 'Porch Left',
                },
                {
                    position: new THREE.Vector3(3, elevation + 0.7, -roomSize / 2 + 1),
                    name: 'Porch Right',
                },
            ],
            lighting: {
                ambient: { color: 0x404040, intensity: 0.6 },
                directional: {
                    color: 0xffffee,
                    intensity: 0.7,
                    position: new THREE.Vector3(4, elevation + 9, 4),
                },
                pointLights: [
                    {
                        color: 0xffaa66,
                        intensity: 1.2,
                        position: new THREE.Vector3(0, elevation + 3, 4),
                        distance: 12,
                    }, // Bar lighting
                    {
                        color: 0x88aaff,
                        intensity: 0.9,
                        position: new THREE.Vector3(-4, elevation + 2, 0),
                        distance: 8,
                    }, // Left area
                    {
                        color: 0x88aaff,
                        intensity: 0.9,
                        position: new THREE.Vector3(4, elevation + 2, 0),
                        distance: 8,
                    }, // Right area
                    {
                        color: 0xffffff,
                        intensity: 0.6,
                        position: new THREE.Vector3(0, elevation + 2, -roomSize / 2 + 0.5),
                        distance: 10,
                    }, // Porch lighting
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
                intensity: 0.7,
            },
            settings: {
                audioEnabled: true,
                collisionsEnabled: true,
                physicsEnabled: true,
            },
            description:
                'An upstairs bar and lounge area with a porch overlooking the main stage. Perfect for socializing and drinks with a view.',
            tags: ['bar', 'lounge', 'social', 'drinks'],
            maxPlayers: 25,
        });
    }

    /**
     * Load the room (override to add BarRoom-specific setup)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        // Call parent load first
        await super.load();

        const elevation = this.definition.elevation || 5.0;
        const roomSize = this.definition.size;

        // BarRoom-specific setup
        // Add bar counter (upstairs)
        const barCounter = new BarRoomObject(this.scene, new THREE.Vector3(0, elevation + 0.5, 4), {
            name: 'Bar Counter',
        });
        barCounter.mesh.userData.objectId = 'bar_counter';
        this.registerRoomObject(barCounter);

        // Add bar seating (upstairs)
        const barSeating1 = new BarRoomObject(
            this.scene,
            new THREE.Vector3(-2, elevation + 0.5, 4),
            { name: 'Bar Seating 1' }
        );
        barSeating1.mesh.userData.objectId = 'bar_seating_1';
        this.registerRoomObject(barSeating1);

        const barSeating2 = new BarRoomObject(
            this.scene,
            new THREE.Vector3(2, elevation + 0.5, 4),
            { name: 'Bar Seating 2' }
        );
        barSeating2.mesh.userData.objectId = 'bar_seating_2';
        this.registerRoomObject(barSeating2);

        // Create porch railing/barrier (overlooking main stage)
        // Porch extends from the back of the bar room
        const porchDepth = 2.0;
        const porchWidth = roomSize;
        const railingHeight = 0.8;

        // Create railing geometry
        const railingGeometry = new THREE.BoxGeometry(porchWidth, railingHeight, 0.1);
        const railingMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
        });

        // Front railing (overlooking stage)
        const frontRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        frontRailing.position.set(0, elevation + railingHeight / 2, -roomSize / 2);
        frontRailing.castShadow = true;
        frontRailing.receiveShadow = true;
        this.scene.add(frontRailing);
        this.registerRoomObject(frontRailing);

        // Side railings
        const sideRailingGeometry = new THREE.BoxGeometry(0.1, railingHeight, porchDepth);
        const leftRailing = new THREE.Mesh(sideRailingGeometry, railingMaterial);
        leftRailing.position.set(
            -porchWidth / 2,
            elevation + railingHeight / 2,
            -roomSize / 2 + porchDepth / 2
        );
        leftRailing.castShadow = true;
        leftRailing.receiveShadow = true;
        this.scene.add(leftRailing);
        this.registerRoomObject(leftRailing);

        const rightRailing = new THREE.Mesh(sideRailingGeometry, railingMaterial);
        rightRailing.position.set(
            porchWidth / 2,
            elevation + railingHeight / 2,
            -roomSize / 2 + porchDepth / 2
        );
        rightRailing.castShadow = true;
        rightRailing.receiveShadow = true;
        this.scene.add(rightRailing);
        this.registerRoomObject(rightRailing);

        // Create "fake view" window/texture on one wall (for future shader integration)
        // Place on the wall opposite the porch (facing away from stage)
        const windowWidth = 8;
        const windowHeight = 4;
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000033,
            transparent: true,
            opacity: 0.8,
        });
        const fakeWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        fakeWindow.position.set(0, elevation + windowHeight / 2, roomSize / 2 - 0.05);
        fakeWindow.rotation.y = Math.PI; // Face inward
        this.scene.add(fakeWindow);
        this.registerRoomObject(fakeWindow);
        fakeWindow.userData.isFakeView = true; // Mark for future shader integration

        console.log('BarRoom: Upstairs bar room with porch loaded');
    }

    /**
     * Update room (override for BarRoom-specific updates)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Call parent update
        super.update(deltaTime, elapsedTime);

        // BarRoom-specific updates
        // Bar animations, ambient effects, etc.
    }
}
