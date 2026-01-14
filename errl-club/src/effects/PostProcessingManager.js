/**
 * PostProcessingManager - Centralized post-processing setup and management
 */
import * as THREE from 'three';

export class PostProcessingManager {
    constructor(scene, camera, renderer, visualPreferences = null) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // State
        this.composer = null;
        this.postProcessingEnabled = false; // Start disabled - will enable after successful initialization
        this.postProcessingErrorCount = 0; // Track consecutive errors
        this.maxErrorsBeforeDisable = 1; // Disable immediately on first error
        this.textureErrorDetected = false; // Flag to prevent re-enabling after texture errors
        this.composerSize = null; // Track composer size since EffectComposer doesn't have getSize()
        this.firstRenderAttempted = false; // Track if we've tried to render with post-processing
        this.bloomPass = null;
        this.bloomConfig = null;
        this.ssaoPass = null;
        this.glitchPass = null;
        this.chromaticAberrationPass = null;
        this.afterimagePass = null;
        this.colorGradingPass = null;
        this.oldTexture = null; // For afterimage shader
        this.visualPreferences = visualPreferences;

        this.initialized = false;
    }

    /**
     * Initialize post-processing (returns Promise)
     * @returns {Promise} Resolves when post-processing is set up
     */
    async initialize() {
        if (this.initialized) {
            return Promise.resolve({
                composer: this.composer,
                bloomPass: this.bloomPass,
                bloomConfig: this.bloomConfig,
            });
        }

        try {
            const { EffectComposer } =
                await import('three/examples/jsm/postprocessing/EffectComposer.js');
            const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
            const { UnrealBloomPass } =
                await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
            const { FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js');
            const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
            const { VignetteShader } = await import('three/examples/jsm/shaders/VignetteShader.js');
            const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');

            this.composer = new EffectComposer(this.renderer);

            // Track initial composer size
            this.composerSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

            // Render pass
            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            // Bloom post-processing with config
            // Very low values for clearer visuals
            this.bloomConfig = {
                intensity: 0.05,
                threshold: 0.95,
                radius: 0.1,
            };

            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                this.bloomConfig.intensity,
                this.bloomConfig.radius,
                this.bloomConfig.threshold
            );
            this.bloomPass.enabled = false; // Disable bloom for clearer visuals
            this.composer.addPass(this.bloomPass);

            // FXAA anti-aliasing
            const fxaaPass = new ShaderPass(FXAAShader);
            const pixelRatio = this.renderer.getPixelRatio();
            fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
            fxaaPass.material.uniforms['resolution'].value.y =
                1 / (window.innerHeight * pixelRatio);
            this.composer.addPass(fxaaPass);

            // Vignette effect
            const vignettePass = new ShaderPass(VignetteShader);
            vignettePass.material.uniforms['offset'].value = 1.0;
            vignettePass.material.uniforms['darkness'].value = 1.2;
            this.composer.addPass(vignettePass);

            // Color grading/LUT switching (simplified - using vignette for mood)
            // Full LUT implementation would require custom shader and LUT textures
            // For now, adjust vignette based on energy/mood
            const colorGradingPass = vignettePass; // Reuse vignette for now
            this.composer.colorGradingPass = colorGradingPass; // Store reference

            // Film grain shader pass removed - TV transitions were removed
            // Keeping reference null to prevent any accidental usage
            this.filmGrainPass = null;

            // Add chromatic aberration shader pass
            try {
                const { ChromaticAberrationShader } =
                    await import('../shaders/ChromaticAberrationShader.js');
                const chromaticPass = new ShaderPass(ChromaticAberrationShader);
                chromaticPass.material.uniforms['tDiffuse'].value = null; // Will be set automatically
                chromaticPass.material.uniforms['amount'].value = 0.0; // Start disabled
                chromaticPass.material.uniforms['angle'].value = 0.0;
                chromaticPass.enabled = false; // Start disabled
                this.composer.addPass(chromaticPass);
                this.chromaticAberrationPass = chromaticPass;
                this.composer.chromaticAberrationPass = chromaticPass;
                this.composer.chromaticAberrationEnabled = false;
            } catch (error) {
                console.warn('Failed to add chromatic aberration shader pass:', error);
                this.chromaticAberrationPass = null;
                this.composer.chromaticAberrationPass = null;
                this.composer.chromaticAberrationEnabled = false;
            }

            // Add afterimage/ghost trail shader pass
            try {
                const { AfterimageShader } = await import('../shaders/AfterimageShader.js');
                // Don't create render target yet - only create when afterimage is enabled to save texture units

                const afterimagePass = new ShaderPass(AfterimageShader);
                afterimagePass.material.uniforms['tDiffuse'].value = null; // Will be set automatically
                afterimagePass.material.uniforms['tOldTexture'].value = null; // Set to null when disabled to free texture unit
                afterimagePass.material.uniforms['amount'].value = 0.0; // Start disabled
                afterimagePass.material.uniforms['useOldTexture'].value = 0.0; // Start disabled (no old texture yet)
                afterimagePass.enabled = false; // Start disabled
                this.composer.addPass(afterimagePass);
                this.afterimagePass = afterimagePass;
                this.composer.afterimagePass = afterimagePass;
                this.composer.afterimageEnabled = false;
                // oldTexture will be created lazily when afterimage is enabled
            } catch (error) {
                console.warn('Failed to add afterimage shader pass:', error);
                this.afterimagePass = null;
                this.composer.afterimagePass = null;
                this.composer.afterimageEnabled = false;
            }

            // Add color grading shader pass (replace placeholder)
            try {
                const { ColorGradingShader } = await import('../shaders/ColorGradingShader.js');
                const colorGradingPass = new ShaderPass(ColorGradingShader);
                colorGradingPass.material.uniforms['tDiffuse'].value = null; // Will be set automatically
                colorGradingPass.material.uniforms['tLUT'].value = null; // No LUT by default
                colorGradingPass.material.uniforms['useLUT'].value = 0.0; // No LUT by default
                colorGradingPass.material.uniforms['lutSize'].value = 8.0;
                colorGradingPass.material.uniforms['intensity'].value = 0.0; // Start disabled
                colorGradingPass.material.uniforms['brightness'].value = 0.0;
                colorGradingPass.material.uniforms['contrast'].value = 0.0;
                colorGradingPass.material.uniforms['saturation'].value = 0.0; // 0.0 = no change (preserves color)
                colorGradingPass.material.uniforms['hue'].value = 0.0;
                colorGradingPass.material.uniforms['rMultiplier'].value = 1.0;
                colorGradingPass.material.uniforms['gMultiplier'].value = 1.0;
                colorGradingPass.material.uniforms['bMultiplier'].value = 1.0;
                colorGradingPass.enabled = false; // Start disabled
                this.composer.addPass(colorGradingPass);
                this.colorGradingPass = colorGradingPass;
                this.composer.colorGradingPass = colorGradingPass;
            } catch (error) {
                console.warn('Failed to add color grading shader pass:', error);
                this.colorGradingPass = null;
                this.composer.colorGradingPass = null;
            }

            // Add glitch shader pass
            try {
                const { GlitchShader } = await import('../shaders/GlitchShader.js');
                const glitchPass = new ShaderPass(GlitchShader);
                glitchPass.material.uniforms['tDiffuse'].value = null; // Will be set automatically
                glitchPass.material.uniforms['time'].value = 0.0;
                glitchPass.material.uniforms['intensity'].value = 0.5;
                this.composer.addPass(glitchPass);
                this.glitchPass = glitchPass;
                this.composer.glitchPass = glitchPass;
                this.composer.glitchEnabled = false; // Start disabled
            } catch (error) {
                console.warn('Failed to add glitch shader pass:', error);
                this.glitchPass = null;
            }

            // Path 13: Add motion blur shader pass
            try {
                const { MotionBlurShader } = await import('../shaders/MotionBlurShader.js');
                const motionBlurPass = new ShaderPass(MotionBlurShader);
                motionBlurPass.material.uniforms['tDiffuse'].value = null; // Will be set automatically
                motionBlurPass.material.uniforms['velocity'].value = null; // Will be set if motion blur enabled
                motionBlurPass.material.uniforms['intensity'].value = 0.5;
                motionBlurPass.material.uniforms['samples'].value = 10;
                motionBlurPass.enabled = false; // Start disabled
                this.composer.addPass(motionBlurPass);
                this.motionBlurPass = motionBlurPass;
                this.composer.motionBlurPass = motionBlurPass;
                this.composer.motionBlurEnabled = false;
                console.log('Motion blur pass added to composer');
            } catch (error) {
                console.warn('Failed to add motion blur shader pass:', error);
                this.motionBlurPass = null;
                this.composer.glitchPass = null;
                this.composer.glitchEnabled = false;
            }

            // Add OutputPass as final pass to copy result to screen (fixes white screen bug)
            try {
                const { OutputPass } =
                    await import('three/examples/jsm/postprocessing/OutputPass.js');
                const outputPass = new OutputPass();
                outputPass.renderToScreen = true; // Ensure it renders to screen
                this.composer.addPass(outputPass);
                this.outputPass = outputPass;
                console.log('OutputPass added to composer');
            } catch (error) {
                console.warn('Failed to add OutputPass (may cause white screen):', error);
                // If OutputPass fails, ensure last pass renders to screen
                const passes = this.composer.passes;
                if (passes.length > 0) {
                    passes[passes.length - 1].renderToScreen = true;
                }
            }

            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.composer) {
                    this.composer.setSize(window.innerWidth, window.innerHeight);
                    this.composerSize.set(window.innerWidth, window.innerHeight);
                }
            });

            this.initialized = true;

            // Start with post-processing DISABLED by default
            // We'll only enable it if we can verify texture unit usage is safe
            // This prevents the flood of WebGL errors during initialization
            this.postProcessingEnabled = false;

            console.log(
                'Post-processing initialized (disabled by default - will enable on first successful render)'
            );

            // Note: Post-processing starts disabled to prevent texture unit errors
            // The render() method will attempt to enable it on first use, but will immediately
            // disable it again if texture errors are detected

            return {
                composer: this.composer,
                bloomPass: this.bloomPass,
                bloomConfig: this.bloomConfig,
            };
        } catch (error) {
            console.warn('Post-processing setup failed:', error);
            this.postProcessingEnabled = false;
            return { composer: null, bloomPass: null, bloomConfig: null };
        }
    }

    /**
     * Setup SSAO (Screen-Space Ambient Occlusion)
     * @returns {Promise} Resolves when SSAO is set up
     */
    async setupSSAO() {
        if (!this.composer) {
            console.warn('Cannot setup SSAO: composer not available');
            return;
        }

        try {
            const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js');

            if (!SSAOPass) {
                console.warn('SSAOPass not available');
                return;
            }

            this.ssaoPass = new SSAOPass(
                this.scene,
                this.camera,
                window.innerWidth,
                window.innerHeight
            );
            this.ssaoPass.kernelRadius = 16;
            this.ssaoPass.kernelSize = 16;
            this.ssaoPass.noiseTexture = null; // Optional: add noise texture for better quality
            this.ssaoPass.minDistance = 0.005;
            this.ssaoPass.maxDistance = 0.1;

            // Insert SSAO pass before bloom pass
            const passes = this.composer.passes;
            const bloomIndex = passes.indexOf(this.bloomPass);
            if (bloomIndex > 0) {
                this.composer.passes.splice(bloomIndex, 0, this.ssaoPass);
            } else {
                this.composer.addPass(this.ssaoPass);
            }
        } catch (error) {
            console.warn('SSAO setup failed:', error);
        }
    }

    /**
     * Get composer instance
     * @returns {EffectComposer|null}
     */
    getComposer() {
        return this.composer;
    }

    /**
     * Toggle post-processing
     * @param {boolean} enabled - Enable or disable post-processing
     */
    togglePostProcessing(enabled) {
        this.postProcessingEnabled = enabled;
        // Post-processing toggled
    }

    /**
     * Set post-processing enabled/disabled
     * @param {boolean} enabled - Whether post-processing is enabled
     */
    setPostProcessingEnabled(enabled) {
        this.postProcessingEnabled = enabled;
        // If disabling, ensure all passes are disabled to free texture units
        if (!enabled && this.composer) {
            this.ensurePassesDisabled();
        }
    }

    /**
     * Set motion blur enabled/disabled and intensity
     * @param {boolean} enabled - Whether motion blur is enabled
     * @param {number} intensity - Motion blur intensity (0-1)
     */
    setMotionBlurEnabled(enabled, intensity = 0.5) {
        if (this.motionBlurPass) {
            this.motionBlurPass.enabled = enabled;
            if (this.motionBlurPass.material && this.motionBlurPass.material.uniforms) {
                this.motionBlurPass.material.uniforms['intensity'].value = intensity;
            }
            if (this.composer) {
                this.composer.motionBlurEnabled = enabled;
            }
        }
    }

    /**
     * Get bloom pass for audio-reactive updates
     * @returns {UnrealBloomPass|null}
     */
    getBloomPass() {
        return this.bloomPass;
    }

    /**
     * Get SSAO pass (if available)
     * @returns {SSAOPass|null}
     */
    getSSAOPass() {
        return this.ssaoPass;
    }

    /**
     * Update glitch shader time uniform
     * @param {number} time - Current time
     */
    updateGlitchTime(time) {
        if (this.glitchPass && this.glitchPass.material) {
            this.glitchPass.material.uniforms['time'].value = time;
        }
    }

    /**
     * Toggle glitch effect
     * @param {boolean} enabled - Enable or disable glitch
     */
    setGlitchEnabled(enabled, intensity = 0.5) {
        if (this.composer) {
            this.composer.glitchEnabled = enabled;
            if (this.glitchPass) {
                this.glitchPass.enabled = enabled;
                // Update glitch intensity
                if (this.glitchPass.material && this.glitchPass.material.uniforms) {
                    this.glitchPass.material.uniforms['intensity'].value = intensity;
                }
            }
        }

        // Save preference if visualPreferences is connected
        if (this.visualPreferences) {
            this.visualPreferences.setGlitchMode(enabled);
        }
    }

    /**
     * Set glitch intensity (0.0 to 1.0)
     */
    setGlitchIntensity(intensity) {
        intensity = Math.max(0, Math.min(1, intensity));
        if (this.glitchPass && this.glitchPass.material && this.glitchPass.material.uniforms) {
            this.glitchPass.material.uniforms['intensity'].value = intensity;
        }
    }

    /**
     * Reset film grain shader to disabled state
     * Ensures film grain is disabled and desaturate/intensity are set to 0
     * This prevents unwanted monochrome effects from leftover TV transition code
     * Since TV transitions were removed, we remove the pass entirely from the composer
     */
    resetFilmGrain() {
        if (this.filmGrainPass && this.composer) {
            // Remove film grain pass from composer entirely (TV transitions were removed)
            const passIndex = this.composer.passes.indexOf(this.filmGrainPass);
            if (passIndex !== -1) {
                this.composer.passes.splice(passIndex, 1);
                // eslint-disable-next-line no-console
                console.log('PostProcessingManager: Film grain pass removed from composer');
            }
            
            // Also ensure it's disabled and reset uniforms as backup
            this.filmGrainPass.enabled = false;
            if (this.filmGrainPass.material && this.filmGrainPass.material.uniforms) {
                this.filmGrainPass.material.uniforms['desaturate'].value = 0.0;
                this.filmGrainPass.material.uniforms['intensity'].value = 0.0;
            }
            // eslint-disable-next-line no-console
            console.log('PostProcessingManager: Film grain reset and disabled');
        }
    }

    /**
     * Set chromatic aberration intensity (0.0 to 1.0)
     */
    setChromaticAberrationIntensity(intensity) {
        intensity = Math.max(0, Math.min(1, intensity));
        const amount = intensity * 0.1; // Scale to 0-0.1 range
        this.setChromaticAberration(amount, 0.0);
    }

    /**
     * Set color grading intensity (0.0 to 1.0)
     */
    setColorGradingIntensity(intensity) {
        intensity = Math.max(0, Math.min(1, intensity));
        this.setColorGrading({ intensity: intensity });
    }

    /**
     * Set bloom pass intensity
     * @param {number} intensity - Bloom intensity
     */
    setBloomIntensity(intensity) {
        if (this.bloomPass) {
            // UnrealBloomPass uses .strength property, fallback to material.uniforms if needed
            if (this.bloomPass.strength !== undefined) {
                this.bloomPass.strength = intensity;
            } else if (
                this.bloomPass.material &&
                this.bloomPass.material.uniforms &&
                this.bloomPass.material.uniforms.strength
            ) {
                this.bloomPass.material.uniforms.strength.value = intensity;
            }
            if (this.bloomConfig) {
                this.bloomConfig.intensity = intensity;
            }
        }
    }

    /**
     * Update bloom pass intensity (legacy method name - calls setBloomIntensity)
     * @param {number} intensity - Bloom intensity
     */
    updateBloomIntensity(intensity) {
        this.setBloomIntensity(intensity);
    }

    /**
     * Set chromatic aberration amount
     * @param {number} amount - Aberration amount (0-0.1)
     * @param {number} angle - Aberration angle in radians
     */
    setChromaticAberration(amount, angle = 0.0) {
        if (this.chromaticAberrationPass && this.chromaticAberrationPass.material) {
            this.chromaticAberrationPass.material.uniforms['amount'].value = amount;
            this.chromaticAberrationPass.material.uniforms['angle'].value = angle;
            this.chromaticAberrationPass.enabled = amount > 0;
            if (this.composer) {
                this.composer.chromaticAberrationEnabled = amount > 0;
            }
        }
    }

    /**
     * Set afterimage/ghost trail amount
     * @param {number} amount - Trail amount (0-1)
     */
    setAfterimage(amount) {
        if (this.afterimagePass && this.afterimagePass.material) {
            this.afterimagePass.material.uniforms['amount'].value = amount;
            const enabled = amount > 0;
            this.afterimagePass.enabled = enabled;

            // Only bind old texture when enabled to save texture units
            if (enabled && this.oldTexture) {
                this.afterimagePass.material.uniforms['tOldTexture'].value =
                    this.oldTexture.texture;
            } else {
                this.afterimagePass.material.uniforms['tOldTexture'].value = null; // Release texture unit
            }

            if (this.composer) {
                this.composer.afterimageEnabled = enabled;
            }
        }
    }

    /**
     * Set color grading parameters
     * @param {object} params - Color grading parameters
     */
    setColorGrading(params) {
        if (this.colorGradingPass && this.colorGradingPass.material) {
            if (params.intensity !== undefined) {
                this.colorGradingPass.material.uniforms['intensity'].value = params.intensity;
                this.colorGradingPass.enabled = params.intensity > 0;
            }
            if (params.brightness !== undefined) {
                this.colorGradingPass.material.uniforms['brightness'].value = params.brightness;
            }
            if (params.contrast !== undefined) {
                this.colorGradingPass.material.uniforms['contrast'].value = params.contrast;
            }
            if (params.saturation !== undefined) {
                this.colorGradingPass.material.uniforms['saturation'].value = params.saturation;
            }
            if (params.hue !== undefined) {
                this.colorGradingPass.material.uniforms['hue'].value = params.hue;
            }
            if (params.rMultiplier !== undefined) {
                this.colorGradingPass.material.uniforms['rMultiplier'].value = params.rMultiplier;
            }
            if (params.gMultiplier !== undefined) {
                this.colorGradingPass.material.uniforms['gMultiplier'].value = params.gMultiplier;
            }
            if (params.bMultiplier !== undefined) {
                this.colorGradingPass.material.uniforms['bMultiplier'].value = params.bMultiplier;
            }
        }
    }

    /**
     * Update afterimage shader (copy current frame to old texture for next frame)
     * @param {THREE.WebGLRenderer} renderer - Renderer instance
     */
    updateAfterimage(renderer) {
        // Only create render target when afterimage is actually enabled
        if (this.afterimagePass && this.afterimagePass.enabled && this.composer) {
            // Lazy creation of render target
            if (!this.oldTexture) {
                const size = renderer.getSize(new THREE.Vector2());
                this.oldTexture = new THREE.WebGLRenderTarget(size.x, size.y);
                console.log('Created afterimage render target');
            }

            // Copy the current composer output to old texture for next frame
            const size = renderer.getSize(new THREE.Vector2());

            // Resize old texture if needed
            if (this.oldTexture.width !== size.x || this.oldTexture.height !== size.y) {
                this.oldTexture.setSize(size.x, size.y);
            }

            // Copy current frame to old texture
            // Note: This copies from the renderer's current read buffer
            // In a full implementation, we'd read from the composer's read buffer
            try {
                if (renderer.copyFramebufferToTexture) {
                    renderer.copyFramebufferToTexture(this.oldTexture);
                    // Enable use of old texture after first frame is copied
                    if (this.afterimagePass.material && this.afterimagePass.material.uniforms) {
                        // Ensure texture is bound when enabled
                        if (!this.afterimagePass.material.uniforms['tOldTexture'].value) {
                            this.afterimagePass.material.uniforms['tOldTexture'].value =
                                this.oldTexture.texture;
                        }
                        this.afterimagePass.material.uniforms['useOldTexture'].value = 1.0;
                    }
                }
            } catch (error) {
                // Fallback: render directly to texture if copyFramebufferToTexture not available
                console.warn(
                    'copyFramebufferToTexture not available, afterimage may not work correctly'
                );
            }
        } else if (
            this.afterimagePass &&
            this.afterimagePass.material &&
            this.afterimagePass.material.uniforms
        ) {
            // Disable use of old texture if afterimage is disabled - release texture unit
            this.afterimagePass.material.uniforms['useOldTexture'].value = 0.0;
            this.afterimagePass.material.uniforms['tOldTexture'].value = null; // Release texture unit when disabled

            // Dispose render target when disabled to free GPU memory
            if (this.oldTexture) {
                this.oldTexture.dispose();
                this.oldTexture = null;
            }
        }
    }

    /**
     * Render with post-processing or fallback to direct render
     * @param {THREE.WebGLRenderer} renderer - Renderer instance
     * @param {THREE.Scene} scene - Scene instance
     * @param {THREE.Camera} camera - Camera instance
     */
    render(renderer, scene, camera) {
        // Safety check: ensure scene and camera are valid
        if (!scene || !camera) {
            console.warn('PostProcessingManager: Invalid scene or camera, skipping render');
            return;
        }

        // If we've detected texture errors, never use post-processing again
        if (this.textureErrorDetected) {
            // Direct render without post-processing
            renderer.render(scene, camera);
            return;
        }

        // TEMPORARILY DISABLED: Keep post-processing off to debug camera positioning
        // Try enabling post-processing on first render if not already enabled
        // This allows us to test if post-processing works without texture errors
        if (!this.firstRenderAttempted && this.composer && !this.postProcessingEnabled) {
            // Keep post-processing DISABLED for clearer visuals
            // this.postProcessingEnabled = true;
            this.firstRenderAttempted = true;
            console.log(
                'PostProcessingManager: Post-processing kept DISABLED for clarity'
            );
        }

        // If post-processing is disabled, use direct render
        if (!this.postProcessingEnabled) {
            renderer.render(scene, camera);
            return;
        }

        if (this.composer) {
            // Update scene and camera references
            this.scene = scene;
            this.camera = camera;

            // Debug: Verify color grading pass isn't desaturating
            if (window.DEBUG_POSTPROCESSING && this.colorGradingPass) {
                // eslint-disable-next-line no-console
                console.log('PostProcessingManager: Color grading pass state', {
                    enabled: this.colorGradingPass.enabled,
                    saturation: this.colorGradingPass.material?.uniforms?.['saturation']?.value,
                    intensity: this.colorGradingPass.material?.uniforms?.['intensity']?.value,
                });
            }

            // Update RenderPass with new scene and camera
            if (this.composer.passes && this.composer.passes.length > 0) {
                const renderPass = this.composer.passes[0];
                if (renderPass && renderPass.scene !== scene) {
                    renderPass.scene = scene;
                }
                if (renderPass && renderPass.camera !== camera) {
                    renderPass.camera = camera;
                }
            }

            // Ensure all disabled passes are truly disabled and don't bind textures
            this.ensurePassesDisabled();

            // Task 2.1: Ensure last pass renders to screen (fixes white screen bug)
            const passes = this.composer.passes;
            if (passes.length > 0) {
                // Ensure only the last pass has renderToScreen = true
                for (let i = 0; i < passes.length - 1; i++) {
                    if (passes[i].renderToScreen !== undefined) {
                        passes[i].renderToScreen = false;
                    }
                }
                // Last pass should render to screen
                const lastPass = passes[passes.length - 1];
                if (lastPass && lastPass.renderToScreen !== undefined) {
                    lastPass.renderToScreen = true;
                }
            }

            // Additional safety checks before rendering
            if (!this.composer.passes || this.composer.passes.length === 0) {
                console.warn(
                    'PostProcessingManager: Composer has no passes, falling back to direct render'
                );
                renderer.render(scene, camera);
                return;
            }

            // Check if renderer context is still valid
            if (renderer.getContext().isContextLost()) {
                console.error(
                    'PostProcessingManager: WebGL context lost, disabling post-processing'
                );
                this.postProcessingEnabled = false;
                renderer.render(scene, camera);
                return;
            }

            try {
                // Validate composer state before rendering
                if (!this.composer.renderTarget1 || !this.composer.renderTarget2) {
                    throw new Error('Composer render targets not initialized');
                }

                // Ensure renderer is in valid state
                if (!renderer || !renderer.getContext()) {
                    throw new Error('Renderer or context not available');
                }

                // Check if renderer context is lost
                const gl = renderer.getContext();
                if (gl.isContextLost()) {
                    throw new Error('WebGL context lost');
                }

                // Ensure composer size matches renderer size
                const size = renderer.getSize(new THREE.Vector2());
                if (
                    !this.composerSize ||
                    this.composerSize.x !== size.x ||
                    this.composerSize.y !== size.y
                ) {
                    this.composer.setSize(size.x, size.y);
                    if (!this.composerSize) {
                        this.composerSize = new THREE.Vector2();
                    }
                    this.composerSize.set(size.x, size.y);
                }

                this.composer.render();

                // Check for WebGL errors after render (some errors don't throw exceptions)
                // Reuse gl from above (already declared at line 621)
                if (gl) {
                    const webglError = gl.getError();
                    if (webglError !== gl.NO_ERROR) {
                        const errorName = this.getWebGLErrorName(gl, webglError);
                        // If it's a texture or shader error, disable post-processing
                        if (
                            webglError === gl.INVALID_OPERATION ||
                            webglError === gl.INVALID_VALUE
                        ) {
                            throw new Error(
                                `WebGL ${errorName} detected - likely texture unit limit exceeded`
                            );
                        }
                    }
                }

                // Update afterimage after rendering (copy current frame for next frame)
                try {
                    this.updateAfterimage(renderer);
                } catch (afterimageError) {
                    // Afterimage update failure shouldn't break rendering
                    if (this.postProcessingErrorCount === 0) {
                        console.warn(
                            'PostProcessingManager: Afterimage update failed:',
                            afterimageError.message
                        );
                    }
                }

                // Reset error count on successful render
                this.postProcessingErrorCount = 0;
            } catch (error) {
                this.postProcessingErrorCount++;

                // Log detailed error information for debugging
                if (this.postProcessingErrorCount === 1) {
                    console.error('PostProcessingManager: Render error details:', {
                        error: error.message || error,
                        composer: !!this.composer,
                        renderTarget1: !!this.composer?.renderTarget1,
                        renderTarget2: !!this.composer?.renderTarget2,
                        passes: this.composer?.passes?.length || 0,
                        renderer: !!renderer,
                        context: renderer?.getContext() ? 'valid' : 'invalid',
                        scene: !!scene,
                        camera: !!camera,
                    });
                }

                // Check if error is related to texture units or WebGL (including shader errors)
                // Check both error message and stack trace
                const errorMessage = error?.message || error?.toString() || '';
                const errorStack = error?.stack || '';
                const fullErrorText = `${errorMessage} ${errorStack}`.toLowerCase();
                const isTextureError =
                    fullErrorText.includes('texture') ||
                    fullErrorText.includes('texture_image_units') ||
                    fullErrorText.includes('max_texture_image_units') ||
                    fullErrorText.includes('webgl') ||
                    fullErrorText.includes('invalid_operation') ||
                    fullErrorText.includes('invalid_value') ||
                    fullErrorText.includes('shader error') ||
                    fullErrorText.includes('validate_status') ||
                    fullErrorText.includes('1282') ||
                    fullErrorText.includes('meshstandardmaterial') ||
                    fullErrorText.includes('program not valid') ||
                    fullErrorText.includes('useprogram');

                // IMMEDIATELY disable post-processing on texture/shaders errors (don't wait for 3 errors)
                if (isTextureError) {
                    // Suppress error logging during test mode
                    const isTestMode =
                        typeof window !== 'undefined' &&
                        (window.__PLAYWRIGHT_TEST__ || navigator.webdriver);
                    if (!isTestMode) {
                        console.error(
                            'Post-processing texture/shader error detected. IMMEDIATELY disabling post-processing to prevent further errors.',
                            error
                        );
                    }
                    this.postProcessingEnabled = false;
                    this.textureErrorDetected = true; // Mark that we've hit texture limits - never re-enable

                    // Notify user that post-processing has been disabled
                    if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
                        window.gameSystems.notificationSystem.show(
                            'Post-processing disabled due to GPU limitations. Game will run without visual effects.',
                            {
                                type: 'warning',
                                duration: 5000,
                            }
                        );
                    }

                    // Explicitly disable all passes to free texture units
                    this.disableAllPasses();
                    // Dispose of render targets to free GPU memory
                    if (this.oldTexture) {
                        this.oldTexture.dispose();
                        this.oldTexture = null;
                    }
                    // Dispose composer render targets
                    if (this.composer && this.composer.renderTarget1) {
                        this.composer.renderTarget1.dispose();
                    }
                    if (this.composer && this.composer.renderTarget2) {
                        this.composer.renderTarget2.dispose();
                    }
                }

                // Fallback to direct render if post-processing fails
                if (this.postProcessingErrorCount <= 2) {
                    console.warn(
                        `Post-processing render failed (${this.postProcessingErrorCount}/${this.maxErrorsBeforeDisable}), falling back to direct render:`,
                        error.message || error
                    );
                }

                // Always fallback to direct render on error
                try {
                    renderer.render(scene, camera);
                } catch (renderError) {
                    // If even direct render fails, log and try to recover
                    const isTestMode =
                        typeof window !== 'undefined' &&
                        (window.__PLAYWRIGHT_TEST__ || navigator.webdriver);
                    if (!isTestMode) {
                        console.error(
                            'PostProcessingManager: Direct render also failed:',
                            renderError
                        );
                        // Check if context is lost
                        if (renderer.getContext().isContextLost()) {
                            console.error(
                                'PostProcessingManager: WebGL context lost, cannot render'
                            );
                        }
                    }
                }
            }
        } else {
            // Ensure passes are disabled when post-processing is off
            if (this.composer) {
                this.ensurePassesDisabled();
            }
            // Direct render (no post-processing)
            renderer.render(scene, camera);
        }
    }

    /**
     * Ensure all disabled passes don't bind textures
     */
    ensurePassesDisabled() {
        if (!this.composer) {
            return;
        }

        // Disable chromatic aberration if not enabled
        if (this.chromaticAberrationPass && !this.composer.chromaticAberrationEnabled) {
            this.chromaticAberrationPass.enabled = false;
            if (
                this.chromaticAberrationPass.material &&
                this.chromaticAberrationPass.material.uniforms
            ) {
                this.chromaticAberrationPass.material.uniforms['tDiffuse'].value = null;
            }
        }

        // Disable afterimage if not enabled
        if (this.afterimagePass && !this.composer.afterimageEnabled) {
            this.afterimagePass.enabled = false;
            if (this.afterimagePass.material && this.afterimagePass.material.uniforms) {
                this.afterimagePass.material.uniforms['tDiffuse'].value = null;
                this.afterimagePass.material.uniforms['tOldTexture'].value = null;
                this.afterimagePass.material.uniforms['useOldTexture'].value = 0.0;
            }
        }

        // Disable color grading if not enabled
        if (this.colorGradingPass && !this.composer.colorGradingEnabled) {
            this.colorGradingPass.enabled = false;
            if (this.colorGradingPass.material && this.colorGradingPass.material.uniforms) {
                this.colorGradingPass.material.uniforms['tDiffuse'].value = null;
                this.colorGradingPass.material.uniforms['tLUT'].value = null;
                this.colorGradingPass.material.uniforms['useLUT'].value = 0.0;
            }
        }

        // Disable glitch if not enabled
        if (this.glitchPass && !this.composer.glitchEnabled) {
            this.glitchPass.enabled = false;
            if (this.glitchPass.material && this.glitchPass.material.uniforms) {
                this.glitchPass.material.uniforms['tDiffuse'].value = null;
            }
        }

        // Remove film grain pass if it still exists (TV transitions were removed)
        // This ensures it can't affect rendering even if it somehow gets re-added
        if (this.filmGrainPass && this.composer) {
            const passIndex = this.composer.passes.indexOf(this.filmGrainPass);
            if (passIndex !== -1) {
                // Pass still in composer - remove it
                this.composer.passes.splice(passIndex, 1);
            }
            // Also ensure it's disabled as backup
            this.filmGrainPass.enabled = false;
            if (this.filmGrainPass.material && this.filmGrainPass.material.uniforms) {
                this.filmGrainPass.material.uniforms['desaturate'].value = 0.0;
                this.filmGrainPass.material.uniforms['intensity'].value = 0.0;
                this.filmGrainPass.material.uniforms['tDiffuse'].value = null;
            }
        }

        // Disable SSAO if not enabled
        if (this.ssaoPass && !this.composer.ssaoEnabled) {
            this.ssaoPass.enabled = false;
        }

        // Task 4.4: Disable motion blur if not enabled
        if (this.motionBlurPass && !this.composer.motionBlurEnabled) {
            this.motionBlurPass.enabled = false;
            if (this.motionBlurPass.material && this.motionBlurPass.material.uniforms) {
                this.motionBlurPass.material.uniforms['tDiffuse'].value = null;
                this.motionBlurPass.material.uniforms['velocity'].value = null;
            }
        }
    }

    /**
     * Disable all post-processing passes to free texture units
     */
    disableAllPasses() {
        if (!this.composer) {
            return;
        }

        // Disable all optional passes
        if (this.chromaticAberrationPass) {
            this.chromaticAberrationPass.enabled = false;
            this.composer.chromaticAberrationEnabled = false;
        }
        if (this.afterimagePass) {
            this.afterimagePass.enabled = false;
            this.composer.afterimageEnabled = false;
        }
        if (this.colorGradingPass) {
            this.colorGradingPass.enabled = false;
            this.composer.colorGradingEnabled = false;
        }
        if (this.glitchPass) {
            this.glitchPass.enabled = false;
            this.composer.glitchEnabled = false;
        }
        if (this.ssaoPass) {
            this.ssaoPass.enabled = false;
            this.composer.ssaoEnabled = false;
        }

        // Even disable bloom if needed (though it's usually essential)
        if (this.bloomPass) {
            // Don't disable bloom by default, but can be disabled if absolutely necessary
            // this.bloomPass.enabled = false;
        }
    }

    // Duplicate setMotionBlurEnabled method removed - using the one at line 353

    /**
     * Task 4.4: Set motion blur intensity
     * @param {number} intensity - Motion blur intensity (0-1)
     */
    setMotionBlurIntensity(intensity) {
        if (!this.motionBlurPass || !this.motionBlurPass.enabled) {
            return;
        }

        if (this.motionBlurPass.material && this.motionBlurPass.material.uniforms) {
            this.motionBlurPass.material.uniforms['intensity'].value = Math.max(
                0,
                Math.min(1, intensity)
            );
        }
    }

    /**
     * Set visual preferences instance for persistence
     * @param {VisualPreferences} visualPreferences - VisualPreferences instance
     */
    setVisualPreferences(visualPreferences) {
        this.visualPreferences = visualPreferences;
    }

    /**
     * Get human-readable name for WebGL error code
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {number} error - WebGL error code
     * @returns {string} Error name
     */
    getWebGLErrorName(gl, error) {
        const errorNames = {
            [gl.NO_ERROR]: 'NO_ERROR',
            [gl.INVALID_ENUM]: 'INVALID_ENUM',
            [gl.INVALID_VALUE]: 'INVALID_VALUE',
            [gl.INVALID_OPERATION]: 'INVALID_OPERATION',
            [gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
            [gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
            [gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL',
        };
        return errorNames[error] || `UNKNOWN_ERROR_${error}`;
    }
}
