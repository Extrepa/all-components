/**
 * PostProcessingUpdater - Handles post-processing effects updates
 *
 * Extracted from main.js's animate() function for better organization.
 */

/**
 * Update post-processing effects including motion blur and bloom
 * @param {Object} params - Parameters
 * @param {EffectComposer} params.composer - Post-processing composer
 * @param {Object} params.cameraController - Camera controller
 * @param {Object} params.bloomPass - Bloom pass
 * @param {Object} params.frequencyBands - Frequency bands object
 * @param {Object} params.frequencyExtractor - Frequency extractor
 * @param {Object} params.vibeMeter - Vibe meter
 * @param {number} params.deltaTime - Frame delta time
 * @param {Object} params.codexAssetIntegration - Codex asset integration
 * @param {THREE.Vector3} params.avatarPosition - Avatar position
 */
export function updatePostProcessing({
    composer,
    cameraController,
    bloomPass,
    frequencyBands,
    frequencyExtractor,
    vibeMeter,
    deltaTime,
    codexAssetIntegration,
    avatarPosition,
}) {
    // Task 4.4: Update motion blur based on camera settings
    if (composer && cameraController && cameraController.settings) {
        const motionBlurEnabled =
            cameraController.settings.currentSettings.motionBlurEnabled || false;
        // Calculate intensity based on camera intensity preset
        let motionBlurIntensity = 0.5;
        if (cameraController.settings.currentPreset === 'high') {
            motionBlurIntensity = 1.0;
        } else if (cameraController.settings.currentPreset === 'medium') {
            motionBlurIntensity = 0.5;
        } else {
            motionBlurIntensity = 0.0;
        }

        // Update motion blur if available
        if (composer.motionBlurPass) {
            if (composer.motionBlurEnabled !== motionBlurEnabled) {
                composer.motionBlurPass.enabled = motionBlurEnabled;
                composer.motionBlurEnabled = motionBlurEnabled;
                if (composer.motionBlurPass.material && composer.motionBlurPass.material.uniforms) {
                    composer.motionBlurPass.material.uniforms['intensity'].value =
                        motionBlurIntensity;
                }
            }
        }
    }

    // Codex Enhancement: Camera-triggered vignettes (bloom boost when near assets)
    // Update vignette boost amount for use in bloom calculation
    if (codexAssetIntegration && avatarPosition) {
        const nearbyAssets = codexAssetIntegration.getNearbyAssets(avatarPosition, 5);
        if (nearbyAssets.length > 0) {
            // Calculate boost based on proximity (closer = more boost)
            const closestAsset = nearbyAssets.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
            const proximityFactor = 1.0 - closestAsset.distance / 5.0; // 0-1 based on distance
            window.codexVignetteBoost = proximityFactor * 0.4; // Up to 0.4 boost
        } else {
            // Fade out vignette boost
            window.codexVignetteBoost = Math.max(
                0,
                (window.codexVignetteBoost || 0) - deltaTime * 0.5
            );
        }
    } else {
        window.codexVignetteBoost = Math.max(0, (window.codexVignetteBoost || 0) - deltaTime * 0.5);
    }

    // Step 259: Map bass intensity to bloom strength
    // Step 276: Increase bloom or aura brightness as vibe meter fills
    if (bloomPass && frequencyExtractor && frequencyBands) {
        const baseBloom = 1.5;
        const bloomMultiplier = 0.8;
        const bassIntensity = frequencyBands.bass || 0;
        let vibeMultiplier = 1.0;

        // Step 276: Add vibe meter contribution to bloom
        if (vibeMeter) {
            const vibeLevel = vibeMeter.getVibeLevel();
            vibeMultiplier = 1.0 + vibeLevel * 0.5; // Up to 50% increase
        }

        // Codex Enhancement: Add camera-triggered vignette boost
        const vignetteBoost = window.codexVignetteBoost || 0;
        bloomPass.strength =
            (baseBloom + bassIntensity * bloomMultiplier) * vibeMultiplier + vignetteBoost;
    }
}

/**
 * Update canvas filters for visual effects
 * @param {Object} params - Parameters
 * @param {EffectComposer} params.composer - Post-processing composer
 * @param {Object} params.vibeMeter - Vibe meter
 */
export function updateCanvasFilters({ composer, vibeMeter }) {
    const canvas = document.getElementById('club-canvas');
    if (!canvas) {
        return;
    }

    // Step 277: Apply lens distortion/chromatic aberration based on intensity/vibe meter
    if (composer && composer.chromaticAberrationEnabled && vibeMeter) {
        const vibeLevel = vibeMeter.getVibeLevel();
        // Apply chromatic aberration effect (simplified - would use shader in full implementation)
        if (vibeLevel > 0.7) {
            const aberrationAmount = (vibeLevel - 0.7) * 0.3; // 0-0.09
            canvas.style.filter = `hue-rotate(${aberrationAmount * 10}deg)`;
        } else {
            canvas.style.filter = '';
        }
    }

    // Step 278: Implement afterimage ghost trail post-process for high-energy sections
    // Step 299: Volumetric light shafts (god rays) effect
    // This would require a motion blur or ghost trail shader pass
    // For now, we'll use a simplified approach with CSS filters
    if (vibeMeter && vibeMeter.getVibeLevel() > 0.8) {
        // Combine ghost trail and volumetric effects
        canvas.style.filter = 'blur(0.5px) brightness(1.1)';
    } else if (
        !composer ||
        !composer.chromaticAberrationEnabled ||
        !vibeMeter ||
        vibeMeter.getVibeLevel() <= 0.7
    ) {
        // Reset filter if not in high-energy mode (unless chromatic aberration is active)
        canvas.style.filter = '';
    }
}
