import React, { useMemo, useState } from "react";
import { useSceneStore } from "../scene/store";
import { createBlankScene, loadTemplate, templateSummaries } from "../templates/manifest";

type StepId = "BACKGROUND" | "ERRL" | "PROP" | "MOTION" | "DONE";

export const GuidedSetup: React.FC = () => {
  const [step, setStep] = useState<StepId>("BACKGROUND");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setScene = useSceneStore((s) => s.setScene);

  const nextStep = () => {
    const order: StepId[] = ["BACKGROUND", "ERRL", "PROP", "MOTION", "DONE"];
    const idx = order.indexOf(step);
    setStep(order[Math.min(idx + 1, order.length - 1)]);
  };

  const loadTemplateAndApply = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const summary = templateSummaries.find((t) => t.id === id);
      if (!summary) throw new Error("Template not found");
      const scene = await loadTemplate(summary);
      setScene(scene);
      nextStep();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load template";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = useMemo(() => {
    switch (step) {
      case "BACKGROUND":
        return "Pick a starting scene";
      case "ERRL":
        return "Pick your Errl";
      case "PROP":
        return "Add a prop";
      case "MOTION":
        return "Choose motion";
      case "DONE":
        return "Done! You can edit freely.";
      default:
        return "";
    }
  }, [step]);

  return (
    <div className="border-b border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold uppercase tracking-wide text-white/70">Guided Setup</div>
        <div className="text-xs text-white/50">{stepLabel}</div>
        {error && <div className="text-xs text-red-300">{error}</div>}
        <div className="flex-1" />
        {step !== "DONE" && (
          <button
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
            onClick={nextStep}
          >
            Skip Step
          </button>
        )}
      </div>
      {step === "BACKGROUND" && (
        <div className="mt-3 grid grid-cols-5 gap-3 text-sm">
          <button
            className="p-3 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-left"
            onClick={() => {
              setScene(createBlankScene());
              nextStep();
            }}
            disabled={loading}
          >
            <div className="font-semibold">Blank Scene</div>
            <div className="text-[11px] text-white/50">Start fresh</div>
          </button>
          {templateSummaries.map((tpl) => (
            <button
              key={tpl.id}
              className="p-3 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-left"
              onClick={() => loadTemplateAndApply(tpl.id)}
              disabled={loading}
            >
              <div className="font-semibold">{tpl.label}</div>
              <div className="text-[11px] text-white/50">{tpl.description}</div>
            </button>
          ))}
        </div>
      )}
      {step === "ERRL" && (
        <div className="mt-2 flex items-center gap-3 text-sm">
          <div>Click an Errl asset in the Asset panel to place it.</div>
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={nextStep}>
            Next
          </button>
        </div>
      )}
      {step === "PROP" && (
        <div className="mt-2 flex items-center gap-3 text-sm">
          <div>Add a prop (TV/Projector/etc.) from the Asset panel.</div>
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={nextStep}>
            Next
          </button>
        </div>
      )}
      {step === "MOTION" && (
        <div className="mt-2 flex items-center gap-3 text-sm">
          <div>Select your Errl and add a motion (Float) in the Inspector.</div>
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={nextStep}>
            Finish
          </button>
        </div>
      )}
      {step === "DONE" && (
        <div className="mt-2 text-sm text-white/70">You’re ready. Use the editor normally.</div>
      )}
    </div>
  );
};
