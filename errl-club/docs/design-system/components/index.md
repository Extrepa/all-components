# Component Index

Complete list of UI components in the Errl Club Design System.

## Available Components

### [Button](./Button.md)
Reusable button component with state management and event handling.

**Use when**: You need a clickable button with hover, pressed, and disabled states.

### [Modal](./Modal.md)
Modal dialog component with overlay, header, content, and close handling.

**Use when**: You need to display content in a modal overlay that can be closed.

### [Slider](./Slider.md)
Range input component with label, value display, and formatting support.

**Use when**: You need a numeric input with a visual slider control.

### [InputField](./InputField.md)
Text input component with label, validation, and formatting support.

**Use when**: You need a text input with validation and error display.

### [Dropdown](./Dropdown.md)
Select/dropdown component with label, options, and change handling.

**Use when**: You need a select dropdown with multiple options.

### [Panel](./Panel.md)
Base panel class for panel-based UI components.

**Use when**: You need a positioned panel container that can be shown/hidden.

### [VibesLiquidBar](./VibesLiquidBar.md)
Liquid bar component with rainbow gradient and glitter effects.

**Use when**: You need a visually striking progress bar or scrollbar thumb with rainbow effects.

### [VibesMarquee](./VibesMarquee.md)
Scrolling marquee text component with neon glow.

**Use when**: You need scrolling text effects for headers, portals, or decorative elements.

## Component Relationships

```
BasePanel (base class)
  └── Used by: SettingsPanel, HelpPanel, etc.

Button (standalone)
  └── Used in: Modals, Panels, Forms

Modal (standalone)
  └── Contains: Button, InputField, etc.

Slider (standalone)
  └── Used in: Settings panels, Audio controls

InputField (standalone)
  └── Used in: Forms, Modals, Settings

Dropdown (standalone)
  └── Used in: Forms, Settings, Filters

VibesLiquidBar (standalone)
  └── Used in: Progress bars, Scrollbar thumbs, Vibe meters

VibesMarquee (standalone)
  └── Used in: Phone headers, Portals, Decorative elements
```

## Design Principles

All components follow these principles:

1. **Consistent Styling**: All components use the same color scheme, typography, and spacing
2. **State Management**: Components handle their own state (normal, hover, pressed, disabled, error)
3. **Event Handling**: Components provide callback-based event handling
4. **Accessibility**: Components support keyboard navigation and ARIA attributes
5. **Modularity**: Components are self-contained and can be used independently

## Usage Patterns

### Basic Pattern

```javascript
import { Component } from './ui/components/Component.js';

const component = new Component({
    // configuration
});

document.body.appendChild(component.getElement());
```

### With Event Handlers

```javascript
const component = new Component({
    onChange: (value) => {
        console.log('Value changed:', value);
    },
    onClick: () => {
        console.log('Clicked!');
    },
});
```

### With Custom Styling

```javascript
const component = new Component({
    style: {
        width: '300px',
        height: '200px',
        // custom styles
    },
});
```

## Component Lifecycle

1. **Creation**: Component is instantiated with configuration
2. **Initialization**: Component creates DOM elements and sets up event listeners
3. **Usage**: Component is added to DOM and used
4. **Updates**: Component state can be updated via methods
5. **Destruction**: Component is cleaned up with `destroy()` method

## Best Practices

1. **Always destroy**: Call `destroy()` when removing components to clean up event listeners
2. **Use callbacks**: Use provided callbacks instead of directly accessing DOM
3. **Validate inputs**: Use validation functions for user inputs
4. **Handle errors**: Display error states appropriately
5. **Consistent spacing**: Use design tokens for spacing and sizing

