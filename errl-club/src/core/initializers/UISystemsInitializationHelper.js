/**
 * UISystemsInitializationHelper - Handles UI systems initialization
 *
 * Extracted from main.js's initAudio() function.
 */

/**
 * Initialize CollectionGoalsUI
 * @param {SettingsManager} settingsManager - Settings manager instance
 * @returns {Promise<Object|null>} Promise resolving to CollectionGoalsUI or null
 */
export async function initializeCollectionGoalsUI(settingsManager) {
    if (!settingsManager) {
        return null;
    }

    try {
        const { CollectionGoalsUI } = await import('../../ui/CollectionGoalsUI.js');
        const collectionGoalsUI = new CollectionGoalsUI({
            collectionTracker: window.gameSystems?.collectionTracker,
            achievementSystem: window.gameSystems?.achievementSystem,
        });
        document.body.appendChild(collectionGoalsUI.container);
        console.log('CollectionGoalsUI initialized');
        return collectionGoalsUI;
    } catch (error) {
        console.warn('Failed to load CollectionGoalsUI:', error);
        return null;
    }
}

/**
 * Initialize AssetAttributionPanel
 * @param {Object} codexAssetIntegration - CodexAssetIntegration instance
 * @returns {Promise<Object|null>} Promise resolving to AssetAttributionPanel or null
 */
export async function initializeAssetAttributionPanel(codexAssetIntegration) {
    if (!codexAssetIntegration) {
        return null;
    }

    try {
        const { AssetAttributionPanel } = await import('../../ui/AssetAttributionPanel.js');
        const assetAttributionPanel = new AssetAttributionPanel({
            codexAssetIntegration: codexAssetIntegration,
        });
        document.body.appendChild(assetAttributionPanel.container);
        console.log('AssetAttributionPanel initialized');
        return assetAttributionPanel;
    } catch (error) {
        console.warn('Failed to load AssetAttributionPanel:', error);
        return null;
    }
}

/**
 * Initialize ReplayLibraryUI
 * @param {Object} replayLibrary - ReplayLibrary instance
 * @param {Object} replaySystem - ReplaySystem instance
 * @returns {Promise<Object|null>} Promise resolving to ReplayLibraryUI or null
 */
export async function initializeReplayLibraryUI(replayLibrary, replaySystem) {
    if (!replayLibrary || !replaySystem) {
        return null;
    }

    if (window.replayLibraryUI) {
        return window.replayLibraryUI;
    }

    try {
        const { ReplayLibraryUI } = await import('../../ui/ReplayLibraryUI.js');
        window.replayLibraryUI = new ReplayLibraryUI({
            replayLibrary: replayLibrary,
            replaySystem: replaySystem,
        });
        document.body.appendChild(window.replayLibraryUI.container);
        console.log('ReplayLibraryUI initialized');
        return window.replayLibraryUI;
    } catch (error) {
        console.warn('Failed to load ReplayLibraryUI:', error);
        return null;
    }
}
