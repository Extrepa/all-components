# Room Definition Schema

This document describes the schema for room definitions used by the Room Management System.

## Overview

A `RoomDefinition` represents a complete room configuration, including geometry, lighting, spawn points, objects, and settings. Rooms are managed by the `RoomManager` and can be loaded, unloaded, and switched dynamically.

## Schema

### Required Fields

- **`id`** (string): Unique identifier for the room. Must be a non-empty string.
- **`name`** (string): Human-readable name for the room. Must be a non-empty string.
- **`size`** (number): Room size (width/depth) in world units. Must be a positive number.
- **`height`** (number): Room height in world units. Must be a positive number.
- **`bounds`** (object): Room boundaries with the following structure:
  - `minX` (number): Minimum X coordinate
  - `maxX` (number): Maximum X coordinate
  - `minZ` (number): Minimum Z coordinate
  - `maxZ` (number): Maximum Z coordinate
  - `minY` (number): Minimum Y coordinate
  - `maxY` (number): Maximum Y coordinate
- **`spawnPoints`** (array): Array of spawn point objects. Must have at least one spawn point. Each spawn point has:
  - `position` (THREE.Vector3): Spawn position
  - `name` (string): Spawn point name

### Optional Fields

- **`type`** (string): Room type identifier (default: `'default'`)
- **`lighting`** (object): Lighting configuration:
  - `ambient` (object): Ambient light settings
    - `color` (number): Color hex value
    - `intensity` (number): Light intensity
  - `directional` (object): Directional light settings
    - `color` (number): Color hex value
    - `intensity` (number): Light intensity
    - `position` (THREE.Vector3): Light position
  - `pointLights` (array): Array of point light configurations
  - `spotLights` (array): Array of spot light configurations
- **`objects`** (array): Array of room objects/props
- **`interactiveObjects`** (array): Array of interactive objects
- **`fog`** (object): Fog configuration:
  - `enabled` (boolean): Whether fog is enabled
  - `color` (number): Fog color hex value
  - `near` (number): Near fog distance
  - `far` (number): Far fog distance
- **`particles`** (object): Particle system configuration:
  - `enabled` (boolean): Whether particles are enabled
  - `intensity` (number): Particle intensity (0-1)
- **`settings`** (object): Room-specific settings:
  - `audioEnabled` (boolean): Whether audio is enabled
  - `collisionsEnabled` (boolean): Whether collisions are enabled
  - `physicsEnabled` (boolean): Whether physics are enabled
- **`variant`** (string): Room variant identifier (default: `'default'`)
- **`template`** (string|null): Template identifier (default: `null`)
- **`description`** (string): Room description (default: `''`)
- **`tags`** (array): Array of tag strings (default: `[]`)
- **`maxPlayers`** (number): Maximum number of players (default: `50`)

## Example

```javascript
import { RoomDefinition } from './RoomDefinition.js';
import * as THREE from 'three';

const mainClubRoom = new RoomDefinition({
    id: 'main_club',
    name: 'Main Club Room',
    type: 'club',
    size: 40,
    height: 12,
    bounds: {
        minX: -20,
        maxX: 20,
        minZ: -20,
        maxZ: 20,
        minY: 0,
        maxY: 12
    },
    spawnPoints: [
        {
            position: new THREE.Vector3(0, 0.5, 0),
            name: 'Center Spawn'
        },
        {
            position: new THREE.Vector3(-10, 0.5, 0),
            name: 'Left Spawn'
        }
    ],
    lighting: {
        ambient: {
            color: 0x404040,
            intensity: 0.5
        },
        directional: {
            color: 0xffffff,
            intensity: 0.8,
            position: new THREE.Vector3(5, 10, 5)
        },
        pointLights: [],
        spotLights: []
    },
    fog: {
        enabled: true,
        color: 0x000000,
        near: 1,
        far: 50
    },
    particles: {
        enabled: true,
        intensity: 1.0
    },
    settings: {
        audioEnabled: true,
        collisionsEnabled: true,
        physicsEnabled: true
    },
    description: 'The main club room with dance floor and bar',
    tags: ['club', 'main', 'dance'],
    maxPlayers: 50
});
```

## Validation

The `RoomDefinition.validate()` method checks:

1. Required fields are present and of correct type
2. Size and height are positive numbers
3. Bounds object contains all required numeric properties
4. At least one spawn point exists
5. All spawn points have valid THREE.Vector3 positions

## Serialization

Room definitions can be serialized to JSON using `toJSON()`:

```javascript
const json = roomDefinition.toJSON();
// Can be stored or transmitted
```

And restored from JSON using `fromJSON()`:

```javascript
const roomDefinition = RoomDefinition.fromJSON(json);
```

## Integration with RoomManager

To use a room definition:

```javascript
import { RoomManager } from './RoomManager.js';
import { RoomDefinition } from './RoomDefinition.js';

// Create room manager
const roomManager = new RoomManager(scene, stateManager, eventBus);

// Register a room
const roomDefinition = new RoomDefinition({ /* ... */ });
roomManager.registerRoom(roomDefinition);

// Load a room
await roomManager.loadRoom('main_club');

// Switch rooms
await roomManager.switchRoom('other_room');
```

## Events

The RoomManager emits the following events via EventBus:

- **`room.registered`**: Emitted when a room is registered
  - `roomId` (string): Room ID
  - `roomName` (string): Room name
- **`room.loaded`**: Emitted when a room is loaded
  - `roomId` (string): Room ID
  - `roomName` (string): Room name
- **`room.unloaded`**: Emitted when a room is unloaded
  - `roomId` (string): Room ID
- **`room.switching`**: Emitted when switching rooms
  - `fromRoom` (string|null): Previous room ID
  - `toRoom` (string): Target room ID
- **`room.switched`**: Emitted after room switch completes
  - `fromRoom` (string|null): Previous room ID
  - `toRoom` (string): New room ID

## Notes

- Room definitions are validated before registration
- Room objects are automatically cleaned up when unloading
- Transitions can be disabled by passing `{ transition: false }` to `loadRoom()` or `switchRoom()`
- The RoomManager tracks all objects added to the scene for proper cleanup

