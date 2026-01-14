// FX Dice randomizer
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const FxDice = {
    applyFxDice({ wild = false } = {}) {
      const cfg = { ...App.state.p5Config };
      const hueLocked = App.dom.lockBgHueEl?.checked;
      const zoomLocked = App.dom.lockZoomEl?.checked;
      const glowLocked = App.dom.lockGlowEl?.checked;

      if (wild) {
        cfg.wobbleAmplitude = Utils.randRange(10, 90);
        cfg.wobbleSpeed = Utils.randRange(0.2, 4.5);
      } else {
        cfg.wobbleAmplitude *= Utils.randRange(0.7, 1.3);
        cfg.wobbleAmplitude = Math.max(5, Math.min(100, cfg.wobbleAmplitude));
        cfg.wobbleSpeed *= Utils.randRange(0.7, 1.3);
        cfg.wobbleSpeed = Math.max(0.1, Math.min(5, cfg.wobbleSpeed));
      }

      if (!zoomLocked) {
        if (wild) {
          cfg.sceneZoom = Utils.randRange(0.6, 1.8);
        } else {
          cfg.sceneZoom = (cfg.sceneZoom || 1.0) * Utils.randRange(0.85, 1.2);
          cfg.sceneZoom = Math.max(0.6, Math.min(1.8, cfg.sceneZoom));
        }
      }

      if (!glowLocked) {
        if (wild) {
          cfg.glowStrength = Utils.randRange(0.1, 1.0);
        } else {
          cfg.glowStrength *= Utils.randRange(0.7, 1.3);
          cfg.glowStrength = Math.max(0.1, Math.min(1.0, cfg.glowStrength));
        }
      }

      if (!hueLocked) {
        if (wild) {
          cfg.bgHue = Math.floor(Utils.randRange(0, 360));
        } else {
          cfg.bgHue = (cfg.bgHue + Utils.randRange(-40, 40) + 360) % 360;
        }
      }

      App.state.p5Config = cfg;
      if (App.dom.sliderAmp) App.dom.sliderAmp.value = cfg.wobbleAmplitude;
      if (App.dom.sliderFreq) App.dom.sliderFreq.value = cfg.wobbleSpeed * 10;
      if (App.dom.sliderRot) App.dom.sliderRot.value = cfg.rotationIntensity * 100;
      if (App.dom.sliderHue) App.dom.sliderHue.value = cfg.bgHue;
      if (window.ErrlFX && window.ErrlFX.P5Fx) {
        window.ErrlFX.P5Fx.updateP5Labels();
        if (App.state.p5Instance) {
          window.ErrlFX.P5Fx.startP5WithCurrentSvg();
        }
      }

      if (wild && window.ErrlFX && window.ErrlFX.HtmlFx) {
        const presetIds = Object.keys(App.state.htmlFxPresets);
        if (presetIds.length > 0) {
          const chosen = Utils.randChoice(presetIds);
          if (App.dom.htmlFxPresetSelect) App.dom.htmlFxPresetSelect.value = chosen;
          window.ErrlFX.HtmlFx.applyHtmlFxPreset(chosen);
        }
      }

      if (window.ErrlFX && window.ErrlFX.Sandbox) {
        window.ErrlFX.Sandbox.updateSandboxSnippet();
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }

      if (App.dom.fxDiceStatusEl) {
        App.dom.fxDiceStatusEl.textContent = wild ? "Wild roll applied (p5 + HTML FX)." : "Soft roll applied.";
      }
    }
  };

  window.ErrlFX.FxDice = FxDice;
})(window);

