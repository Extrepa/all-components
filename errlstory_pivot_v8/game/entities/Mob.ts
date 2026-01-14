
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";
import { Rect } from "../../types";
import { DevState } from "../dev/DevState";

export class Mob extends Entity {
  public id: string = "mob"; // For quest tracking
  public hp: number;
  public maxHp: number;
  public isDead: boolean = false;
  
  // Rewards
  public xpValue: number = 10;
  public gooValue: number = 1;

  // Invincibility Frames (flash white when hit)
  public invulnTimer: number = 0;
  
  // Dev: Stun state
  public isStunned: boolean = false;
  
  constructor(x: number, y: number, width: number, height: number, hp: number) {
    super(x, y, width, height);
    this.hp = hp;
    this.maxHp = hp;
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead || this.invulnTimer > 0) return false;

    this.hp -= amount;
    this.invulnTimer = 0.2; // Flash for 200ms

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
    
    return true; // Damage accepted
  }

  public update(dt: number, platforms: Rect[]): void {
    if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
    }
    
    // Dev: Stun All Mobs
    const devState = DevState.getInstance();
    this.isStunned = devState.stunAllMobs;
    
    if (this.isStunned) {
      return; // Skip AI/physics when stunned
    }
    
    // Subclasses implement physics/AI
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Subclasses implement rendering
  }
}
