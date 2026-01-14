// Particle system for visual effects
import * as THREE from 'three';
import { SystemLoop } from './systems/SystemLoop.js';

export class ParticleSystem extends SystemLoop {
    constructor(scene, loopManager = null) {
        super('particles', 'particles', 50);
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 100;
        this.restMode = false; // Codex Enhancement: Rest mode reduces particle emissions

        // Particle preset system
        this.preset = null;
        this.spawnRateMultiplier = 1.0;
        this.sizeMultiplier = 1.0;
        this.lifetimeMultiplier = 1.0;
        this.opacityMultiplier = 1.0;

        // Self-register with LoopManager if provided
        if (loopManager) {
            this.register(loopManager);
        }
    }

    /**
     * Set particle preset
     * @param {Object} preset - Preset configuration from ParticlePresets
     */
    setPreset(preset) {
        if (!preset) {
            return;
        }

        this.preset = preset;
        this.maxParticles = preset.maxParticles || 100;
        this.spawnRateMultiplier = preset.spawnRateMultiplier || 1.0;
        this.sizeMultiplier = preset.sizeMultiplier || 1.0;
        this.lifetimeMultiplier = preset.lifetimeMultiplier || 1.0;
        this.opacityMultiplier = preset.opacityMultiplier || 1.0;

        // If disabled, clear existing particles
        if (!preset.enabled) {
            this.clearAllParticles();
        }
    }

    /**
     * Clear all particles
     */
    clearAllParticles() {
        this.particles.forEach((particle) => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            if (particle.material) {
                particle.material.dispose();
            }
        });
        this.particles = [];
    }

    // Step 178: Add tiny dust or color-puff particles when walking/running
    createDustParticle(position, color = 0x888888) {
        // Check if particles are enabled
        if (this.preset && !this.preset.enabled) {
            return null;
        }

        // Apply spawn rate multiplier (random chance to skip)
        if (this.spawnRateMultiplier < 1.0 && Math.random() > this.spawnRateMultiplier) {
            return null;
        }

        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldest = this.particles.shift();
            this.scene.remove(oldest);
            oldest.geometry.dispose();
            oldest.material.dispose();
        }

        const baseSize = 0.05 * this.sizeMultiplier;
        const geometry = new THREE.SphereGeometry(baseSize, 4, 4);
        const baseOpacity = 0.6 * this.opacityMultiplier;
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: baseOpacity,
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.2
        );
        particle.life = 1.0 * this.lifetimeMultiplier; // Life in seconds
        particle.maxLife = 1.0 * this.lifetimeMultiplier;

        this.scene.add(particle);
        this.particles.push(particle);
        return particle;
    }

    // Step 179: Add more pronounced dust/spark effect when landing from a hop
    createLandingParticles(position, count = 8) {
        // Check if particles are enabled
        if (this.preset && !this.preset.enabled) {
            return;
        }

        // Apply spawn rate multiplier to count
        const adjustedCount = Math.floor(count * this.spawnRateMultiplier);
        for (let i = 0; i < adjustedCount; i++) {
            const particle = this.createDustParticle(position, 0xffffff);
            particle.velocity.y = Math.random() * 0.3 + 0.1;
            particle.velocity.x = (Math.random() - 0.5) * 0.4;
            particle.velocity.z = (Math.random() - 0.5) * 0.4;
            particle.life = 0.8 * this.lifetimeMultiplier;
            particle.maxLife = 0.8 * this.lifetimeMultiplier;
            const baseScale = (Math.random() * 0.5 + 0.5) * this.sizeMultiplier;
            particle.scale.setScalar(baseScale);
        }
    }

    // Step 262: Create sparkle particles for treble frequencies
    createSparkleParticle(position, color = 0xffffff, size = 1.0) {
        // Codex Enhancement: Rest mode reduces particle emissions
        if (this.restMode && Math.random() > 0.3) {
            return null; // 70% chance to skip particle creation in rest mode
        }

        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldest = this.particles.shift();
            this.scene.remove(oldest);
            oldest.geometry.dispose();
            oldest.material.dispose();
        }

        const baseSize = 0.03 * size * this.sizeMultiplier;
        const geometry = new THREE.SphereGeometry(baseSize, 4, 4);
        // MeshBasicMaterial doesn't support emissive - use color only
        const baseOpacity = 0.9 * this.opacityMultiplier;
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: baseOpacity,
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.05 + 0.02,
            (Math.random() - 0.5) * 0.1
        );
        particle.life = 0.5 * this.lifetimeMultiplier; // Shorter life for sparkles
        particle.maxLife = 0.5 * this.lifetimeMultiplier;

        this.scene.add(particle);
        this.particles.push(particle);
        return particle;
    }

    // Step 264: Create particle burst from speakers on strong peaks
    createSpeakerBurst(position, direction, color = 0xff00ff, intensity = 1.0) {
        // Check if particles are enabled
        if (this.preset && !this.preset.enabled) {
            return;
        }

        const baseCount = intensity * 10;
        const burstCount = Math.floor(baseCount * this.spawnRateMultiplier);
        for (let i = 0; i < burstCount; i++) {
            const burstPos = position
                .clone()
                .add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2
                    )
                );
            const burstDir = direction
                .clone()
                .add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 0.3,
                        (Math.random() - 0.5) * 0.3,
                        (Math.random() - 0.5) * 0.3
                    )
                )
                .normalize();
            const particle = this.createDashStreak(burstPos, burstDir, color);
            particle.life = 0.3;
            particle.maxLife = 0.3;
        }
    }

    // Step 180: Add small streak particle when dashing
    createDashStreak(startPos, direction, color = 0x00ffff) {
        // Check if particles are enabled
        if (this.preset && !this.preset.enabled) {
            return null;
        }

        // Apply spawn rate multiplier (random chance to skip)
        if (this.spawnRateMultiplier < 1.0 && Math.random() > this.spawnRateMultiplier) {
            return null;
        }

        const baseRadius = 0.02 * this.sizeMultiplier;
        const topRadius = 0.05 * this.sizeMultiplier;
        const height = 0.3 * this.sizeMultiplier;
        const geometry = new THREE.CylinderGeometry(baseRadius, topRadius, height, 4);
        // MeshBasicMaterial doesn't support emissive - use color only
        const baseOpacity = 0.7 * this.opacityMultiplier;
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: baseOpacity,
        });
        const streak = new THREE.Mesh(geometry, material);
        streak.position.copy(startPos);
        streak.lookAt(startPos.clone().add(direction));
        streak.velocity = direction.clone().multiplyScalar(0.5);
        streak.life = 0.3 * this.lifetimeMultiplier;
        streak.maxLife = 0.3 * this.lifetimeMultiplier;

        this.scene.add(streak);
        this.particles.push(streak);
        return streak;
    }

    // Step 181: Add goo splat effect for certain collisions
    createGooSplat(position, normal, color = 0xff00ff) {
        // Check if particles are enabled
        if (this.preset && !this.preset.enabled) {
            return;
        }

        const baseCount = 5;
        const splatCount = Math.floor(baseCount * this.spawnRateMultiplier);
        for (let i = 0; i < splatCount; i++) {
            const baseSize = 0.08 * this.sizeMultiplier;
            const geometry = new THREE.SphereGeometry(baseSize, 6, 6);
            // MeshBasicMaterial doesn't support emissive - use color only
            const baseOpacity = 0.8 * this.opacityMultiplier;
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: baseOpacity,
            });
            const splat = new THREE.Mesh(geometry, material);
            splat.position.copy(position);

            // Spread along surface normal
            const spread = normal.clone().multiplyScalar(0.1);
            spread.add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                )
            );
            splat.velocity = spread;
            splat.life = 1.5 * this.lifetimeMultiplier;
            splat.maxLife = 1.5 * this.lifetimeMultiplier;

            this.scene.add(splat);
            this.particles.push(splat);
        }
    }

    // Override SystemLoop.update() to match existing signature
    update(deltaTime, _elapsedTime, _systems) {
        // Codex Enhancement: Rest mode - particles fade faster
        const fadeMultiplier = this.restMode ? 2.0 : 1.0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle) {
                continue;
            }

            // Update position
            if (particle.velocity) {
                particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

                // Apply gravity to some particles
                particle.velocity.y -= 2.0 * deltaTime; // Gravity
            }

            // Update life - faster fade in rest mode
            particle.life -= deltaTime * fadeMultiplier;

            // Fade out
            if (particle.material) {
                particle.material.opacity = (particle.life / particle.maxLife) * 0.6;
            }

            // Remove dead particles
            if (particle.life <= 0) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                if (particle.material) {
                    particle.material.dispose();
                }
                this.particles.splice(i, 1);
            }
        }
    }

    dispose() {
        this.particles.forEach((particle) => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            if (particle.material) {
                particle.material.dispose();
            }
        });
        this.particles = [];
    }
}
