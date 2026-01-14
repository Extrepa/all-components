/**
 * Texture Integration Template
 *
 * Copy this template and customize for your texture integration
 */

import { TextureManager } from '../TextureManager.js';

/**
 * Load and apply texture
 * @param {TextureManager} textureManager - TextureManager instance
 * @param {THREE.Material} material - Material to apply texture to
 * @returns {Promise<THREE.Texture>} Loaded texture
 */
export async function load{TEXTURE_NAME}(textureManager, material) {
    try {
        // Load texture
        const texture = await textureManager.loadTexture('/textures/{CATEGORY}/{TEXTURE_NAME}.{EXT}', {
            wrapS: THREE.{WRAP_S}, // RepeatWrapping or ClampToEdgeWrapping
            wrapT: THREE.{WRAP_T},
            minFilter: THREE.{MIN_FILTER}, // LinearMipmapLinearFilter
            magFilter: THREE.{MAG_FILTER}, // LinearFilter
            format: THREE.{FORMAT}, // RGBAFormat or RGBFormat
        });

        // Apply to material
        material.{TEXTURE_PROPERTY} = texture; // map, normalMap, roughnessMap, etc.
        material.needsUpdate = true;

        console.log('✅ Loaded {TEXTURE_NAME}');
        return texture;
    } catch (error) {
        console.error('❌ Failed to load {TEXTURE_NAME}:', error);
        return null;
    }
}

/**
 * Template Variables to Replace:
 * - {TEXTURE_NAME} - Texture name
 * - {CATEGORY} - Texture category (materials, ui, environment)
 * - {EXT} - File extension (png, jpg, etc.)
 * - {WRAP_S} - Wrap mode for S axis
 * - {WRAP_T} - Wrap mode for T axis
 * - {MIN_FILTER} - Minification filter
 * - {MAG_FILTER} - Magnification filter
 * - {FORMAT} - Texture format
 * - {TEXTURE_PROPERTY} - Material property (map, normalMap, etc.)
 */

