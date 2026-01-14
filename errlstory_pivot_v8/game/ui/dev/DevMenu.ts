
import { Game } from "../../core/Game";
import { Rect } from "../../../types";
import { DevState } from "../../dev/DevState";

export class DevMenu {
  private game: Game;
  public isActive: boolean = false;
  private devState: DevState;
  
  // APC40-style Layout
  // Calculate: 8 columns * 50px + 7 gaps * 4px + margins = 428 + 30 = 458px
  // Add space for vertical sliders on the right: +70px
  private readonly PANEL_WIDTH = 530;
  private readonly PANEL_HEIGHT = 340;
  private panelX: number = 0;
  private panelY: number = 0;
  
  // Grid Layout (8 columns x 5 rows = 40 buttons, like APC40)
  // Grid height: 5 rows * 50px + 4 gaps * 4px = 250 + 16 = 266px
  // Panel height: 340px, header: 50px, so we have 290px for content
  // Start grid at 60px (10px after header) so it ends at 60 + 266 = 326px (fits in 340px)
  private readonly GRID_COLS = 8;
  private readonly GRID_ROWS = 5;
  private readonly BUTTON_SIZE = 50;
  private readonly BUTTON_GAP = 4;
  private readonly GRID_START_X = 15;
  private readonly GRID_START_Y = 60; // Moved up to fit all buttons in panel
  
  // Vertical Sliders (to the right of grid, inside panel)
  // Grid ends at X: 15 + (8 * 50) + (7 * 4) = 15 + 400 + 28 = 443
  // Panel width: 530px, right margin: 15px, so sliders must end before 515px
  // Slider width: 50px, gap: 5px
  // Slider 2 ends at 515, starts at 465
  // Slider 1 ends at 460, starts at 410
  private readonly SLIDER_START_X = 410; // First slider position
  private readonly SLIDER_GAP = 5; // Gap between sliders
  private readonly SLIDER_START_Y = 60; // Match grid start Y
  private readonly SLIDER_WIDTH = 50; // Height for vertical slider
  private readonly SLIDER_HEIGHT = 200; // Width for vertical slider
  
  private buttons: Array<{ 
    label: string; 
    rect: Rect; 
    action: () => void; 
    getState: () => boolean | number;
    color: string;
    row: number;
    col: number;
    tooltip: string;
  }> = [];
  
  private hoveredButton: { label: string; tooltip: string; x: number; y: number } | null = null;

  constructor(game: Game) {
    this.game = game;
    this.devState = DevState.getInstance();
    this.updateLayout();
    this.setupButtons();
  }

  private updateLayout(): void {
    const { width, height } = this.game;
    this.panelX = (width - this.PANEL_WIDTH) / 2;
    this.panelY = (height - this.PANEL_HEIGHT) / 2;
  }

  private setupButtons(): void {
    this.buttons = [];
    let buttonIndex = 0;

    // Row 0: Dev Mode & Core Toggles (Red/Orange)
    this.addGridButton(0, 0, "DEV MODE", () => {
      this.devState.devModeActive = !this.devState.devModeActive;
      this.game.audio.playSfx('collect');
    }, () => this.devState.devModeActive, "#ff00ff", "Toggle developer mode features");
    
    this.addGridButton(0, 1, "GOD", () => {
      this.devState.godMode = !this.devState.godMode;
      this.game.audio.playSfx('step');
    }, () => this.devState.godMode, "#ff0000", "Invincibility, infinite jumps, no MP costs");
    
    this.addGridButton(0, 2, "INF MP", () => {
      this.devState.infiniteMP = !this.devState.infiniteMP;
      this.game.audio.playSfx('step');
    }, () => this.devState.infiniteMP, "#ff6600", "Unlimited mana, no cooldowns");
    
    this.addGridButton(0, 3, "FREEZE", () => {
      this.devState.freezeAI = !this.devState.freezeAI;
      this.game.audio.playSfx('step');
    }, () => this.devState.freezeAI, "#ff3300", "Pause all enemy AI updates");
    
    this.addGridButton(0, 4, "STUN", () => {
      this.devState.stunAllMobs = !this.devState.stunAllMobs;
      this.game.audio.playSfx('step');
    }, () => this.devState.stunAllMobs, "#ff5500", "Disable all enemy actions");

    // Row 1: Visual Debug (Cyan/Blue)
    this.addGridButton(1, 0, "HITBOX", () => {
      this.devState.showHitboxes = !this.devState.showHitboxes;
      this.game.audio.playSfx('step');
    }, () => this.devState.showHitboxes, "#00ffff", "Show collision boxes for all entities");
    
    this.addGridButton(1, 1, "AI STATE", () => {
      this.devState.showAIState = !this.devState.showAIState;
      this.game.audio.playSfx('step');
    }, () => this.devState.showAIState, "#0099ff", "Display AI state text above enemies");

    // Row 2: Enemy Spawning (Green)
    this.addGridButton(2, 0, "SLIME+", () => {
      const scene = this.game.sceneManager.current;
      if (scene && typeof (scene as any).spawnSlimeAtPlayer === 'function') {
        (scene as any).spawnSlimeAtPlayer();
        this.game.audio.playSfx('step');
      }
    }, () => false, "#00ff00", "Spawn slime at player position");
    
    this.addGridButton(2, 1, "SLIME@", () => {
      const scene = this.game.sceneManager.current;
      if (scene && typeof (scene as any).spawnSlimeAtMouse === 'function') {
        (scene as any).spawnSlimeAtMouse();
        this.game.audio.playSfx('step');
      }
    }, () => false, "#00cc00", "Spawn slime at mouse cursor");
    
    this.addGridButton(2, 2, "BOSS+", () => {
      const scene = this.game.sceneManager.current;
      if (scene && typeof (scene as any).spawnBossAtPlayer === 'function') {
        (scene as any).spawnBossAtPlayer();
        this.game.audio.playSfx('step');
      }
    }, () => false, "#00aa00", "Spawn boss at player position");
    
    this.addGridButton(2, 3, "KILL ALL", () => {
      const scene = this.game.sceneManager.current;
      if (scene && typeof (scene as any).killAllMobs === 'function') {
        (scene as any).killAllMobs();
        this.game.audio.playSfx('step');
      }
    }, () => false, "#ff0000", "Instantly kill all enemies");

    // Row 3: Currency & XP (Yellow/Gold)
    this.addGridButton(3, 0, "+10 GOO", () => {
      this.game.state.goo += 10;
      this.game.audio.playSfx('collect');
    }, () => false, "#ffaa00", "Add 10 goo bits");
    
    this.addGridButton(3, 1, "+100 GOO", () => {
      this.game.state.goo += 100;
      this.game.audio.playSfx('collect');
    }, () => false, "#ff9900", "Add 100 goo bits");
    
    this.addGridButton(3, 2, "+1K GOO", () => {
      this.game.state.goo += 1000;
      this.game.audio.playSfx('collect');
    }, () => false, "#ff8800", "Add 1000 goo bits");
    
    this.addGridButton(3, 3, "+100 XP", () => {
      this.game.gainXp(100);
      this.game.audio.playSfx('collect');
    }, () => false, "#ffdd00", "Add 100 experience points");
    
    this.addGridButton(3, 4, "+1K XP", () => {
      this.game.gainXp(1000);
      this.game.audio.playSfx('collect');
    }, () => false, "#ffcc00", "Add 1000 experience points");
    
    this.addGridButton(3, 5, "LVL UP", () => {
      const pStats = this.game.state.player;
      this.game.state.player.xp = pStats.xpToNext - 1;
      this.game.gainXp(1);
      this.game.audio.playSfx('collect');
    }, () => false, "#ffff00", "Level up immediately");

    // Row 4: Scene Teleporter (Purple/Magenta)
    this.addGridButton(4, 0, "→ TOWN", () => {
      this.game.sceneManager.setScene("town");
      this.game.audio.playSfx('jump');
    }, () => false, "#aa00ff", "Teleport to Town scene");
    
    this.addGridButton(4, 1, "→ FIELD", () => {
      this.game.sceneManager.setScene("field");
      this.game.audio.playSfx('jump');
    }, () => false, "#9900ff", "Teleport to Field scene");
    
    this.addGridButton(4, 2, "→ BOSS", () => {
      this.game.sceneManager.setScene("boss");
      this.game.audio.playSfx('jump');
    }, () => false, "#8800ff", "Teleport to Boss scene");
    
    this.addGridButton(4, 3, "→ DEV", () => {
      this.game.sceneManager.setScene("devroom");
      this.game.audio.playSfx('jump');
    }, () => false, "#ff00ff", "Teleport to Dev Room");
  }

  private addGridButton(row: number, col: number, label: string, action: () => void, getState: () => boolean | number, color: string, tooltip: string): void {
    const x = this.panelX + this.GRID_START_X + col * (this.BUTTON_SIZE + this.BUTTON_GAP);
    const y = this.panelY + this.GRID_START_Y + row * (this.BUTTON_SIZE + this.BUTTON_GAP);
    
    this.buttons.push({
      label,
      rect: {
        x,
        y,
        width: this.BUTTON_SIZE,
        height: this.BUTTON_SIZE
      },
      action,
      getState,
      color,
      row,
      col,
      tooltip
    });
  }

  public toggle(): void {
    this.isActive = !this.isActive;
    this.updateLayout();
    this.setupButtons(); // Recalculate button positions
    this.game.audio.playSfx('step');
  }

  public update(dt: number): void {
    const input = this.game.input;

    // Toggle with ~ (Backquote), `, or F1
    if (input.wasPressed("`") || 
        input.wasPressed("~") || 
        input.wasPressed("Backquote") ||
        input.wasPressed("F1") ||
        (input.isDown("Shift") && input.wasPressed("`"))) {
      this.toggle();
      return;
    }

    if (!this.isActive) return;

    // Close with Esc
    if (input.wasPressed("Escape")) {
      input.consume("Escape");
      this.toggle();
      return;
    }

    // Handle button clicks
    if (input.wasMousePressed) {
      for (const button of this.buttons) {
        if (this.contains(button.rect, input.mouseX, input.mouseY)) {
          button.action();
          return;
        }
      }
      
      // Check slider clicks
      this.handleSliderClick(input.mouseX, input.mouseY);
    }
    
    // Handle slider drag
    if (input.isMouseDown) {
      this.handleSliderDrag(input.mouseX, input.mouseY);
    }
    
    // Check for button hover
    this.hoveredButton = null;
    for (const button of this.buttons) {
      if (this.contains(button.rect, input.mouseX, input.mouseY)) {
        this.hoveredButton = {
          label: button.label,
          tooltip: button.tooltip,
          x: button.rect.x + button.rect.width / 2,
          y: button.rect.y - 5
        };
        break;
      }
    }
  }

  private handleSliderClick(x: number, y: number): void {
    const gravityX = this.panelX + this.SLIDER_START_X;
    const timeX = this.panelX + this.SLIDER_START_X + this.SLIDER_WIDTH + this.SLIDER_GAP;
    const sliderY = this.panelY + this.SLIDER_START_Y;
    const containerWidth = 50;
    const containerHeight = this.SLIDER_HEIGHT + 30;
    const trackY = sliderY + 25;
    const trackHeight = this.SLIDER_HEIGHT;
    
    // Gravity slider (vertical - check if click is in container, then calculate position from track)
    if (x >= gravityX && x <= gravityX + containerWidth &&
        y >= sliderY && y <= sliderY + containerHeight) {
      const relativeY = y - trackY;
      const ratio = Math.max(0, Math.min(1, 1 - (relativeY / trackHeight))); // Invert Y (top = 2.0, bottom = 0.0)
      this.devState.gravityMultiplier = ratio * 2.0; // 0 to 2.0
      this.game.audio.playSfx('step');
    }
    
    // Time scale slider (vertical)
    if (x >= timeX && x <= timeX + containerWidth &&
        y >= sliderY && y <= sliderY + containerHeight) {
      const relativeY = y - trackY;
      const ratio = Math.max(0, Math.min(1, 1 - (relativeY / trackHeight))); // Invert Y (top = 2.0, bottom = 0.0)
      this.devState.timeScale = ratio * 2.0; // 0 to 2.0
      this.game.audio.playSfx('step');
    }
  }

  private handleSliderDrag(x: number, y: number): void {
    this.handleSliderClick(x, y);
  }

  private contains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const { width, height } = this.game;
    this.updateLayout();

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, width, height);

    // Main Panel (APC40 style - dark with metallic look)
    ctx.fillStyle = "#1a1a1a";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 3;
    ctx.fillRect(this.panelX, this.panelY, this.PANEL_WIDTH, this.PANEL_HEIGHT);
    ctx.strokeRect(this.panelX, this.panelY, this.PANEL_WIDTH, this.PANEL_HEIGHT);

    // Title Bar
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(this.panelX, this.panelY, this.PANEL_WIDTH, 50);
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.panelX, this.panelY, this.PANEL_WIDTH, 50);

    // Title
    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("APC40 DEV CONTROLLER", this.panelX + this.PANEL_WIDTH / 2, this.panelY + 8);

    // Instructions (inside header box)
    ctx.fillStyle = "#aaa";
    ctx.font = "9px 'Courier New', monospace";
    ctx.textBaseline = "top";
    ctx.fillText("Press ~ or F1 to toggle | ESC to close", this.panelX + this.PANEL_WIDTH / 2, this.panelY + 32);

    // Render Grid Buttons (APC40 style)
    for (const button of this.buttons) {
      this.renderGridButton(ctx, button);
    }

    // Control Panel (Right Side - Sliders)
    this.renderControlPanel(ctx);
    
    // Render tooltip if hovering over a button
    if (this.hoveredButton) {
      this.renderTooltip(ctx, this.hoveredButton);
    }
  }
  
  private renderTooltip(ctx: CanvasRenderingContext2D, tooltip: { label: string; tooltip: string; x: number; y: number }): void {
    const padding = 8;
    const lineHeight = 14;
    const maxWidth = 200;
    
    // Measure text to determine tooltip size
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "left";
    const metrics = ctx.measureText(tooltip.tooltip);
    const textWidth = Math.min(metrics.width, maxWidth);
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = lineHeight + padding * 2;
    
    // Position tooltip above button, centered
    let tooltipX = tooltip.x - tooltipWidth / 2;
    let tooltipY = tooltip.y - tooltipHeight - 5;
    
    // Keep tooltip within panel bounds
    if (tooltipX < this.panelX + 5) {
      tooltipX = this.panelX + 5;
    }
    if (tooltipX + tooltipWidth > this.panelX + this.PANEL_WIDTH - 5) {
      tooltipX = this.panelX + this.PANEL_WIDTH - tooltipWidth - 5;
    }
    if (tooltipY < this.panelY + 5) {
      tooltipY = tooltip.y + this.BUTTON_SIZE + 5;
    }
    
    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    const radius = 4;
    
    // Rounded rectangle
    ctx.beginPath();
    ctx.moveTo(tooltipX + radius, tooltipY);
    ctx.lineTo(tooltipX + tooltipWidth - radius, tooltipY);
    ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + radius);
    ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - radius);
    ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight, tooltipX + tooltipWidth - radius, tooltipY + tooltipHeight);
    ctx.lineTo(tooltipX + radius, tooltipY + tooltipHeight);
    ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - radius);
    ctx.lineTo(tooltipX, tooltipY + radius);
    ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + radius, tooltipY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Text
    ctx.fillStyle = "#fff";
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(tooltip.tooltip, tooltipX + padding, tooltipY + padding);
  }

  private renderGridButton(ctx: CanvasRenderingContext2D, button: { 
    label: string; 
    rect: Rect; 
    getState: () => boolean | number;
    color: string;
  }): void {
    const state = button.getState();
    const isActive = typeof state === 'boolean' ? state : false;
    
    // Button background (darker when inactive, brighter when active)
    const baseColor = button.color;
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    if (isActive) {
      // Bright when active
      ctx.fillStyle = `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
    } else {
      // Dim when inactive
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
    }
    
    // Rounded rectangle for button
    const radius = 4;
    const x = button.rect.x;
    const y = button.rect.y;
    const w = button.rect.width;
    const h = button.rect.height;
    
    // Manual rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Label text (with two-row support for long labels)
    ctx.fillStyle = isActive ? "#000" : "#fff";
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "center";
    
    // Check if text needs to wrap to two lines
    ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText(button.label);
    const maxWidth = w - 8; // Leave some padding
    
    if (metrics.width > maxWidth) {
      // Split into two lines
      const words = button.label.split(' ');
      let line1 = '';
      let line2 = '';
      
      // Try to split at space
      if (words.length > 1) {
        // Find split point
        let mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(' ');
        line2 = words.slice(mid).join(' ');
        
        // If first line is still too long, try different split
        if (ctx.measureText(line1).width > maxWidth) {
          line1 = words[0];
          line2 = words.slice(1).join(' ');
        }
      } else {
        // Single word - split in middle
        const mid = Math.floor(button.label.length / 2);
        line1 = button.label.substring(0, mid);
        line2 = button.label.substring(mid);
      }
      
      // Render two lines
      ctx.textBaseline = "alphabetic";
      ctx.fillText(line1, x + w / 2, y + h / 2 - 3);
      ctx.fillText(line2, x + w / 2, y + h / 2 + 8);
    } else {
      // Single line
      ctx.textBaseline = "middle";
      ctx.fillText(button.label, x + w / 2, y + h / 2);
    }
  }

  private renderControlPanel(ctx: CanvasRenderingContext2D): void {
    // Render vertical sliders to the right of the grid
    this.renderVerticalSlider(ctx, "GRAVITY", this.SLIDER_START_X, this.SLIDER_START_Y, this.devState.gravityMultiplier, "#00ffff");
    this.renderVerticalSlider(ctx, "TIME SCALE", this.SLIDER_START_X + this.SLIDER_WIDTH + this.SLIDER_GAP, this.SLIDER_START_Y, this.devState.timeScale, "#ff00ff");
  }

  private renderVerticalSlider(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, value: number, color: string): void {
    const sliderX = this.panelX + x;
    const sliderY = this.panelY + y;
    
    // Slider container (button-style background, vertical)
    const containerWidth = 50;
    const containerHeight = this.SLIDER_HEIGHT + 30; // Add space for label and value
    const radius = 4;
    
    // Background (like button inactive state)
    ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Rounded rectangle
    ctx.beginPath();
    ctx.moveTo(sliderX + radius, sliderY);
    ctx.lineTo(sliderX + containerWidth - radius, sliderY);
    ctx.quadraticCurveTo(sliderX + containerWidth, sliderY, sliderX + containerWidth, sliderY + radius);
    ctx.lineTo(sliderX + containerWidth, sliderY + containerHeight - radius);
    ctx.quadraticCurveTo(sliderX + containerWidth, sliderY + containerHeight, sliderX + containerWidth - radius, sliderY + containerHeight);
    ctx.lineTo(sliderX + radius, sliderY + containerHeight);
    ctx.quadraticCurveTo(sliderX, sliderY + containerHeight, sliderX, sliderY + containerHeight - radius);
    ctx.lineTo(sliderX, sliderY + radius);
    ctx.quadraticCurveTo(sliderX, sliderY, sliderX + radius, sliderY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Label (at top)
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, sliderX + containerWidth / 2, sliderY + 12);
    
    // Vertical slider track (inside container)
    const trackX = sliderX + containerWidth / 2 - 2;
    const trackY = sliderY + 25;
    const trackWidth = 4;
    const trackHeight = this.SLIDER_HEIGHT;
    
    ctx.fillStyle = "#333";
    ctx.fillRect(trackX, trackY, trackWidth, trackHeight);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(trackX, trackY, trackWidth, trackHeight);
    
    // Slider value indicator (horizontal bar on vertical track)
    const valuePos = (value / 2.0) * trackHeight; // 0 to 2.0 maps to 0 to trackHeight
    ctx.fillStyle = color;
    ctx.fillRect(trackX - 3, trackY + trackHeight - valuePos - 3, trackWidth + 6, 6);
    
    // Value text (at bottom)
    ctx.fillStyle = "#fff";
    ctx.font = "10px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${value.toFixed(1)}x`, sliderX + containerWidth / 2, sliderY + containerHeight - 12);
  }
}
