/**
 * UpdateManager - Coordinates updates of all game systems
 */
import * as THREE from 'three';
import {
    ROOM_SIZE,
    STAGE_SIZE,
    STAGE_HEIGHT,
    AVATAR_RADIUS,
    MOVEMENT_CONFIG,
} from '../config/constants.js';
import { updateAllSystems } from './updates/SystemsUpdater.js';
import { updateAvatarMovement } from './updates/AvatarMovementUpdater.js';
import { LoopManager } from './LoopManager.js';

export class UpdateManager {
    constructor(options = {}) {
        // Systems will be passed in via update() method
        this.useSystemsUpdater = options.useSystemsUpdater !== false; // Default to true
        this.useLoopManager = options.useLoopManager !== false; // Default to true

        // Initialize LoopManager if enabled
        if (this.useLoopManager) {
            this.loopManager = null; // Will be initialized when systems are available
        }
    }

    /**
     * Initialize LoopManager with buckets
     * @param {Object} systems - Game systems (for EventBus/StateManager)
     * @returns {LoopManager} The initialized LoopManager
     */
    initializeLoopManager(systems) {
        if (!this.useLoopManager) {
            return null;
        }

        if (this.loopManager) {
            return this.loopManager; // Already initialized
        }

        const eventBus = systems?.eventBus || null;
        const stateManager = systems?.stateManager || null;

        this.loopManager = new LoopManager(eventBus, stateManager);

        // Create default buckets with appropriate priorities and frequencies
        // Lower priority = runs earlier

        // Input and movement (highest priority - runs first)
        this.loopManager.addBucket('input', {
            frequency: 1.0, // Every frame
            priority: 10,
        });

        // Physics and collision (runs after input)
        this.loopManager.addBucket('physics', {
            frequency: 1.0, // Every frame
            priority: 20,
        });

        // Avatar visuals and state (runs after physics)
        this.loopManager.addBucket('avatar', {
            frequency: 1.0, // Every frame
            priority: 30,
        });

        // Audio (runs at 60fps)
        this.loopManager.addBucket('audio', {
            frequency: 1.0, // Every frame
            priority: 40,
        });

        // Particles (runs at 60fps)
        this.loopManager.addBucket('particles', {
            frequency: 1.0, // Every frame
            priority: 50,
        });

        // Visual effects (runs at 60fps)
        this.loopManager.addBucket('visualEffects', {
            frequency: 1.0, // Every frame
            priority: 60,
        });

        // Audio-reactive effects (runs at 60fps)
        this.loopManager.addBucket('audioReactive', {
            frequency: 1.0, // Every frame
            priority: 70,
        });

        // Environment animations (runs at 60fps)
        this.loopManager.addBucket('environment', {
            frequency: 1.0, // Every frame
            priority: 80,
        });

        // UI updates (runs at 60fps)
        this.loopManager.addBucket('ui', {
            frequency: 1.0, // Every frame
            priority: 90,
        });

        // Performance metrics (runs at 10fps - every 6 frames)
        this.loopManager.addBucket('performance', {
            frequency: 0.166, // ~10fps (every 6 frames)
            priority: 100,
        });

        // LOD/optimization (runs at 30fps - every 2 frames)
        this.loopManager.addBucket('lod', {
            frequency: 0.5, // 30fps (every 2 frames)
            priority: 110,
        });

        // Register avatar movement callback
        this.loopManager.addCallback(
            'input',
            (deltaTime, elapsedTime, systems) => {
                // Debug: Log if callback is called but systems are missing
                if (!systems.keys) {
                    console.warn('UpdateManager: Movement callback - systems.keys is missing');
                }
                if (!systems.avatar) {
                    console.warn('UpdateManager: Movement callback - systems.avatar is missing');
                }
                if (!systems.physicsSystem) {
                    console.warn('UpdateManager: Movement callback - systems.physicsSystem is missing');
                }
                if (!systems.collisionSystem) {
                    console.warn('UpdateManager: Movement callback - systems.collisionSystem is missing');
                }
                if (!systems.particleSystem) {
                    console.warn('UpdateManager: Movement callback - systems.particleSystem is missing');
                }
                
                if (
                    systems.keys &&
                    systems.avatar &&
                    systems.physicsSystem &&
                    systems.collisionSystem &&
                    systems.particleSystem
                ) {
                    updateAvatarMovement({
                        keys: systems.keys,
                        avatar: systems.avatar,
                        physicsSystem: systems.physicsSystem,
                        collisionSystem: systems.collisionSystem,
                        particleSystem: systems.particleSystem,
                        deltaTime,
                        elapsedTime,
                        scene: systems.scene,
                    });
                }
            },
            { priority: 10 }
        );

        // Main SystemsUpdater call - runs all system updates after avatar movement
        // This handles physics, avatar visuals, audio, particles, visual effects, etc.
        this.loopManager.addCallback(
            'avatar',
            (deltaTime, elapsedTime, systems) => {
                if (typeof updateAllSystems === 'function') {
                    updateAllSystems({
                        deltaTime,
                        elapsedTime,
                        clock: systems.clock,
                        systems,
                    });
                }
            },
            { priority: 100 }
        ); // Run after avatar movement

        // Register AudioReactiveLoop and EnvironmentLoop if they exist
        // These will be created in GameInitializer and passed here
        if (systems.audioReactiveLoop && typeof systems.audioReactiveLoop.register === 'function') {
            systems.audioReactiveLoop.register(this.loopManager);
        }
        if (systems.environmentLoop && typeof systems.environmentLoop.register === 'function') {
            systems.environmentLoop.register(this.loopManager);
        }

        return this.loopManager;
    }

    /**
     * Get LoopManager instance (creates it if needed)
     * @param {Object} systems - Game systems (for EventBus/StateManager)
     * @returns {LoopManager|null} The LoopManager instance or null if disabled
     */
    getLoopManager(systems) {
        if (!this.useLoopManager) {
            return null;
        }

        if (!this.loopManager && systems) {
            this.initializeLoopManager(systems);
        }

        return this.loopManager;
    }

    /**
     * Main update method - coordinates all system updates
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {object} timeInfo - Time information (clock, timeScale)
     * @param {object} systems - All game systems and dependencies
     */
    update(deltaTime, elapsedTime, timeInfo, systems) {
        const { clock, timeScale } = timeInfo || {};

        // Initialize LoopManager on first update if enabled
        if (this.useLoopManager && !this.loopManager && systems) {
            this.initializeLoopManager(systems);
        }

        // If using LoopManager, delegate to it
        if (this.useLoopManager && this.loopManager) {
            // Add clock to systems for callbacks that need it
            const systemsWithClock = { ...systems, clock };
            
            // Debug: Log systems availability on first update
            if (!this._systemsLogged) {
                console.log('UpdateManager: Systems available for update', {
                    hasKeys: !!systems.keys,
                    hasAvatar: !!systems.avatar,
                    hasPhysicsSystem: !!systems.physicsSystem,
                    hasCollisionSystem: !!systems.collisionSystem,
                    hasParticleSystem: !!systems.particleSystem,
                    hasScene: !!systems.scene,
                    hasClock: !!clock,
                    loopManagerInitialized: !!this.loopManager,
                });
                this._systemsLogged = true;
            }
            
            this.loopManager.run(deltaTime, elapsedTime, systemsWithClock);
            return;
        }

        // If using SystemsUpdater, delegate to it (bridge approach for migration)
        if (this.useSystemsUpdater && systems && typeof updateAllSystems === 'function') {
            // Update avatar movement first (handles input, called before other systems)
            if (
                systems.keys &&
                systems.avatar &&
                systems.physicsSystem &&
                systems.collisionSystem &&
                systems.particleSystem
            ) {
                updateAvatarMovement({
                    keys: systems.keys,
                    avatar: systems.avatar,
                    physicsSystem: systems.physicsSystem,
                    collisionSystem: systems.collisionSystem,
                    particleSystem: systems.particleSystem,
                    deltaTime,
                    elapsedTime,
                    scene: systems.scene,
                });
            }

            // Then update all other systems
            updateAllSystems({
                deltaTime,
                elapsedTime,
                clock,
                systems,
            });
            return;
        }

        // Otherwise use the original UpdateManager logic

        // Update avatar movement and physics
        this.updateAvatar(systems.inputManager, systems.avatar, deltaTime, systems);

        // Update physics and collisions
        this.updatePhysics(systems.avatar, deltaTime, systems);

        // Update avatar visual state
        this.updateAvatarVisuals(systems.avatar, deltaTime, elapsedTime, systems);

        // Update state manager with avatar state
        this.updateStateManager(systems);

        // Update audio and footsteps
        // NOTE: Now handled by AudioSystem when LoopManager is enabled
        if (!this.useLoopManager) {
            this.updateAudio(systems.audioSystem, clock, deltaTime, systems);
        }

        // Update particle system
        // NOTE: Now handled by ParticleSystem when LoopManager is enabled
        if (!this.useLoopManager) {
            this.updateParticles(systems.particleSystem, deltaTime, systems);
        }

        // Update replay and teleport systems
        this.updateReplayTeleport(systems.avatar, deltaTime, elapsedTime, systems);

        // Update collectibles
        // NOTE: Now handled by CollectibleManager when LoopManager is enabled
        if (!this.useLoopManager) {
            this.updateCollectibles(systems.avatar, deltaTime, elapsedTime, systems);
        }

        // Update collection streak system
        if (systems.collectionStreakSystem) {
            systems.collectionStreakSystem.update(deltaTime);
        }

        // Update multiplayer syncing
        this.updateMultiplayer(deltaTime, systems);

        // Update world state reactor
        this.updateWorldState(systems.avatar, deltaTime, elapsedTime, systems);

        // Update interactive objects
        this.updateInteractiveObjects(systems.avatar, deltaTime, elapsedTime, systems);

        // Update camera
        this.updateCamera(systems.avatar, deltaTime, elapsedTime, systems);

        // Update visual recorder
        this.updateVisualRecorder(systems);

        // Update post-processing
        this.updatePostProcessing(elapsedTime, systems);

        // Update visual effects
        this.updateVisualEffects(systems, elapsedTime);

        // Update audio-reactive visual effects
        // NOTE: Now handled by AudioReactiveLoop when LoopManager is enabled
        if (!this.useLoopManager) {
            this.updateAudioReactive(deltaTime, elapsedTime, systems);
        }

        // Update environment animations
        // NOTE: Now handled by EnvironmentLoop when LoopManager is enabled
        if (!this.useLoopManager) {
            this.updateEnvironment(deltaTime, elapsedTime, systems);
        }

        // Update interaction system
        // NOTE: Now handled by InteractionSystem when LoopManager is enabled
        if (!this.useLoopManager && systems.camera && systems.avatar) {
            this.updateInteraction(systems.camera, systems.avatar, systems);
        }

        // Update TV transition system
        if (systems.tvTransitionSystem && systems.tvTransitionSystem.isInProgress()) {
            systems.tvTransitionSystem.update(deltaTime);
        }
    }

    /**
     * Update avatar movement and physics
     */
    updateAvatar(inputManager, avatar, deltaTime, systems) {
        if (!inputManager || !avatar) {
            return;
        }

        // Ensure avatar.velocity exists
        if (!avatar.velocity) {
            avatar.velocity = new THREE.Vector3(0, 0, 0);
        }

        // Check if movement is disabled (e.g., during ready prompt)
        const movementDisabled = systems.stateManager?.getState('game.movementDisabled') || false;
        if (movementDisabled) {
            // Force stop all movement and rotation
            avatar.velocity.set(0, 0, 0);
            avatar.setState('idle');
            return;
        }

        // Check if avatar movement is enabled (via avatar method)
        if (avatar.isMovementEnabled && !avatar.isMovementEnabled()) {
            // Movement disabled at avatar level - stop everything
            avatar.velocity.set(0, 0, 0);
            avatar.setState('idle');
            return;
        }

        const keys = inputManager.keys;

        // Safety check: ensure keys object exists and has boolean values
        if (!keys || typeof keys !== 'object') {
            return;
        }

        // Debug logging (can be toggled)
        if (window.DEBUG_MOVEMENT) {
            console.log('Input keys:', {
                w: keys.w,
                a: keys.a,
                s: keys.s,
                d: keys.d,
                shift: keys.shift,
            });
        }

        // Rotation: A/D rotate the character in place (left/right)
        // Avatar group starts rotated 180 degrees (facing stage), so rotation is relative to that
        // Only rotate if movement is enabled and keys are actually pressed
        // rotationSpeed is configurable via DevMenu (stored in UpdateManager)
        const rotationSpeed = this.rotationSpeed || 3.0; // radians per second
        let rotationChanged = false;
        if (keys.a === true && typeof keys.a === 'boolean') {
            avatar.group.rotation.y += rotationSpeed * deltaTime;
            rotationChanged = true;
        }
        if (keys.d === true && typeof keys.d === 'boolean' && !keys.shift) {
            // Don't rotate if Shift+D for dance
            avatar.group.rotation.y -= rotationSpeed * deltaTime;
            rotationChanged = true;
        }

        // Update forward direction whenever rotation changes
        if (rotationChanged) {
            avatar.updateForwardDirection();
        }

        // Check if we're in a floating/zero-gravity room
        const isFloatingRoom =
            systems.stateManager?.getState('room.zeroGravity') || avatar.zeroGravity || false;

        // Movement: W/S move forward/backward relative to where avatar is facing
        // In floating mode, Space/Shift control up/down
        const inputDirection = new THREE.Vector3(0, 0, 0);
        if (keys.w === true) {
            inputDirection.z += 1; // W moves forward (positive Z = forward/up)
        }
        if (keys.s === true) {
            inputDirection.z -= 1; // S moves backward (negative Z = backward/down)
        }

        // Apply rotation to input direction to make movement relative to avatar's facing direction
        // Use avatar's forward direction for consistency
        if (inputDirection.length() > 0) {
            inputDirection.normalize();
            // Get forward direction from avatar (ensures consistency)
            const forwardDir = avatar.getForwardDirection();
            const rightDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x); // Perpendicular to forward

            // Calculate movement direction: forward * z + right * x
            // For W/S (z input), use forward direction
            // For A/D rotation is handled separately, so we only need forward/backward
            const movementDir = new THREE.Vector3();
            movementDir.addScaledVector(forwardDir, inputDirection.z);
            // Note: A/D keys rotate the avatar, not strafe, so we don't add rightDir here

            inputDirection.copy(movementDir);
            inputDirection.normalize();
        }

        // Set running state (only if moving forward/backward, and not in floating mode)
        if (!isFloatingRoom) {
            avatar.setRunning(keys.shift && inputDirection.length() > 0);
        } else {
            avatar.setRunning(false); // No running in zero-gravity
        }

        // Set crouching state (disabled in floating mode)
        if (!isFloatingRoom) {
            avatar.setCrouching(keys.ctrl);
        } else {
            avatar.setCrouching(false);
        }

        // Set zero-gravity mode on avatar
        avatar.zeroGravity = isFloatingRoom;

        // Use acceleration and deceleration with improved curves for better feel
        const maxSpeed = avatar.isRunning ? avatar.runSpeed : avatar.speed;

        // Apply crouch speed modifier if crouching
        const effectiveMaxSpeed = avatar.isCrouching
            ? maxSpeed * (avatar.crouchSpeedModifier || 0.5)
            : maxSpeed;

        // In floating mode, add vertical movement (Space = up, Shift = down, but Shift is also run)
        let verticalInput = 0;
        if (isFloatingRoom) {
            if (keys.space === true) {
                verticalInput = 1; // Space = float up
            }
            // Use Ctrl for down in floating mode (since Shift is run)
            if (keys.ctrl === true && !avatar.isCrouching) {
                verticalInput = -1; // Ctrl = float down
            }
        }

        // Normalize input direction
        if (inputDirection.length() > 0 || verticalInput !== 0) {
            // Calculate target velocity based on rotated direction
            const targetVelocity = new THREE.Vector3(
                inputDirection.x * effectiveMaxSpeed,
                verticalInput * effectiveMaxSpeed, // Vertical movement in floating mode
                inputDirection.z * effectiveMaxSpeed
            );

            // Apply acceleration towards target velocity with improved curve
            const velocityDiff = new THREE.Vector3().subVectors(targetVelocity, avatar.velocity);
            const diffLength = velocityDiff.length();

            if (diffLength > 0.01) {
                // Use exponential acceleration curve for smoother feel
                // Faster acceleration when far from target, slower when close
                const accelerationFactor = Math.min(1.0, diffLength / effectiveMaxSpeed);
                const accelRate = MOVEMENT_CONFIG.acceleration * (0.3 + 0.7 * accelerationFactor); // 30-100% of base acceleration
                const accelAmount = Math.min(accelRate * deltaTime, diffLength);

                // Normalize and apply acceleration
                if (diffLength > 0.001) {
                    const accelVector = velocityDiff.normalize().multiplyScalar(accelAmount);
                    avatar.velocity.add(accelVector);
                } else {
                    // Snap to target when very close for instant response
                    avatar.velocity.copy(targetVelocity);
                }
            } else {
                // Snap directly to target velocity when very close
                avatar.velocity.copy(targetVelocity);
            }

            // Clamp velocity to max speed (safety check)
            const currentSpeed = avatar.velocity.length();
            if (currentSpeed > effectiveMaxSpeed * 1.05) {
                avatar.velocity.normalize().multiplyScalar(effectiveMaxSpeed);
            }

            // Update avatar state
            if (avatar.isRunning) {
                avatar.setState('run');
            } else {
                avatar.setState('walk');
            }
        } else {
            // Apply deceleration with improved curve for snappy stops
            if (!avatar.velocity) {
                avatar.velocity = new THREE.Vector3(0, 0, 0);
            }
            const currentSpeed = avatar.velocity.length();
            if (currentSpeed > 0.01) {
                // Use exponential deceleration - faster when moving fast, slower when almost stopped
                const decelFactor = Math.min(1.0, currentSpeed / effectiveMaxSpeed);
                const decelRate = MOVEMENT_CONFIG.deceleration * (0.5 + 0.5 * decelFactor); // 50-100% of base deceleration
                const decelAmount = decelRate * deltaTime;

                if (decelAmount >= currentSpeed) {
                    avatar.velocity.set(0, 0, 0);
                } else {
                    avatar.velocity.normalize().multiplyScalar(currentSpeed - decelAmount);
                }
            } else {
                // Force stop to prevent any residual movement
                avatar.velocity.set(0, 0, 0);
            }
            avatar.setState('idle');
        }

        // Handle hop (disabled in floating mode - Space is used for up movement)
        if (keys.space && !isFloatingRoom) {
            avatar.hop();
        }
    }

    /**
     * Update physics and collisions
     * @deprecated This method is deprecated. Physics updates are now handled by PhysicsSystem via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updatePhysics(avatar, deltaTime, systems) {
        if (!avatar || !systems.physicsSystem || !systems.collisionSystem) {
            return;
        }

        // Check collisions with pushable physics objects
        systems.physicsSystem.checkPushableCollisions(
            avatar.position,
            AVATAR_RADIUS,
            avatar.velocity
        );

        // Use collision system for proper collision detection (includes platform collision)
        // The collision system applies velocity to position and handles collisions
        const movementDelta = avatar.velocity.clone().multiplyScalar(deltaTime);
        const collisionResult = systems.collisionSystem.checkAvatarCollision(
            avatar.position,
            AVATAR_RADIUS,
            movementDelta
        );

        // Apply collision-corrected position (collision system already applied movement)
        const oldPosition = avatar.position.clone();
        avatar.position.copy(collisionResult.position);

        // Update group position to match avatar position
        avatar.group.position.copy(avatar.position);

        // Apply wall sliding: use the velocity from collision result (which has been projected)
        // The collision system receives velocity * deltaTime, so we need to convert back
        // But we also need to preserve the Y component (vertical velocity) separately
        const horizontalVelocity = new THREE.Vector3(
            collisionResult.velocity.x,
            0,
            collisionResult.velocity.z
        );

        // Convert horizontal velocity back from deltaTime-scaled to per-second
        if (deltaTime > 0) {
            horizontalVelocity.divideScalar(deltaTime);
        }

        // Preserve vertical velocity (gravity, jumping, etc.) and apply horizontal sliding
        avatar.velocity.set(horizontalVelocity.x, avatar.velocity.y, horizontalVelocity.z);

        // Handle platform collision - stop downward velocity if landing on platform
        if (collisionResult.onPlatform) {
            // Stop downward velocity when landing on platform
            if (avatar.velocity.y < 0) {
                avatar.velocity.y = 0;
            }
            // Set avatar as grounded when on platform
            // (This would be used by jump system if implemented)
        }

        // Debug logging only if explicitly enabled
        if (window.DEBUG_MOVEMENT) {
            const moved = avatar.position.distanceTo(oldPosition);
            if (moved > 0.001) {
                console.log('Position updated:', {
                    old: oldPosition,
                    new: avatar.position.clone(),
                    velocity: avatar.velocity.clone(),
                    distance: moved,
                });
            }
        }

        // Resolve stuck positions
        avatar.position = systems.collisionSystem.resolveStuckPosition(
            avatar.position,
            AVATAR_RADIUS
        );

        // Ensure avatar doesn't fall off stage (clamp to stage area)
        const stageBounds = {
            minX: -STAGE_SIZE / 2,
            maxX: STAGE_SIZE / 2,
            minZ: -STAGE_SIZE,
            maxZ: 0,
        };
        if (avatar.position.z < stageBounds.minZ && avatar.position.z > stageBounds.maxZ) {
            // On stage area - could add special handling here
        }

        // Update avatar base Y position (for stage height)
        avatar.baseY = AVATAR_RADIUS + STAGE_HEIGHT;

        // Update physics system
        systems.physicsSystem.update(deltaTime);
    }

    /**
     * Update avatar visual state
     */
    updateAvatarVisuals(avatar, deltaTime, elapsedTime, systems) {
        if (!avatar || !systems.particleSystem) {
            return;
        }

        // Create dust particles when walking/running
        const avatarSpeed = avatar.velocity.length();
        if (avatarSpeed > 0.05 && !avatar.isHopping) {
            // Create dust particles periodically
            if (Math.random() < 0.3) {
                // 30% chance per frame
                const dustPos = avatar.position.clone();
                dustPos.y = avatar.baseY;
                systems.particleSystem.createDustParticle(dustPos, 0x888888);
            }
        }

        // Track previous position for landing detection
        if (!avatar._lastPosition) {
            avatar._lastPosition = avatar.position.clone();
        }
        const wasHopping = avatar._lastIsHopping || false;
        avatar._lastIsHopping = avatar.isHopping;

        // Create landing particles when avatar lands
        if (wasHopping && !avatar.isHopping && avatar.position.y <= avatar.baseY + 0.1) {
            const landingPos = avatar.position.clone();
            landingPos.y = avatar.baseY;
            systems.particleSystem.createLandingParticles(landingPos, 8);
        }
        avatar._lastPosition = avatar.position.clone();

        // Update avatar
        avatar.update(deltaTime, elapsedTime, systems.scene);

        // Create dash streak when dashing
        if (avatar.dashEffectTime > 0.25) {
            // At start of dash
            const dashDir = avatar.velocity.clone().normalize();
            systems.particleSystem.createDashStreak(avatar.position.clone(), dashDir, 0x00ffff);
        }
    }

    /**
     * Update state manager with current game state
     */
    updateStateManager(systems) {
        if (!systems.stateManager || !systems.avatar) {
            return;
        }

        const stateManager = systems.stateManager;
        const avatar = systems.avatar;
        const eventBus = systems.eventBus;

        // Track previous state to detect changes
        const prevState = stateManager.getState('player.state');
        const prevPosition = stateManager.getState('player.position');

        // Update player state
        stateManager.setState('player.position', avatar.position.clone());
        stateManager.setState('player.rotation', avatar.group.quaternion.clone());
        stateManager.setState('player.state', avatar.currentState);
        stateManager.setState('player.expression', avatar.currentExpression);
        stateManager.setState('player.colorVariant', avatar.colorVariant);
        stateManager.setState('player.velocity', avatar.velocity.clone());
        stateManager.setState('player.timestamp', Date.now());

        // Emit events for state changes
        if (eventBus) {
            // Emit state change event
            if (prevState !== avatar.currentState) {
                eventBus.emit('player.stateChange', {
                    from: prevState,
                    to: avatar.currentState,
                    timestamp: Date.now(),
                });
            }

            // Emit movement event if position changed significantly
            if (prevPosition && avatar.position.distanceTo(prevPosition) > 0.01) {
                eventBus.emit('player.move', {
                    position: avatar.position.clone(),
                    velocity: avatar.velocity.clone(),
                    state: avatar.currentState,
                    timestamp: Date.now(),
                });
            }
        }
    }

    /**
     * Update audio and footsteps
     * @deprecated This method is deprecated. Audio updates are now handled by AudioSystem via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateAudio(audioSystem, clock, deltaTime, systems) {
        if (!audioSystem) {
            return;
        }

        // Update audio analysis
        audioSystem.update(clock);

        // Update audio preview
        if (systems.audioPlayer && audioSystem.getAnalyser()) {
            const analyser = audioSystem.getAnalyser();
            const previewData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(previewData);
            systems.audioPlayer.updatePreview(analyser, previewData);
        }

        // Update audio fade-in
        audioSystem.updateAudioFadeIn(deltaTime);

        // Apply audio-reactive effects
        audioSystem.updateReactiveLighting(systems.spotLight);
        audioSystem.updateReactiveFog(systems.scene);

        // Update footstep system
        if (systems.footstepSystem) {
            // Update distance from center for volume control
            systems.footstepSystem.updateDistanceFromCenter(
                systems.camera.position,
                new THREE.Vector3(0, 0, 0)
            );

            // Determine surface type based on avatar position
            let surfaceType = 'floor';
            if (
                systems.avatar.position.z < -STAGE_SIZE / 2 + 1 &&
                systems.avatar.position.z > -STAGE_SIZE / 2 - 1
            ) {
                surfaceType = 'stage'; // On stage
            }
            systems.footstepSystem.update(deltaTime, systems.avatar, surfaceType);
        }
    }

    /**
     * Update particle system
     * @deprecated This method is deprecated. Particle updates are now handled by ParticleSystem via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateParticles(particleSystem, deltaTime, systems) {
        if (particleSystem) {
            particleSystem.update(deltaTime, 0, systems);
        }
    }

    /**
     * Update replay and teleport systems
     */
    updateReplayTeleport(avatar, deltaTime, elapsedTime, systems) {
        // Update replay recording indicator
        if (systems.replayRecordingIndicator) {
            systems.replayRecordingIndicator.update(deltaTime);
        }
        // Record frame if recording
        if (systems.replaySystem && systems.replaySystem.isRecording) {
            systems.replaySystem.recordFrame(avatar, elapsedTime);
        }

        // Update ghost avatars
        if (systems.replaySystem) {
            systems.replaySystem.update(deltaTime, elapsedTime);
        }

        // Check if avatar needs respawn
        if (systems.teleportSystem) {
            const roomBounds = {
                minX: -ROOM_SIZE / 2,
                maxX: ROOM_SIZE / 2,
                minZ: -ROOM_SIZE / 2,
                maxZ: ROOM_SIZE / 2,
                minY: -10, // Fall below floor
            };
            systems.teleportSystem.checkRespawn(avatar, roomBounds);

            // Update teleport anchors
            systems.teleportSystem.update(deltaTime);
        }
    }

    /**
     * Update collectibles
     * @deprecated This method is deprecated. Collectible updates are now handled by CollectibleManager via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateCollectibles(avatar, deltaTime, elapsedTime, systems) {
        if (!systems.collectibleManager) {
            return;
        }

        // Screen ripple callback for bubble pops
        const screenRippleCallback = (position) => {
            // Could trigger screen ripple effect here
            if (!window.__PLAYWRIGHT_TEST__) {
                console.log('Bubble popped at:', position);
            }
        };
        // Use original method signature for backward compatibility
        systems.collectibleManager.updateCollectibles(
            deltaTime,
            avatar,
            elapsedTime,
            screenRippleCallback
        );

        // Update fragment progress bar
        const stats = systems.collectibleManager.getStats();
        const fragmentProgress = document.getElementById('fragment-progress');
        const fragmentCount = document.getElementById('fragment-count');
        if (fragmentProgress && fragmentCount) {
            if (stats.fragments > 0) {
                fragmentProgress.style.display = 'block';
                fragmentCount.textContent = stats.fragments;
                const progressFill = fragmentProgress.querySelector('.progress-fill');
                if (progressFill) {
                    // Assuming 10 fragments total for progress calculation
                    const maxFragments = 10;
                    const progress = (stats.fragments / maxFragments) * 100;
                    progressFill.style.width = progress + '%';
                }
            }
        }
    }

    /**
     * Update multiplayer manager each frame
     */
    updateMultiplayer(deltaTime, systems) {
        if (systems.multiplayerManager) {
            systems.multiplayerManager.update(deltaTime);
        }
    }

    /**
     * Update world state reactor
     */
    updateWorldState(avatar, deltaTime, elapsedTime, systems) {
        if (systems.worldStateReactor && systems.audioSystem) {
            systems.worldStateReactor.update(
                deltaTime,
                elapsedTime,
                systems.audioSystem.getBassEnergy(),
                systems.audioSystem.getOverallEnergy(),
                avatar
            );
        }
    }

    /**
     * Update interactive objects
     */
    updateInteractiveObjects(avatar, deltaTime, elapsedTime, systems) {
        // Update doors (auto-open when avatar approaches, handle room transitions)
        if (systems.doors) {
            for (const door of systems.doors) {
                door.update(deltaTime);
                if (door.checkProximity(avatar.position)) {
                    door.open();
                } else {
                    door.close();
                }

                // Register door for interaction if it has a destination room
                if (door.destinationRoom && systems.interactionSystem) {
                    // Check if already registered
                    if (!door.mesh.userData.isRegistered) {
                        systems.interactionSystem.registerInteractable(door.mesh, () => {
                            if (door.canInteract(avatar.position)) {
                                door.interact();
                            }
                        });
                        door.mesh.userData.isRegistered = true;
                    }
                }
            }
        }

        // Update teleporters
        if (systems.teleporters) {
            for (const teleporter of systems.teleporters) {
                teleporter.update(deltaTime, elapsedTime);
                if (teleporter.checkActivation(avatar.position)) {
                    const teleported = teleporter.teleport(avatar);
                    // Room identification happens in teleporter.teleport() console messages
                }
            }
        }

        // Update fog vents
        if (systems.fogVents && systems.audioSystem) {
            for (const fogVent of systems.fogVents) {
                fogVent.update(deltaTime, systems.audioSystem.getBassEnergy());
            }
        }

        // Update seatable objects
        if (systems.seatableObjects) {
            for (const seatable of systems.seatableObjects) {
                if (seatable.canUse(avatar.position)) {
                    // Show interaction hint (could add visual indicator)
                    // Avatar can press E key to sit
                }
            }
        }

        // Update moving platforms
        if (systems.movingPlatforms) {
            for (const platform of systems.movingPlatforms) {
                platform.update(deltaTime, avatar);
            }
        }

        // Update ventilation fans
        if (systems.ventilationFans && systems.audioSystem) {
            for (const fan of systems.ventilationFans) {
                fan.update(deltaTime, systems.audioSystem.getBassEnergy());

                // Check collision with avatar and nudge if close
                if (fan.checkCollision && avatar) {
                    const nudge = fan.checkCollision(avatar.position, AVATAR_RADIUS);
                    if (nudge) {
                        avatar.velocity.add(nudge);
                    }
                }
            }
        }

        // Update interactive screens
        if (systems.interactiveScreens && systems.audioSystem) {
            for (const screen of systems.interactiveScreens) {
                if (screen.update) {
                    screen.update(
                        deltaTime,
                        elapsedTime,
                        systems.audioSystem.getBassEnergy(),
                        systems.audioSystem.getOverallEnergy()
                    );
                }
            }
        }

        // Update portal rifts
        if (systems.portalRifts) {
            for (const portal of systems.portalRifts) {
                portal.update(deltaTime, elapsedTime);
            }
        }

        // Update throwable drips
        if (systems.throwableDrips) {
            const roomBounds = {
                minX: -ROOM_SIZE / 2,
                maxX: ROOM_SIZE / 2,
                minZ: -ROOM_SIZE / 2,
                maxZ: ROOM_SIZE / 2,
            };

            for (let i = systems.throwableDrips.length - 1; i >= 0; i--) {
                const drip = systems.throwableDrips[i];
                if (drip.update) {
                    drip.update(deltaTime, roomBounds);
                    drip.updateSplat(deltaTime);

                    // Remove if no longer active
                    if (!drip.isActive()) {
                        drip.remove();
                        systems.throwableDrips.splice(i, 1);
                    }
                }
            }
        }
    }

    /**
     * Update interaction system
     * @deprecated This method is deprecated. Interaction updates are now handled by InteractionSystem via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateInteraction(camera, avatar, systems) {
        if (systems.interactionSystem) {
            const prevTarget = systems.interactionSystem.getTarget();
            // Use original method signature for backward compatibility
            systems.interactionSystem.updateInteraction(camera, avatar, systems);

            // Show/hide reticle based on interaction target
            const reticle = document.getElementById('reticle');
            if (reticle) {
                if (systems.interactionSystem.hasTarget()) {
                    reticle.style.display = 'block';
                } else {
                    reticle.style.display = 'none';
                }
            }

            // Emit interaction target change event
            if (systems.eventBus) {
                const currentTarget = systems.interactionSystem.getTarget();
                if (prevTarget !== currentTarget) {
                    systems.eventBus.emit('interaction.targetChange', {
                        target: currentTarget
                            ? {
                                  object: currentTarget.object,
                                  distance: currentTarget.distance,
                              }
                            : null,
                        timestamp: Date.now(),
                    });
                }
            }
        }
    }

    /**
     * Update camera
     */
    updateCamera(avatar, deltaTime, elapsedTime, systems) {
        if (systems.cameraController) {
            // Get bass energy if audio system is available, otherwise default to 0
            const bassEnergy = systems.audioSystem?.getBassEnergy?.() ?? 0;
            systems.cameraController.update(
                deltaTime,
                avatar,
                bassEnergy,
                elapsedTime
            );
        }
    }

    /**
     * Update visual recorder
     */
    updateVisualRecorder(systems) {
        if (systems.visualRecorder && systems.visualRecorder.isRecording) {
            systems.visualRecorder.frameSkipCount =
                (systems.visualRecorder.frameSkipCount || 0) + 1;
            if (systems.visualRecorder.frameSkipCount >= 2) {
                // Capture every 2nd frame
                try {
                    systems.visualRecorder.captureFrame();
                } catch (error) {
                    console.warn('Error capturing frame:', error);
                }
                systems.visualRecorder.frameSkipCount = 0;
            }
        }
    }

    /**
     * Update post-processing
     */
    updatePostProcessing(elapsedTime, systems) {
        if (systems.postProcessingManager) {
            systems.postProcessingManager.updateGlitchTime(elapsedTime);
        }
    }

    /**
     * Update visual effects
     */
    updateVisualEffects(systems, elapsedTime = 0) {
        // Store elapsedTime for use in shader updates
        systems.elapsedTime = elapsedTime;
        // Update chromatic aberration shader
        if (systems.postProcessingManager && systems.vibeMeter) {
            const vibeLevel = systems.vibeMeter.getVibeLevel();
            if (vibeLevel > 0.7) {
                const aberrationAmount = (vibeLevel - 0.7) * 0.03; // 0-0.009 (shader uses smaller values)
                const angle = Math.sin(systems.elapsedTime || 0) * 0.5; // Rotating aberration
                systems.postProcessingManager.setChromaticAberration(aberrationAmount, angle);
            } else {
                systems.postProcessingManager.setChromaticAberration(0, 0);
            }
        }

        // Update afterimage/ghost trail shader
        if (systems.postProcessingManager && systems.vibeMeter) {
            const vibeLevel = systems.vibeMeter.getVibeLevel();
            if (vibeLevel > 0.8) {
                const trailAmount = (vibeLevel - 0.8) * 0.5; // 0-0.1
                systems.postProcessingManager.setAfterimage(trailAmount);
            } else {
                systems.postProcessingManager.setAfterimage(0);
            }
        }

        // Fallback: Canvas filter for volumetric effects (if shaders not available)
        const canvas = document.getElementById('club-canvas');
        if (canvas && systems.vibeMeter) {
            const vibeLevel = systems.vibeMeter.getVibeLevel();
            const filters = [];

            // Volumetric effects (blur/brightness) when vibe is very high
            if (vibeLevel > 0.9) {
                filters.push('blur(0.5px)');
                filters.push('brightness(1.1)');
            }

            // Apply combined filters or reset
            if (filters.length > 0) {
                canvas.style.filter = filters.join(' ');
            } else {
                canvas.style.filter = '';
            }
        }
    }

    /**
     * Update audio-reactive visual effects
     * @deprecated This method is deprecated. Audio-reactive updates are now handled by AudioReactiveLoop via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateAudioReactive(deltaTime, elapsedTime, systems) {
        if (!systems.audioSystem) {
            return;
        }

        const audioSystem = systems.audioSystem;

        // Map bass intensity to bloom strength
        if (systems.postProcessingManager && audioSystem.getFrequencyExtractor()) {
            const bloomPass = systems.postProcessingManager.getBloomPass();
            if (bloomPass) {
                const baseBloom = 1.5;
                const bloomMultiplier = 0.8;
                const frequencyBands = audioSystem.getFrequencyBands();
                const bassIntensity = frequencyBands.bass;
                let vibeMultiplier = 1.0;

                // Add vibe meter contribution to bloom
                if (systems.vibeMeter) {
                    const vibeLevel = systems.vibeMeter.getVibeLevel();
                    vibeMultiplier = 1.0 + vibeLevel * 0.5; // Up to 50% increase
                }

                // Update bloom intensity via PostProcessingManager
                const bloomIntensity =
                    (baseBloom + bassIntensity * bloomMultiplier) * vibeMultiplier;
                systems.postProcessingManager.updateBloomIntensity(bloomIntensity);
            }
        }

        // Update vibe meter
        if (systems.vibeMeter) {
            systems.vibeMeter.update(deltaTime, systems.avatar);

            // Add vibe on beat detection
            if (audioSystem.getBeatDetector()) {
                const frequencyBands = audioSystem.getFrequencyBands();
                if (frequencyBands.bass > 0.6) {
                    systems.vibeMeter.addVibe(0.1);
                }
            }

            // Apply vibe effects to game systems
            systems.vibeMeter.applyVibeEffects(systems);
        }

        // Map mid frequency bands to wall light colors
        if (audioSystem.getFrequencyExtractor() && systems.ceilingLights) {
            const frequencyBands = audioSystem.getFrequencyBands();
            systems.ceilingLights.forEach((lightObj, index) => {
                const midIntensity = frequencyBands.mid;
                const hue = ((midIntensity * 360) % 360) / 360; // Convert to 0-1 range
                const saturation = 0.8;
                const brightness = 0.5 + midIntensity * 0.3;
                if (lightObj.bulb && lightObj.bulb.material) {
                    const material = lightObj.bulb.material;
                    if (material.emissive) {
                        material.emissive.setHSL(hue, saturation, brightness);
                    } else {
                        // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                        material.color.setHSL(hue, saturation, brightness);
                    }
                }
            });
        }

        // Map treble to small sparkle particles
        if (audioSystem.getFrequencyExtractor() && systems.particleSystem) {
            const frequencyBands = audioSystem.getFrequencyBands();
            const trebleIntensity = frequencyBands.treble;
            if (trebleIntensity > 0.6) {
                // Threshold for sparkle particles
                const sparkleCount = Math.floor(trebleIntensity * 5);
                for (let i = 0; i < sparkleCount; i++) {
                    const sparklePos = new THREE.Vector3(
                        (Math.random() - 0.5) * ROOM_SIZE,
                        Math.random() * 3 + 1,
                        (Math.random() - 0.5) * ROOM_SIZE
                    );
                    systems.particleSystem.createSparkleParticle(sparklePos, 0xffffff);
                }
            }
        }

        // Drive LED strip colors using spectrum slices
        if (
            audioSystem.getFrequencyExtractor() &&
            audioSystem.getAudioData() &&
            systems.ledStrips
        ) {
            const audioData = audioSystem.getAudioData();
            const frequencyBands = audioSystem.getFrequencyBands();
            systems.ledStrips.forEach((led, index) => {
                // Map different frequency ranges to different LED strips
                const sliceSize = Math.floor(audioData.length / systems.ledStrips.length);
                const sliceStart = index * sliceSize;
                const sliceEnd = Math.min(sliceStart + sliceSize, audioData.length);

                let sliceSum = 0;
                for (let i = sliceStart; i < sliceEnd; i++) {
                    sliceSum += audioData[i];
                }
                const sliceIntensity = sliceSum / (sliceEnd - sliceStart) / 255;

                // Add breathing effect using sine wave for smooth pulsing
                const breathingPhase = Math.sin(elapsedTime * 2) * 0.1 + 1.0; // 0.9 to 1.1

                // Map intensity to color
                const hue = (elapsedTime * 0.1 + index * 0.2 + sliceIntensity) % 1;
                const saturation = 0.8;
                const baseBrightness = 0.5 + sliceIntensity * 0.5; // Frequency-based brightness
                const brightness = baseBrightness * breathingPhase; // Breathing multiplies, not replaces
                if (led.material.emissive) {
                    led.material.emissive.setHSL(hue, saturation, brightness);
                } else {
                    // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                    led.material.color.setHSL(hue, saturation, brightness);
                }
            });

            // Update visualizer room LED strips with more intense effects
            if (systems.visualizerLEDStrips && systems.visualizerLEDStrips.length > 0) {
                systems.visualizerLEDStrips.forEach((led, index) => {
                    if (!led.userData || !led.userData.isVisualizerLED) {
                        return;
                    }

                    const sliceSize = Math.floor(
                        audioData.length / systems.visualizerLEDStrips.length
                    );
                    const sliceStart = index * sliceSize;
                    const sliceEnd = Math.min(sliceStart + sliceSize, audioData.length);

                    let sliceSum = 0;
                    for (let i = sliceStart; i < sliceEnd; i++) {
                        sliceSum += audioData[i];
                    }
                    const sliceIntensity = sliceSum / (sliceEnd - sliceStart) / 255;

                    // More intense breathing in visualizer room
                    const breathingPhase = Math.sin(elapsedTime * 3) * 0.2 + 1.0; // 0.8 to 1.2
                    const hue = (elapsedTime * 0.2 + index * 0.3 + sliceIntensity) % 1;
                    const baseBrightness = 0.7 + sliceIntensity * 0.3;
                    const brightness = baseBrightness * breathingPhase;
                    if (led.material.emissive) {
                        led.material.emissive.setHSL(hue, 1.0, brightness);
                        led.material.emissiveIntensity = 2.0 + sliceIntensity * 2.0;
                    } else {
                        // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                        led.material.color.setHSL(hue, 1.0, brightness);
                    }
                });
            }

            // Update visualizer room lights
            if (
                systems.visualizerLights &&
                systems.visualizerLights.length > 0 &&
                audioSystem.getFrequencyExtractor()
            ) {
                const frequencyBands = audioSystem.getFrequencyBands();
                systems.visualizerLights.forEach((light, index) => {
                    if (!light.userData || !light.userData.isVisualizerLight) {
                        return;
                    }

                    // Pulse lights based on frequency bands
                    const bandIndex = index % 3;
                    let intensity = 0;
                    if (bandIndex === 0) {
                        intensity = frequencyBands.bass;
                    } else if (bandIndex === 1) {
                        intensity = frequencyBands.mid;
                    } else {
                        intensity = frequencyBands.treble;
                    }

                    light.intensity = 2 + intensity * 3; // 2-5 intensity range
                    const hue = (elapsedTime * 0.1 + index * 0.2 + intensity) % 1;
                    light.color.setHSL(hue, 1.0, 0.5);
                });
            }
        } else if (audioSystem && systems.ledStrips) {
            // Fallback to original behavior
            const overallEnergy = audioSystem.getOverallEnergy();
            const bassEnergy = audioSystem.getBassEnergy();
            systems.ledStrips.forEach((led, index) => {
                const hue = (elapsedTime * 0.1 + index * 0.2 + overallEnergy) % 1;
                if (led.material.emissive) {
                    led.material.emissive.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
                } else {
                    // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                    led.material.color.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
                }
            });
        }

        // Pulsing point lights - all lights pulse together to prevent left-right switching
        if (systems.ceilingLights) {
            // Calculate unified intensity so all lights pulse together
            let pulseIntensity = 1.0;
            if (audioSystem.getFrequencyExtractor() && audioSystem.getAudioData()) {
                // Use overall energy instead of individual frequency bands
                const overallEnergy = audioSystem.getOverallEnergy();
                pulseIntensity = 1.0 + overallEnergy * 0.3; // Reduced from 0.8 to 0.3
            } else if (audioSystem) {
                // Fallback to bass energy
                pulseIntensity = 1.0 + audioSystem.getBassEnergy() * 0.2; // Reduced from 0.5 to 0.2
            }

            // Apply same intensity to all lights so they pulse together
            systems.ceilingLights.forEach((lightObj) => {
                if (lightObj.bulb && lightObj.bulb.material) {
                    if (lightObj.bulb.material.emissiveIntensity !== undefined) {
                        lightObj.bulb.material.emissiveIntensity = 0.15 * pulseIntensity; // Reduced base from 0.3 to 0.15
                    }
                }
                if (lightObj.light) {
                    lightObj.light.intensity = 0.3 * pulseIntensity; // Reduced base from 0.5 to 0.3
                }
            });
        }

        // Enhanced subwoofer cone animation - tie more tightly to bass amplitude
        if (systems.speakerCones && audioSystem) {
            const bassEnergy = audioSystem.getBassEnergy();
            const frequencyBands = audioSystem.getFrequencyBands();
            systems.speakerCones.forEach(({ cone, baseZ }, index) => {
                const bassPush = bassEnergy * 0.1;
                // More realistic physics-based movement
                const bassAmplitude = frequencyBands.bass || bassEnergy;
                const physicsPush = bassAmplitude * 0.15; // Stronger response
                cone.position.z = baseZ + physicsPush;

                // Emit particle bursts from speakers on strong peaks
                if (
                    audioSystem.getFrequencyExtractor() &&
                    systems.particleSystem &&
                    audioSystem.getAudioData()
                ) {
                    const audioData = audioSystem.getAudioData();
                    const frequencyExtractor = audioSystem.getFrequencyExtractor();
                    const strongPeak = frequencyExtractor.detectPeak(audioData, 'bass', 0.7);
                    if (strongPeak && Math.random() < 0.1) {
                        // 10% chance per frame when peak detected
                        const speakerPosition = new THREE.Vector3();
                        cone.getWorldPosition(speakerPosition);
                        const burstDirection = new THREE.Vector3(0, 0, 1); // Forward from speaker
                        cone.getWorldDirection(burstDirection);
                        systems.particleSystem.createSpeakerBurst(
                            speakerPosition,
                            burstDirection,
                            0xff00ff,
                            frequencyBands.bass
                        );
                    }
                }
            });
        }

        // Use FFT data to distort certain shaders (floor, walls)
        if (audioSystem.getFrequencyExtractor() && audioSystem.getAudioData()) {
            const audioData = audioSystem.getAudioData();
            const frequencyBands = audioSystem.getFrequencyBands();
            const overallEnergy = audioSystem.getOverallEnergy();
            // Apply distortion to floor material based on overall FFT energy
            const distortionIntensity = overallEnergy * 0.1;
            if (systems.floorMaterial) {
                // Modify roughness and metalness based on FFT
                systems.floorMaterial.roughness = 0.5 + distortionIntensity * 0.3;
                systems.floorMaterial.metalness = 0.4 - distortionIntensity * 0.2;
                // Add slight emissive glow based on bass
                if (systems.floorMaterial.emissive) {
                    if (frequencyBands.bass > 0.5) {
                        systems.floorMaterial.emissive.setScalar(frequencyBands.bass * 0.1);
                        systems.floorMaterial.emissiveIntensity = frequencyBands.bass * 0.2;
                    } else {
                        systems.floorMaterial.emissive.setScalar(0);
                        systems.floorMaterial.emissiveIntensity = 0;
                    }
                }
                // Note: If material doesn't have emissive (e.g., MeshBasicMaterial), skip this effect
            }

            // Apply distortion to wall materials based on mid frequencies
            if (systems.wallMaterial) {
                const midDistortion = frequencyBands.mid * 0.05;
                systems.wallMaterial.roughness = 0.6 + midDistortion;
                systems.wallMaterial.metalness = 0.2 - midDistortion;
            }
        }
    }

    /**
     * Update environment animations
     * @deprecated This method is deprecated. Environment updates are now handled by EnvironmentLoop via LoopManager.
     * This method is kept for backward compatibility when LoopManager is disabled.
     */
    updateEnvironment(deltaTime, elapsedTime, systems) {
        // Animate fan rotation
        if (systems.leftFanBlades) {
            systems.leftFanBlades.rotation.y += deltaTime * 5;
        }
        if (systems.rightFanBlades) {
            systems.rightFanBlades.rotation.y += deltaTime * 5;
        }

        // Update screen texture animation (with audio visualization)
        if (systems.updateScreenTexture) {
            systems.updateScreenTexture(elapsedTime, systems.audioSystem);
        }

        // Apply glitch effect to screen
        if (systems.applyGlitchToScreen) {
            // Get screen effect intensity from settings if available
            let screenEffectIntensity = 1.0;
            if (window.gameSystems?.screenEffectsPresets) {
                const preset = window.gameSystems.screenEffectsPresets.getCurrentPreset();
                screenEffectIntensity = preset.screenEffectIntensity || 1.0;
            } else if (window.gameSystems?.visualEffectSettings) {
                screenEffectIntensity =
                    window.gameSystems.visualEffectSettings.getSetting('screenEffectIntensity') ||
                    1.0;
            }
            systems.applyGlitchToScreen(elapsedTime, screenEffectIntensity);
        }

        // Update DevMenu (for position tracking)
        if (systems.devMenu) {
            systems.devMenu.update(deltaTime);
        }

        // Update neon sign animation (with audio reactivity)
        if (systems.neonSign) {
            systems.neonSign.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ placeholder animation (with audio reactivity)
        if (systems.djPlaceholder) {
            systems.djPlaceholder.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ booth particles (with audio reactivity)
        if (systems.djBoothParticles) {
            systems.djBoothParticles.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ booth lighting (with audio reactivity)
        if (systems.djBoothLighting) {
            systems.djBoothLighting.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update atmospheric fog (with audio reactivity)
        if (systems.atmosphericFog) {
            systems.atmosphericFog.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update laser beams (with audio reactivity)
        if (systems.laserBeams) {
            systems.laserBeams.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update dance floor lighting (with audio reactivity)
        if (systems.danceFloorLighting) {
            systems.danceFloorLighting.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update audio visualizer (with audio reactivity)
        if (systems.audioVisualizer) {
            systems.audioVisualizer.update(deltaTime, elapsedTime, systems.audioSystem);
        }
    }
}
