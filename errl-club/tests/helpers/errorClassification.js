/**
 * Error Classification Helper for Playwright Tests
 * 
 * Classifies console errors and suggests fixes based on error patterns.
 */

/**
 * Error classification types
 */
export const ERROR_TYPES = {
    CRITICAL: 'critical',
    EXPECTED: 'expected',
    KNOWN_BUG: 'known_bug',
    UNKNOWN: 'unknown'
};

/**
 * Error patterns for classification
 */
export const ERROR_PATTERNS = {
    // TDZ (Temporal Dead Zone) errors
    tdz: {
        pattern: /Cannot access .+ before initialization/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Variable accessed before initialization (TDZ error)',
        suggestion: 'Move variable declaration before its first use, or ensure it\'s initialized before access'
    },
    
    // Undefined method errors
    undefinedMethod: {
        pattern: /is not a function/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Method or function does not exist',
        suggestion: 'Check if method exists in the class/object, or add the missing method'
    },
    
    // Undefined property errors
    undefinedProperty: {
        pattern: /Cannot read properties of (undefined|null)/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Property accessed on undefined or null object',
        suggestion: 'Add null/undefined check before accessing property, or ensure object is initialized'
    },
    
    // Import/export errors
    importError: {
        pattern: /does not provide an export named|Failed to load module|Cannot find module/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Module import/export error',
        suggestion: 'Check export name matches import, or verify module path is correct'
    },
    
    // WebGL texture limit errors (expected, handled by PostProcessingManager)
    webglTextureLimit: {
        pattern: /texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS/,
        type: ERROR_TYPES.EXPECTED,
        description: 'WebGL texture unit limit exceeded (handled by PostProcessingManager)',
        suggestion: 'This is expected - PostProcessingManager disables post-processing when this occurs'
    },
    
    // WebGL invalid program errors (expected, handled by PostProcessingManager)
    webglInvalidProgram: {
        pattern: /useProgram: program not valid|INVALID_OPERATION: useProgram/,
        type: ERROR_TYPES.EXPECTED,
        description: 'WebGL program validation error (handled by PostProcessingManager)',
        suggestion: 'This is expected - PostProcessingManager handles this gracefully'
    },
    
    // WebGL too many errors (expected suppression)
    webglTooManyErrors: {
        pattern: /too many errors, no more errors will be reported/,
        type: ERROR_TYPES.EXPECTED,
        description: 'WebGL error suppression (too many errors)',
        suggestion: 'This is expected - WebGL error handler suppresses after max errors'
    },
    
    // Known bugs - Ghost replay system
    ghostReplayError: {
        pattern: /ReplaySystem.*position|ghost.*position/,
        type: ERROR_TYPES.KNOWN_BUG,
        description: 'Ghost replay system error (known bug)',
        suggestion: 'Known bug - Ghost replay may have undefined position reference. Check ReplaySystem.js'
    },
    
    // Known bugs - Visualizer dropdown
    visualizerDropdownError: {
        pattern: /selectElement\.options.*not iterable|VisualizerStylePicker/,
        type: ERROR_TYPES.KNOWN_BUG,
        description: 'Visualizer dropdown error (known bug)',
        suggestion: 'Known bug - Visualizer dropdown selection issue. Check VisualizerStylePicker.js'
    },
    
    // Known bugs - UV mode
    uvModeError: {
        pattern: /VisualEffects.*clone|UV mode.*clone/,
        type: ERROR_TYPES.KNOWN_BUG,
        description: 'UV mode error (known bug)',
        suggestion: 'Known bug - UV mode material cloning issue. Check VisualEffects.js:56'
    },
    
    // LoadingScreen/MainMenu migration errors
    loadingScreenError: {
        pattern: /LoadingScreen|loadingScreen|loading-screen/,
        type: ERROR_TYPES.CRITICAL,
        description: 'LoadingScreen reference error (should be MainMenu)',
        suggestion: 'Replace LoadingScreen/loadingScreen/loading-screen with MainMenu/mainMenu/main-menu'
    },
    
    // Phase B: StateManager errors
    stateManagerError: {
        pattern: /StateManager|stateManager|state\.get|state\.set|StateManager\.get|StateManager\.set/,
        type: ERROR_TYPES.CRITICAL,
        description: 'StateManager error',
        suggestion: 'Check StateManager initialization and state access patterns'
    },
    
    // Phase B: EventBus errors
    eventBusError: {
        pattern: /EventBus|eventBus|\.on\(|\.emit\(|EventBus\.on|EventBus\.emit/,
        type: ERROR_TYPES.CRITICAL,
        description: 'EventBus error',
        suggestion: 'Check EventBus initialization and event registration/emission'
    },
    
    // Phase B: Serialization errors
    serializationError: {
        pattern: /toJSON|fromJSON|serialize|deserialize|getNetworkState|applyNetworkState/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Serialization/deserialization error',
        suggestion: 'Check serialization methods (toJSON/fromJSON) and network state methods'
    },
    
    // Phase C: Network connection errors
    networkError: {
        pattern: /NetworkClient|network|connection|socket|websocket|NetworkClient\.connect|NetworkClient\.disconnect/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Network connection error',
        suggestion: 'Check NetworkClient initialization and connection handling'
    },
    
    // Phase C: State synchronization errors
    stateSyncError: {
        pattern: /StateSync|state sync|delta compression|StateSync\.sync|StateSync\.compress/,
        type: ERROR_TYPES.CRITICAL,
        description: 'State synchronization error',
        suggestion: 'Check StateSync implementation and delta compression logic'
    },
    
    // Phase C: Player management errors
    playerError: {
        pattern: /PlayerManager|RemotePlayer|player state|PlayerManager\.add|PlayerManager\.remove|RemotePlayer\.update/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Player management error',
        suggestion: 'Check PlayerManager and RemotePlayer initialization and state updates'
    },
    
    // Phase D: Room management errors
    roomError: {
        pattern: /RoomManager|RoomDefinition|room loading|room transition|RoomManager\.load|RoomManager\.unload/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Room management error',
        suggestion: 'Check RoomManager initialization and room loading/unloading logic'
    },
    
    // Phase D: Asset loading errors
    assetError: {
        pattern: /AssetLoader|AssetCache|asset loading|texture loading|AssetLoader\.load|AssetCache\.get/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Asset loading/caching error',
        suggestion: 'Check AssetLoader and AssetCache initialization and loading logic'
    },
    
    // Phase E: UI component errors
    uiError: {
        pattern: /UIManager|BasePanel|UI component|menu system|UIManager\.show|UIManager\.hide|BasePanel\.render/,
        type: ERROR_TYPES.CRITICAL,
        description: 'UI component error',
        suggestion: 'Check UIManager and BasePanel initialization and rendering logic'
    },
    
    // Phase E: Settings persistence errors
    settingsError: {
        pattern: /SettingsManager|settings persistence|localStorage|SettingsManager\.get|SettingsManager\.set|SettingsManager\.save/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Settings persistence error',
        suggestion: 'Check SettingsManager initialization and localStorage access'
    },
    
    // Phase F: Analytics errors
    analyticsError: {
        pattern: /Analytics|PerformanceMonitor|ErrorReporter|Analytics\.track|PerformanceMonitor\.record|ErrorReporter\.report/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Analytics/telemetry error',
        suggestion: 'Check Analytics, PerformanceMonitor, and ErrorReporter initialization'
    },
    
    // Phase F: Plugin system errors
    pluginError: {
        pattern: /PluginManager|PluginAPI|plugin loading|PluginManager\.load|PluginManager\.unload|PluginAPI\.register/,
        type: ERROR_TYPES.CRITICAL,
        description: 'Plugin system error',
        suggestion: 'Check PluginManager initialization and plugin loading/unloading logic'
    }
};

/**
 * Classify an error based on its text/message
 * @param {Object} error - Error object with text or message property
 * @returns {Object} Classification result
 */
export function classifyError(error) {
    const errorText = error.text || error.message || error.stack || '';
    
    // Check each pattern
    for (const [key, config] of Object.entries(ERROR_PATTERNS)) {
        if (config.pattern.test(errorText)) {
            return {
                type: config.type,
                category: key,
                description: config.description,
                suggestion: config.suggestion,
                errorText: errorText.substring(0, 200) // Truncate for logging
            };
        }
    }
    
    // Unknown error
    return {
        type: ERROR_TYPES.UNKNOWN,
        category: 'unknown',
        description: 'Unknown error pattern',
        suggestion: 'Investigate error manually',
        errorText: errorText.substring(0, 200)
    };
}

/**
 * Classify multiple errors
 * @param {Array<Object>} errors - Array of error objects
 * @returns {Array<Object>} Array of classification results
 */
export function classifyErrors(errors) {
    return errors.map(error => ({
        ...classifyError(error),
        originalError: error
    }));
}

/**
 * Filter errors by type
 * @param {Array<Object>} classifiedErrors - Array of classified errors
 * @param {string} type - Error type to filter by
 * @returns {Array<Object>} Filtered errors
 */
export function filterErrorsByType(classifiedErrors, type) {
    return classifiedErrors.filter(err => err.type === type);
}

/**
 * Check if errors contain any critical errors
 * @param {Array<Object>} classifiedErrors - Array of classified errors
 * @returns {boolean} True if any critical errors found
 */
export function hasCriticalErrors(classifiedErrors) {
    return classifiedErrors.some(err => err.type === ERROR_TYPES.CRITICAL);
}

/**
 * Get error summary for logging
 * @param {Array<Object>} classifiedErrors - Array of classified errors
 * @returns {Object} Summary object
 */
export function getErrorSummary(classifiedErrors) {
    const summary = {
        total: classifiedErrors.length,
        critical: 0,
        expected: 0,
        knownBugs: 0,
        unknown: 0,
        errors: classifiedErrors
    };
    
    classifiedErrors.forEach(err => {
        switch (err.type) {
            case ERROR_TYPES.CRITICAL:
                summary.critical++;
                break;
            case ERROR_TYPES.EXPECTED:
                summary.expected++;
                break;
            case ERROR_TYPES.KNOWN_BUG:
                summary.knownBugs++;
                break;
            case ERROR_TYPES.UNKNOWN:
                summary.unknown++;
                break;
        }
    });
    
    return summary;
}

