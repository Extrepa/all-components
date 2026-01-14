/**
 * AssetManagerUI - Visual asset management and preview interface
 *
 * Provides:
 * - Asset browser with search and filtering
 * - Asset preview
 * - Asset metadata display
 * - Integration status
 * - Performance metrics
 */

import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Dropdown } from './components/Dropdown.js';

export class AssetManagerUI extends BasePanel {
    /**
     * Create a new AssetManagerUI
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.assetCatalog - AssetCatalog instance
     * @param {Object} config.assetScanner - AssetScanner instance (optional)
     */
    constructor(config = {}) {
        super({
            id: 'asset_manager_ui',
            title: 'Asset Manager',
            position: { x: 100, y: 100 },
            size: { width: 900, height: 700 },
        });

        this.onClose = config.onClose || (() => {});
        this.assetCatalog = config.assetCatalog;
        this.assetScanner = config.assetScanner || null;

        // UI state
        this.currentFilter = {
            type: null,
            category: null,
            license: null,
            search: '',
        };
        this.selectedAsset = null;

        // Create UI content
        this.createContent();
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
            height: 100%;
            overflow: hidden;
        `;

        // Search and filter section
        const filterSection = this.createFilterSection();
        content.appendChild(filterSection);

        // Asset list section
        const listSection = this.createAssetListSection();
        content.appendChild(listSection);

        // Asset details section
        const detailsSection = this.createAssetDetailsSection();
        content.appendChild(detailsSection);
    }

    /**
     * Create filter section
     * @private
     */
    createFilterSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            padding: 16px;
            border-bottom: 1px solid #00ffff;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        `;

        // Search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search assets...';
        searchInput.style.cssText = `
            flex: 1;
            min-width: 200px;
            padding: 8px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #00ffff;
            color: #00ffff;
            font-family: 'Courier New', monospace;
        `;
        searchInput.addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.updateAssetList();
        });
        section.appendChild(searchInput);

        // Type filter
        const typeDropdown = new Dropdown({
            label: 'Type',
            options: [
                { value: '', label: 'All Types' },
                { value: '3d-model', label: '3D Models' },
                { value: 'texture', label: 'Textures' },
                { value: 'audio', label: 'Audio' },
                { value: 'animation', label: 'Animations' },
                { value: 'shader', label: 'Shaders' },
                { value: 'ui-asset', label: 'UI Assets' },
            ],
            value: '',
            onChange: (value) => {
                this.currentFilter.type = value || null;
                this.updateAssetList();
            },
        });
        section.appendChild(typeDropdown.getElement());

        // Category filter
        const categoryDropdown = new Dropdown({
            label: 'Category',
            options: [
                { value: '', label: 'All Categories' },
                { value: 'props', label: 'Props' },
                { value: 'environment', label: 'Environment' },
                { value: 'characters', label: 'Characters' },
                { value: 'materials', label: 'Materials' },
                { value: 'ui', label: 'UI' },
            ],
            value: '',
            onChange: (value) => {
                this.currentFilter.category = value || null;
                this.updateAssetList();
            },
        });
        section.appendChild(categoryDropdown.getElement());

        // Refresh button
        const refreshButton = new Button({
            text: 'Refresh',
            onClick: () => {
                this.refreshAssetList();
            },
        });
        section.appendChild(refreshButton.getElement());

        return section;
    }

    /**
     * Create asset list section
     * @private
     */
    createAssetListSection() {
        const section = document.createElement('div');
        section.id = 'asset-manager-list';
        section.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        `;

        this.assetListContainer = section;
        return section;
    }

    /**
     * Create asset details section
     * @private
     */
    createAssetDetailsSection() {
        const section = document.createElement('div');
        section.id = 'asset-manager-details';
        section.style.cssText = `
            padding: 16px;
            border-top: 1px solid #00ffff;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        `;

        this.assetDetailsContainer = section;
        return section;
    }

    /**
     * Update asset list
     * @private
     */
    updateAssetList() {
        if (!this.assetCatalog || !this.assetListContainer) {
            return;
        }

        // Clear existing list
        this.assetListContainer.innerHTML = '';

        // Search assets
        const assets = this.assetCatalog.search(this.currentFilter.search, {
            type: this.currentFilter.type,
            category: this.currentFilter.category,
            license: this.currentFilter.license,
        });

        // Create asset cards
        assets.forEach((asset) => {
            const card = this.createAssetCard(asset);
            this.assetListContainer.appendChild(card);
        });

        // Show count
        const count = document.createElement('div');
        count.style.cssText = `
            grid-column: 1 / -1;
            padding: 8px;
            text-align: center;
            color: #00ffff;
            font-size: 12px;
        `;
        count.textContent = `Showing ${assets.length} asset${assets.length !== 1 ? 's' : ''}`;
        this.assetListContainer.appendChild(count);
    }

    /**
     * Create asset card
     * @param {Object} asset - Asset metadata
     * @returns {HTMLElement} Asset card element
     * @private
     */
    createAssetCard(asset) {
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 12px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        `;

        card.addEventListener('mouseenter', () => {
            card.style.background = 'rgba(0, 255, 255, 0.2)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(0, 255, 255, 0.1)';
        });

        card.addEventListener('click', () => {
            this.selectAsset(asset);
        });

        // Asset name
        const name = document.createElement('div');
        name.textContent = asset.id;
        name.style.cssText = `
            font-weight: bold;
            color: #00ffff;
            margin-bottom: 4px;
        `;
        card.appendChild(name);

        // Asset type
        const type = document.createElement('div');
        type.textContent = asset.type;
        type.style.cssText = `
            font-size: 11px;
            color: #888;
            margin-bottom: 4px;
        `;
        card.appendChild(type);

        // Asset size
        const size = document.createElement('div');
        const sizeKB = asset.size ? (asset.size / 1024).toFixed(2) : 'Unknown';
        size.textContent = `${sizeKB} KB`;
        size.style.cssText = `
            font-size: 11px;
            color: #888;
        `;
        card.appendChild(size);

        return card;
    }

    /**
     * Select asset
     * @param {Object} asset - Asset metadata
     * @private
     */
    selectAsset(asset) {
        this.selectedAsset = asset;
        this.updateAssetDetails();
    }

    /**
     * Update asset details
     * @private
     */
    updateAssetDetails() {
        if (!this.selectedAsset || !this.assetDetailsContainer) {
            this.assetDetailsContainer.style.display = 'none';
            return;
        }

        this.assetDetailsContainer.style.display = 'block';
        this.assetDetailsContainer.innerHTML = '';

        const asset = this.selectedAsset;

        // Asset name
        const name = document.createElement('h3');
        name.textContent = asset.id;
        name.style.cssText = `
            color: #00ffff;
            margin-bottom: 12px;
        `;
        this.assetDetailsContainer.appendChild(name);

        // Asset metadata
        const metadata = document.createElement('div');
        metadata.style.cssText = `
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 16px;
            font-size: 12px;
        `;

        const fields = [
            ['Type', asset.type],
            ['Category', asset.category],
            ['Format', asset.format],
            ['Size', asset.size ? `${(asset.size / 1024).toFixed(2)} KB` : 'Unknown'],
            ['License', asset.license],
            ['Source', asset.source],
            ['Path', asset.path],
        ];

        fields.forEach(([label, value]) => {
            const labelEl = document.createElement('div');
            labelEl.textContent = `${label}:`;
            labelEl.style.cssText = 'color: #888;';
            metadata.appendChild(labelEl);

            const valueEl = document.createElement('div');
            valueEl.textContent = value || 'N/A';
            valueEl.style.cssText = 'color: #00ffff;';
            metadata.appendChild(valueEl);
        });

        this.assetDetailsContainer.appendChild(metadata);

        // Description
        if (asset.description) {
            const desc = document.createElement('div');
            desc.textContent = asset.description;
            desc.style.cssText = `
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #00ffff;
                color: #ccc;
                font-size: 12px;
            `;
            this.assetDetailsContainer.appendChild(desc);
        }

        // Usage locations
        if (asset.usedIn && asset.usedIn.length > 0) {
            const usage = document.createElement('div');
            usage.style.cssText = `
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #00ffff;
            `;
            const usageLabel = document.createElement('div');
            usageLabel.textContent = 'Used in:';
            usageLabel.style.cssText = 'color: #888; margin-bottom: 4px; font-size: 12px;';
            usage.appendChild(usageLabel);

            asset.usedIn.forEach((location) => {
                const loc = document.createElement('div');
                loc.textContent = `  - ${location}`;
                loc.style.cssText = 'color: #00ffff; font-size: 11px; font-family: monospace;';
                usage.appendChild(loc);
            });

            this.assetDetailsContainer.appendChild(usage);
        }
    }

    /**
     * Refresh asset list
     */
    refreshAssetList() {
        if (this.assetScanner) {
            // Trigger scan if scanner available
            console.log('Refreshing asset list...');
        }
        this.updateAssetList();
    }

    /**
     * Show panel
     */
    show() {
        super.show();
        this.updateAssetList();
    }
}
