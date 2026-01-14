// Audio reactive mode
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Audio = {
    initAudioContext() {
      try {
        App.state.audioCtxReactive = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error("Audio context creation failed:", e);
        if (App.dom.audioStatusEl) App.dom.audioStatusEl.textContent = "Audio not supported.";
      }
    },

    stopAudioAnalysis() {
      if (App.state.audioAnimationId !== null) {
        cancelAnimationFrame(App.state.audioAnimationId);
        App.state.audioAnimationId = null;
      }
      if (App.state.audioSourceNode) {
        App.state.audioSourceNode.stop();
        App.state.audioSourceNode = null;
      }
      App.state.audioReactiveEnabled = false;
      App.state.audioReactiveValue = 0;
      if (App.dom.audioToggleBtn) {
        App.dom.audioToggleBtn.textContent = "Enable reactive";
        App.dom.audioToggleBtn.disabled = !App.state.audioSourceNode;
      }
    },

    startAudioAnalysisFromBufferSource(source) {
      if (!App.state.audioCtxReactive) this.initAudioContext();
      if (!App.state.audioCtxReactive) return;
      this.stopAudioAnalysis();
      App.state.audioSourceNode = source;
      App.state.audioAnalyser = App.state.audioCtxReactive.createAnalyser();
      App.state.audioAnalyser.fftSize = 256;
      App.state.audioDataArray = new Uint8Array(App.state.audioAnalyser.frequencyBinCount);
      source.connect(App.state.audioAnalyser);
      source.connect(App.state.audioCtxReactive.destination);
      App.state.audioReactiveEnabled = true;
      if (App.dom.audioToggleBtn) {
        App.dom.audioToggleBtn.textContent = "Disable reactive";
        App.dom.audioToggleBtn.disabled = false;
      }
      const canvas = App.dom.audioSpectrumCanvas;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const animate = () => {
          App.state.audioAnimationId = requestAnimationFrame(animate);
          App.state.audioAnalyser.getByteFrequencyData(App.state.audioDataArray);
          const avg = App.state.audioDataArray.reduce((a, b) => a + b, 0) / App.state.audioDataArray.length;
          App.state.audioReactiveValue = avg / 255;
          ctx.fillStyle = "#02070a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const barWidth = canvas.width / App.state.audioDataArray.length;
          for (let i = 0; i < App.state.audioDataArray.length; i++) {
            const barHeight = (App.state.audioDataArray[i] / 255) * canvas.height;
            ctx.fillStyle = `hsl(${200 + i * 2}, 70%, 60%)`;
            ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
          }
        };
        animate();
      }
    },

    async loadAudioFromFile(file) {
      if (!file) return;
      try {
        if (!App.state.audioCtxReactive) this.initAudioContext();
        if (!App.state.audioCtxReactive) return;
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await App.state.audioCtxReactive.decodeAudioData(arrayBuffer);
        const source = App.state.audioCtxReactive.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        this.startAudioAnalysisFromBufferSource(source);
        source.start(0);
        if (App.dom.audioStatusEl) App.dom.audioStatusEl.textContent = `Loaded: ${file.name}`;
        Utils.flashStatus(`Audio loaded: ${file.name} ✅`, 2000);
        Utils.playBeep(600, 0.08, "triangle");
      } catch (e) {
        console.error("Audio load error:", e);
        if (App.dom.audioStatusEl) App.dom.audioStatusEl.textContent = "Failed to load audio.";
        Utils.flashStatus("Failed to load audio file.", 2000);
        Utils.playBeep(200, 0.1, "square");
      }
    }
  };

  window.ErrlFX.Audio = Audio;
})(window);
