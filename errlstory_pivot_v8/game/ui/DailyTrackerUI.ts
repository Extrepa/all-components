
import { Game } from "../core/Game";

export class DailyTrackerUI {
  private game: Game;
  private animTime: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public update(dt: number): void {
      const daily = this.game.state.daily;
      if (!daily) return;
      
      this.animTime += dt;

      // Interaction Logic
      if (daily.isCompleted && !daily.rewardClaimed) {
          const { width } = this.game;
          const x = width / 2;
          const y = 20;
          const w = 260;
          const h = 45;

          const input = this.game.input;
          
          if (input.wasMousePressed) {
              const mx = input.mouseX;
              const my = input.mouseY;
              
              // Hit Test
              if (mx >= x - w/2 && mx <= x + w/2 && my >= y && my <= y + h) {
                  this.game.dailySystem.claimReward();
                  // Spawn particles at UI center
                  this.game.particles.emit('spark', x, y + h/2, 10);
              }
          }
      }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const daily = this.game.state.daily;
    if (!daily) return;

    const { width } = this.game;

    // Config
    const x = width / 2;
    // Move up to Y=20 (aligned with Minimap header)
    const y = 20; 
    
    ctx.save();
    ctx.textAlign = "center";
    
    // Pulse effect if ready to claim
    let borderColor = "#d948ff";
    let bgAlpha = 0.7;

    if (daily.isCompleted) {
        if (!daily.rewardClaimed) {
             const pulse = (Math.sin(this.animTime * 10) + 1) * 0.5; // 0 to 1
             borderColor = `rgba(255, 215, 0, ${0.5 + 0.5 * pulse})`;
             bgAlpha = 0.8 + 0.2 * pulse;
        } else {
             borderColor = "#555";
             bgAlpha = 0.5;
        }
    }

    // Background Pill
    ctx.fillStyle = `rgba(45, 10, 54, ${bgAlpha})`; 
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    
    const text = daily.description;
    
    // Determine Status Text
    let statusText = `${daily.progress} / ${daily.target}`;
    let statusColor = "#ff8ef5";

    if (daily.isCompleted) {
        if (daily.rewardClaimed) {
            statusText = "RITUAL COMPLETE";
            statusColor = "#888";
        } else {
            statusText = "CLICK TO CLAIM REWARD!";
            statusColor = "#ffd700";
        }
    }
    
    // Timer Text
    let timerText = "";
    if (!daily.isCompleted && daily.timeLimit && daily.timer) {
        timerText = ` [${Math.ceil(daily.timer)}s]`;
    }

    // Draw
    const w = 260;
    const h = 45;
    ctx.beginPath();
    ctx.roundRect(x - w/2, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = "bold 12px Inter, system-ui";
    ctx.fillStyle = daily.rewardClaimed ? "#aaa" : "#fff";
    ctx.fillText(text + timerText, x, y + 18);
    
    ctx.font = "bold 11px Inter, system-ui";
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, x, y + 34);

    ctx.restore();
  }
}
