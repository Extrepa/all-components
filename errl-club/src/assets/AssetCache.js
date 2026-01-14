/**
 * AssetCache - Asset caching with memory management
 *
 * Implements LRU cache, size limits, and cleanup strategies
 */
export class AssetCache {
    /**
     * Create a new AssetCache
     * @param {Object} config - Configuration
     * @param {number} config.maxSize - Maximum cache size in MB (default: 500)
     * @param {number} config.maxEntries - Maximum number of entries (default: 100)
     */
    constructor(config = {}) {
        this.config = {
            maxSize: (config.maxSize || 500) * 1024 * 1024, // Convert MB to bytes
            maxEntries: config.maxEntries || 100,
        };

        // Cache storage: Map<key, {asset, size, lastAccessed, accessCount}>
        this.cache = new Map();

        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalSize: 0,
        };
    }

    /**
     * Get asset from cache
     * @param {string} key - Cache key
     * @returns {Object|null} Cached asset, or null if not found
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Update access info (LRU)
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        this.stats.hits++;

        return entry.asset;
    }

    /**
     * Set asset in cache
     * @param {string} key - Cache key
     * @param {Object} asset - Asset to cache
     * @param {number} size - Asset size in bytes (estimated)
     */
    set(key, asset, size = 0) {
        // Check if we need to evict
        this.evictIfNeeded(size);

        // Add to cache
        this.cache.set(key, {
            asset,
            size,
            lastAccessed: Date.now(),
            accessCount: 1,
        });

        this.stats.totalSize += size;
    }

    /**
     * Evict entries if cache is full
     * @param {number} requiredSize - Size needed for new entry
     * @private
     */
    evictIfNeeded(requiredSize) {
        // Check entry count limit
        while (this.cache.size >= this.config.maxEntries) {
            this.evictLRU();
        }

        // Check size limit
        while (this.stats.totalSize + requiredSize > this.config.maxSize && this.cache.size > 0) {
            this.evictLRU();
        }
    }

    /**
     * Evict least recently used entry
     * @private
     */
    evictLRU() {
        if (this.cache.size === 0) {
            return;
        }

        // Find least recently used
        let lruKey = null;
        let lruTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < lruTime) {
                lruTime = entry.lastAccessed;
                lruKey = key;
            }
        }

        if (lruKey) {
            const entry = this.cache.get(lruKey);
            this.stats.totalSize -= entry.size;

            // Dispose of asset if needed
            if (entry.asset && entry.asset.dispose) {
                entry.asset.dispose();
            }

            this.cache.delete(lruKey);
            this.stats.evictions++;
        }
    }

    /**
     * Remove asset from cache
     * @param {string} key - Cache key
     */
    remove(key) {
        const entry = this.cache.get(key);
        if (entry) {
            this.stats.totalSize -= entry.size;

            // Dispose of asset if needed
            if (entry.asset && entry.asset.dispose) {
                entry.asset.dispose();
            }

            this.cache.delete(key);
        }
    }

    /**
     * Clear entire cache
     */
    clear() {
        for (const [_key, entry] of this.cache.entries()) {
            if (entry.asset && entry.asset.dispose) {
                entry.asset.dispose();
            }
        }

        this.cache.clear();
        this.stats.totalSize = 0;
    }

    /**
     * Get cache statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.config.maxSize,
            maxEntries: this.config.maxEntries,
            hitRate:
                this.stats.hits + this.stats.misses > 0
                    ? this.stats.hits / (this.stats.hits + this.stats.misses)
                    : 0,
        };
    }

    /**
     * Get cache size in MB
     * @returns {number} Cache size in MB
     */
    getSizeMB() {
        return this.stats.totalSize / (1024 * 1024);
    }
}
