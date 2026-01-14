
import { Game } from "../core/Game";
import { QUESTS } from "../data/quests";

export class QuestLogUI {
  private game: Game;
  public isActive: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  public toggle(): void {
    this.isActive = !this.isActive;
    this.game.audio.playSfx('step');
  }

  public update(dt: number): void {
    const input = this.game.input;

    // Toggle Open/Close with Q
    if (input.wasPressed("q") || input.wasPressed("Q")) {
        if (input.wasPressed("q")) input.consume("q");
        if (input.wasPressed("Q")) input.consume("Q");
        this.toggle();
        return;
    }

    if (!this.isActive) return;

    // Close with Esc or I (if mis-pressed)
    if (input.wasPressed("Escape")) {
        input.consume("Escape");
        this.toggle();
        return;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const { width, height } = this.game;

    // Dim Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, width, height);

    // Main Window
    const w = 700;
    const h = 450;
    const x = (width - w) / 2;
    const y = (height - h) / 2;

    ctx.save();

    // BG
    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Header
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(x, y, w, 50);
    ctx.fillStyle = "#000";
    ctx.font = "bold 24px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("QUEST LOG", x + w / 2, y + 25);

    // Split View
    // Left: Story Quests
    this.renderStoryQuests(ctx, x, y + 50, w / 2, h - 50);

    // Right: Daily Rituals
    this.renderDailyRituals(ctx, x + w / 2, y + 50, w / 2, h - 50);

    // Divider
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 50);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();

    // Footer
    ctx.fillStyle = "#888";
    ctx.font = "12px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic"; // Reset baseline for footer
    ctx.fillText("Press [Q] or [Esc] to Close", width / 2, y + h + 20);

    ctx.restore();
  }

  private renderStoryQuests(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
      ctx.save();
      
      // Header
      ctx.textBaseline = "top";
      ctx.fillStyle = "#34e1ff";
      ctx.font = "bold 18px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Active Quests", x + w / 2, y + 20);

      const log = this.game.state.questLog;
      const startY = y + 50;
      
      if (log.active.length === 0) {
          ctx.fillStyle = "#555";
          ctx.font = "italic 14px Inter, system-ui";
          ctx.fillText("No active quests.", x + w / 2, startY + 20);
      } else {
          log.active.forEach((q, i) => {
              const def = QUESTS[q.id];
              const entryY = startY + i * 80;
              
              // Quest Box
              ctx.fillStyle = "rgba(52, 225, 255, 0.1)";
              ctx.fillRect(x + 20, entryY, w - 40, 70);
              
              // Name
              ctx.textAlign = "left";
              ctx.fillStyle = "#fff";
              ctx.font = "bold 16px Inter, system-ui";
              ctx.fillText(def.name, x + 30, entryY + 15);
              
              // Description/Status
              ctx.font = "12px Inter, system-ui";
              if (q.isReadyToTurnIn) {
                  ctx.fillStyle = "#00ff00";
                  ctx.fillText(`COMPLETE! Return to ${def.npcName}`, x + 30, entryY + 40);
              } else {
                  ctx.fillStyle = "#aaa";
                  let progText = "";
                  if (def.type === 'KILL' || def.type === 'COLLECT') {
                      const label = def.targetLabel || 'Targets';
                      progText = `Progress: ${q.progress} / ${def.targetCount} ${label}`;
                  } else {
                      progText = "In Progress";
                  }
                  ctx.fillText(progText, x + 30, entryY + 40);
              }
          });
      }

      ctx.restore();
  }

  private renderDailyRituals(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    
    // Header
    ctx.textBaseline = "top";
    ctx.fillStyle = "#d948ff";
    ctx.font = "bold 18px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Daily Ritual", x + w / 2, y + 20);

    const daily = this.game.state.daily;
    const startY = y + 50;
    
    // Ritual Box
    ctx.fillStyle = "rgba(217, 72, 255, 0.1)";
    ctx.fillRect(x + 20, startY, w - 40, 100);
    
    // Name
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Inter, system-ui";
    ctx.fillText(daily.description, x + 30, startY + 20);
    
    // Status
    ctx.font = "14px Inter, system-ui";
    
    if (daily.isCompleted) {
        ctx.fillStyle = "#ffd700";
        ctx.fillText("RITUAL COMPLETE", x + 30, startY + 50);
        ctx.font = "12px Inter, system-ui";
        ctx.fillStyle = "#aaa";
        ctx.fillText("Reward Automatically Claimed", x + 30, startY + 70);
    } else {
        ctx.fillStyle = "#d948ff";
        ctx.fillText(`${daily.progress} / ${daily.target}`, x + 30, startY + 50);
        
        if (daily.timeLimit && daily.timer) {
            ctx.fillStyle = "#ff4444";
            ctx.fillText(`Time Remaining: ${Math.ceil(daily.timer)}s`, x + 150, startY + 50);
        }
    }

    ctx.restore();
  }
}
