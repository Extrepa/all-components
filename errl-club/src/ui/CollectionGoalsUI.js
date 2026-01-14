/**
 * CollectionGoalsUI - UI for collection goals and progress tracking
 *
 * Displays daily, session, and total collection goals
 * Shows progress toward goals and completion notifications
 *
 * @class CollectionGoalsUI
 * @extends BasePanel
 */
import { BasePanel } from './BasePanel.js';

export class CollectionGoalsUI extends BasePanel {
    /**
     * Create a CollectionGoalsUI instance
     * @param {Object} config - Configuration object
     * @param {CollectionTracker} config.collectionTracker - Collection tracker instance
     * @param {AchievementSystem} config.achievementSystem - Achievement system instance (optional)
     */
    constructor(config = {}) {
        super({
            id: 'collection-goals-ui',
            title: 'Collection Goals',
            ...config,
        });

        this.collectionTracker = config.collectionTracker;
        this.achievementSystem = config.achievementSystem;
        this.goals = {
            daily: [],
            session: [],
            total: [],
        };
        this.completedGoals = new Set();

        this.createUI();
        this.loadGoals();
    }

    createUI() {
        const container = document.createElement('div');
        container.className = 'collection-goals-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-radius: 8px;
            padding: 15px;
            color: #fff;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText =
            'margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #00ffff;';
        header.textContent = '🎯 Collection Goals';
        container.appendChild(header);

        // Daily Goals Section
        const dailySection = this.createGoalSection('Daily Goals', 'daily');
        container.appendChild(dailySection);

        // Session Goals Section
        const sessionSection = this.createGoalSection('Session Goals', 'session');
        container.appendChild(sessionSection);

        // Total Goals Section
        const totalSection = this.createGoalSection('Total Goals', 'total');
        container.appendChild(totalSection);

        // Add Goal Button
        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Goal';
        addButton.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-top: 15px;
            background: #00ffff;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;
        addButton.onclick = () => this.showAddGoalDialog();
        container.appendChild(addButton);

        this.container = container;
        this.dailySection = dailySection;
        this.sessionSection = sessionSection;
        this.totalSection = totalSection;

        // Initially hidden
        this.hide();
    }

    createGoalSection(title, type) {
        const section = document.createElement('div');
        section.className = `goal-section goal-section-${type}`;
        section.style.cssText = 'margin-bottom: 20px;';

        const sectionTitle = document.createElement('div');
        sectionTitle.style.cssText =
            'font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #00ffff;';
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);

        const goalsList = document.createElement('div');
        goalsList.className = 'goals-list';
        goalsList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
        section.appendChild(goalsList);

        section.goalsList = goalsList;
        return section;
    }

    loadGoals() {
        // Load goals from localStorage or create defaults
        const savedGoals = localStorage.getItem('collectionGoals');
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        } else {
            this.createDefaultGoals();
        }

        this.updateUI();
    }

    createDefaultGoals() {
        // Daily goals
        this.goals.daily = [
            { id: 'daily-1', type: 'drips', target: 10, current: 0, completed: false },
            { id: 'daily-2', type: 'fragments', target: 5, current: 0, completed: false },
        ];

        // Session goals
        this.goals.session = [
            { id: 'session-1', type: 'drips', target: 50, current: 0, completed: false },
            { id: 'session-2', type: 'bubbles', target: 20, current: 0, completed: false },
        ];

        // Total goals
        this.goals.total = [
            { id: 'total-1', type: 'drips', target: 100, current: 0, completed: false },
            { id: 'total-2', type: 'fragments', target: 50, current: 0, completed: false },
            { id: 'total-3', type: 'glowBalls', target: 25, current: 0, completed: false },
        ];
    }

    updateUI() {
        // Update daily goals
        this.updateGoalSection(this.dailySection, this.goals.daily, 'daily');

        // Update session goals
        this.updateGoalSection(this.sessionSection, this.goals.session, 'session');

        // Update total goals
        this.updateGoalSection(this.totalSection, this.goals.total, 'total');
    }

    updateGoalSection(section, goals, goalType) {
        const goalsList = section.querySelector('.goals-list');
        if (!goalsList) {
            return;
        }

        goalsList.innerHTML = '';

        if (goals.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'color: #888; font-style: italic;';
            emptyMsg.textContent = 'No goals set';
            goalsList.appendChild(emptyMsg);
            return;
        }

        goals.forEach((goal) => {
            const goalElement = this.createGoalElement(goal, goalType);
            goalsList.appendChild(goalElement);
        });
    }

    createGoalElement(goal, goalType) {
        const element = document.createElement('div');
        element.className = 'goal-item';
        element.style.cssText = `
            padding: 10px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid ${goal.completed ? '#00ff00' : '#00ffff'};
            border-radius: 4px;
        `;

        const progress = Math.min(goal.current / goal.target, 1.0);
        const percentage = Math.floor(progress * 100);

        element.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: bold;">${this.getCollectibleName(goal.type)}</span>
                <span style="color: ${goal.completed ? '#00ff00' : '#00ffff'};">
                    ${goal.completed ? '✓' : `${goal.current}/${goal.target}`}
                </span>
            </div>
            <div style="background: rgba(0, 0, 0, 0.5); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: ${goal.completed ? '#00ff00' : '#00ffff'}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
            </div>
            <div style="font-size: 10px; color: #888; margin-top: 5px;">${percentage}%</div>
        `;

        return element;
    }

    getCollectibleName(type) {
        const names = {
            drips: '💧 Drips',
            bubbles: '🫧 Bubbles',
            fragments: '✨ Fragments',
            glowBalls: '🌟 Glow Balls',
        };
        return names[type] || type;
    }

    updateProgress() {
        if (!this.collectionTracker) {
            // Try to get from window.gameSystems
            if (window.gameSystems?.collectionTracker) {
                this.collectionTracker = window.gameSystems.collectionTracker;
            } else {
                console.warn('CollectionGoalsUI: CollectionTracker not available');
                return;
            }
        }

        const stats = this.collectionTracker.getStats();

        // Map stats to goal types
        const statMap = {
            drips: stats.drips || stats.lifetimeStats?.drips || 0,
            bubbles: stats.bubbles || stats.lifetimeStats?.bubbles || 0,
            fragments: stats.fragments || stats.lifetimeStats?.fragments || 0,
            glowBalls: stats.glowBalls || stats.lifetimeStats?.glowBalls || 0,
        };

        // Update all goals
        ['daily', 'session', 'total'].forEach((goalType) => {
            this.goals[goalType].forEach((goal) => {
                let current = 0;
                if (goalType === 'session') {
                    // Use session stats
                    current = statMap[goal.type] || 0;
                } else if (goalType === 'total') {
                    // Use lifetime stats
                    current = statMap[goal.type] || 0;
                } else {
                    // Daily goals - use session stats for now
                    current = statMap[goal.type] || 0;
                }

                goal.current = current;

                // Check if goal is completed
                if (!goal.completed && current >= goal.target) {
                    goal.completed = true;
                    this.onGoalCompleted(goal);
                }
            });
        });

        this.updateUI();
        this.saveGoals();
    }

    onGoalCompleted(goal) {
        this.completedGoals.add(goal.id);

        // Show notification
        if (window.gameSystems?.notificationSystem) {
            window.gameSystems.notificationSystem.show(
                `Goal completed: ${this.getCollectibleName(goal.type)} (${goal.target})`,
                'success',
                3000
            );
        }

        // Trigger achievement if available
        if (this.achievementSystem) {
            this.achievementSystem.checkAchievements();
        }
    }

    showAddGoalDialog() {
        // Simple prompt for now - could be enhanced with a proper modal
        const type = prompt('Goal type (drips/bubbles/fragments/glowBalls):');
        const target = parseInt(prompt('Target amount:'));
        const goalType = prompt('Goal type (daily/session/total):');

        if (type && target && goalType && ['daily', 'session', 'total'].includes(goalType)) {
            this.addGoal(
                {
                    id: `${goalType}-${Date.now()}`,
                    type,
                    target,
                    current: 0,
                    completed: false,
                },
                goalType
            );
        }
    }

    addGoal(goal, goalType) {
        this.goals[goalType].push(goal);
        this.updateUI();
        this.saveGoals();
    }

    saveGoals() {
        localStorage.setItem('collectionGoals', JSON.stringify(this.goals));
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.updateProgress();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    toggle() {
        if (this.container.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
}
