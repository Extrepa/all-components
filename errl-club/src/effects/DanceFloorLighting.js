/**
 * DanceFloorLighting - Dynamic lighting effects for the dance floor area
 *
 * Creates pulsing floor lights, color-changing tiles, and strobe effects
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT, ROOM_SIZE } from '../config/constants.js';

export class DanceFloorLighting {
    /**
     * Create a new dance floor lighting system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.lights = [];
        this.lightGroup = new THREE.Group();
        this.scene.add(this.lightGroup);

        // Create dance floor lighting grid
        this.createFloorLights();
    }

    /**
     * Create a grid of floor lights
     */
    createFloorLights() {
        const gridSize = 6; // 6x6 grid
        const spacing = ROOM_SIZE / (gridSize + 1);
        const lightSize = 0.3;

        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                // Position lights on the floor (not on stage)
                const posX = -ROOM_SIZE / 2 + (x + 1) * spacing;
                const posZ = -ROOM_SIZE / 2 + (z + 1) * spacing;

                // Skip lights that would be on the stage
                if (posZ < -STAGE_SIZE / 2 && posZ > -STAGE_SIZE / 2 - STAGE_SIZE) {
                    continue;
                }

                // Create light geometry (flat disc)
                const lightGeometry = new THREE.CircleGeometry(lightSize, 16);
                const lightMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide,
                });

                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.rotation.x = -Math.PI / 2; // Face up
                light.position.set(posX, STAGE_HEIGHT + 0.01, posZ);

                // Add point light above for illumination
                const pointLight = new THREE.PointLight(0x00ffff, 0.5, 3);
                pointLight.position.set(posX, STAGE_HEIGHT + 0.5, posZ);
                this.scene.add(pointLight);

                this.lightGroup.add(light);
                this.lights.push({
                    mesh: light,
                    pointLight: pointLight,
                    basePosition: new THREE.Vector3(posX, posZ),
                    index: x * gridSize + z,
                });
            }
        }
    }

    /**
     * Update dance floor lighting
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

        // Check for beat detection
        let beatFlash = false;
        if (audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
            const beatDetector = audioSystem.getBeatDetector();
            const lastBeatTime = beatDetector.getLastBeatTime ? beatDetector.getLastBeatTime() : 0;
            const timeSinceBeat = elapsedTime - lastBeatTime;
            beatFlash = timeSinceBeat < 0.1;
        }

        this.lights.forEach((lightObj, index) => {
            const light = lightObj.mesh;
            const pointLight = lightObj.pointLight;

            // Base intensity
            let intensity = 0.5 + bassEnergy * 0.5;
            let pointIntensity = 0.5 + bassEnergy * 0.8;

            // Beat flash
            if (beatFlash) {
                intensity = 2.0;
                pointIntensity = 2.0;
            }

            // Strobe effect on strong beats
            if (beatFlash && bassEnergy > 0.7) {
                // Random strobe pattern
                if (Math.random() > 0.5) {
                    intensity = 0;
                    pointIntensity = 0;
                }
            }

            // Update emissive intensity
            if (light.material) {
                light.material.emissiveIntensity = intensity;
                light.material.opacity = 0.5 + intensity * 0.3;
            }

            // Update point light
            if (pointLight) {
                pointLight.intensity = pointIntensity;
            }

            // Color cycling based on frequency bands
            if (frequencyBands) {
                const bass = frequencyBands.bass || 0;
                const mid = frequencyBands.mid || 0;
                const treble = frequencyBands.treble || 0;

                // Different lights respond to different frequencies (wave pattern)
                const wavePhase = (index / this.lights.length) * Math.PI * 2;
                const timePhase = elapsedTime * 0.5;
                const combinedPhase = wavePhase + timePhase;

                // Mix frequencies based on position
                const bassWeight = (Math.sin(combinedPhase) + 1) / 2;
                const midWeight = (Math.sin(combinedPhase + Math.PI / 3) + 1) / 2;
                const trebleWeight = (Math.sin(combinedPhase + (Math.PI * 2) / 3) + 1) / 2;

                const totalWeight = bassWeight + midWeight + trebleWeight || 1;
                const effectiveBass = (bass * bassWeight) / totalWeight;
                const effectiveMid = (mid * midWeight) / totalWeight;
                const effectiveTreble = (treble * trebleWeight) / totalWeight;

                // Color based on dominant frequency
                let hue = 0.5; // Default cyan
                if (effectiveBass > effectiveMid && effectiveBass > effectiveTreble) {
                    hue = 0.8 + effectiveBass * 0.2; // Purple to red
                } else if (effectiveMid > effectiveTreble) {
                    hue = 0.5 + effectiveMid * 0.2; // Cyan to green
                } else {
                    hue = 0.6 + effectiveTreble * 0.2; // Blue to cyan
                }

                const color = new THREE.Color().setHSL(hue, 1.0, 0.5);

                if (light.material) {
                    light.material.color.copy(color);
                    light.material.emissive.copy(color);
                }

                if (pointLight) {
                    pointLight.color.copy(color);
                }
            }

            // Pulsing animation
            const pulseSpeed = 2.0 + bassEnergy * 2.0;
            const pulseAmount = 0.1;
            const pulse = Math.sin(elapsedTime * pulseSpeed) * pulseAmount;
            light.scale.set(1.0 + pulse, 1.0 + pulse, 1.0);
        });
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.lights.forEach((lightObj) => {
            this.lightGroup.remove(lightObj.mesh);
            if (lightObj.pointLight) {
                this.scene.remove(lightObj.pointLight);
            }
            lightObj.mesh.geometry.dispose();
            lightObj.mesh.material.dispose();
        });
        this.lights = [];

        if (this.lightGroup.parent) {
            this.lightGroup.parent.remove(this.lightGroup);
        }
    }
}
