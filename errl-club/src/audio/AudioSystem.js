/**
 * AudioSystem - Centralized audio initialization, loading, and analysis
 */
import { BeatDetector } from './BeatDetector.js';
import { FrequencyBandExtractor } from './FrequencyBandExtractor.js';
import { FootstepSystem } from './FootstepSystem.js';
import { CollectibleManager } from '../collectibles/CollectibleManager.js';
import { loadAudioMapping } from '../config/audioMapping.js';
import { ROOM_SIZE } from '../config/constants.js';
import { SystemLoop } from '../systems/SystemLoop.js';

export class AudioSystem extends SystemLoop {
    constructor(scene, clock, dependencies = {}, loopManager = null) {
        super('audio', 'audio', 40);
        this.scene = scene;
        this.clock = clock;
        this.loopManager = loopManager; // Store for later use when creating CollectibleManager

        // Dependencies (optional, passed in)
        this.eventSystem = dependencies.eventSystem || null;
        this.visualEffects = dependencies.visualEffects || null;
        this.visualRecorder = dependencies.visualRecorder || null;
        this.worldStateReactor = dependencies.worldStateReactor || null;
        this.avatar = dependencies.avatar || null;
        this.eventBus = dependencies.eventBus || null;

        // State variables
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.audioData = null;
        this.bassEnergy = 0;
        this.overallEnergy = 0;
        this.frequencyBands = { bass: 0, mid: 0, treble: 0 };

        // Audio analysis components
        this.beatDetector = null;
        this.frequencyExtractor = null;
        this.audioMapping = null;

        // Ambient audio
        this.ambientAudio = null;
        this.audioFadeInProgress = 0;
        this.audioFadeInDuration = 2.0; // seconds

        // Audio effects
        this.lowPassFilter = null;
        this.lowPassEnabled = false;
        this.reverbConvolver = null;

        // Callbacks for initialized systems
        this.onFootstepSystemInitialized = null;
        this.onCollectibleManagerInitialized = null;

        this.initialized = false;
    }

    /**
     * Initialize audio context (requires user interaction)
     * @returns {Promise} Resolves when audio is initialized
     */
    async initialize() {
        if (this.initialized) {
            return Promise.resolve();
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            const bufferLength = this.analyser.frequencyBinCount;
            this.audioData = new Uint8Array(bufferLength);

            // Initialize footstep system once audio context is ready
            if (this.onFootstepSystemInitialized && this.audioContext) {
                const footstepSystem = new FootstepSystem(this.audioContext);
                this.onFootstepSystemInitialized(footstepSystem);
            }

            // Initialize collectible manager once audio context is ready
            if (this.onCollectibleManagerInitialized && this.audioContext) {
                const collectionTracker = this.dependencies?.collectionTracker || null;
                const rareCollectibleTracker = this.dependencies?.rareCollectibleTracker || null;
                // Get loopManager from dependencies or stored reference
                const loopManager = this.dependencies?.loopManager || this.loopManager || null;
                const collectibleManager = new CollectibleManager(
                    this.scene,
                    this.audioContext,
                    collectionTracker,
                    loopManager
                );
                // Set rareCollectibleTracker after creation (if needed)
                if (rareCollectibleTracker) {
                    collectibleManager.rareCollectibleTracker = rareCollectibleTracker;
                }
                // Spawn all collectible types around the room
                collectibleManager.spawnDrips(10, {
                    width: ROOM_SIZE * 0.8,
                    depth: ROOM_SIZE * 0.8,
                    height: 1.0,
                });
                collectibleManager.spawnBubbles(5, {
                    width: ROOM_SIZE * 0.8,
                    depth: ROOM_SIZE * 0.8,
                    height: 2.0,
                });
                collectibleManager.spawnFragments(3, {
                    width: ROOM_SIZE * 0.8,
                    depth: ROOM_SIZE * 0.8,
                    height: 1.5,
                });
                collectibleManager.spawnGlowBalls(2, {
                    width: ROOM_SIZE * 0.8,
                    depth: ROOM_SIZE * 0.8,
                    height: 1.5,
                });
                this.onCollectibleManagerInitialized(collectibleManager);
            }

            // Initialize beat detector once analyser is ready
            if (!this.beatDetector && this.analyser) {
                this.beatDetector = new BeatDetector(this.analyser);
                console.log('Beat detector initialized');
            }

            // Initialize frequency band extractor
            if (!this.frequencyExtractor && this.analyser) {
                const sampleRate = this.audioContext.sampleRate || 44100;
                this.frequencyExtractor = new FrequencyBandExtractor(this.analyser, sampleRate);
                console.log('Frequency band extractor initialized');
            }

            // Load audio mapping configuration
            if (!this.audioMapping) {
                this.audioMapping = loadAudioMapping('default');
                console.log('Audio mapping loaded:', this.audioMapping);
            }

            this.initialized = true;
            console.log('Audio system initialized. Ready to load audio files.');
            console.log('Audio files should be placed in public/audio/ directory');
        } catch (error) {
            const errorMessage =
                'AudioSystem: Failed to initialize audio context. Audio features will be unavailable.';
            console.warn(errorMessage, error);

            // Show user-friendly error notification if available
            if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
                window.gameSystems.notificationSystem.show(
                    'Audio system initialization failed. Some audio features may be unavailable.',
                    'warning',
                    5000
                );
            }

            // Don't throw - allow game to continue without audio
            // The system will use fallback simulated audio
            this.initialized = false;
        }
    }

    /**
     * Load and play audio file
     *
     * Attempts to load an audio file using multiple methods:
     * 1. First tries HTML5 Audio API (simpler, better browser support)
     * 2. Falls back to Web Audio API if HTML5 Audio fails
     *
     * @param {string} url - URL of audio file to load
     * @returns {Promise<Audio|AudioBufferSourceNode>} Resolves with audio element or source node
     * @throws {Error} If audio loading fails completely
     * @example
     * ```javascript
     * try {
     *   const audio = await audioSystem.loadFile('public/audio/track.mp3');
     *   // Audio is now playing
     * } catch (error) {
     *   console.error('Failed to load audio:', error);
     * }
     * ```
     */
    async loadFile(url) {
        if (!url || typeof url !== 'string') {
            const error = new Error('AudioSystem: Invalid URL provided to loadFile');
            console.error(error);
            throw error;
        }

        if (!this.audioContext) {
            try {
                await this.initialize();
            } catch (initError) {
                const error = new Error(
                    `AudioSystem: Failed to initialize audio context: ${initError.message}`
                );
                console.error(error);
                throw error;
            }
        }

        try {
            // Stop any currently playing audio
            if (this.audioSource) {
                if (this.audioSource.stop) {
                    this.audioSource.stop();
                }
                this.audioSource = null;
            }

            // Create audio element for MediaElementSource
            const audio = new Audio(url);
            audio.crossOrigin = 'anonymous'; // Allow CORS for external URLs

            // Wait for audio to be ready
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.load();
            });

            // Create MediaElementSource from audio element
            this.audioSource = this.audioContext.createMediaElementSource(audio);

            // Connect audio source to analyser, then to destination
            // Apply filters if enabled
            if (this.lowPassFilter && this.lowPassEnabled) {
                this.audioSource.connect(this.lowPassFilter);
                this.lowPassFilter.connect(this.analyser);
            } else if (this.reverbConvolver) {
                this.audioSource.connect(this.reverbConvolver);
                this.reverbConvolver.connect(this.analyser);
            } else {
                this.audioSource.connect(this.analyser);
            }
            this.analyser.connect(this.audioContext.destination);

            // Play audio
            await audio.play();

            console.log('Audio loaded and playing from:', url);
            return audio;
        } catch (error) {
            console.error('Error loading audio file:', error);
            // Fallback: try using AudioBuffer approach
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                source.start(0);

                this.audioSource = source;
                console.log('Audio loaded using AudioBuffer from:', url);
                return source;
            } catch (fallbackError) {
                const errorMessage = `AudioSystem: Failed to load audio file "${url}". Both primary and fallback methods failed.`;
                console.error(errorMessage, fallbackError);

                // Show user-friendly error notification if available
                if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
                    window.gameSystems.notificationSystem.show(
                        'Failed to load audio file. Please check the file path and format.',
                        'error',
                        5000
                    );
                }

                throw new Error(`${errorMessage} ${fallbackError.message}`);
            }
        }
    }

    /**
     * Initialize ambient audio (placeholder)
     *
     * NOTE: This is currently a placeholder implementation.
     * Actual audio playback will be implemented in Chapter 6 of the development roadmap.
     *
     * To implement actual audio playback:
     * 1. Add audio files to public/audio/ directory
     * 2. Uncomment and configure the Audio object below
     * 3. Implement proper error handling for audio loading failures
     * 4. Add volume controls and audio settings integration
     * 5. Consider using Web Audio API for more advanced features
     *
     * Requirements for implementation:
     * - Audio file format: MP3 or OGG (for browser compatibility)
     * - File size: Keep under 5MB for initial load performance
     * - Licensing: Ensure proper licensing for any audio assets
     *
     * @see docs/specs/development-roadmap.md Chapter 6: Audio & Visual Systems
     * @todo Implement actual audio file loading in Chapter 6
     */
    initAmbientAudio() {
        try {
            // TODO: Load actual audio file (Chapter 6 implementation)
            // Implementation example:
            // const audio = new Audio('public/audio/ambient-club.mp3');
            // audio.loop = true;
            // audio.volume = this.getMasterVolume() / 100;
            // audio.addEventListener('error', (e) => {
            //     console.error('Failed to load ambient audio:', e);
            //     if (window.gameSystems?.notificationSystem) {
            //         window.gameSystems.notificationSystem.show('Failed to load ambient audio', 'error');
            //     }
            // });
            // this.ambientAudio = audio;
            console.log('Ambient audio placeholder - audio loading not yet implemented');
        } catch (error) {
            console.warn('AudioSystem: Error in initAmbientAudio:', error);
            // Gracefully handle error - ambient audio is optional
        }
    }

    /**
     * Update audio analysis each frame
     *
     * Performs real-time audio analysis including:
     * - Frequency band extraction (bass, mid, treble)
     * - Beat detection
     * - Energy level calculations
     *
     * Falls back to simulated audio data if no real audio is available.
     *
     * @param {THREE.Clock} clock - Three.js clock for elapsed time (optional)
     * @throws {Error} Only in extreme cases - most errors are caught and handled gracefully
     */
    /**
     * Update audio analysis - adapts SystemLoop interface to existing signature
     * @param {number} deltaTime - Time since last frame (from SystemLoop)
     * @param {number} elapsedTime - Total elapsed time (from SystemLoop)
     * @param {Object} systems - Game systems (from SystemLoop, contains clock)
     */
    update(deltaTime, elapsedTime, systems) {
        // Extract clock from systems or use stored clock
        const clock = systems?.clock || this.clock;

        // Call original update method with clock
        this.updateAudio(clock);
    }

    /**
     * Original update method - kept for compatibility
     * @param {THREE.Clock} clock - Three.js clock
     */
    updateAudio(clock) {
        try {
            if (!this.analyser || !this.audioData) {
                // Simulate audio for testing when no audio is loaded (fallback)
                if (clock) {
                    this.bassEnergy = (Math.sin(clock.getElapsedTime() * 2) + 1) * 0.3;
                    this.overallEnergy = (Math.sin(clock.getElapsedTime() * 1.5) + 1) * 0.4;
                } else {
                    this.bassEnergy = 0.3;
                    this.overallEnergy = 0.4;
                }
                return;
            }

            try {
                this.analyser.getByteFrequencyData(this.audioData);
            } catch (error) {
                console.warn('AudioSystem: Error reading audio data from analyser:', error);
                // Fallback to simulated audio
                if (clock) {
                    this.bassEnergy = (Math.sin(clock.getElapsedTime() * 2) + 1) * 0.3;
                    this.overallEnergy = (Math.sin(clock.getElapsedTime() * 1.5) + 1) * 0.4;
                }
                return;
            }

            // Extract frequency bands
            if (this.frequencyExtractor && this.audioData) {
                try {
                    this.frequencyBands = this.frequencyExtractor.extractBands(this.audioData);
                } catch (error) {
                    console.warn('AudioSystem: Error extracting frequency bands:', error);
                    // Fallback to zero bands
                    this.frequencyBands = { bass: 0, mid: 0, treble: 0 };
                }
            }

            // Detect beats using BeatDetector
            if (this.beatDetector && this.audioData) {
                try {
                    const currentTime = clock ? clock.getElapsedTime() : 0;
                    const beatDetected = this.beatDetector.detectBeat(this.audioData, currentTime);
                    if (beatDetected) {
                        const beatCount = this.beatDetector.getBeatCount();

                        // Emit beat event via EventBus
                        if (this.eventBus) {
                            try {
                                this.eventBus.emit('audio.beat', {
                                    count: beatCount,
                                    bassEnergy: this.bassEnergy,
                                    frequencyBands: this.frequencyBands,
                                    timestamp: currentTime,
                                });
                            } catch (eventError) {
                                console.warn('AudioSystem: Error emitting beat event:', eventError);
                                // Continue - event emission failure is not critical
                            }
                        }

                        // Apply audio mapping configuration to effects
                        const bassConfig = this.audioMapping?.bass || {
                            threshold: 0.5,
                            intensity: 1.0,
                        };
                        const midConfig = this.audioMapping?.mid || {
                            threshold: 0.4,
                            intensity: 1.0,
                        };
                        const _trebleConfig = this.audioMapping?.treble || {
                            threshold: 0.6,
                            intensity: 1.0,
                        };

                        // Map beat events to short strobe flashes (if enabled in config)
                        if (
                            this.eventSystem &&
                            (midConfig.effects?.includes('strobe') || !this.audioMapping)
                        ) {
                            this.eventSystem.triggerStrobe(0.1, 5);
                            if (this.visualRecorder) {
                                this.visualRecorder.logEvent('strobe', {
                                    duration: 0.1,
                                    intensity: 5,
                                    trigger: 'beat',
                                });
                            }
                        }

                        // Trigger bass quake on strong beats (if enabled in config)
                        if (
                            this.frequencyExtractor &&
                            this.frequencyBands.bass > bassConfig.threshold
                        ) {
                            if (
                                this.eventSystem &&
                                (bassConfig.effects?.includes('bassQuake') || !this.audioMapping)
                            ) {
                                const intensity = bassConfig.intensity || 1.0;
                                this.eventSystem.triggerBassQuake(
                                    this.frequencyBands.bass * intensity,
                                    0.3
                                );
                                if (this.visualRecorder) {
                                    this.visualRecorder.logEvent('bassQuake', {
                                        intensity: this.frequencyBands.bass * intensity,
                                        duration: 0.3,
                                    });
                                }
                            }
                        }

                        // Create floor ripple on beats (if enabled in config)
                        if (
                            this.visualEffects &&
                            this.frequencyBands.bass > bassConfig.threshold &&
                            this.avatar
                        ) {
                            if (bassConfig.effects?.includes('floorRipple') || !this.audioMapping) {
                                const intensity = bassConfig.intensity || 1.0;
                                this.visualEffects.createFloorRipple(
                                    this.avatar.position.clone(),
                                    0.5,
                                    this.frequencyBands.bass * intensity
                                );
                                if (this.visualRecorder) {
                                    this.visualRecorder.logEvent('floorRipple', {
                                        position: this.avatar.position.clone(),
                                        intensity: this.frequencyBands.bass * intensity,
                                    });
                                }
                            }
                        }

                        // Trigger color inversion on every 16th beat
                        if (beatCount > 0 && beatCount % 16 === 0 && this.eventSystem) {
                            this.eventSystem.triggerColorInversion(0.2);
                            if (this.visualRecorder) {
                                this.visualRecorder.logEvent('colorInversion', {
                                    duration: 0.2,
                                    trigger: 'beat16',
                                });
                            }
                        }

                        // Log beat detection event
                        if (this.visualRecorder) {
                            this.visualRecorder.logEvent('beat', {
                                count: beatCount,
                                bassEnergy: this.frequencyBands.bass,
                            });
                        }

                        // Beat detected - trigger world reactions
                        if (this.worldStateReactor) {
                            this.worldStateReactor.reactToBeat(this.bassEnergy, currentTime);
                        }
                    }
                } catch (error) {
                    console.warn('Error in beat detection:', error);
                }
            }

            // Calculate average bass energy (lower frequencies) - keep for backward compatibility
            if (this.audioData && this.audioData.length > 0) {
                let bassSum = 0;
                const bassRange = Math.floor(this.audioData.length * 0.1); // First 10% of frequencies
                for (let i = 0; i < bassRange; i++) {
                    bassSum += this.audioData[i];
                }
                this.bassEnergy = bassSum / bassRange / 255; // Normalize to 0-1
                // Use frequency extractor bass if available
                if (this.frequencyExtractor && this.frequencyBands) {
                    this.bassEnergy = this.frequencyBands.bass || this.bassEnergy;
                }

                // Calculate overall energy
                let totalSum = 0;
                for (let i = 0; i < this.audioData.length; i++) {
                    totalSum += this.audioData[i];
                }
                this.overallEnergy = totalSum / this.audioData.length / 255; // Normalize to 0-1
            }
        } catch (error) {
            // Gracefully handle audio analysis errors
            console.warn('Audio analysis error:', error);
            // Reset values to prevent NaN propagation
            this.bassEnergy = 0;
            this.overallEnergy = 0;
            if (this.frequencyBands) {
                this.frequencyBands.bass = 0;
                this.frequencyBands.mid = 0;
                this.frequencyBands.treble = 0;
            }
        }
    }

    /**
     * Update audio-reactive lighting
     * @param {THREE.SpotLight} spotLight - Spot light to update
     */
    updateReactiveLighting(spotLight) {
        if (spotLight) {
            const baseIntensity = 1;
            const reactiveIntensity = baseIntensity + this.bassEnergy * 2;
            spotLight.intensity = reactiveIntensity;
        }
    }

    /**
     * Update audio-reactive fog
     * @param {THREE.Scene} scene - Scene with fog
     */
    updateReactiveFog(scene) {
        if (scene.fog) {
            // Tie density strongly to low-frequency energy
            const lowFreqEnergy = this.frequencyBands.bass || this.overallEnergy;
            const baseDensity = 0.05;
            const reactiveDensity = baseDensity + lowFreqEnergy * 0.08; // Stronger tie to bass
            scene.fog.density = reactiveDensity;

            // Adjust color based on frequency bands
            const hueShift = (this.frequencyBands.mid || this.overallEnergy) * 0.2;
            const saturation = 0.3 + (this.frequencyBands.treble || this.overallEnergy) * 0.3;
            scene.fog.color.setHSL(0.5 + hueShift, saturation, 0.1 + lowFreqEnergy * 0.1);
        }
    }

    /**
     * Update audio fade-in
     * @param {number} deltaTime - Time since last frame
     */
    updateAudioFadeIn(deltaTime) {
        if (this.ambientAudio) {
            this.audioFadeInProgress = Math.min(
                1.0,
                this.audioFadeInProgress + deltaTime / this.audioFadeInDuration
            );
            if (this.ambientAudio.volume !== undefined) {
                this.ambientAudio.volume = this.audioFadeInProgress * 0.5; // Max volume 50%
            }
        }
    }

    /**
     * Setup low-pass filter
     */
    setupLowPassFilter() {
        if (this.audioContext && this.analyser) {
            this.lowPassFilter = this.audioContext.createBiquadFilter();
            this.lowPassFilter.type = 'lowpass';
            this.lowPassFilter.frequency.value = 1000;
            this.lowPassFilter.Q.value = 1;

            // Connect: source -> lowPassFilter -> analyser -> destination
            // (Will be connected when audio source is loaded)
            console.log('Low-pass filter created');
        }
    }

    /**
     * Toggle low-pass filter
     * @param {boolean} enabled - Enable or disable filter
     */
    toggleLowPass(enabled) {
        this.lowPassEnabled = enabled;
        if (this.lowPassFilter) {
            if (enabled) {
                this.lowPassFilter.frequency.value = 1000;
            } else {
                this.lowPassFilter.frequency.value = 22050; // Full frequency range
            }
        }
    }

    /**
     * Setup reverb effect
     */
    setupReverb() {
        if (this.audioContext) {
            // Create a simple reverb using convolution
            this.reverbConvolver = this.audioContext.createConvolver();

            // Create impulse response for reverb (simplified)
            const sampleRate = this.audioContext.sampleRate;
            const length = sampleRate * 2; // 2 seconds
            const impulse = this.audioContext.createBuffer(2, length, sampleRate);

            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }

            this.reverbConvolver.buffer = impulse;
            console.log('Reverb effect created');
        }
    }

    // Public getters

    /**
     * Get current audio frequency data
     *
     * Returns the raw frequency data from the audio analyser.
     * This is a Uint8Array containing frequency bin values (0-255).
     *
     * @returns {Uint8Array|null} Current audio frequency data, or null if not available
     */
    getAudioData() {
        return this.audioData;
    }

    /**
     * Get current bass energy level
     *
     * Returns a normalized value (0-1) representing the current bass energy.
     * This is calculated from the low-frequency bands of the audio spectrum.
     *
     * @returns {number} Bass energy level (0-1)
     */
    getBassEnergy() {
        return this.bassEnergy;
    }

    /**
     * Get current overall audio energy level
     *
     * Returns a normalized value (0-1) representing the overall audio energy
     * across all frequency bands. Useful for general audio reactivity.
     *
     * @returns {number} Overall energy level (0-1)
     */
    getOverallEnergy() {
        return this.overallEnergy;
    }

    /**
     * Get current frequency bands
     *
     * Returns an object containing normalized energy levels for bass, mid, and treble frequencies.
     * Each value is between 0 and 1.
     *
     * @returns {Object} Frequency bands object with properties:
     *   - bass: {number} Low frequency energy (0-1)
     *   - mid: {number} Mid frequency energy (0-1)
     *   - treble: {number} High frequency energy (0-1)
     */
    getFrequencyBands() {
        return this.frequencyBands;
    }

    /**
     * Get the beat detector instance
     *
     * Returns the BeatDetector instance used for beat detection.
     * Can be used to access beat detection methods and state.
     *
     * @returns {BeatDetector|null} Beat detector instance, or null if not initialized
     */
    getBeatDetector() {
        return this.beatDetector;
    }

    /**
     * Get the frequency band extractor instance
     *
     * Returns the FrequencyBandExtractor instance used for extracting
     * frequency bands from audio data.
     *
     * @returns {FrequencyBandExtractor|null} Frequency extractor instance, or null if not initialized
     */
    getFrequencyExtractor() {
        return this.frequencyExtractor;
    }
    getAudioContext() {
        return this.audioContext;
    }
    getAnalyser() {
        return this.analyser;
    }

    /**
     * Set callbacks for initialized systems
     */
    setOnFootstepSystemInitialized(callback) {
        this.onFootstepSystemInitialized = callback;
    }

    setOnCollectibleManagerInitialized(callback) {
        this.onCollectibleManagerInitialized = callback;
    }
}
