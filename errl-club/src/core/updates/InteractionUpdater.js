/**
 * InteractionUpdater - Handles interaction system updates
 *
 * Extracted from main.js's animate() function for better organization.
 */

/**
 * Update interaction system and reticle
 * @param {Object} params - Parameters
 * @param {Object} params.interactionSystem - Interaction system instance
 * @param {THREE.Camera} params.camera - Camera instance
 * @param {Object} params.avatar - Avatar instance
 */
export function updateInteraction({ interactionSystem, camera, avatar }) {
    if (!interactionSystem) {
        return;
    }

    // Step 168: Update interaction system (raycast for interactables)
    interactionSystem.update(camera, avatar);

    // Step 169: Show/hide reticle based on interaction target
    const reticle = document.getElementById('reticle');
    if (reticle) {
        if (interactionSystem.hasTarget()) {
            reticle.style.display = 'block';
        } else {
            reticle.style.display = 'none';
        }
    }
}
