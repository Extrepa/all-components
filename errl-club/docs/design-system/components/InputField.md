# InputField Component

Reusable input field component with label, validation, and formatting support.

## Overview

The InputField component provides a consistent text input interface with label, validation, error display, and custom formatting.

## Usage

```javascript
import { InputField } from './ui/components/InputField.js';

const input = new InputField({
    label: 'Username',
    type: 'text',
    placeholder: 'Enter username',
    value: '',
    onChange: (value) => {
        console.log('Username:', value);
    },
    validator: (value) => {
        if (value.length < 3) {
            return { valid: false, error: 'Must be at least 3 characters' };
        }
        return { valid: true };
    },
});

// Add to DOM
document.body.appendChild(input.getElement());
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Input'` | Label text |
| `type` | `string` | `'text'` | Input type (text, email, password, etc.) |
| `placeholder` | `string` | `''` | Placeholder text |
| `value` | `string` | `''` | Initial value |
| `onChange` | `Function` | `() => {}` | Change handler `(value) => void` |
| `validator` | `Function` | `() => ({valid: true})` | Validation function `(value) => {valid, error}` |
| `formatter` | `Function` | `(v) => v` | Format function `(value) => string` |

## Structure

```
.ui-input-field
  ├── label
  ├── input
  └── .ui-input-error
```

## Styling

### Container

```css
.ui-input-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
}
```

### Label

```css
.ui-input-field label {
    color: #ffffff;
    font-size: 14px;
    font-family: Arial, sans-serif;
}
```

### Input

```css
.ui-input-field input {
    padding: 8px 12px;
    background: #333333;
    color: #ffffff;
    border: 2px solid #00ffff;
    border-radius: 4px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    outline: none;
}
```

### Error State

```css
.ui-input-field input[data-invalid="true"] {
    border-color: #ff0000;
}

.ui-input-error {
    color: #ff0000;
    font-size: 12px;
    font-family: Arial, sans-serif;
    display: none;
}
```

## States

### Normal
- Border: `#00ffff` (cyan)
- Background: `#333333`
- Text: `#ffffff`

### Error
- Border: `#ff0000` (red)
- Background: `#333333`
- Text: `#ffffff`
- Error message displayed

### Disabled
- Border: `#666666`
- Background: `#1a1a1a`
- Text: `#666666`
- Opacity: `0.5`

## Methods

### `setValue(value)`
Set input value programmatically.

```javascript
input.setValue('new value');
```

### `getValue()`
Get current input value.

```javascript
const value = input.getValue();
```

### `validate()`
Manually trigger validation.

```javascript
const isValid = input.validate();
```

### `isValid()`
Check if input is currently valid.

```javascript
if (input.isValid()) {
    console.log('Input is valid');
}
```

### `focus()`
Focus the input field.

```javascript
input.focus();
```

### `blur()`
Blur the input field.

```javascript
input.blur();
```

### `enable()`
Enable the input field.

```javascript
input.enable();
```

### `disable()`
Disable the input field.

```javascript
input.disable();
```

### `getElement()`
Get the container DOM element.

```javascript
const element = input.getElement();
```

### `destroy()`
Clean up and remove input from DOM.

```javascript
input.destroy();
```

## Validation

The validator function should return an object with:
- `valid`: `boolean` - Whether the value is valid
- `error`: `string` (optional) - Error message to display

```javascript
const validator = (value) => {
    if (value.length === 0) {
        return { valid: false, error: 'This field is required' };
    }
    if (value.length < 5) {
        return { valid: false, error: 'Must be at least 5 characters' };
    }
    return { valid: true };
};
```

## Formatting

The formatter function can transform the input value:

```javascript
const formatter = (value) => {
    // Remove non-numeric characters
    return value.replace(/\D/g, '');
};

const input = new InputField({
    label: 'Phone Number',
    formatter: formatter,
});
```

## Examples

### Basic Input

```javascript
const input = new InputField({
    label: 'Name',
    placeholder: 'Enter your name',
    onChange: (value) => {
        console.log('Name:', value);
    },
});
```

### Email Input with Validation

```javascript
const input = new InputField({
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    validator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, error: 'Invalid email address' };
        }
        return { valid: true };
    },
});
```

### Password Input

```javascript
const input = new InputField({
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    validator: (value) => {
        if (value.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters' };
        }
        return { valid: true };
    },
});
```

### Number Input with Formatting

```javascript
const input = new InputField({
    label: 'Age',
    type: 'number',
    formatter: (value) => {
        // Only allow digits
        return value.replace(/\D/g, '');
    },
    validator: (value) => {
        const age = parseInt(value);
        if (isNaN(age) || age < 0 || age > 120) {
            return { valid: false, error: 'Age must be between 0 and 120' };
        }
        return { valid: true };
    },
});
```

## Design Tokens Used

- **Colors**: `colors.input.*`, `colors.text.*`, `colors.border.*`
- **Spacing**: `spacing.component.input.*`
- **Typography**: `typography.fontSize.*`, `typography.fontFamily.primary`
- **Borders**: `borders.presets.primary`, `borders.presets.error`

