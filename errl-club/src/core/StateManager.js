/**
 * StateManager - Centralized game state management with subscription system
 *
 * Provides a single source of truth for game state, with change notifications
 * for systems that need to react to state changes.
 */
export class StateManager {
    constructor() {
        // Centralized state storage
        this.state = {
            // Player state
            player: {
                avatar: null,
                position: null,
                rotation: null,
                state: 'idle',
                expression: 'neutral',
                colorVariant: 'classic_purple',
                velocity: null,
                timestamp: 0,
            },
            // Room/Scene state
            room: {
                currentRoom: null,
                roomId: null,
                transitionInProgress: false,
            },
            // Settings
            settings: {
                graphics: {},
                audio: {},
                keybinds: {},
            },
            // Multiplayer state
            multiplayer: {
                connected: false,
                players: [],
                localPlayerId: null,
                connectionState: 'disconnected', // disconnected, connecting, connected, error
            },
            // Game state
            game: {
                paused: false,
                timeScale: 1.0,
                initialized: false,
            },
        };

        // Subscription system: Map<keyPath, Set<callback>>
        this.listeners = new Map();

        // State change history (for debugging, optional)
        this.history = [];
        this.maxHistorySize = 100;
        this.historyEnabled = false; // Enable only in debug mode
    }

    /**
     * Set state value at a specific path
     * @param {string|Array} keyPath - Dot-notation path or array of keys (e.g., 'player.state' or ['player', 'state'])
     * @param {*} value - Value to set
     * @param {boolean} silent - If true, don't trigger listeners or history
     * @returns {boolean} True if state was changed
     */
    setState(keyPath, value, silent = false) {
        const keys = Array.isArray(keyPath) ? keyPath : keyPath.split('.');
        const lastKey = keys.pop();

        // Navigate to the parent object
        let current = this.state;
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }

        // Check if value actually changed
        const oldValue = current[lastKey];
        if (oldValue === value) {
            return false; // No change
        }

        // Set the new value
        current[lastKey] = value;

        if (!silent) {
            // Add to history if enabled
            if (this.historyEnabled) {
                this.history.push({
                    path: Array.isArray(keyPath) ? keyPath.join('.') : keyPath,
                    oldValue: this.deepClone(oldValue),
                    newValue: this.deepClone(value),
                    timestamp: Date.now(),
                });

                // Trim history if too large
                if (this.history.length > this.maxHistorySize) {
                    this.history.shift();
                }
            }

            // Notify listeners
            this.notifyListeners(keyPath, value, oldValue);
        }

        return true;
    }

    /**
     * Get state value at a specific path
     * @param {string|Array} keyPath - Dot-notation path or array of keys
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} State value or default
     */
    getState(keyPath, defaultValue = undefined) {
        const keys = Array.isArray(keyPath) ? keyPath : keyPath.split('.');

        let current = this.state;
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return defaultValue;
            }
            if (!(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }

        return current;
    }

    /**
     * Subscribe to state changes at a specific path
     * @param {string|Array} keyPath - Path to watch
     * @param {Function} callback - Callback function (newValue, oldValue, path) => void
     * @returns {Function} Unsubscribe function
     */
    subscribe(keyPath, callback) {
        const path = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;

        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }

        this.listeners.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    /**
     * Unsubscribe from state changes
     * @param {string|Array} keyPath - Path to unwatch
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(keyPath, callback) {
        const path = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;
        const callbacks = this.listeners.get(path);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(path);
            }
        }
    }

    /**
     * Notify all listeners for a path and its parent paths
     * @private
     */
    notifyListeners(keyPath, newValue, oldValue) {
        const path = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;
        const pathParts = path.split('.');

        // Notify listeners for this exact path and all parent paths
        for (let i = pathParts.length; i > 0; i--) {
            const currentPath = pathParts.slice(0, i).join('.');
            const callbacks = this.listeners.get(currentPath);
            if (callbacks) {
                callbacks.forEach((callback) => {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error(`Error in state listener for path "${currentPath}":`, error);
                    }
                });
            }
        }
    }

    /**
     * Batch update multiple state values at once
     * @param {Object} updates - Object with keyPath: value pairs
     * @param {boolean} silent - If true, don't trigger listeners
     */
    batchUpdate(updates, silent = false) {
        for (const [keyPath, value] of Object.entries(updates)) {
            this.setState(keyPath, value, silent);
        }

        if (!silent) {
            // Notify all affected listeners
            for (const keyPath of Object.keys(updates)) {
                this.notifyListeners(keyPath, this.getState(keyPath), null);
            }
        }
    }

    /**
     * Reset state to initial values
     * @param {string|Array} keyPath - Optional path to reset (resets entire state if not provided)
     */
    reset(keyPath = null) {
        if (keyPath === null) {
            // Reset entire state
            this.state = {
                player: {
                    avatar: null,
                    position: null,
                    rotation: null,
                    state: 'idle',
                    expression: 'neutral',
                    colorVariant: 'classic_purple',
                    velocity: null,
                    timestamp: 0,
                },
                room: {
                    currentRoom: null,
                    roomId: null,
                    transitionInProgress: false,
                },
                settings: {
                    graphics: {},
                    audio: {},
                    keybinds: {},
                },
                multiplayer: {
                    connected: false,
                    players: [],
                    localPlayerId: null,
                    connectionState: 'disconnected',
                },
                game: {
                    paused: false,
                    timeScale: 1.0,
                    initialized: false,
                },
            };
        } else {
            // Reset specific path
            const keys = Array.isArray(keyPath) ? keyPath : keyPath.split('.');
            const lastKey = keys.pop();

            let current = this.state;
            for (const key of keys) {
                if (!(key in current)) {
                    return; // Path doesn't exist
                }
                current = current[key];
            }

            // Reset to default based on path
            if (lastKey === 'player') {
                current[lastKey] = {
                    avatar: null,
                    position: null,
                    rotation: null,
                    state: 'idle',
                    expression: 'neutral',
                    colorVariant: 'classic_purple',
                    velocity: null,
                    timestamp: 0,
                };
            } else if (lastKey === 'room') {
                current[lastKey] = {
                    currentRoom: null,
                    roomId: null,
                    transitionInProgress: false,
                };
            } else if (lastKey === 'multiplayer') {
                current[lastKey] = {
                    connected: false,
                    players: [],
                    localPlayerId: null,
                    connectionState: 'disconnected',
                };
            } else {
                current[lastKey] = undefined;
            }

            this.notifyListeners(keyPath, current[lastKey], null);
        }
    }

    /**
     * Enable or disable state change history
     * @param {boolean} enabled - Enable history tracking
     */
    setHistoryEnabled(enabled) {
        this.historyEnabled = enabled;
        if (!enabled) {
            this.history = [];
        }
    }

    /**
     * Get state change history
     * @param {string|Array} keyPath - Optional path to filter history
     * @returns {Array} History entries
     */
    getHistory(keyPath = null) {
        if (keyPath === null) {
            return [...this.history];
        }

        const path = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;
        return this.history.filter(
            (entry) => entry.path === path || entry.path.startsWith(path + '.')
        );
    }

    /**
     * Get entire state object (for debugging/serialization)
     * @returns {Object} Deep copy of state
     */
    getFullState() {
        return this.deepClone(this.state);
    }

    /**
     * Deep clone helper
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map((item) => this.deepClone(item));
        }

        const cloned = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }

        return cloned;
    }

    /**
     * Serialize state for network transmission
     * @param {string|Array} keyPath - Optional path to serialize (serializes entire state if not provided)
     * @returns {string} JSON string representation
     */
    serialize(keyPath = null) {
        const stateToSerialize = keyPath ? this.getState(keyPath) : this.state;

        // Convert Three.js objects to plain objects if present
        const serialized = this.serializeValue(stateToSerialize);

        return JSON.stringify(serialized);
    }

    /**
     * Deserialize state from network transmission
     * @param {string} jsonString - JSON string representation
     * @param {string|Array} keyPath - Optional path to deserialize into
     * @returns {boolean} True if deserialization was successful
     */
    deserialize(jsonString, keyPath = null) {
        try {
            const data = JSON.parse(jsonString);

            if (keyPath) {
                // Validate before setting
                if (this.validateState(keyPath, data)) {
                    this.setState(keyPath, data);
                    return true;
                }
            } else {
                // Validate entire state
                if (this.validateState(null, data)) {
                    this.state = data;
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error deserializing state:', error);
            return false;
        }
    }

    /**
     * Serialize a value, converting Three.js objects to plain objects
     * @private
     */
    serializeValue(value) {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle Three.js Vector3
        if (value.isVector3) {
            return { x: value.x, y: value.y, z: value.z, _type: 'Vector3' };
        }

        // Handle Three.js Euler
        if (value.isEuler) {
            return { x: value.x, y: value.y, z: value.z, order: value.order, _type: 'Euler' };
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map((item) => this.serializeValue(item));
        }

        // Handle objects
        if (typeof value === 'object') {
            const serialized = {};
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key) && key !== '_type') {
                    serialized[key] = this.serializeValue(value[key]);
                }
            }
            return serialized;
        }

        return value;
    }

    /**
     * Compute diff between current state and another state
     * @param {Object} otherState - State to compare against
     * @param {string|Array} keyPath - Optional path to diff (diffs entire state if not provided)
     * @returns {Object} Object with changed paths and their new values
     */
    diff(otherState, keyPath = null) {
        const currentState = keyPath ? this.getState(keyPath) : this.state;
        const diff = {};

        this.computeDiff(currentState, otherState, diff, keyPath ? [] : []);

        return diff;
    }

    /**
     * Recursively compute differences between two objects
     * @private
     */
    computeDiff(current, other, diff, path) {
        if (current === other) {
            return; // No difference
        }

        if (
            current === null ||
            other === null ||
            typeof current !== 'object' ||
            typeof other !== 'object'
        ) {
            // Primitive values or null
            if (current !== other) {
                const pathStr = path.join('.');
                diff[pathStr] = other;
            }
            return;
        }

        // Check all keys in current
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const newPath = [...path, key];
                if (!(key in other)) {
                    // Key removed
                    const pathStr = newPath.join('.');
                    diff[pathStr] = undefined;
                } else {
                    // Recurse
                    this.computeDiff(current[key], other[key], diff, newPath);
                }
            }
        }

        // Check keys in other that aren't in current
        for (const key in other) {
            if (Object.prototype.hasOwnProperty.call(other, key) && !(key in current)) {
                // New key added
                const pathStr = [...path, key].join('.');
                diff[pathStr] = other[key];
            }
        }
    }

    /**
     * Apply a diff to the current state
     * @param {Object} diff - Diff object with path: value pairs
     */
    applyDiff(diff) {
        for (const [path, value] of Object.entries(diff)) {
            if (value === undefined) {
                // Remove key (set to undefined)
                this.setState(path, undefined);
            } else {
                // Set value
                this.setState(path, value);
            }
        }
    }

    /**
     * Validate state structure
     * @param {string|Array} keyPath - Optional path to validate
     * @param {*} value - Value to validate
     * @returns {boolean} True if valid
     */
    validateState(keyPath, value) {
        // Basic validation - can be extended with schema validation
        if (value === null || value === undefined) {
            return true; // Null/undefined is valid
        }

        // Validate player state structure
        if (keyPath === 'player' || (typeof keyPath === 'string' && keyPath.startsWith('player'))) {
            if (typeof value !== 'object' || Array.isArray(value)) {
                return false;
            }

            // Check required fields if it's the full player object
            if (keyPath === 'player' || keyPath === null) {
                const required = ['state', 'expression', 'colorVariant'];
                for (const field of required) {
                    if (!(field in value)) {
                        console.warn(`Missing required field in player state: ${field}`);
                        return false;
                    }
                }
            }
        }

        // Validate multiplayer state
        if (
            keyPath === 'multiplayer' ||
            (typeof keyPath === 'string' && keyPath.startsWith('multiplayer'))
        ) {
            if (typeof value !== 'object' || Array.isArray(value)) {
                return false;
            }

            if (keyPath === 'multiplayer' || keyPath === null) {
                if (!('connectionState' in value)) {
                    return false;
                }

                const validStates = ['disconnected', 'connecting', 'connected', 'error'];
                if (!validStates.includes(value.connectionState)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Rollback state to a previous point in history
     * @param {number} steps - Number of steps to rollback
     * @returns {boolean} True if rollback was successful
     */
    rollback(steps = 1) {
        if (!this.historyEnabled || this.history.length === 0) {
            console.warn('State history not enabled or empty');
            return false;
        }

        if (steps > this.history.length) {
            steps = this.history.length;
        }

        // Get the state from steps ago
        const targetIndex = this.history.length - steps;
        const targetEntry = this.history[targetIndex];

        if (!targetEntry) {
            return false;
        }

        // Restore the old value
        this.setState(targetEntry.path, targetEntry.oldValue, true); // Silent to avoid adding to history

        // Remove rolled-back entries from history
        this.history.splice(targetIndex);

        return true;
    }

    /**
     * Get state snapshot for rollback
     * @returns {Object} Snapshot object
     */
    createSnapshot() {
        return {
            state: this.deepClone(this.state),
            timestamp: Date.now(),
        };
    }

    /**
     * Restore state from snapshot
     * @param {Object} snapshot - Snapshot object from createSnapshot()
     * @returns {boolean} True if restore was successful
     */
    restoreSnapshot(snapshot) {
        if (!snapshot || !snapshot.state) {
            return false;
        }

        if (this.validateState(null, snapshot.state)) {
            this.state = this.deepClone(snapshot.state);
            return true;
        }

        return false;
    }
}
