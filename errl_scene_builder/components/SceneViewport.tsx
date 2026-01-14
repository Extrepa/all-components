import React, { useEffect, useRef, useState } from "react";
import { useSceneStore } from "../scene/store";
import { useSceneRenderer } from "../renderer/useSceneRenderer";
import { createSvgRenderer } from "../renderer/svgRenderer";
import { ExportDialog } from "./ExportDialog";
import { ISceneRenderer } from "../renderer/interface";
import { SceneEntity } from "../scene/types";
import { useMemo } from "react";
import { useSceneDragDrop } from "../hooks/useSceneDragDrop";
import { getAssetById, AssetDefinition } from "../assets/registry";
import { FxState } from "./FxPanel";

/**
 * Determines the appropriate layer ID for an asset based on its tags.
 * Background layer: assets with tags "background" or "panel"
 * Foreground layer: assets with tags "decor", "festival", "goo", or "blob"
 * Main layer: everything else (default)
 */
const getLayerIdForAsset = (asset: AssetDefinition): string => {
  const tags = asset.tags || [];
  
  // Check for background tags
  if (tags.some(tag => tag === "background" || tag === "panel")) {
    return "layer_bg";
  }
  
  // Check for foreground tags
  if (tags.some(tag => tag === "decor" || tag === "festival" || tag === "goo" || tag === "blob")) {
    return "layer_fg";
  }
  
  // Default to main layer
  return "layer_main";
};

type Props = {
  fx?: FxState;
  snapToGrid?: boolean;
  gridSize?: number;
  showGridOverlay?: boolean;
  previewAsset?: { asset: AssetDefinition; initialX: number; initialY: number } | null;
  onPlacePreview?: (x: number, y: number, scale: number) => void;
  onCancelPreview?: () => void;
};

type PlacementPhase = 'positioning' | 'sizing' | null;

const RENDER_BASE_SIZE = 128;
const DEFAULT_ENTITY_SCALE = 1.2;
const MIN_ENTITY_SCALE = 0.25;
const MAX_ENTITY_SCALE = 10;

export const SceneViewport: React.FC<Props> = ({ 
  fx, 
  snapToGrid = false, 
  gridSize = 20,
  showGridOverlay = false,
  previewAsset,
  onPlacePreview,
  onCancelPreview,
}) => {
  const scene = useSceneStore((s) => s.scene);
  const setSelectedEntities = useSceneStore((s) => s.setSelectedEntities);
  const updateEntity = useSceneStore((s) => s.updateEntity);
  const addEntity = useSceneStore((s) => s.addEntity);
  const selectedLayerId = useSceneStore((s) => s.selectedLayerId);
  const playbackTimeMs = useSceneStore((s) => s.playbackTimeMs);
  const selectedEntityIds = useSceneStore((s) => s.selectedEntityIds);
  const { containerRef, rendererRef } = useSceneRenderer({
    factory: createSvgRenderer,
    scene,
    parallaxEnabled: true,
  });
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [svgEl, setSvgEl] = useState<SVGSVGElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerRect, setContainerRect] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number; scale: number } | null>(null);
  const [placementPhase, setPlacementPhase] = useState<PlacementPhase>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const placementCenterRef = useRef<{ x: number; y: number } | null>(null);

  const selectedEntity: SceneEntity | undefined = useMemo(
    () => scene.entities.find((e) => e.id === selectedEntityIds[0]),
    [scene.entities, selectedEntityIds]
  );

  // Snap to grid helper
  const snapToGridPos = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y };
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    return { x: snappedX, y: snappedY };
  };

  const pointerToScene = (evt: PointerEvent): { x: number; y: number } | null => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 1024;
    const y = ((evt.clientY - rect.top) / rect.height) * 1024;
    return { x, y };
  };

  // Preview mode: two-phase placement
  // Phase 1: First click places element centered at grid position
  // Phase 2: Second click sets size based on distance from first click
  useEffect(() => {
    if (!previewAsset) {
      setPreviewPos(null);
      setPlacementPhase(null);
      setMousePos(null);
      placementCenterRef.current = null;
      return;
    }

    const defaultScale = DEFAULT_ENTITY_SCALE;
    const minScale = MIN_ENTITY_SCALE;
    const maxScale = MAX_ENTITY_SCALE;
    const baseSize = RENDER_BASE_SIZE;

    // Start in positioning phase and show preview at center initially
    if (placementPhase === null) {
      setPlacementPhase('positioning');
      // Show preview at center of canvas initially
      const centerX = 512; // Center of 1024 canvas
      const centerY = 512;
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const maxPreviewSize = Math.min(rect.width, rect.height) / 8;
        const previewScale = Math.min(defaultScale, maxPreviewSize / baseSize);
        setPreviewPos({ x: centerX, y: centerY, scale: previewScale });
      } else {
        // Fallback if container not ready yet
        setPreviewPos({ x: centerX, y: centerY, scale: defaultScale });
      }
    }

    const handleMouseMove = (evt: MouseEvent) => {
      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((evt.clientX - rect.left) / rect.width) * 1024;
      const y = ((evt.clientY - rect.top) / rect.height) * 1024;
      const snapped = snapToGridPos(x, y);
      
      // Clamping helper to keep entities within 0-1024 bounds
      const clampToCanvas = (val: number) => Math.max(0, Math.min(1024, val));

      if (placementPhase === 'positioning') {
        // Calculate max preview size as 1/8 of viewport (not canvas)
        const maxPreviewSize = Math.min(rect.width, rect.height) / 8;
        const baseSize = 128; // SVG base size
        // Scale default to fit within max preview size
        const previewScale = Math.min(defaultScale, maxPreviewSize / baseSize);
        setPreviewPos({ x: clampToCanvas(snapped.x), y: clampToCanvas(snapped.y), scale: previewScale });
        setMousePos({ x: clampToCanvas(snapped.x), y: clampToCanvas(snapped.y) });
      } else if (placementPhase === 'sizing' && placementCenterRef.current) {
        // Track mouse position for distance line
        setMousePos({ x: clampToCanvas(snapped.x), y: clampToCanvas(snapped.y) });
        
        // Calculate scale based on distance from placement center
        const center = placementCenterRef.current;
        const dx = snapped.x - center.x;
        const dy = snapped.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
        // Scale is proportional to distance from center (base size = 128px rendered art)
        const scale = Math.max(minScale, Math.min(maxScale, distance / baseSize));
        
        // Keep element centered at placement position
        setPreviewPos({ x: center.x, y: center.y, scale });
      }
    };

    const handleClick = (evt: MouseEvent) => {
      // Only handle clicks on the viewport container
      const container = containerRef.current;
      if (!container) return;
      
      // Check if click is within the viewport
      const rect = container.getBoundingClientRect();
      if (evt.clientX < rect.left || evt.clientX > rect.right || 
          evt.clientY < rect.top || evt.clientY > rect.bottom) {
        return;
      }
      
      // Don't handle clicks on transform handles or other overlays
      const target = evt.target as HTMLElement;
      if (target.closest('.no-png-export') || target.closest('[data-entity-id]')) {
        return;
      }
      
      const svg = container.querySelector("svg");
      if (!svg) return;
      const svgRect = svg.getBoundingClientRect();
      const x = ((evt.clientX - svgRect.left) / svgRect.width) * 1024;
      const y = ((evt.clientY - svgRect.top) / svgRect.height) * 1024;
      const snapped = snapToGridPos(x, y);
      // Clamping helper to keep entities within 0-1024 bounds
      const clampToCanvas = (val: number) => Math.max(0, Math.min(1024, val));

      if (placementPhase === 'positioning') {
        // First click: place element centered at this position
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        placementCenterRef.current = { x: clampToCanvas(snapped.x), y: clampToCanvas(snapped.y) };
        setPlacementPhase('sizing');
        setPreviewPos({ x: clampToCanvas(snapped.x), y: clampToCanvas(snapped.y), scale: defaultScale });
      } else if (placementPhase === 'sizing' && placementCenterRef.current) {
        // Second click: finalize size based on distance
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const center = placementCenterRef.current;
        const dx = snapped.x - center.x;
        const dy = snapped.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = Math.max(minScale, Math.min(maxScale, distance / baseSize));
        
        // Place element centered at first click position with calculated scale
        if (onPlacePreview) {
          onPlacePreview(center.x, center.y, scale);
          setPreviewPos(null);
          setPlacementPhase(null);
          setMousePos(null);
          placementCenterRef.current = null;
        }
      }
    };

    const handleEscape = (evt: KeyboardEvent) => {
      if (evt.key === "Escape" && onCancelPreview) {
        onCancelPreview();
        setPreviewPos(null);
        setPlacementPhase(null);
        setMousePos(null);
        placementCenterRef.current = null;
      }
    };

    const container = containerRef.current;
    if (!container) return;
    
    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick, true); // Use capture phase to handle before other handlers
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewAsset, placementPhase, snapToGrid, gridSize, onPlacePreview, onCancelPreview, containerRef]);

  // Selection semantics:
  // - Click on an entity to select it (single-select).
  // - Click on empty space to clear selection.
  // (Shift/multi-select can be layered in later.)
  // Dragging:
  // - Pointer down on entity starts a drag with scene-space coordinates derived from the SVG viewBox (0–1024).
  // - Pointer move applies deltas to entity.transform.x/y via store.updateEntity.
  // - Snap: holds Shift to snap movement to 10px increments.
  // - Scale/rotate handles are separate overlays; translation happens on entity surface.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (previewAsset) return; // Don't handle entity selection during preview

    const handleMove = (evt: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const pos = pointerToScene(evt);
      if (!pos) return;
      const dx = pos.x - drag.startX;
      const dy = pos.y - drag.startY;
      const entity = useSceneStore.getState().scene.entities.find((e) => e.id === drag.id);
      if (!entity) return;
      const snap = evt.shiftKey ? 10 : 0;
      const nx = drag.origX + dx;
      const ny = drag.origY + dy;
      const snappedX = snap ? Math.round(nx / snap) * snap : nx;
      const snappedY = snap ? Math.round(ny / snap) * snap : ny;
      updateEntity(drag.id, {
        transform: {
          ...entity.transform,
          x: snappedX,
          y: snappedY,
        },
      });
    };

    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", handleMove);
    };

    const handlePointer = (evt: PointerEvent) => {
      const target = evt.target as HTMLElement | null;
      const g = target?.closest("[data-entity-id]") as HTMLElement | null;
      if (g?.dataset.entityId) {
        const id = g.dataset.entityId;
        setSelectedEntities([id]);
        const pos = pointerToScene(evt);
        if (!pos) return;
        const entity = useSceneStore.getState().scene.entities.find((e) => e.id === id);
        if (!entity) return;
        dragRef.current = {
          id,
          startX: pos.x,
          startY: pos.y,
          origX: entity.transform.x,
          origY: entity.transform.y,
        };
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp, { once: true });
      } else {
        setSelectedEntities([]);
      }
    };

    el.addEventListener("pointerdown", handlePointer);
    return () => {
      el.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [containerRef, setSelectedEntities, updateEntity, previewAsset]);

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => {
      const svg = containerRef.current?.querySelector("svg");
      if (svg) {
        setSvgEl(svg as SVGSVGElement);
        svgRef.current = svg as SVGSVGElement;
        if (fx) {
          svg.style.filter = [
            fx.hueRotate ? `hue-rotate(${fx.hueRotate}deg)` : "",
            fx.blur ? `blur(${fx.blur}px)` : "",
            fx.glow ? `drop-shadow(0 0 ${fx.glow * 20}px rgba(165,180,252,${fx.glow}))` : "",
          ]
            .filter(Boolean)
            .join(" ");
        }
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setContainerRect({ width: rect.width, height: rect.height });
    });
    return () => window.cancelAnimationFrame(handle);
  }, [containerRef, fx]);

  useEffect(() => {
    const renderer = rendererRef.current as ISceneRenderer | null;
    if (renderer?.setPlaybackTime) {
      renderer.setPlaybackTime(playbackTimeMs);
      renderer.render(scene);
    }
  }, [playbackTimeMs, scene, rendererRef]);

  const { handleDragOver, handleDrop } = useSceneDragDrop({
    svgRef,
    onDropAsset: (item, loc) => {
      const asset = getAssetById(item.assetId);
      if (!asset) return;
      // Use tag-based layer assignment, fallback to selected layer or main
      const layerId = getLayerIdForAsset(asset) || selectedLayerId || "layer_main";
      const id = "entity_" + Math.random().toString(36).slice(2, 8);
      addEntity({
        id,
        assetId: asset.id,
        layerId,
        transform: { x: loc.x, y: loc.y, scaleX: 1, scaleY: 1, rotation: 0 },
        style: { opacity: 1, blendMode: "normal" },
        motion: asset.defaultMotion || [],
      });
      setSelectedEntities([id]);
    },
  });

  const noiseOpacity = fx?.noise ?? 0;
  const vignette = fx?.vignette ?? 0;

  return (
    <div className="viewport-shell" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="viewport-frame">
        <div ref={containerRef} className="viewport-canvas" />
        {showGridOverlay && (
          <div
            className="canvas-grid"
            style={{
              backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              opacity: 0.3,
            }}
          />
        )}
        {noiseOpacity > 0 && (
          <div
            className="fx-noise-overlay"
            style={{ opacity: noiseOpacity }}
          />
        )}
        {vignette > 0 && (
          <div
            className="fx-vignette-overlay"
            style={{ boxShadow: `inset 0 0 180px rgba(0,0,0,${vignette})` }}
          />
        )}
        {svgEl && <ExportDialog svgRef={{ current: svgEl }} />}
        {selectedEntity && containerRect.width > 0 && containerRect.height > 0 && (
          <TransformOverlay
            entity={selectedEntity}
            containerSize={containerRect}
            onScale={(scale) =>
              updateEntity(selectedEntity.id, {
                transform: {
                  ...selectedEntity.transform,
                  scaleX: scale,
                  scaleY: scale,
                },
              })
            }
            onRotate={(rotation) =>
              updateEntity(selectedEntity.id, {
                transform: { ...selectedEntity.transform, rotation },
              })
            }
            className="no-png-export"
          />
        )}
        {previewAsset && previewPos && containerRect.width > 0 && containerRect.height > 0 && (
          <PreviewElement
            asset={previewAsset.asset}
            x={previewPos.x}
            y={previewPos.y}
            scale={previewPos.scale}
            containerSize={containerRect}
            placementPhase={placementPhase}
            placementCenter={placementCenterRef.current}
            mousePos={mousePos}
          />
        )}
      </div>
    </div>
  );
};

type OverlayProps = {
  entity: SceneEntity;
  containerSize: { width: number; height: number };
  onScale: (scale: number) => void;
  onRotate: (rotation: number) => void;
  className?: string;
};

const PreviewElement: React.FC<{
  asset: AssetDefinition;
  x: number;
  y: number;
  scale: number;
  containerSize: { width: number; height: number };
  placementPhase: PlacementPhase;
  placementCenter: { x: number; y: number } | null;
  mousePos: { x: number; y: number } | null;
}> = ({ asset, x, y, scale, containerSize, placementPhase, placementCenter, mousePos }) => {
  const cx = (x / 1024) * containerSize.width;
  const cy = (y / 1024) * containerSize.height;
  
  // Calculate max preview size as 1/8 of viewport (not canvas)
  const maxPreviewSize = Math.min(containerSize.width, containerSize.height) / 8;
  
  // Preview uses the rendered base size (128). Clamp visual preview but keep actual scale value untouched.
  const previewScale = Math.min(scale, maxPreviewSize / RENDER_BASE_SIZE);
  const wPx = (RENDER_BASE_SIZE * previewScale * containerSize.width) / 1024;
  const hPx = (RENDER_BASE_SIZE * previewScale * containerSize.height) / 1024;

  // Show distance line during sizing phase
  const showDistanceLine = placementPhase === 'sizing' && placementCenter && mousePos;
  let distanceLine = null;
  if (showDistanceLine) {
    const centerCx = (placementCenter.x / 1024) * containerSize.width;
    const centerCy = (placementCenter.y / 1024) * containerSize.height;
    const mouseCx = (mousePos.x / 1024) * containerSize.width;
    const mouseCy = (mousePos.y / 1024) * containerSize.height;
    
    distanceLine = (
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: containerSize.width,
          height: containerSize.height,
          pointerEvents: "none",
          zIndex: 999,
        }}
      >
        <line
          x1={centerCx}
          y1={centerCy}
          x2={mouseCx}
          y2={mouseCy}
          stroke="rgba(91, 224, 255, 0.6)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <circle
          cx={centerCx}
          cy={centerCy}
          r="4"
          fill="rgba(91, 224, 255, 0.8)"
        />
      </svg>
    );
  }

  return (
    <>
      {distanceLine}
    <div
      className="preview-element"
      style={{
        position: "absolute",
        left: cx - wPx / 2,
        top: cy - hPx / 2,
        width: wPx,
        height: hPx,
        pointerEvents: "none",
        opacity: 0.7,
          border: placementPhase === 'sizing' ? "2px solid rgba(91, 224, 255, 0.9)" : "2px dashed rgba(91, 224, 255, 0.8)",
        borderRadius: "4px",
        background: "rgba(91, 224, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(91, 224, 255, 0.9)",
        fontSize: "12px",
        fontWeight: "600",
        zIndex: 1000,
      }}
    >
      <img
        src={asset.filePath}
        alt={asset.label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
    </>
  );
};

const TransformOverlay: React.FC<OverlayProps> = ({ entity, containerSize, onScale, onRotate, className }) => {
  const { x, y, scaleX, scaleY, rotation } = entity.transform;
  const baseSize = 1024; // Matches renderer (SVG images are 1024x1024)
  const wPx = (baseSize * scaleX * containerSize.width) / 1024;
  const hPx = (baseSize * scaleY * containerSize.height) / 1024;
  const cx = (x / 1024) * containerSize.width;
  const cy = (y / 1024) * containerSize.height;
  const left = cx - wPx / 2;
  const top = cy - hPx / 2;
  const handleSize = 12;

  const handleScaleDrag = (evt: React.PointerEvent<HTMLDivElement>) => {
    evt.stopPropagation();
    const startX = evt.clientX;
    const startY = evt.clientY;
    const startScale = (scaleX + scaleY) / 2;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Use distance from start point for more intuitive scaling
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Use a sensitivity factor based on container size for consistent feel
      const sensitivity = containerSize.width / 1024; // Scale sensitivity with viewport
      const change = (distance * sensitivity) / 100; // Divide by 100 for smoother scaling
      const nextScale = Math.max(0.1, Math.min(10, startScale + change));
      onScale(nextScale);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const handleRotateDrag = (evt: React.PointerEvent<HTMLDivElement>) => {
    evt.stopPropagation();
    const rect = (evt.currentTarget.parentElement?.parentElement as HTMLElement)?.getBoundingClientRect();
    const centerX = rect ? rect.left + cx : evt.clientX;
    const centerY = rect ? rect.top + cy : evt.clientY;
    const move = (e: PointerEvent) => {
      const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
      const snapped = Math.round(angle / 5) * 5; // 5-degree snapping
      onRotate(snapped);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  return (
    <div
      className={`absolute border border-cyan-400/60 ${className || ""}`}
      style={{
        left,
        top,
        width: wPx,
        height: hPx,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        pointerEvents: "none",
      }}
    >
      <div
        className="absolute bg-cyan-400 rounded-full"
        style={{
          width: handleSize,
          height: handleSize,
          right: -handleSize / 2,
          bottom: -handleSize / 2,
          cursor: "nwse-resize",
          pointerEvents: "auto",
        }}
        onPointerDown={handleScaleDrag}
      />
      <div
        className="absolute bg-pink-400 rounded-full"
        style={{
          width: handleSize,
          height: handleSize,
          left: "50%",
          top: -handleSize * 1.5,
          transform: "translateX(-50%)",
          cursor: "grab",
          pointerEvents: "auto",
        }}
        onPointerDown={handleRotateDrag}
      />
    </div>
  );
};
