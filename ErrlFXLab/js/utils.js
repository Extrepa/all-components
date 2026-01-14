// Utility functions for Errl FX Lab
"use strict";

(function(window) {
  const Utils = {
    playBeep(freq, duration, type = "sine") {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    },

    flashStatus(msg, duration = 2000) {
      const statusText = document.getElementById("status-text");
      if (statusText) {
        const orig = statusText.textContent;
        statusText.textContent = msg;
        statusText.classList.add("animate-pulse");
        setTimeout(() => {
          statusText.textContent = orig;
          statusText.classList.remove("animate-pulse");
        }, duration);
      }
    },

    safeParseJSON(str, fallback = null) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return fallback;
      }
    },

    formatShortDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },

    smoothScrollTo(element) {
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },

    flashSectionBorder(el) {
      if (el) {
        el.style.transition = "border-color 0.3s";
        el.style.borderColor = "rgba(52, 225, 255, 0.8)";
        setTimeout(() => {
          el.style.borderColor = "";
        }, 1000);
      }
    },

    randRange(min, max) {
      return Math.random() * (max - min) + min;
    },

    randChoice(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    estimateFps(counter, lastTime, now) {
      const elapsed = (now - lastTime) / 1000;
      if (elapsed >= 1) {
        return counter / elapsed;
      }
      return null;
    },

    estimateDataUrlBytes(dataUrl) {
      if (!dataUrl) return 0;
      const base64 = dataUrl.split(",")[1];
      if (!base64) return 0;
      return Math.ceil((base64.length * 3) / 4);
    }
  };

  window.ErrlFX = window.ErrlFX || {};
  window.ErrlFX.Utils = Utils;
})(window);

