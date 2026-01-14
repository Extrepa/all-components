/**
 * MessageHandler - Processes and routes incoming network messages
 *
 * Handles message validation, deserialization, and routing to appropriate handlers
 */
export class MessageHandler {
    /**
     * Create a new MessageHandler
     */
    constructor() {
        // Message type registry: Map<messageType, handler>
        this.handlers = new Map();

        // Message queue for processing
        this.messageQueue = [];
        this.processing = false;

        // Message statistics
        this.stats = {
            totalMessages: 0,
            messagesByType: new Map(),
            errors: 0,
        };
    }

    /**
     * Register a message handler
     * @param {string} messageType - Message type (e.g., 'player.update', 'event.trigger')
     * @param {Function} handler - Handler function (messageData, timestamp) => void
     */
    registerHandler(messageType, handler) {
        if (typeof handler !== 'function') {
            throw new Error('MessageHandler.registerHandler: handler must be a function');
        }

        if (!this.handlers.has(messageType)) {
            this.handlers.set(messageType, []);
        }

        this.handlers.get(messageType).push(handler);
    }

    /**
     * Unregister a message handler
     * @param {string} messageType - Message type
     * @param {Function} handler - Handler function to remove
     */
    unregisterHandler(messageType, handler) {
        const handlers = this.handlers.get(messageType);
        if (!handlers) {
            return;
        }

        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }

        if (handlers.length === 0) {
            this.handlers.delete(messageType);
        }
    }

    /**
     * Process an incoming message
     * @param {string} messageType - Message type
     * @param {Object} messageData - Message data
     * @param {number} timestamp - Message timestamp
     */
    processMessage(messageType, messageData, timestamp = null) {
        this.stats.totalMessages++;

        // Update statistics
        const count = this.stats.messagesByType.get(messageType) || 0;
        this.stats.messagesByType.set(messageType, count + 1);

        // Validate message
        if (!this.validateMessage(messageType, messageData)) {
            this.stats.errors++;
            console.warn('MessageHandler: Invalid message:', messageType, messageData);
            return;
        }

        // Get handlers for this message type
        const handlers = this.handlers.get(messageType);
        if (!handlers || handlers.length === 0) {
            // No handler registered, but not an error (some messages might be ignored)
            return;
        }

        // Call all handlers
        for (const handler of handlers) {
            try {
                handler(messageData, timestamp);
            } catch (error) {
                this.stats.errors++;
                console.error(`MessageHandler: Error in handler for ${messageType}:`, error);
            }
        }
    }

    /**
     * Queue a message for later processing
     * @param {string} messageType - Message type
     * @param {Object} messageData - Message data
     * @param {number} timestamp - Message timestamp
     */
    queueMessage(messageType, messageData, timestamp = null) {
        this.messageQueue.push({
            type: messageType,
            data: messageData,
            timestamp: timestamp || Date.now(),
        });
    }

    /**
     * Process queued messages
     */
    processQueue() {
        if (this.processing) {
            return;
        }
        this.processing = true;

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.processMessage(message.type, message.data, message.timestamp);
        }

        this.processing = false;
    }

    /**
     * Validate a message
     * @param {string} messageType - Message type
     * @param {Object} messageData - Message data
     * @returns {boolean} True if valid
     * @private
     */
    validateMessage(messageType, messageData) {
        if (!messageType || typeof messageType !== 'string') {
            return false;
        }

        if (messageData === null || messageData === undefined) {
            return false;
        }

        // Basic validation - can be extended with schema validation
        return true;
    }

    /**
     * Get message statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            totalMessages: this.stats.totalMessages,
            messagesByType: Object.fromEntries(this.stats.messagesByType),
            errors: this.stats.errors,
            queuedMessages: this.messageQueue.length,
        };
    }

    /**
     * Clear message queue
     */
    clearQueue() {
        this.messageQueue = [];
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalMessages: 0,
            messagesByType: new Map(),
            errors: 0,
        };
    }
}
