/**
 * DJBoothLighting - Dynamic lighting effects for the DJ booth area
 *
 * Creates spotlights, color-changing lights, and rim lighting that react to music
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

export class DJBoothLighting {
    /**
     * Create a new DJ booth lighting system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     */
    constructor(scene, config = {}) {
        this.scene = scene;

        // DJ booth position (from RoomBuilder.createDJBooth)
        this.boothWidth = 2;
        this.boothHeight = 3;
        this.boothDepth = 1.5;
        this.boothPosition = new THREE.Vector3(
            0,
            this.boothHeight / 2 + STAGE_HEIGHT - 0.5,
            -STAGE_SIZE / 2 - this.boothDepth / 2
        );
        this.lights = [];
        this.lightGroup = new THREE.Group();
        this.scene.add(this.lightGroup);

        // Create lighting setup
        this.createSpotlights();
        this.createColorLights();
        this.createRimLighting();
    }

    /**
     * Create spotlights that illuminate the DJ booth
     */
    createSpotlights() {
        // Left spotlight
        const leftSpotlight = new THREE.SpotLight(0x00ffff, 2.0);
        leftSpotlight.position.set(-2, 5, -STAGE_SIZE / 2 - 1);
        leftSpotlight.target.position.set(0, this.boothPosition.y + 1, -STAGE_SIZE / 2 - 1);
        leftSpotlight.angle = Math.PI / 6;
        leftSpotlight.penumbra = 0.5;
        leftSpotlight.decay = 2;
        leftSpotlight.distance = 10;
        leftSpotlight.castShadow = true;
        this.scene.add(leftSpotlight);
        this.scene.add(leftSpotlight.target);
        this.lights.push({ light: leftSpotlight, type: 'spotlight', side: 'left' });

        // Right spotlight
        const rightSpotlight = new THREE.SpotLight(0xff00ff, 2.0);
        rightSpotlight.position.set(2, 5, -STAGE_SIZE / 2 - 1);
        rightSpotlight.target.position.set(0, this.boothPosition.y + 1, -STAGE_SIZE / 2 - 1);
        rightSpotlight.angle = Math.PI / 6;
        rightSpotlight.penumbra = 0.5;
        rightSpotlight.decay = 2;
        rightSpotlight.distance = 10;
        rightSpotlight.castShadow = true;
        this.scene.add(rightSpotlight);
        this.scene.add(rightSpotlight.target);
        this.lights.push({ light: rightSpotlight, type: 'spotlight', side: 'right' });

        // Center spotlight (from above)
        const centerSpotlight = new THREE.SpotLight(0xffffff, 1.5);
        centerSpotlight.position.set(0, 6, -STAGE_SIZE / 2 - 1);
        centerSpotlight.target.position.set(0, this.boothPosition.y, -STAGE_SIZE / 2 - 1);
        centerSpotlight.angle = Math.PI / 4;
        centerSpotlight.penumbra = 0.6;
        centerSpotlight.decay = 2;
        centerSpotlight.distance = 12;
        this.scene.add(centerSpotlight);
        this.scene.add(centerSpotlight.target);
        this.lights.push({ light: centerSpotlight, type: 'spotlight', side: 'center' });
    }

    /**
     * Create color-changing point lights around the booth
     */
    createColorLights() {
        const lightPositions = [
            new THREE.Vector3(-1.5, this.boothPosition.y + 1, -STAGE_SIZE / 2 - 2),
            new THREE.Vector3(1.5, this.boothPosition.y + 1, -STAGE_SIZE / 2 - 2),
            new THREE.Vector3(-1.5, this.boothPosition.y - 0.5, -STAGE_SIZE / 2 - 2),
            new THREE.Vector3(1.5, this.boothPosition.y - 0.5, -STAGE_SIZE / 2 - 2),
        ];

        lightPositions.forEach((pos, index) => {
            const pointLight = new THREE.PointLight(0x00ffff, 1.0, 5);
            pointLight.position.copy(pos);
            this.scene.add(pointLight);
            this.lights.push({
                light: pointLight,
                type: 'colorLight',
                index: index,
                basePosition: pos.clone(),
            });
        });
    }

    /**
     * Create rim lighting on the DJ booth for depth
     */
    createRimLighting() {
        // Create emissive planes around the booth edges
        const rimMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        // Left rim
        const leftRim = new THREE.Mesh(new THREE.PlaneGeometry(0.1, this.boothHeight), rimMaterial);
        leftRim.position.set(
            -this.boothWidth / 2 - 0.05,
            this.boothPosition.y,
            -STAGE_SIZE / 2 - this.boothDepth / 2
        );
        this.lightGroup.add(leftRim);
        this.lights.push({ mesh: leftRim, type: 'rim', side: 'left' });

        // Right rim
        const rightRim = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, this.boothHeight),
            rimMaterial
        );
        rightRim.position.set(
            this.boothWidth / 2 + 0.05,
            this.boothPosition.y,
            -STAGE_SIZE / 2 - this.boothDepth / 2
        );
        this.lightGroup.add(rightRim);
        this.lights.push({ mesh: rightRim, type: 'rim', side: 'right' });

        // Top rim
        const topRim = new THREE.Mesh(new THREE.PlaneGeometry(this.boothWidth, 0.1), rimMaterial);
        topRim.position.set(
            0,
            this.boothPosition.y + this.boothHeight / 2 + 0.05,
            -STAGE_SIZE / 2 - this.boothDepth / 2
        );
        topRim.rotation.x = Math.PI / 2;
        this.lightGroup.add(topRim);
        this.lights.push({ mesh: topRim, type: 'rim', side: 'top' });
    }

    /**
     * Update lighting animations
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        if (!audioSystem) {
            return;
        }

        const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
        const overallEnergy = audioSystem.getOverallEnergy ? audioSystem.getOverallEnergy() : 0;
        const frequencyBands = audioSystem.getFrequencyBands
            ? audioSystem.getFrequencyBands()
            : null;

        // Update spotlights
        this.lights.forEach((lightObj) => {
            if (lightObj.type === 'spotlight') {
                const light = lightObj.light;

                // Intensity pulsing with bass
                const baseIntensity = lightObj.side === 'center' ? 1.5 : 2.0;
                const pulseIntensity = baseIntensity + bassEnergy * 1.5;
                light.intensity = pulseIntensity;

                // Color shifting based on frequency bands
                if (frequencyBands) {
                    const mid = frequencyBands.mid || 0;
                    const treble = frequencyBands.treble || 0;

                    if (lightObj.side === 'left') {
                        // Left spotlight - cyan to green based on mid
                        const hue = 0.5 + mid * 0.2; // 0.5 (cyan) to 0.7 (green)
                        light.color.setHSL(hue, 1.0, 0.5);
                    } else if (lightObj.side === 'right') {
                        // Right spotlight - magenta to red based on treble
                        const hue = 0.8 + treble * 0.2; // 0.8 (magenta) to 1.0 (red)
                        light.color.setHSL(hue, 1.0, 0.5);
                    } else {
                        // Center spotlight - white with slight tint
                        const tint = (mid + treble) * 0.3;
                        light.color.setHSL(0.5 + tint * 0.2, 0.5, 0.8);
                    }
                }

                // Light sweep animation
                const sweepSpeed = 0.5;
                const sweepAmount = 0.3;
                if (lightObj.side === 'left') {
                    light.position.x = -2 + Math.sin(elapsedTime * sweepSpeed) * sweepAmount;
                } else if (lightObj.side === 'right') {
                    light.position.x = 2 - Math.sin(elapsedTime * sweepSpeed) * sweepAmount;
                }
            }

            // Update color-changing point lights
            if (lightObj.type === 'colorLight') {
                const light = lightObj.light;

                // Intensity based on overall energy
                light.intensity = 1.0 + overallEnergy * 1.5;

                // Color cycling based on frequency bands
                if (frequencyBands) {
                    const bass = frequencyBands.bass || 0;
                    const mid = frequencyBands.mid || 0;
                    const treble = frequencyBands.treble || 0;

                    // Different lights respond to different frequencies
                    let hue = 0.5; // Default cyan
                    if (lightObj.index % 2 === 0) {
                        hue = 0.5 + bass * 0.3; // Bass -> cyan to green
                    } else {
                        hue = 0.8 + treble * 0.2; // Treble -> magenta to red
                    }

                    light.color.setHSL(hue, 1.0, 0.5);
                }

                // Subtle position pulsing
                const pulseAmount = bassEnergy * 0.1;
                light.position.y =
                    lightObj.basePosition.y + Math.sin(elapsedTime * 3) * pulseAmount;
            }

            // Update rim lighting
            if (lightObj.type === 'rim') {
                const mesh = lightObj.mesh;
                if (mesh.material) {
                    // Emissive intensity pulsing
                    mesh.material.emissiveIntensity = 0.3 + bassEnergy * 0.5;

                    // Color shift
                    if (frequencyBands) {
                        const mid = frequencyBands.mid || 0;
                        const hue = 0.5 + mid * 0.3; // Cyan to green
                        mesh.material.emissive.setHSL(hue, 1.0, 0.5);
                        mesh.material.color.setHSL(hue, 1.0, 0.5);
                    }
                }
            }
        });

        // Beat detection for strobe effect
        if (audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
            const beatDetector = audioSystem.getBeatDetector();
            const lastBeatTime = beatDetector.getLastBeatTime ? beatDetector.getLastBeatTime() : 0;
            const timeSinceBeat = elapsedTime - lastBeatTime;

            if (timeSinceBeat < 0.1) {
                // Strobe flash on beat
                this.lights.forEach((lightObj) => {
                    if (lightObj.light) {
                        lightObj.light.intensity *= 1.5;
                    }
                });
            }
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.lights.forEach((lightObj) => {
            if (lightObj.light) {
                this.scene.remove(lightObj.light);
                if (lightObj.light.target) {
                    this.scene.remove(lightObj.light.target);
                }
            }
            if (lightObj.mesh) {
                this.lightGroup.remove(lightObj.mesh);
                lightObj.mesh.geometry.dispose();
                lightObj.mesh.material.dispose();
            }
        });

        if (this.lightGroup.parent) {
            this.lightGroup.parent.remove(this.lightGroup);
        }
    }
}
