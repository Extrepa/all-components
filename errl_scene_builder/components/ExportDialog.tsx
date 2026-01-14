import React, { useState } from "react";
import { exportSvgElementAsPng, exportSvgElementAsCleanSvg } from "../renderer/export";

type Preset = {
  id: string;
  label: string;
  width: number;
  height: number;
  transparentBg?: boolean;
};

const PRESETS: Preset[] = [
  { id: "SCREEN", label: "Screen 1920x1080", width: 1920, height: 1080 },
  { id: "STICKER", label: "Sticker 4x6 @300dpi (1200x1800)", width: 1200, height: 1800, transparentBg: true },
  { id: "CARD", label: "Card 2.5x3.5 @300dpi (750x1050)", width: 750, height: 1050, transparentBg: true },
];

type Props = {
  svgRef: React.RefObject<SVGSVGElement>;
};

export const ExportDialog: React.FC<Props> = ({ svgRef }) => {
  const [presetId, setPresetId] = useState<string>("SCREEN");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (!svgRef.current) {
      setError("Renderer not ready");
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const dataUrl = await exportSvgElementAsPng(svgRef.current, {
        ...preset,
        backgroundColor: "#0b0d1a",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `errl_scene_${preset.id.toLowerCase()}.png`;
      a.click();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Export failed";
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) {
      setError("Renderer not ready");
      return;
    }
    const svgString = exportSvgElementAsCleanSvg(svgRef.current, {
      backgroundColor: "#0b0d1a",
      noExportSelector: ".no-export",
    });
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "errl_scene.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-3 right-3 z-10 bg-black/70 border border-white/10 rounded-lg p-3 text-sm text-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold">Export</div>
        {error && <div className="text-xs text-red-300">{error}</div>}
      </div>
      <select
        className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 mb-2"
        value={presetId}
        onChange={(e) => setPresetId(e.target.value)}
      >
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <button
        className="w-full px-3 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
        onClick={handleExport}
        disabled={downloading}
      >
        {downloading ? "Exporting..." : "Export PNG"}
      </button>
      <button
        className="w-full mt-2 px-3 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
        onClick={handleExportSvg}
      >
        Export SVG
      </button>
    </div>
  );
};
