
export class IconRenderer {
  
  public static renderItem(ctx: CanvasRenderingContext2D, itemId: string, x: number, y: number, size: number): void {
    ctx.save();
    // Normalize to a 32x32 grid for drawing instructions
    const scale = size / 32;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    switch (itemId) {
      case 'potion': // Red Flask
        this.drawFlask(ctx, '#ff4444', '#cc0000');
        break;
      case 'ether': // Blue Flask
        this.drawFlask(ctx, '#34e1ff', '#0099cc');
        break;
      case 'iron_sword':
        this.drawSword(ctx);
        break;
      case 'leather_armor':
        this.drawArmor(ctx, '#8B4513');
        break;
      
      // Cosmetics
      case 'hat_crown':
        this.drawCrown(ctx);
        break;
      case 'hat_viking':
        this.drawViking(ctx);
        break;
      case 'hat_cowboy':
        this.drawCowboy(ctx);
        break;
      case 'color_midnight':
      case 'color_crimson':
      case 'color_gold':
        this.drawPaintBucket(ctx, this.getColorFromId(itemId));
        break;
      case 'aura_fire':
      case 'aura_ice':
        this.drawAuraOrb(ctx, itemId === 'aura_fire' ? '#ff4500' : '#00ffff');
        break;
      case 'trail_rainbow':
        this.drawTrailIcon(ctx);
        break;

      default:
        // Generic Box
        ctx.fillStyle = "#555";
        ctx.fillRect(4, 4, 24, 24);
        ctx.strokeStyle = "#aaa";
        ctx.strokeRect(4, 4, 24, 24);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", 16, 16);
        break;
    }

    ctx.restore();
  }

  public static renderUiIcon(ctx: CanvasRenderingContext2D, type: 'bag' | 'scroll' | 'gear', x: number, y: number, size: number, color: string) {
    ctx.save();
    const scale = size / 32;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (type === 'bag') {
        // Inventory Bag
        ctx.fillRect(4, 10, 24, 18); // Body
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 10, 6, Math.PI, 0); // Handle
        ctx.stroke();
        ctx.fillStyle = "#000"; // Lock
        ctx.fillRect(14, 14, 4, 4);
    } else if (type === 'scroll') {
        // Quest Scroll
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 4, 20, 24); // Paper
        ctx.beginPath(); // Lines
        ctx.moveTo(10, 10); ctx.lineTo(22, 10);
        ctx.moveTo(10, 16); ctx.lineTo(22, 16);
        ctx.moveTo(10, 22); ctx.lineTo(18, 22);
        ctx.stroke();
        // Seal
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(24, 24, 6, 0, Math.PI*2);
        ctx.fill();
    } else if (type === 'gear') {
        // Settings Gear
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 2); // Center hole
        ctx.stroke();
        
        // Cogs
        for(let i=0; i<8; i++) {
            ctx.save();
            ctx.translate(16, 16);
            ctx.rotate((i * Math.PI * 2) / 8);
            ctx.fillRect(-3, -14, 6, 6);
            ctx.restore();
        }
    }

    ctx.restore();
  }

  // --- Drawing Primitives (32x32 canvas space) ---

  private static drawFlask(ctx: CanvasRenderingContext2D, liquidColor: string, deepColor: string) {
      // Bottle Outline
      ctx.fillStyle = "#ccc";
      ctx.fillRect(12, 2, 8, 6); // Neck
      ctx.beginPath();
      ctx.arc(16, 20, 10, 0, Math.PI*2); // Bulb
      ctx.fill();
      
      // Liquid
      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.arc(16, 20, 8, 0, Math.PI*2);
      ctx.fill();
      
      // Highlight/Shine
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(13, 17, 3, 0, Math.PI*2);
      ctx.fill();
  }

  private static drawSword(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(Math.PI / 4);
      
      ctx.fillStyle = "#888"; // Blade
      ctx.fillRect(-2, -14, 4, 20);
      ctx.fillStyle = "#444"; // Guard
      ctx.fillRect(-6, 6, 12, 2);
      ctx.fillStyle = "#8B4513"; // Hilt
      ctx.fillRect(-1, 8, 2, 6);
      
      ctx.restore();
  }

  private static drawArmor(ctx: CanvasRenderingContext2D, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(26, 6);
      ctx.lineTo(26, 20); // Shoulder
      ctx.quadraticCurveTo(16, 30, 6, 20); // Bottom curve
      ctx.fill();
      
      // Neck hole
      ctx.fillStyle = "#000"; 
      ctx.beginPath();
      ctx.arc(16, 6, 4, 0, Math.PI, false);
      ctx.fill();
  }

  private static drawCrown(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(4, 24);
      ctx.lineTo(4, 12);
      ctx.lineTo(10, 18);
      ctx.lineTo(16, 6); // Center peak
      ctx.lineTo(22, 18);
      ctx.lineTo(28, 12);
      ctx.lineTo(28, 24);
      ctx.fill();
  }

  private static drawViking(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "#888";
      ctx.beginPath();
      ctx.arc(16, 20, 10, Math.PI, 0);
      ctx.fill();
      // Horns
      ctx.strokeStyle = "#eee";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(6, 20); ctx.lineTo(2, 10);
      ctx.moveTo(26, 20); ctx.lineTo(30, 10);
      ctx.stroke();
  }

  private static drawCowboy(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(2, 18, 28, 4); // Brim
      ctx.fillRect(8, 8, 16, 10); // Top
  }

  private static drawPaintBucket(ctx: CanvasRenderingContext2D, color: string) {
      // Bucket
      ctx.fillStyle = "#aaa";
      ctx.fillRect(6, 10, 20, 18);
      // Label/Liquid
      ctx.fillStyle = color;
      ctx.fillRect(10, 14, 12, 10);
      // Handle
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(16, 10, 8, Math.PI, 0);
      ctx.stroke();
  }

  private static drawAuraOrb(ctx: CanvasRenderingContext2D, color: string) {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI*2);
      ctx.fill();
  }

  private static drawTrailIcon(ctx: CanvasRenderingContext2D) {
      // Speed lines
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, 10); ctx.lineTo(20, 10);
      ctx.moveTo(8, 16); ctx.lineTo(28, 16);
      ctx.moveTo(4, 22); ctx.lineTo(24, 22);
      ctx.stroke();
  }

  private static getColorFromId(id: string): string {
      switch(id) {
          case 'color_midnight': return '#191970';
          case 'color_crimson': return '#DC143C';
          case 'color_gold': return '#DAA520';
          default: return '#fff';
      }
  }
}
