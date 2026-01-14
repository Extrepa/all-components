/**
 * Help Content - Help system content definitions
 *
 * Extracted and organized from PLAYER_WORKFLOWS.md
 */

export const HELP_CONTENT = {
    // Categories
    categories: [
        { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
        { id: 'movement', name: 'Movement & Controls', icon: '🎮' },
        { id: 'exploration', name: 'Exploration', icon: '🔍' },
        { id: 'interactions', name: 'Interactions', icon: '✨' },
        { id: 'collectibles', name: 'Collectibles', icon: '💎' },
        { id: 'visual-effects', name: 'Visual Effects', icon: '🎨' },
        { id: 'audio', name: 'Audio & Events', icon: '🎵' },
        { id: 'camera', name: 'Camera Controls', icon: '📷' },
        { id: 'replay', name: 'Replay & Recording', icon: '🎬' },
        { id: 'settings', name: 'Settings', icon: '⚙️' },
    ],

    // Topics organized by category
    topics: {
        'getting-started': [
            {
                id: 'first-steps',
                title: 'First Steps',
                content: `
# First Steps

Welcome to Errl Club Simulator! Here's how to get started:

## Basic Movement
- **WASD** - Move your avatar
- **Mouse Drag** - Orbit camera around avatar
- **Scroll Wheel** - Zoom in/out
- **R** - Snap camera behind avatar

## First Actions
1. Move around the main club area
2. Press **Tab** to open the emote wheel
3. Press **E** near interactive objects
4. Explore the stage and DJ booth

## Tips
- Start with camera preset **1** (normal view)
- Take your time - there's no rush
- Try different camera angles to see the environment
                `,
                keywords: ['movement', 'controls', 'basics', 'first time'],
            },
            {
                id: 'controls-overview',
                title: 'Controls Overview',
                content: `
# Controls Overview

## Movement
- **W/A/S/D** - Move forward/left/backward/right
- **Space** - Jump/Hop
- **Shift** - Run
- **Ctrl** - Crouch

## Camera
- **Mouse Drag** - Orbit camera
- **Scroll Wheel** - Zoom
- **R** - Reset camera
- **1-9** - Camera presets

## Interactions
- **E** - Interact with objects
- **Tab** - Emote wheel
- **F** - Toggle flashlight

## UI
- **Esc** - Open menu
- **F1** - Help (this panel!)
- **C** - Camera settings
                `,
                keywords: ['controls', 'keybinds', 'keyboard', 'shortcuts'],
            },
        ],

        movement: [
            {
                id: 'basic-movement',
                title: 'Basic Movement',
                content: `
# Basic Movement

## Walking
- Use **WASD** to move in any direction
- Avatar moves smoothly in the direction you press
- Movement speed adapts to your input

## Running
- Hold **Shift** while moving to run
- Running increases movement speed
- Great for quick exploration

## Jumping
- Press **Space** to jump
- Can jump multiple times in sequence
- Useful for reaching higher areas

## Crouching
- Hold **Ctrl** to crouch
- Reduces avatar height
- Can be used for sneaking or style
                `,
                keywords: ['walk', 'run', 'jump', 'crouch', 'movement'],
            },
            {
                id: 'dance-moves',
                title: 'Dance Moves',
                content: `
# Dance Moves

## Dance States
Your avatar can enter different dance states:
- **Dance 1** - Basic dance animation
- **Dance 2** - Alternative dance style
- **Dance 3** - Advanced dance moves

## Activating Dance
- Move while in the club area
- Dance states activate automatically based on movement
- Higher vibe levels unlock more dance moves

## Tips
- Keep moving to maintain dance state
- Combine with camera movements for dynamic shots
- Try different movement patterns for variety
                `,
                keywords: ['dance', 'animation', 'moves', 'vibe'],
            },
        ],

        exploration: [
            {
                id: 'room-discovery',
                title: 'Room Discovery',
                content: `
# Room Discovery

## Main Areas
- **Main Club Floor** - Central dancing area
- **Stage** - DJ booth and performance area
- **Alcoves** - Hidden areas to explore
- **Hallways** - Connecting passages

## Finding Secrets
- Look for glowing objects (collectibles)
- Check corners and hidden areas
- Interactive objects glow when nearby
- Use camera to look around corners

## Navigation Tips
- Use teleporters for quick travel
- Follow the music to find the DJ booth
- Explore systematically to find everything
                `,
                keywords: ['explore', 'rooms', 'areas', 'navigation'],
            },
        ],

        interactions: [
            {
                id: 'interactive-objects',
                title: 'Interactive Objects',
                content: `
# Interactive Objects

## Types of Interactions
- **Teleporters** - Quick travel between areas
- **Doors** - Access new rooms
- **Ventilation Fans** - Environmental effects
- **Portal Rifts** - Special teleportation

## How to Interact
1. Approach an interactive object
2. Look for the interaction prompt (usually **E**)
3. Press the interaction key
4. Follow on-screen instructions

## Tips
- Interactive objects glow when you're nearby
- Some interactions have cooldowns
- Try different objects to see what they do
                `,
                keywords: ['interact', 'objects', 'teleporter', 'doors'],
            },
        ],

        collectibles: [
            {
                id: 'collecting-fragments',
                title: 'Collecting Fragments',
                content: `
# Collecting Fragments

## What are Fragments?
Fragments are collectible items scattered throughout the club. Collect them to:
- Track your progress
- Unlock achievements
- See collection statistics

## Finding Fragments
- Fragments glow and pulse
- They appear in various locations
- Some are hidden in corners
- Check all areas thoroughly

## Collection Progress
- View your collection in the progress UI
- Track how many you've found
- See which areas you've completed
- Monitor your collection percentage
                `,
                keywords: ['fragments', 'collectibles', 'collection', 'progress'],
            },
        ],

        'visual-effects': [
            {
                id: 'visual-effects',
                title: 'Visual Effects',
                content: `
# Visual Effects

## Visualizer Styles
Choose from different visualizer styles:
- **Default** - Standard effects
- **Neon** - High contrast, bright colors
- **Retro** - Warmer, vintage feel
- **Cyberpunk** - Cool colors, high saturation
- **Minimal** - Subtle effects
- **Intense** - Maximum intensity

## UV Mode
- Toggle UV/blacklight mode
- Changes material appearance
- Creates glowing effects
- Adjustable intensity

## Effect Intensity
- Control intensity of all visual effects
- Use presets or customize
- Real-time preview available
- Save your preferences
                `,
                keywords: ['visual', 'effects', 'style', 'uv mode', 'intensity'],
            },
        ],

        camera: [
            {
                id: 'camera-controls',
                title: 'Camera Controls',
                content: `
# Camera Controls

## Basic Camera
- **Mouse Drag** - Orbit around avatar
- **Scroll Wheel** - Zoom in/out
- **R** - Reset camera position

## Camera Presets
Press number keys for quick camera presets:
- **1** - Normal view
- **2** - Close-up
- **3** - Wide angle
- **4-9** - Custom presets

## Camera Settings
Press **C** to open camera settings:
- Adjust camera distance
- Change camera angle
- Modify camera intensity
- Save custom presets

## Tips
- Experiment with different angles
- Use camera presets for quick changes
- Adjust intensity for smooth or dynamic movement
                `,
                keywords: ['camera', 'view', 'presets', 'settings'],
            },
        ],

        replay: [
            {
                id: 'replay-system',
                title: 'Replay System',
                content: `
# Replay System

## Recording Replays
- Start recording your movement
- Record up to 30 seconds
- Create ghost avatars of your movements
- Review your dance moves

## Visual Recording
- Record visual effects and events
- Capture frames for analysis
- Log visual events
- Export recordings

## Tips
- Use replays to improve your moves
- Record interesting moments
- Share your best replays
                `,
                keywords: ['replay', 'recording', 'ghost', 'visual'],
            },
        ],

        settings: [
            {
                id: 'settings-overview',
                title: 'Settings Overview',
                content: `
# Settings Overview

## Accessing Settings
- Press **Esc** to open main menu
- Navigate to Settings section
- Adjust various options

## Settings Categories
- **Graphics** - Visual quality and effects
- **Audio** - Sound settings and volume
- **Controls** - Keybinds and input
- **Camera** - Camera behavior
- **Visual Effects** - Effect intensity and styles

## Saving Settings
- Settings are saved automatically
- Persist between sessions
- Can be reset to defaults
                `,
                keywords: ['settings', 'options', 'preferences', 'config'],
            },
        ],
    },
};

/**
 * Search help content
 * @param {string} query - Search query
 * @returns {Array} Matching topics
 */
export function searchHelpContent(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [categoryId, topics] of Object.entries(HELP_CONTENT.topics)) {
        for (const topic of topics) {
            // Search in title, content, and keywords
            const searchText =
                `${topic.title} ${topic.content} ${topic.keywords.join(' ')}`.toLowerCase();
            if (searchText.includes(lowerQuery)) {
                results.push({
                    ...topic,
                    categoryId,
                    categoryName:
                        HELP_CONTENT.categories.find((c) => c.id === categoryId)?.name ||
                        categoryId,
                });
            }
        }
    }

    return results;
}

/**
 * Get topic by ID
 * @param {string} topicId - Topic ID
 * @returns {Object|null} Topic object or null
 */
export function getTopic(topicId) {
    for (const topics of Object.values(HELP_CONTENT.topics)) {
        const topic = topics.find((t) => t.id === topicId);
        if (topic) {
            return topic;
        }
    }
    return null;
}

/**
 * Get topics by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Topics in category
 */
export function getTopicsByCategory(categoryId) {
    return HELP_CONTENT.topics[categoryId] || [];
}
