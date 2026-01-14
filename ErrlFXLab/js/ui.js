// UI overlays and navigation
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const UI = {
    openHelpOverlay() {
      if (!App.dom.helpOverlay) return;
      App.dom.helpOverlay.classList.remove("hidden");
      Utils.playBeep(720, 0.07, "triangle");
    },

    closeHelpOverlay() {
      if (!App.dom.helpOverlay) return;
      App.dom.helpOverlay.classList.add("hidden");
      Utils.playBeep(320, 0.07, "square");
    },

    openQuickStartOverlay() {
      if (!App.dom.quickStartOverlay) return;
      App.dom.quickStartOverlay.classList.remove("hidden");
      Utils.playBeep(780, 0.07, "triangle");
    },

    closeQuickStartOverlay() {
      if (!App.dom.quickStartOverlay) return;
      App.dom.quickStartOverlay.classList.add("hidden");
      Utils.playBeep(320, 0.06, "square");
    }
  };

  window.ErrlFX.UI = UI;
})(window);
