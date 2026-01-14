/**
 * RoomDefinition - Defines room configuration schema
 *
 * Provides validation and structure for room configurations
 */
import * as THREE from 'three';

export class RoomDefinition {
    /**
     * Create a new RoomDefinition
     * @param {Object} config - Room configuration
     */
    constructor(config = {}) {
        // Required fields
        this.id = config.id || `room_${Date.now()}`;
        this.name = config.name || 'Unnamed Room';
        this.type = config.type || 'default';

        // Size and bounds
        this.size = config.size || 20;
        this.height = config.height || 10;
        this.bounds = config.bounds || {
            minX: -this.size / 2,
            maxX: this.size / 2,
            minZ: -this.size / 2,
            maxZ: this.size / 2,
            minY: 0,
            maxY: this.height,
        };

        // Spawn points
        this.spawnPoints = config.spawnPoints || [
            { position: new THREE.Vector3(0, 0.5, 0), name: 'Default Spawn' },
        ];

        // Lighting configuration
        this.lighting = config.lighting || {
            ambient: { color: 0x404040, intensity: 0.5 },
            directional: { color: 0xffffff, intensity: 0.8, position: new THREE.Vector3(5, 10, 5) },
            pointLights: [],
            spotLights: [],
        };

        // Objects and props
        this.objects = config.objects || [];
        this.interactiveObjects = config.interactiveObjects || [];

        // Environment effects
        this.fog = config.fog || { enabled: false, color: 0x000000, near: 1, far: 50 };
        this.particles = config.particles || { enabled: true, intensity: 1.0 };

        // Room-specific settings
        this.settings = config.settings || {
            audioEnabled: true,
            collisionsEnabled: true,
            physicsEnabled: true,
        };

        // Variant/template support
        this.variant = config.variant || 'default';
        this.template = config.template || null;

        // Metadata
        this.description = config.description || '';
        this.tags = config.tags || [];
        this.maxPlayers = config.maxPlayers || 50;
    }

    /**
     * Validate the room definition
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Validate required fields
        if (!this.id || typeof this.id !== 'string') {
            errors.push('Room ID is required and must be a string');
        }

        if (!this.name || typeof this.name !== 'string') {
            errors.push('Room name is required and must be a string');
        }

        // Validate size
        if (typeof this.size !== 'number' || this.size <= 0) {
            errors.push('Room size must be a positive number');
        }

        if (typeof this.height !== 'number' || this.height <= 0) {
            errors.push('Room height must be a positive number');
        }

        // Validate bounds
        if (!this.bounds || typeof this.bounds !== 'object') {
            errors.push('Room bounds are required');
        } else {
            const requiredBounds = ['minX', 'maxX', 'minZ', 'maxZ', 'minY', 'maxY'];
            for (const key of requiredBounds) {
                if (typeof this.bounds[key] !== 'number') {
                    errors.push(`Bound ${key} must be a number`);
                }
            }
        }

        // Validate spawn points
        if (!Array.isArray(this.spawnPoints) || this.spawnPoints.length === 0) {
            errors.push('Room must have at least one spawn point');
        } else {
            this.spawnPoints.forEach((spawn, index) => {
                if (!spawn.position || !(spawn.position instanceof THREE.Vector3)) {
                    errors.push(`Spawn point ${index} must have a valid position`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Get a random spawn point
     * @returns {Object|null} Spawn point object, or null if none available
     */
    getRandomSpawnPoint() {
        if (this.spawnPoints.length === 0) {
            return null;
        }
        const index = Math.floor(Math.random() * this.spawnPoints.length);
        return this.spawnPoints[index];
    }

    /**
     * Get spawn point by name
     * @param {string} name - Spawn point name
     * @returns {Object|null} Spawn point object, or null if not found
     */
    getSpawnPoint(name) {
        return this.spawnPoints.find((spawn) => spawn.name === name) || null;
    }

    /**
     * Convert to JSON for serialization
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            size: this.size,
            height: this.height,
            bounds: this.bounds,
            spawnPoints: this.spawnPoints.map((spawn) => ({
                position: { x: spawn.position.x, y: spawn.position.y, z: spawn.position.z },
                name: spawn.name,
            })),
            lighting: {
                ...this.lighting,
                directional: {
                    ...this.lighting.directional,
                    position: {
                        x: this.lighting.directional.position.x,
                        y: this.lighting.directional.position.y,
                        z: this.lighting.directional.position.z,
                    },
                },
            },
            objects: this.objects,
            interactiveObjects: this.interactiveObjects,
            fog: this.fog,
            particles: this.particles,
            settings: this.settings,
            variant: this.variant,
            template: this.template,
            description: this.description,
            tags: this.tags,
            maxPlayers: this.maxPlayers,
        };
    }

    /**
     * Create RoomDefinition from JSON
     * @param {Object} data - JSON data
     * @returns {RoomDefinition} New RoomDefinition instance
     */
    static fromJSON(data) {
        const config = { ...data };

        // Convert spawn point positions back to Vector3
        if (config.spawnPoints) {
            config.spawnPoints = config.spawnPoints.map((spawn) => ({
                ...spawn,
                position: new THREE.Vector3(spawn.position.x, spawn.position.y, spawn.position.z),
            }));
        }

        // Convert lighting position back to Vector3
        if (
            config.lighting &&
            config.lighting.directional &&
            config.lighting.directional.position
        ) {
            config.lighting.directional.position = new THREE.Vector3(
                config.lighting.directional.position.x,
                config.lighting.directional.position.y,
                config.lighting.directional.position.z
            );
        }

        return new RoomDefinition(config);
    }
}
