
import { Game } from "../core/Game";
import { Scene } from "../../types";

export class TitleScene implements Scene {
  private game: Game;
  private elapsed: number;
  private hasSave: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.elapsed = 0;
  }

  onEnter(): void {
    console.log("Entered TitleScene");
    this.hasSave = this.game.saveSystem.hasSave();
    
    // Reset camera just in case
    this.game.camera.x = 0;
    this.game.camera.y = 0;
  }

  update(dt: number): void {
    this.elapsed += dt;

    const input = this.game.input;
    
    // START NEW GAME
    if (input.wasPressed("Enter") || input.wasPressed(" ")) {
      this.game.audio.resume(); // Ensure audio context is ready
      this.game.audio.playSfx('collect');
      this.game.state = this.game.getNewGameState(); // Reset state
      this.game.sceneManager.setScene("town");
    }

    // CONTINUE
    if (this.hasSave && (input.wasPressed("c") || input.wasPressed("C"))) {
        this.game.audio.resume();
        const loaded = this.game.saveSystem.load();
        if (loaded) {
            this.game.loadState(loaded); // Safe load with migration
            this.game.audio.playSfx('collect');
            this.game.sceneManager.setScene("town");
        }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.game;

    // Background
    ctx.fillStyle = "#050811";
    ctx.fillRect(0, 0, width, height);

    // Grid effect (retro/neon vibe)
    ctx.strokeStyle = "rgba(72, 240, 255, 0.1)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    // Moving grid
    const offset = (this.elapsed * 20) % gridSize;
    
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offset; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Glow-ish title
    ctx.save();
    ctx.shadowColor = "#48f0ff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#48f0ff";
    ctx.font = "900 64px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ERRLSTORY", width / 2, height / 2 - 40);
    ctx.restore();

    // Subtext
    ctx.fillStyle = "#ff8ef5";
    ctx.font = "bold 20px Inter, system-ui";
    ctx.textAlign = "center";
    const blink = Math.sin(this.elapsed * 4) * 0.5 + 0.5; // 0–1
    
    // New Game Option
    ctx.globalAlpha = 0.4 + 0.6 * blink;
    ctx.fillText("PRESS ENTER TO START NEW GAME", width / 2, height / 2 + 50);
    
    // Continue Option
    if (this.hasSave) {
        ctx.fillStyle = "#ffd700";
        ctx.fillText("PRESS [C] TO CONTINUE", width / 2, height / 2 + 90);
    }
    
    ctx.globalAlpha = 1.0;
    ctx.font = "14px Inter, system-ui";
    ctx.fillStyle = "#8bd6ff";
    ctx.fillText("v0.1.1 Milestone 9.5 (Quest Fixes)", width - 120, height - 20);
  }
}
