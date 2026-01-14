
import { Game } from "../core/Game";
import { Item } from "../../types";
import { COSMETICS } from "../data/cosmetics";
import { getItemDescription } from "../data/items";
import { IconRenderer } from "./IconRenderer";

interface ShopEntry {
  item: Partial<Item>;
  cost: number;
  description: string;
}

export class ShopUI {
  private game: Game;
  public isActive: boolean = false;
  
  private items: ShopEntry[] = [];
  
  private selectedIndex: number = 0;
  private shakeTimer: number = 0; 

  constructor(game: Game) {
    this.game = game;
    this.initItems();
  }

  private initItems() {
      // 1. Basic Supplies
      this.items.push({ 
        item: { id: 'potion', name: 'Red Potion', type: 'consumable' }, 
        cost: 10, 
        description: getItemDescription('potion', 'Restores 20 HP.')
      });
      this.items.push({ 
        item: { id: 'ether', name: 'Ether', type: 'consumable' }, 
        cost: 15, 
        description: getItemDescription('ether', 'Restores 20 MP.')
      });
      
      // 2. Equipment
      this.items.push({
        item: { 
            id: 'iron_sword', 
            name: 'Iron Sword', 
            type: 'equip', 
            slot: 'weapon', 
            stats: { attack: 10 } 
        },
        cost: 50,
        description: getItemDescription('iron_sword', 'A standard soldier\'s blade. (+10 ATK)')
      });
      this.items.push({
        item: {
            id: 'leather_armor',
            name: 'Leather Armor',
            type: 'equip',
            slot: 'armor',
            stats: { defense: 5 }
        },
        cost: 40,
        description: getItemDescription('leather_armor', 'Basic protection. (+5 DEF)')
      });

      // 3. Cosmetics (From Data)
      for (const key in COSMETICS) {
          const def = COSMETICS[key];
          this.items.push({
              item: {
                  id: def.id,
                  name: def.name,
                  type: 'cosmetic',
                  slot: def.type
              },
              cost: def.cost,
              description: getItemDescription(def.id, def.description)
          });
      }
  }

  public open(): void {
    this.isActive = true;
    this.selectedIndex = 0;
  }

  public close(): void {
    this.isActive = false;
  }

  public update(dt: number): void {
    if (!this.isActive) return;
    
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    const input = this.game.input;

    if (input.wasPressed("Escape") || input.wasPressed("x")) {
      if (input.wasPressed("Escape")) input.consume("Escape");
      this.close();
      return;
    }

    // Navigation
    if (input.wasPressed("ArrowUp") || input.wasPressed("w")) {
      this.selectedIndex--;
      if (this.selectedIndex < 0) this.selectedIndex = this.items.length - 1;
      this.game.audio.playSfx('step');
    }
    if (input.wasPressed("ArrowDown") || input.wasPressed("s")) {
      this.selectedIndex++;
      if (this.selectedIndex >= this.items.length) this.selectedIndex = 0;
      this.game.audio.playSfx('step');
    }

    // Buy
    if (input.wasPressed("Enter") || input.wasPressed("z") || input.wasPressed(" ")) {
       const entry = this.items[this.selectedIndex];
       const success = this.game.buyItem(entry.item, entry.cost);
       
       if (success) {
           this.game.audio.playSfx('collect');
           this.game.saveSystem.save(this.game.state); // Auto save on purchase
       } else {
           this.shakeTimer = 0.3;
       }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const { width, height } = this.game;

    // Dim Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, height);

    // Window config
    const winW = 500;
    const winH = 400;
    const winX = (width - winW) / 2;
    const winY = (height - winH) / 2;

    ctx.save();
    
    // Window BG
    ctx.fillStyle = "#150b24"; // Dark purple
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = "#8b5cf6"; // Violet
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);

    // Header
    ctx.fillStyle = "#8b5cf6";
    ctx.fillRect(winX, winY, winW, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Mira's Shop", winX + winW / 2, winY + 20);

    // Player Money
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff8ef5";
    ctx.font = "bold 16px Inter, system-ui";
    ctx.fillText(`${this.game.state.player.gooBits} Goo`, winX + winW - 20, winY + 70);

    // List Items (With Clipping/Scroll logic simplified: Only show window around selected)
    ctx.textAlign = "left";
    
    // Viewport logic
    const rowH = 35;
    const itemsPerPage = 8;
    const scrollOffset = Math.max(0, Math.min(this.selectedIndex - Math.floor(itemsPerPage / 2), this.items.length - itemsPerPage));
    const startY = winY + 90;

    for (let i = 0; i < itemsPerPage; i++) {
        const itemIndex = scrollOffset + i;
        if (itemIndex >= this.items.length) break;

        const entry = this.items[itemIndex];
        const isSelected = itemIndex === this.selectedIndex;
        const y = startY + i * rowH;

        if (isSelected) {
            ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
            let xOffset = 0;
            if (this.shakeTimer > 0) {
                xOffset = Math.sin(this.shakeTimer * 50) * 5;
            }
            ctx.fillRect(winX + 20 + xOffset, y - 5, winW - 40, rowH - 10);
            
            // Arrow
            ctx.fillStyle = "#fff";
            ctx.fillText("▶", winX + 30 + xOffset, y + 10);
        }

        // Item Icon
        IconRenderer.renderItem(ctx, entry.item.id || '', winX + 25, y - 8, 24);
        
        ctx.fillStyle = isSelected ? "#fff" : "#aaa";
        ctx.font = "16px Inter, system-ui";
        ctx.fillText(entry.item.name || '???', winX + 60, y + 10);
        
        // Type badge (small)
        ctx.font = "10px Inter, system-ui";
        ctx.fillStyle = "#666";
        ctx.fillText(entry.item.type?.toUpperCase() || '', winX + 250, y + 10);

        // Cost
        ctx.textAlign = "right";
        ctx.font = "16px Inter, system-ui";
        const canAfford = this.game.state.player.gooBits >= entry.cost;
        ctx.fillStyle = canAfford ? "#ff8ef5" : "#555";
        ctx.fillText(`${entry.cost}`, winX + winW - 60, y + 10);
        ctx.textAlign = "left";
    }

    // Scrollbar indicator
    if (this.items.length > itemsPerPage) {
        const scrollPct = scrollOffset / (this.items.length - itemsPerPage);
        const barH = 200;
        const knobY = startY + scrollPct * (barH - 20);
        ctx.fillStyle = "#333";
        ctx.fillRect(winX + winW - 10, startY, 4, barH);
        ctx.fillStyle = "#8b5cf6";
        ctx.fillRect(winX + winW - 10, knobY, 4, 20);
    }

    // Description Box
    const selectedItem = this.items[this.selectedIndex];
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(winX + 20, winY + winH - 60, winW - 40, 40);
    ctx.fillStyle = "#ccc";
    ctx.font = "italic 14px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText(selectedItem.description, winX + winW / 2, winY + winH - 35);

    // Footer
    ctx.fillStyle = "#666";
    ctx.font = "12px Inter, system-ui";
    ctx.fillText("[Enter] Buy   [Esc] Leave", winX + winW / 2, winY + winH + 20);

    ctx.restore();
  }
}
