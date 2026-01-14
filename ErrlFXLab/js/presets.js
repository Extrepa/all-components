// FX preset management
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Presets = {
    saveCurrentPresetFromUi() {
      const name = App.dom.presetNameInput?.value.trim();
      if (!name) {
        Utils.flashStatus("Enter a preset name.", 2000);
        Utils.playBeep(200, 0.1, "square");
        return;
      }
      const preset = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        p5Config: { ...App.state.p5Config },
        htmlFxConfig: { ...App.state.htmlFxConfig },
        createdAt: new Date().toISOString()
      };
      App.state.fxPresets.push(preset);
      this.renderFxPresetList();
      if (App.dom.presetNameInput) App.dom.presetNameInput.value = "";
      if (window.ErrlFX && window.ErrlFX.Storage) {
        window.ErrlFX.Storage.saveStateToStorage();
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
      Utils.flashStatus(`Saved preset: ${name} ✅`, 2000);
      Utils.playBeep(600, 0.08, "triangle");
    },

    applyFxPreset(preset) {
      if (!preset) return;
      App.state.p5Config = { ...preset.p5Config };
      App.state.htmlFxConfig = { ...preset.htmlFxConfig };
      if (App.dom.sliderAmp) App.dom.sliderAmp.value = App.state.p5Config.wobbleAmplitude;
      if (App.dom.sliderFreq) App.dom.sliderFreq.value = App.state.p5Config.wobbleSpeed * 10;
      if (App.dom.sliderRot) App.dom.sliderRot.value = App.state.p5Config.rotationIntensity * 100;
      if (App.dom.sliderHue) App.dom.sliderHue.value = App.state.p5Config.bgHue;
      if (window.ErrlFX && window.ErrlFX.P5Fx) {
        window.ErrlFX.P5Fx.updateP5Labels();
        window.ErrlFX.P5Fx.startP5WithCurrentSvg();
      }
      if (App.dom.sliderHtmlBlur) App.dom.sliderHtmlBlur.value = App.state.htmlFxConfig.blur;
      if (App.dom.sliderHtmlContrast) App.dom.sliderHtmlContrast.value = App.state.htmlFxConfig.contrast;
      if (App.dom.sliderHtmlHue) App.dom.sliderHtmlHue.value = App.state.htmlFxConfig.hue;
      if (App.dom.sliderHtmlSat) App.dom.sliderHtmlSat.value = App.state.htmlFxConfig.saturate;
      if (App.dom.sliderHtmlBright) App.dom.sliderHtmlBright.value = App.state.htmlFxConfig.brightness;
      if (window.ErrlFX && window.ErrlFX.HtmlFx) {
        window.ErrlFX.HtmlFx.updateHtmlFxLabels();
        window.ErrlFX.HtmlFx.applyHtmlFxFilters();
      }
    },

    renderFxPresetList() {
      if (!App.dom.presetList) return;
      App.dom.presetList.innerHTML = "";
      if (App.state.fxPresets.length === 0) {
        App.dom.presetList.innerHTML = "<p class='text-slate-500'>No presets yet. Tweak sliders, then click Save or press \"S\".</p>";
        return;
      }
      App.state.fxPresets.forEach((preset) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-1.5 rounded border border-slate-700/80 bg-slate-900/40";
        const left = document.createElement("div");
        left.className = "flex-1";
        left.textContent = preset.name;
        const right = document.createElement("div");
        right.className = "flex items-center gap-1";
        const applyBtn = document.createElement("button");
        applyBtn.className = "px-1.5 py-0.5 rounded border border-cyan-500/70 text-cyan-200 text-[9px] hover:bg-cyan-500/15";
        applyBtn.textContent = "Apply";
        applyBtn.onclick = () => {
          this.applyFxPreset(preset);
          Utils.playBeep(500, 0.06, "triangle");
        };
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "px-1.5 py-0.5 rounded border border-rose-500/70 text-rose-200 text-[9px] hover:bg-rose-500/15";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
          App.state.fxPresets = App.state.fxPresets.filter((p) => p.id !== preset.id);
          this.renderFxPresetList();
          if (window.ErrlFX && window.ErrlFX.Storage) {
            window.ErrlFX.Storage.saveStateToStorage();
          }
          Utils.playBeep(240, 0.08, "square");
        };
        right.appendChild(applyBtn);
        right.appendChild(deleteBtn);
        item.appendChild(left);
        item.appendChild(right);
        App.dom.presetList.appendChild(item);
      });
    }
  };

  window.ErrlFX.Presets = Presets;
})(window);

