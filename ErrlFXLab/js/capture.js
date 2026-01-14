// Frame capture, gallery, and VS mode
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const Capture = {
    createFrameGalleryElement(frame) {
      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      const img = document.createElement("img");
      img.src = frame.url;
      img.className = "w-full h-full object-cover rounded border border-slate-700";
      const starBtn = document.createElement("button");
      starBtn.className = `absolute top-0.5 right-0.5 w-4 h-4 rounded-full border text-[8px] ${frame.favorite ? "bg-amber-500/80 border-amber-400 text-slate-900" : "bg-slate-900/80 border-slate-600 text-slate-400"}`;
      starBtn.textContent = "★";
      starBtn.title = frame.favorite ? "Unfavorite" : "Favorite";
      starBtn.onclick = (e) => {
        e.stopPropagation();
        frame.favorite = !frame.favorite;
        starBtn.className = `absolute top-0.5 right-0.5 w-4 h-4 rounded-full border text-[8px] ${frame.favorite ? "bg-amber-500/80 border-amber-400 text-slate-900" : "bg-slate-900/80 border-slate-600 text-slate-400"}`;
        Utils.playBeep(frame.favorite ? 600 : 300, 0.06, "square");
        if (window.ErrlFX && window.ErrlFX.Diagnostics) {
          window.ErrlFX.Diagnostics.updateDiagnostics();
        }
      };
      wrapper.appendChild(img);
      wrapper.appendChild(starBtn);
      wrapper.onclick = (e) => {
        if (e.shiftKey) {
          this.assignVsSlot(frame, "left");
        } else if (e.altKey) {
          this.assignVsSlot(frame, "right");
        }
      };
      wrapper.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const tag = prompt("Tag this frame (idle, walk, jump, fx, etc.):", frame.tag || "");
        if (tag !== null) {
          frame.tag = tag.trim();
          Utils.playBeep(400, 0.06, "square");
          if (window.ErrlFX && window.ErrlFX.Diagnostics) {
            window.ErrlFX.Diagnostics.updateDiagnostics();
          }
        }
      });
      frame.el = wrapper;
      return wrapper;
    },

    captureCurrentFrameToGallery(canvas, source, modeLabel) {
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const frame = { id, url: dataUrl, favorite: false, source, modeLabel, tag: "", el: null };
      App.state.capturedFrames.push(frame);
      const wrapper = this.createFrameGalleryElement(frame);
      if (App.dom.thumbGallery) App.dom.thumbGallery.appendChild(wrapper);
      if (App.dom.thumbCountEl) App.dom.thumbCountEl.textContent = App.state.capturedFrames.length;
      Utils.playBeep(500, 0.08, "triangle");
      Utils.flashStatus(`Captured frame from ${modeLabel || source} ✅`, 1500);
      if (window.ErrlFX && window.ErrlFX.Diagnostics) {
        window.ErrlFX.Diagnostics.updateDiagnostics();
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    captureActiveViewFrame() {
      const tab = App.getActivePreviewTabName();
      if (tab === "p5" && App.state.p5Instance && App.state.p5Instance.canvas) {
        this.captureCurrentFrameToGallery(App.state.p5Instance.canvas, "p5", "p5 FX");
      } else if (tab === "htmlfx" && App.dom.htmlFxImage) {
        const canvas = document.createElement("canvas");
        canvas.width = App.dom.htmlFxImage.naturalWidth || 400;
        canvas.height = App.dom.htmlFxImage.naturalHeight || 400;
        const ctx = canvas.getContext("2d");
        ctx.filter = App.dom.htmlFxImage.style.filter || "none";
        ctx.drawImage(App.dom.htmlFxImage, 0, 0);
        this.captureCurrentFrameToGallery(canvas, "htmlfx", "HTML FX");
      } else if (tab === "wire3d" && App.state.threeRenderer && App.state.threeRenderer.domElement) {
        const canvas = document.createElement("canvas");
        canvas.width = App.state.threeRenderer.domElement.width;
        canvas.height = App.state.threeRenderer.domElement.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(App.state.threeRenderer.domElement, 0, 0);
        this.captureCurrentFrameToGallery(canvas, "wire3d", App.state.threeMode === "wire" ? "3D Wire" : "3D Voxels");
      } else if (tab === "voxel" && App.dom.voxelCanvas) {
        this.captureCurrentFrameToGallery(App.dom.voxelCanvas, "voxel", "2D Voxels");
      } else if (tab === "svg" && App.dom.svgPreview && App.dom.svgPreview.querySelector("svg")) {
        const svg = App.dom.svgPreview.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 400;
          canvas.height = img.height || 400;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          this.captureCurrentFrameToGallery(canvas, "svg", "SVG Preview");
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        Utils.flashStatus("No active view to capture.", 2000);
        Utils.playBeep(200, 0.1, "square");
      }
    },

    renderVsSlots() {
      if (App.state.vsLeftFrame && App.dom.vsLeftImg) {
        App.dom.vsLeftImg.src = App.state.vsLeftFrame.url;
        App.dom.vsLeftImg.classList.remove("hidden");
        const placeholder = App.dom.vsLeftSlot.querySelector("span:not(.absolute)");
        if (placeholder) placeholder.classList.add("hidden");
      } else {
        if (App.dom.vsLeftImg) App.dom.vsLeftImg.classList.add("hidden");
        const placeholder = App.dom.vsLeftSlot.querySelector("span:not(.absolute)");
        if (placeholder) placeholder.classList.remove("hidden");
      }
      if (App.state.vsRightFrame && App.dom.vsRightImg) {
        App.dom.vsRightImg.src = App.state.vsRightFrame.url;
        App.dom.vsRightImg.classList.remove("hidden");
        const placeholder = App.dom.vsRightSlot.querySelector("span:not(.absolute)");
        if (placeholder) placeholder.classList.add("hidden");
      } else {
        if (App.dom.vsRightImg) App.dom.vsRightImg.classList.add("hidden");
        const placeholder = App.dom.vsRightSlot.querySelector("span:not(.absolute)");
        if (placeholder) placeholder.classList.remove("hidden");
      }
      if (App.dom.vsStatusEl) {
        if (App.state.vsLeftFrame && App.state.vsRightFrame) {
          App.dom.vsStatusEl.textContent = `Ready: ${App.state.vsLeftFrame.modeLabel || "Left"} vs ${App.state.vsRightFrame.modeLabel || "Right"}`;
        } else {
          App.dom.vsStatusEl.textContent = "Shift-click thumb = Left · Alt-click = Right";
        }
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    assignVsSlot(frame, side) {
      if (side === "left") {
        App.state.vsLeftFrame = frame;
        Utils.playBeep(600, 0.06, "triangle");
      } else {
        App.state.vsRightFrame = frame;
        Utils.playBeep(700, 0.06, "triangle");
      }
      this.renderVsSlots();
    },

    clearVsSlots() {
      App.state.vsLeftFrame = null;
      App.state.vsRightFrame = null;
      this.renderVsSlots();
      Utils.playBeep(300, 0.06, "square");
    }
  };

  window.ErrlFX.Capture = Capture;
})(window);

