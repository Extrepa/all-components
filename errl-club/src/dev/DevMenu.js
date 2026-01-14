/**
 * DevMenu - Comprehensive development menu for real-time testing
 *
 * Provides sliders and switches for all movement, camera, visual effects,
 * avatar, physics, and audio parameters with live position tracking.
 */
import * as THREE from 'three';
import { BasePanel } from '../ui/BasePanel.js';
import { Slider } from '../ui/components/Slider.js';
import { Button } from '../ui/components/Button.js';
import { Dropdown } from '../ui/components/Dropdown.js';
import { MOVEMENT_CONFIG, CAMERA_CONFIG, AUDIO_CONFIG } from '../config/constants.js';

export class DevMenu extends BasePanel {
    constructor(systems = {}) {
        super({
            id: 'dev_menu',
            title: 'Dev Menu',
            position: { x: 50, y: 50 },
            size: { width: 650, height: 900 },
            style: {
                overflowY: 'auto',
                maxHeight: '90vh',
            },
        });

        // Task 4.3: Store performanceOptimizer in systems if provided
        this.systems = systems;
        if (systems.performanceOptimizer) {
            this.systems.performanceOptimizer = systems.performanceOptimizer;
        }
        this.markedPositions = [];
        this.collapsedSections = new Set();
        this.activeTab = 'movement'; // Default tab
        this.tabs = {
            movement: 'Movement & Camera',
            effects: 'Visual Effects & Avatar',
            physics: 'Physics & Audio',
            debug: 'Debug & Tools',
        };
        this.presets = {
            // Movement presets
            Snappy: {
                walkSpeed: 6.0,
                runSpeed: 12.0,
                acceleration: 80.0,
                deceleration: 90.0,
                rotationSpeed: 4.0,
                friction: 0.9,
            },
            Smooth: {
                walkSpeed: 4.0,
                runSpeed: 8.0,
                acceleration: 30.0,
                deceleration: 40.0,
                rotationSpeed: 2.0,
                friction: 0.98,
            },
            Arcade: {
                walkSpeed: 7.0,
                runSpeed: 15.0,
                acceleration: 100.0,
                deceleration: 100.0,
                rotationSpeed: 5.0,
                friction: 0.85,
            },
            Default: {
                walkSpeed: 5.0,
                runSpeed: 10.0,
                acceleration: 50.0,
                deceleration: 60.0,
                rotationSpeed: 3.0,
                friction: 0.95,
            },
        };
        this.currentPresetName = null;

        // Store default values for reset
        this.defaultValues = {};

        // Load marked positions from localStorage
        this.loadMarkedPositions();
        this.loadPresets(); // This will merge with saved presets

        // Load active tab from localStorage
        const savedTab = localStorage.getItem('devMenu_activeTab');
        if (savedTab && this.tabs[savedTab]) {
            this.activeTab = savedTab;
        }

        // Create UI
        this.createContent();

        // Override update to track position
        this.onUpdate = (deltaTime) => {
            this.updatePositionDisplay();
        };
    }

    /**
     * Create all UI content with tabs
     */
    createContent() {
        const content = this.getContentElement();
        content.innerHTML = '';
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            height: 100%;
        `;

        // Create tab bar
        this.createTabBar(content);

        // Create tab content containers
        this.tabContainers = {};
        Object.keys(this.tabs).forEach((tabId) => {
            const tabContainer = document.createElement('div');
            tabContainer.id = `devmenu-tab-${tabId}`;
            tabContainer.className = 'devmenu-tab-content';
            tabContainer.style.cssText = `
                display: ${tabId === this.activeTab ? 'flex' : 'none'};
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                overflow-y: auto;
                flex: 1;
            `;
            content.appendChild(tabContainer);
            this.tabContainers[tabId] = tabContainer;
        });

        // Create content for each tab
        this.createMovementTab();
        this.createEffectsTab();
        this.createPhysicsTab();
        this.createDebugTab();
    }

    /**
     * Create tab bar navigation
     */
    createTabBar(container) {
        const tabBar = document.createElement('div');
        tabBar.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 8px;
            background: rgba(0, 255, 255, 0.1);
            border-bottom: 2px solid #00ffff;
        `;

        Object.entries(this.tabs).forEach(([tabId, tabName]) => {
            const tabButton = document.createElement('button');
            tabButton.textContent = tabName;
            tabButton.dataset.tabId = tabId;
            tabButton.style.cssText = `
                flex: 1;
                padding: 8px 12px;
                background: ${tabId === this.activeTab ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
                border: 1px solid #00ffff;
                border-radius: 4px;
                color: #00ffff;
                font-weight: ${tabId === this.activeTab ? 'bold' : 'normal'};
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
            `;

            tabButton.addEventListener('mouseenter', () => {
                if (tabId !== this.activeTab) {
                    tabButton.style.background = 'rgba(0, 255, 255, 0.2)';
                }
            });
            tabButton.addEventListener('mouseleave', () => {
                if (tabId !== this.activeTab) {
                    tabButton.style.background = 'rgba(0, 0, 0, 0.3)';
                }
            });

            tabButton.addEventListener('click', () => {
                this.switchTab(tabId);
            });

            tabBar.appendChild(tabButton);
        });

        container.appendChild(tabBar);
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabId) {
        if (!this.tabs[tabId] || tabId === this.activeTab) {
            return;
        }

        // Update active tab
        this.activeTab = tabId;
        localStorage.setItem('devMenu_activeTab', tabId);

        // Update tab buttons
        const tabBar = this.getContentElement().querySelector('div:first-child');
        tabBar.querySelectorAll('button').forEach((btn) => {
            const btnTabId = btn.dataset.tabId;
            if (btnTabId === tabId) {
                btn.style.background = 'rgba(0, 255, 255, 0.3)';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = 'rgba(0, 0, 0, 0.3)';
                btn.style.fontWeight = 'normal';
            }
        });

        // Show/hide tab containers
        Object.keys(this.tabs).forEach((id) => {
            const container = this.tabContainers[id];
            if (container) {
                container.style.display = id === tabId ? 'flex' : 'none';
            }
        });
    }

    /**
     * Create Movement & Camera tab content
     */
    createMovementTab() {
        const container = this.tabContainers.movement;
        if (!container) {
            return;
        }

        // 5 Big Buttons
        this.createBigButtons(container, 'movement', [
            { text: 'Reset Movement', action: () => this.resetMovement() },
            { text: 'Reset Camera', action: () => this.resetCamera() },
            { text: 'Load Preset', action: () => this.loadPresetDialog() },
            { text: 'Save Preset', action: () => this.savePresetDialog() },
            { text: 'Teleport to Marked', action: () => this.teleportToMarked() },
        ]);

        // Position Tracker
        this.createPositionTracker(container);

        // Movement and Camera sections
        this.createMovementSection(container);
        this.createCameraSection(container);
    }

    /**
     * Create Visual Effects & Avatar tab content
     */
    createEffectsTab() {
        const container = this.tabContainers.effects;
        if (!container) {
            return;
        }

        // 5 Big Buttons
        this.createBigButtons(container, 'effects', [
            { text: 'Reset Effects', action: () => this.resetEffects() },
            { text: 'Reset Avatar', action: () => this.resetAvatar() },
            { text: 'Apply Style', action: () => this.applyStyle() },
            { text: 'Randomize Avatar', action: () => this.randomizeAvatar() },
            { text: 'Export Settings', action: () => this.exportSettings() },
        ]);

        // Visual Effects and Avatar sections
        this.createVisualEffectsSection(container);
        this.createAvatarSection(container);
    }

    /**
     * Create Physics & Audio tab content
     */
    createPhysicsTab() {
        const container = this.tabContainers.physics;
        if (!container) {
            return;
        }

        // 5 Big Buttons
        this.createBigButtons(container, 'physics', [
            { text: 'Reset Physics', action: () => this.resetPhysics() },
            { text: 'Reset Audio', action: () => this.resetAudio() },
            { text: 'Test Physics', action: () => this.testPhysics() },
            { text: 'Test Audio', action: () => this.testAudio() },
            { text: 'Export Config', action: () => this.exportConfig() },
        ]);

        // Physics and Audio sections
        this.createPhysicsSection(container);
        this.createAudioSection(container);
    }

    /**
     * Create Debug & Tools tab content
     */
    createDebugTab() {
        const container = this.tabContainers.debug;
        if (!container) {
            return;
        }

        // 5 Big Buttons
        this.createBigButtons(container, 'debug', [
            { text: 'Mark Position', action: () => this.markPosition() },
            { text: 'Copy Position', action: () => this.copyPosition() },
            { text: 'Load Preset', action: () => this.loadPresetDialog() },
            { text: 'Save Preset', action: () => this.savePresetDialog() },
            { text: 'Reset All', action: () => this.resetAll() },
        ]);

        // Position Tracker (also in debug tab)
        this.createPositionTracker(container);

        // Preset controls
        this.createPresetControls(container);

        // Marked positions list (enhanced)
        this.createMarkedPositionsList(container);

        // Task 4.3: Performance Optimizer controls
        this.createPerformanceOptimizerSection(container);

        // Global reset
        this.createGlobalReset(container);
    }

    /**
     * Create 5 big buttons for a tab
     */
    createBigButtons(container, tabId, buttons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 15px;
        `;

        buttons.forEach((btn, index) => {
            const button = new Button({
                text: btn.text,
                onClick: btn.action,
                style: {
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: 'rgba(0, 255, 255, 0.2)',
                    borderColor: '#00ffff',
                    color: '#00ffff',
                },
            });
            const btnEl = button.getElement();
            btnEl.style.cssText += `
                padding: 12px 8px;
                font-size: 11px;
                font-weight: bold;
                background: rgba(0, 255, 255, 0.2);
                border: 2px solid #00ffff;
                border-radius: 6px;
                color: #00ffff;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            `;
            btnEl.addEventListener('mouseenter', () => {
                btnEl.style.background = 'rgba(0, 255, 255, 0.4)';
                btnEl.style.transform = 'scale(1.05)';
            });
            btnEl.addEventListener('mouseleave', () => {
                btnEl.style.background = 'rgba(0, 255, 255, 0.2)';
                btnEl.style.transform = 'scale(1)';
            });
            buttonContainer.appendChild(btnEl);
        });

        container.appendChild(buttonContainer);
    }

    /**
     * Helper methods for big buttons
     */
    resetMovement() {
        if (confirm('Reset all movement parameters to defaults?')) {
            // Reset movement sliders
            if (this.sliders) {
                if (this.sliders.walkSpeed) {
                    this.sliders.walkSpeed.setValue(MOVEMENT_CONFIG.defaultSpeed);
                }
                if (this.sliders.runSpeed) {
                    this.sliders.runSpeed.setValue(MOVEMENT_CONFIG.runSpeed);
                }
                if (this.sliders.acceleration) {
                    this.sliders.acceleration.setValue(MOVEMENT_CONFIG.acceleration);
                }
                if (this.sliders.deceleration) {
                    this.sliders.deceleration.setValue(MOVEMENT_CONFIG.deceleration);
                }
                if (this.sliders.friction) {
                    this.sliders.friction.setValue(0.95);
                }
                if (this.sliders.hopHeight) {
                    this.sliders.hopHeight.setValue(1.2);
                }
                if (this.sliders.dashDistance) {
                    this.sliders.dashDistance.setValue(2.0);
                }
                if (this.sliders.dashSpeed) {
                    this.sliders.dashSpeed.setValue(0.5);
                }
                if (this.sliders.rotationSpeed) {
                    this.sliders.rotationSpeed.setValue(3.0);
                }
                if (this.sliders.crouchSpeedModifier) {
                    this.sliders.crouchSpeedModifier.setValue(0.5);
                }
            }
        }
    }

    resetCamera() {
        if (this.systems.cameraController && this.systems.cameraController.settings) {
            if (confirm('Reset all camera parameters to defaults?')) {
                this.systems.cameraController.settings.reset();
                this.systems.cameraController.applySettings();
                // Refresh camera sliders
                this.createCameraSection(this.tabContainers.movement);
            }
        }
    }

    resetEffects() {
        if (confirm('Reset all visual effects to defaults?')) {
            // Reset visual effects sliders
            if (this.sliders) {
                // Reset all effect intensity sliders
                Object.keys(this.sliders).forEach((key) => {
                    if (key.includes('Effect') || key.includes('Intensity')) {
                        // Reset to default values
                    }
                });
            }
        }
    }

    resetAvatar() {
        if (confirm('Reset all avatar parameters to defaults?')) {
            // Reset avatar sliders
            if (this.systems.avatar) {
                // Reset avatar properties
            }
        }
    }

    resetPhysics() {
        if (confirm('Reset all physics parameters to defaults?')) {
            // Reset physics sliders
        }
    }

    resetAudio() {
        if (confirm('Reset all audio parameters to defaults?')) {
            // Reset audio sliders
        }
    }

    resetAll() {
        if (confirm('Reset ALL parameters to defaults? This cannot be undone.')) {
            this.resetMovement();
            this.resetCamera();
            this.resetEffects();
            this.resetAvatar();
            this.resetPhysics();
            this.resetAudio();
        }
    }

    loadPresetDialog() {
        const presetNames = Object.keys(this.presets);
        if (presetNames.length === 0) {
            alert('No presets available. Save a preset first.');
            return;
        }
        const presetName = prompt(`Load preset:\n${presetNames.join(', ')}`);
        if (presetName && this.presets[presetName]) {
            this.loadPreset(presetName);
        }
    }

    savePresetDialog() {
        const name = prompt('Enter preset name:');
        if (name) {
            this.savePreset(name);
            alert(`Preset "${name}" saved!`);
        }
    }

    teleportToMarked() {
        if (this.markedPositions.length === 0) {
            alert('No marked positions. Mark a position first.');
            return;
        }
        const positions = this.markedPositions.map((p, i) => `${i + 1}. ${p.label}`).join('\n');
        const choice = prompt(`Teleport to:\n${positions}\n\nEnter number:`);
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < this.markedPositions.length) {
            const pos = this.markedPositions[index];
            if (this.systems.avatar) {
                this.systems.avatar.position.set(pos.x, pos.y, pos.z);
                this.systems.avatar.velocity.set(0, 0, 0);
            }
        }
    }

    applyStyle() {
        // Apply visual style preset
        alert('Style application - to be implemented');
    }

    randomizeAvatar() {
        if (this.systems.avatar && this.systems.avatar.randomizeColorVariant) {
            this.systems.avatar.randomizeColorVariant();
        }
    }

    exportSettings() {
        const settings = this.captureAllSettings();
        const json = JSON.stringify(settings, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            alert('Settings copied to clipboard!');
        });
    }

    exportConfig() {
        const config = {
            movement: MOVEMENT_CONFIG,
            presets: this.presets,
            markedPositions: this.markedPositions,
        };
        const json = JSON.stringify(config, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            alert('Config copied to clipboard!');
        });
    }

    testPhysics() {
        // Test physics system
        console.log('Testing physics...');
    }

    testAudio() {
        // Test audio system
        console.log('Testing audio...');
    }

    /**
     * Create marked positions list (enhanced for debug tab)
     */
    createMarkedPositionsList(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Marked Positions';
        title.style.cssText = `
            color: #00ffff;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 16px;
        `;
        section.appendChild(title);

        // Marked positions list
        this.markedPositionsContainer = document.createElement('div');
        this.markedPositionsContainer.id = 'dev-marked-positions';
        this.markedPositionsContainer.style.cssText = `
            max-height: 200px;
            overflow-y: auto;
        `;
        this.updateMarkedPositionsList();
        section.appendChild(this.markedPositionsContainer);

        container.appendChild(section);
    }

    /**
     * Create position tracker section
     */
    createPositionTracker(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Position Tracker';
        title.style.cssText = `
            color: #00ffff;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 16px;
        `;
        section.appendChild(title);

        // Position display
        if (!this.positionDisplay) {
            this.positionDisplay = document.createElement('div');
            this.positionDisplay.id = 'dev-position-display';
            this.positionDisplay.textContent = 'X: 0.00, Y: 0.50, Z: 0.00';
            this.positionDisplay.style.cssText = `
                color: #ffffff;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                margin-bottom: 8px;
            `;
        }
        section.appendChild(this.positionDisplay);

        container.appendChild(section);
    }

    /**
     * Update position display
     */
    updatePositionDisplay() {
        if (!this.positionDisplay || !this.systems.avatar) {
            return;
        }

        const pos = this.systems.avatar.position;
        this.positionDisplay.textContent = `X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`;
    }

    /**
     * Copy current position to clipboard
     */
    copyPosition() {
        if (!this.systems.avatar) {
            return;
        }

        const pos = this.systems.avatar.position;
        const text = `${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`;

        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('Position copied to clipboard:', text);
            })
            .catch((err) => {
                console.error('Failed to copy position:', err);
            });
    }

    /**
     * Mark current position
     */
    markPosition() {
        if (!this.systems.avatar) {
            return;
        }

        const pos = this.systems.avatar.position;
        const label =
            prompt('Enter label for this position (optional):') ||
            `Position ${this.markedPositions.length + 1}`;

        this.markedPositions.push({
            x: pos.x,
            y: pos.y,
            z: pos.z,
            label: label,
            timestamp: Date.now(),
        });

        this.saveMarkedPositions();
        this.updateMarkedPositionsList();
    }

    /**
     * Update marked positions list display
     */
    updateMarkedPositionsList() {
        if (!this.markedPositionsContainer) {
            return;
        }

        this.markedPositionsContainer.innerHTML = '';

        if (this.markedPositions.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'No marked positions';
            emptyMsg.style.cssText = 'color: #888; font-size: 12px; font-style: italic;';
            this.markedPositionsContainer.appendChild(emptyMsg);
            return;
        }

        this.markedPositions.forEach((pos, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 8px;
                margin: 2px 0;
                background: rgba(0, 255, 255, 0.05);
                border-radius: 3px;
                font-size: 12px;
            `;

            const label = document.createElement('span');
            label.textContent = `${pos.label}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
            label.style.color = '#ffffff';
            item.appendChild(label);

            const deleteBtn = new Button({
                text: '×',
                onClick: () => {
                    this.markedPositions.splice(index, 1);
                    this.saveMarkedPositions();
                    this.updateMarkedPositionsList();
                },
                style: {
                    padding: '2px 8px',
                    fontSize: '14px',
                    minWidth: 'auto',
                },
            });
            deleteBtn.getElement().style.cssText +=
                'padding: 2px 8px; font-size: 14px; min-width: auto;';
            item.appendChild(deleteBtn.getElement());

            this.markedPositionsContainer.appendChild(item);
        });
    }

    /**
     * Save marked positions to localStorage
     */
    saveMarkedPositions() {
        try {
            localStorage.setItem('devMenu_markedPositions', JSON.stringify(this.markedPositions));
        } catch (e) {
            console.warn('Failed to save marked positions:', e);
        }
    }

    /**
     * Load marked positions from localStorage
     */
    loadMarkedPositions() {
        try {
            const saved = localStorage.getItem('devMenu_markedPositions');
            if (saved) {
                this.markedPositions = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load marked positions:', e);
        }
    }

    /**
     * Create preset controls
     */
    createPresetControls(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid #00ffff;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Presets';
        title.style.cssText = `
            color: #00ffff;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        section.appendChild(title);

        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        `;

        // Preset dropdown
        const presetOptions = [
            { value: '', label: '-- Select Preset --' },
            ...Object.keys(this.presets).map((key) => ({ value: key, label: key })),
        ];

        const presetDropdown = new Dropdown({
            label: 'Load Preset',
            options: presetOptions,
            value: '',
            onChange: (value) => {
                if (value) {
                    this.loadPreset(value);
                }
            },
        });
        controls.appendChild(presetDropdown.getElement());

        // Save preset button
        const savePresetBtn = new Button({
            text: 'Save Current',
            onClick: () => {
                const name = prompt('Enter preset name:');
                if (name) {
                    this.savePreset(name);
                    // Refresh dropdown
                    presetDropdown.removeOption('');
                    presetDropdown.addOption('', '-- Select Preset --');
                    Object.keys(this.presets).forEach((key) => {
                        presetDropdown.addOption(key, key);
                    });
                }
            },
        });
        controls.appendChild(savePresetBtn.getElement());

        section.appendChild(controls);
        container.appendChild(section);
    }

    /**
     * Save current settings as preset
     */
    savePreset(name) {
        const settings = this.captureAllSettings();
        this.presets[name] = settings;
        this.savePresets();
    }

    /**
     * Load preset
     */
    loadPreset(name) {
        if (!this.presets[name]) {
            return;
        }

        const settings = this.presets[name];
        this.applyAllSettings(settings);
        this.currentPresetName = name;
    }

    /**
     * Capture all current settings
     */
    captureAllSettings() {
        const settings = {};

        // Capture slider values
        if (this.sliders) {
            Object.keys(this.sliders).forEach((key) => {
                if (this.sliders[key] && typeof this.sliders[key].getValue === 'function') {
                    settings[key] = this.sliders[key].getValue();
                }
            });
        }

        // Capture switch values
        if (this.switches) {
            Object.keys(this.switches).forEach((key) => {
                if (this.switches[key]) {
                    settings[key] = this.switches[key].isToggled || false;
                }
            });
        }

        return settings;
    }

    /**
     * Apply all settings
     */
    applyAllSettings(settings) {
        Object.keys(settings).forEach((key) => {
            if (this.sliders && this.sliders[key]) {
                this.sliders[key].setValue(settings[key]);
            } else if (this.switches && this.switches[key]) {
                if (settings[key]) {
                    this.switches[key].toggle();
                }
            }
        });
    }

    /**
     * Save presets to localStorage
     */
    savePresets() {
        try {
            localStorage.setItem('devMenu_presets', JSON.stringify(this.presets));
        } catch (e) {
            console.warn('Failed to save presets:', e);
        }
    }

    /**
     * Load presets from localStorage
     */
    loadPresets() {
        try {
            const saved = localStorage.getItem('devMenu_presets');
            if (saved) {
                this.presets = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load presets:', e);
        }
    }

    /**
     * Create collapsible section
     */
    createCollapsibleSection(container, title, contentCallback) {
        const section = document.createElement('div');
        section.style.cssText = `
            border: 1px solid #00ffff;
            border-radius: 4px;
            margin-bottom: 10px;
            overflow: hidden;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: rgba(0, 255, 255, 0.1);
            padding: 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
        `;

        const titleElement = document.createElement('div');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            color: #00ffff;
            font-weight: bold;
        `;
        header.appendChild(titleElement);

        const toggleIcon = document.createElement('span');
        toggleIcon.textContent = '▼';
        toggleIcon.style.cssText = `
            color: #00ffff;
            transition: transform 0.2s;
        `;
        header.appendChild(toggleIcon);

        const content = document.createElement('div');
        content.style.cssText = `
            padding: 10px;
            display: block;
        `;

        const sectionId = title.toLowerCase().replace(/\s+/g, '_');
        const isCollapsed = this.collapsedSections.has(sectionId);

        if (isCollapsed) {
            content.style.display = 'none';
            toggleIcon.style.transform = 'rotate(-90deg)';
        }

        header.addEventListener('click', () => {
            const collapsed = this.collapsedSections.has(sectionId);
            if (collapsed) {
                this.collapsedSections.delete(sectionId);
                content.style.display = 'block';
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                this.collapsedSections.add(sectionId);
                content.style.display = 'none';
                toggleIcon.style.transform = 'rotate(-90deg)';
            }
        });

        // Create content
        contentCallback(content);

        // Add reset button
        const resetBtn = new Button({
            text: 'Reset Section',
            onClick: () => this.resetSection(sectionId),
        });
        resetBtn.getElement().style.cssText += 'margin-top: 10px;';
        content.appendChild(resetBtn.getElement());

        section.appendChild(header);
        section.appendChild(content);
        container.appendChild(section);

        return { section, content };
    }

    /**
     * Create movement parameters section
     */
    createMovementSection(container) {
        this.sliders = this.sliders || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Movement Parameters',
            (content) => {
                // Walk Speed
                const walkSpeedSlider = new Slider({
                    label: 'Walk Speed',
                    min: 0,
                    max: 20,
                    step: 0.1,
                    value: MOVEMENT_CONFIG.defaultSpeed,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        MOVEMENT_CONFIG.defaultSpeed = value;
                        if (this.systems.avatar) {
                            this.systems.avatar.speed = value;
                        }
                    },
                });
                this.sliders.walkSpeed = walkSpeedSlider;
                content.appendChild(walkSpeedSlider.getElement());

                // Run Speed
                const runSpeedSlider = new Slider({
                    label: 'Run Speed',
                    min: 0,
                    max: 30,
                    step: 0.1,
                    value: MOVEMENT_CONFIG.runSpeed,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        MOVEMENT_CONFIG.runSpeed = value;
                        if (this.systems.avatar) {
                            this.systems.avatar.runSpeed = value;
                        }
                    },
                });
                this.sliders.runSpeed = runSpeedSlider;
                content.appendChild(runSpeedSlider.getElement());

                // Acceleration
                const accelSlider = new Slider({
                    label: 'Acceleration',
                    min: 0,
                    max: 100,
                    step: 1,
                    value: MOVEMENT_CONFIG.acceleration,
                    format: (v) => v.toFixed(0),
                    onChange: (value) => {
                        MOVEMENT_CONFIG.acceleration = value;
                    },
                });
                this.sliders.acceleration = accelSlider;
                content.appendChild(accelSlider.getElement());

                // Deceleration
                const decelSlider = new Slider({
                    label: 'Deceleration',
                    min: 0,
                    max: 100,
                    step: 1,
                    value: MOVEMENT_CONFIG.deceleration,
                    format: (v) => v.toFixed(0),
                    onChange: (value) => {
                        MOVEMENT_CONFIG.deceleration = value;
                    },
                });
                this.sliders.deceleration = decelSlider;
                content.appendChild(decelSlider.getElement());

                // Friction (avatar property)
                const frictionSlider = new Slider({
                    label: 'Friction',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: 0.95,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        // Store for avatar if needed
                        if (this.systems.avatar) {
                            this.systems.avatar.friction = value;
                        }
                    },
                });
                this.sliders.friction = frictionSlider;
                content.appendChild(frictionSlider.getElement());

                // Hop Height
                const hopHeightSlider = new Slider({
                    label: 'Hop Height',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    value: 1.2,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.avatar) {
                            this.systems.avatar.hopHeight = value;
                        }
                    },
                });
                this.sliders.hopHeight = hopHeightSlider;
                content.appendChild(hopHeightSlider.getElement());

                // Dash Distance
                const dashDistSlider = new Slider({
                    label: 'Dash Distance',
                    min: 0,
                    max: 5,
                    step: 0.1,
                    value: 2.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.avatar) {
                            this.systems.avatar.dashDistance = value;
                        }
                    },
                });
                this.sliders.dashDistance = dashDistSlider;
                content.appendChild(dashDistSlider.getElement());

                // Rotation Speed
                const rotationSpeedSlider = new Slider({
                    label: 'Rotation Speed',
                    min: 0.5,
                    max: 10,
                    step: 0.1,
                    value: 3.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.updateManager) {
                            this.systems.updateManager.setRotationSpeed(value);
                        }
                    },
                });
                this.sliders.rotationSpeed = rotationSpeedSlider;
                content.appendChild(rotationSpeedSlider.getElement());

                // Dash Speed
                const dashSpeedSlider = new Slider({
                    label: 'Dash Speed',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.avatar) {
                            this.systems.avatar.dashSpeed = value;
                        }
                    },
                });
                this.sliders.dashSpeed = dashSpeedSlider;
                content.appendChild(dashSpeedSlider.getElement());

                // Rotation Speed (A/D keys) - removed duplicate, using rotationSpeedSlider above

                // Crouch Speed Modifier
                const crouchSpeedSlider = new Slider({
                    label: 'Crouch Speed Modifier',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: 0.5,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        if (this.systems.avatar) {
                            this.systems.avatar.crouchSpeedModifier = value;
                        }
                    },
                });
                this.sliders.crouchSpeedModifier = crouchSpeedSlider;
                content.appendChild(crouchSpeedSlider.getElement());
            }
        );
    }

    /**
     * Create camera parameters section
     */
    createCameraSection(container) {
        this.sliders = this.sliders || {};
        this.switches = this.switches || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Camera Parameters',
            (content) => {
                if (!this.systems.cameraController || !this.systems.cameraController.settings) {
                    const msg = document.createElement('div');
                    msg.textContent = 'Camera controller not available';
                    msg.style.color = '#888';
                    content.appendChild(msg);
                    return;
                }

                const settings = this.systems.cameraController.settings;
                const getSettings = () => settings.getSettings();
                const updateSettings = (key, value) => {
                    const s = getSettings();
                    s[key] = value;
                    settings.updateSetting(key, value);
                    this.systems.cameraController.applySettings();
                };

                // Sensitivity
                const sensitivitySlider = new Slider({
                    label: 'Sensitivity',
                    min: 0.001,
                    max: 0.05,
                    step: 0.001,
                    value: getSettings().sensitivity || 0.01,
                    format: (v) => v.toFixed(3),
                    onChange: (value) => updateSettings('sensitivity', value),
                });
                this.sliders.cameraSensitivity = sensitivitySlider;
                content.appendChild(sensitivitySlider.getElement());

                // Zoom Speed
                const zoomSpeedSlider = new Slider({
                    label: 'Zoom Speed',
                    min: 0.1,
                    max: 2.0,
                    step: 0.1,
                    value: getSettings().zoomSpeed || 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('zoomSpeed', value),
                });
                this.sliders.cameraZoomSpeed = zoomSpeedSlider;
                content.appendChild(zoomSpeedSlider.getElement());

                // Auto-Align Speed
                const autoAlignSlider = new Slider({
                    label: 'Auto-Align Speed',
                    min: 0.5,
                    max: 8.0,
                    step: 0.5,
                    value: getSettings().autoAlignSpeed || 2.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('autoAlignSpeed', value),
                });
                this.sliders.cameraAutoAlignSpeed = autoAlignSlider;
                content.appendChild(autoAlignSlider.getElement());

                // Spring Stiffness
                const springStiffSlider = new Slider({
                    label: 'Spring Stiffness',
                    min: 0.01,
                    max: 0.5,
                    step: 0.01,
                    value: getSettings().springStiffness || 0.15,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('springStiffness', value),
                });
                this.sliders.cameraSpringStiffness = springStiffSlider;
                content.appendChild(springStiffSlider.getElement());

                // Spring Damping
                const springDampSlider = new Slider({
                    label: 'Spring Damping',
                    min: 0.1,
                    max: 1.0,
                    step: 0.05,
                    value: getSettings().springDamping || 0.8,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('springDamping', value),
                });
                this.sliders.cameraSpringDamping = springDampSlider;
                content.appendChild(springDampSlider.getElement());

                // Follow Smoothness
                const followSmoothSlider = new Slider({
                    label: 'Follow Smoothness',
                    min: 0.01,
                    max: 0.5,
                    step: 0.01,
                    value: getSettings().followSmoothness || 0.1,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('followSmoothness', value),
                });
                this.sliders.cameraFollowSmoothness = followSmoothSlider;
                content.appendChild(followSmoothSlider.getElement());

                // Distance Transition Speed
                const distTransSlider = new Slider({
                    label: 'Distance Transition Speed',
                    min: 0.05,
                    max: 1.0,
                    step: 0.05,
                    value: getSettings().distanceTransitionSpeed || 0.2,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('distanceTransitionSpeed', value),
                });
                this.sliders.cameraDistanceTransitionSpeed = distTransSlider;
                content.appendChild(distTransSlider.getElement());

                // Angle Transition Speed
                const angleTransSlider = new Slider({
                    label: 'Angle Transition Speed',
                    min: 0.05,
                    max: 1.0,
                    step: 0.05,
                    value: getSettings().angleTransitionSpeed || 0.2,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('angleTransitionSpeed', value),
                });
                this.sliders.cameraAngleTransitionSpeed = angleTransSlider;
                content.appendChild(angleTransSlider.getElement());

                // Auto-Align Delay
                const autoAlignDelaySlider = new Slider({
                    label: 'Auto-Align Delay (seconds)',
                    min: 0.5,
                    max: 5.0,
                    step: 0.1,
                    value: getSettings().autoAlignDelay || 2.0,
                    format: (v) => v.toFixed(1) + 's',
                    onChange: (value) => updateSettings('autoAlignDelay', value),
                });
                this.sliders.cameraAutoAlignDelay = autoAlignDelaySlider;
                content.appendChild(autoAlignDelaySlider.getElement());

                // Micro Jitter Amount
                const jitterAmountSlider = new Slider({
                    label: 'Micro Jitter Amount',
                    min: 0,
                    max: 0.01,
                    step: 0.0001,
                    value: getSettings().microJitterAmount || 0.001,
                    format: (v) => v.toFixed(4),
                    onChange: (value) => updateSettings('microJitterAmount', value),
                });
                this.sliders.cameraMicroJitterAmount = jitterAmountSlider;
                content.appendChild(jitterAmountSlider.getElement());

                // Micro Jitter Enabled (switch)
                const jitterEnabledSwitch = this.createSwitch(
                    'Micro Jitter Enabled',
                    getSettings().microJitterEnabled || false,
                    (value) => updateSettings('microJitterEnabled', value)
                );
                this.switches.cameraMicroJitterEnabled = jitterEnabledSwitch;
                content.appendChild(jitterEnabledSwitch);

                // Shake Intensity Multiplier
                const shakeIntensitySlider = new Slider({
                    label: 'Shake Intensity Multiplier',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: getSettings().shakeIntensityMultiplier || 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('shakeIntensityMultiplier', value),
                });
                this.sliders.cameraShakeIntensity = shakeIntensitySlider;
                content.appendChild(shakeIntensitySlider.getElement());

                // Shake Decay Rate
                const shakeDecaySlider = new Slider({
                    label: 'Shake Decay Rate',
                    min: 0,
                    max: 20,
                    step: 0.5,
                    value: getSettings().shakeDecayRate || 5.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('shakeDecayRate', value),
                });
                this.sliders.cameraShakeDecay = shakeDecaySlider;
                content.appendChild(shakeDecaySlider.getElement());

                // Bass-Reactive Shake (switch)
                const bassShakeSwitch = this.createSwitch(
                    'Bass-Reactive Shake',
                    getSettings().bassReactiveShakeEnabled || true,
                    (value) => updateSettings('bassReactiveShakeEnabled', value)
                );
                this.switches.cameraBassReactiveShake = bassShakeSwitch;
                content.appendChild(bassShakeSwitch);

                // Wild Moment Effects Intensity
                const wildEffectsSlider = new Slider({
                    label: 'Wild Moment Effects Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().wildMomentEffectsIntensity || 0.5,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('wildMomentEffectsIntensity', value),
                });
                this.sliders.cameraWildMomentEffects = wildEffectsSlider;
                content.appendChild(wildEffectsSlider.getElement());

                // Camera Roll/Tilt Amount
                const rollTiltSlider = new Slider({
                    label: 'Camera Roll/Tilt Amount',
                    min: 0,
                    max: 0.5,
                    step: 0.01,
                    value: getSettings().cameraRollTiltAmount || 0.05,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('cameraRollTiltAmount', value),
                });
                this.sliders.cameraRollTilt = rollTiltSlider;
                content.appendChild(rollTiltSlider.getElement());

                // Head Bob Amount
                const headBobAmountSlider = new Slider({
                    label: 'Head Bob Amount',
                    min: 0,
                    max: 0.5,
                    step: 0.01,
                    value: getSettings().headBobAmount || 0.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('headBobAmount', value),
                });
                this.sliders.cameraHeadBobAmount = headBobAmountSlider;
                content.appendChild(headBobAmountSlider.getElement());

                // Head Bob Speed
                const headBobSpeedSlider = new Slider({
                    label: 'Head Bob Speed',
                    min: 0,
                    max: 5,
                    step: 0.1,
                    value: getSettings().headBobSpeed || 0.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('headBobSpeed', value),
                });
                this.sliders.cameraHeadBobSpeed = headBobSpeedSlider;
                content.appendChild(headBobSpeedSlider.getElement());

                // Cinematic Orbit Speed
                const cinematicOrbitSpeedSlider = new Slider({
                    label: 'Cinematic Orbit Speed',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().cinematicOrbitSpeed || 0.2,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('cinematicOrbitSpeed', value),
                });
                this.sliders.cameraCinematicOrbitSpeed = cinematicOrbitSpeedSlider;
                content.appendChild(cinematicOrbitSpeedSlider.getElement());

                // Cinematic Orbit Radius
                const cinematicOrbitRadiusSlider = new Slider({
                    label: 'Cinematic Orbit Radius',
                    min: 5,
                    max: 20,
                    step: 0.5,
                    value: getSettings().cinematicOrbitRadius || 10,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('cinematicOrbitRadius', value),
                });
                this.sliders.cameraCinematicOrbitRadius = cinematicOrbitRadiusSlider;
                content.appendChild(cinematicOrbitRadiusSlider.getElement());

                // Lock-On Transition Speed
                const lockOnTransSlider = new Slider({
                    label: 'Lock-On Transition Speed',
                    min: 0.05,
                    max: 1.0,
                    step: 0.05,
                    value: getSettings().lockOnTransitionSpeed || 0.2,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('lockOnTransitionSpeed', value),
                });
                this.sliders.cameraLockOnTransitionSpeed = lockOnTransSlider;
                content.appendChild(lockOnTransSlider.getElement());

                // Freecam Movement Speed
                const freecamMoveSlider = new Slider({
                    label: 'Freecam Movement Speed',
                    min: 0.1,
                    max: 5,
                    step: 0.1,
                    value: getSettings().freecamMovementSpeed || 1.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('freecamMovementSpeed', value),
                });
                this.sliders.cameraFreecamMovementSpeed = freecamMoveSlider;
                content.appendChild(freecamMoveSlider.getElement());

                // Freecam Rotation Speed
                const freecamRotSlider = new Slider({
                    label: 'Freecam Rotation Speed',
                    min: 0.1,
                    max: 5,
                    step: 0.1,
                    value: getSettings().freecamRotationSpeed || 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => updateSettings('freecamRotationSpeed', value),
                });
                this.sliders.cameraFreecamRotationSpeed = freecamRotSlider;
                content.appendChild(freecamRotSlider.getElement());

                // Chromatic Aberration Intensity
                const chromaticAberrationSlider = new Slider({
                    label: 'Chromatic Aberration Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().chromaticAberrationIntensity || 0.3,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('chromaticAberrationIntensity', value),
                });
                this.sliders.cameraChromaticAberration = chromaticAberrationSlider;
                content.appendChild(chromaticAberrationSlider.getElement());

                // Glitch Effect Intensity
                const glitchEffectSlider = new Slider({
                    label: 'Glitch Effect Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().glitchEffectIntensity || 0.5,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('glitchEffectIntensity', value),
                });
                this.sliders.cameraGlitchEffect = glitchEffectSlider;
                content.appendChild(glitchEffectSlider.getElement());

                // Motion Blur Enabled (switch)
                const motionBlurSwitch = this.createSwitch(
                    'Motion Blur Enabled',
                    getSettings().motionBlurEnabled || false,
                    (value) => updateSettings('motionBlurEnabled', value)
                );
                this.switches.cameraMotionBlur = motionBlurSwitch;
                content.appendChild(motionBlurSwitch);

                // Screen Shake from Effects
                const screenShakeSlider = new Slider({
                    label: 'Screen Shake from Effects',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().screenShakeFromEffects || 0.3,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('screenShakeFromEffects', value),
                });
                this.sliders.cameraScreenShakeFromEffects = screenShakeSlider;
                content.appendChild(screenShakeSlider.getElement());

                // Visual Distortion Intensity
                const visualDistortionSlider = new Slider({
                    label: 'Visual Distortion Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: getSettings().visualDistortionIntensity || 0.3,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => updateSettings('visualDistortionIntensity', value),
                });
                this.sliders.cameraVisualDistortion = visualDistortionSlider;
                content.appendChild(visualDistortionSlider.getElement());
            }
        );
    }

    /**
     * Create visual effects section
     */
    createVisualEffectsSection(container) {
        this.sliders = this.sliders || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Visual Effects Parameters',
            (content) => {
                if (!this.systems.visualEffectSettings) {
                    const msg = document.createElement('div');
                    msg.textContent = 'Visual effect settings not available';
                    msg.style.color = '#888';
                    content.appendChild(msg);
                    return;
                }

                const settings = this.systems.visualEffectSettings;

                // UV Mode Intensity
                const uvModeSlider = new Slider({
                    label: 'UV Mode Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('uvMode') || 1.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('uvMode', value);
                        if (this.systems.visualEffects) {
                            this.systems.visualEffects.setUVIntensity(value);
                        }
                    },
                });
                this.sliders.visualUVMode = uvModeSlider;
                content.appendChild(uvModeSlider.getElement());

                // Glitch Intensity
                const glitchSlider = new Slider({
                    label: 'Glitch Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('glitch') || 0.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('glitch', value);
                        if (this.systems.postProcessingManager) {
                            this.systems.postProcessingManager.setGlitchIntensity(value);
                        }
                    },
                });
                this.sliders.visualGlitch = glitchSlider;
                content.appendChild(glitchSlider.getElement());

                // Distortion Intensity
                const distortionSlider = new Slider({
                    label: 'Distortion Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('distortion') || 0.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('distortion', value);
                        if (this.systems.visualEffects) {
                            this.systems.visualEffects.setVisualDistortionIntensity(value);
                        }
                    },
                });
                this.sliders.visualDistortion = distortionSlider;
                content.appendChild(distortionSlider.getElement());

                // Chromatic Aberration Intensity
                const chromaticAberrationSlider = new Slider({
                    label: 'Chromatic Aberration Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('chromaticAberration') || 0.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('chromaticAberration', value);
                        if (this.systems.postProcessingManager) {
                            this.systems.postProcessingManager.setChromaticAberration(value);
                        }
                    },
                });
                this.sliders.visualChromaticAberration = chromaticAberrationSlider;
                content.appendChild(chromaticAberrationSlider.getElement());

                // Bloom Intensity
                const bloomSlider = new Slider({
                    label: 'Bloom Intensity',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: settings.getIntensity('bloom') || 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        settings.setIntensity('bloom', value);
                        if (this.systems.postProcessingManager) {
                            this.systems.postProcessingManager.setBloomIntensity(value);
                        }
                    },
                });
                this.sliders.visualBloom = bloomSlider;
                content.appendChild(bloomSlider.getElement());

                // Color Grading Intensity
                const colorGradingSlider = new Slider({
                    label: 'Color Grading Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('colorGrading') || 0.5,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('colorGrading', value);
                        if (this.systems.postProcessingManager) {
                            this.systems.postProcessingManager.setColorGrading(value);
                        }
                    },
                });
                this.sliders.visualColorGrading = colorGradingSlider;
                content.appendChild(colorGradingSlider.getElement());

                // Particle Effects Intensity
                const particleSlider = new Slider({
                    label: 'Particle Effects Intensity',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: settings.getIntensity('particleEffects') || 1.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        settings.setIntensity('particleEffects', value);
                        if (this.systems.visualEffects) {
                            this.systems.visualEffects.setParticleIntensity(value);
                        }
                    },
                });
                this.sliders.visualParticleEffects = particleSlider;
                content.appendChild(particleSlider.getElement());

                // Laser Effects Intensity
                const laserSlider = new Slider({
                    label: 'Laser Effects Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('laserEffects') || 1.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('laserEffects', value);
                    },
                });
                this.sliders.visualLaserEffects = laserSlider;
                content.appendChild(laserSlider.getElement());

                // Ripple Effects Intensity
                const rippleSlider = new Slider({
                    label: 'Ripple Effects Intensity',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: settings.getIntensity('rippleEffects') || 1.0,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        settings.setIntensity('rippleEffects', value);
                    },
                });
                this.sliders.visualRippleEffects = rippleSlider;
                content.appendChild(rippleSlider.getElement());
            }
        );
    }

    /**
     * Create avatar parameters section
     */
    createAvatarSection(container) {
        this.sliders = this.sliders || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Avatar Parameters',
            (content) => {
                if (!this.systems.avatar) {
                    const msg = document.createElement('div');
                    msg.textContent = 'Avatar not available';
                    msg.style.color = '#888';
                    content.appendChild(msg);
                    return;
                }

                const avatar = this.systems.avatar;

                // Avatar Radius
                const radiusSlider = new Slider({
                    label: 'Avatar Radius',
                    min: 0.1,
                    max: 2.0,
                    step: 0.1,
                    value: avatar.radius || 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        avatar.radius = value;
                        // Update mesh geometry
                        if (avatar.mesh && avatar.mesh.geometry) {
                            avatar.mesh.geometry.dispose();
                            avatar.mesh.geometry = new THREE.SphereGeometry(value, 32, 32);
                            avatar.mesh.geometry.scale(1, 1.1, 1);
                        }
                    },
                });
                this.sliders.avatarRadius = radiusSlider;
                content.appendChild(radiusSlider.getElement());

                // Hover Offset
                const hoverOffsetSlider = new Slider({
                    label: 'Hover Offset',
                    min: 0,
                    max: 0.5,
                    step: 0.01,
                    value: 0.1,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        avatar.hoverOffset = value;
                    },
                });
                this.sliders.avatarHoverOffset = hoverOffsetSlider;
                content.appendChild(hoverOffsetSlider.getElement());

                // Hover Speed
                const hoverSpeedSlider = new Slider({
                    label: 'Hover Speed',
                    min: 0,
                    max: 5,
                    step: 0.1,
                    value: 1.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        avatar.hoverSpeed = value;
                    },
                });
                this.sliders.avatarHoverSpeed = hoverSpeedSlider;
                content.appendChild(hoverSpeedSlider.getElement());

                // Lean Amount
                const leanSlider = new Slider({
                    label: 'Lean Amount (degrees)',
                    min: 0,
                    max: 30,
                    step: 1,
                    value: 10,
                    format: (v) => v.toFixed(0) + '°',
                    onChange: (value) => {
                        avatar.leanAmount = value;
                    },
                });
                this.sliders.avatarLeanAmount = leanSlider;
                content.appendChild(leanSlider.getElement());

                // Animation Speed Multiplier
                const animSpeedSlider = new Slider({
                    label: 'Animation Speed Multiplier',
                    min: 0.1,
                    max: 3.0,
                    step: 0.1,
                    value: 1.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        avatar.animationSpeedMultiplier = value;
                    },
                });
                this.sliders.avatarAnimationSpeed = animSpeedSlider;
                content.appendChild(animSpeedSlider.getElement());

                // State Transition Duration
                const transitionDurationSlider = new Slider({
                    label: 'State Transition Duration',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: avatar.stateTransitionDuration || 0.3,
                    format: (v) => v.toFixed(1) + 's',
                    onChange: (value) => {
                        avatar.stateTransitionDuration = value;
                    },
                });
                this.sliders.avatarStateTransitionDuration = transitionDurationSlider;
                content.appendChild(transitionDurationSlider.getElement());
            }
        );
    }

    /**
     * Create physics parameters section
     */
    createPhysicsSection(container) {
        this.sliders = this.sliders || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Physics Parameters',
            (content) => {
                // Gravity
                const gravitySlider = new Slider({
                    label: 'Gravity',
                    min: -50,
                    max: 0,
                    step: 1,
                    value: -9.8,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        // Store for physics system
                        if (this.systems.physicsSystem) {
                            this.systems.physicsSystem.gravity = value;
                        }
                    },
                });
                this.sliders.physicsGravity = gravitySlider;
                content.appendChild(gravitySlider.getElement());

                // Collision Bounds Padding
                const collisionPaddingSlider = new Slider({
                    label: 'Collision Bounds Padding',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: 0.1,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.collisionSystem) {
                            this.systems.collisionSystem.boundsPadding = value;
                        }
                    },
                });
                this.sliders.physicsCollisionPadding = collisionPaddingSlider;
                content.appendChild(collisionPaddingSlider.getElement());

                // Bounce Coefficient
                const bounceSlider = new Slider({
                    label: 'Bounce Coefficient',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: 0.2,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        if (this.systems.avatar) {
                            this.systems.avatar.bounceCoefficient = value;
                        }
                    },
                });
                this.sliders.physicsBounce = bounceSlider;
                content.appendChild(bounceSlider.getElement());

                // Push Force Multiplier
                const pushForceSlider = new Slider({
                    label: 'Push Force Multiplier',
                    min: 0,
                    max: 2,
                    step: 0.1,
                    value: 0.5,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (this.systems.physicsSystem) {
                            this.systems.physicsSystem.pushForceMultiplier = value;
                        }
                    },
                });
                this.sliders.physicsPushForce = pushForceSlider;
                content.appendChild(pushForceSlider.getElement());

                // Friction Coefficient
                const frictionSlider = new Slider({
                    label: 'Friction Coefficient',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: 0.8,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        if (this.systems.physicsSystem) {
                            this.systems.physicsSystem.frictionCoefficient = value;
                        }
                    },
                });
                this.sliders.physicsFriction = frictionSlider;
                content.appendChild(frictionSlider.getElement());
            }
        );
    }

    /**
     * Create audio parameters section
     */
    createAudioSection(container) {
        this.sliders = this.sliders || {};

        const { content } = this.createCollapsibleSection(
            container,
            'Audio Parameters',
            (content) => {
                if (!this.systems.audioSystem) {
                    const msg = document.createElement('div');
                    msg.textContent = 'Audio system not available';
                    msg.style.color = '#888';
                    content.appendChild(msg);
                    return;
                }

                const audio = this.systems.audioSystem;

                // Master Volume
                const masterVolumeSlider = new Slider({
                    label: 'Master Volume',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: audio.masterVolume || 1.0,
                    format: (v) => (v * 100).toFixed(0) + '%',
                    onChange: (value) => {
                        if (audio.setMasterVolume) {
                            audio.setMasterVolume(value);
                        } else {
                            audio.masterVolume = value;
                        }
                    },
                });
                this.sliders.audioMasterVolume = masterVolumeSlider;
                content.appendChild(masterVolumeSlider.getElement());

                // Music Volume
                const musicVolumeSlider = new Slider({
                    label: 'Music Volume',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: audio.musicVolume || 0.8,
                    format: (v) => (v * 100).toFixed(0) + '%',
                    onChange: (value) => {
                        if (audio.setMusicVolume) {
                            audio.setMusicVolume(value);
                        } else {
                            audio.musicVolume = value;
                        }
                    },
                });
                this.sliders.audioMusicVolume = musicVolumeSlider;
                content.appendChild(musicVolumeSlider.getElement());

                // SFX Volume
                const sfxVolumeSlider = new Slider({
                    label: 'SFX Volume',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: audio.sfxVolume || 1.0,
                    format: (v) => (v * 100).toFixed(0) + '%',
                    onChange: (value) => {
                        if (audio.setSFXVolume) {
                            audio.setSFXVolume(value);
                        } else {
                            audio.sfxVolume = value;
                        }
                    },
                });
                this.sliders.audioSFXVolume = sfxVolumeSlider;
                content.appendChild(sfxVolumeSlider.getElement());

                // Bass Reactivity Multiplier
                const bassReactivitySlider = new Slider({
                    label: 'Bass Reactivity Multiplier',
                    min: 0,
                    max: 5,
                    step: 0.1,
                    value: 1.0,
                    format: (v) => v.toFixed(1),
                    onChange: (value) => {
                        if (audio.bassReactivityMultiplier !== undefined) {
                            audio.bassReactivityMultiplier = value;
                        }
                    },
                });
                this.sliders.audioBassReactivity = bassReactivitySlider;
                content.appendChild(bassReactivitySlider.getElement());

                // Audio Analysis Smoothing
                const smoothingSlider = new Slider({
                    label: 'Audio Analysis Smoothing',
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: AUDIO_CONFIG.smoothingTimeConstant || 0.8,
                    format: (v) => v.toFixed(2),
                    onChange: (value) => {
                        AUDIO_CONFIG.smoothingTimeConstant = value;
                        if (audio.analyser) {
                            audio.analyser.smoothingTimeConstant = value;
                        }
                    },
                });
                this.sliders.audioSmoothing = smoothingSlider;
                content.appendChild(smoothingSlider.getElement());
            }
        );
    }

    /**
     * Create switch (toggle button)
     */
    createSwitch(label, initialValue, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: #ffffff;
            font-size: 14px;
            font-family: Arial, sans-serif;
        `;
        container.appendChild(labelElement);

        let isToggled = initialValue;
        const button = new Button({
            text: isToggled ? 'ON' : 'OFF',
            onClick: () => {
                isToggled = !isToggled;
                button.setText(isToggled ? 'ON' : 'OFF');
                button.getElement().style.background = isToggled ? '#00ff00' : '#333333';
                button.getElement().style.borderColor = isToggled ? '#00ff00' : '#00ffff';
                onChange(isToggled);
            },
            style: {
                minWidth: '60px',
                padding: '5px 15px',
            },
        });

        if (isToggled) {
            button.getElement().style.background = '#00ff00';
            button.getElement().style.borderColor = '#00ff00';
        }

        button.isToggled = () => isToggled;
        container.appendChild(button.getElement());

        return container;
    }

    /**
     * Reset a section to defaults
     */
    resetSection(sectionId) {
        // This would reset all controls in the section
        // Implementation depends on stored defaults
        console.log('Reset section:', sectionId);
    }

    /**
     * Task 4.3: Create Performance Optimizer section
     */
    createPerformanceOptimizerSection(container) {
        const { content } = this.createCollapsibleSection(
            container,
            'Performance Optimizer',
            (content) => {
                if (!this.systems.performanceOptimizer) {
                    const msg = document.createElement('div');
                    msg.textContent = 'Performance Optimizer not available';
                    msg.style.color = '#888';
                    content.appendChild(msg);
                    return;
                }

                const optimizer = this.systems.performanceOptimizer;

                // Enable/Disable toggle
                const enabledSwitch = this.createSwitch(
                    'Auto-Optimization',
                    optimizer.enabled,
                    (enabled) => {
                        if (enabled) {
                            optimizer.enable();
                        } else {
                            optimizer.disable();
                        }
                    }
                );
                content.appendChild(enabledSwitch);

                // Target FPS slider
                const targetFPSSlider = new Slider({
                    label: 'Target FPS',
                    min: 30,
                    max: 120,
                    step: 5,
                    value: optimizer.targetFPS || 60,
                    format: (v) => v.toFixed(0) + ' FPS',
                    onChange: (value) => {
                        optimizer.targetFPS = value;
                    },
                });
                this.sliders = this.sliders || {};
                this.sliders.performanceTargetFPS = targetFPSSlider;
                content.appendChild(targetFPSSlider.getElement());

                // Min FPS slider
                const minFPSSlider = new Slider({
                    label: 'Minimum FPS',
                    min: 20,
                    max: 60,
                    step: 5,
                    value: optimizer.minFPS || 30,
                    format: (v) => v.toFixed(0) + ' FPS',
                    onChange: (value) => {
                        optimizer.minFPS = value;
                    },
                });
                this.sliders.performanceMinFPS = minFPSSlider;
                content.appendChild(minFPSSlider.getElement());

                // Adjustment level display
                const adjustmentDisplay = document.createElement('div');
                adjustmentDisplay.id = 'dev-performance-adjustment';
                adjustmentDisplay.style.cssText = `
                    color: #00ffff;
                    font-size: 12px;
                    margin-top: 10px;
                    padding: 8px;
                    background: rgba(0, 255, 255, 0.1);
                    border-radius: 4px;
                `;
                const updateAdjustmentDisplay = () => {
                    adjustmentDisplay.textContent = `Adjustment Level: ${optimizer.adjustmentLevel || 0}`;
                };
                updateAdjustmentDisplay();
                content.appendChild(adjustmentDisplay);

                // Store reference for updates
                this.performanceAdjustmentDisplay = adjustmentDisplay;
                this.updatePerformanceDisplay = updateAdjustmentDisplay;
            }
        );
    }

    /**
     * Create global reset button
     */
    createGlobalReset(container) {
        const resetBtn = new Button({
            text: 'Reset All to Defaults',
            onClick: () => {
                if (confirm('Reset all parameters to defaults?')) {
                    // Reset all sliders and switches
                    // This would restore default values
                    console.log('Reset all to defaults');
                }
            },
            style: {
                width: '100%',
                marginTop: '10px',
                background: '#ff0000',
                borderColor: '#ff0000',
            },
        });
        container.appendChild(resetBtn.getElement());
    }

    /**
     * Set systems reference
     */
    setSystems(systems) {
        this.systems = systems;
    }
}
