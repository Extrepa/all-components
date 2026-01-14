/**
 * HelpSystem - Comprehensive in-game help system manager
 *
 * Provides:
 * - Context-sensitive help
 * - Help search functionality
 * - Help categories
 * - Keyboard navigation
 * - Integration with workflows documentation
 */

export class HelpSystem {
    constructor() {
        this.enabled = false;
        this.currentCategory = null;
        this.searchQuery = '';
        this.helpContent = this.initializeHelpContent();
    }

    /**
     * Initialize help content from workflows and features
     */
    initializeHelpContent() {
        return {
            movement: {
                title: 'Movement',
                icon: '🏃',
                content: [
                    {
                        title: 'Basic Movement',
                        description: 'Use WASD keys to move your avatar',
                        details: 'W = Forward, S = Backward, A = Rotate Left, D = Rotate Right',
                    },
                    {
                        title: 'Running',
                        description: 'Hold Shift while moving to run faster',
                        details: 'Running increases movement speed significantly',
                    },
                    {
                        title: 'Jumping',
                        description: 'Press Space to jump or hop',
                        details: 'Use jumping to reach higher areas or avoid obstacles',
                    },
                    {
                        title: 'Dashing',
                        description: 'Press Shift+Space to dash',
                        details: 'Dashing provides a quick burst of movement',
                    },
                    {
                        title: 'Crouching',
                        description: 'Hold Ctrl to crouch',
                        details:
                            'Crouching makes your avatar smaller and can help navigate tight spaces',
                    },
                    {
                        title: 'Dancing',
                        description: 'Press Shift+D to dance',
                        details: 'Dancing triggers special animations and effects',
                    },
                ],
            },
            camera: {
                title: 'Camera Controls',
                icon: '📷',
                content: [
                    {
                        title: 'Orbit Camera',
                        description: 'Drag with mouse to orbit around avatar',
                        details: 'Left-click and drag to rotate the camera view',
                    },
                    {
                        title: 'Zoom',
                        description: 'Scroll wheel to zoom in/out',
                        details: 'Scroll up to zoom in, scroll down to zoom out',
                    },
                    {
                        title: 'Camera Presets',
                        description: 'Press 1, 2, or 3 to switch camera presets',
                        details: '1 = Normal, 2 = Intimate, 3 = Wide',
                    },
                    {
                        title: 'Snap Camera',
                        description: 'Press R to snap camera behind avatar',
                        details: 'Quickly resets camera position',
                    },
                    {
                        title: 'Camera Intensity',
                        description: 'Press Ctrl+I to cycle camera intensity',
                        details: 'Cycles through Low, Medium, and High intensity levels',
                    },
                    {
                        title: 'Camera Settings',
                        description: 'Press Shift+C to open camera settings',
                        details: 'Access detailed camera configuration options',
                    },
                ],
            },
            interactions: {
                title: 'Interactions',
                icon: '👆',
                content: [
                    {
                        title: 'Interact with Objects',
                        description: 'Press E when near interactive objects',
                        details: "Look for interaction prompts that appear when you're close",
                    },
                    {
                        title: 'Portals',
                        description: 'Interact with portal rifts to teleport',
                        details: 'Portals glow and pulse - approach and press E to activate',
                    },
                    {
                        title: 'Doors',
                        description: 'Interact with doors to enter/exit areas',
                        details: 'Some doors may require specific conditions to open',
                    },
                    {
                        title: 'Interactive Screens',
                        description: 'Interact with screens for visual effects',
                        details: 'Screens can display visualizers and respond to audio',
                    },
                ],
            },
            collection: {
                title: 'Collection',
                icon: '💎',
                content: [
                    {
                        title: 'Collectibles',
                        description: 'Collect drips, bubbles, fragments, and glow balls',
                        details: 'Walk near collectibles to automatically collect them',
                    },
                    {
                        title: 'Errl Fragments',
                        description: 'Collect fragments to unlock new features',
                        details: 'Fragments unlock avatar colors, effects, and areas',
                    },
                    {
                        title: 'Collection Progress',
                        description: 'Press F3 to view collection progress',
                        details: 'Track your collection statistics and achievements',
                    },
                    {
                        title: 'Collection Goals',
                        description: 'Set and track collection goals',
                        details: 'Complete goals to earn rewards and achievements',
                    },
                ],
            },
            audio: {
                title: 'Audio & Music',
                icon: '🎵',
                content: [
                    {
                        title: 'Music Player',
                        description: 'Open ErrlPhone and go to Music tab',
                        details: 'Load audio files or stream from URL',
                    },
                    {
                        title: 'Audio-Reactive Effects',
                        description: 'Visual effects respond to music',
                        details: 'Portal rifts, fog, and assets pulse with the beat',
                    },
                    {
                        title: 'Frequency Bands',
                        description: 'Different frequency bands affect different effects',
                        details:
                            'Bass affects speakers, mid affects structures, treble affects sparkles',
                    },
                    {
                        title: 'Beat Detection',
                        description: 'Beats trigger special visual effects',
                        details: 'Watch for strobe flashes and particle bursts on beats',
                    },
                ],
            },
            visualEffects: {
                title: 'Visual Effects',
                icon: '✨',
                content: [
                    {
                        title: 'UV Mode',
                        description: 'Toggle UV/blacklight mode',
                        details: 'Creates a purple/blue glow effect on materials',
                    },
                    {
                        title: 'Glitch Effects',
                        description: 'Enable glitch effects for screen distortion',
                        details: 'Adds digital glitch artifacts to the scene',
                    },
                    {
                        title: 'Chromatic Aberration',
                        description: 'Add color separation effects',
                        details: 'Creates a trippy color separation effect',
                    },
                    {
                        title: 'Visual Effect Intensity',
                        description: 'Adjust intensity of all visual effects',
                        details: 'Use Quick Settings (F4) or ErrlPhone to adjust',
                    },
                ],
            },
            codex: {
                title: 'Codex Features',
                icon: '🎨',
                content: [
                    {
                        title: 'Codex Assets',
                        description: 'Special assets that respond to audio',
                        details: 'BoomBox, Geodesic Station, and DamagedHelmet react to music',
                    },
                    {
                        title: 'Rest Mode',
                        description: 'Press Ctrl+R to toggle rest mode',
                        details: 'Fades colors to mellow and reduces particle emissions',
                    },
                    {
                        title: 'Holographic Rings',
                        description: 'Rings orbit around DJ booth',
                        details: 'Rings respond to mid frequencies and slow in rest mode',
                    },
                    {
                        title: 'Interactive Floor Panels',
                        description: 'Stage floor spawns sparkles when you walk',
                        details: 'Move on the stage to see sparkle particles',
                    },
                    {
                        title: 'Camera Vignettes',
                        description: 'Bloom increases when near Codex assets',
                        details: 'Approach assets to see enhanced bloom effects',
                    },
                ],
            },
            ui: {
                title: 'UI & Settings',
                icon: '⚙️',
                content: [
                    {
                        title: 'ErrlPhone',
                        description: 'Bottom-right corner phone UI',
                        details: 'Access settings, map, avatar, inventory, and music',
                    },
                    {
                        title: 'Quick Settings',
                        description: 'Press F4 to open quick settings',
                        details: 'Quick access to common settings and toggles',
                    },
                    {
                        title: 'DevTools',
                        description: 'Press F1 to toggle debug overlay',
                        details: 'View FPS, memory, and performance stats',
                    },
                    {
                        title: 'DevMenu',
                        description: 'Press Ctrl+D to toggle dev menu',
                        details: 'Advanced parameter tuning and debugging',
                    },
                    {
                        title: 'Settings Persistence',
                        description: 'All settings are saved automatically',
                        details: 'Your preferences persist between sessions',
                    },
                ],
            },
            achievements: {
                title: 'Achievements',
                icon: '🏆',
                content: [
                    {
                        title: 'Achievement System',
                        description: 'Earn achievements for various activities',
                        details: 'Collect items, explore, interact, and more',
                    },
                    {
                        title: 'Achievement Notifications',
                        description: 'Get notified when you earn achievements',
                        details: 'Notifications appear in the top-right corner',
                    },
                    {
                        title: 'Achievement Progress',
                        description: 'Track progress toward achievements',
                        details: 'View progress in the achievement UI',
                    },
                ],
            },
        };
    }

    /**
     * Enable help system
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable help system
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Get help content for a category
     * @param {string} category - Category name
     * @returns {Object|null} Category content or null
     */
    getCategory(category) {
        return this.helpContent[category] || null;
    }

    /**
     * Get all categories
     * @returns {Object} All categories
     */
    getAllCategories() {
        return this.helpContent;
    }

    /**
     * Search help content
     * @param {string} query - Search query
     * @returns {Array} Array of matching help items
     */
    search(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const results = [];
        const lowerQuery = query.toLowerCase();

        Object.values(this.helpContent).forEach((category) => {
            category.content.forEach((item) => {
                const titleMatch = item.title.toLowerCase().includes(lowerQuery);
                const descMatch = item.description.toLowerCase().includes(lowerQuery);
                const detailsMatch = item.details.toLowerCase().includes(lowerQuery);

                if (titleMatch || descMatch || detailsMatch) {
                    results.push({
                        category: category.title,
                        categoryIcon: category.icon,
                        ...item,
                    });
                }
            });
        });

        return results;
    }

    /**
     * Get context-sensitive help based on current game state
     * @param {Object} context - Game context (position, nearby objects, etc.)
     * @returns {Array} Relevant help items
     */
    getContextualHelp(context = {}) {
        const help = [];

        // Add help based on context
        if (context.nearInteractive) {
            help.push({
                category: 'Interactions',
                title: 'Interact with Objects',
                description: 'Press E to interact',
                details: "You're near an interactive object",
            });
        }

        if (context.onStage) {
            help.push({
                category: 'Codex',
                title: 'Interactive Floor Panels',
                description: 'Walk on stage to see sparkles',
                details: 'The stage floor spawns particles as you move',
            });
        }

        if (context.nearCodexAsset) {
            help.push({
                category: 'Codex',
                title: 'Codex Assets',
                description: 'Assets respond to audio',
                details: 'These assets pulse and glow with music',
            });
        }

        return help;
    }
}
