/**
 * SetupInitializer - Handles setup and configuration functions
 */
import * as THREE from 'three';
import { UpdateManager } from '../UpdateManager.js';
import { GameLoop } from '../GameLoop.js';
import { CameraConsole } from '../../interactions/CameraConsole.js';
import { LightingConsole } from '../../interactions/LightingConsole.js';
import { ThrowableDrip } from '../../interactions/ThrowableDrip.js';
import { ROOM_SIZE } from '../../config/constants.js';

export class SetupInitializer {
    /**
     * Setup resize handler
     * @param {InputManager} inputManager - The input manager instance
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     * @param {PostProcessingManager} postProcessingManager - The post-processing manager
     */
    static setupResizeHandler(
        inputManager,
        camera,
        renderer,
        postProcessingManager,
        systems = null
    ) {
        inputManager.onResize(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Prevent division by zero
            if (width <= 0 || height <= 0) {
                return;
            }

            const viewportAspect = width / height;

            // Update main camera
            camera.aspect = viewportAspect;
            camera.updateProjectionMatrix();

            // Update club camera if available
            if (systems && systems.clubCamera) {
                // Check if transition is complete (we're inside the TV)
                const transitionComplete =
                    !systems.tvTransitionSystem || !systems.tvTransitionSystem.isInProgress();

                if (transitionComplete) {
                    // Update club camera to match full viewport
                    systems.clubCamera.aspect = viewportAspect;
                    systems.clubCamera.updateProjectionMatrix();
                } else {
                    // During transition, keep TV screen aspect ratio
                    systems.clubCamera.aspect = 1920 / 1080;
                    systems.clubCamera.updateProjectionMatrix();
                }
            }

            // Update renderer size
            renderer.setSize(width, height);

            // Update post-processing composer if available
            if (postProcessingManager && postProcessingManager.getComposer()) {
                postProcessingManager.getComposer().setSize(width, height);
            }

            // Log resize for debugging (only in dev mode)
            if (
                !window.__PLAYWRIGHT_TEST__ &&
                !navigator.webdriver &&
                window.DEBUG_GAMELOOP !== false
            ) {
                console.log('Window resized:', { width, height, aspect: viewportAspect });
            }
        });
    }

    /**
     * Setup window.showControls function
     * @param {KeybindManager} keybindManager - The keybind manager instance
     */
    static setupShowControls(keybindManager) {
        window.showControls = function () {
            console.log(
                '%c=== ERRL CLUB SIMULATOR - CONTROLS ===',
                'font-size: 16px; font-weight: bold; color: #00ffff;'
            );
            console.log('');

            const keybinds = keybindManager.getAllKeybinds();

            console.log('%cMOVEMENT:', 'font-weight: bold; color: #00ff00;');
            console.log('  WASD          - Move avatar (W=forward, S=backward, A=left, D=right)');
            console.log('  Shift + WASD  - Run (faster movement)');
            console.log('  Ctrl          - Crouch');
            console.log('  Space         - Hop/Jump');
            console.log('  Shift + Space - Dash');
            console.log('  Shift + D     - Dance');
            console.log('');

            console.log('%cCAMERA:', 'font-weight: bold; color: #00ff00;');
            console.log('  Mouse Drag    - Orbit camera around avatar');
            console.log('  Scroll Wheel  - Zoom in/out');
            console.log('  1, 2, 3       - Camera presets');
            console.log('  R             - Snap camera behind avatar');
            console.log('  C             - Toggle cinematic mode');
            console.log('  F             - Toggle freecam mode');
            console.log('  L             - Toggle lock-on mode');
            console.log('  F2            - Open camera intensity settings');
            console.log('  Shift+1/2/3    - Set camera intensity (Low/Medium/High)');
            console.log('  Ctrl+I        - Cycle camera intensity (Low→Medium→High)');
            console.log('');

            console.log('%cINTERACTIONS:', 'font-weight: bold; color: #00ff00;');
            console.log('  E             - Interact with objects');
            console.log('  Tab           - Open emote wheel');
            console.log('  T             - Toggle replay recording');
            console.log('  G             - Spawn ghost replay');
            console.log('  Y             - Teleport to nearest anchor');
            console.log('');

            console.log('%cVISUAL EFFECTS:', 'font-weight: bold; color: #00ff00;');
            console.log('  U             - Toggle UV/blacklight mode');
            console.log('  V             - Toggle visualizer style picker');
            console.log('  Shift + G     - Toggle glitch mode');
            console.log('  Ctrl + R      - Toggle visual recording');
            console.log('  I             - Trigger color inversion flash');
            console.log('');

            console.log('%cEVENTS:', 'font-weight: bold; color: #00ff00;');
            console.log('  B             - Trigger blackout event');
            console.log('  Shift + S     - Trigger strobe event');
            console.log('  Shift + W     - Trigger wave event');
            console.log('');

            console.log('%cCOLLECTIBLES:', 'font-weight: bold; color: #00ff00;');
            console.log('  F3            - Open collection progress');
            console.log('  F4            - Toggle quick settings menu');
            console.log('  F5            - Restart tutorial');
            console.log('  F6            - Open audio settings');
            console.log('');

            console.log('%cDEBUG:', 'font-weight: bold; color: #00ff00;');
            console.log('  F1            - Show debug info');
            console.log('  ? or Shift+F1 - Show this controls help');
            console.log('');

            console.log('%c=== END CONTROLS ===', 'font-size: 12px; color: #888;');
        };
    }

    /**
     * Register all keybinds
     * @param {KeybindManager} keybindManager - The keybind manager instance
     * @param {Object} systems - Systems object containing all game systems
     */
    static registerKeybinds(keybindManager, systems) {
        const {
            avatar,
            interactionSystem,
            cameraController,
            replaySystem,
            teleportSystem,
            eventSystem,
            visualEffects,
            postProcessingManager,
            visualRecorder,
            visualizerStylePicker,
            seatableObjects,
            scene,
            camera,
            inputManager,
        } = systems;

        // Movement keybinds
        keybindManager.registerKeybind(
            ' ',
            {},
            (event) => {
                avatar.bufferJump();
                event.preventDefault();
            },
            'Hop/Jump'
        );

        keybindManager.registerKeybind(
            'd',
            { shift: true },
            () => {
                avatar.triggerDance();
            },
            'Dance'
        );

        // Emote wheel (Tab key) - lazy load if needed
        keybindManager.registerKeybind(
            'Tab',
            {},
            (event) => {
                event.preventDefault();
                if (!systems.emoteWheel) {
                    import('../../ui/EmoteWheel.js')
                        .then(({ EmoteWheel }) => {
                            systems.emoteWheel = new EmoteWheel(avatar);
                            systems.emoteWheel.toggle();
                        })
                        .catch((error) => {
                            console.warn('Failed to load EmoteWheel:', error);
                        });
                } else {
                    systems.emoteWheel.toggle();
                }
            },
            'Open emote wheel'
        );

        // Interact key (E)
        keybindManager.registerKeybind(
            'e',
            {},
            () => {
                if (interactionSystem.interact()) {
                    console.log('Interacted with object');
                }

                // Check for seatable objects
                for (const seatable of seatableObjects) {
                    if (seatable.canUse(avatar.position)) {
                        if (seatable.isOccupiedBy(avatar)) {
                            seatable.release();
                            console.log('Stood up from seat');
                        } else {
                            seatable.use(avatar);
                            console.log('Sat down');
                        }
                        break;
                    }
                }
            },
            'Interact with objects'
        );

        // Throw drip orb (Q key)
        keybindManager.registerKeybind(
            'q',
            {},
            () => {
                // Calculate throw direction based on avatar's rotation (forward direction)
                const throwDirection = new THREE.Vector3(0, 0, 1); // Avatar's forward is positive Z (matches movement fix)
                throwDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), avatar.group.rotation.y);
                throwDirection.normalize();

                // Create throw velocity with forward component and upward arc
                const throwSpeed = 8.0; // Increased from 5 for better range
                const throwVelocity = throwDirection.multiplyScalar(throwSpeed);
                throwVelocity.y = 4.0; // Increased from 3 for better arc

                const drip = new ThrowableDrip(
                    scene,
                    avatar.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
                    throwVelocity,
                    0xff00ff
                );
                if (!systems.throwableDrips) {
                    systems.throwableDrips = [];
                }
                systems.throwableDrips.push(drip);
            },
            'Throw drip orb'
        );

        // Camera presets (1, 2, 3)
        keybindManager.registerKeybind(
            '1',
            {},
            () => {
                if (cameraController) {
                    cameraController.setPreset('normal');
                }
            },
            'Camera preset: Normal'
        );
        keybindManager.registerKeybind(
            '2',
            {},
            () => {
                if (cameraController) {
                    cameraController.setPreset('intimate');
                }
            },
            'Camera preset: Intimate'
        );
        keybindManager.registerKeybind(
            '3',
            {},
            () => {
                if (cameraController) {
                    cameraController.setPreset('wide');
                }
            },
            'Camera preset: Wide'
        );

        // Snap camera (R key)
        keybindManager.registerKeybind(
            'r',
            {},
            () => {
                if (cameraController && avatar) {
                    cameraController.snapBehindAvatar(avatar);
                    console.log('Camera snapped behind avatar');
                }
            },
            'Snap camera behind avatar'
        );

        // Camera modes
        keybindManager.registerKeybind(
            'c',
            {},
            () => {
                if (cameraController) {
                    const isCinematic = cameraController.mode === 'cinematic';
                    cameraController.setCinematicMode(!isCinematic);
                    console.log('Cinematic mode:', !isCinematic ? 'ON' : 'OFF');
                }
            },
            'Toggle cinematic mode'
        );

        keybindManager.registerKeybind(
            'f',
            {},
            () => {
                if (cameraController) {
                    const isFreecam = cameraController.mode === 'freecam';
                    cameraController.setFreecam(!isFreecam);
                    console.log('Freecam mode:', !isFreecam ? 'ON' : 'OFF');
                }
            },
            'Toggle freecam mode'
        );

        keybindManager.registerKeybind(
            'l',
            {},
            () => {
                if (cameraController) {
                    const isLockOn = cameraController.mode === 'lockon';
                    if (isLockOn) {
                        cameraController.setLockOn(null);
                        console.log('Lock-on mode: OFF');
                    } else {
                        const currentTarget = interactionSystem.getTarget();
                        const targetObject = currentTarget
                            ? currentTarget.object
                            : interactionSystem.getNearestInteractable(avatar.position) ||
                              avatar.group;
                        cameraController.setLockOn(targetObject);
                        console.log('Lock-on mode: ON');
                    }
                }
            },
            'Toggle lock-on mode'
        );

        // Dash (Shift+Space)
        keybindManager.registerKeybind(
            ' ',
            { shift: true },
            (event) => {
                avatar.dash();
                event.preventDefault();
            },
            'Dash'
        );

        // Replay system
        keybindManager.registerKeybind(
            't',
            {},
            () => {
                if (replaySystem.isRecording) {
                    replaySystem.stopRecording();
                } else {
                    replaySystem.startRecording();
                }
            },
            'Toggle replay recording'
        );

        keybindManager.registerKeybind(
            'g',
            {},
            () => {
                replaySystem.spawnGhost();
            },
            'Spawn ghost replay'
        );

        // Teleport
        keybindManager.registerKeybind(
            'y',
            {},
            () => {
                if (teleportSystem && teleportSystem.teleportToNearestAnchor(avatar)) {
                    console.log('Teleported to nearest anchor');
                }
            },
            'Teleport to nearest anchor'
        );

        // Events
        keybindManager.registerKeybind(
            'b',
            {},
            () => {
                if (eventSystem) {
                    eventSystem.triggerBlackout(5.0);
                    if (visualRecorder) {
                        visualRecorder.logEvent('blackout', { duration: 5.0, trigger: 'manual' });
                    }
                }
            },
            'Trigger blackout event'
        );

        keybindManager.registerKeybind(
            's',
            { shift: true },
            () => {
                if (eventSystem) {
                    eventSystem.triggerStrobe(2.0, 10);
                    if (visualRecorder) {
                        visualRecorder.logEvent('strobe', {
                            duration: 2.0,
                            intensity: 10,
                            trigger: 'manual',
                        });
                    }
                }
            },
            'Trigger strobe event'
        );

        keybindManager.registerKeybind(
            'w',
            { shift: true },
            () => {
                if (eventSystem && avatar && !inputManager.keys.w) {
                    eventSystem.triggerWave(avatar.position.clone(), 5.0);
                    if (visualRecorder) {
                        visualRecorder.logEvent('wave', {
                            origin: avatar.position.clone(),
                            speed: 5.0,
                            trigger: 'manual',
                        });
                    }
                }
            },
            'Trigger wave event'
        );

        // Visual effects
        keybindManager.registerKeybind(
            'u',
            {},
            () => {
                if (visualEffects) {
                    visualEffects.setUVMode(!visualEffects.uvMode);
                    console.log('UV mode:', visualEffects.uvMode ? 'ON' : 'OFF');
                }
            },
            'Toggle UV/blacklight mode'
        );

        keybindManager.registerKeybind(
            'g',
            { shift: true },
            () => {
                if (postProcessingManager && postProcessingManager.getComposer()) {
                    const composer = postProcessingManager.getComposer();
                    const isEnabled = composer.glitchEnabled || false;
                    postProcessingManager.setGlitchEnabled(!isEnabled);
                    console.log('Glitch mode:', !isEnabled ? 'ON' : 'OFF');
                    if (visualRecorder) {
                        visualRecorder.logEvent('glitchToggle', { enabled: !isEnabled });
                    }
                }
            },
            'Toggle glitch mode'
        );

        keybindManager.registerKeybind(
            'v',
            {},
            () => {
                if (visualizerStylePicker) {
                    visualizerStylePicker.toggle();
                }
            },
            'Toggle visualizer style picker'
        );

        keybindManager.registerKeybind(
            'r',
            { ctrl: true },
            () => {
                if (visualRecorder) {
                    if (visualRecorder.isRecording) {
                        visualRecorder.stopRecording();
                        visualRecorder.downloadRecording();
                        console.log('Visual recording saved');
                    } else {
                        visualRecorder.startRecording();
                        console.log('Visual recording started');
                    }
                }
            },
            'Toggle visual recording'
        );

        keybindManager.registerKeybind(
            'i',
            {},
            () => {
                if (eventSystem) {
                    eventSystem.triggerColorInversion();
                    if (visualRecorder) {
                        visualRecorder.logEvent('colorInversion', { trigger: 'manual' });
                    }
                }
            },
            'Trigger color inversion flash'
        );

        // Debug - Toggle dev tools overlay
        keybindManager.registerKeybind(
            'F1',
            {},
            (event) => {
                event.preventDefault();
                if (systems.devTools) {
                    systems.devTools.toggle();
                } else {
                    // Fallback to console debug if dev tools not available
                    console.log('=== Camera Debug Info ===');
                    console.log('Camera Position:', camera.position);
                    if (cameraController) {
                        console.log('Camera Target:', cameraController.state.target);
                        console.log('Camera Distance:', cameraController.state.distance);
                        console.log('Camera Angles:', {
                            x: cameraController.state.angleX,
                            y: cameraController.state.angleY,
                        });
                        console.log('Camera Mode:', cameraController.mode);
                    }
                    console.log('Avatar Position:', avatar.position);
                    console.log('Avatar Velocity:', avatar.velocity);
                    console.log('Avatar State:', avatar.currentState);
                    console.log('Avatar Expression:', avatar.currentExpression);
                }
            },
            'Toggle debug overlay'
        );

        // Ctrl+D also toggles debug overlay
        keybindManager.registerKeybind(
            'd',
            { ctrl: true },
            (event) => {
                event.preventDefault();
                if (systems.devTools) {
                    systems.devTools.toggle();
                }
            },
            'Toggle debug overlay'
        );

        // Ctrl+T toggles test mode
        keybindManager.registerKeybind(
            't',
            { ctrl: true },
            (event) => {
                event.preventDefault();
                if (systems.testMode) {
                    systems.testMode.toggle();
                }
            },
            'Toggle test mode'
        );

        // Help - F1 opens help panel, ? shows controls in console
        keybindManager.registerKeybind(
            'F1',
            {},
            async (event) => {
                event.preventDefault();
                // Check if help panel is available
                if (systems.helpPanel) {
                    systems.helpPanel.toggle();
                } else if (systems.helpSystem) {
                    // Lazy load help panel if not already created
                    const { HelpPanel } = await import('../../ui/HelpPanel.js');
                    const helpPanel = new HelpPanel({
                        helpSystem: systems.helpSystem,
                        onClose: () => {
                            helpPanel.hide();
                        },
                    });
                    systems.helpPanel = helpPanel;
                    helpPanel.show();
                } else {
                    // Fallback to console help
                    if (typeof window !== 'undefined' && window.showControls) {
                        window.showControls();
                    }
                }
            },
            'Toggle help panel'
        );

        // ? key still shows controls in console
        keybindManager.registerKeybind(
            '?',
            {},
            (event) => {
                event.preventDefault();
                if (typeof window !== 'undefined' && window.showControls) {
                    window.showControls();
                }
            },
            'Show controls help (console)'
        );

        // Controls Reference UI - Shift+? or Ctrl+? opens controls reference
        keybindManager.registerKeybind(
            '?',
            { shift: true },
            (event) => {
                event.preventDefault();
                if (systems.uiManager) {
                    const controlsUI = systems.uiManager.getPanel('controlsReference');
                    if (controlsUI && controlsUI.toggle) {
                        controlsUI.toggle();
                    }
                }
            },
            'Open controls reference'
        );

        keybindManager.registerKeybind(
            '?',
            { ctrl: true },
            (event) => {
                event.preventDefault();
                if (systems.uiManager) {
                    const controlsUI = systems.uiManager.getPanel('controlsReference');
                    if (controlsUI && controlsUI.toggle) {
                        controlsUI.toggle();
                    }
                }
            },
            'Open controls reference'
        );

        // Discovery Map UI - M key opens discovery map
        keybindManager.registerKeybind(
            'm',
            {},
            (event) => {
                event.preventDefault();
                if (systems.uiManager) {
                    const discoveryMap = systems.uiManager.getPanel('discoveryMap');
                    if (discoveryMap && discoveryMap.toggle) {
                        discoveryMap.toggle();
                    }
                }
            },
            'Open discovery map'
        );
        // Camera settings keybind (F2)
        keybindManager.registerKeybind(
            'F2',
            {},
            async (event) => {
                event.preventDefault();
                if (systems.cameraSettings && systems.cameraController) {
                    const { CameraSettingsUI } = await import('../../ui/CameraSettingsUI.js');
                    if (!systems.cameraSettingsUI) {
                        systems.cameraSettingsUI = new CameraSettingsUI({
                            cameraSettings: systems.cameraSettings,
                            cameraController: systems.cameraController,
                            settingsManager: systems.settingsManager,
                            onClose: () => {
                                systems.cameraSettingsUI.hide();
                                // Update indicator when UI closes
                                if (systems.cameraIntensityIndicator) {
                                    systems.cameraIntensityIndicator.update();
                                }
                            },
                            onSettingsChange: () => {
                                // Update indicator when settings change
                                if (systems.cameraIntensityIndicator) {
                                    systems.cameraIntensityIndicator.update();
                                }
                            },
                        });
                    }
                    systems.cameraSettingsUI.show();
                }
            },
            'Open camera settings'
        );

        // Helper function to apply camera preset with notification
        const applyCameraPreset = (presetName) => {
            if (!systems.cameraSettings) {
                return;
            }

            systems.cameraSettings.applyPreset(presetName);
            if (systems.cameraController) {
                systems.cameraController.updateSettings();
            }
            if (systems.settingsManager) {
                const settingsJson = systems.cameraSettings.export();
                systems.settingsManager.setSetting('camera', JSON.parse(settingsJson));
            }

            // Show notification
            if (systems.notificationSystem) {
                const presetLabels = {
                    low: 'Low',
                    medium: 'Medium',
                    high: 'High',
                };
                systems.notificationSystem.show(
                    `Camera Intensity: ${presetLabels[presetName] || presetName}`,
                    { type: 'info', duration: 2000 }
                );
            }

            // Update indicator
            if (systems.cameraIntensityIndicator) {
                systems.cameraIntensityIndicator.update();
            }
        };

        // Quick camera intensity toggle (Shift+1/2/3 for Low/Medium/High)
        keybindManager.registerKeybind(
            '1',
            { shift: true },
            () => {
                applyCameraPreset('low');
            },
            'Set camera intensity to Low'
        );

        keybindManager.registerKeybind(
            '2',
            { shift: true },
            () => {
                applyCameraPreset('medium');
            },
            'Set camera intensity to Medium'
        );

        keybindManager.registerKeybind(
            '3',
            { shift: true },
            () => {
                applyCameraPreset('high');
            },
            'Set camera intensity to High'
        );

        // Cycling camera intensity toggle (I key cycles Low->Medium->High->Low)
        keybindManager.registerKeybind(
            'i',
            { ctrl: true },
            () => {
                if (!systems.cameraSettings) {
                    return;
                }

                const currentPreset = systems.cameraSettings.getCurrentPreset();
                const presetOrder = ['low', 'medium', 'high'];
                const currentIndex = presetOrder.indexOf(currentPreset);
                const nextIndex = (currentIndex + 1) % presetOrder.length;
                const nextPreset = presetOrder[nextIndex];

                applyCameraPreset(nextPreset);
            },
            'Cycle camera intensity (Low→Medium→High)'
        );

        keybindManager.registerKeybind(
            'F1',
            { shift: true },
            (event) => {
                event.preventDefault();
                if (typeof window !== 'undefined' && window.showControls) {
                    window.showControls();
                }
            },
            'Show controls help'
        );

        // Control drawer toggle (H key or click orb at bottom)
        keybindManager.registerKeybind(
            'h',
            {},
            (event) => {
                event.preventDefault();
                // Find control dock from systems or UI
                const controlDock =
                    systems.controlDock ||
                    (window.controlDockInstance ? window.controlDockInstance : null);
                if (controlDock && typeof controlDock.toggleDrawer === 'function') {
                    controlDock.toggleDrawer();
                } else {
                    // Fallback: try to find and click the orb
                    const orb = document.getElementById('control-orb');
                    if (orb) {
                        orb.click();
                    }
                }
            },
            'Open/Close controls drawer (or click orb at bottom)'
        );

        // Collection progress UI keybind (F3)
        keybindManager.registerKeybind(
            'F3',
            {},
            async (event) => {
                event.preventDefault();
                if (systems.collectionTracker) {
                    const { CollectionProgressUI } =
                        await import('../../ui/CollectionProgressUI.js');
                    if (!systems.collectionProgressUI) {
                        systems.collectionProgressUI = new CollectionProgressUI({
                            collectionTracker: systems.collectionTracker,
                            onClose: () => {
                                systems.collectionProgressUI.hide();
                            },
                        });
                    }
                    systems.collectionProgressUI.show();
                }
            },
            'Open collection progress'
        );

        // Quick Settings Menu keybind (F4)
        keybindManager.registerKeybind(
            'F4',
            {},
            async (event) => {
                event.preventDefault();
                const { QuickSettingsMenu } = await import('../../ui/QuickSettingsMenu.js');
                if (!systems.quickSettingsMenu) {
                    systems.quickSettingsMenu = new QuickSettingsMenu({
                        systems: systems,
                        onClose: () => {
                            systems.quickSettingsMenu.hide();
                        },
                    });
                }
                systems.quickSettingsMenu.toggle();
            },
            'Toggle quick settings menu'
        );

        // Tutorial system keybind (F5 to restart tutorial)
        keybindManager.registerKeybind(
            'F5',
            {},
            async (event) => {
                event.preventDefault();
                if (systems.tutorialSystem) {
                    // Restart first-time tutorial
                    systems.tutorialSystem.startTutorial('firstTime');
                }
            },
            'Restart tutorial'
        );

        // Audio Settings UI keybind (F6)
        keybindManager.registerKeybind(
            'F6',
            {},
            async (event) => {
                event.preventDefault();
                if (systems.audioSettings || systems.settingsManager) {
                    const { AudioSettingsUI } = await import('../../ui/AudioSettingsUI.js');
                    const { AudioSettings } = await import('../../config/AudioSettings.js');

                    // Ensure AudioSettings is initialized
                    if (!systems.audioSettings && systems.settingsManager) {
                        systems.audioSettings = new AudioSettings(systems.settingsManager);
                    }

                    if (!systems.audioSettingsUI) {
                        systems.audioSettingsUI = new AudioSettingsUI({
                            audioSettings: systems.audioSettings,
                            audioSystem: systems.audioSystem,
                            settingsManager: systems.settingsManager,
                            onClose: () => {
                                systems.audioSettingsUI.hide();
                            },
                            onSettingsChange: () => {
                                // Settings are saved automatically via AudioSettings
                            },
                        });
                    }
                    systems.audioSettingsUI.show();
                }
            },
            'Open audio settings'
        );

        // Visual Effect Settings UI keybind (F7)
        keybindManager.registerKeybind(
            'F7',
            {},
            async (event) => {
                event.preventDefault();
                if (systems.visualEffectSettings) {
                    const { VisualEffectSettingsUI } =
                        await import('../../ui/VisualEffectSettingsUI.js');

                    if (!systems.visualEffectSettingsUI) {
                        systems.visualEffectSettingsUI = new VisualEffectSettingsUI({
                            visualEffectSettings: systems.visualEffectSettings,
                            visualEffects: systems.visualEffects,
                            postProcessingManager: systems.postProcessingManager,
                            cameraSettings: systems.cameraSettings,
                            onClose: () => {
                                // Settings are saved automatically
                            },
                        });
                    }

                    if (systems.visualEffectSettingsUI.isVisible()) {
                        systems.visualEffectSettingsUI.hide();
                    } else {
                        systems.visualEffectSettingsUI.show();
                    }
                }
            },
            'Open visual effect intensity settings'
        );

        // DevMenu keybind (F9 or ~)
        keybindManager.registerKeybind(
            'F9',
            {},
            (event) => {
                event.preventDefault();
                if (systems.devMenu) {
                    if (systems.devMenu.isVisible()) {
                        systems.devMenu.hide();
                    } else {
                        systems.devMenu.show();
                    }
                }
            },
            'Toggle dev menu'
        );

        keybindManager.registerKeybind(
            '~',
            {},
            (event) => {
                event.preventDefault();
                if (systems.devMenu) {
                    if (systems.devMenu.isVisible()) {
                        systems.devMenu.hide();
                    } else {
                        systems.devMenu.show();
                    }
                }
            },
            'Toggle dev menu'
        );

        // DevMenu keybind (Cmd+D / Ctrl+D)
        keybindManager.registerKeybind(
            'd',
            { meta: true },
            (event) => {
                event.preventDefault();
                if (systems.devMenu) {
                    if (systems.devMenu.isVisible()) {
                        systems.devMenu.hide();
                    } else {
                        systems.devMenu.show();
                    }
                }
            },
            'Toggle dev menu (Cmd+D)'
        );

        // Also support Ctrl+D for Windows/Linux
        keybindManager.registerKeybind(
            'd',
            { ctrl: true },
            (event) => {
                event.preventDefault();
                if (systems.devMenu) {
                    if (systems.devMenu.isVisible()) {
                        systems.devMenu.hide();
                    } else {
                        systems.devMenu.show();
                    }
                }
            },
            'Toggle dev menu (Ctrl+D)'
        );

        // Look behind camera keybind (B key - hold to back camera out)
        keybindManager.registerKeybind(
            'B',
            {},
            (event) => {
                if (systems.cameraController) {
                    systems.cameraController.setLookBehind(true);
                }
            },
            'Look behind (hold B)'
        );

        // Release look behind on keyup
        document.addEventListener('keyup', (event) => {
            if (event.key.toLowerCase() === 'b' && systems.cameraController) {
                systems.cameraController.setLookBehind(false);
            }
        });
    }

    /**
     * Setup mouse controls (right-click for camera panning, left-click for interactions)
     * @param {InputManager} inputManager - The input manager instance
     * @param {CameraController} cameraController - The camera controller instance
     */
    static setupMouseControls(inputManager, cameraController, interactionSystem) {
        let rightMouseDown = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        // Prevent context menu on right-click
        inputManager.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Track mouse buttons
        inputManager.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) {
                // Right mouse button - camera panning (scrubber mode)
                rightMouseDown = true;
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
                if (cameraController) {
                    cameraController.state.isDragging = true;
                }
            } else if (event.button === 0 && interactionSystem) {
                // Left mouse button - interactions
                // Only interact if there's a valid target (no message if nothing to interact with)
                // Don't prevent default - allow normal mouse behavior for other interactions
                if (interactionSystem.hasTarget()) {
                    interactionSystem.interact();
                }
            }
        });

        // Handle mouse movement for camera panning (track directly from canvas events)
        inputManager.canvas.addEventListener('mousemove', (event) => {
            if (rightMouseDown && cameraController) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;

                if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
                    // Reduced sensitivity for smoother, less snappy movement in small rooms
                    const sensitivity = 0.003; // Reduced from 0.005 (40% reduction)
                    cameraController.handleMouseDrag(deltaX * sensitivity, deltaY * sensitivity);
                }
            }
        });

        // Release right mouse button
        inputManager.canvas.addEventListener('mouseup', (event) => {
            if (event.button === 2) {
                rightMouseDown = false;
                if (cameraController) {
                    cameraController.state.isDragging = false;
                    // When drag ends, camera will resume auto-follow in next frame
                }
            }
        });

        // Stop dragging if mouse leaves canvas
        inputManager.canvas.addEventListener('mouseleave', () => {
            rightMouseDown = false;
            if (cameraController) {
                cameraController.state.isDragging = false;
            }
        });

        // Zoom with scroll wheel
        inputManager.onMouseEvent('wheel', (deltaY) => {
            if (cameraController) {
                cameraController.handleZoom(deltaY);
            }
        });
    }

    /**
     * Initialize GameLoop
     * @param {PostProcessingManager} postProcessingManager - The post-processing manager
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {Object} systems - Systems object containing all game systems
     * @returns {Object} Object containing gameLoop and systemsForUpdate
     */
    static initializeGameLoop(postProcessingManager, renderer, scene, camera, systems) {
        const updateManager = new UpdateManager();

        // Create systems object for UpdateManager
        // Use club scene and club camera for updates (where the avatar actually is)
        const systemsForUpdate = {
            // Core - use club scene and club camera for updates
            avatar: systems.avatar,
            camera: systems.clubCamera || systems.camera, // Prefer club camera
            scene: systems.clubScene || systems.scene, // Prefer club scene
            renderer: systems.renderer,
            // Managers
            stateManager: systems.stateManager,
            eventBus: systems.eventBus,
            inputManager: systems.inputManager,
            keys: systems.keys, // Movement system expects systems.keys
            particleSystem: systems.particleSystem,
            collisionSystem: systems.collisionSystem,
            physicsSystem: systems.physicsSystem,
            replaySystem: systems.replaySystem,
            teleportSystem: systems.teleportSystem,
            collectibleManager: null, // Will be set by audio system
            worldStateReactor: systems.worldStateReactor,
            interactionSystem: systems.interactionSystem,
            cameraController: systems.cameraController,
            eventSystem: systems.eventSystem,
            visualEffects: systems.visualEffects,
            visualRecorder: systems.visualRecorder,
            audioSystem: systems.audioSystem,
            postProcessingManager: systems.postProcessingManager,
            multiplayerManager: systems.multiplayerManager,
            // Environment
            environmentEffects: systems.environmentEffects,
            ceilingLights: systems.ceilingLights,
            ledStrips: systems.ledStrips,
            speakerCones: systems.speakerCones,
            floorMaterial: systems.floorMaterial,
            wallMaterial: systems.wallMaterial,
            leftFanBlades: systems.leftFanBlades,
            rightFanBlades: systems.rightFanBlades,
            spotLight: systems.spotLight,
            // UI
            vibeMeter: systems.vibeMeter,
            // Interactive objects
            doors: systems.doors,
            teleporters: systems.teleporters,
            fogVents: systems.fogVents,
            seatableObjects: systems.seatableObjects,
            movingPlatforms: systems.movingPlatforms,
            ventilationFans: systems.ventilationFans,
            interactiveScreens: systems.interactiveScreens,
            portalRifts: systems.portalRifts,
            pushableProps: systems.pushableProps,
            throwableDrips: systems.throwableDrips,
            // Visualizer room
            visualizerLights: systems.visualizerLights || null,
            visualizerLEDStrips: systems.visualizerLEDStrips || null,
            // Functions
            updateScreenTexture: systems.updateScreenTexture,
            applyGlitchToScreen: systems.applyGlitchToScreen,
            // Audio
            audioPlayer: null,
            footstepSystem: null,
            // TV systems
            tvTransitionSystem: systems.tvTransitionSystem || null,
            tvRenderSystem: systems.tvRenderSystem || null,
        };

        const gameLoop = new GameLoop(
            updateManager,
            postProcessingManager,
            renderer,
            scene,
            camera,
            systemsForUpdate
        );

        // Update audio system with game loop clock
        if (systems.audioSystem) {
            systems.audioSystem.clock = gameLoop.clock;
        }

        // Don't start the game loop automatically - wait for ready button
        // gameLoop.start(); // Will be called after player presses ready button

        // Expose timeScale control for debug
        window.setTimeScale = (scale) => {
            if (gameLoop) {
                gameLoop.setTimeScale(scale);
            }
        };

        console.log('Game loop started');

        return {
            gameLoop,
            systemsForUpdate,
            updateManager, // Return UpdateManager for DevMenu access
        };
    }

    /**
     * Initialize interactive object registration
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} avatar - The avatar instance
     * @param {Object} systems - Systems object containing all game systems
     */
    static initializeInteractiveRegistration(scene, avatar, systems) {
        // Register interactive screens
        if (systems._interactiveScreens) {
            for (const screen of systems._interactiveScreens) {
                systems.interactionSystem.registerInteractable(screen.getMesh(), () => {
                    screen.changePattern();
                });
            }
        }

        // Camera console
        const cameraConsole = new CameraConsole(
            scene,
            new THREE.Vector3(5, 1, 5),
            systems.cameraController
        );
        systems.interactionSystem.registerInteractable(cameraConsole.getMesh(), () => {
            cameraConsole.switchToNext();
        });

        // Lighting console - wall-mounted on left wall, at eye level
        const lightingConsolePos = new THREE.Vector3(-ROOM_SIZE / 2 + 0.05, 1.6, 4); // Left wall, eye level, near front
        const lightingConsole = new LightingConsole(
            scene,
            lightingConsolePos,
            systems.eventSystem,
            systems.visualEffects
        );
        // Rotate to face inward from wall
        const consoleMesh = lightingConsole.getMesh();
        if (consoleMesh) {
            consoleMesh.rotation.y = Math.PI / 2; // Face inward from left wall
        }
        lightingConsole.getMesh().children.forEach((child) => {
            if (child.userData.isButton) {
                systems.interactionSystem.registerInteractable(child, () => {
                    lightingConsole.interact(child.userData.buttonType);
                });
            }
        });

        // Register portals
        if (systems._portalRifts) {
            for (const portal of systems._portalRifts) {
                systems.interactionSystem.registerInteractable(portal.getMesh(), () => {
                    if (portal.checkActivation(avatar.position)) {
                        portal.teleport(avatar);
                    }
                });
            }
        }
    }

    /**
     * Setup audio initialization on user interaction
     * @param {AudioSystem} audioSystem - The audio system instance
     */
    static setupAudioInitialization(audioSystem) {
        let audioInitialized = false;
        document.addEventListener(
            'click',
            () => {
                if (!audioInitialized && audioSystem) {
                    audioSystem
                        .initialize()
                        .then(() => {
                            audioSystem.initAmbientAudio();
                            audioInitialized = true;
                        })
                        .catch((error) => {
                            console.warn('Audio initialization failed:', error);
                        });
                }
            },
            { once: true }
        );
    }
}
