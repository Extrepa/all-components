/**
 * NetworkInitializer - Handles network system initialization
 *
 * Creates NetworkClient, NetworkEventBus, and connects them to game systems
 */
import { NetworkClient } from '../../network/NetworkClient.js';
import { NetworkEventBus } from '../../network/NetworkEventBus.js';

export class NetworkInitializer {
    /**
     * Initialize network systems (optional - only if config provided)
     * @param {EventBus} eventBus - Game EventBus instance
     * @param {Object} networkConfig - Network configuration (optional)
     * @param {string} networkConfig.transport - Transport type ('websocket', 'supabase', 'webrtc')
     * @param {string} networkConfig.url - Connection URL
     * @param {Object} networkConfig.options - Transport-specific options
     * @returns {Object|null} Object containing networkClient and networkEventBus, or null if not configured
     */
    static initialize(eventBus, networkConfig = null) {
        // If no network config provided, return null (single-player mode)
        if (!networkConfig || !networkConfig.url) {
            return null;
        }

        // Create NetworkClient
        const networkClient = new NetworkClient(networkConfig);

        // Create NetworkEventBus
        const networkEventBus = new NetworkEventBus(eventBus, networkClient);

        // Setup default event configurations
        networkEventBus.setupDefaultEvents();

        // Setup message handler for network client
        networkClient.onMessage = (type, data, timestamp) => {
            if (type === 'event') {
                // Handle network events
                networkEventBus.receiveNetwork(data.name, data.data, data.id);
            }
        };

        return {
            networkClient,
            networkEventBus,
        };
    }

    /**
     * Generate a local player ID
     * @returns {string} Unique player ID
     */
    static generatePlayerId() {
        // Generate a unique player ID
        // In production, this might come from authentication
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Enable network support on game systems
     * @param {Object} systems - Game systems object
     * @param {Object} networkSystems - Network systems (from initialize)
     * @param {string} localPlayerId - Local player ID
     */
    static enableNetworkOnSystems(systems, networkSystems, localPlayerId) {
        if (!networkSystems) {
            return;
        }

        const { networkEventBus } = networkSystems;

        // Enable network on EventSystem
        if (systems.eventSystem && typeof systems.eventSystem.setNetworkEnabled === 'function') {
            systems.eventSystem.setNetworkEnabled(networkEventBus, localPlayerId);
        }

        // Enable network on WorldStateReactor
        if (
            systems.worldStateReactor &&
            typeof systems.worldStateReactor.setNetworkEnabled === 'function'
        ) {
            // Default to 'local' authority (each client controls its own reactions)
            // Can be changed to 'server' for centralized reaction control
            systems.worldStateReactor.setNetworkEnabled(networkEventBus, localPlayerId, 'local');
        }

        // Enable network on InteractionSystem
        if (
            systems.interactionSystem &&
            typeof systems.interactionSystem.setNetworkEnabled === 'function'
        ) {
            systems.interactionSystem.setNetworkEnabled(networkEventBus, localPlayerId);
        }
    }
}
