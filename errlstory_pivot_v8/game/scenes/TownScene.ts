
import { Game } from "../core/Game";
import { Scene, Rect } from "../../types";
import { Player } from "../entities/Player";
import { NPC } from "../entities/NPC";
import { Merchant } from "../entities/Merchant";
import { Portal } from "../entities/Portal";
import { DialogueManager, DialogueOption } from "../ui/DialogueManager";
import { ShopUI } from "../ui/ShopUI";
import { FloatingTextManager } from "../effects/FloatingTextManager";
import { Minimap } from "../ui/Minimap";

export class TownScene implements Scene {
  private game: Game;
  private player: Player;
  private elder: NPC;
  private merchant: Merchant;
  private portals: Portal[] = [];
  private dialogue: DialogueManager;
  private shop: ShopUI;
  private floatingText: FloatingTextManager;
  private minimap: Minimap;
  
  private platforms: Rect[];

  constructor(game: Game) {
    this.game = game;
    this.dialogue = new DialogueManager(game);
    this.shop = new ShopUI(game);
    this.floatingText = new FloatingTextManager();
    
    // Town Geometry (Simple flat ground)
    this.platforms = [
        { x: 0, y: 480, width: 2000, height: 60 }, // Floor
        { x: -50, y: 0, width: 50, height: 600 },  // Left Wall
        { x: 2000, y: 0, width: 50, height: 600 }, // Right Wall
    ];

    this.player = new Player(game, 200, 400);
    this.elder = new NPC(game, 600, 448, "Elder Errl");
    this.merchant = new Merchant(game, 900, 448);

    // Initialize Portals
    const groundY = 390; 
    
    this.portals = [
        // Left: To Field
        new Portal(80, groundY, "field", "To Slimey Hills", "#34e1ff"),
        // Right: To Boss
        new Portal(1850, groundY, "boss", "To Arena", "#d948ff"),
        // Center: Invisible Dev Room portal
        new Portal(1000, groundY, "devroom", "", "#ff00ff", true) // invisible flag
    ];

    this.minimap = new Minimap(game, 2000, 600, "Mayday Plaza");
  }

  onEnter(): void {
    console.log("Entered TownScene");
    this.game.camera.setMapSize(2000, 600);
    
    this.player.x = 200;
    this.player.y = 400;
    this.game.particles.clear();
    
    this.game.camera.follow(this.player, 100);
    this.game.dailySystem.checkDailyReset();
  }

  update(dt: number): void {
    const input = this.game.input;

    // UI Priority - Shop is Local, others are Global (handled in Game.ts)
    if (this.shop.isActive) {
        this.shop.update(dt);
        return;
    }
    
    if (this.dialogue.isActive) {
        this.dialogue.update(dt);
        return; 
    }

    if (input.wasPressed("Escape")) {
      this.game.sceneManager.setScene("title");
    }

    // Disable wall climbing in Town
    this.player.disableWallSliding = true;
    
    // Player Physics
    this.player.update(dt, this.platforms);
    
    // Entities Update
    this.elder.update(dt);
    this.merchant.update(dt);
    this.portals.forEach(p => p.update(dt));
    
    // Effects
    this.floatingText.update(dt);
    this.game.particles.update(dt);
    
    // Minimap
    this.minimap.update(dt);

    // Camera
    this.game.camera.follow(this.player, dt);

    // Interaction Check
    this.checkInteractions();
    
    // Daily System Update (timers)
    this.game.dailySystem.update(dt);
  }


  private checkInteractions() {
    const input = this.game.input;
    const playerBounds = this.player.getBounds();

    // 1. Elder Interaction
    let dx = this.player.x - this.elder.x;
    let dy = this.player.y - this.elder.y;
    if (Math.sqrt(dx*dx + dy*dy) < this.elder.interactionRadius) {
       if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
           this.handleElderDialogue();
           return;
       }
    }

    // 2. Merchant Interaction
    dx = this.player.x - this.merchant.x;
    dy = this.player.y - this.merchant.y;
    if (Math.sqrt(dx*dx + dy*dy) < this.merchant.interactionRadius) {
       if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
           this.shop.open();
           return;
       }
    }

    // 3. Portal Interaction
    for (const portal of this.portals) {
        if (this.aabb(playerBounds, portal.getBounds())) {
            if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
                this.game.audio.playSfx('jump'); 
                this.game.sceneManager.setScene(portal.destination);
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

  private handleElderDialogue() {
      const result = this.game.questSystem.interact("Elder Errl");
      
      if (result.type === 'TALK') {
          this.dialogue.start("Elder Errl", result.lines, result.action);
      } 
      else if (result.type === 'OFFER') {
          const options: DialogueOption[] = [
              { 
                  label: "Accept", 
                  action: () => {
                      if (result.onAccept) result.onAccept();
                  } 
              },
              { 
                  label: "Decline", 
                  action: () => {}
              }
          ];
          
          this.dialogue.start("Elder Errl", result.lines, undefined, options);
      }
      else {
          this.dialogue.start("Elder Errl", ["Greetings."]);
      }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.game;
    const cam = this.game.camera;

    // --- BACKGROUND ---
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#071b25");
    gradient.addColorStop(1, "#102a3a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // --- WORLD SPACE ---
    ctx.save();
    ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));

    // Ground
    ctx.fillStyle = "#1a1f2e";
    ctx.fillRect(0, 480, 2000, 60);
    ctx.strokeStyle = "#48f0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 480);
    ctx.lineTo(2000, 480);
    ctx.stroke();

    // Entities
    this.portals.forEach(p => p.render(ctx));
    this.elder.render(ctx);
    this.merchant.render(ctx);
    this.player.render(ctx);
    this.game.particles.render(ctx);
    this.floatingText.render(ctx);

    // --- Interaction Prompts ---
    if (!this.dialogue.isActive && !this.shop.isActive) {
        // Explicitly set baseline for HUD prompts
        ctx.textBaseline = "alphabetic";
        
        // Elder
        let dx = this.player.x - this.elder.x;
        let dy = this.player.y - this.elder.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.elder.interactionRadius) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Inter, system-ui";
            ctx.textAlign = "center";
            ctx.fillText("[▲] Talk", this.elder.x + 16, this.elder.y - 10);
        }

        // Merchant
        dx = this.player.x - this.merchant.x;
        dy = this.player.y - this.merchant.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.merchant.interactionRadius) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Inter, system-ui";
            ctx.textAlign = "center";
            ctx.fillText("[▲] Shop", this.merchant.x + 16, this.merchant.y - 10);
        }
        
        // Portals (skip invisible ones)
        const pBounds = this.player.getBounds();
        for(const portal of this.portals) {
            if (!portal.invisible && this.aabb(pBounds, portal.getBounds())) {
                ctx.fillStyle = "#fff";
                ctx.font = "bold 14px Inter, system-ui";
                ctx.textAlign = "center";
                ctx.fillText("[▲] Enter", portal.x + portal.width/2, portal.y - 30);
            }
        }
    }

    ctx.restore();

    // --- HUD ---
    
    // Minimap
    this.minimap.render(ctx, this.player, this.portals, [this.elder, this.merchant]);

    // Overlays
    this.dialogue.render(ctx);
    this.shop.render(ctx);
  }
}
