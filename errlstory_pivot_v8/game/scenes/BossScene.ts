
import { Game } from "../core/Game";
import { Scene, Rect } from "../../types";
import { Player } from "../entities/Player";
import { RoyalSlime } from "../entities/RoyalSlime";
import { Portal } from "../entities/Portal";
import { Drop } from "../entities/Drop";
import { Projectile } from "../entities/Projectile";
import { FloatingTextManager } from "../effects/FloatingTextManager";
import { Minimap } from "../ui/Minimap";
import { DevState } from "../dev/DevState";

export class BossScene implements Scene {
  private game: Game;
  private player: Player;
  private boss: RoyalSlime;
  private portal: Portal;
  private drops: Drop[] = [];
  private projectiles: Projectile[] = [];
  private platforms: Rect[];
  private floatingText: FloatingTextManager;
  private minimap: Minimap;

  private victoryTimer: number = -1;
  private deathTimer: number = 0;
  private readonly MAP_WIDTH = 960; // Single screen width
  private readonly MAP_HEIGHT = 540;

  constructor(game: Game) {
    this.game = game;
    this.floatingText = new FloatingTextManager();
    
    // Arena Boundaries
    this.platforms = [
      { x: 0, y: 480, width: 960, height: 60 }, // Floor
      { x: -50, y: 0, width: 50, height: 540 }, // Left Wall
      { x: 960, y: 0, width: 50, height: 540 }, // Right Wall
      { x: 0, y: -50, width: 960, height: 50 }, // Ceiling (optional)
    ];

    // Placeholder init
    this.player = new Player(game, 100, 400);
    this.boss = new RoyalSlime(game, 700, 400);
    this.portal = new Portal(20, 390, "town", "Retreat", "#34e1ff");
    
    this.minimap = new Minimap(game, this.MAP_WIDTH, this.MAP_HEIGHT, "Royal Arena");
  }

  onEnter(): void {
    console.log("Entered BossScene");
    
    this.game.camera.setMapSize(this.MAP_WIDTH, this.MAP_HEIGHT);
    this.game.camera.x = 0;
    this.game.camera.y = 0;

    this.player = new Player(this.game, 150, 400);
    this.boss = new RoyalSlime(this.game, 700, 400);
    this.boss.setTarget(this.player);
    
    this.victoryTimer = -1;
    this.deathTimer = 2.0;
    this.floatingText = new FloatingTextManager();
    this.game.particles.clear();
    this.drops = [];
    this.projectiles = [];
  }

  update(dt: number): void {
     // Death Logic
     if (this.player.isDead) {
        this.player.update(dt, this.platforms);
        this.game.particles.update(dt);
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
            this.game.sceneManager.setScene("gameover");
        }
        return;
    }

    // Enable wall sliding in Boss
    this.player.disableWallSliding = false;
    
    // Entity Updates
    this.player.update(dt, this.platforms);
    if (this.player.lastFiredProjectile) {
        this.projectiles.push(this.player.lastFiredProjectile);
        this.player.lastFiredProjectile = null;
    }

    // Dev State: Freeze AI
    const devState = DevState.getInstance();
    if (!devState.freezeAI) {
      this.boss.update(dt, this.platforms);
    }
    this.portal.update(dt);
    this.floatingText.update(dt);
    this.game.particles.update(dt);
    this.game.dailySystem.update(dt);
    
    // Minimap
    this.minimap.update(dt);

    for (const drop of this.drops) {
        drop.update(dt, this.platforms);
    }
    this.drops = this.drops.filter(d => !d.isCollected);

    for (const p of this.projectiles) {
        p.update(dt, this.platforms);
    }
    this.projectiles = this.projectiles.filter(p => !p.isDead);

    this.checkPortalInteraction();
    this.checkDropPickup();

    // Combat Logic
    if (!this.boss.isDead) {
      this.checkCombat();
    } else {
      // Victory State
      if (this.victoryTimer === -1) {
        this.victoryTimer = 8.0; 
        this.floatingText.spawn(480, 200, "VICTORY!", "#ffd700");
        this.floatingText.spawn(480, 250, "+500 XP", "#34e1ff");
        
        const leveledUp = this.game.gainXp(this.boss.xpValue);
        
        for (let i = 0; i < 10; i++) {
             this.drops.push(new Drop(this.game, this.boss.x + 40, this.boss.y + 30, 'GOO', 10));
        }
        for (let i = 0; i < 3; i++) {
             this.drops.push(new Drop(this.game, this.boss.x + 40, this.boss.y + 30, 'POTION', 1));
        }
        
        if (leveledUp) {
           this.player.triggerLevelUp();
        }
        
        this.game.questSystem.onKill(this.boss.id);
        this.game.dailySystem.onKill(this.boss.id);
        
        this.game.saveSystem.save(this.game.state);
        this.floatingText.spawn(480, 300, "Game Saved", "#aaa");
      }
      
      this.victoryTimer -= dt;
      if (this.victoryTimer <= 0) {
        this.game.sceneManager.setScene("town");
      }
    }
  }

  private checkDropPickup() {
    const pBounds = this.player.getBounds();
    for (const drop of this.drops) {
        if (!drop.isCollected && this.aabb(pBounds, drop.getBounds())) {
            drop.isCollected = true;
            this.game.audio.playSfx('collect');

            if (drop.type === 'GOO') {
                this.game.state.player.gooBits += drop.value;
                this.floatingText.spawn(this.player.x, this.player.y - 40, `+${drop.value} Goo`, "#ff8ef5");
                this.game.dailySystem.onCollect(drop.value);
            } else if (drop.type === 'POTION') {
                this.game.addItem({ id: 'potion', name: 'Red Potion', type: 'consumable', count: drop.value });
                this.floatingText.spawn(this.player.x, this.player.y - 40, `Got Potion!`, "#ff4444");
            }
        }
    }
  }

  private checkPortalInteraction() {
    const input = this.game.input;
    const pBounds = this.player.getBounds();
    const portalBounds = this.portal.getBounds();

    if (this.aabb(pBounds, portalBounds)) {
      if (input.wasPressed("ArrowUp") || input.wasPressed("w")) {
         this.game.audio.playSfx('jump');
         this.game.sceneManager.setScene("town");
      }
    }
  }

  private checkCombat() {
    const pBounds = this.player.getBounds();
    const bBounds = this.boss.getBounds();
    const attackHitbox = this.player.getAttackHitbox();

    if (attackHitbox && !this.player.damageDealtThisSwing) {
      if (this.aabb(attackHitbox, bBounds)) {
        const result = this.player.getMeleeDamage(); 
        this.boss.takeDamage(result.damage);
        this.player.damageDealtThisSwing = true;
        
        // Boss hits always get hitstop (even non-crits)
        if (result.isCrit) {
          this.game.triggerHitstop(3); // 3 frames for crits on boss
        } else {
          this.game.triggerHitstop(1); // 1 frame for normal boss hits
        }
        
        this.floatingText.spawn(this.boss.x + this.boss.width/2, this.boss.y, result.damage.toString(), "#ffcc00", result.isCrit);
        this.game.audio.playSfx('hit');
        this.game.camera.shake(result.isCrit ? 3 : 2, result.isCrit ? 0.2 : 0.1);
        this.game.particles.emit('spark', this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, result.isCrit ? 12 : 8);
        this.boss.vx += (this.player.x < this.boss.x) ? 50 : -50;
      }
    }

    for (const p of this.projectiles) {
      if (p.isDead) continue;
      if (this.aabb(p.getBounds(), bBounds)) {
           p.isDead = true;
           const dmg = p.damage;
           this.boss.takeDamage(dmg);
           this.floatingText.spawn(this.boss.x + this.boss.width/2, this.boss.y, dmg.toString(), "#34e1ff");
           this.game.audio.playSfx('hit');
           this.game.particles.emit('spark', p.x, p.y, 5);
      }
    }

    if (this.aabb(pBounds, bBounds)) {
      if (this.player.invulnTimer <= 0) {
        this.player.takeDamage(20, this.boss.x);
        this.floatingText.spawn(this.player.x, this.player.y, "OUCH!", "#ff0000");
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

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.game;

    // --- BACKGROUND ---
    const grad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 600);
    grad.addColorStop(0, "#2a0e36");
    grad.addColorStop(1, "#0d0212");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#1f0a29";
    ctx.fillRect(0, 480, width, 60);
    ctx.strokeStyle = "#5e2a75";
    ctx.beginPath();
    ctx.moveTo(0, 480);
    ctx.lineTo(width, 480);
    ctx.stroke();

    this.portal.render(ctx);
    this.boss.render(ctx);
    for (const drop of this.drops) drop.render(ctx);
    for (const p of this.projectiles) p.render(ctx);
    this.player.render(ctx);
    this.game.particles.render(ctx);
    this.floatingText.render(ctx);

    const pBounds = this.player.getBounds();
    const portalBounds = this.portal.getBounds();
    if (this.aabb(pBounds, portalBounds) && !this.player.isDead) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("[▲] Retreat", this.portal.x + this.portal.width/2, this.portal.y - 30);
    }

    // Boss HUD (Top Center)
    this.renderBossHud(ctx);
    
    // Minimap
    this.minimap.render(ctx, this.player, [this.portal]);
    
    // Victory Overlay
    if (this.victoryTimer > 0) {
      if (this.victoryTimer > 5) {
          ctx.save();
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 20;
          ctx.fillStyle = "#ffd700";
          ctx.font = "900 64px Inter, system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("VICTORY!", width/2, height/2);
          ctx.restore();
      }
      
      ctx.fillStyle = "#fff";
      ctx.font = "20px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`Returning to Town in ${Math.ceil(this.victoryTimer)}...`, width/2, height/2 + 50);
    }
  }

  private renderBossHud(ctx: CanvasRenderingContext2D) {
    if (this.boss.isDead) return;

    const { width } = this.game;
    const maxHp = this.boss.maxHp;
    const curHp = Math.max(0, this.boss.hp);
    const pct = curHp / maxHp;

    const barW = 600;
    const barH = 20;
    const x = (width - barW) / 2;
    const y = 40;

    ctx.fillStyle = "#ff8ef5";
    ctx.font = "bold 20px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Royal Slime", width/2, y - 10);

    ctx.fillStyle = "#2d0a36";
    ctx.fillRect(x, y, barW, barH);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barW, barH);

    ctx.fillStyle = "#d948ff";
    ctx.fillRect(x, y, barW * pct, barH);
  }
}
