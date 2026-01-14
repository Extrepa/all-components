/**
 * AudioVisualizer - Club-wide audio visualization elements
 *
 * Creates floating frequency bars, pulsing rings, and energy waves
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT, ROOM_SIZE, WALL_HEIGHT } from '../config/constants.js';

export class AudioVisualizer {
    /**
     * Create a new audio visualizer system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.visualizations = [];
        this.visualizationGroup = new THREE.Group();
        this.scene.add(this.visualizationGroup);

        // Create visualization elements
        this.createFrequencyBars();
        this.createPulsingRings();
        this.createEnergyWaves();
    }

    /**
     * Create floating frequency bars around DJ booth
     */
    createFrequencyBars() {
        const barCount = 16;
        const radius = 3.0;
        const barHeight = 2.0;
        const barWidth = 0.1;

        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
            const barMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8,
            });

            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(x, STAGE_HEIGHT + barHeight / 2 + 1, -STAGE_SIZE / 2 - 1.5 + z);
            bar.userData.baseHeight = barHeight;
            bar.userData.index = i;
            bar.userData.angle = angle;

            this.visualizationGroup.add(bar);
            this.visualizations.push({ mesh: bar, type: 'frequencyBar' });
        }
    }

    /**
     * Create pulsing rings that expand from speakers
     */
    createPulsingRings() {
        const ringCount = 3;
        const baseRadius = 0.5;

        for (let i = 0; i < ringCount; i++) {
            const ringGeometry = new THREE.RingGeometry(baseRadius, baseRadius + 0.1, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(0, STAGE_HEIGHT + 0.5, -STAGE_SIZE / 2);
            ring.userData.baseRadius = baseRadius;
            ring.userData.index = i;
            ring.userData.phase = (i / ringCount) * Math.PI * 2;

            this.visualizationGroup.add(ring);
            this.visualizations.push({ mesh: ring, type: 'pulsingRing' });
        }
    }

    /**
     * Create energy waves that propagate from stage
     */
    createEnergyWaves() {
        const waveCount = 2;

        for (let i = 0; i < waveCount; i++) {
            const waveGeometry = new THREE.RingGeometry(1, 1.2, 64);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
            });

            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = -Math.PI / 2;
            wave.position.set(0, STAGE_HEIGHT + 0.1, -STAGE_SIZE / 2);
            wave.userData.baseRadius = 1;
            wave.userData.index = i;
            wave.userData.phase = (i / waveCount) * Math.PI;

            this.visualizationGroup.add(wave);
            this.visualizations.push({ mesh: wave, type: 'energyWave' });
        }
    }

    /**
     * Update visualizations
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
        const audioData = audioSystem.getAudioData ? audioSystem.getAudioData() : null;

        this.visualizations.forEach((viz) => {
            if (viz.type === 'frequencyBar') {
                const bar = viz.mesh;
                const index = bar.userData.index;

                // Get frequency data for this bar
                let amplitude = 0.5;
                if (audioData && audioData.length > 0) {
                    const samplesPerBar = Math.floor(audioData.length / 16);
                    const startIdx = index * samplesPerBar;
                    const endIdx = Math.min(startIdx + samplesPerBar, audioData.length);

                    let sum = 0;
                    for (let i = startIdx; i < endIdx; i++) {
                        sum += audioData[i];
                    }
                    amplitude = sum / (endIdx - startIdx) / 255;
                }

                // Scale bar height
                const targetHeight = bar.userData.baseHeight * (0.3 + amplitude * 1.4);
                bar.scale.y = targetHeight / bar.userData.baseHeight;

                // Color based on frequency position
                if (frequencyBands) {
                    const bass = frequencyBands.bass || 0;
                    const mid = frequencyBands.mid || 0;
                    const treble = frequencyBands.treble || 0;

                    let hue = 0.5; // Default cyan
                    if (index < 5) {
                        hue = 0.8 + bass * 0.2; // Red/purple for bass
                    } else if (index < 11) {
                        hue = 0.5 + mid * 0.2; // Cyan/green for mid
                    } else {
                        hue = 0.6 + treble * 0.2; // Blue/cyan for treble
                    }

                    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
                    bar.material.color.copy(color);
                    bar.material.emissive.copy(color);
                }

                // Intensity pulsing
                bar.material.emissiveIntensity = 0.8 + amplitude * 1.2;
            }

            if (viz.type === 'pulsingRing') {
                const ring = viz.mesh;
                const phase = ring.userData.phase;

                // Pulsing radius based on bass
                const pulseSpeed = 2.0 + bassEnergy * 3.0;
                const pulseAmount = bassEnergy * 2.0;
                const radius =
                    ring.userData.baseRadius +
                    Math.sin(elapsedTime * pulseSpeed + phase) * pulseAmount;

                // Update ring geometry
                ring.geometry.dispose();
                ring.geometry = new THREE.RingGeometry(radius, radius + 0.1, 32);

                // Color and intensity
                if (frequencyBands) {
                    const mid = frequencyBands.mid || 0;
                    const hue = 0.8 + mid * 0.2; // Magenta to red
                    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
                    ring.material.color.copy(color);
                    ring.material.emissive.copy(color);
                }

                ring.material.emissiveIntensity = 0.8 + bassEnergy * 1.2;
                ring.material.opacity = 0.4 + bassEnergy * 0.4;
            }

            if (viz.type === 'energyWave') {
                const wave = viz.mesh;
                const phase = wave.userData.phase;

                // Expand outward
                const expansionSpeed = 1.0 + overallEnergy * 1.5;
                const radius =
                    wave.userData.baseRadius + ((elapsedTime * expansionSpeed + phase) % 10);

                // Reset when too large
                if (radius > ROOM_SIZE / 2) {
                    wave.userData.baseRadius = 1;
                }

                // Update geometry
                wave.geometry.dispose();
                wave.geometry = new THREE.RingGeometry(radius, radius + 0.3, 64);

                // Fade out as it expands
                const fadeDistance = ROOM_SIZE / 2;
                const fade = 1.0 - radius / fadeDistance;
                wave.material.opacity = fade * 0.4;
                wave.material.emissiveIntensity = fade * 0.8;

                // Color based on overall energy
                if (frequencyBands) {
                    const overall =
                        (frequencyBands.bass + frequencyBands.mid + frequencyBands.treble) / 3;
                    const hue = 0.5 + overall * 0.3; // Cyan to green
                    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
                    wave.material.color.copy(color);
                    wave.material.emissive.copy(color);
                }
            }
        });
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.visualizations.forEach((viz) => {
            this.visualizationGroup.remove(viz.mesh);
            viz.mesh.geometry.dispose();
            viz.mesh.material.dispose();
        });
        this.visualizations = [];

        if (this.visualizationGroup.parent) {
            this.visualizationGroup.parent.remove(this.visualizationGroup);
        }
    }
}
