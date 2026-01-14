/**
 * EnvironmentLoop - Handles environment animations and updates
 *
 * Extracted from UpdateManager.updateEnvironment() to reduce coupling
 * and organize environment update logic in one place.
 */
export class EnvironmentLoop {
    constructor(loopManager = null) {
        this.name = 'environment';
        this.bucketName = 'environment';
        this.priority = 80;
        this.enabled = true;

        // Self-register with LoopManager if provided
        if (loopManager) {
            this.register(loopManager);
        }
    }

    /**
     * Register this loop with LoopManager
     * @param {LoopManager} loopManager - The LoopManager instance
     */
    register(loopManager) {
        if (!loopManager) {
            console.warn('EnvironmentLoop: No LoopManager provided, skipping registration');
            return;
        }

        loopManager.addLoop(this.name, this, this.bucketName);
    }

    /**
     * Update environment animations
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    update(deltaTime, elapsedTime, systems) {
        // Animate fan rotation
        if (systems.leftFanBlades) {
            systems.leftFanBlades.rotation.y += deltaTime * 5;
        }
        if (systems.rightFanBlades) {
            systems.rightFanBlades.rotation.y += deltaTime * 5;
        }

        // Update screen texture animation (with audio visualization)
        if (systems.updateScreenTexture) {
            systems.updateScreenTexture(elapsedTime, systems.audioSystem);
        }

        // Apply glitch effect to screen
        if (systems.applyGlitchToScreen) {
            // Get screen effect intensity from settings if available
            let screenEffectIntensity = 1.0;
            if (window.gameSystems?.screenEffectsPresets) {
                const preset = window.gameSystems.screenEffectsPresets.getCurrentPreset();
                screenEffectIntensity = preset.screenEffectIntensity || 1.0;
            } else if (window.gameSystems?.visualEffectSettings) {
                screenEffectIntensity =
                    window.gameSystems.visualEffectSettings.getSetting('screenEffectIntensity') ||
                    1.0;
            }
            systems.applyGlitchToScreen(elapsedTime, screenEffectIntensity);
        }

        // Update DevMenu (for position tracking)
        if (systems.devMenu) {
            systems.devMenu.update(deltaTime);
        }

        // Update neon sign animation (with audio reactivity)
        if (systems.neonSign) {
            systems.neonSign.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ placeholder animation (with audio reactivity)
        if (systems.djPlaceholder) {
            systems.djPlaceholder.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ booth particles (with audio reactivity)
        if (systems.djBoothParticles) {
            systems.djBoothParticles.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update DJ booth lighting (with audio reactivity)
        if (systems.djBoothLighting) {
            systems.djBoothLighting.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update atmospheric fog (with audio reactivity)
        if (systems.atmosphericFog) {
            systems.atmosphericFog.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update laser beams (with audio reactivity)
        if (systems.laserBeams) {
            systems.laserBeams.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update dance floor lighting (with audio reactivity)
        if (systems.danceFloorLighting) {
            systems.danceFloorLighting.update(deltaTime, elapsedTime, systems.audioSystem);
        }

        // Update audio visualizer (with audio reactivity)
        if (systems.audioVisualizer) {
            systems.audioVisualizer.update(deltaTime, elapsedTime, systems.audioSystem);
        }
    }
}
