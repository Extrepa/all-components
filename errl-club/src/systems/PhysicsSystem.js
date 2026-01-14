// Physics system for pushable objects and ramps
import * as THREE from 'three';
import { SystemLoop } from './SystemLoop.js';

export class PhysicsSystem extends SystemLoop {
    constructor(scene, loopManager = null) {
        super('physics', 'physics', 20);
        this.scene = scene;
        this.pushableObjects = [];
        this.ramps = [];

        // Self-register with LoopManager if provided
        if (loopManager) {
            this.register(loopManager);
        }
    }

    // Step 171: Add ability to push simple physics objects when walking into them
    registerPushableObject(object, mass = 1.0, friction = 0.8) {
        const physicsObject = {
            mesh: object,
            velocity: new THREE.Vector3(0, 0, 0),
            mass: mass,
            friction: friction,
            position: object.position.clone(),
        };
        this.pushableObjects.push(physicsObject);
        return physicsObject;
    }

    // Step 172: Add basic ramp/walkable slope support using surface normals
    registerRamp(geometry, position, normal) {
        const ramp = {
            geometry: geometry,
            position: position,
            normal: normal.normalize(),
            mesh: null, // Will be set when mesh is created
        };
        this.ramps.push(ramp);
        return ramp;
    }

    // Check collision with pushable objects and apply physics
    checkPushableCollisions(avatarPosition, avatarRadius, avatarVelocity) {
        for (const obj of this.pushableObjects) {
            const distance = avatarPosition.distanceTo(obj.mesh.position);
            const minDistance = avatarRadius + 0.3; // Object radius approximation

            if (distance < minDistance) {
                // Calculate push direction
                const pushDirection = new THREE.Vector3()
                    .subVectors(obj.mesh.position, avatarPosition)
                    .normalize();

                // Apply push force based on avatar velocity
                const pushForce = avatarVelocity.length() * 0.5;
                obj.velocity.add(pushDirection.multiplyScalar(-pushForce / obj.mass));
            }
        }
    }

    // Update physics objects
    // Override SystemLoop.update() to match existing signature
    update(deltaTime, _elapsedTime, _systems) {
        // Update pushable objects
        for (const obj of this.pushableObjects) {
            // Apply friction
            obj.velocity.multiplyScalar(obj.friction);

            // Update position
            obj.mesh.position.add(obj.velocity.clone().multiplyScalar(deltaTime));

            // Stop if velocity is very small
            if (obj.velocity.length() < 0.01) {
                obj.velocity.set(0, 0, 0);
            }
        }
    }

    // Step 172: Get surface normal at position (for ramp support)
    getSurfaceNormal(position) {
        // Check if position is on a ramp
        for (const ramp of this.ramps) {
            // Simple bounding box check (would use proper raycasting in full implementation)
            const rampBounds = new THREE.Box3().setFromObject(ramp.mesh || ramp.geometry);
            if (rampBounds.containsPoint(position)) {
                return ramp.normal;
            }
        }

        // Default: flat ground
        return new THREE.Vector3(0, 1, 0);
    }
}
