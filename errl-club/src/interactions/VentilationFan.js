// Spinning ventilation fan with collision that nudges avatar
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class VentilationFan {
    constructor(scene, position, size = 1.0, rotationSpeed = 2.0) {
        this.scene = scene;
        this.position = position.clone();
        this.size = size;
        this.rotationSpeed = rotationSpeed; // Rotations per second
        this.rotation = 0;

        // Collision box for nudging avatar
        this.collisionRadius = size * 0.6;
        this.nudgeStrength = 0.3;

        this.createMesh();
    }

    // Step 215: Add spinning ventilation fans with collision boxes that nudge the avatar
    createMesh() {
        // Create fan blades
        const bladeGeometry = new THREE.BoxGeometry(
            this.size * 0.1,
            this.size * 0.02,
            this.size * 0.4
        );
        const bladeMaterial = createMaterial({
            color: 0x888888,
        });

        this.fanGroup = new THREE.Group();

        // Create 4 blades
        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            const angle = (i / 4) * Math.PI * 2;
            blade.position.set(
                Math.cos(angle) * this.size * 0.2,
                0,
                Math.sin(angle) * this.size * 0.2
            );
            blade.rotation.y = angle;
            this.fanGroup.add(blade);
        }

        // Create center hub
        const hubGeometry = new THREE.CylinderGeometry(
            this.size * 0.1,
            this.size * 0.1,
            this.size * 0.05,
            16
        );
        const hubMaterial = createMaterial({
            color: 0x666666,
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.rotation.x = Math.PI / 2;
        this.fanGroup.add(hub);

        // Create housing/frame
        const frameGeometry = new THREE.CylinderGeometry(
            this.size * 0.5,
            this.size * 0.5,
            this.size * 0.1,
            16
        );
        const frameMaterial = createMaterial({
            color: 0x444444,
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.rotation.x = Math.PI / 2;
        frame.position.y = -this.size * 0.05;
        this.fanGroup.add(frame);

        this.fanGroup.position.copy(this.position);
        this.scene.add(this.fanGroup);
    }

    update(deltaTime, bassEnergy = 0) {
        // Rotate fan blades
        // Step 215: Animate rotation based on music or time
        const musicMultiplier = 1.0 + bassEnergy * 0.5; // Speed up with bass
        this.rotation += this.rotationSpeed * Math.PI * 2 * deltaTime * musicMultiplier;
        this.fanGroup.rotation.y = this.rotation;
    }

    // Check if avatar is in collision range and nudge it
    checkCollision(avatarPosition, avatarRadius) {
        const distance = avatarPosition.distanceTo(this.position);
        const collisionDistance = this.collisionRadius + avatarRadius;

        if (distance < collisionDistance) {
            // Calculate nudge direction (away from fan center)
            const nudgeDirection = new THREE.Vector3()
                .subVectors(avatarPosition, this.position)
                .normalize();

            // Apply nudge based on fan rotation (tangential force)
            const tangent = new THREE.Vector3(-nudgeDirection.z, 0, nudgeDirection.x);
            const nudge = tangent.multiplyScalar(this.nudgeStrength);

            return nudge;
        }

        return null;
    }
}
