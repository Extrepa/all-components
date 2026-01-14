# Dropdown Component

Reusable dropdown/select component with label, options, and change handling.

## Overview

The Dropdown component provides a consistent select interface with label, options list, and change event handling.

## Usage

```javascript
import { Dropdown } from './ui/components/Dropdown.js';

const dropdown = new Dropdown({
    label: 'Theme',
    options: [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
        { value: 'auto', label: 'Auto' },
    ],
    value: 'dark',
    onChange: (value) => {
        console.log('Selected theme:', value);
    },
});

// Add to DOM
document.body.appendChild(dropdown.getElement());
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Dropdown'` | Label text |
| `options` | `Array` | `[]` | Options array `[{value, label}, ...]` |
| `value` | `*` | `undefined` | Initial selected value (defaults to first option) |
| `onChange` | `Function` | `() => {}` | Change handler `(value) => void` |
| `searchable` | `boolean` | `false` | Enable search (not yet implemented) |

## Structure

```
.ui-dropdown
  ├── label
  └── select
      └── option (multiple)
```

## Styling

### Container

```css
.ui-dropdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
}
```

### Label

```css
.ui-dropdown label {
    color: #ffffff;
    font-size: 14px;
    font-family: Arial, sans-serif;
}
```

### Select

```css
.ui-dropdown select {
    padding: 8px 12px;
    background: #333333;
    color: #ffffff;
    border: 2px solid #00ffff;
    border-radius: 4px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    cursor: pointer;
    outline: none;
}
```

## Options Format

Options should be an array of objects with `value` and optional `label`:

```javascript
const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3' }, // label defaults to value
];
```

## Methods

### `setValue(value)`
Set selected value programmatically.

```javascript
dropdown.setValue('light');
```

### `getValue()`
Get currently selected value.

```javascript
const selected = dropdown.getValue();
```

### `getSelectedLabel()`
Get the label of the currently selected option.

```javascript
const label = dropdown.getSelectedLabel();
```

### `addOption(value, label)`
Add a new option to the dropdown.

```javascript
dropdown.addOption('newOption', 'New Option');
```

### `removeOption(value)`
Remove an option from the dropdown.

```javascript
dropdown.removeOption('oldOption');
```

### `getElement()`
Get the container DOM element.

```javascript
const element = dropdown.getElement();
```

### `destroy()`
Clean up and remove dropdown from DOM.

```javascript
dropdown.destroy();
```

## Examples

### Basic Dropdown

```javascript
const dropdown = new Dropdown({
    label: 'Language',
    options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
    ],
    onChange: (value) => {
        console.log('Language changed to:', value);
    },
});
```

### Dropdown with Default Value

```javascript
const dropdown = new Dropdown({
    label: 'Quality',
    options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ],
    value: 'medium', // Default selection
    onChange: (value) => {
        updateQuality(value);
    },
});
```

### Dynamic Options

```javascript
const dropdown = new Dropdown({
    label: 'Category',
    options: [],
});

// Add options dynamically
categories.forEach(category => {
    dropdown.addOption(category.id, category.name);
});
```

### Simple Value Options

```javascript
const dropdown = new Dropdown({
    label: 'Size',
    options: [
        { value: 'small' },
        { value: 'medium' },
        { value: 'large' },
    ],
    // label will default to value if not provided
});
```

## Design Tokens Used

- **Colors**: `colors.input.normal.*`, `colors.text.*`, `colors.border.*`
- **Spacing**: `spacing.component.input.*`
- **Typography**: `typography.fontSize.md`, `typography.fontFamily.primary`
- **Borders**: `borders.presets.primary`

