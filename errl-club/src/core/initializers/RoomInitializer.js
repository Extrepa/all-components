/**
 * RoomInitializer - Handles room system initialization
 *
 * Initializes RoomManager and registers all available rooms
 */
import { RoomManager } from '../../scene/RoomManager.js';
import { MainClubRoom } from '../../scene/rooms/MainClubRoom.js';
import { VisualizerRoom } from '../../scene/rooms/VisualizerRoom.js';
import { ChillRoom } from '../../scene/rooms/ChillRoom.js';
import { BarRoom } from '../../scene/rooms/BarRoom.js';
import { TunnelRoom } from '../../scene/rooms/TunnelRoom.js';
import { RoomStateManager } from '../../systems/RoomStateManager.js';

export class RoomInitializer {
    /**
     * Initialize room system
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {StateManager} stateManager - State manager instance
     * @param {EventBus} eventBus - Event bus instance
     * @param {SettingsManager} settingsManager - Settings manager instance (optional)
     * @returns {Object} Object containing roomManager and room instances
     */
    static initialize(scene, stateManager, eventBus, settingsManager = null) {
        // Create room state manager if settings manager is available
        let roomStateManager = null;
        if (settingsManager) {
            roomStateManager = new RoomStateManager(settingsManager);
        }

        // Create room manager
        const roomManager = new RoomManager(scene, stateManager, eventBus, roomStateManager);

        // Create room instances
        const mainClubRoom = new MainClubRoom(scene);
        const visualizerRoom = new VisualizerRoom(scene);
        const chillRoom = new ChillRoom(scene);
        const barRoom = new BarRoom(scene);
        const tunnelRoom = new TunnelRoom(scene);

        // Register all rooms with room manager
        roomManager.registerRoom(mainClubRoom.getDefinition());
        roomManager.registerRoom(visualizerRoom.getDefinition());
        roomManager.registerRoom(chillRoom.getDefinition());
        roomManager.registerRoom(barRoom.getDefinition());
        roomManager.registerRoom(tunnelRoom.getDefinition());

        // Store room instances for potential direct access
        const rooms = {
            mainClubRoom,
            visualizerRoom,
            chillRoom,
            barRoom,
            tunnelRoom,
        };

        // Create map for RoomManager
        const roomInstancesMap = new Map();
        roomInstancesMap.set('main_club_room', mainClubRoom);
        roomInstancesMap.set('visualizer_room', visualizerRoom);
        roomInstancesMap.set('chill_room', chillRoom);
        roomInstancesMap.set('bar_room', barRoom);
        roomInstancesMap.set('tunnel_room', tunnelRoom);

        // Set room instances in room manager
        roomManager.setRoomInstances(roomInstancesMap);

        return {
            roomManager,
            rooms,
            roomInstancesMap,
            roomStateManager,
        };
    }
}
