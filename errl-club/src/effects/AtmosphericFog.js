/**
 * AtmosphericFog - Smoke/fog particle effects for club atmosphere
 *
 * Creates fog particles that rise from the stage/DJ booth and react to music
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT, ROOM_SIZE } from '../config/constants.js';

export class AtmosphericFog {
    /**
     * Create a new atmospheric fog system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 150;
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);

        // Emission positions (stage and DJ booth areas)
        this.emissionPositions = [
            new THREE.Vector3(0, STAGE_HEIGHT + 0.1, -STAGE_SIZE / 2), // Center stage
            new THREE.Vector3(-2, STAGE_HEIGHT + 0.1, -STAGE_SIZE / 2), // Left stage
            new THREE.Vector3(2, STAGE_HEIGHT + 0.1, -STAGE_SIZE / 2), // Right stage
            new THREE.Vector3(0, STAGE_HEIGHT + 0.1, -STAGE_SIZE / 2 - 1.5), // DJ booth area
        ];

        // Fog density control
        this.baseDensity = config.baseDensity || 0.3;
        this.currentDensity = this.baseDensity;

        // Quality settings
        this.effectQuality = config.effectQuality || 'high';
        this.particleMultiplier = config.particleMultiplier || 1.0;
    }

    /**
     * Set quality settings
     * @param {string} quality - Quality level ('low', 'medium', 'high')
     * @param {number} particleMultiplier - Particle count multiplier (0-1)
     */
    setQuality(quality, particleMultiplier = 1.0) {
        this.effectQuality = quality;
        this.particleMultiplier = particleMultiplier;

        // Adjust max particles based on quality
        if (quality === 'low') {
            this.maxParticles = 50;
        } else if (quality === 'medium') {
            this.maxParticles = 100;
        } else {
            this.maxParticles = 150;
        }
    }

    /**
     * Create a fog particle
     * @param {THREE.Vector3} position - Starting position
     * @param {number} color - Particle color (hex)
     * @param {number} size - Particle size
     * @returns {Object} Particle object
     */
    createParticle(position, color = 0x888888, size = 0.3) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        // Random upward velocity with slight drift
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1, // Slight horizontal drift
            Math.random() * 0.3 + 0.2, // Upward movement
            (Math.random() - 0.5) * 0.1 // Slight forward/back drift
        );

        particle.life = 1.0;
        particle.maxLife = 1.0;
        particle.color = new THREE.Color(color);
        particle.baseSize = size;

        this.particleGroup.add(particle);
        this.particles.push(particle);

        return particle;
    }

    /**
     * Update fog system
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        // Remove dead particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime * 0.3; // Fade out over ~3 seconds

            if (particle.life <= 0) {
                this.particleGroup.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Update particle position
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            // Apply air resistance (slow down over time)
            particle.velocity.multiplyScalar(0.98);

            // Update opacity based on life
            particle.material.opacity = particle.life * 0.4;

            // Update size (grow slightly as it rises, then fade)
            const sizeMultiplier = 1.0 + (1.0 - particle.life) * 0.5;
            const scale = particle.life * sizeMultiplier;
            particle.scale.set(scale, scale, scale);
        }

        // Determine emission rate based on audio (scaled by quality)
        // Ensure particleMultiplier is initialized
        const particleMultiplier = this.particleMultiplier || 1.0;
        let emissionRate = this.baseDensity * particleMultiplier;
        let fogColor = 0x888888; // Default gray

        if (audioSystem) {
            const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
            const overallEnergy = audioSystem.getOverallEnergy ? audioSystem.getOverallEnergy() : 0;
            const frequencyBands = audioSystem.getFrequencyBands
                ? audioSystem.getFrequencyBands()
                : null;

            // Increase density with bass (thicker fog on strong bass, scaled by quality)
            emissionRate = (this.baseDensity + bassEnergy * 0.5) * particleMultiplier;
            this.currentDensity = emissionRate;

            // Color tinting based on frequency bands
            if (frequencyBands) {
                const bass = frequencyBands.bass || 0;
                const mid = frequencyBands.mid || 0;
                const treble = frequencyBands.treble || 0;

                // Mix colors based on frequency dominance
                const bassColor = new THREE.Color(0x4400ff); // Purple
                const midColor = new THREE.Color(0x00ffff); // Cyan
                const trebleColor = new THREE.Color(0xffffff); // White

                const total = bass + mid + treble || 1;
                const mixedColor = new THREE.Color()
                    .addScaledColor(bassColor, bass / total)
                    .addScaledColor(midColor, mid / total)
                    .addScaledColor(trebleColor, treble / total);

                fogColor = mixedColor.getHex();
            }
        }

        // Emit new particles
        const particlesToEmit = Math.floor(emissionRate * 10); // Scale emission rate

        for (let i = 0; i < particlesToEmit && this.particles.length < this.maxParticles; i++) {
            // Random emission position
            const emissionPos =
                this.emissionPositions[
                    Math.floor(Math.random() * this.emissionPositions.length)
                ].clone();

            // Add slight random offset
            emissionPos.x += (Math.random() - 0.5) * 2;
            emissionPos.z += (Math.random() - 0.5) * 1;

            // Particle size varies with density
            const size = 0.2 + emissionRate * 0.2;

            // Slight color variation
            const colorVariation = new THREE.Color(fogColor);
            colorVariation.offsetHSL(
                (Math.random() - 0.5) * 0.1, // Hue variation
                0,
                (Math.random() - 0.5) * 0.2 // Brightness variation
            );

            this.createParticle(emissionPos, colorVariation.getHex(), size);
        }

        // Beat-based fog bursts
        if (audioSystem && audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
            const beatDetector = audioSystem.getBeatDetector();
            const lastBeatTime = beatDetector.getLastBeatTime ? beatDetector.getLastBeatTime() : 0;
            const timeSinceBeat = elapsedTime - lastBeatTime;

            // Emit burst on beat (within 0.15 seconds)
            if (timeSinceBeat < 0.15 && timeSinceBeat > 0) {
                const burstCount = Math.floor(8 * particleMultiplier);
                for (let i = 0; i < burstCount && this.particles.length < this.maxParticles; i++) {
                    const emissionPos =
                        this.emissionPositions[
                            Math.floor(Math.random() * this.emissionPositions.length)
                        ].clone();

                    // Larger particles on beat
                    const burstSize = 0.4 + Math.random() * 0.2;

                    // Brighter color on beat
                    const burstColor = new THREE.Color(fogColor);
                    burstColor.multiplyScalar(1.5);

                    this.createParticle(emissionPos, burstColor.getHex(), burstSize);
                }
            }
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.particles.forEach((particle) => {
            this.particleGroup.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.particles = [];

        if (this.particleGroup.parent) {
            this.particleGroup.parent.remove(this.particleGroup);
        }
    }
}
