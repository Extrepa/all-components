/**
 * AudioReactiveLoop - Handles all audio-reactive visual effects
 *
 * Extracted from UpdateManager.updateAudioReactive() to reduce coupling
 * and organize audio-reactive logic in one place.
 */
import * as THREE from 'three';
import { ROOM_SIZE } from '../config/constants.js';

export class AudioReactiveLoop {
    constructor(loopManager = null) {
        this.name = 'audioReactive';
        this.bucketName = 'audioReactive';
        this.priority = 70;
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
            console.warn('AudioReactiveLoop: No LoopManager provided, skipping registration');
            return;
        }

        loopManager.addLoop(this.name, this, this.bucketName);
    }

    /**
     * Update audio-reactive visual effects
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    update(deltaTime, elapsedTime, systems) {
        if (!systems || !systems.audioSystem) {
            return;
        }

        const audioSystem = systems.audioSystem;

        // Map bass intensity to bloom strength
        if (systems.postProcessingManager && audioSystem.getFrequencyExtractor()) {
            const bloomPass = systems.postProcessingManager.getBloomPass();
            if (bloomPass) {
                const baseBloom = 1.5;
                const bloomMultiplier = 0.8;
                const frequencyBands = audioSystem.getFrequencyBands();
                if (!frequencyBands) {
                    return;
                }
                const bassIntensity = frequencyBands.bass || 0;
                let vibeMultiplier = 1.0;

                // Add vibe meter contribution to bloom
                if (systems.vibeMeter) {
                    const vibeLevel = systems.vibeMeter.getVibeLevel();
                    vibeMultiplier = 1.0 + vibeLevel * 0.5; // Up to 50% increase
                }

                // Update bloom intensity via PostProcessingManager
                const bloomIntensity =
                    (baseBloom + bassIntensity * bloomMultiplier) * vibeMultiplier;
                systems.postProcessingManager.updateBloomIntensity(bloomIntensity);
            }
        }

        // Update vibe meter
        if (systems.vibeMeter) {
            try {
                systems.vibeMeter.update(deltaTime, systems.avatar);

                // Add vibe on beat detection
                if (audioSystem.getBeatDetector()) {
                    const frequencyBands = audioSystem.getFrequencyBands();
                    if (frequencyBands && frequencyBands.bass > 0.6) {
                        systems.vibeMeter.addVibe(0.1);
                    }
                }

                // Apply vibe effects to game systems
                if (systems.vibeMeter.applyVibeEffects) {
                    systems.vibeMeter.applyVibeEffects(systems);
                }
            } catch (error) {
                console.warn('AudioReactiveLoop: Error updating vibe meter:', error);
            }
        }

        // Map mid frequency bands to wall light colors
        if (
            audioSystem.getFrequencyExtractor() &&
            systems.ceilingLights &&
            Array.isArray(systems.ceilingLights)
        ) {
            const frequencyBands = audioSystem.getFrequencyBands();
            if (!frequencyBands) {
                return;
            }
            systems.ceilingLights.forEach((lightObj) => {
                if (!lightObj) {
                    return;
                }
                try {
                    const midIntensity = frequencyBands.mid || 0;
                    const hue = ((midIntensity * 360) % 360) / 360; // Convert to 0-1 range
                    const saturation = 0.8;
                    const brightness = 0.5 + midIntensity * 0.3;
                    if (lightObj.bulb && lightObj.bulb.material) {
                        const material = lightObj.bulb.material;
                        if (material.emissive) {
                            material.emissive.setHSL(hue, saturation, brightness);
                        } else {
                            // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                            material.color.setHSL(hue, saturation, brightness);
                        }
                    }
                } catch (error) {
                    console.warn('AudioReactiveLoop: Error updating ceiling light:', error);
                }
            });
        }

        // Map treble to small sparkle particles
        if (audioSystem.getFrequencyExtractor() && systems.particleSystem) {
            const frequencyBands = audioSystem.getFrequencyBands();
            if (!frequencyBands) {
                return;
            }
            const trebleIntensity = frequencyBands.treble || 0;
            if (trebleIntensity > 0.6 && systems.particleSystem.createSparkleParticle) {
                try {
                    // Threshold for sparkle particles
                    const sparkleCount = Math.floor(trebleIntensity * 5);
                    for (let i = 0; i < sparkleCount; i++) {
                        const sparklePos = new THREE.Vector3(
                            (Math.random() - 0.5) * ROOM_SIZE,
                            Math.random() * 3 + 1,
                            (Math.random() - 0.5) * ROOM_SIZE
                        );
                        systems.particleSystem.createSparkleParticle(sparklePos, 0xffffff);
                    }
                } catch (error) {
                    console.warn('AudioReactiveLoop: Error creating sparkle particles:', error);
                }
            }
        }

        // Drive LED strip colors using spectrum slices
        if (
            audioSystem.getFrequencyExtractor() &&
            audioSystem.getAudioData() &&
            systems.ledStrips &&
            Array.isArray(systems.ledStrips) &&
            systems.ledStrips.length > 0
        ) {
            const audioData = audioSystem.getAudioData();
            const frequencyBands = audioSystem.getFrequencyBands();
            if (!audioData || !frequencyBands) {
                return;
            }
            systems.ledStrips.forEach((led, index) => {
                if (!led || !led.material) {
                    return;
                }
                try {
                    // Map different frequency ranges to different LED strips
                    const sliceSize = Math.floor(audioData.length / systems.ledStrips.length);
                    const sliceStart = index * sliceSize;
                    const sliceEnd = Math.min(sliceStart + sliceSize, audioData.length);

                    let sliceSum = 0;
                    for (let i = sliceStart; i < sliceEnd; i++) {
                        sliceSum += audioData[i];
                    }
                    const sliceIntensity = sliceSum / (sliceEnd - sliceStart) / 255;

                    // Add breathing effect using sine wave for smooth pulsing
                    const breathingPhase = Math.sin(elapsedTime * 2) * 0.1 + 1.0; // 0.9 to 1.1

                    // Map intensity to color
                    const hue = (elapsedTime * 0.1 + index * 0.2 + sliceIntensity) % 1;
                    const saturation = 0.8;
                    const baseBrightness = 0.5 + sliceIntensity * 0.5; // Frequency-based brightness
                    const brightness = baseBrightness * breathingPhase; // Breathing multiplies, not replaces
                    if (led.material.emissive) {
                        led.material.emissive.setHSL(hue, saturation, brightness);
                    } else {
                        // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                        led.material.color.setHSL(hue, saturation, brightness);
                    }
                } catch (error) {
                    console.warn(`AudioReactiveLoop: Error updating LED strip ${index}:`, error);
                }
            });

            // Update visualizer room LED strips with more intense effects
            if (
                systems.visualizerLEDStrips &&
                Array.isArray(systems.visualizerLEDStrips) &&
                systems.visualizerLEDStrips.length > 0
            ) {
                systems.visualizerLEDStrips.forEach((led, index) => {
                    if (!led || !led.userData || !led.userData.isVisualizerLED || !led.material) {
                        return;
                    }
                    try {
                        const sliceSize = Math.floor(
                            audioData.length / systems.visualizerLEDStrips.length
                        );
                        const sliceStart = index * sliceSize;
                        const sliceEnd = Math.min(sliceStart + sliceSize, audioData.length);

                        let sliceSum = 0;
                        for (let i = sliceStart; i < sliceEnd; i++) {
                            sliceSum += audioData[i];
                        }
                        const sliceIntensity = sliceSum / (sliceEnd - sliceStart) / 255;

                        // More intense breathing in visualizer room
                        const breathingPhase = Math.sin(elapsedTime * 3) * 0.2 + 1.0; // 0.8 to 1.2
                        const hue = (elapsedTime * 0.2 + index * 0.3 + sliceIntensity) % 1;
                        const baseBrightness = 0.7 + sliceIntensity * 0.3;
                        const brightness = baseBrightness * breathingPhase;
                        if (led.material.emissive) {
                            led.material.emissive.setHSL(hue, 1.0, brightness);
                            led.material.emissiveIntensity = 2.0 + sliceIntensity * 2.0;
                        } else {
                            // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                            led.material.color.setHSL(hue, 1.0, brightness);
                        }
                    } catch (error) {
                        console.warn(
                            `AudioReactiveLoop: Error updating visualizer LED strip ${index}:`,
                            error
                        );
                    }
                });
            }

            // Update visualizer room lights
            if (
                systems.visualizerLights &&
                Array.isArray(systems.visualizerLights) &&
                systems.visualizerLights.length > 0 &&
                audioSystem.getFrequencyExtractor()
            ) {
                const frequencyBands = audioSystem.getFrequencyBands();
                if (!frequencyBands) {
                    return;
                }
                systems.visualizerLights.forEach((light, index) => {
                    if (!light || !light.userData || !light.userData.isVisualizerLight) {
                        return;
                    }
                    try {
                        // Pulse lights based on frequency bands
                        const bandIndex = index % 3;
                        let intensity = 0;
                        if (bandIndex === 0) {
                            intensity = frequencyBands.bass;
                        } else if (bandIndex === 1) {
                            intensity = frequencyBands.mid;
                        } else {
                            intensity = frequencyBands.treble;
                        }

                        light.intensity = 2 + intensity * 3; // 2-5 intensity range
                        const hue = (elapsedTime * 0.1 + index * 0.2 + intensity) % 1;
                        light.color.setHSL(hue, 1.0, 0.5);
                    } catch (error) {
                        console.warn(
                            `AudioReactiveLoop: Error updating visualizer light ${index}:`,
                            error
                        );
                    }
                });
            }
        } else if (
            audioSystem &&
            systems.ledStrips &&
            Array.isArray(systems.ledStrips) &&
            systems.ledStrips.length > 0
        ) {
            // Fallback to original behavior
            try {
                const overallEnergy = audioSystem.getOverallEnergy() || 0;
                const bassEnergy = audioSystem.getBassEnergy() || 0;
                systems.ledStrips.forEach((led, index) => {
                    if (!led || !led.material) {
                        return;
                    }
                    try {
                        const hue = (elapsedTime * 0.1 + index * 0.2 + overallEnergy) % 1;
                        if (led.material.emissive) {
                            led.material.emissive.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
                        } else {
                            // Fallback for materials without emissive (e.g., MeshBasicMaterial)
                            led.material.color.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
                        }
                    } catch (error) {
                        console.warn(
                            `AudioReactiveLoop: Error updating LED strip ${index} (fallback):`,
                            error
                        );
                    }
                });
            } catch (error) {
                console.warn('AudioReactiveLoop: Error in LED strip fallback:', error);
            }
        }

        // Pulsing point lights - all lights pulse together to prevent left-right switching
        if (systems.ceilingLights && Array.isArray(systems.ceilingLights)) {
            try {
                // Calculate unified intensity so all lights pulse together
                let pulseIntensity = 1.0;
                if (audioSystem.getFrequencyExtractor() && audioSystem.getAudioData()) {
                    // Use overall energy instead of individual frequency bands
                    const overallEnergy = audioSystem.getOverallEnergy() || 0;
                    pulseIntensity = 1.0 + overallEnergy * 0.3; // Reduced from 0.8 to 0.3
                } else if (audioSystem) {
                    // Fallback to bass energy
                    pulseIntensity = 1.0 + (audioSystem.getBassEnergy() || 0) * 0.2; // Reduced from 0.5 to 0.2
                }

                // Apply same intensity to all lights so they pulse together
                systems.ceilingLights.forEach((lightObj) => {
                    if (!lightObj) {
                        return;
                    }
                    try {
                        if (lightObj.bulb && lightObj.bulb.material) {
                            if (lightObj.bulb.material.emissiveIntensity !== undefined) {
                                lightObj.bulb.material.emissiveIntensity = 0.15 * pulseIntensity; // Reduced base from 0.3 to 0.15
                            }
                        }
                        if (lightObj.light) {
                            lightObj.light.intensity = 0.3 * pulseIntensity; // Reduced base from 0.5 to 0.3
                        }
                    } catch (error) {
                        console.warn(
                            'AudioReactiveLoop: Error updating ceiling light pulse:',
                            error
                        );
                    }
                });
            } catch (error) {
                console.warn('AudioReactiveLoop: Error calculating pulse intensity:', error);
            }
        }

        // Enhanced subwoofer cone animation - tie more tightly to bass amplitude
        if (systems.speakerCones && Array.isArray(systems.speakerCones) && audioSystem) {
            try {
                const bassEnergy = audioSystem.getBassEnergy() || 0;
                const frequencyBands = audioSystem.getFrequencyBands();
                systems.speakerCones.forEach((coneData) => {
                    if (!coneData || !coneData.cone) {
                        return;
                    }
                    try {
                        const { cone, baseZ } = coneData;
                        // More realistic physics-based movement
                        const bassAmplitude = (frequencyBands && frequencyBands.bass) || bassEnergy;
                        const physicsPush = bassAmplitude * 0.15; // Stronger response
                        cone.position.z = (baseZ || 0) + physicsPush;

                        // Emit particle bursts from speakers on strong peaks
                        if (
                            audioSystem.getFrequencyExtractor() &&
                            systems.particleSystem &&
                            audioSystem.getAudioData() &&
                            systems.particleSystem.createSpeakerBurst
                        ) {
                            const audioData = audioSystem.getAudioData();
                            const frequencyExtractor = audioSystem.getFrequencyExtractor();
                            if (frequencyExtractor && frequencyExtractor.detectPeak) {
                                const strongPeak = frequencyExtractor.detectPeak(
                                    audioData,
                                    'bass',
                                    0.7
                                );
                                if (strongPeak && Math.random() < 0.1) {
                                    // 10% chance per frame when peak detected
                                    const speakerPosition = new THREE.Vector3();
                                    cone.getWorldPosition(speakerPosition);
                                    const burstDirection = new THREE.Vector3(0, 0, 1); // Forward from speaker
                                    cone.getWorldDirection(burstDirection);
                                    systems.particleSystem.createSpeakerBurst(
                                        speakerPosition,
                                        burstDirection,
                                        0xff00ff,
                                        (frequencyBands && frequencyBands.bass) || 0
                                    );
                                }
                            }
                        }
                    } catch (error) {
                        console.warn('AudioReactiveLoop: Error updating speaker cone:', error);
                    }
                });
            } catch (error) {
                console.warn('AudioReactiveLoop: Error in speaker cone animation:', error);
            }
        }

        // Use FFT data to distort certain shaders (floor, walls)
        if (audioSystem.getFrequencyExtractor() && audioSystem.getAudioData()) {
            try {
                const audioData = audioSystem.getAudioData();
                const frequencyBands = audioSystem.getFrequencyBands();
                const overallEnergy = audioSystem.getOverallEnergy() || 0;
                if (!audioData || !frequencyBands) {
                    return;
                }
                // Apply distortion to floor material based on overall FFT energy
                const distortionIntensity = overallEnergy * 0.1;
                if (systems.floorMaterial) {
                    try {
                        // Modify roughness and metalness based on FFT
                        systems.floorMaterial.roughness = 0.5 + distortionIntensity * 0.3;
                        systems.floorMaterial.metalness = 0.4 - distortionIntensity * 0.2;
                        // Add slight emissive glow based on bass
                        if (systems.floorMaterial.emissive) {
                            if (frequencyBands.bass > 0.5) {
                                systems.floorMaterial.emissive.setScalar(frequencyBands.bass * 0.1);
                                systems.floorMaterial.emissiveIntensity = frequencyBands.bass * 0.2;
                            } else {
                                systems.floorMaterial.emissive.setScalar(0);
                                systems.floorMaterial.emissiveIntensity = 0;
                            }
                        }
                        // Note: If material doesn't have emissive (e.g., MeshBasicMaterial), skip this effect
                    } catch (error) {
                        console.warn('AudioReactiveLoop: Error updating floor material:', error);
                    }
                }

                // Apply distortion to wall materials based on mid frequencies
                if (systems.wallMaterial) {
                    try {
                        const midDistortion = (frequencyBands.mid || 0) * 0.05;
                        systems.wallMaterial.roughness = 0.6 + midDistortion;
                        systems.wallMaterial.metalness = 0.2 - midDistortion;
                    } catch (error) {
                        console.warn('AudioReactiveLoop: Error updating wall material:', error);
                    }
                }
            } catch (error) {
                console.warn('AudioReactiveLoop: Error in FFT distortion:', error);
            }
        }
    }
}
