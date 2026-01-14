
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";

export class NPC extends Entity {
  private game: Game;
  public name: string;
  public interactionRadius: number = 80;

  // Visual bobbing for markers
  private animationTime: number = 0;

  constructor(game: Game, x: number, y: number, name: string) {
    super(x, y, 32, 32);
    this.game = game;
    this.name = name;
  }

  public update(dt: number): void {
    this.animationTime += dt;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x;
    const cy = this.y;

    // Use QuestSystem for marker
    const markerType = this.game.questSystem.getMarker(this.name);
    let markerColor = "#ffd700"; // Gold
    
    if (markerType === '?') {
        // Check if grey (active but not ready)
        if (this.game.questSystem.isMarkerGrey(this.name)) {
            markerColor = "#aaa";
        }
    }

    // --- Draw NPC Body ---
    ctx.save();
    
    // Body (Sage Green)
    ctx.fillStyle = "#8aa88a";
    ctx.fillRect(cx, cy, this.width, this.height);
    
    // Beard (White)
    ctx.fillStyle = "#eee";
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 20);
    ctx.lineTo(cx + 16, cy + 32);
    ctx.lineTo(cx + 28, cy + 20);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#050811";
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 12, 2, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // --- Draw Marker ---
    if (markerType) {
      const bob = Math.sin(this.animationTime * 4) * 3;
      ctx.font = "bold 24px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = markerColor;
      ctx.fillText(markerType, cx + 16, cy - 10 + bob);
    }

    // Name Tag
    ctx.font = "10px Inter, system-ui";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(this.name, cx + 16, cy + 45);

    ctx.restore();
  }
}
