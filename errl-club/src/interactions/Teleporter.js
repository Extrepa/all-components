// Teleporter pad that transports avatar to another location
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class Teleporter {
    constructor(scene, position, destination, name = '') {
        this.scene = scene;
        this.position = position.clone();
        this.destination = destination.clone();
        this.name = name;
        this.active = true;
        this.cooldown = 0;
        this.cooldownDuration = 2.0; // seconds

        this.createMesh();
    }

    // Step 212-213: Add teleporter pads with animated materials
    createMesh() {
        // Base pad
        const padGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 16);
        this.padMaterial = createMaterial({
            color: 0x00ffff,
        });

        this.padMesh = new THREE.Mesh(padGeometry, this.padMaterial);
        this.padMesh.position.copy(this.position);
        this.padMesh.rotation.x = Math.PI / 2;
        // Store ID reference to avoid circular serialization issues
        this.padMesh.userData.isTeleporter = true;
        this.padMesh.userData.teleporterId = Math.random().toString(36).substr(2, 9);

        // Animated ring
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 32);
        this.ringMaterial = createMaterial({
            color: 0x00ffff,
        });

        this.ringMesh = new THREE.Mesh(ringGeometry, this.ringMaterial);
        this.ringMesh.position.copy(this.position);
        this.ringMesh.rotation.x = Math.PI / 2;
        this.padMesh.add(this.ringMesh);

        // Particle effect (simple representation)
        this.particles = [];
        this.createParticles();

        this.scene.add(this.padMesh);
    }

    createParticles() {
        // Create simple particle representation
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const particleMaterial = createMaterial({
                color: 0x00ffff,
            });

            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(Math.cos(angle) * 0.8, 0.2, Math.sin(angle) * 0.8);

            this.padMesh.add(particle);
            this.particles.push({
                mesh: particle,
                angle: angle,
                baseRadius: 0.8,
            });
        }
    }

    // Step 213: Implement teleporter logic to reposition avatar
    teleport(avatar) {
        if (!this.active || this.cooldown > 0) {
            return false;
        }

        if (avatar) {
            avatar.position.copy(this.destination);
            avatar.velocity.set(0, 0, 0);
            this.cooldown = this.cooldownDuration;
            console.log('Teleported to:', this.name || 'destination');
            return true;
        }

        return false;
    }

    update(deltaTime, elapsedTime) {
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
            if (this.cooldown < 0) {
                this.cooldown = 0;
            }
        }

        // Animate ring rotation
        this.ringMesh.rotation.z += deltaTime * 2;

        // Animate particles
        for (const particle of this.particles) {
            particle.angle += deltaTime * 1.5;
            particle.mesh.position.x = Math.cos(particle.angle) * particle.baseRadius;
            particle.mesh.position.z = Math.sin(particle.angle) * particle.baseRadius;
            particle.mesh.position.y = 0.2 + Math.sin(elapsedTime * 2 + particle.angle) * 0.1;
        }

        // Pulse emissive intensity
        const pulse = 1.0 + Math.sin(elapsedTime * 3) * 0.5;
        this.padMaterial.emissiveIntensity = pulse;
        this.ringMaterial.emissiveIntensity = pulse * 1.5;
    }

    checkActivation(avatarPosition, activationRadius = 1.5) {
        if (!this.active || this.cooldown > 0) {
            return false;
        }

        const distance = avatarPosition.distanceTo(this.padMesh.position);
        return distance < activationRadius;
    }
}
