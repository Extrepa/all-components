
import { Game } from "../core/Game";
import { Scene, Rect } from "../../types";
import { Player } from "../entities/Player";
import { Portal } from "../entities/Portal";
import { FloatingTextManager } from "../effects/FloatingTextManager";
import { Minimap } from "../ui/Minimap";
import { DevMenu } from "../ui/dev/DevMenu";
import { DevState } from "../dev/DevState";
import { Mob } from "../entities/Mob";
import { Slime } from "../entities/Slime";
import { RoyalSlime } from "../entities/RoyalSlime";

export class DevRoomScene implements Scene {
  private game: Game;
  private player: Player;
  private platforms: Rect[];
  private portal: Portal;
  private floatingText: FloatingTextManager;
  private minimap: Minimap;
  private devMenu: DevMenu;
  private mobs: Mob[] = []; // Spawned enemies for testing
  
  private readonly MAP_WIDTH = 2000;
  private readonly MAP_HEIGHT = 600;

  constructor(game: Game) {
    this.game = game;
    this.floatingText = new FloatingTextManager();
    
    // Dev Room: Simple sandbox with platforms for testing
    this.platforms = [
      { x: 0, y: 500, width: 2000, height: 100 }, // Main floor
      { x: 200, y: 400, width: 300, height: 20 }, // Platform 1
      { x: 600, y: 350, width: 300, height: 20 }, // Platform 2
      { x: 1000, y: 300, width: 300, height: 20 }, // Platform 3
      { x: 1400, y: 250, width: 300, height: 20 }, // Platform 4
      { x: -50, y: 0, width: 50, height: this.MAP_HEIGHT }, // Left wall
      { x: this.MAP_WIDTH, y: 0, width: 50, height: this.MAP_HEIGHT }, // Right wall
    ];

    // Player will be created in onEnter to ensure game state is ready
    // Create a temporary player for type safety, but it will be replaced in onEnter
    this.player = new Player(game, 500, 468);
    this.portal = new Portal(100, 390, "town", "Exit Dev Room", "#ff00ff");
    
    try {
      this.minimap = new Minimap(game, this.MAP_WIDTH, this.MAP_HEIGHT, "Dev Room");
      this.devMenu = new DevMenu(game);
    } catch (error) {
      console.error("Error initializing DevRoomScene components:", error);
      throw error;
    }
  }

  onEnter(): void {
    console.log("Entered DevRoomScene - Welcome, Developer!");
    console.log("Scene name should be 'devroom':", this.game.sceneManager.currentName);
    
    try {
      // Ensure player state exists (create if coming from title)
      if (!this.game.state || !this.game.state.player) {
        console.log("Creating new game state...");
        this.game.state = this.game.getNewGameState();
      }
      
      // Recreate player to ensure it's properly initialized with game state
      // Spawn on ground (main floor is at y: 500, player height is 32)
      console.log("Creating player at (500, 468)...");
      this.player = new Player(this.game, 500, 468);
      this.player.isDead = false;
      this.player.invulnTimer = 0;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.disableWallSliding = false; // Enable wall sliding in Dev Room
      
      console.log("Player created successfully. Position:", this.player.x, this.player.y);
      
      // Initialize camera to follow player immediately
      this.game.camera.setMapSize(this.MAP_WIDTH, this.MAP_HEIGHT);
      // Set camera position directly first (snap to player)
      this.game.camera.x = this.player.x + this.player.width / 2 - this.game.width / 2;
      this.game.camera.y = this.player.y + this.player.height / 2 - this.game.height / 2;
      // Then use follow with a small dt to initialize smoothly
      this.game.camera.follow(this.player, 0.016); // Use normal frame time instead of 100
      this.game.particles.clear();
      
      console.log("DevRoomScene.onEnter() completed successfully");
    } catch (error) {
      console.error("Error in DevRoomScene.onEnter():", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      throw error; // Re-throw to see the error
    }
    
    // Welcome message
    const devState = DevState.getInstance();
    if (!devState.devModeActive) {
      this.floatingText.spawn(
        this.player.x + this.player.width / 2,
        this.player.y - 50,
        "Press ~ or F1 to open Dev Menu",
        "#34e1ff",
        false
      );
      
      setTimeout(() => {
        this.floatingText.spawn(
          this.player.x + this.player.width / 2,
          this.player.y - 80,
          "Activate Dev Mode to test features",
          "#ff00ff",
          false
        );
      }, 1000);
    } else {
      this.floatingText.spawn(
        this.player.x + this.player.width / 2,
        this.player.y - 50,
        "[DEV_MODE_ACTIVE]",
        "#00ff00",
        false
      );
    }
  }

  update(dt: number): void {
    // Safety check: ensure dt is valid (but allow very small values like 0.001)
    if (!isFinite(dt) || dt < 0) {
      console.warn("DevRoomScene.update: Invalid dt:", dt);
      return;
    }
    
    // Use a minimum dt to prevent division by zero, but allow normal frame times
    const safeDt = Math.max(dt, 0.0001);

    // Safety check: ensure player exists
    if (!this.player) {
      console.error("DevRoomScene.update: Player is null!");
      return;
    }

    const input = this.game.input;

    // Dev Menu has priority - check for toggle key first
    try {
      this.devMenu.update(dt);
    } catch (error) {
      console.error("Error in devMenu.update():", error);
    }
    
    if (this.devMenu.isActive) {
      // Still update camera and effects even when menu is open
      this.game.camera.follow(this.player, safeDt);
      this.floatingText.update(safeDt);
      this.game.particles.update(safeDt);
      this.minimap.update(safeDt);
      return; // Pause game when menu is open
    }

    // Return to title with Escape (only if menu not open)
    if (input.wasPressed("Escape")) {
      this.game.sceneManager.setScene("title");
      return;
    }

    // Apply time scale if set
    const devState = DevState.getInstance();
    const effectiveDt = safeDt * devState.timeScale;

    // Player Physics (only update if menu is closed)
    // Ensure player exists and is not dead
    if (this.player && !this.player.isDead) {
      try {
        this.player.update(effectiveDt, this.platforms);
      } catch (error) {
        console.error("Error in player.update():", error);
      }
    }
    
    // Update mobs
    const devState2 = DevState.getInstance();
    if (!devState2.freezeAI) {
      for (const mob of this.mobs) {
        mob.update(effectiveDt, this.platforms);
      }
    }
    // Remove dead mobs
    this.mobs = this.mobs.filter(m => !m.isDead);
    
    // Portal Update
    this.portal.update(effectiveDt);
    
    // Portal Interaction
    this.checkPortalInteraction();
    
    // Effects
    this.floatingText.update(effectiveDt);
    this.game.particles.update(effectiveDt);
    
    // Minimap
    this.minimap.update(effectiveDt);

    // Camera
    this.game.camera.follow(this.player, effectiveDt);
  }

  private checkPortalInteraction(): void {
    const input = this.game.input;
    const playerBounds = this.player.getBounds();
    
    if (this.aabb(playerBounds, this.portal.getBounds())) {
      if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
        this.game.audio.playSfx('jump');
        this.game.sceneManager.setScene(this.portal.destination);
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
    const cam = this.game.camera;

    // Background (Dark with grid pattern for dev feel)
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, width, height);

    // Grid pattern
    ctx.strokeStyle = "rgba(52, 225, 255, 0.1)";
    ctx.lineWidth = 1;
    const gridSize = 50;
    const offsetX = (-cam.x) % gridSize;
    const offsetY = (-cam.y) % gridSize;
    
    ctx.beginPath();
    for (let x = offsetX; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offsetY; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Apply camera transform
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // Platforms
    ctx.fillStyle = "#1a1a2a";
    ctx.strokeStyle = "#34e1ff";
    ctx.lineWidth = 2;
    for (const p of this.platforms) {
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeRect(p.x, p.y, p.width, p.height);
    }

    // Portal
    this.portal.render(ctx);

    // Mobs
    for (const mob of this.mobs) {
      mob.render(ctx);
    }

    // Player
    this.player.render(ctx);

    // Visual Debug: Hitboxes
    const devState = DevState.getInstance();
    if (devState.showHitboxes) {
      this.renderHitboxes(ctx);
    }

    // Visual Debug: AI State
    if (devState.showAIState) {
      this.renderAIState(ctx);
    }

    // Effects
    this.floatingText.render(ctx);
    this.game.particles.render(ctx);

    ctx.restore();

    // UI Overlays
    this.minimap.render(ctx, this.player, [this.portal]);
    
    // Dev Room Label (Top Right - Condensed)
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    // Title
    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 14px Inter, system-ui";
    ctx.fillText("DEV ROOM", width - 20, 20);
    
    // Instructions (smaller, on same line or just below)
    ctx.fillStyle = "#34e1ff";
    ctx.font = "10px Inter, system-ui";
    ctx.fillText("~ or F1: Menu | ESC: Exit", width - 20, 38);
    ctx.restore();
    
    // Dev Menu (renders on top)
    this.devMenu.render(ctx);
  }

  private renderHitboxes(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;

    // Player hitbox
    const pBounds = this.player.getBounds();
    ctx.strokeRect(pBounds.x, pBounds.y, pBounds.width, pBounds.height);

    // Player attack hitbox
    if (this.player.isAttacking) {
      const attackBox = this.player.getAttackHitbox();
      if (attackBox) {
        ctx.strokeStyle = "#ffff00";
        ctx.strokeRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
      }
    }

    // Mob hitboxes
    ctx.strokeStyle = "#ff00ff";
    for (const mob of this.mobs) {
      const mBounds = mob.getBounds();
      ctx.strokeRect(mBounds.x, mBounds.y, mBounds.width, mBounds.height);
    }

    // Platform hitboxes
    ctx.strokeStyle = "#00ffff";
    for (const p of this.platforms) {
      ctx.strokeRect(p.x, p.y, p.width, p.height);
    }

    ctx.restore();
  }

  private renderAIState(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#00ff00";
    ctx.globalAlpha = 0.9;

    // Player state
    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y - 5;
    let stateText = `Player: ${this.player.isGrounded ? "Grounded" : "Airborne"}`;
    if (this.player.isAttacking) stateText += " | Attacking";
    if (this.player.isDashing) stateText += " | Dashing";
    ctx.fillText(stateText, pCenterX, pCenterY);

    // Mob AI states
    for (const mob of this.mobs) {
      if (mob instanceof Slime) {
        const mCenterX = mob.x + mob.width / 2;
        const mCenterY = mob.y - 5;
        const hpPercent = Math.floor((mob.hp / mob.maxHp) * 100);
        ctx.fillText(`Slime: ${hpPercent}% HP`, mCenterX, mCenterY);
      } else if (mob instanceof RoyalSlime) {
        const mCenterX = mob.x + mob.width / 2;
        const mCenterY = mob.y - 5;
        const hpPercent = Math.floor((mob.hp / mob.maxHp) * 100);
        ctx.fillText(`Boss: ${hpPercent}% HP`, mCenterX, mCenterY);
      }
    }

    ctx.restore();
  }

  // Public methods for DevMenu to call
  public spawnSlimeAtPlayer(): void {
    const x = this.player.x + (Math.random() - 0.5) * 100;
    const y = this.player.y - 50;
    this.mobs.push(new Slime(this.game, x, y));
  }

  public spawnSlimeAtMouse(): void {
    const input = this.game.input;
    const cam = this.game.camera;
    const worldX = input.mouseX + cam.x;
    const worldY = input.mouseY + cam.y;
    this.mobs.push(new Slime(this.game, worldX, worldY));
  }

  public spawnBossAtPlayer(): void {
    const x = this.player.x + (Math.random() - 0.5) * 100;
    const y = this.player.y - 50;
    const boss = new RoyalSlime(this.game, x, y);
    boss.setTarget(this.player);
    this.mobs.push(boss);
  }

  public killAllMobs(): void {
    for (const mob of this.mobs) {
      mob.hp = 0;
      mob.isDead = true;
    }
    this.mobs = [];
  }
}

