// Event handlers - wires all UI interactions
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Events = {
    init() {
      this.setupFileHandlers();
      this.setupTabHandlers();
      this.setupSliderHandlers();
      this.setupButtonHandlers();
      this.setupNavigationHandlers();
    },

    setupFileHandlers() {
      if (App.dom.svgFileInput) {
        App.dom.svgFileInput.addEventListener("change", (event) => {
          const file = event.target.files?.[0];
          if (file && window.ErrlFX && window.ErrlFX.SvgHandler) {
            window.ErrlFX.SvgHandler.handleSvgFile(file);
          }
        });
      }

      if (App.dom.dropzone) {
        App.dom.dropzone.addEventListener("dragover", (event) => {
          event.preventDefault();
          App.dom.dropzone.classList.add("border-cyan-400/80", "bg-slate-900/80");
        });

        App.dom.dropzone.addEventListener("dragleave", (event) => {
          event.preventDefault();
          App.dom.dropzone.classList.remove("border-cyan-400/80", "bg-slate-900/80");
        });

        App.dom.dropzone.addEventListener("drop", (event) => {
          event.preventDefault();
          App.dom.dropzone.classList.remove("border-cyan-400/80", "bg-slate-900/80");
          const file = event.dataTransfer.files?.[0];
          if (file && file.name.endsWith(".svg") && window.ErrlFX && window.ErrlFX.SvgHandler) {
            window.ErrlFX.SvgHandler.handleSvgFile(file);
          }
        });
      }
    },

    setupTabHandlers() {
      App.dom.tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.dataset.tab;
          App.dom.tabButtons.forEach((b) =>
            b.classList.remove("bg-slate-800/80", "text-slate-50", "border-slate-600/90")
          );
          btn.classList.add("bg-slate-800/80", "text-slate-50", "border-slate-600/90");

          App.dom.previewPanels.forEach((panel) => {
            panel.classList.add("hidden");
            if (panel.dataset.tab === tab) {
              panel.classList.remove("hidden");
            }
          });

          if (tab === "p5") {
            if (window.ErrlFX && window.ErrlFX.ThreeD) {
              window.ErrlFX.ThreeD.stopWire3D();
            }
            if (!App.state.currentSvg) {
              if (App.dom.p5StatusEl) App.dom.p5StatusEl.textContent = "Upload an SVG first.";
              if (App.dom.captureFrameBtn) App.dom.captureFrameBtn.disabled = true;
            } else {
              if (window.ErrlFX && window.ErrlFX.P5Fx) {
                window.ErrlFX.P5Fx.startP5WithCurrentSvg();
              }
            }
          } else {
            if (window.ErrlFX && window.ErrlFX.P5Fx) {
              window.ErrlFX.P5Fx.stopP5Instance();
            }
          }

          if (tab === "wire3d") {
            if (window.ErrlFX && window.ErrlFX.ThreeD) {
              window.ErrlFX.ThreeD.startWire3DWithCurrentSvg();
            }
          } else {
            if (window.ErrlFX && window.ErrlFX.ThreeD) {
              window.ErrlFX.ThreeD.stopWire3D();
            }
          }

          if (tab === "voxel") {
            if (window.ErrlFX && window.ErrlFX.Voxels) {
              window.ErrlFX.Voxels.renderVoxelsForCurrentSvg();
            }
          }

          if (tab === "htmlfx") {
            if (!App.state.currentSvg) {
              if (App.dom.htmlFxStatus) App.dom.htmlFxStatus.textContent = "Upload an SVG to enable HTML FX.";
            } else {
              if (App.dom.htmlFxStatus) App.dom.htmlFxStatus.textContent = "CSS filters are live.";
            }
          }

          if (window.ErrlFX && window.ErrlFX.Storage) {
            window.ErrlFX.Storage.saveStateToStorage();
          }
        });
      });
    },

    setupSliderHandlers() {
      if (App.dom.sliderAmp) {
        App.dom.sliderAmp.addEventListener("input", () => {
          App.state.p5Config.wobbleAmplitude = parseInt(App.dom.sliderAmp.value, 10);
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.updateP5Labels();
            window.ErrlFX.P5Fx.startP5WithCurrentSvg();
          }
        });
      }

      if (App.dom.sliderFreq) {
        App.dom.sliderFreq.addEventListener("input", () => {
          App.state.p5Config.wobbleSpeed = parseInt(App.dom.sliderFreq.value, 10) / 10;
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.updateP5Labels();
            window.ErrlFX.P5Fx.startP5WithCurrentSvg();
          }
        });
      }

      if (App.dom.sliderRot) {
        App.dom.sliderRot.addEventListener("input", () => {
          App.state.p5Config.rotationIntensity = parseInt(App.dom.sliderRot.value, 10) / 100;
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.updateP5Labels();
            window.ErrlFX.P5Fx.startP5WithCurrentSvg();
          }
        });
      }

      if (App.dom.sliderHue) {
        App.dom.sliderHue.addEventListener("input", () => {
          App.state.p5Config.bgHue = parseInt(App.dom.sliderHue.value, 10);
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.updateP5Labels();
            window.ErrlFX.P5Fx.startP5WithCurrentSvg();
          }
        });
      }

      if (App.dom.sliderHtmlBlur) {
        App.dom.sliderHtmlBlur.addEventListener("input", () => {
          App.state.htmlFxConfig.blur = parseInt(App.dom.sliderHtmlBlur.value, 10);
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxFilters();
          }
        });
      }

      if (App.dom.sliderHtmlContrast) {
        App.dom.sliderHtmlContrast.addEventListener("input", () => {
          App.state.htmlFxConfig.contrast = parseInt(App.dom.sliderHtmlContrast.value, 10);
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxFilters();
          }
        });
      }

      if (App.dom.sliderHtmlHue) {
        App.dom.sliderHtmlHue.addEventListener("input", () => {
          App.state.htmlFxConfig.hue = parseInt(App.dom.sliderHtmlHue.value, 10);
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxFilters();
          }
        });
      }

      if (App.dom.sliderHtmlSat) {
        App.dom.sliderHtmlSat.addEventListener("input", () => {
          App.state.htmlFxConfig.saturate = parseInt(App.dom.sliderHtmlSat.value, 10);
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxFilters();
          }
        });
      }

      if (App.dom.sliderHtmlBright) {
        App.dom.sliderHtmlBright.addEventListener("input", () => {
          App.state.htmlFxConfig.brightness = parseInt(App.dom.sliderHtmlBright.value, 10);
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxFilters();
          }
        });
      }
    },

    setupButtonHandlers() {
      if (App.dom.clearBtn) {
        App.dom.clearBtn.addEventListener("click", () => {
          App.state.currentSvg = null;
          if (App.state.currentSvgUrl) {
            URL.revokeObjectURL(App.state.currentSvgUrl);
            App.state.currentSvgUrl = null;
          }
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.stopP5Instance();
          }
          if (window.ErrlFX && window.ErrlFX.ThreeD) {
            window.ErrlFX.ThreeD.stopWire3D();
          }
          if (App.dom.voxelCanvas) {
            const ctx = App.dom.voxelCanvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, App.dom.voxelCanvas.width, App.dom.voxelCanvas.height);
          }
          App.state.capturedFrames = [];
          if (App.dom.thumbGallery) App.dom.thumbGallery.innerHTML = "";
          if (App.dom.thumbCountEl) App.dom.thumbCountEl.textContent = "0";
          if (window.ErrlFX && window.ErrlFX.Capture) {
            window.ErrlFX.Capture.clearVsSlots();
          }
          if (App.dom.svgPreview) {
            App.dom.svgPreview.innerHTML = "";
            App.dom.svgPreview.classList.add("hidden");
          }
          if (App.dom.svgPreviewPlaceholder) {
            App.dom.svgPreviewPlaceholder.classList.remove("hidden");
          }
          if (App.dom.currentFileName) App.dom.currentFileName.textContent = "No file loaded";
          if (App.dom.pathCountEl) App.dom.pathCountEl.textContent = "–";
          if (App.dom.groupCountEl) App.dom.groupCountEl.textContent = "–";
          if (App.dom.viewBoxInfoEl) App.dom.viewBoxInfoEl.textContent = "–";
          if (App.dom.inspectorEl) App.dom.inspectorEl.innerHTML = "<p class='text-slate-400'>Once you upload an SVG, we'll show a simplified DOM tree here.</p>";
          if (App.dom.sandboxHtmlOutput) App.dom.sandboxHtmlOutput.value = "";
          if (App.dom.sessionJsonOutput) App.dom.sessionJsonOutput.value = "";
          if (App.dom.hintLabel) App.dom.hintLabel.textContent = "Hint: Upload Errl, tune FX, capture frames, then VS or sandbox.";
          Utils.flashStatus("Cleared all ✅", 2000);
          Utils.playBeep(300, 0.08, "square");
        });
      }

      if (App.dom.captureFrameBtn) {
        App.dom.captureFrameBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Capture) {
            window.ErrlFX.Capture.captureActiveViewFrame();
          }
        });
      }

      if (App.dom.presetSelect) {
        App.dom.presetSelect.addEventListener("change", () => {
          const presetName = App.dom.presetSelect.value;
          if (window.ErrlFX && window.ErrlFX.P5Fx) {
            window.ErrlFX.P5Fx.applyPreset(presetName);
          }
        });
      }

      if (App.dom.htmlFxPresetSelect) {
        App.dom.htmlFxPresetSelect.addEventListener("change", () => {
          const presetName = App.dom.htmlFxPresetSelect.value;
          if (window.ErrlFX && window.ErrlFX.HtmlFx) {
            window.ErrlFX.HtmlFx.applyHtmlFxPreset(presetName);
          }
          if (window.ErrlFX && window.ErrlFX.Storage) {
            window.ErrlFX.Storage.saveStateToStorage();
          }
        });
      }

      if (App.dom.savePresetBtn) {
        App.dom.savePresetBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Presets) {
            window.ErrlFX.Presets.saveCurrentPresetFromUi();
          }
        });
      }

      if (App.dom.copyCssFilterBtn) {
        App.dom.copyCssFilterBtn.addEventListener("click", async () => {
          const f = App.state.htmlFxConfig;
          const filterStr = `blur(${f.blur}px) contrast(${f.contrast}%) hue-rotate(${f.hue}deg) saturate(${f.saturate}%) brightness(${f.brightness}%)`;
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(filterStr);
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = filterStr;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
            Utils.flashStatus("CSS filter copied ✅", 1500);
            Utils.playBeep(600, 0.06, "triangle");
          } catch (e) {
            Utils.flashStatus("Failed to copy.", 2000);
          }
        });
      }

      if (App.dom.vsUseFavoritesBtn) {
        App.dom.vsUseFavoritesBtn.addEventListener("click", () => {
          const favorites = App.state.capturedFrames.filter((f) => f.favorite);
          if (favorites.length >= 2 && window.ErrlFX && window.ErrlFX.Capture) {
            window.ErrlFX.Capture.assignVsSlot(favorites[0], "left");
            window.ErrlFX.Capture.assignVsSlot(favorites[1], "right");
          } else {
            Utils.flashStatus("Need at least 2 favorite frames.", 2000);
          }
        });
      }

      if (App.dom.vsClearBtn) {
        App.dom.vsClearBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Capture) {
            window.ErrlFX.Capture.clearVsSlots();
          }
        });
      }

      if (App.dom.vsDownloadBtn) {
        App.dom.vsDownloadBtn.addEventListener("click", () => {
          if (!App.state.vsLeftFrame || !App.state.vsRightFrame) {
            Utils.flashStatus("Fill both VS slots first.", 2000);
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.width = 800;
          canvas.height = 400;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#02070a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const padding = 20;
          const cardWidth = (canvas.width - padding * 3) / 2;
          const cardHeight = canvas.height - padding * 2;
          const leftImg = new Image();
          leftImg.onload = () => {
            ctx.drawImage(leftImg, padding, padding, cardWidth, cardHeight);
            const rightImg = new Image();
            rightImg.onload = () => {
              ctx.drawImage(rightImg, padding * 2 + cardWidth, padding, cardWidth, cardHeight);
              ctx.fillStyle = "#ecf9ff";
              ctx.font = "bold 32px system-ui";
              ctx.textAlign = "center";
              ctx.fillText("VS", canvas.width / 2, canvas.height / 2);
              ctx.font = "14px system-ui";
              const leftLabel = App.state.vsLeftFrame.modeLabel || "Left";
              const rightLabel = App.state.vsRightFrame.modeLabel || "Right";
              ctx.fillText(leftLabel, padding + cardWidth / 2, canvas.height - 40);
              ctx.fillText(rightLabel, padding * 2 + cardWidth + cardWidth / 2, canvas.height - 40);
              canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "errl-vs.png";
                a.click();
                URL.revokeObjectURL(url);
                Utils.flashStatus("VS image downloaded ✅", 2000);
                Utils.playBeep(600, 0.08, "triangle");
              });
            };
            rightImg.src = App.state.vsRightFrame.url;
          };
          leftImg.src = App.state.vsLeftFrame.url;
        });
      }

      if (App.dom.copySandboxBtn) {
        App.dom.copySandboxBtn.addEventListener("click", async () => {
          if (window.ErrlFX && window.ErrlFX.Sandbox) {
            const html = window.ErrlFX.Sandbox.getCurrentSandboxHtml();
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(html);
              } else {
                const textarea = document.createElement("textarea");
                textarea.value = html;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
              }
              Utils.flashStatus("Sandbox HTML copied ✅", 1500);
              Utils.playBeep(600, 0.06, "triangle");
            } catch (e) {
              Utils.flashStatus("Failed to copy.", 2000);
            }
          }
        });
      }

      if (App.dom.downloadSandboxBtn) {
        App.dom.downloadSandboxBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Sandbox) {
            const html = window.ErrlFX.Sandbox.getCurrentSandboxHtml();
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "errl-fx-sandbox.html";
            a.click();
            URL.revokeObjectURL(url);
            Utils.flashStatus("Sandbox HTML downloaded ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          }
        });
      }

      if (App.dom.copySessionJsonBtn) {
        App.dom.copySessionJsonBtn.addEventListener("click", async () => {
          if (window.ErrlFX && window.ErrlFX.Session) {
            window.ErrlFX.Session.updateSessionJsonOutput();
            const text = App.dom.sessionJsonOutput.value;
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
              } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
              }
              Utils.flashStatus("Session JSON copied ✅", 2000);
              Utils.playBeep(780, 0.08, "sine");
            } catch (e) {
              Utils.flashStatus("Failed to copy.", 2000);
            }
          }
        });
      }

      if (App.dom.downloadSessionJsonBtn) {
        App.dom.downloadSessionJsonBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Session) {
            window.ErrlFX.Session.updateSessionJsonOutput();
            const text = App.dom.sessionJsonOutput.value;
            const blob = new Blob([text], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const dateTag = new Date().toISOString().replace(/[:.]/g, "-");
            a.href = url;
            a.download = `errl-fx-session-${dateTag}.json`;
            a.click();
            URL.revokeObjectURL(url);
            Utils.flashStatus("Session JSON downloaded ✅", 2000);
            Utils.playBeep(840, 0.08, "triangle");
          }
        });
      }

      if (App.dom.loadSessionJsonBtn) {
        App.dom.loadSessionJsonBtn.addEventListener("click", () => {
          if (App.dom.loadSessionJsonInput) {
            App.dom.loadSessionJsonInput.value = "";
            App.dom.loadSessionJsonInput.click();
          }
        });
      }

      if (App.dom.loadSessionJsonInput) {
        App.dom.loadSessionJsonInput.addEventListener("change", () => {
          const file = App.dom.loadSessionJsonInput.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = String(e.target?.result || "");
              if (App.dom.sessionJsonOutput) App.dom.sessionJsonOutput.value = text;
              const parsed = JSON.parse(text);
              if (window.ErrlFX && window.ErrlFX.Session) {
                window.ErrlFX.Session.loadSessionSnapshot(parsed);
              }
            } catch (err) {
              console.error("Error loading session JSON:", err);
              Utils.flashStatus("Could not parse session JSON.", 2000);
              Utils.playBeep(200, 0.1, "square");
            }
          };
          reader.readAsText(file);
        });
      }

      if (App.dom.applySessionJsonFromTextareaBtn) {
        App.dom.applySessionJsonFromTextareaBtn.addEventListener("click", () => {
          try {
            const text = App.dom.sessionJsonOutput?.value.trim();
            if (!text) {
              Utils.flashStatus("Textarea is empty.", 2000);
              return;
            }
            const parsed = JSON.parse(text);
            if (window.ErrlFX && window.ErrlFX.Session) {
              window.ErrlFX.Session.loadSessionSnapshot(parsed);
            }
          } catch (err) {
            console.error("Error parsing session JSON:", err);
            Utils.flashStatus("Could not parse JSON from textarea.", 2000);
            Utils.playBeep(200, 0.1, "square");
          }
        });
      }

      if (App.dom.audioLoadBtn) {
        App.dom.audioLoadBtn.addEventListener("click", () => {
          if (App.dom.audioFileInput) {
            App.dom.audioFileInput.value = "";
            App.dom.audioFileInput.click();
          }
        });
      }

      if (App.dom.audioFileInput) {
        App.dom.audioFileInput.addEventListener("change", () => {
          const file = App.dom.audioFileInput.files?.[0];
          if (file && window.ErrlFX && window.ErrlFX.Audio) {
            window.ErrlFX.Audio.loadAudioFromFile(file);
          }
        });
      }

      if (App.dom.audioToggleBtn) {
        App.dom.audioToggleBtn.addEventListener("click", () => {
          if (App.state.audioReactiveEnabled) {
            if (window.ErrlFX && window.ErrlFX.Audio) {
              window.ErrlFX.Audio.stopAudioAnalysis();
            }
          } else {
            if (App.state.audioSourceNode && window.ErrlFX && window.ErrlFX.Audio) {
              window.ErrlFX.Audio.startAudioAnalysisFromBufferSource(App.state.audioSourceNode);
            }
          }
        });
      }

      if (App.dom.helpOverlayBtn) {
        App.dom.helpOverlayBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.openHelpOverlay();
          }
        });
      }

      if (App.dom.helpOverlayCloseBtn) {
        App.dom.helpOverlayCloseBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.closeHelpOverlay();
          }
        });
      }

      if (App.dom.helpOverlay) {
        App.dom.helpOverlay.addEventListener("click", (e) => {
          if (e.target === App.dom.helpOverlay && window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.closeHelpOverlay();
          }
        });
      }

      if (App.dom.quickStartBtn) {
        App.dom.quickStartBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.openQuickStartOverlay();
          }
        });
      }

      if (App.dom.quickStartCloseBtn) {
        App.dom.quickStartCloseBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.closeQuickStartOverlay();
          }
        });
      }

      if (App.dom.quickStartOverlay) {
        App.dom.quickStartOverlay.addEventListener("click", (e) => {
          if (e.target === App.dom.quickStartOverlay && window.ErrlFX && window.ErrlFX.UI) {
            window.ErrlFX.UI.closeQuickStartOverlay();
          }
        });
      }

      if (App.dom.fxDiceSoftBtn) {
        App.dom.fxDiceSoftBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.FxDice) {
            window.ErrlFX.FxDice.applyFxDice({ wild: false });
          }
          Utils.flashStatus("FX Dice: soft roll 🎲", 2000);
          Utils.playBeep(760, 0.08, "triangle");
        });
      }

      if (App.dom.fxDiceWildBtn) {
        App.dom.fxDiceWildBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.FxDice) {
            window.ErrlFX.FxDice.applyFxDice({ wild: true });
          }
          Utils.flashStatus("FX Dice: wild roll 🔥", 2000);
          Utils.playBeep(880, 0.09, "triangle");
        });
      }

      if (App.dom.exportSpritesheetBtn) {
        App.dom.exportSpritesheetBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Export) {
            const frames = window.ErrlFX.Export.getSpritesheetFramesSelection();
            const maxCols = parseInt(App.dom.spritesheetMaxCols?.value || "8", 10);
            window.ErrlFX.Export.buildSpritesheet(frames, maxCols);
          }
        });
      }

      if (App.dom.copySpritesheetManifestBtn) {
        App.dom.copySpritesheetManifestBtn.addEventListener("click", async () => {
          const text = App.dom.spritesheetManifestOutput?.value;
          if (!text) {
            Utils.flashStatus("Export a spritesheet first.", 2000);
            return;
          }
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(text);
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
            Utils.flashStatus("Spritesheet manifest copied ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          } catch (e) {
            Utils.flashStatus("Failed to copy.", 2000);
          }
        });
      }

      if (App.dom.timelineBuildBtn) {
        App.dom.timelineBuildBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Export) {
            window.ErrlFX.Export.buildTimeline();
          }
        });
      }

      if (App.dom.timelinePlayPauseBtn) {
        App.dom.timelinePlayPauseBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Export) {
            if (App.state.timelineIsPlaying) {
              window.ErrlFX.Export.stopTimelineAnimation();
            } else {
              window.ErrlFX.Export.startTimelineAnimation();
            }
          }
        });
      }

      if (App.dom.timelineExportJsonBtn) {
        App.dom.timelineExportJsonBtn.addEventListener("click", async () => {
          const text = App.dom.timelineJsonOutput?.value;
          if (!text) {
            Utils.flashStatus("Build a timeline first.", 2000);
            return;
          }
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(text);
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
            Utils.flashStatus("Timeline JSON copied ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          } catch (e) {
            Utils.flashStatus("Failed to copy.", 2000);
          }
        });
      }

      if (App.dom.animPackBuildBtn) {
        App.dom.animPackBuildBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Export) {
            window.ErrlFX.Export.buildAnimationPackFromManifest();
          }
        });
      }

      if (App.dom.animPackCopyBtn) {
        App.dom.animPackCopyBtn.addEventListener("click", async () => {
          const text = App.dom.animPackOutput?.value;
          if (!text) {
            Utils.flashStatus("Build an animation pack first.", 2000);
            return;
          }
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(text);
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
            Utils.flashStatus("Animation pack JSON copied ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          } catch (e) {
            Utils.flashStatus("Failed to copy.", 2000);
          }
        });
      }

      if (App.dom.projectSaveBtn) {
        App.dom.projectSaveBtn.addEventListener("click", () => {
          const name = App.dom.projectNameInput?.value.trim();
          if (!name) {
            Utils.flashStatus("Enter a project name.", 2000);
            return;
          }
          if (window.ErrlFX && window.ErrlFX.Session && window.ErrlFX.Projects) {
            const snapshot = window.ErrlFX.Session.collectSessionSnapshot();
            const id = window.ErrlFX.Projects.upsertProject(name, snapshot, App.state.currentProjectId);
            App.state.currentProjectId = id;
            if (App.dom.projectNameInput) App.dom.projectNameInput.value = "";
            Utils.flashStatus(`Project "${name}" saved ✅`, 2000);
            Utils.playBeep(600, 0.08, "triangle");
          }
        });
      }

      if (App.dom.projectsRefreshBtn) {
        App.dom.projectsRefreshBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Projects) {
            window.ErrlFX.Projects.renderProjectsList();
          }
        });
      }

      if (App.dom.aiHandoffBuildBtn) {
        App.dom.aiHandoffBuildBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.AIHandoff) {
            const prompt = window.ErrlFX.AIHandoff.buildAiHandoffPrompt();
            if (App.dom.aiHandoffOutput) {
              App.dom.aiHandoffOutput.value = prompt;
            }
            if (App.dom.aiHandoffCopyBtn) {
              App.dom.aiHandoffCopyBtn.disabled = false;
            }
            Utils.flashStatus("AI handoff prompt built ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          }
        });
      }

      if (App.dom.aiHandoffCopyBtn) {
        App.dom.aiHandoffCopyBtn.addEventListener("click", async () => {
          const text = App.dom.aiHandoffOutput?.value;
          if (!text) {
            Utils.flashStatus("Build an AI prompt first.", 2000);
            return;
          }
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(text);
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
            Utils.flashStatus("AI prompt copied ✅", 2000);
            Utils.playBeep(600, 0.08, "triangle");
          } catch (e) {
            Utils.flashStatus("Failed to copy.", 2000);
          }
        });
      }

      if (App.dom.commandPaletteInput) {
        App.dom.commandPaletteInput.addEventListener("input", () => {
          if (window.ErrlFX && window.ErrlFX.CommandPalette) {
            window.ErrlFX.CommandPalette.filterCommandPalette(App.dom.commandPaletteInput.value || "");
          }
        });

        App.dom.commandPaletteInput.addEventListener("keydown", (e) => {
          if (!App.state.commandPaletteVisible) return;
          if (e.key === "Escape") {
            if (window.ErrlFX && window.ErrlFX.CommandPalette) {
              window.ErrlFX.CommandPalette.closeCommandPalette();
            }
          }
        });
      }

      if (App.dom.commandPalette) {
        App.dom.commandPalette.addEventListener("click", (e) => {
          if (e.target === App.dom.commandPalette && window.ErrlFX && window.ErrlFX.CommandPalette) {
            window.ErrlFX.CommandPalette.closeCommandPalette();
          }
        });
      }

      if (App.dom.diagRefreshBtn) {
        App.dom.diagRefreshBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.Diagnostics) {
            window.ErrlFX.Diagnostics.updateDiagnostics();
          }
        });
      }

      if (App.dom.wire3dModeWireBtn) {
        App.dom.wire3dModeWireBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.ThreeD) {
            window.ErrlFX.ThreeD.setThreeMode("wire");
          }
        });
      }

      if (App.dom.wire3dModeVoxel3dBtn) {
        App.dom.wire3dModeVoxel3dBtn.addEventListener("click", () => {
          if (window.ErrlFX && window.ErrlFX.ThreeD) {
            window.ErrlFX.ThreeD.setThreeMode("voxel3d");
          }
        });
      }

      if (App.dom.exportPresetsBtn) {
        App.dom.exportPresetsBtn.addEventListener("click", () => {
          const data = { presets: App.state.fxPresets };
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "errl-fx-presets.json";
          a.click();
          URL.revokeObjectURL(url);
          Utils.flashStatus("Exported FX preset pack JSON ✅", 2000);
          Utils.playBeep(780, 0.09, "triangle");
        });
      }

      if (App.dom.importPresetsInput) {
        App.dom.importPresetsInput.addEventListener("change", () => {
          const file = App.dom.importPresetsInput.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = String(e.target?.result || "");
              const data = JSON.parse(text);
              if (data.presets && Array.isArray(data.presets)) {
                App.state.fxPresets.push(...data.presets);
                if (window.ErrlFX && window.ErrlFX.Presets) {
                  window.ErrlFX.Presets.renderFxPresetList();
                }
                if (window.ErrlFX && window.ErrlFX.Storage) {
                  window.ErrlFX.Storage.saveStateToStorage();
                }
                Utils.flashStatus(`Imported ${data.presets.length} presets ✅`, 2000);
                Utils.playBeep(600, 0.08, "triangle");
              }
            } catch (err) {
              console.error("Import presets error:", err);
              Utils.flashStatus("Failed to import presets.", 2000);
              Utils.playBeep(200, 0.1, "square");
            }
          };
          reader.readAsText(file);
        });
      }
    },

    setupNavigationHandlers() {
      if (App.dom.navGalleryBtn) {
        App.dom.navGalleryBtn.addEventListener("click", () => {
          if (App.dom.capturedFramesSection) {
            Utils.smoothScrollTo(App.dom.capturedFramesSection);
            Utils.flashSectionBorder(App.dom.capturedFramesSection);
          }
          if (App.dom.hintLabel) {
            App.dom.hintLabel.textContent = "Gallery via nav · Shift thumb = Left, Alt = Right.";
          }
          Utils.playBeep(640, 0.07, "triangle");
        });
      }

      if (App.dom.navFavoritesBtn) {
        App.dom.navFavoritesBtn.addEventListener("click", () => {
          if (App.dom.capturedFramesSection) {
            Utils.smoothScrollTo(App.dom.capturedFramesSection);
            Utils.flashSectionBorder(App.dom.capturedFramesSection);
          }
          const favorites = App.state.capturedFrames.filter((f) => f.favorite);
          favorites.forEach((f) => {
            if (f.el) {
              f.el.classList.add("ring-2", "ring-amber-400/80");
              setTimeout(() => {
                if (f.el) f.el.classList.remove("ring-2", "ring-amber-400/80");
              }, 900);
            }
          });
          if (App.dom.hintLabel) {
            App.dom.hintLabel.textContent = "Favorites highlighted · Use 'Use first 2 favorites' in VS to auto-fill.";
          }
          Utils.playBeep(780, 0.07, "triangle");
        });
      }

      if (App.dom.navVsBtn) {
        App.dom.navVsBtn.addEventListener("click", () => {
          if (App.dom.vsSection) {
            Utils.smoothScrollTo(App.dom.vsSection);
            Utils.flashSectionBorder(App.dom.vsSection);
          }
          if (App.dom.hintLabel) {
            App.dom.hintLabel.textContent = "VS: Shift-click = Left, Alt-click = Right, then 'Download VS image'.";
          }
          Utils.playBeep(700, 0.07, "triangle");
        });
      }
    }
  };

  window.ErrlFX.Events = Events;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Events.init());
  } else {
    Events.init();
  }
})(window);

