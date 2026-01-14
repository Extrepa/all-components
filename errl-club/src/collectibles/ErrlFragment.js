// Errl Fragment - rarer collectible with special properties
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class ErrlFragment {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.collected = false;
        this.collectTime = 0;

        this.createMesh();
    }

    // Step 207: Create "Errl fragments" as rarer collectibles
    createMesh() {
        // Create a more complex geometry - octahedron for fragment shape
        const geometry = new THREE.OctahedronGeometry(0.4, 0);

        // Use MeshBasicMaterial to avoid texture unit limit errors
        // Emissive effect is simulated by bright color
        const material = createMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.95,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.isFragment = true;
        this.mesh.userData.fragmentId = Math.random().toString(36).substr(2, 9);

        // Add rotation
        this.mesh.userData.rotationSpeed = 2 + Math.random() * 2;

        // Add particles/sparkles around it
        this.createSparkles();

        this.scene.add(this.mesh);
    }

    createSparkles() {
        // Add small sparkle particles around the fragment
        const sparkleCount = 6;
        this.sparkles = [];

        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2;
            const radius = 0.6;

            const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            // MeshBasicMaterial doesn't support emissive - use color only
            const sparkleMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
            });

            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * radius
            );

            this.mesh.add(sparkle);
            this.sparkles.push({
                mesh: sparkle,
                angle: angle,
                baseRadius: radius,
            });
        }
    }

    collect(audioContext) {
        if (this.collected) {
            return false;
        }

        this.collected = true;
        this.collectTime = performance.now();

        // Play special collection sound
        if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }

        // Special collection effect
        this.mesh.material.emissiveIntensity = 5.0;
        this.mesh.scale.setScalar(2.0);

        return true;
    }

    update(deltaTime, elapsedTime) {
        if (this.collected) {
            // Collection animation
            const timeSinceCollect = (performance.now() - this.collectTime) / 1000;
            if (timeSinceCollect > 1.0) {
                this.scene.remove(this.mesh);
                return false;
            }

            const progress = timeSinceCollect / 1.0;
            this.mesh.material.opacity = 1 - progress;
            this.mesh.scale.setScalar(2.0 + progress * 3);
        } else {
            // Idle animation
            this.mesh.rotation.y += deltaTime * this.mesh.userData.rotationSpeed;
            this.mesh.rotation.x += deltaTime * this.mesh.userData.rotationSpeed * 0.7;

            // Rotate sparkles
            for (const sparkle of this.sparkles) {
                sparkle.angle += deltaTime * 2;
                sparkle.mesh.position.x = Math.cos(sparkle.angle) * sparkle.baseRadius;
                sparkle.mesh.position.z = Math.sin(sparkle.angle) * sparkle.baseRadius;
                sparkle.mesh.position.y = Math.sin(sparkle.angle * 2) * 0.3;

                // Sparkle pulse
                const pulse = 0.5 + Math.sin(elapsedTime * 5 + sparkle.angle) * 0.5;
                sparkle.mesh.material.opacity = pulse;
            }

            // Fragment pulse
            this.mesh.material.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 3) * 1.0;
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
