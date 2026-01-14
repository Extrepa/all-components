/**
 * KeyboardEventHandlers - Handles keyboard input for game actions
 *
 * Extracted from main.js for better organization.
 * Note: Basic WASD movement is handled by InputManager.
 */

import * as THREE from 'three';

/**
 * Setup keyboard event handlers for game actions
 * @param {Object} systems - Game systems object
 * @returns {Function} Cleanup function to remove event listeners
 */
export function setupKeyboardHandlers(systems) {
    const {
        keys,
        avatar,
        interactionSystem,
        seatableObjects,
        scene,
        cameraController,
        replaySystem,
        replayLibrary,
        teleportSystem,
        eventSystem,
        visualEffects,
        composer,
        throwableDrips = [],
        emoteWheel = null,
        collectionGoalsUI = null,
        assetAttributionPanel = null,
        visualizerStylePicker = null,
        visualRecorder = null,
        codexAssetIntegration = null,
        particleSystem = null,
        devTools = null,
        devMenu = null,
        debugOverlay = null,
        helpPanel = null,
        camera = null,
    } = systems;

    let emoteWheelInstance = emoteWheel;

    const handleKeyDown = async (event) => {
        const key = event.key.toLowerCase();

        // Step 236: Toggle emote wheel (Tab key) - lazy load if needed
        if (event.key === 'Tab') {
            event.preventDefault();
            if (!emoteWheelInstance) {
                const { EmoteWheel } = await import('../../ui/EmoteWheel.js');
                emoteWheelInstance = new EmoteWheel(avatar);
                emoteWheelInstance.toggle();
            } else {
                emoteWheelInstance.toggle();
            }
            return;
        }

        // Step 132: Trigger random dance with 'D' key (capital D, not movement)
        if (key === 'd' && event.shiftKey && avatar) {
            avatar.triggerDance();
            return;
        }

        // Step 170: Add "Interact" key (E) to trigger actions on targets
        if (key === 'e' || key === 'E') {
            if (interactionSystem?.interact()) {
                console.log('Interacted with object');
            }

            // Step 237: Also check for seatable objects
            if (seatableObjects) {
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
            }
            return;
        }

        // Step 246: Throw drip orb (Q key)
        if (key === 'q' || key === 'Q') {
            if (avatar && scene) {
                // THREE is now imported at the top of the file
                const throwDirection = new THREE.Vector3(0, 0, -1)
                    .applyQuaternion(avatar.mesh.quaternion)
                    .normalize();
                const throwVelocity = throwDirection.multiplyScalar(5);
                throwVelocity.y = 3; // Add upward component

                import('../../interactions/ThrowableDrip.js')
                    .then(({ ThrowableDrip }) => {
                        const drip = new ThrowableDrip(
                            scene,
                            avatar.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
                            throwVelocity,
                            0xff00ff
                        );
                        throwableDrips.push(drip);
                    })
                    .catch((err) => {
                        // eslint-disable-next-line no-console
                        console.warn('Failed to load ThrowableDrip:', err);
                    });
            }
            return;
        }

        // Camera presets (1, 2, 3)
        if (event.key === '1' && cameraController) {
            cameraController.setPreset('normal');
            return;
        }
        if (event.key === '2' && cameraController) {
            cameraController.setPreset('intimate');
            return;
        }
        if (event.key === '3' && cameraController) {
            cameraController.setPreset('wide');
            return;
        }

        // Step 166: Add key to snap camera behind avatar instantly (R key)
        if (
            (event.key === 'r' || event.key === 'R') &&
            !event.ctrlKey &&
            cameraController &&
            avatar
        ) {
            cameraController.snapBehindAvatar(avatar);
            console.log('Camera snapped behind avatar');
            return;
        }

        // Step 164: Toggle cinematic camera mode (C key)
        if ((event.key === 'c' || event.key === 'C') && cameraController) {
            const isCinematic = cameraController.mode === 'cinematic';
            cameraController.setCinematicMode(!isCinematic);
            console.log('Cinematic mode:', !isCinematic ? 'ON' : 'OFF');
            return;
        }

        // Step 189: Toggle freecam debug mode (F key)
        if ((event.key === 'f' || event.key === 'F') && cameraController) {
            const isFreecam = cameraController.mode === 'freecam';
            cameraController.setFreecam(!isFreecam);
            console.log('Freecam mode:', !isFreecam ? 'ON' : 'OFF');
            return;
        }

        // Step 188: Toggle lock-on camera mode (L key)
        if (
            (event.key === 'l' || event.key === 'L') &&
            !event.ctrlKey &&
            !event.shiftKey &&
            cameraController
        ) {
            const isLockOn = cameraController.mode === 'lockon';
            if (isLockOn) {
                cameraController.setLockOn(null); // Disable lock-on
                console.log('Lock-on mode: OFF');
            } else {
                // Lock onto current interaction target, nearest interactable, or avatar
                const currentTarget = interactionSystem?.getTarget();
                const targetObject = currentTarget
                    ? currentTarget.object
                    : interactionSystem?.getNearestInteractable(avatar.position) || avatar.group;
                cameraController.setLockOn(targetObject);
                console.log('Lock-on mode: ON');
            }
            return;
        }

        // Step 145: Dash mechanic (Shift+Space for dash)
        if ((event.key === ' ' || event.key === 'Space') && event.shiftKey && avatar) {
            avatar.dash();
            event.preventDefault();
            return;
        }

        // Step 195: Toggle replay recording (T key)
        if ((event.key === 't' || event.key === 'T') && replaySystem) {
            if (replaySystem.isRecording) {
                replaySystem.stopRecording();
            } else {
                replaySystem.startRecording();
            }
            return;
        }

        // Step 196: Spawn ghost replay (G key, not Ctrl+G)
        if (
            (event.key === 'g' || event.key === 'G') &&
            !event.ctrlKey &&
            !event.shiftKey &&
            replaySystem
        ) {
            // Path 24: Save current replay to library before spawning ghost
            if (replayLibrary && replaySystem.recordedFrames.length > 0) {
                const replayId = replayLibrary.saveReplay({
                    frames: replaySystem.recordedFrames,
                    duration: (performance.now() - replaySystem.recordingStartTime) / 1000,
                });
                console.log('Replay saved to library:', replayId);
            }
            replaySystem.spawnGhost();
            return;
        }

        // Step 197: Teleport to nearest anchor (Y key)
        if ((event.key === 'y' || event.key === 'Y') && teleportSystem && avatar) {
            if (teleportSystem.teleportToNearestAnchor(avatar)) {
                console.log('Teleported to nearest anchor');
            }
            return;
        }

        // Step 229: Trigger blackout event (B key)
        if ((event.key === 'b' || event.key === 'B') && eventSystem) {
            eventSystem.triggerBlackout(5.0);
            return;
        }

        // Codex Enhancement: Rest mode toggle (Ctrl+R)
        if ((event.key === 'r' || event.key === 'R') && event.ctrlKey) {
            event.preventDefault();
            if (window.restModeEnabled === undefined) {
                window.restModeEnabled = false;
            }
            window.restModeEnabled = !window.restModeEnabled;
            console.log('Rest mode:', window.restModeEnabled ? 'ON' : 'OFF');

            // Apply rest mode to Codex assets
            if (codexAssetIntegration) {
                codexAssetIntegration.setRestMode(window.restModeEnabled);
            }

            // Reduce particle emission rate
            if (particleSystem) {
                particleSystem.restMode = window.restModeEnabled;
            }
            return;
        }

        // Path 19: Toggle Collection Goals UI (Ctrl+G)
        if ((event.key === 'g' || event.key === 'G') && event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            if (collectionGoalsUI) {
                collectionGoalsUI.toggle();
            }
            return;
        }

        // Path 10: Toggle Asset Attribution Panel (Ctrl+Shift+A)
        if ((event.key === 'a' || event.key === 'A') && event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            if (assetAttributionPanel) {
                assetAttributionPanel.toggle();
            }
            return;
        }

        // Path 24: Toggle Replay Library UI (Ctrl+L)
        if ((event.key === 'l' || event.key === 'L') && event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            if (window.replayLibraryUI) {
                window.replayLibraryUI.toggle();
            }
            return;
        }

        // Step 230: Trigger strobe event (Shift+S key)
        if (event.key === 's' && event.shiftKey && eventSystem) {
            eventSystem.triggerStrobe(2.0, 10);
            return;
        }

        // Step 231: Trigger wave event (Shift+W key when not moving)
        if (
            (event.key === 'w' || event.key === 'W') &&
            event.shiftKey &&
            !keys.w &&
            eventSystem &&
            avatar
        ) {
            eventSystem.triggerWave(avatar.position.clone(), 5.0);
            return;
        }

        // Step 274: Toggle UV/blacklight mode (U key)
        if ((event.key === 'u' || event.key === 'U') && visualEffects) {
            visualEffects.setUVMode(!visualEffects.uvMode);
            console.log('UV mode:', visualEffects.uvMode ? 'ON' : 'OFF');
            return;
        }

        // Step 280: Toggle glitch mode (Shift+G key, separate from ghost replay)
        if ((event.key === 'g' || event.key === 'G') && event.shiftKey && composer) {
            composer.glitchEnabled = !composer.glitchEnabled;
            console.log('Glitch mode:', composer.glitchEnabled ? 'ON' : 'OFF');
            return;
        }

        // Step 281: Toggle visualizer style picker (V key)
        if ((event.key === 'v' || event.key === 'V') && visualizerStylePicker) {
            visualizerStylePicker.toggle();
            return;
        }

        // Step 286: Toggle visual recorder (dev-only, Ctrl+R)
        if ((event.key === 'r' || event.key === 'R') && event.ctrlKey && visualRecorder) {
            if (visualRecorder.isRecording) {
                visualRecorder.stopRecording();
                visualRecorder.downloadRecording();
                console.log('Visual recording saved');
            } else {
                visualRecorder.startRecording();
                console.log('Visual recording started');
            }
            return;
        }
    };

    // Debug toggle key (F1) - toggles DevTools overlay
    const handleF1 = (event) => {
        if (event.key === 'F1') {
            event.preventDefault();
            if (devTools) {
                devTools.toggle();
                console.log('DevTools:', devTools.enabled ? 'enabled' : 'disabled');
            } else {
                // Fallback: log debug info
                console.log('=== Camera Debug Info ===');
                console.log('Camera Position:', camera?.position);
                if (cameraController) {
                    console.log('Camera Target:', cameraController.state.target);
                    console.log('Camera Distance:', cameraController.state.distance);
                    console.log('Camera Mode:', cameraController.mode);
                }
                console.log('Avatar Position:', avatar?.position);
                console.log('Avatar Velocity:', avatar?.velocity);
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleF1);

    // Return cleanup function
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleF1);
    };
}
