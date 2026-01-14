// Audio manager for multiple audio sources, mixing, and crossfading
export class AudioManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.tracks = [];
        this.currentTrack = null;
        this.currentSource = null;
        this.analyser = null;
        this.gainNode = null;
        this.masterGain = null;

        // Crossfader (Step 256)
        this.crossfader = {
            trackA: null,
            trackB: null,
            position: 0.5, // 0 = trackA, 1 = trackB
            isCrossfading: false,
        };

        // Per-room audio zones (Step 270)
        this.audioZones = [];
        this.currentZone = null;

        this.setupAudioNodes();
    }

    setupAudioNodes() {
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);

        // Create analyser for FFT
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.connect(this.masterGain);

        // Create gain node for main track
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.analyser);
    }

    // Step 254: Add support for switching between multiple tracks
    addTrack(name, url, buffer = null) {
        const track = {
            name: name,
            url: url,
            buffer: buffer,
            source: null,
            gainNode: null,
            isPlaying: false,
        };

        this.tracks.push(track);

        if (!this.currentTrack) {
            this.currentTrack = track;
        }

        return track;
    }

    // Load track from URL
    async loadTrackFromURL(url, name = null) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            return this.addTrack(name || url.split('/').pop(), url, audioBuffer);
        } catch (error) {
            console.error('Error loading track:', error);
            throw error;
        }
    }

    // Step 254: Switch to a different track
    switchTrack(trackIndex) {
        if (trackIndex >= 0 && trackIndex < this.tracks.length) {
            this.stop();
            this.currentTrack = this.tracks[trackIndex];
            return true;
        }
        return false;
    }

    // Play current track
    play() {
        if (!this.currentTrack || !this.currentTrack.buffer) {
            return;
        }

        this.stop();

        const source = this.audioContext.createBufferSource();
        source.buffer = this.currentTrack.buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0;

        source.connect(gainNode);
        gainNode.connect(this.gainNode);

        source.start();

        this.currentTrack.source = source;
        this.currentTrack.gainNode = gainNode;
        this.currentTrack.isPlaying = true;

        source.onended = () => {
            this.currentTrack.isPlaying = false;
            this.currentTrack.source = null;
        };
    }

    stop() {
        if (this.currentTrack && this.currentTrack.source) {
            this.currentTrack.source.stop();
            this.currentTrack.source = null;
            this.currentTrack.isPlaying = false;
        }
    }

    // Step 256: Crossfader for transitioning between two tracks
    setCrossfaderPosition(position) {
        this.crossfader.position = Math.max(0, Math.min(1, position));

        if (this.crossfader.isCrossfading) {
            if (this.crossfader.trackA && this.crossfader.trackA.gainNode) {
                this.crossfader.trackA.gainNode.gain.value = 1 - this.crossfader.position;
            }
            if (this.crossfader.trackB && this.crossfader.trackB.gainNode) {
                this.crossfader.trackB.gain.value = this.crossfader.position;
            }
        }
    }

    // Start crossfading between two tracks
    startCrossfade(trackAIndex, trackBIndex, duration = 2.0) {
        if (
            trackAIndex < 0 ||
            trackAIndex >= this.tracks.length ||
            trackBIndex < 0 ||
            trackBIndex >= this.tracks.length
        ) {
            return;
        }

        const trackA = this.tracks[trackAIndex];
        const trackB = this.tracks[trackBIndex];

        // Stop current playback
        this.stop();

        // Start both tracks
        const sourceA = this.audioContext.createBufferSource();
        sourceA.buffer = trackA.buffer;
        const gainA = this.audioContext.createGain();
        gainA.gain.value = 1.0;
        sourceA.connect(gainA);
        gainA.connect(this.gainNode);
        sourceA.start();

        const sourceB = this.audioContext.createBufferSource();
        sourceB.buffer = trackB.buffer;
        const gainB = this.audioContext.createGain();
        gainB.gain.value = 0.0;
        sourceB.connect(gainB);
        gainB.connect(this.gainNode);
        sourceB.start();

        trackA.source = sourceA;
        trackA.gainNode = gainA;
        trackB.source = sourceB;
        trackB.gainNode = gainB;

        this.crossfader.trackA = trackA;
        this.crossfader.trackB = trackB;
        this.crossfader.isCrossfading = true;
        this.crossfader.position = 0;

        // Smoothly crossfade
        gainA.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        gainB.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + duration);

        // After crossfade, stop trackA
        setTimeout(() => {
            if (sourceA) {
                sourceA.stop();
            }
            this.crossfader.trackA = null;
            this.currentTrack = trackB;
        }, duration * 1000);
    }

    // Step 270: Per-room audio zones with different mixes or FX
    addAudioZone(name, bounds, volume = 1.0, effects = []) {
        const zone = {
            name: name,
            bounds: bounds,
            volume: volume,
            effects: effects,
            gainNode: null,
        };

        this.audioZones.push(zone);
        return zone;
    }

    // Check if position is in an audio zone
    checkAudioZone(position) {
        for (const zone of this.audioZones) {
            const bounds = zone.bounds;
            if (
                position.x >= bounds.minX &&
                position.x <= bounds.maxX &&
                position.z >= bounds.minZ &&
                position.z <= bounds.maxZ
            ) {
                return zone;
            }
        }
        return null;
    }

    // Step 271: Add reverb in side corridors
    addReverb(zone, impulseResponse = null) {
        if (!zone) {
            return;
        }

        // Create convolver for reverb
        const convolver = this.audioContext.createConvolver();

        if (impulseResponse) {
            convolver.buffer = impulseResponse;
        } else {
            // Create simple reverb impulse response
            const length = this.audioContext.sampleRate * 2;
            const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }

            convolver.buffer = impulse;
        }

        zone.effects.push(convolver);
        return convolver;
    }

    // Step 272: Stereo panning for speaker positions
    setPanning(source, position, speakerPosition) {
        const panner = this.audioContext.createStereoPanner();
        const distance = position.distanceTo(speakerPosition);
        const maxDistance = 10;
        const pan = Math.max(-1, Math.min(1, (speakerPosition.x - position.x) / maxDistance));

        panner.pan.value = pan;
        source.connect(panner);
        panner.connect(this.gainNode);

        return panner;
    }

    // Step 273: Low-frequency rumble layers at very strong bass
    addRumbleLayer(intensity = 0.1) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.value = 100; // Low frequencies only

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 60; // Low rumble

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        gainNode.gain.value = intensity;

        oscillator.start();

        return {
            oscillator: oscillator,
            gainNode: gainNode,
            setIntensity: (intensity) => {
                gainNode.gain.value = intensity;
            },
        };
    }

    // Get analyser for FFT analysis
    getAnalyser() {
        return this.analyser;
    }

    // Get current track
    getCurrentTrack() {
        return this.currentTrack;
    }

    // Get all tracks
    getTracks() {
        return this.tracks;
    }

    // Set master volume
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
}
