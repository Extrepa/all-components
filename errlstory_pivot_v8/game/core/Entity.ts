import { Rect } from "../../types";

export class Entity {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx: number;
  public vy: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
  
  public render(ctx: CanvasRenderingContext2D): void {}
}