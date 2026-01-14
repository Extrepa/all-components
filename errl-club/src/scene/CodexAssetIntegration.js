/**
 * CodexAssetIntegration - Handles loading and integration of Codex-recommended assets
 *
 * Implements:
 * - Asset loading with automatic scaling
 * - Material enhancement (emissive, neon tints, additive blending)
 * - Audio-reactive features
 * - Interaction system integration
 * - Performance optimizations
 */

import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader.js';
import { STAGE_SIZE } from '../config/constants.js';
import { MaterialPresets, applyPresetToAsset, getPreset } from '../config/MaterialPresets.js';

export class CodexAssetIntegration {
    constructor(scene, systems = {}) {
        this.scene = scene;
        this.systems = systems;
        this.assetLoader = new AssetLoader();
        this.loadedAssets = new Map(); // Map<assetName, THREE.Group>
        this.lodSystem = systems.lodSystem || null; // Optional LOD system
    }

    /**
     * Automatic scaling helper - scales model to desired dimensions
     * @param {THREE.Group} model - The loaded model
     * @param {Object} options - Scaling options
     * @param {number} options.desiredHeight - Desired height in meters
     * @param {number} options.desiredWidth - Desired width in meters (optional)
     * @param {number} options.maxScale - Maximum scale factor (optional)
     * @returns {THREE.Group} The scaled model
     */
    autoScaleModel(model, options = {}) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        let scale = 1;
        if (options.desiredHeight) {
            scale = options.desiredHeight / size.y;
        } else if (options.desiredWidth) {
            scale = options.desiredWidth / size.x;
        }

        if (options.maxScale && scale > options.maxScale) {
            scale = options.maxScale;
        }

        model.scale.setScalar(scale);
        return model;
    }

    /**
     * Enhance materials: Apply visual effects to MeshBasicMaterial (DISABLED - no longer converts to MeshStandardMaterial)
     * @param {THREE.Object3D} object - Object to traverse and enhance
     * @param {Object} options - Enhancement options
     * @deprecated This method no longer converts materials to prevent texture unit limit errors.
     * Use applyPresetToSimplifiedAsset() instead for MeshBasicMaterial-compatible enhancements.
     */
    enhanceMaterials(object, options = {}) {
        // DISABLED: This method previously converted MeshBasicMaterial to MeshStandardMaterial,
        // which caused WebGL texture unit limit errors. We now keep all materials as MeshBasicMaterial.
        // If you need visual effects, use applyPresetToSimplifiedAsset() which works with MeshBasicMaterial.

        // Only apply basic properties that work with MeshBasicMaterial
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => {
                    if (!material || !(material instanceof THREE.MeshBasicMaterial)) {
                        return;
                    }

                    // Apply color tint if specified (MeshBasicMaterial supports color)
                    if (options.applyNeonTint && options.neonColor) {
                        const existingColor = material.color.clone();
                        const neonColor = options.neonColor.clone();
                        // Mix colors (70% neon, 30% existing)
                        material.color.lerpColors(existingColor, neonColor, 0.7);
                    }

                    // Apply transparency if needed
                    if (options.additiveBlending) {
                        material.transparent = true;
                        material.opacity = 0.8;
                    }

                    // Enable shadows (works with MeshBasicMaterial)
                    child.castShadow = true;
                    child.receiveShadow = true;
                });
            }
        });
    }

    /**
     * Tag asset with metadata for traceability
     * @param {THREE.Object3D} object - Object to tag
     * @param {string} assetSource - Source name/URL
     * @param {string} license - License information
     */
    tagAsset(object, assetSource, license) {
        object.traverse((child) => {
            if (child.isMesh) {
                if (!child.userData) {
                    child.userData = {};
                }
                child.userData.assetSource = assetSource;
                child.userData.license = license;
            }
        });
    }

    /**
     * Load and integrate repo asset: The Shroom Bar Nightclub
     * @returns {Promise<THREE.Group>} Loaded model
     */
    async loadShroomBar() {
        try {
            const model = await this.assetLoader.loadModel(
                '/models/nightclub/the_shroom_bar__nightclub.glb'
            );

            // Auto-scale to fit stage area (approximately)
            this.autoScaleModel(model, { desiredHeight: 5, maxScale: 2.0 });

            // Position as stage replacement
            model.position.set(0, 0, -STAGE_SIZE / 2);

            // CRITICAL: Simplify materials FIRST before any enhancement
            // This prevents MeshStandardMaterials from being created with texture maps
            this.simplifyAssetMaterials(model);

            // Enhance materials with cyan preset (but materials are already simplified, so this won't add textures)
            const cyanPreset = getPreset('cyan');
            if (cyanPreset) {
                // Apply preset but don't convert to MeshStandardMaterial - keep as MeshBasicMaterial
                this.applyPresetToSimplifiedAsset(model, cyanPreset);
            } else {
                // Fallback: just set emissive color on MeshBasicMaterial (won't work, but won't break either)
                // MeshBasicMaterial doesn't support emissive, so we skip enhancement
            }

            // Codex Enhancement: Precompute bounding sphere for frustum culling
            const box = new THREE.Box3().setFromObject(model);
            model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
            model.userData.proximityThreshold = 15; // Visibility distance

            // Tag asset
            this.tagAsset(model, 'The Shroom Bar Nightclub', 'Check repo documentation');

            this.scene.add(model);
            this.loadedAssets.set('shroomBar', model);

            // Register with LOD system if available
            if (this.lodSystem) {
                this.lodSystem.registerAsset('shroomBar', model);
            }

            console.log('✅ Loaded The Shroom Bar Nightclub');
            return model;
        } catch (error) {
            console.error('❌ Failed to load The Shroom Bar:', error);
            return null;
        }
    }

    /**
     * Load and integrate repo asset: Futuristic Geodesic Space Station
     * @returns {Promise<THREE.Group>} Loaded model
     */
    async loadGeodesicStation() {
        try {
            const model = await this.assetLoader.loadModel(
                '/models/rooms/futuristic_geodesic_space_station.glb'
            );

            // Auto-scale for floating mezzanine
            this.autoScaleModel(model, { desiredHeight: 4, maxScale: 1.5 });

            // Position as floating mezzanine above stage
            model.position.set(0, 6, -STAGE_SIZE / 2);

            // CRITICAL: Simplify materials FIRST before any enhancement
            this.simplifyAssetMaterials(model);

            // Apply preset to simplified asset (MeshBasicMaterial)
            const magentaPreset = getPreset('magenta');
            if (magentaPreset) {
                this.applyPresetToSimplifiedAsset(model, magentaPreset);
            }

            // Codex Enhancement: Precompute bounding sphere for frustum culling
            const box = new THREE.Box3().setFromObject(model);
            model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
            model.userData.proximityThreshold = 20; // Visibility distance

            // Tag asset
            this.tagAsset(model, 'Futuristic Geodesic Space Station', 'Check repo documentation');

            this.scene.add(model);
            this.loadedAssets.set('geodesicStation', model);

            // Register with LOD system if available
            if (this.lodSystem) {
                this.lodSystem.registerAsset('geodesicStation', model);
            }

            console.log('✅ Loaded Futuristic Geodesic Space Station');
            return model;
        } catch (error) {
            console.error('❌ Failed to load Geodesic Station:', error);
            return null;
        }
    }

    /**
     * Load and integrate Khronos BoomBox
     * @returns {Promise<THREE.Group>} Loaded model
     */
    async loadBoomBox() {
        try {
            const model = await this.assetLoader.loadModel('/models/external/khronos_boombox.glb');

            // Scale appropriately for stage prop
            this.autoScaleModel(model, { desiredHeight: 1.5, maxScale: 1.0 });

            // Position on stage
            model.position.set(-2, 0.75, -STAGE_SIZE / 2 - 1);

            // CRITICAL: Simplify materials FIRST before any enhancement
            this.simplifyAssetMaterials(model);

            // Apply preset to simplified asset (MeshBasicMaterial)
            const greenPreset = getPreset('green');
            if (greenPreset) {
                this.applyPresetToSimplifiedAsset(model, greenPreset);
            }

            // Codex Enhancement: Precompute bounding sphere
            const box = new THREE.Box3().setFromObject(model);
            model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
            model.userData.proximityThreshold = 8; // Smaller threshold for props

            // Tag asset
            this.tagAsset(model, 'Khronos BoomBox', 'CC BY 4.0 - Khronos Group');

            this.scene.add(model);
            this.loadedAssets.set('boombox', model);

            // Register with LOD system if available
            if (this.lodSystem) {
                this.lodSystem.registerAsset('boombox', model);
            }

            console.log('✅ Loaded Khronos BoomBox');
            return model;
        } catch (error) {
            console.error('❌ Failed to load BoomBox:', error);
            return null;
        }
    }

    /**
     * Load and integrate Khronos DamagedHelmet as holographic centerpiece
     * @returns {Promise<THREE.Group>} Loaded model
     */
    async loadDamagedHelmet() {
        try {
            const model = await this.assetLoader.loadModel(
                '/models/external/khronos_damaged_helmet.glb'
            );

            // Scale for centerpiece
            this.autoScaleModel(model, { desiredHeight: 2, maxScale: 1.0 });

            // Position as portal centerpiece
            model.position.set(0, 1, 5);

            // CRITICAL: Simplify materials FIRST before any enhancement
            this.simplifyAssetMaterials(model);

            // Apply preset to simplified asset (MeshBasicMaterial)
            const magentaPreset = getPreset('magenta');
            if (magentaPreset) {
                // Increase intensity for centerpiece
                const centerpiecePreset = { ...magentaPreset, emissiveIntensity: 0.7 };
                this.applyPresetToSimplifiedAsset(model, centerpiecePreset);
            }

            // Codex Enhancement: Precompute bounding sphere
            const box = new THREE.Box3().setFromObject(model);
            model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
            model.userData.proximityThreshold = 10; // Medium threshold for centerpiece

            // Tag asset
            this.tagAsset(model, 'Khronos DamagedHelmet', 'CC BY 4.0 - Khronos Group');

            this.scene.add(model);
            this.loadedAssets.set('damagedHelmet', model);

            // Register with LOD system if available
            if (this.lodSystem) {
                this.lodSystem.registerAsset('damagedHelmet', model);
            }

            console.log('✅ Loaded Khronos DamagedHelmet');
            return model;
        } catch (error) {
            console.error('❌ Failed to load DamagedHelmet:', error);
            return null;
        }
    }

    /**
     * Wire audio-reactive features to loaded assets
     * @param {Object} audioSystem - Audio system with frequency bands (FrequencyBandExtractor or similar)
     */
    wireAudioReactive(audioSystem) {
        // Audio-reactive properties are set via userData and updated via updateAudioReactive()
        // This method just marks assets as ready for audio-reactive updates
        if (!audioSystem) {
            return;
        }

        // Wire BoomBox to bass frequencies
        const boombox = this.loadedAssets.get('boombox');
        if (boombox) {
            boombox.userData.audioReactive = {
                frequencyBand: 'bass',
                targetProperty: 'emissiveIntensity',
                minValue: 0.3,
                maxValue: 1.5,
            };
        }

        // Wire Geodesic Station to mid frequencies
        const geodesic = this.loadedAssets.get('geodesicStation');
        if (geodesic) {
            geodesic.userData.audioReactive = {
                frequencyBand: 'mid',
                targetProperty: 'emissiveIntensity',
                minValue: 0.2,
                maxValue: 1.0,
            };
        }

        // Wire DamagedHelmet to treble frequencies
        const helmet = this.loadedAssets.get('damagedHelmet');
        if (helmet) {
            helmet.userData.audioReactive = {
                frequencyBand: 'treble',
                targetProperty: 'emissiveIntensity',
                minValue: 0.4,
                maxValue: 1.2,
            };
        }
    }

    /**
     * Update audio-reactive properties based on frequency data
     * @param {Object} frequencyData - Frequency band data from audio system
     * @param {Object} particleSystem - Particle system for spark trails (optional)
     */
    updateAudioReactive(frequencyData, particleSystem = null) {
        if (!frequencyData) {
            return;
        }

        this.loadedAssets.forEach((asset, name) => {
            const audioReactive = asset.userData.audioReactive;
            if (!audioReactive) {
                return;
            }

            const bandValue = frequencyData[audioReactive.frequencyBand] || 0;
            const intensity =
                audioReactive.minValue +
                bandValue * (audioReactive.maxValue - audioReactive.minValue);

            asset.traverse((child) => {
                if (
                    child.isMesh &&
                    child.material &&
                    child.material.emissiveIntensity !== undefined
                ) {
                    child.material.emissiveIntensity = intensity;
                }
            });

            // Codex Enhancement: Spark trails from assets on bass hits
            if (particleSystem && audioReactive.frequencyBand === 'bass' && bandValue > 0.7) {
                this.spawnSparkTrails(asset, particleSystem, bandValue);
            }
        });
    }

    /**
     * Spawn spark trails from asset edges on bass hits
     * @param {THREE.Object3D} asset - Asset to spawn particles from
     * @param {Object} particleSystem - Particle system instance
     * @param {number} intensity - Bass intensity (0-1)
     */
    spawnSparkTrails(asset, particleSystem, intensity) {
        if (!particleSystem || !asset) {
            return;
        }

        // Get bounding box of asset
        const box = new THREE.Box3().setFromObject(asset);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Spawn particles along edges
        const particleCount = Math.floor(intensity * 10); // 0-10 particles based on intensity
        for (let i = 0; i < particleCount; i++) {
            // Random position along edges
            const edge = Math.floor(Math.random() * 12); // 12 edges of a box
            const position = new THREE.Vector3();

            // Calculate edge position
            const halfSize = size.clone().multiplyScalar(0.5);
            switch (edge % 4) {
                case 0: // Front edge
                    position.set(
                        (Math.random() - 0.5) * size.x,
                        (Math.random() - 0.5) * size.y,
                        halfSize.z
                    );
                    break;
                case 1: // Back edge
                    position.set(
                        (Math.random() - 0.5) * size.x,
                        (Math.random() - 0.5) * size.y,
                        -halfSize.z
                    );
                    break;
                case 2: // Top edge
                    position.set(
                        (Math.random() - 0.5) * size.x,
                        halfSize.y,
                        (Math.random() - 0.5) * size.z
                    );
                    break;
                case 3: // Bottom edge
                    position.set(
                        (Math.random() - 0.5) * size.x,
                        -halfSize.y,
                        (Math.random() - 0.5) * size.z
                    );
                    break;
            }

            // Transform to world space
            position.add(center);
            asset.localToWorld(position);

            // Spawn sparkle particle
            if (particleSystem.createSparkleParticle) {
                const particle = particleSystem.createSparkleParticle(
                    position,
                    0xff00ff, // Magenta sparks (color as number)
                    intensity * 0.5 // Size based on intensity
                );
                // Particle may be null in rest mode
                if (!particle) {
                    return;
                }
            }
        }
    }

    /**
     * Wire assets to interaction system
     * @param {Object} interactionSystem - Interaction system
     */
    wireInteractions(interactionSystem) {
        if (!interactionSystem) {
            return;
        }

        // Make DamagedHelmet interactive
        const helmet = this.loadedAssets.get('damagedHelmet');
        if (helmet) {
            helmet.traverse((child) => {
                if (child.isMesh) {
                    child.userData.isInteractive = true;
                    child.userData.interactionType = 'inspect';
                    child.userData.onInteract = () => {
                        console.log('Interacted with holographic centerpiece!');
                        if (this.systems.eventSystem) {
                            this.systems.eventSystem.trigger('notification.show', {
                                message: 'Holographic inspection complete!',
                            });
                        }
                    };
                    interactionSystem.registerInteractiveObject(child);
                }
            });
        }
    }

    /**
     * Set rest mode - fades assets to mellow colors and reduces intensity
     * @param {boolean} enabled - Whether rest mode is enabled
     */
    /**
     * Store original presets for restoration
     */
    _originalPresets = new Map();

    /**
     * Set rest mode (fade assets to mellow colors)
     * @param {boolean} enabled - Whether rest mode is enabled
     */
    setRestMode(enabled) {
        const restPreset = getPreset('rest');
        const defaultPresets = {
            shroomBar: 'cyan',
            geodesicStation: 'magenta',
            boombox: 'green',
            damagedHelmet: 'magenta',
        };

        this.loadedAssets.forEach((asset, name) => {
            if (enabled) {
                // Store original preset if not already stored
                if (!this._originalPresets.has(name)) {
                    this._originalPresets.set(name, defaultPresets[name] || 'cyan');
                }
                // Apply rest preset
                if (restPreset) {
                    applyPresetToAsset(asset, restPreset);
                } else {
                    // Fallback to manual color change
                    const mellowColor = new THREE.Color(0x4a4a8a);
                    asset.traverse((child) => {
                        if (child.isMesh && child.material && child.material.emissive) {
                            child.material.emissive.copy(mellowColor);
                            if (child.material.emissiveIntensity !== undefined) {
                                child.material.emissiveIntensity *= 0.3;
                            }
                        }
                    });
                }
            } else {
                // Restore original preset
                const originalPresetName =
                    this._originalPresets.get(name) || defaultPresets[name] || 'cyan';
                const originalPreset = getPreset(originalPresetName);
                if (originalPreset) {
                    applyPresetToAsset(asset, originalPreset);
                }
                this._originalPresets.delete(name);
            }
        });
    }

    /**
     * Apply material preset to a specific asset
     * @param {string} assetName - Name of asset
     * @param {string} presetName - Name of preset to apply
     * @param {number} elapsedTime - Elapsed time for animated presets
     */
    applyPresetToAsset(assetName, presetName, elapsedTime = 0) {
        const asset = this.loadedAssets.get(assetName);
        if (!asset) {
            console.warn(`Asset "${assetName}" not found`);
            return;
        }

        const preset = getPreset(presetName);
        if (!preset) {
            console.warn(`Preset "${presetName}" not found`);
            return;
        }

        applyPresetToAsset(asset, preset, elapsedTime);
        console.log(`Applied "${presetName}" preset to "${assetName}"`);
    }

    /**
     * Apply material preset to all assets
     * @param {string} presetName - Name of preset to apply
     * @param {number} elapsedTime - Elapsed time for animated presets
     */
    applyPresetToAll(presetName, elapsedTime = 0) {
        const preset = getPreset(presetName);
        if (!preset) {
            console.warn(`Preset "${presetName}" not found`);
            return;
        }

        this.loadedAssets.forEach((asset, name) => {
            applyPresetToAsset(asset, preset, elapsedTime);
        });

        console.log(`Applied "${presetName}" preset to all assets`);
    }

    /**
     * Update proximity-based visibility for performance optimization
     * @param {THREE.Vector3} avatarPosition - Current avatar position
     * @param {THREE.Camera} camera - Camera for frustum culling
     */
    updateProximityVisibility(avatarPosition, camera) {
        if (!avatarPosition || !camera) {
            return;
        }

        this.loadedAssets.forEach((asset, name) => {
            if (!asset.userData.boundingSphere) {
                return;
            }

            const sphere = asset.userData.boundingSphere;
            const threshold = asset.userData.proximityThreshold || 20;

            // Calculate distance from avatar to asset center
            const distance = avatarPosition.distanceTo(sphere.center);

            // Toggle visibility based on proximity
            const shouldBeVisible = distance < threshold;

            // Smooth fade transition
            if (asset.userData.wasVisible === undefined) {
                asset.userData.wasVisible = true;
                asset.visible = true;
            }

            if (shouldBeVisible !== asset.userData.wasVisible) {
                asset.visible = shouldBeVisible;
                asset.userData.wasVisible = shouldBeVisible;
            }

            // Frustum culling check (if camera is provided)
            if (camera && asset.visible) {
                const frustum = new THREE.Frustum();
                const matrix = new THREE.Matrix4().multiplyMatrices(
                    camera.projectionMatrix,
                    camera.matrixWorldInverse
                );
                frustum.setFromProjectionMatrix(matrix);

                // Check if bounding sphere intersects frustum
                if (!frustum.intersectsSphere(sphere)) {
                    asset.visible = false;
                }
            }
        });
    }

    /**
     * Get assets near a position (for camera-triggered effects)
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Search radius
     * @returns {Array} Array of nearby assets
     */
    getNearbyAssets(position, radius = 5) {
        const nearby = [];

        this.loadedAssets.forEach((asset, name) => {
            if (!asset.userData.boundingSphere) {
                return;
            }

            const sphere = asset.userData.boundingSphere;
            const distance = position.distanceTo(sphere.center);

            if (distance < radius) {
                nearby.push({
                    asset,
                    name,
                    distance,
                });
            }
        });

        return nearby;
    }

    /**
     * Simplify materials for a loaded asset to prevent texture unit limit errors
     * @param {THREE.Object3D} asset - The asset to simplify
     */
    simplifyAssetMaterials(asset) {
        // Simplify directly on the asset (synchronous, immediate)
        asset.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material, index) => {
                    if (!material) {
                        return;
                    }

                    // Convert MeshStandardMaterial to MeshBasicMaterial
                    if (
                        material instanceof THREE.MeshStandardMaterial ||
                        material instanceof THREE.MeshPhysicalMaterial
                    ) {
                        // Remove all texture maps to free texture units
                        const basicMaterial = new THREE.MeshBasicMaterial({
                            color: material.color ? material.color.clone() : 0xffffff,
                            transparent: material.transparent || false,
                            opacity: material.opacity !== undefined ? material.opacity : 1,
                            side: material.side || THREE.FrontSide,
                            // Do NOT copy map or any texture properties - they use texture units
                        });

                        if (Array.isArray(child.material)) {
                            child.material[index] = basicMaterial;
                        } else {
                            child.material = basicMaterial;
                        }
                    } else if (material instanceof THREE.MeshBasicMaterial) {
                        // Remove maps from MeshBasicMaterial too (they still use texture units)
                        if (material.map || material.alphaMap) {
                            material.map = null;
                            material.alphaMap = null;
                            material.needsUpdate = true;
                        }
                    }
                });
            }
        });
    }

    /**
     * Apply preset to already-simplified asset (MeshBasicMaterial)
     * Since MeshBasicMaterial doesn't support emissive, we just update the color
     * @param {THREE.Object3D} asset - The asset to apply preset to
     * @param {Object} preset - Material preset configuration
     */
    applyPresetToSimplifiedAsset(asset, preset) {
        if (!asset || !preset) {
            return;
        }

        asset.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => {
                    if (!material || !(material instanceof THREE.MeshBasicMaterial)) {
                        return;
                    }

                    // MeshBasicMaterial doesn't support emissive, so we just tint the color
                    if (preset.neonColor) {
                        // Blend the neon color with the existing color
                        const existingColor = material.color.clone();
                        const neonColor = preset.neonColor.clone();
                        // Mix colors (70% neon, 30% existing)
                        material.color.lerpColors(existingColor, neonColor, 0.7);
                    }

                    // Apply transparency if needed
                    if (preset.additiveBlending) {
                        material.transparent = true;
                        material.opacity = 0.8;
                    }
                });
            }
        });
    }

    /**
     * Load all available Codex assets
     * @returns {Promise<Object>} Map of loaded assets
     */
    async loadAllAssets() {
        const results = {};

        // Load repo assets
        results.shroomBar = await this.loadShroomBar();
        results.geodesicStation = await this.loadGeodesicStation();

        // Load external assets
        results.boombox = await this.loadBoomBox();
        results.damagedHelmet = await this.loadDamagedHelmet();

        return results;
    }
}
