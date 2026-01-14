
import { Mob } from "./Mob";
import { Game } from "../core/Game";
import { Rect } from "../../types";

export class Slime extends Mob {
  private game: Game;
  
  // Physics
  private readonly SPEED = 40;
  private readonly GRAVITY = 1000;
  
  // AI State
  private direction: number = 1; // 1 = right, -1 = left
  private patrolTimer: number = 0;
  private animationTime: number = 0;

  constructor(game: Game, x: number, y: number) {
    super(x, y, 32, 24, 30); // 30 HP
    this.id = "slime";
    this.game = game;
    
    // Rewards
    this.xpValue = 15;
    this.gooValue = 5;
  }

  public update(dt: number, platforms: Rect[]): void {
    super.update(dt, platforms);
    if (this.isDead) return;

    this.animationTime += dt;

    // --- AI: Dumb Patrol ---
    // Just walk. If we hit a wall (velocity becomes 0), flip.
    
    // Apply Gravity
    this.vy += this.GRAVITY * dt;
    
    // Move
    this.vx = this.SPEED * this.direction;
    
    this.x += this.vx * dt;
    this.handleCollisionsX(platforms);
    
    this.y += this.vy * dt;
    this.handleCollisionsY(platforms);

    // If we stopped moving horizontally, we hit a wall, so flip
    if (Math.abs(this.vx) < 0.1) {
      this.direction *= -1;
    }
  }

  private handleCollisionsX(platforms: Rect[]): void {
    const bounds = this.getBounds();
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        if (this.vx > 0) {
          this.x = p.x - this.width;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = p.x + p.width;
          this.vx = 0;
        }
      }
    }
  }

  private handleCollisionsY(platforms: Rect[]): void {
    const bounds = this.getBounds();
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        if (this.vy > 0) {
          this.y = p.y - this.height;
          this.vy = 0;
        } else if (this.vy < 0) {
          this.y = p.y + p.height;
          this.vy = 0;
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
    if (this.isDead) return;

    const centerX = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Bounce animation
    const bounce = Math.sin(this.animationTime * 8) * 4;
    
    ctx.save();
    
    // Hit flash
    if (this.invulnTimer > 0) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "#48f0ff"; // Slime Blue
    }

    // Draw Slime Body (Semi-circle ish)
    ctx.beginPath();
    ctx.moveTo(this.x, bottomY);
    ctx.quadraticCurveTo(this.x, this.y + bounce, centerX, this.y + bounce);
    ctx.quadraticCurveTo(this.x + this.width, this.y + bounce, this.x + this.width, bottomY);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#050811";
    const faceOffset = this.direction * 4;
    ctx.beginPath();
    ctx.arc(centerX + faceOffset - 6, this.y + 12 + bounce, 3, 0, Math.PI * 2);
    ctx.arc(centerX + faceOffset + 6, this.y + 12 + bounce, 3, 0, Math.PI * 2);
    ctx.fill();

    // Health Bar (Mini)
    const hpPct = this.hp / this.maxHp;
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y - 8, this.width, 4);
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(this.x, this.y - 8, this.width * hpPct, 4);

    ctx.restore();
  }
}
