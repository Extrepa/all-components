/**
 * UnifiedInitializer - Consolidates all initialization calls
 *
 * This is a bridge between main.js's current initialization and GameInitializer.
 * It consolidates initialization calls to make migration to GameInitializer easier (A6).
 */

/**
 * Initialize all game systems in a unified way
 * @param {Object} params - Initialization parameters
 * @returns {Promise<Object>} Initialized systems
 */
export async function initializeAllSystems({
    canvas,
    scene,
    camera,
    renderer,
    mainMenu,
    updateProgress,
}) {
    const systems = {};

    // Initialize core game systems (avatar, particle system, collision system, presets)
    const { initializeGameSystems } = await import('./GameSystemsInitializer.js');

    const avatarInitialPosition = new THREE.Vector3(0, 0.5, 5); // AVATAR_RADIUS will be imported
    const { AVATAR_RADIUS, ROOM_SIZE } = await import('../../config/constants.js');

    const ROOM_BOUNDS = {
        minX: -ROOM_SIZE / 2 + AVATAR_RADIUS,
        maxX: ROOM_SIZE / 2 - AVATAR_RADIUS,
        minZ: -ROOM_SIZE / 2 + AVATAR_RADIUS,
        maxZ: ROOM_SIZE / 2 - AVATAR_RADIUS,
    };

    const gameSystems = initializeGameSystems({
        scene,
        avatarInitialPosition,
        updateProgress,
        ROOM_SIZE,
        ROOM_BOUNDS,
        AVATAR_RADIUS,
    });

    // Extract initialized systems
    systems.avatar = gameSystems.avatar;
    systems.particleSystem = gameSystems.particleSystem;
    systems.particlePresets = gameSystems.particlePresets;
    systems.screenEffectsPresets = gameSystems.screenEffectsPresets;
    systems.postProcessingPresets = gameSystems.postProcessingPresets;
    systems.collisionSystem = gameSystems.collisionSystem;

    return systems;
}
