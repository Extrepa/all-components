/**
 * FPSTracker - Simple FPS tracking utility
 *
 * Extracted from main.js for reusability.
 */

export class FPSTracker {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
    }

    /**
     * Update FPS counter - call once per frame
     */
    update() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }

    /**
     * Get current FPS
     * @returns {number} Current frames per second
     */
    getFPS() {
        return this.fps;
    }
}
