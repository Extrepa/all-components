/**
 * MaterialPresets - Neon material preset configurations for Codex assets
 *
 * Provides predefined material presets for different neon themes:
 * - Cyan theme
 * - Magenta theme
 * - Yellow theme
 * - Rainbow theme
 * - Custom themes
 */

import * as THREE from 'three';

export const MaterialPresets = {
    /**
     * Cyan neon theme
     */
    cyan: {
        name: 'Cyan Neon',
        neonColor: new THREE.Color(0x00ffff),
        emissiveIntensity: 0.4,
        additiveBlending: false,
        description: 'Cool cyan glow',
    },

    /**
     * Magenta neon theme
     */
    magenta: {
        name: 'Magenta Neon',
        neonColor: new THREE.Color(0xff00ff),
        emissiveIntensity: 0.5,
        additiveBlending: true,
        description: 'Vibrant magenta with holographic effect',
    },

    /**
     * Yellow neon theme
     */
    yellow: {
        name: 'Yellow Neon',
        neonColor: new THREE.Color(0xffff00),
        emissiveIntensity: 0.45,
        additiveBlending: false,
        description: 'Bright yellow glow',
    },

    /**
     * Rainbow theme (cycles through colors)
     */
    rainbow: {
        name: 'Rainbow',
        neonColor: new THREE.Color(0xffffff), // Will be animated
        emissiveIntensity: 0.6,
        additiveBlending: true,
        animated: true,
        description: 'Animated rainbow colors',
    },

    /**
     * Red neon theme
     */
    red: {
        name: 'Red Neon',
        neonColor: new THREE.Color(0xff0000),
        emissiveIntensity: 0.4,
        additiveBlending: false,
        description: 'Warm red glow',
    },

    /**
     * Green neon theme
     */
    green: {
        name: 'Green Neon',
        neonColor: new THREE.Color(0x00ff00),
        emissiveIntensity: 0.4,
        additiveBlending: false,
        description: 'Vibrant green glow',
    },

    /**
     * Blue neon theme
     */
    blue: {
        name: 'Blue Neon',
        neonColor: new THREE.Color(0x0000ff),
        emissiveIntensity: 0.4,
        additiveBlending: false,
        description: 'Cool blue glow',
    },

    /**
     * Purple neon theme
     */
    purple: {
        name: 'Purple Neon',
        neonColor: new THREE.Color(0x8000ff),
        emissiveIntensity: 0.5,
        additiveBlending: true,
        description: 'Deep purple with holographic effect',
    },

    /**
     * White/neutral theme
     */
    white: {
        name: 'White Neon',
        neonColor: new THREE.Color(0xffffff),
        emissiveIntensity: 0.3,
        additiveBlending: false,
        description: 'Clean white glow',
    },

    /**
     * Rest mode theme (mellow blue-purple)
     */
    rest: {
        name: 'Rest Mode',
        neonColor: new THREE.Color(0x4a4aff),
        emissiveIntensity: 0.2,
        additiveBlending: false,
        description: 'Mellow blue-purple for rest mode',
    },
};

/**
 * Get preset by name
 * @param {string} presetName - Name of preset
 * @returns {Object|null} Preset object or null if not found
 */
export function getPreset(presetName) {
    const preset = MaterialPresets[presetName];
    if (!preset) {
        return null;
    }

    // Return a copy to avoid modifying the original
    return {
        name: preset.name,
        neonColor: preset.neonColor.clone(),
        emissiveIntensity: preset.emissiveIntensity,
        additiveBlending: preset.additiveBlending,
        animated: preset.animated || false,
        description: preset.description,
    };
}

/**
 * Get all preset names
 * @returns {string[]} Array of preset names
 */
export function getAllPresetNames() {
    return Object.keys(MaterialPresets);
}

/**
 * Get presets by category
 * @param {string} category - Category name (optional)
 * @returns {Object} Object with preset names as keys
 */
export function getPresetsByCategory(category = null) {
    if (!category) {
        return MaterialPresets;
    }

    // Simple categorization
    const categories = {
        primary: ['cyan', 'magenta', 'yellow'],
        secondary: ['red', 'green', 'blue', 'purple'],
        special: ['rainbow', 'white', 'rest'],
    };

    if (categories[category]) {
        const result = {};
        categories[category].forEach((name) => {
            if (MaterialPresets[name]) {
                result[name] = MaterialPresets[name];
            }
        });
        return result;
    }

    return {};
}

/**
 * Apply preset to material
 * @param {THREE.Material} material - Material to apply preset to
 * @param {Object} preset - Preset object
 * @param {number} elapsedTime - Elapsed time for animated presets
 */
export function applyPresetToMaterial(material, preset, elapsedTime = 0) {
    if (!material || !preset) {
        return;
    }

    // Ensure material supports emissive
    if (!material.emissive) {
        if (material.isMeshBasicMaterial) {
            // Convert to MeshStandardMaterial if needed
            console.warn('MaterialPresets: Cannot apply preset to MeshBasicMaterial');
            return;
        }
        material.emissive = new THREE.Color(0x000000);
    }

    // Handle animated rainbow preset
    if (preset.animated && preset.name === 'Rainbow') {
        const hue = (elapsedTime * 0.1) % 1.0;
        material.emissive.setHSL(hue, 1.0, 0.5);
    } else {
        material.emissive.copy(preset.neonColor);
    }

    if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = preset.emissiveIntensity;
    }

    if (preset.additiveBlending) {
        material.transparent = true;
        material.blending = THREE.AdditiveBlending;
    }
}

/**
 * Apply preset to asset (all materials)
 * @param {THREE.Object3D} asset - Asset to apply preset to
 * @param {Object} preset - Preset object
 * @param {number} elapsedTime - Elapsed time for animated presets
 */
export function applyPresetToAsset(asset, preset, elapsedTime = 0) {
    if (!asset || !preset) {
        return;
    }

    asset.traverse((child) => {
        if (child.isMesh && child.material) {
            // Handle array of materials
            if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                    applyPresetToMaterial(mat, preset, elapsedTime);
                });
            } else {
                applyPresetToMaterial(child.material, preset, elapsedTime);
            }
        }
    });
}
