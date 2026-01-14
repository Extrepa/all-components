
import { Game } from "../core/Game";
import { Rect } from "../../types";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'dust' | 'spark' | 'ghost';
  gravity: number;
  drag: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  constructor() {}

  public emit(type: 'dust' | 'spark' | 'ghost', x: number, y: number, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.createParticle(type, x, y);
    }
  }

  private createParticle(type: 'dust' | 'spark' | 'ghost', x: number, y: number): void {
    const p: Particle = {
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      color: '#fff',
      size: 1,
      type,
      gravity: 0,
      drag: 0.95
    };

    switch (type) {
      case 'dust':
        p.vx = (Math.random() - 0.5) * 100;
        p.vy = (Math.random() * -50) - 20;
        p.maxLife = 0.3 + Math.random() * 0.2;
        p.size = 4 + Math.random() * 4;
        p.color = '#e0f7ff';
        p.gravity = 500;
        break;
      
      case 'spark':
        const angle = Math.random() * Math.PI * 2;
        const speed = 200 + Math.random() * 300;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = 0.1 + Math.random() * 0.15;
        p.size = 2 + Math.random() * 2;
        p.color = Math.random() > 0.5 ? '#fff' : '#ffd700'; // White or Gold
        p.drag = 0.85;
        break;

      case 'ghost':
        p.maxLife = 0.2;
        p.color = 'rgba(72, 240, 255, 0.4)'; // Cyan transparent
        p.size = 32; // Player size
        // No movement for ghost
        break;
    }

    p.life = p.maxLife;
    this.particles.push(p);
  }

  public clear(): void {
    this.particles = [];
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.type === 'ghost') {
        ctx.fillStyle = p.color;
        // Draw a rect representing the player ghost
        // Assuming player size roughly (hardcoded for simplicity in this generic system)
        ctx.fillRect(p.x, p.y, 32, 32); 
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        // Sparks are lines
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.05, p.y + p.vy * 0.05); // Stretch based on velocity
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.stroke();
      } else {
        // Dust / standard
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.size, p.size);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
