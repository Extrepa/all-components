/**
 * AssetValidator - Validates asset formats, sizes, and licenses
 *
 * Ensures all assets meet project requirements before integration:
 * - Format validation (file extensions, MIME types)
 * - Size validation (file size limits per asset type)
 * - License validation (required licenses, attribution)
 * - Metadata validation (required fields)
 * - Dependency validation (required dependencies exist)
 */

export class AssetValidator {
    /**
     * Create a new AssetValidator
     * @param {Object} config - Configuration
     * @param {Object} config.sizeLimits - Size limits per asset type (bytes)
     * @param {Array<string>} config.allowedFormats - Allowed formats per type
     * @param {Array<string>} config.requiredLicenses - Required license types
     */
    constructor(config = {}) {
        // Size limits per asset type (in bytes)
        this.sizeLimits = config.sizeLimits || {
            '3d-model': {
                small: 2 * 1024 * 1024, // 2MB
                medium: 10 * 1024 * 1024, // 10MB
                large: 25 * 1024 * 1024, // 25MB
                environment: 50 * 1024 * 1024, // 50MB
            },
            texture: {
                ui: 200 * 1024, // 200KB
                material: 1024 * 1024, // 1MB
                environment: 4 * 1024 * 1024, // 4MB
                hdr: 2 * 1024 * 1024, // 2MB
            },
            audio: {
                music: 5 * 1024 * 1024, // 5MB per minute (approximate)
                sfx: 500 * 1024, // 500KB
                ambient: 2 * 1024 * 1024, // 2MB
            },
            animation: {
                simple: 100 * 1024, // 100KB
                complex: 500 * 1024, // 500KB
                facial: 200 * 1024, // 200KB
            },
            shader: {
                default: 50 * 1024, // 50KB
            },
            'ui-asset': {
                icon: 50 * 1024, // 50KB
                sprite: 200 * 1024, // 200KB
                font: 100 * 1024, // 100KB
            },
        };

        // Allowed formats per asset type
        this.allowedFormats = config.allowedFormats || {
            '3d-model': ['glb', 'gltf', 'obj', 'fbx'],
            texture: ['png', 'jpg', 'jpeg', 'webp', 'hdr', 'exr'],
            audio: ['ogg', 'mp3', 'wav'],
            animation: ['gltf', 'glb'], // Animations embedded in GLTF
            shader: ['js', 'glsl'],
            'ui-asset': ['svg', 'png', 'jpg', 'woff2', 'woff', 'ttf'],
        };

        // Required license types
        this.requiredLicenses = config.requiredLicenses || [
            'CC0',
            'CC BY',
            'CC BY-SA',
            'CC BY-NC',
            'MIT',
            'Apache',
            'Public Domain',
            'Custom',
        ];

        // Validation results cache
        this.validationCache = new Map();
    }

    /**
     * Validate an asset
     * @param {Object} assetData - Asset data to validate
     * @param {string} assetData.type - Asset type
     * @param {string} assetData.path - Asset file path
     * @param {number} assetData.size - File size in bytes
     * @param {string} assetData.format - File format
     * @param {string} assetData.license - License information
     * @param {Object} assetData.metadata - Additional metadata
     * @returns {Object} Validation result {valid: boolean, errors: Array, warnings: Array}
     */
    validate(assetData) {
        const cacheKey = `${assetData.path}-${assetData.size}`;
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        const result = {
            valid: true,
            errors: [],
            warnings: [],
        };

        // Validate required fields
        if (!assetData.type) {
            result.valid = false;
            result.errors.push('Asset type is required');
        }

        if (!assetData.path) {
            result.valid = false;
            result.errors.push('Asset path is required');
        }

        // Validate format
        const formatResult = this.validateFormat(assetData.type, assetData.format);
        if (!formatResult.valid) {
            result.valid = false;
            result.errors.push(...formatResult.errors);
        }
        result.warnings.push(...formatResult.warnings);

        // Validate size
        const sizeResult = this.validateSize(assetData.type, assetData.size, assetData.category);
        if (!sizeResult.valid) {
            result.valid = false;
            result.errors.push(...sizeResult.errors);
        }
        result.warnings.push(...sizeResult.warnings);

        // Validate license
        const licenseResult = this.validateLicense(assetData.license);
        if (!licenseResult.valid) {
            result.warnings.push(...licenseResult.warnings); // License is warning, not error
        }

        // Validate metadata
        const metadataResult = this.validateMetadata(assetData.metadata);
        if (!metadataResult.valid) {
            result.warnings.push(...metadataResult.warnings);
        }

        // Cache result
        this.validationCache.set(cacheKey, result);

        return result;
    }

    /**
     * Validate asset format
     * @param {string} type - Asset type
     * @param {string} format - File format
     * @returns {Object} Validation result
     * @private
     */
    validateFormat(type, format) {
        const result = { valid: true, errors: [], warnings: [] };

        if (!type || !format) {
            result.valid = false;
            result.errors.push('Type and format are required');
            return result;
        }

        const allowed = this.allowedFormats[type];
        if (!allowed) {
            result.valid = false;
            result.errors.push(`Unknown asset type: ${type}`);
            return result;
        }

        const formatLower = format.toLowerCase();
        if (!allowed.includes(formatLower)) {
            result.valid = false;
            result.errors.push(
                `Format ${format} not allowed for type ${type}. Allowed: ${allowed.join(', ')}`
            );
        }

        // Format-specific warnings
        if (type === '3d-model' && formatLower === 'obj') {
            result.warnings.push('OBJ format lacks material/texture support, consider GLB/GLTF');
        }

        if (type === 'texture' && formatLower === 'jpg') {
            result.warnings.push('JPG format does not support transparency, consider PNG');
        }

        if (type === 'audio' && formatLower === 'mp3') {
            result.warnings.push('MP3 has licensing restrictions, consider OGG Vorbis');
        }

        return result;
    }

    /**
     * Validate asset size
     * @param {string} type - Asset type
     * @param {number} size - File size in bytes
     * @param {string} category - Asset category (optional)
     * @returns {Object} Validation result
     * @private
     */
    validateSize(type, size, category = null) {
        const result = { valid: true, errors: [], warnings: [] };

        if (!type || size === undefined || size === null) {
            result.valid = false;
            result.errors.push('Type and size are required');
            return result;
        }

        const limits = this.sizeLimits[type];
        if (!limits) {
            result.warnings.push(`No size limits defined for type ${type}`);
            return result;
        }

        // Determine which limit to use
        let limit = null;
        if (category && limits[category]) {
            limit = limits[category];
        } else {
            // Use first available limit as default
            limit = Object.values(limits)[0];
        }

        if (limit && size > limit) {
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            const limitMB = (limit / (1024 * 1024)).toFixed(2);
            result.valid = false;
            result.errors.push(
                `Asset size ${sizeMB}MB exceeds limit ${limitMB}MB for ${type}${category ? ` (${category})` : ''}`
            );
        } else if (limit && size > limit * 0.8) {
            // Warn if approaching limit
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            const limitMB = (limit / (1024 * 1024)).toFixed(2);
            result.warnings.push(
                `Asset size ${sizeMB}MB is approaching limit ${limitMB}MB. Consider optimization.`
            );
        }

        return result;
    }

    /**
     * Validate license
     * @param {string} license - License information
     * @returns {Object} Validation result
     * @private
     */
    validateLicense(license) {
        const result = { valid: true, errors: [], warnings: [] };

        if (!license || license === 'unknown') {
            result.warnings.push('License information is missing or unknown');
            return result;
        }

        // Check if license is in required list
        const licenseUpper = license.toUpperCase();
        const hasValidLicense = this.requiredLicenses.some((req) =>
            licenseUpper.includes(req.toUpperCase())
        );

        if (!hasValidLicense) {
            result.warnings.push(
                `License "${license}" may not be compatible. Ensure proper attribution is provided.`
            );
        }

        // Check for attribution requirements
        if (licenseUpper.includes('CC BY') || licenseUpper.includes('ATTRIBUTION')) {
            result.warnings.push(
                'This license requires attribution. Ensure attribution is documented.'
            );
        }

        return result;
    }

    /**
     * Validate metadata
     * @param {Object} metadata - Asset metadata
     * @returns {Object} Validation result
     * @private
     */
    validateMetadata(metadata = {}) {
        const result = { valid: true, errors: [], warnings: [] };

        // Check for recommended fields
        const recommendedFields = ['source', 'author', 'description'];
        recommendedFields.forEach((field) => {
            if (!metadata[field]) {
                result.warnings.push(`Recommended metadata field "${field}" is missing`);
            }
        });

        return result;
    }

    /**
     * Validate asset file exists (async, for runtime validation)
     * @param {string} path - Asset file path
     * @returns {Promise<Object>} Validation result
     */
    async validateFileExists(path) {
        const result = { valid: true, errors: [], warnings: [] };

        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (!response.ok) {
                result.valid = false;
                result.errors.push(`Asset file not found: ${path}`);
            }
        } catch (error) {
            result.valid = false;
            result.errors.push(`Failed to check asset file: ${error.message}`);
        }

        return result;
    }

    /**
     * Validate dependencies
     * @param {Array<string>} dependencies - Asset dependencies
     * @param {Function} dependencyChecker - Function to check if dependency exists
     * @returns {Promise<Object>} Validation result
     */
    async validateDependencies(dependencies = [], dependencyChecker = null) {
        const result = { valid: true, errors: [], warnings: [] };

        if (!dependencies || dependencies.length === 0) {
            return result;
        }

        if (!dependencyChecker) {
            result.warnings.push('No dependency checker provided, skipping dependency validation');
            return result;
        }

        for (const dep of dependencies) {
            const exists = await dependencyChecker(dep);
            if (!exists) {
                result.valid = false;
                result.errors.push(`Required dependency not found: ${dep}`);
            }
        }

        return result;
    }

    /**
     * Get size limit for asset type and category
     * @param {string} type - Asset type
     * @param {string} category - Asset category
     * @returns {number|null} Size limit in bytes, or null if not found
     */
    getSizeLimit(type, category = null) {
        const limits = this.sizeLimits[type];
        if (!limits) {
            return null;
        }

        if (category && limits[category]) {
            return limits[category];
        }

        // Return first available limit as default
        return Object.values(limits)[0] || null;
    }

    /**
     * Check if format is allowed for type
     * @param {string} type - Asset type
     * @param {string} format - File format
     * @returns {boolean} True if format is allowed
     */
    isFormatAllowed(type, format) {
        const allowed = this.allowedFormats[type];
        if (!allowed) {
            return false;
        }
        return allowed.includes(format.toLowerCase());
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }
}
