/**
 * SettingsInitializationHelper - Handles settings and UI scaling initialization
 *
 * Extracted from main.js's initAudio() function.
 */

/**
 * Initialize SettingsManager
 * @param {Object} cameraController - Camera controller instance (optional)
 * @param {Function} mainMenuUpdateProgress - Main menu progress updater (optional)
 * @returns {SettingsManager} SettingsManager instance
 */
export async function initializeSettingsManager(
    cameraController = null,
    mainMenuUpdateProgress = null
) {
    const { SettingsManager } = await import('../../config/SettingsManager.js');

    if (mainMenuUpdateProgress) {
        mainMenuUpdateProgress(0.92, 'Loading settings...');
    }

    const settingsManager = new SettingsManager('errl_club_settings');

    // Apply saved settings
    const savedCameraPreset = settingsManager.getSetting('camera.preset', 'normal');
    if (cameraController && savedCameraPreset) {
        cameraController.setPreset(savedCameraPreset);
    }

    console.log('SettingsManager initialized - settings will persist');
    return settingsManager;
}

/**
 * Initialize UIScalingSystem
 * @param {SettingsManager} settingsManager - Settings manager instance
 * @returns {UIScalingSystem|null} UIScalingSystem instance or null
 */
export async function initializeUIScalingSystem(settingsManager) {
    if (!settingsManager) {
        return null;
    }

    try {
        const { UIScalingSystem } = await import('../../ui/UIScalingSystem.js');
        const uiScalingSystem = new UIScalingSystem(settingsManager);

        // Auto-register common UI elements after a short delay to ensure they're created
        setTimeout(() => {
            uiScalingSystem.autoRegisterElements();
        }, 1000);

        console.log('UI Scaling System initialized');
        return uiScalingSystem;
    } catch (error) {
        console.warn('Failed to initialize UIScalingSystem:', error);
        return null;
    }
}
