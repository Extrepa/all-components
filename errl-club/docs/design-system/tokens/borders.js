/**
 * Border Tokens - Errl Club Design System
 * 
 * Border styles, widths, and radius values.
 */

export const borders = {
    // Border Widths
    width: {
        none: '0',
        thin: '1px',
        normal: '2px',
        thick: '3px',
    },
    
    // Border Styles
    style: {
        none: 'none',
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
    },
    
    // Border Radius (re-exported from spacing for convenience)
    radius: {
        none: '0',
        sm: '3px',
        md: '4px',
        lg: '5px',
        xl: '8px',
        full: '50%',      // Circular
        pill: '999px',    // Pill-shaped
    },
    
    // Common Border Combinations
    presets: {
        // Primary border (cyan)
        primary: {
            width: '2px',
            style: 'solid',
            color: '#00ffff',
            radius: '4px',
        },
        
        // Secondary border (magenta)
        secondary: {
            width: '2px',
            style: 'solid',
            color: '#ff00ff',
            radius: '4px',
        },
        
        // Hover border (green)
        hover: {
            width: '2px',
            style: 'solid',
            color: '#00ff00',
            radius: '4px',
        },
        
        // Disabled border
        disabled: {
            width: '2px',
            style: 'solid',
            color: '#666666',
            radius: '4px',
        },
        
        // Error border
        error: {
            width: '2px',
            style: 'solid',
            color: '#ff0000',
            radius: '4px',
        },
        
        // Subtle border (for progress bars, etc.)
        subtle: {
            width: '2px',
            style: 'solid',
            color: 'rgba(0, 255, 255, 0.7)',
            radius: '999px',
        },
        
        // Very subtle border
        verySubtle: {
            width: '1px',
            style: 'solid',
            color: 'rgba(0, 255, 255, 0.3)',
            radius: '3px',
        },
        
        // Circular border (for buttons, avatars)
        circular: {
            width: '2px',
            style: 'solid',
            color: '#00ffff',
            radius: '50%',
        },
    },
};

/**
 * Get border CSS string for a preset
 * @param {string} preset - Preset name (primary, secondary, hover, etc.)
 * @returns {string} Border CSS string
 */
export function getBorder(preset) {
    const border = borders.presets[preset];
    if (!border) {
        return borders.presets.primary;
    }
    
    return `${border.width} ${border.style} ${border.color}`;
}

/**
 * Get border radius for a preset
 * @param {string} preset - Preset name
 * @returns {string} Border radius value
 */
export function getBorderRadius(preset) {
    const border = borders.presets[preset];
    return border?.radius || borders.radius.md;
}

