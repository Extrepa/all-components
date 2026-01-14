// Keyboard shortcuts
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Keyboard = {
    init() {
      window.addEventListener("keydown", (event) => {
        if (App.state.commandPaletteVisible) {
          if (event.key === "Escape") {
            if (window.ErrlFX && window.ErrlFX.CommandPalette) {
              window.ErrlFX.CommandPalette.closeCommandPalette();
            }
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter") {
            if (window.ErrlFX && window.ErrlFX.CommandPalette) {
              const input = App.dom.commandPaletteInput;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                App.state.commandPaletteActiveIndex = (App.state.commandPaletteActiveIndex + 1) % App.state.commandPaletteFiltered.length;
                window.ErrlFX.CommandPalette.renderCommandPaletteList();
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                App.state.commandPaletteActiveIndex = (App.state.commandPaletteActiveIndex - 1 + App.state.commandPaletteFiltered.length) % App.state.commandPaletteFiltered.length;
                window.ErrlFX.CommandPalette.renderCommandPaletteList();
              } else if (event.key === "Enter") {
                event.preventDefault();
                window.ErrlFX.CommandPalette.runCommandPaletteItem(App.state.commandPaletteActiveIndex);
              }
            }
            return;
          }
        }

        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
          if (event.key === "Escape") {
            event.target.blur();
          }
          return;
        }

        const key = event.key.toLowerCase();

        if ((event.ctrlKey || event.metaKey) && key === "k") {
          event.preventDefault();
          if (window.ErrlFX && window.ErrlFX.CommandPalette) {
            if (App.state.commandPaletteVisible) {
              window.ErrlFX.CommandPalette.closeCommandPalette();
            } else {
              window.ErrlFX.CommandPalette.openCommandPalette();
            }
          }
          return;
        }

        if (event.key === "Escape") {
          if (App.dom.helpOverlay && !App.dom.helpOverlay.classList.contains("hidden")) {
            if (window.ErrlFX && window.ErrlFX.UI) {
              window.ErrlFX.UI.closeHelpOverlay();
            }
            return;
          }
          if (App.dom.quickStartOverlay && !App.dom.quickStartOverlay.classList.contains("hidden")) {
            if (window.ErrlFX && window.ErrlFX.UI) {
              window.ErrlFX.UI.closeQuickStartOverlay();
            }
            return;
          }
        }

        if (key === "h") {
          if (window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.openHelpOverlay();
          }
          return;
        }

        if (key === "q") {
          App.activatePreviewTab("svg");
          return;
        }
        if (key === "w") {
          App.activatePreviewTab("p5");
          return;
        }
        if (key === "e") {
          App.activatePreviewTab("htmlfx");
          return;
        }
        if (key === "r") {
          App.activatePreviewTab("wire3d");
          return;
        }
        if (key === "t") {
          App.activatePreviewTab("voxel");
          return;
        }

        if (key === "g") {
          if (App.dom.capturedFramesSection) {
            Utils.smoothScrollTo(App.dom.capturedFramesSection);
            Utils.flashSectionBorder(App.dom.capturedFramesSection);
          }
          if (App.dom.hintLabel) {
            App.dom.hintLabel.textContent = "Gallery via keyboard · Shift thumb = Left, Alt = Right.";
          }
          Utils.playBeep(640, 0.07, "triangle");
          return;
        }

        if (key === "v") {
          if (App.dom.vsSection) {
            Utils.smoothScrollTo(App.dom.vsSection);
            Utils.flashSectionBorder(App.dom.vsSection);
          }
          if (App.dom.hintLabel) {
            App.dom.hintLabel.textContent = "VS via keyboard · fill slots, then export.";
          }
          Utils.playBeep(720, 0.07, "triangle");
          return;
        }

        if (event.code === "Space") {
          event.preventDefault();
          if (App.state.p5Instance && App.state.p5Instance.keyPressed) {
            App.state.p5Instance.keyPressed();
          }
          return;
        }

        if (key === "1" || key === "2") {
          const presets = Object.keys(App.state.p5Presets);
          if (presets.length > 0) {
            const idx = parseInt(key) - 1;
            const presetName = presets[idx % presets.length];
            if (window.ErrlFX && window.ErrlFX.P5Fx) {
              window.ErrlFX.P5Fx.applyPreset(presetName);
            }
            Utils.playBeep(500 + idx * 100, 0.06, "triangle");
          }
          return;
        }

        if (key === "c") {
          if (window.ErrlFX && window.ErrlFX.Capture) {
            window.ErrlFX.Capture.captureActiveViewFrame();
          }
          return;
        }

        if (key === "s") {
          if (window.ErrlFX && window.ErrlFX.Presets) {
            window.ErrlFX.Presets.saveCurrentPresetFromUi();
          }
          return;
        }

        if (key === "d") {
          if (window.ErrlFX && window.ErrlFX.FxDice) {
            window.ErrlFX.FxDice.applyFxDice({ wild: event.shiftKey });
          }
          return;
        }
      });
    }
  };

  window.ErrlFX.Keyboard = Keyboard;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Keyboard.init());
  } else {
    Keyboard.init();
  }
})(window);

