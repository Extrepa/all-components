/**
 * AudioInitializationHelper - Handles audio context and audio file initialization
 *
 * Extracted from main.js for better organization.
 */

/**
 * Initialize audio context and analyser
 * @returns {Promise<Object>} Promise resolving to {audioContext, analyser, audioData}
 */
export async function initAudioContext() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const bufferLength = analyser.frequencyBinCount;
        const audioData = new Uint8Array(bufferLength);

        console.log('Audio context initialized');
        return { audioContext, analyser, audioData };
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return { audioContext: null, analyser: null, audioData: null };
    }
}

/**
 * Load and play an audio file
 * @param {string} url - URL of the audio file
 * @param {AudioContext} audioContext - Web Audio context
 * @param {AnalyserNode} analyser - Analyser node
 * @returns {Promise<HTMLAudioElement|null>} Promise resolving to audio element or null
 */
export async function loadAudioFile(url, audioContext, analyser) {
    if (!audioContext || !analyser) {
        const result = await initAudioContext();
        if (!result.audioContext || !result.analyser) {
            console.warn('Cannot load audio file: audio context not available');
            return null;
        }
        // Use the newly created context
        audioContext = result.audioContext;
        analyser = result.analyser;
    }

    try {
        const audio = new Audio(url);
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        await audio.play();
        console.log('Audio loaded and playing from:', url);
        return audio;
    } catch (error) {
        console.error('Error loading audio file:', error);
        return null;
    }
}

/**
 * Initialize ambient audio (placeholder)
 * This is a placeholder function - actual audio loading will be in Chapter 6
 */
export function initAmbientAudio() {
    // TODO: Load actual audio file in Chapter 6
    // const audio = new Audio('public/audio/ambient-club.mp3');
    // audio.loop = true;
    // return audio;
    console.log('Ambient audio placeholder - will load in Chapter 6');
    return null;
}
