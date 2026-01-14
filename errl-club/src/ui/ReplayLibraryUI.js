/**
 * ReplayLibraryUI - UI for managing replay library
 *
 * Displays list of replays, allows management (delete, rename, play)
 *
 * @class ReplayLibraryUI
 * @extends BasePanel
 */
import { BasePanel } from './BasePanel.js';

export class ReplayLibraryUI extends BasePanel {
    /**
     * Create a ReplayLibraryUI instance
     * @param {Object} config - Configuration object
     * @param {ReplayLibrary} config.replayLibrary - Replay library instance
     * @param {ReplaySystem} config.replaySystem - Replay system instance
     */
    constructor(config = {}) {
        super({
            id: 'replay-library-ui',
            title: 'Replay Library',
            ...config,
        });

        this.replayLibrary = config.replayLibrary;
        this.replaySystem = config.replaySystem;
        this.replays = [];

        this.createUI();
        this.loadReplays();
    }

    createUI() {
        const container = document.createElement('div');
        container.className = 'replay-library-container';
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
        header.textContent = '🎬 Replay Library';
        container.appendChild(header);

        // Search/Filter
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'margin-bottom: 15px;';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search replays...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 8px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
            color: #fff;
            font-family: 'Courier New', monospace;
        `;
        searchInput.oninput = (e) => this.filterReplays(e.target.value);
        searchContainer.appendChild(searchInput);
        container.appendChild(searchContainer);

        // Replays List
        const replaysList = document.createElement('div');
        replaysList.className = 'replays-list';
        replaysList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        container.appendChild(replaysList);

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

        this.container = container;
        this.replaysList = replaysList;
        this.searchInput = searchInput;

        // Initially hidden
        this.hide();
    }

    loadReplays() {
        if (!this.replayLibrary) {
            console.warn('ReplayLibraryUI: ReplayLibrary not available');
            return;
        }

        this.replays = this.replayLibrary.getAllReplays();
        this.updateUI();
    }

    filterReplays(query) {
        if (!query) {
            this.updateUI();
            return;
        }

        const filtered = this.replayLibrary.searchReplays({ name: query });
        this.displayReplays(filtered);
    }

    updateUI() {
        this.displayReplays(this.replays);
    }

    displayReplays(replays) {
        if (!this.replaysList) {
            return;
        }

        this.replaysList.innerHTML = '';

        if (replays.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'text-align: center; color: #888; padding: 20px;';
            emptyMsg.textContent = 'No replays saved';
            this.replaysList.appendChild(emptyMsg);
            return;
        }

        replays.forEach((replay) => {
            const replayElement = this.createReplayElement(replay);
            this.replaysList.appendChild(replayElement);
        });
    }

    createReplayElement(replay) {
        const element = document.createElement('div');
        element.className = 'replay-item';
        element.style.cssText = `
            padding: 15px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const info = document.createElement('div');
        info.style.cssText = 'flex: 1;';
        info.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${replay.name}</div>
            <div style="font-size: 12px; color: #888;">
                ${new Date(replay.date).toLocaleString()} • ${replay.duration.toFixed(1)}s • ${replay.frameCount} frames
            </div>
        `;

        const actions = document.createElement('div');
        actions.style.cssText = 'display: flex; gap: 10px;';

        // Play button
        const playButton = document.createElement('button');
        playButton.textContent = '▶ Play';
        playButton.style.cssText = `
            padding: 5px 10px;
            background: #00ffff;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;
        playButton.onclick = () => this.playReplay(replay.id);
        actions.appendChild(playButton);

        // Rename button
        const renameButton = document.createElement('button');
        renameButton.textContent = '✏️';
        renameButton.style.cssText = `
            padding: 5px 10px;
            background: transparent;
            border: 1px solid #00ffff;
            color: #00ffff;
            border-radius: 4px;
            cursor: pointer;
        `;
        renameButton.onclick = () => this.renameReplay(replay.id, replay.name);
        actions.appendChild(renameButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.style.cssText = `
            padding: 5px 10px;
            background: transparent;
            border: 1px solid #ff0000;
            color: #ff0000;
            border-radius: 4px;
            cursor: pointer;
        `;
        deleteButton.onclick = () => this.deleteReplay(replay.id);
        actions.appendChild(deleteButton);

        element.appendChild(info);
        element.appendChild(actions);

        return element;
    }

    playReplay(replayId) {
        if (!this.replayLibrary || !this.replaySystem) {
            return;
        }

        const replay = this.replayLibrary.getReplay(replayId);
        if (!replay) {
            return;
        }

        // Note: Replay frames are not stored in localStorage, so this would need
        // to be re-recorded or loaded from a different source
        console.log('Playing replay:', replay.name);
        // this.replaySystem.spawnGhost(replay.frames);
    }

    renameReplay(replayId, currentName) {
        if (!this.replayLibrary) {
            return;
        }

        const newName = prompt('Enter new name:', currentName);
        if (newName && newName.trim()) {
            this.replayLibrary.renameReplay(replayId, newName.trim());
            this.loadReplays();
        }
    }

    deleteReplay(replayId) {
        if (!this.replayLibrary) {
            return;
        }

        if (confirm('Delete this replay?')) {
            this.replayLibrary.deleteReplay(replayId);
            this.loadReplays();
        }
    }

    show() {
        if (this.container) {
            this.loadReplays(); // Reload when showing
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
