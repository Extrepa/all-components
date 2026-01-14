import { Game } from "../core/Game";
import { Rect } from "../../types";
import { DeviceDetector } from "../core/DeviceDetector";

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
  
  // Track button states for press detection
  private lastFrameButtons: Set<string> = new Set();
  
  constructor(game: Game) {
    this.game = game;
    this.isActive = DeviceDetector.isMobile();
  }
  
  public update(dt: number): void {
    if (!this.isActive) return;
    this.updateLayout();
    this.updateTouchInput();
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
  
  private updateTouchInput(): void {
    // Get all current touches from input system
    // Note: We need to track which touches are on which buttons
    const currentButtons = new Set<string>();
    
    // Reset all virtual buttons first
    this.game.input.setVirtualButton('left', false);
    this.game.input.setVirtualButton('right', false);
    this.game.input.setVirtualButton('jump', false);
    this.game.input.setVirtualButton('attack', false);
    this.game.input.setVirtualButton('magic', false);
    
    // Get touch positions and check against buttons
    const touches = this.game.input.getTouchPositions();
    for (const touch of touches) {
      const button = this.checkTouch(touch.x, touch.y);
      if (button) {
        currentButtons.add(button);
        // Check if this is a new press (wasn't active last frame)
        const wasPressed = !this.lastFrameButtons.has(button);
        this.game.input.setVirtualButton(button, true, wasPressed);
      }
    }
    
    // Update last frame buttons for next frame
    this.lastFrameButtons = new Set(currentButtons);
  }
  
  private checkTouch(touchX: number, touchY: number): string | null {
    // Check discrete buttons first
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
      
      // Dead zone
      const deadZone = 20;
      if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return null;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
      } else if (dy < -deadZone) {
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
    
    // D-pad background (semi-transparent circle)
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

