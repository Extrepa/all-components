import { createBlobs, updateBlobs, drawBlobs, type BlobState } from './simulation/blobs';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app container not found');
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Unable to acquire 2D canvas context');
}

appElement.appendChild(canvas);

let blobs: BlobState[] = createBlobs(24);
let lastTime = performance.now();

function resizeCanvas() {
  const rect = appElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let isPointerDown = false;
let pointerX = 0;
let pointerY = 0;

function updatePointer(evt: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  pointerX = evt.clientX - rect.left;
  pointerY = evt.clientY - rect.top;
}

canvas.addEventListener('pointerdown', (evt) => {
  isPointerDown = true;
  updatePointer(evt);
});

canvas.addEventListener('pointermove', (evt) => {
  if (!isPointerDown) return;
  updatePointer(evt);
});

window.addEventListener('pointerup', () => {
  isPointerDown = false;
});

function loop(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;

  blobs = updateBlobs(blobs, dt, width, height, isPointerDown ? { x: pointerX, y: pointerY } : null);

  ctx.clearRect(0, 0, width, height);
  drawBlobs(ctx, blobs, width, height);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
