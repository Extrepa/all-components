/**
 * MaterialSimplifier - Utility to reduce texture unit usage in materials
 *
 * Helps prevent WebGL texture unit limit errors by removing non-essential texture maps.
 * WebGL has a limit of 16 texture image units, and each texture map in a material
 * consumes one unit. This utility removes non-essential maps to stay under the limit.
 *
 * CURRENT APPROACH (Aggressive Simplification):
 * - Converts all MeshStandardMaterial and MeshPhysicalMaterial to MeshBasicMaterial
 * - This completely eliminates texture unit usage, ensuring stability
 * - Trade-off: Reduces visual quality but prevents rendering errors
 *
 * USAGE:
 * - Use createMaterial() to create new materials - it will create MeshBasicMaterial
 * - Use simplifyMaterials() to convert existing materials in a scene
 *
 * FUTURE IMPROVEMENTS:
 * - Could implement selective simplification (keep diffuse maps, remove others)
 * - Could add configuration option for simplification level
 * - Could preserve emissive maps for important objects
 * - Could implement texture atlas to reduce unit count
 *
 * WHY THIS APPROACH:
 * Even materials without textures can cause shader compilation issues when combined
 * with other materials that do have textures. Converting to MeshBasicMaterial ensures
 * consistent shader usage and prevents texture unit limit errors.
 */
import * as THREE from 'three';

/**
 * Create a MeshBasicMaterial with compatible properties.
 * Use this instead of new THREE.MeshStandardMaterial() to avoid texture unit limits.
 *
 * This function accepts the same options as MeshStandardMaterial but only uses
 * properties compatible with MeshBasicMaterial. Incompatible properties like
 * emissive, emissiveIntensity, metalness, roughness are silently ignored.
 *
 * @param {Object} options - Material options (same as MeshStandardMaterial)
 * @returns {THREE.MeshBasicMaterial} A MeshBasicMaterial with compatible properties
 */
export function createMaterial(options = {}) {
    // Extract only MeshBasicMaterial-compatible properties
    const basicOptions = {
        color: options.color !== undefined ? options.color : 0xffffff,
        transparent: options.transparent || false,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        side: options.side || THREE.FrontSide,
        visible: options.visible !== undefined ? options.visible : true,
        wireframe: options.wireframe || false,
    };

    // Handle map (diffuse texture) if provided
    if (options.map) {
        basicOptions.map = options.map;
    }

    // Handle alphaMap if provided
    if (options.alphaMap) {
        basicOptions.alphaMap = options.alphaMap;
    }

    return new THREE.MeshBasicMaterial(basicOptions);
}

export class MaterialSimplifier {
    /**
     * Simplify materials in a scene to reduce texture unit usage
     * Removes non-essential texture maps (normal, roughness, metalness, ao, etc.)
     * Keeps only essential maps (diffuse/color map)
     *
     * @param {THREE.Scene} scene - The scene to process
     * @param {boolean} aggressive - If true, also removes emissiveMap and envMap
     */
    static simplifyMaterials(scene, _aggressive = true) {
        if (!scene) {
            return;
        }

        let simplifiedCount = 0;
        let convertedCount = 0;
        let standardMaterialCount = 0;
        let physicalMaterialCount = 0;
        let basicMaterialWithMapsCount = 0;

        scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh) || !object.material) {
                return;
            }

            // Handle both single materials and material arrays
            const materials = Array.isArray(object.material) ? object.material : [object.material];

            materials.forEach((material, index) => {
                if (!material) {
                    return;
                }

                // Skip materials that should preserve color (LED strips, panels, avatar, etc.)
                if (object.userData && object.userData.preserveColor === true) {
                    return; // Skip this material - it should remain colorful
                }

                // Process MeshStandardMaterial, MeshPhysicalMaterial, AND MeshBasicMaterial with maps
                // MeshBasicMaterial with map property still uses texture units, so we need to remove the map
                if (material instanceof THREE.MeshBasicMaterial) {
                    // Remove map property if it exists (even MeshBasicMaterial with map uses texture units)
                    if (material.map || material.alphaMap) {
                        const textureCount = (material.map ? 1 : 0) + (material.alphaMap ? 1 : 0);
                        material.map = null;
                        material.alphaMap = null;
                        material.needsUpdate = true;
                        simplifiedCount += textureCount;
                        convertedCount++;
                        basicMaterialWithMapsCount++;
                    }
                    return; // Already MeshBasicMaterial, just needed to remove maps
                }

                // Count MeshStandardMaterial and MeshPhysicalMaterial before conversion
                if (material instanceof THREE.MeshStandardMaterial) {
                    standardMaterialCount++;
                } else if (material instanceof THREE.MeshPhysicalMaterial) {
                    physicalMaterialCount++;
                } else {
                    // Not a material we process
                    return;
                }

                // AGGRESSIVE: Convert ALL MeshStandardMaterial and MeshPhysicalMaterial to MeshBasicMaterial
                // This completely eliminates texture unit usage, regardless of whether they have textures
                // This is necessary because even materials without textures can cause shader compilation issues
                // when combined with other materials that do have textures

                // Count how many texture maps this material has (for logging)
                let textureCount = 0;
                if (material.map) {
                    textureCount++;
                }
                if (material.normalMap) {
                    textureCount++;
                }
                if (material.roughnessMap) {
                    textureCount++;
                }
                if (material.metalnessMap) {
                    textureCount++;
                }
                if (material.aoMap) {
                    textureCount++;
                }
                if (material.emissiveMap) {
                    textureCount++;
                }
                if (material.envMap) {
                    textureCount++;
                }
                if (material.displacementMap) {
                    textureCount++;
                }
                if (material.alphaMap) {
                    textureCount++;
                }
                if (material.lightMap) {
                    textureCount++;
                }

                // ALWAYS convert to MeshBasicMaterial to eliminate texture unit usage
                // Note: MeshBasicMaterial does NOT support emissive or emissiveIntensity
                // These properties are ignored if set, causing console warnings
                // CRITICAL: Do NOT copy map property - even MeshBasicMaterial with map uses texture units
                const originalColor = material.color ? material.color.clone() : new THREE.Color(0xffffff);
                const basicMaterial = new THREE.MeshBasicMaterial({
                    color: originalColor,
                    // Do not set emissive or emissiveIntensity - MeshBasicMaterial doesn't support them
                    // Do not set map - even MeshBasicMaterial with map uses a texture unit
                    transparent: material.transparent || false,
                    opacity: material.opacity !== undefined ? material.opacity : 1,
                    side: material.side || THREE.FrontSide,
                });

                // Verify color was preserved (debug logging)
                if (window.DEBUG_MATERIALS) {
                    // eslint-disable-next-line no-console
                    console.log('MaterialSimplifier: Preserved color', {
                        original: originalColor.getHexString(),
                        new: basicMaterial.color.getHexString(),
                        match: originalColor.getHexString() === basicMaterial.color.getHexString(),
                    });
                }

                // Replace the material
                if (Array.isArray(object.material)) {
                    object.material[index] = basicMaterial;
                } else {
                    object.material = basicMaterial;
                }

                simplifiedCount += textureCount;
                convertedCount++;
            });
        });

        // Log detailed results
        if (
            standardMaterialCount > 0 ||
            physicalMaterialCount > 0 ||
            basicMaterialWithMapsCount > 0
        ) {
            // eslint-disable-next-line no-console
            console.log(
                `MaterialSimplifier: Found ${standardMaterialCount} MeshStandardMaterials, ${physicalMaterialCount} MeshPhysicalMaterials, ${basicMaterialWithMapsCount} MeshBasicMaterials with maps`
            );
            // eslint-disable-next-line no-console
            console.log(
                `MaterialSimplifier: Converted ${convertedCount} materials to MeshBasicMaterial, removed ${simplifiedCount} texture maps`
            );
        } else if (convertedCount > 0) {
            // eslint-disable-next-line no-console
            console.log(
                `MaterialSimplifier: Converted ${convertedCount} materials to MeshBasicMaterial, removed ${simplifiedCount} texture maps`
            );
        }

        return simplifiedCount;
    }

    /**
     * Get estimated texture unit usage for a scene
     * This is a rough estimate - actual usage depends on what's rendered
     *
     * @param {THREE.Scene} scene - The scene to analyze
     * @returns {number} Estimated texture units used
     */
    static estimateTextureUnits(scene) {
        if (!scene) {
            return 0;
        }

        let estimatedUnits = 0;

        scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh) || !object.material) {
                return;
            }

            const materials = Array.isArray(object.material) ? object.material : [object.material];

            materials.forEach((material) => {
                if (!material) {
                    return;
                }

                // CRITICAL: Count MeshStandardMaterial and MeshPhysicalMaterial instances
                // These shaders reserve texture unit slots even without textures assigned
                // Each instance counts as 1 texture unit due to shader compilation
                if (
                    material instanceof THREE.MeshStandardMaterial ||
                    material instanceof THREE.MeshPhysicalMaterial
                ) {
                    estimatedUnits++;
                }

                // Count texture maps
                // Note: Even MeshBasicMaterial with map uses texture units
                if (material.map) {
                    estimatedUnits++;
                }
                if (material.normalMap) {
                    estimatedUnits++;
                }
                if (material.roughnessMap) {
                    estimatedUnits++;
                }
                if (material.metalnessMap) {
                    estimatedUnits++;
                }
                if (material.aoMap) {
                    estimatedUnits++;
                }
                if (material.emissiveMap) {
                    estimatedUnits++;
                }
                if (material.envMap) {
                    estimatedUnits++;
                }
                if (material.displacementMap) {
                    estimatedUnits++;
                }
                if (material.alphaMap) {
                    estimatedUnits++;
                }
                if (material.lightMap) {
                    estimatedUnits++;
                }
            });
        });

        return estimatedUnits;
    }

    /**
     * Check if scene is approaching texture unit limit and warn
     *
     * @param {THREE.Scene} scene - The scene to check
     * @param {number} warningThreshold - Warn if estimated units exceed this (default: 12)
     */
    static checkTextureUnitUsage(scene, warningThreshold = 12) {
        const estimatedUnits = this.estimateTextureUnits(scene);
        const maxUnits = 16;

        if (estimatedUnits > maxUnits) {
            // eslint-disable-next-line no-console
            console.warn(
                `MaterialSimplifier: Scene may exceed texture unit limit! Estimated: ${estimatedUnits}/${maxUnits}. Consider simplifying materials.`
            );
        } else if (estimatedUnits > warningThreshold) {
            // eslint-disable-next-line no-console
            console.warn(
                `MaterialSimplifier: Approaching texture unit limit. Estimated: ${estimatedUnits}/${maxUnits}. Consider simplifying materials.`
            );
        }

        return estimatedUnits;
    }

    /**
     * Monitor scene for problematic materials and fix them automatically
     * Use this in the game loop to catch materials created during runtime
     *
     * @param {THREE.Scene} scene - The scene to monitor
     * @param {number} checkInterval - Only check every N frames (default: 60, i.e., once per second at 60fps)
     * @returns {Object} { found: number, fixed: number } - Count of problematic materials found and fixed
     */
    static monitorAndFix(scene, checkInterval = 60) {
        if (!scene) {
            return { found: 0, fixed: 0 };
        }

        // Use frame counter to throttle checks
        if (!this._frameCounter) {
            this._frameCounter = 0;
        }
        this._frameCounter++;

        if (this._frameCounter % checkInterval !== 0) {
            return { found: 0, fixed: 0 };
        }

        let foundCount = 0;
        let fixedCount = 0;

        scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh) || !object.material) {
                return;
            }

            const materials = Array.isArray(object.material) ? object.material : [object.material];

            materials.forEach((material, index) => {
                if (!material) {
                    return;
                }

                // Skip materials that should preserve color (LED strips, panels, avatar, etc.)
                if (object.userData && object.userData.preserveColor === true) {
                    return; // Skip this material - it should remain colorful
                }

                // Check for problematic materials
                if (
                    material instanceof THREE.MeshStandardMaterial ||
                    material instanceof THREE.MeshPhysicalMaterial
                ) {
                    foundCount++;

                    // Convert to MeshBasicMaterial
                    const originalColor = material.color ? material.color.clone() : new THREE.Color(0xffffff);
                    const basicMaterial = new THREE.MeshBasicMaterial({
                        color: originalColor,
                        transparent: material.transparent || false,
                        opacity: material.opacity !== undefined ? material.opacity : 1,
                        side: material.side || THREE.FrontSide,
                    });

                    if (Array.isArray(object.material)) {
                        object.material[index] = basicMaterial;
                    } else {
                        object.material = basicMaterial;
                    }

                    fixedCount++;
                } else if (material instanceof THREE.MeshBasicMaterial) {
                    // Remove texture maps from MeshBasicMaterial
                    if (material.map || material.alphaMap) {
                        foundCount++;
                        material.map = null;
                        material.alphaMap = null;
                        material.needsUpdate = true;
                        fixedCount++;
                    }
                }
            });
        });

        if (foundCount > 0) {
            // eslint-disable-next-line no-console
            console.warn(
                `MaterialSimplifier: Runtime monitor found ${foundCount} problematic materials and fixed ${fixedCount}`
            );
        }

        return { found: foundCount, fixed: fixedCount };
    }
}
