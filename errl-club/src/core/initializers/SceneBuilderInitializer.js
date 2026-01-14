/**
 * SceneBuilderInitializer - Handles room, lighting, and environment setup
 */
import { RoomBuilder } from '../../scene/RoomBuilder.js';
import { LightingSetup } from '../../scene/LightingSetup.js';
import { EnvironmentEffects } from '../../scene/EnvironmentEffects.js';

export class SceneBuilderInitializer {
    /**
     * Initialize scene builders (room, lighting, environment)
     * @param {THREE.Scene} scene - The Three.js scene
     * @returns {Object} Object containing materials, objects, lights, and environment effects
     */
    static initialize(scene) {
        // Build room geometry
        const roomBuilder = new RoomBuilder(scene);
        const roomData = roomBuilder.build();

        // Build lighting
        const lightingSetup = new LightingSetup(scene);
        const lightingData = lightingSetup.build();

        // Build environment effects
        const environmentEffects = new EnvironmentEffects(scene);
        const envData = environmentEffects.build();

        // Create wrapper functions for screen updates
        const updateScreenTexture = (time, audioSystem = null) => {
            environmentEffects.updateScreenTexture(time, audioSystem);
        };

        const applyGlitchToScreen = (time, intensity = 1.0) => {
            environmentEffects.applyGlitchToScreen(time, intensity);
        };

        return {
            // Materials
            floorMaterial: roomData.materials.floor,
            wallMaterial: roomData.materials.wall,
            stageMaterial: roomData.materials.stage,
            panelMaterial: roomData.materials.panel,
            // Objects
            speakerCones: roomData.speakerCones,
            leftFanBlades: roomData.objects.leftFanBlades,
            rightFanBlades: roomData.objects.rightFanBlades,
            // Lights
            spotLight: lightingData.spot,
            ceilingLights: lightingData.ceilingLights,
            ledStrips: lightingData.ledStrips,
            // Screen
            djScreen: envData.screen,
            screenMaterial: envData.screenMaterial,
            screenTexture: envData.screenTexture,
            // Environment
            environmentEffects,
            updateScreenTexture,
            applyGlitchToScreen,
        };
    }
}
