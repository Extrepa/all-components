/**
 * ControlsReferenceUI - Comprehensive in-game controls reference
 *
 * Displays all keybinds organized by category, searchable, with context-sensitive controls
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { InputField } from './components/InputField.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class ControlsReferenceUI extends BasePanel {
    /**
     * Create a new ControlsReferenceUI
     * @param {Object} config - Configuration
     * @param {Object} config.keybindManager - KeybindManager instance
     * @param {Function} config.onClose - Close handler
     */
    constructor(config = {}) {
        super({
            id: 'controls_reference_ui',
            title: 'Controls Reference',
            position: { x: 100, y: 100 },
            size: { width: 800, height: 700 },
        });

        this.keybindManager = config.keybindManager;
        this.onClose = config.onClose || (() => {});

        // Control categories
        this.categories = {
            movement: {
                name: 'Movement',
                icon: '🏃',
                keybinds: [],
            },
            camera: {
                name: 'Camera',
                icon: '📷',
                keybinds: [],
            },
            interaction: {
                name: 'Interaction',
                icon: '👆',
                keybinds: [],
            },
            ui: {
                name: 'UI & Menus',
                icon: '🖥️',
                keybinds: [],
            },
            effects: {
                name: 'Visual Effects',
                icon: '✨',
                keybinds: [],
            },
            debug: {
                name: 'Debug & Advanced',
                icon: '🔧',
                keybinds: [],
            },
            other: {
                name: 'Other',
                icon: '⚙️',
                keybinds: [],
            },
        };

        // Search state
        this.searchQuery = '';
        this.selectedCategory = null; // null = all categories

        // Create UI
        this.createContent();

        // Load keybinds
        this.loadKeybinds();
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
            gap: 15px;
            height: 100%;
        `;

        // Search bar
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        const searchInput = new InputField({
            placeholder: 'Search controls...',
            onChange: (value) => {
                this.searchQuery = value.toLowerCase();
                this.updateDisplay();
            },
        });
        searchContainer.appendChild(searchInput.getElement());

        // Category filter buttons
        const categoryContainer = document.createElement('div');
        categoryContainer.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        `;

        // All categories button
        const allButton = new Button({
            text: 'All',
            onClick: () => {
                this.selectedCategory = null;
                this.updateDisplay();
                this.updateCategoryButtons();
            },
        });
        categoryContainer.appendChild(allButton.getElement());

        // Category buttons
        this.categoryButtons = new Map();
        Object.keys(this.categories).forEach((categoryKey) => {
            const category = this.categories[categoryKey];
            const button = new Button({
                text: `${category.icon} ${category.name}`,
                onClick: () => {
                    this.selectedCategory = categoryKey;
                    this.updateDisplay();
                    this.updateCategoryButtons();
                },
            });
            this.categoryButtons.set(categoryKey, button);
            categoryContainer.appendChild(button.getElement());
        });

        content.appendChild(searchContainer);
        content.appendChild(categoryContainer);

        // Controls list container
        this.controlsList = document.createElement('div');
        this.controlsList.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding-right: 8px;
        `;
        content.appendChild(this.controlsList);

        // Close button
        const closeButton = new Button({
            text: 'Close',
            onClick: () => {
                this.hide();
                if (this.onClose) {
                    this.onClose();
                }
            },
        });
        closeButton.getElement().style.cssText += 'margin-top: 10px;';
        content.appendChild(closeButton.getElement());
    }

    /**
     * Update category button states
     * @private
     */
    updateCategoryButtons() {
        this.categoryButtons.forEach((button, categoryKey) => {
            const isSelected = this.selectedCategory === categoryKey;
            const element = button.getElement();
            if (isSelected) {
                element.style.background = DESIGN_SYSTEM.colors.background;
                element.style.borderColor = DESIGN_SYSTEM.colors.accent;
                element.style.opacity = '0.8';
            } else {
                element.style.background = '';
                element.style.borderColor = '';
                element.style.opacity = '';
            }
        });
    }

    /**
     * Load keybinds from KeybindManager
     * @private
     */
    loadKeybinds() {
        if (!this.keybindManager) {
            return;
        }

        // Clear existing keybinds
        Object.values(this.categories).forEach((category) => {
            category.keybinds = [];
        });

        // Get all keybinds (returns array of {key, modifiers, description})
        const allKeybinds = this.keybindManager.getAllKeybinds();

        // Categorize keybinds
        allKeybinds.forEach((keybindInfo) => {
            const { key, modifiers, description } = keybindInfo;

            // Determine category based on description/key
            let category = 'other';
            const descLower = (description || '').toLowerCase();
            const keyLower = key.toLowerCase();

            if (
                descLower.includes('move') ||
                descLower.includes('run') ||
                descLower.includes('jump') ||
                descLower.includes('hop') ||
                descLower.includes('dash') ||
                descLower.includes('crouch') ||
                descLower.includes('dance') ||
                keyLower === 'w' ||
                keyLower === 'a' ||
                keyLower === 's' ||
                keyLower === 'd'
            ) {
                category = 'movement';
            } else if (
                descLower.includes('camera') ||
                descLower.includes('zoom') ||
                descLower.includes('view')
            ) {
                category = 'camera';
            } else if (
                descLower.includes('interact') ||
                descLower.includes('collect') ||
                keyLower === 'e'
            ) {
                category = 'interaction';
            } else if (
                descLower.includes('menu') ||
                descLower.includes('ui') ||
                descLower.includes('settings') ||
                descLower.includes('help') ||
                descLower.includes('panel') ||
                keyLower === 'f1' ||
                keyLower === 'f2' ||
                keyLower === 'f3' ||
                keyLower === 'f4' ||
                keyLower === 'tab' ||
                keyLower === 'escape'
            ) {
                category = 'ui';
            } else if (
                descLower.includes('effect') ||
                descLower.includes('visual') ||
                descLower.includes('glitch') ||
                descLower.includes('uv') ||
                descLower.includes('bloom')
            ) {
                category = 'effects';
            } else if (
                descLower.includes('debug') ||
                descLower.includes('dev') ||
                keyLower === 'f9' ||
                keyLower === '~'
            ) {
                category = 'debug';
            }

            this.categories[category].keybinds.push({
                id: `${key}-${modifiers.shift ? 'shift' : ''}-${modifiers.ctrl ? 'ctrl' : ''}-${modifiers.alt ? 'alt' : ''}`,
                key: key,
                modifiers: modifiers,
                description: description || 'No description',
                displayKey: this.formatKeyDisplay(key, modifiers),
            });
        });
    }

    /**
     * Format key display with modifiers
     * @param {string} key - Key name
     * @param {Object} modifiers - Modifiers object
     * @returns {string} Formatted key display
     * @private
     */
    formatKeyDisplay(key, modifiers) {
        const parts = [];

        if (modifiers.shift) {
            parts.push('Shift');
        }
        if (modifiers.ctrl) {
            parts.push('Ctrl');
        }
        if (modifiers.alt) {
            parts.push('Alt');
        }

        // Format key name
        let keyDisplay = key;
        const keyLower = key.toLowerCase();
        if (key === ' ') {
            keyDisplay = 'Space';
        } else if (key.length === 1) {
            keyDisplay = key.toUpperCase();
        } else {
            // Handle special keys
            const specialKeys = {
                arrowup: '↑',
                arrowdown: '↓',
                arrowleft: '←',
                arrowright: '→',
                escape: 'Esc',
                enter: 'Enter',
                backspace: 'Backspace',
                delete: 'Delete',
            };
            keyDisplay =
                specialKeys[keyLower] || key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        }

        parts.push(keyDisplay);

        return parts.join(' + ');
    }

    /**
     * Update display based on search and category filter
     * @private
     */
    updateDisplay() {
        if (!this.controlsList) {
            return;
        }

        this.controlsList.innerHTML = '';

        // Filter categories
        const categoriesToShow = this.selectedCategory
            ? [this.categories[this.selectedCategory]]
            : Object.values(this.categories);

        categoriesToShow.forEach((category) => {
            // Filter keybinds by search query
            const filteredKeybinds = category.keybinds.filter((keybind) => {
                if (!this.searchQuery) {
                    return true;
                }

                const searchLower = this.searchQuery.toLowerCase();
                return (
                    keybind.description.toLowerCase().includes(searchLower) ||
                    keybind.displayKey.toLowerCase().includes(searchLower) ||
                    keybind.key.toLowerCase().includes(searchLower)
                );
            });

            if (filteredKeybinds.length === 0) {
                return;
            }

            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.accent};
                font-size: 18px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            `;
            categoryHeader.textContent = `${category.icon} ${category.name}`;
            this.controlsList.appendChild(categoryHeader);

            // Keybinds list
            filteredKeybinds.forEach((keybind) => {
                const keybindRow = document.createElement('div');
                keybindRow.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: ${DESIGN_SYSTEM.colors.background};
                    border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
                    border-radius: ${DESIGN_SYSTEM.borders.radius};
                `;

                // Description
                const description = document.createElement('div');
                description.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.text};
                    font-size: 14px;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                    flex: 1;
                `;
                description.textContent = keybind.description || 'No description';
                keybindRow.appendChild(description);

                // Key display
                const keyDisplay = document.createElement('div');
                keyDisplay.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.accent};
                    font-size: 12px;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                    font-weight: bold;
                    padding: 4px 12px;
                    background: ${DESIGN_SYSTEM.colors.background};
                    border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
                    border-radius: ${DESIGN_SYSTEM.borders.radius};
                    font-family: 'Courier New', monospace;
                `;
                keyDisplay.textContent = keybind.displayKey;
                keybindRow.appendChild(keyDisplay);

                this.controlsList.appendChild(keybindRow);
            });
        });

        // Empty state
        if (this.controlsList.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.6;
                text-align: center;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                padding: 40px;
                font-style: italic;
            `;
            emptyState.textContent = this.searchQuery
                ? `No controls found matching "${this.searchQuery}"`
                : 'No controls available';
            this.controlsList.appendChild(emptyState);
        }
    }

    /**
     * Set keybind manager
     * @param {Object} keybindManager - KeybindManager instance
     */
    setKeybindManager(keybindManager) {
        this.keybindManager = keybindManager;
        this.loadKeybinds();
        this.updateDisplay();
    }

    /**
     * Show the UI
     */
    show() {
        super.show();
        this.updateDisplay();
    }

    /**
     * Toggle the UI
     */
    toggle() {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }
}
