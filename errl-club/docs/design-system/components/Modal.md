# Modal Component

Reusable modal dialog component with overlay, header, content, and close handling.

## Overview

The Modal component provides a consistent modal interface with overlay, header with title, content area, and optional close button. Supports keyboard navigation (Escape key) and click-outside-to-close.

## Usage

```javascript
import { Modal } from './ui/components/Modal.js';

const modal = new Modal({
    title: 'Settings',
    content: '<p>Modal content here</p>',
    size: 'medium',
    closable: true,
    onClose: () => {
        console.log('Modal closed');
    }
});

// Show modal
modal.show();

// Close modal
modal.close();
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Modal'` | Modal title text |
| `content` | `HTMLElement\|string` | `''` | Modal content (element or HTML string) |
| `onClose` | `Function` | `() => {}` | Close handler function |
| `closable` | `boolean` | `true` | Whether modal can be closed |
| `size` | `string\|Object` | `'medium'` | Size preset or custom `{width, height}` |

### Size Presets

- `'small'`: 400px × 300px
- `'medium'`: 600px × 400px
- `'large'`: 800px × 600px

### Custom Size

```javascript
const modal = new Modal({
    title: 'Custom Size',
    content: 'Content',
    size: {
        width: 500,
        height: 350
    }
});
```

## Structure

```
.ui-modal-overlay
  └── .ui-modal
      ├── .ui-modal-header
      │   ├── h2 (title)
      │   └── button (close button, if closable)
      └── .ui-modal-content
```

## Styling

### Overlay

```css
.ui-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    z-index: 10000;
    align-items: center;
    justify-content: center;
}
```

### Modal Container

```css
.ui-modal {
    background: rgba(20, 20, 20, 0.95);
    border: 2px solid #00ffff;
    border-radius: 8px;
    width: 600px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 255, 255, 0.5);
}
```

### Header

```css
.ui-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #00ffff;
}
```

### Content

```css
.ui-modal-content {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
    color: #ffffff;
    font-family: Arial, sans-serif;
}
```

## Methods

### `show()`
Display the modal.

```javascript
modal.show();
```

### `close()`
Close the modal and trigger onClose callback.

```javascript
modal.close();
```

### `isVisible()`
Check if modal is currently visible.

```javascript
if (modal.isVisible()) {
    console.log('Modal is open');
}
```

### `setContent(content)`
Update modal content.

```javascript
modal.setContent('<p>New content</p>');
// or
const element = document.createElement('div');
element.textContent = 'New content';
modal.setContent(element);
```

### `getContentElement()`
Get the content container element for direct manipulation.

```javascript
const contentEl = modal.getContentElement();
contentEl.appendChild(someElement);
```

### `destroy()`
Clean up and remove modal from DOM.

```javascript
modal.destroy();
```

## Events

The modal automatically handles:
- **Escape key**: Closes modal (if closable)
- **Overlay click**: Closes modal (if closable)
- **Close button click**: Closes modal (if closable)

## Examples

### Basic Modal

```javascript
const modal = new Modal({
    title: 'Information',
    content: '<p>This is a basic modal.</p>',
});

modal.show();
```

### Modal with HTML Content

```javascript
const content = document.createElement('div');
content.innerHTML = `
    <h3>Form</h3>
    <input type="text" placeholder="Name">
    <button>Submit</button>
`;

const modal = new Modal({
    title: 'User Form',
    content: content,
});
```

### Non-Closable Modal

```javascript
const modal = new Modal({
    title: 'Processing...',
    content: '<p>Please wait...</p>',
    closable: false,
});
```

### Large Modal

```javascript
const modal = new Modal({
    title: 'Large Content',
    content: '<div>Lots of content here...</div>',
    size: 'large',
});
```

## Design Tokens Used

- **Colors**: `colors.background.modal`, `colors.border.primary`, `colors.text.primary`
- **Spacing**: `spacing.component.modal.*`
- **Shadows**: `shadows.boxShadow.modal`
- **Borders**: `borders.presets.primary`, `borders.radius.xl`

