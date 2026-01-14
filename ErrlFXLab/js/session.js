// Session snapshot export/import
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Session = {
    getCurrentHtmlFxConfig() {
      return {
        selectedPresetId: App.dom.htmlFxPresetSelect?.value || "clean",
        config: { ...App.state.htmlFxConfig }
      };
    },

    getCurrentP5ConfigSnapshot() {
      return {
        bgHue: App.state.p5Config.bgHue,
        wobbleAmplitude: App.state.p5Config.wobbleAmplitude,
        wobbleSpeed: App.state.p5Config.wobbleSpeed,
        rotationIntensity: App.state.p5Config.rotationIntensity,
        glowStrength: App.state.p5Config.glowStrength || 0
      };
    },

    collectSessionSnapshot() {
      const activeTab = App.getActivePreviewTabName();
      return {
        version: App.VERSION,
        createdAt: new Date().toISOString(),
        ui: {
          activeTab,
          threeMode: App.state.threeMode
        },
        svg: {
          hasSvg: !!App.state.currentSvg,
          name: App.dom.currentFileName?.textContent || null
        },
        p5Config: this.getCurrentP5ConfigSnapshot(),
        htmlFx: this.getCurrentHtmlFxConfig(),
        fxPresets: App.state.fxPresets,
        frames: {
          all: App.state.capturedFrames.map((f) => ({
            id: f.id,
            url: f.url,
            favorite: f.favorite,
            source: f.source,
            modeLabel: f.modeLabel,
            tag: f.tag || ""
          })),
          favorites: App.state.capturedFrames.filter((f) => f.favorite).map((f) => f.id)
        },
        versus: {
          leftFrameId: App.state.vsLeftFrame ? App.state.vsLeftFrame.id : null,
          rightFrameId: App.state.vsRightFrame ? App.state.vsRightFrame.id : null
        },
        spritesheetManifest: App.state.lastSpritesheetManifest,
        timelineSnapshot: App.state.lastTimelineSnapshot,
        animationPack: App.state.lastAnimationPack
      };
    },

    updateSessionJsonOutput() {
      if (!App.dom.sessionJsonOutput) return;
      const snapshot = this.collectSessionSnapshot();
      App.dom.sessionJsonOutput.value = JSON.stringify(snapshot, null, 2);
    },

    rebuildCapturedFramesFromSnapshot(framesData) {
      if (!App.dom.thumbGallery) return;
      App.state.capturedFrames = [];
      App.dom.thumbGallery.innerHTML = "";
      framesData.forEach((data) => {
        const frame = {
          id: data.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
          url: data.url,
          favorite: !!data.favorite,
          source: data.source || "p5",
          modeLabel: data.modeLabel || "p5 FX",
          tag: data.tag || "",
          el: null
        };
        App.state.capturedFrames.push(frame);
        if (window.ErrlFX && window.ErrlFX.Capture) {
          const wrapper = window.ErrlFX.Capture.createFrameGalleryElement(frame);
          App.dom.thumbGallery.appendChild(wrapper);
        }
      });
      if (App.dom.thumbCountEl) App.dom.thumbCountEl.textContent = App.state.capturedFrames.length;
    },

    loadSessionSnapshot(snapshot) {
      if (!snapshot || typeof snapshot !== "object") {
        Utils.flashStatus("Invalid snapshot JSON.", 2000);
        Utils.playBeep(200, 0.1, "square");
        return;
      }
      if (Array.isArray(snapshot.fxPresets)) {
        App.state.fxPresets = snapshot.fxPresets;
        if (window.ErrlFX && window.ErrlFX.Presets) {
          window.ErrlFX.Presets.renderFxPresetList();
        }
      }
      if (snapshot.htmlFx && snapshot.htmlFx.selectedPresetId) {
        if (App.dom.htmlFxPresetSelect) App.dom.htmlFxPresetSelect.value = snapshot.htmlFx.selectedPresetId;
        if (window.ErrlFX && window.ErrlFX.HtmlFx) {
          window.ErrlFX.HtmlFx.applyHtmlFxPreset(snapshot.htmlFx.selectedPresetId, false);
        }
      }
      if (snapshot.frames && Array.isArray(snapshot.frames.all)) {
        this.rebuildCapturedFramesFromSnapshot(snapshot.frames.all);
      }
      App.state.vsLeftFrame = null;
      App.state.vsRightFrame = null;
      if (snapshot.versus) {
        if (snapshot.versus.leftFrameId) {
          App.state.vsLeftFrame = App.state.capturedFrames.find((f) => f.id === snapshot.versus.leftFrameId) || null;
        }
        if (snapshot.versus.rightFrameId) {
          App.state.vsRightFrame = App.state.capturedFrames.find((f) => f.id === snapshot.versus.rightFrameId) || null;
        }
      }
      if (window.ErrlFX && window.ErrlFX.Capture) {
        window.ErrlFX.Capture.renderVsSlots();
      }
      if (snapshot.ui) {
        if (snapshot.ui.threeMode && window.ErrlFX && window.ErrlFX.ThreeD) {
          window.ErrlFX.ThreeD.setThreeMode(snapshot.ui.threeMode);
        }
        if (snapshot.ui.activeTab) {
          App.activatePreviewTab(snapshot.ui.activeTab);
        }
      }
      this.updateSessionJsonOutput();
      if (window.ErrlFX && window.ErrlFX.Storage) {
        window.ErrlFX.Storage.saveStateToStorage();
      }
      Utils.flashStatus("Session snapshot loaded ✅", 2000);
      Utils.playBeep(820, 0.1, "triangle");
    }
  };

  window.ErrlFX.Session = Session;
})(window);

