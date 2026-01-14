import { Entity } from "../core/Entity";
import { Game } from "../core/Game";
import { Player } from "./Player";
import { Rect } from "../../types";

export class BouncePad extends Entity {
  private game: Game;
  private bounceForce: number = 800; // Stronger than normal jump (600)
  private glowTimer: number = 0;
  
  constructor(game: Game, x: number, y: number) {
    super(x, y, 64, 16); // Wide, thin platform
    this.game = game;
  }
  
  public update(dt: number): void {
    this.glowTimer += dt;
  }
  
  public checkBounce(player: Player): boolean {
    const playerBounds = player.getBounds();
    const padBounds = this.getBounds();
    
    // Check if player is on top of pad and falling
    if (this.aabb(playerBounds, padBounds) && player.vy >= 0) {
      // Only bounce if player's bottom is near the pad's top (landing on it)
      const playerBottom = playerBounds.y + playerBounds.height;
      const padTop = padBounds.y;
      const tolerance = 10; // Pixels
      
      if (playerBottom >= padTop && playerBottom <= padTop + tolerance) {
        player.vy = -this.bounceForce;
        player.isGrounded = false;
        player.y = padTop - playerBounds.height; // Snap to pad top
        this.game.audio.playSfx('jump');
        this.game.particles.emit('spark', this.x + this.width/2, this.y, 10);
        this.game.camera.shake(1, 0.1);
        return true;
      }
    }
    return false;
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
    // Glowing platform with pulse effect
    const glow = 0.5 + Math.sin(this.glowTimer * 5) * 0.3;
    
    ctx.save();
    
    // Glow effect
    ctx.globalAlpha = glow;
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, "#ffff00");
    gradient.addColorStop(1, "#ff8800");
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Outline
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Inner highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
    
    ctx.restore();
  }
}

