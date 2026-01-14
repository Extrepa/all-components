

import { Game } from "../core/Game";
import { Scene } from "../../types";

export class GameOverScene implements Scene {
  private game: Game;
  private lostGoo: number = 0;
  private timeElapsed: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  onEnter(): void {
    console.log("Entered GameOverScene");
    this.timeElapsed = 0;
    
    // Calculate Penalty
    const currentGoo = this.game.state.player.gooBits;
    this.lostGoo = Math.floor(currentGoo * 0.2); // 20% Penalty
    
    // Apply Penalty & Restore
    this.game.state.player.gooBits -= this.lostGoo;
    this.game.state.player.hp = this.game.state.player.maxHp;
    this.game.state.player.mp = this.game.state.player.maxMp;
    
    // Auto Save the loss
    this.game.saveSystem.save(this.game.state);
  }

  update(dt: number): void {
    this.timeElapsed += dt;
    const input = this.game.input;

    if (this.timeElapsed > 1.0) { // Slight delay before input allowed
        if (input.wasPressed(" ") || input.wasPressed("Enter")) {
            this.game.audio.playSfx('collect');
            this.game.sceneManager.setScene("town");
        }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.game;

    // Background (Dark Red Fade)
    ctx.fillStyle = "#0f0202";
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.save();
    
    // "YOU DIED"
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ff0000";
    ctx.font = "900 80px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU DIED", width / 2, height / 2 - 50);

    // Penalty Info
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ecf9ff";
    ctx.font = "bold 24px Inter, system-ui";
    ctx.fillText(`You lost ${this.lostGoo} Goo Bits.`, width / 2, height / 2 + 40);

    // Respawn Prompt
    if (this.timeElapsed > 1.0) {
        const blink = Math.sin(this.timeElapsed * 5) * 0.5 + 0.5;
        ctx.globalAlpha = 0.5 + 0.5 * blink;
        ctx.fillStyle = "#ffd700";
        ctx.font = "20px Inter, system-ui";
        ctx.fillText("PRESS [SPACE] TO RESPAWN", width / 2, height / 2 + 100);
    }

    ctx.restore();
  }
}