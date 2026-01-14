import React from "react";
import { useSceneStore } from "../scene/store";
import { SceneEntity, BlendMode } from "../scene/types";
import { VariantSwitcher } from "./VariantSwitcher";
import { getVariantGroupForAsset } from "../assets/errlVariants";
import { FxState } from "./FxPanel";
import { Copy, RotateCw } from "lucide-react";

/**
 * InspectorPanel
 *
 * Context-sensitive editor for the selected entity.
 * - Reads selection from the scene store (first selected entity).
 * - Maps form controls to SceneEntity patches via store.updateEntity.
 * - Covers transform (position/scale/rotation), style (opacity), and basic motion toggles.
 * - Includes FX controls and missing properties features.
 *
 * Extend here to expose more style/motion parameters as needed.
 */
interface InspectorPanelProps {
  fx?: FxState;
  onFxChange?: (key: keyof FxState, value: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ fx, onFxChange }) => {
  const scene = useSceneStore((s) => s.scene);
  const { selectedEntityIds, entities, updateEntity, addEntity } = useSceneStore((s) => ({
    selectedEntityIds: s.selectedEntityIds,
    entities: s.scene.entities,
    updateEntity: s.updateEntity,
    addEntity: s.addEntity,
  }));

  const entity: SceneEntity | undefined = entities.find((e) => e.id === selectedEntityIds[0]);

  if (!entity) {
    return (
      <div className="p-3 text-white/60 text-sm">Select an entity to edit.</div>
    );
  }

  const updateTransform = (patch: Partial<SceneEntity["transform"]>) =>
    updateEntity(entity.id, { transform: { ...entity.transform, ...patch } });
  const updateStyle = (patch: Partial<SceneEntity["style"]>) =>
    updateEntity(entity.id, { style: { ...entity.style, ...patch } });

  const updateMotionParam = (motionId: string, key: string, value: number) => {
    updateEntity(entity.id, {
      motion: entity.motion.map((mi) =>
        mi.id === motionId ? { ...mi, params: { ...mi.params, [key]: value } } : mi
      ),
    });
  };

  const removeMotion = (motionId: string) => {
    updateEntity(entity.id, { motion: entity.motion.filter((m) => m.id !== motionId) });
  };

  const addMotion = (motionId: string) => {
    const id = "motion_" + Math.random().toString(36).slice(2, 6);
    updateEntity(entity.id, {
      motion: [
        ...entity.motion,
        { id, motionId, enabled: true, params: { speed: 0.4, intensity: 0.5 } },
      ],
    });
  };

  const isVariantEntity = getVariantGroupForAsset(entity.assetId) !== undefined;

  const handleDuplicate = () => {
    const duplicated: SceneEntity = {
      ...entity,
      id: "entity_" + Math.random().toString(36).slice(2, 8),
      transform: {
        ...entity.transform,
        x: entity.transform.x + 20,
        y: entity.transform.y + 20,
      },
    };
    addEntity(duplicated);
  };

  return (
    <div className="panel-content" style={{ padding: "8px", fontSize: "11px" }}>
      {/* Variant Switcher - appears at top if entity is from a variant group */}
      {isVariantEntity && (
        <div className="panel-box" style={{ marginBottom: "8px", padding: "8px" }}>
          <VariantSwitcher entityId={entity.id} />
        </div>
      )}
      
      {/* Layer Name */}
      <div className="panel-box" style={{ marginBottom: "8px", padding: "8px" }}>
        <label className="field" style={{ marginBottom: "4px" }}>
          <span className="muted" style={{ fontSize: "10px" }}>Layer Name</span>
          <input
            type="text"
            className="input tiny"
            value={entity.id}
            onChange={(e) => updateEntity(entity.id, { id: e.target.value })}
            style={{ fontSize: "10px", padding: "4px" }}
          />
        </label>
        <button
          className="button"
          onClick={handleDuplicate}
          style={{ width: "100%", marginTop: "4px", fontSize: "10px", padding: "4px" }}
        >
          <Copy className="w-3 h-3 inline mr-1" />
          Duplicate Element
        </button>
      </div>

      <div className="panel-box" style={{ padding: "8px" }}>
        {/* Transform - Compact Grid */}
        <div className="grid grid-cols-2 gap-1 mb-1.5" style={{ fontSize: "10px" }}>
          <label className="field">
            <span className="muted">X</span>
            <input
              type="number"
              className="input tiny"
              value={entity.transform.x}
              onChange={(e) => updateTransform({ x: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span className="muted">Y</span>
            <input
              type="number"
              className="input tiny"
              value={entity.transform.y}
              onChange={(e) => updateTransform({ y: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span className="muted">Scale X</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              className="input tiny"
              value={entity.transform.scaleX}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0.1 && val <= 10) {
                  updateTransform({ scaleX: val });
                }
              }}
            />
          </label>
          <label className="field">
            <span className="muted">Scale Y</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              className="input tiny"
              value={entity.transform.scaleY}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0.1 && val <= 10) {
                  updateTransform({ scaleY: val });
                }
              }}
            />
          </label>
          <label className="field">
            <span className="muted">Rotation</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              className="input tiny"
              value={entity.transform.rotation}
              onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
            />
            <span className="muted text-[10px]">{Math.round(entity.transform.rotation)}°</span>
          </label>
          <label className="field">
            <span className="muted">Layer</span>
            <select
              className="input tiny"
              value={entity.layerId}
              onChange={(e) => updateEntity(entity.id, { layerId: e.target.value })}
            >
              {scene.layers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* APPEARANCE */}
        <div className="space-y-1 mb-1.5 pt-1.5 border-t border-white/5">
          <div className="muted text-[10px] font-semibold mb-1">APPEARANCE</div>
          <label className="row" style={{ fontSize: "10px" }}>
            <span className="muted">Fill</span>
            <input
              type="color"
              value={entity.style.fillHex || "#ffffff"}
              onChange={(e) => updateStyle({ fillHex: e.target.value })}
              style={{ width: "24px", height: "20px" }}
            />
          </label>
          <label className="row" style={{ fontSize: "10px" }}>
            <span className="muted">Stroke</span>
            <input
              type="color"
              value={entity.style.strokeHex || "#000000"}
              onChange={(e) => updateStyle({ strokeHex: e.target.value })}
              style={{ width: "24px", height: "20px" }}
            />
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={entity.style.strokeWidth || 0}
              onChange={(e) => updateStyle({ strokeWidth: Number(e.target.value) })}
              style={{ width: "60px" }}
            />
            <span className="muted text-[9px]">{((entity.style.strokeWidth || 0).toFixed(1))}px</span>
          </label>
          <label className="row" style={{ fontSize: "10px" }}>
            <span className="muted">Opacity</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={entity.style.opacity}
              onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
            />
            <span className="muted text-[9px]">{entity.style.opacity.toFixed(2)}</span>
          </label>
          <label className="row" style={{ fontSize: "10px" }}>
            <span className="muted">Tint</span>
            <input
              type="color"
              value={entity.style.tintHex || "#ffd54a"}
              onChange={(e) => updateStyle({ tintHex: e.target.value })}
              style={{ width: "24px", height: "20px" }}
            />
          </label>
          <label className="field" style={{ fontSize: "10px" }}>
            <span className="muted">Blend Mode</span>
            <select
              className="input tiny"
              value={entity.style.blendMode || "normal"}
              onChange={(e) => updateStyle({ blendMode: e.target.value as BlendMode })}
              style={{ fontSize: "9px", padding: "2px" }}
            >
              <option value="normal">Normal</option>
              <option value="add">Add</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
            </select>
          </label>
        </div>

        {/* Pivot Point */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 pt-2 border-t border-white/5">
          <label className="field">
            <span className="muted">Pivot X</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="input tiny"
              value={entity.transform.pivotX ?? 0.5}
              onChange={(e) => updateTransform({ pivotX: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span className="muted">Pivot Y</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="input tiny"
              value={entity.transform.pivotY ?? 0.5}
              onChange={(e) => updateTransform({ pivotY: Number(e.target.value) })}
            />
          </label>
        </div>

        {/* ANIMATION */}
        <div className="pt-1.5 border-t border-white/5 space-y-1" style={{ fontSize: "10px" }}>
          <div className="muted text-[10px] font-semibold mb-1">ANIMATION</div>
          {entity.motion.length === 0 && <div className="muted mb-1 text-[9px]">No animations applied.</div>}
          {entity.motion.map((m) => (
            <div key={m.id} className="panel-box inset mb-2">
              <div className="row mb-1">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={m.enabled}
                    onChange={(e) =>
                      useSceneStore.getState().updateEntity(entity.id, {
                        motion: entity.motion.map((mi) =>
                          mi.id === m.id ? { ...mi, enabled: e.target.checked } : mi
                        ),
                      })
                    }
                  />
                  <span>{m.motionId}</span>
                </label>
                <button className="pill ghost" onClick={() => removeMotion(m.id)}>
                  Remove
                </button>
              </div>
              <label className="row">
                <span className="muted">Speed</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={Number(m.params.speed || 0)}
                  onChange={(e) => updateMotionParam(m.id, "speed", Number(e.target.value))}
                />
                <span className="muted">{Number(m.params.speed || 0).toFixed(2)}</span>
              </label>
              <label className="row">
                <span className="muted">Intensity</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={Number(m.params.intensity || 0)}
                  onChange={(e) => updateMotionParam(m.id, "intensity", Number(e.target.value))}
                />
                <span className="muted">{Number(m.params.intensity || 0).toFixed(2)}</span>
              </label>
              {m.motionId === "MOTION_ORBIT" && (
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <label className="field">
                    <span className="muted">radiusX</span>
                    <input
                      type="number"
                      className="input tiny"
                      value={Number(m.params.radiusX || 40)}
                      onChange={(e) => updateMotionParam(m.id, "radiusX", Number(e.target.value))}
                    />
                  </label>
                  <label className="field">
                    <span className="muted">radiusY</span>
                    <input
                      type="number"
                      className="input tiny"
                      value={Number(m.params.radiusY || 24)}
                      onChange={(e) => updateMotionParam(m.id, "radiusY", Number(e.target.value))}
                    />
                  </label>
                  <label className="field">
                    <span className="muted">phase</span>
                    <input
                      type="number"
                      className="input tiny"
                      value={Number(m.params.phaseOffset || 0)}
                      onChange={(e) => updateMotionParam(m.id, "phaseOffset", Number(e.target.value))}
                    />
                  </label>
                </div>
              )}
              {m.motionId === "MOTION_DRIP" && (
                <label className="field mt-1">
                  <span className="muted">Gravity</span>
                  <input
                    type="number"
                    className="input tiny"
                    value={Number(m.params.gravity || 0.5)}
                    onChange={(e) => updateMotionParam(m.id, "gravity", Number(e.target.value))}
                  />
                </label>
              )}
            </div>
          ))}
          <div className="row mt-2">
            <select
              className="input tiny"
              onChange={(e) => {
                if (e.target.value) {
                  addMotion(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="">Add motion...</option>
              <option value="MOTION_FLOAT">MOTION_FLOAT</option>
              <option value="MOTION_WIGGLE">MOTION_WIGGLE</option>
              <option value="MOTION_PULSE">MOTION_PULSE</option>
              <option value="MOTION_ORBIT">MOTION_ORBIT</option>
              <option value="MOTION_DRIP">MOTION_DRIP</option>
            </select>
          </div>
        </div>

        {/* FX Controls - Global Scene Effects */}
        {fx && onFxChange && (
          <div className="pt-1.5 border-t border-white/5 space-y-1" style={{ fontSize: "10px", marginTop: "8px" }}>
            <div className="muted text-[10px] font-semibold mb-1">GLOBAL FX</div>
            <label className="row" style={{ fontSize: "10px" }}>
              <span className="muted">Glow</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={fx.glow}
                onChange={(e) => onFxChange("glow", parseFloat(e.target.value))}
              />
              <span className="muted text-[9px]">{(fx.glow * 100).toFixed(0)}%</span>
            </label>
            <label className="row" style={{ fontSize: "10px" }}>
              <span className="muted">Grain</span>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={fx.noise}
                onChange={(e) => onFxChange("noise", parseFloat(e.target.value))}
              />
              <span className="muted text-[9px]">{(fx.noise * 100).toFixed(0)}%</span>
            </label>
            <label className="row" style={{ fontSize: "10px" }}>
              <span className="muted">Hue</span>
              <input
                type="range"
                min={0}
                max={360}
                step={10}
                value={fx.hueRotate}
                onChange={(e) => onFxChange("hueRotate", parseFloat(e.target.value))}
              />
              <span className="muted text-[9px]">{fx.hueRotate}°</span>
            </label>
            <label className="row" style={{ fontSize: "10px" }}>
              <span className="muted">Blur</span>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={fx.blur}
                onChange={(e) => onFxChange("blur", parseFloat(e.target.value))}
              />
              <span className="muted text-[9px]">{fx.blur.toFixed(1)}px</span>
            </label>
            <label className="row" style={{ fontSize: "10px" }}>
              <span className="muted">Vignette</span>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={fx.vignette}
                onChange={(e) => onFxChange("vignette", parseFloat(e.target.value))}
              />
              <span className="muted text-[9px]">{(fx.vignette * 100).toFixed(0)}%</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

