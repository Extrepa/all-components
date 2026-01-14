/**
 * Tutorial Definitions
 *
 * Defines all available tutorials with their steps
 */

export const TUTORIALS = {
    firstTime: {
        id: 'firstTime',
        title: 'Welcome to Errl Club!',
        description: 'Learn the basics of movement, camera, and interaction',
        allowSkip: true,
        allowReplay: false,
        steps: [
            {
                title: 'Welcome!',
                description: 'Welcome to Errl Club Simulator',
                instructions:
                    'This tutorial will teach you the basics. Use the buttons below to navigate.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Movement',
                description: 'Move your avatar around',
                instructions: 'Use WASD keys to move. Hold Shift to run. Press Space to hop/jump.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Camera Controls',
                description: 'Control your view',
                instructions:
                    'Drag with mouse to orbit camera. Scroll wheel to zoom. Press R to snap camera behind avatar.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Interactions',
                description: 'Interact with objects',
                instructions: 'Press E when near an interactive object to interact with it.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Collectibles',
                description: 'Collect items around the club',
                instructions:
                    'Walk into drips, bubbles, fragments, and glow balls to collect them. Check your progress with F3.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Visual Effects',
                description: 'Customize your experience',
                instructions:
                    'Press U for UV mode, V for visualizer styles, Shift+G for glitch mode. Press F4 for quick settings.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: "You're Ready!",
                description: 'Have fun exploring!',
                instructions:
                    'Press Shift+C for camera settings, F3 for collection progress, F4 for quick settings. Enjoy!',
                position: { x: '50%', y: '50%' },
            },
        ],
    },
    camera: {
        id: 'camera',
        title: 'Camera Controls Tutorial',
        description: 'Learn advanced camera controls',
        allowSkip: true,
        allowReplay: true,
        steps: [
            {
                title: 'Camera Presets',
                description: 'Switch between camera presets',
                instructions:
                    'Press 1, 2, or 3 to switch between Normal, Intimate, and Wide camera presets.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Camera Modes',
                description: 'Try different camera modes',
                instructions: 'Press C for cinematic mode, F for freecam, L for lock-on mode.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Camera Intensity',
                description: 'Adjust camera intensity',
                instructions:
                    'Press Ctrl+I to cycle camera intensity (Low→Medium→High). Press Shift+C for detailed settings.',
                position: { x: '50%', y: '50%' },
            },
        ],
    },
    collection: {
        id: 'collection',
        title: 'Collection Tutorial',
        description: 'Learn about collectibles',
        allowSkip: true,
        allowReplay: true,
        steps: [
            {
                title: 'Collectibles',
                description: 'Four types of collectibles',
                instructions:
                    'Drips (common), Bubbles (pop them), Fragments (rare), and Glow Balls (very rare).',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Collection Progress',
                description: 'Track your progress',
                instructions:
                    'Press F3 to open collection progress UI. See your session and lifetime statistics.',
                position: { x: '50%', y: '50%' },
            },
            {
                title: 'Collection Effects',
                description: 'Collections affect your vibe',
                instructions:
                    'Collecting items increases your vibe meter. Higher vibe = more visual effects!',
                position: { x: '50%', y: '50%' },
            },
        ],
    },
};
