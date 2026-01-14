/**
 * AvatarInitializer - Handles avatar creation and setup
 */
import * as THREE from 'three';
import { ErrlAvatar } from '../../avatar/ErrlAvatar.js';
import { AVATAR_RADIUS, ROOM_SIZE } from '../../config/constants.js';

export class AvatarInitializer {
    /**
     * Initialize avatar
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Vector3} spawnPosition - Optional spawn position (defaults to center of room)
     * @returns {ErrlAvatar} The initialized avatar
     */
    static initialize(scene, spawnPosition = null) {
        // Use provided spawn position, or default to center of room
        let avatarInitialPosition;
        if (spawnPosition) {
            // Spawn at the provided position (e.g., inside TV)
            avatarInitialPosition = spawnPosition.clone();
            // Add a small offset upward to ensure avatar appears "inside" the TV
            avatarInitialPosition.y += 0.2;
        } else {
            // Default: Spawn in center of room, slightly above ground (will drop down)
            const spawnHeight = 3.0; // Start 3 units above ground
            avatarInitialPosition = new THREE.Vector3(0, spawnHeight, 0); // Center of room
        }

        const groundLevel = 0.5; // Ground level (AVATAR_RADIUS)
        const avatar = new ErrlAvatar(scene, avatarInitialPosition);

        // Set baseY to ground level
        avatar.baseY = groundLevel;

        // Mark avatar as not yet landed (will drop down)
        avatar.isSpawning = true;
        avatar.hasLanded = false;
        avatar.spawnDropSpeed = 0; // Initial drop velocity

        // Randomize color variant on first load
        avatar.randomizeColorVariant();

        return avatar;
    }
}
