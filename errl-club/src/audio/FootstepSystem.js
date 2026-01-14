// Footstep sound system for avatar movement
import * as THREE from 'three';

export class FootstepSystem {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.lastFootstepTime = 0;
        this.strideTimer = 0;
        this.sounds = {
            floor: null,
            stage: null,
            ramp: null,
        };

        // Step 174: Distance-based volume control
        this.baseVolume = 0.1;
        this.distanceFromCenter = 0;
        this.maxDistance = 20; // Room size

        // Step 176: Create footstep sound variations (step on floor vs stage vs ramp)
        this.initSounds();
    }

    // Step 174: Adjust audio volume based on camera distance from center
    updateDistanceFromCenter(cameraPosition, centerPosition = new THREE.Vector3(0, 0, 0)) {
        this.distanceFromCenter = cameraPosition.distanceTo(centerPosition);
    }

    getVolumeMultiplier() {
        // Volume decreases with distance from center
        const normalizedDistance = Math.min(this.distanceFromCenter / this.maxDistance, 1.0);
        return 1.0 - normalizedDistance * 0.5; // Reduce volume by up to 50% at max distance
    }

    initSounds() {
        // Create placeholder sounds using Web Audio API oscillators
        // In production, these would be loaded audio files
        // For now, generate simple beep sounds for different surfaces

        // Floor sound (lower pitch)
        this.sounds.floor = this.createPlaceholderSound(200, 0.1);

        // Stage sound (higher pitch, more metallic)
        this.sounds.stage = this.createPlaceholderSound(300, 0.15);

        // Ramp sound (medium pitch)
        this.sounds.ramp = this.createPlaceholderSound(250, 0.12);
    }

    createPlaceholderSound(frequency, duration) {
        // Returns a function that plays a sound
        return () => {
            if (!this.audioContext) {
                return;
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // Step 174: Apply distance-based volume
            const volume = this.baseVolume * this.getVolumeMultiplier();
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + duration
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // Step 177: Trigger footstep sounds based on stride in walk/run animations
    update(deltaTime, avatar, surfaceType = 'floor') {
        if (!avatar || !avatar.velocity) {
            return;
        }

        const speed = avatar.velocity.length();

        // Only play footsteps when moving
        if (speed < 0.01) {
            this.strideTimer = 0;
            return;
        }

        // Calculate stride interval based on speed
        // Faster movement = shorter stride interval
        const baseStrideInterval = 0.5; // seconds between steps
        const speedMultiplier = Math.max(0.3, 1 - speed * 2); // Faster = shorter interval
        const strideInterval = baseStrideInterval * speedMultiplier;

        // Update stride timer
        this.strideTimer += deltaTime;

        // Play footstep when stride timer exceeds interval
        if (this.strideTimer >= strideInterval) {
            this.playFootstep(surfaceType);
            this.strideTimer = 0;
        }
    }

    playFootstep(surfaceType = 'floor') {
        const sound = this.sounds[surfaceType] || this.sounds.floor;
        if (sound) {
            sound();
        }
    }

    // Load actual audio files (for future implementation)
    async loadSoundFiles(floorPath, stagePath, rampPath) {
        // TODO: Implement audio file loading
        // const floorBuffer = await loadAudioBuffer(this.audioContext, floorPath);
        // const stageBuffer = await loadAudioBuffer(this.audioContext, stagePath);
        // const rampBuffer = await loadAudioBuffer(this.audioContext, rampPath);
    }
}
