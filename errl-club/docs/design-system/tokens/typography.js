/**
 * Typography Tokens - Errl Club Design System
 * 
 * Font families, sizes, weights, spacing, and text effects.
 */

export const typography = {
    // Font Families
    fontFamily: {
        primary: "'Arial', sans-serif",
        bold: "'Arial Black', 'Arial Bold', sans-serif",
    },
    
    // Font Sizes
    fontSize: {
        xs: '0.7rem',      // 11.2px
        sm: '0.75rem',     // 12px
        base: '0.9rem',    // 14.4px
        md: '14px',        // 14px
        lg: '18px',        // 18px
        xl: '20px',        // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '3rem',     // 48px
        hero: 'clamp(3rem, 8vw, 5rem)', // Responsive hero text
    },
    
    // Font Weights
    fontWeight: {
        normal: 'normal',
        medium: '500',
        bold: 'bold',
        black: '900',
    },
    
    // Letter Spacing
    letterSpacing: {
        tight: '0.05em',
        normal: '0.2em',
        wide: '0.3em',
        wider: '0.4em',
    },
    
    // Line Heights
    lineHeight: {
        tight: '1',
        normal: '1.2',
        relaxed: '1.5',
    },
    
    // Text Transforms
    textTransform: {
        none: 'none',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
    },
    
    // Text Shadows (Neon Glow Effects)
    textShadow: {
        // Subtle glow
        subtle: `
            0 0 10px rgba(255, 255, 255, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3),
            0 0 30px rgba(255, 255, 255, 0.2)
        `,
        
        // Normal glow
        normal: `
            0 0 10px rgba(0, 255, 255, 0.8),
            0 0 20px rgba(0, 255, 255, 0.5),
            0 0 30px rgba(255, 0, 255, 0.3)
        `,
        
        // Strong glow
        strong: `
            0 0 20px rgba(0, 255, 255, 0.8),
            0 0 40px rgba(0, 255, 255, 0.6),
            0 0 60px rgba(255, 0, 255, 0.4),
            0 0 80px rgba(0, 255, 255, 0.2)
        `,
        
        // Cyan glow
        cyan: `
            0 0 10px rgba(0, 255, 255, 0.8),
            0 0 20px rgba(0, 255, 255, 0.5)
        `,
        
        // Green glow (for reticle)
        green: `
            0 0 10px rgba(0, 255, 0, 0.8)
        `,
        
        // White glow
        white: `
            0 0 10px rgba(255, 255, 255, 0.5),
            0 0 20px rgba(0, 255, 255, 0.3)
        `,
    },
};

/**
 * Get typography style object for a specific variant
 * @param {string} variant - Variant name (e.g., 'heading', 'body', 'label')
 * @returns {Object} Typography style object
 */
export function getTypographyVariant(variant) {
    const variants = {
        heading: {
            fontFamily: typography.fontFamily.bold,
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            letterSpacing: typography.letterSpacing.normal,
            textTransform: typography.textTransform.uppercase,
            textShadow: typography.textShadow.strong,
        },
        body: {
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.normal,
            letterSpacing: 'normal',
            textTransform: typography.textTransform.none,
        },
        label: {
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.normal,
            letterSpacing: typography.letterSpacing.normal,
            textTransform: typography.textTransform.none,
        },
        button: {
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: typography.letterSpacing.tight,
            textTransform: typography.textTransform.uppercase,
        },
    };
    
    return variants[variant] || variants.body;
}

