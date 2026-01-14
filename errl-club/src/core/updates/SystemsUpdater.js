/**
 * SystemsUpdater - Coordinates updates for various game systems
 *
 * Extracted from main.js's animate() function for better organization.
 * This module consolidates system updates that can be integrated with UpdateManager.
 */

import { updateInteractiveObjects, updateSeatableObjects } from './InteractiveObjectsUpdater.js';
import { updatePostProcessing, updateCanvasFilters } from './PostProcessingUpdater.js';
import { updateCollectibles } from './CollectiblesUpdater.js';
import { updateInteraction } from './InteractionUpdater.js';
import { updateAvatarFootsteps } from './AvatarMovementUpdater.js';
import {
    updateCeilingLights,
    updateLEDStrips,
    updateSpeakerCones,
    updateFanBlades,
    updateHolographicRings,
    updateMaterialProperties,
} from './EnvironmentAnimator.js';
import { updateAudioAnalysis } from './AudioAnalysisUpdater.js';
import {
    updateAudioReactiveLighting,
    updateAudioReactiveFog,
    updateAudioFadeIn,
} from './AudioUpdateHelpers.js';
import { FPSTracker } from '../helpers/FPSTracker.js';

/**
 * Update all game systems in a coordinated manner
 *
 * This function consolidates system updates and can be called from:
 * 1. main.js's animate() function (during transition)
 * 2. UpdateManager.update() (after migration to GameLoop)
 *
 * @param {Object} params - All systems and dependencies
 * @param {number} params.deltaTime - Frame delta time
 * @param {number} params.elapsedTime - Total elapsed time
 * @param {THREE.Clock} params.clock - Three.js clock
 * @param {Object} params.systems - All game systems
 */
export function updateAllSystems({ deltaTime, elapsedTime, clock, systems }) {
    const {
        // Core objects
        scene,
        camera,
        renderer,
        avatar,

        // Systems
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

        // Audio
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

        // Audio state (mutable)
        frequencyBands,
        bassEnergy,
        overallEnergy,

        // Other
        vibeMeter,
        fpsTracker,
        audioReactiveDebugger,

        // Constants
        ROOM_SIZE,
    } = systems;

    // Update particle system
    if (particleSystem) {
        particleSystem.update(deltaTime);
    }

    // Update physics system
    if (physicsSystem) {
        physicsSystem.update(deltaTime);
    }

    // Update replay system
    if (replaySystem) {
        if (replaySystem.isRecording) {
            replaySystem.recordFrame(avatar, elapsedTime);
        }
        replaySystem.update(deltaTime, elapsedTime);
    }

    // Update teleport system
    if (teleportSystem && avatar) {
        const roomBounds = {
            minX: -ROOM_SIZE / 2,
            maxX: ROOM_SIZE / 2,
            minZ: -ROOM_SIZE / 2,
            maxZ: ROOM_SIZE / 2,
            minY: -10,
        };
        teleportSystem.checkRespawn(avatar, roomBounds);
        teleportSystem.update(deltaTime);
    }

    // Update collectibles
    updateCollectibles({
        collectibleManager,
        avatar,
        deltaTime,
        elapsedTime,
        collectionGoalsUI,
    });

    // Update world state reactor
    if (worldStateReactor && bassEnergy !== undefined && overallEnergy !== undefined) {
        worldStateReactor.update(deltaTime, elapsedTime, bassEnergy, overallEnergy, avatar);
    }

    // Update interactive environment objects
    if (doors && teleporters && fogVents && portalRifts && avatar) {
        updateInteractiveObjects(
            doors,
            teleporters,
            fogVents,
            portalRifts,
            avatar,
            deltaTime,
            elapsedTime,
            {
                beatDetector,
                audioData,
                frequencyBands,
                clock,
            }
        );
    }

    // Update Codex asset proximity visibility
    if (codexAssetIntegration && avatar && camera) {
        codexAssetIntegration.updateProximityVisibility(avatar.position, camera);
    }

    // Update LOD System
    if (lodSystem && lodSystem.enabled && camera) {
        lodSystem.update(camera.position);
    }

    // Update Performance Optimizer
    if (performanceOptimizer && performanceOptimizer.enabled && devTools && fpsTracker) {
        const currentFPS = fpsTracker.getFPS() || 60;
        performanceOptimizer.update(currentFPS);
    }

    // Update post-processing effects
    if (composer && avatar) {
        updatePostProcessing({
            composer,
            cameraController,
            bloomPass,
            frequencyBands,
            frequencyExtractor,
            vibeMeter,
            deltaTime,
            codexAssetIntegration,
            avatarPosition: avatar.position,
        });
    }

    // Update seatable objects
    if (seatableObjects && avatar) {
        updateSeatableObjects(seatableObjects, avatar);
    }

    // Update interaction system
    updateInteraction({
        interactionSystem,
        camera,
        avatar,
    });

    // Update camera with audio-reactive effects
    if (frequencyBands && cameraController && cameraController.updateAudioReactive) {
        const cameraSettings = window.gameSystems?.cameraSettings?.getSettings() || null;
        cameraController.updateAudioReactive(frequencyBands, cameraSettings);
    }

    // Update camera controller (camera should follow avatar even without audio)
    if (cameraController && avatar) {
        cameraController.update(deltaTime, avatar, bassEnergy ?? 0, elapsedTime);
    }

    // Update FPS tracker
    if (fpsTracker) {
        fpsTracker.update();
    }

    // Update audio analysis
    if (analyser && audioData) {
        const analysisResult = updateAudioAnalysis({
            analyser,
            audioData,
            frequencyExtractor,
            beatDetector,
            clock,
            codexAssetIntegration,
            particleSystem,
            eventSystem,
            visualEffects,
            worldStateReactor,
            avatar,
            audioReactiveDebugger,
            frequencyBands,
            bassEnergy,
            overallEnergy,
            roomSize: ROOM_SIZE,
        });

        // Update mutable references
        if (frequencyBands) {
            Object.assign(frequencyBands, analysisResult.frequencyBands);
        }
        systems.bassEnergy = analysisResult.bassEnergy;
        systems.overallEnergy = analysisResult.overallEnergy;
    }

    // Update audio preview
    if (audioPlayer && analyser) {
        const previewData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(previewData);
        audioPlayer.updatePreview(analyser, previewData);
    }

    // Update audio fade-in
    if (ambientAudio && audioFadeInProgress !== undefined && audioFadeInDuration !== undefined) {
        systems.audioFadeInProgress = updateAudioFadeIn(
            ambientAudio,
            deltaTime,
            audioFadeInProgress,
            audioFadeInDuration
        );
    }

    // Apply audio-reactive lighting
    if (spotLight && bassEnergy !== undefined) {
        updateAudioReactiveLighting(spotLight, bassEnergy);
    }

    // Apply audio-reactive fog
    if (scene && scene.fog && frequencyBands && overallEnergy !== undefined) {
        updateAudioReactiveFog(scene.fog, frequencyBands, overallEnergy);
    }

    // Update canvas filters
    updateCanvasFilters({
        composer,
        vibeMeter,
    });

    // Update vibe meter
    if (vibeMeter && avatar) {
        vibeMeter.update(deltaTime, avatar);
        if (beatDetector && frequencyBands && frequencyBands.bass > 0.6) {
            vibeMeter.addVibe(0.1);
        }
    }

    // Update environment animations
    if (ceilingLights && frequencyBands) {
        updateCeilingLights(
            ceilingLights,
            frequencyExtractor,
            audioData,
            frequencyBands,
            bassEnergy,
            overallEnergy
        );
    }
    if (ledStrips) {
        updateLEDStrips(
            ledStrips,
            frequencyExtractor,
            audioData,
            elapsedTime,
            overallEnergy,
            bassEnergy
        );
    }
    if (speakerCones && frequencyBands) {
        updateSpeakerCones(
            speakerCones,
            frequencyExtractor,
            frequencyBands,
            bassEnergy,
            audioData,
            particleSystem
        );
    }
    if (leftFanBlades || rightFanBlades) {
        updateFanBlades(leftFanBlades, rightFanBlades, deltaTime);
    }
    if (holographicRings && frequencyBands) {
        updateHolographicRings(holographicRings, deltaTime, elapsedTime, frequencyBands);
    }
    if (floorMaterial || wallMaterial) {
        updateMaterialProperties(
            floorMaterial,
            wallMaterial,
            frequencyExtractor,
            audioData,
            frequencyBands,
            overallEnergy
        );
    }

    // Update avatar footsteps
    updateAvatarFootsteps({
        footstepSystem,
        avatar,
        particleSystem,
        camera,
        deltaTime,
    });
}

/**
 * Render the scene with or without post-processing
 * @param {Object} params - Render parameters
 * @param {THREE.Scene} params.scene - Three.js scene
 * @param {THREE.Camera} params.camera - Three.js camera
 * @param {THREE.WebGLRenderer} params.renderer - Three.js renderer
 * @param {EffectComposer} params.composer - Post-processing composer
 * @param {boolean} params.postProcessingEnabled - Whether post-processing is enabled
 */
export function renderScene({ scene, camera, renderer, composer, postProcessingEnabled }) {
    if (composer && postProcessingEnabled) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}
