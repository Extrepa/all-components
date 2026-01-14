/**
 * FragmentProgressionSystem - Manages Errl fragment progression and unlocks
 *
 * Tracks fragment collection milestones and unlocks features
 */
export class FragmentProgressionSystem {
    /**
     * Create a new FragmentProgressionSystem
     * @param {Object} config - Configuration
     * @param {Object} config.collectionTracker - CollectionTracker instance
     * @param {Object} config.settingsManager - SettingsManager instance (optional)
     * @param {Object} config.eventBus - EventBus instance (optional)
     */
    constructor(config = {}) {
        this.collectionTracker = config.collectionTracker;
        this.settingsManager = config.settingsManager;
        this.eventBus = config.eventBus;

        // Fragment milestones and unlocks
        this.milestones = [
            {
                fragmentCount: 1,
                name: 'First Fragment',
                description: 'You found your first Errl fragment!',
                unlocks: ['fragment_tracking'],
            },
            {
                fragmentCount: 5,
                name: 'Fragment Collector',
                description: "You've collected 5 fragments!",
                unlocks: ['enhanced_visual_effects', 'fragment_glow'],
            },
            {
                fragmentCount: 10,
                name: 'Fragment Master',
                description: "You've collected 10 fragments!",
                unlocks: ['special_avatar_colors', 'fragment_particles'],
            },
            {
                fragmentCount: 25,
                name: 'Fragment Expert',
                description: "You've collected 25 fragments!",
                unlocks: ['advanced_visual_effects', 'fragment_aura'],
            },
            {
                fragmentCount: 50,
                name: 'Fragment Legend',
                description: "You've collected 50 fragments!",
                unlocks: ['legendary_avatar_effects', 'fragment_crown'],
            },
            {
                fragmentCount: 100,
                name: 'Fragment Deity',
                description: "You've collected 100 fragments!",
                unlocks: ['divine_visual_effects', 'fragment_halo'],
            },
        ];

        // Unlocked features
        this.unlockedFeatures = new Set();

        // Load unlocked features from persistence
        this.loadUnlocks();

        // Check current progress
        this.updateProgress();
    }

    /**
     * Get current fragment count
     * @returns {number} Current fragment count
     */
    getFragmentCount() {
        if (!this.collectionTracker) {
            return 0;
        }
        const breakdown = this.collectionTracker.getBreakdown();
        return breakdown.lifetime.fragments;
    }

    /**
     * Get current milestone progress
     * @returns {Object} Progress object {currentMilestone, nextMilestone, progress, unlockedMilestones}
     */
    getProgress() {
        const fragmentCount = this.getFragmentCount();

        // Find current and next milestone
        let currentMilestone = null;
        let nextMilestone = null;
        const unlockedMilestones = [];

        for (const milestone of this.milestones) {
            if (fragmentCount >= milestone.fragmentCount) {
                currentMilestone = milestone;
                unlockedMilestones.push(milestone);
            } else if (!nextMilestone) {
                nextMilestone = milestone;
            }
        }

        // Calculate progress to next milestone
        let progress = 0;
        if (nextMilestone) {
            const previousCount = currentMilestone ? currentMilestone.fragmentCount : 0;
            const range = nextMilestone.fragmentCount - previousCount;
            const current = fragmentCount - previousCount;
            progress = range > 0 ? (current / range) * 100 : 100;
        } else {
            // All milestones unlocked
            progress = 100;
        }

        return {
            fragmentCount,
            currentMilestone,
            nextMilestone,
            progress: Math.min(100, Math.max(0, progress)),
            unlockedMilestones,
            totalMilestones: this.milestones.length,
        };
    }

    /**
     * Update progress and check for new unlocks
     */
    updateProgress() {
        const fragmentCount = this.getFragmentCount();
        const previousUnlocks = new Set(this.unlockedFeatures);

        // Check each milestone
        for (const milestone of this.milestones) {
            if (fragmentCount >= milestone.fragmentCount) {
                // Unlock features for this milestone
                milestone.unlocks.forEach((feature) => {
                    this.unlockedFeatures.add(feature);
                });

                // Check if this is a new unlock
                const isNewUnlock = milestone.unlocks.some(
                    (feature) => !previousUnlocks.has(feature)
                );
                if (isNewUnlock) {
                    this.onMilestoneReached(milestone, fragmentCount);
                }
            }
        }

        // Save unlocks
        this.saveUnlocks();
    }

    /**
     * Handle milestone reached
     * @private
     */
    onMilestoneReached(milestone, fragmentCount) {
        // Emit milestone event
        if (this.eventBus) {
            this.eventBus.emit('fragment.milestone', {
                milestone,
                fragmentCount,
                unlocks: milestone.unlocks,
            });
        }

        // Show notification (if notification system is available)
        if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
            window.gameSystems.notificationSystem.show(
                `${milestone.name}: ${milestone.description}`,
                { type: 'success', duration: 5000 }
            );
        }
    }

    /**
     * Check if a feature is unlocked
     * @param {string} featureId - Feature ID
     * @returns {boolean} True if unlocked
     */
    isFeatureUnlocked(featureId) {
        return this.unlockedFeatures.has(featureId);
    }

    /**
     * Get all unlocked features
     * @returns {Array<string>} Array of unlocked feature IDs
     */
    getUnlockedFeatures() {
        return Array.from(this.unlockedFeatures);
    }

    /**
     * Get all milestones
     * @returns {Array<Object>} Array of milestone objects
     */
    getMilestones() {
        return [...this.milestones];
    }

    /**
     * Get next unlock preview
     * @returns {Object|null} Next milestone or null
     */
    getNextUnlock() {
        const progress = this.getProgress();
        return progress.nextMilestone;
    }

    /**
     * Apply unlocked features to game systems
     * @param {Object} systems - Game systems object
     */
    applyUnlocks(systems) {
        // Apply fragment_glow
        if (this.isFeatureUnlocked('fragment_glow') && systems.avatar) {
            // Add glow effect to avatar
            if (systems.avatar.material) {
                systems.avatar.material.emissiveIntensity = 1.5;
            }
        }

        // Apply fragment_particles
        if (this.isFeatureUnlocked('fragment_particles') && systems.particleSystem) {
            // Enable special particle effects
            // This would be implemented based on particle system capabilities
        }

        // Apply fragment_aura
        if (this.isFeatureUnlocked('fragment_aura') && systems.visualEffects) {
            // Add aura effect
            // This would be implemented based on visual effects system
        }

        // Apply special_avatar_colors
        if (this.isFeatureUnlocked('special_avatar_colors') && systems.avatar) {
            // Unlock special avatar colors
            // This would be implemented based on avatar system
        }
    }

    /**
     * Load unlocks from persistence
     * @private
     */
    loadUnlocks() {
        if (!this.settingsManager) {
            return;
        }

        const saved = this.settingsManager.getSetting('fragmentUnlocks', null);
        if (saved && Array.isArray(saved)) {
            saved.forEach((feature) => this.unlockedFeatures.add(feature));
        }
    }

    /**
     * Save unlocks to persistence
     * @private
     */
    saveUnlocks() {
        if (!this.settingsManager) {
            return;
        }

        this.settingsManager.setSetting('fragmentUnlocks', Array.from(this.unlockedFeatures));
    }

    /**
     * Reset all unlocks (for testing)
     */
    resetUnlocks() {
        this.unlockedFeatures.clear();
        this.saveUnlocks();
    }
}
