
import { Rect } from "../../types";

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public width: number;
  public height: number;
  public mapWidth: number;
  public mapHeight: number;

  private shakeTime: number = 0;
  private shakeIntensity: number = 0;

  constructor(width: number, height: number, mapWidth: number, mapHeight: number) {
    this.width = width;
    this.height = height;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  public setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  public shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeTime = duration;
  }

  public follow(target: { x: number; y: number; width: number; height: number }, dt: number): void {
    // Calculate target position (Center the target)
    const targetX = target.x + target.width / 2 - this.width / 2;
    const targetY = target.y + target.height / 2 - this.height / 2;

    // Smooth Lerp (Linear Interpolation)
    const lerpSpeed = 5;
    this.x += (targetX - this.x) * lerpSpeed * dt;
    this.y += (targetY - this.y) * lerpSpeed * dt;

    // Clamp to map boundaries
    this.x = Math.max(0, this.x);
    this.y = Math.max(0, this.y);

    if (this.x + this.width > this.mapWidth) {
      this.x = this.mapWidth - this.width;
    }
    if (this.y + this.height > this.mapHeight) {
      this.y = this.mapHeight - this.height;
    }

    // Apply Shake
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.x += offsetX;
      this.y += offsetY;
    }
  }
}
