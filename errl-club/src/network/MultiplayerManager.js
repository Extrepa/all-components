/**
 * MultiplayerManager - Coordinates multiplayer helpers and syncs local/remote player state
 *
 * Wraps PlayerManager with network-aware synchronization (deltas, joins, leaves)
 * and connects the StateManager / EventBus with NetworkEventBus.
 */
import { PlayerManager } from '../entities/PlayerManager.js';
import { PlayerState } from '../entities/PlayerState.js';
import { StateSync } from './StateSync.js';

export class MultiplayerManager {
    constructor({ scene = null, stateManager = null, eventBus = null } = {}) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.playerManager = new PlayerManager(scene, stateManager, eventBus);

        this.networkEventBus = null;
        this.networkClient = null;
        this.localPlayerId = null;
        this.hasAnnounced = false;

        this.stateSync = new StateSync({
            updateRate: 20,
            interpolationDelay: 100,
            maxBufferSize: 16,
        });
        this.syncInterval = 1000 / this.stateSync.config.updateRate;
        this.lastSyncTime = 0;

        this.subscriptions = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.eventBus) {
            return;
        }

        this.subscriptions.push(
            this.eventBus.on('player.updated', (eventData) => this.handlePlayerUpdated(eventData))
        );
        this.subscriptions.push(
            this.eventBus.on('player.joined', (eventData) => this.handlePlayerJoined(eventData))
        );
        this.subscriptions.push(
            this.eventBus.on('player.left', (eventData) => this.handlePlayerLeft(eventData))
        );
    }

    handlePlayerUpdated(eventData) {
        if (!eventData || !eventData._fromNetwork) {
            return;
        }

        const playerId = eventData.playerId || eventData.state?.playerId;
        if (!playerId || playerId === this.localPlayerId) {
            return;
        }

        const statePayload = eventData.state || eventData;
        const playerState = new PlayerState(statePayload);
        playerState.playerId = playerId;

        this.stateSync.receiveRemoteState(
            playerId,
            statePayload,
            statePayload.timestamp || Date.now()
        );
        this.playerManager.updateRemotePlayer(playerId, playerState);
    }

    handlePlayerJoined(eventData) {
        if (!eventData || !eventData._fromNetwork) {
            return;
        }

        const playerId = eventData.playerId;
        if (!playerId || playerId === this.localPlayerId) {
            return;
        }

        this.playerManager.addRemotePlayer(playerId);
    }

    handlePlayerLeft(eventData) {
        if (!eventData || !eventData._fromNetwork) {
            return;
        }

        const playerId = eventData.playerId;
        if (!playerId) {
            return;
        }

        this.playerManager.removeRemotePlayer(playerId);
    }

    /**
     * Assign the local avatar and player identifier
     */
    setLocalPlayer(avatar, playerId = null) {
        if (playerId) {
            this.localPlayerId = playerId;
        } else if (!this.localPlayerId) {
            this.localPlayerId = 'player_local';
        }

        this.playerManager.setLocalPlayer(avatar, this.localPlayerId);

        if (this.stateManager) {
            this.stateManager.setState('multiplayer.localPlayerId', this.localPlayerId);
        }
    }

    /**
     * Update the player identifier without rebinding the avatar
     */
    setLocalPlayerId(playerId) {
        if (!playerId) {
            return;
        }
        this.localPlayerId = playerId;
        if (this.playerManager) {
            this.playerManager.localPlayerId = playerId;
        }
        if (this.stateManager) {
            this.stateManager.setState('multiplayer.localPlayerId', playerId);
        }
    }

    /**
     * Set the network client / event bus so syncs can flow
     */
    setNetworkClient(networkClient, networkEventBus) {
        this.networkClient = networkClient;
        this.networkEventBus = networkEventBus;
    }

    /**
     * Sync local state deltas to the network
     */
    syncLocalState() {
        if (!this.networkEventBus || !this.localPlayerId) {
            return;
        }

        if (
            this.networkClient &&
            typeof this.networkClient.isConnected === 'function' &&
            !this.networkClient.isConnected()
        ) {
            return;
        }

        const now =
            typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

        if (now - this.lastSyncTime < this.syncInterval) {
            return;
        }

        const delta = this.playerManager.getLocalPlayerDelta();
        if (!delta) {
            return;
        }

        this.lastSyncTime = now;

        if (!this.hasAnnounced && this.networkEventBus) {
            this.networkEventBus.emitLocal('player.joined', {
                playerId: this.localPlayerId,
                timestamp: Date.now(),
            });
            this.hasAnnounced = true;
        }

        const payload = {
            playerId: this.localPlayerId,
            state: delta,
        };

        this.networkEventBus.emitLocal('player.updated', payload);
    }

    update(deltaTime) {
        this.playerManager.update(deltaTime);
        this.syncLocalState();
    }

    dispose() {
        this.subscriptions.forEach((unsubscribe) => unsubscribe());
        this.playerManager.dispose();
    }
}
