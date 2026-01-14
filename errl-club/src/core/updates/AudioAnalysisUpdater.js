/**
 * AudioAnalysisUpdater - Handles frame-by-frame audio analysis and reactive effects
 *
 * This module extracts the audio analysis logic from main.js's animate loop.
 * It handles frequency band extraction, beat detection, and triggering reactive effects.
 */

/**
 * Update audio analysis including frequency bands, beat detection, and reactive effects
 * @param {Object} params - Analysis parameters
 * @param {AnalyserNode} params.analyser - Web Audio analyser node
 * @param {Uint8Array} params.audioData - Audio frequency data array
 * @param {FrequencyBandExtractor} params.frequencyExtractor - Frequency band extractor
 * @param {BeatDetector} params.beatDetector - Beat detector
 * @param {THREE.Clock} params.clock - Three.js clock for timing
 * @param {Object} params.codexAssetIntegration - Codex asset integration system
 * @param {Object} params.particleSystem - Particle system
 * @param {Object} params.eventSystem - Event system
 * @param {Object} params.visualEffects - Visual effects system
 * @param {Object} params.worldStateReactor - World state reactor
 * @param {Object} params.avatar - Avatar instance
 * @param {Object} params.audioReactiveDebugger - Audio reactive debugger
 * @param {Object} params.frequencyBands - Frequency bands object (will be mutated)
 * @param {number} params.bassEnergy - Bass energy (will be mutated)
 * @param {number} params.overallEnergy - Overall energy (will be mutated)
 * @param {number} params.roomSize - Room size for effects (optional, defaults to 20)
 * @returns {Object} Updated energy values { frequencyBands, bassEnergy, overallEnergy }
 */
export function updateAudioAnalysis({
    analyser,
    audioData,
    frequencyExtractor,
    beatDetector,
    clock,
    codexAssetIntegration,
    particleSystem,
    eventSystem,
    visualEffects,
    worldStateReactor,
    avatar,
    audioReactiveDebugger,
    frequencyBands,
    bassEnergy,
    overallEnergy,
    roomSize = 20,
}) {
    if (!analyser || !audioData) {
        // Simulate audio for testing when no audio is loaded
        bassEnergy = (Math.sin(clock.getElapsedTime() * 2) + 1) * 0.3;
        overallEnergy = (Math.sin(clock.getElapsedTime() * 1.5) + 1) * 0.4;
        return { frequencyBands, bassEnergy, overallEnergy };
    }

    analyser.getByteFrequencyData(audioData);

    // Extract frequency bands
    if (frequencyExtractor) {
        frequencyBands = frequencyExtractor.extractBands(audioData);

        // Debug: Log frequency bands if debugger enabled
        if (audioReactiveDebugger?.enabled) {
            audioReactiveDebugger.logFrequencyBands(frequencyBands);
        }

        // Update Codex asset audio-reactive properties
        if (codexAssetIntegration && particleSystem) {
            codexAssetIntegration.updateAudioReactive(frequencyBands, particleSystem);

            // Debug: Log asset responses if debugger enabled
            if (audioReactiveDebugger?.enabled) {
                const boombox = codexAssetIntegration.loadedAssets.get('boombox');
                const geodesic = codexAssetIntegration.loadedAssets.get('geodesicStation');
                const helmet = codexAssetIntegration.loadedAssets.get('damagedHelmet');

                if (boombox?.userData.audioReactive) {
                    const intensity = frequencyBands.bass || 0;
                    audioReactiveDebugger.logAssetResponse('BoomBox', 'bass', intensity);
                }
                if (geodesic?.userData.audioReactive) {
                    const intensity = frequencyBands.mid || 0;
                    audioReactiveDebugger.logAssetResponse('Geodesic Station', 'mid', intensity);
                }
                if (helmet?.userData.audioReactive) {
                    const intensity = frequencyBands.treble || 0;
                    audioReactiveDebugger.logAssetResponse('DamagedHelmet', 'treble', intensity);
                }
            }
        }
    }

    // Detect beats using BeatDetector
    if (beatDetector) {
        const currentTime = clock.getElapsedTime();
        const beatDetected = beatDetector.detectBeat(audioData, currentTime);

        // Debug: Log beats if debugger enabled
        if (audioReactiveDebugger?.enabled) {
            const intensity = frequencyBands?.bass || 0;
            audioReactiveDebugger.logBeat(beatDetected, intensity);
        }

        if (beatDetected) {
            // Map beat events to short strobe flashes
            if (eventSystem) {
                eventSystem.triggerStrobe(0.1, 5); // Short strobe flash on beat
            }

            // Trigger bass quake on strong beats
            if (frequencyExtractor && frequencyBands?.bass > 0.7 && eventSystem) {
                eventSystem.triggerBassQuake(frequencyBands.bass, 0.3);
            }

            // Create floor ripple on beats
            if (visualEffects && frequencyBands?.bass > 0.6 && avatar) {
                visualEffects.createFloorRipple(avatar.position.clone(), 0.5, frequencyBands.bass);
            }

            // Spawn laser ribbons on heavy bass drops
            if (visualEffects && frequencyBands?.bass > 0.7) {
                visualEffects.createSweepingLasers(
                    roomSize,
                    6.0,
                    [0xff0000, 0x00ff00, 0x0000ff],
                    frequencyBands.bass
                );
            }

            // Beat detected - trigger world reactions
            if (worldStateReactor) {
                worldStateReactor.reactToBeat(bassEnergy, currentTime);
            }
        }
    }

    // Calculate average bass energy (lower frequencies) - keep for backward compatibility
    let bassSum = 0;
    const bassRange = Math.floor(audioData.length * 0.1); // First 10% of frequencies
    for (let i = 0; i < bassRange; i++) {
        bassSum += audioData[i];
    }
    bassEnergy = bassSum / bassRange / 255; // Normalize to 0-1
    // Use frequency extractor bass if available
    if (frequencyExtractor) {
        bassEnergy = frequencyBands?.bass || bassEnergy;
    }

    // Calculate overall energy
    let totalSum = 0;
    for (let i = 0; i < audioData.length; i++) {
        totalSum += audioData[i];
    }
    overallEnergy = totalSum / audioData.length / 255; // Normalize to 0-1

    return { frequencyBands, bassEnergy, overallEnergy };
}
