# Mobile Controls Implementation Plan

## Overview
Add mobile device detection and on-screen touch controls for movement when a mobile device is detected. This will allow the game to be playable on touchscreen devices.

**Estimated Total Time**: 4-6 hours
**Priority**: Medium
**Impact**: High (enables mobile playability)

---

## Feature Requirements

### Core Functionality
1. **Device Detection**: Detect if running on mobile/touchscreen device
2. **Control Overlay**: Display on-screen virtual controls
3. **Touch Input**: Handle touch events for movement and actions
4. **Mode Toggle**: Allow switching between touch and keyboard modes
5. **Layout Adaptation**: Adjust UI layout for mobile screens

---

## Implementation Steps

### Step 1: Device Detection System

#### 1.1: Create Device Detection Utility
**File**: `game/core/DeviceDetector.ts` (new file)

**Purpose**: Detect if running on mobile device

**Implementation**:
```typescript
export class DeviceDetector {
  public static isMobile(): boolean {
    // Check user agent
    const ua = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size (optional, for tablets)
    const isSmallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(ua) || (hasTouch && isSmallScreen);
  }
  
  public static isTablet(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /ipad|android(?!.*mobile)|tablet/i.test(ua);
  }
}
```

**Key Points**:
- Check user agent for mobile devices
- Check for touch support
- Optional: Check screen size
- Return boolean for mobile/tablet detection

---

### Step 2: Touch Input System

#### 2.1: Extend Input System
**File**: `game/core/Input.ts`

**Changes Needed**:
- Add touch event listeners
- Track touch positions
- Convert touch positions to virtual button states
- Support multiple touch points

**New Properties**:
```typescript
export class Input {
  // ... existing properties
  
  // Touch state
  private touches: Map<number, { x: number; y: number }> = new Map();
  public touchX: number = 0;
  public touchY: number = 0;
  
  // Virtual button states (from touch controls)
  public virtualLeft: boolean = false;
  public virtualRight: boolean = false;
  public virtualJump: boolean = false;
  public virtualAttack: boolean = false;
  public virtualMagic: boolean = false;
}
```

**New Methods**:
```typescript
private setupTouchListeners(): void {
  this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
  this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
  this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
}

private handleTouchStart(e: TouchEvent): void {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
  }
  this.updateVirtualButtons();
}

private handleTouchMove(e: TouchEvent): void {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
  }
  this.updateVirtualButtons();
}

private handleTouchEnd(e: TouchEvent): void {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    this.touches.delete(touch.identifier);
  }
  this.updateVirtualButtons();
}
```

---

### Step 3: Virtual Control Overlay

#### 3.1: Create TouchControls UI
**File**: `game/ui/TouchControls.ts` (new file)

**Purpose**: Render and manage on-screen virtual controls

**Layout**:
```
[Left] [Right] [Jump]          [Attack] [Magic]
```

**Implementation**:
```typescript
export class TouchControls {
  private game: Game;
  public isActive: boolean = false;
  
  // Control button definitions
  private leftButton: Rect = { x: 0, y: 0, width: 60, height: 60 };
  private rightButton: Rect = { x: 0, y: 0, width: 60, height: 60 };
  private jumpButton: Rect = { x: 0, y: 0, width: 60, height: 60 };
  private attackButton: Rect = { x: 0, y: 0, width: 60, height: 60 };
  private magicButton: Rect = { x: 0, y: 0, width: 60, height: 60 };
  
  // D-pad area (left side)
  private dpadArea: Rect = { x: 0, y: 0, width: 200, height: 200 };
  
  constructor(game: Game) {
    this.game = game;
    this.isActive = DeviceDetector.isMobile();
  }
  
  public update(dt: number): void {
    if (!this.isActive) return;
    this.updateLayout();
  }
  
  private updateLayout(): void {
    const { width, height } = this.game;
    const margin = 20;
    const buttonSize = 60;
    const buttonGap = 10;
    
    // Left side: D-pad area (movement)
    this.dpadArea = {
      x: margin,
      y: height - margin - 200,
      width: 200,
      height: 200
    };
    
    // Movement buttons (within D-pad area)
    this.leftButton = {
      x: this.dpadArea.x + 20,
      y: this.dpadArea.y + 70,
      width: buttonSize,
      height: buttonSize
    };
    
    this.rightButton = {
      x: this.dpadArea.x + 100,
      y: this.dpadArea.y + 70,
      width: buttonSize,
      height: buttonSize
    };
    
    this.jumpButton = {
      x: this.dpadArea.x + 60,
      y: this.dpadArea.y + 20,
      width: buttonSize,
      height: buttonSize
    };
    
    // Right side: Action buttons
    const rightStartX = width - margin - (buttonSize * 2) - buttonGap;
    this.attackButton = {
      x: rightStartX,
      y: height - margin - buttonSize,
      width: buttonSize,
      height: buttonSize
    };
    
    this.magicButton = {
      x: rightStartX + buttonSize + buttonGap,
      y: height - margin - buttonSize,
      width: buttonSize,
      height: buttonSize
    };
  }
  
  public checkTouch(touchX: number, touchY: number): string | null {
    // Check which button was touched
    if (this.contains(this.leftButton, touchX, touchY)) return 'left';
    if (this.contains(this.rightButton, touchX, touchY)) return 'right';
    if (this.contains(this.jumpButton, touchX, touchY)) return 'jump';
    if (this.contains(this.attackButton, touchX, touchY)) return 'attack';
    if (this.contains(this.magicButton, touchX, touchY)) return 'magic';
    
    // Check D-pad area for analog-style movement
    if (this.contains(this.dpadArea, touchX, touchY)) {
      const centerX = this.dpadArea.x + this.dpadArea.width / 2;
      const centerY = this.dpadArea.y + this.dpadArea.height / 2;
      const dx = touchX - centerX;
      const dy = touchY - centerY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
      } else if (dy < 0) {
        return 'jump';
      }
    }
    
    return null;
  }
  
  private contains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
  
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
    ctx.save();
    
    // D-pad background (semi-transparent)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(
      this.dpadArea.x + this.dpadArea.width / 2,
      this.dpadArea.y + this.dpadArea.height / 2,
      this.dpadArea.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Movement buttons
    this.renderButton(ctx, this.leftButton, "←", this.game.input.virtualLeft);
    this.renderButton(ctx, this.rightButton, "→", this.game.input.virtualRight);
    this.renderButton(ctx, this.jumpButton, "↑", this.game.input.virtualJump);
    
    // Action buttons
    this.renderButton(ctx, this.attackButton, "Z", this.game.input.virtualAttack);
    this.renderButton(ctx, this.magicButton, "X", this.game.input.virtualMagic);
    
    ctx.restore();
  }
  
  private renderButton(ctx: CanvasRenderingContext2D, rect: Rect, label: string, isPressed: boolean): void {
    // Button background
    ctx.fillStyle = isPressed ? "rgba(52, 225, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Button border
    ctx.strokeStyle = isPressed ? "#34e1ff" : "#888";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Button label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      label,
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );
  }
}
```

---

### Step 4: Integrate Touch Controls with Input System

#### 4.1: Update Input System
**File**: `game/core/Input.ts`

**Changes**:
- Add virtual button state tracking
- Update `isDown()` to check virtual buttons
- Update `wasPressed()` to check virtual button presses
- Integrate with TouchControls

**Code Changes**:
```typescript
public isDown(key: string): boolean {
  // Check keyboard
  if (this.keys.has(key)) return true;
  
  // Check virtual buttons (mobile)
  if (key === "ArrowLeft" || key === "a" || key === "A") {
    return this.virtualLeft;
  }
  if (key === "ArrowRight" || key === "d" || key === "D") {
    return this.virtualRight;
  }
  if (key === " " || key === "ArrowUp" || key === "w" || key === "W") {
    return this.virtualJump;
  }
  if (key === "z" || key === "Z" || key === "k" || key === "K") {
    return this.virtualAttack;
  }
  if (key === "x" || key === "X" || key === "l" || key === "L") {
    return this.virtualMagic;
  }
  
  return false;
}

public wasPressed(key: string): boolean {
  // Similar logic for wasPressed
  // Track previous frame state to detect presses
}
```

---

### Step 5: Add to Game Class

#### 5.1: Initialize Touch Controls
**File**: `game/core/Game.ts`

**Changes**:
- Import TouchControls
- Initialize if mobile detected
- Update and render in game loop

**Code Changes**:
```typescript
import { TouchControls } from "../ui/TouchControls";
import { DeviceDetector } from "./DeviceDetector";

export class Game {
  // ... existing properties
  public touchControls: TouchControls;
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // ... existing initialization
    
    // Initialize touch controls if mobile
    if (DeviceDetector.isMobile()) {
      this.touchControls = new TouchControls(this);
    }
  }
  
  public update(dt: number): void {
    // ... existing update code
    
    // Update touch controls
    if (this.touchControls) {
      this.touchControls.update(dt);
    }
  }
  
  public render(): void {
    // ... existing render code
    
    // Render touch controls (on top)
    if (this.touchControls) {
      this.touchControls.render(ctx);
    }
  }
}
```

---

### Step 6: Mode Toggle (Optional)

#### 6.1: Add Settings Toggle
**File**: `game/core/Game.ts` or new `Settings.ts`

**Purpose**: Allow users to manually enable/disable touch controls

**Implementation**:
- Add setting in GameState: `useTouchControls: boolean`
- Toggle via settings menu or key press
- Persist in save data

**Code**:
```typescript
// In GameState
interface GameState {
  // ... existing state
  settings: {
    useTouchControls: boolean;
  };
}

// Toggle method
public toggleTouchControls(): void {
  this.state.settings.useTouchControls = !this.state.settings.useTouchControls;
  if (this.touchControls) {
    this.touchControls.isActive = this.state.settings.useTouchControls;
  }
}
```

---

## Alternative: Analog-Style Movement

### Option A: Virtual Joystick
Instead of discrete buttons, use a virtual joystick for smoother movement:

**Layout**:
- Left side: Joystick area (circular)
- Right side: Action buttons

**Implementation**:
- Track touch position within joystick area
- Calculate direction and intensity
- Map to movement velocity

**Pros**:
- More intuitive for movement
- Smoother control
- Better for platforming

**Cons**:
- More complex implementation
- Requires dead zone handling

---

## UI/UX Considerations

### Visual Design
- **Semi-transparent**: Controls shouldn't obstruct gameplay
- **Clear labels**: Icons or text for each button
- **Visual feedback**: Highlight when pressed
- **Size**: Large enough for easy tapping (minimum 44x44px)

### Layout
- **Left side**: Movement controls (D-pad or joystick)
- **Right side**: Action buttons (Attack, Magic, Jump)
- **Bottom**: Quick slots (if needed)
- **Avoid center**: Don't block important game elements

### Responsive Design
- **Adapt to screen size**: Scale controls based on viewport
- **Portrait/Landscape**: Adjust layout for orientation
- **Safe areas**: Account for notches/home indicators

---

## Testing Checklist

### Device Testing
- [ ] Test on actual mobile devices (iOS, Android)
- [ ] Test on tablets
- [ ] Test in different orientations
- [ ] Test with different screen sizes

### Functionality Testing
- [ ] Movement works correctly
- [ ] Jump works
- [ ] Attack works
- [ ] Magic works
- [ ] All buttons are tappable
- [ ] No input lag
- [ ] Controls don't interfere with gameplay

### Edge Cases
- [ ] Multiple touches handled correctly
- [ ] Touch outside controls doesn't break game
- [ ] Switching between keyboard and touch works
- [ ] Save/load preserves settings

---

## Performance Considerations

### Optimization
- **Event prevention**: Prevent default touch behaviors (scroll, zoom)
- **Touch event throttling**: Limit update frequency if needed
- **Render optimization**: Only render when active
- **Memory**: Clean up touch state properly

### Code Changes
```typescript
// Prevent default touch behaviors
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });
```

---

## Implementation Order

### Phase 1: Basic Detection & Controls (2-3 hours)
1. Device detection utility
2. Basic touch input handling
3. Simple button overlay
4. Integrate with existing input system

### Phase 2: Polish & UX (1-2 hours)
1. Better visual design
2. Analog-style movement (optional)
3. Settings toggle
4. Layout optimization

### Phase 3: Testing & Refinement (1 hour)
1. Device testing
2. Bug fixes
3. Performance optimization
4. Documentation

---

## Known Challenges

### Challenge 1: Touch Event Handling
- **Issue**: Touch events work differently than mouse events
- **Solution**: Use TouchEvent API, track multiple touches
- **Consideration**: Handle touch cancellation

### Challenge 2: Screen Size Variation
- **Issue**: Controls need to work on various screen sizes
- **Solution**: Use percentage-based positioning, scale controls
- **Consideration**: Minimum/maximum sizes

### Challenge 3: Input Lag
- **Issue**: Touch input might feel laggy
- **Solution**: Optimize touch event handling, use requestAnimationFrame
- **Consideration**: Test on lower-end devices

### Challenge 4: Accidental Touches
- **Issue**: Touches outside controls might trigger unwanted actions
- **Solution**: Only process touches within control areas
- **Consideration**: Dead zones, touch area boundaries

---

## Future Enhancements

### Potential Additions
- **Haptic feedback**: Vibration on button press
- **Gesture support**: Swipe for dash, pinch for zoom
- **Customizable layout**: Let users move buttons
- **Button size adjustment**: Settings for control size
- **Multi-touch gestures**: Two-finger actions

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Mobile device detection works
- [ ] Touch controls appear on mobile
- [ ] Movement works via touch
- [ ] Attack and magic work via touch
- [ ] Controls are visible and usable

### Phase 2 Complete When:
- [ ] Controls look polished
- [ ] Layout adapts to screen size
- [ ] Settings toggle works
- [ ] No performance issues
- [ ] Works on multiple devices

---

## Notes

### Design Decisions
- **Button-based**: Simpler than joystick, easier to implement
- **Fixed positions**: Easier than customizable, less complexity
- **Semi-transparent**: Balance between visibility and obstruction

### Technical Notes
- Touch events must prevent default to avoid scrolling
- Need to handle touch cancellation
- Multiple touches need tracking
- Coordinate conversion (screen to canvas)

### Compatibility
- **iOS Safari**: Full support
- **Android Chrome**: Full support
- **Other browsers**: May need testing
- **Desktop with touch**: Should work but keyboard preferred

---

**Created**: Mobile controls implementation plan
**Status**: Ready for Implementation
**Estimated Completion**: 4-6 hours

