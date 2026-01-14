// Moving platform that avatar can ride
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class MovingPlatform {
    constructor(scene, startPosition, endPosition, speed = 1.0, pauseTime = 1.0) {
        this.scene = scene;
        this.startPosition = startPosition.clone();
        this.endPosition = endPosition.clone();
        this.speed = speed; // Units per second
        this.pauseTime = pauseTime; // Time to pause at each end

        this.currentPosition = startPosition.clone();
        this.direction = 1; // 1 = moving to end, -1 = moving to start
        this.pauseTimer = 0;
        this.isPaused = false;

        // Track which avatar is riding
        this.ridingAvatar = null;

        this.createMesh();
    }

    // Step 211: Add moving platforms (for future game-like interactions)
    createMesh() {
        const geometry = new THREE.BoxGeometry(2, 0.2, 2);
        const material = createMaterial({
            color: 0x555555, // Slightly brighter to simulate emissive
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.startPosition);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.movingPlatformId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isMovingPlatform = true;

        // Add visual indicator (glowing edges)
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.mesh.add(edges);

        this.scene.add(this.mesh);
    }

    update(deltaTime, avatar) {
        // Check if avatar is on platform
        if (avatar && this.isAvatarOnPlatform(avatar)) {
            if (!this.ridingAvatar) {
                this.ridingAvatar = avatar;
            }
            // Move avatar with platform
            const platformMovement = new THREE.Vector3().subVectors(
                this.currentPosition,
                this.mesh.position
            );
            avatar.position.add(platformMovement);
        } else {
            this.ridingAvatar = null;
        }

        // Handle pause
        if (this.isPaused) {
            this.pauseTimer += deltaTime;
            if (this.pauseTimer >= this.pauseTime) {
                this.isPaused = false;
                this.pauseTimer = 0;
                this.direction *= -1; // Reverse direction
            }
            return;
        }

        // Calculate movement
        const distance = this.startPosition.distanceTo(this.endPosition);
        const moveDistance = this.speed * deltaTime;
        const progress = this.currentPosition.distanceTo(this.startPosition) / distance;

        // Move towards target
        const target = this.direction > 0 ? this.endPosition : this.startPosition;
        const direction = new THREE.Vector3().subVectors(target, this.currentPosition).normalize();
        this.currentPosition.add(direction.multiplyScalar(moveDistance));

        // Check if reached end
        const distanceToTarget = this.currentPosition.distanceTo(target);
        if (distanceToTarget < 0.1) {
            this.currentPosition.copy(target);
            this.isPaused = true;
            this.pauseTimer = 0;
        }

        // Update mesh position
        this.mesh.position.copy(this.currentPosition);
    }

    isAvatarOnPlatform(avatar) {
        const platformBounds = {
            minX: this.mesh.position.x - 1,
            maxX: this.mesh.position.x + 1,
            minZ: this.mesh.position.z - 1,
            maxZ: this.mesh.position.z + 1,
            minY: this.mesh.position.y,
            maxY: this.mesh.position.y + 0.5,
        };

        const avatarPos = avatar.position;
        return (
            avatarPos.x >= platformBounds.minX &&
            avatarPos.x <= platformBounds.maxX &&
            avatarPos.z >= platformBounds.minZ &&
            avatarPos.z <= platformBounds.maxZ &&
            avatarPos.y >= platformBounds.minY &&
            avatarPos.y <= platformBounds.maxY + 0.5
        );
    }

    getPosition() {
        return this.mesh.position.clone();
    }
}
