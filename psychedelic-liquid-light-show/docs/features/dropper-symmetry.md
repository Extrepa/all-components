# Dropper & Symmetry Feature

## Overview

The dropper and kaleidoscope symmetry system provides a dramatically improved liquid light show experience with:
- **Dropper mode** as the main interaction (hold to grow drops that feel like they're about to fall off)
- **True kaleidoscope symmetry** with 2-12 way mirroring for trippy mandala patterns  
- **Enhanced physics** for stronger "push-away" feel when colors layer
- Beautiful preview circles and crosshair overlays

## Features

### 1. Core Interaction: Dropper Mode

**Default behavior** (enabled out of the box):
- **Quick tap**: Small drop (1% of canvas width)
- **Hold for 1.2s**: Drop grows to **25% of canvas** (expanded from 15%) with smooth ease-out curve
- **Live preview**: White glowing circle shows growth in real-time
- **Release**: Commits drop at release position

**Configurable settings**:
- Min size: 0.5% - 15% of canvas
- Max size: 1% - 25% of canvas  
- Growth time: 0.5s - 2s
- Easing: Linear, Ease-in, Ease-out (default), Ease-in-out
- Preview circle: on/off toggle
- **Reaction multiplier**: Inverse relationship where smaller drops create bigger reactions (default: 2.0x)

### 2. Symmetry / Kaleidoscope

**Create trippy mandalas**:
- **2, 4, 6, 8, or 12-way** symmetry
- **Mirror toggle**: True kaleidoscope (mirrored wedges) or simple rotation
- **Rotation offset**: 0-360° to rotate the entire pattern
- **Custom origin**: Click "Set Origin" button, then click canvas to reposition center
- **Visual feedback**: Crosshair overlay shows symmetry origin when enabled

**How it works**:
- Every drop is automatically duplicated across all symmetric points
- Math uses polar coordinates with kaleidoscope folding algorithm
- Works with both WebGL and Canvas2D renderers

### 3. Optional Modes

**Drip mode** (opt-in):
- Emits micro-drops continuously while holding
- Interval: 60-300ms (default 140ms)
- Respects symmetry settings
- Perfect for creating trails

**Line mode** (opt-in):
- Continuous drawing with existing brush patterns
- Uses all the original patterns (single, polkadots, stripes, spray, etc.)
- For when you want to paint freely

### 4. Enhanced Physics

**Stronger "push-away" feel**:
- Surface tension: 0.5 → **0.6** (+0.1)
- Gravity strength: 0.4 → **0.5** (+0.1)
- Viscosity: 0.2 → **0.18** (-0.02 for livelier motion)

**Inverse Reaction Physics**:
- Smaller drops create bigger reactions (more force, particles, visual spread)
- Formula: `reactionStrength = dropReactionMultiplier * (1 / (normalizedSize + 0.1))`
- Configurable multiplier (default: 2.0)

Result: Colors visibly push each other away and separate more dramatically!

## UI Controls

### BrushPanel Sections

#### 💧 Dropper Mode (Purple section, top)
- **Mode buttons**: Single Drop | Drip | Line
- **Min Size slider**: Shows as percentage
- **Max Size slider**: Shows as percentage  
- **Growth Time slider**: Shows in seconds
- **Growth Easing dropdown**: 4 easing options
- **Reaction Multiplier slider**: Controls inverse reaction strength
- **Preview checkbox**: Toggle preview circle

#### ✨ Symmetry (Pink section, below dropper)
- **Enable toggle**: Turn symmetry on/off
- **Count buttons**: 2, 4, 6, 8, 12
- **Mirror checkbox**: True kaleidoscope vs simple rotation
- **Rotation slider**: 0-360°
- **Set Origin button** (🎯): Activates origin-setting mode

## User Experience

### Dropper Workflow
1. **Click canvas**: Small drop appears instantly
2. **Click & hold**: Watch preview circle grow smoothly
3. **Release**: Drop commits at current size
4. **Move while holding**: Preview follows your pointer (no trail)

### Symmetry Workflow  
1. **Enable symmetry** in BrushPanel
2. **Choose count** (try 6 or 8 for mandalas)
3. **Enable mirror** for true kaleidoscope
4. **Drop anywhere**: Instantly duplicated across all mirrors!
5. **(Optional) Set origin**: Click button, then click canvas to move center

### Setting Symmetry Origin
1. Click **"Set Origin Point"** button
2. Cursor changes to crosshair
3. Canvas shows instruction overlay
4. Click anywhere on canvas to set new origin
5. Press **ESC** to cancel
6. Crosshair overlay appears at origin when symmetry is on

## Technical Details

### Easing Functions
```typescript
linear(t)       // Constant speed
easeIn(t)       // Accelerate
easeOut(t)      // Decelerate (default, feels natural)
easeInOut(t)    // S-curve (smooth start and end)
```

### Symmetry Algorithm
```typescript
1. Translate point to origin-relative coordinates
2. Convert to polar (r, θ)
3. Apply rotation offset
4. Fold angle within wedge if mirror=true
5. Generate N rotated copies
6. Convert back to Cartesian
7. Clamp to canvas bounds
```

### Inverse Reaction Physics
```typescript
// Calculate reaction strength based on drop size
const normalizedSize = (radius - minRadius) / (maxRadius - minRadius); // 0 to 1
const reactionStrength = dropReactionMultiplier * (1 / (normalizedSize + 0.1));

// Applied to:
// - Canvas2D: Particle count, velocity, visual radius
// - WebGL: Thickness (force), visual radius
```

### Pointer Flow
```
Down → Check mode
  ├─ Origin setting? → Set origin, exit
  ├─ Dropper? → Start timer, show preview
  ├─ Drip? → Start interval timer
  └─ Line? → Begin continuous splat

Move → Update preview position

Up → Finalize
  ├─ Dropper? → Calculate size, apply symmetry, splat all points
  ├─ Drip? → Clear interval
  └─ Line? → Commit stroke history
```

## Default Settings

```typescript
// Dropper (main mode)
dropperEnabled: true
dropMinRadius: 0.01  // 1%
dropMaxRadius: 0.25  // 25% (expanded from 15%)
dropTimeToMaxMs: 1200
dropEasing: 'ease-out'
dropPreview: true
dropReactionMultiplier: 2.0  // Inverse reaction strength

// Optional modes (off)
dripEnabled: false
dripIntervalMs: 140
lineEnabled: false

// Symmetry (off by default)
symmetryEnabled: false
symmetryCount: 6
symmetryMirror: true
symmetryRotationDeg: 0
symmetryOrigin: { x: 0.5, y: 0.5 }

// Enhanced physics
surfaceTension: 0.6   // was 0.5
gravityStrength: 0.5  // was 0.4
viscosity: 0.18       // was 0.2
```

## Usage Examples

### Classic Oil Drop
- Dropper mode (default)
- No symmetry
- Hold 1-2 seconds for big drops
- Watch colors push each other away!

### Hexagonal Mandala
- Enable symmetry
- Count: 6
- Mirror: ON
- Drop in different spots to build complex patterns

### 12-Way Kaleidoscope
- Enable symmetry
- Count: 12
- Mirror: ON
- Rotation: slowly slide from 0→360° while dropping

### Rotating Drip Pattern
- Drip mode
- Enable symmetry (4 or 8)
- Move pointer in circles while held
- Creates spirograph-like trails

### Off-Center Vortex
- Enable symmetry (6)
- Click "Set Origin"
- Click near edge of canvas
- Drop colors near opposite edge
- Creates swirling asymmetric mandala

## Files

### Core Implementation
- `types.ts`: Config fields for dropper & symmetry
- `constants.ts`: Default values
- `utils/easing.ts`: Easing functions
- `utils/symmetry.ts`: Kaleidoscope algorithm
- `components/LiquidCanvas.tsx`: Pointer handlers and preview
- `components/controls/BrushPanel.tsx`: UI controls

### Related Features
- See [3D Dropper](./3d-dropper.md) for the 3D visual dropper implementation

## Edge Cases Handled

✅ Pointer capture for smooth tracking  
✅ Cancel drip timer on pointer leave  
✅ ESC key exits origin mode  
✅ Min/Max size constraints enforced  
✅ Symmetry points clamped to canvas bounds  
✅ Preview only shows when preview=true  
✅ Crosshair only shows when symmetry=true  
✅ Mode switches properly reset state  
✅ Works with both WebGL and Canvas2D  
✅ Device pixel ratio respected

## Mobile Support

✅ Works with touch events (pointer events abstraction)  
✅ Smooth 60 FPS preview animation  
✅ Pointer capture prevents scroll while drawing  
✅ Responsive UI with proper hit targets  
✅ Preview circle scales with canvas

