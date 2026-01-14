// Spritesheet export, timeline, and animation pack generation
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Export = {
    getSpritesheetFramesSelection() {
      let frames = [...App.state.capturedFrames];
      if (App.dom.spritesheetSourceFavorites && App.dom.spritesheetSourceFavorites.checked) {
        frames = frames.filter((f) => f.favorite);
      }
      if (App.dom.spritesheetTagFilter && App.dom.spritesheetTagFilter.value) {
        frames = frames.filter((f) => f.tag === App.dom.spritesheetTagFilter.value);
      }
      return frames;
    },

    buildSpritesheet(frames, maxCols) {
      if (frames.length === 0) {
        Utils.flashStatus("No frames to export.", 2000);
        return;
      }
      const cols = Math.min(maxCols || 8, frames.length);
      const rows = Math.ceil(frames.length / cols);
      const cellW = 64;
      const cellH = 64;
      const canvas = document.createElement("canvas");
      canvas.width = cols * cellW;
      canvas.height = rows * cellH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const manifest = { sheet: { width: canvas.width, height: canvas.height, cellWidth: cellW, cellHeight: cellH }, frames: [] };
      frames.forEach((frame, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * cellW;
        const y = row * cellH;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, x, y, cellW, cellH);
          if (idx === frames.length - 1) {
            canvas.toBlob((blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "errl-spritesheet.png";
              a.click();
              URL.revokeObjectURL(url);
              Utils.flashStatus(`Exported spritesheet with ${frames.length} frames ✅`, 2000);
              Utils.playBeep(600, 0.08, "triangle");
            });
          }
        };
        img.src = frame.url;
        manifest.frames.push({ id: frame.id, x, y, width: cellW, height: cellH, favorite: frame.favorite, tag: frame.tag || "", source: frame.source, modeLabel: frame.modeLabel || "" });
      });
      App.state.lastSpritesheetManifest = manifest;
      if (App.dom.spritesheetManifestOutput) {
        App.dom.spritesheetManifestOutput.value = JSON.stringify(manifest, null, 2);
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    collectTimelineFrames() {
      let frames = [...App.state.capturedFrames];
      if (App.dom.timelineUseFavoritesEl && App.dom.timelineUseFavoritesEl.checked) {
        frames = frames.filter((f) => f.favorite);
      }
      if (App.dom.timelineTagFilterEl && App.dom.timelineTagFilterEl.value) {
        frames = frames.filter((f) => f.tag === App.dom.timelineTagFilterEl.value);
      }
      return frames;
    },

    stopTimelineAnimation() {
      if (App.state.timelineAnimId !== null) {
        cancelAnimationFrame(App.state.timelineAnimId);
        App.state.timelineAnimId = null;
      }
      App.state.timelineIsPlaying = false;
      if (App.dom.timelinePlayPauseBtn) {
        App.dom.timelinePlayPauseBtn.textContent = "Play";
        App.dom.timelinePlayPauseBtn.disabled = App.state.timelineFrames.length === 0;
      }
    },

    buildTimeline() {
      const frames = this.collectTimelineFrames();
      if (frames.length === 0) {
        Utils.flashStatus("No frames match the filters.", 2000);
        return;
      }
      App.state.timelineFrames = [];
      let loaded = 0;
      frames.forEach((frame) => {
        const img = new Image();
        img.onload = () => {
          App.state.timelineFrames.push({ img, frame });
          loaded++;
          if (loaded === frames.length) {
            if (App.dom.timelinePlayPauseBtn) App.dom.timelinePlayPauseBtn.disabled = false;
            if (App.dom.timelineExportJsonBtn) App.dom.timelineExportJsonBtn.disabled = false;
            Utils.flashStatus(`Timeline built with ${frames.length} frames ✅`, 2000);
            Utils.playBeep(600, 0.08, "triangle");
            this.updateTimelineJson();
          }
        };
        img.src = frame.url;
      });
    },

    drawTimelineFrame(index) {
      if (!App.dom.timelinePreviewCanvas || App.state.timelineFrames.length === 0) return;
      const ctx = App.dom.timelinePreviewCanvas.getContext("2d");
      if (!ctx) return;
      const idx = index % App.state.timelineFrames.length;
      const { img } = App.state.timelineFrames[idx];
      ctx.clearRect(0, 0, App.dom.timelinePreviewCanvas.width, App.dom.timelinePreviewCanvas.height);
      const scale = Math.min(App.dom.timelinePreviewCanvas.width / img.width, App.dom.timelinePreviewCanvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (App.dom.timelinePreviewCanvas.width - w) / 2;
      const y = (App.dom.timelinePreviewCanvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    },

    startTimelineAnimation() {
      if (App.state.timelineFrames.length === 0) return;
      this.stopTimelineAnimation();
      App.state.timelineIsPlaying = true;
      if (App.dom.timelinePlayPauseBtn) App.dom.timelinePlayPauseBtn.textContent = "Pause";
      const fps = parseInt(App.dom.timelineFpsInput?.value || "8", 10);
      const frameTime = 1000 / fps;
      let currentIndex = 0;
      App.state.timelineLastTime = performance.now();
      App.state.timelineAccum = 0;
      const animate = (now) => {
        App.state.timelineFrameCounter++;
        if (!App.state.timelineIsPlaying) return;
        App.state.timelineAnimId = requestAnimationFrame(animate);
        const dt = now - (App.state.timelineLastTime || now);
        App.state.timelineLastTime = now;
        App.state.timelineAccum += dt;
        if (App.state.timelineAccum >= frameTime) {
          App.state.timelineAccum = 0;
          this.drawTimelineFrame(currentIndex);
          currentIndex = (currentIndex + 1) % App.state.timelineFrames.length;
        }
      };
      animate(App.state.timelineLastTime || performance.now());
      this.drawTimelineFrame(0);
    },

    updateTimelineJson() {
      if (App.state.timelineFrames.length === 0) {
        if (App.dom.timelineJsonOutput) App.dom.timelineJsonOutput.value = "";
        return;
      }
      const fps = parseInt(App.dom.timelineFpsInput?.value || "8", 10);
      const data = {
        fps,
        frameCount: App.state.timelineFrames.length,
        frames: App.state.timelineFrames.map(({ frame }) => ({ id: frame.id, tag: frame.tag || "", favorite: frame.favorite, source: frame.source, modeLabel: frame.modeLabel || "" }))
      };
      App.state.lastTimelineSnapshot = data;
      if (App.dom.timelineJsonOutput) {
        App.dom.timelineJsonOutput.value = JSON.stringify(data, null, 2);
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    buildAnimationPackFromManifest() {
      if (!App.state.lastSpritesheetManifest || !App.state.lastTimelineSnapshot) {
        Utils.flashStatus("Export a spritesheet and build a timeline first.", 2000);
        return;
      }
      const sheetName = App.dom.animPackSheetNameInput?.value || "errl-spritesheet.png";
      const tagsStr = App.dom.animPackTagsInput?.value || "idle,walk,jump,fx";
      const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
      const pack = {
        version: "1.0",
        sheet: { file: sheetName, ...App.state.lastSpritesheetManifest.sheet },
        animations: {}
      };
      tags.forEach((tag) => {
        const frames = App.state.lastTimelineSnapshot.frames.filter((f) => f.tag === tag);
        if (frames.length > 0) {
          pack.animations[tag] = {
            fps: App.state.lastTimelineSnapshot.fps,
            frames: frames.map((f) => {
              const sprite = App.state.lastSpritesheetManifest.frames.find((sf) => sf.id === f.id);
              return sprite ? { x: sprite.x, y: sprite.y, width: sprite.width, height: sprite.height } : null;
            }).filter(Boolean)
          };
        }
      });
      App.state.lastAnimationPack = pack;
      if (App.dom.animPackOutput) {
        App.dom.animPackOutput.value = JSON.stringify(pack, null, 2);
      }
      if (App.dom.animPackCopyBtn) App.dom.animPackCopyBtn.disabled = false;
      Utils.flashStatus(`Animation pack built with ${tags.length} tags ✅`, 2000);
      Utils.playBeep(600, 0.08, "triangle");
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    }
  };

  window.ErrlFX.Export = Export;
})(window);

