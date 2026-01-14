import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT, STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

/**
 * LightingSetup - Creates all lighting including ambient, spot, ceiling lights, and LED strips
 */
export class LightingSetup {
    constructor(scene) {
        this.scene = scene;
        this.lights = {
            ambient: null,
            spot: null,
            ceiling: [],
            ledStrips: [],
        };
    }

    build() {
        this.createAmbientLight();
        this.createSpotLight();
        this.createCeilingLights();
        this.createLEDStrips();

        return {
            ambient: this.lights.ambient,
            spot: this.lights.spot,
            ceilingLights: this.lights.ceiling,
            ledStrips: this.lights.ledStrips,
        };
    }

    createAmbientLight() {
        // Increased ambient light so players can see where they are
        // Higher intensity for club atmosphere
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased to 0.8 for bright club atmosphere
        this.scene.add(ambientLight);
        this.lights.ambient = ambientLight;
    }

    createSpotLight() {
        // Enhanced spot light for club atmosphere
        const spotLight = new THREE.SpotLight(0xffffff, 2.5); // Increased for bright club lighting
        spotLight.position.set(0, 8, 0);
        spotLight.target.position.set(0, 0, 0);
        spotLight.angle = Math.PI / 3; // Wider angle
        spotLight.penumbra = 0.2;
        spotLight.castShadow = true;
        spotLight.distance = 50; // Longer range
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
        this.lights.spot = spotLight;
    }

    createCeilingLights() {
        const ceilingLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // Reduced from 1.0 to 0.3 for less intense bulbs
        });

        // Add multiple rows of ceiling lights
        const lightCountPerRow = 6;
        const rowCount = 3; // Three rows of lights
        const rowSpacing = 4; // Spacing between rows

        for (let row = 0; row < rowCount; row++) {
            const rowZ = -STAGE_SIZE / 2 - 2 + row * rowSpacing;

            for (let i = 0; i < lightCountPerRow; i++) {
                const lightHousing = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.2, 0.3),
                    new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
                );
                const lightX = -ROOM_SIZE / 2 + (i + 1) * (ROOM_SIZE / (lightCountPerRow + 1));
                lightHousing.position.set(lightX, WALL_HEIGHT - 0.1, rowZ);
                lightHousing.castShadow = true;
                this.scene.add(lightHousing);

                const lightBulb = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 8, 8),
                    ceilingLightMaterial
                );
                lightBulb.position.set(0, -0.15, 0);
                lightHousing.add(lightBulb);

                // Add point light with enhanced intensity for club atmosphere
                const pointLight = new THREE.PointLight(0xffffff, 2.5, 20); // Increased intensity and range
                pointLight.position.set(lightX, WALL_HEIGHT - 0.2, rowZ);
                pointLight.castShadow = true;
                this.scene.add(pointLight);

                this.lights.ceiling.push({
                    housing: lightHousing,
                    bulb: lightBulb,
                    light: pointLight,
                });
            }
        }
    }

    createLEDStrips() {
        const ledMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Reduced from 0.8 to 0.3 for less intense LEDs
        });

        // LED strip along front of stage
        const frontLED = new THREE.Mesh(new THREE.BoxGeometry(STAGE_SIZE, 0.05, 0.1), ledMaterial);
        frontLED.position.set(0, STAGE_HEIGHT + 0.3, -STAGE_SIZE / 2);
        frontLED.userData.preserveColor = true; // Preserve color - LED strips should remain green
        this.scene.add(frontLED);
        this.lights.ledStrips.push(frontLED);

        // LED strips along wall corners
        const cornerLEDHeight = 0.05;
        const cornerLEDDepth = 0.1;

        // Left wall corner LED
        const leftCornerLED = new THREE.Mesh(
            new THREE.BoxGeometry(cornerLEDDepth, WALL_HEIGHT, cornerLEDHeight),
            ledMaterial
        );
        leftCornerLED.position.set(-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
        leftCornerLED.userData.preserveColor = true; // Preserve color - LED strips should remain green
        this.scene.add(leftCornerLED);
        this.lights.ledStrips.push(leftCornerLED);

        // Right wall corner LED
        const rightCornerLED = new THREE.Mesh(
            new THREE.BoxGeometry(cornerLEDDepth, WALL_HEIGHT, cornerLEDHeight),
            ledMaterial
        );
        rightCornerLED.position.set(ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
        rightCornerLED.userData.preserveColor = true; // Preserve color - LED strips should remain green
        this.scene.add(rightCornerLED);
        this.lights.ledStrips.push(rightCornerLED);
    }
}
