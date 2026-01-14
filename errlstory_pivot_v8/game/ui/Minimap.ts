
import { Game } from "../core/Game";
import { Entity } from "../core/Entity";
import { Portal } from "../entities/Portal";

export class Minimap {
  private game: Game;
  private mapWidth: number;
  private mapHeight: number;
  private sceneName: string;
  
  // Display Constraints
  private readonly MAX_WIDTH = 200;
  private readonly MAX_HEIGHT = 100;
  private readonly HEADER_HEIGHT = 24;
  
  // Calculated Dimensions
  private w: number = 0;
  private h: number = 0;
  private scaleX: number = 0;
  private scaleY: number = 0;
  
  // Position on screen
  private readonly X = 20;
  private readonly Y = 20;
  
  // Legend visibility
  private legendVisible: boolean = false;
  private legendFadeTimer: number = 0;
  private readonly LEGEND_FADE_DURATION = 3.0; // 3 seconds to fade

  constructor(game: Game, mapWidth: number, mapHeight: number, sceneName: string) {
    this.game = game;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.sceneName = sceneName;
    this.recalculate();
  }
  
  public setMapSize(width: number, height: number) {
      this.mapWidth = width;
      this.mapHeight = height;
      this.recalculate();
  }

  private recalculate() {
     const ratio = this.mapWidth / this.mapHeight;
     
     // Try fitting to max width
     this.w = this.MAX_WIDTH;
     this.h = this.w / ratio;

     // If too tall, fit to max height
     if (this.h > this.MAX_HEIGHT) {
         this.h = this.MAX_HEIGHT;
         this.w = this.h * ratio;
     }

     this.scaleX = this.w / this.mapWidth;
     this.scaleY = this.h / this.mapHeight;
  }

  public update(dt: number): void {
    const isHovering = this.isHovering();
    
    // Check if clicked
    if (this.game.input.wasMousePressed && isHovering) {
      this.legendFadeTimer = this.LEGEND_FADE_DURATION;
    }
    
    // Update fade timer
    if (this.legendFadeTimer > 0) {
      this.legendFadeTimer -= dt;
    }
    
    // Show legend if hovering OR if fade timer is active
    this.legendVisible = isHovering || this.legendFadeTimer > 0;
  }
  
  private isHovering(): boolean {
    const input = this.game.input;
    const mx = this.X;
    const my = this.Y;
    const totalHeight = this.HEADER_HEIGHT + this.h;
    
    return (
      input.mouseX >= mx &&
      input.mouseX <= mx + this.w &&
      input.mouseY >= my &&
      input.mouseY <= my + totalHeight
    );
  }

  public render(ctx: CanvasRenderingContext2D, player: Entity, portals: Entity[], npcs: Entity[] = []): void {
     const mx = this.X;
     const my = this.Y + this.HEADER_HEIGHT; // Shift map down for header

     ctx.save();
     
     // --- HEADER ---
     // Background
     ctx.fillStyle = "#1a1f2e"; // Dark Blue-ish Grey
     ctx.fillRect(mx, this.Y, this.w, this.HEADER_HEIGHT);
     // Border
     ctx.strokeStyle = "#48f0ff"; // Cyan border to match UI
     ctx.lineWidth = 1;
     ctx.strokeRect(mx, this.Y, this.w, this.HEADER_HEIGHT);
     
     // Text
     ctx.fillStyle = "#fff";
     ctx.font = "bold 11px Inter, system-ui";
     ctx.textAlign = "center";
     ctx.textBaseline = "middle";
     ctx.fillText(this.sceneName, mx + this.w / 2, this.Y + this.HEADER_HEIGHT / 2);

     // --- MAP CONTENT ---
     
     // 1. Background
     ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
     ctx.fillRect(mx, my, this.w, this.h);
     ctx.strokeRect(mx, my, this.w, this.h); // Reuse cyan stroke

     // 2. Portals (Cyan)
     ctx.fillStyle = "#34e1ff";
     for (const p of portals) {
         // Skip invisible portals
         if (p instanceof Portal && p.invisible) continue;
         
         ctx.beginPath();
         // Center of portal
         const px = mx + (p.x + p.width/2) * this.scaleX;
         const py = my + (p.y + p.height/2) * this.scaleY;
         ctx.arc(px, py, 3, 0, Math.PI * 2);
         ctx.fill();
     }

     // 3. NPCs (Gold)
     ctx.fillStyle = "#ffd700";
     for (const n of npcs) {
         ctx.beginPath();
         const nx = mx + (n.x + n.width/2) * this.scaleX;
         const ny = my + (n.y + n.height/2) * this.scaleY;
         ctx.arc(nx, ny, 3, 0, Math.PI * 2);
         ctx.fill();
     }

     // 4. Player (Green)
     ctx.fillStyle = "#00ff00";
     const plx = mx + (player.x + player.width/2) * this.scaleX;
     const ply = my + (player.y + player.height/2) * this.scaleY;
     ctx.beginPath();
     ctx.arc(plx, ply, 2.5, 0, Math.PI * 2);
     ctx.fill();

     // 5. Camera Frame (White outline)
     const cam = this.game.camera;
     const cx = mx + cam.x * this.scaleX;
     const cy = my + cam.y * this.scaleY;
     const cw = cam.width * this.scaleX;
     const ch = cam.height * this.scaleY;
     
     ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
     ctx.lineWidth = 1;
     ctx.strokeRect(cx, cy, cw, ch);
     
     ctx.restore();
     
     // 6. Legend (Below header, only if visible)
     if (this.legendVisible) {
       const legendY = this.Y + this.HEADER_HEIGHT + 2;
       const legendX = mx;
       const legendHeight = 12;
       const itemSpacing = 50; // Horizontal spacing between items
       
       // Calculate fade alpha
       let alpha = 1.0;
       const isHovering = this.isHovering();
       if (this.legendFadeTimer > 0 && !isHovering) {
         alpha = this.legendFadeTimer / this.LEGEND_FADE_DURATION;
       }
       
       ctx.save();
       ctx.globalAlpha = alpha;
       
       // Background for legend
       ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
       ctx.fillRect(legendX, legendY, this.w, legendHeight);
       
       ctx.font = "7px Inter, system-ui";
       ctx.textAlign = "left";
       ctx.textBaseline = "middle";
       
       let currentX = legendX + 4;
       const centerY = legendY + legendHeight / 2;
       
       // Player (Green)
       ctx.fillStyle = "#00ff00";
       ctx.beginPath();
       ctx.arc(currentX, centerY, 2, 0, Math.PI * 2);
       ctx.fill();
       ctx.fillStyle = "#fff";
       ctx.fillText("Player", currentX + 6, centerY);
       currentX += itemSpacing;
       
       // NPCs (Gold)
       ctx.fillStyle = "#ffd700";
       ctx.beginPath();
       ctx.arc(currentX, centerY, 2, 0, Math.PI * 2);
       ctx.fill();
       ctx.fillStyle = "#fff";
       ctx.fillText("NPC", currentX + 6, centerY);
       currentX += itemSpacing;
       
       // Portals (Cyan)
       ctx.fillStyle = "#34e1ff";
       ctx.beginPath();
       ctx.arc(currentX, centerY, 2, 0, Math.PI * 2);
       ctx.fill();
       ctx.fillStyle = "#fff";
       ctx.fillText("Portal", currentX + 6, centerY);
       
       ctx.restore();
     }
  }
}
