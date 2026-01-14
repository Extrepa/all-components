/**
 * AssetErrorHandler - Graceful error handling and recovery for asset loading
 *
 * Provides:
 * - Graceful fallback for missing assets
 * - Retry logic with exponential backoff
 * - User-friendly error messages
 * - Error logging and reporting
 * - Asset replacement system
 */

import * as THREE from 'three';

export class AssetErrorHandler {
    /**
     * Create a new AssetErrorHandler
     * @param {Object} config - Configuration
     * @param {number} config.maxRetries - Maximum retry attempts (default: 3)
     * @param {number} config.retryDelay - Initial retry delay in ms (default: 1000)
     * @param {boolean} config.enableFallbacks - Enable fallback assets (default: true)
     */
    constructor(config = {}) {
        this.config = {
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
            enableFallbacks: config.enableFallbacks !== false,
        };

        // Error tracking
        this.errors = new Map(); // Map<assetPath, errorInfo>
        this.retryAttempts = new Map(); // Map<assetPath, attemptCount>

        // Fallback assets
        this.fallbacks = new Map(); // Map<assetType, fallbackAsset>

        // Error listeners
        this.errorListeners = new Set();

        // Initialize default fallbacks
        this.initializeFallbacks();
    }

    /**
     * Initialize default fallback assets
     * @private
     */
    initializeFallbacks() {
        // Fallback 3D model (simple cube)
        this.fallbacks.set('3d-model', {
            type: '3d-model',
            create: () => {
                // Return a simple placeholder mesh
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                // Use MeshBasicMaterial to avoid texture unit limit errors
                const material = new THREE.MeshBasicMaterial({
                    color: 0x888888,
                });
                return new THREE.Mesh(geometry, material);
            },
        });

        // Fallback texture (1x1 pixel)
        this.fallbacks.set('texture', {
            type: 'texture',
            create: () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#888888';
                ctx.fillRect(0, 0, 1, 1);
                return new THREE.CanvasTexture(canvas);
            },
        });

        // Fallback audio (silent buffer)
        this.fallbacks.set('audio', {
            type: 'audio',
            create: (audioContext) => {
                if (!audioContext) {
                    return null;
                }
                // Create silent audio buffer
                const buffer = audioContext.createBuffer(1, 1, 44100);
                return buffer;
            },
        });
    }

    /**
     * Handle asset loading error
     * @param {string} assetPath - Asset file path
     * @param {Error} error - Error object
     * @param {Object} options - Error handling options
     * @param {string} options.assetType - Asset type
     * @param {Function} options.loader - Asset loader function
     * @returns {Promise<*>} Resolves with asset or fallback
     */
    async handleError(assetPath, error, options = {}) {
        const errorInfo = {
            path: assetPath,
            type: options.assetType || 'unknown',
            error: error.message,
            timestamp: new Date().toISOString(),
            attempts: this.retryAttempts.get(assetPath) || 0,
        };

        // Record error
        this.errors.set(assetPath, errorInfo);

        // Determine error type
        const errorType = this.classifyError(error);

        // Handle based on error type
        switch (errorType) {
            case 'network':
                return this.handleNetworkError(assetPath, error, options);
            case 'format':
                return this.handleFormatError(assetPath, error, options);
            case 'size':
                return this.handleSizeError(assetPath, error, options);
            case 'license':
                return this.handleLicenseError(assetPath, error, options);
            case 'dependency':
                return this.handleDependencyError(assetPath, error, options);
            default:
                return this.handleUnknownError(assetPath, error, options);
        }
    }

    /**
     * Classify error type
     * @param {Error} error - Error object
     * @returns {string} Error type
     * @private
     */
    classifyError(error) {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch') || message.includes('404')) {
            return 'network';
        }

        if (
            message.includes('format') ||
            message.includes('parse') ||
            message.includes('invalid')
        ) {
            return 'format';
        }

        if (message.includes('size') || message.includes('too large')) {
            return 'size';
        }

        if (message.includes('license') || message.includes('attribution')) {
            return 'license';
        }

        if (message.includes('dependency') || message.includes('missing')) {
            return 'dependency';
        }

        return 'unknown';
    }

    /**
     * Handle network errors with retry
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with asset or fallback
     * @private
     */
    async handleNetworkError(assetPath, error, options) {
        const attempts = this.retryAttempts.get(assetPath) || 0;

        if (attempts < this.config.maxRetries) {
            // Retry with exponential backoff
            const delay = this.config.retryDelay * Math.pow(2, attempts);
            this.retryAttempts.set(assetPath, attempts + 1);

            console.warn(
                `AssetErrorHandler: Retrying ${assetPath} (attempt ${attempts + 1}/${this.config.maxRetries}) after ${delay}ms`
            );

            await this.delay(delay);

            if (options.loader) {
                try {
                    return await options.loader(assetPath);
                } catch (retryError) {
                    return this.handleError(assetPath, retryError, options);
                }
            }
        }

        // Max retries reached, use fallback
        console.error(`AssetErrorHandler: Max retries reached for ${assetPath}, using fallback`);
        return this.getFallback(options.assetType, options.context);
    }

    /**
     * Handle format errors
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with fallback
     * @private
     */
    async handleFormatError(assetPath, error, options) {
        console.error(`AssetErrorHandler: Format error for ${assetPath}:`, error.message);
        this.notifyError(assetPath, error, 'format');
        return this.getFallback(options.assetType, options.context);
    }

    /**
     * Handle size errors
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with fallback or null
     * @private
     */
    async handleSizeError(assetPath, error, _options) {
        console.warn(`AssetErrorHandler: Size error for ${assetPath}:`, error.message);
        this.notifyError(assetPath, error, 'size');
        // Size errors typically mean we should skip the asset
        return null;
    }

    /**
     * Handle license errors
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with null (block loading)
     * @private
     */
    async handleLicenseError(assetPath, error, _options) {
        console.error(`AssetErrorHandler: License error for ${assetPath}:`, error.message);
        this.notifyError(assetPath, error, 'license');
        // License errors block loading
        return null;
    }

    /**
     * Handle dependency errors
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with fallback
     * @private
     */
    async handleDependencyError(assetPath, error, options) {
        console.warn(`AssetErrorHandler: Dependency error for ${assetPath}:`, error.message);
        this.notifyError(assetPath, error, 'dependency');
        return this.getFallback(options.assetType, options.context);
    }

    /**
     * Handle unknown errors
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {Object} options - Options
     * @returns {Promise<*>} Resolves with fallback
     * @private
     */
    async handleUnknownError(assetPath, error, options) {
        console.error(`AssetErrorHandler: Unknown error for ${assetPath}:`, error);
        this.notifyError(assetPath, error, 'unknown');
        return this.getFallback(options.assetType, options.context);
    }

    /**
     * Get fallback asset
     * @param {string} assetType - Asset type
     * @param {Object} context - Context (e.g., audioContext for audio)
     * @returns {*} Fallback asset or null
     * @private
     */
    getFallback(assetType, context = null) {
        if (!this.config.enableFallbacks) {
            return null;
        }

        const fallback = this.fallbacks.get(assetType);
        if (!fallback) {
            console.warn(`AssetErrorHandler: No fallback available for type ${assetType}`);
            return null;
        }

        try {
            // THREE is now imported at the top of the file
            if (assetType === '3d-model' && typeof THREE === 'undefined') {
                // eslint-disable-next-line no-console
                console.warn('AssetErrorHandler: THREE.js not available for 3D model fallback');
                return null;
            }

            return fallback.create(context);
        } catch (error) {
            console.error('AssetErrorHandler: Failed to create fallback:', error);
            return null;
        }
    }

    /**
     * Register fallback asset
     * @param {string} assetType - Asset type
     * @param {Function} createFunction - Function to create fallback
     */
    registerFallback(assetType, createFunction) {
        this.fallbacks.set(assetType, {
            type: assetType,
            create: createFunction,
        });
    }

    /**
     * Notify error listeners
     * @param {string} assetPath - Asset path
     * @param {Error} error - Error object
     * @param {string} errorType - Error type
     * @private
     */
    notifyError(assetPath, error, errorType) {
        const errorInfo = {
            path: assetPath,
            error: error.message,
            type: errorType,
            timestamp: new Date().toISOString(),
        };

        this.errorListeners.forEach((listener) => {
            try {
                listener(errorInfo);
            } catch (listenerError) {
                console.error('AssetErrorHandler: Error in error listener:', listenerError);
            }
        });
    }

    /**
     * Add error listener
     * @param {Function} listener - Error listener function
     */
    onError(listener) {
        this.errorListeners.add(listener);
    }

    /**
     * Remove error listener
     * @param {Function} listener - Error listener function
     */
    offError(listener) {
        this.errorListeners.delete(listener);
    }

    /**
     * Get error information for asset
     * @param {string} assetPath - Asset path
     * @returns {Object|null} Error information or null
     */
    getError(assetPath) {
        return this.errors.get(assetPath) || null;
    }

    /**
     * Get all errors
     * @returns {Array<Object>} Array of error information
     */
    getAllErrors() {
        return Array.from(this.errors.values());
    }

    /**
     * Clear errors for asset
     * @param {string} assetPath - Asset path
     */
    clearError(assetPath) {
        this.errors.delete(assetPath);
        this.retryAttempts.delete(assetPath);
    }

    /**
     * Clear all errors
     */
    clearAllErrors() {
        this.errors.clear();
        this.retryAttempts.clear();
    }

    /**
     * Delay utility
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     * @private
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Get user-friendly error message
     * @param {string} assetPath - Asset path
     * @returns {string} User-friendly error message
     */
    getUserFriendlyMessage(assetPath) {
        const error = this.getError(assetPath);
        if (!error) {
            return 'Unknown error';
        }

        switch (error.type) {
            case 'network':
                return 'Failed to load asset. Please check your internet connection.';
            case 'format':
                return 'Asset format is not supported.';
            case 'size':
                return 'Asset is too large. Please use a smaller version.';
            case 'license':
                return 'Asset license requires attribution. Please add attribution.';
            case 'dependency':
                return 'Required dependencies are missing.';
            default:
                return `Failed to load asset: ${error.error}`;
        }
    }
}
