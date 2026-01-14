// SVG parsing, normalization, and inspector
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const SvgHandler = {
    normalizeSvgViewBox(svg) {
      const viewBox = svg.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number);
        if (parts.length === 4) {
          svg.setAttribute("viewBox", "0 0 100 100");
          svg.setAttribute("width", "100");
          svg.setAttribute("height", "100");
          const scale = 100 / Math.max(parts[2], parts[3]);
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("transform", `translate(${-parts[0] * scale}, ${-parts[1] * scale}) scale(${scale})`);
          while (svg.firstChild) {
            g.appendChild(svg.firstChild);
          }
          svg.appendChild(g);
        }
      }
      return svg;
    },

    parseSvgStructure(svg) {
      let paths = 0;
      let groups = 0;
      function walk(el) {
        if (el.tagName === "path") paths++;
        if (el.tagName === "g") groups++;
        Array.from(el.children).forEach(walk);
      }
      walk(svg);
      return { paths, groups };
    },

    renderSvgInspector(svg) {
      const inspectorEl = App.dom.inspectorEl;
      if (!inspectorEl) return;
      let html = "<div class='space-y-1 text-[10px] font-mono'>";
      function walk(el, depth = 0) {
        const indent = "  ".repeat(depth);
        const tag = el.tagName.toLowerCase();
        html += `<div class='text-slate-300'>${indent}&lt;${tag}`;
        if (el.id) html += ` <span class='text-cyan-300'>id="${el.id}"</span>`;
        if (el.classList.length) html += ` <span class='text-fuchsia-300'>class="${el.className.baseVal || el.className}"</span>`;
        html += "&gt;</div>";
        Array.from(el.children).forEach((child) => walk(child, depth + 1));
        html += `<div class='text-slate-300'>${indent}&lt;/${tag}&gt;</div>`;
      }
      walk(svg);
      html += "</div>";
      inspectorEl.innerHTML = html;
    },

    async handleSvgFile(file) {
      if (!file || !file.name.endsWith(".svg")) {
        Utils.flashStatus("Please select a .svg file.", 2000);
        Utils.playBeep(200, 0.1, "square");
        return;
      }
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) {
        Utils.flashStatus("Invalid SVG file.", 2000);
        Utils.playBeep(200, 0.1, "square");
        return;
      }
      App.state.currentSvg = this.normalizeSvgViewBox(svg.cloneNode(true));
      const blob = new Blob([new XMLSerializer().serializeToString(App.state.currentSvg)], { type: "image/svg+xml" });
      App.state.currentSvgUrl = URL.createObjectURL(blob);
      const stats = this.parseSvgStructure(App.state.currentSvg);
      if (App.dom.pathCountEl) App.dom.pathCountEl.textContent = stats.paths;
      if (App.dom.groupCountEl) App.dom.groupCountEl.textContent = stats.groups;
      const vb = App.state.currentSvg.getAttribute("viewBox") || "0 0 100 100";
      if (App.dom.viewBoxInfoEl) App.dom.viewBoxInfoEl.textContent = vb;
      this.renderSvgInspector(App.state.currentSvg);
      if (App.dom.svgPreview) {
        App.dom.svgPreview.innerHTML = "";
        App.dom.svgPreview.appendChild(App.state.currentSvg.cloneNode(true));
        App.dom.svgPreview.classList.remove("hidden");
        if (App.dom.svgPreviewPlaceholder) App.dom.svgPreviewPlaceholder.classList.add("hidden");
      }
      if (App.dom.currentFileName) App.dom.currentFileName.textContent = file.name;
      if (window.ErrlFX && window.ErrlFX.HtmlFx) {
        window.ErrlFX.HtmlFx.updateHtmlFxImage();
      }
      if (App.dom.p5StatusEl) App.dom.p5StatusEl.textContent = "Ready. Switch to p5 FX tab to animate.";
      if (App.dom.wire3dStatusEl) {
        App.dom.wire3dStatusEl.textContent = App.state.threeMode === "wire" ? "Ready. Switch to 3D Wire tab." : "Ready. Switch to 3D Wire tab for voxel heightmap.";
      }
      if (App.dom.voxelStatusEl) App.dom.voxelStatusEl.textContent = "Ready. Switch to Voxels tab.";
      Utils.flashStatus(`Loaded ${file.name} ✅`, 2000);
      Utils.playBeep(600, 0.08, "triangle");
      if (window.ErrlFX && window.ErrlFX.Sandbox) {
        window.ErrlFX.Sandbox.updateSandboxSnippet();
      }
      if (window.ErrlFX && window.ErrlFX.Session) {
        window.ErrlFX.Session.updateSessionJsonOutput();
      }
    },

    updateUiForSvg(svg) {
      if (!svg) return;
      const stats = this.parseSvgStructure(svg);
      if (App.dom.pathCountEl) App.dom.pathCountEl.textContent = stats.paths;
      if (App.dom.groupCountEl) App.dom.groupCountEl.textContent = stats.groups;
      const vb = svg.getAttribute("viewBox") || "0 0 100 100";
      if (App.dom.viewBoxInfoEl) App.dom.viewBoxInfoEl.textContent = vb;
      this.renderSvgInspector(svg);
    }
  };

  window.ErrlFX.SvgHandler = SvgHandler;
})(window);

