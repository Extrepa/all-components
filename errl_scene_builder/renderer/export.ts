const cloneAndCleanSvg = (
  svg: SVGSVGElement,
  opts?: { backgroundColor?: string; noExportSelector?: string; removeBorder?: boolean }
): SVGSVGElement => {
  const { backgroundColor, noExportSelector = ".no-export", removeBorder = true } = opts || {};
  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Remove UI helpers
  if (noExportSelector) {
    clone.querySelectorAll(noExportSelector).forEach((el) => el.remove());
  }
  if (removeBorder) {
    clone.style.border = "none";
  }

  // Ensure xmlns so standalone SVG opens cleanly.
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  // Inject background if requested.
  if (backgroundColor) {
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", backgroundColor);
    clone.insertBefore(bg, clone.firstChild);
  }

  return clone;
};

export const exportSvgElementAsPng = async (
  svg: SVGSVGElement,
  opts: { width: number; height: number; transparentBg?: boolean; backgroundColor?: string }
): Promise<string> => {
  const { width, height, transparentBg, backgroundColor } = opts;
  const clone = cloneAndCleanSvg(svg, {
    backgroundColor: transparentBg ? undefined : backgroundColor || "#000000",
  });
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    if (!transparentBg && backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const exportSvgElementAsCleanSvg = (
  svg: SVGSVGElement,
  opts?: { backgroundColor?: string; noExportSelector?: string }
): string => {
  const cleaned = cloneAndCleanSvg(svg, opts);
  const serializer = new XMLSerializer();
  return serializer.serializeToString(cleaned);
};
