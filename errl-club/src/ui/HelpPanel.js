/**
 * HelpPanel - UI panel for displaying help content
 *
 * Provides:
 * - Help category navigation
 * - Search functionality
 * - Keyboard navigation
 * - Context-sensitive help display
 */

import { HelpSystem } from './HelpSystem.js';

export class HelpPanel {
    constructor(helpSystem) {
        this.helpSystem = helpSystem || new HelpSystem();
        this.visible = false;
        this.currentCategory = null;
        this.searchQuery = '';
        this.container = null;
        this.setupUI();
    }

    /**
     * Setup help panel UI
     */
    setupUI() {
        this.container = document.createElement('div');
        this.container.id = 'help-panel';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ffff;
            border-radius: 10px;
            color: #00ffff;
            font-family: 'Courier New', monospace;
            z-index: 10000;
            display: none;
            flex-direction: column;
            overflow: hidden;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #00ffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Help & Documentation';
        title.style.cssText = 'margin: 0; color: #00ffff;';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid #00ffff;
            color: #00ffff;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.addEventListener('click', () => this.hide());
        header.appendChild(closeBtn);

        this.container.appendChild(header);

        // Search bar
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'padding: 10px 15px; border-bottom: 1px solid #00ffff;';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search help...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 8px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            color: #00ffff;
            font-family: 'Courier New', monospace;
        `;
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.updateContent();
        });
        searchContainer.appendChild(searchInput);
        this.searchInput = searchInput;

        this.container.appendChild(searchContainer);

        // Content area
        const contentArea = document.createElement('div');
        contentArea.id = 'help-content';
        contentArea.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        `;
        this.contentArea = contentArea;
        this.container.appendChild(contentArea);

        // Category navigation
        const categoryNav = document.createElement('div');
        categoryNav.id = 'help-categories';
        categoryNav.style.cssText = `
            padding: 10px 15px;
            border-top: 1px solid #00ffff;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;
        this.categoryNav = categoryNav;
        this.container.appendChild(categoryNav);

        document.body.appendChild(this.container);
        this.updateCategories();
        this.updateContent();
    }

    /**
     * Update category navigation
     */
    updateCategories() {
        this.categoryNav.innerHTML = '';
        const categories = this.helpSystem.getAllCategories();

        Object.entries(categories).forEach(([key, category]) => {
            const btn = document.createElement('button');
            btn.textContent = `${category.icon} ${category.title}`;
            btn.style.cssText = `
                padding: 5px 10px;
                background: ${this.currentCategory === key ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.1)'};
                border: 1px solid #00ffff;
                color: #00ffff;
                cursor: pointer;
                font-family: 'Courier New', monospace;
            `;
            btn.addEventListener('click', () => {
                this.currentCategory = key;
                this.updateContent();
                this.updateCategories();
            });
            this.categoryNav.appendChild(btn);
        });
    }

    /**
     * Update help content display
     */
    updateContent() {
        this.contentArea.innerHTML = '';

        if (this.searchQuery.trim() !== '') {
            // Show search results
            const results = this.helpSystem.search(this.searchQuery);
            if (results.length === 0) {
                this.contentArea.innerHTML = '<p style="color: #ffff00;">No results found.</p>';
                return;
            }

            results.forEach((result) => {
                this.addHelpItem(result, result.category);
            });
        } else if (this.currentCategory) {
            // Show category content
            const category = this.helpSystem.getCategory(this.currentCategory);
            if (category) {
                category.content.forEach((item) => {
                    this.addHelpItem(item, category.title);
                });
            }
        } else {
            // Show welcome message
            this.contentArea.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3>Welcome to Errl Club Help</h3>
                    <p>Select a category above or search for help topics.</p>
                    <p style="margin-top: 20px; color: #ffff00;">
                        Press ? or F1 to toggle help, ESC to close
                    </p>
                </div>
            `;
        }
    }

    /**
     * Add help item to content area
     * @param {Object} item - Help item
     * @param {string} categoryTitle - Category title
     */
    addHelpItem(item, categoryTitle) {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(0, 255, 255, 0.05);
            border-left: 3px solid #00ffff;
        `;

        const title = document.createElement('h4');
        title.textContent = item.title;
        title.style.cssText = 'margin: 0 0 5px 0; color: #00ffff;';
        itemDiv.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = item.description;
        desc.style.cssText = 'margin: 5px 0; color: #ffffff;';
        itemDiv.appendChild(desc);

        const details = document.createElement('p');
        details.textContent = item.details;
        details.style.cssText = 'margin: 5px 0; color: #aaaaaa; font-size: 12px;';
        itemDiv.appendChild(details);

        this.contentArea.appendChild(itemDiv);
    }

    /**
     * Show help panel
     */
    show() {
        this.visible = true;
        this.container.style.display = 'flex';
        this.searchInput.focus();
    }

    /**
     * Hide help panel
     */
    hide() {
        this.visible = false;
        this.container.style.display = 'none';
        this.searchQuery = '';
        this.searchInput.value = '';
        this.updateContent();
    }

    /**
     * Toggle help panel
     */
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeydown(event) {
        if (!this.visible) {
            return;
        }

        if (event.key === 'Escape') {
            this.hide();
            event.preventDefault();
        } else if (event.key === 'Enter' && document.activeElement === this.searchInput) {
            // Search on Enter
            this.updateContent();
        }
    }
}
