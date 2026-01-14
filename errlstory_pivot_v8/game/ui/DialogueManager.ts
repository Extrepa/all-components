
import { Game } from "../core/Game";

export interface DialogueOption {
  label: string;
  action: () => void;
}

export class DialogueManager {
  private game: Game;
  public isActive: boolean = false;
  
  private queue: string[] = [];
  private currentText: string = "";
  private displayBuffer: string = ""; // What is currently rendered (typewriter effect)
  
  private typeTimer: number = 0;
  private readonly TYPE_SPEED: number = 0.02; // Seconds per char
  
  public speaker: string = "";
  private onComplete: (() => void) | null = null;

  // Options support
  private options: DialogueOption[] | null = null;
  private selectedOptionIndex: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public start(speaker: string, lines: string[], onComplete?: () => void, options?: DialogueOption[]): void {
    this.isActive = true;
    this.speaker = speaker;
    this.queue = [...lines];
    this.onComplete = onComplete || null;
    this.options = options || null;
    this.selectedOptionIndex = 0; // Default to first (usually Accept)
    this.nextLine();
  }

  private nextLine(): void {
    if (this.queue.length === 0) {
      // If we have options, do NOT close. Wait for selection.
      if (this.options && this.options.length > 0) {
          // Ready for input
      } else {
          this.close();
      }
      return;
    }
    this.currentText = this.queue.shift() || "";
    this.displayBuffer = "";
    this.typeTimer = 0;
  }

  private close(): void {
    this.isActive = false;
    this.speaker = "";
    this.currentText = "";
    this.options = null;
    
    if (this.onComplete) {
        this.onComplete();
        this.onComplete = null;
    }
  }

  public update(dt: number): void {
    if (!this.isActive) return;

    const input = this.game.input;
    const isTyping = this.displayBuffer.length < this.currentText.length;
    const isLastLine = this.queue.length === 0 && !isTyping;
    const showingOptions = isLastLine && this.options !== null;

    // Typewriter Effect
    if (isTyping) {
      this.typeTimer -= dt;
      if (this.typeTimer <= 0) {
        this.typeTimer = this.TYPE_SPEED;
        this.displayBuffer += this.currentText[this.displayBuffer.length];
      }
    }

    // --- Input Handling ---

    // 1. Handling Options Selection
    if (showingOptions) {
        if (input.wasPressed("ArrowLeft") || input.wasPressed("a")) {
            this.selectedOptionIndex = Math.max(0, this.selectedOptionIndex - 1);
            this.game.audio.playSfx('step');
        }
        if (input.wasPressed("ArrowRight") || input.wasPressed("d")) {
            this.selectedOptionIndex = Math.min(this.options!.length - 1, this.selectedOptionIndex + 1);
            this.game.audio.playSfx('step');
        }
        
        if (input.wasPressed(" ") || input.wasPressed("Enter") || input.wasPressed("z")) {
            const selected = this.options![this.selectedOptionIndex];
            // Execute the option
            selected.action();
            // Close logic handles resetting state, but usually the action closes the dialog or starts a new one
            this.close(); 
        }
        return;
    }

    // 2. Advancing Text
    if (input.wasPressed(" ") || input.wasPressed("Enter") || input.wasPressed("z")) {
      if (isTyping) {
        // Instant finish typing
        this.displayBuffer = this.currentText;
      } else {
        // Next line
        this.nextLine();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const { width, height } = this.game;

    // Box Dimensions
    const boxH = 150;
    const boxY = height - boxH - 20;
    const boxX = 100;
    const boxW = width - 200;

    ctx.save();
    
    // Background
    ctx.fillStyle = "rgba(5, 8, 17, 0.95)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    
    // Border
    ctx.strokeStyle = "#48f0ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Speaker Name Box
    ctx.fillStyle = "#48f0ff";
    ctx.fillRect(boxX, boxY - 30, 200, 30);
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Inter, system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.speaker, boxX + 10, boxY - 15);

    // Text Content
    ctx.fillStyle = "#ecf9ff";
    ctx.font = "18px Inter, system-ui";
    ctx.textBaseline = "top";
    
    // Simple word wrap
    const words = this.displayBuffer.split(" ");
    let line = "";
    let y = boxY + 20;
    const x = boxX + 20;
    const lineHeight = 28;

    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > boxW - 40) {
        ctx.fillText(line, x, y);
        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);

    // Render Options (if waiting for input)
    const isTyping = this.displayBuffer.length < this.currentText.length;
    if (!isTyping && this.queue.length === 0 && this.options) {
        this.renderOptions(ctx, boxX, boxY, boxW, boxH);
    } else if (!isTyping && this.queue.length === 0) {
        // Just show arrow prompt if no options
        if (Math.floor(Date.now() / 500) % 2 === 0) {
           ctx.fillStyle = "#ff8ef5";
           ctx.font = "12px Inter, system-ui";
           ctx.textAlign = "right";
           ctx.fillText("Press [SPACE] ▼", boxX + boxW - 20, boxY + boxH - 20);
       }
    } else if (!isTyping) {
        // More text to come
        if (Math.floor(Date.now() / 500) % 2 === 0) {
           ctx.fillStyle = "#34e1ff";
           ctx.font = "12px Inter, system-ui";
           ctx.textAlign = "right";
           ctx.fillText("Next ▶", boxX + boxW - 20, boxY + boxH - 20);
        }
    }

    ctx.restore();
  }

  private renderOptions(ctx: CanvasRenderingContext2D, bx: number, by: number, bw: number, bh: number) {
      if (!this.options) return;

      const optW = 120;
      const optH = 40;
      const gap = 20;
      const totalW = this.options.length * optW + (this.options.length - 1) * gap;
      
      let startX = bx + (bw - totalW) / 2;
      const startY = by + bh - 60;

      for (let i = 0; i < this.options.length; i++) {
          const opt = this.options[i];
          const isSelected = i === this.selectedOptionIndex;
          const x = startX + i * (optW + gap);

          // Button BG
          ctx.fillStyle = isSelected ? "#ffd700" : "#333";
          ctx.fillRect(x, startY, optW, optH);
          
          // Border
          ctx.strokeStyle = isSelected ? "#fff" : "#555";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, startY, optW, optH);

          // Text
          ctx.fillStyle = isSelected ? "#000" : "#ccc";
          ctx.font = "bold 16px Inter, system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(opt.label, x + optW / 2, startY + optH / 2);
      }
  }
}
