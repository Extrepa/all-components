// Glow-ball pickup that temporarily supercharges aura and lights
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class GlowBall {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.collected = false;
        this.collectTime = 0;

        this.createMesh();
    }

    // Step 233: Implement glow-ball pickups that temporarily supercharge aura and lights
    createMesh() {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);

        // Use MeshBasicMaterial to avoid texture unit limit errors
        // Emissive effect is simulated by bright color
        const material = createMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.9,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.isGlowBall = true;
        this.mesh.userData.glowBallId = Math.random().toString(36).substr(2, 9);

        // Add outer glow ring
        const ringGeometry = new THREE.TorusGeometry(0.7, 0.05, 8, 32);
        // MeshBasicMaterial doesn't support emissive - use color only
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
        });

        this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ringMesh.rotation.x = Math.PI / 2;
        this.mesh.add(this.ringMesh);

        this.scene.add(this.mesh);
    }

    collect(audioContext) {
        if (this.collected) {
            return false;
        }

        this.collected = true;
        this.collectTime = performance.now();

        // Play collection sound
        if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }

        // Start collection animation
        this.mesh.material.emissiveIntensity = 5.0;
        this.mesh.scale.setScalar(2.0);

        return true;
    }

    // Step 234: Add visual aura "burn" around avatar when powered up
    applyPowerUp(avatar, duration = 10.0) {
        if (!avatar) {
            return;
        }

        // Increase avatar emissive intensity
        const originalIntensity = avatar.material.emissiveIntensity;
        avatar.material.emissiveIntensity = originalIntensity * 3;
        avatar.material.emissive.set(0xffff00);

        // Create aura effect
        const auraGeometry = new THREE.SphereGeometry(avatar.radius * 1.5, 16, 16);
        // MeshBasicMaterial doesn't support emissive - use color only
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
        });

        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        avatar.group.add(aura);

        // Remove after duration
        setTimeout(() => {
            if (avatar.material) {
                avatar.material.emissiveIntensity = originalIntensity;
                avatar.material.emissive.set(avatar.material.color);
            }
            if (aura && avatar.group) {
                avatar.group.remove(aura);
            }
        }, duration * 1000);

        return aura;
    }

    update(deltaTime, elapsedTime) {
        if (this.collected) {
            // Collection animation
            const timeSinceCollect = (performance.now() - this.collectTime) / 1000;
            if (timeSinceCollect > 0.8) {
                this.scene.remove(this.mesh);
                return false;
            }

            const progress = timeSinceCollect / 0.8;
            this.mesh.material.opacity = 1 - progress;
            this.mesh.scale.setScalar(2.0 + progress * 2);
        } else {
            // Idle animation
            this.mesh.rotation.y += deltaTime * 1.5;
            this.mesh.rotation.x += deltaTime * 1.0;

            // Pulse
            const pulse = 1 + Math.sin(elapsedTime * 4) * 0.3;
            this.mesh.scale.setScalar(pulse);

            // Rotate ring
            this.ringMesh.rotation.z += deltaTime * 2;

            // Emissive pulse
            this.mesh.material.emissiveIntensity = 3.0 + Math.sin(elapsedTime * 5) * 1.0;
        }

        return true;
    }

    checkCollection(avatarPosition, collectRadius = 1.0) {
        if (this.collected) {
            return false;
        }

        const distance = avatarPosition.distanceTo(this.mesh.position);
        return distance < collectRadius;
    }
}
