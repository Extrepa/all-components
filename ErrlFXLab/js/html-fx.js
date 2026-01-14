// HTML/CSS filter effects and presets
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const HtmlFx = {
    updateHtmlFxImage() {
      if (!App.dom.htmlFxImage || !App.state.currentSvgUrl) return;
      App.dom.htmlFxImage.src = App.state.currentSvgUrl;
      this.applyHtmlFxFilters();
    },

    applyHtmlFxFilters() {
      if (!App.dom.htmlFxImage) return;
      const f = App.state.htmlFxConfig;
      const filterStr = `blur(${f.blur}px) contrast(${f.contrast}%) hue-rotate(${f.hue}deg) saturate(${f.saturate}%) brightness(${f.brightness}%)`;
      App.dom.htmlFxImage.style.filter = filterStr;
      this.updateHtmlFxLabels();
      if (window.ErrlFX && window.ErrlFX.Sandbox) {
        window.ErrlFX.Sandbox.updateSandboxSnippet();
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    updateHtmlFxLabels() {
      if (App.dom.labelHtmlBlur) App.dom.labelHtmlBlur.textContent = App.state.htmlFxConfig.blur + " px";
      if (App.dom.labelHtmlContrast) App.dom.labelHtmlContrast.textContent = App.state.htmlFxConfig.contrast + "%";
      if (App.dom.labelHtmlHue) App.dom.labelHtmlHue.textContent = App.state.htmlFxConfig.hue + "°";
      if (App.dom.labelHtmlSat) App.dom.labelHtmlSat.textContent = App.state.htmlFxConfig.saturate + "%";
      if (App.dom.labelHtmlBright) App.dom.labelHtmlBright.textContent = App.state.htmlFxConfig.brightness + "%";
    },

    applyHtmlFxPreset(presetName, updateSliders = true) {
      const preset = App.state.htmlFxPresets[presetName];
      if (!preset) return;
      App.state.htmlFxConfig = { ...preset };
      if (updateSliders) {
        if (App.dom.sliderHtmlBlur) App.dom.sliderHtmlBlur.value = App.state.htmlFxConfig.blur;
        if (App.dom.sliderHtmlContrast) App.dom.sliderHtmlContrast.value = App.state.htmlFxConfig.contrast;
        if (App.dom.sliderHtmlHue) App.dom.sliderHtmlHue.value = App.state.htmlFxConfig.hue;
        if (App.dom.sliderHtmlSat) App.dom.sliderHtmlSat.value = App.state.htmlFxConfig.saturate;
        if (App.dom.sliderHtmlBright) App.dom.sliderHtmlBright.value = App.state.htmlFxConfig.brightness;
        this.updateHtmlFxLabels();
      }
      this.applyHtmlFxFilters();
    },

    getCurrentHtmlFxConfig() {
      return { ...App.state.htmlFxConfig };
    }
  };

  window.ErrlFX.HtmlFx = HtmlFx;
})(window);

