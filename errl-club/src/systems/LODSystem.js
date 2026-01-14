/**
 * LODSystem - Level of Detail system for performance optimization
 *
 * Implements distance-based LOD switching for heavy assets
 * Creates simplified proxy meshes for far-away assets
 *
 * @class LODSystem
 */
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class LODSystem {
    /**
     * Create an LODSystem instance
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     */
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.lodObjects = new Map(); // Map<assetName, LODObject>
        this.enabled = true;
        this.lodDistances = {
            high: 0, // Always use high detail
            medium: 15, // Switch to medium at 15 units
            low: 30, // Switch to low at 30 units
        };
    }

    /**
     * Register an asset for LOD management
     * @param {string} name - Asset identifier
     * @param {THREE.Object3D} highDetailMesh - Full detail mesh
     * @param {Object} options - LOD options
     */
    registerAsset(name, highDetailMesh, options = {}) {
        if (!highDetailMesh) {
            return;
        }

        // Create simplified proxy meshes
        const mediumDetailMesh = this.createProxyMesh(highDetailMesh, 'medium');
        const lowDetailMesh = this.createProxyMesh(highDetailMesh, 'low');

        // Create LOD object
        const lodObject = {
            name,
            highDetail: highDetailMesh,
            mediumDetail: mediumDetailMesh,
            lowDetail: lowDetailMesh,
            currentLOD: 'high',
            position: highDetailMesh.position.clone(),
            boundingSphere: this.computeBoundingSphere(highDetailMesh),
            distances: options.distances || this.lodDistances,
        };

        // Initially show high detail, hide others
        highDetailMesh.visible = true;
        if (mediumDetailMesh) {
            mediumDetailMesh.visible = false;
        }
        if (lowDetailMesh) {
            lowDetailMesh.visible = false;
        }

        this.lodObjects.set(name, lodObject);
    }

    /**
     * Create a simplified proxy mesh for LOD
     * @param {THREE.Object3D} originalMesh - Original mesh
     * @param {string} level - LOD level ('medium' or 'low')
     * @returns {THREE.Mesh} Simplified mesh
     */
    createProxyMesh(originalMesh, level) {
        // Get bounding box
        const box = new THREE.Box3().setFromObject(originalMesh);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        let geometry;
        let material;

        if (level === 'medium') {
            // Medium detail: Box with emissive material
            geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            material = createMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.7,
            });
        } else {
            // Low detail: Simple sphere
            const radius = Math.max(size.x, size.y, size.z) / 2;
            geometry = new THREE.SphereGeometry(radius, 8, 8);
            material = createMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5,
            });
        }

        const proxyMesh = new THREE.Mesh(geometry, material);
        proxyMesh.position.copy(center);
        proxyMesh.userData.isLODProxy = true;
        proxyMesh.userData.lodLevel = level;
        proxyMesh.userData.originalAsset = originalMesh;

        // Add to scene but keep hidden initially
        this.scene.add(proxyMesh);

        return proxyMesh;
    }

    /**
     * Compute bounding sphere for distance calculations
     * @param {THREE.Object3D} object - Object to compute sphere for
     * @returns {THREE.Sphere} Bounding sphere
     */
    computeBoundingSphere(object) {
        const box = new THREE.Box3().setFromObject(object);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        return sphere;
    }

    /**
     * Update LOD based on camera distance
     * @param {THREE.Vector3} cameraPosition - Current camera position
     */
    update(cameraPosition) {
        if (!this.enabled) {
            return;
        }

        this.lodObjects.forEach((lodObject, name) => {
            // Calculate distance from camera to asset
            const distance = cameraPosition.distanceTo(lodObject.boundingSphere.center);

            // Determine which LOD to use
            let targetLOD = 'high';
            if (distance >= lodObject.distances.low) {
                targetLOD = 'low';
            } else if (distance >= lodObject.distances.medium) {
                targetLOD = 'medium';
            }

            // Switch LOD if needed
            if (targetLOD !== lodObject.currentLOD) {
                this.switchLOD(lodObject, targetLOD);
            }
        });
    }

    /**
     * Switch to a different LOD level
     * @param {Object} lodObject - LOD object
     * @param {string} targetLOD - Target LOD level
     */
    switchLOD(lodObject, targetLOD) {
        // Hide current LOD
        if (lodObject.currentLOD === 'high') {
            lodObject.highDetail.visible = false;
        } else if (lodObject.currentLOD === 'medium') {
            lodObject.mediumDetail.visible = false;
        } else if (lodObject.currentLOD === 'low') {
            lodObject.lowDetail.visible = false;
        }

        // Show target LOD
        if (targetLOD === 'high') {
            lodObject.highDetail.visible = true;
        } else if (targetLOD === 'medium') {
            lodObject.mediumDetail.visible = true;
        } else if (targetLOD === 'low') {
            lodObject.lowDetail.visible = true;
        }

        lodObject.currentLOD = targetLOD;
    }

    /**
     * Enable/disable LOD system
     * @param {boolean} enabled - Whether to enable LOD
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        // If disabling, show high detail for all
        if (!enabled) {
            this.lodObjects.forEach((lodObject) => {
                lodObject.highDetail.visible = true;
                if (lodObject.mediumDetail) {
                    lodObject.mediumDetail.visible = false;
                }
                if (lodObject.lowDetail) {
                    lodObject.lowDetail.visible = false;
                }
                lodObject.currentLOD = 'high';
            });
        }
    }

    /**
     * Set LOD distances
     * @param {Object} distances - Distance thresholds
     */
    setLODDistances(distances) {
        this.lodDistances = { ...this.lodDistances, ...distances };

        // Update all registered assets
        this.lodObjects.forEach((lodObject) => {
            lodObject.distances = { ...this.lodDistances, ...distances };
        });
    }

    /**
     * Get current LOD level for an asset
     * @param {string} name - Asset name
     * @returns {string} Current LOD level
     */
    getCurrentLOD(name) {
        const lodObject = this.lodObjects.get(name);
        return lodObject ? lodObject.currentLOD : 'high';
    }

    /**
     * Remove an asset from LOD management
     * @param {string} name - Asset name
     */
    unregisterAsset(name) {
        const lodObject = this.lodObjects.get(name);
        if (!lodObject) {
            return;
        }

        // Clean up proxy meshes
        if (lodObject.mediumDetail) {
            this.scene.remove(lodObject.mediumDetail);
            lodObject.mediumDetail.geometry.dispose();
            lodObject.mediumDetail.material.dispose();
        }
        if (lodObject.lowDetail) {
            this.scene.remove(lodObject.lowDetail);
            lodObject.lowDetail.geometry.dispose();
            lodObject.lowDetail.material.dispose();
        }

        this.lodObjects.delete(name);
    }

    /**
     * Clean up all LOD objects
     */
    dispose() {
        this.lodObjects.forEach((lodObject, name) => {
            this.unregisterAsset(name);
        });
        this.lodObjects.clear();
    }
}
