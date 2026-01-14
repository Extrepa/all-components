// Collision detection system for avatar
import * as THREE from 'three';

export class CollisionSystem {
    constructor(scene, roomBounds) {
        this.scene = scene;
        this.roomBounds = roomBounds;
        this.colliders = []; // Array of collider objects
        this.movingPlatforms = []; // Array of moving platform objects
    }

    // Step 157: Add bounding box/sphere for avatar collisions
    checkAvatarCollision(avatarPosition, avatarRadius, velocity) {
        const newPosition = avatarPosition.clone().add(velocity);

        // Step 158: Floor raycasting to determine proper Y position
        // For now, use simple floor check (will enhance with raycasting later)
        const floorY = 0; // Base floor height

        // Step 159: Detect wall collisions and slide along surfaces
        const finalPosition = newPosition.clone();
        const finalVelocity = velocity.clone();

        // Check room bounds (wall collisions)
        if (finalPosition.x - avatarRadius < this.roomBounds.minX) {
            finalPosition.x = this.roomBounds.minX + avatarRadius;
            finalVelocity.x = 0; // Stop horizontal movement
        } else if (finalPosition.x + avatarRadius > this.roomBounds.maxX) {
            finalPosition.x = this.roomBounds.maxX - avatarRadius;
            finalVelocity.x = 0;
        }

        if (finalPosition.z - avatarRadius < this.roomBounds.minZ) {
            finalPosition.z = this.roomBounds.minZ + avatarRadius;
            finalVelocity.z = 0;
        } else if (finalPosition.z + avatarRadius > this.roomBounds.maxZ) {
            finalPosition.z = this.roomBounds.maxZ - avatarRadius;
            finalVelocity.z = 0;
        }

        return {
            position: finalPosition,
            velocity: finalVelocity,
            onFloor: finalPosition.y <= floorY + avatarRadius + 0.1,
        };
    }

    // Step 160: Add logic to resolve if avatar gets stuck in geometry
    resolveStuckPosition(avatarPosition, avatarRadius) {
        // Simple unstuck: push avatar to nearest valid position
        const resolvedPosition = avatarPosition.clone();

        // Ensure avatar is within bounds
        resolvedPosition.x = Math.max(
            this.roomBounds.minX + avatarRadius,
            Math.min(this.roomBounds.maxX - avatarRadius, resolvedPosition.x)
        );
        resolvedPosition.z = Math.max(
            this.roomBounds.minZ + avatarRadius,
            Math.min(this.roomBounds.maxZ - avatarRadius, resolvedPosition.z)
        );

        return resolvedPosition;
    }

    // Add a collider object (for future use with interactive objects)
    addCollider(collider) {
        this.colliders.push(collider);
    }

    // Check collision with all colliders
    checkColliders(avatarPosition, avatarRadius) {
        const collisions = [];
        for (const collider of this.colliders) {
            const distance = avatarPosition.distanceTo(collider.position);
            if (distance < avatarRadius + collider.radius) {
                collisions.push(collider);
            }
        }
        return collisions;
    }

    // Register a moving platform for collision detection
    registerMovingPlatform(platform) {
        if (platform && platform.mesh) {
            this.movingPlatforms.push(platform);
        }
    }

    // Get all registered moving platforms
    getMovingPlatforms() {
        return this.movingPlatforms;
    }
}
