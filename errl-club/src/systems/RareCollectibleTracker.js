/**
 * RareCollectibleTracker - Tracks rare/hidden collectibles
 *
 * Manages rare collectible spawning, collection, and persistence
 */
export class RareCollectibleTracker {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;
        this.eventBus = null;

        // Rare collectibles inventory
        this.rareCollectibles = {
            rareDrip: null,
            rareFragment: null,
            rareBubble: null,
            rareGlowBall: null,
        };

        // Spawn rate for rare collectibles (1% chance)
        this.rareSpawnRate = 0.01;

        // Load persisted rare collectibles
        this.loadRareCollectibles();
    }

    /**
     * Set event bus for rare collectible events
     * @param {Object} eventBus - EventBus instance
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Check if a collectible should be rare
     * @param {string} type - Collectible type ('drip', 'fragment', 'bubble', 'glowBall')
     * @returns {boolean} True if should be rare
     */
    shouldBeRare(type) {
        return Math.random() < this.rareSpawnRate;
    }

    /**
     * Mark a collectible as rare
     * @param {Object} collectible - Collectible instance
     * @param {string} type - Collectible type
     */
    markAsRare(collectible, type) {
        if (!collectible) {
            return;
        }

        collectible.isRare = true;
        collectible.rareType = type;

        // Apply rare visual properties
        if (collectible.mesh && collectible.mesh.material) {
            // Golden/rainbow effect for rare collectibles
            if (type === 'drip') {
                collectible.mesh.material.emissive.setHex(0xffd700); // Gold
                collectible.mesh.material.emissiveIntensity = 2.0;
            } else if (type === 'fragment') {
                collectible.mesh.material.emissive.setHex(0xff00ff); // Magenta
                collectible.mesh.material.emissiveIntensity = 2.5;
            } else if (type === 'bubble') {
                collectible.mesh.material.emissive.setHex(0x00ffff); // Cyan
                collectible.mesh.material.emissiveIntensity = 2.0;
            } else if (type === 'glowBall') {
                collectible.mesh.material.emissive.setHex(0xffff00); // Yellow
                collectible.mesh.material.emissiveIntensity = 3.0;
            }
        }
    }

    /**
     * Record rare collectible collection
     * @param {string} type - Rare collectible type
     * @param {Object} collectible - Collectible instance
     */
    recordRareCollection(type, collectible) {
        const rareKey = `rare${type.charAt(0).toUpperCase() + type.slice(1)}`;

        if (this.rareCollectibles[rareKey] === null) {
            this.rareCollectibles[rareKey] = {
                type: type,
                collectedAt: Date.now(),
                name: this.getRareName(type),
            };

            // Emit event
            if (this.eventBus) {
                this.eventBus.emit('rare.collected', {
                    type: type,
                    name: this.rareCollectibles[rareKey].name,
                });
            }

            // Save to persistence
            this.saveRareCollectibles();
        }
    }

    /**
     * Get rare collectible name
     * @param {string} type - Collectible type
     * @returns {string} Rare collectible name
     */
    getRareName(type) {
        const names = {
            drip: 'Golden Drip',
            fragment: 'Rainbow Fragment',
            bubble: 'Crystal Bubble',
            glowBall: 'Shimmering Glow',
        };
        return names[type] || `Rare ${type}`;
    }

    /**
     * Get rare collectibles inventory
     * @returns {Object} Rare collectibles object
     */
    getRareCollectibles() {
        return this.rareCollectibles;
    }

    /**
     * Check if player has a rare collectible
     * @param {string} type - Collectible type
     * @returns {boolean} True if player has this rare collectible
     */
    hasRareCollectible(type) {
        const rareKey = `rare${type.charAt(0).toUpperCase() + type.slice(1)}`;
        return this.rareCollectibles[rareKey] !== null;
    }

    /**
     * Save rare collectibles to persistence
     */
    saveRareCollectibles() {
        if (this.settingsManager) {
            this.settingsManager.setSetting('rareCollectibles', this.rareCollectibles);
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('errl_rare_collectibles', JSON.stringify(this.rareCollectibles));
        }
    }

    /**
     * Load rare collectibles from persistence
     */
    loadRareCollectibles() {
        if (this.settingsManager) {
            const saved = this.settingsManager.getSetting('rareCollectibles');
            if (saved) {
                this.rareCollectibles = saved;
            }
        } else if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('errl_rare_collectibles');
            if (saved) {
                try {
                    this.rareCollectibles = JSON.parse(saved);
                } catch (e) {
                    console.warn('Failed to load rare collectibles:', e);
                }
            }
        }
    }
}
