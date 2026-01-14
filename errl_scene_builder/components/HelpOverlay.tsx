import React from "react";

type Props = {
  onClose: () => void;
};

export const HelpOverlay: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-0 pointer-events-none p-4 flex">
        <div className="w-64 h-full flex flex-col justify-center items-start pr-4 relative">
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl border border-indigo-500 shadow-2xl shadow-indigo-500/20 max-w-xs absolute left-10 top-1/3">
            <div className="text-indigo-400 font-bold uppercase text-xs mb-1">Step 1: Create</div>
            <p className="text-sm">
              Drag <strong className="text-white">Assets</strong> from the library onto the canvas.
            </p>
            <p className="text-sm mt-2 text-zinc-400">
              Use the <strong className="text-white">Layers</strong> panel above to reorder them.
            </p>
            <div className="absolute -left-2 top-4 w-4 h-4 bg-zinc-900 border-l border-b border-indigo-500 transform rotate-45" />
          </div>
        </div>

        <div className="flex-1 h-full flex items-center justify-center relative">
          <div className="bg-zinc-900 text-zinc-100 p-6 rounded-xl border border-indigo-500 shadow-2xl shadow-indigo-500/20 text-center pointer-events-auto">
            <div className="text-2xl mb-2">👋</div>
            <h2 className="text-lg font-bold text-white mb-2">Welcome to Errl Builder</h2>
            <p className="text-sm text-zinc-400 mb-4 max-w-xs mx-auto">
              Drag, drop, and melt your own weird little worlds.
            </p>

            <div className="grid grid-cols-2 gap-2 text-left text-xs text-zinc-500 bg-zinc-950 p-3 rounded mb-4">
              <div>
                <strong className="text-zinc-300">Click</strong> to Select
              </div>
              <div>
                <strong className="text-zinc-300">Drag</strong> to Move
              </div>
              <div>
                <strong className="text-zinc-300">Delete</strong> to Remove
              </div>
              <div>
                <strong className="text-zinc-300">Ctrl+Z</strong> to Undo
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold transition-transform active:scale-95"
            >
              Got it, let&apos;s build!
            </button>
          </div>
        </div>

        <div className="w-72 h-full flex flex-col justify-center items-end pl-4 relative">
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl border border-indigo-500 shadow-2xl shadow-indigo-500/20 max-w-xs absolute right-10 top-1/4">
            <div className="text-indigo-400 font-bold uppercase text-xs mb-1">Step 2: Customize</div>
            <p className="text-sm">
              Select an object to change its <strong className="text-white">Color</strong>, Scale, or Rotation.
            </p>
            <div className="absolute -right-2 top-4 w-4 h-4 bg-zinc-900 border-t border-r border-indigo-500 transform rotate-45" />
          </div>

          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl border border-pink-500 shadow-2xl shadow-pink-500/20 max-w-xs absolute right-10 bottom-1/4">
            <div className="text-pink-400 font-bold uppercase text-xs mb-1">Step 3: Vibe Check</div>
            <p className="text-sm">
              Switch to the <strong className="text-white">Scene FX</strong> tab to add Glow, Noise, and Filters.
            </p>
            <div className="absolute -right-2 top-4 w-4 h-4 bg-zinc-900 border-t border-r border-pink-500 transform rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};
