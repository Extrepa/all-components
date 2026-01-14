/**
 * ResizeHandler - Handles window resize events
 *
 * Extracted from main.js for better organization.
 */

/**
 * Setup resize handler
 * @param {THREE.Camera} camera - Three.js camera
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {EffectComposer} composer - Post-processing composer (optional)
 * @returns {Function} Cleanup function to remove event listener
 */
export function setupResizeHandler(camera, renderer, composer = null) {
    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Update camera aspect ratio
        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        // Update renderer size
        if (renderer) {
            renderer.setSize(width, height);
        }

        // Update post-processing composer size
        if (composer) {
            composer.setSize(width, height);
        }
    };

    window.addEventListener('resize', handleResize);

    // Return cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}
