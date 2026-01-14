// Import CSS
import './style.css';

// Import Three.js
import * as THREE from 'three';

// A7: Most systems now initialized via GameInitializer
// Only importing classes used for custom enhancements
import { FootstepSystem } from './audio/FootstepSystem.js'; // Used for custom audio setup
import { Teleporter } from './interactions/Teleporter.js'; // Used for visualizer room teleporter
import { CameraConsole } from './interactions/CameraConsole.js'; // Used for custom camera console
import { LightingConsole } from './interactions/LightingConsole.js'; // Used for custom lighting console
// Note: EmoteWheel is lazy-loaded to prevent constructor execution during module evaluation
// Import MainMenu
import { MainMenu } from './ui/MainMenu.js';
// A6: SceneBuilderInitializer now handled by GameInitializer
// Audio update helpers now handled by SystemsUpdater - imports removed for cleanup (A7)
// Import audio effects initializers
import {
    setupLowPassFilter as setupLowPassFilterHelper,
    setupReverb as setupReverbHelper,
} from './core/initializers/AudioEffectsInitializer.js';
// Import post-processing effects initializers
import { setupSSAO as setupSSAOHelper } from './core/initializers/PostProcessingEffectsInitializer.js';
// A6: Post-processing now handled by GameInitializer via PostProcessingManager
// Import audio initialization helper
import {
    initAudioContext,
    loadAudioFile as loadAudioFileHelper,
    initAmbientAudio as initAmbientAudioHelper,
} from './core/initializers/AudioInitializationHelper.js';
// Import collectibles initialization helper
import {
    initializeCollectionTracker,
    initializeCollectibleManager,
} from './core/initializers/CollectiblesInitializationHelper.js';
// Import UI systems initialization helper
import {
    initializeCollectionGoalsUI,
    initializeAssetAttributionPanel,
    initializeReplayLibraryUI,
} from './core/initializers/UISystemsInitializationHelper.js';
// Import audio systems initialization helper
import {
    initializeAudioPlayer,
    initializeErrlPhone,
    initializeBeatDetector,
    initializeFrequencyBandExtractor,
} from './core/initializers/AudioSystemsInitializationHelper.js';
// Import dev tools initialization helper
import {
    initializeDevTools,
    initializeDebugOverlay,
    initializeDevMenu,
    initializeAudioReactiveDebugger,
    initializePerformanceOptimizer,
} from './core/initializers/DevToolsInitializationHelper.js';
// Import settings initialization helper
import {
    initializeSettingsManager,
    initializeUIScalingSystem,
} from './core/initializers/SettingsInitializationHelper.js';
// Import event handlers
import { setupMouseHandlers } from './core/handlers/MouseEventHandlers.js';
import { setupKeyboardHandlers } from './core/handlers/KeyboardEventHandlers.js';
import { setupResizeHandler } from './core/handlers/ResizeHandler.js';
// A7: System updates now handled by SystemsUpdater via UpdateManager
// Import SystemsUpdater for consolidated system updates (used by UpdateManager)
import { updateAllSystems, renderScene } from './core/updates/SystemsUpdater.js';
// A6: GameSystemsInitializer now handled by GameInitializer
// Import interaction registration helper
import { registerDJScreenInteractable } from './core/helpers/InteractionRegistrationHelper.js';
// Import FPS tracker
import { FPSTracker } from './core/helpers/FPSTracker.js';
// Environment animator helpers now handled by SystemsUpdater - imports removed for cleanup (A7)
// A6: InputInitializer now handled by GameInitializer
// Import GameLoop and UpdateManager
import { GameLoop } from './core/GameLoop.js';
import { UpdateManager } from './core/UpdateManager.js';
// A7: UI/system classes now initialized via helper functions or GameInitializer
// Network imports (multiplayer - requires server)
// import { NetworkClient } from './network/NetworkClient.js';
// import { MultiplayerManager } from './network/MultiplayerManager.js';
// Note: VibeMeter and VisualizerStylePicker removed - using ErrlPhone instead
// A7: Audio mapping handled by audio initialization helpers
// Import configuration constants
import { ROOM_SIZE, STAGE_SIZE, STAGE_HEIGHT, AVATAR_RADIUS } from './config/constants.js';
// Import Codex asset integration
import { CodexAssetIntegration } from './scene/CodexAssetIntegration.js';
// Import GameInitializer
import { GameInitializer } from './core/GameInitializer.js';

// Main entry point for Errl Club Simulator
// A6: Migrate to GameInitializer

// Suppress excessive logging during tests
// Set defaults immediately to prevent any logging before detection
if (typeof window !== 'undefined') {
    // Detect test mode (Playwright sets navigator.webdriver)
    const isTestMode =
        navigator.webdriver ||
        window.__PLAYWRIGHT_TEST__ ||
        (typeof document !== 'undefined' &&
            document.location &&
            document.location.search &&
            document.location.search.includes('test=true'));

    // Set debug flags based on test mode
    window.DEBUG_GAMELOOP = !isTestMode; // Enable in dev, disable in tests
    window.DEBUG_MOVEMENT = false; // Always off
    window.DEBUG_COLLECTIBLES = false; // Always off

    if (isTestMode) {
        window.__PLAYWRIGHT_TEST__ = true; // Mark as test mode
    }

    // Only log if not in test mode
    if (!isTestMode) {
        console.log('Errl Club Simulator - Loading...');
    }
}

// Get canvas element
const canvas = document.getElementById('club-canvas');
if (!canvas) {
    throw new Error('Canvas element not found');
}

// A6: Use GameInitializer for all initialization
// GameInitializer is imported at the top of the file

// Initialize game using GameInitializer
const gameInitializer = new GameInitializer(canvas);
let systems = null;
// LOD System will be initialized inside the GameInitializer promise
let lodSystem = null;
// Codex asset integration will be initialized inside the GameInitializer promise
let codexAssetIntegration = null;

// Start initialization (A6: Migrate to GameInitializer)
gameInitializer
    .initialize()
    .then(async (initializedSystems) => {
        systems = initializedSystems;

        // Log successful initialization (only if not in test mode)
        if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
            console.log('GameInitializer: Initialization complete');
        }

        // A6: Extract systems from GameInitializer (already initialized)
        const scene = systems.scene || systems.clubScene;
        const camera = systems.camera || systems.clubCamera;
        const renderer = systems.renderer;
        const avatar = systems.avatar;
        const particleSystem = systems.particleSystem;
        const collisionSystem = systems.collisionSystem;
        const interactionSystem = systems.interactionSystem;
        const cameraController = systems.cameraController;
        const eventSystem = systems.eventSystem;
        const visualEffects = systems.visualEffects;
        const physicsSystem = systems.physicsSystem;
        const replaySystem = systems.replaySystem;
        const teleportSystem = systems.teleportSystem;
        const postProcessingManager = systems.postProcessingManager;

        // LOD System for performance optimization (must be initialized before CodexAssetIntegration)
        let lodSystemInstance = null;
        try {
            const { LODSystem } = await import('./systems/LODSystem.js');
            lodSystemInstance = new LODSystem(scene, camera);
            lodSystem = lodSystemInstance; // Update the module-level variable
            if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
                console.log('LODSystem initialized');
            }
        } catch (error) {
            console.warn('Failed to load LODSystem:', error);
            lodSystem = null; // Ensure it's set to null if initialization fails
        }

        // Initialize Codex asset integration
        codexAssetIntegration = new CodexAssetIntegration(scene, {
            eventSystem: eventSystem,
            interactionSystem: interactionSystem,
            audioSystem: systems.audioSystem || null,
            lodSystem: lodSystemInstance, // Use local variable to avoid TDZ issues
        });

        // Load all available Codex assets
        // CRITICAL: This must complete BEFORE the game loop starts rendering
        // The game loop should wait for this to complete
        codexAssetIntegration
            .loadAllAssets()
            .then(async (assets) => {
                if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
                    console.log(
                        '✅ Codex assets loaded:',
                        Object.keys(assets).filter((k) => assets[k] !== null)
                    );
                }

                // CRITICAL: Simplify materials AFTER Codex assets are loaded
                // Codex assets may have materials with textures that exceed the limit
                const { MaterialSimplifier } = await import('./utils/MaterialSimplifier.js');
                MaterialSimplifier.simplifyMaterials(scene, true);
                let estimatedUnits = MaterialSimplifier.checkTextureUnitUsage(scene, 12);
                if (estimatedUnits > 0) {
                    console.warn(
                        `MaterialSimplifier: After Codex assets, ${estimatedUnits} texture units still in use. Running additional pass.`
                    );
                    // Run additional passes until we're under the limit
                    let passes = 0;
                    while (estimatedUnits > 0 && passes < 5) {
                        MaterialSimplifier.simplifyMaterials(scene, true);
                        const newEstimate = MaterialSimplifier.checkTextureUnitUsage(scene, 12);
                        if (newEstimate === estimatedUnits) {
                            break; // No improvement, stop
                        }
                        estimatedUnits = newEstimate;
                        passes++;
                    }
                    if (estimatedUnits > 0) {
                        console.warn(
                            `MaterialSimplifier: After ${passes} passes, still ${estimatedUnits} texture units in use. Some materials may not be simplified.`
                        );
                    } else {
                        console.log(
                            'MaterialSimplifier: Successfully simplified all materials after Codex assets. Texture unit usage: 0/16'
                        );
                    }
                }
            })
            .catch((error) => {
                console.warn('⚠️ Some Codex assets failed to load:', error);
            });

        // A6: Extract scene data from GameInitializer (already initialized via SceneBuilderInitializer)
        const spotLight = systems.spotLight;
        const ceilingLights = systems.ceilingLights;
        const ledStrips = systems.ledStrips;
        const speakerCones = systems.speakerCones;
        const screenMaterial = systems.screenMaterial;
        const screenTexture = systems.screenTexture;
        const floorMaterial = systems.floorMaterial;
        const wallMaterial = systems.wallMaterial;
        const stageMaterial = systems.stageMaterial;
        const djScreen = systems.djScreen;
        const leftFanBlades = systems.leftFanBlades;
        const rightFanBlades = systems.rightFanBlades;
        const updateScreenTexture = systems.updateScreenTexture;
        const applyGlitchToScreen = systems.applyGlitchToScreen;

        // A6: Extract interactive objects from GameInitializer (already initialized via InteractiveEnvironmentInitializer)
        const doors = systems.doors || [];
        const teleporters = systems.teleporters || [];
        const fogVents = systems.fogVents || [];
        const seatableObjects = systems.seatableObjects || [];
        const portalRifts = systems.portalRifts || [];
        const pushableProps = systems.pushableProps || [];

        // Codex Enhancement: Holographic rings around DJ booth (special enhancement, not in SceneBuilder)
        const holographicRings = [];
        const boothWidth = 2;
        const boothHeight = 3;
        const boothDepth = 1.5;
        const boothCenter = new THREE.Vector3(
            0,
            boothHeight / 2 + STAGE_HEIGHT,
            -STAGE_SIZE / 2 - boothDepth / 2
        );
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringRadius = 1.5 + i * 0.5;
            const ringGeometry = new THREE.TorusGeometry(ringRadius, 0.05, 8, 32);
            // Use MeshBasicMaterial to avoid texture unit limit errors
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(boothCenter);
            ring.rotation.x = Math.PI / 2;
            ring.userData.baseRotationSpeed = 0.5 + i * 0.2;
            ring.userData.baseY = boothCenter.y;
            scene.add(ring);
            holographicRings.push(ring);
        }

        // Apply material property modifications (SceneBuilderInitializer handles creation, but we can still modify properties)
        if (stageMaterial) {
            stageMaterial.metalness = 0.8;
            stageMaterial.roughness = 0.2;
        }
        if (wallMaterial) {
            wallMaterial.metalness = 0.2;
            wallMaterial.roughness = 0.6;
        }

        // A6: Post-processing already initialized by GameInitializer via PostProcessingManager
        // Extract post-processing references from GameInitializer
        const composer = postProcessingManager?.composer || null;
        const bloomPass = postProcessingManager?.bloomPass || null;
        const postProcessingEnabled = postProcessingManager?.enabled || false;
        // Codex Enhancement: Initialize vignette boost variable
        window.codexVignetteBoost = 0;
        // Create a promise-like wrapper for compatibility with existing code
        const postProcessingSetup = Promise.resolve({
            composer,
            bloomPass,
            enabled: postProcessingEnabled,
        });

        // ===== CODEX ASSET INTEGRATION =====
        // Load and integrate Codex-recommended assets
        // Note: CodexAssetIntegration is imported at the top of the file
        // Declaration moved to top to avoid TDZ issues

        // A6: Avatar already initialized by GameInitializer
        // Custom avatar position for visualizer room (if needed)
        const avatarInitialPosition = new THREE.Vector3(0, AVATAR_RADIUS, 5);

        // A6: Core systems already initialized by GameInitializer via CoreSystemsInitializer
        // Extract additional systems from GameInitializer
        const particlePresets = systems.particlePresets;
        const screenEffectsPresets = systems.screenEffectsPresets;
        const postProcessingPresets = systems.postProcessingPresets;
        const worldStateReactor = systems.worldStateReactor;
        const visualRecorder = systems.visualRecorder;
        const replayLibrary = systems.replayLibrary;

        // Register interactable objects after all systems are initialized
        // Register interactables after a short delay to ensure everything is initialized
        setTimeout(() => {
            registerDJScreenInteractable(djScreen, interactionSystem, screenMaterial);
        }, 100);

        // A6: Footstep system will be initialized after audio context is ready
        let footstepSystem = null;

        // A6: Interactive environment elements already initialized by GameInitializer via InteractiveEnvironmentInitializer
        // Extract additional objects that may not be in GameInitializer
        const movingPlatforms = systems.movingPlatforms || [];
        const ventilationFans = systems.ventilationFans || [];
        const interactiveScreens = systems.interactiveScreens || [];
        const throwableDrips = systems.throwableDrips || [];
        let cameraConsole = null;
        let lightingConsole = null;

        // A6: Extract additional systems from GameInitializer
        let audioPlayer = systems.audioPlayer || null;
        const audioManager = systems.audioManager || null;
        let beatDetector = systems.beatDetector || null;
        let errlPhone = systems.errlPhone || null;
        const keybindManager = systems.keybindManager || null;
        let frequencyExtractor = systems.frequencyExtractor || null;
        let settingsManager = systems.settingsManager || null;
        let devTools = systems.devTools || null;
        let debugOverlay = systems.debugOverlay || null;
        let devMenu = systems.devMenu || null;
        let audioReactiveDebugger = systems.audioReactiveDebugger || null;
        const helpSystem = systems.helpSystem || null;
        const helpPanel = systems.helpPanel || null;
        let uiScalingSystem = systems.uiScalingSystem || null;
        let collectionGoalsUI = systems.collectionGoalsUI || null;
        let assetAttributionPanel = systems.assetAttributionPanel || null;
        let performanceOptimizer = systems.performanceOptimizer || null;
        const networkClient = systems.networkClient || null;
        const multiplayerManager = systems.multiplayerManager || null;
        const MULTIPLAYER_ENABLED = false; // Set to true when server is available

        // Register screens with interaction system
        setTimeout(() => {
            for (const screen of interactiveScreens) {
                interactionSystem.registerInteractable(screen.getMesh(), () => {
                    screen.changePattern();
                });
            }

            // Create camera console
            cameraConsole = new CameraConsole(scene, new THREE.Vector3(5, 1, 5), cameraController);
            interactionSystem.registerInteractable(cameraConsole.getMesh(), () => {
                cameraConsole.switchToNext();
            });

            // Create lighting console
            lightingConsole = new LightingConsole(
                scene,
                new THREE.Vector3(-5, 1, 5),
                eventSystem,
                visualEffects
            );
            // Register buttons individually
            lightingConsole.getMesh().children.forEach((child) => {
                if (child.userData.isButton) {
                    interactionSystem.registerInteractable(child, () => {
                        lightingConsole.interact(child.userData.buttonType);
                    });
                }
            });
        }, 200);

        // Step 229-235: Event system and visual effects now initialized in GameSystemsInitializer

        // Update CodexAssetIntegration with initialized systems
        if (codexAssetIntegration) {
            codexAssetIntegration.systems.eventSystem = eventSystem;
            codexAssetIntegration.systems.interactionSystem = interactionSystem;
            // Wire interactions
            codexAssetIntegration.wireInteractions(interactionSystem);
        }

        // A6: Visual recorder already initialized by GameInitializer

        // Visual Recorder Exporter
        let visualRecorderExporter = null;
        try {
            const { VisualRecorderExporter } = await import('./systems/VisualRecorderExporter.js');
            visualRecorderExporter = new VisualRecorderExporter(visualRecorder);
            console.log('VisualRecorderExporter initialized');

            // Wire VisualRecorderExporter to VisualRecorderUI if available
            if (window.gameSystems?.ui?.visualRecorderUI) {
                window.gameSystems.ui.visualRecorderUI.setVisualRecorderExporter(
                    visualRecorderExporter
                );
                console.log('VisualRecorderExporter connected to VisualRecorderUI');
            }
        } catch (error) {
            console.warn('Failed to load VisualRecorderExporter:', error);
        }

        // A6: World state reactor already initialized by GameInitializer

        // Create visualizer-only room with intense visual effects (custom enhancement)
        // Add a teleporter to access the visualizer room
        const visualizerRoomTeleporter = new Teleporter(
            new THREE.Vector3(ROOM_SIZE / 2 - 2, 0.5, ROOM_SIZE / 2 - 2),
            new THREE.Vector3(ROOM_SIZE + 5, 0.5, 0), // Visualizer room position
            scene
        );
        teleporters.push(visualizerRoomTeleporter);
        // Mark this teleporter as visualizer room entrance
        visualizerRoomTeleporter.padMesh.userData.isVisualizerRoom = true;

        // Create sweeping laser beams (custom enhancement)
        visualEffects.createSweepingLasers(ROOM_SIZE, 6.0, [0xff0000, 0x00ff00, 0x0000ff]);

        // A6: Portal rifts already initialized by GameInitializer via InteractiveEnvironmentInitializer

        // Register portals with interaction system
        setTimeout(() => {
            for (const portal of portalRifts) {
                interactionSystem.registerInteractable(portal.getMesh(), () => {
                    if (portal.checkActivation(avatar.position)) {
                        portal.teleport(avatar);
                    }
                });
            }
        }, 200);

        // A6: Pushable props already initialized by GameInitializer via InteractiveEnvironmentInitializer

        // Create hallucination zone (custom enhancement)
        const hallucinationZone = visualEffects.createHallucinationZone({
            width: 4,
            depth: 4,
            centerX: 0,
            centerZ: 4,
            height: 0.1,
        });

        // Collectible manager will be initialized after audio context is ready
        let collectibleManager = null;

        // Emote wheel UI will be initialized after DOM is ready
        const emoteWheel = null;
        const vibeMeter = null;

        // A7: Debug code removed

        // A6: InputManager already initialized by GameInitializer via InputInitializer
        // Extract input systems from GameInitializer
        const inputManager = systems.inputManager;
        const keys = inputManager?.keys || {};

        // Keyboard event handlers
        // Keyboard handlers for movement keys (WASD, Shift, Ctrl, Space)
        // Note: InputManager handles these, but we keep this for jump buffering
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (key === ' ') {
                if (avatar) {
                    avatar.bufferJump(); // Jump buffering
                }
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            // Keyup handled by InputManager
        });

        // A5: Animation loop migrated to GameLoop
        // A6: Camera, input, and event handlers managed by GameInitializer and SetupInitializer

        // FPS tracker (used by SystemsUpdater)
        const fpsTracker = new FPSTracker();

        // Placeholder audio system
        // TODO: Audio files will be placed in public/audio/ directory
        // Supported formats: MP3, OGG, WAV
        // Example: public/audio/ambient-club.mp3

        let audioContext = null;
        let analyser = null;
        let audioSource = null;
        let audioData = null;
        const bassEnergy = 0;
        const overallEnergy = 0;
        // Step 259-265: Frequency band values
        const frequencyBands = { bass: 0, mid: 0, treble: 0 };

        // Initialize audio context (requires user interaction)
        // Audio initialization now handled by AudioInitializationHelper.js
        async function initAudio() {
            try {
                const result = await initAudioContext();
                if (result.audioContext && result.analyser && result.audioData) {
                    audioContext = result.audioContext;
                    analyser = result.analyser;
                    audioData = result.audioData;

                    // Initialize footstep system once audio context is ready
                    if (!footstepSystem && audioContext) {
                        footstepSystem = new FootstepSystem(audioContext);
                    }

                    // Audio effects are now handled by AudioSystem
                    // No need to initialize them separately here

                    // Initialize collectible manager once audio context is ready
                    if (!window.gameSystems.collectionTracker && settingsManager) {
                        await initializeCollectionTracker(settingsManager);
                    }

                    if (!collectibleManager && audioContext) {
                        const collectionTracker = window.gameSystems?.collectionTracker || null;
                        collectibleManager = await initializeCollectibleManager(
                            scene,
                            audioContext,
                            collectionTracker
                        );
                    }

                    // Initialize audio player UI (hidden - using ErrlPhone instead)
                    if (!audioPlayer && audioContext) {
                        audioPlayer = await initializeAudioPlayer(audioContext);
                    }

                    // Initialize ErrlPhone UI
                    if (!errlPhone) {
                        errlPhone = await initializeErrlPhone({
                            avatar,
                            audioPlayer,
                            audioContext,
                            scene,
                        });
                    }

                    // Initialize SettingsManager for persistence
                    // Note: Progress updates are handled by GameInitializer, so we pass null here
                    if (!settingsManager) {
                        settingsManager = await initializeSettingsManager(
                            cameraController,
                            null // Progress updates handled by GameInitializer
                        );
                    }

                    // Initialize DevTools for debugging (F1 to toggle)
                    if (!devTools) {
                        devTools = await initializeDevTools(
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
                    } else if (codexAssetIntegration && !devTools.codexAssetIntegration) {
                        // Wire CodexAssetIntegration if DevTools already exists
                        devTools.setCodexAssetIntegration(codexAssetIntegration);
                    }

                    // Initialize DebugOverlay for 3D visual debugging
                    if (!debugOverlay) {
                        debugOverlay = await initializeDebugOverlay(scene);
                    }

                    // Initialize DevMenu for parameter tuning (Ctrl+D to toggle)
                    if (!devMenu) {
                        devMenu = await initializeDevMenu({
                            performanceOptimizer: performanceOptimizer,
                            avatar,
                            camera,
                            cameraController,
                            scene,
                            renderer,
                            collisionSystem,
                            settingsManager,
                        });
                    }

                    // Initialize AudioReactiveDebugger for audio-reactive feature testing
                    if (!audioReactiveDebugger) {
                        audioReactiveDebugger = await initializeAudioReactiveDebugger();
                    }

                    // Initialize UI Scaling System
                    if (!uiScalingSystem && settingsManager) {
                        uiScalingSystem = await initializeUIScalingSystem(settingsManager);
                    }

                    // Initialize Collection Goals UI
                    if (!collectionGoalsUI && settingsManager) {
                        collectionGoalsUI = await initializeCollectionGoalsUI(settingsManager);
                    }

                    // Initialize Asset Attribution Panel
                    if (!assetAttributionPanel && codexAssetIntegration) {
                        assetAttributionPanel =
                            await initializeAssetAttributionPanel(codexAssetIntegration);
                    }

                    // Path 24: Initialize Replay Library UI
                    if (!window.replayLibraryUI && replayLibrary && replaySystem) {
                        await initializeReplayLibraryUI(replayLibrary, replaySystem);
                    }

                    // Path 23: Initialize Performance Optimizer
                    if (!performanceOptimizer && settingsManager && devTools) {
                        performanceOptimizer = await initializePerformanceOptimizer(
                            settingsManager,
                            devTools
                        );
                    }

                    // Step 311-330: Network/Multiplayer initialization
                    // To enable multiplayer:
                    // 1. Uncomment NetworkClient and MultiplayerManager imports at top of file
                    // 2. Set MULTIPLAYER_ENABLED = true
                    // 3. Ensure WebSocket server is running
                    /*
        if (MULTIPLAYER_ENABLED && !networkClient) {
            networkClient = new NetworkClient('ws://localhost:8080');
            multiplayerManager = new MultiplayerManager({
                scene,
                stateManager: null, // Add StateManager if available
                eventBus: null // Add EventBus if available
            });
            multiplayerManager.setNetworkClient(networkClient);
            networkClient.connect();
            console.log('Multiplayer initialized - connecting to server');
        }
        */

                    // Step 257-258: Initialize beat detector once analyser is ready
                    if (!beatDetector && analyser) {
                        beatDetector = await initializeBeatDetector(analyser);
                    }

                    // Step 259-265: Initialize frequency band extractor
                    if (!frequencyExtractor && analyser) {
                        const sampleRate = audioContext.sampleRate || 44100;
                        frequencyExtractor = await initializeFrequencyBandExtractor(
                            analyser,
                            sampleRate,
                            codexAssetIntegration,
                            portalRifts
                        );

                        // Codex Enhancement: Wire portal rifts to beatDetector
                        if (beatDetector) {
                            for (const portal of portalRifts) {
                                portal.setBeatDetector(beatDetector);
                            }
                        }
                    }

                    console.log('Audio system initialized. Ready to load audio files.');
                    console.log('Audio files should be placed in public/audio/ directory');
                }
            } catch (error) {
                console.warn('Audio context initialization failed:', error);
            }
        }

        // Function to load and play audio file (extracted to AudioInitializationHelper.js)
        async function loadAudioFile(url) {
            if (!audioContext || !analyser) {
                await initAudio();
            }
            const audio = await loadAudioFileHelper(url, audioContext, analyser);
            if (audio) {
                audioSource = audioContext.createMediaElementSource(audio);
                audioSource.connect(analyser);
            }
        }

        // Initialize audio on first user interaction
        let audioInitialized = false;
        document.addEventListener(
            'click',
            () => {
                if (!audioInitialized) {
                    initAudio();
                    initAmbientAudio();
                    audioInitialized = true;
                }
            },
            { once: true }
        );

        // Initialize SSAO after post-processing is set up
        postProcessingSetup.then(async (result) => {
            if (result?.composer) {
                await setupSSAOHelper(result.composer, scene, camera);
            }
        });

        // Audio analysis now handled by updateAudioAnalysisHelper (extracted to AudioAnalysisUpdater.js)

        // Step 83: Add a looping ambient club sound (placeholder - actual audio loading in Chapter 6)
        let ambientAudio = null;
        const audioFadeInProgress = 0;
        const audioFadeInDuration = 2.0; // seconds

        // Ambient audio initialization now handled by AudioInitializationHelper.js
        function initAmbientAudio() {
            ambientAudio = initAmbientAudioHelper();
        }

        // Step 85-87: Audio effects and post-processing setup (extracted to helper modules)
        // Variables declared earlier - functions now in AudioEffectsInitializer.js and PostProcessingEffectsInitializer.js

        // Error handling
        window.addEventListener('error', (event) => {
            console.error('Error:', event.error);
        });

        // Note: MainMenu progress updates and ready callback are handled by GameInitializer
        // All initialization progress is managed in GameInitializer.initialize()
        // The ready callback is set up in GameInitializer and starts the game loop
        // Event handlers (keyboard, mouse) are set up by SetupInitializer in GameInitializer

        // Set up GameLoop and UpdateManager for migration (A5)
        let gameLoop = null;
        let updateManager = null;
        let systemsForGameLoop = null; // Store systems object for GameLoop

        // Initialize GameLoop (A6: Post-processing already ready from GameInitializer)
        // Create UpdateManager with SystemsUpdater support
        updateManager = new UpdateManager({ useSystemsUpdater: true });

        // A6: Create PostProcessingManager adapter for GameLoop (PostProcessingManager already exists from GameInitializer)
        const postProcessingManagerAdapter = {
            render: (renderer, scene, camera) => {
                if (postProcessingEnabled && postProcessingManager?.composer) {
                    postProcessingManager.composer.render();
                } else {
                    renderer.render(scene, camera);
                }
            },
            composer: postProcessingManager?.composer || null,
        };

        // Create GameLoop instance (A6: Using PostProcessingManager adapter)
        gameLoop = new GameLoop(
            updateManager,
            postProcessingManagerAdapter,
            renderer,
            scene,
            camera
        );

        // Set up systems object for UpdateManager
        systemsForGameLoop = {
            // Core
            scene,
            camera,
            renderer,
            avatar,

            // Systems (will be populated by SystemsUpdater)
            particleSystem,
            physicsSystem,
            collisionSystem,
            interactionSystem,
            collectibleManager,
            replaySystem,
            teleportSystem,
            worldStateReactor,
            eventSystem,
            visualEffects,

            // Audio (will be set in initAudio)
            analyser,
            audioData,
            frequencyExtractor,
            beatDetector,
            audioPlayer,
            footstepSystem,
            ambientAudio,
            audioFadeInProgress,
            audioFadeInDuration,

            // Scene objects
            spotLight,
            ceilingLights,
            ledStrips,
            speakerCones,
            floorMaterial,
            wallMaterial,
            leftFanBlades,
            rightFanBlades,
            screenTexture,
            updateScreenTexture,
            applyGlitchToScreen,

            // Interactive objects
            doors,
            teleporters,
            fogVents,
            portalRifts,
            seatableObjects,
            holographicRings,

            // Post-processing
            composer,
            bloomPass,
            postProcessingEnabled,

            // Camera
            cameraController,

            // UI
            collectionGoalsUI,

            // Codex assets
            codexAssetIntegration,

            // Performance
            lodSystem,
            performanceOptimizer,
            devTools,

            // Audio state
            frequencyBands,
            bassEnergy,
            overallEnergy,

            // Other
            vibeMeter,
            fpsTracker,
            audioReactiveDebugger,

            // Constants
            ROOM_SIZE,

            // Input
            keys,
            inputManager: systems.inputManager,
            stateManager: systems.stateManager,
        };

        // Set systems for GameLoop (A4: Prepare for GameLoop Migration)
        gameLoop.setSystems(systemsForGameLoop);

        // Store systemsForGameLoop for use in setOnReady callback
        window.systemsForGameLoop = systemsForGameLoop;

        // Only log if not in test mode
        if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
            console.log('GameLoop and UpdateManager initialized (A4: Ready for migration)');
        }
    })
    .catch((error) => {
        // Log initialization errors
        console.error('GameInitializer initialization failed:', error);
        console.error('Error stack:', error.stack);
        // Re-throw to ensure it's visible
        throw error;
    });

// Animation loop now handled by GameLoop (A5: Migration complete)
// GameLoop will start after post-processing is ready and user clicks "Ready"
try {
    // Only log if not in test mode
    if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
        console.log('Errl Club Simulator - Scene initialized with room geometry and avatar');
    }
    // Only log controls if not in test mode
    if (!window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
        console.log(
            'Controls: WASD to move, Space to hop, Shift to run, Ctrl to crouch, Shift+D to dance, Shift+Space to dash'
        );
        console.log(
            'Camera: Mouse drag to orbit, Scroll to zoom, 1/2/3 for camera presets, R to snap behind, C for cinematic, L for lock-on, F for freecam'
        );
        console.log(
            'Other: T to record replay, G to spawn ghost, Y to teleport, Tab for emote wheel, E to interact'
        );
    }

    // Step 236: EmoteWheel is lazy-loaded on Tab key press
    // Step 275: VibeMeter removed - using modern UI
} catch (error) {
    console.error('Failed to initialize:', error);
}
