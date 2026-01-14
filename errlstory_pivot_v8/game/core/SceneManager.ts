import { Game } from "./Game";
import { Scene } from "../../types";

export class SceneManager {
  private game: Game;
  private scenes: Map<string, Scene>;
  public current: Scene | null;
  public currentName: string | null;

  constructor(game: Game) {
    this.game = game;
    this.scenes = new Map();
    this.current = null;
    this.currentName = null;
  }

  public add(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  public setScene(name: string, data: any = {}): void {
    const next = this.scenes.get(name);
    if (!next) {
      console.error(`Scene '${name}' not found`);
      return;
    }

    if (this.current && typeof this.current.onExit === "function") {
      this.current.onExit();
    }

    this.current = next;
    this.currentName = name;

    if (typeof next.onEnter === "function") {
      next.onEnter(data);
    }
  }

  public update(dt: number): void {
    if (this.current && typeof this.current.update === "function") {
      this.current.update(dt);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.current && typeof this.current.render === "function") {
      this.current.render(ctx);
    }
  }
}