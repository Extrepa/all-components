/**
 * TextureManager - Texture loading, unloading, and pooling
 *
 * Manages texture memory and optimization
 */
import * as THREE from 'three';

export class TextureManager {
    /**
     * Create a new TextureManager
     * @param {Object} config - Configuration
     * @param {number} config.maxTextures - Maximum number of textures (default: 50)
     * @param {boolean} config.enablePooling - Enable texture pooling (default: true)
     */
    constructor(config = {}) {
        this.config = {
            maxTextures: config.maxTextures || 50,
            enablePooling: config.enablePooling !== false,
        };

        // Texture storage: Map<url, texture>
        this.textures = new Map();

        // Texture pool (for reuse)
        this.texturePool = new Map(); // Map<size, Array<texture>>

        // Statistics
        this.stats = {
            loaded: 0,
            unloaded: 0,
            pooled: 0,
            reused: 0,
        };
    }

    /**
     * Load a texture
     * @param {string} url - Texture URL
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.Texture>} Resolves with loaded texture
     */
    async loadTexture(url, options = {}) {
        // Check if already loaded
        if (this.textures.has(url)) {
            return this.textures.get(url);
        }

        // Check pool for reusable texture
        if (this.config.enablePooling) {
            const pooled = this.getFromPool(options.width, options.height);
            if (pooled) {
                // Reuse pooled texture
                const loader = new THREE.TextureLoader();
                loader.load(url, (texture) => {
                    // Update pooled texture
                    pooled.image = texture.image;
                    pooled.needsUpdate = true;
                });
                this.textures.set(url, pooled);
                this.stats.reused++;
                return pooled;
            }
        }

        // Load new texture
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (texture) => {
                    // Configure texture
                    if (options.wrapS !== undefined) {
                        texture.wrapS = options.wrapS;
                    }
                    if (options.wrapT !== undefined) {
                        texture.wrapT = options.wrapT;
                    }
                    if (options.minFilter !== undefined) {
                        texture.minFilter = options.minFilter;
                    }
                    if (options.magFilter !== undefined) {
                        texture.magFilter = options.magFilter;
                    }
                    if (options.format !== undefined) {
                        texture.format = options.format;
                    }

                    this.textures.set(url, texture);
                    this.stats.loaded++;

                    // Check limit
                    if (this.textures.size > this.config.maxTextures) {
                        this.evictOldest();
                    }

                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    /**
     * Unload a texture
     * @param {string} url - Texture URL
     * @param {boolean} pool - Whether to pool the texture for reuse (default: true)
     */
    unloadTexture(url, pool = true) {
        const texture = this.textures.get(url);
        if (!texture) {
            return;
        }

        this.textures.delete(url);
        this.stats.unloaded++;

        if (pool && this.config.enablePooling) {
            this.addToPool(texture);
        } else {
            texture.dispose();
        }
    }

    /**
     * Get texture from pool
     * @param {number} width - Texture width
     * @param {number} height - Texture height
     * @returns {THREE.Texture|null} Pooled texture, or null if none available
     * @private
     */
    getFromPool(width, height) {
        if (!this.config.enablePooling) {
            return null;
        }

        const sizeKey = `${width}x${height}`;
        const pool = this.texturePool.get(sizeKey);

        if (pool && pool.length > 0) {
            const texture = pool.pop();
            this.stats.pooled--;
            return texture;
        }

        return null;
    }

    /**
     * Add texture to pool
     * @param {THREE.Texture} texture - Texture to pool
     * @private
     */
    addToPool(texture) {
        if (!this.config.enablePooling) {
            texture.dispose();
            return;
        }

        const sizeKey = `${texture.image?.width || 0}x${texture.image?.height || 0}`;

        if (!this.texturePool.has(sizeKey)) {
            this.texturePool.set(sizeKey, []);
        }

        // Clear texture data but keep structure
        texture.image = null;
        texture.needsUpdate = true;

        this.texturePool.get(sizeKey).push(texture);
        this.stats.pooled++;
    }

    /**
     * Evict oldest texture
     * @private
     */
    evictOldest() {
        if (this.textures.size === 0) {
            return;
        }

        // Simple eviction - remove first entry
        const firstKey = this.textures.keys().next().value;
        this.unloadTexture(firstKey, false);
    }

    /**
     * Clear all textures
     */
    clear() {
        for (const [url, texture] of this.textures.entries()) {
            texture.dispose();
        }
        this.textures.clear();

        // Clear pool
        for (const pool of this.texturePool.values()) {
            for (const texture of pool) {
                texture.dispose();
            }
        }
        this.texturePool.clear();
    }

    /**
     * Get texture
     * @param {string} url - Texture URL
     * @returns {THREE.Texture|null} Texture, or null if not loaded
     */
    getTexture(url) {
        return this.textures.get(url) || null;
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            loadedTextures: this.textures.size,
            pooledTextures: Array.from(this.texturePool.values()).reduce(
                (sum, pool) => sum + pool.length,
                0
            ),
        };
    }
}
