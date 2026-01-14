import React from "react";
import { useSceneStore } from "../scene/store";

/**
 * FxWeatherPanel
 *
 * Lightweight controls for global FX and weather toggles.
 * Shows current instances and offers quick-add presets to feel interactive.
 */
export const FxWeatherPanel: React.FC = () => {
  const { fx, weather, addFx, updateFx, removeFx, addWeather, updateWeather, removeWeather } =
    useSceneStore((s) => ({
      fx: s.scene.fx.globalFx,
      weather: s.scene.weather,
      addFx: s.addFx,
      updateFx: s.updateFx,
      removeFx: s.removeFx,
      addWeather: s.addWeather,
      updateWeather: s.updateWeather,
      removeWeather: s.removeWeather,
    }));

  return (
    <div className="panel-content">
      <SectionHeader title="Global FX" actionLabel="Add Grain" onAction={() => addFx(makeFx("FX_GRAIN"))} />
      <div className="stack">
        {fx.length === 0 && <div className="muted">No FX yet. Add grain, vignette, or glow.</div>}
        {fx.map((f) => (
          <div key={f.id} className="fx-row">
            <div className="fx-main">
              <div className="fx-name">{f.fxId}</div>
              <div className="fx-meta">enabled: {f.enabled ? "yes" : "no"}</div>
            </div>
            <div className="fx-actions">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={f.enabled}
                  onChange={(e) => updateFx(f.id, { enabled: e.target.checked })}
                />
                <span>Toggle</span>
              </label>
              <button className="pill ghost" onClick={() => removeFx(f.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader
        title="Weather"
        actionLabel="Add Orbs"
        onAction={() => addWeather(makeWeather("WEATHER_ORB_DRIFT"))}
      />
      <div className="stack">
        {weather.length === 0 && <div className="muted">No weather running. Add drips, bubbles, or orbs.</div>}
        {weather.map((w) => (
          <div key={w.id} className="fx-row">
            <div className="fx-main">
              <div className="fx-name">{w.weatherId}</div>
              <div className="fx-meta">enabled: {w.enabled ? "yes" : "no"}</div>
            </div>
            <div className="fx-actions">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={w.enabled}
                  onChange={(e) => updateWeather(w.id, { enabled: e.target.checked })}
                />
                <span>Toggle</span>
              </label>
              <button className="pill ghost" onClick={() => removeWeather(w.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; actionLabel?: string; onAction?: () => void }> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <div className="section-header">
    <div className="section-title">{title}</div>
    {actionLabel && onAction && (
      <button className="pill" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

const makeFx = (fxId: string) => ({
  id: "fx_" + Math.random().toString(36).slice(2, 6),
  fxId,
  enabled: true,
  params: { strength: 0.3 },
});

const makeWeather = (weatherId: string) => ({
  id: "weather_" + Math.random().toString(36).slice(2, 6),
  weatherId,
  enabled: true,
  params: { intensity: 0.4 },
});
