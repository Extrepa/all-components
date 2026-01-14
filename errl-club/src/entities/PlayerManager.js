/**
 * PlayerManager - Manages local and remote players for multiplayer
 *
 * Handles player lifecycle, state synchronization, and integration with StateManager and EventBus
 */
import { RemotePlayer } from './RemotePlayer.js';
import { PlayerState } from './PlayerState.js';

export class PlayerManager {
    /**
     * Create a new PlayerManager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {StateManager} stateManager - State manager instance
     * @param {EventBus} eventBus - Event bus instance
     */
    constructor(scene, stateManager, eventBus) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.eventBus = eventBus;

        // Local player (ErrlAvatar instance)
        this.localPlayer = null;
        this.localPlayerId = null;

        // Remote players: Map<playerId, RemotePlayer>
        this.remotePlayers = new Map();

        // Player state tracking
        this.lastLocalState = null;
        this.stateUpdateRate = 20; // Updates per second
        this.lastStateUpdate = 0;

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Set the local player avatar
     * @param {Object} avatar - ErrlAvatar instance
     * @param {string} playerId - Local player ID
     */
    setLocalPlayer(avatar, playerId) {
        this.localPlayer = avatar;
        this.localPlayerId = playerId;

        // Update state manager
        if (this.stateManager) {
            this.stateManager.setState('player.avatar', avatar);
            this.stateManager.setState('multiplayer.localPlayerId', playerId);
        }

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('player.localPlayerSet', { playerId, avatar });
        }
    }

    /**
     * Add a remote player
     * @param {string} playerId - Unique player identifier
     * @param {PlayerState} initialState - Initial player state
     * @returns {RemotePlayer} The created RemotePlayer instance
     */
    addRemotePlayer(playerId, initialState = null) {
        // Don't add if it's the local player
        if (playerId === this.localPlayerId) {
            console.warn('PlayerManager.addRemotePlayer: Cannot add local player as remote');
            return null;
        }

        // Don't add if already exists
        if (this.remotePlayers.has(playerId)) {
            console.warn('PlayerManager.addRemotePlayer: Player already exists:', playerId);
            return this.remotePlayers.get(playerId);
        }

        // Create remote player
        const remotePlayer = new RemotePlayer(this.scene, playerId, initialState);
        this.remotePlayers.set(playerId, remotePlayer);

        // Update state manager
        if (this.stateManager) {
            const players = this.stateManager.getState('multiplayer.players') || [];
            if (!players.includes(playerId)) {
                players.push(playerId);
                this.stateManager.setState('multiplayer.players', players);
            }
        }

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('player.joined', {
                playerId,
                state: initialState ? initialState.toJSON() : null,
            });
        }

        console.log('PlayerManager: Remote player added:', playerId);
        return remotePlayer;
    }

    /**
     * Remove a remote player
     * @param {string} playerId - Player identifier to remove
     */
    removeRemotePlayer(playerId) {
        if (!this.remotePlayers.has(playerId)) {
            console.warn('PlayerManager.removeRemotePlayer: Player not found:', playerId);
            return;
        }

        // Dispose of remote player
        const remotePlayer = this.remotePlayers.get(playerId);
        remotePlayer.dispose();

        // Remove from map
        this.remotePlayers.delete(playerId);

        // Update state manager
        if (this.stateManager) {
            const players = this.stateManager.getState('multiplayer.players') || [];
            const index = players.indexOf(playerId);
            if (index > -1) {
                players.splice(index, 1);
                this.stateManager.setState('multiplayer.players', players);
            }
        }

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('player.left', { playerId });
        }

        console.log('PlayerManager: Remote player removed:', playerId);
    }

    /**
     * Update remote player state
     * @param {string} playerId - Player identifier
     * @param {PlayerState} newState - New player state
     */
    updateRemotePlayer(playerId, newState) {
        if (playerId === this.localPlayerId) {
            // Don't update local player through this method
            return;
        }

        const remotePlayer = this.remotePlayers.get(playerId);
        if (!remotePlayer) {
            // Player doesn't exist, create it
            this.addRemotePlayer(playerId, newState);
            return;
        }

        // Update remote player state
        remotePlayer.updateState(newState);

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('player.updated', {
                playerId,
                state: newState.toJSON(),
            });
        }
    }

    /**
     * Get local player state for network transmission
     * @returns {PlayerState|null} Current local player state, or null if no local player
     */
    getLocalPlayerState() {
        if (!this.localPlayer) {
            return null;
        }

        // Get network state from avatar
        const networkState = this.localPlayer.getNetworkState();

        // Create PlayerState from network state
        const playerState = new PlayerState({
            ...networkState,
            playerId: this.localPlayerId,
        });

        return playerState;
    }

    /**
     * Get delta (changes only) for local player state
     * Useful for delta compression in network transmission
     * @returns {Object|null} Delta state, or null if no changes
     */
    getLocalPlayerDelta() {
        if (!this.localPlayer) {
            return null;
        }

        const currentState = this.getLocalPlayerState();
        if (!currentState) {
            return null;
        }

        // Compare with last state
        if (this.lastLocalState) {
            const delta = currentState.diff(this.lastLocalState);
            if (delta) {
                this.lastLocalState = currentState.clone();
                return delta;
            }
            return null; // No changes
        } else {
            // First state, return full state
            this.lastLocalState = currentState.clone();
            return currentState.toJSON();
        }
    }

    /**
     * Update all remote players (called every frame)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update all remote players
        for (const [playerId, remotePlayer] of this.remotePlayers.entries()) {
            remotePlayer.update(deltaTime);

            // Check if player is still active (remove if timeout)
            if (!remotePlayer.isActive(5000)) {
                console.warn('PlayerManager: Remote player timeout:', playerId);
                this.removeRemotePlayer(playerId);
            }
        }
    }

    /**
     * Get all remote players
     * @returns {Map<string, RemotePlayer>} Map of remote players
     */
    getRemotePlayers() {
        return this.remotePlayers;
    }

    /**
     * Get a specific remote player
     * @param {string} playerId - Player identifier
     * @returns {RemotePlayer|null} Remote player instance, or null if not found
     */
    getRemotePlayer(playerId) {
        return this.remotePlayers.get(playerId) || null;
    }

    /**
     * Get local player
     * @returns {Object|null} Local player avatar, or null if not set
     */
    getLocalPlayer() {
        return this.localPlayer;
    }

    /**
     * Get all player IDs (including local player)
     * @returns {string[]} Array of player IDs
     */
    getAllPlayerIds() {
        const ids = [];
        if (this.localPlayerId) {
            ids.push(this.localPlayerId);
        }
        ids.push(...this.remotePlayers.keys());
        return ids;
    }

    /**
     * Get player count
     * @returns {number} Total number of players (local + remote)
     */
    getPlayerCount() {
        return (this.localPlayer ? 1 : 0) + this.remotePlayers.size;
    }

    /**
     * Clear all remote players (useful for disconnection)
     */
    clearRemotePlayers() {
        for (const playerId of this.remotePlayers.keys()) {
            this.removeRemotePlayer(playerId);
        }
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        if (!this.eventBus) {
            return;
        }

        // Listen for network events (will be connected in network layer)
        // This is a placeholder for future network integration
    }

    /**
     * Dispose of player manager (cleanup)
     */
    dispose() {
        // Remove all remote players
        this.clearRemotePlayers();

        // Clear local player reference
        this.localPlayer = null;
        this.localPlayerId = null;
        this.lastLocalState = null;
    }
}
