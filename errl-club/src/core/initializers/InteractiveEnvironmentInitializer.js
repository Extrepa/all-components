/**
 * InteractiveEnvironmentInitializer - Handles interactive environment objects initialization
 */
import * as THREE from 'three';
import { Door } from '../../interactions/Door.js';
import { Teleporter } from '../../interactions/Teleporter.js';
import { FogVent } from '../../interactions/FogVent.js';
import { SeatableObject } from '../../interactions/SeatableObject.js';
import { MovingPlatform } from '../../interactions/MovingPlatform.js';
import { VentilationFan } from '../../interactions/VentilationFan.js';
import { InteractiveScreen } from '../../interactions/InteractiveScreen.js';
import { PortalRift } from '../../interactions/PortalRift.js';
import { PushableProp } from '../../interactions/PushableProp.js';
import { ROOM_SIZE, WALL_HEIGHT } from '../../config/constants.js';

export class InteractiveEnvironmentInitializer {
    /**
     * Initialize interactive environment elements
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} avatar - The avatar instance
     * @param {Object} systems - Systems object containing particleSystem, physicsSystem, etc.
     * @returns {Object} Object containing all interactive objects
     */
    static initialize(scene, avatar, systems) {
        const doors = [];
        const teleporters = [];
        const fogVents = [];
        const seatableObjects = [];

        // Doors (with room destinations - placeholder room IDs for now)
        const leftDoor = new Door(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 - 1.5, 2.5, -5),
            'horizontal',
            { width: 2, height: 3, depth: 0.2 },
            'visualizer_room'
        );
        const rightDoor = new Door(
            scene,
            new THREE.Vector3(ROOM_SIZE / 2 + 1.5, 2.5, -5),
            'horizontal',
            { width: 2, height: 3, depth: 0.2 },
            'main_club_room'
        );
        doors.push(leftDoor, rightDoor);

        // Teleporters
        const teleporter1 = new Teleporter(
            scene,
            new THREE.Vector3(3, 0.1, -3),
            new THREE.Vector3(-3, 0.7, -3),
            'Teleporter 1'
        );
        const teleporter2 = new Teleporter(
            scene,
            new THREE.Vector3(-3, 0.1, -3),
            new THREE.Vector3(3, 0.7, -3),
            'Teleporter 2'
        );
        teleporters.push(teleporter1, teleporter2);

        // Create visualizer room
        const visualizerRoomData = InteractiveEnvironmentInitializer.createVisualizerRoom(
            scene,
            teleporters
        );

        // Fog vents
        const fogVent1 = new FogVent(scene, new THREE.Vector3(-4, 0.1, -4), systems.particleSystem);
        const fogVent2 = new FogVent(scene, new THREE.Vector3(4, 0.1, -4), systems.particleSystem);
        const fogVent3 = new FogVent(scene, new THREE.Vector3(0, 0.1, 4), systems.particleSystem);
        fogVents.push(fogVent1, fogVent2, fogVent3);

        // Seatable objects
        const chair1 = new SeatableObject(scene, new THREE.Vector3(-6, 0.25, -3), 'chair');
        const chair2 = new SeatableObject(scene, new THREE.Vector3(-6, 0.25, -1), 'chair');
        const bench1 = new SeatableObject(scene, new THREE.Vector3(6, 0.25, -3), 'bench', {
            width: 1.5,
            height: 0.4,
            depth: 0.6,
        });
        seatableObjects.push(chair1, chair2, bench1);

        // Moving platforms - repositioned to walls
        const movingPlatforms = [];
        // Lower platform: runs along left wall (moves back and forth along Z axis)
        const platform1 = new MovingPlatform(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 + 1.5, 1, -ROOM_SIZE / 2 + 2), // Start near left wall, front
            new THREE.Vector3(-ROOM_SIZE / 2 + 1.5, 1, ROOM_SIZE / 2 - 2), // End near left wall, back
            1.5,
            1.0
        );
        // Higher platform: extends over the room from wall to wall (moves along X axis)
        const platform2 = new MovingPlatform(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 + 2, 2.5, 0), // Start at left wall, center Z
            new THREE.Vector3(ROOM_SIZE / 2 - 2, 2.5, 0), // End at right wall, center Z
            1.0,
            0.5
        );
        movingPlatforms.push(platform1, platform2);

        // Register platforms with collision system if available
        if (systems.collisionSystem) {
            for (const platform of movingPlatforms) {
                systems.collisionSystem.registerMovingPlatform(platform);
            }
        }

        // Ventilation fans
        const ventilationFans = [];
        const fan1 = new VentilationFan(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 + 1, 3, -3),
            1.5,
            2.0
        );
        const fan2 = new VentilationFan(
            scene,
            new THREE.Vector3(ROOM_SIZE / 2 - 1, 3, -3),
            1.5,
            2.0
        );
        const fan3 = new VentilationFan(
            scene,
            new THREE.Vector3(0, 3, ROOM_SIZE / 2 - 1),
            1.5,
            1.5
        );
        ventilationFans.push(fan1, fan2, fan3);

        // Interactive screens
        const interactiveScreens = [];
        const screen1 = new InteractiveScreen(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 + 0.5, 2, -5),
            { width: 2, height: 1.5 }
        );
        const screen2 = new InteractiveScreen(
            scene,
            new THREE.Vector3(ROOM_SIZE / 2 - 0.5, 2, -5),
            { width: 2, height: 1.5 }
        );
        interactiveScreens.push(screen1, screen2);

        // Portal rifts - positioned in corners, completely flat against walls like doorways
        const portalRifts = [];
        const portalOffset = 0.001; // Minimal offset to prevent z-fighting, but essentially flush with wall
        const cornerOffset = 3.5; // Distance from corner - move portals closer to corners

        // Portal 1: Left wall, near front corner (closer to corner)
        const portal1 = new PortalRift(
            scene,
            new THREE.Vector3(-ROOM_SIZE / 2 + portalOffset, 2, ROOM_SIZE / 2 - cornerOffset), // Left wall, near front corner
            new THREE.Vector3(ROOM_SIZE / 2 - portalOffset, 2, -ROOM_SIZE / 2 + cornerOffset), // Destination at right wall, back corner
            'Portal 1'
        );
        // Position portal exactly at wall, closer to corner
        if (portal1.mesh) {
            portal1.mesh.position.set(
                -ROOM_SIZE / 2 + portalOffset,
                2,
                ROOM_SIZE / 2 - cornerOffset
            );
            portal1.mesh.rotation.y = Math.PI / 2; // Face inward (toward center)
        }

        // Portal 2: Right wall, near back corner (closer to corner)
        const portal2 = new PortalRift(
            scene,
            new THREE.Vector3(ROOM_SIZE / 2 - portalOffset, 2, -ROOM_SIZE / 2 + cornerOffset), // Right wall, near back corner
            new THREE.Vector3(-ROOM_SIZE / 2 + portalOffset, 2, ROOM_SIZE / 2 - cornerOffset), // Destination at left wall, front corner
            'Portal 2'
        );
        // Position portal exactly at wall, closer to corner
        if (portal2.mesh) {
            portal2.mesh.position.set(
                ROOM_SIZE / 2 - portalOffset,
                2,
                -ROOM_SIZE / 2 + cornerOffset
            );
            portal2.mesh.rotation.y = -Math.PI / 2; // Face inward (toward center)
        }

        portalRifts.push(portal1, portal2);

        // Pushable props
        const pushableProps = [];
        const crate1 = new PushableProp(
            scene,
            new THREE.Vector3(2, 0.25, 2),
            { width: 0.6, height: 0.6, depth: 0.6 },
            'crate'
        );
        const crate2 = new PushableProp(
            scene,
            new THREE.Vector3(-2, 0.25, 2),
            { width: 0.6, height: 0.6, depth: 0.6 },
            'crate'
        );
        const barrel1 = new PushableProp(
            scene,
            new THREE.Vector3(0, 0.3, 3),
            { width: 0.5, height: 0.6, depth: 0.5 },
            'barrel'
        );
        pushableProps.push(crate1, crate2, barrel1);

        // Register pushable props with physics system
        for (const prop of pushableProps) {
            const mesh = prop.getMesh ? prop.getMesh() : prop.mesh;
            if (mesh && systems.physicsSystem) {
                systems.physicsSystem.registerPushableObject(
                    mesh,
                    prop.mass || 1.0,
                    prop.friction || 0.8
                );
            }
        }

        // Throwable drips (initialized as empty array)
        const throwableDrips = [];

        // Store interactive objects for later registration
        // (Registration will happen in initializeInteractiveRegistration after all systems are ready)

        // Note: Visual effects (sweeping lasers, hallucination zone) will be created
        // after effects system is initialized in Phase 8

        return {
            doors,
            teleporters,
            fogVents,
            seatableObjects,
            movingPlatforms,
            ventilationFans,
            interactiveScreens,
            portalRifts,
            pushableProps,
            throwableDrips,
            visualizerLights: visualizerRoomData.visualizerLights,
            visualizerLEDStrips: visualizerRoomData.visualizerLEDStrips,
            // Store references for later registration
            _interactiveScreens: interactiveScreens,
            _portalRifts: portalRifts,
        };
    }

    /**
     * Create visualizer room
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Array} teleporters - Array of teleporters to add the visualizer room teleporter to
     * @returns {Object} Object containing visualizerLights and visualizerLEDStrips
     */
    static createVisualizerRoom(scene, teleporters) {
        const visualizerRoomPosition = new THREE.Vector3(ROOM_SIZE + 5, 0.5, 0);
        const mainRoomReturnPosition = new THREE.Vector3(ROOM_SIZE / 2 - 2, 0.5, ROOM_SIZE / 2 - 2);

        // Teleporter TO visualizer room (from main room)
        const visualizerRoomTeleporter = new Teleporter(
            scene,
            mainRoomReturnPosition,
            visualizerRoomPosition,
            'Visualizer Room'
        );
        teleporters.push(visualizerRoomTeleporter);
        visualizerRoomTeleporter.padMesh.userData.isVisualizerRoom = true;

        // Teleporter BACK to main room (from visualizer room)
        const mainRoomTeleporter = new Teleporter(
            scene,
            visualizerRoomPosition.clone().add(new THREE.Vector3(0, 0, 0)),
            mainRoomReturnPosition,
            'Main Club Room'
        );
        teleporters.push(mainRoomTeleporter);
        mainRoomTeleporter.padMesh.userData.isMainRoom = true;

        const visualizerRoomSize = ROOM_SIZE * 0.8;
        const visualizerRoomHeight = WALL_HEIGHT;

        // Floor
        const visualizerFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(visualizerRoomSize, visualizerRoomSize),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
            })
        );
        visualizerFloor.rotation.x = -Math.PI / 2;
        visualizerFloor.position.copy(visualizerRoomPosition);
        visualizerFloor.position.y = 0;
        visualizerFloor.receiveShadow = true;
        visualizerFloor.userData.isVisualizerRoom = true;
        scene.add(visualizerFloor);

        // Walls
        const visualizerWallMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });

        const visualizerWalls = [];
        const wallPositions = [
            {
                pos: new THREE.Vector3(0, visualizerRoomHeight / 2, -visualizerRoomSize / 2),
                rot: 0,
            },
            {
                pos: new THREE.Vector3(-visualizerRoomSize / 2, visualizerRoomHeight / 2, 0),
                rot: Math.PI / 2,
            },
            {
                pos: new THREE.Vector3(visualizerRoomSize / 2, visualizerRoomHeight / 2, 0),
                rot: -Math.PI / 2,
            },
            {
                pos: new THREE.Vector3(0, visualizerRoomHeight / 2, visualizerRoomSize / 2),
                rot: Math.PI,
            },
        ];

        wallPositions.forEach(({ pos, rot }) => {
            const wall = new THREE.Mesh(
                new THREE.PlaneGeometry(visualizerRoomSize, visualizerRoomHeight),
                visualizerWallMaterial.clone()
            );
            wall.rotation.y = rot;
            wall.position.copy(visualizerRoomPosition).add(pos);
            wall.receiveShadow = true;
            wall.userData.isVisualizerRoom = true;
            scene.add(wall);
            visualizerWalls.push(wall);
        });

        // Ceiling
        const visualizerCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(visualizerRoomSize, visualizerRoomSize),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
            })
        );
        visualizerCeiling.rotation.x = Math.PI / 2;
        visualizerCeiling.position.copy(visualizerRoomPosition);
        visualizerCeiling.position.y = visualizerRoomHeight;
        visualizerCeiling.userData.isVisualizerRoom = true;
        scene.add(visualizerCeiling);

        // LED strips
        const visualizerLEDStrips = [];
        for (let i = 0; i < 8; i++) {
            const ledGeometry = new THREE.BoxGeometry(visualizerRoomSize * 0.8, 0.1, 0.1);
            const ledMaterial = new THREE.MeshBasicMaterial({
                color: 0x4400ff,
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.copy(visualizerRoomPosition);
            led.position.y = 1 + i * 0.5;
            led.position.z = -visualizerRoomSize / 2 + 0.1;
            led.userData.isVisualizerRoom = true;
            led.userData.isVisualizerLED = true;
            scene.add(led);
            visualizerLEDStrips.push(led);
        }

        // Lights
        const visualizerLights = [];
        for (let i = 0; i < 6; i++) {
            const light = new THREE.PointLight(0x4400ff, 2, 10);
            light.position.copy(visualizerRoomPosition);
            light.position.x += ((i % 3) - 1) * 3;
            light.position.z += Math.floor(i / 3) * 3 - 1.5;
            light.position.y = 2;
            light.userData.isVisualizerRoom = true;
            light.userData.isVisualizerLight = true;
            scene.add(light);
            visualizerLights.push(light);
        }

        console.log('Visualizer room created');
        console.log(
            '%c=== ROOM NAVIGATION ===',
            'font-size: 14px; font-weight: bold; color: #00ffff;'
        );
        console.log('You are in the MAIN CLUB ROOM');
        console.log(
            'Find the cyan teleporter pad to enter the Visualizer Room (dark room with intense effects)'
        );
        console.log('The Visualizer Room has a teleporter to return to the main room');
        console.log('Press Y to teleport to nearest anchor if you get stuck');

        return {
            visualizerLights,
            visualizerLEDStrips,
        };
    }
}
