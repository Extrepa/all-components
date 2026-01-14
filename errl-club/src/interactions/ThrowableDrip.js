// Throwable drip orb that can be thrown and leaves splat decals
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class ThrowableDrip {
    constructor(scene, position, velocity, color = 0xff00ff) {
        this.scene = scene;
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.color = color;
        this.active = true;
        this.age = 0;
        this.maxAge = 10.0; // Drip expires after 10 seconds
        this.gravity = -9.8;
        this.bounced = false;

        this.createMesh();
    }

    // Step 246-247: Throwable drip orbs with splat decals
    createMesh() {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        // Use MeshBasicMaterial to avoid texture unit limit errors
        // Emissive effect is simulated by bright color
        const material = createMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.9,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3,
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);

        this.scene.add(this.mesh);
    }

    update(deltaTime, roomBounds) {
        if (!this.active) {
            return;
        }

        this.age += deltaTime;

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);

        // Check floor collision
        if (this.position.y <= 0.15 && this.velocity.y < 0) {
            this.position.y = 0.15;
            this.velocity.y *= -0.5; // Bounce with energy loss
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;

            if (!this.bounced) {
                this.bounced = true;
                // Create splat effect on first bounce
                this.createSplat();
            }
        }

        // Check wall collisions
        if (roomBounds) {
            if (this.position.x < roomBounds.minX || this.position.x > roomBounds.maxX) {
                this.velocity.x *= -0.7;
                this.position.x = Math.max(
                    roomBounds.minX,
                    Math.min(roomBounds.maxX, this.position.x)
                );
            }
            if (this.position.z < roomBounds.minZ || this.position.z > roomBounds.maxZ) {
                this.velocity.z *= -0.7;
                this.position.z = Math.max(
                    roomBounds.minZ,
                    Math.min(roomBounds.maxZ, this.position.z)
                );
            }
        }

        // Remove if too slow or expired
        if (this.velocity.length() < 0.1 && this.bounced) {
            this.active = false;
        }

        if (this.age > this.maxAge) {
            this.active = false;
        }

        // Animate glow
        const pulse = Math.sin(this.age * 5) * 0.1 + 1.0;
        this.glowMesh.scale.setScalar(pulse);
    }

    // Step 247: Create splat decal on impact
    createSplat() {
        const splatGeometry = new THREE.CircleGeometry(0.3, 16);
        const splatMaterial = createMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
        });

        const splat = new THREE.Mesh(splatGeometry, splatMaterial);
        splat.position.set(this.position.x, 0.16, this.position.z);
        splat.rotation.x = -Math.PI / 2;

        // Random rotation for variety
        splat.rotation.z = Math.random() * Math.PI * 2;

        // Random scale
        const scale = 0.7 + Math.random() * 0.6;
        splat.scale.set(scale, scale, 1);

        splat.userData.splat = {
            age: 0,
            maxAge: 30.0, // Splat fades over 30 seconds
            fadeStart: 25.0,
        };

        this.scene.add(splat);

        // Store reference for cleanup
        this.splatMesh = splat;
    }

    // Update splat fade
    updateSplat(deltaTime) {
        if (this.splatMesh && this.splatMesh.userData.splat) {
            const data = this.splatMesh.userData.splat;
            data.age += deltaTime;

            if (data.age > data.maxAge) {
                this.scene.remove(this.splatMesh);
                this.splatMesh = null;
                return;
            }

            // Fade out near end
            if (data.age > data.fadeStart) {
                const fadeProgress = (data.age - data.fadeStart) / (data.maxAge - data.fadeStart);
                this.splatMesh.material.opacity = 0.7 * (1 - fadeProgress);
            }
        }
    }

    // Remove from scene
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.splatMesh) {
            this.scene.remove(this.splatMesh);
        }
    }

    isActive() {
        return this.active;
    }

    getMesh() {
        return this.mesh;
    }
}
