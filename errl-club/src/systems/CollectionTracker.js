/**
 * CollectionTracker - Tracks all collectible statistics with persistence
 *
 * Tracks drips, bubbles, fragments, and glow balls with session and lifetime stats
 */
export class CollectionTracker {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;
        this.eventBus = null;

        // Session stats (reset each session)
        this.sessionStats = {
            drips: 0,
            bubbles: 0,
            fragments: 0,
            glowBalls: 0,
            sessionStartTime: Date.now(),
            lastCollectionTime: null,
        };

        // Lifetime stats (persisted)
        this.lifetimeStats = {
            drips: 0,
            bubbles: 0,
            fragments: 0,
            glowBalls: 0,
            totalCollections: 0,
            firstCollectionTime: null,
            lastCollectionTime: null,
            collectionHistory: [], // Array of {type, timestamp} for recent collections
        };

        // Collection streaks
        this.streaks = {
            current: 0,
            best: 0,
            lastCollectionTime: null,
            streakTimeout: 10000, // 10 seconds between collections to maintain streak
        };

        // Load persisted data
        this.loadStats();
    }

    /**
     * Record a collection
     * @param {string} type - 'drip', 'bubble', 'fragment', 'glowBall'
     */
    recordCollection(type) {
        const timestamp = Date.now();

        // Update session stats
        if (this.sessionStats[type] !== undefined) {
            this.sessionStats[type]++;
        }
        this.sessionStats.lastCollectionTime = timestamp;

        // Update lifetime stats
        if (this.lifetimeStats[type] !== undefined) {
            this.lifetimeStats[type]++;
        }
        this.lifetimeStats.totalCollections++;

        if (!this.lifetimeStats.firstCollectionTime) {
            this.lifetimeStats.firstCollectionTime = timestamp;
        }
        this.lifetimeStats.lastCollectionTime = timestamp;

        // Add to history (keep last 100)
        this.lifetimeStats.collectionHistory.push({ type, timestamp });
        if (this.lifetimeStats.collectionHistory.length > 100) {
            this.lifetimeStats.collectionHistory.shift();
        }

        // Update streaks
        this.updateStreak(timestamp);

        // Emit collection event (for achievement system)
        if (this.eventBus) {
            this.eventBus.emit('collection.recorded', {
                type,
                timestamp,
            });
        }

        // Save to persistence
        this.saveStats();
    }

    /**
     * Set event bus for collection events
     * @param {Object} eventBus - EventBus instance
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Update collection streak
     * @private
     */
    updateStreak(timestamp) {
        if (this.streaks.lastCollectionTime) {
            const timeSinceLastCollection = timestamp - this.streaks.lastCollectionTime;
            if (timeSinceLastCollection <= this.streaks.streakTimeout) {
                // Continue streak
                this.streaks.current++;
            } else {
                // Streak broken, reset
                if (this.streaks.current > this.streaks.best) {
                    this.streaks.best = this.streaks.current;
                }
                this.streaks.current = 1;
            }
        } else {
            // First collection
            this.streaks.current = 1;
        }

        this.streaks.lastCollectionTime = timestamp;

        // Update best streak if current is better
        if (this.streaks.current > this.streaks.best) {
            this.streaks.best = this.streaks.current;
        }
    }

    /**
     * Get current statistics
     * @returns {Object} Current stats
     */
    getStats() {
        const sessionDuration = (Date.now() - this.sessionStats.sessionStartTime) / 1000 / 60; // minutes
        const sessionCollections = this.getSessionTotal();
        const sessionRate = sessionDuration > 0 ? sessionCollections / sessionDuration : 0;

        const lifetimeDuration = this.lifetimeStats.firstCollectionTime
            ? (Date.now() - this.lifetimeStats.firstCollectionTime) / 1000 / 60 // minutes
            : 0;
        const lifetimeRate =
            lifetimeDuration > 0 ? this.lifetimeStats.totalCollections / lifetimeDuration : 0;

        return {
            session: {
                ...this.sessionStats,
                total: this.getSessionTotal(),
                rate: sessionRate,
                duration: sessionDuration,
            },
            lifetime: {
                ...this.lifetimeStats,
                rate: lifetimeRate,
                duration: lifetimeDuration,
            },
            streaks: {
                ...this.streaks,
            },
        };
    }

    /**
     * Get session total collections
     * @returns {number}
     */
    getSessionTotal() {
        return (
            this.sessionStats.drips +
            this.sessionStats.bubbles +
            this.sessionStats.fragments +
            this.sessionStats.glowBalls
        );
    }

    /**
     * Get lifetime total collections
     * @returns {number}
     */
    getLifetimeTotal() {
        return this.lifetimeStats.totalCollections;
    }

    /**
     * Get collection breakdown by type
     * @returns {Object} Breakdown by type
     */
    getBreakdown() {
        return {
            session: {
                drips: this.sessionStats.drips,
                bubbles: this.sessionStats.bubbles,
                fragments: this.sessionStats.fragments,
                glowBalls: this.sessionStats.glowBalls,
            },
            lifetime: {
                drips: this.lifetimeStats.drips,
                bubbles: this.lifetimeStats.bubbles,
                fragments: this.lifetimeStats.fragments,
                glowBalls: this.lifetimeStats.glowBalls,
            },
        };
    }

    /**
     * Load stats from persistence
     * @private
     */
    loadStats() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('collectionStats', null);
        if (saved) {
            this.lifetimeStats = {
                ...this.lifetimeStats,
                ...saved.lifetimeStats,
                collectionHistory: saved.lifetimeStats?.collectionHistory || [],
            };
            this.streaks = {
                ...this.streaks,
                ...saved.streaks,
            };
        }
    }

    /**
     * Save stats to persistence
     * @private
     */
    saveStats() {
        if (!this.settingsManager) {
            return;
        }

        this.settingsManager.setSetting('collectionStats', {
            lifetimeStats: this.lifetimeStats,
            streaks: this.streaks,
        });
    }

    /**
     * Reset session stats (keeps lifetime stats)
     */
    resetSession() {
        this.sessionStats = {
            drips: 0,
            bubbles: 0,
            fragments: 0,
            glowBalls: 0,
            sessionStartTime: Date.now(),
            lastCollectionTime: null,
        };
    }

    /**
     * Reset all stats (including lifetime)
     */
    resetAll() {
        this.resetSession();
        this.lifetimeStats = {
            drips: 0,
            bubbles: 0,
            fragments: 0,
            glowBalls: 0,
            totalCollections: 0,
            firstCollectionTime: null,
            lastCollectionTime: null,
            collectionHistory: [],
        };
        this.streaks = {
            current: 0,
            best: 0,
            lastCollectionTime: null,
            streakTimeout: 10000,
        };
        this.saveStats();
    }
}
