/**
 * AudioAndUISystemsInitializer - Handles audio and UI system initialization
 *
 * Extracted from main.js's initAudio() function to consolidate initialization.
 */

/**
 * Initialize all audio and UI systems after audio context is ready
 * @param {Object} params - Initialization parameters
 * @returns {Promise<Object>} Initialized systems
 */
export async function initializeAudioAndUISystems({
    audioContext,
    analyser,
    audioData,
    scene,
    renderer,
    camera,
    avatar,
    cameraController,
    collisionSystem,
    codexAssetIntegration,
    portalRifts,
    replayLibrary,
    replaySystem,
    mainMenu,
    // Helper functions
    initAudioContext,
    initializeAudioEffects,
    initializeCollectionTracker,
    initializeCollectibleManager,
    initializeAudioPlayer,
    initializeErrlPhone,
    initializeSettingsManager,
    initializeDevTools,
    initializeDebugOverlay,
    initializeDevMenu,
    initializeAudioReactiveDebugger,
    initializeUIScalingSystem,
    initializeCollectionGoalsUI,
    initializeAssetAttributionPanel,
    initializeReplayLibraryUI,
    initializePerformanceOptimizer,
    initializeBeatDetector,
    initializeFrequencyBandExtractor,
}) {
    const systems = {};
    const result = await initAudioContext();

    if (result.audioContext && result.analyser && result.audioData) {
        systems.audioContext = result.audioContext;
        systems.analyser = result.analyser;
        systems.audioData = result.audioData;

        // Initialize footstep system
        const { FootstepSystem } = await import('../../audio/FootstepSystem.js');
        systems.footstepSystem = new FootstepSystem(systems.audioContext);

        // Initialize audio effects
        initializeAudioEffects();

        // Initialize CollectionTracker first
        if (!window.gameSystems.collectionTracker) {
            const settingsManager = await initializeSettingsManager(
                cameraController,
                mainMenu.updateProgress.bind(mainMenu)
            );
            await initializeCollectionTracker(settingsManager);
            systems.settingsManager = settingsManager;
        }

        // Initialize collectible manager
        const collectionTracker = window.gameSystems?.collectionTracker || null;
        systems.collectibleManager = await initializeCollectibleManager(
            scene,
            systems.audioContext,
            collectionTracker
        );

        // Initialize audio player
        systems.audioPlayer = await initializeAudioPlayer(systems.audioContext);

        // Initialize ErrlPhone UI
        systems.errlPhone = await initializeErrlPhone({
            avatar,
            audioPlayer: systems.audioPlayer,
            audioContext: systems.audioContext,
            scene,
        });

        // Initialize SettingsManager if not already done
        if (!systems.settingsManager) {
            systems.settingsManager = await initializeSettingsManager(
                cameraController,
                mainMenu.updateProgress.bind(mainMenu)
            );
        }

        // Initialize DevTools
        systems.devTools = await initializeDevTools(
            scene,
            {
                renderer,
                camera,
                avatar,
                cameraController,
                collisionSystem,
            },
            codexAssetIntegration
        );

        // Initialize DebugOverlay
        systems.debugOverlay = await initializeDebugOverlay(scene);

        // Initialize DevMenu
        systems.devMenu = await initializeDevMenu({
            performanceOptimizer: null, // Will be set after PerformanceOptimizer is initialized
            avatar,
            camera,
            cameraController,
            scene,
            renderer,
            collisionSystem,
            settingsManager: systems.settingsManager,
        });

        // Initialize AudioReactiveDebugger
        systems.audioReactiveDebugger = await initializeAudioReactiveDebugger();

        // Initialize UI Scaling System
        systems.uiScalingSystem = await initializeUIScalingSystem(systems.settingsManager);

        // Initialize Collection Goals UI
        systems.collectionGoalsUI = await initializeCollectionGoalsUI(systems.settingsManager);

        // Initialize Asset Attribution Panel
        systems.assetAttributionPanel =
            await initializeAssetAttributionPanel(codexAssetIntegration);

        // Initialize Replay Library UI
        if (replayLibrary && replaySystem) {
            await initializeReplayLibraryUI(replayLibrary, replaySystem);
        }

        // Initialize Performance Optimizer
        systems.performanceOptimizer = await initializePerformanceOptimizer(
            systems.settingsManager,
            systems.devTools
        );

        // Initialize beat detector
        systems.beatDetector = await initializeBeatDetector(systems.analyser);

        // Initialize frequency band extractor
        const sampleRate = systems.audioContext.sampleRate || 44100;
        systems.frequencyExtractor = await initializeFrequencyBandExtractor(
            systems.analyser,
            sampleRate,
            codexAssetIntegration,
            portalRifts
        );

        // Wire portal rifts to beatDetector
        if (systems.beatDetector && portalRifts) {
            for (const portal of portalRifts) {
                portal.setBeatDetector(systems.beatDetector);
            }
        }

        console.log('Audio system initialized. Ready to load audio files.');
        console.log('Audio files should be placed in public/audio/ directory');
    } else {
        console.warn('Audio context initialization failed');
    }

    return systems;
}
