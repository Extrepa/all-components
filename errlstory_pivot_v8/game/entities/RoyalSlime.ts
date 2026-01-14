
import { Mob } from "./Mob";
import { Game } from "../core/Game";
import { Rect } from "../../types";

export class RoyalSlime extends Mob {
  private game: Game;
  private player: any; // Reference to player for targeting

  // Physics
  private readonly SPEED = 150;
  private readonly JUMP_FORCE = 800;
  private readonly GRAVITY = 1500;
  
  // AI State
  private jumpTimer: number = 0;
  private jumpInterval: number = 2.0;
  private isEnraged: boolean = false;
  private animationTime: number = 0;

  constructor(game: Game, x: number, y: number) {
    super(x, y, 80, 60, 500); // 80x60 size, 500 HP
    this.id = "royal_slime";
    this.game = game;
    
    // Rewards
    this.xpValue = 500;
    this.gooValue = 100;
  }

  public setTarget(player: any) {
    this.player = player;
  }

  public update(dt: number, platforms: Rect[]): void {
    super.update(dt, platforms);
    if (this.isDead) return;

    this.animationTime += dt;
    this.jumpTimer -= dt;

    // Enrage check
    if (!this.isEnraged && this.hp < this.maxHp * 0.5) {
      this.isEnraged = true;
      this.jumpInterval = 1.0; // Jump faster
      // Visual flair for enrage could go here (particle burst)
    }

    // --- AI Logic ---
    if (this.player) {
      // 1. Face Player
      const dx = this.player.x - this.x;
      
      // 2. Movement (Only when in air)
      if (Math.abs(this.vy) > 10) {
        this.vx = Math.sign(dx) * (this.isEnraged ? this.SPEED * 1.5 : this.SPEED);
      } else {
        // Friction on ground
        this.vx *= 0.8;
      }

      // 3. Jump Attack
      if (this.jumpTimer <= 0) {
        this.vy = -this.JUMP_FORCE;
        this.jumpTimer = this.jumpInterval + Math.random() * 0.5;
      }
    }

    // Physics Application
    this.vy += this.GRAVITY * dt;
    
    this.x += this.vx * dt;
    this.handleCollisionsX(platforms);
    
    this.y += this.vy * dt;
    this.handleCollisionsY(platforms);
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

    // Squish effect on landing could be added here based on vy
    
    ctx.save();
    
    // Hit flash
    if (this.invulnTimer > 0) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = this.isEnraged ? "#ff4848" : "#d948ff"; // Red if angry, Purple normally
    }

    // Draw Body (Big Blob)
    const bounce = Math.sin(this.animationTime * 5) * 5;
    ctx.beginPath();
    ctx.moveTo(this.x, bottomY);
    ctx.quadraticCurveTo(this.x - 10, this.y + bounce, centerX, this.y + bounce);
    ctx.quadraticCurveTo(this.x + this.width + 10, this.y + bounce, this.x + this.width, bottomY);
    ctx.fill();

    // Draw Crown
    ctx.fillStyle = "#ffd700"; // Gold
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 2;
    const crownY = this.y + bounce;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, crownY);
    ctx.lineTo(centerX - 20, crownY - 20);
    ctx.lineTo(centerX - 10, crownY - 10);
    ctx.lineTo(centerX, crownY - 25);
    ctx.lineTo(centerX + 10, crownY - 10);
    ctx.lineTo(centerX + 20, crownY - 20);
    ctx.lineTo(centerX + 20, crownY);
    ctx.fill();
    ctx.stroke();

    // Eyes (Angry)
    ctx.fillStyle = "#050811";
    ctx.beginPath();
    // Left Eye
    ctx.moveTo(centerX - 15, this.y + 30 + bounce);
    ctx.lineTo(centerX - 5, this.y + 35 + bounce);
    ctx.lineTo(centerX - 15, this.y + 40 + bounce);
    ctx.fill();
    // Right Eye
    ctx.beginPath();
    ctx.moveTo(centerX + 15, this.y + 30 + bounce);
    ctx.lineTo(centerX + 5, this.y + 35 + bounce);
    ctx.lineTo(centerX + 15, this.y + 40 + bounce);
    ctx.fill();

    ctx.restore();
  }
}
