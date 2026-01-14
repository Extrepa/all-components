# VibesMarquee Component

Reusable marquee component that displays scrolling text with neon glow effects.

## Overview

The VibesMarquee component creates a scrolling text effect, commonly used to display "VIBES" text in phone headers, portals, and other UI elements. Supports both horizontal and vertical scrolling directions.

## Usage

```javascript
import { VibesMarquee } from './ui/components/VibesMarquee.js';

const container = document.createElement('div');
container.style.cssText = 'width: 200px; height: 30px;';

const marquee = new VibesMarquee(container, {
    text: 'VIBES',
    color: '#00ffff',
    fontSize: '8px',
    speed: 2,
    direction: 'horizontal',
});

document.body.appendChild(container);
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'VIBES'` | Text to display (will be repeated for seamless loop) |
| `color` | `string` | `'#00ffff'` | Text color |
| `fontSize` | `string` | `'8px'` | Font size |
| `speed` | `number` | `2` | Seconds per cycle |
| `direction` | `string` | `'horizontal'` | `'horizontal'` or `'vertical'` |

## Structure

```
.vibes-marquee
  └── .vibes-marquee-text (scrolling text)
```

## Styling

### Marquee Container

```css
.vibes-marquee {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Scrolling Text

```css
.vibes-marquee-text {
    position: absolute;
    white-space: nowrap;
    font-size: 8px;
    font-weight: bold;
    color: #00ffff;
    text-shadow: 
        0 0 4px rgba(0, 255, 255, 0.5),
        0 0 8px rgba(0, 255, 255, 0.25);
}
```

## Animations

### Horizontal Marquee

```css
@keyframes vibesMarqueeHorizontal {
    0% { transform: translateY(-50%) translateX(0); }
    100% { transform: translateY(-50%) translateX(-50%); }
}
```

### Vertical Marquee

```css
@keyframes vibesMarqueeVertical {
    0% { transform: translateY(100%); }
    100% { transform: translateY(-100%); }
}
```

## Methods

### `update(options)`
Update marquee options and recreate.

```javascript
marquee.update({
    text: 'NEW TEXT',
    speed: 3,
    color: '#ff00ff',
});
```

### `destroy()`
Remove marquee from DOM.

```javascript
marquee.destroy();
```

## Examples

### Horizontal Marquee

```javascript
const container = document.createElement('div');
container.style.cssText = 'width: 300px; height: 40px; overflow: hidden;';

const marquee = new VibesMarquee(container, {
    text: 'VIBES',
    direction: 'horizontal',
    speed: 2,
});
```

### Vertical Marquee

```javascript
const container = document.createElement('div');
container.style.cssText = 'width: 40px; height: 300px; overflow: hidden;';

const marquee = new VibesMarquee(container, {
    text: 'VIBES',
    direction: 'vertical',
    speed: 3,
});
```

### Custom Text and Color

```javascript
const marquee = new VibesMarquee(container, {
    text: 'ERRL CLUB',
    color: '#ff00ff',
    fontSize: '12px',
    speed: 1.5,
});
```

## Design Tokens Used

- **Colors**: Custom color via `color` prop
- **Typography**: Font size via `fontSize` prop, bold weight
- **Text Shadows**: Neon glow effect
- **Animations**: `vibesMarqueeHorizontal`, `vibesMarqueeVertical`

