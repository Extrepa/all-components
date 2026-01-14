/**
 * CollectionStatistics - Advanced collection statistics and analytics
 *
 * Provides detailed analytics, milestones, records, and historical trends
 */
export class CollectionStatistics {
    /**
     * Create a new CollectionStatistics
     * @param {Object} collectionTracker - CollectionTracker instance
     * @param {Object} settingsManager - SettingsManager instance (optional)
     */
    constructor(collectionTracker, settingsManager = null) {
        this.collectionTracker = collectionTracker;
        this.settingsManager = settingsManager;

        // Milestones (achieved milestones)
        this.milestones = {
            firstCollection: false,
            firstDrip: false,
            firstBubble: false,
            firstFragment: false,
            firstGlowBall: false,
            tenCollections: false,
            fiftyCollections: false,
            hundredCollections: false,
            fiveHundredCollections: false,
            thousandCollections: false,
            tenStreak: false,
            twentyStreak: false,
            fiftyStreak: false,
        };

        // Records (best performances)
        this.records = {
            bestSessionTotal: 0,
            bestSessionRate: 0,
            bestStreak: 0,
            fastestCollection: null, // Time between collections
            longestSession: 0,
            mostDripsInSession: 0,
            mostBubblesInSession: 0,
            mostFragmentsInSession: 0,
            mostGlowBallsInSession: 0,
        };

        // Historical data (daily/weekly/monthly)
        this.historicalData = {
            daily: [], // Array of {date, collections, breakdown}
            weekly: [], // Array of {week, collections, breakdown}
            monthly: [], // Array of {month, collections, breakdown}
        };

        // Collection patterns
        this.patterns = {
            mostCollectedType: null,
            rarestCollection: null,
            averageTimeBetweenCollections: 0,
            peakCollectionHour: null,
            peakCollectionDay: null,
        };

        // Load persisted data
        this.loadStats();

        // Initialize patterns from existing data
        this.updatePatterns();
    }

    /**
     * Update statistics when a collection occurs
     * @param {string} type - Collection type
     * @param {number} timestamp - Collection timestamp
     */
    onCollection(type, timestamp) {
        // Check milestones
        this.checkMilestones(type);

        // Update records
        this.updateRecords(type, timestamp);

        // Update historical data
        this.updateHistoricalData(type, timestamp);

        // Update patterns
        this.updatePatterns();

        // Save stats
        this.saveStats();
    }

    /**
     * Check and update milestones
     * @private
     */
    checkMilestones(type) {
        const stats = this.collectionTracker.getStats();
        const lifetime = stats.lifetime;
        const streaks = stats.streaks;

        // First collection
        if (!this.milestones.firstCollection && lifetime.totalCollections >= 1) {
            this.milestones.firstCollection = true;
            this.triggerMilestone('firstCollection');
        }

        // Type-specific firsts
        if (type === 'drip' && !this.milestones.firstDrip) {
            this.milestones.firstDrip = true;
            this.triggerMilestone('firstDrip');
        }
        if (type === 'bubble' && !this.milestones.firstBubble) {
            this.milestones.firstBubble = true;
            this.triggerMilestone('firstBubble');
        }
        if (type === 'fragment' && !this.milestones.firstFragment) {
            this.milestones.firstFragment = true;
            this.triggerMilestone('firstFragment');
        }
        if (type === 'glowBall' && !this.milestones.firstGlowBall) {
            this.milestones.firstGlowBall = true;
            this.triggerMilestone('firstGlowBall');
        }

        // Collection count milestones
        if (!this.milestones.tenCollections && lifetime.totalCollections >= 10) {
            this.milestones.tenCollections = true;
            this.triggerMilestone('tenCollections', { count: 10 });
        }
        if (!this.milestones.fiftyCollections && lifetime.totalCollections >= 50) {
            this.milestones.fiftyCollections = true;
            this.triggerMilestone('fiftyCollections', { count: 50 });
        }
        if (!this.milestones.hundredCollections && lifetime.totalCollections >= 100) {
            this.milestones.hundredCollections = true;
            this.triggerMilestone('hundredCollections', { count: 100 });
        }
        if (!this.milestones.fiveHundredCollections && lifetime.totalCollections >= 500) {
            this.milestones.fiveHundredCollections = true;
            this.triggerMilestone('fiveHundredCollections', { count: 500 });
        }
        if (!this.milestones.thousandCollections && lifetime.totalCollections >= 1000) {
            this.milestones.thousandCollections = true;
            this.triggerMilestone('thousandCollections', { count: 1000 });
        }

        // Streak milestones
        if (!this.milestones.tenStreak && streaks.current >= 10) {
            this.milestones.tenStreak = true;
            this.triggerMilestone('tenStreak', { streak: 10 });
        }
        if (!this.milestones.twentyStreak && streaks.current >= 20) {
            this.milestones.twentyStreak = true;
            this.triggerMilestone('twentyStreak', { streak: 20 });
        }
        if (!this.milestones.fiftyStreak && streaks.current >= 50) {
            this.milestones.fiftyStreak = true;
            this.triggerMilestone('fiftyStreak', { streak: 50 });
        }
    }

    /**
     * Trigger a milestone event
     * @private
     */
    triggerMilestone(milestoneId, data = {}) {
        // Emit milestone event (if eventBus is available)
        if (this.eventBus) {
            this.eventBus.emit('collection.milestone', {
                milestoneId,
                ...data,
            });
        }
    }

    /**
     * Update records
     * @private
     */
    updateRecords(type, timestamp) {
        const stats = this.collectionTracker.getStats();
        const session = stats.session;
        const lifetime = stats.lifetime;
        const streaks = stats.streaks;

        // Best session total
        if (session.total > this.records.bestSessionTotal) {
            this.records.bestSessionTotal = session.total;
        }

        // Best session rate
        if (session.rate > this.records.bestSessionRate) {
            this.records.bestSessionRate = session.rate;
        }

        // Best streak
        if (streaks.best > this.records.bestStreak) {
            this.records.bestStreak = streaks.best;
        }

        // Fastest collection (time between collections)
        if (lifetime.lastCollectionTime && lifetime.firstCollectionTime) {
            const timeSinceLast = timestamp - lifetime.lastCollectionTime;
            if (!this.records.fastestCollection || timeSinceLast < this.records.fastestCollection) {
                this.records.fastestCollection = timeSinceLast;
            }
        }

        // Longest session
        if (session.duration > this.records.longestSession) {
            this.records.longestSession = session.duration;
        }

        // Most of each type in session
        const breakdown = this.collectionTracker.getBreakdown();
        if (breakdown.session.drips > this.records.mostDripsInSession) {
            this.records.mostDripsInSession = breakdown.session.drips;
        }
        if (breakdown.session.bubbles > this.records.mostBubblesInSession) {
            this.records.mostBubblesInSession = breakdown.session.bubbles;
        }
        if (breakdown.session.fragments > this.records.mostFragmentsInSession) {
            this.records.mostFragmentsInSession = breakdown.session.fragments;
        }
        if (breakdown.session.glowBalls > this.records.mostGlowBallsInSession) {
            this.records.mostGlowBallsInSession = breakdown.session.glowBalls;
        }
    }

    /**
     * Update historical data
     * @private
     */
    updateHistoricalData(type, timestamp) {
        const date = new Date(timestamp);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const weekKey = this.getWeekKey(date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        // Update daily
        let dailyEntry = this.historicalData.daily.find((d) => d.date === dayKey);
        if (!dailyEntry) {
            dailyEntry = {
                date: dayKey,
                collections: 0,
                breakdown: { drips: 0, bubbles: 0, fragments: 0, glowBalls: 0 },
            };
            this.historicalData.daily.push(dailyEntry);
            // Keep only last 90 days
            if (this.historicalData.daily.length > 90) {
                this.historicalData.daily.shift();
            }
        }
        dailyEntry.collections++;
        if (dailyEntry.breakdown[type] !== undefined) {
            dailyEntry.breakdown[type]++;
        }

        // Update weekly
        let weeklyEntry = this.historicalData.weekly.find((w) => w.week === weekKey);
        if (!weeklyEntry) {
            weeklyEntry = {
                week: weekKey,
                collections: 0,
                breakdown: { drips: 0, bubbles: 0, fragments: 0, glowBalls: 0 },
            };
            this.historicalData.weekly.push(weeklyEntry);
            // Keep only last 52 weeks
            if (this.historicalData.weekly.length > 52) {
                this.historicalData.weekly.shift();
            }
        }
        weeklyEntry.collections++;
        if (weeklyEntry.breakdown[type] !== undefined) {
            weeklyEntry.breakdown[type]++;
        }

        // Update monthly
        let monthlyEntry = this.historicalData.monthly.find((m) => m.month === monthKey);
        if (!monthlyEntry) {
            monthlyEntry = {
                month: monthKey,
                collections: 0,
                breakdown: { drips: 0, bubbles: 0, fragments: 0, glowBalls: 0 },
            };
            this.historicalData.monthly.push(monthlyEntry);
            // Keep only last 24 months
            if (this.historicalData.monthly.length > 24) {
                this.historicalData.monthly.shift();
            }
        }
        monthlyEntry.collections++;
        if (monthlyEntry.breakdown[type] !== undefined) {
            monthlyEntry.breakdown[type]++;
        }
    }

    /**
     * Get week key for a date
     * @private
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        return `${year}-W${week}`;
    }

    /**
     * Update collection patterns
     * @private
     */
    updatePatterns() {
        const breakdown = this.collectionTracker.getBreakdown();
        const lifetime = breakdown.lifetime;

        // Most collected type
        const types = [
            { name: 'drips', count: lifetime.drips },
            { name: 'bubbles', count: lifetime.bubbles },
            { name: 'fragments', count: lifetime.fragments },
            { name: 'glowBalls', count: lifetime.glowBalls },
        ];
        types.sort((a, b) => b.count - a.count);
        this.patterns.mostCollectedType = types[0].name;

        // Rarest collection
        const rareTypes = types.filter((t) => t.count > 0);
        if (rareTypes.length > 0) {
            rareTypes.sort((a, b) => a.count - b.count);
            this.patterns.rarestCollection = rareTypes[0].name;
        }

        // Average time between collections
        const history = this.collectionTracker.lifetimeStats.collectionHistory;
        if (history.length >= 2) {
            let totalTime = 0;
            for (let i = 1; i < history.length; i++) {
                totalTime += history[i].timestamp - history[i - 1].timestamp;
            }
            this.patterns.averageTimeBetweenCollections = totalTime / (history.length - 1);
        }

        // Peak collection hour/day (from history)
        const hourCounts = new Map();
        const dayCounts = new Map();
        history.forEach((entry) => {
            const date = new Date(entry.timestamp);
            const hour = date.getHours();
            const day = date.getDay();

            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        });

        if (hourCounts.size > 0) {
            const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
            this.patterns.peakCollectionHour = peakHour;
        }

        if (dayCounts.size > 0) {
            const peakDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
            this.patterns.peakCollectionDay = peakDay;
        }
    }

    /**
     * Get all statistics
     * @returns {Object} Complete statistics object
     */
    getStatistics() {
        return {
            milestones: { ...this.milestones },
            records: { ...this.records },
            patterns: { ...this.patterns },
            historical: {
                daily: [...this.historicalData.daily],
                weekly: [...this.historicalData.weekly],
                monthly: [...this.historicalData.monthly],
            },
        };
    }

    /**
     * Get milestones
     * @returns {Object} Milestones object
     */
    getMilestones() {
        return { ...this.milestones };
    }

    /**
     * Get records
     * @returns {Object} Records object
     */
    getRecords() {
        return { ...this.records };
    }

    /**
     * Get patterns
     * @returns {Object} Patterns object
     */
    getPatterns() {
        return { ...this.patterns };
    }

    /**
     * Get historical data
     * @param {string} period - 'daily', 'weekly', or 'monthly'
     * @returns {Array} Historical data array
     */
    getHistoricalData(period = 'daily') {
        return [...(this.historicalData[period] || [])];
    }

    /**
     * Set event bus for milestone events
     * @param {Object} eventBus - EventBus instance
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Load stats from persistence
     * @private
     */
    loadStats() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('collectionStatistics', null);
        if (saved) {
            if (saved.milestones) {
                this.milestones = { ...this.milestones, ...saved.milestones };
            }
            if (saved.records) {
                this.records = { ...this.records, ...saved.records };
            }
            if (saved.historicalData) {
                this.historicalData = { ...this.historicalData, ...saved.historicalData };
            }
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

        this.settingsManager.setSetting('collectionStatistics', {
            milestones: this.milestones,
            records: this.records,
            historicalData: this.historicalData,
        });
    }
}
