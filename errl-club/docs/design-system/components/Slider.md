# Slider Component

Reusable slider/range input component with label, value display, and formatting support.

## Overview

The Slider component provides a consistent range input interface with label, value display, step control, and custom formatting.

## Usage

```javascript
import { Slider } from './ui/components/Slider.js';

const slider = new Slider({
    label: 'Volume',
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    onChange: (value) => {
        console.log('Volume:', value);
    },
    format: (value) => `${value}%`,
});

// Add to DOM
document.body.appendChild(slider.getElement());
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Slider'` | Label text |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `value` | `number` | `min` | Initial value |
| `step` | `number` | `1` | Step increment |
| `onChange` | `Function` | `() => {}` | Change handler `(value) => void` |
| `format` | `Function` | `(v) => v.toString()` | Value formatter `(value) => string` |

## Structure

```
.ui-slider
  ├── label
  └── .slider-container
      ├── input[type="range"]
      └── .ui-slider-value
```

## Styling

### Container

```css
.ui-slider {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
}
```

### Label

```css
.ui-slider label {
    color: #ffffff;
    font-size: 14px;
    font-family: Arial, sans-serif;
}
```

### Slider Input

```css
.ui-slider input[type="range"] {
    flex: 1;
    height: 6px;
    background: #333333;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
}
```

### Value Display

```css
.ui-slider-value {
    color: #00ffff;
    font-size: 14px;
    font-family: Arial, sans-serif;
    min-width: 50px;
    text-align: right;
}
```

## Methods

### `setValue(value)`
Set slider value programmatically (will be clamped and stepped).

```javascript
slider.setValue(75);
```

### `getValue()`
Get current slider value.

```javascript
const currentValue = slider.getValue();
```

### `getElement()`
Get the container DOM element.

```javascript
const element = slider.getElement();
```

### `destroy()`
Clean up and remove slider from DOM.

```javascript
slider.destroy();
```

## Value Handling

The slider automatically:
- Clamps values to `min` and `max`
- Applies step increments
- Triggers `onChange` callback when value changes
- Updates displayed value using formatter

## Examples

### Basic Slider

```javascript
const slider = new Slider({
    label: 'Brightness',
    min: 0,
    max: 100,
    value: 50,
    onChange: (value) => {
        console.log('Brightness:', value);
    },
});
```

### Slider with Formatting

```javascript
const slider = new Slider({
    label: 'Speed',
    min: 0,
    max: 10,
    value: 5,
    step: 0.1,
    format: (value) => `${value.toFixed(1)}x`,
    onChange: (value) => {
        console.log('Speed:', value);
    },
});
```

### Percentage Slider

```javascript
const slider = new Slider({
    label: 'Opacity',
    min: 0,
    max: 100,
    value: 100,
    format: (value) => `${value}%`,
    onChange: (value) => {
        element.style.opacity = value / 100;
    },
});
```

### Decimal Slider

```javascript
const slider = new Slider({
    label: 'Intensity',
    min: 0,
    max: 1,
    value: 0.5,
    step: 0.01,
    format: (value) => value.toFixed(2),
    onChange: (value) => {
        console.log('Intensity:', value);
    },
});
```

## Design Tokens Used

- **Colors**: `colors.input.normal.*`, `colors.text.accent`
- **Spacing**: `spacing.component.slider.*`
- **Typography**: `typography.fontSize.md`, `typography.fontFamily.primary`
- **Borders**: `borders.radius.sm`

