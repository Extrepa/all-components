
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";

export class Portal extends Entity {
  public destination: string; // Scene name
  public label: string;
  private animationTime: number = 0;
  private color: string;
  public invisible: boolean = false;

  constructor(x: number, y: number, destination: string, label: string, color: string = "#34e1ff", invisible: boolean = false) {
    super(x, y, 60, 90); // Size
    this.destination = destination;
    this.label = label;
    this.color = color;
    this.invisible = invisible;
  }

  public update(dt: number): void {
     this.animationTime += dt;
  }

  public render(ctx: CanvasRenderingContext2D): void {
     // Skip rendering if invisible
     if (this.invisible) return;
     
     const cx = this.x + this.width / 2;
     const cy = this.y + this.height / 2;
     
     ctx.save();
     
     // Glow
     ctx.shadowColor = this.color;
     ctx.shadowBlur = 20 + Math.sin(this.animationTime * 3) * 10;
     
     // Portal Shape (Oval)
     ctx.beginPath();
     ctx.ellipse(cx, cy, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
     ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
     ctx.fill();
     
     // Rings
     ctx.strokeStyle = this.color;
     ctx.lineWidth = 3;
     ctx.stroke();
     
     // Inner swirling effect
     ctx.save();
     ctx.clip(); // Clip drawing to the oval
     
     const time = this.animationTime;
     ctx.strokeStyle = "#fff";
     ctx.globalAlpha = 0.3;
     
     for(let i=0; i<3; i++) {
        const offset = i * 2;
        const yPos = cy + Math.sin(time * 2 + offset) * (this.height/2);
        const w = (this.width/2) * Math.cos(time * 2 + offset); // Pseudo 3D rotation
        
        ctx.beginPath();
        ctx.ellipse(cx, yPos, Math.abs(w), 5, 0, 0, Math.PI * 2);
        ctx.stroke();
     }
     
     ctx.restore(); // End Clip
     
     // Label text (floating above)
     ctx.shadowBlur = 0;
     // Apply slime green tint to "Slimey Hills" text
     if (this.label.includes("Slimey Hills")) {
       ctx.fillStyle = "#48f0ff"; // Slime green/cyan color
     } else {
       ctx.fillStyle = "#fff";
     }
     ctx.font = "bold 12px Inter, system-ui";
     ctx.textAlign = "center";
     ctx.fillText(this.label, cx, this.y - 15 + Math.sin(time * 4) * 3);
     
     ctx.restore();
  }
}
