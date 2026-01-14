/**
 * Network configuration for multiplayer
 * Supports Supabase, WebSocket, and WebRTC transports
 */

/**
 * Get network configuration from environment variables
 * @returns {Object|null} Network configuration or null if not configured
 */
export function getNetworkConfig() {
    // Check for Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
        return {
            transport: 'supabase',
            url: supabaseUrl,
            options: {
                anonKey: supabaseAnonKey,
                channel: import.meta.env.VITE_SUPABASE_CHANNEL || 'errl_room_main',
            },
        };
    }

    // Check for WebSocket configuration
    const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (websocketUrl) {
        return {
            transport: 'websocket',
            url: websocketUrl,
            options: {},
        };
    }

    // No network configuration found
    return null;
}

/**
 * Default network configuration (for development/testing)
 * @returns {Object} Default configuration
 */
export function getDefaultNetworkConfig() {
    return {
        transport: 'websocket',
        url: 'ws://localhost:8080',
        options: {},
        reconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
    };
}

/**
 * Check if multiplayer is enabled
 * @returns {boolean} True if multiplayer is enabled
 */
export function isMultiplayerEnabled() {
    const config = getNetworkConfig();
    return config !== null;
}
