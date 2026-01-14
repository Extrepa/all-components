export interface BlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  wobblePhase: number;
  wobbleSpeed: number;
  hue: number;
}

export interface PointerForce {
  x: number;
  y: number;
}

const TWO_PI = Math.PI * 2;

export function createBlobs(count: number): BlobState[] {
  const blobs: BlobState[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * TWO_PI;
    const radius = 60 + Math.random() * 40;
    blobs.push({
      x: 400 + Math.cos(angle) * 150 + (Math.random() - 0.5) * 80,
      y: 300 + Math.sin(angle) * 150 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      radius,
      baseRadius: radius,
      wobblePhase: Math.random() * TWO_PI,
      wobbleSpeed: 0.5 + Math.random() * 1.2,
      hue: 180 + Math.sin(angle * 2) * 90 + Math.random() * 40,
    });
  }
  return blobs;
}

export function updateBlobs(
  blobs: BlobState[],
  dt: number,
  width: number,
  height: number,
  pointer: PointerForce | null,
): BlobState[] {
  const friction = 0.98;
  const centerX = width / 2;
  const centerY = height / 2;

  return blobs.map((blob) => {
    let { x, y, vx, vy, baseRadius, wobblePhase, wobbleSpeed, hue } = blob;

    // Gentle attraction to center
    const dxCenter = centerX - x;
    const dyCenter = centerY - y;
    vx += (dxCenter * 0.02) * dt;
    vy += (dyCenter * 0.02) * dt;

    // Pointer repulsion / attraction
    if (pointer) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distSq = dx * dx + dy * dy + 0.001;
      const force = 9000 / distSq;
      vx += (dx / Math.sqrt(distSq)) * force * dt;
      vy += (dy / Math.sqrt(distSq)) * force * dt;
    }

    // Integrate motion
    x += vx * dt;
    y += vy * dt;

    // Soft bounds
    const margin = 80;
    if (x < margin) vx += (margin - x) * 2 * dt;
    if (x > width - margin) vx -= (x - (width - margin)) * 2 * dt;
    if (y < margin) vy += (margin - y) * 2 * dt;
    if (y > height - margin) vy -= (y - (height - margin)) * 2 * dt;

    vx *= friction;
    vy *= friction;

    // Wobble radius
    wobblePhase += wobbleSpeed * dt;
    const wobble = Math.sin(wobblePhase * 2) * 0.25 + Math.sin(wobblePhase * 3.7) * 0.15;
    const radius = baseRadius * (1 + wobble * 0.3);

    // Slowly drift hue
    hue = (hue + dt * 6) % 360;

    return {
      x,
      y,
      vx,
      vy,
      radius,
      baseRadius,
      wobblePhase,
      wobbleSpeed,
      hue,
    };
  });
}

export function drawBlobs(ctx: CanvasRenderingContext2D, blobs: BlobState[], width: number, height: number): void {
  ctx.save();

  // Background glow
  const bgGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.05,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.6,
  );
  bgGradient.addColorStop(0, '#09091a');
  bgGradient.addColorStop(1, '#010108');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'lighter';

  for (const blob of blobs) {
    const gradient = ctx.createRadialGradient(
      blob.x - blob.radius * 0.3,
      blob.y - blob.radius * 0.3,
      blob.radius * 0.1,
      blob.x,
      blob.y,
      blob.radius * 1.2,
    );

    const baseHue = blob.hue;
    gradient.addColorStop(0, `hsla(${baseHue}, 95%, 70%, 0.95)`);
    gradient.addColorStop(0.4, `hsla(${(baseHue + 40) % 360}, 90%, 55%, 0.9)`);
    gradient.addColorStop(1, `hsla(${(baseHue + 120) % 360}, 80%, 30%, 0.0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(blob.x, blob.y, blob.radius, blob.radius * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
