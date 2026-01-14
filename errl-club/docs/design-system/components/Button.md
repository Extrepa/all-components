# Button Component

Reusable button component with state management and event handling.

## Overview

The Button component provides a consistent button interface with support for multiple states (normal, hover, pressed, disabled) and customizable styling.

## Usage

```javascript
import { Button } from './ui/components/Button.js';

const button = new Button({
    text: 'Click Me',
    onClick: () => {
        console.log('Button clicked!');
    },
    enabled: true,
    style: {
        width: '200px',
    }
});

// Add to DOM
document.body.appendChild(button.getElement());
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'Button'` | Button text label |
| `onClick` | `Function` | `() => {}` | Click handler function |
| `enabled` | `boolean` | `true` | Whether button is enabled |
| `style` | `Object` | `{}` | Custom CSS styles (key-value pairs) |

## States

The button has four visual states:

### Normal
- Background: `#333333`
- Border: `#00ffff` (cyan)
- Text: `#ffffff`
- Transform: `scale(1)`

### Hover
- Background: `#444444`
- Border: `#00ff00` (green)
- Text: `#ffffff`
- Transform: `scale(1.05)`

### Pressed
- Background: `#222222`
- Border: `#00ffff` (cyan)
- Text: `#ffffff`
- Transform: `scale(0.95)`

### Disabled
- Background: `#1a1a1a`
- Border: `#666666`
- Text: `#666666`
- Cursor: `not-allowed`
- Transform: `scale(1)`

## Styling

### Default Styles

```css
.ui-button {
    padding: 10px 20px;
    background: #333333;
    color: #ffffff;
    border: 2px solid #00ffff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-family: Arial, sans-serif;
    transition: all 0.2s;
}
```

### Custom Styles

You can pass custom styles via the `style` prop:

```javascript
const button = new Button({
    text: 'Custom Button',
    style: {
        width: '300px',
        fontSize: '18px',
        padding: '15px 30px',
    }
});
```

## Methods

### `setState(newState)`
Set the button state programmatically.

```javascript
button.setState('hover');
button.setState('pressed');
button.setState('normal');
button.setState('disabled');
```

### `enable()`
Enable the button.

```javascript
button.enable();
```

### `disable()`
Disable the button.

```javascript
button.disable();
```

### `setText(text)`
Update button text.

```javascript
button.setText('New Text');
```

### `getElement()`
Get the DOM element.

```javascript
const element = button.getElement();
```

### `destroy()`
Clean up and remove the button from DOM.

```javascript
button.destroy();
```

## Events

The button automatically handles:
- `mouseenter` - Sets hover state
- `mouseleave` - Returns to normal state
- `mousedown` - Sets pressed state
- `mouseup` - Returns to hover state and triggers onClick
- `click` - Triggers onClick handler

## Examples

### Basic Button

```javascript
const button = new Button({
    text: 'Submit',
    onClick: () => alert('Submitted!'),
});
```

### Disabled Button

```javascript
const button = new Button({
    text: 'Loading...',
    enabled: false,
});
```

### Custom Styled Button

```javascript
const button = new Button({
    text: 'Large Button',
    style: {
        width: '400px',
        height: '60px',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    onClick: () => console.log('Large button clicked'),
});
```

## Design Tokens Used

- **Colors**: `colors.button.*`, `colors.border.*`
- **Spacing**: `spacing.component.button.*`
- **Typography**: `typography.fontSize.md`, `typography.fontFamily.primary`
- **Borders**: `borders.presets.primary`
- **Animations**: `animations.presets.buttonHover`

