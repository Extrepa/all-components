/**
 * PostProcessingEffectsInitializer - Handles post-processing effects setup (SSAO, etc.)
 *
 * This module extracts post-processing effects initialization from main.js.
 */

/**
 * Setup Screen-Space Ambient Occlusion (SSAO) pass
 * @param {EffectComposer} composer - Post-processing composer
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Camera} camera - Three.js camera
 * @returns {Promise<SSAOPass|null>} SSAO pass or null if setup fails
 */
export async function setupSSAO(composer, scene, camera) {
    if (!composer || !scene || !camera) {
        return null;
    }

    try {
        const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js');

        const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 16;
        ssaoPass.kernelSize = 32;
        ssaoPass.noiseTexture = null; // Will use default noise
        // DISABLED: SSAO was causing rendering issues (either monochrome or no geometry visible)
        // When OUTPUT.SSAO - scene was monochrome (only SSAO texture)
        // When OUTPUT.Default - scene had no geometry visible (just bloom)
        // Disable SSAO pass until we figure out the correct configuration
        ssaoPass.enabled = false;
        ssaoPass.output = SSAOPass.OUTPUT.Default;

        // Insert before bloom pass
        const passes = composer.passes;
        const bloomIndex = passes.findIndex((p) => p.constructor.name === 'UnrealBloomPass');
        if (bloomIndex > 0) {
            composer.passes.splice(bloomIndex, 0, ssaoPass);
        } else {
            composer.addPass(ssaoPass);
        }

        console.log('SSAO pass added (disabled - was causing rendering issues)');
        return ssaoPass;
    } catch (error) {
        console.warn('SSAO setup failed (may not be available):', error);
        return null;
    }
}
