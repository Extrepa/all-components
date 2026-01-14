/**
 * InteractionRegistrationHelper - Helper functions for registering interactable objects
 *
 * This module extracts interaction registration logic from main.js.
 */

/**
 * Register DJ screen as interactable
 * @param {THREE.Mesh} djScreen - The DJ screen mesh
 * @param {Object} interactionSystem - Interaction system instance
 * @param {THREE.Material} screenMaterial - Screen material for reactive effects
 */
export function registerDJScreenInteractable(djScreen, interactionSystem, screenMaterial) {
    if (!djScreen || !interactionSystem) {
        return;
    }

    interactionSystem.registerInteractable(djScreen, () => {
        console.log('Interacted with DJ screen!');
        // Could trigger screen pattern change, visual effect, etc.
        if (screenMaterial && screenMaterial.emissiveIntensity !== undefined) {
            screenMaterial.emissiveIntensity = Math.min(
                2.0,
                screenMaterial.emissiveIntensity + 0.5
            );
            setTimeout(() => {
                if (screenMaterial && screenMaterial.emissiveIntensity !== undefined) {
                    screenMaterial.emissiveIntensity = 0.5;
                }
            }, 1000);
        }
    });
}
