/**
 * AchievementSystem - Comprehensive achievement tracking and rewards
 *
 * Tracks player achievements across all game systems
 */
export class AchievementSystem {
    /**
     * Create a new AchievementSystem
     * @param {Object} config - Configuration
     * @param {Object} config.settingsManager - SettingsManager instance
     * @param {Object} config.eventBus - EventBus instance (optional)
     */
    constructor(config = {}) {
        this.settingsManager = config.settingsManager;
        this.eventBus = config.eventBus;

        // Achievement definitions
        this.achievements = this.defineAchievements();

        // Unlocked achievements
        this.unlockedAchievements = new Set();

        // Achievement progress tracking
        this.progress = new Map(); // Map<achievementId, progress>

        // Load unlocked achievements
        this.loadAchievements();

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Define all achievements
     * @returns {Array<Object>} Array of achievement definitions
     */
    defineAchievements() {
        return [
            // Silly collection achievements
            {
                id: 'first_drip',
                name: 'First Drip',
                description: 'You got the drip! 💧',
                category: 'collection',
                icon: '💧',
                points: 10,
                check: (stats) => stats.collection?.lifetime?.drips >= 1,
            },
            {
                id: 'bubble_popper',
                name: 'Bubble Popper',
                description: 'Pop goes the bubble! 🫧',
                category: 'collection',
                icon: '🫧',
                points: 15,
                check: (stats) => stats.collection?.lifetime?.bubbles >= 1,
            },
            {
                id: 'fragment_finder',
                name: 'Fragment Finder',
                description: 'You found a fragment! ✨',
                category: 'collection',
                icon: '✨',
                points: 20,
                check: (stats) => stats.collection?.lifetime?.fragments >= 1,
            },
            {
                id: 'glow_getter',
                name: 'Glow Getter',
                description: "You're glowing! 💫",
                category: 'collection',
                icon: '💫',
                points: 15,
                check: (stats) => stats.collection?.lifetime?.glowBalls >= 1,
            },
            {
                id: 'collector',
                name: 'Collector',
                description: 'You collected 10 things! 🎉',
                category: 'collection',
                icon: '🎉',
                points: 25,
                check: (stats) => stats.collection?.lifetime?.totalCollections >= 10,
            },
            {
                id: 'rare_hunter',
                name: 'Rare Hunter',
                description: 'You found a rare collectible! 🏆',
                category: 'collection',
                icon: '🏆',
                points: 50,
                check: (stats) => stats.rare?.hasRare === true,
            },
            // Movement achievements
            {
                id: 'hopper',
                name: 'Hopper',
                description: 'You hopped 50 times! 🦘',
                category: 'movement',
                icon: '🦘',
                points: 20,
                check: (stats) => stats.movement?.hops >= 50,
            },
            {
                id: 'dancer',
                name: 'Dancer',
                description: 'You danced for 30 seconds! 💃',
                category: 'movement',
                icon: '💃',
                points: 30,
                check: (stats) => stats.movement?.danceTime >= 30,
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'You ran really fast! 🏃',
                category: 'movement',
                icon: '🏃',
                points: 25,
                check: (stats) => stats.movement?.maxSpeed >= 10,
            },
            // Vibe achievements
            {
                id: 'vibe_master',
                name: 'Vibe Master',
                description: 'You reached 100% vibe! 🌟',
                category: 'vibe',
                icon: '🌟',
                points: 40,
                check: (stats) => stats.vibe?.maxVibe >= 1.0,
            },
            // Legacy achievements (keep for compatibility)
            {
                id: 'first_collection',
                name: 'First Steps',
                description: 'Collect your first collectible',
                category: 'collection',
                icon: '🌟',
                points: 10,
                check: (stats) => stats.collection?.lifetime?.totalCollections >= 1,
            },
            {
                id: 'collector_100',
                name: 'Dedicated Collector',
                description: 'Collect 100 items',
                category: 'collection',
                icon: '💫',
                points: 50,
                check: (stats) => stats.collection?.lifetime?.totalCollections >= 100,
            },
            {
                id: 'drip_master',
                name: 'Drip Master',
                description: 'Collect 100 drips',
                category: 'collection',
                icon: '💧',
                points: 30,
                check: (stats) => stats.collection?.lifetime?.drips >= 100,
            },
            {
                id: 'fragment_hunter',
                name: 'Fragment Hunter',
                description: 'Collect 10 fragments',
                category: 'collection',
                icon: '💎',
                points: 50,
                check: (stats) => stats.collection?.lifetime?.fragments >= 10,
            },
            {
                id: 'glow_ball_finder',
                name: 'Glow Ball Finder',
                description: 'Find 5 glow balls',
                category: 'collection',
                icon: '🔮',
                points: 75,
                check: (stats) => stats.collection?.lifetime?.glowBalls >= 5,
            },

            // Streak achievements
            {
                id: 'streak_10',
                name: 'On a Roll',
                description: 'Achieve a 10-item collection streak',
                category: 'streak',
                icon: '🔥',
                points: 40,
                check: (stats) => stats.collection?.streaks?.best >= 10,
            },
            {
                id: 'streak_25',
                name: 'Unstoppable',
                description: 'Achieve a 25-item collection streak',
                category: 'streak',
                icon: '🔥🔥',
                points: 75,
                check: (stats) => stats.collection?.streaks?.best >= 25,
            },
            {
                id: 'streak_50',
                name: 'Legendary Streak',
                description: 'Achieve a 50-item collection streak',
                category: 'streak',
                icon: '🔥🔥🔥',
                points: 150,
                check: (stats) => stats.collection?.streaks?.best >= 50,
            },

            // Session achievements
            {
                id: 'session_100',
                name: 'Productive Session',
                description: 'Collect 100 items in a single session',
                category: 'session',
                icon: '📊',
                points: 60,
                check: (stats) => stats.collection?.session?.total >= 100,
            },
            {
                id: 'session_500',
                name: 'Marathon Session',
                description: 'Collect 500 items in a single session',
                category: 'session',
                icon: '🏃',
                points: 125,
                check: (stats) => stats.collection?.session?.total >= 500,
            },

            // Fragment progression achievements
            {
                id: 'fragment_5',
                name: 'Fragment Collector',
                description: 'Collect 5 fragments',
                category: 'fragments',
                icon: '💎',
                points: 40,
                check: (stats) => stats.fragments?.fragmentCount >= 5,
            },
            {
                id: 'fragment_25',
                name: 'Fragment Expert',
                description: 'Collect 25 fragments',
                category: 'fragments',
                icon: '💎💎',
                points: 100,
                check: (stats) => stats.fragments?.fragmentCount >= 25,
            },
            {
                id: 'fragment_50',
                name: 'Fragment Legend',
                description: 'Collect 50 fragments',
                category: 'fragments',
                icon: '💎💎💎',
                points: 200,
                check: (stats) => stats.fragments?.fragmentCount >= 50,
            },

            // Exploration achievements
            {
                id: 'explorer',
                name: 'Explorer',
                description: 'Explore the entire club',
                category: 'exploration',
                icon: '🗺️',
                points: 50,
                check: (stats) => stats.exploration?.areasDiscovered >= 5,
            },

            // Interaction achievements
            {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Interact with 10 different objects',
                category: 'interaction',
                icon: '🦋',
                points: 30,
                check: (stats) => stats.interaction?.uniqueInteractions >= 10,
            },

            // Time-based achievements
            {
                id: 'dedicated_player',
                name: 'Dedicated Player',
                description: 'Play for 1 hour total',
                category: 'time',
                icon: '⏰',
                points: 50,
                check: (stats) => stats.time?.totalPlaytime >= 60, // minutes
            },
            {
                id: 'veteran_player',
                name: 'Veteran Player',
                description: 'Play for 10 hours total',
                category: 'time',
                icon: '⏰⏰',
                points: 150,
                check: (stats) => stats.time?.totalPlaytime >= 600, // minutes
            },
        ];
    }

    /**
     * Setup event listeners for achievement checking
     * @private
     */
    setupEventListeners() {
        if (!this.eventBus) {
            return;
        }

        // Listen for collection events
        this.eventBus.on('collection.recorded', () => {
            this.checkAchievements();
        });

        // Listen for fragment milestones
        this.eventBus.on('fragment.milestone', () => {
            this.checkAchievements();
        });

        // Listen for interaction events
        this.eventBus.on('interaction.triggered', () => {
            this.checkAchievements();
        });
    }

    /**
     * Check all achievements and unlock new ones
     */
    checkAchievements() {
        const stats = this.gatherStats();
        const newUnlocks = [];

        for (const achievement of this.achievements) {
            // Skip if already unlocked
            if (this.unlockedAchievements.has(achievement.id)) {
                continue;
            }

            // Check achievement condition
            if (achievement.check(stats)) {
                this.unlockAchievement(achievement);
                newUnlocks.push(achievement);
            } else {
                // Update progress
                this.updateProgress(achievement, stats);
            }
        }

        // Emit unlock events
        if (newUnlocks.length > 0) {
            if (this.eventBus) {
                this.eventBus.emit('achievement.unlocked', {
                    achievements: newUnlocks,
                });
            }

            // Show notifications
            newUnlocks.forEach((achievement) => {
                this.showAchievementNotification(achievement);
            });
        }

        return newUnlocks;
    }

    /**
     * Unlock an achievement
     * @private
     */
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        this.saveAchievements();

        // Emit individual achievement event
        if (this.eventBus) {
            this.eventBus.emit('achievement.unlocked.single', {
                achievement,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Update progress for an achievement
     * @private
     */
    updateProgress(achievement, stats) {
        // Calculate progress percentage (simplified)
        // This could be enhanced with specific progress tracking per achievement
        const progress = this.calculateProgress(achievement, stats);
        this.progress.set(achievement.id, progress);
    }

    /**
     * Calculate progress for an achievement
     * @private
     */
    calculateProgress(achievement, stats) {
        // Simplified progress calculation
        // Could be enhanced with specific progress tracking
        return 0; // Placeholder
    }

    /**
     * Gather current game statistics
     * @private
     */
    gatherStats() {
        const stats = {};

        // Collection stats
        if (typeof window !== 'undefined' && window.gameSystems?.collectionTracker) {
            stats.collection = window.gameSystems.collectionTracker.getStats();
        }

        // Fragment stats
        if (typeof window !== 'undefined' && window.gameSystems?.fragmentProgression) {
            stats.fragments = {
                fragmentCount: window.gameSystems.fragmentProgression.getFragmentCount(),
            };
        }

        // Interaction stats (placeholder - would need interaction tracking)
        stats.interaction = {
            uniqueInteractions: 0, // Would track unique interactions
        };

        // Exploration stats (placeholder - would need exploration tracking)
        stats.exploration = {
            areasDiscovered: 0, // Would track discovered areas
        };

        // Time stats (placeholder - would need time tracking)
        stats.time = {
            totalPlaytime: 0, // Would track total playtime
        };

        return stats;
    }

    /**
     * Show achievement notification
     * @private
     */
    showAchievementNotification(achievement) {
        if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
            window.gameSystems.notificationSystem.show(
                `${achievement.icon} Achievement Unlocked: ${achievement.name}`,
                {
                    type: 'success',
                    duration: 5000,
                    title: achievement.description,
                }
            );
        }
    }

    /**
     * Get all achievements
     * @returns {Array<Object>} Array of all achievements
     */
    getAchievements() {
        return this.achievements.map((achievement) => ({
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id),
            progress: this.progress.get(achievement.id) || 0,
        }));
    }

    /**
     * Get unlocked achievements
     * @returns {Array<Object>} Array of unlocked achievements
     */
    getUnlockedAchievements() {
        return this.achievements
            .filter((a) => this.unlockedAchievements.has(a.id))
            .map((achievement) => ({
                ...achievement,
                progress: 100,
            }));
    }

    /**
     * Get achievements by category
     * @param {string} category - Category name
     * @returns {Array<Object>} Array of achievements in category
     */
    getAchievementsByCategory(category) {
        return this.getAchievements().filter((a) => a.category === category);
    }

    /**
     * Get total achievement points
     * @returns {number} Total points from unlocked achievements
     */
    getTotalPoints() {
        return this.getUnlockedAchievements().reduce(
            (total, achievement) => total + achievement.points,
            0
        );
    }

    /**
     * Check if achievement is unlocked
     * @param {string} achievementId - Achievement ID
     * @returns {boolean} True if unlocked
     */
    isUnlocked(achievementId) {
        return this.unlockedAchievements.has(achievementId);
    }

    /**
     * Get achievement progress
     * @param {string} achievementId - Achievement ID
     * @returns {number} Progress (0-100)
     */
    getProgress(achievementId) {
        return this.progress.get(achievementId) || 0;
    }

    /**
     * Load achievements from persistence
     * @private
     */
    loadAchievements() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('achievements', null);
        if (saved) {
            if (Array.isArray(saved.unlocked)) {
                saved.unlocked.forEach((id) => this.unlockedAchievements.add(id));
            }
            if (saved.progress) {
                Object.entries(saved.progress).forEach(([id, progress]) => {
                    this.progress.set(id, progress);
                });
            }
        }
    }

    /**
     * Save achievements to persistence
     * @private
     */
    saveAchievements() {
        if (!this.settingsManager) {
            return;
        }

        this.settingsManager.setSetting('achievements', {
            unlocked: Array.from(this.unlockedAchievements),
            progress: Object.fromEntries(this.progress),
        });
    }

    /**
     * Reset all achievements (for testing)
     */
    resetAchievements() {
        this.unlockedAchievements.clear();
        this.progress.clear();
        this.saveAchievements();
    }
}
