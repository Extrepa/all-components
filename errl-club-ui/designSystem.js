/**
 * Design System - Centralized constants for UI styling
 *
 * Provides consistent colors, spacing, typography, borders, and shadows
 * across all UI components to ensure a cohesive design language.
 */

export const DESIGN_SYSTEM = {
    colors: {
        background: 'rgba(20, 20, 20, 0.9)',
        border: '#00ffff',
        text: '#ffffff',
        accent: '#00ffff',
        title: '#00ffff',
    },
    spacing: {
        padding: '16px',
        margin: '12px',
        gap: '8px',
        titlePaddingBottom: '8px',
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        titleSize: '18px',
        titleWeight: 'bold',
    },
    borders: {
        width: '2px',
        radius: '8px',
        titleBorderBottom: '1px solid #00ffff',
    },
    shadows: {
        panel: '0 4px 20px rgba(0, 255, 255, 0.3)',
    },
};

/**
 * Generate panel styles using design system constants
 * @param {Object} overrides - Style overrides
 * @returns {string} CSS styles
 */
export function generatePanelStyles(overrides = {}) {
    const styles = {
        background: DESIGN_SYSTEM.colors.background,
        border: `${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border}`,
        borderRadius: DESIGN_SYSTEM.borders.radius,
        padding: DESIGN_SYSTEM.spacing.padding,
        color: DESIGN_SYSTEM.colors.text,
        fontFamily: DESIGN_SYSTEM.typography.fontFamily,
        boxShadow: DESIGN_SYSTEM.shadows.panel,
        ...overrides,
    };

    return Object.entries(styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join(' ');
}

/**
 * Generate title styles using design system constants
 * @param {Object} overrides - Style overrides
 * @returns {string} CSS styles
 */
export function generateTitleStyles(overrides = {}) {
    const styles = {
        fontSize: DESIGN_SYSTEM.typography.titleSize,
        fontWeight: DESIGN_SYSTEM.typography.titleWeight,
        color: DESIGN_SYSTEM.colors.title,
        borderBottom: DESIGN_SYSTEM.borders.titleBorderBottom,
        paddingBottom: DESIGN_SYSTEM.spacing.titlePaddingBottom,
        marginBottom: DESIGN_SYSTEM.spacing.margin,
        ...overrides,
    };

    return Object.entries(styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join(' ');
}
