/**
 * DJBoothParticles - Audio-reactive particle effects for the DJ booth
 *
 * Creates particles that emit from the DJ booth and react to music
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

export class DJBoothParticles {
    /**
     * Create a new DJ booth particle system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} config - Configuration options
     * @param {THREE.Vector3} config.position - Emission position (optional, defaults to DJ booth)
     */
    constructor(scene, config = {}) {
        this.scene = scene;

        // DJ booth position (from RoomBuilder.createDJBooth)
        const boothWidth = 2;
        const boothHeight = 3;
        const boothDepth = 1.5;
        const boothPosition = new THREE.Vector3(
            0,
            boothHeight / 2 + STAGE_HEIGHT - 0.5,
            -STAGE_SIZE / 2 - boothDepth / 2
        );

        // Emission position (in front of DJ booth, slightly above)
        this.emissionPosition =
            config.position ||
            new THREE.Vector3(
                boothPosition.x,
                boothPosition.y + 0.5, // Slightly above booth
                boothPosition.z + boothDepth / 2 + 0.2 // In front of booth
            );

        // Particle system
        this.particles = [];
        this.maxParticles = 200;
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);

        // Emission state
        this.lastEmissionTime = 0;
        this.emissionInterval = 0.05; // Emit particles every 50ms

        // Quality settings (will be set from GraphicsSettings)
        this.qualityMultiplier = 1.0;
        this.particleMultiplier = 1.0;
    }

    /**
     * Create a new particle
     * @param {THREE.Vector3} position - Starting position
     * @param {number} color - Particle color (hex)
     * @param {number} size - Particle size
     * @param {number} velocity - Initial velocity multiplier
     * @returns {Object} Particle object
     */
    createParticle(position, color = 0x00ffff, size = 0.05, velocity = 1.0) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        // Random velocity
        const speed = 0.5 + Math.random() * 1.5;
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * speed * velocity,
            Math.random() * speed * velocity * 0.5,
            (Math.random() - 0.5) * speed * velocity
        );

        particle.life = 1.0;
        particle.maxLife = 1.0;
        particle.color = new THREE.Color(color);

        this.particleGroup.add(particle);
        this.particles.push(particle);

        return particle;
    }

    /**
     * Set quality multipliers for performance optimization
     * @param {number} qualityMultiplier - Overall quality multiplier
     * @param {number} particleMultiplier - Particle count multiplier
     */
    setQuality(qualityMultiplier, particleMultiplier) {
        this.qualityMultiplier = qualityMultiplier;
        this.particleMultiplier = particleMultiplier;
        this.maxParticles = Math.floor(200 * particleMultiplier);
    }

    /**
     * Update particle system
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        // Remove dead particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime * 0.5; // Fade out over 2 seconds

            if (particle.life <= 0) {
                this.particleGroup.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Update particle position
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            // Apply gravity/drag
            particle.velocity.y -= 0.5 * deltaTime; // Gravity
            particle.velocity.multiplyScalar(0.98); // Air resistance

            // Update opacity based on life
            particle.material.opacity = particle.life * 0.8;

            // Update size (shrink as it fades)
            const scale = particle.life;
            particle.scale.set(scale, scale, scale);
        }

        // Emit new particles based on audio
        if (audioSystem && elapsedTime - this.lastEmissionTime >= this.emissionInterval) {
            const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
            const overallEnergy = audioSystem.getOverallEnergy ? audioSystem.getOverallEnergy() : 0;
            const frequencyBands = audioSystem.getFrequencyBands
                ? audioSystem.getFrequencyBands()
                : null;

            // Emit particles based on audio intensity (scaled by quality)
            const emissionRate =
                (0.3 + (bassEnergy * 0.7 + overallEnergy * 0.3) * 2.0) * this.particleMultiplier;
            const particlesToEmit = Math.floor(emissionRate);

            for (let i = 0; i < particlesToEmit && this.particles.length < this.maxParticles; i++) {
                // Determine color based on frequency bands
                let color = 0x00ffff; // Default cyan
                if (frequencyBands) {
                    const bass = frequencyBands.bass || 0;
                    const mid = frequencyBands.mid || 0;
                    const treble = frequencyBands.treble || 0;

                    // Color mapping: bass = red/purple, mid = cyan/green, treble = blue
                    if (bass > mid && bass > treble) {
                        // Bass dominant - red/purple
                        color = new THREE.Color().setHSL(0.8, 1.0, 0.5).getHex();
                    } else if (mid > treble) {
                        // Mid dominant - cyan/green
                        color = new THREE.Color().setHSL(0.5, 1.0, 0.5).getHex();
                    } else {
                        // Treble dominant - blue
                        color = new THREE.Color().setHSL(0.6, 1.0, 0.5).getHex();
                    }
                }

                // Random emission position around DJ booth
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                const emitPos = this.emissionPosition.clone().add(offset);

                // Particle size based on bass
                const size = 0.03 + bassEnergy * 0.04;

                // Velocity multiplier based on overall energy
                const velocity = 0.8 + overallEnergy * 0.7;

                this.createParticle(emitPos, color, size, velocity);
            }

            this.lastEmissionTime = elapsedTime;
        }

        // Beat-based burst emission
        if (audioSystem && audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
            const beatDetector = audioSystem.getBeatDetector();
            const lastBeatTime = beatDetector.getLastBeatTime ? beatDetector.getLastBeatTime() : 0;
            const timeSinceBeat = elapsedTime - lastBeatTime;

            // Emit burst on beat (within 0.1 seconds of beat, scaled by quality)
            if (timeSinceBeat < 0.1 && timeSinceBeat > 0) {
                const burstCount = Math.floor(15 * this.particleMultiplier);
                for (let i = 0; i < burstCount && this.particles.length < this.maxParticles; i++) {
                    const angle = (i / burstCount) * Math.PI * 2;
                    const radius = 0.3;
                    const offset = new THREE.Vector3(
                        Math.cos(angle) * radius,
                        Math.random() * 0.3,
                        Math.sin(angle) * radius
                    );
                    const emitPos = this.emissionPosition.clone().add(offset);

                    // Bright white/cyan burst on beat
                    const burstColor = new THREE.Color()
                        .lerpColors(
                            new THREE.Color(0xffffff),
                            new THREE.Color(0x00ffff),
                            Math.random()
                        )
                        .getHex();

                    this.createParticle(emitPos, burstColor, 0.08, 2.0);
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
