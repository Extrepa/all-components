// Portal rift with swirling shaders that teleport to mini-rooms
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class PortalRift {
    constructor(scene, position, destination, name = 'Portal', beatDetector = null) {
        this.scene = scene;
        this.position = position.clone();
        this.destination = destination.clone();
        this.name = name;
        this.active = true;
        this.swirlTime = 0;
        this.beatDetector = beatDetector;
        this.lastBeatTime = 0;
        this.beatPulseIntensity = 0;

        this.createMesh();
    }

    // Step 225-226: Portal rifts with swirling shaders
    createMesh() {
        // Create portal ring
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 32);
        const ringMaterial = createMaterial({
            color: 0x00ffff,
        });

        this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ringMesh.position.copy(this.position);
        this.ringMesh.rotation.x = Math.PI / 2;

        // Create swirling portal center
        const portalGeometry = new THREE.CircleGeometry(1.3, 32);
        const portalMaterial = createMaterial({
            color: 0x001111, // Dark cyan to simulate emissive
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
        });

        this.portalMesh = new THREE.Mesh(portalGeometry, portalMaterial);
        this.portalMesh.position.copy(this.position);
        this.portalMesh.rotation.x = Math.PI / 2;

        this.mesh = new THREE.Group();
        this.mesh.add(this.ringMesh);
        this.mesh.add(this.portalMesh);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.portalRiftId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isInteractable = true;

        // Create particle effect for swirling (must be after mesh is created)
        this.particles = [];
        this.createParticles();

        this.scene.add(this.mesh);
    }

    createParticles() {
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1.0 + Math.random() * 0.5;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            // Cyan particles
            colors[i * 3] = 0;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });

        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.particleSystem.position.copy(this.position);
        this.mesh.add(this.particleSystem);
    }

    update(deltaTime, elapsedTime, beatDetected = false, beatIntensity = 0) {
        this.swirlTime += deltaTime;

        // Codex Enhancement: Beat synchronization - pulse on detected beats
        if (
            beatDetected ||
            (this.beatDetector && this.beatDetector.lastBeatTime > this.lastBeatTime)
        ) {
            this.lastBeatTime = elapsedTime;
            this.beatPulseIntensity = 1.0;
            // Pulse ring color on beat
            if (this.ringMesh && this.ringMesh.material) {
                const pulseColor = new THREE.Color().setHSL(
                    0.5 + beatIntensity * 0.2,
                    1.0,
                    0.5 + beatIntensity * 0.3
                );
                this.ringMesh.material.emissive.copy(pulseColor);
            }
        }

        // Decay beat pulse intensity
        this.beatPulseIntensity = Math.max(0, this.beatPulseIntensity - deltaTime * 3);

        // Rotate ring
        this.ringMesh.rotation.z += deltaTime * 2;

        // Swirl portal center with beat enhancement
        const swirlIntensity = Math.sin(elapsedTime * 3) * 0.5 + 0.5;
        const beatBoost = this.beatPulseIntensity * 2.0; // Boost intensity on beat
        this.portalMesh.material.emissiveIntensity = 1.0 + swirlIntensity + beatBoost;
        this.portalMesh.rotation.z += deltaTime * (3 + beatIntensity * 2); // Faster rotation on beat

        // Animate particles in spiral with beat enhancement
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const beatRadiusBoost = this.beatPulseIntensity * 0.5;
            for (let i = 0; i < positions.length; i += 3) {
                const angle = (i / 3 / 50) * Math.PI * 2 + this.swirlTime * (2 + beatIntensity);
                const radius = 1.0 + Math.sin(this.swirlTime * 2 + i) * 0.3 + beatRadiusBoost;
                positions[i] = Math.cos(angle) * radius;
                positions[i + 2] = Math.sin(angle) * radius;
            }
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
            this.particleSystem.rotation.y += deltaTime * (1 + beatIntensity);
        }
    }

    // Set beat detector reference
    setBeatDetector(beatDetector) {
        this.beatDetector = beatDetector;
    }

    // Check if avatar can teleport
    checkActivation(avatarPosition) {
        if (!this.active) {
            return false;
        }

        const distance = avatarPosition.distanceTo(this.position);
        return distance < 1.5; // Activation radius
    }

    // Teleport avatar to destination
    teleport(avatar) {
        if (!this.active) {
            return;
        }

        avatar.position.copy(this.destination);
        console.log(`Teleported to ${this.name}`);

        // Create teleport effect
        this.triggerTeleportEffect();
    }

    triggerTeleportEffect() {
        // Brief flash effect
        this.portalMesh.material.emissiveIntensity = 5.0;
        setTimeout(() => {
            if (this.portalMesh && this.portalMesh.material) {
                this.portalMesh.material.emissiveIntensity = 1.5;
            }
        }, 100);
    }

    getMesh() {
        return this.mesh;
    }
}
