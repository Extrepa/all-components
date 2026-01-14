# Panel Component (BasePanel)

Base panel class with common functionality for all panel-based UI components.

## Overview

The BasePanel component provides a foundation for panel-based UI elements with positioning, sizing, visibility control, and event handling.

## Usage

```javascript
import { BasePanel } from './ui/BasePanel.js';

const panel = new BasePanel({
    id: 'my-panel',
    title: 'Settings Panel',
    position: { x: 100, y: 100 },
    size: { width: 400, height: 300 },
    style: {
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
    }
});

// Show panel
panel.show();

// Add content
const content = panel.getContentElement();
content.innerHTML = '<p>Panel content</p>';
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `'panel_${Date.now()}'` | Unique panel ID |
| `title` | `string` | `''` | Panel title (optional) |
| `position` | `Object` | `{x: 0, y: 0}` | Panel position `{x, y}` |
| `size` | `Object` | `{width: 300, height: 200}` | Panel size `{width, height}` |
| `style` | `Object` | `{}` | Custom CSS styles |

## Structure

```
.ui-panel
  ├── .ui-panel-title (if title provided)
  └── .ui-panel-content
```

## Styling

### Panel Container

```css
.ui-panel {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 300px;
    height: 200px;
    background: rgba(20, 20, 20, 0.9);
    border: 2px solid #00ffff;
    border-radius: 8px;
    padding: 16px;
    color: #ffffff;
    font-family: Arial, sans-serif;
    display: none;
    z-index: 0;
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
    box-sizing: border-box;
    overflow: hidden;
}
```

### Title

```css
.ui-panel-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #00ffff;
    border-bottom: 1px solid #00ffff;
    padding-bottom: 8px;
}
```

### Content

```css
.ui-panel-content {
    /* Content area - no default styles */
}
```

## States

### Focus State
- Border: `#00ff00` (green)
- Box shadow: `0 4px 20px rgba(0, 255, 0, 0.5)`

### Blur State
- Border: `#00ffff` (cyan)
- Box shadow: `0 4px 20px rgba(0, 255, 255, 0.3)`

## Methods

### `show()`
Display the panel.

```javascript
panel.show();
```

### `hide()`
Hide the panel.

```javascript
panel.hide();
```

### `isVisible()`
Check if panel is currently visible.

```javascript
if (panel.isVisible()) {
    console.log('Panel is visible');
}
```

### `setPosition(x, y)`
Update panel position.

```javascript
panel.setPosition(200, 150);
```

### `setSize(width, height)`
Update panel size.

```javascript
panel.setSize(500, 400);
```

### `setZIndex(zIndex)`
Set panel z-index.

```javascript
panel.setZIndex(1000);
```

### `getContentElement()`
Get the content container element.

```javascript
const content = panel.getContentElement();
content.appendChild(someElement);
```

### `update(deltaTime)`
Update method called every frame (override for custom behavior).

```javascript
class MyPanel extends BasePanel {
    update(deltaTime) {
        // Custom update logic
    }
}
```

### `render()`
Render method called every frame (override for custom behavior).

```javascript
class MyPanel extends BasePanel {
    render() {
        // Custom render logic
    }
}
```

### `handleEvent(eventType, eventData)`
Handle UI events (override for custom behavior).

```javascript
class MyPanel extends BasePanel {
    handleEvent(eventType, eventData) {
        if (eventType === 'custom-event') {
            // Handle event
            return true;
        }
        return false;
    }
}
```

### `onFocus()`
Focus handler (can be overridden).

```javascript
class MyPanel extends BasePanel {
    onFocus() {
        super.onFocus();
        // Custom focus behavior
    }
}
```

### `onBlur()`
Blur handler (can be overridden).

```javascript
class MyPanel extends BasePanel {
    onBlur() {
        super.onBlur();
        // Custom blur behavior
    }
}
```

### `destroy()`
Clean up and remove panel from DOM.

```javascript
panel.destroy();
```

## Event Handlers

You can set custom event handlers:

```javascript
panel.onShow = () => {
    console.log('Panel shown');
};

panel.onHide = () => {
    console.log('Panel hidden');
};

panel.onUpdate = (deltaTime) => {
    // Called every frame
};

panel.onRender = () => {
    // Called every frame
};
```

## Examples

### Basic Panel

```javascript
const panel = new BasePanel({
    title: 'Info Panel',
    position: { x: 50, y: 50 },
    size: { width: 300, height: 200 },
});

panel.show();

const content = panel.getContentElement();
content.innerHTML = '<p>This is panel content</p>';
```

### Custom Styled Panel

```javascript
const panel = new BasePanel({
    title: 'Custom Panel',
    style: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderColor: '#ff00ff',
    },
});
```

### Extending BasePanel

```javascript
class SettingsPanel extends BasePanel {
    constructor() {
        super({
            id: 'settings-panel',
            title: 'Settings',
            position: { x: 100, y: 100 },
            size: { width: 500, height: 400 },
        });
        
        this.setupContent();
    }
    
    setupContent() {
        const content = this.getContentElement();
        
        // Add custom content
        const slider = new Slider({
            label: 'Volume',
            min: 0,
            max: 100,
            value: 50,
        });
        
        content.appendChild(slider.getElement());
    }
}
```

## Design Tokens Used

- **Colors**: `colors.background.panel`, `colors.border.primary`, `colors.text.primary`
- **Spacing**: `spacing.component.panel.*`
- **Shadows**: `shadows.boxShadow.panel`
- **Borders**: `borders.presets.primary`, `borders.radius.xl`

