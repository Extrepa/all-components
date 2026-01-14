import React from "react";

export type FxState = {
  blur: number; // 0-10 px
  glow: number; // 0-1
  noise: number; // 0-1
  vignette: number; // 0-1
  hueRotate: number; // 0-360 deg
};

type Props = {
  fx: FxState;
  onChange: (key: keyof FxState, val: number) => void;
};

export const FxPanel: React.FC<Props> = ({ fx, onChange }) => {
  return (
    <div className="fx-panel-content">
      <div className="border-b border-white/10 pb-2 mb-2">
        <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          Global Atmosphere
        </h2>
        <p className="text-[11px] text-white/50">
          Applies to artwork only; selection/UI stay sharp.
        </p>
      </div>

      <Control
        label="Glow Intensity"
        value={`${(fx.glow * 100).toFixed(0)}%`}
        input={
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={fx.glow}
            onChange={(e) => onChange("glow", parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        }
      />

      <Control
        label="Film Grain"
        value={`${(fx.noise * 100).toFixed(0)}%`}
        input={
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.05}
            value={fx.noise}
            onChange={(e) => onChange("noise", parseFloat(e.target.value))}
            className="w-full accent-pink-400 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        }
      />

      <Control
        label="Psychedelic Shift"
        value={`${fx.hueRotate}°`}
        input={
          <input
            type="range"
            min={0}
            max={360}
            step={10}
            value={fx.hueRotate}
            onChange={(e) => onChange("hueRotate", parseFloat(e.target.value))}
            className="w-full accent-green-400 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        }
      />

      <Control
        label="Soft Focus (Blur)"
        value={`${fx.blur.toFixed(1)}px`}
        input={
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={fx.blur}
            onChange={(e) => onChange("blur", parseFloat(e.target.value))}
            className="w-full accent-zinc-400 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        }
      />

      <Control
        label="Vignette"
        value={`${(fx.vignette * 100).toFixed(0)}%`}
        input={
          <input
            type="range"
            min={0}
            max={0.8}
            step={0.05}
            value={fx.vignette}
            onChange={(e) => onChange("vignette", parseFloat(e.target.value))}
            className="w-full accent-orange-400 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        }
      />
    </div>
  );
};

const Control: React.FC<{ label: string; value: string; input: React.ReactNode }> = ({
  label,
  value,
  input,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs">
      <span>{label}</span>
      <span className="text-white/50">{value}</span>
    </div>
    {input}
  </div>
);
