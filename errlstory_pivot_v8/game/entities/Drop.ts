
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";
import { Rect } from "../../types";

export type DropType = 'GOO' | 'POTION';

export class Drop extends Entity {
  private game: Game;
  public type: DropType;
  public value: number; // Amount of currency or item count
  public isCollected: boolean = false;
  
  private bounceCount: number = 0;
  private lifeTime: number = 15.0; // Despawn time
  private animationTime: number = 0;

  private readonly GRAVITY = 1000;

  constructor(game: Game, x: number, y: number, type: DropType, value: number = 1) {
    super(x, y, 16, 16);
    this.game = game;
    this.type = type;
    this.value = value;
    
    // Initial Pop
    this.vy = -300 - Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 200;
  }

  public update(dt: number, platforms: Rect[]): void {
    this.lifeTime -= dt;
    this.animationTime += dt;

    // Physics
    this.vy += this.GRAVITY * dt;
    this.x += this.vx * dt;
    
    // Friction
    this.vx *= 0.98;

    this.handleCollisionsY(platforms);
    this.y += this.vy * dt;

    // Boundary check
    if (this.y > 800) this.isCollected = true; // Remove if falls out of world
  }

  private handleCollisionsY(platforms: Rect[]): void {
    // Simple point/box check for floor
    const bounds = this.getBounds();
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        if (this.vy > 0) {
            // Bounce
            this.y = p.y - this.height;
            this.vy = -this.vy * 0.5; // Lose 50% energy
            this.vx *= 0.8; // Ground friction
            
            if (Math.abs(this.vy) < 50) {
                this.vy = 0;
            }
        }
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
    const cy = this.y + Math.sin(this.animationTime * 5) * 3; // Float effect
    
    ctx.save();
    
    // Blink if despawning
    if (this.lifeTime < 3 && Math.floor(this.animationTime * 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    if (this.type === 'GOO') {
        ctx.fillStyle = "#ff8ef5";
        ctx.beginPath();
        ctx.arc(this.x + 8, cy + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
    } else if (this.type === 'POTION') {
        // Red Bottle
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(this.x + 4, cy + 6, 8, 10); // Body
        ctx.fillStyle = "#ccc";
        ctx.fillRect(this.x + 6, cy + 2, 4, 4); // Neck
        
        // White Cross
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x + 7, cy + 8, 2, 6);
        ctx.fillRect(this.x + 5, cy + 10, 6, 2);
    }

    ctx.restore();
  }
}
