/**
 * AudioSystemsInitializationHelper - Handles audio-related system initialization
 *
 * Extracted from main.js's initAudio() function.
 */

/**
 * Initialize AudioPlayer
 * @param {AudioContext} audioContext - Web Audio context
 * @returns {AudioPlayer|null} AudioPlayer instance or null
 */
export async function initializeAudioPlayer(audioContext) {
    if (!audioContext) {
        return null;
    }

    try {
        const { AudioPlayer } = await import('../../ui/AudioPlayer.js');
        const audioPlayer = new AudioPlayer(audioContext, (track) => {
            console.log('Track changed:', track);
        });
        // Hide the standalone audio player - we'll use ErrlPhone's music tab
        const audioPlayerEl = document.getElementById('audio-player');
        if (audioPlayerEl) {
            audioPlayerEl.style.display = 'none';
        }
        console.log('AudioPlayer initialized');
        return audioPlayer;
    } catch (error) {
        console.warn('Failed to initialize AudioPlayer:', error);
        return null;
    }
}

/**
 * Initialize ErrlPhone UI
 * @param {Object} params - Parameters
 * @param {Object} params.avatar - Avatar instance
 * @param {Object} params.audioPlayer - AudioPlayer instance
 * @param {AudioContext} params.audioContext - Web Audio context
 * @param {THREE.Scene} params.scene - Three.js scene
 * @returns {ErrlPhone|null} ErrlPhone instance or null
 */
export async function initializeErrlPhone({ avatar, audioPlayer, audioContext, scene }) {
    if (!avatar) {
        return null;
    }

    try {
        const { ErrlPhone } = await import('../../ui/ErrlPhone.js');
        const errlPhone = new ErrlPhone(null, {
            avatar,
            audioPlayer,
            audioContext,
            scene,
        });
        console.log('ErrlPhone initialized');
        return errlPhone;
    } catch (error) {
        console.warn('Failed to initialize ErrlPhone:', error);
        return null;
    }
}

/**
 * Initialize BeatDetector
 * @param {AnalyserNode} analyser - Web Audio analyser node
 * @returns {BeatDetector|null} BeatDetector instance or null
 */
export async function initializeBeatDetector(analyser) {
    if (!analyser) {
        return null;
    }

    try {
        const { BeatDetector } = await import('../../audio/BeatDetector.js');
        const beatDetector = new BeatDetector(analyser);
        console.log('Beat detector initialized');
        return beatDetector;
    } catch (error) {
        console.warn('Failed to initialize BeatDetector:', error);
        return null;
    }
}

/**
 * Initialize FrequencyBandExtractor
 * @param {AnalyserNode} analyser - Web Audio analyser node
 * @param {number} sampleRate - Audio sample rate
 * @param {Object} codexAssetIntegration - CodexAssetIntegration instance (optional)
 * @param {Array} portalRifts - Portal rifts array (optional)
 * @returns {FrequencyBandExtractor|null} FrequencyBandExtractor instance or null
 */
export async function initializeFrequencyBandExtractor(
    analyser,
    sampleRate,
    codexAssetIntegration = null,
    portalRifts = []
) {
    if (!analyser) {
        return null;
    }

    try {
        const { FrequencyBandExtractor } = await import('../../audio/FrequencyBandExtractor.js');
        const frequencyExtractor = new FrequencyBandExtractor(analyser, sampleRate || 44100);
        console.log('Frequency band extractor initialized');

        // Wire Codex asset audio-reactive features
        if (codexAssetIntegration) {
            codexAssetIntegration.wireAudioReactive(frequencyExtractor);
        }

        // Wire portal rifts to frequencyExtractor (via beatDetector if available)
        // Portal rifts are wired to beatDetector separately in initAudio

        return frequencyExtractor;
    } catch (error) {
        console.warn('Failed to initialize FrequencyBandExtractor:', error);
        return null;
    }
}
