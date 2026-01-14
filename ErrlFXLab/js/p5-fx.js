// p5.js integration, presets, and animation
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const P5Fx = {
    stopP5Instance() {
      if (App.state.p5Instance) {
        App.state.p5Instance.remove();
        App.state.p5Instance = null;
      }
      if (App.dom.p5StatusEl) App.dom.p5StatusEl.textContent = "Stopped.";
    },

    startP5WithCurrentSvg() {
      if (!App.state.currentSvg || !App.state.currentSvgUrl) {
        if (App.dom.p5StatusEl) App.dom.p5StatusEl.textContent = "Upload an SVG first.";
        if (App.dom.captureFrameBtn) App.dom.captureFrameBtn.disabled = true;
        return;
      }
      this.stopP5Instance();
      if (!App.dom.p5CanvasHost) return;
      App.state.p5Instance = new p5((p) => {
        let svgImg = null;
        let paused = false;
        function getAudioBoost() {
          if (!App.state.audioReactiveEnabled) return 1;
          return 1 + (App.state.audioReactiveValue || 0) * 0.9;
        }
        p.preload = function() {
          svgImg = p.loadImage(App.state.currentSvgUrl);
        };
        p.setup = function() {
          const sz = Math.min(App.dom.p5CanvasHost.clientWidth || 400, App.dom.p5CanvasHost.clientHeight || 400);
          p.createCanvas(sz, sz);
          p.colorMode(p.HSB, 360, 100, 100);
        };
        p.draw = function() {
          App.state.p5FrameCounter++;
          const now = performance.now();
          if (now - App.state.p5LastFpsSampleTime >= 1000) {
            App.state.p5ApproxFps = App.state.p5FrameCounter / ((now - App.state.p5LastFpsSampleTime) / 1000);
            App.state.p5FrameCounter = 0;
            App.state.p5LastFpsSampleTime = now;
          }
          if (paused || !svgImg) return;
          const t = p.millis() / 1000;
          const audioBoost = getAudioBoost();
          const wobblePhase = t * App.state.p5Config.wobbleSpeed * audioBoost;
          const wobbleRadius = App.state.p5Config.wobbleAmplitude * audioBoost;
          const wobbleX = Math.sin(wobblePhase) * wobbleRadius;
          const wobbleY = Math.cos(wobblePhase * 0.7) * wobbleRadius;
          p.background(App.state.p5Config.bgHue, 20, 10);
          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.rotate(t * App.state.p5Config.rotationIntensity);
          p.translate(wobbleX, wobbleY);
          const glow = App.state.p5Config.glowStrength * (App.state.audioReactiveEnabled ? 1 + App.state.audioReactiveValue * 0.5 : 1);
          if (glow > 0) {
            p.drawingContext.shadowBlur = 20 * glow;
            p.drawingContext.shadowColor = p.color(App.state.p5Config.bgHue, 80, 90);
          }
          p.image(svgImg, -svgImg.width / 2, -svgImg.height / 2);
          p.pop();
        };
        p.keyPressed = function() {
          if (p.key === " ") {
            paused = !paused;
            Utils.playBeep(paused ? 300 : 500, 0.06, "square");
            return false;
          }
        };
      }, App.dom.p5CanvasHost);
      if (App.dom.p5StatusEl) App.dom.p5StatusEl.textContent = "p5 FX running. Space = pause/play.";
      if (App.dom.captureFrameBtn) App.dom.captureFrameBtn.disabled = false;
    },

    applyPreset(presetName, updateSliders = true) {
      const preset = App.state.p5Presets[presetName];
      if (!preset) return;
      App.state.p5Config = { ...preset };
      if (updateSliders) {
        if (App.dom.sliderAmp) App.dom.sliderAmp.value = App.state.p5Config.wobbleAmplitude;
        if (App.dom.sliderFreq) App.dom.sliderFreq.value = App.state.p5Config.wobbleSpeed * 10;
        if (App.dom.sliderRot) App.dom.sliderRot.value = App.state.p5Config.rotationIntensity * 100;
        if (App.dom.sliderHue) App.dom.sliderHue.value = App.state.p5Config.bgHue;
        this.updateP5Labels();
      }
      if (App.state.p5Instance) {
        this.startP5WithCurrentSvg();
      }
    },

    updateP5Labels() {
      if (App.dom.labelAmp) App.dom.labelAmp.textContent = App.state.p5Config.wobbleAmplitude;
      if (App.dom.labelFreq) App.dom.labelFreq.textContent = App.state.p5Config.wobbleSpeed.toFixed(1) + "×";
      if (App.dom.labelRot) App.dom.labelRot.textContent = App.state.p5Config.rotationIntensity.toFixed(2);
      if (App.dom.labelHue) App.dom.labelHue.textContent = App.state.p5Config.bgHue + "°";
    }
  };

  window.ErrlFX.P5Fx = P5Fx;
})(window);

