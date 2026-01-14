
import { Game } from "../core/Game";
import { Item, Rect } from "../../types";
import { IconRenderer } from "./IconRenderer";
import { getItemDescription } from "../data/items";

export class InventoryUI {
  private game: Game;
  public isActive: boolean = false;
  private selectedIndex: number = 0;
  
  // Drag State
  public draggedItem: Item | null = null;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public toggle(): void {
    this.isActive = !this.isActive;
    this.selectedIndex = 0;
    this.draggedItem = null;
    this.game.audio.playSfx('step');
  }

  public update(dt: number): void {
    const input = this.game.input;

    // Toggle Open/Close
    if (input.wasPressed("i") || input.wasPressed("I")) {
        if (input.wasPressed("i")) input.consume("i");
        if (input.wasPressed("I")) input.consume("I");
        this.toggle();
        return;
    }

    if (!this.isActive) return;

    // Close with Esc
    if (input.wasPressed("Escape")) {
        input.consume("Escape");
        this.toggle();
        return;
    }
    
    // --- MOUSE DRAG LOGIC ---
    if (this.draggedItem) {
        if (!input.isMouseDown) {
            // Drop handled by MainHUD or reset here
            this.draggedItem = null;
        }
        return; // Consume input while dragging
    }

    const inventory = this.game.state.player.inventory;

    // Navigation (Keyboard)
    if (input.wasPressed("ArrowUp") || input.wasPressed("w") || input.wasPressed("W")) {
        this.selectedIndex--;
        if (this.selectedIndex < 0) this.selectedIndex = Math.max(0, inventory.length - 1);
        this.game.audio.playSfx('step');
    }
    if (input.wasPressed("ArrowDown") || input.wasPressed("s") || input.wasPressed("S")) {
        this.selectedIndex++;
        if (this.selectedIndex >= inventory.length) this.selectedIndex = 0;
        this.game.audio.playSfx('step');
    }

    // Interaction (Keyboard)
    if (input.wasPressed("Enter") || input.wasPressed(" ")) {
        const item = inventory[this.selectedIndex];
        if (item) {
            this.game.useItem(item.id);
            if (this.selectedIndex >= this.game.state.player.inventory.length) {
                this.selectedIndex = Math.max(0, this.game.state.player.inventory.length - 1);
            }
        }
    }
    
    // Check Mouse Click on Items (Start Drag)
    if (input.wasMousePressed) {
        // Recalculate layout to find what was clicked
        // (Duplicated logic from render, ideally cached)
        const { width, height } = this.game;
        const w = 600;
        const h = 400;
        const x = (width - w) / 2;
        const y = (height - h) / 2;
        
        const rowH = 35;
        const startY = y + 70;
        const itemsPerPage = 9;
        const scrollOffset = Math.max(0, Math.min(this.selectedIndex - Math.floor(itemsPerPage / 2), inventory.length - itemsPerPage));

        for (let i = 0; i < itemsPerPage; i++) {
            const itemIndex = scrollOffset + i;
            if (itemIndex >= inventory.length) break;

            const rowY = startY + i * rowH;
            const itemRect: Rect = { x: x + 22, y: rowY - 10, width: 276, height: rowH };

            if (input.mouseX >= itemRect.x && input.mouseX <= itemRect.x + itemRect.width &&
                input.mouseY >= itemRect.y && input.mouseY <= itemRect.y + itemRect.height) {
                
                this.selectedIndex = itemIndex;
                this.draggedItem = inventory[itemIndex];
                this.game.audio.playSfx('collect'); // Pickup sound
                break;
            }
        }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const { width, height } = this.game;
    const inv = this.game.state.player.inventory;
    const stats = this.game.getPlayerStats();
    const p = this.game.state.player;

    // Dim Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, width, height);

    // Main Window
    const w = 600;
    const h = 400;
    const x = (width - w) / 2;
    const y = (height - h) / 2;

    ctx.save();

    // BG
    ctx.fillStyle = "#162032";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#34e1ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Header
    ctx.fillStyle = "#34e1ff";
    ctx.fillRect(x, y, w, 40);
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("INVENTORY", x + w / 2, y + 20);

    // --- LEFT PANEL: ITEM LIST ---
    ctx.fillStyle = "#0f1623";
    ctx.fillRect(x + 20, y + 60, 280, 320);
    
    const rowH = 35;
    const startY = y + 70;

    if (inv.length === 0) {
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.fillText("Empty", x + 160, startY + 50);
    }

    const itemsPerPage = 9;
    const scrollOffset = Math.max(0, Math.min(this.selectedIndex - Math.floor(itemsPerPage / 2), inv.length - itemsPerPage));

    for (let i = 0; i < itemsPerPage; i++) {
        const itemIndex = scrollOffset + i;
        if (itemIndex >= inv.length) break;

        const item = inv[itemIndex];
        const isSelected = itemIndex === this.selectedIndex;
        const rowY = startY + i * rowH;
        
        if (isSelected) {
            ctx.fillStyle = "rgba(52, 225, 255, 0.2)";
            ctx.fillRect(x + 22, rowY - 10, 276, rowH);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText("▶", x + 25, rowY);
        }

        ctx.textAlign = "left";
        ctx.font = "16px Inter, system-ui";
        
        // Gray out if currently being dragged
        if (this.draggedItem && this.draggedItem.id === item.id) {
            ctx.fillStyle = "#555";
        } else {
            ctx.fillStyle = isSelected ? "#fff" : "#aaa";
        }
        
        // Render Icon
        IconRenderer.renderItem(ctx, item.id, x + 45, rowY - 16, 24);
        
        // Name
        ctx.fillText(item.name, x + 70, rowY);

        // Equipped Badge
        let isEquipped = false;
        
        if (item.type === 'equip') {
            isEquipped = (p.equipment.weapon === item.id) || (p.equipment.armor === item.id);
        } else if (item.type === 'cosmetic') {
             if (item.slot) {
                 isEquipped = (p.cosmetics as any)[item.slot] === item.id;
             }
        }
        
        if (isEquipped) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 12px Inter, system-ui";
            ctx.fillText("[E]", x + 270, rowY);
        } else if (item.count > 1) {
            ctx.fillStyle = "#aaa";
            ctx.font = "12px Inter, system-ui";
            ctx.fillText(`x${item.count}`, x + 270, rowY);
        }
    }

    // --- RIGHT PANEL: STATS ---
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Inter, system-ui";
    ctx.fillText("Character Stats", x + 320, y + 80);

    const statX = x + 320;
    const statY = y + 110;
    const gap = 25;

    ctx.font = "14px Inter, system-ui";
    ctx.fillStyle = "#ccc";
    
    ctx.fillText(`Level: ${stats.level}`, statX, statY);
    ctx.fillText(`XP: ${stats.xp} / ${stats.xpToNext}`, statX, statY + gap);
    
    ctx.fillStyle = "#ff5555";
    ctx.fillText(`HP: ${stats.hp} / ${stats.maxHp}`, statX, statY + gap * 2);
    
    ctx.fillStyle = "#55aaff";
    ctx.fillText(`MP: ${stats.mp} / ${stats.maxMp}`, statX, statY + gap * 3);

    ctx.fillStyle = "#ffd700";
    ctx.fillText(`Attack: ${stats.attack}`, statX, statY + gap * 4);
    
    ctx.fillStyle = "#48f0ff";
    ctx.fillText(`Defense: ${stats.defense}`, statX, statY + gap * 5);

    ctx.fillStyle = "#ff8ef5";
    ctx.fillText(`Goo Bits: ${stats.gooBits}`, statX, statY + gap * 7);

    // --- SELECTED ITEM INFO ---
    if (inv[this.selectedIndex]) {
        const item = inv[this.selectedIndex];
        const infoY = y + 320;
        
        ctx.fillStyle = "#0f1623";
        ctx.fillRect(x + 320, infoY, 260, 60);
        ctx.strokeStyle = "#555";
        ctx.strokeRect(x + 320, infoY, 260, 60);

        // Large Icon
        IconRenderer.renderItem(ctx, item.id, x + 335, infoY + 10, 32);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Inter, system-ui";
        ctx.fillText(item.name, x + 375, infoY + 20);

        ctx.fillStyle = "#aaa";
        ctx.font = "12px Inter, system-ui";
        let desc = item.type.toUpperCase();
        if (item.stats?.attack) desc += ` (+${item.stats.attack} ATK)`;
        if (item.stats?.defense) desc += ` (+${item.stats.defense} DEF)`;
        if (item.type === 'cosmetic') desc += ` (${item.slot})`;
        ctx.fillText(desc, x + 375, infoY + 40);
        
        // Sarcastic description
        const itemDesc = getItemDescription(item.id);
        ctx.fillStyle = "#888";
        ctx.font = "italic 11px Inter, system-ui";
        ctx.fillText(itemDesc, x + 375, infoY + 55);
    }
    
    // Footer Controls
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    ctx.font = "12px Inter, system-ui";
    ctx.fillText("[Arrows] Select   [Enter] Use/Equip   [Drag] Set Hotkey", width/2, y + h + 20);

    ctx.restore();

    // --- DRAG ICON RENDER ---
    if (this.draggedItem) {
        ctx.save();
        const mx = this.game.input.mouseX;
        const my = this.game.input.mouseY;
        
        // Draw real icon instead of text box
        IconRenderer.renderItem(ctx, this.draggedItem.id, mx - 20, my - 20, 40);
        
        ctx.restore();
    }
  }
}
