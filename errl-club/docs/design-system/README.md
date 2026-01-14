# Errl Club Design System

A comprehensive design system for the Errl Club application, providing design tokens, components, styles, and documentation for maintaining visual consistency across the application.

## Overview

The Errl Club Design System is a complete reference for all design elements used in the application. It includes:

- **Design Tokens**: Colors, typography, spacing, shadows, animations, and borders
- **Components**: Reusable UI components with documentation
- **Styles**: Base styles, component styles, and utility classes
- **Examples**: Interactive examples showcasing the design system

## Design Principles

1. **Neon Aesthetic**: Cyan/magenta color scheme with glow effects
2. **Dark Theme**: Dark backgrounds with high contrast for readability
3. **Smooth Animations**: Transitions and keyframe animations for polish
4. **Modular Components**: Reusable, configurable UI elements
5. **Consistent Spacing**: Standardized spacing scale throughout
6. **Accessibility**: High contrast, readable text, keyboard navigation

## Quick Start

### Using CSS Files

Include the design system CSS files in your HTML:

```html
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/components.css">
<link rel="stylesheet" href="styles/utilities.css">
```

### Using Design Tokens

Import design tokens in your JavaScript:

```javascript
import { colors } from './tokens/colors.js';
import { typography } from './tokens/typography.js';
import { spacing } from './tokens/spacing.js';
```

### Using Components

Import and use components:

```javascript
import { Button } from './ui/components/Button.js';

const button = new Button({
    text: 'Click Me',
    onClick: () => console.log('Clicked!'),
});
```

## Structure

```
design-system/
├── README.md                    # This file
├── tokens/                      # Design tokens
│   ├── colors.js               # Color palette
│   ├── typography.js           # Typography system
│   ├── spacing.js              # Spacing scale
│   ├── shadows.js              # Shadow definitions
│   ├── animations.js           # Animation tokens
│   └── borders.js              # Border styles
├── components/                  # Component documentation
│   ├── Button.md               # Button component
│   ├── Modal.md                # Modal component
│   ├── Slider.md               # Slider component
│   ├── InputField.md           # Input field component
│   ├── Dropdown.md             # Dropdown component
│   ├── Panel.md                # Panel component
│   └── index.md                # Component index
├── styles/                      # CSS files
│   ├── base.css                # Base styles and resets
│   ├── components.css          # Component styles
│   └── utilities.css           # Utility classes
└── examples/                    # Example pages
    ├── color-palette.html      # Color showcase
    ├── typography.html         # Typography examples
    └── components.html         # Component demos
```

## Design Tokens

### Colors

The color system includes:

- **Primary Colors**: Cyan (#00ffff), Magenta (#ff00ff), Green (#00ff00)
- **Background Colors**: Dark variants for UI panels and overlays
- **Text Colors**: Primary, accent, error, and disabled states
- **Border Colors**: Primary, secondary, hover, disabled, and error states
- **Avatar Colors**: 25 color variants across 5 categories (purple, green, red, orange, blue)
- **Gradients**: Background gradients and progress bar gradients
- **Glow Effects**: RGBA values for shadows and neon effects

See [tokens/colors.js](tokens/colors.js) for the complete color palette.

### Typography

Typography system includes:

- **Font Families**: Primary (Arial) and Bold (Arial Black)
- **Font Sizes**: XS (0.7rem) to 3XL (3rem), plus responsive hero text
- **Font Weights**: Normal, medium (500), bold, black (900)
- **Letter Spacing**: Tight (0.05em) to Wider (0.4em)
- **Text Shadows**: Neon glow effects with varying intensities

See [tokens/typography.js](tokens/typography.js) for complete typography system.

### Spacing

Consistent spacing scale:

- **Padding**: XS (5px) to 2XL (20px)
- **Margin**: XS (8px) to XL (40px)
- **Gap**: XS (6px) to LG (20px)
- **Border Radius**: SM (3px) to Full (50%), plus Pill (999px)

See [tokens/spacing.js](tokens/spacing.js) for the complete spacing scale.

### Shadows

Shadow system for depth and glow effects:

- **Box Shadows**: Cyan, magenta, and combined neon glows
- **Text Shadows**: Multi-layer neon effects
- **Inset Shadows**: For depth and dimension
- **Component Shadows**: Panel, modal, and progress bar shadows

See [tokens/shadows.js](tokens/shadows.js) for complete shadow definitions.

### Animations

Animation system includes:

- **Keyframes**: hueShift, gradientShift, titleGlow, reticlePulse, and more
- **Durations**: Instant (0.1s) to Slowest (1.5s)
- **Easing**: Linear, ease, ease-in-out, cubic-bezier, spring
- **Presets**: Pre-configured animation combinations

See [tokens/animations.js](tokens/animations.js) for complete animation system.

### Borders

Border system includes:

- **Widths**: None, thin (1px), normal (2px), thick (3px)
- **Styles**: None, solid, dashed, dotted
- **Radius**: None to Full (50%), plus Pill (999px)
- **Presets**: Primary, secondary, hover, disabled, error, subtle

See [tokens/borders.js](tokens/borders.js) for complete border system.

## Components

The design system includes documentation for the following components:

- **[Button](components/Button.md)**: Reusable button with state management
- **[Modal](components/Modal.md)**: Modal dialog with overlay and close handling
- **[Slider](components/Slider.md)**: Range input with label and value display
- **[InputField](components/InputField.md)**: Text input with validation
- **[Dropdown](components/Dropdown.md)**: Select dropdown with options
- **[Panel](components/Panel.md)**: Base panel class for positioned UI elements
- **[VibesLiquidBar](components/VibesLiquidBar.md)**: Liquid bar with rainbow gradient
- **[VibesMarquee](components/VibesMarquee.md)**: Scrolling marquee text component

See [components/index.md](components/index.md) for the complete component index.

## Styles

### Base Styles

Base styles include:

- CSS variables for all design tokens
- Global resets
- Background gradient animations
- Canvas and HUD container styles
- Reticle and progress bar styles
- Emote wheel styles

See [styles/base.css](styles/base.css) for base styles.

### Component Styles

Component styles provide:

- Button states (normal, hover, pressed, disabled)
- Modal overlay and container styles
- Panel styles with focus states
- Input field styles with validation states
- Dropdown and slider styles

See [styles/components.css](styles/components.css) for component styles.

### Utility Classes

Utility classes provide:

- Spacing utilities (margin, padding, gap)
- Color utilities (text, background, border)
- Typography utilities (font size, weight, transform)
- Border utilities (radius, width)
- Shadow utilities
- Display and position utilities
- Transition and cursor utilities

See [styles/utilities.css](styles/utilities.css) for utility classes.

## Examples

Interactive examples are available:

- **[Color Palette](examples/color-palette.html)**: Visual showcase of all colors and gradients
- **[Typography](examples/typography.html)**: Typography scale and text effects
- **[Components](examples/components.html)**: Interactive component demos

Open these files in a browser to see the design system in action.

## Usage Guidelines

### When to Use Design Tokens

- Use design tokens for all colors, spacing, typography, and shadows
- Import tokens in JavaScript for programmatic styling
- Use CSS variables in stylesheets for consistent styling

### When to Use Components

- Use components for common UI patterns (buttons, inputs, modals)
- Extend components for custom functionality
- Follow component documentation for proper usage

### When to Use Utility Classes

- Use utility classes for quick styling without custom CSS
- Combine utility classes for complex layouts
- Prefer utility classes over inline styles when possible

## Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Accessibility**: Ensure sufficient contrast and keyboard navigation
3. **Performance**: Use CSS variables for dynamic theming
4. **Maintainability**: Follow the established patterns and structure
5. **Documentation**: Document custom components and extensions

## Contributing

When adding new components or tokens:

1. Follow the existing structure and naming conventions
2. Document all props, methods, and usage examples
3. Include design tokens in the appropriate token files
4. Add styles to the appropriate CSS files
5. Create example pages for new components
6. Update this README with new additions

## File Reference

The design system is extracted from:

- `src/style.css` - Global styles and animations
- `src/ui/components/*.js` - Component implementations
- `src/ui/BasePanel.js` - Base panel styling
- `src/config/AvatarColorVariants.js` - Color system
- `src/config/constants.js` - Configuration constants
- `src/ui/LoadingScreen.js` - Additional styling patterns

## License

This design system is part of the Errl Club application.

