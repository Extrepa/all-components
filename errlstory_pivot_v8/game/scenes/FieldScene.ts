
import { Game } from "../core/Game";
import { Scene, Rect } from "../../types";
import { Player } from "../entities/Player";
import { Slime } from "../entities/Slime";
import { Mob } from "../entities/Mob";
import { Portal } from "../entities/Portal";
import { Drop } from "../entities/Drop";
import { Projectile } from "../entities/Projectile";
import { BouncePad } from "../entities/BouncePad";
import { FloatingTextManager } from "../effects/FloatingTextManager";
import { Minimap } from "../ui/Minimap";
import { DevState } from "../dev/DevState";

export class FieldScene implements Scene {
  private game: Game;
  private player: Player;
  private platforms: Rect[];
  private mobs: Mob[];
  private drops: Drop[] = [];
  private projectiles: Projectile[] = [];
  private bouncePads: BouncePad[] = [];
  private portal: Portal;
  private floatingText: FloatingTextManager;
  private minimap: Minimap;
  
  private deathTimer: number = 0;
  private readonly MAP_WIDTH = 2400;
  private readonly MAP_HEIGHT = 600;

  constructor(game: Game) {
    this.game = game;
    this.floatingText = new FloatingTextManager();
    
    // Level Design
    this.platforms = [
      { x: 0, y: 500, width: 2400, height: 100 },
      { x: 300, y: 400, width: 200, height: 20 },
      { x: 600, y: 320, width: 200, height: 20 },
      { x: 900, y: 400, width: 100, height: 20 },
      { x: 1050, y: 300, width: 100, height: 20 },
      { x: 900, y: 200, width: 100, height: 20 },
      { x: 1200, y: 200, width: 400, height: 20 },
      { x: 1700, y: 300, width: 200, height: 20 },
      { x: 2000, y: 400, width: 200, height: 20 },
      { x: -50, y: 0, width: 50, height: this.MAP_HEIGHT }, 
      { x: this.MAP_WIDTH, y: 0, width: 50, height: this.MAP_HEIGHT }, 
    ];

    this.player = new Player(game, 150, 400); 
    this.portal = new Portal(50, 410, "town", "To Town", "#34e1ff");
    this.mobs = [];
    this.spawnMobs();
    
    // Add bounce pads
    this.bouncePads = [
      new BouncePad(game, 400, 380), // On first elevated platform
      new BouncePad(game, 900, 380), // On another platform
      new BouncePad(game, 1200, 180), // On high platform
    ];
    
    this.minimap = new Minimap(game, this.MAP_WIDTH, this.MAP_HEIGHT, "Slimey Hills");
  }

  private spawnMobs() {
    this.mobs = [
      new Slime(this.game, 400, 450), 
      new Slime(this.game, 650, 250), 
      new Slime(this.game, 1300, 150), 
      new Slime(this.game, 1500, 150), 
      new Slime(this.game, 2100, 350), 
    ];
  }

  onEnter(): void {
    console.log("Entered FieldScene");
    
    this.game.camera.setMapSize(this.MAP_WIDTH, this.MAP_HEIGHT);
    this.game.camera.follow(this.player, 100); 
    this.game.particles.clear();
    this.drops = []; 
    this.projectiles = [];
    this.deathTimer = 2.0;
  }

  update(dt: number): void {
    const input = this.game.input;

    // --- Death Logic ---
    if (this.player.isDead) {
        this.player.update(dt, this.platforms);
        this.game.particles.update(dt);
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
            this.game.sceneManager.setScene("gameover");
        }
        return;
    }

    if (input.wasPressed("r")) {
      this.spawnMobs();
    }

    // Enable wall sliding in Field
    this.player.disableWallSliding = false;
    
    this.player.update(dt, this.platforms);
    if (this.player.lastFiredProjectile) {
        this.projectiles.push(this.player.lastFiredProjectile);
        this.player.lastFiredProjectile = null;
    }

    this.portal.update(dt);

    // Dev State: Freeze AI
    const devState = DevState.getInstance();
    if (!devState.freezeAI) {
      for (const mob of this.mobs) {
        mob.update(dt, this.platforms);
      }
    }

    for (const drop of this.drops) {
        drop.update(dt, this.platforms);
    }
    
    // Update bounce pads and check collisions
    for (const pad of this.bouncePads) {
        pad.update(dt);
        pad.checkBounce(this.player);
    }
    this.drops = this.drops.filter(d => !d.isCollected);

    for (const p of this.projectiles) {
        p.update(dt, this.platforms);
    }
    this.projectiles = this.projectiles.filter(p => !p.isDead);

    this.floatingText.update(dt);
    this.game.particles.update(dt);
    
    // Minimap
    this.minimap.update(dt);
    this.game.dailySystem.update(dt);

    this.checkCombatCollisions();
    this.checkPortalInteraction();
    this.checkDropPickup();

    this.game.camera.follow(this.player, dt);
  }

  private checkPortalInteraction() {
    const input = this.game.input;
    const pBounds = this.player.getBounds();
    const portalBounds = this.portal.getBounds();

    if (this.aabb(pBounds, portalBounds)) {
      if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
         this.game.audio.playSfx('jump');
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

  private checkCombatCollisions() {
    const attackHitbox = this.player.getAttackHitbox();
    const playerBounds = this.player.getBounds();

    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      if (mob.isDead) continue; 

      const mobBounds = mob.getBounds();

      // 1. Melee Hit
      if (attackHitbox && !this.player.damageDealtThisSwing) {
        if (this.aabb(attackHitbox, mobBounds)) {
          const result = this.player.getMeleeDamage();
          mob.takeDamage(result.damage);
          
          // Trigger hitstop on crits
          if (result.isCrit) {
            this.game.triggerHitstop(2); // 2 frame freeze for crits
          }
          
          this.floatingText.spawn(mob.x + mob.width/2, mob.y, result.damage.toString(), "#ffcc00", result.isCrit);
          this.game.audio.playSfx('hit');
          this.game.camera.shake(result.isCrit ? 2 : 1, result.isCrit ? 0.15 : 0.1);
          this.game.particles.emit('spark', mob.x + mob.width/2, mob.y + mob.height/2, result.isCrit ? 8 : 5);
          mob.vx += (this.player.x < mob.x) ? 100 : -100;
          mob.vy -= 100;
          this.player.damageDealtThisSwing = true; 

          if (mob.hp <= 0 && mob.isDead) this.handleMobDeath(mob);
        }
      }

      // 2. Projectile Hit
      for (const p of this.projectiles) {
        if (p.isDead) continue;
        if (this.aabb(p.getBounds(), mobBounds)) {
             p.isDead = true;
             const dmg = p.damage;
             mob.takeDamage(dmg);
             this.floatingText.spawn(mob.x + mob.width/2, mob.y, dmg.toString(), "#34e1ff");
             this.game.audio.playSfx('hit');
             this.game.particles.emit('spark', p.x, p.y, 5);
             if (mob.hp <= 0 && mob.isDead) this.handleMobDeath(mob);
        }
      }

      // 3. Contact Damage
      if (!mob.isDead && this.aabb(playerBounds, mobBounds)) {
        if (this.player.invulnTimer <= 0) {
           this.player.takeDamage(5, mob.x);
           this.floatingText.spawn(this.player.x + this.player.width/2, this.player.y, "OUCH!", "#ff0000");
        }
      }
    }
    this.mobs = this.mobs.filter(m => !m.isDead);
  }

  private handleMobDeath(mob: Mob) {
    const leveledUp = this.game.gainXp(mob.xpValue);
    this.floatingText.spawn(mob.x + mob.width/2, mob.y - 20, `+${mob.xpValue} XP`, "#34e1ff");
    this.game.audio.playSfx('collect');
    
    this.drops.push(new Drop(this.game, mob.x, mob.y, 'GOO', mob.gooValue));
    
    if (Math.random() < 0.2) {
        this.drops.push(new Drop(this.game, mob.x, mob.y, 'POTION', 1));
    }

    if (leveledUp) {
        this.floatingText.spawn(this.player.x + this.player.width/2, this.player.y - 50, "LEVEL UP!", "#ffd700");
        this.player.triggerLevelUp();
    }
    
    this.game.questSystem.onKill(mob.id);
    this.game.dailySystem.onKill(mob.id);
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
    const cam = this.game.camera;

    // --- BACKGROUND ---
    ctx.fillStyle = "#03141d";
    ctx.fillRect(0, 0, width, height);

    // Parallax
    const parallaxFactor = 0.2;
    ctx.save();
    ctx.translate(-cam.x * parallaxFactor, 0); 
    ctx.fillStyle = "#061f2b";
    for (let i = 0; i < 3; i++) {
        const offset = i * 1000;
        ctx.beginPath();
        ctx.moveTo(offset + 0, 600);
        ctx.lineTo(offset + 300, 200);
        ctx.lineTo(offset + 800, 600);
        ctx.fill();
    }
    ctx.restore();

    // --- WORLD ---
    ctx.save();
    ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));

    // Platforms
    ctx.fillStyle = "#0f3647";
    ctx.strokeStyle = "#1a5c7a";
    ctx.lineWidth = 2;
    for (const p of this.platforms) {
      if (
        p.x + p.width > cam.x &&
        p.x < cam.x + width &&
        p.y + p.height > cam.y &&
        p.y < cam.y + height
      ) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      }
    }

    // Bounce Pads
    for (const pad of this.bouncePads) {
      pad.render(ctx);
    }

    this.portal.render(ctx);

    for (const drop of this.drops) drop.render(ctx);
    for (const mob of this.mobs) mob.render(ctx);
    for (const p of this.projectiles) p.render(ctx);

    this.player.render(ctx);
    this.game.particles.render(ctx);
    this.floatingText.render(ctx);

    if (!this.player.isDead) {
        const pBounds = this.player.getBounds();
        const portalBounds = this.portal.getBounds();
        if (this.aabb(pBounds, portalBounds)) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Inter, system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText("[▲] Enter", this.portal.x + this.portal.width/2, this.portal.y - 30);
        }
    }

    ctx.restore();

    // Minimap
    this.minimap.render(ctx, this.player, [this.portal]);
  }
}
