/**
 * AssetRegistry - Centralized asset metadata registry
 *
 * Tracks all assets in the project with metadata including:
 * - Asset type (3D model, texture, audio, animation, shader, UI)
 * - Size and format information
 * - Location and path
 * - Dependencies and relationships
 * - License information
 * - Usage locations in code
 * - Performance metrics
 */

export class AssetRegistry {
    /**
     * Create a new AssetRegistry
     */
    constructor() {
        // Main registry: Map<assetId, assetMetadata>
        this.registry = new Map();

        // Indexes for fast lookup
        this.byType = new Map(); // Map<type, Set<assetId>>
        this.byPath = new Map(); // Map<path, assetId>
        this.byCategory = new Map(); // Map<category, Set<assetId>>

        // Statistics
        this.stats = {
            totalAssets: 0,
            byType: {},
            totalSize: 0,
            lastUpdated: null,
        };

        // Initialize type indexes
        const assetTypes = ['3d-model', 'texture', 'audio', 'animation', 'shader', 'ui-asset'];
        assetTypes.forEach((type) => {
            this.byType.set(type, new Set());
            this.stats.byType[type] = 0;
        });

        // Load existing registry from storage if available
        this.load();
    }

    /**
     * Register an asset
     * @param {string} assetId - Unique asset identifier
     * @param {Object} metadata - Asset metadata
     * @param {string} metadata.type - Asset type (3d-model, texture, audio, etc.)
     * @param {string} metadata.path - Asset file path
     * @param {string} metadata.category - Asset category (props, environment, etc.)
     * @param {number} metadata.size - File size in bytes
     * @param {string} metadata.format - File format (glb, png, ogg, etc.)
     * @param {string} metadata.license - License information
     * @param {string} metadata.source - Source/author information
     * @param {Array<string>} metadata.dependencies - Asset dependencies
     * @param {Array<string>} metadata.usedIn - Code locations where asset is used
     * @param {Object} metadata.performance - Performance metrics
     * @returns {boolean} True if registered successfully
     */
    register(assetId, metadata) {
        if (!assetId || !metadata) {
            console.warn('AssetRegistry: Invalid asset ID or metadata');
            return false;
        }

        // Validate required fields
        if (!metadata.type || !metadata.path) {
            console.warn('AssetRegistry: Missing required fields (type, path)');
            return false;
        }

        // Check if already registered
        if (this.registry.has(assetId)) {
            console.warn(`AssetRegistry: Asset ${assetId} already registered, updating...`);
        }

        // Create asset entry
        const assetEntry = {
            id: assetId,
            type: metadata.type,
            path: metadata.path,
            category: metadata.category || 'uncategorized',
            size: metadata.size || 0,
            format: metadata.format || 'unknown',
            license: metadata.license || 'unknown',
            source: metadata.source || 'unknown',
            dependencies: metadata.dependencies || [],
            usedIn: metadata.usedIn || [],
            performance: metadata.performance || {},
            tags: metadata.tags || [],
            description: metadata.description || '',
            createdAt: metadata.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Update registry
        this.registry.set(assetId, assetEntry);

        // Update indexes
        if (!this.byType.has(assetEntry.type)) {
            this.byType.set(assetEntry.type, new Set());
        }
        this.byType.get(assetEntry.type).add(assetId);

        this.byPath.set(assetEntry.path, assetId);

        if (!this.byCategory.has(assetEntry.category)) {
            this.byCategory.set(assetEntry.category, new Set());
        }
        this.byCategory.get(assetEntry.category).add(assetId);

        // Update statistics
        this.updateStats();

        // Save to storage
        this.save();

        return true;
    }

    /**
     * Get asset metadata by ID
     * @param {string} assetId - Asset identifier
     * @returns {Object|null} Asset metadata or null if not found
     */
    get(assetId) {
        return this.registry.get(assetId) || null;
    }

    /**
     * Get asset by path
     * @param {string} path - Asset file path
     * @returns {Object|null} Asset metadata or null if not found
     */
    getByPath(path) {
        const assetId = this.byPath.get(path);
        return assetId ? this.get(assetId) : null;
    }

    /**
     * Get all assets of a specific type
     * @param {string} type - Asset type
     * @returns {Array<Object>} Array of asset metadata
     */
    getByType(type) {
        const assetIds = this.byType.get(type) || new Set();
        return Array.from(assetIds)
            .map((id) => this.get(id))
            .filter((asset) => asset !== null);
    }

    /**
     * Get all assets in a category
     * @param {string} category - Asset category
     * @returns {Array<Object>} Array of asset metadata
     */
    getByCategory(category) {
        const assetIds = this.byCategory.get(category) || new Set();
        return Array.from(assetIds)
            .map((id) => this.get(id))
            .filter((asset) => asset !== null);
    }

    /**
     * Search assets by query
     * @param {string} query - Search query
     * @returns {Array<Object>} Array of matching asset metadata
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];

        for (const asset of this.registry.values()) {
            const searchableText = [
                asset.id,
                asset.path,
                asset.category,
                asset.description,
                asset.source,
                ...asset.tags,
            ]
                .join(' ')
                .toLowerCase();

            if (searchableText.includes(lowerQuery)) {
                results.push(asset);
            }
        }

        return results;
    }

    /**
     * Update asset metadata
     * @param {string} assetId - Asset identifier
     * @param {Object} updates - Metadata updates
     * @returns {boolean} True if updated successfully
     */
    update(assetId, updates) {
        const asset = this.get(assetId);
        if (!asset) {
            console.warn(`AssetRegistry: Asset ${assetId} not found`);
            return false;
        }

        // Update fields
        Object.assign(asset, updates);
        asset.updatedAt = new Date().toISOString();

        // Update indexes if type or category changed
        if (updates.type && updates.type !== asset.type) {
            this.byType.get(asset.type)?.delete(assetId);
            if (!this.byType.has(updates.type)) {
                this.byType.set(updates.type, new Set());
            }
            this.byType.get(updates.type).add(assetId);
        }

        if (updates.category && updates.category !== asset.category) {
            this.byCategory.get(asset.category)?.delete(assetId);
            if (!this.byCategory.has(updates.category)) {
                this.byCategory.set(updates.category, new Set());
            }
            this.byCategory.get(updates.category).add(assetId);
        }

        if (updates.path && updates.path !== asset.path) {
            this.byPath.delete(asset.path);
            this.byPath.set(updates.path, assetId);
        }

        // Update statistics
        this.updateStats();

        // Save to storage
        this.save();

        return true;
    }

    /**
     * Add usage location to asset
     * @param {string} assetId - Asset identifier
     * @param {string} location - Code location (file path, function name, etc.)
     * @returns {boolean} True if added successfully
     */
    addUsage(assetId, location) {
        const asset = this.get(assetId);
        if (!asset) {
            return false;
        }

        if (!asset.usedIn.includes(location)) {
            asset.usedIn.push(location);
            asset.updatedAt = new Date().toISOString();
            this.save();
        }

        return true;
    }

    /**
     * Remove asset from registry
     * @param {string} assetId - Asset identifier
     * @returns {boolean} True if removed successfully
     */
    unregister(assetId) {
        const asset = this.get(assetId);
        if (!asset) {
            return false;
        }

        // Remove from indexes
        this.byType.get(asset.type)?.delete(assetId);
        this.byCategory.get(asset.category)?.delete(assetId);
        this.byPath.delete(asset.path);

        // Remove from registry
        this.registry.delete(assetId);

        // Update statistics
        this.updateStats();

        // Save to storage
        this.save();

        return true;
    }

    /**
     * Get all registered assets
     * @returns {Array<Object>} Array of all asset metadata
     */
    getAll() {
        return Array.from(this.registry.values());
    }

    /**
     * Get registry statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Update statistics
     * @private
     */
    updateStats() {
        this.stats.totalAssets = this.registry.size;
        this.stats.totalSize = 0;

        // Reset type counts
        Object.keys(this.stats.byType).forEach((type) => {
            this.stats.byType[type] = 0;
        });

        // Calculate statistics
        for (const asset of this.registry.values()) {
            this.stats.totalSize += asset.size || 0;
            if (this.stats.byType[asset.type] !== undefined) {
                this.stats.byType[asset.type]++;
            }
        }

        this.stats.lastUpdated = new Date().toISOString();
    }

    /**
     * Export registry to JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify(
            {
                assets: Array.from(this.registry.values()),
                stats: this.stats,
                exportedAt: new Date().toISOString(),
            },
            null,
            2
        );
    }

    /**
     * Import registry from JSON
     * @param {string} jsonString - JSON string
     * @returns {boolean} True if imported successfully
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.assets && Array.isArray(data.assets)) {
                // Clear existing registry
                this.registry.clear();
                this.byType.clear();
                this.byPath.clear();
                this.byCategory.clear();

                // Re-register all assets
                data.assets.forEach((asset) => {
                    const { id, ...metadata } = asset;
                    this.register(id, metadata);
                });

                return true;
            }
        } catch (error) {
            console.error('AssetRegistry: Failed to import:', error);
        }
        return false;
    }

    /**
     * Save registry to localStorage
     * @private
     */
    save() {
        try {
            const data = {
                assets: Array.from(this.registry.values()),
                stats: this.stats,
            };
            localStorage.setItem('errl_club_asset_registry', JSON.stringify(data));
        } catch (error) {
            console.warn('AssetRegistry: Failed to save to localStorage:', error);
        }
    }

    /**
     * Load registry from localStorage
     * @private
     */
    load() {
        try {
            const stored = localStorage.getItem('errl_club_asset_registry');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.assets && Array.isArray(data.assets)) {
                    data.assets.forEach((asset) => {
                        const { id, ...metadata } = asset;
                        this.register(id, metadata);
                    });
                }
            }
        } catch (error) {
            console.warn('AssetRegistry: Failed to load from localStorage:', error);
        }
    }

    /**
     * Clear all registry data
     */
    clear() {
        this.registry.clear();
        this.byType.clear();
        this.byPath.clear();
        this.byCategory.clear();
        this.updateStats();
        this.save();
    }
}
