/**
 * LoopManager - Manages multiple update loops organized into buckets
 *
 * Inspired by the multi-loop per object engine idea - instead of each feature
 * owning its own update() file, this manager collates multiple "loops" inside
 * the same manager to keep logic centralized while respecting different update rhythms.
 *
 * Key features:
 * - Buckets over files: Named buckets (audio, visual effects, physics, UI, performance)
 * - Variable frequency: Buckets can run at different tempos using delta accumulators
 * - Single owner object: Subsystems can register their own loop objects
 * - Integration hooks: EventBus/StateManager integration for pause/resume/control
 */

export class LoopManager {
    constructor(eventBus = null, stateManager = null) {
        this.buckets = new Map(); // Map of bucket name to bucket config
        this.loops = new Map(); // Map of loop name to loop object
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.enabled = true;
        this.pausedBuckets = new Set(); // Set of paused bucket names

        // Subscribe to events if EventBus is available
        if (this.eventBus) {
            this.setupEventListeners();
        }
    }

    /**
     * Setup event listeners for EventBus integration
     */
    setupEventListeners() {
        // Pause/resume bucket
        this.eventBus.on('loop.pauseBucket', (bucketName) => {
            this.pauseBucket(bucketName);
        });

        this.eventBus.on('loop.resumeBucket', (bucketName) => {
            this.resumeBucket(bucketName);
        });

        // Pause/resume all
        this.eventBus.on('loop.pauseAll', () => {
            this.pauseAll();
        });

        this.eventBus.on('loop.resumeAll', () => {
            this.resumeAll();
        });

        // Enable/disable
        this.eventBus.on('loop.disable', () => {
            this.enabled = false;
        });

        this.eventBus.on('loop.enable', () => {
            this.enabled = true;
        });
    }

    /**
     * Add a bucket for organizing related update callbacks
     * @param {string} name - Bucket name (e.g., 'audio', 'visualEffects', 'physics')
     * @param {Object} options - Bucket configuration
     * @param {number} options.frequency - Update frequency (1 = every frame, 0.5 = every 2 frames, 2 = twice per frame)
     * @param {boolean} options.enabled - Whether bucket is enabled (default: true)
     * @param {number} options.priority - Execution order priority (lower = earlier, default: 100)
     */
    addBucket(name, options = {}) {
        const {
            frequency = 1.0, // 1.0 = every frame
            enabled = true,
            priority = 100,
        } = options;

        this.buckets.set(name, {
            name,
            callbacks: [],
            frequency,
            enabled,
            priority,
            deltaAccumulator: 0, // Accumulates deltaTime until frequency threshold
            frameCount: 0, // For frame-based frequency (e.g., every N frames)
        });

        return this;
    }

    /**
     * Add a callback to a bucket
     * @param {string} bucketName - Name of the bucket
     * @param {Function} callback - Update callback (deltaTime, elapsedTime, systems)
     * @param {Object} options - Callback options
     * @param {number} options.priority - Order within bucket (lower = earlier, default: 100)
     */
    addCallback(bucketName, callback, options = {}) {
        const bucket = this.buckets.get(bucketName);
        if (!bucket) {
            console.warn(`LoopManager: Bucket "${bucketName}" does not exist. Creating it.`);
            this.addBucket(bucketName);
            return this.addCallback(bucketName, callback, options);
        }

        const { priority = 100 } = options;
        bucket.callbacks.push({
            callback,
            priority,
        });

        // Sort callbacks by priority
        bucket.callbacks.sort((a, b) => a.priority - b.priority);

        return this;
    }

    /**
     * Register a loop object (subsystem that owns its own state)
     * @param {string} name - Loop name
     * @param {Object} loopObject - Object with update() method and optional state
     * @param {string} bucketName - Bucket to add this loop to
     */
    addLoop(name, loopObject, bucketName = 'default') {
        if (!loopObject || typeof loopObject.update !== 'function') {
            console.warn(`LoopManager: Loop "${name}" must have an update() method`);
            return this;
        }

        this.loops.set(name, loopObject);

        // Add to bucket
        this.addCallback(bucketName, (deltaTime, elapsedTime, systems) => {
            loopObject.update(deltaTime, elapsedTime, systems);
        });

        return this;
    }

    /**
     * Run all buckets (called by GameLoop each frame)
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    run(deltaTime, elapsedTime, systems) {
        if (!this.enabled) {
            return;
        }

        // Get all buckets sorted by priority
        const sortedBuckets = Array.from(this.buckets.values())
            .filter((bucket) => bucket.enabled && !this.pausedBuckets.has(bucket.name))
            .sort((a, b) => a.priority - b.priority);

        for (const bucket of sortedBuckets) {
            // Handle frequency-based updates
            if (bucket.frequency < 1.0) {
                // Less than 1.0 = frame-based (e.g., 0.5 = every 2 frames)
                bucket.frameCount++;
                const frameInterval = Math.round(1.0 / bucket.frequency);
                if (bucket.frameCount % frameInterval !== 0) {
                    continue; // Skip this frame
                }
            } else if (bucket.frequency > 1.0) {
                // Greater than 1.0 = time-based (e.g., 2.0 = twice per frame)
                bucket.deltaAccumulator += deltaTime;
                const interval = 1.0 / bucket.frequency;
                while (bucket.deltaAccumulator >= interval) {
                    bucket.deltaAccumulator -= interval;
                    this.runBucket(bucket, interval, elapsedTime, systems);
                }
                continue; // Already ran, skip normal run
            }

            // Normal frequency (1.0 = every frame)
            this.runBucket(bucket, deltaTime, elapsedTime, systems);
        }
    }

    /**
     * Run a single bucket's callbacks
     * @param {Object} bucket - Bucket configuration
     * @param {number} deltaTime - Delta time for this update
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    runBucket(bucket, deltaTime, elapsedTime, systems) {
        for (const { callback } of bucket.callbacks) {
            try {
                callback(deltaTime, elapsedTime, systems);
            } catch (error) {
                console.error(`LoopManager: Error in bucket "${bucket.name}" callback:`, error);
                // Continue with other callbacks even if one fails
            }
        }
    }

    /**
     * Pause a specific bucket
     * @param {string} bucketName - Name of bucket to pause
     */
    pauseBucket(bucketName) {
        this.pausedBuckets.add(bucketName);
        if (this.eventBus) {
            this.eventBus.emit('loop.bucketPaused', { bucketName });
        }
    }

    /**
     * Resume a specific bucket
     * @param {string} bucketName - Name of bucket to resume
     */
    resumeBucket(bucketName) {
        this.pausedBuckets.delete(bucketName);
        if (this.eventBus) {
            this.eventBus.emit('loop.bucketResumed', { bucketName });
        }
    }

    /**
     * Pause all buckets
     */
    pauseAll() {
        for (const bucketName of this.buckets.keys()) {
            this.pausedBuckets.add(bucketName);
        }
        if (this.eventBus) {
            this.eventBus.emit('loop.allPaused');
        }
    }

    /**
     * Resume all buckets
     */
    resumeAll() {
        this.pausedBuckets.clear();
        if (this.eventBus) {
            this.eventBus.emit('loop.allResumed');
        }
    }

    /**
     * Get bucket configuration
     * @param {string} bucketName - Name of bucket
     * @returns {Object|null} Bucket configuration or null if not found
     */
    getBucket(bucketName) {
        return this.buckets.get(bucketName) || null;
    }

    /**
     * Get loop object
     * @param {string} loopName - Name of loop
     * @returns {Object|null} Loop object or null if not found
     */
    getLoop(loopName) {
        return this.loops.get(loopName) || null;
    }

    /**
     * Remove a bucket and all its callbacks
     * @param {string} bucketName - Name of bucket to remove
     */
    removeBucket(bucketName) {
        this.buckets.delete(bucketName);
        this.pausedBuckets.delete(bucketName);
    }

    /**
     * Remove a loop object
     * @param {string} loopName - Name of loop to remove
     */
    removeLoop(loopName) {
        this.loops.delete(loopName);
    }

    /**
     * Set bucket frequency
     * @param {string} bucketName - Name of bucket
     * @param {number} frequency - New frequency (1.0 = every frame, 0.5 = every 2 frames)
     */
    setBucketFrequency(bucketName, frequency) {
        const bucket = this.buckets.get(bucketName);
        if (bucket) {
            bucket.frequency = frequency;
            bucket.deltaAccumulator = 0; // Reset accumulator
            bucket.frameCount = 0; // Reset frame count
        }
    }

    /**
     * Enable/disable a bucket
     * @param {string} bucketName - Name of bucket
     * @param {boolean} enabled - Whether bucket is enabled
     */
    setBucketEnabled(bucketName, enabled) {
        const bucket = this.buckets.get(bucketName);
        if (bucket) {
            bucket.enabled = enabled;
        }
    }
}
