// Diagnostics panel - FPS tracking and memory estimation
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Diagnostics = {
    updateDiagnostics() {
      const now = performance.now();
      if (App.dom.diagFpsP5El) {
        const fps = Utils.estimateFps(App.state.p5FrameCounter, App.state.p5LastFpsSampleTime, now);
        App.dom.diagFpsP5El.textContent = fps !== null ? `p5: ${Math.round(fps)}` : "p5: --";
      }
      if (App.dom.diagFps3DEl) {
        const fps = Utils.estimateFps(App.state.threeFrameCounter, App.state.threeLastFpsSampleTime, now);
        App.dom.diagFps3DEl.textContent = fps !== null ? `3D: ${Math.round(fps)}` : "3D: --";
      }
      if (App.dom.diagFpsTimelineEl) {
        const fps = Utils.estimateFps(App.state.timelineFrameCounter, App.state.timelineLastFpsSampleTime, now);
        App.dom.diagFpsTimelineEl.textContent = fps !== null ? `Timeline: ${Math.round(fps)}` : "Timeline: --";
      }
      if (App.dom.diagFrameCountsEl) {
        const total = App.state.capturedFrames.length;
        const favs = App.state.capturedFrames.filter((f) => f.favorite).length;
        App.dom.diagFrameCountsEl.textContent = `Total: ${total} · Fav: ${favs}`;
      }
      if (App.dom.diagTagSummaryEl) {
        const tags = {};
        App.state.capturedFrames.forEach((f) => {
          if (f.tag) tags[f.tag] = (tags[f.tag] || 0) + 1;
        });
        const tagStr = Object.keys(tags).length > 0 ? Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(", ") : "none";
        App.dom.diagTagSummaryEl.textContent = `Tags: ${tagStr}`;
      }
      if (App.dom.diagMemoryEl) {
        let totalBytes = 0;
        App.state.capturedFrames.forEach((f) => {
          totalBytes += Utils.estimateDataUrlBytes(f.url);
        });
        const mb = (totalBytes / (1024 * 1024)).toFixed(2);
        App.dom.diagMemoryEl.textContent = `Captures: ~${mb} MB`;
      }
    },

    startDiagnosticsInterval() {
      setInterval(() => this.updateDiagnostics(), 1000);
    }
  };

  window.ErrlFX.Diagnostics = Diagnostics;
})(window);
