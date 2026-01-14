
import { Game } from "../core/Game";
import { COSMETICS } from "../data/cosmetics";
import { Rect } from "../../types";
import { IconRenderer } from "./IconRenderer";
import { AssetLoader } from "../core/AssetLoader";

interface QuickSlotDef {
    key: string;
    rect: Rect;
}

interface SkillButtonDef {
    key: string;
    label: string;
    rect: Rect;
}

export class MainHUD {
  private game: Game;
  private static errlSprite: HTMLImageElement | null = null;
  private static spriteLoaded: boolean = false;
  
  // Layout Config
  private readonly BAR_HEIGHT = 60;
  private readonly EXP_HEIGHT = 4; // Thin bar
  
  // Interactive Rects
  private btnInventory: Rect = { x: 0, y: 0, width: 40, height: 40 };
  private btnQuest: Rect = { x: 0, y: 0, width: 40, height: 40 };
  private btnMenu: Rect = { x: 0, y: 0, width: 40, height: 40 };

  // Quick Slots
  private quickSlots: QuickSlotDef[] = [];
  
  // Skill Buttons (second row)
  private skillButtons: SkillButtonDef[] = [];

  constructor(game: Game) {
    this.game = game;
    
    // Load Errl sprite for badge if not already loaded
    if (!MainHUD.spriteLoaded) {
      MainHUD.spriteLoaded = true;
      AssetLoader.loadImage('/Errl.png')
        .then(img => {
          MainHUD.errlSprite = img;
          console.log('Errl badge sprite loaded successfully');
        })
        .catch(() => {
          return AssetLoader.loadImage('/errl.png');
        })
        .then(img => {
          if (img) {
            MainHUD.errlSprite = img;
            console.log('Errl badge sprite loaded successfully (lowercase)');
          }
        })
        .catch(err => {
          console.warn('Errl badge sprite not found, using default rendering:', err);
          MainHUD.errlSprite = null;
        });
    }
  }

  public update(dt: number): void {
    // We only update/render if in a gameplay scene
    if (!this.isVisible()) {
      // Debug: Log occasionally to see why HUD isn't visible
      if (Math.random() < 0.01) {
        console.log("MainHUD.update - Not visible. Current scene:", this.game.sceneManager.currentName);
      }
      return;
    }

    const input = this.game.input;
    const { width, height } = this.game;

    // --- LAYOUT ---
    // Adjust bottomY to account for skill button row (2 rows of 24px buttons + gaps)
    const bottomY = height - 55; // Moved up to fit both rows: 24 + 2 + 24 + 5 = 55px
    
    // Group 1: Menu Buttons (Right Aligned)
    // [Bag][Quest][Menu]
    const btnSize = 40;
    const margin = 20;
    
    this.btnMenu = { x: width - margin - btnSize, y: bottomY, width: btnSize, height: btnSize };
    this.btnQuest = { x: width - margin - btnSize*2 - 10, y: bottomY, width: btnSize, height: btnSize };
    this.btnInventory = { x: width - margin - btnSize*3 - 20, y: bottomY, width: btnSize, height: btnSize };

    // Group 2: Quick Slots (Left of Menu Group)
    // [H][J][K][L] -> Gap -> [Bag]...
    const slotHeight = 24; // Height stays the same
    const slotWidth = 32; // Wider buttons
    const slotGap = 3; // Reduced gap
    const groupGap = 30;
    const rowGap = 2; // Reduced gap between rows
    
    const startSlotsX = this.btnInventory.x - groupGap - (slotWidth * 4) - (slotGap * 3);
    
    // Row 1: Quick Slots
    ['H', 'J', 'K', 'L'].forEach((key, i) => {
        this.quickSlots[i] = {
            key,
            rect: {
                x: startSlotsX + i * (slotWidth + slotGap),
                y: bottomY,
                width: slotWidth,
                height: slotHeight
            }
        };
    });
    
    // Row 2: Skill Buttons (below quick slots)
    const skillButtonY = bottomY + slotHeight + rowGap;
    const skillButtons: Array<{ key: string; label: string }> = [
        { key: 'z', label: 'Z' },      // Attack
        { key: 'x', label: 'X' },      // Magic
        { key: 'Shift', label: 'Shift' }, // Dash
        { key: ' ', label: 'Space' }   // Jump
    ];
    
    skillButtons.forEach((skill, i) => {
        this.skillButtons[i] = {
            key: skill.key,
            label: skill.label,
            rect: {
                x: startSlotsX + i * (slotWidth + slotGap),
                y: skillButtonY,
                width: slotWidth,
                height: slotHeight
            }
        };
    });


    // --- MOUSE INTERACTION ---

    // 1. Drop from Inventory
    if (this.game.inventoryUI.isActive && this.game.inventoryUI.draggedItem && input.wasMouseReleased) {
        for (const slot of this.quickSlots) {
             if (this.contains(slot.rect, input.mouseX, input.mouseY)) {
                 this.game.assignQuickSlot(slot.key, this.game.inventoryUI.draggedItem.id);
                 this.game.inventoryUI.draggedItem = null; // Clear drag
                 return;
             }
        }
    }

    // 2. Click Logic
    if (input.wasMousePressed) {
        if (this.contains(this.btnInventory, input.mouseX, input.mouseY)) {
            this.game.inventoryUI.toggle();
        }
        else if (this.contains(this.btnQuest, input.mouseX, input.mouseY)) {
            this.game.questLogUI.toggle();
        }
        else if (this.contains(this.btnMenu, input.mouseX, input.mouseY)) {
            this.game.sceneManager.setScene('title');
            this.game.audio.playSfx('step');
        }
        
        // Quick Slot Click
        for (const slot of this.quickSlots) {
            if (this.contains(slot.rect, input.mouseX, input.mouseY)) {
                const itemId = this.game.state.quickSlots[slot.key];
                if (itemId) {
                    this.game.useItem(itemId);
                }
            }
        }
    }
  }

  private contains(rect: Rect, x: number, y: number): boolean {
      return x >= rect.x && x <= rect.x + rect.width &&
             y >= rect.y && y <= rect.y + rect.height;
  }

  private isVisible(): boolean {
      const s = this.game.sceneManager.currentName;
      return s === 'town' || s === 'field' || s === 'boss' || s === 'devroom';
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isVisible()) return;

    const { width, height } = this.game;
    const p = this.game.state.player;
    
    // Draw Quest Tracker (Top Right - now includes daily)
    this.game.questTrackerUI.render(ctx);

    // --- BOTTOM BAR ---
    const barY = height - this.BAR_HEIGHT;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = "#0a0a10";
    ctx.fillRect(0, barY, width, this.BAR_HEIGHT);
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(width, barY);
    ctx.stroke();

    // --- AVATAR BADGE (Left) ---
    const avatarX = 40;
    const avatarY = barY + 30;
    
    // Badge BG
    ctx.fillStyle = "#162032";
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#48f0ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render Mini-Errl
    this.renderAvatar(ctx, avatarX, avatarY + 10);

    // Level Badge
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(avatarX - 20, avatarY + 15, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.level.toString(), avatarX - 20, avatarY + 15);

    // Name
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Inter, system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Errl", avatarX + 35, barY + 20);

    // --- BARS (HP/MP) ---
    const barStartX = avatarX + 35;
    const barW = 200;
    
    // HP
    const hpPct = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = "#300";
    ctx.fillRect(barStartX, barY + 26, barW, 12);
    ctx.fillStyle = "#ff2a2a";
    ctx.fillRect(barStartX, barY + 26, barW * hpPct, 12);
    // Glass highlight
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(barStartX, barY + 26, barW * hpPct, 6);
    
    ctx.font = "10px Inter, system-ui";
    ctx.fillStyle = "#fff";
    ctx.fillText(`HP ${Math.ceil(p.hp)}/${p.maxHp}`, barStartX + 5, barY + 36);

    // MP
    const mpPct = Math.max(0, p.mp / p.maxMp);
    ctx.fillStyle = "#003";
    ctx.fillRect(barStartX, barY + 40, barW, 12);
    ctx.fillStyle = "#34e1ff";
    ctx.fillRect(barStartX, barY + 40, barW * mpPct, 12);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(barStartX, barY + 40, barW * mpPct, 6);

    ctx.fillStyle = "#fff";
    ctx.fillText(`MP ${Math.floor(p.mp)}/${p.maxMp}`, barStartX + 5, barY + 50);

    // --- QUICK SLOTS ---
    for (const slot of this.quickSlots) {
        this.renderQuickSlot(ctx, slot);
    }
    
    // --- SKILL BUTTONS (Second Row) ---
    for (const skill of this.skillButtons) {
        this.renderSkillButton(ctx, skill);
    }

    // --- MENU BUTTONS (Right) ---
    this.renderMenuButton(ctx, this.btnInventory, 'bag', "#34e1ff");
    this.renderMenuButton(ctx, this.btnQuest, 'scroll', "#ffd700");
    this.renderMenuButton(ctx, this.btnMenu, 'gear', "#aaa");

    // --- EXP BAR (Bottom Edge) ---
    const xpPct = p.xp / p.xpToNext;
    const expY = height - this.EXP_HEIGHT;
    
    ctx.fillStyle = "#111";
    ctx.fillRect(0, expY, width, this.EXP_HEIGHT);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(0, expY, width * xpPct, this.EXP_HEIGHT);
    
    // Percentage Text (Above Bar)
    const pctString = (xpPct * 100).toFixed(2) + "%";
    
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 10px Inter, system-ui";
    
    const textX = width / 2;
    const textY = expY - 2;

    // Outline for readability
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeText(`EXP ${pctString}`, textX, textY);
    
    // Text fill
    ctx.fillStyle = "#fff";
    ctx.fillText(`EXP ${pctString}`, textX, textY);

    ctx.restore();
  }

  private renderQuickSlot(ctx: CanvasRenderingContext2D, slot: QuickSlotDef) {
      const r = slot.rect;
      const itemId = this.game.state.quickSlots[slot.key];
      const item = itemId ? this.game.state.player.inventory.find(i => i.id === itemId) : null;
      
      // BG
      ctx.fillStyle = "#111";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      
      // Hotkey Label (Top Left - More defined)
      ctx.font = "bold 10px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      // Subtle outline for readability
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.strokeText(slot.key, r.x + 2, r.y + 2);
      ctx.fillStyle = "#aaa";
      ctx.fillText(slot.key, r.x + 2, r.y + 2);
      
      // Content
      if (item) {
          IconRenderer.renderItem(ctx, item.id, r.x + 2, r.y + 12, 18); // Icon below label
          
          // Count
          if (item.count > 1) {
              ctx.fillStyle = "#fff";
              ctx.font = "8px Inter, system-ui";
              ctx.textAlign = "right";
              ctx.textBaseline = "bottom";
              ctx.fillText(item.count.toString(), r.x + r.width - 1, r.y + r.height - 1);
          }
      }
  }

  private renderSkillButton(ctx: CanvasRenderingContext2D, skill: SkillButtonDef) {
      const r = skill.rect;
      const input = this.game.input;
      
      // Check if key is currently pressed
      const isPressed = input.isDown(skill.key) || 
                       (skill.key === ' ' && (input.isDown(' ') || input.isDown('ArrowUp') || input.isDown('w') || input.isDown('W'))) ||
                       (skill.key === 'Shift' && input.isDown('Shift'));
      
      // BG
      ctx.fillStyle = isPressed ? "#333" : "#111";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = isPressed ? "#34e1ff" : "#444";
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      
      // Key Label (Top Left - More defined)
      let displayLabel = skill.label;
      if (skill.label === 'Shift') {
          displayLabel = 'Shft';
      } else if (skill.label === 'Space') {
          displayLabel = 'Spc';
      } else if (skill.label.length > 4) {
          displayLabel = skill.label.substring(0, 4);
      }
      
      ctx.font = "bold 10px Inter, system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      // Subtle outline for readability
      ctx.strokeStyle = isPressed ? "#1a8f9f" : "#333";
      ctx.lineWidth = 1.5;
      ctx.strokeText(displayLabel, r.x + 2, r.y + 2);
      ctx.fillStyle = isPressed ? "#34e1ff" : "#aaa";
      ctx.fillText(displayLabel, r.x + 2, r.y + 2);
  }

  private renderMenuButton(ctx: CanvasRenderingContext2D, r: Rect, type: 'bag'|'scroll'|'gear', color: string) {
      // Text label on top of icon
      ctx.fillStyle = "#aaa";
      ctx.font = "9px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const label = type === 'bag' ? 'Inv' : type === 'scroll' ? 'Quest' : 'Menu';
      ctx.fillText(label, r.x + r.width / 2, r.y - 2);
      
      // Button background
      ctx.fillStyle = "#222";
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      
      // Icon
      IconRenderer.renderUiIcon(ctx, type, r.x + 4, r.y + 4, 32, color);
  }

  private renderAvatar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    // Use Errl sprite if available, otherwise fall back to default
    if (MainHUD.errlSprite && MainHUD.errlSprite.complete && MainHUD.errlSprite.naturalWidth > 0) {
      ctx.save();
      const size = 24; // Badge size
      const scale = 1.2; // Scale up slightly to fill badge better
      const scaledSize = size * scale;
      
      // Draw the entire Errl sprite image
      ctx.drawImage(
        MainHUD.errlSprite,
        cx - scaledSize / 2, cy - scaledSize / 2, scaledSize, scaledSize
      );
      ctx.restore();
      return;
    }
    
    // Fallback: Default rendering
      const p = this.game.state.player;
      const cos = p.cosmetics;
      
      // Scale down
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.8, 0.8);
      
      // Body Color
      let bodyColor = "#8afff2"; 
      if (p.equipment.armor === 'leather_armor') bodyColor = "#a0522d";
      if (cos.bodyColor) {
         const def = COSMETICS[cos.bodyColor];
         if (def && def.color) bodyColor = def.color;
      }
      
      // Draw Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(-12, -24, 24, 24, 6);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#050811";
      ctx.beginPath();
      ctx.arc(-4, -14, 2, 0, Math.PI*2);
      ctx.arc(4, -14, 2, 0, Math.PI*2);
      ctx.fill();

      // Hat
      if (cos.hat) {
          const def = COSMETICS[cos.hat];
          if (def) {
            ctx.save();
            ctx.translate(0, -24);
             if (cos.hat === 'hat_crown') {
                ctx.fillStyle = def.color || '#ffd700';
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-12, -10);
                ctx.lineTo(-4, -4);
                ctx.lineTo(0, -15);
                ctx.lineTo(4, -4);
                ctx.lineTo(12, -10);
                ctx.lineTo(12, 0);
                ctx.fill();
            } else if (cos.hat === 'hat_viking') {
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.arc(0, 0, 12, Math.PI, 0); 
                ctx.fill();
                ctx.fillStyle = '#eee';
                ctx.beginPath();
                ctx.moveTo(-10, -4); ctx.lineTo(-18, -14); ctx.lineTo(-8, -8); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(10, -4); ctx.lineTo(18, -14); ctx.lineTo(8, -8); ctx.fill();
            } else if (cos.hat === 'hat_cowboy') {
                 ctx.fillStyle = def.color || '#8B4513';
                 ctx.fillRect(-16, -4, 32, 4); 
                 ctx.fillRect(-10, -14, 20, 10); 
            }
            ctx.restore();
          }
      }

      ctx.restore();
  }
}
