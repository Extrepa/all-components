/**
 * BaseRoom - Base room class with common functionality
 *
 * Provides lifecycle methods and common room properties
 */
import { RoomDefinition } from '../RoomDefinition.js';
import { RoomBuilder } from '../RoomBuilder.js';
import { LightingSetup } from '../LightingSetup.js';
import { EnvironmentEffects } from '../EnvironmentEffects.js';

export class BaseRoom {
    /**
     * Create a new BaseRoom
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RoomDefinition} definition - Room definition
     */
    constructor(scene, definition) {
        if (!(definition instanceof RoomDefinition)) {
            throw new Error('BaseRoom: definition must be a RoomDefinition instance');
        }

        this.scene = scene;
        this.definition = definition;

        // Room state
        this.loaded = false;
        this.objects = [];
        this.lights = [];
        this.materials = {};

        // Room builders
        this.roomBuilder = new RoomBuilder(scene);
        this.lightingSetup = new LightingSetup(scene);
        this.environmentEffects = new EnvironmentEffects(scene);

        // Room-specific data
        this.data = {
            floorMaterial: null,
            wallMaterial: null,
            ceilingLights: [],
            ledStrips: [],
            speakerCones: [],
        };

        // Room-specific interactive objects
        this.roomObjects = [];
    }

    /**
     * Register a room-specific interactive object
     * @param {RoomSpecificObject} roomObject - Room-specific object
     */
    registerRoomObject(roomObject) {
        this.roomObjects.push(roomObject);
    }

    /**
     * Get room-specific objects
     * @returns {Array} Array of room objects
     */
    getRoomObjects() {
        return this.roomObjects;
    }

    /**
     * Load the room (async)
     * @returns {Promise<void>} Resolves when room is loaded
     */
    async load() {
        if (this.loaded) {
            console.warn('BaseRoom: Room already loaded');
            return;
        }

        try {
            // Build room structure
            const roomData = this.roomBuilder.build();
            this.materials = roomData.materials || {};
            this.objects.push(...(roomData.objects ? Object.values(roomData.objects) : []));
            if (roomData.speakerCones) {
                this.data.speakerCones = roomData.speakerCones;
            }

            // Setup lighting
            const lightingData = this.lightingSetup.build();
            this.lights.push(...(lightingData.ceilingLights || []));
            this.lights.push(...(lightingData.ledStrips || []));
            if (lightingData.spot) {
                this.lights.push(lightingData.spot);
            }
            this.data.ceilingLights = lightingData.ceilingLights || [];
            this.data.ledStrips = lightingData.ledStrips || [];

            // Setup environment effects
            const effectsData = this.environmentEffects.build();
            this.data.fog = effectsData.fog;
            this.data.screen = effectsData.screen;
            this.data.screenMaterial = effectsData.screenMaterial;
            this.data.screenTexture = effectsData.screenTexture;

            // Store materials
            this.data.floorMaterial = this.materials.floor;
            this.data.wallMaterial = this.materials.wall;

            this.loaded = true;
            console.log('BaseRoom: Room loaded:', this.definition.name);
        } catch (error) {
            console.error('BaseRoom: Failed to load room:', error);
            throw error;
        }
    }

    /**
     * Unload the room
     */
    unload() {
        if (!this.loaded) {
            return;
        }

        // Remove objects from scene
        for (const object of this.objects) {
            if (object && object.parent) {
                object.parent.remove(object);
            }

            // Dispose of geometries and materials
            if (object.dispose) {
                object.dispose();
            } else {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat) => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        }

        // Remove lights
        for (const light of this.lights) {
            if (light && light.parent) {
                light.parent.remove(light);
            }
        }

        // Clear arrays
        this.objects = [];
        this.lights = [];
        this.materials = {};
        this.data = {
            floorMaterial: null,
            wallMaterial: null,
            ceilingLights: [],
            ledStrips: [],
            speakerCones: [],
        };

        this.loaded = false;
        console.log('BaseRoom: Room unloaded:', this.definition.name);
    }

    /**
     * Update room (called every frame)
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Override in subclasses for room-specific updates
    }

    /**
     * Render room (called every frame)
     * @param {THREE.WebGLRenderer} renderer - The renderer
     * @param {THREE.Camera} camera - The camera
     */
    render(renderer, camera) {
        // Override in subclasses for room-specific rendering
    }

    /**
     * Get room data (for integration with game systems)
     * @returns {Object} Room data object
     */
    getData() {
        return {
            ...this.data,
            definition: this.definition,
            loaded: this.loaded,
        };
    }

    /**
     * Check if room is loaded
     * @returns {boolean} True if loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Get room definition
     * @returns {RoomDefinition} Room definition
     */
    getDefinition() {
        return this.definition;
    }
}
