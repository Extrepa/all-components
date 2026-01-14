/**
 * AvatarColorVariants - Configuration for all 25 Errl avatar color variants
 * Based on the SVG color collection at src/assets/avatars/colors/
 */

/**
 * Convert hex color to Three.js hex format
 * @param {string} hex - Hex color string (e.g., "#3d2b56" or "3d2b56")
 * @returns {number} Three.js hex color integer
 */
function hexToThreeHex(hex) {
    const cleaned = hex.replace('#', '');
    return parseInt(cleaned, 16);
}

/**
 * All 25 color variants for Errl avatar
 * Each variant includes:
 * - color: Main body color (Three.js hex)
 * - glow: Emissive intensity (0.0 - 1.0)
 * - name: Human-readable name
 * - category: Color category for grouping
 * - hex: Original hex string for reference
 */
export const AVATAR_COLOR_VARIANTS = {
    // 🟣 Purple & Violet Tones
    classic_purple: {
        color: hexToThreeHex('#3d2b56'),
        glow: 0.3,
        name: 'Classic Purple',
        category: 'purple',
        hex: '#3d2b56',
    },
    royal_violet: {
        color: hexToThreeHex('#4a148c'),
        glow: 0.35,
        name: 'Royal Violet',
        category: 'purple',
        hex: '#4a148c',
    },
    midnight_purple: {
        color: hexToThreeHex('#2d1b3d'),
        glow: 0.25,
        name: 'Midnight Purple',
        category: 'purple',
        hex: '#2d1b3d',
    },
    lavender_dream: {
        color: hexToThreeHex('#7e57c2'),
        glow: 0.4,
        name: 'Lavender Dream',
        category: 'purple',
        hex: '#7e57c2',
    },
    deep_plum: {
        color: hexToThreeHex('#6a1b9a'),
        glow: 0.35,
        name: 'Deep Plum',
        category: 'purple',
        hex: '#6a1b9a',
    },

    // 🟢 Green Tones
    forest_green: {
        color: hexToThreeHex('#1b5e20'),
        glow: 0.3,
        name: 'Forest Green',
        category: 'green',
        hex: '#1b5e20',
    },
    emerald_teal: {
        color: hexToThreeHex('#004d40'),
        glow: 0.35,
        name: 'Emerald Teal',
        category: 'green',
        hex: '#004d40',
    },
    lime_green: {
        color: hexToThreeHex('#7cb342'),
        glow: 0.45,
        name: 'Lime Green',
        category: 'green',
        hex: '#7cb342',
    },
    mint_fresh: {
        color: hexToThreeHex('#00796b'),
        glow: 0.4,
        name: 'Mint Fresh',
        category: 'green',
        hex: '#00796b',
    },
    jade_green: {
        color: hexToThreeHex('#2e7d32'),
        glow: 0.35,
        name: 'Jade Green',
        category: 'green',
        hex: '#2e7d32',
    },

    // 🔴 Red & Pink Tones
    cherry_red: {
        color: hexToThreeHex('#c62828'),
        glow: 0.4,
        name: 'Cherry Red',
        category: 'red',
        hex: '#c62828',
    },
    ruby_red: {
        color: hexToThreeHex('#d32f2f'),
        glow: 0.45,
        name: 'Ruby Red',
        category: 'red',
        hex: '#d32f2f',
    },
    crimson_fire: {
        color: hexToThreeHex('#b71c1c'),
        glow: 0.5,
        name: 'Crimson Fire',
        category: 'red',
        hex: '#b71c1c',
    },
    scarlet_red: {
        color: hexToThreeHex('#e53935'),
        glow: 0.45,
        name: 'Scarlet Red',
        category: 'red',
        hex: '#e53935',
    },
    rose_pink: {
        color: hexToThreeHex('#c2185b'),
        glow: 0.4,
        name: 'Rose Pink',
        category: 'red',
        hex: '#c2185b',
    },

    // 🟠 Orange Tones
    sunset_orange: {
        color: hexToThreeHex('#ef6c00'),
        glow: 0.45,
        name: 'Sunset Orange',
        category: 'orange',
        hex: '#ef6c00',
    },
    coral_orange: {
        color: hexToThreeHex('#f4511e'),
        glow: 0.45,
        name: 'Coral Orange',
        category: 'orange',
        hex: '#f4511e',
    },
    amber_orange: {
        color: hexToThreeHex('#ff8f00'),
        glow: 0.5,
        name: 'Amber Orange',
        category: 'orange',
        hex: '#ff8f00',
    },
    tangerine_burst: {
        color: hexToThreeHex('#ff6f00'),
        glow: 0.5,
        name: 'Tangerine Burst',
        category: 'orange',
        hex: '#ff6f00',
    },
    golden_orange: {
        color: hexToThreeHex('#f57c00'),
        glow: 0.45,
        name: 'Golden Orange',
        category: 'orange',
        hex: '#f57c00',
    },

    // 🔵 Blue Tones
    ocean_blue: {
        color: hexToThreeHex('#01579b'),
        glow: 0.35,
        name: 'Ocean Blue',
        category: 'blue',
        hex: '#01579b',
    },
    sky_blue: {
        color: hexToThreeHex('#0277bd'),
        glow: 0.4,
        name: 'Sky Blue',
        category: 'blue',
        hex: '#0277bd',
    },
    sapphire_blue: {
        color: hexToThreeHex('#1565c0'),
        glow: 0.4,
        name: 'Sapphire Blue',
        category: 'blue',
        hex: '#1565c0',
    },
    azure_sky: {
        color: hexToThreeHex('#039be5'),
        glow: 0.45,
        name: 'Azure Sky',
        category: 'blue',
        hex: '#039be5',
    },
    cobalt_blue: {
        color: hexToThreeHex('#1976d2'),
        glow: 0.4,
        name: 'Cobalt Blue',
        category: 'blue',
        hex: '#1976d2',
    },
};

/**
 * Get all variant keys
 * @returns {string[]} Array of variant keys
 */
export function getAllVariantKeys() {
    return Object.keys(AVATAR_COLOR_VARIANTS);
}

/**
 * Get variants by category
 * @param {string} category - Category name (purple, green, red, orange, blue)
 * @returns {Object} Object with variant keys and data
 */
export function getVariantsByCategory(category) {
    const result = {};
    for (const [key, variant] of Object.entries(AVATAR_COLOR_VARIANTS)) {
        if (variant.category === category) {
            result[key] = variant;
        }
    }
    return result;
}

/**
 * Get random variant key
 * @param {string|null} category - Optional category filter
 * @returns {string} Random variant key
 */
export function getRandomVariantKey(category = null) {
    let variants = getAllVariantKeys();
    if (category) {
        variants = Object.keys(getVariantsByCategory(category));
    }
    return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Get variant data by key
 * @param {string} key - Variant key
 * @returns {Object|null} Variant data or null if not found
 */
export function getVariant(key) {
    return AVATAR_COLOR_VARIANTS[key] || null;
}
