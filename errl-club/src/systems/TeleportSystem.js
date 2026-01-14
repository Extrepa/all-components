// Teleport system for anchors and respawn points
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class TeleportSystem {
    constructor(scene) {
        this.scene = scene;
        this.anchors = [];
        this.respawnPoints = [];
    }

    // Step 197: Add teleport anchors in the club (points you can snap to)
    addAnchor(position, name = '') {
        const anchor = {
            position: position.clone(),
            name: name,
            mesh: this.createAnchorMesh(position),
        };
        this.anchors.push(anchor);
        this.scene.add(anchor.mesh);
        return anchor;
    }

    createAnchorMesh(position) {
        // Create a visible marker for the anchor
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
        const material = createMaterial({
            color: 0x00ffff,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.x = Math.PI / 2;

        // Add a pulsing animation
        mesh.userData.pulseTime = 0;

        return mesh;
    }

    // Step 198: Add respawn points for when avatar falls out of bounds
    addRespawnPoint(position, name = '') {
        const respawn = {
            position: position.clone(),
            name: name,
        };
        this.respawnPoints.push(respawn);
        return respawn;
    }

    // Teleport avatar to nearest anchor
    teleportToNearestAnchor(avatar) {
        if (this.anchors.length === 0) {
            return false;
        }

        let nearest = this.anchors[0];
        let minDistance = avatar.position.distanceTo(nearest.position);

        for (const anchor of this.anchors) {
            const distance = avatar.position.distanceTo(anchor.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = anchor;
            }
        }

        if (minDistance < 5) {
            // Within teleport range
            this.teleportAvatar(avatar, nearest.position);
            return true;
        }

        return false;
    }

    // Teleport avatar to specific position
    teleportAvatar(avatar, position) {
        avatar.position.copy(position);
        avatar.velocity.set(0, 0, 0);
        console.log('Avatar teleported to:', position);
    }

    // Check if avatar needs respawn
    checkRespawn(avatar, bounds) {
        if (!bounds) {
            return false;
        }

        // Check if avatar is out of bounds
        const isOutOfBounds =
            avatar.position.y < bounds.minY ||
            avatar.position.x < bounds.minX ||
            avatar.position.x > bounds.maxX ||
            avatar.position.z < bounds.minZ ||
            avatar.position.z > bounds.maxZ;

        if (isOutOfBounds && this.respawnPoints.length > 0) {
            // Respawn at first respawn point
            this.teleportAvatar(avatar, this.respawnPoints[0].position);
            return true;
        }

        return false;
    }

    // Update anchor animations
    update(deltaTime) {
        for (const anchor of this.anchors) {
            if (anchor.mesh) {
                anchor.mesh.userData.pulseTime += deltaTime;
                const pulse = Math.sin(anchor.mesh.userData.pulseTime * 2) * 0.1 + 1;
                anchor.mesh.scale.setScalar(pulse);
                // MeshBasicMaterial doesn't support emissiveIntensity, so check if it exists
                if (anchor.mesh.material && 'emissiveIntensity' in anchor.mesh.material) {
                    anchor.mesh.material.emissiveIntensity =
                        0.5 + Math.sin(anchor.mesh.userData.pulseTime * 3) * 0.3;
                }
            }
        }
    }
}
