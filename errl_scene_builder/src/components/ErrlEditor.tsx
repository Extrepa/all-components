import React, { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "./AppShell";
import { AssetPanel } from "./AssetPanel";
import { RightPanel } from "./RightPanel";
import { SceneViewport } from "./SceneViewport";
import { useSceneStore } from "../scene/store";
import { loadSharedScene } from "../share/sharedScenes";
import { loadSceneFromLocal, saveSceneToLocal } from "../share/localScene";
import { FxState } from "./FxPanel";
import { TemplatePicker } from "./TemplatePicker";
import { templateSummaries, loadTemplate, createBlankScene } from "../templates/manifest";
import { useKeyboardShortcutsSimple } from "@/shared/hooks";
import { HelpOverlay } from "./HelpOverlay";
import { exportSVGAsPNG, exportSVGString } from "@/shared/utils/export";
import { TopToolbar } from "./TopToolbar";
import { AssetDefinition } from "../assets/registry";
import { getVariantGroupForAsset, getVariantIndex } from "../assets/errlVariants";

/**
 * ErrlEditor
 *
 * Top-level editor layout shell.
 * - Top bar: global controls (save/load/new/undo/redo/export).
 * - Left sidebar: AssetPanel (asset library, collapsible).
 * - Center: SceneViewport (SVG renderer powered by the scene store).
 * - Right sidebar: LayerPanel + Inspector/FxPanel tabs (scene hierarchy + properties, collapsible).
 *
 * This component is responsible only for arranging panels and wiring props to
 * existing store-backed components. It does not own scene data itself.
 */

export const ErrlEditor: React.FC = () => {
  const setScene = useSceneStore((s) => s.setScene);
  // Default panels to closed on mobile (< 768px) for better canvas space
  const [leftOpen, setLeftOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [rightOpen, setRightOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const scene = useSceneStore((s) => s.scene);
  const [fx, setFx] = useState<FxState>({
    blur: 0,
    glow: 0,
    noise: 0.05,
    vignette: 0,
    hueRotate: 0,
  });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{ asset: AssetDefinition; initialX: number; initialY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const canUndo = useSceneStore((s) => s.canUndo);
  const canRedo = useSceneStore((s) => s.canRedo);
  const removeEntity = useSceneStore((s) => s.removeEntity);
  const selectedEntityIds = useSceneStore((s) => s.selectedEntityIds);
  const setSelectedEntities = useSceneStore((s) => s.setSelectedEntities);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTool, setSelectedTool] = useState<"select" | "line" | "rectangle" | "circle" | "star" | "hexagon" | "shape-group" | "magic" | "text" | "image" | "upload">("select");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("shareId");
    if (shareId) {
      loadSharedScene(shareId).then((shared) => {
        if (shared) {
          setScene(shared.scene);
        }
      });
    } else {
      const local = loadSceneFromLocal();
      if (local) {
        setScene(local);
      } else {
        setShowTemplates(true);
      }
    }
  }, [setScene]);

  useEffect(() => {
    saveSceneToLocal(scene);
  }, [scene]);

  useKeyboardShortcutsSimple({
    onDelete: () => {
      if (selectedEntityIds.length > 0) {
        selectedEntityIds.forEach((id) => removeEntity(id));
      }
    },
    onDeselect: () => setSelectedEntities([]),
    onUndo: undo,
    onRedo: redo,
  });

  const handleSaveProject = async () => {
    const project = {
      version: "1.0",
      timestamp: Date.now(),
      scene,
      fx,
    };
    const { exportJSON } = await import("@/shared/utils/export");
    exportJSON(project, `errl-project-${Date.now()}`, { pretty: true });
  };

  const handleLoadProject = (evt?: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt?.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.scene) {
          setScene(json.scene);
        }
        if (json.fx) {
          setFx(json.fx);
        }
      } catch (err) {
        console.error("Failed to parse project", err);
        alert("Invalid project file");
      } finally {
        if (evt?.target) evt.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExportPNG = useCallback(async () => {
    const svg = svgRef.current || document.querySelector("#scene-viewport-wrapper svg") as SVGSVGElement;
    if (!svg) {
      alert("Scene not ready for export");
      return;
    }
    try {
      document.body.style.cursor = "wait";
      const { exportSVGAsPNG } = await import("@/shared/utils/export");
      await exportSVGAsPNG(svg, `errl-scene-${Date.now()}`, {
        width: scene.viewport.width,
        height: scene.viewport.height,
        backgroundColor: "#09090b",
      });
    } catch (err) {
      console.error("PNG Export failed", err);
      alert("Could not generate PNG.");
    } finally {
      document.body.style.cursor = "default";
    }
  }, [scene.viewport]);

  const handleExportSVG = useCallback(async () => {
    const svg = svgRef.current || document.querySelector("#scene-viewport-wrapper svg") as SVGSVGElement;
    if (!svg) {
      alert("Scene not ready for export");
      return;
    }
    const { exportSVG } = await import("@/shared/utils/export");
    exportSVG(svg, `errl-scene-${Date.now()}`, {
      backgroundColor: "#09090b",
      noExportSelector: ".no-export",
    });
  }, []);

  const handleExportPreset = useCallback(async (preset: { id: string; width: number; height: number; transparentBg?: boolean }) => {
    const svg = svgRef.current || document.querySelector("#scene-viewport-wrapper svg") as SVGSVGElement;
    if (!svg) {
      alert("Scene not ready for export");
      return;
    }
    try {
      document.body.style.cursor = "wait";
      const { exportSVGAsPNG } = await import("@/shared/utils/export");
      const width = preset.width || scene.viewport.width;
      const height = preset.height || scene.viewport.height;
      await exportSVGAsPNG(svg, `errl-scene-${preset.id.toLowerCase()}-${Date.now()}`, {
        width,
        height,
        transparentBg: preset.transparentBg,
        backgroundColor: preset.transparentBg ? undefined : "#09090b",
      });
    } catch (err) {
      console.error("Export failed", err);
      alert("Could not generate PNG.");
    } finally {
      document.body.style.cursor = "default";
    }
  }, [scene.viewport]);

  const handleClear = useCallback(() => {
    if (confirm("Clear all elements from the scene?")) {
      const entities = useSceneStore.getState().scene.entities;
      entities.forEach((e) => useSceneStore.getState().removeEntity(e.id));
    }
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Reset scene to blank? This will clear all elements.")) {
      setScene(createBlankScene());
      setFx({
        blur: 0,
        glow: 0,
        noise: 0.05,
        vignette: 0,
        hueRotate: 0,
      });
    }
  }, [setScene]);

  return (
    <AppShell>
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {showTemplates && (
        <TemplatePicker
          onSelect={async (id) => {
            if (id === "__blank") {
              setScene(createBlankScene());
            } else {
              const tpl = templateSummaries.find((t) => t.id === id);
              if (tpl) {
                const sceneData = await loadTemplate(tpl);
                setScene(sceneData);
              }
            }
            setShowTemplates(false);
          }}
          onCancel={() => setShowTemplates(false)}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleLoadProject}
        style={{ display: "none" }}
      />

      <div className="floating-ui-shell">
        <TopToolbar
          onSave={handleSaveProject}
          onLoad={() => fileInputRef.current?.click()}
          onNew={() => setShowTemplates(true)}
          onClear={handleClear}
          onReset={handleReset}
          onUndo={undo}
          onRedo={redo}
          onHelp={() => setShowHelp(true)}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onExportPreset={handleExportPreset}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          showGridOverlay={showGridOverlay}
          onToggleSnap={() => setSnapToGrid((v) => !v)}
          onGridSizeChange={setGridSize}
          onToggleGridOverlay={() => setShowGridOverlay((v) => !v)}
          canUndo={canUndo}
          canRedo={canRedo}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
        />

        <main id="scene-viewport-wrapper" className="canvas-layer" ref={(el) => {
          if (el) {
            const svg = el.querySelector("svg");
            if (svg) svgRef.current = svg;
          }
        }}>
          <SceneViewport 
            fx={fx}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            showGridOverlay={showGridOverlay}
            previewAsset={previewAsset}
            onPlacePreview={(x, y, scale) => {
              if (!previewAsset) return;
              const asset = previewAsset.asset;
              
              // Auto-placement based on asset tags/category
              let layerId = "layer_main"; // Default
              if (asset.category === "BACKGROUNDS" || asset.tags?.includes("background")) {
                layerId = "layer_background";
              } else if (asset.tags?.includes("foreground")) {
                layerId = "layer_foreground";
              }
              
              // Check if this asset is part of a variant group
              const variantGroup = getVariantGroupForAsset(asset.id);
              const variantIndex = variantGroup ? getVariantIndex(asset.id) : undefined;
              
              const entity = {
                id: "entity_" + Math.random().toString(36).slice(2, 8),
                assetId: asset.id,
                layerId,
                transform: { x, y, scaleX: scale, scaleY: scale, rotation: 0 },
                style: { opacity: 1, blendMode: "normal" },
                motion: [],
                ...(variantGroup && variantIndex !== undefined && {
                  metadata: {
                    variantGroupId: variantGroup.id,
                    variantIndex: variantIndex,
                  },
                }),
              };
              useSceneStore.getState().addEntity(entity);
              setPreviewAsset(null);
            }}
            onCancelPreview={() => setPreviewAsset(null)}
          />
        </main>

        <aside className={`floating-panel left ${leftOpen ? "open" : "collapsed"} no-png-export`}>
          <div className="floating-panel-body">
             <section className="floating-panel-section floating-panel-section-accent floating-panel-section-fill asset-panel-section">
              <div className="floating-panel-heading floating-panel-heading-actions">
                <span className="elements-title">Elements</span>
                <button
                  className="panel-heading-action"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import scene JSON"
                >
                  Import
                </button>
              </div>
              <div className="floating-panel-scroll scrollbar-thin">
                <AssetPanel 
                  onSelectAssetForPlacement={(asset) => {
                    // Start preview mode - initial position will be set on first mouse move
                    setPreviewAsset({ asset, initialX: 0, initialY: 0 });
                  }}
                />
              </div>
            </section>
          </div>
          <button
            className="panel-toggle"
            onClick={() => setLeftOpen((v) => !v)}
            title={leftOpen ? "Collapse" : "Expand"}
          >
            {leftOpen ? "⟨" : "⟩"}
          </button>
        </aside>

        <aside className={`floating-panel right ${rightOpen ? "open" : "collapsed"} no-png-export`}>
          <button
            className="panel-toggle"
            onClick={() => setRightOpen((v) => !v)}
            title={rightOpen ? "Collapse" : "Expand"}
          >
            {rightOpen ? "⟩" : "⟨"}
          </button>
          
          <div className="floating-panel-body">
             <RightPanel 
                fx={fx} 
                onFxChange={(k, v) => setFx((prev) => ({ ...prev, [k]: v }))} 
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                onToggleSnap={() => setSnapToGrid((v) => !v)}
                onGridSizeChange={setGridSize}
             />
          </div>
        </aside>
      </div>
    </AppShell>
  );
};
