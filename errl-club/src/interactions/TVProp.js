/**
 * TVProp - Interactive TV prop that renders the nightclub inside the screen
 */
import * as THREE from 'three';

export class TVProp {
    constructor(scene, position, assetLoader, tvRenderSystem = null) {
        this.scene = scene;
        this.position = position.clone();
        this.assetLoader = assetLoader;
        this.tvRenderSystem = tvRenderSystem; // Render system for club scene
        this.model = null;
        this.screenPosition = null; // Position inside/at the TV screen
        this.boundingBox = null;
        this.screenMesh = null; // The actual screen mesh

        // TV configuration
        this.scale = 1.0;
        this.rotation = 0; // Rotation around Y axis

        // Load the TV model
        this.load();
    }

    /**
     * Load the TV model
     * Note: Custom TV model removed - using procedural placeholder instead
     */
    async load() {
        // Use placeholder TV instead of loading custom model
        // This avoids dependency on external GLB files
        this.createPlaceholder();
        return this.model;
    }

    /**
     * Create a placeholder TV if model fails to load
     */
    createPlaceholder() {
        const geometry = new THREE.BoxGeometry(2, 1.5, 0.3);
        const material = new THREE.MeshBasicMaterial({
            color: 0x222222,
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation;

        // Calculate screen position for placeholder
        this.screenPosition = new THREE.Vector3(
            this.position.x,
            this.position.y,
            this.position.z + 0.15 // Slightly inside the front face
        );

        this.scene.add(this.model);

        // Add a point light near the TV to help visibility at spawn
        this.spawnLight = new THREE.PointLight(0xffffff, 2.0, 10);
        this.spawnLight.position.set(this.position.x, this.position.y + 1.5, this.position.z);
        this.scene.add(this.spawnLight);

        console.log('TVProp: Created placeholder TV at', this.position);
    }

    /**
     * Get the spawn position inside/at the TV screen
     * @returns {THREE.Vector3} Spawn position
     */
    getSpawnPosition() {
        if (this.screenPosition) {
            return this.screenPosition.clone();
        }
        // Fallback: if screen position not calculated yet, use TV position with offset
        // This ensures avatar spawns near the TV even if model hasn't fully loaded
        const fallbackPosition = this.position.clone();
        fallbackPosition.y += 0.5; // Slightly above TV base
        fallbackPosition.z += 0.3; // Slightly forward (assuming TV faces forward)
        return fallbackPosition;
    }

    /**
     * Get the TV model
     * @returns {THREE.Object3D|null} TV model
     */
    getModel() {
        return this.model;
    }

    /**
     * Dispose of the TV
     */
    dispose() {
        // Remove spawn light
        if (this.spawnLight) {
            this.scene.remove(this.spawnLight);
            this.spawnLight = null;
        }

        if (this.model) {
            this.scene.remove(this.model);
            if (this.model.traverse) {
                this.model.traverse((child) => {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        }
    }
}
