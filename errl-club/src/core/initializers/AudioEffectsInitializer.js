/**
 * AudioEffectsInitializer - Handles audio effects setup (low-pass filter, reverb, etc.)
 *
 * This module extracts audio effects initialization from main.js.
 */

/**
 * Setup low-pass filter for audio effects
 * @param {AudioContext} audioContext - Web Audio context
 * @param {AnalyserNode} analyser - Web Audio analyser node
 * @returns {Object} { lowPassFilter, toggleLowPass } - Filter and toggle function
 */
export function setupLowPassFilter(audioContext, analyser) {
    if (!audioContext || !analyser) {
        return { lowPassFilter: null, toggleLowPass: null };
    }

    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 1000;
    lowPassFilter.Q.value = 1;

    let lowPassEnabled = false;

    const toggleLowPass = (enabled) => {
        lowPassEnabled = enabled;
        if (lowPassFilter) {
            if (enabled) {
                lowPassFilter.frequency.value = 1000;
            } else {
                lowPassFilter.frequency.value = 22050; // Full frequency range
            }
        }
    };

    console.log('Low-pass filter created');
    return { lowPassFilter, toggleLowPass, lowPassEnabled };
}

/**
 * Setup reverb effect for audio
 * @param {AudioContext} audioContext - Web Audio context
 * @returns {ConvolverNode|null} Reverb convolver node or null
 */
export function setupReverb(audioContext) {
    if (!audioContext) {
        return null;
    }

    const reverbConvolver = audioContext.createConvolver();

    // Create impulse response for reverb (simplified)
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
    }

    reverbConvolver.buffer = impulse;
    console.log('Reverb effect created');
    return reverbConvolver;
}
