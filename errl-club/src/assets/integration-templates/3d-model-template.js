/**
 * 3D Model Integration Template
 *
 * Copy this template and customize for your 3D model integration
 */

import * as THREE from 'three';
import { getPreset, applyPresetToAsset } from '../../config/MaterialPresets.js';

/**
 * Load and integrate {ASSET_NAME}
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} systems - Game systems
 * @param {Object} assetLoader - AssetLoader instance
 * @param {Object} lodSystem - LODSystem instance (optional)
 * @returns {Promise<THREE.Group>} Loaded model
 */
export async function load{ASSET_NAME}(scene, systems, assetLoader, lodSystem = null) {
    try {
        // Load model
        const model = await assetLoader.loadModel('/models/{CATEGORY}/{ASSET_NAME}.glb');

        // Auto-scale to desired dimensions
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const desiredHeight = {HEIGHT}; // meters
        const scale = desiredHeight / size.y;
        model.scale.setScalar(Math.min(scale, {MAX_SCALE}));

        // Position in scene
        model.position.set({X}, {Y}, {Z});

        // Enhance materials with preset
        const preset = getPreset('{PRESET_NAME}'); // 'cyan', 'green', 'magenta', etc.
        if (preset) {
            applyPresetToAsset(model, preset);
        } else {
            // Fallback to manual enhancement
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (child.material.isMeshBasicMaterial) {
                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: child.material.color,
                            map: child.material.map,
                        });
                        child.material = newMaterial;
                    }
                    if (child.material.isMeshStandardMaterial) {
                        child.material.emissive = new THREE.Color({EMISSIVE_COLOR});
                        child.material.emissiveIntensity = {EMISSIVE_INTENSITY};
                    }
                }
            });
        }

        // Precompute bounding sphere for frustum culling
        const boundingBox = new THREE.Box3().setFromObject(model);
        model.userData.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
        model.userData.proximityThreshold = {PROXIMITY_THRESHOLD}; // meters

        // Tag asset with metadata
        model.traverse((child) => {
            if (child.isMesh) {
                if (!child.userData) {
                    child.userData = {};
                }
                child.userData.assetSource = '{ASSET_NAME}';
                child.userData.license = '{LICENSE}';
            }
        });

        // Add audio-reactive properties (optional)
        model.userData.audioReactive = {
            frequencyBand: '{FREQUENCY_BAND}', // 'bass', 'mid', or 'treble'
            targetProperty: 'emissiveIntensity',
            minValue: {MIN_VALUE},
            maxValue: {MAX_VALUE},
        };

        // Add interactions (optional)
        model.userData.interactive = {IS_INTERACTIVE}; // true or false
        if ({IS_INTERACTIVE}) {
            model.userData.interactionType = '{INTERACTION_TYPE}'; // 'hover', 'click', 'proximity'
            model.userData.interactionRange = {INTERACTION_RANGE}; // meters
        }

        // Add to scene
        scene.add(model);

        // Register with LOD system if available
        if (lodSystem) {
            lodSystem.registerAsset('{ASSET_ID}', model);
        }

        console.log('✅ Loaded {ASSET_NAME}');
        return model;
    } catch (error) {
        console.error('❌ Failed to load {ASSET_NAME}:', error);
        return null;
    }
}

/**
 * Template Variables to Replace:
 * - {ASSET_NAME} - Asset display name
 * - {CATEGORY} - Asset category (props, environment, etc.)
 * - {HEIGHT} - Desired height in meters
 * - {MAX_SCALE} - Maximum scale factor
 * - {X}, {Y}, {Z} - Position coordinates
 * - {PRESET_NAME} - Material preset name
 * - {EMISSIVE_COLOR} - Emissive color (hex)
 * - {EMISSIVE_INTENSITY} - Emissive intensity (0-1)
 * - {PROXIMITY_THRESHOLD} - Visibility distance in meters
 * - {LICENSE} - License information
 * - {FREQUENCY_BAND} - Audio-reactive frequency band
 * - {MIN_VALUE} - Minimum audio-reactive value
 * - {MAX_VALUE} - Maximum audio-reactive value
 * - {IS_INTERACTIVE} - true or false
 * - {INTERACTION_TYPE} - Interaction type
 * - {INTERACTION_RANGE} - Interaction range in meters
 * - {ASSET_ID} - Unique asset identifier
 */

