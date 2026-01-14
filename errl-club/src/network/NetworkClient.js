/**
 * NetworkClient - Abstract network interface for multiplayer
 *
 * Supports multiple transport types (Supabase Realtime, WebSocket, WebRTC)
 * Handles connection lifecycle, reconnection, and heartbeat
 */
export class NetworkClient {
    /**
     * Create a new NetworkClient
     * @param {Object} config - Configuration object
     * @param {string} config.transport - Transport type ('supabase', 'websocket', 'webrtc')
     * @param {string} config.url - Connection URL
     * @param {Object} config.options - Transport-specific options
     */
    constructor(config = {}) {
        this.config = {
            transport: config.transport || 'websocket',
            url: config.url || '',
            options: config.options || {},
            reconnectAttempts: config.reconnectAttempts || 5,
            reconnectDelay: config.reconnectDelay || 1000,
            heartbeatInterval: config.heartbeatInterval || 30000,
        };

        // Connection state
        this.state = 'disconnected'; // disconnected, connecting, connected, error
        this.connection = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;

        // Event handlers
        this.onMessage = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.onError = null;

        // Message queue (for messages sent while disconnected)
        this.messageQueue = [];
    }

    /**
     * Connect to the network
     * @returns {Promise<void>} Resolves when connected
     */
    async connect() {
        if (this.state === 'connected' || this.state === 'connecting') {
            console.warn('NetworkClient: Already connected or connecting');
            return;
        }

        this.state = 'connecting';

        try {
            switch (this.config.transport) {
                case 'supabase':
                    await this.connectSupabase();
                    break;
                case 'websocket':
                    await this.connectWebSocket();
                    break;
                case 'webrtc':
                    await this.connectWebRTC();
                    break;
                default:
                    throw new Error(`Unknown transport type: ${this.config.transport}`);
            }

            this.state = 'connected';
            this.reconnectAttempts = 0;

            // Start heartbeat
            this.startHeartbeat();

            // Flush message queue
            this.flushMessageQueue();

            // Call connect handler
            if (this.onConnect) {
                this.onConnect();
            }

            console.log('NetworkClient: Connected');
        } catch (error) {
            this.state = 'error';
            console.error('NetworkClient: Connection failed:', error);

            if (this.onError) {
                this.onError(error);
            }

            // Attempt reconnection
            this.scheduleReconnect();
        }
    }

    /**
     * Connect using Supabase Realtime
     * @private
     */
    async connectSupabase() {
        // Placeholder for Supabase Realtime connection
        // This would use @supabase/supabase-js and @supabase/realtime-js
        throw new Error('Supabase transport not yet implemented');
    }

    /**
     * Connect using WebSocket
     * @private
     */
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(this.config.url);

                ws.onopen = () => {
                    this.connection = ws;
                    resolve();
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('NetworkClient: Failed to parse message:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('NetworkClient: WebSocket error:', error);
                    reject(error);
                };

                ws.onclose = () => {
                    this.connection = null;
                    this.handleDisconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Connect using WebRTC
     * @private
     */
    async connectWebRTC() {
        // Placeholder for WebRTC connection
        // This would use RTCPeerConnection and signaling server
        throw new Error('WebRTC transport not yet implemented');
    }

    /**
     * Disconnect from the network
     */
    disconnect() {
        this.state = 'disconnected';

        // Clear timers
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Close connection
        if (this.connection) {
            if (this.connection.close) {
                this.connection.close();
            }
            this.connection = null;
        }

        // Call disconnect handler
        if (this.onDisconnect) {
            this.onDisconnect();
        }

        console.log('NetworkClient: Disconnected');
    }

    /**
     * Send a message
     * @param {string} type - Message type
     * @param {Object} data - Message data
     */
    send(type, data = {}) {
        const message = {
            type,
            data,
            timestamp: Date.now(),
        };

        if (this.state !== 'connected' || !this.connection) {
            // Queue message for later
            this.messageQueue.push(message);
            return;
        }

        try {
            const json = JSON.stringify(message);

            if (this.config.transport === 'websocket') {
                this.connection.send(json);
            } else if (this.config.transport === 'supabase') {
                // Supabase would use channel.send()
                // this.connection.send(json);
            }
        } catch (error) {
            console.error('NetworkClient: Failed to send message:', error);
        }
    }

    /**
     * Handle incoming message
     * @param {Object} message - Message object
     * @private
     */
    handleMessage(message) {
        if (this.onMessage) {
            this.onMessage(message.type, message.data, message.timestamp);
        }
    }

    /**
     * Handle disconnection
     * @private
     */
    handleDisconnect() {
        this.state = 'disconnected';
        this.stopHeartbeat();

        if (this.onDisconnect) {
            this.onDisconnect();
        }

        // Attempt reconnection if not manually disconnected
        if (this.reconnectAttempts < this.config.reconnectAttempts) {
            this.scheduleReconnect();
        }
    }

    /**
     * Schedule reconnection with exponential backoff
     * @private
     */
    scheduleReconnect() {
        if (this.reconnectTimer) {
            return;
        }

        const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(
            `NetworkClient: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
        );

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    /**
     * Start heartbeat/ping system
     * @private
     */
    startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            if (this.state === 'connected') {
                this.send('ping', {});
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Stop heartbeat
     * @private
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * Flush queued messages
     * @private
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message.type, message.data);
        }
    }

    /**
     * Get connection state
     * @returns {string} Connection state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if connected
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.state === 'connected';
    }
}
