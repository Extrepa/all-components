// HUD vibe meter to reflect dance intensity
export class VibeMeter {
    constructor(avatar, eventSystem = null) {
        this.avatar = avatar;
        this.eventSystem = eventSystem;
        this.vibeLevel = 0; // 0-1
        this.decayRate = 0.95; // Decay per second
        this.maxVibe = 1.0;

        // Milestones (25%, 50%, 75%, 100%)
        this.milestones = [0.25, 0.5, 0.75, 1.0];
        this.reachedMilestones = new Set();

        // Statistics
        this.stats = {
            peakVibe: 0,
            averageVibe: 0,
            timeAtHighVibe: 0, // Time spent above 0.75
            totalVibeTime: 0,
            milestoneCount: 0,
            lastHighVibeTime: 0,
        };

        // History (for tracking)
        this.history = [];
        this.maxHistoryLength = 1000; // Keep last 1000 samples

        // Rewards (unlockable features)
        this.unlockedRewards = new Set();

        this.createUI();
    }

    createUI() {
        // Wait for DOM to be ready
        if (typeof document === 'undefined' || !document.body) {
            setTimeout(() => this.createUI(), 100);
            return;
        }

        const hud = document.getElementById('hud');
        if (!hud) {
            return;
        }

        // Create vibe meter container
        const vibeMeter = document.createElement('div');
        vibeMeter.id = 'vibe-meter';
        vibeMeter.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #00ff00;
            border-radius: 10px;
            overflow: hidden;
        `;

        // Create vibe fill bar
        const vibeFill = document.createElement('div');
        vibeFill.id = 'vibe-fill';
        vibeFill.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00ff00, #ffff00, #ff00ff);
            transition: width 0.1s ease;
        `;

        // Create vibe label
        const vibeLabel = document.createElement('div');
        vibeLabel.id = 'vibe-label';
        vibeLabel.textContent = 'VIBE';
        vibeLabel.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            text-transform: uppercase;
        `;

        vibeMeter.appendChild(vibeFill);
        vibeMeter.appendChild(vibeLabel);
        hud.appendChild(vibeMeter);

        this.vibeFill = vibeFill;
    }

    // Step 275: Reflect dance intensity in vibe meter
    update(deltaTime, avatar, elapsedTime = 0) {
        if (!avatar) {
            return;
        }

        const previousVibe = this.vibeLevel;

        // Calculate vibe based on:
        // - Movement speed (faster = more vibe)
        // - Dance state (dancing = more vibe)
        // - Beat sync (if available)
        // - Collection activity (collecting increases vibe)
        let vibeIncrease = 0;

        // Movement speed contribution
        if (avatar.velocity) {
            const speed = avatar.velocity.length();
            vibeIncrease += speed * 0.1;
        }

        // Dance state contribution
        if (avatar.currentState && avatar.currentState.includes('dance')) {
            vibeIncrease += 0.3;
        }

        // Running contributes
        if (avatar.isRunning) {
            vibeIncrease += 0.1;
        }

        // Update vibe level
        this.vibeLevel = Math.min(this.maxVibe, this.vibeLevel + vibeIncrease);

        // Decay over time
        this.vibeLevel *= Math.pow(this.decayRate, deltaTime);

        // Check for milestones
        this.checkMilestones(previousVibe, elapsedTime);

        // Update statistics
        this.updateStats(deltaTime, elapsedTime);

        // Update history
        this.updateHistory(elapsedTime);

        // Apply high-level effects
        this.applyHighLevelEffects();

        // Update UI
        if (this.vibeFill) {
            this.vibeFill.style.width = this.vibeLevel * 100 + '%';

            // Change color based on vibe level
            if (this.vibeLevel >= 0.75) {
                this.vibeFill.style.background =
                    'linear-gradient(90deg, #ff00ff, #ffff00, #ff0000)'; // High vibe - magenta/yellow/red
            } else if (this.vibeLevel >= 0.5) {
                this.vibeFill.style.background =
                    'linear-gradient(90deg, #00ff00, #ffff00, #ff00ff)'; // Medium vibe - green/yellow/magenta
            } else {
                this.vibeFill.style.background =
                    'linear-gradient(90deg, #00ff00, #ffff00, #ff00ff)'; // Low vibe - green/yellow/magenta
            }
        }
    }

    /**
     * Check for milestone achievements
     * @param {number} previousVibe - Previous vibe level
     * @param {number} elapsedTime - Elapsed time
     */
    checkMilestones(previousVibe, elapsedTime) {
        this.milestones.forEach((milestone) => {
            if (
                this.vibeLevel >= milestone &&
                previousVibe < milestone &&
                !this.reachedMilestones.has(milestone)
            ) {
                this.reachedMilestones.add(milestone);
                this.stats.milestoneCount++;
                this.triggerMilestoneCelebration(milestone, elapsedTime);
            }
        });
    }

    /**
     * Trigger milestone celebration effects
     * @param {number} milestone - Milestone value (0.25, 0.5, 0.75, 1.0)
     * @param {number} elapsedTime - Elapsed time
     */
    triggerMilestoneCelebration(milestone, elapsedTime) {
        const percentage = Math.round(milestone * 100);
        console.log(`🎉 Vibe milestone reached: ${percentage}%!`);

        // Trigger event for notifications/effects
        if (this.eventSystem && typeof this.eventSystem.emit === 'function') {
            this.eventSystem.emit('vibe.milestone', {
                milestone,
                percentage,
                vibeLevel: this.vibeLevel,
                timestamp: elapsedTime,
            });
        }

        // Visual celebration (screen flash, particles, etc.)
        if (typeof window !== 'undefined' && window.gameSystems?.notificationSystem) {
            window.gameSystems.notificationSystem.show(
                `Vibe Milestone: ${percentage}%!`,
                'success',
                3000
            );
        }

        // Unlock rewards at certain milestones
        this.checkRewards(milestone);
    }

    /**
     * Check and unlock rewards at milestones
     * @param {number} milestone - Milestone value
     */
    checkRewards(milestone) {
        if (milestone >= 0.5 && !this.unlockedRewards.has('medium')) {
            this.unlockedRewards.add('medium');
            // Unlock medium-level features
        }
        if (milestone >= 0.75 && !this.unlockedRewards.has('high')) {
            this.unlockedRewards.add('high');
            // Unlock high-level features
        }
        if (milestone >= 1.0 && !this.unlockedRewards.has('max')) {
            this.unlockedRewards.add('max');
            // Unlock maximum features
        }
    }

    /**
     * Update statistics
     * @param {number} deltaTime - Delta time
     * @param {number} elapsedTime - Elapsed time
     */
    updateStats(deltaTime, elapsedTime) {
        // Update peak vibe
        if (this.vibeLevel > this.stats.peakVibe) {
            this.stats.peakVibe = this.vibeLevel;
        }

        // Update average vibe (rolling average)
        const alpha = 0.01; // Smoothing factor
        this.stats.averageVibe = alpha * this.vibeLevel + (1 - alpha) * this.stats.averageVibe;

        // Track time at high vibe (above 0.75)
        if (this.vibeLevel >= 0.75) {
            this.stats.timeAtHighVibe += deltaTime;
            this.stats.lastHighVibeTime = elapsedTime;
        }

        // Total vibe time
        this.stats.totalVibeTime += deltaTime;
    }

    /**
     * Update history
     * @param {number} elapsedTime - Elapsed time
     */
    updateHistory(elapsedTime) {
        this.history.push({
            time: elapsedTime,
            vibe: this.vibeLevel,
        });

        // Keep history within limit
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * Apply high-level visual effects
     */
    applyHighLevelEffects() {
        if (this.vibeLevel >= 0.75) {
            // High vibe effects (can trigger particle bursts, screen effects, etc.)
            if (this.eventSystem && typeof this.eventSystem.emit === 'function' && Math.random() < 0.01) {
                // 1% chance per frame
                this.eventSystem.emit('vibe.high', {
                    vibeLevel: this.vibeLevel,
                });
            }
        }
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Get vibe history
     * @returns {Array} History array
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Get unlocked rewards
     * @returns {Set} Set of unlocked reward keys
     */
    getUnlockedRewards() {
        return new Set(this.unlockedRewards);
    }

    /**
     * Add vibe from collection
     * @param {number} amount - Amount to add (0-1)
     */
    addFromCollection(amount = 0.1) {
        this.vibeLevel = Math.min(this.maxVibe, this.vibeLevel + amount);
    }

    getVibeLevel() {
        return this.vibeLevel;
    }

    // Add vibe manually (for beat sync, etc.)
    addVibe(amount) {
        this.vibeLevel = Math.min(this.maxVibe, this.vibeLevel + amount);
    }
}
