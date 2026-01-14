import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT, STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

/**
 * EnvironmentEffects - Creates fog, haze, heat distortion, screen texture, and other environmental effects
 */
export class EnvironmentEffects {
    constructor(scene) {
        this.scene = scene;
        this.screenEffectIntensity = 1.0;
        this.screenAnimationSpeed = 1.0;
        this.effects = {
            fog: null,
            hazeVolume: null,
            fogEmitters: [],
            screen: null,
            screenMaterial: null,
            screenTexture: null,
            screenCanvas: null,
            screenContext: null,
            edgeStrip: null,
            backWallDisplay: null,
            backWallMaterial: null,
            backWallTexture: null,
            backWallCanvas: null,
            backWallContext: null,
            currentTrackSection: 'verse',
            sectionStartTime: 0,
            sectionDuration: 16,
        };
    }

    build() {
        this.createFog();
        this.createFogEmitters();
        this.createHazeVolume();
        this.createScreen();
        this.createEdgeStrip();
        this.createBackWallDisplay();

        return {
            fog: this.effects.fog,
            hazeVolume: this.effects.hazeVolume,
            fogEmitters: this.effects.fogEmitters,
            screen: this.effects.screen,
            screenMaterial: this.effects.screenMaterial,
            screenTexture: this.effects.screenTexture,
            screenCanvas: this.effects.screenCanvas,
            screenContext: this.effects.screenContext,
            edgeStrip: this.effects.edgeStrip,
            backWallDisplay: this.effects.backWallDisplay,
            backWallMaterial: this.effects.backWallMaterial,
            backWallTexture: this.effects.backWallTexture,
            backWallCanvas: this.effects.backWallCanvas,
            backWallContext: this.effects.backWallContext,
            getCurrentTrackSection: () => this.effects.currentTrackSection,
            getSectionStartTime: () => this.effects.sectionStartTime,
            setSectionStartTime: (time) => {
                this.effects.sectionStartTime = time;
            },
            setSectionDuration: (duration) => {
                this.effects.sectionDuration = duration;
            },
        };
    }

    createFog() {
        // Add mild scene fog to give depth
        this.effects.fog = new THREE.Fog(0x000000, 10, 30);
        this.scene.fog = this.effects.fog;
    }

    createFogEmitters() {
        const fogEmitterMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
        });

        const fogEmitter1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), fogEmitterMaterial);
        fogEmitter1.position.set(-3, 1, -STAGE_SIZE / 2 - 1);
        this.scene.add(fogEmitter1);
        this.effects.fogEmitters.push(fogEmitter1);

        const fogEmitter2 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), fogEmitterMaterial);
        fogEmitter2.position.set(3, 1, -STAGE_SIZE / 2 - 1);
        this.scene.add(fogEmitter2);
        this.effects.fogEmitters.push(fogEmitter2);
    }

    createHazeVolume() {
        const hazeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide,
        });

        const hazeVolume = new THREE.Mesh(
            new THREE.BoxGeometry(ROOM_SIZE, 2, ROOM_SIZE),
            hazeMaterial
        );
        hazeVolume.position.set(0, WALL_HEIGHT - 1, 0);
        this.scene.add(hazeVolume);
        this.effects.hazeVolume = hazeVolume;
    }

    createScreen() {
        const boothWidth = 2;
        const boothHeight = 3;
        const screenWidth = boothWidth * 1.2;
        const screenHeight = boothHeight * 0.8;

        // Step 67: Add a basic scrolling UV shader or animated material on the screen
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000, // Reduced from 0.5 to 0.25 for less intense brightness
        });
        this.effects.screenMaterial = screenMaterial;

        // Create animated texture for screen
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 256;
        screenCanvas.height = 256;
        const screenContext = screenCanvas.getContext('2d');
        this.effects.screenCanvas = screenCanvas;
        this.effects.screenContext = screenContext;

        const screenTexture = new THREE.CanvasTexture(screenCanvas);
        screenTexture.wrapS = THREE.RepeatWrapping;
        screenTexture.wrapT = THREE.RepeatWrapping;
        // Don't set map or emissiveMap - MaterialSimplifier will convert to MeshBasicMaterial anyway
        // screenMaterial.map = screenTexture;
        // screenMaterial.emissiveMap = screenTexture;
        this.effects.screenTexture = screenTexture;

        const djScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(screenWidth, screenHeight),
            screenMaterial
        );
        // Adjusted screen position to match lowered DJ booth
        djScreen.position.set(
            0,
            boothHeight * 0.7 + STAGE_HEIGHT - 0.5,
            -STAGE_SIZE / 2 - 1.5 - 0.1
        );
        this.scene.add(djScreen);
        this.effects.screen = djScreen;
    }

    createEdgeStrip() {
        const edgeStripMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Reduced from 1.0 to 0.4 for less intense brightness
        });

        const edgeStrip = new THREE.Mesh(
            new THREE.BoxGeometry(STAGE_SIZE + 0.2, 0.05, 0.2),
            edgeStripMaterial
        );
        edgeStrip.position.set(0, STAGE_HEIGHT + 0.025, -STAGE_SIZE / 2 - 0.1);
        this.scene.add(edgeStrip);
        this.effects.edgeStrip = edgeStrip;
    }

    createBackWallDisplay() {
        // Create a large visual display on the back wall
        const displayWidth = ROOM_SIZE * 0.7; // 70% of room width
        const displayHeight = WALL_HEIGHT * 0.6; // 60% of wall height

        // Create material for back wall display
        const displayMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000, // Reduced from 0.6 to 0.3 for less intense brightness
            side: THREE.DoubleSide,
        });
        this.effects.backWallMaterial = displayMaterial;

        // Create animated texture for back wall display
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = 512; // Larger canvas for better quality
        displayCanvas.height = 512;
        const displayContext = displayCanvas.getContext('2d');
        this.effects.backWallCanvas = displayCanvas;
        this.effects.backWallContext = displayContext;

        const displayTexture = new THREE.CanvasTexture(displayCanvas);
        displayTexture.wrapS = THREE.RepeatWrapping;
        displayTexture.wrapT = THREE.RepeatWrapping;
        // Don't set map or emissiveMap - MaterialSimplifier will convert to MeshBasicMaterial anyway
        // displayMaterial.map = displayTexture;
        // displayMaterial.emissiveMap = displayTexture;
        this.effects.backWallTexture = displayTexture;

        // Create back wall display mesh
        const backWallDisplay = new THREE.Mesh(
            new THREE.PlaneGeometry(displayWidth, displayHeight),
            displayMaterial
        );
        // Position on the back wall (back wall is at -ROOM_SIZE/2, place display slightly in front)
        backWallDisplay.position.set(0, WALL_HEIGHT * 0.5, -ROOM_SIZE / 2 + 0.02);
        this.scene.add(backWallDisplay);
        this.effects.backWallDisplay = backWallDisplay;

        // Add frame around the display
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
        });

        // Top frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(displayWidth + 0.2, 0.1, 0.05),
            frameMaterial
        );
        topFrame.position.set(0, displayHeight / 2 + 0.05, -ROOM_SIZE / 2 - 0.02);
        this.scene.add(topFrame);

        // Bottom frame
        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(displayWidth + 0.2, 0.1, 0.05),
            frameMaterial
        );
        bottomFrame.position.set(0, -displayHeight / 2 - 0.05, -ROOM_SIZE / 2 - 0.02);
        this.scene.add(bottomFrame);

        // Left frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, displayHeight, 0.05),
            frameMaterial
        );
        leftFrame.position.set(-displayWidth / 2 - 0.05, 0, -ROOM_SIZE / 2 - 0.02);
        this.scene.add(leftFrame);

        // Right frame
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, displayHeight, 0.05),
            frameMaterial
        );
        rightFrame.position.set(displayWidth / 2 + 0.05, 0, -ROOM_SIZE / 2 - 0.02);
        this.scene.add(rightFrame);
    }

    // Step 77: Apply glitch effect to screen
    applyGlitchToScreen(time, intensity = 1.0) {
        if (this.effects.screenMaterial) {
            // Apply intensity multiplier to glitch effect
            const baseGlitchIntensity = (Math.sin(time * 10) + 1) * 0.1;
            const glitchIntensity = baseGlitchIntensity * intensity;
            // Only set emissiveIntensity if material supports it (MeshStandardMaterial)
            if (this.effects.screenMaterial.emissiveIntensity !== undefined) {
                this.effects.screenMaterial.emissiveIntensity = 0.5 + glitchIntensity;
            }
        }
    }

    /**
     * Set screen effect intensity
     * @param {number} intensity - Screen effect intensity (0-2)
     */
    setScreenEffectIntensity(intensity) {
        this.screenEffectIntensity = Math.max(0, Math.min(2, intensity));
    }

    /**
     * Get screen effect intensity
     * @returns {number} Screen effect intensity
     */
    getScreenEffectIntensity() {
        return this.screenEffectIntensity || 1.0;
    }

    // Step 67: Update screen texture animation
    updateScreenTexture(time, audioSystem = null) {
        if (!this.effects.screenContext || !this.effects.screenTexture) {
            return;
        }

        // Apply animation speed multiplier
        const adjustedTime = time * this.screenAnimationSpeed;

        const screenContext = this.effects.screenContext;
        const canvas = this.effects.screenCanvas;
        screenContext.fillStyle = '#000000';
        screenContext.fillRect(0, 0, canvas.width, canvas.height);

        // Get audio data if available
        let audioData = null;
        let frequencyBands = null;
        if (audioSystem) {
            if (audioSystem.getAudioData) {
                audioData = audioSystem.getAudioData();
            }
            if (audioSystem.getFrequencyBands) {
                frequencyBands = audioSystem.getFrequencyBands();
            }
        }

        // Apply screen effect intensity to visualization
        const intensity = this.getScreenEffectIntensity();

        // If we have audio data, show waveform visualization
        if (audioData && audioData.length > 0) {
            // Draw frequency bars with intensity multiplier
            const barCount = 32;
            const barWidth = canvas.width / barCount;
            const maxBarHeight = canvas.height * 0.8 * intensity;
            const samplesPerBar = Math.floor(audioData.length / barCount);

            for (let i = 0; i < barCount; i++) {
                const startIdx = i * samplesPerBar;
                const endIdx = Math.min(startIdx + samplesPerBar, audioData.length);

                let sum = 0;
                for (let j = startIdx; j < endIdx; j++) {
                    sum += audioData[j];
                }
                const avgAmplitude = sum / (endIdx - startIdx) / 255;
                const barHeight = avgAmplitude * maxBarHeight;

                // Color gradient from red (low) to blue (high)
                const hue = (i / barCount) * 0.7;
                const color = this.hslToRgb(hue, 1.0, 0.5);

                screenContext.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                screenContext.fillRect(
                    i * barWidth,
                    canvas.height - barHeight,
                    barWidth - 2,
                    barHeight
                );
            }

            // Draw waveform line
            screenContext.strokeStyle = '#00ffff';
            screenContext.lineWidth = 2;
            screenContext.beginPath();
            const points = Math.min(audioData.length, canvas.width);
            const step = audioData.length / points;

            for (let i = 0; i < points; i++) {
                const idx = Math.floor(i * step);
                const amplitude = audioData[idx] / 255;
                const x = (i / points) * canvas.width;
                const y = canvas.height / 2 - (amplitude - 0.5) * canvas.height * 0.8;

                if (i === 0) {
                    screenContext.moveTo(x, y);
                } else {
                    screenContext.lineTo(x, y);
                }
            }
            screenContext.stroke();
        } else {
            // Fallback: Original scrolling pattern when no audio
            const sectionTime = time - this.effects.sectionStartTime;
            if (sectionTime > this.effects.sectionDuration) {
                const sections = ['verse', 'chorus', 'drop', 'breakdown'];
                const currentIndex = sections.indexOf(this.effects.currentTrackSection);
                this.effects.currentTrackSection = sections[(currentIndex + 1) % sections.length];
                this.effects.sectionStartTime = time;
            }

            let baseColor = '#00ff00';
            let patternColor = '#00ffff';
            let scrollSpeed = 50;

            switch (this.effects.currentTrackSection) {
                case 'chorus':
                    baseColor = '#ffff00';
                    patternColor = '#ff00ff';
                    scrollSpeed = 80;
                    break;
                case 'drop':
                    baseColor = '#ff0000';
                    patternColor = '#ffffff';
                    scrollSpeed = 120;
                    break;
                case 'breakdown':
                    baseColor = '#0000ff';
                    patternColor = '#00ffff';
                    scrollSpeed = 30;
                    break;
            }

            const scrollOffset = (time * scrollSpeed) % canvas.height;
            screenContext.fillStyle = baseColor;
            for (let i = -1; i < 3; i++) {
                const y = (scrollOffset + i * 64) % canvas.height;
                screenContext.fillRect(0, y, canvas.width, 32);
            }

            screenContext.fillStyle = patternColor;
            const patternX = (time * 30) % canvas.width;
            screenContext.fillRect(patternX, 0, 64, canvas.height);
        }

        // Add frequency band indicators
        if (frequencyBands) {
            const bass = frequencyBands.bass || 0;
            const mid = frequencyBands.mid || 0;
            const treble = frequencyBands.treble || 0;

            screenContext.fillStyle = '#ff0000';
            screenContext.fillRect(
                canvas.width - 10,
                canvas.height - bass * canvas.height,
                5,
                bass * canvas.height
            );
            screenContext.fillStyle = '#00ff00';
            screenContext.fillRect(
                canvas.width - 5,
                canvas.height - mid * canvas.height,
                5,
                mid * canvas.height
            );
        }

        this.effects.screenTexture.needsUpdate = true;

        // Update back wall display texture
        this.updateBackWallDisplay(time);
    }

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-1)
     * @param {number} s - Saturation (0-1)
     * @param {number} l - Lightness (0-1)
     * @returns {Object} RGB object with r, g, b values (0-255)
     */
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) {
                    t += 1;
                }
                if (t > 1) {
                    t -= 1;
                }
                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                }
                if (t < 1 / 2) {
                    return q;
                }
                if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    updateBackWallDisplay(time) {
        if (!this.effects.backWallContext || !this.effects.backWallTexture) {
            return;
        }

        const ctx = this.effects.backWallContext;
        const canvas = this.effects.backWallCanvas;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get track section for color coordination
        const sectionTime = time - this.effects.sectionStartTime;
        let hue = 0.5; // Default cyan
        let intensity = 0.6;

        switch (this.effects.currentTrackSection) {
            case 'chorus':
                hue = 0.16; // Yellow
                intensity = 0.8;
                break;
            case 'drop':
                hue = 0.0; // Red
                intensity = 1.0;
                break;
            case 'breakdown':
                hue = 0.66; // Blue
                intensity = 0.5;
                break;
        }

        // Create animated visual pattern
        const patternScale = 2.0;
        const scrollSpeed = 30;
        const scrollOffset = (time * scrollSpeed) % canvas.height;

        // Draw vertical bars that scroll
        const barWidth = canvas.width / 16;
        for (let i = 0; i < 16; i++) {
            const barHue = (hue + i * 0.05) % 1.0;
            const brightness = 0.3 + Math.sin(time * 2 + i) * 0.3;
            ctx.fillStyle = `hsl(${barHue * 360}, 100%, ${brightness * 100}%)`;

            const x = i * barWidth;
            const y = (scrollOffset + i * 10) % canvas.height;
            ctx.fillRect(x, 0, barWidth - 2, canvas.height);
        }

        // Add waveform-style pattern
        ctx.strokeStyle = `hsl(${hue * 360}, 100%, 60%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
            const y =
                canvas.height / 2 +
                Math.sin((x / canvas.width) * Math.PI * 4 + time * 3) * (canvas.height * 0.3);
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Update texture
        this.effects.backWallTexture.needsUpdate = true;

        // Update material emissive intensity (reduced maximum)
        // Only set emissiveIntensity if material supports it (MeshStandardMaterial)
        if (
            this.effects.backWallMaterial &&
            this.effects.backWallMaterial.emissiveIntensity !== undefined
        ) {
            this.effects.backWallMaterial.emissiveIntensity = intensity * 0.5; // Reduced by 50% for less intense brightness
        }
    }
}
