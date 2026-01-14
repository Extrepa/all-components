import { useCallback } from "react";

export type DragItem = {
  assetId: string;
};

export type DropLocation = {
  x: number;
  y: number;
};

type Params = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onDropAsset: (item: DragItem, loc: DropLocation) => void;
};

/**
 * useSceneDragDrop
 *
 * Handles HTML5 drag/drop on an SVG viewport and converts screen coords -> SVG viewBox coords.
 * Uses native CTM math so zoom/pan and resizing are respected.
 */
export const useSceneDragDrop = ({ svgRef, onDropAsset }: Params) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;

      let item: DragItem;
      try {
        item = JSON.parse(raw);
      } catch {
        return;
      }

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());

      onDropAsset(item, { x: svgPt.x, y: svgPt.y });
    },
    [onDropAsset, svgRef]
  );

  return { handleDragOver, handleDrop };
};
