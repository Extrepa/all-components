/**
 * SceneInitializer - Consolidates all scene setup including geometry, lighting, and effects
 *
 * Uses RoomBuilder, LightingSetup, and EnvironmentEffects to create the complete club scene.
 * This replaces inline scene setup code that was previously in main.js.
 */
import * as THREE from 'three';
import { RoomBuilder } from '../../scene/RoomBuilder.js';
import { LightingSetup } from '../../scene/LightingSetup.js';
import { EnvironmentEffects } from '../../scene/EnvironmentEffects.js';
import { ROOM_SIZE, WALL_HEIGHT } from '../../config/constants.js';

export class SceneInitializer {
    /**
     * Initialize and build the complete scene
     * @param {THREE.Scene} scene - The Three.js scene to build in
     * @param {Function} progressCallback - Optional callback for progress updates (progress, message)
     * @returns {Object} Scene data including materials, objects, lights, and effects
     */
    static initialize(scene, progressCallback = null) {
        if (progressCallback) {
            progressCallback(0.1, 'Setting up scene geometry...');
        }

        // Step 1: Build room geometry
        const roomBuilder = new RoomBuilder(scene);
        const roomData = roomBuilder.build();

        if (progressCallback) {
            progressCallback(0.15, 'Setting up lighting...');
        }

        // Step 2: Setup lighting
        const lightingSetup = new LightingSetup(scene);
        const lightingData = lightingSetup.build();

        if (progressCallback) {
            progressCallback(0.2, 'Setting up environment effects...');
        }

        // Step 3: Setup environment effects (fog, haze, screens, etc.)
        const environmentEffects = new EnvironmentEffects(scene);
        const effectsData = environmentEffects.build();

        // Set scene fog (from EnvironmentEffects)
        if (effectsData.fog) {
            scene.fog = effectsData.fog;
        }

        // Return all scene data for use by other systems
        return {
            // Room data
            materials: roomData.materials,
            objects: roomData.objects,
            speakerCones: roomData.speakerCones,

            // Lighting data
            ambientLight: lightingData.ambient,
            spotLight: lightingData.spot,
            ceilingLights: lightingData.ceilingLights,
            ledStrips: lightingData.ledStrips,

            // Effects data
            fog: effectsData.fog,
            hazeVolume: effectsData.hazeVolume,
            fogEmitters: effectsData.fogEmitters,
            screen: effectsData.screen,
            screenMaterial: effectsData.screenMaterial,
            screenTexture: effectsData.screenTexture,
            screenCanvas: effectsData.screenCanvas,
            screenContext: effectsData.screenContext,
            edgeStrip: effectsData.edgeStrip,
            backWallDisplay: effectsData.backWallDisplay,
            backWallMaterial: effectsData.backWallMaterial,
            backWallTexture: effectsData.backWallTexture,

            // Builder instances (for updates/animation)
            roomBuilder,
            lightingSetup,
            environmentEffects,
        };
    }
}
