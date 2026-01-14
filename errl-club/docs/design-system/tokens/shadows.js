/**
 * Shadow Tokens - Errl Club Design System
 * 
 * Box shadows and text shadows for depth, glow effects, and neon aesthetics.
 */

export const shadows = {
    // Box Shadows - Cyan Glow
    boxShadow: {
        cyan: {
            subtle: '0 0 10px rgba(0, 255, 255, 0.6)',
            normal: '0 0 20px rgba(0, 255, 255, 0.6)',
            strong: '0 0 30px rgba(0, 255, 255, 0.8)',
            intense: '0 0 40px rgba(0, 255, 255, 1.0)',
        },
        
        // Magenta Glow
        magenta: {
            subtle: '0 0 10px rgba(255, 0, 255, 0.4)',
            normal: '0 0 20px rgba(255, 0, 255, 0.4)',
            strong: '0 0 40px rgba(255, 0, 255, 0.7)',
            intense: '0 0 60px rgba(255, 0, 255, 0.8)',
        },
        
        // Combined Cyan + Magenta
        neon: {
            subtle: `
                0 0 10px rgba(0, 255, 255, 0.6),
                0 0 20px rgba(255, 0, 255, 0.4)
            `,
            normal: `
                0 0 20px rgba(0, 255, 255, 0.6),
                0 0 40px rgba(255, 0, 255, 0.4)
            `,
            strong: `
                0 0 30px rgba(0, 255, 255, 0.9),
                0 0 60px rgba(255, 0, 255, 0.7),
                inset 0 0 30px rgba(255, 255, 255, 0.3)
            `,
            intense: `
                0 0 20px rgba(0, 255, 255, 1.0),
                0 0 40px rgba(255, 0, 255, 0.8),
                0 0 60px rgba(0, 255, 255, 0.4)
            `,
        },
        
        // Green Glow (for reticle/interactive elements)
        green: {
            normal: '0 0 10px rgba(0, 255, 0, 0.8)',
            strong: '0 0 20px rgba(0, 255, 0, 0.8)',
        },
        
        // Panel/Modal Shadows
        panel: '0 4px 20px rgba(0, 255, 255, 0.3)',
        panelFocus: '0 4px 20px rgba(0, 255, 0, 0.5)',
        modal: '0 8px 32px rgba(0, 255, 255, 0.5)',
        
        // Inset Shadows (for depth)
        inset: {
            subtle: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
            normal: 'inset 0 0 12px rgba(0, 255, 255, 0.3)',
            strong: 'inset 0 0 20px rgba(255, 255, 255, 0.2)',
        },
        
        // Progress Bar Shadows
        progress: {
            track: `
                0 0 10px rgba(0, 255, 255, 0.3),
                inset 0 0 10px rgba(0, 0, 0, 0.5)
            `,
            fill: '0 0 12px rgba(0, 255, 255, 0.6)',
            complete: `
                0 0 20px rgba(0, 255, 255, 1.0),
                0 0 40px rgba(255, 0, 255, 0.8),
                0 0 60px rgba(0, 255, 255, 0.4)
            `,
        },
    },
    
    // Text Shadows (see typography.js for more)
    textShadow: {
        // Re-exported from typography for convenience
        cyan: '0 0 10px rgba(0, 255, 255, 0.8)',
        green: '0 0 10px rgba(0, 255, 0, 0.8)',
        white: '0 0 10px rgba(255, 255, 255, 0.5)',
    },
};

/**
 * Get combined shadow for a component
 * @param {string} component - Component name (button, panel, modal, etc.)
 * @param {string} state - State (normal, hover, focus, etc.)
 * @returns {string} Combined shadow value
 */
export function getComponentShadow(component, state = 'normal') {
    const shadows = {
        button: {
            normal: shadows.boxShadow.cyan.normal,
            hover: shadows.boxShadow.neon.normal,
            pressed: shadows.boxShadow.cyan.subtle,
        },
        panel: {
            normal: shadows.boxShadow.panel,
            focus: shadows.boxShadow.panelFocus,
        },
        modal: {
            normal: shadows.boxShadow.modal,
        },
        progress: {
            track: shadows.boxShadow.progress.track,
            fill: shadows.boxShadow.progress.fill,
        },
    };
    
    return shadows[component]?.[state] || shadows.boxShadow.cyan.normal;
}

