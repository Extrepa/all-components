/**
 * AssetAttributionPanel - UI for displaying asset attribution and credits
 *
 * Shows source, license, and metadata for all Codex assets
 *
 * @class AssetAttributionPanel
 * @extends BasePanel
 */
import { BasePanel } from './BasePanel.js';

export class AssetAttributionPanel extends BasePanel {
    /**
     * Create an AssetAttributionPanel instance
     * @param {Object} config - Configuration object
     * @param {CodexAssetIntegration} config.codexAssetIntegration - Codex asset integration instance
     */
    constructor(config = {}) {
        super({
            id: 'asset-attribution-panel',
            title: 'Asset Attribution',
            ...config,
        });

        this.codexAssetIntegration = config.codexAssetIntegration;
        this.assets = [];

        this.createUI();
        this.loadAssets();
    }

    createUI() {
        const container = document.createElement('div');
        container.className = 'asset-attribution-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ffff;
            border-radius: 8px;
            padding: 20px;
            color: #fff;
            font-family: 'Courier New', monospace;
            z-index: 2000;
            overflow-y: auto;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText =
            'margin-bottom: 20px; font-size: 20px; font-weight: bold; color: #00ffff; text-align: center;';
        header.textContent = '📦 Asset Attribution & Credits';
        container.appendChild(header);

        // Assets List
        const assetsList = document.createElement('div');
        assetsList.className = 'assets-list';
        assetsList.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';
        container.appendChild(assetsList);

        this.container = container;
        this.assetsList = assetsList;

        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕ Close';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: 1px solid #00ffff;
            color: #00ffff;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 4px;
        `;
        closeButton.onclick = () => this.hide();
        container.appendChild(closeButton);

        // Initially hidden
        this.hide();
    }

    loadAssets() {
        if (!this.codexAssetIntegration) {
            console.warn('AssetAttributionPanel: CodexAssetIntegration not available');
            return;
        }

        const loadedAssets = this.codexAssetIntegration.loadedAssets;
        this.assets = [];

        loadedAssets.forEach((asset, name) => {
            const assetInfo = {
                name: name,
                source: this.getAssetSource(asset),
                license: this.getAssetLicense(asset),
                downloadDate: this.getDownloadDate(asset),
                version: this.getAssetVersion(asset),
            };
            this.assets.push(assetInfo);
        });

        this.updateUI();
    }

    getAssetSource(asset) {
        let source = 'Unknown';
        asset.traverse((child) => {
            if (child.userData && child.userData.assetSource) {
                source = child.userData.assetSource;
            }
        });
        return source;
    }

    getAssetLicense(asset) {
        let license = 'Unknown';
        asset.traverse((child) => {
            if (child.userData && child.userData.license) {
                license = child.userData.license;
            }
        });
        return license;
    }

    getDownloadDate(asset) {
        // Try to get from userData, or use current date as fallback
        if (asset.userData && asset.userData.downloadDate) {
            return asset.userData.downloadDate;
        }
        return new Date().toISOString().split('T')[0];
    }

    getAssetVersion(asset) {
        if (asset.userData && asset.userData.version) {
            return asset.userData.version;
        }
        return '1.0';
    }

    updateUI() {
        if (!this.assetsList) {
            return;
        }

        this.assetsList.innerHTML = '';

        if (this.assets.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'text-align: center; color: #888; padding: 20px;';
            emptyMsg.textContent = 'No assets loaded';
            this.assetsList.appendChild(emptyMsg);
            return;
        }

        this.assets.forEach((asset) => {
            const assetElement = this.createAssetElement(asset);
            this.assetsList.appendChild(assetElement);
        });
    }

    createAssetElement(asset) {
        const element = document.createElement('div');
        element.className = 'asset-item';
        element.style.cssText = `
            padding: 15px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
        `;

        element.innerHTML = `
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #00ffff;">
                ${this.formatAssetName(asset.name)}
            </div>
            <div style="font-size: 12px; line-height: 1.6;">
                <div><strong>Source:</strong> ${asset.source}</div>
                <div><strong>License:</strong> ${asset.license}</div>
                <div><strong>Download Date:</strong> ${asset.downloadDate}</div>
                <div><strong>Version:</strong> ${asset.version}</div>
            </div>
        `;

        return element;
    }

    formatAssetName(name) {
        // Convert camelCase to Title Case
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    show() {
        if (this.container) {
            this.loadAssets(); // Reload assets when showing
            this.container.style.display = 'block';
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
