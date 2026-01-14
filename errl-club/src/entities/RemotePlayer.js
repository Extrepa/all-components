/**
 * RemotePlayer - Represents a remote player avatar for multiplayer
 *
 * Handles interpolation, state updates, and visual representation of other players
 */
import * as THREE from 'three';
import { PlayerState } from './PlayerState.js';
import { AVATAR_COLOR_VARIANTS } from '../config/AvatarColorVariants.js';

export class RemotePlayer {
    /**
     * Create a new RemotePlayer
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {string} playerId - Unique player identifier
     * @param {PlayerState} initialState - Initial player state
     */
    constructor(scene, playerId, initialState = null) {
        this.scene = scene;
        this.playerId = playerId;

        // State management
        this.currentState = initialState
            ? new PlayerState(initialState.toJSON())
            : new PlayerState();
        this.targetState = null; // State we're interpolating towards
        this.lastStateUpdate = Date.now();

        // Interpolation settings
        this.interpolationDelay = 100; // ms delay for interpolation
        this.interpolationSpeed = 0.15; // Lerp speed
        this.positionBuffer = []; // Buffer for position interpolation
        this.rotationBuffer = []; // Buffer for rotation interpolation

        // Visual representation
        this.group = new THREE.Group();
        this.mesh = null;
        this.faceSprite = null;
        this.shadow = null;
        this.glowMesh = null;

        // Create visual representation
        this.createVisuals();

        // Add to scene
        scene.add(this.group);
    }

    /**
     * Create simplified visual representation
     * (Simpler than local avatar for performance)
     */
    createVisuals() {
        // Get color variant (default to classic_purple if not set)
        const variant =
            AVATAR_COLOR_VARIANTS[this.currentState.colorVariant] ||
            AVATAR_COLOR_VARIANTS['classic_purple'];

        // Main mesh (simplified sphere)
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        geometry.scale(1, 1.1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: variant.color,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.group.add(this.mesh);

        // Simple face sprite
        const faceGeometry = new THREE.PlaneGeometry(0.6, 0.6);
        const faceMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.faceSprite = new THREE.Mesh(faceGeometry, faceMaterial);
        this.faceSprite.scale.set(0.8, 0.8, 1);
        this.faceSprite.position.set(0, 0.2, 0.6);
        this.group.add(this.faceSprite);

        // Shadow
        const shadowGeometry = new THREE.CircleGeometry(0.4, 16);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
        });
        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = -0.51;
        this.group.add(this.shadow);

        // Glow effect - uses variant color
        const glowGeometry = new THREE.SphereGeometry(0.55, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: variant.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(this.glowMesh);

        // Set initial position
        this.group.position.copy(this.currentState.position);
        this.group.quaternion.copy(this.currentState.rotation);
    }

    /**
     * Update remote player state (called when receiving network updates)
     * @param {PlayerState} newState - New player state from network
     */
    updateState(newState) {
        if (!newState || !(newState instanceof PlayerState)) {
            console.warn('RemotePlayer.updateState: Invalid state provided');
            return;
        }

        // Validate state
        if (!newState.isValid()) {
            console.warn('RemotePlayer.updateState: Invalid state data');
            return;
        }

        // Store previous state for interpolation
        const previousState = this.currentState.clone();

        // Update current state
        this.currentState = newState.clone();
        this.currentState.playerId = this.playerId;

        // Add to interpolation buffer
        const now = Date.now();
        this.positionBuffer.push({
            position: newState.position.clone(),
            timestamp: now,
        });
        this.rotationBuffer.push({
            rotation: newState.rotation.clone(),
            timestamp: now,
        });

        // Keep buffer size manageable (last 5 updates)
        if (this.positionBuffer.length > 5) {
            this.positionBuffer.shift();
        }
        if (this.rotationBuffer.length > 5) {
            this.rotationBuffer.shift();
        }

        // Update visual appearance based on state
        this.updateVisuals();

        this.lastStateUpdate = now;
    }

    /**
     * Update visual representation based on current state
     */
    updateVisuals() {
        if (!this.mesh) {
            return;
        }

        // Update color based on variant - now supports all 25 variants
        const variant =
            AVATAR_COLOR_VARIANTS[this.currentState.colorVariant] ||
            AVATAR_COLOR_VARIANTS['classic_purple'];

        if (this.mesh.material) {
            this.mesh.material.color.setHex(variant.color);
            this.mesh.material.emissive.setHex(variant.color);
            this.mesh.material.emissiveIntensity = variant.glow;
        }
        if (this.glowMesh && this.glowMesh.material) {
            this.glowMesh.material.color.setHex(variant.color);
            this.glowMesh.material.emissive.setHex(variant.color);
        }

        // Update scale based on state
        if (this.currentState.state === 'run') {
            this.mesh.scale.set(1, 1.1, 0.9);
        } else if (this.currentState.state === 'sit') {
            this.mesh.scale.set(1, 0.8, 1.1);
        } else {
            this.mesh.scale.set(1, 1.1, 1);
        }
    }

    /**
     * Update interpolation (called every frame)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.positionBuffer.length || !this.rotationBuffer.length) {
            return;
        }

        const now = Date.now();
        const targetTime = now - this.interpolationDelay;

        // Find target position in buffer
        let targetPos = null;
        let prevPos = null;

        for (let i = this.positionBuffer.length - 1; i >= 0; i--) {
            const entry = this.positionBuffer[i];
            if (entry.timestamp <= targetTime) {
                targetPos = entry.position;
                if (i > 0) {
                    prevPos = this.positionBuffer[i - 1].position;
                }
                break;
            }
        }

        // If no target found, use most recent
        if (!targetPos && this.positionBuffer.length > 0) {
            targetPos = this.positionBuffer[this.positionBuffer.length - 1].position;
        }

        // Interpolate position
        if (targetPos) {
            if (prevPos) {
                // Interpolate between previous and target
                const t = Math.min(
                    1,
                    (targetTime - this.positionBuffer[this.positionBuffer.length - 2].timestamp) /
                        (this.positionBuffer[this.positionBuffer.length - 1].timestamp -
                            this.positionBuffer[this.positionBuffer.length - 2].timestamp)
                );
                this.group.position.lerpVectors(prevPos, targetPos, t);
            } else {
                // Simple lerp towards target
                this.group.position.lerp(targetPos, this.interpolationSpeed);
            }
        }

        // Find target rotation in buffer
        let targetRot = null;
        let prevRot = null;

        for (let i = this.rotationBuffer.length - 1; i >= 0; i--) {
            const entry = this.rotationBuffer[i];
            if (entry.timestamp <= targetTime) {
                targetRot = entry.rotation;
                if (i > 0) {
                    prevRot = this.rotationBuffer[i - 1].rotation;
                }
                break;
            }
        }

        // If no target found, use most recent
        if (!targetRot && this.rotationBuffer.length > 0) {
            targetRot = this.rotationBuffer[this.rotationBuffer.length - 1].rotation;
        }

        // Interpolate rotation (slerp)
        if (targetRot) {
            if (prevRot) {
                // Interpolate between previous and target
                const t = Math.min(
                    1,
                    (targetTime - this.rotationBuffer[this.rotationBuffer.length - 2].timestamp) /
                        (this.rotationBuffer[this.rotationBuffer.length - 1].timestamp -
                            this.rotationBuffer[this.rotationBuffer.length - 2].timestamp)
                );
                const tempQuat = new THREE.Quaternion().slerpQuaternions(prevRot, targetRot, t);
                this.group.quaternion.slerp(tempQuat, this.interpolationSpeed);
            } else {
                // Simple slerp towards target
                this.group.quaternion.slerp(targetRot, this.interpolationSpeed);
            }
        }

        // Update shadow position
        if (this.shadow) {
            this.shadow.position.y = -0.51;
        }
    }

    /**
     * Get current state
     * @returns {PlayerState} Current player state
     */
    getState() {
        return this.currentState.clone();
    }

    /**
     * Check if player is still active (has received updates recently)
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {boolean} True if player is active
     */
    isActive(timeout = 5000) {
        return Date.now() - this.lastStateUpdate < timeout;
    }

    /**
     * Dispose of remote player (cleanup)
     */
    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
        }

        // Dispose of geometries and materials
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
        }
        if (this.faceSprite) {
            if (this.faceSprite.geometry) {
                this.faceSprite.geometry.dispose();
            }
            if (this.faceSprite.material) {
                this.faceSprite.material.dispose();
            }
        }
        if (this.shadow) {
            if (this.shadow.geometry) {
                this.shadow.geometry.dispose();
            }
            if (this.shadow.material) {
                this.shadow.material.dispose();
            }
        }
        if (this.glowMesh) {
            if (this.glowMesh.geometry) {
                this.glowMesh.geometry.dispose();
            }
            if (this.glowMesh.material) {
                this.glowMesh.material.dispose();
            }
        }
    }
}
