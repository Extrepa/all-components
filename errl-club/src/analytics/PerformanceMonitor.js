/**
 * PerformanceMonitor - Performance metrics and FPS tracking
 *
 * Monitors FPS, frame time, memory, and performance warnings
 */
export class PerformanceMonitor {
    /**
     * Create a new PerformanceMonitor
     * @param {Object} config - Configuration
     * @param {number} config.sampleSize - Number of samples for averaging (default: 60)
     * @param {number} config.warningThreshold - FPS threshold for warnings (default: 30)
     */
    constructor(config = {}) {
        this.config = {
            sampleSize: config.sampleSize || 60,
            warningThreshold: config.warningThreshold || 30,
        };

        // FPS tracking
        this.frameTimes = [];
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.averageFps = 60;

        // Memory tracking
        this.memorySamples = [];
        this.maxMemorySampleSize = 100;

        // Performance warnings
        this.warnings = [];
        this.onWarning = null;

        // Statistics
        this.stats = {
            minFps: Infinity,
            maxFps: 0,
            averageFps: 60,
            frameTime: 0,
            memoryUsage: 0,
            warningsCount: 0,
        };
    }

    /**
     * Update performance monitor (call every frame)
     * @param {number} _deltaTime - Time since last frame in seconds
     */
    update(_deltaTime) {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Calculate FPS
        this.fps = 1000 / frameTime;

        // Track frame times
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > this.config.sampleSize) {
            this.frameTimes.shift();
        }

        // Calculate average FPS
        const totalFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0);
        this.averageFps = (this.frameTimes.length * 1000) / totalFrameTime;

        // Update stats
        this.stats.frameTime = frameTime;
        this.stats.minFps = Math.min(this.stats.minFps, this.fps);
        this.stats.maxFps = Math.max(this.stats.maxFps, this.fps);
        this.stats.averageFps = this.averageFps;

        // Check for warnings
        if (this.fps < this.config.warningThreshold) {
            this.addWarning('low_fps', `FPS dropped to ${this.fps.toFixed(1)}`);
        }

        // Memory tracking (if available)
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            this.memorySamples.push(memoryUsage);
            if (this.memorySamples.length > this.maxMemorySampleSize) {
                this.memorySamples.shift();
            }

            this.stats.memoryUsage = memoryUsage;

            // Check for memory warnings
            const maxMemory = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB
            if (memoryUsage > maxMemory * 0.9) {
                this.addWarning(
                    'high_memory',
                    `Memory usage at ${memoryUsage.toFixed(1)}MB (${((memoryUsage / maxMemory) * 100).toFixed(1)}%)`
                );
            }
        }
    }

    /**
     * Add performance warning
     * @param {string} type - Warning type
     * @param {string} message - Warning message
     * @private
     */
    addWarning(type, message) {
        const warning = {
            type,
            message,
            timestamp: Date.now(),
            fps: this.fps,
        };

        this.warnings.push(warning);
        this.stats.warningsCount++;

        // Keep only recent warnings
        if (this.warnings.length > 50) {
            this.warnings.shift();
        }

        // Call warning handler
        if (this.onWarning) {
            this.onWarning(warning);
        }
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Get average FPS
     * @returns {number} Average FPS
     */
    getAverageFPS() {
        return this.averageFps;
    }

    /**
     * Get frame time
     * @returns {number} Frame time in milliseconds
     */
    getFrameTime() {
        return this.stats.frameTime;
    }

    /**
     * Get memory usage
     * @returns {number} Memory usage in MB, or null if not available
     */
    getMemoryUsage() {
        return this.stats.memoryUsage || null;
    }

    /**
     * Get performance statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            currentFps: this.fps,
            warnings: this.warnings.slice(-10), // Last 10 warnings
        };
    }

    /**
     * Reset statistics
     */
    reset() {
        this.frameTimes = [];
        this.memorySamples = [];
        this.warnings = [];
        this.stats = {
            minFps: Infinity,
            maxFps: 0,
            averageFps: 60,
            frameTime: 0,
            memoryUsage: 0,
            warningsCount: 0,
        };
    }
}
