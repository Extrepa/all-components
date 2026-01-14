/**
 * Color Tokens - Errl Club Design System
 * 
 * All color values used throughout the application.
 * Organized by category for easy reference and maintenance.
 */

export const colors = {
    // Primary Brand Colors
    primary: {
        cyan: '#00ffff',
        magenta: '#ff00ff',
        green: '#00ff00',
    },
    
    // Background Colors
    background: {
        dark: 'rgba(20, 20, 20, 0.9)',
        darker: 'rgba(10, 10, 10, 0.95)',
        darkest: '#000000',
        panel: 'rgba(20, 20, 20, 0.9)',
        modal: 'rgba(20, 20, 20, 0.95)',
        overlay: 'rgba(0, 0, 0, 0.8)',
        loading: 'radial-gradient(ellipse at center, #1a0a1a 0%, #0a0a0a 50%, #000000 100%)',
        progress: 'rgba(0, 0, 0, 0.35)',
        progressDark: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Text Colors
    text: {
        primary: '#ffffff',
        secondary: '#ffffff',
        accent: '#00ffff',
        label: '#ffffff',
        error: '#ff0000',
        disabled: '#666666',
    },
    
    // Border Colors
    border: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        hover: '#00ff00',
        disabled: '#666666',
        error: '#ff0000',
        subtle: 'rgba(0, 255, 255, 0.7)',
        verySubtle: 'rgba(0, 255, 255, 0.3)',
    },
    
    // Button States
    button: {
        normal: {
            background: '#333333',
            border: '#00ffff',
            text: '#ffffff',
        },
        hover: {
            background: '#444444',
            border: '#00ff00',
            text: '#ffffff',
        },
        pressed: {
            background: '#222222',
            border: '#00ffff',
            text: '#ffffff',
        },
        disabled: {
            background: '#1a1a1a',
            border: '#666666',
            text: '#666666',
        },
    },
    
    // Input States
    input: {
        normal: {
            background: '#333333',
            border: '#00ffff',
            text: '#ffffff',
        },
        focus: {
            background: '#333333',
            border: '#00ffff',
            text: '#ffffff',
        },
        error: {
            background: '#333333',
            border: '#ff0000',
            text: '#ffffff',
        },
        disabled: {
            background: '#1a1a1a',
            border: '#666666',
            text: '#666666',
        },
    },
    
    // Gradient Backgrounds
    gradients: {
        body: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        progress: 'linear-gradient(90deg, #00ffff, #0099ff, #00ffff)',
        progressLoading: 'linear-gradient(90deg, rgba(0, 255, 255, 0.8) 0%, rgba(255, 0, 255, 1.0) 50%, rgba(0, 255, 255, 0.8) 100%)',
        buttonReady: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
    },
    
    // Avatar Color Variants (25 total, organized by category)
    avatar: {
        purple: {
            classic_purple: '#3d2b56',
            royal_violet: '#4a148c',
            midnight_purple: '#2d1b3d',
            lavender_dream: '#7e57c2',
            deep_plum: '#6a1b9a',
        },
        green: {
            forest_green: '#1b5e20',
            emerald_teal: '#004d40',
            lime_green: '#7cb342',
            mint_fresh: '#00796b',
            jade_green: '#2e7d32',
        },
        red: {
            cherry_red: '#c62828',
            ruby_red: '#d32f2f',
            crimson_fire: '#b71c1c',
            scarlet_red: '#e53935',
            rose_pink: '#c2185b',
        },
        orange: {
            sunset_orange: '#ef6c00',
            coral_orange: '#f4511e',
            amber_orange: '#ff8f00',
            tangerine_burst: '#ff6f00',
            golden_orange: '#f57c00',
        },
        blue: {
            ocean_blue: '#01579b',
            sky_blue: '#0277bd',
            sapphire_blue: '#1565c0',
            azure_sky: '#039be5',
            cobalt_blue: '#1976d2',
        },
    },
    
    // Glow Effects (RGBA values for shadows and glows)
    glow: {
        cyan: {
            subtle: 'rgba(0, 255, 255, 0.3)',
            normal: 'rgba(0, 255, 255, 0.5)',
            strong: 'rgba(0, 255, 255, 0.8)',
            intense: 'rgba(0, 255, 255, 1.0)',
        },
        magenta: {
            subtle: 'rgba(255, 0, 255, 0.3)',
            normal: 'rgba(255, 0, 255, 0.5)',
            strong: 'rgba(255, 0, 255, 0.8)',
            intense: 'rgba(255, 0, 255, 1.0)',
        },
        green: {
            subtle: 'rgba(0, 255, 0, 0.3)',
            normal: 'rgba(0, 255, 0, 0.5)',
            strong: 'rgba(0, 255, 0, 0.8)',
            intense: 'rgba(0, 255, 0, 1.0)',
        },
        white: {
            subtle: 'rgba(255, 255, 255, 0.2)',
            normal: 'rgba(255, 255, 255, 0.5)',
            strong: 'rgba(255, 255, 255, 0.8)',
        },
    },
};

/**
 * Get all avatar colors as a flat array
 * @returns {Array} Array of {name, hex, category} objects
 */
export function getAllAvatarColors() {
    const result = [];
    for (const [category, variants] of Object.entries(colors.avatar)) {
        for (const [name, hex] of Object.entries(variants)) {
            result.push({ name, hex, category });
        }
    }
    return result;
}

/**
 * Get avatar colors by category
 * @param {string} category - Category name (purple, green, red, orange, blue)
 * @returns {Object} Object with color name keys and hex values
 */
export function getAvatarColorsByCategory(category) {
    return colors.avatar[category] || {};
}

