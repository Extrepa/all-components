/**
 * AssetLoader - Centralized asset loading for models, textures, and audio
 *
 * Supports async loading with progress tracking and error handling
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TextureLoader } from 'three';
import { AudioLoader } from 'three';

export class AssetLoader {
    /**
     * Create a new AssetLoader
     */
    constructor() {
        // Loaders
        this.gltfLoader = new GLTFLoader();
        this.objLoader = new OBJLoader();
        this.fbxLoader = new FBXLoader();
        this.textureLoader = new TextureLoader();
        this.audioLoader = new AudioLoader();

        // Loading state
        this.loading = false;
        this.loadedAssets = new Map(); // Map<url, asset>
        this.loadingPromises = new Map(); // Map<url, Promise> - prevent duplicate loads

        // Progress tracking
        this.onProgress = null;
        this.totalAssets = 0;
        this.loadedCount = 0;
    }

    /**
     * Load a 3D model (supports GLTF/GLB, OBJ, FBX)
     * @param {string} url - Model URL
     * @param {Object} options - Loading options
     * @param {string} options.format - Force format ('gltf', 'obj', 'fbx', or 'auto' for auto-detect)
     * @returns {Promise<THREE.Group>} Resolves with loaded model
     */
    async loadModel(url, options = {}) {
        // Check cache
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        // Auto-detect format from file extension
        let format = options.format || 'auto';
        if (format === 'auto') {
            const ext = url.toLowerCase().split('.').pop();
            if (['gltf', 'glb'].includes(ext)) {
                format = 'gltf';
            } else if (ext === 'obj') {
                format = 'obj';
            } else if (ext === 'fbx') {
                format = 'fbx';
            } else {
                format = 'gltf';
            } // Default to GLTF
        }

        // Start loading based on format
        const promise = new Promise((resolve, reject) => {
            if (format === 'gltf') {
                this.gltfLoader.load(
                    url,
                    (gltf) => {
                        const model = gltf.scene;
                        this.loadedAssets.set(url, model);
                        this.loadingPromises.delete(url);
                        this.updateProgress();
                        resolve(model);
                    },
                    (progress) => {
                        if (this.onProgress) {
                            this.onProgress(url, progress.loaded / progress.total);
                        }
                    },
                    (error) => {
                        this.loadingPromises.delete(url);
                        reject(error);
                    }
                );
            } else if (format === 'obj') {
                this.objLoader.load(
                    url,
                    (object) => {
                        this.loadedAssets.set(url, object);
                        this.loadingPromises.delete(url);
                        this.updateProgress();
                        resolve(object);
                    },
                    (progress) => {
                        if (this.onProgress && progress.total > 0) {
                            this.onProgress(url, progress.loaded / progress.total);
                        }
                    },
                    (error) => {
                        this.loadingPromises.delete(url);
                        reject(error);
                    }
                );
            } else if (format === 'fbx') {
                this.fbxLoader.load(
                    url,
                    (object) => {
                        this.loadedAssets.set(url, object);
                        this.loadingPromises.delete(url);
                        this.updateProgress();
                        resolve(object);
                    },
                    (progress) => {
                        if (this.onProgress && progress.total > 0) {
                            this.onProgress(url, progress.loaded / progress.total);
                        }
                    },
                    (error) => {
                        this.loadingPromises.delete(url);
                        reject(error);
                    }
                );
            } else {
                reject(new Error(`Unsupported model format: ${format}`));
            }
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * Load a texture
     * @param {string} url - Texture URL
     * @returns {Promise<THREE.Texture>} Resolves with loaded texture
     */
    async loadTexture(url) {
        // Check cache
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        // Start loading
        const promise = new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    this.loadedAssets.set(url, texture);
                    this.loadingPromises.delete(url);
                    this.updateProgress();
                    resolve(texture);
                },
                undefined,
                (error) => {
                    this.loadingPromises.delete(url);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * Load an audio file
     * @param {string} url - Audio URL
     * @returns {Promise<AudioBuffer>} Resolves with loaded audio buffer
     */
    async loadAudio(url) {
        // Check cache
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        // Start loading
        const promise = new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (audioBuffer) => {
                    this.loadedAssets.set(url, audioBuffer);
                    this.loadingPromises.delete(url);
                    this.updateProgress();
                    resolve(audioBuffer);
                },
                undefined,
                (error) => {
                    this.loadingPromises.delete(url);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * Load multiple assets
     * @param {Object} assets - Assets to load { models: [], textures: [], audio: [] }
     * @returns {Promise<Object>} Resolves with loaded assets
     */
    async loadAssets(assets) {
        this.totalAssets =
            (assets.models?.length || 0) +
            (assets.textures?.length || 0) +
            (assets.audio?.length || 0);
        this.loadedCount = 0;
        this.loading = true;

        const loaded = {
            models: {},
            textures: {},
            audio: {},
        };

        try {
            // Load models
            if (assets.models) {
                for (const { url, key } of assets.models) {
                    loaded.models[key] = await this.loadModel(url);
                }
            }

            // Load textures
            if (assets.textures) {
                for (const { url, key } of assets.textures) {
                    loaded.textures[key] = await this.loadTexture(url);
                }
            }

            // Load audio
            if (assets.audio) {
                for (const { url, key } of assets.audio) {
                    loaded.audio[key] = await this.loadAudio(url);
                }
            }

            this.loading = false;
            return loaded;
        } catch (error) {
            this.loading = false;
            throw error;
        }
    }

    /**
     * Update loading progress
     * @private
     */
    updateProgress() {
        this.loadedCount++;
        const progress = this.totalAssets > 0 ? this.loadedCount / this.totalAssets : 0;

        if (this.onProgress) {
            this.onProgress(null, progress);
        }
    }

    /**
     * Get loaded asset
     * @param {string} url - Asset URL
     * @returns {Object|null} Loaded asset, or null if not loaded
     */
    getAsset(url) {
        return this.loadedAssets.get(url) || null;
    }

    /**
     * Check if asset is loaded
     * @param {string} url - Asset URL
     * @returns {boolean} True if loaded
     */
    isLoaded(url) {
        return this.loadedAssets.has(url);
    }

    /**
     * Clear asset cache
     * @param {string} url - Optional URL to clear specific asset, or clear all if not provided
     */
    clearCache(url = null) {
        if (url) {
            const asset = this.loadedAssets.get(url);
            if (asset) {
                // Dispose of asset if it has dispose method
                if (asset.dispose) {
                    asset.dispose();
                }
                if (asset.geometry) {
                    asset.geometry.dispose();
                }
                if (asset.material) {
                    if (Array.isArray(asset.material)) {
                        asset.material.forEach((mat) => mat.dispose());
                    } else {
                        asset.material.dispose();
                    }
                }
            }
            this.loadedAssets.delete(url);
        } else {
            // Clear all assets
            for (const [url, asset] of this.loadedAssets.entries()) {
                if (asset.dispose) {
                    asset.dispose();
                }
                if (asset.geometry) {
                    asset.geometry.dispose();
                }
                if (asset.material) {
                    if (Array.isArray(asset.material)) {
                        asset.material.forEach((mat) => mat.dispose());
                    } else {
                        asset.material.dispose();
                    }
                }
            }
            this.loadedAssets.clear();
        }
    }
}
