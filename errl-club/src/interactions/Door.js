// Animated door that can slide open/closed
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class Door {
    constructor(
        scene,
        position,
        direction = 'horizontal',
        size = { width: 2, height: 3, depth: 0.2 }
    ) {
        this.scene = scene;
        this.position = position.clone();
        this.direction = direction; // 'horizontal' or 'vertical'
        this.size = size;
        this.isOpen = false;
        this.openProgress = 0; // 0 = closed, 1 = open
        this.openSpeed = 2.0; // units per second

        this.createMesh();
    }

    // Step 209-210: Add doorway meshes that can open when approached
    createMesh() {
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
        const material = createMaterial({
            color: 0x333333,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store reference as string ID to avoid circular reference during serialization
        this.mesh.userData.isDoor = true;
        this.mesh.userData.doorId = Math.random().toString(36).substr(2, 9);

        // Store initial position for sliding animation
        this.initialPosition = this.position.clone();

        this.scene.add(this.mesh);
    }

    // Step 210: Animate doors sliding open/closed with easing
    open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
    }

    close() {
        if (!this.isOpen) {
            return;
        }
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    update(deltaTime) {
        const targetProgress = this.isOpen ? 1.0 : 0.0;

        // Smooth interpolation
        if (this.openProgress < targetProgress) {
            this.openProgress = Math.min(
                this.openProgress + this.openSpeed * deltaTime,
                targetProgress
            );
        } else if (this.openProgress > targetProgress) {
            this.openProgress = Math.max(
                this.openProgress - this.openSpeed * deltaTime,
                targetProgress
            );
        }

        // Step 210: Easing function for smooth animation
        const easedProgress = this.easeInOutCubic(this.openProgress);

        // Calculate slide distance
        const slideDistance = this.size.width * 1.2; // Slide fully out of the way

        // Apply position based on direction
        if (this.direction === 'horizontal') {
            this.mesh.position.x = this.initialPosition.x + easedProgress * slideDistance;
        } else {
            this.mesh.position.z = this.initialPosition.z + easedProgress * slideDistance;
        }
    }

    // Easing function for smooth door animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Check if avatar is near door (for auto-open)
    checkProximity(avatarPosition, proximityDistance = 3.0) {
        const distance = avatarPosition.distanceTo(this.mesh.position);
        return distance < proximityDistance;
    }
}
