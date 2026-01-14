/**
 * EnvironmentAnimator - Handles environment animations (lights, fans, materials, etc.)
 *
 * Extracted from main.js's animate loop for better organization.
 */

import * as THREE from 'three';

/**
 * Update ceiling lights with frequency-based pulsing
 * @param {Array} ceilingLights - Array of ceiling light objects
 * @param {FrequencyBandExtractor} frequencyExtractor - Frequency extractor
 * @param {Uint8Array} audioData - Audio frequency data
 * @param {Object} frequencyBands - Frequency bands object
 * @param {number} bassEnergy - Bass energy fallback
 * @param {number} overallEnergy - Overall energy
 */
export function updateCeilingLights(
    ceilingLights,
    frequencyExtractor,
    audioData,
    frequencyBands,
    bassEnergy,
    overallEnergy
) {
    ceilingLights.forEach((lightObj, index) => {
        // Map mid frequency bands to wall light colors
        if (frequencyExtractor && frequencyBands?.mid !== undefined) {
            const midIntensity = frequencyBands.mid;
            const hue = ((midIntensity * 360) % 360) / 360; // Convert to 0-1 range
            const saturation = 0.8;
            const brightness = 0.5 + midIntensity * 0.3;
            if (lightObj.bulb && lightObj.bulb.material && lightObj.bulb.material.emissive) {
                lightObj.bulb.material.emissive.setHSL(hue, saturation, brightness);
            }
        }

        // Pulsing point lights based on FFT ranges
        let pulseIntensity = 1.0;
        if (frequencyExtractor && audioData) {
            // Distribute frequency bands across lights
            const lightCount = ceilingLights.length;
            const bandPerLight = audioData.length / lightCount;
            const startBin = Math.floor(index * bandPerLight);
            const endBin = Math.floor((index + 1) * bandPerLight);

            let bandSum = 0;
            for (let i = startBin; i < endBin && i < audioData.length; i++) {
                bandSum += audioData[i];
            }
            const bandIntensity = bandSum / (endBin - startBin) / 255;
            pulseIntensity = 1 + bandIntensity * 0.8;
        } else {
            // Fallback to bass energy
            pulseIntensity = 1 + bassEnergy * 0.5;
        }

        if (lightObj.bulb?.material?.emissiveIntensity !== undefined) {
            lightObj.bulb.material.emissiveIntensity = 0.3 * pulseIntensity;
        }
        if (lightObj.light) {
            lightObj.light.intensity = 0.5 * pulseIntensity;
        }
    });
}

/**
 * Update LED strips with spectrum slices and breathing effect
 * @param {Array} ledStrips - Array of LED strip meshes
 * @param {FrequencyBandExtractor} frequencyExtractor - Frequency extractor
 * @param {Uint8Array} audioData - Audio frequency data
 * @param {number} elapsedTime - Elapsed time
 * @param {number} overallEnergy - Overall energy fallback
 * @param {number} bassEnergy - Bass energy fallback
 */
export function updateLEDStrips(
    ledStrips,
    frequencyExtractor,
    audioData,
    elapsedTime,
    overallEnergy,
    bassEnergy
) {
    if (frequencyExtractor && audioData) {
        ledStrips.forEach((led, index) => {
            // Map different frequency ranges to different LED strips
            const sliceSize = Math.floor(audioData.length / ledStrips.length);
            const sliceStart = index * sliceSize;
            const sliceEnd = Math.min(sliceStart + sliceSize, audioData.length);

            let sliceSum = 0;
            for (let i = sliceStart; i < sliceEnd; i++) {
                sliceSum += audioData[i];
            }
            const sliceIntensity = sliceSum / (sliceEnd - sliceStart) / 255;

            // Breathing effect using sine wave for smooth pulsing
            const breathingPhase = Math.sin(elapsedTime * 2) * 0.1 + 1.0; // 0.9 to 1.1

            // Map intensity to color
            const hue = (elapsedTime * 0.1 + index * 0.2 + sliceIntensity) % 1;
            const saturation = 0.8;
            const baseBrightness = 0.5 + sliceIntensity * 0.5;
            const brightness = baseBrightness * breathingPhase;
            if (led.material.emissive) {
                led.material.emissive.setHSL(hue, saturation, brightness);
            } else {
                led.material.color.setHSL(hue, saturation, brightness);
            }
        });
    } else {
        // Fallback to original behavior
        ledStrips.forEach((led, index) => {
            const hue = (elapsedTime * 0.1 + index * 0.2 + overallEnergy) % 1;
            if (led.material.emissive) {
                led.material.emissive.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
            } else {
                led.material.color.setHSL(hue, 0.8, 0.5 + bassEnergy * 0.3);
            }
        });
    }
}

/**
 * Update speaker cones with bass-reactive animation
 * @param {Array} speakerCones - Array of {cone, baseZ} objects
 * @param {FrequencyBandExtractor} frequencyExtractor - Frequency extractor
 * @param {Object} frequencyBands - Frequency bands object
 * @param {number} bassEnergy - Bass energy fallback
 * @param {Uint8Array} audioData - Audio frequency data
 * @param {ParticleSystem} particleSystem - Particle system for bursts
 */
export function updateSpeakerCones(
    speakerCones,
    frequencyExtractor,
    frequencyBands,
    bassEnergy,
    audioData,
    particleSystem
) {
    speakerCones.forEach(({ cone, baseZ }, index) => {
        const bassAmplitude = frequencyBands?.bass || bassEnergy;
        const physicsPush = bassAmplitude * 0.15; // Stronger response
        cone.position.z = baseZ + physicsPush;

        // Emit particle bursts from speakers on strong peaks
        if (frequencyExtractor && particleSystem && audioData) {
            const strongPeak = frequencyExtractor.detectPeak(audioData, 'bass', 0.7);
            if (strongPeak && Math.random() < 0.1) {
                // 10% chance per frame when peak detected
                const speakerPosition = new THREE.Vector3();
                cone.getWorldPosition(speakerPosition);
                const burstDirection = new THREE.Vector3(0, 0, 1); // Forward from speaker
                cone.getWorldDirection(burstDirection);
                particleSystem.createSpeakerBurst(
                    speakerPosition,
                    burstDirection,
                    0xff00ff,
                    bassAmplitude
                );
            }
        }
    });
}

/**
 * Update fan blade rotation
 * @param {THREE.Mesh} leftFanBlades - Left fan blades mesh
 * @param {THREE.Mesh} rightFanBlades - Right fan blades mesh
 * @param {number} deltaTime - Time since last frame
 */
export function updateFanBlades(leftFanBlades, rightFanBlades, deltaTime) {
    if (leftFanBlades) {
        leftFanBlades.rotation.y += deltaTime * 5;
    }
    if (rightFanBlades) {
        rightFanBlades.rotation.y += deltaTime * 5;
    }
}

/**
 * Update holographic rings around DJ booth
 * @param {Array} holographicRings - Array of ring meshes
 * @param {number} deltaTime - Time since last frame
 * @param {number} elapsedTime - Elapsed time
 * @param {Object} frequencyBands - Frequency bands object
 */
export function updateHolographicRings(holographicRings, deltaTime, elapsedTime, frequencyBands) {
    if (!holographicRings || holographicRings.length === 0) {
        return;
    }

    holographicRings.forEach((ring, index) => {
        const rotationSpeed =
            ring.userData.baseRotationSpeed * (window.restModeEnabled ? 0.3 : 1.0);
        ring.rotation.z += deltaTime * rotationSpeed;

        // Orbit around booth center
        const orbitRadius = 0.3;
        const orbitSpeed = 0.5 + index * 0.2;
        ring.position.y = ring.userData.baseY + Math.sin(elapsedTime * orbitSpeed) * orbitRadius;

        // Pulse emissive intensity with audio (if available)
        if (frequencyBands?.mid) {
            const audioBoost = window.restModeEnabled ? 0.3 : 1.0;
            ring.material.emissiveIntensity = 0.5 + frequencyBands.mid * 0.5 * audioBoost;
        }
    });
}

/**
 * Update material properties based on audio
 * @param {THREE.Material} floorMaterial - Floor material
 * @param {THREE.Material} wallMaterial - Wall material
 * @param {FrequencyBandExtractor} frequencyExtractor - Frequency extractor
 * @param {Uint8Array} audioData - Audio frequency data
 * @param {Object} frequencyBands - Frequency bands object
 * @param {number} overallEnergy - Overall energy
 */
export function updateMaterialProperties(
    floorMaterial,
    wallMaterial,
    frequencyExtractor,
    audioData,
    frequencyBands,
    overallEnergy
) {
    if (!frequencyExtractor || !audioData) {
        return;
    }

    // Apply distortion to floor material based on overall FFT energy
    const distortionIntensity = overallEnergy * 0.1;
    if (floorMaterial) {
        // Modify roughness and metalness based on FFT
        floorMaterial.roughness = 0.5 + distortionIntensity * 0.3;
        floorMaterial.metalness = 0.4 - distortionIntensity * 0.2;
        // Add slight emissive glow based on bass (only for materials that support emissive)
        if (floorMaterial.emissive && frequencyBands?.bass > 0.5) {
            floorMaterial.emissive.setScalar(frequencyBands.bass * 0.1);
            if (floorMaterial.emissiveIntensity !== undefined) {
                floorMaterial.emissiveIntensity = frequencyBands.bass * 0.2;
            }
        } else if (floorMaterial.emissive) {
            floorMaterial.emissive.setScalar(0);
            if (floorMaterial.emissiveIntensity !== undefined) {
                floorMaterial.emissiveIntensity = 0;
            }
        }
    }

    // Apply distortion to wall materials based on mid frequencies
    if (wallMaterial && frequencyBands?.mid) {
        const midDistortion = frequencyBands.mid * 0.05;
        wallMaterial.roughness = 0.6 + midDistortion;
        wallMaterial.metalness = 0.2 - midDistortion;
    }
}
