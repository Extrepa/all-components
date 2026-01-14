
import { Entity } from "../core/Entity";
import { Game } from "../core/Game";
import { Rect } from "../../types";
import { Projectile } from "./Projectile";
import { COSMETICS } from "../data/cosmetics";
import { DevState } from "../dev/DevState";
import { AssetLoader } from "../core/AssetLoader";

export class Player extends Entity {
  private game: Game;
  private static errlSprite: HTMLImageElement | null = null;
  private static spriteLoaded: boolean = false;

  // Physics Tunings (Maple-ish feel)
  private readonly SPEED = 280;
  private readonly ACCEL = 1200;
  private readonly FRICTION = 0.82; 
  private readonly AIR_RESISTANCE = 0.95;
  private readonly GRAVITY = 1500;
  private readonly JUMP_FORCE = 600;
  private readonly JUMP_CUT_OFF = 300; 
  
  // Dash Tuning
  private readonly DASH_SPEED = 600;
  private readonly DASH_DURATION = 0.15;
  private readonly DASH_COOLDOWN = 1.0;

  private readonly JUMP_BUFFER_MS = 0.15;
  private readonly COYOTE_TIME_MS = 0.1; 
  
  private jumpBufferTimer: number = 0;
  private coyoteTimer: number = 0;

  // State
  public isGrounded: boolean = false;
  private wasGrounded: boolean = false; // For landing detection
  public facingRight: boolean = true;
  public isCrouching: boolean = false; // Crouch/squish state
  
  // Wall Sliding
  public isOnWall: boolean = false;
  private wallSide: 'left' | 'right' | null = null;
  private readonly WALL_SLIDE_SPEED = 100; // Pixels per second
  public disableWallSliding: boolean = false; // Can be set by scenes to disable wall mechanics
  
  // Dash State
  public isDashing: boolean = false;
  private dashTimer: number = 0;
  private dashCooldownTimer: number = 0;

  // Combat State
  public isAttacking: boolean = false;
  private attackTimer: number = 0;
  private readonly ATTACK_DURATION = 0.25; // seconds
  private readonly ATTACK_COOLDOWN = 0.1;
  private cooldownTimer: number = 0;
  
  // Magic State
  private magicCooldown: number = 0.4;
  private magicTimer: number = 0;
  public lastFiredProjectile: Projectile | null = null;
  private readonly MP_REGEN_RATE = 1.0; // MP per second
  private manaRegenAccumulator: number = 0;
  
  // Charge Attack State
  private isCharging: boolean = false;
  private chargeTimer: number = 0;
  private readonly MAX_CHARGE_TIME = 1.0; // 1 second to full charge
  private chargeLevel: number = 0; // 0 to 1
  
  // Flag to ensure we only hit enemies once per swing
  public damageDealtThisSwing: boolean = false; 

  // Invulnerability (Player getting hit)
  public invulnTimer: number = 0;

  // Level Up Effect
  private levelUpTimer: number = 0;

  // Death State
  public isDead: boolean = false;
  private deathTimer: number = 0;

  // Cosmetic Animation
  private cosmeticTime: number = 0;

  constructor(game: Game, x: number, y: number) {
    super(x, y, 32, 32); 
    this.game = game;
    
    // Load Errl sprite if not already loaded
    if (!Player.spriteLoaded) {
      Player.spriteLoaded = true;
      AssetLoader.loadImage('/Errl.png')
        .then(img => {
          Player.errlSprite = img;
          console.log('Errl sprite loaded successfully');
        })
        .catch(() => {
          return AssetLoader.loadImage('/errl.png');
        })
        .then(img => {
          if (img) {
            Player.errlSprite = img;
            console.log('Errl sprite loaded successfully (lowercase)');
          }
        })
        .catch(err => {
          console.warn('Errl sprite not found, using default rendering:', err);
          Player.errlSprite = null;
        });
    }
  }

  public update(dt: number, platforms: Rect[]): void {
    this.cosmeticTime += dt;
    if (this.isDead) {
        this.updateDeath(dt, platforms);
        return;
    }

    const input = this.game.input;
    const pStats = this.game.state.player;
    const devState = DevState.getInstance(); // Declare once at the top

    this.wasGrounded = this.isGrounded;

    // --- 0. Cooldowns & Regen ---
    if (this.cooldownTimer > 0) this.cooldownTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.levelUpTimer > 0) this.levelUpTimer -= dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.magicTimer > 0) this.magicTimer -= dt;

    // Mana Regen
    if (pStats.mp < pStats.maxMp) {
      this.manaRegenAccumulator += this.MP_REGEN_RATE * dt;
      if (this.manaRegenAccumulator >= 1) {
        pStats.mp = Math.min(pStats.mp + 1, pStats.maxMp);
        this.manaRegenAccumulator -= 1;
      }
    }

    // --- 1. Combat & Item Input ---
    
    // Melee Attack (Z)
    if (input.wasPressed("z") || input.wasPressed("Z") || input.wasPressed("k") || input.wasPressed("K")) {
      // NOTE: 'K' is also a hotkey, only use it for attack if NOT assigned
      // For now, prioritize hotkey check below or input priority
      if (!this.isAttacking && this.cooldownTimer <= 0 && !this.isDashing) {
        this.startAttack();
      }
    }

    // Magic Attack (X) - Charge System (Unlocked at Level 5)
    const magicKeyDown = input.isDown("x") || input.isDown("X") || input.isDown("l") || input.isDown("L");
    const hasChargeSkill = pStats.level >= 5;
    const hasEnoughMP = devState.infiniteMP || pStats.mp >= 5;
    
    if (hasChargeSkill) {
      // Charge system (Level 5+)
      if (magicKeyDown && !this.isAttacking) {
        if (this.magicTimer <= 0 && hasEnoughMP) {
          if (!this.isCharging) {
            this.isCharging = true;
            this.chargeTimer = 0;
          }
          
          // Charge up
          if (this.chargeTimer < this.MAX_CHARGE_TIME) {
            this.chargeTimer += dt;
            this.chargeLevel = Math.min(1, this.chargeTimer / this.MAX_CHARGE_TIME);
          }
        }
      } else {
        // Release: fire if was charging
        if (this.isCharging && this.chargeTimer > 0.1) { // Minimum charge required
          this.castMagic(this.chargeLevel);
          this.isCharging = false;
          this.chargeTimer = 0;
          this.chargeLevel = 0;
        } else if (this.isCharging) {
          // Cancel charge if too short
          this.isCharging = false;
          this.chargeTimer = 0;
          this.chargeLevel = 0;
        }
      }
    } else {
      // Instant cast (Before Level 5)
      if (input.wasPressed("x") || input.wasPressed("X") || input.wasPressed("l") || input.wasPressed("L")) {
        if (this.magicTimer <= 0 && hasEnoughMP) {
          this.castMagic(0); // No charge bonus
        }
      }
    }

    // Dynamic Quick Slots (H, J, K, L etc)
    const quickSlots = this.game.state.quickSlots;
    for (const key in quickSlots) {
        const lower = key.toLowerCase();
        const upper = key.toUpperCase();
        if (input.wasPressed(lower) || input.wasPressed(upper)) {
            const itemId = quickSlots[key];
            if (itemId) {
                const used = this.game.useItem(itemId);
                if (used) {
                    this.game.audio.playSfx('collect'); 
                    this.game.particles.emit('spark', this.x + this.width/2, this.y, 10);
                }
            }
        }
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.cooldownTimer = this.ATTACK_COOLDOWN;
      }
    }

    // --- 1.5 Dash Input ---
    if (input.wasPressed("Shift") && this.dashCooldownTimer <= 0 && !this.isDashing) {
      this.startDash();
    }

    if (this.isDashing) {
      this.updateDash(dt, platforms);
      return; // Skip normal movement physics while dashing
    }

    // --- 2. Movement Input ---
    // Check for down input
    const pressingDown = input.isDown("ArrowDown") || input.isDown("s") || input.isDown("S");
    const jumpPressed = input.wasPressed(" ") || input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W");
    
    // Crouch when holding down while grounded (and not dropping through)
    this.isCrouching = pressingDown && this.isGrounded && !this.canDropThrough;
    
    // Check for drop-through input (down + jump) - only if grounded and not already dropping
    if (pressingDown && jumpPressed && this.isGrounded && !this.canDropThrough) {
      this.canDropThrough = true;
      this.dropThroughTimer = 1.0; // Increased timer to 1.0 seconds for more reliable drop-through
      this.isGrounded = false; // Immediately unground to allow falling
      this.isCrouching = false; // Stop crouching when dropping through
      this.vy = 50; // Give a small downward push to ensure falling
    } else if (jumpPressed && !this.canDropThrough) {
      // Normal jump buffering (only if not doing drop-through)
      this.jumpBufferTimer = this.JUMP_BUFFER_MS;
    }
    
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    
    // Update drop-through timer
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= dt;
      if (this.dropThroughTimer <= 0) {
        this.canDropThrough = false;
      }
    }

    // Horizontal
    let dir = 0;
    if (input.isDown("ArrowLeft") || input.isDown("a") || input.isDown("A")) dir = -1;
    if (input.isDown("ArrowRight") || input.isDown("d") || input.isDown("D")) dir = 1;

    // --- 3. Horizontal Physics ---
    
    if (dir !== 0) {
      this.vx += dir * this.ACCEL * dt;
      this.facingRight = dir > 0;
    } else {
      if (this.isGrounded) {
        this.vx *= this.FRICTION;
      } else {
        this.vx *= this.AIR_RESISTANCE;
      }
      if (Math.abs(this.vx) < 10) this.vx = 0;
    }

    // Cap Speed
    if (Math.abs(this.vx) > this.SPEED) {
      this.vx = Math.sign(this.vx) * this.SPEED;
    }

    // Apply X
    this.x += this.vx * dt;
    this.handleCollisionsX(platforms);

    // --- 4. Vertical Physics ---

    const gravityMultiplier = devState.gravityMultiplier;
    this.vy += this.GRAVITY * gravityMultiplier * dt;

    // Wall sliding: slower fall speed when on wall
    if (this.isOnWall && !this.isGrounded) {
      if (this.vy > this.WALL_SLIDE_SPEED) {
        this.vy = this.WALL_SLIDE_SPEED;
      }
      
      // Wall jump: jump away from wall
      const canWallJump = devState.godMode ? true : (this.jumpBufferTimer > 0);
      
      if (canWallJump) {
        this.vy = -this.JUMP_FORCE;
        this.vx = this.wallSide === 'left' ? 200 : -200; // Push away from wall
        this.jumpBufferTimer = 0;
        this.isOnWall = false;
        this.wallSide = null;
        this.game.audio.playSfx('jump');
        this.game.particles.emit('dust', this.x + this.width/2, this.y + this.height, 3);
      }
    } else {
      // Normal jump logic
      if (this.isGrounded) {
        this.coyoteTimer = this.COYOTE_TIME_MS;
        // Landing Effect
        if (!this.wasGrounded) {
          this.game.particles.emit('dust', this.x + this.width/2, this.y + this.height, 3);
          this.game.audio.playSfx('step');
        }
      } else {
        if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
      }

      // Jump
      const canJump = devState.godMode ? true : (this.jumpBufferTimer > 0 && this.coyoteTimer > 0);
      
      if (canJump) {
        this.vy = -this.JUMP_FORCE;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.isGrounded = false;
        this.game.audio.playSfx('jump');
        // Jump Dust
        this.game.particles.emit('dust', this.x + this.width/2, this.y + this.height, 3);
      }
    }

    // Variable Jump
    if (this.vy < 0 && !(input.isDown(" ") || input.isDown("ArrowUp") || input.isDown("w") || input.isDown("W"))) {
       this.vy += this.JUMP_CUT_OFF * dt * 5; 
    }

    // Apply Y
    this.y += this.vy * dt;
    this.isGrounded = false; 
    this.handleCollisionsY(platforms);

    // World Boundary
    if (this.y > 800) {
      // Logic for falling off map
      if (!this.isDead) {
          this.x = 100;
          this.y = 200;
          this.vy = 0;
          this.takeDamage(9999, this.x); // Instant kill if falling out
      }
    }
  }

  private updateDeath(dt: number, platforms: Rect[]) {
      this.deathTimer += dt;
      // Simple physics (fall down)
      const devState2 = DevState.getInstance();
      const gravityMultiplier2 = devState2.gravityMultiplier;
      this.vy += this.GRAVITY * gravityMultiplier2 * dt;
      this.y += this.vy * dt;
      this.vx *= 0.9;
      this.x += this.vx * dt;
      this.handleCollisionsY(platforms);

      // Ghost rising effect
      if (Math.random() < 0.1) {
          this.game.particles.emit('ghost', this.x, this.y - this.deathTimer * 20);
      }
  }

  private startDash() {
    this.isDashing = true;
    this.dashTimer = this.DASH_DURATION;
    this.dashCooldownTimer = this.DASH_COOLDOWN;
    
    // Dash in facing direction
    const dashDir = this.facingRight ? 1 : -1;
    this.vx = dashDir * this.DASH_SPEED;
    this.vy = 0; // Gravity defy
    
    this.game.camera.shake(2, 0.1);
    this.game.audio.playSfx('jump'); // Reuse jump sound or add dash sound later
  }

  private updateDash(dt: number, platforms: Rect[]) {
    this.dashTimer -= dt;
    
    // Emit Ghost Trail OR Cosmetic Trail
    const cosmetics = this.game.state.player.cosmetics;
    if (cosmetics.trail === 'trail_rainbow') {
        const hue = (Date.now() / 5) % 360;
        this.game.particles.emit('ghost', this.x, this.y);
        // Add sparks for flair
        this.game.particles.emit('spark', this.x + this.width/2, this.y + this.height/2, 1);
    } else {
        this.game.particles.emit('ghost', this.x, this.y);
    }

    // Constant Velocity
    const dashDir = this.facingRight ? 1 : -1;
    this.vx = dashDir * this.DASH_SPEED;
    this.vy = 0;

    // Apply Move
    this.x += this.vx * dt;
    this.handleCollisionsX(platforms);

    // End Dash
    if (this.dashTimer <= 0) {
      this.isDashing = false;
      this.vx = dashDir * this.SPEED; // Return to max normal speed
    }
  }

  private startAttack() {
    this.isAttacking = true;
    this.attackTimer = this.ATTACK_DURATION;
    this.damageDealtThisSwing = false;
    this.game.audio.playSfx('attack');
  }

  private castMagic(chargeLevel: number = 0): void {
      const baseCost = 5;
      const cost = Math.floor(baseCost * (1 + chargeLevel)); // 5 to 10 MP
      const pStats = this.game.state.player;
      const devState = DevState.getInstance();
      
      // Infinite MP: skip cost check and don't reduce MP
      if (!devState.infiniteMP) {
        if (pStats.mp < cost) return;
        pStats.mp -= cost;
      }
      
      this.magicTimer = this.magicCooldown;
      this.game.audio.playSfx('magic');

      const dir = this.facingRight ? 1 : -1;
      const baseDamage = (this.game.state.player.level * 8) + 10;
      const damage = Math.floor(baseDamage * (1 + chargeLevel)); // 1x to 2x damage
      
      const px = this.facingRight ? this.x + this.width + 5 : this.x - 25;
      const py = this.y + 6;
      
      this.lastFiredProjectile = new Projectile(this.game, px, py, dir, damage);
  }

  // Returns the hit rect if attacking, null otherwise
  public getAttackHitbox(): Rect | null {
    if (!this.isAttacking) return null;

    // Hitbox is offset in front of player
    const reach = 50;
    const height = 40;
    
    return {
      x: this.facingRight ? this.x + this.width : this.x - reach,
      y: this.y - 10, // Slightly higher
      width: reach,
      height: height
    };
  }
  
  // Method used by Game Scenes to calculate damage dealt
  public getMeleeDamage(): { damage: number; isCrit: boolean } {
      const stats = this.game.getPlayerStats();
      // Variance: +/- 20%
      const base = stats.attack;
      const variance = Math.floor(base * 0.2);
      const rand = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
      const normalDamage = Math.max(1, base + rand);
      
      // Crit chance: 10% base
      const isCrit = Math.random() < 0.1;
      const finalDamage = isCrit ? Math.floor(normalDamage * 2) : normalDamage;
      
      return { damage: finalDamage, isCrit };
  }

  public takeDamage(amount: number, fromX: number) {
    if (this.invulnTimer > 0 || this.isDead) return;

    // God Mode: No damage, no knockback
    const devState = DevState.getInstance();
    if (devState.godMode) {
      return; // Completely ignore damage
    }

    // Defense Logic
    const stats = this.game.getPlayerStats();
    const defense = stats.defense;
    const damageTaken = Math.max(1, amount - defense);

    this.game.state.player.hp -= damageTaken;
    this.invulnTimer = 1.0; // 1 sec invuln
    
    if (this.game.state.player.hp <= 0) {
        this.die();
        return;
    }

    this.game.audio.playSfx('hit');
    this.game.camera.shake(4, 0.2);

    // Knockback
    this.vy = -300;
    this.vx = (this.x < fromX) ? -300 : 300;
  }

  private die() {
      this.isDead = true;
      this.game.state.player.hp = 0;
      this.game.audio.playSfx('die');
      this.game.camera.shake(5, 0.5);
      
      // Initial death jump
      this.vy = -400;
  }

  public triggerLevelUp(): void {
    this.levelUpTimer = 2.0; // 2 seconds of glory
  }

  private handleCollisionsX(platforms: Rect[]): void {
    const bounds = this.getBounds();
    let hitWall = false;
    let hitWallSide: 'left' | 'right' | null = null;
    
    // Find the lowest platform Y position (ground level) for ground detection
    let lowestPlatformY = 0;
    for (const p of platforms) {
      if (p.y > lowestPlatformY) {
        lowestPlatformY = p.y;
      }
    }
    
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        // Check if this is a ground platform
        const isGround = p.width > 500 || p.y >= lowestPlatformY - 10;
        
        // Skip horizontal collision if jumping through platform from below (not ground)
        if (!isGround && this.vy < 0) {
          // Player is moving upward - might be jumping through from below
          const playerTop = bounds.y;
          const playerBottom = bounds.y + bounds.height;
          const platformTop = p.y;
          const platformBottom = p.y + p.height;
          
          // If player's top is below platform bottom, they're coming from below
          if (playerTop < platformBottom - 5) {
            // Allow jumping through - skip horizontal collision
            continue;
          }
        }
        
        // Normal horizontal collision
        if (this.vx > 0) {
          this.x = p.x - this.width;
          hitWall = true;
          hitWallSide = 'right';
        } else if (this.vx < 0) {
          this.x = p.x + p.width;
          hitWall = true;
          hitWallSide = 'left';
        }
        this.vx = 0;
      }
    }
    
    // Check if pressing against wall
    const input = this.game.input;
    const pressingLeft = input.isDown("ArrowLeft") || input.isDown("a") || input.isDown("A");
    const pressingRight = input.isDown("ArrowRight") || input.isDown("d") || input.isDown("D");
    
    // Disable wall sliding if flag is set
    if (this.disableWallSliding) {
      this.isOnWall = false;
      this.wallSide = null;
      return;
    }
    
    this.isOnWall = hitWall && !this.isGrounded && (
      (hitWallSide === 'left' && pressingLeft) ||
      (hitWallSide === 'right' && pressingRight)
    );
    
    if (this.isOnWall) {
      this.wallSide = hitWallSide;
    } else {
      this.wallSide = null;
    }
  }

  private handleCollisionsY(platforms: Rect[]): void {
    const bounds = this.getBounds();
    
    // Find the lowest platform Y position (ground level)
    let lowestPlatformY = 0;
    for (const p of platforms) {
      if (p.y > lowestPlatformY) {
        lowestPlatformY = p.y;
      }
    }
    
    for (const p of platforms) {
      if (this.aabb(bounds, p)) {
        const playerBottom = bounds.y + bounds.height;
        const platformTop = p.y;
        const platformBottom = p.y + p.height;
        
        // Check if this is a ground platform (very wide or at the lowest Y position)
        const isGround = p.width > 500 || p.y >= lowestPlatformY - 10;
        
        if (this.vy > 0) {
          // Falling down - landing on top
          
          // Check if we can drop through (only if actively dropping and NOT ground)
          if (this.canDropThrough && this.dropThroughTimer > 0 && !isGround) {
            // Always allow falling through if drop-through is active and not ground
            // Only reset drop-through if player is fully below the platform
            const playerTop = bounds.y;
            if (playerTop > platformBottom) {
              // Player is fully below platform, can reset drop-through
              this.canDropThrough = false;
              this.dropThroughTimer = 0;
            }
            // Skip collision - allow falling through
            continue;
          }
          
          // Normal landing on top
          this.y = p.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.canDropThrough = false; // Reset drop-through when landing
        } else if (this.vy < 0) {
          // Moving up - check if jumping through platform from below (only if NOT ground)
          if (!isGround) {
            // Allow jumping through from below - check if player is coming from below the platform
            const playerTop = bounds.y;
            // If player's top is below the platform's bottom, they're coming from below
            if (playerTop < platformBottom - 5) {
              // Player is jumping up through platform from below - allow it
              continue;
            }
          }
          
          // Hitting ceiling (or ground platform)
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
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (this.isDead) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.deathTimer * 2); // Spin on death
        ctx.globalAlpha = Math.max(0, 1 - this.deathTimer * 0.5); // Fade out
        ctx.fillStyle = "#555";
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
        return;
    }

    // Invuln flickering
    if (this.invulnTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
        return; // Skip render frame for flicker
    }
    
    // God Mode Visual Indicator (glowing aura)
    const devState = DevState.getInstance();
    if (devState.godMode) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.cosmeticTime * 5) * 0.3;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      gradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 255, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
      ctx.restore();
    }
    
    const cosmetics = this.game.state.player.cosmetics;

    // --- AURA RENDER (Behind) ---
    if (cosmetics.aura) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const def = COSMETICS[cosmetics.aura];
        if (def) {
            ctx.fillStyle = def.color || '#fff';
            if (cosmetics.aura === 'aura_fire') {
                const scale = 1 + Math.sin(this.cosmeticTime * 10) * 0.2;
                ctx.globalAlpha = 0.5;
                ctx.scale(scale, scale);
                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fill();
            } else if (cosmetics.aura === 'aura_ice') {
                ctx.rotate(this.cosmeticTime * 2);
                ctx.strokeStyle = def.color!;
                ctx.lineWidth = 2;
                ctx.strokeRect(-25, -25, 50, 50);
            }
        }
        ctx.restore();
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(centerX, this.y + this.height, this.width / 1.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Level Up Effect (Behind Player)
    if (this.levelUpTimer > 0) {
      ctx.save();
      const alpha = Math.min(1, this.levelUpTimer);
      ctx.globalAlpha = alpha;
      
      // Pillar of light
      const grad = ctx.createLinearGradient(0, this.y + this.height, 0, this.y - 100);
      grad.addColorStop(0, "rgba(255, 215, 0, 0)");
      grad.addColorStop(0.2, "rgba(255, 215, 0, 0.5)");
      grad.addColorStop(1, "rgba(255, 215, 0, 0)");
      
      ctx.fillStyle = grad;
      ctx.fillRect(centerX - 30, this.y - 100, 60, this.height + 100);
      
      // Particles
      const time = Date.now() / 100;
      ctx.fillStyle = "#fff7cc";
      for (let i = 0; i < 5; i++) {
        const px = centerX + Math.sin(time + i) * 20;
        const py = (this.y + this.height) - ((time * 50 + i * 30) % 150);
        if (py < this.y - 50) continue;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }

    // Charge Effect (Behind Player)
    if (this.isCharging) {
      ctx.save();
      ctx.globalAlpha = this.chargeLevel * 0.5;
      const glowSize = 20 + (this.chargeLevel * 20);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowSize
      );
      gradient.addColorStop(0, "#34e1ff");
      gradient.addColorStop(1, "rgba(52, 225, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Charge particles
      if (Math.random() < 0.3) {
        this.game.particles.emit('spark', centerX, centerY, 1);
      }
    }
    
    // Body
    ctx.save();
    
    // Squash/Stretch
    let scaleX = 1;
    let scaleY = 1;
    
    // Crouch squish effect
    if (this.isCrouching) {
      scaleX = 1.2; // Wider when crouching
      scaleY = 0.6; // Shorter when crouching
    } else if (Math.abs(this.vy) > 100) { 
      scaleX = 0.8; 
      scaleY = 1.2; 
    } else if (Math.abs(this.vx) > 100) { 
      scaleX = 1.1; 
      scaleY = 0.9; 
    }

    ctx.translate(centerX, this.y + this.height);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-centerX, -(this.y + this.height));

    // Render Errl sprite if loaded, otherwise fall back to default
    if (Player.errlSprite && Player.errlSprite.complete && Player.errlSprite.naturalWidth > 0) {
      ctx.save();
      
      // Apply squash/stretch transforms
      ctx.translate(centerX, this.y + this.height);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-centerX, -(this.y + this.height));
      
      // Flip horizontally if facing left
      if (!this.facingRight) {
        ctx.translate(centerX * 2, 0);
        ctx.scale(-1, 1);
      }
      
      // Draw the entire Errl sprite image, scaled to fit player size
      ctx.drawImage(
        Player.errlSprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
      
      // Apply tinting for cosmetics/armor if needed
      const hasColorOverride = this.game.state.player.equipment.armor === 'leather_armor' || cosmetics.bodyColor;
      
      if (hasColorOverride || this.isDashing) {
        ctx.globalCompositeOperation = 'multiply';
        let tintColor = "#ffffff";
        if (this.game.state.player.equipment.armor === 'leather_armor') {
          tintColor = "#a0522d";
        }
        if (cosmetics.bodyColor) {
          const def = COSMETICS[cosmetics.bodyColor];
          if (def && def.color) tintColor = def.color;
        }
        if (this.isDashing) tintColor = "#e0ffff";
        
        ctx.fillStyle = tintColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.restore();
    } else {
      // Fallback: Default blue square rendering
      // Base Color Determination
      let bodyColor = "#8afff2"; // Default Cyan
      if (this.game.state.player.equipment.armor === 'leather_armor') {
          bodyColor = "#a0522d"; // Armor overrides default
      }
      // Cosmetic Paint overrides Armor
      if (cosmetics.bodyColor) {
          const def = COSMETICS[cosmetics.bodyColor];
          if (def && def.color) bodyColor = def.color;
      }

      if (this.isDashing) bodyColor = "#e0ffff"; // Lighter when dashing
      
      ctx.fillStyle = bodyColor;
      // Use manual rounded rectangle since roundRect might not be available
      const radius = 10;
      const x = this.x;
      const y = this.y;
      const w = this.width;
      const h = this.height;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#050811";
      const eyeOffset = this.facingRight ? 4 : -4;
      ctx.beginPath();
      ctx.arc(centerX + eyeOffset - 5, centerY - 2, 3, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset + 5, centerY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- HAT RENDER ---
    if (cosmetics.hat) {
        const def = COSMETICS[cosmetics.hat];
        if (def) {
            ctx.save();
            ctx.translate(centerX + (this.facingRight ? 2 : -2), this.y); // Top of head
            
            if (cosmetics.hat === 'hat_crown') {
                ctx.fillStyle = def.color || '#ffd700';
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(-15, -15);
                ctx.lineTo(-5, -5);
                ctx.lineTo(0, -20);
                ctx.lineTo(5, -5);
                ctx.lineTo(15, -15);
                ctx.lineTo(15, 0);
                ctx.fill();
            } else if (cosmetics.hat === 'hat_viking') {
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.arc(0, 0, 16, Math.PI, 0); // Dome
                ctx.fill();
                // Horns
                ctx.fillStyle = '#eee';
                ctx.beginPath();
                ctx.moveTo(-14, -5);
                ctx.lineTo(-25, -20);
                ctx.lineTo(-10, -10);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(14, -5);
                ctx.lineTo(25, -20);
                ctx.lineTo(10, -10);
                ctx.fill();
            } else if (cosmetics.hat === 'hat_cowboy') {
                 ctx.fillStyle = def.color || '#8B4513';
                 ctx.fillRect(-20, -5, 40, 5); // Brim
                 ctx.fillRect(-12, -20, 24, 15); // Top
            }

            ctx.restore();
        }
    }

    ctx.restore();

    // Attack Visual (Weapon Swing)
    if (this.isAttacking) {
      ctx.save();
      const progress = 1 - (this.attackTimer / this.ATTACK_DURATION); 
      
      ctx.globalAlpha = 1 - progress; 
      
      const reach = 60;
      const hitbox = this.getAttackHitbox();
      
      if (hitbox) {
         ctx.beginPath();
         const pivotX = centerX;
         const pivotY = centerY;
         
         const startAngle = this.facingRight ? -Math.PI * 0.2 : Math.PI * 1.2;
         const endAngle = this.facingRight ? Math.PI * 0.5 : Math.PI * 0.8;
         
         ctx.arc(pivotX, pivotY, reach, startAngle, endAngle, !this.facingRight);
         
         // Color based on weapon?
         if (this.game.state.player.equipment.weapon === 'iron_sword') {
             ctx.strokeStyle = "rgba(192, 192, 192, 0.8)";
         } else {
             ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
         }

         ctx.lineWidth = 20 * (1 - progress);
         ctx.stroke();
      }
      
      ctx.restore();
    }
  }
}
