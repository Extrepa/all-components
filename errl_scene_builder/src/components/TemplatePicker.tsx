import React from "react";
import { templateSummaries } from "../templates/manifest";

type Props = {
  onSelect: (id: string) => void;
  onCancel: () => void;
};

export const TemplatePicker: React.FC<Props> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-indigo-300 tracking-wider">Guided Setup</h2>
            <p className="text-sm text-white/60">Pick a starting scene to remix or start blank.</p>
          </div>
          <button onClick={onCancel} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/60">
          <button
            onClick={() => onSelect("__blank")}
            className="group flex flex-col items-start p-4 rounded-lg border border-white/10 bg-zinc-900 hover:border-indigo-500 hover:bg-zinc-800 transition-all text-left"
          >
            <div className="w-10 h-10 rounded bg-zinc-800 border border-white/10 mb-3 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="font-bold text-white group-hover:text-indigo-300">Blank Scene</h3>
            <p className="text-xs text-white/60 mt-1">Start fresh with an empty canvas.</p>
          </button>

          {templateSummaries.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className="group flex flex-col items-start p-4 rounded-lg border border-white/10 bg-zinc-900 hover:border-indigo-500 hover:bg-zinc-800 transition-all text-left relative"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-indigo-400 transition-colors" />
              <h3 className="font-bold text-white group-hover:text-indigo-300">{tpl.label}</h3>
              <p className="text-xs text-white/60 mt-1">{tpl.description}</p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 bg-zinc-900 flex justify-end">
          <button onClick={onCancel} className="text-xs text-white/60 hover:text-white underline">
            Skip setup
          </button>
        </div>
      </div>
    </div>
  );
};
