import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT, STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

/**
 * RoomBuilder - Creates all room geometry including floor, walls, ceiling, stage, and decorative elements
 */
export class RoomBuilder {
    constructor(scene) {
        this.scene = scene;
        this.materials = {};
        this.objects = {};
        this.speakerCones = [];
    }

    build() {
        // Create materials
        this.createMaterials();

        // Create basic room structure
        this.createFloor();
        this.createWalls();
        this.createCeiling();
        this.createStage();

        // Create DJ booth
        this.createDJBooth();

        // Create decorative elements
        this.createBeams();
        this.createAlcove();
        this.createHallways();
        this.createTrim();
        this.createSubwoofers();
        this.createSpeakerStacks();
        this.createCables();
        this.createFloorGrates();
        this.createVentilationFans();

        // Create computer desk
        this.createComputerDesk();

        // Create disco ball
        this.createDiscoBall();

        return {
            materials: this.materials,
            objects: this.objects,
            speakerCones: this.speakerCones,
        };
    }

    createMaterials() {
        // Floor material
        this.materials.floor = new THREE.MeshBasicMaterial({
            color: 0x333333,
        });

        // Wall material
        this.materials.wall = new THREE.MeshBasicMaterial({
            color: 0x222222,
        });

        // Stage material
        this.materials.stage = new THREE.MeshBasicMaterial({
            color: 0x444444,
        });
        // Step 76: Add fake reflections on the stage floor
        this.materials.stage.metalness = 0.8;
        this.materials.stage.roughness = 0.2;

        // Step 78: Add fresnel-style rim-light effect
        this.materials.wall.metalness = 0.2;
        this.materials.wall.roughness = 0.6;

        // DJ booth material
        this.materials.booth = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
        });

        // Panel material (emissive)
        this.materials.panel = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
        });

        // Ceiling material
        this.materials.ceiling = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
        });

        // Beam material
        this.materials.beam = new THREE.MeshBasicMaterial({
            color: 0x2a2a2a,
        });

        // Alcove material
        this.materials.alcove = new THREE.MeshBasicMaterial({
            color: 0x151515,
        });

        // Trim material
        this.materials.trim = new THREE.MeshBasicMaterial({
            color: 0x555555,
        });

        // Subwoofer material
        this.materials.subwoofer = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
        });

        // Speaker material
        this.materials.speaker = new THREE.MeshBasicMaterial({
            color: 0x2a2a2a,
        });

        // Cable material
        this.materials.cable = new THREE.MeshBasicMaterial({
            color: 0x333333,
        });

        // Fan material
        this.materials.fan = new THREE.MeshBasicMaterial({
            color: 0x3a3a3a,
        });
    }

    createFloor() {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
            this.materials.floor
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.objects.floor = floor;
    }

    createWalls() {
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT),
            this.materials.wall
        );
        backWall.position.set(0, WALL_HEIGHT / 2, -ROOM_SIZE / 2);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        this.objects.backWall = backWall;

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT),
            this.materials.wall
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        this.objects.leftWall = leftWall;

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT),
            this.materials.wall
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        this.objects.rightWall = rightWall;
    }

    createCeiling() {
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
            this.materials.ceiling
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = WALL_HEIGHT;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        this.objects.ceiling = ceiling;
    }

    createStage() {
        const stage = new THREE.Mesh(
            new THREE.BoxGeometry(STAGE_SIZE, STAGE_HEIGHT, STAGE_SIZE),
            this.materials.stage
        );
        stage.position.set(0, STAGE_HEIGHT / 2, -STAGE_SIZE / 2);
        stage.castShadow = true;
        stage.receiveShadow = true;
        this.scene.add(stage);
        this.objects.stage = stage;
    }

    createDJBooth() {
        const boothWidth = 2;
        const boothHeight = 3;
        const boothDepth = 1.5;

        const djBooth = new THREE.Mesh(
            new THREE.BoxGeometry(boothWidth, boothHeight, boothDepth),
            this.materials.booth
        );
        // Lowered DJ platform - reduced height offset by 0.5 units
        djBooth.position.set(
            0,
            boothHeight / 2 + STAGE_HEIGHT - 0.5,
            -STAGE_SIZE / 2 - boothDepth / 2
        );
        djBooth.castShadow = true;
        djBooth.receiveShadow = true;
        this.scene.add(djBooth);
        this.objects.djBooth = djBooth;

        // Add emissive panel on front of booth
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(boothWidth * 0.8, boothHeight * 0.6),
            this.materials.panel
        );
        // Adjusted panel position to match lowered booth
        panel.position.set(0, boothHeight * 0.7 + STAGE_HEIGHT - 0.5, -STAGE_SIZE / 2 - boothDepth);
        panel.userData.preserveColor = true; // Preserve color - panel should remain green
        this.scene.add(panel);
        this.objects.panel = panel;
    }

    createBeams() {
        const beamCount = 5;
        const beamSpacing = ROOM_SIZE / (beamCount + 1);

        for (let i = 1; i <= beamCount; i++) {
            const beamZ = -ROOM_SIZE / 2 + i * beamSpacing;

            // Main horizontal beam
            const mainBeam = new THREE.Mesh(
                new THREE.BoxGeometry(ROOM_SIZE, 0.2, 0.3),
                this.materials.beam
            );
            mainBeam.position.set(0, WALL_HEIGHT - 0.1, beamZ);
            mainBeam.castShadow = true;
            this.scene.add(mainBeam);

            // Support columns from beam to ceiling
            const columnHeight = 0.5;
            for (let j = -2; j <= 2; j += 2) {
                const column = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, columnHeight, 0.15),
                    this.materials.beam
                );
                column.position.set(j * 3, WALL_HEIGHT - columnHeight / 2, beamZ);
                column.castShadow = true;
                this.scene.add(column);
            }
        }
    }

    createAlcove() {
        const alcoveDepth = 2;
        const alcoveWidth = 4;
        const alcoveHeight = 4;

        const alcove = new THREE.Mesh(
            new THREE.BoxGeometry(alcoveWidth, alcoveHeight, alcoveDepth),
            this.materials.alcove
        );
        alcove.position.set(0, alcoveHeight / 2, -ROOM_SIZE / 2 - alcoveDepth / 2);
        alcove.castShadow = true;
        alcove.receiveShadow = true;
        this.scene.add(alcove);
        this.objects.alcove = alcove;

        // Add alcove back wall
        const alcoveBackWall = new THREE.Mesh(
            new THREE.PlaneGeometry(alcoveWidth, alcoveHeight),
            this.materials.wall
        );
        alcoveBackWall.position.set(0, alcoveHeight / 2, -ROOM_SIZE / 2 - alcoveDepth);
        alcoveBackWall.receiveShadow = true;
        this.scene.add(alcoveBackWall);
        this.objects.alcoveBackWall = alcoveBackWall;
    }

    createHallways() {
        const hallwayWidth = 3;
        const hallwayHeight = 5;
        const hallwayDepth = 1;

        // Left hallway entrance
        const leftHallway = new THREE.Mesh(
            new THREE.BoxGeometry(hallwayWidth, hallwayHeight, hallwayDepth),
            this.materials.wall
        );
        leftHallway.position.set(-ROOM_SIZE / 2 - hallwayDepth / 2, hallwayHeight / 2, 0);
        leftHallway.castShadow = true;
        leftHallway.receiveShadow = true;
        this.scene.add(leftHallway);
        this.objects.leftHallway = leftHallway;

        // Right hallway entrance
        const rightHallway = new THREE.Mesh(
            new THREE.BoxGeometry(hallwayWidth, hallwayHeight, hallwayDepth),
            this.materials.wall
        );
        rightHallway.position.set(ROOM_SIZE / 2 + hallwayDepth / 2, hallwayHeight / 2, 0);
        rightHallway.castShadow = true;
        rightHallway.receiveShadow = true;
        this.scene.add(rightHallway);
        this.objects.rightHallway = rightHallway;
    }

    createTrim() {
        const trimHeight = 0.1;
        const trimWidth = 0.2;

        // Front trim
        const frontTrim = new THREE.Mesh(
            new THREE.BoxGeometry(STAGE_SIZE, trimHeight, trimWidth),
            this.materials.trim
        );
        frontTrim.position.set(0, STAGE_HEIGHT + trimHeight / 2, -STAGE_SIZE / 2 - trimWidth / 2);
        frontTrim.castShadow = true;
        this.scene.add(frontTrim);
        this.objects.frontTrim = frontTrim;

        // Left trim
        const leftTrim = new THREE.Mesh(
            new THREE.BoxGeometry(trimWidth, trimHeight, STAGE_SIZE),
            this.materials.trim
        );
        leftTrim.position.set(
            -STAGE_SIZE / 2 - trimWidth / 2,
            STAGE_HEIGHT + trimHeight / 2,
            -STAGE_SIZE / 2
        );
        leftTrim.castShadow = true;
        this.scene.add(leftTrim);
        this.objects.leftTrim = leftTrim;

        // Right trim
        const rightTrim = new THREE.Mesh(
            new THREE.BoxGeometry(trimWidth, trimHeight, STAGE_SIZE),
            this.materials.trim
        );
        rightTrim.position.set(
            STAGE_SIZE / 2 + trimWidth / 2,
            STAGE_HEIGHT + trimHeight / 2,
            -STAGE_SIZE / 2
        );
        rightTrim.castShadow = true;
        this.scene.add(rightTrim);
        this.objects.rightTrim = rightTrim;
    }

    createSubwoofers() {
        // Big subwoofers - three on each side in front of the stage
        const subwooferWidth = 2.5; // Bigger width
        const subwooferHeight = 2.0; // Taller
        const subwooferDepth = 1.8; // Deeper
        const subCount = 3; // Three subs per side
        const frontOffset = 2.0; // Distance in front of stage
        const spacing = 2.5; // Spacing between subs

        // Calculate starting position (left side, in front of stage)
        const stageFrontZ = -STAGE_SIZE / 2 + frontOffset; // Front edge of stage + offset
        const startX = -STAGE_SIZE / 2 - 0.5; // Left side of stage, slightly out
        const centerX = 0;

        // Left side subwoofers (3 big subs)
        for (let i = 0; i < subCount; i++) {
            const x = startX - i * spacing - subwooferWidth / 2;
            const z = stageFrontZ;

            const subwoofer = new THREE.Mesh(
                new THREE.BoxGeometry(subwooferWidth, subwooferHeight, subwooferDepth),
                this.materials.subwoofer
            );
            subwoofer.position.set(x, subwooferHeight / 2, z);
            subwoofer.castShadow = true;
            subwoofer.receiveShadow = true;
            this.scene.add(subwoofer);

            // Add subwoofer cone (grille) on the front
            const coneGeometry = new THREE.CylinderGeometry(
                subwooferWidth * 0.35,
                subwooferWidth * 0.4,
                0.1,
                16
            );
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.rotation.x = Math.PI / 2;
            cone.position.set(0, subwooferHeight * 0.4, subwooferDepth / 2 + 0.05);
            subwoofer.add(cone);

            if (i === 0) {
                this.objects.leftSubwoofer = subwoofer; // Keep reference for first one
            }
        }

        // Right side subwoofers (3 big subs)
        for (let i = 0; i < subCount; i++) {
            const x = -startX + i * spacing + subwooferWidth / 2; // Mirror to right side
            const z = stageFrontZ;

            const subwoofer = new THREE.Mesh(
                new THREE.BoxGeometry(subwooferWidth, subwooferHeight, subwooferDepth),
                this.materials.subwoofer
            );
            subwoofer.position.set(x, subwooferHeight / 2, z);
            subwoofer.castShadow = true;
            subwoofer.receiveShadow = true;
            this.scene.add(subwoofer);

            // Add subwoofer cone (grille) on the front
            const coneGeometry = new THREE.CylinderGeometry(
                subwooferWidth * 0.35,
                subwooferWidth * 0.4,
                0.1,
                16
            );
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.rotation.x = Math.PI / 2;
            cone.position.set(0, subwooferHeight * 0.4, subwooferDepth / 2 + 0.05);
            subwoofer.add(cone);

            if (i === 0) {
                this.objects.rightSubwoofer = subwoofer; // Keep reference for first one
            }
        }
    }

    createSpeakerStacks() {
        const speakerWidth = 0.8;
        const speakerHeight = 0.6;
        const speakerDepth = 0.5;
        const speakersPerStack = 4;

        // Left speaker stack
        for (let i = 0; i < speakersPerStack; i++) {
            const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(speakerWidth, speakerHeight, speakerDepth),
                this.materials.speaker
            );
            speaker.position.set(
                -STAGE_SIZE / 2 - 1.5,
                i * speakerHeight + speakerHeight / 2,
                -STAGE_SIZE / 2
            );
            speaker.castShadow = true;
            this.scene.add(speaker);

            // Add speaker cone (will be animated)
            const coneGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 16);
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.set(0, 0, speakerDepth / 2 + 0.05);
            cone.rotation.x = Math.PI / 2;
            speaker.add(cone);
            this.speakerCones.push({ cone, baseZ: speakerDepth / 2 + 0.05 });
        }

        // Right speaker stack
        for (let i = 0; i < speakersPerStack; i++) {
            const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(speakerWidth, speakerHeight, speakerDepth),
                this.materials.speaker
            );
            speaker.position.set(
                STAGE_SIZE / 2 + 1.5,
                i * speakerHeight + speakerHeight / 2,
                -STAGE_SIZE / 2
            );
            speaker.castShadow = true;
            this.scene.add(speaker);

            // Add speaker cone (will be animated)
            const coneGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 16);
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.set(0, 0, speakerDepth / 2 + 0.05);
            cone.rotation.x = Math.PI / 2;
            speaker.add(cone);
            this.speakerCones.push({ cone, baseZ: speakerDepth / 2 + 0.05 });
        }
    }

    createCables() {
        // Add a few cables on the floor
        for (let i = 0; i < 3; i++) {
            const cable = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 3, 8),
                this.materials.cable
            );
            cable.rotation.z = Math.PI / 2;
            cable.position.set(-2 + i * 2, 0.05, -STAGE_SIZE / 2 - 2);
            cable.receiveShadow = true;
            this.scene.add(cable);
        }
    }

    createFloorGrates() {
        const grateCanvas = document.createElement('canvas');
        grateCanvas.width = 256;
        grateCanvas.height = 256;
        const grateContext = grateCanvas.getContext('2d');
        grateContext.fillStyle = '#1a1a1a';
        grateContext.fillRect(0, 0, 256, 256);
        grateContext.strokeStyle = '#444444';
        grateContext.lineWidth = 2;
        const gridSize = 32;
        for (let i = 0; i <= 8; i++) {
            const pos = i * gridSize;
            grateContext.beginPath();
            grateContext.moveTo(pos, 0);
            grateContext.lineTo(pos, 256);
            grateContext.stroke();
            grateContext.beginPath();
            grateContext.moveTo(0, pos);
            grateContext.lineTo(256, pos);
            grateContext.stroke();
        }

        const grateTexture = new THREE.CanvasTexture(grateCanvas);
        grateTexture.wrapS = THREE.RepeatWrapping;
        grateTexture.wrapT = THREE.RepeatWrapping;
        grateTexture.repeat.set(4, 4);

        const grateMaterial = new THREE.MeshBasicMaterial({
            map: grateTexture,
        });

        const grate = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), grateMaterial);
        grate.rotation.x = -Math.PI / 2;
        grate.position.set(-3, 0.01, -STAGE_SIZE / 2 - 1);
        grate.receiveShadow = true;
        this.scene.add(grate);
        this.objects.grate = grate;
    }

    createVentilationFans() {
        // Fan on left wall
        const leftFanHousing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16),
            this.materials.fan
        );
        leftFanHousing.rotation.z = Math.PI / 2;
        leftFanHousing.position.set(-ROOM_SIZE / 2 + 0.1, WALL_HEIGHT - 2, 2);
        leftFanHousing.castShadow = true;
        this.scene.add(leftFanHousing);
        this.objects.leftFanHousing = leftFanHousing;

        const leftFanBlades = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.05, 0.3),
            new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
        );
        leftFanBlades.position.copy(leftFanHousing.position);
        leftFanBlades.rotation.z = Math.PI / 2;
        this.scene.add(leftFanBlades);
        this.objects.leftFanBlades = leftFanBlades;

        // Fan on right wall
        const rightFanHousing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16),
            this.materials.fan
        );
        rightFanHousing.rotation.z = Math.PI / 2;
        rightFanHousing.position.set(ROOM_SIZE / 2 - 0.1, WALL_HEIGHT - 2, -2);
        rightFanHousing.castShadow = true;
        this.scene.add(rightFanHousing);
        this.objects.rightFanHousing = rightFanHousing;

        const rightFanBlades = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.05, 0.3),
            new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
        );
        rightFanBlades.position.copy(rightFanHousing.position);
        rightFanBlades.rotation.z = Math.PI / 2;
        this.scene.add(rightFanBlades);
        this.objects.rightFanBlades = rightFanBlades;
    }

    createComputerDesk() {
        // Desk material
        const deskMaterial = new THREE.MeshBasicMaterial({
            color: 0x2a2a2a,
        });

        // Computer material
        const computerMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
        });

        // Screen material
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });

        // Desk position - near the back wall, off to one side
        const deskX = -ROOM_SIZE / 2 + 4;
        const deskZ = ROOM_SIZE / 2 - 3;
        const deskHeight = 0.7;
        const deskWidth = 1.5;
        const deskDepth = 0.8;

        // Create desk surface
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(deskWidth, 0.05, deskDepth),
            deskMaterial
        );
        desk.position.set(deskX, deskHeight, deskZ);
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);
        this.objects.desk = desk;

        // Create desk legs
        const legSize = 0.05;
        const legHeight = deskHeight;
        const legPositions = [
            [-deskWidth / 2 + legSize, -deskHeight / 2, -deskDepth / 2 + legSize],
            [deskWidth / 2 - legSize, -deskHeight / 2, -deskDepth / 2 + legSize],
            [-deskWidth / 2 + legSize, -deskHeight / 2, deskDepth / 2 - legSize],
            [deskWidth / 2 - legSize, -deskHeight / 2, deskDepth / 2 - legSize],
        ];

        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(legSize, legHeight, legSize),
                deskMaterial
            );
            leg.position.set(deskX + x, y + legHeight / 2, deskZ + z);
            leg.castShadow = true;
            this.scene.add(leg);
        });

        // Create computer tower/base
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.3), computerMaterial);
        tower.position.set(deskX - deskWidth / 2 + 0.25, deskHeight + 0.2, deskZ);
        tower.castShadow = true;
        this.scene.add(tower);
        this.objects.computerTower = tower;

        // Create monitor base
        const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), computerMaterial);
        monitorBase.position.set(deskX + deskWidth / 2 - 0.3, deskHeight + 0.025, deskZ);
        monitorBase.castShadow = true;
        this.scene.add(monitorBase);

        // Create monitor screen
        const monitorWidth = 0.5;
        const monitorHeight = 0.35;
        const monitor = new THREE.Mesh(
            new THREE.PlaneGeometry(monitorWidth, monitorHeight),
            screenMaterial
        );
        monitor.position.set(deskX + deskWidth / 2 - 0.3, deskHeight + 0.2, deskZ + 0.01);
        monitor.rotation.x = -0.1; // Slight tilt
        this.scene.add(monitor);
        this.objects.computerScreen = monitor;

        // Create monitor stand/neck
        const monitorStand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
            computerMaterial
        );
        monitorStand.position.set(deskX + deskWidth / 2 - 0.3, deskHeight + 0.125, deskZ);
        monitorStand.castShadow = true;
        this.scene.add(monitorStand);
    }

    /**
     * Create a disco ball hanging from the ceiling
     */
    createDiscoBall() {
        // Disco ball material - reflective and emissive
        const discoMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        });

        // Create disco ball (sphere with many segments for mirror effect)
        const discoGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const discoBall = new THREE.Mesh(discoGeometry, discoMaterial);

        // Position disco ball hanging from ceiling, centered in room
        discoBall.position.set(0, WALL_HEIGHT - 1.5, 0);

        // Add chain/cable to hang it
        const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        const chainMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
        });
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(0, WALL_HEIGHT - 0.75, 0);
        chain.rotation.z = Math.PI / 2;

        // Group disco ball and chain
        const discoGroup = new THREE.Group();
        discoGroup.add(discoBall);
        discoGroup.add(chain);

        this.scene.add(discoGroup);
        this.objects.discoBall = discoGroup;
    }

    getObjects() {
        return this.objects;
    }
}
