/**
 * DevToolsInitializationHelper - Handles dev tools and debugging systems initialization
 *
 * Extracted from main.js's initAudio() function.
 */

/**
 * Initialize DevTools
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} params - Parameters
 * @param {THREE.WebGLRenderer} params.renderer - Three.js renderer
 * @param {THREE.Camera} params.camera - Three.js camera
 * @param {Object} params.avatar - Avatar instance
 * @param {Object} params.cameraController - Camera controller
 * @param {Object} params.collisionSystem - Collision system
 * @param {Object} codexAssetIntegration - CodexAssetIntegration instance (optional)
 * @returns {DevTools|null} DevTools instance or null
 */
export async function initializeDevTools(scene, params, codexAssetIntegration = null) {
    try {
        const { DevTools } = await import('../../dev/DevTools.js');
        const devTools = new DevTools(scene, {
            renderer: params.renderer,
            camera: params.camera,
            avatar: params.avatar,
            cameraController: params.cameraController,
            collisionSystem: params.collisionSystem,
        });

        // Wire CodexAssetIntegration for asset-specific performance metrics
        if (codexAssetIntegration && devTools.setCodexAssetIntegration) {
            devTools.setCodexAssetIntegration(codexAssetIntegration);
        }

        console.log('DevTools initialized - press F1 to toggle');
        return devTools;
    } catch (error) {
        console.warn('Failed to initialize DevTools:', error);
        return null;
    }
}

/**
 * Initialize DebugOverlay
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {DebugOverlay|null} DebugOverlay instance or null
 */
export async function initializeDebugOverlay(scene) {
    try {
        const { DebugOverlay } = await import('../../dev/DebugOverlay.js');
        const debugOverlay = new DebugOverlay(scene);
        console.log('DebugOverlay initialized');
        return debugOverlay;
    } catch (error) {
        console.warn('Failed to initialize DebugOverlay:', error);
        return null;
    }
}

/**
 * Initialize DevMenu
 * @param {Object} params - Parameters
 * @param {Object} params.performanceOptimizer - PerformanceOptimizer instance
 * @param {Object} params.avatar - Avatar instance
 * @param {THREE.Camera} params.camera - Three.js camera
 * @param {Object} params.cameraController - Camera controller
 * @param {THREE.Scene} params.scene - Three.js scene
 * @param {THREE.WebGLRenderer} params.renderer - Three.js renderer
 * @param {Object} params.collisionSystem - Collision system
 * @param {Object} params.settingsManager - Settings manager
 * @returns {DevMenu|null} DevMenu instance or null
 */
export async function initializeDevMenu(params) {
    try {
        const { DevMenu } = await import('../../dev/DevMenu.js');
        const devMenu = new DevMenu({
            performanceOptimizer: params.performanceOptimizer,
            avatar: params.avatar,
            camera: params.camera,
            cameraController: params.cameraController,
            scene: params.scene,
            renderer: params.renderer,
            collisionSystem: params.collisionSystem,
            settingsManager: params.settingsManager,
        });
        devMenu.hide(); // Start hidden
        console.log('DevMenu initialized - press Ctrl+D to toggle');
        return devMenu;
    } catch (error) {
        console.warn('Failed to initialize DevMenu:', error);
        return null;
    }
}

/**
 * Initialize AudioReactiveDebugger
 * @returns {AudioReactiveDebugger|null} AudioReactiveDebugger instance or null
 */
export async function initializeAudioReactiveDebugger() {
    try {
        const { AudioReactiveDebugger } = await import('../../dev/AudioReactiveDebugger.js');
        const audioReactiveDebugger = new AudioReactiveDebugger();
        // Enable by default in dev mode (can be toggled via console)
        // audioReactiveDebugger.enable({ showVisualizations: true, logBeats: true });
        console.log(
            'AudioReactiveDebugger initialized - use audioReactiveDebugger.enable() to activate'
        );
        return audioReactiveDebugger;
    } catch (error) {
        console.warn('Failed to initialize AudioReactiveDebugger:', error);
        return null;
    }
}

/**
 * Initialize PerformanceOptimizer
 * @param {SettingsManager} settingsManager - Settings manager instance
 * @param {DevTools} devTools - DevTools instance
 * @returns {Promise<Object|null>} Promise resolving to PerformanceOptimizer or null
 */
export async function initializePerformanceOptimizer(settingsManager, devTools) {
    if (!settingsManager || !devTools) {
        return null;
    }

    try {
        const { PerformanceOptimizer } = await import('../../systems/PerformanceOptimizer.js');
        const { GraphicsSettings } = await import('../../config/GraphicsSettings.js');
        const graphicsSettings = new GraphicsSettings(settingsManager);
        const performanceOptimizer = new PerformanceOptimizer(graphicsSettings, devTools);
        console.log('PerformanceOptimizer initialized (disabled by default)');
        return performanceOptimizer;
    } catch (error) {
        console.warn('Failed to load PerformanceOptimizer:', error);
        return null;
    }
}
