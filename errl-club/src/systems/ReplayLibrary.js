/**
 * ReplayLibrary - Manages multiple replays with metadata
 *
 * Stores, organizes, and manages replay recordings
 * Persists replays to localStorage
 *
 * @class ReplayLibrary
 */
export class ReplayLibrary {
    /**
     * Create a ReplayLibrary instance
     * Automatically loads replays from localStorage
     */
    constructor() {
        this.replays = new Map(); // Map<replayId, ReplayData>
        this.loadFromStorage();
    }

    /**
     * Save a replay to the library
     * @param {Object} replayData - Replay data from ReplaySystem
     * @param {string} name - Optional name for the replay
     * @returns {string} Replay ID
     */
    saveReplay(replayData, name = null) {
        const replayId = `replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const replay = {
            id: replayId,
            name: name || `Replay ${this.replays.size + 1}`,
            date: new Date().toISOString(),
            duration: replayData.duration || 0,
            frames: replayData.frames || [],
            metadata: {
                frameCount: replayData.frames?.length || 0,
                createdAt: new Date().toISOString(),
            },
        };

        this.replays.set(replayId, replay);
        this.saveToStorage();
        return replayId;
    }

    /**
     * Get a replay by ID
     * @param {string} replayId - Replay ID
     * @returns {Object} Replay data
     */
    getReplay(replayId) {
        return this.replays.get(replayId);
    }

    /**
     * Get all replays
     * @returns {Array} Array of replay metadata
     */
    getAllReplays() {
        return Array.from(this.replays.values()).map((replay) => ({
            id: replay.id,
            name: replay.name,
            date: replay.date,
            duration: replay.duration,
            frameCount: replay.metadata.frameCount,
        }));
    }

    /**
     * Delete a replay
     * @param {string} replayId - Replay ID
     * @returns {boolean} Success
     */
    deleteReplay(replayId) {
        const deleted = this.replays.delete(replayId);
        if (deleted) {
            this.saveToStorage();
        }
        return deleted;
    }

    /**
     * Rename a replay
     * @param {string} replayId - Replay ID
     * @param {string} newName - New name
     * @returns {boolean} Success
     */
    renameReplay(replayId, newName) {
        const replay = this.replays.get(replayId);
        if (!replay) {
            return false;
        }

        replay.name = newName;
        this.saveToStorage();
        return true;
    }

    /**
     * Search/filter replays
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered replays
     */
    searchReplays(filters = {}) {
        let results = Array.from(this.replays.values());

        if (filters.name) {
            const nameLower = filters.name.toLowerCase();
            results = results.filter((r) => r.name.toLowerCase().includes(nameLower));
        }

        if (filters.dateFrom) {
            results = results.filter((r) => new Date(r.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            results = results.filter((r) => new Date(r.date) <= new Date(filters.dateTo));
        }

        if (filters.minDuration) {
            results = results.filter((r) => r.duration >= filters.minDuration);
        }

        return results.map((replay) => ({
            id: replay.id,
            name: replay.name,
            date: replay.date,
            duration: replay.duration,
            frameCount: replay.metadata.frameCount,
        }));
    }

    /**
     * Save replays to localStorage
     */
    saveToStorage() {
        try {
            // Only save metadata, not full frame data (too large)
            const metadata = Array.from(this.replays.entries()).map(([id, replay]) => ({
                id: replay.id,
                name: replay.name,
                date: replay.date,
                duration: replay.duration,
                metadata: replay.metadata,
            }));

            localStorage.setItem('replayLibrary', JSON.stringify(metadata));
        } catch (error) {
            console.warn('Failed to save replay library:', error);
        }
    }

    /**
     * Load replays from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('replayLibrary');
            if (!stored) {
                return;
            }

            const metadata = JSON.parse(stored);
            metadata.forEach((meta) => {
                // Reconstruct replay object (frames will be empty, need to be re-recorded)
                this.replays.set(meta.id, {
                    id: meta.id,
                    name: meta.name,
                    date: meta.date,
                    duration: meta.duration,
                    frames: [], // Frames not stored in localStorage (too large)
                    metadata: meta.metadata,
                });
            });
        } catch (error) {
            console.warn('Failed to load replay library:', error);
        }
    }

    /**
     * Export replay as JSON
     * @param {string} replayId - Replay ID
     * @returns {string} JSON string
     */
    exportReplay(replayId) {
        const replay = this.replays.get(replayId);
        if (!replay) {
            return null;
        }

        return JSON.stringify(replay, null, 2);
    }

    /**
     * Import replay from JSON
     * @param {string} jsonData - JSON string
     * @returns {string} Replay ID
     */
    importReplay(jsonData) {
        try {
            const replay = JSON.parse(jsonData);
            if (!replay.id) {
                replay.id = `replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            this.replays.set(replay.id, replay);
            this.saveToStorage();
            return replay.id;
        } catch (error) {
            console.error('Failed to import replay:', error);
            return null;
        }
    }

    /**
     * Clear all replays
     */
    clear() {
        this.replays.clear();
        this.saveToStorage();
    }

    /**
     * Get replay count
     * @returns {number} Number of replays
     */
    getCount() {
        return this.replays.size;
    }
}
