/**
 * GameLoop - Manages the main animation loop
 */
import * as THREE from 'three';

export class GameLoop {
    constructor(updateManager, postProcessingManager, renderer, scene, camera, systems = null) {
        if (!updateManager) {
            throw new Error('GameLoop: updateManager is required');
        }
        if (!renderer) {
            throw new Error('GameLoop: renderer is required');
        }
        if (!scene) {
            throw new Error('GameLoop: scene is required');
        }
        if (!camera) {
            throw new Error('GameLoop: camera is required');
        }

        this.updateManager = updateManager;
        this.postProcessingManager = postProcessingManager;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.systems = systems; // Store systems object for UpdateManager

        this.clock = new THREE.Clock();
        this.timeScale = 1.0; // Global time scale multiplier for slow-motion
        this.isRunning = false;
        this.animationFrameId = null;
    }

    /**
     * Set systems object for UpdateManager
     * @param {object} systems - All game systems and dependencies
     */
    setSystems(systems) {
        this.systems = systems;
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) {
            console.warn('GameLoop: Already running');
            return;
        }

        // Validate required components
        if (!this.renderer) {
            console.error('GameLoop: Cannot start - renderer is missing');
            return;
        }
        if (!this.scene) {
            console.error('GameLoop: Cannot start - scene is missing');
            return;
        }
        if (!this.camera) {
            console.error('GameLoop: Cannot start - camera is missing');
            return;
        }
        if (!this.updateManager) {
            console.error('GameLoop: Cannot start - updateManager is missing');
            return;
        }

        // Validate systems object and critical systems
        if (!this.systems) {
            console.error('GameLoop: Cannot start - systems object is missing');
            return;
        }

        // Validate critical systems are ready (but don't block if optional systems are missing)
        if (!this.systems.avatar) {
            console.warn('GameLoop: Avatar not found in systems - game may not function correctly');
        }
        if (!this.systems.scene && !this.scene) {
            console.error('GameLoop: Cannot start - no scene available');
            return;
        }

        // Only log in debug mode to avoid flooding test logs
        if (window.DEBUG_GAMELOOP !== false) {
            console.log('GameLoop: Starting animation loop', {
                hasRenderer: !!this.renderer,
                hasScene: !!this.scene,
                hasCamera: !!this.camera,
                hasUpdateManager: !!this.updateManager,
                sceneChildren: this.scene ? this.scene.children.length : 0,
            });
        }

        this.isRunning = true;
        this.clock.start();

        // CRITICAL: Final material simplification pass before first render
        // Use requestAnimationFrame to ensure this happens right before rendering starts
        requestAnimationFrame(() => {
            this.performPreRenderMaterialCheck();
            this.animate();
        });
    }

    /**
     * Perform final material simplification check before first render
     * This is the absolute last chance to fix materials before WebGL tries to render
     */
    async performPreRenderMaterialCheck() {
        try {
            const { MaterialSimplifier } = await import('../utils/MaterialSimplifier.js');
            const estimatedUnits = MaterialSimplifier.checkTextureUnitUsage(this.scene, 12);

            if (estimatedUnits > 0) {
                // eslint-disable-next-line no-console
                console.warn(
                    `GameLoop: Pre-render check found ${estimatedUnits} texture units in use. Simplifying materials...`
                );
                MaterialSimplifier.simplifyMaterials(this.scene, true);
                const afterUnits = MaterialSimplifier.checkTextureUnitUsage(this.scene, 12);
                if (afterUnits > 0) {
                    // eslint-disable-next-line no-console
                    console.error(
                        `GameLoop: WARNING - Still ${afterUnits} texture units in use after pre-render simplification!`
                    );
                } else {
                    // eslint-disable-next-line no-console
                    console.log(
                        'GameLoop: Pre-render material simplification successful. Texture units: 0/16'
                    );
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('GameLoop: Pre-render material check failed:', error);
        }
    }

    /**
     * Stop the animation loop
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Set time scale for slow-motion debug feature
     * @param {number} scale - Time scale multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
    }

    /**
     * Get current frame deltaTime
     * @returns {number} Delta time in seconds
     */
    getDeltaTime() {
        return this.clock.getDelta() * this.timeScale;
    }

    /**
     * Get total elapsed time
     * @returns {number} Elapsed time in seconds
     */
    getElapsedTime() {
        return this.clock.getElapsedTime();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta() * this.timeScale;
        const elapsedTime = this.clock.getElapsedTime();

        // Runtime material monitoring (check every 60 frames = ~1 second at 60fps)
        // Use lazy import to avoid blocking if MaterialSimplifier isn't available
        if (this.systems && this.scene && this._frameCount % 60 === 0) {
            import('../utils/MaterialSimplifier.js')
                .then(({ MaterialSimplifier }) => {
                    MaterialSimplifier.monitorAndFix(this.scene, 60);
                })
                .catch(() => {
                    // Silently fail - don't spam console with import errors
                    // Material monitoring is optional safety feature
                });
        }

        // Increment frame counter for monitoring
        if (!this._frameCount) {
            this._frameCount = 0;
        }
        this._frameCount++;

        // Update all systems via UpdateManager
        // Systems object should be passed to GameLoop constructor or set before starting
        if (this.systems) {
            try {
                // Debug: Verify systems are available
                if (!this._updateSystemsLogged) {
                    console.log('GameLoop: Systems passed to UpdateManager', {
                        hasKeys: !!this.systems.keys,
                        hasAvatar: !!this.systems.avatar,
                        hasPhysicsSystem: !!this.systems.physicsSystem,
                        hasCollisionSystem: !!this.systems.collisionSystem,
                        hasParticleSystem: !!this.systems.particleSystem,
                        hasScene: !!this.systems.scene,
                        hasUpdateManager: !!this.updateManager,
                    });
                    this._updateSystemsLogged = true;
                }
                
                this.updateManager.update(
                    deltaTime,
                    elapsedTime,
                    {
                        clock: this.clock,
                        timeScale: this.timeScale,
                    },
                    this.systems
                );
            } catch (updateError) {
                // Log error but continue loop - don't crash on update errors
                console.error('GameLoop: Update error (non-fatal):', updateError);
                // In test mode, suppress error logging to avoid flooding
                if (!window.__PLAYWRIGHT_TEST__) {
                    console.error('GameLoop: Update error stack:', updateError.stack);
                }
            }

            // Update dev tools if available
            if (this.systems.devTools) {
                this.systems.devTools.update(deltaTime, elapsedTime);
            }
            if (this.systems.debugOverlay && this.systems.avatar && this.camera) {
                this.systems.debugOverlay.update(
                    this.systems.avatar,
                    this.camera,
                    this.systems.inputManager
                );
            }
            if (this.systems.testMode) {
                this.systems.testMode.update(deltaTime, elapsedTime);
            }

            // Update Errl Phone UI
            if (this.systems.errlPhone) {
                this.systems.errlPhone.update();
            }
        }

        // Use club scene directly (no TV transition)
        const activeScene = this.scene; // Club scene is now the main scene
        const activeCamera = this.camera; // Main camera

        // Debug: Log scene info once (only in debug mode to avoid flooding test logs)
        if (!this._sceneInfoLogged && window.DEBUG_GAMELOOP !== false) {
            const sceneChildren = activeScene ? activeScene.children.length : 0;
            const clubSceneChildren = this.systems?.clubScene
                ? this.systems.clubScene.children.length
                : 0;

            console.log('GameLoop: Rendering scene', {
                scene: activeScene,
                sceneChildren: sceneChildren,
                camera: activeCamera,
                cameraPosition: activeCamera ? activeCamera.position.clone() : null,
                cameraLookAt: activeCamera ? new THREE.Vector3(0, 1.5, 0) : null,
                clubScene: this.systems?.clubScene,
                clubSceneChildren: clubSceneChildren,
                sceneIsClubScene: activeScene === this.systems?.clubScene,
                sceneTypes: activeScene
                    ? activeScene.children
                          .map((child) => child.type || child.constructor.name)
                          .slice(0, 10)
                    : [],
                avatar: this.systems?.avatar ? {
                    exists: true,
                    position: this.systems.avatar.position.clone(),
                    inScene: activeScene && this.systems.avatar.group && activeScene.children.includes(this.systems.avatar.group),
                    visible: this.systems.avatar.mesh ? this.systems.avatar.mesh.visible : false,
                } : { exists: false },
            });

            if (sceneChildren === 0) {
                console.error(
                    'GameLoop: WARNING - Scene has no children! Nightclub may not have been built.'
                );
            } else if (sceneChildren < 10) {
                console.warn(
                    'GameLoop: Scene has very few children',
                    sceneChildren,
                    '- nightclub may be incomplete'
                );
            } else {
                console.log('GameLoop: Scene looks good with', sceneChildren, 'children');
            }

            this._sceneInfoLogged = true;
        }

        // Validate scene and camera
        if (!activeScene || !activeCamera) {
            console.warn('GameLoop: Missing scene or camera', {
                scene: activeScene,
                camera: activeCamera,
            });
            return;
        }

        // Ensure we're using the club scene (not an empty scene)
        if (activeScene.children.length === 0) {
            console.error(
                'GameLoop: Active scene is empty! Attempting to use club scene if available.'
            );
            if (this.systems?.clubScene && this.systems.clubScene.children.length > 0) {
                console.log(
                    'GameLoop: Switching to club scene which has',
                    this.systems.clubScene.children.length,
                    'children'
                );
                // Don't switch here - the scene should already be the club scene
                // This is just a warning
            }
            return;
        }

        // Update camera aspect ratio to match viewport
        const viewportWidth = this.renderer.domElement.width;
        const viewportHeight = this.renderer.domElement.height;

        if (viewportWidth <= 0 || viewportHeight <= 0) {
            console.warn('GameLoop: Invalid viewport size', {
                width: viewportWidth,
                height: viewportHeight,
            });
            return;
        }

        const viewportAspect = viewportWidth / viewportHeight;

        // Update camera aspect to match full viewport
        if (Math.abs(activeCamera.aspect - viewportAspect) > 0.01) {
            activeCamera.aspect = viewportAspect;
            activeCamera.updateProjectionMatrix();
        }

        // Ensure renderer is in a clean state
        this.renderer.setRenderTarget(null); // Clear any render target
        this.renderer.setViewport(0, 0, viewportWidth, viewportHeight);
        this.renderer.setScissorTest(false);

        // Render with post-processing if available
        if (this.postProcessingManager) {
            try {
                // Ensure post-processing manager is using the correct scene and camera
                if (this.postProcessingManager.scene !== activeScene) {
                    this.postProcessingManager.scene = activeScene;
                }
                if (this.postProcessingManager.camera !== activeCamera) {
                    this.postProcessingManager.camera = activeCamera;
                    // Update render pass with new camera
                    if (
                        this.postProcessingManager.composer &&
                        this.postProcessingManager.composer.passes.length > 0
                    ) {
                        const renderPass = this.postProcessingManager.composer.passes[0];
                        if (renderPass && renderPass.camera !== activeCamera) {
                            renderPass.camera = activeCamera;
                        }
                    }
                }
                this.postProcessingManager.render(this.renderer, activeScene, activeCamera);
            } catch (error) {
                console.error('GameLoop: Post-processing render error', error);
                // Fallback to simple render
                try {
                    this.renderer.render(activeScene, activeCamera);
                } catch (fallbackError) {
                    console.error('GameLoop: Fallback render also failed', fallbackError);
                }
            }
        } else {
            // Simple render without post-processing
            try {
                this.renderer.render(activeScene, activeCamera);
            } catch (error) {
                console.error('GameLoop: Render error', error);
            }
        }
    }
}
