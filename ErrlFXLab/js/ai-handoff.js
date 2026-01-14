// AI Handoff Prompt Generator
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;

  const AIHandoff = {
    summarizeFxPresetsForPrompt(presets) {
      if (!Array.isArray(presets) || !presets.length) return "No saved FX presets yet.";
      const maxList = Math.min(6, presets.length);
      const parts = presets.slice(0, maxList).map((p) => `- ${p.name || "(unnamed preset)"} (id: ${p.id || "no id"})`);
      if (presets.length > maxList) {
        parts.push(`- ...and ${presets.length - maxList} more preset(s).`);
      }
      return parts.join("\n");
    },

    summarizeFramesForPrompt(frames) {
      if (!frames || !frames.all || !frames.all.length) return "No frames captured yet.";
      const total = frames.all.length;
      const favCount = Array.isArray(frames.favorites) ? frames.favorites.length : 0;
      const bySource = { p5: 0, "3d": 0, voxel: 0, other: 0 };
      const tagsCount = {};
      frames.all.forEach((f) => {
        const s = f.source || "other";
        if (bySource[s] !== undefined) bySource[s]++;
        else bySource.other++;
        if (f.tag) tagsCount[f.tag] = (tagsCount[f.tag] || 0) + 1;
      });
      const lines = [];
      lines.push(`Total frames: ${total} (favorites: ${favCount})`);
      lines.push(`By source: p5=${bySource.p5}, 3D=${bySource["3d"]}, 2D voxels=${bySource.voxel}, other=${bySource.other}`);
      if (Object.keys(tagsCount).length) {
        lines.push("Tags used:");
        Object.entries(tagsCount).forEach(([tag, count]) => {
          lines.push(`- ${tag}: ${count} frame(s)`);
        });
      } else {
        lines.push("No frame tags set yet.");
      }
      return lines.join("\n");
    },

    buildAiHandoffPrompt() {
      const target = App.dom.aiHandoffTargetEl?.value || "generic";
      const goal = (App.dom.aiHandoffGoalEl?.value || "").trim();
      if (!window.ErrlFX || !window.ErrlFX.Session) return "";
      const snapshot = window.ErrlFX.Session.collectSessionSnapshot();
      const lines = [];
      lines.push("# Errl FX Lab – AI Handoff Context");
      lines.push("");
      lines.push("You are receiving a structured description of a visual FX + animation session.");
      if (goal) {
        lines.push("## Goal");
        lines.push(goal);
        lines.push("");
      }
      lines.push("## Target System");
      switch (target) {
        case "game-engine":
          lines.push("- Intended consumer: Game engine / animation system.");
          break;
        case "video":
          lines.push("- Intended consumer: Video / motion graphics workflow.");
          break;
        case "obsidian":
          lines.push("- Intended consumer: Documentation / Obsidian note.");
          break;
        case "code":
          lines.push("- Intended consumer: Code assistant for generating JS/TS integration.");
          break;
        default:
          lines.push("- Intended consumer: General AI assistant.");
      }
      lines.push("");
      lines.push("## FX Configuration");
      lines.push(`p5: bgHue=${snapshot.p5Config?.bgHue}, wobble=${snapshot.p5Config?.wobbleAmplitude}/${snapshot.p5Config?.wobbleSpeed}`);
      lines.push(`HTML FX: preset=${snapshot.htmlFx?.selectedPresetId || "clean"}`);
      lines.push("");
      lines.push("## Captured Frames");
      lines.push(this.summarizeFramesForPrompt(snapshot.frames));
      lines.push("");
      if (snapshot.spritesheetManifest) {
        lines.push("## Spritesheet");
        lines.push(`Sheet: ${snapshot.spritesheetManifest.sheet?.width || 0}×${snapshot.spritesheetManifest.sheet?.height || 0}, ${snapshot.spritesheetManifest.frames?.length || 0} frames`);
        lines.push("");
      }
      if (snapshot.timelineSnapshot) {
        lines.push("## Timeline");
        lines.push(`FPS: ${snapshot.timelineSnapshot.fps}, Frames: ${snapshot.timelineSnapshot.frameCount || 0}`);
        lines.push("");
      }
      if (snapshot.animationPack) {
        lines.push("## Animation Pack");
        lines.push(`Animations: ${Object.keys(snapshot.animationPack.animations || {}).join(", ")}`);
        lines.push("");
      }
      return lines.join("\n");
    }
  };

  window.ErrlFX.AIHandoff = AIHandoff;
})(window);
