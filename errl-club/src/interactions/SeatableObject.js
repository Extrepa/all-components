// Seatable object that avatar can sit/lean on
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class SeatableObject {
    constructor(scene, position, type = 'chair', size = { width: 0.8, height: 0.5, depth: 0.8 }) {
        this.scene = scene;
        this.position = position.clone();
        this.type = type; // 'chair', 'bench', 'lean'
        this.size = size;
        this.occupiedBy = null; // Avatar currently using this

        this.createMesh();
    }

    // Step 237: Make certain objects seatable / leanable (avatar goes into chill pose)
    createMesh() {
        let geometry, material;

        if (this.type === 'chair') {
            // Simple chair geometry
            geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
            material = createMaterial({
                color: 0x4a4a4a,
            });
        } else if (this.type === 'bench') {
            // Bench geometry
            geometry = new THREE.BoxGeometry(
                this.size.width * 2,
                this.size.height,
                this.size.depth
            );
            material = createMaterial({
                color: 0x3a3a3a,
            });
        } else {
            // Lean surface (wall, bar, etc.)
            geometry = new THREE.BoxGeometry(this.size.width, this.size.height, 0.2);
            material = createMaterial({
                color: 0x5a5a5a,
            });
        }

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.seatableId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isSeatable = true;

        this.scene.add(this.mesh);
    }

    // Check if avatar can sit/lean here
    canUse(avatarPosition, useRadius = 1.5) {
        if (this.occupiedBy) {
            return false;
        } // Already occupied

        const distance = avatarPosition.distanceTo(this.mesh.position);
        return distance < useRadius;
    }

    // Avatar starts using this seatable object
    use(avatar) {
        if (this.occupiedBy) {
            return false;
        }

        this.occupiedBy = avatar;

        // Position avatar appropriately
        if (this.type === 'chair' || this.type === 'bench') {
            avatar.sit();
            // Position avatar on seat
            avatar.position.copy(this.mesh.position);
            avatar.position.y = this.mesh.position.y + this.size.height / 2 + avatar.radius;
        } else {
            // Lean pose (could be a new state)
            avatar.setState('idle');
            avatar.position.copy(this.mesh.position);
            avatar.position.y = this.mesh.position.y + this.size.height / 2;
        }

        return true;
    }

    // Avatar stops using this seatable object
    release() {
        this.occupiedBy = null;
    }

    // Check if avatar is still using this
    isOccupiedBy(avatar) {
        return this.occupiedBy === avatar;
    }
}
