/**
 * CollectionProgressUI - Displays collection progress and statistics
 *
 * Shows drips, bubbles, fragments, glow balls with session and lifetime stats
 */
import { BasePanel } from './BasePanel.js';
import { DESIGN_SYSTEM, generateTitleStyles } from './designSystem.js';

export class CollectionProgressUI extends BasePanel {
    /**
     * Create a new CollectionProgressUI
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.collectionTracker - CollectionTracker instance
     */
    constructor(config = {}) {
        super({
            id: 'collection_progress_ui',
            title: 'Collection Progress',
            position: { x: 100, y: 100 },
            size: { width: 500, height: 600 },
        });

        this.onClose = config.onClose || (() => {});
        this.collectionTracker = config.collectionTracker;
        this.streakSystem = config.streakSystem || null;

        // Update interval
        this.updateInterval = null;

        // Create UI content
        this.createContent();

        // Start auto-update
        this.startAutoUpdate();
    }

    /**
     * Create UI content
     * @private
     */
    createContent() {
        const content = this.getContentElement();
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-height: 550px;
            overflow-y: auto;
            padding-right: 8px;
        `;

        // Session stats section
        this.createSection(content, 'Session Statistics', () => {
            this.createSessionStats(content);
        });

        // Lifetime stats section
        this.createSection(content, 'Lifetime Statistics', () => {
            this.createLifetimeStats(content);
        });

        // Breakdown section
        this.createSection(content, 'Collection Breakdown', () => {
            this.createBreakdown(content);
        });

        // Streaks section
        this.createSection(content, 'Collection Streaks', () => {
            this.createStreaks(content);
        });
    }

    /**
     * Create a collapsible section
     * @private
     */
    createSection(container, title, contentCreator) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 16px;';

        const header = document.createElement('div');
        header.textContent = title;
        header.style.cssText = `
            ${generateTitleStyles({
                fontSize: '16px',
                marginBottom: '12px',
                paddingBottom: '8px',
            })}
        `;

        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        contentCreator(contentDiv);

        section.appendChild(header);
        section.appendChild(contentDiv);
        container.appendChild(section);
    }

    /**
     * Create session stats display
     * @private
     */
    createSessionStats(container) {
        if (!this.collectionTracker) {
            container.appendChild(this.createEmptyState('No collection tracker available'));
            return;
        }

        const stats = this.collectionTracker.getStats();
        const session = stats.session;

        this.createStatRow(container, 'Total Collected', session.total.toLocaleString(), '#00ff00');
        this.createStatRow(
            container,
            'Collection Rate',
            `${session.rate.toFixed(1)}/min`,
            '#00ffff'
        );
        this.createStatRow(
            container,
            'Session Duration',
            `${session.duration.toFixed(1)} min`,
            '#ffffff'
        );

        // Collection breakdown
        const breakdown = this.collectionTracker.getBreakdown();
        this.createStatRow(container, 'Drips', breakdown.session.drips.toLocaleString(), '#00ffff');
        this.createStatRow(
            container,
            'Bubbles',
            breakdown.session.bubbles.toLocaleString(),
            '#ffff00'
        );
        this.createStatRow(
            container,
            'Fragments',
            breakdown.session.fragments.toLocaleString(),
            '#ff00ff'
        );
        this.createStatRow(
            container,
            'Glow Balls',
            breakdown.session.glowBalls.toLocaleString(),
            '#00ff00'
        );
    }

    /**
     * Create lifetime stats display
     * @private
     */
    createLifetimeStats(container) {
        if (!this.collectionTracker) {
            container.appendChild(this.createEmptyState('No collection tracker available'));
            return;
        }

        const stats = this.collectionTracker.getStats();
        const lifetime = stats.lifetime;

        this.createStatRow(
            container,
            'Total Collections',
            lifetime.totalCollections.toLocaleString(),
            '#00ff00'
        );
        this.createStatRow(
            container,
            'Collection Rate',
            `${lifetime.rate.toFixed(1)}/min`,
            '#00ffff'
        );
        if (lifetime.duration > 0) {
            this.createStatRow(
                container,
                'Total Playtime',
                `${lifetime.duration.toFixed(1)} min`,
                '#ffffff'
            );
        }

        // Lifetime breakdown
        const breakdown = this.collectionTracker.getBreakdown();
        this.createStatRow(
            container,
            'Drips',
            breakdown.lifetime.drips.toLocaleString(),
            '#00ffff'
        );
        this.createStatRow(
            container,
            'Bubbles',
            breakdown.lifetime.bubbles.toLocaleString(),
            '#ffff00'
        );
        this.createStatRow(
            container,
            'Fragments',
            breakdown.lifetime.fragments.toLocaleString(),
            '#ff00ff'
        );
        this.createStatRow(
            container,
            'Glow Balls',
            breakdown.lifetime.glowBalls.toLocaleString(),
            '#00ff00'
        );
    }

    /**
     * Create breakdown display
     * @private
     */
    createBreakdown(container) {
        if (!this.collectionTracker) {
            container.appendChild(this.createEmptyState('No collection tracker available'));
            return;
        }

        const breakdown = this.collectionTracker.getBreakdown();
        const sessionTotal = this.collectionTracker.getSessionTotal();
        const lifetimeTotal = this.collectionTracker.getLifetimeTotal();

        // Session percentages
        if (sessionTotal > 0) {
            this.createPercentageRow(
                container,
                'Drips',
                breakdown.session.drips,
                sessionTotal,
                '#00ffff'
            );
            this.createPercentageRow(
                container,
                'Bubbles',
                breakdown.session.bubbles,
                sessionTotal,
                '#ffff00'
            );
            this.createPercentageRow(
                container,
                'Fragments',
                breakdown.session.fragments,
                sessionTotal,
                '#ff00ff'
            );
            this.createPercentageRow(
                container,
                'Glow Balls',
                breakdown.session.glowBalls,
                sessionTotal,
                '#00ff00'
            );
        }
    }

    /**
     * Create streaks display
     * @private
     */
    createStreaks(container) {
        if (!this.streakSystem && !this.collectionTracker) {
            container.appendChild(this.createEmptyState('No streak system available'));
            return;
        }

        // Use CollectionStreakSystem if available, otherwise fall back to CollectionTracker
        if (this.streakSystem) {
            const streakInfo = this.streakSystem.getStreakInfo();
            this.createStatRow(
                container,
                'Current Streak',
                streakInfo.streak.toLocaleString(),
                '#00ff00'
            );
            this.createStatRow(
                container,
                'Current Combo',
                streakInfo.combo.toLocaleString(),
                '#ffff00'
            );
            this.createStatRow(
                container,
                'Combo Multiplier',
                `x${streakInfo.multiplier.toFixed(1)}`,
                '#ff00ff'
            );
            this.createStatRow(
                container,
                'Time Remaining',
                `${streakInfo.timeRemaining.toFixed(1)}s`,
                '#00ffff'
            );
            this.createStatRow(
                container,
                'Longest Streak',
                streakInfo.stats.longestStreak.toLocaleString(),
                '#ffaa00'
            );
            this.createStatRow(
                container,
                'Highest Combo',
                streakInfo.stats.highestCombo.toLocaleString(),
                '#ffaa00'
            );
        } else if (this.collectionTracker) {
            const stats = this.collectionTracker.getStats();
            const streaks = stats.streaks;
            this.createStatRow(
                container,
                'Current Streak',
                streaks.current.toLocaleString(),
                '#00ff00'
            );
            this.createStatRow(container, 'Best Streak', streaks.best.toLocaleString(), '#ffaa00');
        }
    }

    /**
     * Create a stat row
     * @private
     */
    createStatRow(container, label, value, valueColor = '#ffffff') {
        const row = document.createElement('div');
        row.style.cssText =
            'display: flex; justify-content: space-between; align-items: center; padding: 4px 0;';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'color: #aaa; font-size: 14px;';

        const valueEl = document.createElement('span');
        valueEl.textContent = value;
        valueEl.style.cssText = `color: ${valueColor}; font-size: 14px; font-weight: bold;`;

        row.appendChild(labelEl);
        row.appendChild(valueEl);
        container.appendChild(row);
    }

    /**
     * Create a percentage row with progress bar
     * @private
     */
    createPercentageRow(container, label, value, total, color) {
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom: 8px;';

        const header = document.createElement('div');
        header.style.cssText =
            'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'color: #aaa; font-size: 12px;';

        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const valueEl = document.createElement('span');
        valueEl.textContent = `${value} (${percent}%)`;
        valueEl.style.cssText = `color: ${color}; font-size: 12px; font-weight: bold;`;

        header.appendChild(labelEl);
        header.appendChild(valueEl);

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: ${percent}%;
            background: ${color};
            transition: width 0.3s ease;
        `;

        progressBar.appendChild(progressFill);

        row.appendChild(header);
        row.appendChild(progressBar);
        container.appendChild(row);
    }

    /**
     * Create empty state message
     * @private
     */
    createEmptyState(message) {
        const empty = document.createElement('div');
        empty.textContent = message;
        empty.style.cssText = 'color: #888; font-size: 14px; text-align: center; padding: 20px;';
        return empty;
    }

    /**
     * Update the UI with latest stats
     */
    update() {
        if (!this.collectionTracker) {
            return;
        }

        // Recreate content with updated stats
        const content = this.getContentElement();
        content.innerHTML = '';
        this.createContent();
    }

    /**
     * Start auto-update interval
     * @private
     */
    startAutoUpdate() {
        // Update every 2 seconds
        this.updateInterval = setInterval(() => {
            if (this.isVisible()) {
                this.update();
            }
        }, 2000);
    }

    /**
     * Stop auto-update interval
     * @private
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Show the UI
     */
    show() {
        super.show();
        this.update();
    }

    /**
     * Hide the UI
     */
    hide() {
        super.hide();
    }

    /**
     * Destroy the UI
     */
    destroy() {
        this.stopAutoUpdate();
        super.destroy();
    }
}
