/**
 * CollectiblesUpdater - Handles collectibles and collection UI updates
 *
 * Extracted from main.js's animate() function for better organization.
 */

/**
 * Update collectibles and collection progress UI
 * @param {Object} params - Parameters
 * @param {Object} params.collectibleManager - Collectible manager instance
 * @param {Object} params.avatar - Avatar instance
 * @param {number} params.deltaTime - Frame delta time
 * @param {number} params.elapsedTime - Total elapsed time
 * @param {Object} params.collectionGoalsUI - Collection goals UI
 */
export function updateCollectibles({
    collectibleManager,
    avatar,
    deltaTime,
    elapsedTime,
    collectionGoalsUI,
}) {
    if (!collectibleManager) {
        return;
    }

    // Step 206: Screen ripple callback for bubble pops
    const screenRippleCallback = (position) => {
        // Could trigger screen ripple effect here
        // Only log in debug mode to avoid flooding test logs
        if (window.DEBUG_COLLECTIBLES) {
            console.log('Bubble popped at:', position);
        }
    };
    collectibleManager.update(deltaTime, avatar, elapsedTime, screenRippleCallback);

    // Task 4.1: Update CollectionGoalsUI progress when collections occur
    if (collectionGoalsUI && window.gameSystems?.collectionTracker) {
        collectionGoalsUI.updateProgress();
    }

    // Step 208: Update fragment progress bar
    const stats = collectibleManager.getStats();
    const fragmentProgress = document.getElementById('fragment-progress');
    const fragmentCount = document.getElementById('fragment-count');
    if (fragmentProgress && fragmentCount) {
        if (stats.fragments > 0) {
            fragmentProgress.style.display = 'block';
            fragmentCount.textContent = stats.fragments;
            const progressFill = fragmentProgress.querySelector('.progress-fill');
            if (progressFill) {
                // Assuming 10 fragments total for progress calculation
                const maxFragments = 10;
                const progress = (stats.fragments / maxFragments) * 100;
                progressFill.style.width = progress + '%';
            }
        }
    }
}
