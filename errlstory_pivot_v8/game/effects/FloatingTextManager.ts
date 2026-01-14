import { Game } from "../core/Game";

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // Seconds remaining
  vy: number;   // Vertical velocity
  opacity: number;
  isCrit?: boolean;
  bounceOffset: number;
  bounceTimer: number;
  scale: number;
}

export class FloatingTextManager {
  private texts: FloatingText[] = [];
  private nextId = 0;

  constructor() {}

  public spawn(x: number, y: number, text: string, color: string = "#fff", isCrit: boolean = false): void {
    this.texts.push({
      id: this.nextId++,
      x,
      y,
      text,
      color: isCrit ? "#ffcc00" : color, // Yellow for crits
      life: 0.8, // Lasts 0.8 seconds
      vy: isCrit ? -80 : -50, // Faster upward movement for crits
      opacity: 1.0,
      isCrit,
      bounceOffset: 0,
      bounceTimer: 0,
      scale: isCrit ? 1.3 : 1.0,
    });
  }

  public update(dt: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.opacity = Math.max(0, t.life / 0.8); // Fade out

      // Crit bounce/wiggle animation
      if (t.isCrit) {
        t.bounceTimer += dt * 20; // Animation speed
        t.bounceOffset = Math.sin(t.bounceTimer) * 5; // Wiggle amount
        // Scale pulse: start at 1.3, fade to 1.0
        t.scale = 1.0 + (0.3 * (t.life / 0.8));
      }

      if (t.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.textAlign = "center";
    
    for (const t of this.texts) {
      ctx.globalAlpha = t.opacity;
      
      // Apply scale and bounce offset for crits
      const renderX = t.x + (t.isCrit ? t.bounceOffset : 0);
      const fontSize = t.isCrit ? 18 : 14; // Larger font for crits
      ctx.font = `bold ${fontSize}px Inter, system-ui`;
      
      // Scale transform for crits
      if (t.isCrit && t.scale !== 1.0) {
        ctx.save();
        ctx.translate(renderX, t.y);
        ctx.scale(t.scale, t.scale);
        ctx.translate(-renderX, -t.y);
      }
      
      // Outline
      ctx.strokeStyle = "black";
      ctx.lineWidth = t.isCrit ? 4 : 3; // Thicker outline for crits
      ctx.strokeText(t.text, renderX, t.y);

      // Fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, renderX, t.y);
      
      if (t.isCrit && t.scale !== 1.0) {
        ctx.restore();
      }
    }
    
    ctx.restore();
  }
}