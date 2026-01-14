/**
 * Test setup helper - Suppresses excessive console logging during tests
 */

// Suppress console logs during Playwright tests
if (typeof window !== 'undefined') {
    // Mark as test mode
    window.__PLAYWRIGHT_TEST__ = true;
    window.DEBUG_GAMELOOP = false;
    window.DEBUG_MOVEMENT = false;
    
    // Override console methods to filter out excessive logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
        // Only log if it's an error or important message
        const message = args.join(' ');
        if (message.includes('Error') || message.includes('WARNING') || message.includes('Failed')) {
            originalLog.apply(console, args);
        }
        // Suppress GameLoop and UpdateManager debug logs
        if (!message.includes('GameLoop:') && !message.includes('Position updated:')) {
            // Allow other important logs through
            if (message.includes('initialized') || message.includes('ready') || message.includes('complete')) {
                originalLog.apply(console, args);
            }
        }
    };
    
    console.warn = (...args) => {
        // Only show warnings for errors, not debug info
        const message = args.join(' ');
        if (!message.includes('GameLoop: Scene has very few children')) {
            originalWarn.apply(console, args);
        }
    };
}

