/**
 * LaserBeams - Laser beam effects that sweep across the dance floor
 *
 * Creates laser beams with glow effects that react to music and beats
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT, ROOM_SIZE, WALL_HEIGHT } from '../config/constants.js';

export class LaserBeams {
    /**
     * Create a new laser beam system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.beams = [];
        this.beamGroup = new THREE.Group();
        this.scene.add(this.beamGroup);

        // Create multiple laser beams
        this.createBeams();
    }

    /**
     * Create laser beam geometry and materials
     */
    createBeams() {
        const beamCount = 4; // Number of laser beams

        for (let i = 0; i < beamCount; i++) {
            // Create beam geometry (thin cylinder)
            const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, ROOM_SIZE * 1.5, 8);

            // Create bright emissive material for the beam
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.9,
            });

            const beam = new THREE.Mesh(beamGeometry, beamMaterial);

            // Create glow halo (larger, more transparent)
            const glowGeometry = new THREE.CylinderGeometry(0.05, 0.05, ROOM_SIZE * 1.5, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.3,
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            beam.add(glow);

            // Position beams at different heights and angles
            const height = WALL_HEIGHT * 0.6 + i * 0.5;
            beam.position.set(0, height, -STAGE_SIZE / 2);
            beam.rotation.z = Math.PI / 2; // Horizontal orientation

            // Store beam data
            const beamData = {
                mesh: beam,
                glow: glow,
                baseHeight: height,
                baseRotation: (i / beamCount) * Math.PI * 2, // Start at different angles
                pattern: i % 3, // Different sweep patterns
                colorIndex: i % 3, // Different colors
                speed: 0.5 + i * 0.2, // Different speeds
            };

            this.beamGroup.add(beam);
            this.beams.push(beamData);
        }
    }

    /**
     * Update laser beam animations
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        this.beams.forEach((beamData, index) => {
            const beam = beamData.mesh;
            const glow = beamData.glow;

            // Different sweep patterns
            let rotationY = 0;
            let rotationX = 0;
            const positionX = 0;
            const positionZ = 0;

            if (beamData.pattern === 0) {
                // Horizontal sweep
                rotationY =
                    beamData.baseRotation + (Math.sin(elapsedTime * beamData.speed) * Math.PI) / 3;
                rotationX = Math.sin(elapsedTime * beamData.speed * 0.7) * 0.2;
            } else if (beamData.pattern === 1) {
                // Vertical sweep
                rotationX =
                    beamData.baseRotation + (Math.cos(elapsedTime * beamData.speed) * Math.PI) / 3;
                rotationY = Math.cos(elapsedTime * beamData.speed * 0.8) * 0.3;
            } else {
                // Diagonal sweep
                rotationY =
                    beamData.baseRotation + (Math.sin(elapsedTime * beamData.speed) * Math.PI) / 4;
                rotationX =
                    beamData.baseRotation + (Math.cos(elapsedTime * beamData.speed) * Math.PI) / 4;
            }

            beam.rotation.y = rotationY;
            beam.rotation.x = rotationX;

            // Position variation
            beam.position.x = Math.sin(elapsedTime * beamData.speed * 0.5) * 2;
            beam.position.y =
                beamData.baseHeight + Math.sin(elapsedTime * beamData.speed * 0.3) * 0.5;

            // Audio-reactive color and intensity
            if (audioSystem) {
                const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
                const overallEnergy = audioSystem.getOverallEnergy
                    ? audioSystem.getOverallEnergy()
                    : 0;
                const frequencyBands = audioSystem.getFrequencyBands
                    ? audioSystem.getFrequencyBands()
                    : null;

                // Intensity pulsing with bass
                const baseIntensity = 3.0;
                const pulseIntensity = baseIntensity + bassEnergy * 2.0;
                beam.material.emissiveIntensity = pulseIntensity;
                beam.material.opacity = 0.7 + bassEnergy * 0.3;

                // Color cycling based on frequency bands
                if (frequencyBands) {
                    const bass = frequencyBands.bass || 0;
                    const mid = frequencyBands.mid || 0;
                    const treble = frequencyBands.treble || 0;

                    // Different beams respond to different frequencies
                    let hue = 0.8; // Default magenta
                    if (beamData.colorIndex === 0) {
                        // Bass beam - red/purple
                        hue = 0.8 + bass * 0.2; // 0.8 (magenta) to 1.0 (red)
                    } else if (beamData.colorIndex === 1) {
                        // Mid beam - cyan/green
                        hue = 0.5 + mid * 0.2; // 0.5 (cyan) to 0.7 (green)
                    } else {
                        // Treble beam - blue/cyan
                        hue = 0.6 + treble * 0.2; // 0.6 (blue) to 0.8 (cyan)
                    }

                    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
                    beam.material.color.copy(color);
                    beam.material.emissive.copy(color);
                    glow.material.color.copy(color);
                }

                // Beat detection for intensity spikes
                if (audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
                    const beatDetector = audioSystem.getBeatDetector();
                    const lastBeatTime = beatDetector.getLastBeatTime
                        ? beatDetector.getLastBeatTime()
                        : 0;
                    const timeSinceBeat = elapsedTime - lastBeatTime;

                    if (timeSinceBeat < 0.15) {
                        // Flash on beat
                        beam.material.emissiveIntensity = pulseIntensity * 1.5;
                        beam.material.opacity = 1.0;
                    }
                }
            }

            // Update glow to match beam
            if (glow) {
                glow.material.opacity = beam.material.opacity * 0.3;
                glow.rotation.y = beam.rotation.y;
                glow.rotation.x = beam.rotation.x;
            }
        });
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.beams.forEach((beamData) => {
            this.beamGroup.remove(beamData.mesh);
            beamData.mesh.geometry.dispose();
            beamData.mesh.material.dispose();
            if (beamData.glow) {
                beamData.glow.geometry.dispose();
                beamData.glow.material.dispose();
            }
        });
        this.beams = [];

        if (this.beamGroup.parent) {
            this.beamGroup.parent.remove(this.beamGroup);
        }
    }
}
