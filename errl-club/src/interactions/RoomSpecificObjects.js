/**
 * RoomSpecificObjects - Base class for room-specific interactive objects
 *
 * Provides common functionality for objects that are unique to specific room types
 */
import * as THREE from 'three';

export class RoomSpecificObject {
    /**
     * Create a new RoomSpecificObject
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Vector3} position - Object position
     * @param {string} roomId - Room ID this object belongs to
     * @param {Object} config - Configuration object
     */
    constructor(scene, position, roomId, config = {}) {
        this.scene = scene;
        this.position = position;
        this.roomId = roomId;
        this.config = config;

        // Object state
        this.mesh = null;
        this.interactive = true;
        this.discovered = false;
        this.interactionCount = 0;

        // Create the object
        this.createObject();
    }

    /**
     * Create the 3D object
     * @protected
     */
    createObject() {
        // Override in subclasses
        // Default: create a simple box
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.roomObjectId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.roomId = this.roomId;
        this.scene.add(this.mesh);
    }

    /**
     * Handle interaction
     * @param {Object} avatar - Avatar that interacted
     * @returns {boolean} True if interaction was successful
     */
    interact(avatar) {
        if (!this.interactive) {
            return false;
        }

        this.interactionCount++;

        // Mark as discovered on first interaction
        if (!this.discovered) {
            this.discovered = true;
            this.onDiscovered(avatar);
        }

        // Handle the interaction
        this.onInteract(avatar);

        return true;
    }

    /**
     * Called when object is first discovered
     * @param {Object} avatar - Avatar that discovered it
     * @protected
     */
    onDiscovered(avatar) {
        // Override in subclasses
        console.log(`RoomSpecificObject: Object discovered in room ${this.roomId}`);
    }

    /**
     * Called when object is interacted with
     * @param {Object} avatar - Avatar that interacted
     * @protected
     */
    onInteract(avatar) {
        // Override in subclasses
        console.log(`RoomSpecificObject: Object interacted with in room ${this.roomId}`);
    }

    /**
     * Update object (called each frame)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Override in subclasses for animations
    }

    /**
     * Check if object is discovered
     * @returns {boolean} True if discovered
     */
    isDiscovered() {
        return this.discovered;
    }

    /**
     * Get interaction count
     * @returns {number} Number of interactions
     */
    getInteractionCount() {
        return this.interactionCount;
    }

    /**
     * Dispose of the object
     */
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach((mat) => mat.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
            this.mesh = null;
        }
    }
}

/**
 * VisualizerRoomObject - Object specific to VisualizerRoom
 */
export class VisualizerRoomObject extends RoomSpecificObject {
    constructor(scene, position, config = {}) {
        super(scene, position, 'visualizer_room', config);
    }

    createObject() {
        // Create a visualizer-specific object (e.g., light control panel)
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.roomObjectId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.roomId = this.roomId;
        this.scene.add(this.mesh);
    }

    onInteract(avatar) {
        // Visualizer room specific interaction
        console.log('VisualizerRoomObject: Light control panel activated');
    }
}

/**
 * ChillRoomObject - Object specific to ChillRoom
 */
export class ChillRoomObject extends RoomSpecificObject {
    constructor(scene, position, config = {}) {
        super(scene, position, 'chill_room', config);
    }

    createObject() {
        // Create a chill room specific object (e.g., comfortable seating)
        const geometry = new THREE.BoxGeometry(1.5, 0.5, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8b4513,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.roomObjectId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.roomId = this.roomId;
        this.scene.add(this.mesh);
    }

    onInteract(avatar) {
        // Chill room specific interaction
        console.log('ChillRoomObject: Comfortable seating used');
    }
}

/**
 * BarRoomObject - Object specific to BarRoom
 */
export class BarRoomObject extends RoomSpecificObject {
    constructor(scene, position, config = {}) {
        super(scene, position, 'bar_room', config);
    }

    createObject() {
        // Create a bar room specific object (e.g., bar counter)
        const geometry = new THREE.BoxGeometry(3, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4a4a4a,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.roomObjectId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.roomId = this.roomId;
        this.scene.add(this.mesh);
    }

    onInteract(avatar) {
        // Bar room specific interaction
        console.log('BarRoomObject: Bar counter interaction');
    }
}
