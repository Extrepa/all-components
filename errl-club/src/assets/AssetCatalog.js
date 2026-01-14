/**
 * AssetCatalog - Comprehensive asset catalog with search, filtering, and attribution
 *
 * Maintains a searchable catalog of all assets with:
 * - Complete asset inventory
 * - Usage tracking
 * - Dependency management
 * - License compliance
 * - Attribution report generation
 * - Search and filtering capabilities
 */

import { AssetRegistry } from './AssetRegistry.js';

export class AssetCatalog {
    /**
     * Create a new AssetCatalog
     * @param {AssetRegistry} assetRegistry - AssetRegistry instance
     */
    constructor(assetRegistry = null) {
        this.registry = assetRegistry || new AssetRegistry();

        // Catalog views
        this.views = {
            byType: new Map(),
            byCategory: new Map(),
            byLicense: new Map(),
            bySource: new Map(),
        };

        // Update views
        this.updateViews();
    }

    /**
     * Add asset to catalog (delegates to registry)
     * @param {string} assetId - Asset identifier
     * @param {Object} metadata - Asset metadata
     * @returns {boolean} True if added successfully
     */
    addAsset(assetId, metadata) {
        const success = this.registry.register(assetId, metadata);
        if (success) {
            this.updateViews();
        }
        return success;
    }

    /**
     * Get asset from catalog
     * @param {string} assetId - Asset identifier
     * @returns {Object|null} Asset metadata
     */
    getAsset(assetId) {
        return this.registry.get(assetId);
    }

    /**
     * Search assets
     * @param {string} query - Search query
     * @param {Object} filters - Search filters
     * @param {string} filters.type - Filter by asset type
     * @param {string} filters.category - Filter by category
     * @param {string} filters.license - Filter by license
     * @param {string} filters.source - Filter by source
     * @returns {Array<Object>} Array of matching assets
     */
    search(query = '', filters = {}) {
        let results = this.registry.search(query);

        // Apply filters
        if (filters.type) {
            results = results.filter((asset) => asset.type === filters.type);
        }

        if (filters.category) {
            results = results.filter((asset) => asset.category === filters.category);
        }

        if (filters.license) {
            results = results.filter((asset) =>
                asset.license.toLowerCase().includes(filters.license.toLowerCase())
            );
        }

        if (filters.source) {
            results = results.filter((asset) =>
                asset.source.toLowerCase().includes(filters.source.toLowerCase())
            );
        }

        if (filters.tags && Array.isArray(filters.tags)) {
            results = results.filter((asset) =>
                filters.tags.some((tag) => asset.tags.includes(tag))
            );
        }

        return results;
    }

    /**
     * Get all assets by type
     * @param {string} type - Asset type
     * @returns {Array<Object>} Array of assets
     */
    getByType(type) {
        return this.registry.getByType(type);
    }

    /**
     * Get all assets by category
     * @param {string} category - Asset category
     * @returns {Array<Object>} Array of assets
     */
    getByCategory(category) {
        return this.registry.getByCategory(category);
    }

    /**
     * Get all assets by license
     * @param {string} license - License type
     * @returns {Array<Object>} Array of assets
     */
    getByLicense(license) {
        return this.views.byLicense.get(license) || [];
    }

    /**
     * Get all assets by source
     * @param {string} source - Source/author
     * @returns {Array<Object>} Array of assets
     */
    getBySource(source) {
        return this.views.bySource.get(source) || [];
    }

    /**
     * Get asset dependencies
     * @param {string} assetId - Asset identifier
     * @returns {Array<Object>} Array of dependency assets
     */
    getDependencies(assetId) {
        const asset = this.getAsset(assetId);
        if (!asset || !asset.dependencies) {
            return [];
        }

        return asset.dependencies
            .map((depId) => this.getAsset(depId))
            .filter((dep) => dep !== null);
    }

    /**
     * Get assets that depend on this asset
     * @param {string} assetId - Asset identifier
     * @returns {Array<Object>} Array of dependent assets
     */
    getDependents(assetId) {
        const allAssets = this.registry.getAll();
        return allAssets.filter((asset) => asset.dependencies.includes(assetId));
    }

    /**
     * Track asset usage
     * @param {string} assetId - Asset identifier
     * @param {string} location - Code location where asset is used
     * @returns {boolean} True if tracked successfully
     */
    trackUsage(assetId, location) {
        return this.registry.addUsage(assetId, location);
    }

    /**
     * Get usage statistics for asset
     * @param {string} assetId - Asset identifier
     * @returns {Object} Usage statistics
     */
    getUsageStats(assetId) {
        const asset = this.getAsset(assetId);
        if (!asset) {
            return null;
        }

        return {
            assetId,
            usageCount: asset.usedIn.length,
            locations: asset.usedIn,
            dependents: this.getDependents(assetId).length,
        };
    }

    /**
     * Generate attribution report
     * @param {Object} options - Report options
     * @param {Array<string>} options.licenses - Filter by licenses
     * @param {Array<string>} options.sources - Filter by sources
     * @returns {Object} Attribution report
     */
    generateAttributionReport(options = {}) {
        const allAssets = this.registry.getAll();
        const report = {
            generatedAt: new Date().toISOString(),
            totalAssets: allAssets.length,
            byLicense: {},
            bySource: {},
            assets: [],
        };

        // Filter assets if needed
        let filteredAssets = allAssets;
        if (options.licenses && options.licenses.length > 0) {
            filteredAssets = filteredAssets.filter((asset) =>
                options.licenses.some((license) =>
                    asset.license.toLowerCase().includes(license.toLowerCase())
                )
            );
        }

        if (options.sources && options.sources.length > 0) {
            filteredAssets = filteredAssets.filter((asset) =>
                options.sources.some((source) =>
                    asset.source.toLowerCase().includes(source.toLowerCase())
                )
            );
        }

        // Group by license
        filteredAssets.forEach((asset) => {
            const license = asset.license || 'Unknown';
            if (!report.byLicense[license]) {
                report.byLicense[license] = [];
            }
            report.byLicense[license].push({
                id: asset.id,
                name: asset.id,
                source: asset.source,
                path: asset.path,
            });
        });

        // Group by source
        filteredAssets.forEach((asset) => {
            const source = asset.source || 'Unknown';
            if (!report.bySource[source]) {
                report.bySource[source] = [];
            }
            report.bySource[source].push({
                id: asset.id,
                name: asset.id,
                license: asset.license,
                path: asset.path,
            });
        });

        // Add all assets
        report.assets = filteredAssets.map((asset) => ({
            id: asset.id,
            type: asset.type,
            license: asset.license,
            source: asset.source,
            path: asset.path,
            description: asset.description,
        }));

        return report;
    }

    /**
     * Generate markdown attribution report
     * @param {Object} options - Report options
     * @returns {string} Markdown formatted report
     */
    generateAttributionMarkdown(options = {}) {
        const report = this.generateAttributionReport(options);
        let markdown = '# Asset Attribution Report\n\n';
        markdown += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n`;
        markdown += `Total Assets: ${report.totalAssets}\n\n`;

        // By License
        markdown += '## By License\n\n';
        Object.entries(report.byLicense).forEach(([license, assets]) => {
            markdown += `### ${license}\n\n`;
            assets.forEach((asset) => {
                markdown += `- **${asset.name}** - ${asset.source}\n`;
            });
            markdown += '\n';
        });

        // By Source
        markdown += '## By Source\n\n';
        Object.entries(report.bySource).forEach(([source, assets]) => {
            markdown += `### ${source}\n\n`;
            assets.forEach((asset) => {
                markdown += `- **${asset.name}** - ${asset.license}\n`;
            });
            markdown += '\n';
        });

        // Complete List
        markdown += '## Complete Asset List\n\n';
        report.assets.forEach((asset) => {
            markdown += `### ${asset.id}\n`;
            markdown += `- **Type**: ${asset.type}\n`;
            markdown += `- **License**: ${asset.license}\n`;
            markdown += `- **Source**: ${asset.source}\n`;
            markdown += `- **Path**: ${asset.path}\n`;
            if (asset.description) {
                markdown += `- **Description**: ${asset.description}\n`;
            }
            markdown += '\n';
        });

        return markdown;
    }

    /**
     * Get catalog statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const registryStats = this.registry.getStats();
        const catalogStats = {
            ...registryStats,
            byLicense: {},
            bySource: {},
            totalDependencies: 0,
            averageDependencies: 0,
        };

        // Calculate license and source stats
        const allAssets = this.registry.getAll();
        allAssets.forEach((asset) => {
            const license = asset.license || 'Unknown';
            catalogStats.byLicense[license] = (catalogStats.byLicense[license] || 0) + 1;

            const source = asset.source || 'Unknown';
            catalogStats.bySource[source] = (catalogStats.bySource[source] || 0) + 1;

            catalogStats.totalDependencies += asset.dependencies?.length || 0;
        });

        if (allAssets.length > 0) {
            catalogStats.averageDependencies = catalogStats.totalDependencies / allAssets.length;
        }

        return catalogStats;
    }

    /**
     * Export catalog to JSON
     * @returns {string} JSON string
     */
    export() {
        return this.registry.export();
    }

    /**
     * Import catalog from JSON
     * @param {string} jsonString - JSON string
     * @returns {boolean} True if imported successfully
     */
    import(jsonString) {
        const success = this.registry.import(jsonString);
        if (success) {
            this.updateViews();
        }
        return success;
    }

    /**
     * Update catalog views
     * @private
     */
    updateViews() {
        // Clear views
        this.views.byLicense.clear();
        this.views.bySource.clear();

        // Rebuild views
        const allAssets = this.registry.getAll();
        allAssets.forEach((asset) => {
            // By license
            const license = asset.license || 'Unknown';
            if (!this.views.byLicense.has(license)) {
                this.views.byLicense.set(license, []);
            }
            this.views.byLicense.get(license).push(asset);

            // By source
            const source = asset.source || 'Unknown';
            if (!this.views.bySource.has(source)) {
                this.views.bySource.set(source, []);
            }
            this.views.bySource.get(source).push(asset);
        });
    }

    /**
     * Get all assets
     * @returns {Array<Object>} Array of all assets
     */
    getAll() {
        return this.registry.getAll();
    }
}
