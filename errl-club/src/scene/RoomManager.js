/**
 * RoomManager - Manages room lifecycle for multi-room architecture
 *
 * Handles room loading, unloading, switching, and state management
 */
import { RoomDefinition } from './RoomDefinition.js';
import { RoomTransition } from './RoomTransition.js';
import { RoomBuilder } from './RoomBuilder.js';

export class RoomManager {
    /**
     * Create a new RoomManager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {StateManager} stateManager - State manager instance
     * @param {EventBus} eventBus - Event bus instance
     */
    constructor(scene, stateManager, eventBus) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.eventBus = eventBus;

        // Current room
        this.currentRoom = null;
        this.currentRoomDefinition = null;
        this.currentRoomObjects = []; // Track objects added to scene

        // Available rooms
        this.availableRooms = new Map(); // Map<roomId, RoomDefinition>

        // Room transition
        this.transition = new RoomTransition();

        // Room builder
        this.roomBuilder = new RoomBuilder();

        // Loading state
        this.loading = false;
        this.transitionInProgress = false;
    }

    /**
     * Register a room definition
     * @param {RoomDefinition} roomDefinition - Room definition to register
     */
    registerRoom(roomDefinition) {
        if (!(roomDefinition instanceof RoomDefinition)) {
            throw new Error(
                'RoomManager.registerRoom: roomDefinition must be a RoomDefinition instance'
            );
        }

        // Validate room definition
        const validation = roomDefinition.validate();
        if (!validation.valid) {
            throw new Error(
                'RoomManager.registerRoom: Invalid room definition: ' + validation.errors.join(', ')
            );
        }

        this.availableRooms.set(roomDefinition.id, roomDefinition);

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('room.registered', {
                roomId: roomDefinition.id,
                roomName: roomDefinition.name,
            });
        }
    }

    /**
     * Load a room
     * @param {string} roomId - Room ID to load
     * @param {Object} options - Loading options
     * @param {boolean} options.transition - Whether to show transition (default: true)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async loadRoom(roomId, options = {}) {
        if (this.loading || this.transitionInProgress) {
            console.warn('RoomManager: Already loading or transitioning');
            return;
        }

        const roomDefinition = this.availableRooms.get(roomId);
        if (!roomDefinition) {
            throw new Error(`RoomManager: Room not found: ${roomId}`);
        }

        this.loading = true;
        this.transitionInProgress = true;

        try {
            // Emit transition start event
            if (this.eventBus) {
                this.eventBus.emit('room.transitionStart', {
                    roomId: roomId,
                    roomName: roomDefinition.name,
                    fromRoom: this.currentRoom,
                });
            }

            // Show transition
            if (options.transition !== false) {
                await this.transition.start();
            }

            // Emit loading event
            if (this.eventBus) {
                this.eventBus.emit('room.loading', {
                    roomId: roomId,
                    roomName: roomDefinition.name,
                });
            }

            // Show loading screen
            this.transition.showLoading(`Loading ${roomDefinition.name}...`);

            // Unload current room
            if (this.currentRoom) {
                await this.unloadCurrentRoom();
            }

            // Emit loading progress
            if (this.eventBus) {
                this.eventBus.emit('room.loadingProgress', { progress: 0.2 });
            }

            // Load new room
            await this.loadRoomObjects(roomDefinition);

            // Emit loading progress
            if (this.eventBus) {
                this.eventBus.emit('room.loadingProgress', { progress: 0.6 });
            }

            // Update state
            this.currentRoom = roomId;
            this.currentRoomDefinition = roomDefinition;

            // Set room-specific state (e.g., zero-gravity for floating rooms)
            if (this.stateManager) {
                const roomSettings = roomDefinition.settings || {};
                this.stateManager.setState('room.zeroGravity', roomSettings.zeroGravity || false);
                this.stateManager.setState('room.currentRoomId', roomId);
            }

            // Load room state if available
            if (this.roomStateManager) {
                const savedState = this.roomStateManager.getRoomState(roomId);
                if (savedState) {
                    // Apply saved state to room
                    this.applyRoomState(roomDefinition, savedState);
                }
            }

            // Emit loading progress
            if (this.eventBus) {
                this.eventBus.emit('room.loadingProgress', { progress: 0.9 });
            }

            // Update state manager
            if (this.stateManager) {
                this.stateManager.setState('room.currentRoom', roomId);
                this.stateManager.setState('room.roomId', roomId);
                this.stateManager.setState('room.transitionInProgress', false);
            }

            // Emit loading progress
            if (this.eventBus) {
                this.eventBus.emit('room.loadingProgress', { progress: 1.0 });
            }

            // Hide loading
            this.transition.hideLoading();

            // Complete transition
            if (options.transition !== false) {
                await this.transition.start();
            }

            // Emit transition complete
            if (this.eventBus) {
                this.eventBus.emit('room.transitionComplete', {
                    roomId,
                    roomName: roomDefinition.name,
                });
            }

            // Emit room loaded event
            if (this.eventBus) {
                this.eventBus.emit('room.loaded', {
                    roomId,
                    roomName: roomDefinition.name,
                });
            }

            console.log('RoomManager: Room loaded:', roomId);
        } catch (error) {
            console.error('RoomManager: Failed to load room:', error);
            this.transition.hideLoading();
            throw error;
        } finally {
            this.loading = false;
            this.transitionInProgress = false;
        }
    }

    /**
     * Unload current room
     * @private
     */
    async unloadCurrentRoom() {
        if (!this.currentRoom) {
            return;
        }

        // Save room state before unloading
        if (this.roomStateManager && this.currentRoomDefinition) {
            const roomState = this.captureRoomState();
            this.roomStateManager.saveRoomState(this.currentRoom, roomState);
        }

        // Remove all room objects from scene
        for (const object of this.currentRoomObjects) {
            if (object && object.parent) {
                object.parent.remove(object);
            }

            // Dispose of geometries and materials if needed
            if (object.dispose) {
                object.dispose();
            }
        }

        this.currentRoomObjects = [];

        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('room.unloaded', {
                roomId: this.currentRoom,
            });
        }
    }

    /**
     * Capture current room state
     * @returns {Object} Room state object
     * @private
     */
    captureRoomState() {
        const state = {
            objects: {},
            lighting: {},
            particles: {},
            savedAt: Date.now(),
        };

        // Capture object states
        for (const object of this.currentRoomObjects) {
            if (object.userData && object.userData.objectId) {
                state.objects[object.userData.objectId] = {
                    position: object.position
                        ? {
                              x: object.position.x,
                              y: object.position.y,
                              z: object.position.z,
                          }
                        : null,
                    rotation: object.rotation
                        ? {
                              x: object.rotation.x,
                              y: object.rotation.y,
                              z: object.rotation.z,
                          }
                        : null,
                    visible: object.visible !== undefined ? object.visible : true,
                };
            }
        }

        return state;
    }

    /**
     * Apply room state to room
     * @param {RoomDefinition} roomDefinition - Room definition
     * @param {Object} roomState - Room state to apply
     * @private
     */
    applyRoomState(roomDefinition, roomState) {
        // Apply object states
        if (roomState.objects) {
            for (const [objectId, objectState] of Object.entries(roomState.objects)) {
                // Find object in current room objects
                const object = this.currentRoomObjects.find(
                    (obj) => obj.userData && obj.userData.objectId === objectId
                );

                if (object && objectState) {
                    if (objectState.position && object.position) {
                        object.position.set(
                            objectState.position.x,
                            objectState.position.y,
                            objectState.position.z
                        );
                    }
                    if (objectState.rotation && object.rotation) {
                        object.rotation.set(
                            objectState.rotation.x,
                            objectState.rotation.y,
                            objectState.rotation.z
                        );
                    }
                    if (objectState.visible !== undefined) {
                        object.visible = objectState.visible;
                    }
                }
            }
        }

        // Apply lighting state (if room instance supports it)
        if (roomState.lighting && this.roomInstances) {
            const roomInstance = this.roomInstances.get(roomDefinition.id);
            if (roomInstance && roomInstance.data) {
                // Apply lighting settings
                // This would be room-specific implementation
            }
        }

        // Apply particle state (if room instance supports it)
        if (roomState.particles && this.roomInstances) {
            const roomInstance = this.roomInstances.get(roomDefinition.id);
            if (roomInstance && roomInstance.data) {
                // Apply particle settings
                // This would be room-specific implementation
            }
        }
    }

    /**
     * Load room objects
     * @param {RoomDefinition} roomDefinition - Room definition
     * @private
     */
    async loadRoomObjects(roomDefinition) {
        // Find room instance if available
        let roomInstance = null;
        if (this.roomInstances) {
            roomInstance = this.roomInstances.get(roomDefinition.id);
        }

        // If room instance exists, load it
        if (roomInstance) {
            await roomInstance.load();

            // Track room objects
            if (roomInstance.objects) {
                this.currentRoomObjects.push(...roomInstance.objects);
            }
            if (roomInstance.roomObjects) {
                // Register room-specific objects with interaction system
                for (const roomObject of roomInstance.roomObjects) {
                    if (roomObject.mesh) {
                        this.currentRoomObjects.push(roomObject.mesh);
                    }
                }
            }
        } else {
            // Fallback: Use RoomBuilder to build the room
            const roomData = this.roomBuilder.buildRoom(this.scene, {
                size: roomDefinition.size,
                height: roomDefinition.height,
                lighting: roomDefinition.lighting,
                fog: roomDefinition.fog,
            });

            // Track objects
            if (roomData.objects) {
                this.currentRoomObjects.push(...roomData.objects);
            }
        }

        // Update loading progress
        this.transition.updateLoadingProgress(1.0);
    }

    /**
     * Set room instances map
     * @param {Map} roomInstances - Map of room instances
     */
    setRoomInstances(roomInstances) {
        this.roomInstances = roomInstances;
    }

    /**
     * Switch to a different room
     * @param {string} roomId - Room ID to switch to
     * @param {Object} options - Switch options
     * @returns {Promise<void>} Resolves when switch is complete
     */
    async switchRoom(roomId, options = {}) {
        if (this.currentRoom === roomId) {
            console.warn('RoomManager: Already in room:', roomId);
            return;
        }

        // Emit switch event
        if (this.eventBus) {
            this.eventBus.emit('room.switching', {
                fromRoom: this.currentRoom,
                toRoom: roomId,
            });
        }

        // Update state
        if (this.stateManager) {
            this.stateManager.setState('room.transitionInProgress', true);
        }

        // Load new room
        await this.loadRoom(roomId, options);

        // Emit switched event
        if (this.eventBus) {
            this.eventBus.emit('room.switched', {
                fromRoom: this.currentRoom,
                toRoom: roomId,
            });
        }
    }

    /**
     * Get current room ID
     * @returns {string|null} Current room ID
     */
    getCurrentRoom() {
        return this.currentRoom;
    }

    /**
     * Get current room definition
     * @returns {RoomDefinition|null} Current room definition
     */
    getCurrentRoomDefinition() {
        return this.currentRoomDefinition;
    }

    /**
     * Get available rooms
     * @returns {RoomDefinition[]} Array of available room definitions
     */
    getAvailableRooms() {
        return Array.from(this.availableRooms.values());
    }

    /**
     * Check if a room is registered
     * @param {string} roomId - Room ID
     * @returns {boolean} True if room is registered
     */
    hasRoom(roomId) {
        return this.availableRooms.has(roomId);
    }

    /**
     * Get room definition
     * @param {string} roomId - Room ID
     * @returns {RoomDefinition|null} Room definition, or null if not found
     */
    getRoom(roomId) {
        return this.availableRooms.get(roomId) || null;
    }
}
