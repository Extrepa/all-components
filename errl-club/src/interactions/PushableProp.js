// Pushable physics prop that can be moved by the avatar
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class PushableProp {
    constructor(scene, position, size = { width: 0.5, height: 0.5, depth: 0.5 }, type = 'crate') {
        this.scene = scene;
        this.position = position.clone();
        this.size = size;
        this.type = type;

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.mass = 1.0;
        this.friction = 0.85;
        this.isPushed = false;

        this.createMesh();
    }

    // Step 243: Add pushable physics props
    createMesh() {
        let geometry;
        let material;

        switch (this.type) {
            case 'crate':
                geometry = new THREE.BoxGeometry(
                    this.size.width,
                    this.size.height,
                    this.size.depth
                );
                material = createMaterial({
                    color: 0x8b4513,
                });
                break;

            case 'box':
                geometry = new THREE.BoxGeometry(
                    this.size.width,
                    this.size.height,
                    this.size.depth
                );
                material = createMaterial({
                    color: 0x654321,
                });
                break;

            case 'barrel':
                geometry = new THREE.CylinderGeometry(
                    this.size.width / 2,
                    this.size.width / 2,
                    this.size.height,
                    16
                );
                material = createMaterial({
                    color: 0x4a4a4a,
                });
                break;

            default:
                geometry = new THREE.BoxGeometry(
                    this.size.width,
                    this.size.height,
                    this.size.depth
                );
                material = createMaterial({
                    color: 0x666666,
                });
        }

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.pushablePropId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isPushable = true;

        // Add outline for visibility
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
        );
        this.mesh.add(line);

        this.scene.add(this.mesh);
    }

    // Check collision with avatar and apply push
    checkCollision(avatarPosition, avatarRadius, avatarVelocity) {
        const distance = avatarPosition.distanceTo(this.mesh.position);
        const minDistance = avatarRadius + Math.max(this.size.width, this.size.depth) / 2;

        if (distance < minDistance) {
            // Calculate push direction (away from avatar)
            const pushDirection = new THREE.Vector3()
                .subVectors(this.mesh.position, avatarPosition)
                .normalize();

            // Apply push force based on avatar velocity
            const pushForce = avatarVelocity.length() * 0.3;
            this.velocity.add(pushDirection.multiplyScalar(pushForce / this.mass));
            this.isPushed = true;

            return true;
        }

        this.isPushed = false;
        return false;
    }

    update(deltaTime, roomBounds) {
        // Apply friction
        this.velocity.multiplyScalar(this.friction);

        // Update position
        const newPosition = this.mesh.position
            .clone()
            .add(this.velocity.clone().multiplyScalar(deltaTime));

        // Check room bounds
        if (roomBounds) {
            const halfSize = Math.max(this.size.width, this.size.depth) / 2;
            newPosition.x = Math.max(
                roomBounds.minX + halfSize,
                Math.min(roomBounds.maxX - halfSize, newPosition.x)
            );
            newPosition.z = Math.max(
                roomBounds.minZ + halfSize,
                Math.min(roomBounds.maxZ - halfSize, newPosition.z)
            );
        }

        this.mesh.position.copy(newPosition);

        // Stop if velocity is very small
        if (this.velocity.length() < 0.01) {
            this.velocity.set(0, 0, 0);
            this.isPushed = false;
        }
    }

    getMesh() {
        return this.mesh;
    }

    getPosition() {
        return this.mesh.position.clone();
    }
}
