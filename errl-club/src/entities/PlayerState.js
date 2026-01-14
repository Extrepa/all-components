/**
 * PlayerState - Defines player state structure for network synchronization
 *
 * Provides validation, comparison, and delta compression for player state updates
 */
import * as THREE from 'three';

export class PlayerState {
    /**
     * Create a new PlayerState
     * @param {Object} data - Initial state data
     */
    constructor(data = {}) {
        // Position and rotation
        this.position = data.position
            ? new THREE.Vector3(data.position.x, data.position.y, data.position.z)
            : new THREE.Vector3(0, 0.5, 0);
        this.rotation = data.rotation
            ? new THREE.Quaternion(
                  data.rotation.x,
                  data.rotation.y,
                  data.rotation.z,
                  data.rotation.w
              )
            : new THREE.Quaternion();
        this.velocity = data.velocity
            ? new THREE.Vector3(data.velocity.x, data.velocity.y, data.velocity.z)
            : new THREE.Vector3(0, 0, 0);

        // State machine
        this.state = data.state || 'idle';
        this.targetState = data.targetState || data.state || 'idle';

        // Expression and appearance
        this.expression = data.expression || 'neutral';
        this.colorVariant = data.colorVariant || 'classic_purple';

        // Movement flags
        this.isRunning = data.isRunning || false;
        this.isCrouching = data.isCrouching || false;
        this.isHopping = data.isHopping || false;
        this.isSitting = data.isSitting || false;

        // Metadata
        this.timestamp = data.timestamp || Date.now();
        this.playerId = data.playerId || null;
    }

    /**
     * Validate the player state
     * @returns {boolean} True if valid
     */
    isValid() {
        // Check required fields
        if (!this.position || !(this.position instanceof THREE.Vector3)) {
            return false;
        }
        if (!this.rotation || !(this.rotation instanceof THREE.Quaternion)) {
            return false;
        }
        if (!this.velocity || !(this.velocity instanceof THREE.Vector3)) {
            return false;
        }
        if (!this.state || typeof this.state !== 'string') {
            return false;
        }
        if (!this.expression || typeof this.expression !== 'string') {
            return false;
        }
        if (!this.colorVariant || typeof this.colorVariant !== 'string') {
            return false;
        }

        // Validate state values
        const validStates = ['idle', 'walk', 'run', 'hop', 'dance1', 'dance2', 'dance3', 'sit'];
        if (!validStates.includes(this.state)) {
            return false;
        }

        // Validate position is reasonable (not NaN, not infinite)
        if (
            !isFinite(this.position.x) ||
            !isFinite(this.position.y) ||
            !isFinite(this.position.z)
        ) {
            return false;
        }

        // Validate timestamp
        if (typeof this.timestamp !== 'number' || this.timestamp <= 0) {
            return false;
        }

        return true;
    }

    /**
     * Validate and throw if invalid
     * @throws {Error} If state is invalid
     */
    validate() {
        if (!this.isValid()) {
            throw new Error('Invalid PlayerState: ' + JSON.stringify(this.toJSON()));
        }
    }

    /**
     * Check if two states are equal
     * @param {PlayerState} other - Other state to compare
     * @param {number} epsilon - Tolerance for floating point comparison (default: 0.001)
     * @returns {boolean} True if states are equal
     */
    equals(other, epsilon = 0.001) {
        if (!other || !(other instanceof PlayerState)) {
            return false;
        }

        // Compare positions
        if (this.position.distanceTo(other.position) > epsilon) {
            return false;
        }

        // Compare rotations (quaternion dot product)
        const dot = this.rotation.dot(other.rotation);
        if (Math.abs(1 - Math.abs(dot)) > epsilon) {
            return false;
        }

        // Compare velocities
        if (this.velocity.distanceTo(other.velocity) > epsilon) {
            return false;
        }

        // Compare other fields
        if (this.state !== other.state) {
            return false;
        }
        if (this.targetState !== other.targetState) {
            return false;
        }
        if (this.expression !== other.expression) {
            return false;
        }
        if (this.colorVariant !== other.colorVariant) {
            return false;
        }
        if (this.isRunning !== other.isRunning) {
            return false;
        }
        if (this.isCrouching !== other.isCrouching) {
            return false;
        }
        if (this.isHopping !== other.isHopping) {
            return false;
        }
        if (this.isSitting !== other.isSitting) {
            return false;
        }

        return true;
    }

    /**
     * Get the difference between this state and another state
     * Returns only the fields that have changed (for delta compression)
     * @param {PlayerState} other - Other state to compare
     * @param {number} epsilon - Tolerance for floating point comparison (default: 0.001)
     * @returns {Object} Object containing only changed fields, or null if no changes
     */
    diff(other, epsilon = 0.001) {
        if (!other || !(other instanceof PlayerState)) {
            // If no other state, return full state
            return this.toJSON();
        }

        const changes = {};
        let hasChanges = false;

        // Compare positions
        if (this.position.distanceTo(other.position) > epsilon) {
            changes.position = {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
            };
            hasChanges = true;
        }

        // Compare rotations
        const dot = this.rotation.dot(other.rotation);
        if (Math.abs(1 - Math.abs(dot)) > epsilon) {
            changes.rotation = {
                x: this.rotation.x,
                y: this.rotation.y,
                z: this.rotation.z,
                w: this.rotation.w,
            };
            hasChanges = true;
        }

        // Compare velocities
        if (this.velocity.distanceTo(other.velocity) > epsilon) {
            changes.velocity = {
                x: this.velocity.x,
                y: this.velocity.y,
                z: this.velocity.z,
            };
            hasChanges = true;
        }

        // Compare state machine
        if (this.state !== other.state) {
            changes.state = this.state;
            hasChanges = true;
        }
        if (this.targetState !== other.targetState) {
            changes.targetState = this.targetState;
            hasChanges = true;
        }

        // Compare expression
        if (this.expression !== other.expression) {
            changes.expression = this.expression;
            hasChanges = true;
        }

        // Compare color variant
        if (this.colorVariant !== other.colorVariant) {
            changes.colorVariant = this.colorVariant;
            hasChanges = true;
        }

        // Compare movement flags
        if (this.isRunning !== other.isRunning) {
            changes.isRunning = this.isRunning;
            hasChanges = true;
        }
        if (this.isCrouching !== other.isCrouching) {
            changes.isCrouching = this.isCrouching;
            hasChanges = true;
        }
        if (this.isHopping !== other.isHopping) {
            changes.isHopping = this.isHopping;
            hasChanges = true;
        }
        if (this.isSitting !== other.isSitting) {
            changes.isSitting = this.isSitting;
            hasChanges = true;
        }

        // Always include timestamp
        changes.timestamp = this.timestamp;

        return hasChanges ? changes : null;
    }

    /**
     * Create a copy of this state
     * @returns {PlayerState} New PlayerState instance
     */
    clone() {
        return new PlayerState(this.toJSON());
    }

    /**
     * Convert to JSON for network transmission
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
            },
            rotation: {
                x: this.rotation.x,
                y: this.rotation.y,
                z: this.rotation.z,
                w: this.rotation.w,
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
                z: this.velocity.z,
            },
            state: this.state,
            targetState: this.targetState,
            expression: this.expression,
            colorVariant: this.colorVariant,
            isRunning: this.isRunning,
            isCrouching: this.isCrouching,
            isHopping: this.isHopping,
            isSitting: this.isSitting,
            timestamp: this.timestamp,
            playerId: this.playerId,
        };
    }

    /**
     * Create PlayerState from JSON
     * @param {Object} data - JSON data
     * @returns {PlayerState} New PlayerState instance
     */
    static fromJSON(data) {
        return new PlayerState(data);
    }
}
