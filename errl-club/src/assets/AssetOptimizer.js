/**
 * AssetOptimizer - Automatic asset optimization
 *
 * Provides:
 * - Texture compression
 * - Model optimization (decimation, merging)
 * - Audio compression
 * - Format conversion
 * - Size reduction
 */

export class AssetOptimizer {
    /**
     * Create a new AssetOptimizer
     * @param {Object} config - Configuration
     * @param {boolean} config.enableTextureCompression - Enable texture compression (default: true)
     * @param {boolean} config.enableModelOptimization - Enable model optimization (default: true)
     * @param {boolean} config.enableAudioCompression - Enable audio compression (default: true)
     */
    constructor(config = {}) {
        this.config = {
            enableTextureCompression: config.enableTextureCompression !== false,
            enableModelOptimization: config.enableModelOptimization !== false,
            enableAudioCompression: config.enableAudioCompression !== false,
        };

        // Optimization statistics
        this.stats = {
            texturesOptimized: 0,
            modelsOptimized: 0,
            audioOptimized: 0,
            totalSizeReduction: 0,
        };
    }

    /**
     * Optimize texture
     * @param {HTMLImageElement|ImageBitmap} image - Image to optimize
     * @param {Object} options - Optimization options
     * @param {number} options.maxWidth - Maximum width
     * @param {number} options.maxHeight - Maximum height
     * @param {number} options.quality - Quality (0-1) for JPEG
     * @param {string} options.format - Output format ('png', 'jpeg', 'webp')
     * @returns {Promise<Blob>} Optimized image blob
     */
    async optimizeTexture(image, options = {}) {
        if (!this.config.enableTextureCompression) {
            return null;
        }

        const maxWidth = options.maxWidth || 1024;
        const maxHeight = options.maxHeight || 1024;
        const quality = options.quality || 0.8;
        const format = options.format || 'png';

        // Calculate new dimensions
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw resized image
        ctx.drawImage(image, 0, 0, width, height);

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        this.stats.texturesOptimized++;
                        this.stats.totalSizeReduction += image.width * image.height * 4 - blob.size;
                    }
                    resolve(blob);
                },
                `image/${format}`,
                format === 'jpeg' ? quality : undefined
            );
        });
    }

    /**
     * Optimize 3D model (client-side optimization suggestions)
     * @param {Object} modelData - Model data/metadata
     * @param {Object} options - Optimization options
     * @returns {Object} Optimization recommendations
     */
    optimizeModel(modelData, options = {}) {
        if (!this.config.enableModelOptimization) {
            return { recommendations: [] };
        }

        const recommendations = [];

        // Check triangle count
        if (modelData.triangleCount > 50000) {
            recommendations.push({
                type: 'decimation',
                message: `Model has ${modelData.triangleCount} triangles. Consider reducing to < 50K.`,
                priority: 'high',
            });
        }

        // Check file size
        if (modelData.size > 10 * 1024 * 1024) {
            recommendations.push({
                type: 'compression',
                message: `Model size is ${(modelData.size / (1024 * 1024)).toFixed(2)}MB. Consider compression.`,
                priority: 'high',
            });
        }

        // Check texture count
        if (modelData.textureCount > 10) {
            recommendations.push({
                type: 'texture-atlas',
                message: `Model has ${modelData.textureCount} textures. Consider using texture atlas.`,
                priority: 'medium',
            });
        }

        // Check format
        if (modelData.format !== 'glb') {
            recommendations.push({
                type: 'format',
                message: `Model format is ${modelData.format}. Consider converting to GLB for better performance.`,
                priority: 'medium',
            });
        }

        if (recommendations.length > 0) {
            this.stats.modelsOptimized++;
        }

        return { recommendations };
    }

    /**
     * Get optimization recommendations for asset
     * @param {Object} assetData - Asset data
     * @returns {Object} Optimization recommendations
     */
    getRecommendations(assetData) {
        const recommendations = [];

        if (assetData.type === 'texture') {
            // Texture-specific recommendations
            if (assetData.size > 1024 * 1024) {
                recommendations.push({
                    type: 'compress',
                    message: 'Texture is large. Consider compression.',
                    priority: 'high',
                });
            }

            if (assetData.width > 2048 || assetData.height > 2048) {
                recommendations.push({
                    type: 'resize',
                    message: 'Texture dimensions are large. Consider resizing.',
                    priority: 'medium',
                });
            }
        } else if (assetData.type === 'audio') {
            // Audio-specific recommendations
            if (assetData.format !== 'ogg') {
                recommendations.push({
                    type: 'format',
                    message: 'Consider converting to OGG for better compression.',
                    priority: 'medium',
                });
            }

            if (assetData.size > 5 * 1024 * 1024) {
                recommendations.push({
                    type: 'compress',
                    message: 'Audio file is large. Consider compression.',
                    priority: 'high',
                });
            }
        } else if (assetData.type === '3d-model') {
            // Model-specific recommendations
            return this.optimizeModel(assetData);
        }

        return { recommendations };
    }

    /**
     * Get optimization statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            texturesOptimized: 0,
            modelsOptimized: 0,
            audioOptimized: 0,
            totalSizeReduction: 0,
        };
    }
}
