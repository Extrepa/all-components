// Command palette
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const CommandPalette = {
    commands: [
      { id: "tab-svg", label: "Switch to SVG Preview tab", keywords: "svg preview q", run: () => App.activatePreviewTab("svg") },
      { id: "tab-p5", label: "Switch to p5 FX Lab tab", keywords: "p5 wobble w", run: () => App.activatePreviewTab("p5") },
      { id: "tab-htmlfx", label: "Switch to HTML FX tab", keywords: "html css filters e", run: () => App.activatePreviewTab("htmlfx") },
      { id: "tab-3d", label: "Switch to 3D view", keywords: "3d wire voxels r", run: () => App.activatePreviewTab("wire3d") },
      { id: "tab-voxels", label: "Switch to 2D Voxels tab", keywords: "2d voxels pixels t", run: () => App.activatePreviewTab("voxel") },
      { id: "capture", label: "Capture frame from active tab", keywords: "capture frame screenshot c gallery", run: () => { if (window.ErrlFX && window.ErrlFX.Capture) window.ErrlFX.Capture.captureActiveViewFrame(); } },
      { id: "help", label: "Open Help overlay", keywords: "help keys shortcuts h", run: () => { if (window.ErrlFX && window.ErrlFX.UI) window.ErrlFX.UI.openHelpOverlay(); } },
      { id: "clear", label: "Clear all", keywords: "clear reset wipe", run: () => { if (App.dom.clearBtn) App.dom.clearBtn.click(); } }
    ],

    openCommandPalette() {
      if (!App.dom.commandPalette) return;
      App.state.commandPaletteVisible = true;
      App.dom.commandPalette.classList.remove("hidden");
      App.dom.commandPaletteInput.value = "";
      this.filterCommandPalette("");
      setTimeout(() => {
        App.dom.commandPaletteInput.focus();
        App.dom.commandPaletteInput.select();
      }, 0);
      Utils.playBeep(740, 0.07, "triangle");
    },

    closeCommandPalette() {
      if (!App.dom.commandPalette) return;
      App.state.commandPaletteVisible = false;
      App.dom.commandPalette.classList.add("hidden");
      Utils.playBeep(320, 0.06, "square");
    },

    scoreCommandMatch(cmd, query) {
      if (!query) return 1;
      const hay = (cmd.label + " " + (cmd.keywords || "")).toLowerCase();
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.length) return 1;
      let score = 0;
      tokens.forEach((t) => {
        if (hay.includes(t)) score += 1;
      });
      return score;
    },

    filterCommandPalette(query) {
      const scored = this.commands
        .map((cmd) => ({ cmd, score: this.scoreCommandMatch(cmd, query) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || a.cmd.label.localeCompare(b.cmd.label));
      App.state.commandPaletteFiltered = scored.map((x) => x.cmd);
      App.state.commandPaletteActiveIndex = 0;
      this.renderCommandPaletteList();
    },

    renderCommandPaletteList() {
      if (!App.dom.commandPaletteList) return;
      App.dom.commandPaletteList.innerHTML = "";
      if (!App.state.commandPaletteFiltered.length) {
        const empty = document.createElement("div");
        empty.className = "px-3 py-3 text-[11px] text-slate-500";
        empty.textContent = "No commands match that query.";
        App.dom.commandPaletteList.appendChild(empty);
        return;
      }
      App.state.commandPaletteFiltered.forEach((cmd, idx) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "w-full text-left px-3 py-2 text-[11px] flex items-center justify-between border-b border-slate-900/80 hover:bg-slate-900/80";
        if (idx === App.state.commandPaletteActiveIndex) {
          item.classList.add("bg-slate-900/80");
        }
        const left = document.createElement("div");
        left.className = "flex flex-col";
        const label = document.createElement("div");
        label.className = "text-slate-100";
        label.textContent = cmd.label;
        left.appendChild(label);
        item.appendChild(left);
        item.onclick = () => this.runCommandPaletteItem(idx);
        App.dom.commandPaletteList.appendChild(item);
      });
    },

    runCommandPaletteItem(index) {
      const cmd = App.state.commandPaletteFiltered[index];
      if (!cmd) return;
      this.closeCommandPalette();
      try {
        cmd.run();
      } catch (err) {
        console.error("Command run error:", err);
        Utils.flashStatus("Command failed. Check console.", 2000);
      }
    }
  };

  window.ErrlFX.CommandPalette = CommandPalette;
})(window);
