
import { NPC } from "./NPC";
import { Game } from "../core/Game";

export class Merchant extends NPC {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, "Merchant Mira");
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x;
    const cy = this.y;

    // --- Draw Merchant Body ---
    ctx.save();
    
    // Robes (Purple)
    ctx.fillStyle = "#6d28d9";
    ctx.fillRect(cx, cy, this.width, this.height);
    
    // Sash (Gold)
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(cx, cy + 20, this.width, 4);

    // Hat (Pointy)
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + this.width + 5, cy); // Brim
    ctx.lineTo(cx + this.width / 2, cy - 20); // Tip
    ctx.fillStyle = "#4c1d95";
    ctx.fill();

    // "M" on hat
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 10px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("M", cx + 16, cy - 2);

    // Eyes
    ctx.fillStyle = "#050811";
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 12, 2, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // Interaction Marker
    const bob = Math.sin(Date.now() / 200) * 3;
    ctx.font = "bold 14px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("$", cx + 16, cy - 10 + bob);

    // Name Tag
    ctx.font = "10px Inter, system-ui";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(this.name, cx + 16, cy + 45);

    ctx.restore();
  }
}
