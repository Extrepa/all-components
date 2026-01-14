/**
 * AssetScanner - Automated asset directory scanning and catalog generation
 *
 * Scans asset directories and automatically:
 * - Discovers assets
 * - Extracts metadata
 * - Validates assets
 * - Registers in AssetRegistry
 * - Updates AssetCatalog
 */

import { AssetRegistry } from './AssetRegistry.js';
import { AssetValidator } from './AssetValidator.js';
import { AssetCatalog } from './AssetCatalog.js';

export class AssetScanner {
    /**
     * Create a new AssetScanner
     * @param {AssetRegistry} assetRegistry - AssetRegistry instance
     * @param {AssetValidator} assetValidator - AssetValidator instance
     * @param {AssetCatalog} assetCatalog - AssetCatalog instance
     */
    constructor(assetRegistry = null, assetValidator = null, assetCatalog = null) {
        this.registry = assetRegistry || new AssetRegistry();
        this.validator = assetValidator || new AssetValidator();
        this.catalog = assetCatalog || new AssetCatalog(this.registry);

        // Scan results
        this.scanResults = {
            discovered: [],
            registered: [],
            errors: [],
            warnings: [],
        };
    }

    /**
     * Scan asset directory
     * @param {string} basePath - Base path to scan (e.g., '/models', '/textures')
     * @param {Object} options - Scan options
     * @param {string} options.assetType - Asset type to scan for
     * @param {Array<string>} options.extensions - File extensions to include
     * @returns {Promise<Object>} Scan results
     */
    async scanDirectory(basePath, options = {}) {
        const results = {
            discovered: [],
            registered: [],
            errors: [],
            warnings: [],
        };

        // Note: Browser-based scanning is limited
        // This is a placeholder for server-side or build-time scanning
        // In browser, we rely on manual registration or build-time tools

        console.warn(
            'AssetScanner: Browser-based directory scanning is limited. Use build-time tools or manual registration.'
        );

        return results;
    }

    /**
     * Scan and register asset from file info
     * @param {Object} fileInfo - File information
     * @param {string} fileInfo.path - File path
     * @param {string} fileInfo.type - Asset type
     * @param {number} fileInfo.size - File size in bytes
     * @param {Object} fileInfo.metadata - Additional metadata
     * @returns {Promise<Object>} Registration result
     */
    async scanAndRegister(fileInfo) {
        const { path, type, size, metadata = {} } = fileInfo;

        // Extract format from path
        const format = path.split('.').pop().toLowerCase();

        // Extract category from path
        const pathParts = path.split('/');
        const category = pathParts[pathParts.length - 2] || 'uncategorized';

        // Extract asset ID from filename
        const filename = pathParts[pathParts.length - 1];
        const assetId = filename.replace(/\.[^/.]+$/, ''); // Remove extension

        // Validate asset
        const validationResult = this.validator.validate({
            type,
            path,
            size,
            format,
            license: metadata.license || 'unknown',
            category,
            metadata,
        });

        if (!validationResult.valid) {
            return {
                success: false,
                assetId,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
            };
        }

        // Register asset
        const registered = this.registry.register(assetId, {
            type,
            path,
            category,
            size,
            format,
            license: metadata.license || 'unknown',
            source: metadata.source || 'unknown',
            description: metadata.description || '',
            tags: metadata.tags || [],
            dependencies: metadata.dependencies || [],
        });

        if (registered) {
            // Track usage if provided
            if (metadata.usedIn) {
                metadata.usedIn.forEach((location) => {
                    this.catalog.trackUsage(assetId, location);
                });
            }

            return {
                success: true,
                assetId,
                warnings: validationResult.warnings,
            };
        }

        return {
            success: false,
            assetId,
            errors: ['Failed to register asset'],
        };
    }

    /**
     * Scan multiple assets
     * @param {Array<Object>} fileInfos - Array of file information objects
     * @returns {Promise<Object>} Scan results
     */
    async scanMultiple(fileInfos) {
        const results = {
            discovered: [],
            registered: [],
            errors: [],
            warnings: [],
        };

        for (const fileInfo of fileInfos) {
            const result = await this.scanAndRegister(fileInfo);
            results.discovered.push(fileInfo.path);

            if (result.success) {
                results.registered.push(result.assetId);
            } else {
                results.errors.push({
                    path: fileInfo.path,
                    errors: result.errors,
                });
            }

            if (result.warnings && result.warnings.length > 0) {
                results.warnings.push({
                    path: fileInfo.path,
                    warnings: result.warnings,
                });
            }
        }

        this.scanResults = results;
        return results;
    }

    /**
     * Generate asset catalog from registry
     * @returns {Object} Catalog data
     */
    generateCatalog() {
        const allAssets = this.registry.getAll();
        const catalog = {
            generatedAt: new Date().toISOString(),
            totalAssets: allAssets.length,
            byType: {},
            byCategory: {},
            byLicense: {},
            assets: allAssets.map((asset) => ({
                id: asset.id,
                type: asset.type,
                path: asset.path,
                category: asset.category,
                size: asset.size,
                format: asset.format,
                license: asset.license,
                source: asset.source,
                description: asset.description,
                tags: asset.tags,
                dependencies: asset.dependencies,
                usedIn: asset.usedIn,
            })),
        };

        // Group by type
        allAssets.forEach((asset) => {
            if (!catalog.byType[asset.type]) {
                catalog.byType[asset.type] = [];
            }
            catalog.byType[asset.type].push(asset.id);
        });

        // Group by category
        allAssets.forEach((asset) => {
            if (!catalog.byCategory[asset.category]) {
                catalog.byCategory[asset.category] = [];
            }
            catalog.byCategory[asset.category].push(asset.id);
        });

        // Group by license
        allAssets.forEach((asset) => {
            const license = asset.license || 'Unknown';
            if (!catalog.byLicense[license]) {
                catalog.byLicense[license] = [];
            }
            catalog.byLicense[license].push(asset.id);
        });

        return catalog;
    }

    /**
     * Get scan results
     * @returns {Object} Scan results
     */
    getResults() {
        return { ...this.scanResults };
    }

    /**
     * Clear scan results
     */
    clearResults() {
        this.scanResults = {
            discovered: [],
            registered: [],
            errors: [],
            warnings: [],
        };
    }
}
