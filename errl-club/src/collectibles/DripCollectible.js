// Drip collectible - glowing orb that can be collected
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class DripCollectible {
    constructor(scene, position, color = 0x00ffff) {
        this.scene = scene;
        this.position = position.clone();
        this.color = color;
        this.collected = false;
        this.collectTime = 0;

        // Create the drip mesh
        this.createMesh();
    }

    // Step 201-202: Implement collectible "drips" as small glowing orbs with custom shader/material
    createMesh() {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);

        // Use MeshBasicMaterial to avoid texture unit limit errors
        // Emissive effect is simulated by bright color
        const material = createMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.9,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.isDrip = true;
        this.mesh.userData.dripId = Math.random().toString(36).substr(2, 9);

        // Add pulsing animation
        this.mesh.userData.pulseTime = 0;
        this.mesh.userData.rotationSpeed = 1 + Math.random() * 2;

        this.scene.add(this.mesh);
    }

    // Step 203: Add pickup sound effects when collecting drips
    collect(audioContext) {
        if (this.collected) {
            return false;
        }

        this.collected = true;
        this.collectTime = performance.now();

        // Play pickup sound
        if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }

        // Start collection animation
        this.mesh.material.emissiveIntensity = 3.0;
        this.mesh.scale.setScalar(1.5);

        return true;
    }

    // Step 204: Change avatar color or aura briefly when a drip is collected
    applyColorToAvatar(avatar) {
        if (!avatar || !avatar.material) {
            return;
        }

        // Check if material has the required properties
        if (!avatar.material.color) {
            return;
        }

        // Temporarily change avatar color
        const originalColor = avatar.material.color.clone();
        avatar.material.color.set(this.color);
        
        // Only set emissive if material supports it
        if (avatar.material.emissive) {
            avatar.material.emissive.set(this.color);
            avatar.material.emissiveIntensity = 1.5;
        }

        // Reset after 2 seconds
        setTimeout(() => {
            if (avatar.material && avatar.material.color) {
                avatar.material.color.copy(originalColor);
                if (avatar.material.emissive) {
                    avatar.material.emissiveIntensity = 0.5;
                }
            }
        }, 2000);
    }

    update(deltaTime) {
        if (this.collected) {
            // Collection animation
            const timeSinceCollect = (performance.now() - this.collectTime) / 1000;
            if (timeSinceCollect > 0.5) {
                // Remove from scene after animation
                this.scene.remove(this.mesh);
                return false; // Signal to remove from collection
            }

            // Fade out and scale up
            const progress = timeSinceCollect / 0.5;
            this.mesh.material.opacity = 1 - progress;
            this.mesh.scale.setScalar(1.5 + progress * 2);
        } else {
            // Idle animation - pulse and rotate
            this.mesh.userData.pulseTime += deltaTime;
            const pulse = 1 + Math.sin(this.mesh.userData.pulseTime * 3) * 0.2;
            this.mesh.scale.setScalar(pulse);

            this.mesh.rotation.y += deltaTime * this.mesh.userData.rotationSpeed;
            this.mesh.rotation.x += deltaTime * this.mesh.userData.rotationSpeed * 0.5;

            // Emissive pulse
            this.mesh.material.emissiveIntensity =
                1.5 + Math.sin(this.mesh.userData.pulseTime * 4) * 0.5;
        }

        return true; // Still active
    }

    // Check if avatar is close enough to collect
    checkCollection(avatarPosition, collectRadius = 0.8) {
        if (this.collected) {
            return false;
        }

        const distance = avatarPosition.distanceTo(this.mesh.position);
        return distance < collectRadius;
    }
}
