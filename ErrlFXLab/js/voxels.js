// 2D voxel rendering
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Voxels = {
    renderVoxelsForCurrentSvg() {
      if (!App.dom.voxelCanvas || !App.dom.voxelStatusEl) return;
      if (!App.state.currentSvg || !App.state.currentSvgUrl) {
        App.dom.voxelStatusEl.textContent = "Upload an SVG first.";
        const ctx = App.dom.voxelCanvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, App.dom.voxelCanvas.width, App.dom.voxelCanvas.height);
        return;
      }
      const host = App.dom.voxelCanvas.parentElement || App.dom.voxelCanvas;
      const width = host.clientWidth || 400;
      const height = host.clientHeight || 400;
      App.dom.voxelCanvas.width = width;
      App.dom.voxelCanvas.height = height;
      const ctx = App.dom.voxelCanvas.getContext("2d");
      if (!ctx) {
        App.dom.voxelStatusEl.textContent = "Canvas not supported.";
        return;
      }
      App.dom.voxelStatusEl.textContent = "Sampling image…";
      const img = new Image();
      img.onload = () => {
        const sampleCanvas = document.createElement("canvas");
        const sampleCtx = sampleCanvas.getContext("2d");
        const sampleSize = 256;
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        sampleCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
        ctx.clearRect(0, 0, width, height);
        const blockSize = 14;
        const cols = Math.floor(width / blockSize);
        const rows = Math.floor(height / blockSize);
        const offsetX = (width - cols * blockSize) / 2;
        const offsetY = (height - rows * blockSize) / 2;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const sx = Math.floor((x / cols) * sampleSize);
            const sy = Math.floor((y / rows) * sampleSize);
            const pixel = sampleCtx.getImageData(sx, sy, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            const a = pixel[3];
            if (a < 30) continue;
            const baseX = offsetX + x * blockSize;
            const baseY = offsetY + y * blockSize;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(baseX, baseY, blockSize, blockSize);
            const sideShade = 0.7;
            const sdR = Math.floor(r * sideShade);
            const sdG = Math.floor(g * sideShade);
            const sdB = Math.floor(b * sideShade);
            ctx.fillStyle = `rgb(${sdR}, ${sdG}, ${sdB})`;
            ctx.fillRect(baseX + blockSize * 0.2, baseY + blockSize * 0.2, blockSize, blockSize);
          }
        }
        App.dom.voxelStatusEl.textContent = "Voxel mosaic ready.";
      };
      img.onerror = () => {
        App.dom.voxelStatusEl.textContent = "Failed to load SVG for voxels.";
      };
      img.src = App.state.currentSvgUrl;
    }
  };

  window.ErrlFX.Voxels = Voxels;
})(window);

