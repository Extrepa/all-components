# VibesLiquidBar Component

Reusable liquid bar component with rainbow gradient effect and glitter animation.

## Overview

The VibesLiquidBar component creates a visually striking liquid bar with a flowing rainbow gradient and glitter overlay effect. Used for scrollbar thumbs, progress bars, and other UI elements that match the vibe meter's liquid rainbow aesthetic.

## Usage

```javascript
import { VibesLiquidBar } from './ui/components/VibesLiquidBar.js';

const container = document.createElement('div');
const liquidBar = new VibesLiquidBar(container, {
    width: '100%',
    height: '12px',
    borderRadius: '6px',
    vibeLevel: 0.8,
});

// Update vibe level
liquidBar.setVibeLevel(0.9);
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `string` | `'100%'` | Bar width |
| `height` | `string` | `'100%'` | Bar height |
| `borderRadius` | `string` | `'4px'` | Border radius |
| `vibeLevel` | `number` | `0` | Vibe level (0-1) affecting opacity |

## Structure

```
.vibes-liquid-bar
  ├── .vibes-liquid-fill (rainbow gradient)
  └── .vibes-liquid-glitter (glitter overlay)
```

## Styling

### Bar Container

```css
.vibes-liquid-bar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
}
```

### Liquid Fill

The fill uses a rainbow gradient that animates:

```css
.vibes-liquid-fill {
    background: linear-gradient(
        90deg,
        #ff0080 0%,
        #ff8000 14%,
        #ffff00 28%,
        #80ff00 42%,
        #00ff80 57%,
        #00ffff 71%,
        #0080ff 85%,
        #8000ff 100%
    );
    background-size: 200% 100%;
    animation: rainbowFlow 3s linear infinite;
    box-shadow: 
        0 0 10px rgba(0, 255, 255, 0.6),
        inset 0 0 10px rgba(255, 0, 255, 0.4);
}
```

### Glitter Overlay

The glitter effect adds sparkle:

```css
.vibes-liquid-glitter {
    background: 
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.25) 0%, transparent 50%);
    animation: glitterMove 4s ease-in-out infinite;
}
```

## Animations

### Rainbow Flow

```css
@keyframes rainbowFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
}
```

### Glitter Move

```css
@keyframes glitterMove {
    0%, 100% { transform: translate(0, 0); opacity: 0.8; }
    50% { transform: translate(10px, 10px); opacity: 1; }
}
```

## Methods

### `setVibeLevel(vibeLevel)`
Update the vibe level (affects opacity).

```javascript
liquidBar.setVibeLevel(0.75);
```

### `update(options)`
Update bar options and recreate.

```javascript
liquidBar.update({
    width: '200px',
    height: '20px',
    vibeLevel: 0.9,
});
```

### `destroy()`
Remove the bar from DOM.

```javascript
liquidBar.destroy();
```

## Examples

### Basic Liquid Bar

```javascript
const container = document.createElement('div');
container.style.width = '300px';
container.style.height = '12px';

const liquidBar = new VibesLiquidBar(container);
document.body.appendChild(container);
```

### Progress Bar Style

```javascript
const container = document.createElement('div');
container.style.cssText = `
    width: 400px;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
`;

const liquidBar = new VibesLiquidBar(container, {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    vibeLevel: 0.6,
});
```

### Scrollbar Thumb

```javascript
const scrollbarThumb = document.createElement('div');
scrollbarThumb.style.cssText = `
    width: 8px;
    height: 50px;
    border-radius: 4px;
`;

const liquidBar = new VibesLiquidBar(scrollbarThumb, {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    vibeLevel: 1.0,
});
```

## Design Tokens Used

- **Colors**: Rainbow gradient (8 color stops)
- **Shadows**: Cyan and magenta glow effects
- **Animations**: `rainbowFlow`, `glitterMove`
- **Spacing**: Custom width/height via options

