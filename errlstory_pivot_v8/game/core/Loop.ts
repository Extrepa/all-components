import { Game } from "./Game";

export class Loop {
  private game: Game;
  private prevTime: number;
  private accumulator: number;
  private timestep: number;
  private running: boolean;
  private frameId: number | null;
  private _boundFrame: (now: number) => void;

  constructor(game: Game) {
    this.game = game;

    this.prevTime = 0;
    this.accumulator = 0;
    this.timestep = 1000 / 60; // 60 updates per second in ms
    this.running = false;
    this.frameId = null;

    this._boundFrame = this._frame.bind(this);
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.prevTime = performance.now();
    this.frameId = requestAnimationFrame(this._boundFrame);
  }

  public stop(): void {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private _frame(now: number): void {
    if (!this.running) return;

    const frameTime = now - this.prevTime;
    this.prevTime = now;

    // Avoid spiral of death; clamp big jumps (e.g., tab switch)
    const clampedFrameTime = Math.min(frameTime, 250);
    this.accumulator += clampedFrameTime;

    // Fixed time step update
    while (this.accumulator >= this.timestep) {
      const dtSeconds = this.timestep / 1000;
      this.game.update(dtSeconds);
      this.accumulator -= this.timestep;
    }

    // Variable time render
    this.game.render();

    // Clear "just pressed/released" flags for the next frame
    // This must happen AFTER logic/update, but BEFORE the next events might fire (effectively end of frame)
    this.game.handleInput();

    this.frameId = requestAnimationFrame(this._boundFrame);
  }
}