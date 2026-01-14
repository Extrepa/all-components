/**
 * GameInitializer - Orchestrates the initialization of all game systems
 */
import { PostProcessingManager } from '../effects/PostProcessingManager.js';
import { StateManager } from './StateManager.js';
import { EventBus } from './EventBus.js';
import { InputInitializer } from './initializers/InputInitializer.js';
import { SceneBuilderInitializer } from './initializers/SceneBuilderInitializer.js';
import { AvatarInitializer } from './initializers/AvatarInitializer.js';
import { CoreSystemsInitializer } from './initializers/CoreSystemsInitializer.js';
import { EffectsInitializer } from './initializers/EffectsInitializer.js';
import { AudioInitializer } from './initializers/AudioInitializer.js';
import { UIInitializer } from './initializers/UIInitializer.js';
import { InteractiveEnvironmentInitializer } from './initializers/InteractiveEnvironmentInitializer.js';
import { SetupInitializer } from './initializers/SetupInitializer.js';
import { NetworkInitializer } from './initializers/NetworkInitializer.js';
import { RoomInitializer } from './initializers/RoomInitializer.js';
import { MultiplayerManager } from '../network/MultiplayerManager.js';
import { AssetLoader } from '../assets/AssetLoader.js';
// TV systems removed - starting directly in nightclub
import * as THREE from 'three';
import { ROOM_SIZE } from '../config/constants.js';

export class GameInitializer {
    constructor(canvas) {
        this.canvas = canvas;
        this.systems = {};
        this.initialized = false;
    }

    /**
     * Main initialization method
     * @returns {Promise} Resolves when all systems are initialized
     */
    async initialize() {
        if (this.initialized) {
            return Promise.resolve(this.systems);
        }

        try {
            // Show main menu
            const { MainMenu } = await import('../ui/MainMenu.js');
            const mainMenu = new MainMenu();
            mainMenu.updateProgress(0.1, 'Initializing...');

            // Phase 0: Initialize foundation systems (StateManager and EventBus)
            const stateManager = new StateManager();
            const eventBus = new EventBus();
            this.systems.stateManager = stateManager;
            this.systems.eventBus = eventBus;
            mainMenu.updateProgress(0.15, 'Setting up core systems...');

            // Phase 1: Core Three.js setup - Create club scene directly
            const renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true,
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Create club scene as main scene
            const clubScene = new THREE.Scene();
            clubScene.background = new THREE.Color(0x0a0a0a); // Dark background for club
            this.systems.scene = clubScene; // Main scene is now club scene
            this.systems.clubScene = clubScene; // Keep for compatibility
            this.systems.renderer = renderer;

            // Create main camera (club camera)
            const viewportAspect = window.innerWidth / window.innerHeight;
            const camera = new THREE.PerspectiveCamera(
                75, // Standard FOV
                viewportAspect,
                0.1,
                100
            );
            // Initial camera position - behind and above avatar spawn point
            // Avatar spawns at (0, 3, 0) then falls to (0, 0.5, 0)
            // Camera should be higher and further back for good overview
            camera.position.set(0, 8, 12); // Behind and above avatar spawn
            camera.lookAt(0, 3, 0); // Look at avatar spawn point
            this.systems.camera = camera; // Main camera
            this.systems.clubCamera = camera; // Keep for compatibility

            // Phase 1.5: Initialize AssetLoader
            const assetLoader = new AssetLoader();
            this.systems.assetLoader = assetLoader;
            mainMenu.updateProgress(0.2, 'Loading assets...');

            // Phase 2: Input managers
            const { inputManager, keybindManager } = InputInitializer.initialize(this.canvas);
            this.systems.inputManager = inputManager;
            this.systems.keys = inputManager.keys; // Movement system expects systems.keys
            this.systems.keybindManager = keybindManager;

            // Phase 3: Scene builders (build club scene)
            mainMenu.updateProgress(0.3, 'Building nightclub...');

            // Setup global WebGL error handler will be done after post-processing is initialized
            // (so we can access systems.postProcessingManager)

            // Simplify materials to prevent texture unit limit errors
            // We'll do this AFTER the scene is built so all materials are created

            // Store initial child count for debugging
            const initialChildren = clubScene.children.length;

            const sceneData = SceneBuilderInitializer.initialize(clubScene);
            Object.assign(this.systems, sceneData);

            // Store environmentEffects in window.gameSystems for UI access
            if (sceneData.environmentEffects && typeof window !== 'undefined') {
                window.gameSystems = window.gameSystems || {};
                window.gameSystems.environmentEffects = sceneData.environmentEffects;
            }

            // Simplify materials after scene is built (all materials should be created now)
            // We'll do another pass after interactive objects are created

            // Debug: Verify nightclub was built
            const finalChildren = clubScene.children.length;
            // eslint-disable-next-line no-console
            console.log('Nightclub scene built', {
                initialChildren: initialChildren,
                finalChildren: finalChildren,
                childrenAdded: finalChildren - initialChildren,
                hasFloor: !!sceneData.floorMaterial,
                hasWalls: !!sceneData.wallMaterial,
                hasStage: !!sceneData.stageMaterial,
                hasDJScreen: !!sceneData.djScreen,
                hasEnvironmentEffects: !!sceneData.environmentEffects,
                sceneBackground: clubScene.background ? clubScene.background.getHex() : 'none',
            });

            if (finalChildren === initialChildren) {
                // eslint-disable-next-line no-console
                console.error(
                    'ERROR: No children were added to the scene! Nightclub was not built.'
                );
            } else if (finalChildren < 10) {
                // eslint-disable-next-line no-console
                console.warn(
                    'WARNING: Very few children in scene. Expected many objects (floor, walls, stage, etc.)'
                );
            }

            // Phase 3.5: Add 3D neon "ERRL CLUB" sign to club scene
            const { NeonText3D } = await import('../scene/NeonText3D.js');
            const neonSign = new NeonText3D(clubScene, {
                text: 'ERRL CLUB',
                position: new THREE.Vector3(0, 8, -6),
                scale: 1.2,
                size: 1.0,
                depth: 0.5,
            });
            this.systems.neonSign = neonSign;

            // Phase 3.6: Add placeholder DJ to club scene
            const { DJPlaceholder } = await import('../entities/DJPlaceholder.js');
            const djPlaceholder = new DJPlaceholder(clubScene);
            this.systems.djPlaceholder = djPlaceholder;

            // Phase 3.7: Add audio-reactive particles for DJ booth
            const { DJBoothParticles } = await import('../effects/DJBoothParticles.js');
            const djBoothParticles = new DJBoothParticles(clubScene);
            this.systems.djBoothParticles = djBoothParticles;

            // Phase 3.8: Add DJ booth lighting system
            const { DJBoothLighting } = await import('../effects/DJBoothLighting.js');
            const djBoothLighting = new DJBoothLighting(clubScene);
            this.systems.djBoothLighting = djBoothLighting;

            // Phase 3.9: Add atmospheric fog effects
            const { AtmosphericFog } = await import('../effects/AtmosphericFog.js');
            const atmosphericFog = new AtmosphericFog(clubScene);
            this.systems.atmosphericFog = atmosphericFog;

            // Phase 3.10: Add laser beam effects
            const { LaserBeams } = await import('../effects/LaserBeams.js');
            const laserBeams = new LaserBeams(clubScene);
            this.systems.laserBeams = laserBeams;

            // Phase 3.11: Add dance floor lighting
            const { DanceFloorLighting } = await import('../effects/DanceFloorLighting.js');
            const danceFloorLighting = new DanceFloorLighting(clubScene);
            this.systems.danceFloorLighting = danceFloorLighting;

            // Phase 3.12: Add club-wide audio visualizer
            const { AudioVisualizer } = await import('../effects/AudioVisualizer.js');
            const audioVisualizer = new AudioVisualizer(clubScene);
            this.systems.audioVisualizer = audioVisualizer;

            // Phase 4: Post-processing (async) - for club scene
            mainMenu.updateProgress(0.4, 'Setting up post-processing...');
            const postProcessingManager = new PostProcessingManager(clubScene, camera, renderer);
            const postProcessingSetup = postProcessingManager.initialize();
            this.systems.postProcessingManager = postProcessingManager;

            // Setup WebGL error handler now that systems are available
            this.setupWebGLErrorHandler(renderer);

            // Phase 5: Avatar (spawn in club scene, will be moved to visualizer room later)
            mainMenu.updateProgress(0.5, 'Creating avatar...');
            const avatar = AvatarInitializer.initialize(clubScene, null); // Use default spawn in club scene
            this.systems.avatar = avatar;
            
            // Debug: Verify avatar is properly created and visible
            if (avatar && avatar.group) {
                console.log('GameInitializer: Avatar created successfully', {
                    position: avatar.position.clone(),
                    inScene: clubScene.children.includes(avatar.group),
                    groupChildren: avatar.group.children.length,
                    meshVisible: avatar.mesh ? avatar.mesh.visible : false,
                });
            } else {
                console.error('GameInitializer: Avatar creation failed - avatar or group is null');
            }

            const multiplayerManager = new MultiplayerManager({
                scene: clubScene, // Use club scene for multiplayer
                stateManager,
                eventBus,
            });
            this.systems.multiplayerManager = multiplayerManager;
            multiplayerManager.setLocalPlayer(avatar, 'player_local');

            // Update state manager with avatar reference
            stateManager.setState('player.avatar', avatar);
            stateManager.setState('game.initialized', true);

            // Phase 6: Core systems (use club scene and camera)
            // Note: LoopManager will be created later in UpdateManager, but we can pass null for now
            // Systems will register themselves when LoopManager becomes available
            mainMenu.updateProgress(0.6, 'Initializing core systems...');
            const coreSystems = await CoreSystemsInitializer.initialize(
                clubScene,
                camera,
                renderer,
                null // LoopManager not available yet - will be set later
            );
            Object.assign(this.systems, coreSystems);

            // Store camera settings in systems for access
            if (coreSystems.cameraController && coreSystems.cameraController.settings) {
                this.systems.cameraSettings = coreSystems.cameraController.settings;
            }

            // Phase 6.5: Room system initialization (use club scene)
            // Note: SettingsManager will be available later, so we'll initialize room state manager after
            mainMenu.updateProgress(0.65, 'Initializing room system...');
            const roomSystem = RoomInitializer.initialize(clubScene, stateManager, eventBus, null);
            this.systems.roomManager = roomSystem.roomManager;
            this.systems.rooms = roomSystem.rooms;

            // Phase 6.6: Room system ready (nightclub is default spawn location)
            // Avatar spawns in nightclub at default position (0, 0.5, 0)
            mainMenu.updateProgress(0.7, 'Room system ready...');

            // Phase 7: Interactive environment (needs systems from Phase 6, use club scene)
            mainMenu.updateProgress(0.75, 'Creating interactive objects...');
            const interactiveObjects = InteractiveEnvironmentInitializer.initialize(
                clubScene,
                avatar,
                this.systems
            );
            Object.assign(this.systems, interactiveObjects);

            // CRITICAL: Simplify materials AFTER all objects are created
            // This includes SceneBuilder, InteractiveEnvironment, and Avatar
            mainMenu.updateProgress(0.8, 'Optimizing materials...');
            const { MaterialSimplifier } = await import('../utils/MaterialSimplifier.js');
            // Convert all materials with textures to MeshBasicMaterial (no texture units)
            MaterialSimplifier.simplifyMaterials(clubScene, true);
            // Check texture unit usage
            const estimatedUnits = MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
            if (estimatedUnits > 14) {
                console.warn(
                    `MaterialSimplifier: Still over texture limit (${estimatedUnits}/16), doing second pass`
                );
                // Second pass to catch any materials that were missed
                MaterialSimplifier.simplifyMaterials(clubScene, true);
                MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
            }

            // Connect doors to room manager if available (for room transitions)
            if (this.systems.roomManager && this.systems.doors) {
                for (const door of this.systems.doors) {
                    if (door.destinationRoom) {
                        door.setRoomTransitionCallback((roomId) => {
                            if (this.systems.roomManager) {
                                this.systems.roomManager.loadRoom(roomId).catch((err) => {
                                    console.warn('Failed to load room:', roomId, err);
                                });
                            }
                        });
                    }
                }
            }

            // Phase 8: Effects and events (use club scene and camera)
            mainMenu.updateProgress(0.75, 'Loading effects...');
            const effects = EffectsInitializer.initialize(
                clubScene,
                camera,
                renderer,
                eventBus,
                this.systems.settingsManager
            );
            Object.assign(this.systems, effects);

            // Phase 8.5: Final material simplification AFTER effects are added
            // Run one more pass to catch any materials added by effects
            // This is the final pass - convert ALL remaining materials to MeshBasicMaterial
            mainMenu.updateProgress(0.78, 'Optimizing materials...');
            MaterialSimplifier.simplifyMaterials(clubScene, true);
            const finalEstimatedUnits = MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
            if (finalEstimatedUnits > 0) {
                console.warn(
                    `MaterialSimplifier: Still ${finalEstimatedUnits} texture units in use after final pass. Some materials may not have been converted.`
                );
            } else {
                // eslint-disable-next-line no-console
                console.log(
                    `MaterialSimplifier: Successfully converted all materials. Texture unit usage: ${finalEstimatedUnits}/16`
                );
            }

            // Connect visual effect settings to post-processing manager if available
            if (effects.visualEffectSettings && this.systems.postProcessingManager) {
                // PostProcessingManager will use visualEffectSettings via VisualEffects
            }

            // Create visual effects that depend on visualEffects system
            if (effects.visualEffects) {
                effects.visualEffects.createSweepingLasers(
                    ROOM_SIZE,
                    6.0,
                    [0xff0000, 0x00ff00, 0x0000ff]
                );
                effects.visualEffects.createHallucinationZone({
                    width: 4,
                    depth: 4,
                    centerX: 0,
                    centerZ: 4,
                    height: 0.1,
                });
            }

            // Phase 8.6: Initialize RareCollectibleTracker early (before audio system creates CollectibleManager)
            const { RareCollectibleTracker } = await import('../systems/RareCollectibleTracker.js');
            const rareCollectibleTracker = new RareCollectibleTracker(this.systems.settingsManager);
            if (eventBus) {
                rareCollectibleTracker.setEventBus(eventBus);
            }
            this.systems.rareCollectibleTracker = rareCollectibleTracker;

            // Phase 9: Audio system (requires user interaction, use club scene)
            mainMenu.updateProgress(0.8, 'Initializing audio...');
            // Pass rareCollectibleTracker to audio system dependencies
            if (!this.systems.audioSystem) {
                // Store in a temporary place for AudioInitializer to access
                this.systems._rareCollectibleTracker = rareCollectibleTracker;
            }
            // Get LoopManager if available (will be created later, but pass null for now)
            const loopManagerForAudio =
                this.systems.updateManager?.getLoopManager(this.systems) || null;
            const audioSystem = AudioInitializer.initialize(
                clubScene,
                effects,
                avatar,
                eventBus,
                this.systems,
                loopManagerForAudio
            );
            this.systems.audioSystem = audioSystem;

            // Connect rare collectible tracker to audio system dependencies
            if (audioSystem.dependencies) {
                audioSystem.dependencies.rareCollectibleTracker = rareCollectibleTracker;
            }

            // Phase 10: UI components
            const ui = UIInitializer.initialize(avatar, this.systems.keybindManager, eventBus);
            Object.assign(this.systems, ui);

            // VibeMeter is already initialized with eventBus in UIInitializer
            // It doesn't have setEventBus, setParticleSystem, or setVisualEffects methods
            // These connections are not needed - VibeMeter works independently

            // InteractionSystem doesn't have setInteractionPrompt or setInteractionFeedback methods
            // The interaction prompt and feedback are handled independently by their respective UI components

            // Initialize InteractiveObjectDiscovery system (after SettingsManager is available)
            if (this.systems.settingsManager) {
                const { InteractiveObjectDiscovery } =
                    await import('../systems/InteractiveObjectDiscovery.js');
                const discoverySystem = new InteractiveObjectDiscovery(
                    this.systems.settingsManager,
                    eventBus
                );
                this.systems.discoverySystem = discoverySystem;

                // Connect discovery system to interaction system
                if (this.systems.interactionSystem) {
                    this.systems.interactionSystem.setDiscoverySystem(discoverySystem);
                }

                // Connect discovery system to discovery map UI
                if (ui.discoveryMap) {
                    ui.discoveryMap.setDiscoverySystem(discoverySystem);
                }

                // Connect discovery system to Errl Phone map tab
                if (this.systems.errlPhone) {
                    // Phone will access discoverySystem from systems
                    this.systems.errlPhone.setSystems(this.systems);
                }

                // Connect room manager to discovery map UI
                if (ui.discoveryMap && this.systems.roomManager) {
                    ui.discoveryMap.setRoomManager(this.systems.roomManager);
                }

                // Register discovery map UI with UI manager
                if (ui.discoveryMap && this.systems.uiManager) {
                    this.systems.uiManager.registerPanel('discoveryMap', ui.discoveryMap);
                }

                // Register room objects with discovery system (after rooms are loaded)
                // This will be done when rooms are actually loaded
            }

            // VisualizerStylePicker doesn't have setVisualEffects method
            // Visual effects are handled independently

            // Register help panel with UI manager if available
            if (ui.helpPanel && this.systems.uiManager) {
                this.systems.uiManager.registerPanel('help', ui.helpPanel);
            }

            // Connect replay recording indicator to replay system
            if (ui.replayRecordingIndicator && this.systems.replaySystem) {
                ui.replayRecordingIndicator.setReplaySystem(this.systems.replaySystem);
            }

            // Connect visual recorder UI to visual recorder
            if (ui.visualRecorderUI && effects.visualRecorder) {
                ui.visualRecorderUI.setVisualRecorder(effects.visualRecorder);
            }

            // Register visual recorder UI with UI manager if available
            if (ui.visualRecorderUI && this.systems.uiManager) {
                this.systems.uiManager.registerPanel('visualRecorder', ui.visualRecorderUI);
            }

            // Connect collection streak system to streak UI (after streak system is initialized)
            // This will be done after CollectionStreakSystem is created

            // RareCollectibleTracker was already initialized in Phase 8.5
            // Ensure it's connected to collectible manager (may be created later by audio system)
            // This connection will also happen in AudioInitializer callback, but ensure it here too
            if (this.systems.collectibleManager && this.systems.rareCollectibleTracker) {
                this.systems.collectibleManager.rareCollectibleTracker =
                    this.systems.rareCollectibleTracker;
            }

            // Also ensure it's in audio system dependencies for when CollectibleManager is created
            if (this.systems.audioSystem && this.systems.audioSystem.dependencies) {
                this.systems.audioSystem.dependencies.rareCollectibleTracker =
                    this.systems.rareCollectibleTracker;
            }

            // Connect systems to Errl Phone (replaces control dock)
            if (ui.errlPhone) {
                this.systems.errlPhone = ui.errlPhone; // Store reference
                // Set systems after all systems are initialized
                // Will be set again after all systems are ready
            }

            // Keep controlDock for backwards compatibility (but it's hidden)
            if (ui.controlDock) {
                this.systems.controlDock = ui.controlDock; // Store reference
                ui.controlDock.setSystems(this.systems);
            }

            // Connect camera settings to camera intensity indicator
            if (ui.cameraIntensityIndicator && this.systems.cameraSettings) {
                ui.cameraIntensityIndicator.setCameraSettings(this.systems.cameraSettings);
                ui.cameraIntensityIndicator.show(); // Show by default

                // Set click handler to open camera settings
                ui.cameraIntensityIndicator.setClickHandler(() => {
                    // Trigger the camera settings keybind
                    if (this.systems.keybindManager) {
                        // Simulate Shift+C keypress
                        const event = new KeyboardEvent('keydown', {
                            key: 'c',
                            shiftKey: true,
                            bubbles: true,
                        });
                        document.dispatchEvent(event);
                    }
                });
            }

            // Phase 10.5: Initialize SettingsManager and load camera settings
            const { SettingsManager } = await import('../config/SettingsManager.js');
            const settingsManager = new SettingsManager();
            this.systems.settingsManager = settingsManager;

            // Connect SettingsManager to visual effect settings if available
            if (this.systems.visualEffectSettings && settingsManager) {
                this.systems.visualEffectSettings.settingsManager = settingsManager;
                // Only load if settingsManager has a get method
                if (typeof settingsManager.get === 'function') {
                    this.systems.visualEffectSettings.load();
                }
            }

            // Initialize UI Scaling System
            const { UIScalingSystem } = await import('../ui/UIScalingSystem.js');
            const uiScalingSystem = new UIScalingSystem(settingsManager, this.systems.uiManager);
            this.systems.uiScalingSystem = uiScalingSystem;

            // Make globally available for BasePanel access
            if (typeof window !== 'undefined') {
                window.uiScalingSystem = uiScalingSystem;
            }

            // Connect to UIManager if available
            if (this.systems.uiManager) {
                this.systems.uiManager.setScalingSystem(uiScalingSystem);
            }

            // Initialize AudioSettings
            const { AudioSettings } = await import('../config/AudioSettings.js');
            const audioSettings = new AudioSettings(settingsManager);
            this.systems.audioSettings = audioSettings;

            // Initialize CollectionTracker
            const { CollectionTracker } = await import('../systems/CollectionTracker.js');
            const collectionTracker = new CollectionTracker(settingsManager);
            if (this.systems.eventBus) {
                collectionTracker.setEventBus(this.systems.eventBus);
            }
            this.systems.collectionTracker = collectionTracker;

            // Initialize CollectionStatistics
            const { CollectionStatistics } = await import('../systems/CollectionStatistics.js');
            const collectionStatistics = new CollectionStatistics(
                collectionTracker,
                settingsManager
            );
            if (this.systems.eventBus) {
                collectionStatistics.setEventBus(this.systems.eventBus);
            }
            this.systems.collectionStatistics = collectionStatistics;

            // Initialize CollectionStreakSystem
            const { CollectionStreakSystem } = await import('../systems/CollectionStreakSystem.js');
            const collectionStreakSystem = new CollectionStreakSystem(
                this.systems.eventBus,
                settingsManager
            );
            this.systems.collectionStreakSystem = collectionStreakSystem;

            // Connect collection streak system to streak UI
            if (this.systems.collectionStreakUI && collectionStreakSystem) {
                this.systems.collectionStreakUI.streakSystem = collectionStreakSystem;
            }

            // Register collection streak UI with UI manager
            if (this.systems.collectionStreakUI && this.systems.uiManager) {
                this.systems.uiManager.registerPanel(
                    'collectionStreak',
                    this.systems.collectionStreakUI
                );
            }

            // Connect streak system to collection progress UI
            if (this.systems.collectionProgressUI && collectionStreakSystem) {
                this.systems.collectionProgressUI.streakSystem = collectionStreakSystem;
            }

            // Initialize FragmentProgressionSystem
            const { FragmentProgressionSystem } =
                await import('../systems/FragmentProgressionSystem.js');
            const fragmentProgression = new FragmentProgressionSystem({
                collectionTracker: collectionTracker,
                settingsManager: settingsManager,
                eventBus: this.systems.eventBus,
            });
            this.systems.fragmentProgression = fragmentProgression;

            // Initialize AchievementSystem
            const { AchievementSystem } = await import('../systems/AchievementSystem.js');
            const achievementSystem = new AchievementSystem({
                settingsManager: settingsManager,
                eventBus: this.systems.eventBus,
            });
            this.systems.achievementSystem = achievementSystem;

            // Connect collection tracker to audio system (for collectible manager)
            if (this.systems.audioSystem && this.systems.audioSystem.dependencies) {
                this.systems.audioSystem.dependencies.collectionTracker = collectionTracker;
            }

            // Initialize VisualPreferences
            const { VisualPreferences } = await import('../config/VisualPreferences.js');
            const visualPreferences = new VisualPreferences(settingsManager);
            this.systems.visualPreferences = visualPreferences;

            // Initialize VisualEffectSettings
            const { VisualEffectSettings } = await import('../config/VisualEffectSettings.js');
            const visualEffectSettings = new VisualEffectSettings(settingsManager);
            this.systems.visualEffectSettings = visualEffectSettings;

            // Connect visual preferences to systems
            // VisualEffects doesn't have setVisualPreferences method
            // VisualizerStylePicker doesn't have setVisualPreferences method
            // These are handled independently
            if (this.systems.postProcessingManager) {
                this.systems.postProcessingManager.setVisualPreferences(visualPreferences);
            }

            // Connect visual effect settings to systems
            if (effects.visualEffects && visualEffectSettings) {
                // Apply initial UV intensity if UV mode is enabled
                const uvEnabled = visualPreferences.getPreferences().uvMode || false;
                if (uvEnabled) {
                    const uvIntensity = visualEffectSettings.getSetting('uvModeIntensity');
                    effects.visualEffects.setUVMode(true, uvIntensity);
                }
            }
            if (this.systems.postProcessingManager && visualEffectSettings) {
                // Apply initial glitch intensity if glitch mode is enabled
                const glitchEnabled = visualPreferences.getPreferences().glitchMode || false;
                if (glitchEnabled) {
                    const glitchIntensity = visualEffectSettings.getSetting('glitchIntensity');
                    this.systems.postProcessingManager.setGlitchEnabled(true, glitchIntensity);
                }
            }

            // Load and apply saved visual preferences
            const savedPreferences = visualPreferences.getPreferences();
            if (effects.visualEffects) {
                effects.visualEffects.setUVMode(savedPreferences.uvMode);
            }
            if (ui.visualizerStylePicker) {
                ui.visualizerStylePicker.setStyle(savedPreferences.visualizerStyle);
            }
            if (this.systems.postProcessingManager) {
                this.systems.postProcessingManager.setGlitchEnabled(savedPreferences.glitchMode);
            }

            // Load camera settings from persistence
            if (this.systems.cameraSettings) {
                const savedCameraSettings = settingsManager.getSetting('camera', null);
                if (savedCameraSettings) {
                    this.systems.cameraSettings.import(JSON.stringify(savedCameraSettings));
                    if (this.systems.cameraController) {
                        this.systems.cameraController.updateSettings();
                    }
                } else {
                    // Save default camera settings
                    const defaultSettings = this.systems.cameraSettings.export();
                    settingsManager.setSetting('camera', JSON.parse(defaultSettings));
                }

                // Update camera intensity indicator after loading settings
                if (this.systems.cameraIntensityIndicator) {
                    this.systems.cameraIntensityIndicator.update();
                }

                // Subscribe to camera settings changes for persistence
                // (Settings will be saved when changed via UI)
            }

            // Phase 11: Setup resize handler (with systems for club camera updates)
            SetupInitializer.setupResizeHandler(
                inputManager,
                camera,
                renderer,
                postProcessingManager,
                this.systems
            );

            // Phase 12: Setup showControls function
            SetupInitializer.setupShowControls(keybindManager);

            // Phase 13: Register keybinds
            SetupInitializer.registerKeybinds(keybindManager, this.systems);

            // Phase 14: Setup mouse controls
            SetupInitializer.setupMouseControls(
                inputManager,
                coreSystems.cameraController,
                this.systems.interactionSystem
            );

            // Phase 15: Initialize GameLoop after post-processing is ready
            await postProcessingSetup;
            postProcessingManager.setupSSAO();

            // Post-processing is ready

            // GameLoop uses club scene directly (but don't start it yet - wait for ready button)
            mainMenu.updateProgress(0.9, 'Preparing game...');
            const { gameLoop, systemsForUpdate, updateManager } =
                SetupInitializer.initializeGameLoop(
                    postProcessingManager,
                    renderer,
                    clubScene, // Main scene (club) for rendering
                    camera, // Main camera
                    this.systems
                );
            this.systems.gameLoop = gameLoop;
            this.systems.systemsForUpdate = systemsForUpdate;
            this.systems.updateManager = updateManager; // Store UpdateManager for DevMenu access

            // Initialize LoopManager and register systems that support it
            const loopManager = updateManager.getLoopManager(this.systems);
            if (loopManager) {
                // Register systems that extend SystemLoop
                if (
                    this.systems.particleSystem &&
                    typeof this.systems.particleSystem.register === 'function'
                ) {
                    this.systems.particleSystem.register(loopManager);
                }
                if (
                    this.systems.physicsSystem &&
                    typeof this.systems.physicsSystem.register === 'function'
                ) {
                    this.systems.physicsSystem.register(loopManager);
                }
                if (
                    this.systems.audioSystem &&
                    typeof this.systems.audioSystem.register === 'function'
                ) {
                    this.systems.audioSystem.register(loopManager);
                }
                // Register CollectibleManager if it exists
                // Note: CollectibleManager may be created by AudioSystem.initialize() later
                // If it's created after this point, it will need to be registered manually
                if (
                    this.systems.collectibleManager &&
                    typeof this.systems.collectibleManager.register === 'function'
                ) {
                    this.systems.collectibleManager.register(loopManager);
                }

                // Also update AudioSystem's loopManager reference so it can pass it to CollectibleManager
                if (this.systems.audioSystem) {
                    this.systems.audioSystem.loopManager = loopManager;
                }
                if (
                    this.systems.interactionSystem &&
                    typeof this.systems.interactionSystem.register === 'function'
                ) {
                    this.systems.interactionSystem.register(loopManager);
                }

                // Create and register AudioReactiveLoop
                const { AudioReactiveLoop } = await import('../systems/AudioReactiveLoop.js');
                const audioReactiveLoop = new AudioReactiveLoop(loopManager);
                this.systems.audioReactiveLoop = audioReactiveLoop;

                // Create and register EnvironmentLoop
                const { EnvironmentLoop } = await import('../systems/EnvironmentLoop.js');
                const environmentLoop = new EnvironmentLoop(loopManager);
                this.systems.environmentLoop = environmentLoop;
            }

            // Don't start the game loop yet - wait for ready button

            // Phase 16: Register interactive objects (after all systems are ready, use club scene)
            SetupInitializer.initializeInteractiveRegistration(clubScene, avatar, this.systems);

            // Phase 16.5: Connect collection tracker and statistics to collectible manager if it exists
            if (this.systems.collectibleManager) {
                if (this.systems.collectionTracker) {
                    this.systems.collectibleManager.setCollectionTracker(
                        this.systems.collectionTracker
                    );
                }
                if (this.systems.collectionStatistics) {
                    this.systems.collectibleManager.setCollectionStatistics(
                        this.systems.collectionStatistics
                    );
                }
                if (this.systems.fragmentProgression) {
                    this.systems.collectibleManager.setFragmentProgression(
                        this.systems.fragmentProgression
                    );
                }
                if (this.systems.vibeMeter) {
                    this.systems.collectibleManager.setVibeMeter(this.systems.vibeMeter);
                }
            }

            // Apply fragment unlocks to game systems
            if (this.systems.fragmentProgression) {
                this.systems.fragmentProgression.applyUnlocks(this.systems);
            }

            // Phase 17: Initialize audio on user interaction
            SetupInitializer.setupAudioInitialization(audioSystem);

            // Initialize GraphicsSettings (needed for DevTools)
            if (!this.systems.graphicsSettings) {
                const { GraphicsSettings } = await import('../config/GraphicsSettings.js');
                const graphicsSettings = new GraphicsSettings(this.systems.settingsManager);
                this.systems.graphicsSettings = graphicsSettings;

                // Apply quality settings to effect systems
                const settings = graphicsSettings.getSettings();
                if (this.systems.djBoothParticles) {
                    this.systems.djBoothParticles.setQuality(
                        settings.effectQuality,
                        settings.particleMultiplier
                    );
                }
                if (this.systems.atmosphericFog) {
                    this.systems.atmosphericFog.setQuality(
                        settings.effectQuality,
                        settings.particleMultiplier
                    );
                }
            }

            // Phase 18: Initialize dev tools
            const { DevTools } = await import('../dev/DevTools.js');
            const { DebugOverlay } = await import('../dev/DebugOverlay.js');
            const { DebugCommands } = await import('../dev/DebugCommands.js');
            const { TestMode } = await import('../dev/TestMode.js');

            const devTools = new DevTools(clubScene, this.systems);
            const debugOverlay = new DebugOverlay(clubScene);
            const debugCommands = new DebugCommands(this.systems);
            const testMode = new TestMode(clubScene, this.systems);
            testMode.setup();

            this.systems.devTools = devTools;
            this.systems.debugOverlay = debugOverlay;
            this.systems.debugCommands = debugCommands;
            this.systems.testMode = testMode;

            // Make devTools globally available
            if (typeof window !== 'undefined') {
                if (!window.gameSystems) {
                    window.gameSystems = {};
                }
                window.gameSystems.devTools = devTools;
            }

            // Phase 18.5: Initialize DevMenu
            const { DevMenu } = await import('../dev/DevMenu.js');
            const devMenu = new DevMenu(this.systems);
            devMenu.setSystems(this.systems);
            this.systems.devMenu = devMenu;

            // Register DevMenu with UI manager if available
            if (this.systems.uiManager) {
                this.systems.uiManager.registerPanel('devMenu', devMenu);
            }

            // Update Errl Phone systems reference
            if (this.systems.errlPhone) {
                this.systems.errlPhone.setSystems(this.systems);
            }

            // Update ControlDock systems reference to include DevMenu (backwards compatibility)
            if (this.systems.controlDock) {
                this.systems.controlDock.setSystems(this.systems);
            }

            // Phase 19.5: Initialize Ready Prompt (shows on every load)
            // DISABLED FOR NOW - can be re-enabled later
            // const { ReadyPrompt } = await import('../ui/ReadyPrompt.js');
            // const readyPrompt = new ReadyPrompt(() => {
            //     // Enable movement when user clicks "Yes"
            //     stateManager.setState('game.movementDisabled', false);
            //     // Start tutorial if first-time player (after ready prompt)
            //     if (this.systems.tutorialSystem && this.systems.tutorialSystem.isFirstTimePlayer()) {
            //         setTimeout(() => {
            //             this.systems.tutorialSystem.startFirstTimeTutorial();
            //         }, 500);
            //     }
            // });
            // this.systems.readyPrompt = readyPrompt;
            //
            // // Disable movement until ready
            // stateManager.setState('game.movementDisabled', true);
            //
            // // Show ready prompt immediately
            // readyPrompt.show();
            this.systems.readyPrompt = null; // Disabled for now
            // Don't disable movement - allow immediate play
            stateManager.setState('game.movementDisabled', false);

            // Phase 19.6: Initialize Tutorial System
            const { TutorialSystem } = await import('../ui/TutorialSystem.js');
            const tutorialSystem = new TutorialSystem({
                systems: this.systems,
                settingsManager: settingsManager,
            });
            this.systems.tutorialSystem = tutorialSystem;

            // Phase 19: Initialize network systems (optional)
            // Network is only initialized if networkConfig is provided
            // This allows the game to work in single-player mode
            const networkConfig = this.getNetworkConfig();
            const networkSystems = await NetworkInitializer.initialize(eventBus, networkConfig);
            if (networkSystems) {
                this.systems.networkClient = networkSystems.networkClient;
                this.systems.networkEventBus = networkSystems.networkEventBus;

                const localPlayerId = NetworkInitializer.generatePlayerId();
                this.systems.localPlayerId = localPlayerId;
                stateManager.setState('multiplayer.localPlayerId', localPlayerId);

                if (this.systems.multiplayerManager) {
                    const multiplayerManager = this.systems.multiplayerManager;
                    multiplayerManager.setLocalPlayerId(localPlayerId);
                    multiplayerManager.setNetworkClient(
                        networkSystems.networkClient,
                        networkSystems.networkEventBus
                    );
                }

                // Enable network support on game systems
                NetworkInitializer.enableNetworkOnSystems(
                    this.systems,
                    networkSystems,
                    localPlayerId
                );

                // Store in state manager
                stateManager.setState('multiplayer.connected', false);
                stateManager.setState('multiplayer.connectionState', 'disconnected');
            }

            this.initialized = true;
            // eslint-disable-next-line no-console
            console.log('Game initialized successfully');

            // Expose systems to window for browser testing
            if (typeof window !== 'undefined') {
                window.gameSystems = this.systems;
                window.stateManager = stateManager;
                window.eventBus = eventBus;
                // eslint-disable-next-line no-console
                console.log(
                    'Systems exposed to window.gameSystems, window.stateManager, window.eventBus'
                );
                // eslint-disable-next-line no-console
                console.log('Dev tools available - Press F1 or Ctrl+D to toggle debug overlay');
                
                // Add debug tools
                window.debug = {
                    checkAvatar: () => {
                        const avatar = this.systems.avatar;
                        if (!avatar) {
                            console.error('Debug: Avatar is null');
                            return false;
                        }
                        console.log('Debug: Avatar check', {
                            exists: !!avatar,
                            position: avatar.position.clone(),
                            inScene: this.systems.scene && avatar.group && this.systems.scene.children.includes(avatar.group),
                            meshVisible: avatar.mesh ? avatar.mesh.visible : false,
                            groupChildren: avatar.group ? avatar.group.children.length : 0,
                        });
                        return true;
                    },
                    checkMovement: () => {
                        console.log('Debug: Movement system check', {
                            hasKeys: !!this.systems.keys,
                            hasAvatar: !!this.systems.avatar,
                            hasPhysicsSystem: !!this.systems.physicsSystem,
                            hasCollisionSystem: !!this.systems.collisionSystem,
                            hasParticleSystem: !!this.systems.particleSystem,
                            hasUpdateManager: !!this.systems.updateManager,
                            loopManagerInitialized: this.systems.updateManager && this.systems.updateManager.loopManager ? true : false,
                            keyStates: this.systems.keys ? {
                                w: this.systems.keys.w,
                                a: this.systems.keys.a,
                                s: this.systems.keys.s,
                                d: this.systems.keys.d,
                            } : null,
                        });
                    },
                    checkColor: () => {
                        const ppm = this.systems.postProcessingManager;
                        if (!ppm) {
                            console.error('Debug: PostProcessingManager is null');
                            return;
                        }
                        if (ppm.colorGradingPass && ppm.colorGradingPass.material) {
                            const uniforms = ppm.colorGradingPass.material.uniforms;
                            console.log('Debug: Color grading settings', {
                                enabled: ppm.colorGradingPass.enabled,
                                intensity: uniforms.intensity.value,
                                saturation: uniforms.saturation.value,
                                brightness: uniforms.brightness.value,
                                contrast: uniforms.contrast.value,
                            });
                        } else {
                            console.log('Debug: Color grading pass not found or not initialized');
                        }
                    },
                    checkSystems: () => {
                        console.log('Debug: All systems check', {
                            avatar: !!this.systems.avatar,
                            keys: !!this.systems.keys,
                            physicsSystem: !!this.systems.physicsSystem,
                            collisionSystem: !!this.systems.collisionSystem,
                            particleSystem: !!this.systems.particleSystem,
                            scene: !!this.systems.scene,
                            camera: !!this.systems.camera,
                            renderer: !!this.systems.renderer,
                            updateManager: !!this.systems.updateManager,
                            gameLoop: !!this.systems.gameLoop,
                            postProcessingManager: !!this.systems.postProcessingManager,
                        });
                    },
                };
                // eslint-disable-next-line no-console
                console.log('Debug tools available: window.debug.checkAvatar(), window.debug.checkMovement(), window.debug.checkColor(), window.debug.checkSystems()');
            }

            // Show ready button and wait for user to press it
            mainMenu.updateProgress(1.0, '');

            // Set up ready callback - start game loop when ready button is pressed
            return new Promise((resolve) => {
                const startGame = async () => {
                    // eslint-disable-next-line no-console
                    console.log('Player pressed ready - starting game loop');

                    // CRITICAL: Final material simplification pass BEFORE first render
                    // This catches any materials created after initialization
                    // eslint-disable-next-line no-console
                    console.log('MaterialSimplifier: Running pre-render simplification pass...');
                    const { MaterialSimplifier } = await import('../utils/MaterialSimplifier.js');
                    const beforeUnits = MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
                    MaterialSimplifier.simplifyMaterials(clubScene, true);
                    const afterUnits = MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
                    // eslint-disable-next-line no-console
                    console.log(
                        `MaterialSimplifier: Pre-render pass complete. Before: ${beforeUnits}/16, After: ${afterUnits}/16`
                    );

                    if (afterUnits > 0) {
                        // eslint-disable-next-line no-console
                        console.warn(
                            `MaterialSimplifier: Still ${afterUnits} texture units in use after pre-render pass. Running additional pass.`
                        );
                        MaterialSimplifier.simplifyMaterials(clubScene, true);
                        const finalUnits = MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
                        // eslint-disable-next-line no-console
                        console.log(
                            `MaterialSimplifier: After second pass: ${finalUnits}/16 texture units in use`
                        );
                        if (finalUnits > 0) {
                            // eslint-disable-next-line no-console
                            console.warn(
                                `MaterialSimplifier: WARNING - Still ${finalUnits} texture units in use. Some materials may not have been converted.`
                            );
                        }
                    }

                    // CRITICAL: Snap camera to avatar BEFORE starting game loop
                    // This ensures the camera is properly centered from the first frame
                    if (this.systems.cameraController && this.systems.avatar) {
                        this.systems.cameraController.snapBehindAvatar(this.systems.avatar);
                        // eslint-disable-next-line no-console
                        console.log('Camera positioned behind avatar BEFORE game loop start');
                    }

                    // Start the game loop now that player is ready
                    if (this.systems.gameLoop) {
                        try {
                            this.systems.gameLoop.start();
                            // eslint-disable-next-line no-console
                            console.log('Game loop started successfully');

                            // Wait a moment to ensure game loop is running, then hide loading screen
                            // This gives the game time to initialize and prevents the screen from disappearing too quickly
                            setTimeout(() => {
                                // Verify game loop is actually running
                                if (this.systems.gameLoop && this.systems.gameLoop.isRunning) {
                                    // eslint-disable-next-line no-console
                                    console.log(
                                        'Game loop confirmed running - hiding loading screen'
                                    );

                                    // Camera was already snapped before game loop started
                                    // No need for delayed snap here

                                    if (mainMenu) {
                                        // eslint-disable-next-line no-console
                                        console.log('GameInitializer: Calling mainMenu.hide()', {
                                            hasHideMethod: typeof mainMenu.hide === 'function',
                                            hasContainer: !!mainMenu.container,
                                        });
                                        try {
                                            mainMenu.hide();
                                        } catch (error) {
                                            console.error(
                                                'GameInitializer: Error calling mainMenu.hide():',
                                                error
                                            );
                                            // Fallback: try to hide manually
                                            const mainMenuElement =
                                                document.getElementById('main-menu');
                                            if (mainMenuElement) {
                                                mainMenuElement.style.display = 'none';
                                                mainMenuElement.style.pointerEvents = 'none';
                                                mainMenuElement.style.opacity = '0';
                                            }
                                        }

                                        // Verify loading screen is actually hidden after a short delay
                                        setTimeout(() => {
                                            const mainMenuElement =
                                                document.getElementById('main-menu');
                                            if (mainMenuElement) {
                                                const computedStyle =
                                                    window.getComputedStyle(mainMenuElement);
                                                const isVisible =
                                                    computedStyle.display !== 'none' &&
                                                    computedStyle.opacity !== '0' &&
                                                    mainMenuElement.parentNode !== null;

                                                if (isVisible) {
                                                    console.warn(
                                                        'GameInitializer: Loading screen still visible after hide() - forcing removal'
                                                    );
                                                    // Force remove the loading screen
                                                    mainMenuElement.style.display = 'none';
                                                    mainMenuElement.style.pointerEvents = 'none';
                                                    mainMenuElement.style.opacity = '0';
                                                    if (mainMenuElement.parentNode) {
                                                        mainMenuElement.parentNode.removeChild(
                                                            mainMenuElement
                                                        );
                                                    }
                                                } else {
                                                    // eslint-disable-next-line no-console
                                                    console.log(
                                                        'GameInitializer: Loading screen successfully hidden'
                                                    );
                                                }
                                            } else {
                                                // eslint-disable-next-line no-console
                                                console.log(
                                                    'GameInitializer: Loading screen element removed from DOM'
                                                );
                                            }
                                        }, 1500); // Check after fade should complete (800ms) + buffer
                                    }
                                } else {
                                    console.warn(
                                        'Game loop may not be running - keeping main menu visible'
                                    );
                                    // Keep main menu visible if game loop didn't start properly
                                    if (mainMenu && mainMenu.readyButton) {
                                        mainMenu.readyButton.textContent = 'ERROR - CHECK CONSOLE';
                                        mainMenu.readyButton.style.cursor = 'not-allowed';
                                    }
                                }
                            }, 1000); // Give game 1 second to start
                        } catch (error) {
                            console.error('Failed to start game loop:', error);
                            // Show error but keep main menu visible
                            if (mainMenu) {
                                mainMenu.showError(error);
                            }
                        }
                    } else {
                        console.error('Game loop not found in systems!', {
                            systems: Object.keys(this.systems),
                            gameLoop: this.systems.gameLoop,
                        });
                        // Show error on main menu
                        if (mainMenu) {
                            mainMenu.showError(new Error('Game loop not found in systems'));
                        }
                    }

                    resolve(this.systems);
                };
                
                // Set up the callback
                mainMenu.setOnReady(startGame);
                
                // AUTO-START FOR TESTING: Start game automatically after 500ms
                // Remove this for production - user should click "Start game" button
                setTimeout(() => {
                    // eslint-disable-next-line no-console
                    console.log('Auto-starting game for testing...');
                    startGame();
                }, 500);
            });
        } catch (error) {
            console.error('Game initialization failed:', error);
            // Show error on main menu if it exists
            try {
                const { MainMenu } = await import('../ui/MainMenu.js');
                // Try to get existing main menu instance
                const existingMenu = document.querySelector('#main-menu');
                if (existingMenu) {
                    // Find the MainMenu instance if available, or create error display
                    const errorContainer = document.getElementById('main-menu-error-container');
                    if (!errorContainer) {
                        // Create a temporary main menu just to show the error
                        const tempMenu = new MainMenu();
                        tempMenu.showError(error);
                    }
                }
            } catch (menuError) {
                console.error('Failed to show error on main menu:', menuError);
            }
            throw error;
        }
    }

    // Note: All initialization logic has been moved to dedicated initializer modules
    // in src/core/initializers/

    /**
     * Get initialized systems
     */
    getSystems() {
        return this.systems;
    }

    /**
     * Setup WebGL error handler to catch and handle WebGL errors globally
     * @param {THREE.WebGLRenderer} renderer - WebGL renderer instance
     */
    setupWebGLErrorHandler(renderer) {
        if (!renderer || !renderer.getContext) {
            return;
        }

        const gl = renderer.getContext();
        if (!gl) {
            return;
        }

        // Capture reference to this for use in closures
        const gameInitializer = this;

        // Helper to get error name
        const getErrorName = function (error) {
            const errorNames = {
                [gl.NO_ERROR]: 'NO_ERROR',
                [gl.INVALID_ENUM]: 'INVALID_ENUM',
                [gl.INVALID_VALUE]: 'INVALID_VALUE',
                [gl.INVALID_OPERATION]: 'INVALID_OPERATION',
                [gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
                [gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
                [gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL',
            };
            return errorNames[error] || `UNKNOWN_ERROR_${error}`;
        };

        // Store original getError function
        const originalGetError = gl.getError.bind(gl);
        let errorCount = 0;
        const maxErrors = 10; // Limit error logging to prevent spam

        // Override getError to catch errors
        gl.getError = function () {
            const error = originalGetError();
            if (error !== gl.NO_ERROR && errorCount < maxErrors) {
                errorCount++;
                const errorName = getErrorName(error);

                // Suppress WebGL error logging during test mode
                const isTestMode =
                    typeof window !== 'undefined' &&
                    (window.__PLAYWRIGHT_TEST__ || navigator.webdriver);

                if (!isTestMode) {
                    console.error(
                        `WebGL Error (${errorCount}/${maxErrors}): ${errorName} (${error})`
                    );
                }

                // If it's a texture or shader error, disable post-processing
                if (error === gl.INVALID_OPERATION || error === gl.INVALID_VALUE) {
                    // These often indicate texture unit or shader issues
                    if (gameInitializer.systems && gameInitializer.systems.postProcessingManager) {
                        if (!gameInitializer.systems.postProcessingManager.textureErrorDetected) {
                            if (!isTestMode) {
                                console.error(
                                    'WebGL: Detected texture/shader error, disabling post-processing'
                                );
                            }
                            gameInitializer.systems.postProcessingManager.postProcessingEnabled = false;
                            gameInitializer.systems.postProcessingManager.textureErrorDetected = true;
                            gameInitializer.systems.postProcessingManager.disableAllPasses();
                        }
                    }
                }
            }
            return error;
        };

        // Listen for context lost events
        gl.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.error(
                'WebGL: Context lost! This may be due to texture unit limits or GPU issues.'
            );
            if (gameInitializer.systems && gameInitializer.systems.postProcessingManager) {
                gameInitializer.systems.postProcessingManager.postProcessingEnabled = false;
                gameInitializer.systems.postProcessingManager.textureErrorDetected = true;
            }
        });

        // Listen for context restored events
        gl.canvas.addEventListener('webglcontextrestored', () => {
            // eslint-disable-next-line no-console
            console.log('WebGL: Context restored');
            // Note: Post-processing will remain disabled after context loss
        });

        // eslint-disable-next-line no-console
        console.log('WebGL error handler installed');
    }

    /**
     * Get network configuration (if any)
     * Can be overridden or set via environment/config
     * @returns {Object|null} Network configuration or null
     * @private
     */
    getNetworkConfig() {
        // Check for network config in various places:
        // 1. Window config (for browser testing)
        // 2. Environment variable (if available)
        // 3. SettingsManager (if available)

        // For now, return null (single-player mode)
        // In production, this would check for actual network config
        if (typeof window !== 'undefined' && window.networkConfig) {
            return window.networkConfig;
        }

        // Note: Environment config would need to be loaded asynchronously
        // For now, we only check window.networkConfig
        // Environment config can be added later if needed

        return null;
    }
}
