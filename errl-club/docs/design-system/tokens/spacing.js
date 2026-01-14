/**
 * Spacing Tokens - Errl Club Design System
 * 
 * Consistent spacing scale for padding, margins, gaps, and layout.
 */

export const spacing = {
    // Padding Scale
    padding: {
        xs: '5px',
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
    },
    
    // Margin Scale
    margin: {
        xs: '8px',
        sm: '12px',
        md: '15px',
        lg: '20px',
        xl: '40px',
    },
    
    // Gap Scale (for flexbox/grid)
    gap: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '20px',
    },
    
    // Border Radius
    borderRadius: {
        none: '0',
        sm: '3px',
        md: '4px',
        lg: '5px',
        xl: '8px',
        full: '50%',      // Circular
        pill: '999px',    // Pill-shaped (for progress bars)
    },
    
    // Component-Specific Spacing
    component: {
        button: {
            padding: '10px 20px',
            gap: '8px',
        },
        input: {
            padding: '8px 12px',
            gap: '8px',
        },
        modal: {
            padding: '16px',
            headerPadding: '16px',
            contentPadding: '16px',
        },
        panel: {
            padding: '16px',
            titleMargin: '12px',
        },
        slider: {
            gap: '8px',
            margin: '8px 0',
        },
    },
    
    // Layout Spacing
    layout: {
        container: {
            padding: '20px',
        },
        section: {
            margin: '20px 0',
        },
        item: {
            margin: '8px 0',
        },
    },
};

/**
 * Get spacing value by key
 * @param {string} category - Category (padding, margin, gap, borderRadius)
 * @param {string} size - Size key (xs, sm, md, lg, xl, etc.)
 * @returns {string} Spacing value
 */
export function getSpacing(category, size) {
    return spacing[category]?.[size] || '0';
}

