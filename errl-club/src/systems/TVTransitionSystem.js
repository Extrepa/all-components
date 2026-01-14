/**
 * TVTransitionSystem - Handles the cinematic transition from viewing the TV to entering the nightclub
 *
 * Pulls the camera into the TV screen and fades to reveal the player in the nightclub
 */
import * as THREE from 'three';

export class TVTransitionSystem {
    constructor(tvRoomCamera, clubCamera, tvRenderSystem, renderer, postProcessingManager = null) {
        this.tvRoomCamera = tvRoomCamera; // Camera viewing TV from outside
        this.clubCamera = clubCamera; // Camera for club scene (inside TV)
        this.tvRenderSystem = tvRenderSystem; // TV render system to get screen position
        this.renderer = renderer;
        this.postProcessingManager = postProcessingManager; // Post-processing manager for fuzzy effects
        this.cameraController = null; // Camera controller to sync state after transition (set later)
        this.systems = null; // Systems reference (set later) - used to remove TV
        this.nightclubLoaded = false; // Track if nightclub is ready (using procedural nightclub)

        // Transition state
        this.inProgress = false;
        this.progress = 0; // 0 to 1
        this.startTime = 0;
        this.duration = 8000; // 8 seconds total - slower, more subtle transition

        // Camera positions
        this.startPosition = null;
        this.startTarget = null;
        this.tvScreenPosition = null;
        this.tvScreenNormal = null;

        // Active camera tracking
        this.activeCamera = tvRoomCamera; // Start with TV room camera
        this.cameraSwitched = false;

        // Fade overlay
        this.fadeOverlay = null;

        // Callbacks
        this.onComplete = null;
    }

    /**
     * Set post-processing manager for fuzzy effects
     * @param {PostProcessingManager} postProcessingManager - Post-processing manager
     */
    setPostProcessingManager(postProcessingManager) {
        this.postProcessingManager = postProcessingManager;
    }

    /**
     * Set camera controller to sync state after transition
     * @param {CameraController} cameraController - Camera controller instance
     */
    setCameraController(cameraController) {
        this.cameraController = cameraController;
    }

    /**
     * Set systems reference (for removing TV after transition)
     * @param {Object} systems - Systems object
     */
    setSystems(systems) {
        this.systems = systems;
    }

    /**
     * Start the TV transition
     * @param {Function} onComplete - Callback when transition completes
     * @returns {Promise} Resolves when transition completes
     */
    async start(onComplete = null) {
        if (this.inProgress) {
            console.warn('TVTransitionSystem: Transition already in progress');
            return Promise.resolve();
        }

        this.inProgress = true;
        this.progress = 0;
        this.startTime = performance.now();
        this.cameraSwitched = false;

        // Get TV screen position from TV render system
        if (this.tvRenderSystem && this.tvRenderSystem.tvScreenMesh) {
            this.tvScreenPosition = this.tvRenderSystem.tvScreenMesh.position.clone();
            // Get screen normal (direction it faces)
            const screenQuaternion = this.tvRenderSystem.tvScreenMesh.quaternion;
            this.tvScreenNormal = new THREE.Vector3(0, 0, 1);
            this.tvScreenNormal.applyQuaternion(screenQuaternion);
        } else {
            // Fallback: assume TV is at origin, facing forward
            this.tvScreenPosition = new THREE.Vector3(0, 1.5, 0);
            this.tvScreenNormal = new THREE.Vector3(0, 0, 1);
        }

        // Store starting camera position and target
        // Start position should be higher (looking down slightly at TV)
        this.startPosition = this.tvRoomCamera.position.clone();
        // Adjust start position to be slightly higher
        this.startPosition.y += 0.5; // Come in higher
        this.startTarget = new THREE.Vector3(0, 1.7, 0); // Look slightly higher on TV

        // Set initial camera to look at TV
        this.tvRoomCamera.lookAt(this.startTarget);

        // Create fade overlay
        this.createFadeOverlay();

        // Start transition
        return new Promise((resolve) => {
            this.onComplete = () => {
                this.inProgress = false;
                this.progress = 1;

                // Clean up overlay
                this.removeFadeOverlay();

                if (onComplete) {
                    onComplete();
                }

                resolve();
            };
        });
    }

    /**
     * Create fade overlay for transition
     * @private
     */
    createFadeOverlay() {
        // Remove existing overlay if any
        this.removeFadeOverlay();

        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.id = 'tv-transition-overlay';
        this.fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            opacity: 0;
            pointer-events: none;
            z-index: 10000;
            transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(this.fadeOverlay);
    }

    /**
     * Remove fade overlay
     * @private
     */
    removeFadeOverlay() {
        if (this.fadeOverlay && this.fadeOverlay.parentNode) {
            this.fadeOverlay.parentNode.removeChild(this.fadeOverlay);
            this.fadeOverlay = null;
        }
    }

    /**
     * Update transition (called every frame)
     * @param {number} deltaTime - Time since last frame in seconds
     * @returns {THREE.Camera} Active camera to use for rendering
     */
    update(deltaTime) {
        if (!this.inProgress) {
            return this.activeCamera;
        }

        const elapsed = performance.now() - this.startTime;
        this.progress = Math.min(1, elapsed / this.duration);

        // Phase 0: Zoom into TV with graininess (0-70% progress) - slower zoom
        if (this.progress < 0.7) {
            const phaseProgress = this.progress / 0.7; // 0 to 1 for this phase
            const eased = this.easeInOutCubic(phaseProgress);

            // Move camera toward TV screen with smooth easing (higher approach)
            const tvTarget = this.tvScreenPosition.clone();
            tvTarget.y += 0.2; // Approach slightly higher on TV
            const startToTV = tvTarget.clone().sub(this.startPosition);
            const startDistance = startToTV.length();
            const direction = startToTV.normalize();

            // End very close to screen
            const endDistance = 0.05;
            const currentDistance = THREE.MathUtils.lerp(startDistance, endDistance, eased);
            const targetPos = tvTarget
                .clone()
                .sub(direction.clone().multiplyScalar(currentDistance));

            this.tvRoomCamera.position.lerpVectors(this.startPosition, targetPos, eased);

            // Smooth zoom FOV
            const startFOV = 75;
            const endFOV = 20;
            this.tvRoomCamera.fov = THREE.MathUtils.lerp(startFOV, endFOV, eased);
            this.tvRoomCamera.updateProjectionMatrix();

            // Keep looking at TV center (slightly higher)
            this.tvRoomCamera.lookAt(this.startTarget);

            // Add graininess effect as we approach TV (increases near end of zoom)
            // Graininess peaks right before going through (80-100% of zoom phase)
            const grainProgress = Math.max(0, (phaseProgress - 0.5) / 0.5); // 0 to 1 in second half
            const grainIntensity = this.easeInOutCubic(grainProgress);
            const desaturateAmount = grainIntensity; // Full desaturation at peak

            if (this.postProcessingManager && this.postProcessingManager.filmGrainPass) {
                const grainPass = this.postProcessingManager.filmGrainPass;
                grainPass.material.uniforms.intensity.value = grainIntensity * 0.8;
                grainPass.material.uniforms.desaturate.value = desaturateAmount;
                grainPass.material.uniforms.time.value = performance.now() * 0.001;
                grainPass.enabled = grainIntensity > 0.01;
            }
        }
        // Phase 1: Fade to black gradually (70-85% progress) - like closing eyes
        else if (this.progress < 0.85) {
            const phaseProgress = (this.progress - 0.7) / 0.15; // 0 to 1 for this phase
            const eased = this.easeInOutCubic(phaseProgress);

            // Gradual fade to black (like closing eyes)
            if (this.fadeOverlay) {
                this.fadeOverlay.style.opacity = eased.toString();
            }

            // Maximum graininess right before black
            if (this.postProcessingManager && this.postProcessingManager.filmGrainPass) {
                const grainPass = this.postProcessingManager.filmGrainPass;
                grainPass.material.uniforms.intensity.value = 0.8;
                grainPass.material.uniforms.desaturate.value = 1.0; // Full black and white
                grainPass.material.uniforms.time.value = performance.now() * 0.001;
                grainPass.enabled = true;
            }

            // Switch cameras and remove TV when fully black
            if (eased >= 0.95 && !this.cameraSwitched) {
                this.switchToClubCamera();
                this.removeTV();
            }
        }
        // Phase 2: Fade in from black (85-100% progress) - slower fade in
        else {
            const phaseProgress = (this.progress - 0.85) / 0.15; // 0 to 1 for this phase
            const eased = this.easeInOutCubic(phaseProgress);

            // Fade in from black (opening eyes)
            if (this.fadeOverlay) {
                this.fadeOverlay.style.opacity = (1 - eased).toString();
            }

            // Fade out graininess as we fade in
            if (this.postProcessingManager && this.postProcessingManager.filmGrainPass) {
                const grainPass = this.postProcessingManager.filmGrainPass;
                const grainFade = 1 - eased;
                grainPass.material.uniforms.intensity.value = grainFade * 0.3;
                grainPass.material.uniforms.desaturate.value = grainFade;
                grainPass.material.uniforms.time.value = performance.now() * 0.001;
                grainPass.enabled = grainFade > 0.01;
            }

            // Complete transition
            if (this.progress >= 1.0) {
                this.complete();
            }
        }

        return this.activeCamera;
    }

    /**
     * Switch from TV room camera to club camera
     * @private
     */
    switchToClubCamera() {
        if (this.cameraSwitched) {
            return;
        }

        this.cameraSwitched = true;
        this.activeCamera = this.clubCamera;

        // Position club camera at spawn point (inside nightclub)
        // The avatar should already be spawned, so we position camera behind avatar
        if (this.clubCamera) {
            // Set camera to a good starting position in the nightclub
            // Position camera behind and above the spawn point
            this.clubCamera.position.set(0, 2, 5);
            this.clubCamera.lookAt(0, 1.5, 0); // Look at spawn point (eye level)

            // Adjust FOV and aspect ratio to match viewport for full screen rendering
            // Use wider FOV to maximize viewable area when inside TV
            const viewportAspect = this.renderer.domElement.width / this.renderer.domElement.height;
            this.clubCamera.fov = 90; // Wider FOV to use more screen space
            this.clubCamera.aspect = viewportAspect;
            this.clubCamera.updateProjectionMatrix();

            console.log('TVTransitionSystem: Club camera positioned for full screen', {
                position: this.clubCamera.position,
                lookAt: new THREE.Vector3(0, 1.5, 0),
                fov: this.clubCamera.fov,
                aspect: this.clubCamera.aspect,
                viewportWidth: this.renderer.domElement.width,
                viewportHeight: this.renderer.domElement.height,
            });
        }

        // Position avatar at spawn point in nightclub if available
        if (this.systems && this.systems.avatar) {
            const avatar = this.systems.avatar;

            // Move avatar to club scene if it's not already there
            if (this.systems.clubScene && avatar.scene !== this.systems.clubScene) {
                // Remove from old scene
                if (avatar.group && avatar.group.parent) {
                    avatar.group.parent.remove(avatar.group);
                }
                // Add to club scene
                if (avatar.group) {
                    this.systems.clubScene.add(avatar.group);
                }
                avatar.scene = this.systems.clubScene;
                console.log('TVTransitionSystem: Avatar moved to club scene');
            }

            // Reset avatar position to spawn point
            avatar.position.set(0, 0, 0);
            if (avatar.group) {
                avatar.group.position.set(0, 0, 0);
            }
            console.log('TVTransitionSystem: Avatar positioned at nightclub spawn', {
                position: avatar.position,
                scene: avatar.scene,
                groupPosition: avatar.group ? avatar.group.position : null,
            });
        }

        // Nightclub scene is already built procedurally
        // The Shroom Bar model will be loaded separately as an upstairs area
        if (this.systems && this.systems.clubScene) {
            console.log('TVTransitionSystem: Nightclub scene ready (procedural)');
        }

        console.log('TVTransitionSystem: Switched to club camera - nightclub ready');
    }

    /**
     * Load Shroom Bar model for upstairs area
     * Note: Custom model removed - using procedural nightclub only
     * @private
     */
    async loadShroomBar() {
        // Custom model loading removed - using procedural nightclub only
        console.log(
            'TVTransitionSystem: Shroom Bar model loading removed - using procedural nightclub'
        );
        this.nightclubLoaded = true; // Mark as loaded to prevent retries
    }

    /**
     * Remove TV from scene after transition
     * @private
     */
    removeTV() {
        if (!this.systems || !this.systems.tvProp) {
            return;
        }

        const tvProp = this.systems.tvProp;

        // Remove TV model from scene
        if (tvProp.model && tvProp.model.parent) {
            tvProp.model.parent.remove(tvProp.model);
        }

        // Remove screen mesh if it exists
        if (tvProp.screenMesh && tvProp.screenMesh.parent) {
            tvProp.screenMesh.parent.remove(tvProp.screenMesh);
        }

        // Remove spawn light if it exists
        if (tvProp.spawnLight && tvProp.spawnLight.parent) {
            tvProp.spawnLight.parent.remove(tvProp.spawnLight);
        }

        // Dispose of TV render system (no longer needed)
        if (this.tvRenderSystem) {
            // Stop rendering to TV texture
            this.tvRenderSystem.enabled = false;
        }

        console.log('TVTransitionSystem: TV removed from scene');
    }

    /**
     * Sync camera controller state with current camera position
     * This prevents the camera from snapping back after transition
     * @private
     */
    syncCameraControllerState() {
        if (!this.cameraController || !this.clubCamera) {
            return;
        }

        // Get avatar position - try to get from systems if available
        // The camera controller should have access to avatar, but we'll use a fallback
        const avatarPosition = new THREE.Vector3(0, 1.5, 0); // Default spawn position

        // Try to get actual avatar position if available through systems
        // Note: We can't access systems directly, so we'll calculate based on camera position
        // The camera controller will handle avatar following after this sync

        // Calculate camera state from current camera position
        const cameraPos = this.clubCamera.position.clone();

        // Get the look-at target from the camera's current orientation
        const lookDirection = new THREE.Vector3(0, 0, -1);
        lookDirection.applyQuaternion(this.clubCamera.quaternion);
        const cameraTarget = cameraPos.clone().add(lookDirection.multiplyScalar(10));
        cameraTarget.y = 1.5; // Eye level

        // For now, use a reasonable default distance and angles
        // The camera controller will smoothly transition to follow the avatar
        // We set the target to where the camera is looking, and distance/angles
        // based on the camera's current position relative to a default avatar position

        // Calculate direction from default avatar position to camera
        const direction = cameraPos.clone().sub(avatarPosition).normalize();

        // Calculate distance
        const distance = Math.max(3.0, cameraPos.distanceTo(avatarPosition));

        // Calculate angles
        const angleY = Math.atan2(direction.x, direction.z);
        const horizontalDist = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        const angleX = Math.atan2(direction.y, horizontalDist);

        // Sync camera controller state - this prevents it from snapping back
        this.cameraController.state.target.copy(cameraTarget);
        this.cameraController.state.distance = distance;
        this.cameraController.state.angleX = angleX;
        this.cameraController.state.angleY = angleY;
        this.cameraController.state.targetDistance = distance;
        this.cameraController.state.targetAngleX = angleX;
        this.cameraController.state.targetAngleY = angleY;

        // Also sync current values to prevent interpolation/jumping
        this.cameraController.state.angleX = angleX;
        this.cameraController.state.angleY = angleY;
        this.cameraController.state.distance = distance;

        console.log('TVTransitionSystem: Synced camera controller state', {
            position: cameraPos,
            target: cameraTarget,
            distance: distance,
            angleX: angleX,
            angleY: angleY,
        });
    }

    /**
     * Complete the transition
     * @private
     */
    complete() {
        this.inProgress = false;
        this.progress = 1;

        // Ensure we're using club camera
        if (!this.cameraSwitched) {
            this.switchToClubCamera();
        }

        // Update club camera to use full viewport aspect ratio (not TV screen)
        if (this.clubCamera && this.renderer) {
            const viewportAspect = this.renderer.domElement.width / this.renderer.domElement.height;
            this.clubCamera.aspect = viewportAspect;
            this.clubCamera.fov = 90; // Wider FOV for full screen
            this.clubCamera.updateProjectionMatrix();
            console.log('TVTransitionSystem: Club camera updated for full screen', {
                aspect: viewportAspect,
                fov: this.clubCamera.fov,
                viewportSize: `${this.renderer.domElement.width}x${this.renderer.domElement.height}`,
            });
        }

        // Sync camera controller state with final camera position
        // This prevents the camera from snapping back to follow avatar immediately
        // Add a small delay to ensure the camera position is stable
        setTimeout(() => {
            this.syncCameraControllerState();
        }, 100);

        // Final fade out
        if (this.fadeOverlay) {
            this.fadeOverlay.style.opacity = '0';
            // Remove overlay after fade completes
            setTimeout(() => {
                this.removeFadeOverlay();
            }, 500);
        }

        // Disable film grain after transition
        if (this.postProcessingManager && this.postProcessingManager.filmGrainPass) {
            this.postProcessingManager.filmGrainPass.enabled = false;
        }

        console.log('TVTransitionSystem: Transition completed - now rendering full screen', {
            cameraSwitched: this.cameraSwitched,
            activeCamera: this.activeCamera,
            clubCamera: this.clubCamera,
            clubScene: this.systems?.clubScene,
            cameraAspect: this.clubCamera?.aspect,
            cameraFOV: this.clubCamera?.fov,
        });

        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Easing function: cubic ease in-out
     * @param {number} t - Value from 0 to 1
     * @returns {number} Eased value
     * @private
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Get the active camera
     * @returns {THREE.Camera} Active camera
     */
    getActiveCamera() {
        return this.activeCamera;
    }

    /**
     * Check if transition is in progress
     * @returns {boolean} True if transitioning
     */
    isInProgress() {
        return this.inProgress;
    }

    /**
     * Get current progress
     * @returns {number} Progress from 0 to 1
     */
    getProgress() {
        return this.progress;
    }
}
