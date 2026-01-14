/**
 * CollectionStreakSystem - Tracks collection streaks and combos
 *
 * Tracks consecutive collections within timing windows to create streaks and combos
 */
export class CollectionStreakSystem {
    constructor(eventBus = null, settingsManager = null) {
        this.eventBus = eventBus;
        this.settingsManager = settingsManager;

        // Streak configuration
        this.streakTimeout = 3.0; // Seconds between collections to maintain streak
        this.comboWindow = 2.0; // Seconds for combo multiplier
        this.maxComboMultiplier = 10.0; // Maximum combo multiplier

        // Current streak state
        this.currentStreak = 0;
        this.currentCombo = 0;
        this.comboMultiplier = 1.0;
        this.lastCollectionTime = 0;
        this.streakStartTime = 0;

        // Streak statistics
        this.stats = {
            longestStreak: 0,
            totalStreaks: 0,
            highestCombo: 0,
            totalCombos: 0,
            streakBreaks: 0,
        };

        // Listen to collection events
        if (this.eventBus) {
            this.eventBus.on('collection.recorded', (data) => {
                this.onCollection(data);
            });
        }

        // Load saved stats
        this.load();
    }

    /**
     * Handle collection event
     * @param {Object} data - Collection event data
     */
    onCollection(data) {
        const now = performance.now() / 1000; // Convert to seconds
        const timeSinceLastCollection = now - this.lastCollectionTime;

        // Check if streak continues
        if (timeSinceLastCollection <= this.streakTimeout && this.lastCollectionTime > 0) {
            // Continue streak
            this.currentStreak++;
            this.comboMultiplier = Math.min(this.maxComboMultiplier, 1.0 + this.currentCombo * 0.1);

            // Check for combo
            if (timeSinceLastCollection <= this.comboWindow) {
                this.currentCombo++;
                this.comboMultiplier = Math.min(
                    this.maxComboMultiplier,
                    1.0 + this.currentCombo * 0.15
                );
            } else {
                // Reset combo but keep streak
                this.currentCombo = 1;
                this.comboMultiplier = 1.1;
            }
        } else {
            // Start new streak
            if (this.currentStreak > 0) {
                this.stats.streakBreaks++;
                this.emitStreakBreak();
            }
            this.currentStreak = 1;
            this.currentCombo = 1;
            this.comboMultiplier = 1.0;
            this.streakStartTime = now;
        }

        // Update statistics
        if (this.currentStreak > this.stats.longestStreak) {
            this.stats.longestStreak = this.currentStreak;
        }
        if (this.currentCombo > this.stats.highestCombo) {
            this.stats.highestCombo = this.currentCombo;
        }

        this.lastCollectionTime = now;

        // Emit streak/combo events
        this.emitStreakUpdate();

        // Save stats periodically
        if (this.currentStreak % 10 === 0) {
            this.save();
        }
    }

    /**
     * Emit streak update event
     */
    emitStreakUpdate() {
        if (this.eventBus) {
            this.eventBus.emit('collection.streakUpdate', {
                streak: this.currentStreak,
                combo: this.currentCombo,
                multiplier: this.comboMultiplier,
                timeRemaining: this.getTimeUntilStreakBreak(),
            });
        }
    }

    /**
     * Emit streak break event
     */
    emitStreakBreak() {
        if (this.eventBus) {
            this.eventBus.emit('collection.streakBreak', {
                finalStreak: this.currentStreak,
                finalCombo: this.currentCombo,
            });
        }
    }

    /**
     * Get time until streak breaks (if no collection)
     * @returns {number} Time in seconds
     */
    getTimeUntilStreakBreak() {
        if (this.lastCollectionTime === 0) {
            return 0;
        }
        const now = performance.now() / 1000;
        const elapsed = now - this.lastCollectionTime;
        return Math.max(0, this.streakTimeout - elapsed);
    }

    /**
     * Get current streak info
     * @returns {Object} Streak information
     */
    getStreakInfo() {
        return {
            streak: this.currentStreak,
            combo: this.currentCombo,
            multiplier: this.comboMultiplier,
            timeRemaining: this.getTimeUntilStreakBreak(),
            stats: { ...this.stats },
        };
    }

    /**
     * Reset streak (manual reset)
     */
    resetStreak() {
        if (this.currentStreak > 0) {
            this.stats.streakBreaks++;
            this.emitStreakBreak();
        }
        this.currentStreak = 0;
        this.currentCombo = 0;
        this.comboMultiplier = 1.0;
        this.lastCollectionTime = 0;
        this.emitStreakUpdate();
    }

    /**
     * Update streak timeout (for timing window visualization)
     * @param {number} deltaTime - Delta time in seconds
     */
    update(deltaTime) {
        // Check if streak should break due to timeout
        if (this.lastCollectionTime > 0) {
            const now = performance.now() / 1000;
            const timeSinceLastCollection = now - this.lastCollectionTime;

            if (timeSinceLastCollection > this.streakTimeout) {
                // Streak broken due to timeout
                if (this.currentStreak > 0) {
                    this.stats.streakBreaks++;
                    this.emitStreakBreak();
                }
                this.currentStreak = 0;
                this.currentCombo = 0;
                this.comboMultiplier = 1.0;
                this.emitStreakUpdate();
            }
        }
    }

    /**
     * Load saved statistics
     */
    load() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('collectionStreak.stats', null);
        if (saved) {
            this.stats = { ...this.stats, ...saved };
        }
    }

    /**
     * Save statistics
     */
    save() {
        if (!this.settingsManager) {
            return;
        }
        this.settingsManager.setSetting('collectionStreak.stats', this.stats);
    }
}
