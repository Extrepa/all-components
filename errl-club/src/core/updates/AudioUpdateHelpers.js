/**
 * AudioUpdateHelpers - Helper functions for audio-reactive updates
 *
 * These functions handle audio-reactive lighting, fog, and screen effects.
 * Eventually these should be integrated into AudioSystem or UpdateManager.
 */

/**
 * Update spot light intensity based on bass energy
 * @param {THREE.SpotLight} spotLight - The spot light to update
 * @param {number} bassEnergy - Current bass energy (0-1)
 */
export function updateAudioReactiveLighting(spotLight, bassEnergy) {
    if (!spotLight) {
        return;
    }

    const baseIntensity = 1;
    const reactiveIntensity = baseIntensity + bassEnergy * 2;
    spotLight.intensity = reactiveIntensity;
}

/**
 * Update fog density and color based on frequency bands
 * @param {THREE.Fog} fog - The scene fog to update
 * @param {Object} frequencyBands - Frequency band data { bass, mid, treble }
 * @param {number} overallEnergy - Overall audio energy (0-1)
 */
export function updateAudioReactiveFog(fog, frequencyBands, overallEnergy) {
    if (!fog) {
        return;
    }

    // Tie density strongly to low-frequency energy
    const lowFreqEnergy = frequencyBands?.bass || overallEnergy;
    const baseDensity = 0.05;
    const reactiveDensity = baseDensity + lowFreqEnergy * 0.08;
    fog.density = reactiveDensity;

    // Chromatic fog - map frequency bands to color
    // Bass = red hue, Mid = green hue, Treble = blue hue
    const bassHue = (frequencyBands?.bass || 0) * 0.0; // Red (0.0 = red in HSL)
    const midHue = (frequencyBands?.mid || 0) * 0.33; // Green (0.33 = green in HSL)
    const trebleHue = (frequencyBands?.treble || 0) * 0.67; // Blue (0.67 = blue in HSL)

    // Blend hues based on frequency band intensities
    const totalIntensity =
        (frequencyBands?.bass || 0) + (frequencyBands?.mid || 0) + (frequencyBands?.treble || 0);
    let blendedHue = 0.5; // Default cyan
    if (totalIntensity > 0.1) {
        blendedHue =
            (bassHue * (frequencyBands?.bass || 0) +
                midHue * (frequencyBands?.mid || 0) +
                trebleHue * (frequencyBands?.treble || 0)) /
            totalIntensity;
    }

    const saturation = 0.5 + (frequencyBands?.mid || overallEnergy) * 0.4;
    const lightness = 0.1 + lowFreqEnergy * 0.15;
    fog.color.setHSL(blendedHue, saturation, lightness);
}

/**
 * Update audio fade-in progress
 * @param {HTMLAudioElement} ambientAudio - The ambient audio element
 * @param {number} deltaTime - Time since last frame
 * @param {number} audioFadeInProgress - Current fade-in progress (0-1)
 * @param {number} audioFadeInDuration - Duration of fade-in in seconds
 * @returns {number} Updated fade-in progress
 */
export function updateAudioFadeIn(
    ambientAudio,
    deltaTime,
    audioFadeInProgress,
    audioFadeInDuration
) {
    if (!ambientAudio) {
        return audioFadeInProgress;
    }

    const newProgress = Math.min(1.0, audioFadeInProgress + deltaTime / audioFadeInDuration);
    if (ambientAudio.volume !== undefined) {
        ambientAudio.volume = newProgress * 0.5; // Max volume 50%
    }
    return newProgress;
}
