/**
 * SystemLoop - Base class for self-registering game systems
 *
 * Systems that extend SystemLoop can automatically register themselves
 * with LoopManager, reducing coupling and code in UpdateManager.
 */
export class SystemLoop {
    /**
     * @param {string} name - Unique name for this loop
     * @param {string} bucketName - Bucket to register in (e.g., 'physics', 'audio')
     * @param {number} priority - Execution priority within bucket (lower = earlier, default: 100)
     */
    constructor(name, bucketName, priority = 100) {
        this.name = name;
        this.bucketName = bucketName;
        this.priority = priority;
        this.enabled = true;
    }

    /**
     * Register this loop with LoopManager
     * @param {LoopManager} loopManager - The LoopManager instance
     */
    register(loopManager) {
        if (!loopManager) {
            console.warn(
                `SystemLoop "${this.name}": No LoopManager provided, skipping registration`
            );
            return;
        }

        loopManager.addLoop(this.name, this, this.bucketName);
    }

    /**
     * Update method - must be implemented by subclasses
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    update(deltaTime, elapsedTime, systems) {
        throw new Error(`SystemLoop.update() must be implemented by ${this.constructor.name}`);
    }

    /**
     * Enable or disable this loop
     * @param {boolean} enabled - Whether loop is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if loop is enabled
     * @returns {boolean} Whether loop is enabled
     */
    isEnabled() {
        return this.enabled;
    }
}
