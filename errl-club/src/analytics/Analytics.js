/**
 * Analytics - Event tracking and user analytics
 *
 * Privacy-compliant event tracking with opt-in support
 */
export class Analytics {
    /**
     * Create a new Analytics
     * @param {Object} config - Configuration
     * @param {boolean} config.enabled - Whether analytics is enabled (default: true)
     * @param {boolean} config.optIn - Require opt-in (default: true)
     * @param {string} config.endpoint - Analytics endpoint URL (optional)
     */
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            optIn: config.optIn !== false,
            endpoint: config.endpoint || null,
        };

        // Opt-in state
        this.optedIn = this.checkOptIn();

        // Event queue (for batching)
        this.eventQueue = [];
        this.batchSize = 10;
        this.flushInterval = 5000; // ms
        this.flushTimer = null;

        // Statistics
        this.stats = {
            eventsTracked: 0,
            eventsSent: 0,
            eventsFailed: 0,
        };

        // Start flush timer
        if (this.config.enabled && this.optedIn) {
            this.startFlushTimer();
        }
    }

    /**
     * Check if user has opted in
     * @returns {boolean} True if opted in
     * @private
     */
    checkOptIn() {
        if (!this.config.optIn) {
            return true;
        }

        const stored = localStorage.getItem('analytics_opt_in');
        return stored === 'true';
    }

    /**
     * Opt in to analytics
     */
    optIn() {
        this.optedIn = true;
        localStorage.setItem('analytics_opt_in', 'true');
        this.startFlushTimer();
    }

    /**
     * Opt out of analytics
     */
    optOut() {
        this.optedIn = false;
        localStorage.setItem('analytics_opt_in', 'false');
        this.stopFlushTimer();
        this.eventQueue = [];
    }

    /**
     * Track an event
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data (no PII)
     */
    track(eventName, eventData = {}) {
        if (!this.config.enabled || !this.optedIn) {
            return;
        }

        const event = {
            name: eventName,
            data: this.sanitizeData(eventData),
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
        };

        this.eventQueue.push(event);
        this.stats.eventsTracked++;

        // Flush if queue is full
        if (this.eventQueue.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Sanitize event data (remove PII)
     * @param {Object} data - Event data
     * @returns {Object} Sanitized data
     * @private
     */
    sanitizeData(data) {
        const sanitized = { ...data };

        // Remove potential PII fields
        const piiFields = ['email', 'username', 'name', 'ip', 'address', 'phone'];
        piiFields.forEach((field) => {
            delete sanitized[field];
        });

        return sanitized;
    }

    /**
     * Get or create session ID
     * @returns {string} Session ID
     * @private
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Flush event queue
     */
    flush() {
        if (this.eventQueue.length === 0) {
            return;
        }

        const events = [...this.eventQueue];
        this.eventQueue = [];

        if (this.config.endpoint) {
            // Send to endpoint
            this.sendEvents(events);
        } else {
            // Log to console (development)
            console.log('Analytics events:', events);
            this.stats.eventsSent += events.length;
        }
    }

    /**
     * Send events to endpoint
     * @param {Array} events - Events to send
     * @private
     */
    async sendEvents(events) {
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events }),
            });

            if (response.ok) {
                this.stats.eventsSent += events.length;
            } else {
                this.stats.eventsFailed += events.length;
            }
        } catch (error) {
            console.error('Analytics: Failed to send events:', error);
            this.stats.eventsFailed += events.length;
        }
    }

    /**
     * Start flush timer
     * @private
     */
    startFlushTimer() {
        this.stopFlushTimer();
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    /**
     * Stop flush timer
     * @private
     */
    stopFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            queuedEvents: this.eventQueue.length,
            optedIn: this.optedIn,
        };
    }
}
