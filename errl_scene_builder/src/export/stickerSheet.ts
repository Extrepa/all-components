import { ErrlScene } from "../scene/types";

export type StickerSheetLayout = {
  id: string;
  label: string;
  columns: number;
  rows: number;
  margin: number; // px
  cellWidth: number; // px
  cellHeight: number; // px
};

export const STICKER_LAYOUTS: StickerSheetLayout[] = [
  { id: "12_PER_SHEET", label: "12 per sheet", columns: 3, rows: 4, margin: 20, cellWidth: 320, cellHeight: 400 },
  { id: "8_PER_SHEET", label: "8 per sheet", columns: 2, rows: 4, margin: 20, cellWidth: 480, cellHeight: 400 },
];

/**
 * Generates a simple sticker sheet canvas by tiling PNG renders of scenes.
 * This is a placeholder utility; integrate with renderer.renderToImage for real renders.
 */
export const generateStickerSheet = async (
  scenes: ErrlScene[],
  layout: StickerSheetLayout,
  renderToImage: (scene: ErrlScene, opts: { width: number; height: number }) => Promise<string>
): Promise<string> => {
  const width = layout.columns * layout.cellWidth + (layout.columns + 1) * layout.margin;
  const height = layout.rows * layout.cellHeight + (layout.rows + 1) * layout.margin;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < Math.min(scenes.length, layout.columns * layout.rows); i++) {
    const scene = scenes[i];
    const imgUrl = await renderToImage(scene, { width: layout.cellWidth, height: layout.cellHeight });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imgUrl;
    });
    const col = i % layout.columns;
    const row = Math.floor(i / layout.columns);
    const x = layout.margin + col * (layout.cellWidth + layout.margin);
    const y = layout.margin + row * (layout.cellHeight + layout.margin);
    ctx.drawImage(img, x, y, layout.cellWidth, layout.cellHeight);
  }

  return canvas.toDataURL("image/png");
};
