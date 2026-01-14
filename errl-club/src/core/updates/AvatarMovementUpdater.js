/**
 * AvatarMovementUpdater - Handles avatar movement, physics, and collision updates
 *
 * Extracted from main.js's animate() function for better organization.
 */

import * as THREE from 'three';
import {
    AVATAR_RADIUS,
    STAGE_SIZE,
    STAGE_HEIGHT,
    MOVEMENT_CONFIG,
} from '../../config/constants.js';

/**
 * Update avatar movement based on input
 * @param {Object} params - Parameters
 * @param {Object} params.keys - Input keys state
 * @param {Object} params.avatar - Avatar instance
 * @param {Object} params.physicsSystem - Physics system
 * @param {Object} params.collisionSystem - Collision system
 * @param {Object} params.particleSystem - Particle system
 * @param {number} params.deltaTime - Frame delta time
 * @param {number} params.elapsedTime - Total elapsed time
 * @param {THREE.Scene} params.scene - Three.js scene
 */
export function updateAvatarMovement({
    keys,
    avatar,
    physicsSystem,
    collisionSystem,
    particleSystem,
    deltaTime,
    elapsedTime,
    scene,
}) {
    if (!avatar || !keys) {
        if (!avatar) {
            console.warn('AvatarMovementUpdater: avatar is null or undefined');
        }
        if (!keys) {
            console.warn('AvatarMovementUpdater: keys is null or undefined');
        }
        return;
    }

    // Step 151-153: Refined WASD movement with acceleration/deceleration
    // Movement is in world space: W=forward (negative Z toward stage), S=backward, A=left (negative X), D=right (positive X)
    const inputDirection = new THREE.Vector3(0, 0, 0);
    if (keys.w) {
        inputDirection.z -= 1; // Forward (toward stage, negative Z)
    }
    if (keys.s) {
        inputDirection.z += 1; // Backward (away from stage, positive Z)
    }
    if (keys.a) {
        inputDirection.x -= 1; // Left (negative X)
    }
    if (keys.d && !keys.shift) {
        inputDirection.x += 1; // Right (positive X, Don't move if Shift+D for dance)
    }

    // Step 130: Set running state
    avatar.setRunning(keys.shift && inputDirection.length() > 0);

    // Step 131: Set crouching state
    avatar.setCrouching(keys.ctrl);

    // Step 151: Use acceleration and deceleration instead of direct velocity setting
    const maxSpeed = avatar.isRunning ? avatar.runSpeed : avatar.speed;

    // Normalize input direction
    if (inputDirection.length() > 0) {
        inputDirection.normalize();

        // Calculate target velocity
        const targetVelocity = new THREE.Vector3(
            inputDirection.x * maxSpeed,
            0,
            inputDirection.z * maxSpeed
        );

        // Apply acceleration towards target velocity
        const velocityDiff = new THREE.Vector3().subVectors(targetVelocity, avatar.velocity);
        if (velocityDiff.length() > 0.01) {
            const accelVector = velocityDiff
                .normalize()
                .multiplyScalar(MOVEMENT_CONFIG.acceleration * deltaTime);
            avatar.velocity.add(accelVector);
        }

        // Clamp velocity to max speed
        if (avatar.velocity.length() > maxSpeed) {
            avatar.velocity.normalize().multiplyScalar(maxSpeed);
        }

        // Update avatar state
        if (avatar.isRunning) {
            avatar.setState('run');
        } else {
            avatar.setState('walk');
        }
    } else {
        // Step 151: Apply deceleration when no input
        const currentSpeed = avatar.velocity.length();
        if (currentSpeed > 0.01) {
            const decelAmount = MOVEMENT_CONFIG.deceleration * deltaTime;
            if (decelAmount >= currentSpeed) {
                avatar.velocity.set(0, 0, 0);
            } else {
                avatar.velocity.normalize().multiplyScalar(currentSpeed - decelAmount);
            }
        } else {
            avatar.velocity.set(0, 0, 0);
        }
        avatar.setState('idle');
    }

    // Handle hop
    if (keys.space) {
        avatar.hop();
    }

    // Step 171: Check collisions with pushable physics objects
    if (physicsSystem) {
        physicsSystem.checkPushableCollisions(avatar.position, AVATAR_RADIUS, avatar.velocity);
    }

    // Handle spawning: apply gravity to drop avatar down immediately
    // This ensures avatar drops as soon as game starts
    if (avatar.isSpawning) {
        // Apply gravity immediately - use consistent gravity from config
        const gravity = MOVEMENT_CONFIG.gravity || 20.0;
        avatar.velocity.y -= gravity * deltaTime;

        // Clamp falling speed to prevent excessive velocity
        const maxFallSpeed = MOVEMENT_CONFIG.maxFallSpeed || 50.0;
        avatar.velocity.y = Math.max(avatar.velocity.y, -maxFallSpeed);

        // Stop spawning when avatar reaches ground or is close enough
        const groundY = avatar.baseY || AVATAR_RADIUS;
        if (avatar.position.y <= groundY + 0.1) {
            avatar.position.y = groundY;
            avatar.velocity.y = 0;
            avatar.isSpawning = false;
        }
    }

    // Step 157-159: Use collision system for proper collision detection
    if (collisionSystem) {
        const collisionResult = collisionSystem.checkAvatarCollision(
            avatar.position,
            AVATAR_RADIUS,
            avatar.velocity.clone().multiplyScalar(deltaTime)
        );

        // Apply collision-corrected position and velocity
        avatar.position.copy(collisionResult.position);
        if (collisionResult.velocity.length() < avatar.velocity.length()) {
            // Velocity was reduced due to collision
            avatar.velocity.copy(collisionResult.velocity);
        }

        // Step 160: Resolve stuck positions
        avatar.position = collisionSystem.resolveStuckPosition(avatar.position, AVATAR_RADIUS);

        // Ensure avatar doesn't go below ground when spawning
        // Also check if avatar has landed (velocity near zero and on floor)
        const groundY = avatar.baseY || AVATAR_RADIUS;
        if (avatar.isSpawning) {
            if (avatar.position.y < groundY) {
                avatar.position.y = groundY;
                avatar.velocity.y = 0;
                avatar.isSpawning = false;
            } else if (collisionResult.onFloor && Math.abs(avatar.velocity.y) < 0.1) {
                // Avatar has landed - stop spawning
                avatar.isSpawning = false;
                avatar.velocity.y = 0;
            }
        } else if (!avatar.isHopping && !collisionResult.onFloor && avatar.velocity.y < 0) {
            // Apply gravity if avatar is in air (not spawning, not hopping, falling)
            avatar.velocity.y -= (MOVEMENT_CONFIG.gravity || 20.0) * deltaTime;
            const maxFallSpeed = MOVEMENT_CONFIG.maxFallSpeed || 50.0;
            avatar.velocity.y = Math.max(avatar.velocity.y, -maxFallSpeed);
        } else if (collisionResult.onFloor && avatar.velocity.y < 0) {
            // Stop falling if on floor
            avatar.velocity.y = 0;
        }
    }

    // Step 173: Ensure avatar doesn't fall off stage (clamp to stage area)
    const stageBounds = {
        minX: -STAGE_SIZE / 2,
        maxX: STAGE_SIZE / 2,
        minZ: -STAGE_SIZE,
        maxZ: 0,
    };
    if (avatar.position.z < stageBounds.minZ && avatar.position.z > stageBounds.maxZ) {
        // On stage area - could add special handling here
    }

    // Update avatar base Y position (floor level)
    avatar.baseY = AVATAR_RADIUS;

    // Step 178: Create dust particles when walking/running
    if (particleSystem) {
        const avatarSpeed = avatar.velocity.length();
        if (avatarSpeed > 0.05 && !avatar.isHopping) {
            // Create dust particles periodically
            if (Math.random() < 0.3) {
                // 30% chance per frame
                const dustPos = avatar.position.clone();
                dustPos.y = avatar.baseY;
                particleSystem.createDustParticle(dustPos, 0x888888);
            }
        }

        // Track previous position for landing detection
        if (!avatar._lastPosition) {
            avatar._lastPosition = avatar.position.clone();
        }
        const wasHopping = avatar._lastIsHopping || false;
        avatar._lastIsHopping = avatar.isHopping;

        // Step 179: Create landing particles when avatar lands
        if (wasHopping && !avatar.isHopping && avatar.position.y <= avatar.baseY + 0.1) {
            const landingPos = avatar.position.clone();
            landingPos.y = avatar.baseY;
            particleSystem.createLandingParticles(landingPos, 8);
        }
        avatar._lastPosition = avatar.position.clone();

        // Step 180: Create dash streak when dashing
        if (avatar.dashEffectTime > 0.25) {
            // At start of dash
            const dashDir = avatar.velocity.clone().normalize();
            particleSystem.createDashStreak(avatar.position.clone(), dashDir, 0x00ffff);
        }
    }

    // Update avatar
    avatar.update(deltaTime, elapsedTime, scene);
}

/**
 * Update avatar footsteps and stage interactions
 * @param {Object} params - Parameters
 * @param {Object} params.footstepSystem - Footstep system
 * @param {Object} params.avatar - Avatar instance
 * @param {Object} params.particleSystem - Particle system
 * @param {THREE.Camera} params.camera - Camera instance
 * @param {number} params.deltaTime - Frame delta time
 */
export function updateAvatarFootsteps({
    footstepSystem,
    avatar,
    particleSystem,
    camera,
    deltaTime,
}) {
    if (!footstepSystem || !avatar) {
        return;
    }

    // Step 174: Update distance from center for volume control
    footstepSystem.updateDistanceFromCenter(camera.position, new THREE.Vector3(0, 0, 0));

    // Determine surface type based on avatar position
    let surfaceType = 'floor';
    const isOnStage =
        avatar.position.z < -STAGE_SIZE / 2 + 1 && avatar.position.z > -STAGE_SIZE / 2 - 1;
    if (isOnStage) {
        surfaceType = 'stage'; // On stage
    }
    footstepSystem.update(deltaTime, avatar, surfaceType);

    // Codex Enhancement: Interactive floor panels - spawn sparkles on stage footfalls
    if (particleSystem && isOnStage && avatar.velocity.length() > 0.1) {
        // Check if avatar moved significantly (footfall detection)
        if (avatar._lastPosition && avatar.position.distanceTo(avatar._lastPosition) > 0.3) {
            const footfallPos = avatar.position.clone();
            footfallPos.y = STAGE_HEIGHT + 0.01; // Just above stage
            // Spawn sparkle particles at footfall position
            if (Math.random() < 0.3) {
                // 30% chance per frame when moving
                particleSystem.createSparkleParticle(footfallPos, 0x00ffff);
            }
        }
    }
}
