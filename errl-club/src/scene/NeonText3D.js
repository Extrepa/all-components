/**
 * NeonText3D - 3D neon text sign for "ERRL CLUB"
 *
 * Creates a 3D neon sign using Three.js TextGeometry with animated glow effects
 */
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export class NeonText3D {
    /**
     * Create a new NeonText3D sign
     * @param {THREE.Scene} scene - The Three.js scene to add the text to
     * @param {Object} config - Configuration options
     * @param {string} config.text - Text to display (default: "ERRL CLUB")
     * @param {THREE.Vector3} config.position - Position in scene (default: above stage)
     * @param {number} config.scale - Scale of the text (default: 1.0)
     * @param {string} config.fontUrl - URL to font JSON file (optional, uses default if not provided)
     * @param {number} config.depth - Extrusion depth (default: 0.5)
     * @param {number} config.size - Font size (default: 1.0)
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.text = config.text || 'ERRL CLUB';
        this.position = config.position || new THREE.Vector3(0, 8, -6);
        this.scale = config.scale || 1.0;
        this.fontUrl = config.fontUrl;
        this.depth = config.depth || 0.5;
        this.size = config.size || 1.0;

        // Animation state
        this.time = 0;
        this.group = new THREE.Group();
        this.meshes = [];
        this.materials = [];

        // Neon colors (cyan, magenta, purple)
        this.neonColors = [
            new THREE.Color(0x00ffff), // Cyan
            new THREE.Color(0xff00ff), // Magenta
            new THREE.Color(0x9900ff), // Purple
        ];
        this.currentColorIndex = 0;

        // Initialize
        this.init();
    }

    /**
     * Initialize the neon text
     */
    async init() {
        try {
            // Load font
            const font = await this.loadFont();

            // Create text geometry
            const geometry = new TextGeometry(this.text, {
                font: font,
                size: this.size,
                height: this.depth,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.05,
                bevelSegments: 5,
            });

            // Center the geometry
            geometry.computeBoundingBox();
            const centerOffset = new THREE.Vector3();
            geometry.boundingBox.getCenter(centerOffset);
            geometry.translate(-centerOffset.x, -centerOffset.y, -centerOffset.z);

            // Create front face material (bright neon)
            const frontMaterial = new THREE.MeshBasicMaterial({
                color: this.neonColors[this.currentColorIndex],
                transparent: true,
                opacity: 0.95,
            });

            // Create back face material (slightly dimmer)
            const backMaterial = new THREE.MeshBasicMaterial({
                color: this.neonColors[this.currentColorIndex],
                transparent: true,
                opacity: 0.8,
            });

            // Create main text mesh (front and back faces)
            const textMesh = new THREE.Mesh(geometry, [
                frontMaterial, // Front face
                backMaterial, // Back face
            ]);
            this.meshes.push(textMesh);
            this.materials.push(frontMaterial, backMaterial);

            // Create glow halo (larger geometry with lower opacity)
            const glowGeometry = geometry.clone();
            glowGeometry.scale(1.1, 1.1, 1.0); // Slightly larger

            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.neonColors[this.currentColorIndex],
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
            });

            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.z = -0.1; // Slightly behind
            this.meshes.push(glowMesh);
            this.materials.push(glowMaterial);

            // Add meshes to group
            this.group.add(textMesh);
            this.group.add(glowMesh);

            // Set position and scale
            this.group.position.copy(this.position);
            this.group.scale.set(this.scale, this.scale, this.scale);

            // Slight rotation for 3D perspective
            this.group.rotation.x = -0.1;

            // Add to scene
            this.scene.add(this.group);
        } catch (error) {
            console.error('NeonText3D: Failed to create text:', error);
            // Create a fallback simple text using basic geometry
            this.createFallbackText();
        }
    }

    /**
     * Load font from URL or use default
     * @returns {Promise<THREE.Font>} Loaded font
     */
    async loadFont() {
        const loader = new FontLoader();

        // If font URL is provided, try to load it
        if (this.fontUrl) {
            try {
                const response = await fetch(this.fontUrl);
                const fontData = await response.json();
                return loader.parse(fontData);
            } catch (error) {
                console.warn('NeonText3D: Failed to load font from URL, using default:', error);
            }
        }

        // Try to load a default font from CDN (helvetiker from three.js examples)
        // This is a common font used in Three.js examples
        try {
            const defaultFontUrl =
                'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
            const response = await fetch(defaultFontUrl);
            const fontData = await response.json();
            return loader.parse(fontData);
        } catch (error) {
            console.warn('NeonText3D: Failed to load default font, creating fallback:', error);
            throw error;
        }
    }

    /**
     * Create fallback text using simple geometry if font loading fails
     */
    createFallbackText() {
        // Create simple geometric representation
        const boxGeometry = new THREE.BoxGeometry(8, 2, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: this.neonColors[this.currentColorIndex],
            transparent: true,
            opacity: 0.95,
        });

        const mesh = new THREE.Mesh(boxGeometry, material);
        this.meshes.push(mesh);
        this.materials.push(material);

        this.group.add(mesh);
        this.group.position.copy(this.position);
        this.group.scale.set(this.scale, this.scale, this.scale);

        this.scene.add(this.group);
    }

    /**
     * Update animation
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Optional audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        this.time = elapsedTime;

        // Base pulse from time (breathing effect)
        const pulseSpeed = 2.0;
        const pulseAmount = 0.3; // 30% variation
        const baseIntensity = 2.0;
        const timePulse = baseIntensity + Math.sin(this.time * pulseSpeed) * pulseAmount;

        // Audio-reactive pulse enhancement
        let audioPulse = 0;
        if (audioSystem) {
            const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
            const overallEnergy = audioSystem.getOverallEnergy ? audioSystem.getOverallEnergy() : 0;

            // Combine bass and overall energy for more dynamic response
            const audioIntensity = bassEnergy * 0.7 + overallEnergy * 0.3;
            audioPulse = audioIntensity * 1.5; // Scale audio contribution

            // Beat detection for stronger pulses
            if (audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
                const beatDetector = audioSystem.getBeatDetector();
                // Check if beat was recently detected (within last 0.2 seconds)
                const lastBeatTime = beatDetector.getLastBeatTime
                    ? beatDetector.getLastBeatTime()
                    : 0;
                if (elapsedTime - lastBeatTime < 0.2) {
                    audioPulse += 0.8; // Strong pulse on beat
                }
            }
        }

        const pulseIntensity = timePulse + audioPulse;

        // Color shifting (slowly cycle through colors)
        const colorShiftSpeed = 0.5;
        const colorPhase = Math.sin(this.time * colorShiftSpeed) * 0.5 + 0.5; // 0 to 1
        const nextColorIndex = Math.floor(
            (this.time * colorShiftSpeed * 0.1) % this.neonColors.length
        );

        if (nextColorIndex !== this.currentColorIndex) {
            this.currentColorIndex = nextColorIndex;
            // Update all materials with new color
            this.materials.forEach((material) => {
                if (material.emissive) {
                    material.emissive.copy(this.neonColors[this.currentColorIndex]);
                }
                if (material.color) {
                    material.color.copy(this.neonColors[this.currentColorIndex]);
                }
            });
        }

        // Apply pulsing to emissive materials
        this.materials.forEach((material, index) => {
            if (material.emissiveIntensity !== undefined) {
                // Front face gets full pulse, glow gets less
                if (index === 0) {
                    material.emissiveIntensity = pulseIntensity;
                } else if (index === 1) {
                    material.emissiveIntensity = pulseIntensity * 0.75; // Back face slightly dimmer
                } else {
                    material.emissiveIntensity = pulseIntensity * 0.5; // Glow halo
                }
            }
        });

        // Floating animation (subtle bobbing)
        const floatSpeed = 1.0;
        const floatAmount = 0.2;
        const floatOffset = Math.sin(this.time * floatSpeed) * floatAmount;
        this.group.position.y = this.position.y + floatOffset;

        // Subtle rotation animation
        const rotationSpeed = 0.1;
        this.group.rotation.y = Math.sin(this.time * rotationSpeed) * 0.05;

        // Audio-reactive scale pulsing on beats
        if (audioSystem && audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
            const beatDetector = audioSystem.getBeatDetector();
            const lastBeatTime = beatDetector.getLastBeatTime ? beatDetector.getLastBeatTime() : 0;
            const timeSinceBeat = elapsedTime - lastBeatTime;

            if (timeSinceBeat < 0.15) {
                // Scale up on beat (quick pulse)
                const beatScale = 1.0 + (1.0 - timeSinceBeat / 0.15) * 0.1; // 10% scale increase
                this.group.scale.set(
                    this.scale * beatScale,
                    this.scale * beatScale,
                    this.scale * beatScale
                );
            } else {
                // Return to normal scale
                this.group.scale.set(this.scale, this.scale, this.scale);
            }
        } else {
            // Normal scale when no audio
            this.group.scale.set(this.scale, this.scale, this.scale);
        }

        // Frequency-based color shifting (more dynamic with audio)
        if (audioSystem && audioSystem.getFrequencyBands) {
            const frequencyBands = audioSystem.getFrequencyBands();
            if (frequencyBands) {
                // Use bass for color intensity, mid for hue shift
                const bassIntensity = frequencyBands.bass || 0;
                const midIntensity = frequencyBands.mid || 0;

                // Shift color based on mid frequencies (slower than beat-based changes)
                if (midIntensity > 0.5) {
                    const colorShift = Math.floor(
                        (this.time * 0.3 + midIntensity * 2) % this.neonColors.length
                    );
                    if (colorShift !== this.currentColorIndex) {
                        this.currentColorIndex = colorShift;
                        this.materials.forEach((material) => {
                            if (material.emissive) {
                                material.emissive.copy(this.neonColors[this.currentColorIndex]);
                            }
                            if (material.color) {
                                material.color.copy(this.neonColors[this.currentColorIndex]);
                            }
                        });
                    }
                }
            }
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.meshes.forEach((mesh) => {
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
        });

        this.materials.forEach((material) => {
            if (material.map) {
                material.map.dispose();
            }
            material.dispose();
        });

        if (this.group.parent) {
            this.group.parent.remove(this.group);
        }
    }
}
