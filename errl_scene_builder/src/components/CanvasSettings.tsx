import React from "react";
import { useSceneStore } from "../scene/store";

interface CanvasSettingsProps {
  snapToGrid?: boolean;
  gridSize?: number;
  onToggleSnap?: () => void;
  onGridSizeChange?: (size: number) => void;
}

type ThemePreset = {
  id: string;
  name: string;
  preview: string;
  background: string;
  bgAlt: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentAlt: string;
  accentSoft: string;
};

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "errl-night",
    name: "Errl Night",
    preview: "linear-gradient(90deg,#34e1ff,#ff34f5)",
    background: "#02070a",
    bgAlt: "#041017",
    surface: "#071b25",
    border: "#163a4a",
    text: "#ecf9ff",
    muted: "#8eb7c7",
    accent: "#34e1ff",
    accentAlt: "#ff34f5",
    accentSoft: "#0d3344",
  },
  {
    id: "errl-dawn",
    name: "Errl Dawn",
    preview: "linear-gradient(90deg,#ff9a8b,#fad0c4)",
    background: "#140c1f",
    bgAlt: "#1e1230",
    surface: "#2a1a3f",
    border: "#543c6b",
    text: "#fefaf5",
    muted: "#c8b1d7",
    accent: "#ff9a8b",
    accentAlt: "#fad0c4",
    accentSoft: "#37204a",
  },
  {
    id: "errl-void",
    name: "Errl Void",
    preview: "linear-gradient(90deg,#00f5a0,#00d9f5)",
    background: "#01030a",
    bgAlt: "#050b16",
    surface: "#071128",
    border: "#0f2745",
    text: "#e5fbff",
    muted: "#7aa8bf",
    accent: "#00f5a0",
    accentAlt: "#00d9f5",
    accentSoft: "#07282d",
  },
];

export const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  snapToGrid = false,
  gridSize = 20,
  onToggleSnap,
  onGridSizeChange,
}) => {
  const scene = useSceneStore((s) => s.scene);
  const updateSceneMeta = useSceneStore((s) => s.updateSceneMeta);

  const handleWidthChange = (value: number) => {
    updateSceneMeta({
      viewport: {
        ...scene.viewport,
        width: Math.max(100, value),
      },
    });
  };

  const handleHeightChange = (value: number) => {
    updateSceneMeta({
      viewport: {
        ...scene.viewport,
        height: Math.max(100, value),
      },
    });
  };

  const handleBackgroundChange = (color: string) => {
    updateSceneMeta({
      background: {
        ...scene.background,
        params: {
          ...scene.background.params,
          backgroundColor: color,
        },
      },
    });
  };
  const handleThemePreset = (preset: ThemePreset) => {
    updateSceneMeta({
      background: {
        ...scene.background,
        params: {
          ...scene.background.params,
          themePreset: preset.id,
          backgroundColor: preset.background,
        },
      },
    });
    document.documentElement.style.setProperty("--bg", preset.background);
    document.documentElement.style.setProperty("--bg-alt", preset.bgAlt);
    document.documentElement.style.setProperty("--surface", preset.surface);
    document.documentElement.style.setProperty("--border", preset.border);
    document.documentElement.style.setProperty("--text", preset.text);
    document.documentElement.style.setProperty("--muted", preset.muted);
    document.documentElement.style.setProperty("--accent", preset.accent);
    document.documentElement.style.setProperty("--accent-2", preset.accentAlt);
    document.documentElement.style.setProperty("--accent-soft", preset.accentSoft);
  };
  const themePresetId = scene.background.params?.themePreset as string | undefined;
  const handleThemeReset = () => {
    updateSceneMeta({
      background: {
        ...scene.background,
        params: {
          ...scene.background.params,
          themePreset: undefined,
        },
      },
    });
  };

  const handleTransparentBgChange = (transparent: boolean) => {
    updateSceneMeta({
      background: {
        ...scene.background,
        params: {
          ...scene.background.params,
          transparentBg: transparent,
        },
      },
    });
  };

  const backgroundColor =
    (scene.background.params?.backgroundColor as string) || "#09090b";
  const transparentBg = (scene.background.params?.transparentBg as boolean) || false;

  return (
    <div className="canvas-settings-content">
      <div className="canvas-settings-box">
        {/* Canvas Size */}
        <div className="canvas-settings-section">
          <div className="canvas-settings-label">Canvas Size</div>
          <div className="canvas-settings-grid">
            <div>
              <label className="canvas-settings-field-label">W</label>
              <input
                type="number"
                value={scene.viewport.width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="canvas-settings-input-number"
                min="100"
              />
            </div>
            <div>
              <label className="canvas-settings-field-label">H</label>
              <input
                type="number"
                value={scene.viewport.height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="canvas-settings-input-number"
                min="100"
              />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="canvas-settings-section">
          <div className="canvas-settings-label">Background</div>
          <div className="canvas-settings-controls">
            <label className="canvas-settings-checkbox">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => handleTransparentBgChange(e.target.checked)}
                className="canvas-settings-checkbox-input"
              />
              <span>Transparent</span>
            </label>
            {!transparentBg && (
              <div className="canvas-settings-color-wrapper">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundChange(e.target.value)}
                  className="canvas-settings-color-input"
                />
              </div>
            )}
          </div>
          <div className="canvas-settings-theme">
            <div className="canvas-settings-field-label">Themes</div>
            <div className="theme-preset-grid">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`theme-preset-chip ${themePresetId === preset.id ? "active" : ""}`}
                  onClick={() => handleThemePreset(preset)}
                  type="button"
                  title={preset.name}
                >
                  <span style={{ background: preset.preview }} />
                  {preset.name}
                </button>
              ))}
              <button className="theme-preset-chip reset" onClick={handleThemeReset} type="button">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Grid Settings */}
        {(onToggleSnap || onGridSizeChange) && (
          <div className="canvas-settings-section">
            <div className="canvas-settings-label">Grid</div>
            <div className="canvas-settings-controls">
              {onToggleSnap && (
              <label className="canvas-settings-checkbox">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={onToggleSnap}
                  className="canvas-settings-checkbox-input"
                />
                <span>Snap</span>
              </label>
              )}

              {onGridSizeChange && (
                <div className="canvas-settings-grid-size">
                <label className="canvas-settings-field-label">Size</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  value={gridSize}
                  onChange={(e) => onGridSizeChange(Number(e.target.value))}
                  className="canvas-settings-input-number"
                  disabled={!snapToGrid}
                />
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={gridSize}
                  onChange={(e) => onGridSizeChange(Number(e.target.value))}
                  className="canvas-settings-range"
                  disabled={!snapToGrid}
                />
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
