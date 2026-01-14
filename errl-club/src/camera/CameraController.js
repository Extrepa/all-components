// Camera controller system - manages all camera behavior
import * as THREE from 'three';
import { CAMERA_CONFIG } from '../config/constants.js';

export class CameraController {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.config = CAMERA_CONFIG;

        // Camera state
        // angleX is pitch from vertical: 0 = looking straight down, π/2 = horizontal
        // 1.2 radians (~69°) gives a good third-person behind-and-above view
        this.state = {
            target: new THREE.Vector3(0, 1.5, 0), // Target slightly lower for better framing
            distance: 10, // Slightly further back
            angleX: 1.2, // Vertical angle (pitch) - ~69° from vertical for good 3rd person view
            angleY: 0, // Horizontal angle (yaw)
            targetDistance: 10,
            targetAngleX: 1.2,
            targetAngleY: 0,
            autoAlignTimer: 0,
            autoAlignDelay: 2.0,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
        };

        // Camera presets
        // angleX: pitch from vertical (higher = more horizontal/behind player)
        this.presets = {
            normal: { distance: 10, angleX: 1.2, fov: 60 }, // Standard third-person
            intimate: { distance: 6, angleX: 1.0, fov: 70 }, // Closer, slightly higher angle
            wide: { distance: 18, angleX: 1.3, fov: 50 }, // Far back, more horizontal
        };
        this.currentPreset = 'normal';

        // Advanced camera modes
        this.mode = 'follow'; // 'follow', 'cinematic', 'lockon', 'freecam'
        this.lockOnTarget = null;
        this.cinematicOrbitSpeed = 0.2;
        this.cinematicOrbitRadius = 10;
        this.cinematicOrbitAngle = 0;
        this.freecamPosition = new THREE.Vector3(0, 5, 10);
        this.freecamRotation = new THREE.Euler(0, 0, 0);

        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDecay = 5.0;

        // Audio-reactive camera settings
        this.audioReactiveEnabled = true;
        this.audioReactiveIntensity = 1.0;
        this.audioReactiveSmoothing = 0.8;
        this.frequencyBandMapping = {
            bass: 'shake', // Bass affects shake
            mid: 'movement', // Mid affects subtle movement
            treble: 'rotation', // Treble affects rotation
        };
        this.audioReactiveValues = {
            shake: 0,
            movement: 0,
            rotation: 0,
        };

        // Head bob (for first-person mode)
        this.headBobAmount = 0;
        this.headBobSpeed = 0;

        // Micro jitter
        this.jitterAmount = 0.002;
        this.jitterEnabled = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse controls will be handled by main.js for now
        // Can be moved here later if needed
    }

    // Step 164: Add cinematic camera mode that slowly orbits
    setCinematicMode(enabled) {
        if (enabled) {
            this.mode = 'cinematic';
            this.cinematicOrbitAngle = 0;
        } else {
            this.mode = 'follow';
        }
    }

    // Step 188: Implement lock-on camera mode (focus specific object)
    setLockOn(target) {
        if (target) {
            this.mode = 'lockon';
            this.lockOnTarget = target;
        } else {
            this.mode = 'follow';
            this.lockOnTarget = null;
        }
    }

    // Step 189: Implement freecam debug mode (detaches from avatar)
    setFreecam(enabled) {
        if (enabled) {
            this.mode = 'freecam';
            this.freecamPosition.copy(this.camera.position);
            this.freecamRotation.copy(this.camera.rotation);
        } else {
            this.mode = 'follow';
        }
    }

    // Step 192: Add camera shake on strong bass hits
    addShake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    /**
     * Set audio-reactive camera settings
     * @param {Object} config - Configuration
     * @param {boolean} config.enabled - Enable/disable audio-reactive camera
     * @param {number} config.intensity - Intensity multiplier (0-1)
     * @param {number} config.smoothing - Smoothing factor (0-1)
     * @param {Object} config.frequencyBandMapping - Map frequency bands to camera aspects
     */
    setAudioReactiveConfig(config) {
        if (config.enabled !== undefined) {
            this.audioReactiveEnabled = config.enabled;
        }
        if (config.intensity !== undefined) {
            this.audioReactiveIntensity = Math.max(0, Math.min(1, config.intensity));
        }
        if (config.smoothing !== undefined) {
            this.audioReactiveSmoothing = Math.max(0, Math.min(1, config.smoothing));
        }
        if (config.frequencyBandMapping) {
            this.frequencyBandMapping = {
                ...this.frequencyBandMapping,
                ...config.frequencyBandMapping,
            };
        }
    }

    /**
     * Update audio-reactive camera effects
     * @param {Object} frequencyBands - Frequency band data {bass, mid, treble}
     * @param {Object} settings - Camera settings (optional, for intensity multiplier)
     */
    updateAudioReactive(frequencyBands, settings = null) {
        if (!this.audioReactiveEnabled || !frequencyBands) {
            return;
        }

        // Get intensity multiplier from settings if available
        let intensityMultiplier = this.audioReactiveIntensity;
        if (settings && settings.bassReactiveShakeEnabled === false) {
            return; // Disabled in settings
        }
        if (settings && settings.shakeIntensityMultiplier !== undefined) {
            intensityMultiplier *= settings.shakeIntensityMultiplier;
        }

        // Map frequency bands to camera aspects with smoothing
        const bass = frequencyBands.bass || 0;
        const mid = frequencyBands.mid || 0;
        const treble = frequencyBands.treble || 0;

        // Update shake from bass
        if (this.frequencyBandMapping.bass === 'shake') {
            const targetShake = bass * intensityMultiplier * 0.15;
            this.audioReactiveValues.shake = THREE.MathUtils.lerp(
                this.audioReactiveValues.shake,
                targetShake,
                1 - this.audioReactiveSmoothing
            );
            if (bass > 0.6) {
                this.addShake(this.audioReactiveValues.shake);
            }
        }

        // Update movement from mid
        if (this.frequencyBandMapping.mid === 'movement') {
            const targetMovement = mid * intensityMultiplier * 0.05;
            this.audioReactiveValues.movement = THREE.MathUtils.lerp(
                this.audioReactiveValues.movement,
                targetMovement,
                1 - this.audioReactiveSmoothing
            );
        }

        // Update rotation from treble
        if (this.frequencyBandMapping.treble === 'rotation') {
            const targetRotation = treble * intensityMultiplier * 0.02;
            this.audioReactiveValues.rotation = THREE.MathUtils.lerp(
                this.audioReactiveValues.rotation,
                targetRotation,
                1 - this.audioReactiveSmoothing
            );
        }
    }

    // Set camera preset
    setPreset(presetName) {
        if (this.presets[presetName]) {
            const preset = this.presets[presetName];
            this.state.targetDistance = preset.distance;
            this.state.targetAngleX = preset.angleX;
            this.camera.fov = preset.fov;
            this.camera.updateProjectionMatrix();
            this.currentPreset = presetName;
        }
    }

    // Snap camera behind avatar - immediately positions camera, no lerping
    snapBehindAvatar(avatar) {
        if (!avatar) return;
        
        // Get actual world position of avatar group
        let avatarWorldPos = new THREE.Vector3();
        if (avatar.group) {
            avatar.group.getWorldPosition(avatarWorldPos);
        } else if (avatar.position) {
            avatarWorldPos.copy(avatar.position);
        } else {
            return;
        }

        // Position camera behind and above avatar - higher and further for overview
        const cameraX = avatarWorldPos.x;
        const cameraY = avatarWorldPos.y + 5;
        const cameraZ = avatarWorldPos.z + 12;
        
        this.camera.position.set(cameraX, cameraY, cameraZ);
        
        // Look at avatar
        const lookTarget = new THREE.Vector3(avatarWorldPos.x, avatarWorldPos.y + 0.5, avatarWorldPos.z);
        this.camera.lookAt(lookTarget);
        
        // Update state
        this.state.target.copy(lookTarget);
        this.state.distance = 8;
        
        // eslint-disable-next-line no-console
        console.log('snapBehindAvatar: Avatar world pos', avatarWorldPos.x, avatarWorldPos.y, avatarWorldPos.z);
        // eslint-disable-next-line no-console
        console.log('snapBehindAvatar: Camera at', cameraX, cameraY, cameraZ);
    }

    // Update camera based on mode
    // Step 295: Camera roll/tilt on wild moments
    applyWildMomentEffect(intensity = 1.0) {
        // Apply camera roll/tilt for high-energy moments
        const rollAmount = (Math.random() - 0.5) * intensity * 0.1;
        const tiltAmount = (Math.random() - 0.5) * intensity * 0.05;

        // Store original rotation
        if (!this.originalRotation) {
            this.originalRotation = this.camera.rotation.clone();
        }

        // Apply roll and tilt
        this.camera.rotation.z += rollAmount;
        this.camera.rotation.x += tiltAmount;

        // Smoothly return to normal
        setTimeout(() => {
            if (this.originalRotation) {
                this.camera.rotation.z = this.originalRotation.z;
                this.camera.rotation.x = this.originalRotation.x;
            }
        }, 200);
    }

    update(deltaTime, avatar, bassEnergy = 0, elapsedTime = 0) {
        // Update shake
        if (this.shakeIntensity > 0) {
            this.shakeIntensity -= this.shakeDecay * deltaTime;
            if (this.shakeIntensity < 0) {
                this.shakeIntensity = 0;
            }
        }

        // Step 192: Audio-reactive camera (handled by updateAudioReactive if enabled)
        // Legacy bass shake fallback (if audio-reactive is disabled)
        if (!this.audioReactiveEnabled && bassEnergy > 0.7) {
            this.addShake(bassEnergy * 0.1);
        }

        // Update based on mode
        switch (this.mode) {
            case 'cinematic':
                this.updateCinematicMode(deltaTime, avatar);
                break;
            case 'lockon':
                this.updateLockOnMode(deltaTime, avatar);
                break;
            case 'freecam':
                this.updateFreecamMode(deltaTime);
                break;
            case 'follow':
            default:
                this.updateFollowMode(deltaTime, avatar, elapsedTime);
                break;
        }

        // Apply shake to final camera position
        if (this.shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeZ = (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
        }

        // Step 194: Add micro camera jitter for realism
        if (this.jitterEnabled) {
            const jitterX = (Math.random() - 0.5) * this.jitterAmount;
            const jitterY = (Math.random() - 0.5) * this.jitterAmount;
            this.camera.position.add(new THREE.Vector3(jitterX, jitterY, 0));
        }
    }

    updateFollowMode(deltaTime, avatar, elapsedTime = 0) {
        if (!avatar) return;

        // Get actual world position of avatar group
        let avatarWorldPos = new THREE.Vector3();
        if (avatar.group) {
            avatar.group.getWorldPosition(avatarWorldPos);
        } else if (avatar.position) {
            avatarWorldPos.copy(avatar.position);
        } else {
            return;
        }
        
        // Debug: log every 60 frames
        if (!this._frameCount) this._frameCount = 0;
        this._frameCount++;
        if (this._frameCount % 60 === 0) {
            // eslint-disable-next-line no-console
            console.log('Camera follow: avatar at', avatarWorldPos.x.toFixed(2), avatarWorldPos.y.toFixed(2), avatarWorldPos.z.toFixed(2));
        }
        
        // SIMPLE: Camera directly behind avatar, no complex angle calculations
        // Camera at avatar position + offset in world coordinates  
        const cameraOffset = new THREE.Vector3(0, 5, 12); // Higher and further back to see avatar clearly
        const targetCameraPos = avatarWorldPos.clone().add(cameraOffset);
        
        // For first 30 frames, snap directly to target (no lerp) to avoid initial jitter
        if (!this._startupFrames) this._startupFrames = 0;
        this._startupFrames++;
        
        if (this._startupFrames < 30) {
            // Snap directly
            this.camera.position.copy(targetCameraPos);
        } else {
            // Smoothly move camera to target position  
            this.camera.position.lerp(targetCameraPos, 0.15);
        }
        
        // Look at avatar center (slightly above ground for better framing)
        const lookTarget = avatarWorldPos.clone();
        lookTarget.y += 0.5;
        
        // Force the camera to look at the avatar
        this.camera.lookAt(lookTarget);
        
        // Update state for other systems
        this.state.target.copy(lookTarget);
    }

    updateCinematicMode(deltaTime, avatar) {
        // Slowly orbit around the scene
        this.cinematicOrbitAngle += this.cinematicOrbitSpeed * deltaTime;

        const center = avatar
            ? avatar.position.clone().add(new THREE.Vector3(0, 2, 0))
            : new THREE.Vector3(0, 2, 0);

        const x = center.x + this.cinematicOrbitRadius * Math.sin(this.cinematicOrbitAngle);
        const y = center.y + 3;
        const z = center.z + this.cinematicOrbitRadius * Math.cos(this.cinematicOrbitAngle);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(center);
    }

    updateLockOnMode(deltaTime, avatar) {
        if (!this.lockOnTarget) {
            this.mode = 'follow';
            return;
        }

        const targetPos = this.lockOnTarget.position || this.lockOnTarget;
        const lookAtPos = targetPos.clone().add(new THREE.Vector3(0, 1, 0));

        // Position camera at angle from target
        const offset = new THREE.Vector3(0, 3, 8);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.state.angleY);

        this.camera.position.copy(targetPos).add(offset);
        this.camera.lookAt(lookAtPos);
    }

    updateFreecamMode(deltaTime) {
        // Freecam position is controlled externally via mouse/keyboard
        // This just ensures the camera uses freecam position/rotation
        this.camera.position.copy(this.freecamPosition);
        this.camera.rotation.copy(this.freecamRotation);
    }

    // Handle mouse drag for camera rotation
    handleMouseDrag(deltaX, deltaY) {
        this.state.targetAngleY -= deltaX * this.config.sensitivity;
        this.state.targetAngleX -= deltaY * this.config.sensitivity;
        this.state.targetAngleX = Math.max(
            this.config.minAngleX,
            Math.min(this.config.maxAngleX, this.state.targetAngleX)
        );
        this.state.autoAlignTimer = 0;
    }

    // Handle zoom
    handleZoom(delta) {
        this.state.targetDistance += delta * this.config.zoomSpeed * 0.01;
        this.state.targetDistance = Math.max(
            this.config.minDistance,
            Math.min(this.config.maxDistance, this.state.targetDistance)
        );
        this.state.autoAlignTimer = 0;
    }
}
