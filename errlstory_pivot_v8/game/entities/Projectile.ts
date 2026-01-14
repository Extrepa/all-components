
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";
import { Rect } from "../../types";

export class Projectile extends Entity {
  private game: Game;
  public damage: number;
  public isDead: boolean = false;
  
  private lifeTime: number = 0.8; // Range limit
  private animationTime: number = 0;

  constructor(game: Game, x: number, y: number, direction: number, damage: number) {
    super(x, y, 20, 20);
    this.game = game;
    this.damage = damage;
    this.vx = direction * 600; // Fast!
  }

  public update(dt: number, platforms: Rect[]): void {
    this.lifeTime -= dt;
    this.animationTime += dt;

    if (this.lifeTime <= 0) {
      this.isDead = true;
      return;
    }

    this.x += this.vx * dt;

    // Wall Collision
    const bounds = this.getBounds();
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        this.isDead = true;
        this.game.particles.emit('spark', this.x, this.y, 3);
        return;
      }
    }
  }

  private aabb(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    
    // Tail effect (simple transparency trail)
    ctx.shadowColor = "#34e1ff";
    ctx.shadowBlur = 15;
    
    // Core
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Outer Glow
    ctx.strokeStyle = "#34e1ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8 + Math.sin(this.animationTime * 20) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
