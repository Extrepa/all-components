/**
 * ErrorReporter - Error reporting and logging
 *
 * Handles error reporting (Sentry integration or custom) and error logging
 */
export class ErrorReporter {
    /**
     * Create a new ErrorReporter
     * @param {Object} config - Configuration
     * @param {string} config.dsn - Sentry DSN (optional)
     * @param {string} config.endpoint - Custom error endpoint (optional)
     * @param {boolean} config.enabled - Whether error reporting is enabled (default: true)
     */
    constructor(config = {}) {
        this.config = {
            dsn: config.dsn || null,
            endpoint: config.endpoint || null,
            enabled: config.enabled !== false,
        };

        // Error queue
        this.errorQueue = [];
        this.maxQueueSize = 100;

        // Statistics
        this.stats = {
            errorsReported: 0,
            errorsFailed: 0,
            errorsLogged: 0,
        };

        // Setup global error handlers
        this.setupErrorHandlers();
    }

    /**
     * Setup global error handlers
     * @private
     */
    setupErrorHandlers() {
        // Window error handler
        window.addEventListener('error', (event) => {
            this.reportError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.reportError({
                message: 'Unhandled Promise Rejection',
                error: event.reason,
            });
        });
    }

    /**
     * Report an error
     * @param {Object} errorInfo - Error information
     * @param {string} errorInfo.message - Error message
     * @param {Error} errorInfo.error - Error object
     * @param {string} errorInfo.filename - Filename
     * @param {number} errorInfo.lineno - Line number
     * @param {number} errorInfo.colno - Column number
     * @param {Object} errorInfo.context - Additional context
     */
    reportError(errorInfo) {
        if (!this.config.enabled) {
            return;
        }

        const error = {
            message: errorInfo.message || 'Unknown error',
            stack: errorInfo.error?.stack || null,
            filename: errorInfo.filename || null,
            lineno: errorInfo.lineno || null,
            colno: errorInfo.colno || null,
            context: errorInfo.context || {},
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // Add to queue
        this.errorQueue.push(error);
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }

        // Log to console
        console.error('ErrorReporter:', error);
        this.stats.errorsLogged++;

        // Send to reporting service
        this.sendError(error);
    }

    /**
     * Send error to reporting service
     * @param {Object} error - Error object
     * @private
     */
    async sendError(error) {
        try {
            if (this.config.dsn) {
                // Send to Sentry (would require Sentry SDK)
                // Sentry.captureException(error.error || new Error(error.message), { extra: error });
                this.stats.errorsReported++;
            } else if (this.config.endpoint) {
                // Send to custom endpoint
                const response = await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(error),
                });

                if (response.ok) {
                    this.stats.errorsReported++;
                } else {
                    this.stats.errorsFailed++;
                }
            } else {
                // No endpoint configured, just log
                this.stats.errorsReported++;
            }
        } catch (err) {
            console.error('ErrorReporter: Failed to send error:', err);
            this.stats.errorsFailed++;
        }
    }

    /**
     * Get error statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            queuedErrors: this.errorQueue.length,
        };
    }

    /**
     * Get recent errors
     * @param {number} count - Number of errors to return (default: 10)
     * @returns {Array} Recent errors
     */
    getRecentErrors(count = 10) {
        return this.errorQueue.slice(-count);
    }

    /**
     * Clear error queue
     */
    clearQueue() {
        this.errorQueue = [];
    }
}
