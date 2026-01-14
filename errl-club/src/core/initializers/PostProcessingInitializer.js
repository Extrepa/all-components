/**
 * PostProcessingInitializer - Handles post-processing setup (bloom, effects, etc.)
 *
 * Extracted from main.js for better organization.
 */

import * as THREE from 'three';

/**
 * Setup post-processing effects (bloom, output pass, etc.)
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Camera} camera - Three.js camera
 * @returns {Promise<Object>} Promise resolving to {composer, bloomPass, bloomConfig} or null values on error
 */
export async function setupPostProcessing(renderer, scene, camera) {
    try {
        const { EffectComposer } =
            await import('three/examples/jsm/postprocessing/EffectComposer.js');
        const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
        const { UnrealBloomPass } =
            await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');

        // Create render target with proper format for alpha support
        const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
        });

        const composer = new EffectComposer(renderer, renderTarget);

        // Render pass - renders the scene
        const renderPass = new RenderPass(scene, camera);
        renderPass.clearAlpha = 0;
        composer.addPass(renderPass);

        // Bloom post-processing with reduced intensity
        const bloomConfig = {
            intensity: 0.8, // Reduced from 1.5
            threshold: 0.5, // Increased from 0.4
            radius: 0.4, // Reduced from 0.8
        };

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomConfig.intensity,
            bloomConfig.radius,
            bloomConfig.threshold
        );
        composer.addPass(bloomPass);

        // Output pass - converts to sRGB colorspace (required for proper display)
        const outputPass = new OutputPass();
        composer.addPass(outputPass);

        console.log('Post-processing enabled with bloom');

        return { composer, bloomPass, bloomConfig };
    } catch (error) {
        console.warn('Post-processing setup failed:', error);
        console.log('Continuing without post-processing');
        return { composer: null, bloomPass: null, bloomConfig: null };
    }
}

/**
 * Create a toggle function for post-processing
 * @param {Object} state - State object with {postProcessingEnabled}
 * @returns {Function} Toggle function
 */
export function createPostProcessingToggle(state) {
    return function (enabled) {
        state.postProcessingEnabled = enabled;
        console.log('Post-processing:', enabled ? 'enabled' : 'disabled');
    };
}
