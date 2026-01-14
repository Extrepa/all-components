// World-state reactor system that maps beats and interactions to environment changes
import * as THREE from 'three';

export class WorldStateReactor {
    constructor(scene, eventSystem, visualEffects) {
        this.scene = scene;
        this.eventSystem = eventSystem;
        this.visualEffects = visualEffects;

        // State tracking
        this.beatCount = 0;
        this.lastBeatTime = 0;
        this.interactionCount = 0;
        this.energyLevel = 0; // 0-1, overall energy level
        this.energyDecay = 0.95; // Energy decays over time

        // Reaction thresholds
        this.beatThreshold = 0.7; // Bass energy threshold for beat reaction
        this.interactionThreshold = 5; // Interactions before triggering reaction

        // Environment state
        this.environmentState = {
            lightingIntensity: 1.0,
            fogDensity: 0.5,
            particleIntensity: 1.0,
            colorScheme: 'default',
        };
    }

    // Step 248: World-state reactor system
    update(deltaTime, elapsedTime, bassEnergy, overallEnergy, avatar) {
        // Update energy level based on audio
        this.energyLevel = Math.max(this.energyLevel * this.energyDecay, overallEnergy);

        // React to beats
        if (bassEnergy > this.beatThreshold) {
            this.reactToBeat(bassEnergy, elapsedTime);
        }

        // React to interactions (tracked externally)
        // This would be called when interactions occur

        // Update environment based on energy level
        this.updateEnvironment(deltaTime);
    }

    reactToBeat(bassEnergy, elapsedTime) {
        this.beatCount++;
        this.lastBeatTime = elapsedTime;

        // Trigger reactions based on beat count
        if (this.beatCount % 4 === 0) {
            // Every 4 beats - minor reaction
            this.triggerMinorReaction();
        }

        if (this.beatCount % 16 === 0) {
            // Every 16 beats - major reaction
            this.triggerMajorReaction();
        }

        // Strong bass hits trigger immediate reactions
        if (bassEnergy > 0.9) {
            this.triggerStrongBassReaction(bassEnergy);
        }
    }

    reactToInteraction(type, position) {
        this.interactionCount++;

        // Trigger reactions based on interaction count
        if (this.interactionCount % this.interactionThreshold === 0) {
            this.triggerInteractionReaction(type, position);
        }
    }

    triggerMinorReaction() {
        // Minor reactions: subtle lighting changes, small particle bursts
        this.environmentState.lightingIntensity = 1.0 + Math.random() * 0.2;

        if (this.visualEffects) {
            // Small particle effect
            // Could trigger small visual effect here
        }
    }

    triggerMajorReaction() {
        // Major reactions: lighting changes, fog bursts, visual effects
        this.environmentState.lightingIntensity = 1.2 + Math.random() * 0.3;
        this.environmentState.fogDensity = 0.5 + Math.random() * 0.3;

        if (this.eventSystem) {
            // Trigger a brief strobe or wave
            if (Math.random() > 0.5) {
                this.eventSystem.triggerStrobe(1.0);
            } else {
                this.eventSystem.triggerWave(2.0);
            }
        }
    }

    triggerStrongBassReaction(bassEnergy) {
        // Strong bass reactions: intense effects
        this.environmentState.lightingIntensity = 1.5;
        this.environmentState.particleIntensity = 1.0 + bassEnergy;

        if (this.visualEffects) {
            // Create distortion ring at center
            this.visualEffects.createDistortionRing(new THREE.Vector3(0, 0, 0), 1.0, 3.0);
        }

        if (this.eventSystem) {
            // Brief intense strobe
            this.eventSystem.triggerStrobe(0.5);
        }
    }

    triggerInteractionReaction(type, position) {
        // Reactions to interactions: localized effects
        if (this.visualEffects && position) {
            // Create visual effect at interaction position
            this.visualEffects.createDistortionRing(position, 0.5, 2.0);
        }

        // Increase energy slightly
        this.energyLevel = Math.min(1.0, this.energyLevel + 0.1);
    }

    updateEnvironment(deltaTime) {
        // Gradually return to baseline
        this.environmentState.lightingIntensity = THREE.MathUtils.lerp(
            this.environmentState.lightingIntensity,
            1.0,
            deltaTime * 2
        );

        this.environmentState.fogDensity = THREE.MathUtils.lerp(
            this.environmentState.fogDensity,
            0.5,
            deltaTime * 0.5
        );

        this.environmentState.particleIntensity = THREE.MathUtils.lerp(
            this.environmentState.particleIntensity,
            1.0,
            deltaTime * 3
        );
    }

    getEnvironmentState() {
        return { ...this.environmentState };
    }

    getEnergyLevel() {
        return this.energyLevel;
    }

    reset() {
        this.beatCount = 0;
        this.interactionCount = 0;
        this.energyLevel = 0;
        this.environmentState = {
            lightingIntensity: 1.0,
            fogDensity: 0.5,
            particleIntensity: 1.0,
            colorScheme: 'default',
        };
    }
}
