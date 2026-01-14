/**
 * TVRenderSystem - Renders the nightclub scene inside the TV screen
 *
 * Uses render-to-texture to display the club scene on the TV screen
 */
import * as THREE from 'three';

export class TVRenderSystem {
    constructor(scene, camera, renderer, clubScene, clubCamera) {
        this.scene = scene; // Main scene (contains TV)
        this.camera = camera; // Main camera (views TV from outside)
        this.renderer = renderer; // Main renderer

        this.clubScene = clubScene; // The nightclub scene (rendered inside TV)
        this.clubCamera = clubCamera; // Camera for club scene
        this.clubPostProcessingManager = null; // Post-processing for club scene

        // Render target for TV screen
        this.renderTarget = null;
        this.tvScreenMaterial = null;
        this.tvScreenMesh = null;

        // TV screen dimensions
        this.screenWidth = 1920;
        this.screenHeight = 1080;

        // Material simplification cache (stores original values before simplifying)
        this.materialCache = new Map();

        // Setup render target
        this.setupRenderTarget();
    }

    /**
     * Setup render target for TV screen
     */
    setupRenderTarget() {
        // Create render target with high resolution for crisp TV screen
        this.renderTarget = new THREE.WebGLRenderTarget(this.screenWidth, this.screenHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
        });

        console.log(
            'TVRenderSystem: Render target created',
            this.screenWidth,
            'x',
            this.screenHeight
        );
    }

    /**
     * Create TV screen mesh with render texture
     * @param {THREE.Vector3} position - Screen position
     * @param {THREE.Vector3} size - Screen size (width, height, depth)
     * @param {THREE.Vector3} normal - Screen normal direction
     * @returns {THREE.Mesh} TV screen mesh
     */
    createTVScreen(position, size, normal = new THREE.Vector3(0, 0, 1)) {
        // Create plane geometry for TV screen
        const geometry = new THREE.PlaneGeometry(size.x, size.y);

        // Create material with render texture
        // Use only map (not emissiveMap) to reduce texture unit usage
        this.tvScreenMaterial = new THREE.MeshBasicMaterial({
            map: this.renderTarget.texture, // Use emissive color instead of emissiveMap
            side: THREE.DoubleSide,
        });

        // Create mesh
        this.tvScreenMesh = new THREE.Mesh(geometry, this.tvScreenMaterial);

        // Position and orient screen
        this.tvScreenMesh.position.copy(position);

        // Orient screen to face normal direction
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.normalize());
        this.tvScreenMesh.quaternion.copy(quaternion);

        // Add to scene
        this.scene.add(this.tvScreenMesh);

        console.log('TVRenderSystem: TV screen mesh created at', position);

        return this.tvScreenMesh;
    }

    /**
     * Update club camera to match TV screen aspect ratio
     */
    updateClubCamera() {
        if (!this.clubCamera) {
            return;
        }

        // Match TV screen aspect ratio
        const aspect = this.screenWidth / this.screenHeight;
        this.clubCamera.aspect = aspect;
        this.clubCamera.updateProjectionMatrix();
    }

    /**
     * Simplify materials in the club scene to reduce texture unit usage
     * Removes non-essential texture maps (normal, roughness, metalness, ao, displacement, etc.)
     * Keeps only essential maps (diffuse/color map, emissive map)
     */
    simplifyMaterials() {
        if (!this.clubScene) {
            return;
        }

        this.clubScene.traverse((object) => {
            if (!(object instanceof THREE.Mesh) || !object.material) {
                return;
            }

            // Handle both single materials and material arrays
            const materials = Array.isArray(object.material) ? object.material : [object.material];

            materials.forEach((material, index) => {
                if (!material) {
                    return;
                }

                // Only process MeshStandardMaterial and MeshPhysicalMaterial
                // Other material types (MeshBasicMaterial, etc.) don't have texture maps
                if (
                    !(material instanceof THREE.MeshStandardMaterial) &&
                    !(material instanceof THREE.MeshPhysicalMaterial)
                ) {
                    return;
                }

                // Create unique key for this material
                const materialKey = Array.isArray(object.material)
                    ? `${object.uuid}-${index}`
                    : object.uuid;

                // Skip if already cached (avoid double-processing)
                if (this.materialCache.has(materialKey)) {
                    return;
                }

                // Store original texture map references
                const original = {
                    alphaMap: material.alphaMap,
                    emissiveMap: material.emissiveMap,
                    // Store original values for restoration
                };

                this.materialCache.set(materialKey, original);

                // Remove ALL non-essential texture maps to reduce texture unit usage
                // Keep only: map (diffuse/albedo) - the most essential texture
                // Remove everything else to stay well under the 16 texture unit limit
                material.normalMap = null;
                material.roughnessMap = null;
                material.metalnessMap = null;
                material.aoMap = null;
                material.displacementMap = null;
                material.alphaMap = null;
                material.lightMap = null;
                material.envMap = null; // Remove environment map to free texture units
                material.emissiveMap = null; // Remove emissive map to free texture units
                // Also disable environment mapping features
                material.envMapIntensity = 0;

                // Reset scales that depend on removed maps
                if (material.normalScale) {
                    material.normalScale.set(1, 1);
                }
                material.displacementScale = 0;
                material.displacementBias = 0;

                // Mark material as needing update
                material.needsUpdate = true;
            });
        });
    }

    /**
     * Restore original material properties after TV rendering
     */
    restoreMaterials() {
        if (!this.clubScene) {
            return;
        }

        this.clubScene.traverse((object) => {
            if (!(object instanceof THREE.Mesh) || !object.material) {
                return;
            }

            // Handle both single materials and material arrays
            const materials = Array.isArray(object.material) ? object.material : [object.material];

            materials.forEach((material, index) => {
                if (!material) {
                    return;
                }

                // Only process MeshStandardMaterial and MeshPhysicalMaterial
                // Other material types (MeshBasicMaterial, etc.) don't have texture maps
                if (
                    !(material instanceof THREE.MeshStandardMaterial) &&
                    !(material instanceof THREE.MeshPhysicalMaterial)
                ) {
                    return;
                }

                // Create unique key for this material
                const materialKey = Array.isArray(object.material)
                    ? `${object.uuid}-${index}`
                    : object.uuid;

                // Restore original values if cached
                const original = this.materialCache.get(materialKey);
                if (!original) {
                    return;
                }

                // Restore texture maps
                material.normalMap = original.normalMap;
                material.roughnessMap = original.roughnessMap;
                material.metalnessMap = original.metalnessMap;
                material.aoMap = original.aoMap;
                material.displacementMap = original.displacementMap;
                material.alphaMap = original.alphaMap;
                material.lightMap = original.lightMap;
                material.envMap = original.envMap;
                material.emissiveMap = original.emissiveMap;

                // Restore scales and intensities
                if (original.normalScale && material.normalScale) {
                    material.normalScale.copy(original.normalScale);
                }
                material.displacementScale = original.displacementScale;
                material.displacementBias = original.displacementBias;
                material.envMapIntensity = original.envMapIntensity;

                // Mark material as needing update
                material.needsUpdate = true;
            });
        });

        // Clear cache after restoration
        this.materialCache.clear();
    }

    /**
     * Render club scene to TV screen texture
     * @param {number} deltaTime - Delta time
     * @param {number} elapsedTime - Elapsed time
     */
    render(deltaTime, elapsedTime) {
        if (!this.enabled || !this.renderTarget || !this.clubScene || !this.clubCamera) {
            return;
        }

        // Store original render target and size
        const originalRenderTarget = this.renderer.getRenderTarget();
        const originalSize = new THREE.Vector2();
        this.renderer.getSize(originalSize);

        // Store original clear color
        const originalClearColor = new THREE.Color();
        this.renderer.getClearColor(originalClearColor);

        // Set render target to TV screen
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.setSize(this.screenWidth, this.screenHeight);

        // Clear render target
        this.renderer.setClearColor(0x0a0a0a, 1);
        this.renderer.clear();

        // Update club camera
        this.updateClubCamera();

        // Simplify materials before rendering to reduce texture unit usage
        // This prevents WebGL texture unit limit errors
        this.simplifyMaterials();

        // Render club scene directly (no post-processing to avoid texture unit limit)
        // Post-processing is applied to the main scene rendering, not the TV texture
        try {
            this.renderer.render(this.clubScene, this.clubCamera);
        } catch (error) {
            // If we still hit texture unit limit, log and continue
            // The renderer will fall back to simpler rendering
            if (error && error.message && error.message.includes('TEXTURE_IMAGE_UNITS')) {
                console.warn(
                    'TVRenderSystem: Texture unit limit exceeded, rendering with reduced quality'
                );
            } else {
                throw error;
            }
        }

        // Restore original materials after rendering
        this.restoreMaterials();

        // Restore original render target and size
        this.renderer.setRenderTarget(originalRenderTarget);
        this.renderer.setSize(originalSize.x, originalSize.y);
        this.renderer.setClearColor(originalClearColor);

        // Update TV screen texture
        if (this.tvScreenMaterial) {
            this.tvScreenMaterial.map = this.renderTarget.texture;
            // Don't set emissiveMap - it uses an extra texture unit
            // this.tvScreenMaterial.emissiveMap = this.renderTarget.texture;
            this.tvScreenMaterial.needsUpdate = true;
        }
    }

    /**
     * Resize render target
     * @param {number} width - New width
     * @param {number} height - New height
     */
    setSize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;

        if (this.renderTarget) {
            this.renderTarget.setSize(width, height);
            this.updateClubCamera();
        }
    }

    /**
     * Get render target texture
     * @returns {THREE.Texture} Render target texture
     */
    getTexture() {
        return this.renderTarget ? this.renderTarget.texture : null;
    }

    /**
     * Set post-processing manager for club scene
     * @param {PostProcessingManager} postProcessingManager - Post-processing manager
     */
    setPostProcessingManager(postProcessingManager) {
        this.clubPostProcessingManager = postProcessingManager;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.renderTarget) {
            this.renderTarget.dispose();
        }

        if (this.tvScreenMaterial) {
            this.tvScreenMaterial.dispose();
        }

        if (this.tvScreenMesh) {
            this.scene.remove(this.tvScreenMesh);
        }
    }
}
