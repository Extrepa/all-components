/**
 * PerformanceOptimizer - Automatic performance adjustment system
 *
 * Monitors FPS and automatically adjusts quality settings to maintain target frame rate.
 * Dynamically lowers or raises graphics quality based on performance metrics.
 *
 * @class PerformanceOptimizer
 */
export class PerformanceOptimizer {
    /**
     * Create a PerformanceOptimizer instance
     * @param {GraphicsSettings} graphicsSettings - Graphics settings manager
     * @param {DevTools} devTools - DevTools instance for FPS monitoring
     */
    constructor(graphicsSettings, devTools) {
        this.graphicsSettings = graphicsSettings;
        this.devTools = devTools;
        this.enabled = false;

        this.fpsHistory = [];
        this.fpsWindowSize = 60; // 1 second at 60fps
        this.targetFPS = 60;
        this.minFPS = 30;

        this.adjustmentLevel = 0; // 0 = no adjustment, negative = lower quality, positive = higher quality
        this.maxAdjustmentLevel = -3; // Can lower quality up to 3 levels

        this.lastAdjustmentTime = 0;
        this.adjustmentCooldown = 5000; // 5 seconds between adjustments
    }

    /**
     * Enable automatic performance adjustment
     */
    enable() {
        this.enabled = true;
        this.fpsHistory = [];
        this.adjustmentLevel = 0;
    }

    /**
     * Disable automatic performance adjustment
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Update performance optimizer
     * @param {number} currentFPS - Current FPS
     */
    update(currentFPS) {
        if (!this.enabled) {
            return;
        }

        // Add FPS to history
        this.fpsHistory.push(currentFPS);
        if (this.fpsHistory.length > this.fpsWindowSize) {
            this.fpsHistory.shift();
        }

        // Calculate average FPS over window
        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

        // Check if adjustment is needed
        const now = performance.now();
        if (now - this.lastAdjustmentTime < this.adjustmentCooldown) {
            return; // Still in cooldown
        }

        // Adjust if FPS is consistently low
        if (avgFPS < this.minFPS && this.adjustmentLevel > this.maxAdjustmentLevel) {
            this.lowerQuality();
            this.lastAdjustmentTime = now;
        } else if (avgFPS > this.targetFPS + 10 && this.adjustmentLevel < 0) {
            // FPS is good, can raise quality back up
            this.raiseQuality();
            this.lastAdjustmentTime = now;
        }
    }

    /**
     * Lower quality settings
     */
    lowerQuality() {
        this.adjustmentLevel--;

        const currentQuality = this.graphicsSettings.getCurrentQuality();
        const qualityLevels = ['ultra', 'high', 'medium', 'low'];
        const currentIndex = qualityLevels.indexOf(currentQuality);

        if (currentIndex < qualityLevels.length - 1) {
            const newQuality = qualityLevels[currentIndex + 1];
            this.graphicsSettings.setQuality(newQuality);
            console.log(`Performance Optimizer: Lowered quality to ${newQuality}`);
        }

        // Also reduce particle multiplier
        const currentMultiplier =
            this.graphicsSettings.getSetting('graphics.particleMultiplier') || 1.0;
        const newMultiplier = Math.max(0.3, currentMultiplier - 0.2);
        this.graphicsSettings.setSetting('graphics.particleMultiplier', newMultiplier);
    }

    /**
     * Raise quality settings
     */
    raiseQuality() {
        this.adjustmentLevel++;

        const currentQuality = this.graphicsSettings.getCurrentQuality();
        const qualityLevels = ['ultra', 'high', 'medium', 'low'];
        const currentIndex = qualityLevels.indexOf(currentQuality);

        if (currentIndex > 0) {
            const newQuality = qualityLevels[currentIndex - 1];
            this.graphicsSettings.setQuality(newQuality);
            console.log(`Performance Optimizer: Raised quality to ${newQuality}`);
        }

        // Also increase particle multiplier
        const currentMultiplier =
            this.graphicsSettings.getSetting('graphics.particleMultiplier') || 1.0;
        const newMultiplier = Math.min(1.2, currentMultiplier + 0.2);
        this.graphicsSettings.setSetting('graphics.particleMultiplier', newMultiplier);
    }

    /**
     * Get current adjustment level
     * @returns {number} Adjustment level
     */
    getAdjustmentLevel() {
        return this.adjustmentLevel;
    }

    /**
     * Get average FPS
     * @returns {number} Average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) {
            return 0;
        }
        return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    /**
     * Reset adjustment level
     */
    reset() {
        this.adjustmentLevel = 0;
        this.fpsHistory = [];
        this.lastAdjustmentTime = 0;
    }
}
