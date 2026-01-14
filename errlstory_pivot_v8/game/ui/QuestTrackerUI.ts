
import { Game } from "../core/Game";
import { QUESTS } from "../data/quests";

export class QuestTrackerUI {
  private game: Game;
  private isMinimized: boolean = false;
  private animTime: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public update(dt: number): void {
    this.animTime += dt;
    
    const input = this.game.input;
    const { width } = this.game;
    
    // Click detection for minimize button (top right area)
    const headerX = width - 20;
    const headerY = 100; // Moved up from 200
    const headerWidth = 300; // Use max possible width for click detection (matches max panel width)
    const headerHeight = 25;
    
    if (input.wasMousePressed) {
      const mx = input.mouseX;
      const my = input.mouseY;
      
      // Check if clicked on header (minimize toggle)
      if (mx >= headerX - headerWidth && mx <= headerX && 
          my >= headerY && my <= headerY + headerHeight) {
        this.isMinimized = !this.isMinimized;
        this.game.audio.playSfx('step');
      }
      
      // Check daily reward claim (if not minimized)
      if (!this.isMinimized) {
        const daily = this.game.state.daily;
        if (daily && daily.isCompleted && !daily.rewardClaimed) {
          const dailyY = headerY + headerHeight + 5;
          const dailyH = 40; // Updated to match new row height
          
          if (mx >= headerX - headerWidth && mx <= headerX && 
              my >= dailyY && my <= dailyY + dailyH) {
            this.game.dailySystem.claimReward();
            this.game.particles.emit('spark', headerX - headerWidth / 2, dailyY + dailyH / 2, 10);
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { width } = this.game;
    
    // Position: Top right, 100px from top (moved up)
    const x = width - 20; // Right edge with 20px margin
    const y = 100; // Moved up from 200px
    const basePanelWidth = 110; // Base width (reduced by half from 220)
    
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    // Calculate daily quest width first (if it exists)
    let actualPanelWidth = basePanelWidth;
    const daily = this.game.state.daily;
    if (daily && !this.isMinimized) {
      // Measure text to determine required width
      ctx.textAlign = "left";
      ctx.font = "bold 8px Inter, system-ui";
      const labelWidth = ctx.measureText("DAILY").width;
      
      ctx.font = "9px Inter, system-ui";
      const descWidth = ctx.measureText(daily.description).width;
      
      let statusText = "";
      if (daily.isCompleted) {
        if (!daily.rewardClaimed) {
          statusText = "CLICK TO CLAIM";
        } else {
          statusText = "COMPLETE";
        }
      } else {
        statusText = `${daily.progress}/${daily.target}`;
        if (daily.timeLimit && daily.timer) {
          statusText += ` [${Math.ceil(daily.timer)}s]`;
        }
      }
      ctx.font = "8px Inter, system-ui";
      const statusWidth = ctx.measureText(statusText).width;
      
      const padding = 16; // 8px on each side
      const requiredWidth = Math.max(labelWidth, descWidth, statusWidth) + padding;
      actualPanelWidth = Math.min(Math.max(basePanelWidth, requiredWidth), 300);
      ctx.textAlign = "right";
    }
    
    // Header (always visible) - use actualPanelWidth
    const headerHeight = 25;
    ctx.fillStyle = "rgba(26, 31, 46, 0.9)";
    ctx.strokeStyle = "#48f0ff";
    ctx.lineWidth = 2;
    
    // Rounded header (using actualPanelWidth)
    ctx.beginPath();
    ctx.moveTo(x - actualPanelWidth + 8, y);
    ctx.lineTo(x - 8, y);
    ctx.quadraticCurveTo(x, y, x, y + 8);
    ctx.lineTo(x, y + headerHeight - 8);
    ctx.quadraticCurveTo(x, y + headerHeight, x - 8, y + headerHeight);
    ctx.lineTo(x - actualPanelWidth + 8, y + headerHeight);
    ctx.quadraticCurveTo(x - actualPanelWidth, y + headerHeight, x - actualPanelWidth, y + headerHeight - 8);
    ctx.lineTo(x - actualPanelWidth, y + 8);
    ctx.quadraticCurveTo(x - actualPanelWidth, y, x - actualPanelWidth + 8, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Header text (left side)
    ctx.textAlign = "left";
    ctx.fillStyle = "#48f0ff";
    ctx.font = "bold 12px Inter, system-ui";
    ctx.fillText("QUESTS", x - actualPanelWidth + 15, y + 6);
    
    // Minimize indicator (right side)
    ctx.textAlign = "right";
    ctx.fillStyle = "#aaa";
    ctx.font = "10px Inter, system-ui";
    ctx.fillText(this.isMinimized ? "▼" : "▲", x - 10, y + 7);
    
    if (this.isMinimized) {
      ctx.restore();
      return; // Only show header when minimized
    }
    
    // Content area
    let currentY = y + headerHeight + 3; // Reduced gap from 5 to 3
    const rowHeight = 38; // Optimized to fit text without wasted space
    const maxRegularQuests = 3;
    
    // Daily Quest (1 only) - use actualPanelWidth
    if (daily) {
      currentY = this.renderDailyQuest(ctx, x, currentY, actualPanelWidth, rowHeight);
    }
    
    // Regular Quests (up to 3) - use actualPanelWidth
    const active = this.game.state.questLog.active;
    const questsToShow = active.slice(0, maxRegularQuests);
    
    questsToShow.forEach((q, i) => {
      currentY = this.renderRegularQuest(ctx, x, currentY, actualPanelWidth, rowHeight, q, i);
    });
    
    ctx.restore();
  }

  private renderDailyQuest(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): number {
    const daily = this.game.state.daily;
    if (!daily) return y;
    
    // Change to left alignment for text measurement
    ctx.textAlign = "left";
    
    // Measure all text elements to determine required width
    ctx.font = "bold 8px Inter, system-ui";
    const labelWidth = ctx.measureText("DAILY").width;
    
    ctx.font = "9px Inter, system-ui";
    const descWidth = ctx.measureText(daily.description).width;
    
    // Status text
    let statusText = "";
    if (daily.isCompleted) {
      if (!daily.rewardClaimed) {
        statusText = "CLICK TO CLAIM";
      } else {
        statusText = "COMPLETE";
      }
    } else {
      statusText = `${daily.progress}/${daily.target}`;
      if (daily.timeLimit && daily.timer) {
        statusText += ` [${Math.ceil(daily.timer)}s]`;
      }
    }
    ctx.font = "8px Inter, system-ui";
    const statusWidth = ctx.measureText(statusText).width;
    
    // Calculate required width: max of all text elements + padding
    const padding = 16; // 8px on each side
    const requiredWidth = Math.max(labelWidth, descWidth, statusWidth) + padding;
    
    // Use the larger of the base width or required width, but cap at a reasonable max (e.g., 300px)
    const actualWidth = Math.min(Math.max(width, requiredWidth), 300);
    const leftX = x - actualWidth + 8; // Left edge with padding
    
    // Background
    let borderColor = "#d948ff";
    let bgAlpha = 0.7;
    
    if (daily.isCompleted) {
      if (!daily.rewardClaimed) {
        const pulse = (Math.sin(this.animTime * 10) + 1) * 0.5;
        borderColor = `rgba(255, 215, 0, ${0.5 + 0.5 * pulse})`;
        bgAlpha = 0.8 + 0.2 * pulse;
      } else {
        borderColor = "#555";
        bgAlpha = 0.5;
      }
    }
    
    ctx.fillStyle = `rgba(45, 10, 54, ${bgAlpha})`;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    
    // Rounded box (using actualWidth)
    ctx.beginPath();
    ctx.moveTo(x - actualWidth + 6, y);
    ctx.lineTo(x - 6, y);
    ctx.quadraticCurveTo(x, y, x, y + 6);
    ctx.lineTo(x, y + height - 6);
    ctx.quadraticCurveTo(x, y + height, x - 6, y + height);
    ctx.lineTo(x - actualWidth + 6, y + height);
    ctx.quadraticCurveTo(x - actualWidth, y + height, x - actualWidth, y + height - 6);
    ctx.lineTo(x - actualWidth, y + 6);
    ctx.quadraticCurveTo(x - actualWidth, y, x - actualWidth + 6, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = "#d948ff";
    ctx.font = "bold 8px Inter, system-ui";
    ctx.fillText("DAILY", leftX, y + 3);
    
    // Description (no truncation needed now)
    ctx.fillStyle = daily.rewardClaimed ? "#aaa" : "#fff";
    ctx.font = "9px Inter, system-ui";
    ctx.fillText(daily.description, leftX, y + 14);
    
    // Status
    let statusColor = "#ff8ef5";
    if (daily.isCompleted) {
      if (!daily.rewardClaimed) {
        statusColor = "#ffd700";
      } else {
        statusColor = "#888";
      }
    }
    
    ctx.fillStyle = statusColor;
    ctx.font = "8px Inter, system-ui";
    ctx.fillText(statusText, leftX, y + 25);
    
    // Reset text alignment back to right for other elements
    ctx.textAlign = "right";
    
    return y + height + 3;
  }

  private renderRegularQuest(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, quest: any, index: number): number {
    const def = QUESTS[quest.id];
    if (!def) return y;
    
    // Background (subtle)
    ctx.fillStyle = "rgba(26, 31, 46, 0.6)";
    ctx.strokeStyle = "#48f0ff";
    ctx.lineWidth = 1;
    
    // Rounded box
    ctx.beginPath();
    ctx.moveTo(x - width + 6, y);
    ctx.lineTo(x - 6, y);
    ctx.quadraticCurveTo(x, y, x, y + 6);
    ctx.lineTo(x, y + height - 6);
    ctx.quadraticCurveTo(x, y + height, x - 6, y + height);
    ctx.lineTo(x - width + 6, y + height);
    ctx.quadraticCurveTo(x - width, y + height, x - width, y + height - 6);
    ctx.lineTo(x - width, y + 6);
    ctx.quadraticCurveTo(x - width, y, x - width + 6, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Change to left alignment for regular quest text to use full width
    ctx.textAlign = "left";
    const leftX = x - width + 8; // Left edge with minimal padding
    const availableWidth = width - 16; // Full width minus padding
    
    // Quest name (use full width, truncate only if necessary)
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 9px Inter, system-ui";
    let name = def.name;
    const nameMetrics = ctx.measureText(name);
    if (nameMetrics.width > availableWidth) {
      while (ctx.measureText(name + "...").width > availableWidth && name.length > 0) {
        name = name.substring(0, name.length - 1);
      }
      name = name + "...";
    }
    ctx.fillText(name, leftX, y + 3);
    
    // Progress
    ctx.font = "8px Inter, system-ui";
    
    let progressText = "";
    if (quest.isReadyToTurnIn) {
      ctx.fillStyle = "#00ff00";
      progressText = `Return`;
    } else {
      ctx.fillStyle = "#fff";
      if (def.type === 'KILL' || def.type === 'COLLECT') {
        const label = def.targetLabel || 'Tgt';
        progressText = `${label}: ${quest.progress}/${def.targetCount}`;
      } else {
        progressText = "Progress";
      }
    }
    
    // Truncate progress text only if necessary
    const progressMetrics = ctx.measureText(progressText);
    if (progressMetrics.width > availableWidth) {
      while (ctx.measureText(progressText + "...").width > availableWidth && progressText.length > 0) {
        progressText = progressText.substring(0, progressText.length - 1);
      }
      progressText = progressText + "...";
    }
    
    ctx.fillText(progressText, leftX, y + 15);
    
    // Reset text alignment back to right
    ctx.textAlign = "right";
    
    return y + height + 2; // Reduced gap from 3 to 2
  }
}
