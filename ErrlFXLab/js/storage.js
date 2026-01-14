// localStorage helpers for state persistence
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Storage = {
    saveStateToStorage() {
      try {
        const state = {
          fxPresets: App.state.fxPresets,
          htmlFxPreset: App.dom.htmlFxPresetSelect?.value || "clean",
          activeTab: App.getActivePreviewTabName(),
          threeMode: App.state.threeMode
        };
        localStorage.setItem(App.STORAGE_KEYS.FX_PRESETS, JSON.stringify(state.fxPresets));
        localStorage.setItem(App.STORAGE_KEYS.HTML_FX_PRESET, state.htmlFxPreset);
        localStorage.setItem(App.STORAGE_KEYS.ACTIVE_TAB, state.activeTab);
        localStorage.setItem(App.STORAGE_KEYS.THREE_MODE, state.threeMode);
      } catch (e) {
        console.error("Failed to save state:", e);
      }
    },

    loadStateFromStorage() {
      try {
        const fxPresetsJson = localStorage.getItem(App.STORAGE_KEYS.FX_PRESETS);
        if (fxPresetsJson) {
          App.state.fxPresets = Utils.safeParseJSON(fxPresetsJson, []);
          if (window.ErrlFX && window.ErrlFX.Presets) {
            window.ErrlFX.Presets.renderFxPresetList();
          }
        }
        const htmlFxPreset = localStorage.getItem(App.STORAGE_KEYS.HTML_FX_PRESET);
        if (htmlFxPreset && App.dom.htmlFxPresetSelect) {
          App.dom.htmlFxPresetSelect.value = htmlFxPreset;
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxPreset(htmlFxPreset, false);
          }
        }
        const activeTab = localStorage.getItem(App.STORAGE_KEYS.ACTIVE_TAB);
        if (activeTab) {
          App.activatePreviewTab(activeTab);
        }
        const threeMode = localStorage.getItem(App.STORAGE_KEYS.THREE_MODE);
        if (threeMode && (threeMode === "wire" || threeMode === "voxel3d")) {
          App.state.threeMode = threeMode;
          if (window.ErrlFX && window.ErrlFX.ThreeD) {
            window.ErrlFX.ThreeD.updateThreeModeButtons();
          }
        }
      } catch (e) {
        console.error("Failed to load state:", e);
      }
    }
  };

  window.ErrlFX.Storage = Storage;
})(window);

