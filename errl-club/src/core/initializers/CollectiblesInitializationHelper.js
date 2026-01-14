/**
 * CollectiblesInitializationHelper - Handles collectibles system initialization
 *
 * Extracted from main.js's initAudio() function.
 */

import { ROOM_SIZE } from '../../config/constants.js';

/**
 * Initialize CollectionTracker
 * @param {SettingsManager} settingsManager - Settings manager instance
 * @returns {Promise<Object|null>} Promise resolving to CollectionTracker or null
 */
export async function initializeCollectionTracker(settingsManager) {
    if (!settingsManager) {
        return null;
    }

    if (!window.gameSystems) {
        window.gameSystems = {};
    }

    if (window.gameSystems.collectionTracker) {
        return window.gameSystems.collectionTracker;
    }

    try {
        const { CollectionTracker } = await import('../../systems/CollectionTracker.js');
        window.gameSystems.collectionTracker = new CollectionTracker(settingsManager);
        console.log('CollectionTracker initialized');
        return window.gameSystems.collectionTracker;
    } catch (error) {
        console.warn('Failed to load CollectionTracker:', error);
        return null;
    }
}

/**
 * Initialize CollectibleManager and spawn collectibles
 * @param {THREE.Scene} scene - Three.js scene
 * @param {AudioContext} audioContext - Web Audio context
 * @param {Object} collectionTracker - CollectionTracker instance (optional)
 * @param {LoopManager} loopManager - Optional LoopManager for self-registration
 * @returns {CollectibleManager|null} CollectibleManager instance or null
 */
export async function initializeCollectibleManager(
    scene,
    audioContext,
    collectionTracker = null,
    loopManager = null
) {
    if (!audioContext) {
        return null;
    }

    try {
        const { CollectibleManager } = await import('../../collectibles/CollectibleManager.js');

        // Get collection tracker from window if not provided
        if (!collectionTracker && window.gameSystems?.collectionTracker) {
            collectionTracker = window.gameSystems.collectionTracker;
        }

        const collectibleManager = new CollectibleManager(
            scene,
            audioContext,
            collectionTracker,
            loopManager
        );

        // Connect collection tracker if it's initialized later
        if (!collectionTracker && window.gameSystems?.collectionTracker) {
            collectibleManager.setCollectionTracker(window.gameSystems.collectionTracker);
        }

        // Spawn collectibles sparingly - make them rare and special
        collectibleManager.spawnDrips(3, {
            width: ROOM_SIZE * 0.8,
            depth: ROOM_SIZE * 0.8,
            height: 1.0,
        });
        collectibleManager.spawnBubbles(2, {
            width: ROOM_SIZE * 0.8,
            depth: ROOM_SIZE * 0.8,
            height: 2.0,
        });
        collectibleManager.spawnFragments(1, {
            width: ROOM_SIZE * 0.8,
            depth: ROOM_SIZE * 0.8,
            height: 1.5,
        });
        collectibleManager.spawnGlowBalls(1, {
            width: ROOM_SIZE * 0.8,
            depth: ROOM_SIZE * 0.8,
            height: 1.5,
        });

        console.log('CollectibleManager initialized');
        return collectibleManager;
    } catch (error) {
        console.warn('Failed to initialize CollectibleManager:', error);
        return null;
    }
}
