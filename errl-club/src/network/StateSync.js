/**
 * StateSync - Handles state synchronization for multiplayer
 *
 * Implements delta compression, lag compensation, and state conflict resolution
 */
import { PlayerState } from '../entities/PlayerState.js';

export class StateSync {
    /**
     * Create a new StateSync
     * @param {Object} config - Configuration object
     * @param {number} config.updateRate - Updates per second (default: 20)
     * @param {number} config.interpolationDelay - Interpolation delay in ms (default: 100)
     */
    constructor(config = {}) {
        this.config = {
            updateRate: config.updateRate || 20,
            interpolationDelay: config.interpolationDelay || 100,
            maxBufferSize: config.maxBufferSize || 10,
        };

        // State buffers for lag compensation
        this.stateBuffer = new Map(); // Map<playerId, Array<{state, timestamp}>>

        // Last sent state (for delta compression)
        this.lastSentStates = new Map(); // Map<playerId, PlayerState>

        // Rate limiting
        this.lastUpdateTime = 0;
        this.updateInterval = 1000 / this.config.updateRate;

        // Callbacks
        this.onStateUpdate = null;
    }

    /**
     * Update local player state (called by game loop)
     * @param {string} playerId - Player ID
     * @param {PlayerState} state - Current player state
     * @returns {Object|null} Delta state to send, or null if rate limited
     */
    updateLocalState(playerId, state) {
        const now = Date.now();

        // Rate limiting
        if (now - this.lastUpdateTime < this.updateInterval) {
            return null;
        }

        this.lastUpdateTime = now;

        // Get last sent state
        const lastState = this.lastSentStates.get(playerId);

        // Calculate delta (only changed fields)
        let delta = null;
        if (lastState) {
            delta = state.diff(lastState);
        } else {
            // First state, send full state
            delta = state.toJSON();
        }

        // Update last sent state
        if (delta) {
            this.lastSentStates.set(playerId, state.clone());
        }

        return delta;
    }

    /**
     * Receive remote player state update
     * @param {string} playerId - Player ID
     * @param {Object} stateData - State data (can be delta or full state)
     * @param {number} timestamp - Server timestamp
     * @returns {PlayerState} Reconstructed player state
     */
    receiveRemoteState(playerId, stateData, timestamp = null) {
        // Get last known state
        const buffer = this.stateBuffer.get(playerId) || [];
        const lastState = buffer.length > 0 ? buffer[buffer.length - 1].state : null;

        // Reconstruct state (apply delta if needed)
        let newState;
        if (lastState && stateData.position === undefined && stateData.rotation === undefined) {
            // This is a delta, apply to last state
            newState = lastState.clone();
            // Apply delta fields
            if (stateData.position) {
                newState.position.set(
                    stateData.position.x,
                    stateData.position.y,
                    stateData.position.z
                );
            }
            if (stateData.rotation) {
                newState.rotation.set(
                    stateData.rotation.x,
                    stateData.rotation.y,
                    stateData.rotation.z,
                    stateData.rotation.w
                );
            }
            if (stateData.velocity) {
                newState.velocity.set(
                    stateData.velocity.x,
                    stateData.velocity.y,
                    stateData.velocity.z
                );
            }
            if (stateData.state) {
                newState.state = stateData.state;
            }
            if (stateData.targetState) {
                newState.targetState = stateData.targetState;
            }
            if (stateData.expression) {
                newState.expression = stateData.expression;
            }
            if (stateData.colorVariant) {
                newState.colorVariant = stateData.colorVariant;
            }
            if (typeof stateData.isRunning === 'boolean') {
                newState.isRunning = stateData.isRunning;
            }
            if (typeof stateData.isCrouching === 'boolean') {
                newState.isCrouching = stateData.isCrouching;
            }
            if (typeof stateData.isHopping === 'boolean') {
                newState.isHopping = stateData.isHopping;
            }
            if (typeof stateData.isSitting === 'boolean') {
                newState.isSitting = stateData.isSitting;
            }
            if (stateData.timestamp) {
                newState.timestamp = stateData.timestamp;
            }
        } else {
            // Full state
            newState = PlayerState.fromJSON(stateData);
        }

        newState.playerId = playerId;
        if (timestamp) {
            newState.timestamp = timestamp;
        }

        // Add to buffer for lag compensation
        if (!this.stateBuffer.has(playerId)) {
            this.stateBuffer.set(playerId, []);
        }
        const playerBuffer = this.stateBuffer.get(playerId);
        playerBuffer.push({
            state: newState,
            timestamp: timestamp || Date.now(),
        });

        // Limit buffer size
        if (playerBuffer.length > this.config.maxBufferSize) {
            playerBuffer.shift();
        }

        // Call update handler
        if (this.onStateUpdate) {
            this.onStateUpdate(playerId, newState);
        }

        return newState;
    }

    /**
     * Get interpolated state for a player (for lag compensation)
     * @param {string} playerId - Player ID
     * @param {number} targetTime - Target time for interpolation
     * @returns {PlayerState|null} Interpolated state, or null if not available
     */
    getInterpolatedState(playerId, targetTime) {
        const buffer = this.stateBuffer.get(playerId);
        if (!buffer || buffer.length < 2) {
            return buffer && buffer.length > 0 ? buffer[buffer.length - 1].state : null;
        }

        // Find two states to interpolate between
        let before = null;
        let after = null;

        for (let i = buffer.length - 1; i >= 0; i--) {
            const entry = buffer[i];
            if (entry.timestamp <= targetTime) {
                before = entry;
                if (i < buffer.length - 1) {
                    after = buffer[i + 1];
                }
                break;
            }
        }

        if (!before) {
            // Use most recent state
            return buffer[buffer.length - 1].state;
        }

        if (!after) {
            // Only one state available
            return before.state;
        }

        // Interpolate between before and after
        const t = (targetTime - before.timestamp) / (after.timestamp - before.timestamp);
        const tClamped = Math.max(0, Math.min(1, t));

        const interpolated = before.state.clone();

        // Interpolate position
        interpolated.position.lerpVectors(before.state.position, after.state.position, tClamped);

        // Interpolate rotation (slerp)
        interpolated.rotation.slerpQuaternions(
            before.state.rotation,
            after.state.rotation,
            tClamped
        );

        // Interpolate velocity
        interpolated.velocity.lerpVectors(before.state.velocity, after.state.velocity, tClamped);

        return interpolated;
    }

    /**
     * Clear state buffer for a player
     * @param {string} playerId - Player ID
     */
    clearPlayerBuffer(playerId) {
        this.stateBuffer.delete(playerId);
        this.lastSentStates.delete(playerId);
    }

    /**
     * Clear all state buffers
     */
    clearAllBuffers() {
        this.stateBuffer.clear();
        this.lastSentStates.clear();
    }

    /**
     * Handle state conflict (multiple clients update same state)
     * Uses last-write-wins strategy
     * @param {string} playerId - Player ID
     * @param {PlayerState} state1 - First state
     * @param {PlayerState} state2 - Second state
     * @returns {PlayerState} Resolved state
     */
    resolveConflict(playerId, state1, state2) {
        // Last-write-wins (use most recent timestamp)
        if (state1.timestamp > state2.timestamp) {
            return state1;
        } else if (state2.timestamp > state1.timestamp) {
            return state2;
        } else {
            // Same timestamp, use state1 as default
            return state1;
        }
    }
}
