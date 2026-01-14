// Bubble collectible - larger floating bubbles that can be popped
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class BubbleCollectible {
    constructor(scene, position, size = 1.0) {
        this.scene = scene;
        this.position = position.clone();
        this.size = size;
        this.popped = false;
        this.popTime = 0;
        this.floatOffset = Math.random() * Math.PI * 2;

        this.createMesh();
    }

    // Step 205: Add larger floating bubbles that can be popped on contact or key press
    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 16, 16);

        // Use MeshBasicMaterial to avoid texture unit limit errors
        const material = createMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.isBubble = true;
        this.mesh.userData.bubbleId = Math.random().toString(36).substr(2, 9);

        // Add inner glow
        const innerGeometry = new THREE.SphereGeometry(this.size * 0.8, 16, 16);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
        });
        this.innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
        this.mesh.add(this.innerMesh);

        this.scene.add(this.mesh);
    }

    // Step 206: Add a screen ripple/glass distortion when popping bubbles
    pop(audioContext, screenRippleCallback = null) {
        if (this.popped) {
            return false;
        }

        this.popped = true;
        this.popTime = performance.now();

        // Play pop sound
        if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 400;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }

        // Trigger screen ripple effect
        if (screenRippleCallback) {
            screenRippleCallback(this.mesh.position);
        }

        return true;
    }

    update(deltaTime, elapsedTime) {
        if (this.popped) {
            // Pop animation
            const timeSincePop = (performance.now() - this.popTime) / 1000;
            if (timeSincePop > 0.3) {
                this.scene.remove(this.mesh);
                return false; // Signal to remove
            }

            // Expand and fade
            const progress = timeSincePop / 0.3;
            this.mesh.scale.setScalar(1 + progress * 2);
            this.mesh.material.opacity = 0.3 * (1 - progress);
            this.innerMesh.material.opacity = 0.2 * (1 - progress);
        } else {
            // Floating animation
            this.mesh.position.y =
                this.position.y + Math.sin(elapsedTime * 0.5 + this.floatOffset) * 0.3;
            this.mesh.rotation.y += deltaTime * 0.5;
            this.mesh.rotation.x += deltaTime * 0.3;
        }

        return true;
    }

    checkPop(avatarPosition, popRadius = 1.5) {
        if (this.popped) {
            return false;
        }

        const distance = avatarPosition.distanceTo(this.mesh.position);
        return distance < popRadius;
    }
}
