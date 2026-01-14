/**
 * Canvas rendering hook
 * Handles all canvas drawing logic for the Figma Clone Engine
 */

import { useCallback, useRef } from 'react';
import { DesignState, SceneNode, FrameNode, TextNode, RectangleNode, VectorNode, ImageNode, InstanceNode, CommentNode, Point } from '../types';
import { getAbsolutePosition, wrapText } from '../utils/canvasHelpers';
import { isFrameNode, isTextNode, isVectorNode, isImageNode, isInstanceNode, isCommentNode, isRectangleNode, hasWidth, hasHeight, hasDimensions, hasFill } from '../utils/typeGuards';
import { hexToColor } from '../utils/helpers';

interface UseCanvasProps {
  state: DesignState;
  hoveredId: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for canvas rendering logic
 * Extracted from App.tsx to improve code organization
 */
export function useCanvas({ state, hoveredId, canvasRef, containerRef }: UseCanvasProps) {
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = containerRef.current;
    if (canvas.width !== clientWidth * dpr) {
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, clientWidth, clientHeight);

    if (state.viewport.zoom > 0.4) {
      ctx.strokeStyle = state.mode === 'DEV' ? '#222' : '#2c2c2c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gs = 20 * state.viewport.zoom;
      const offX = state.viewport.x % gs;
      const offY = state.viewport.y % gs;
      for (let x = offX; x < clientWidth; x += gs) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, clientHeight);
      }
      for (let y = offY; y < clientHeight; y += gs) {
        ctx.moveTo(0, y);
        ctx.lineTo(clientWidth, y);
      }
      ctx.stroke();
    }

    ctx.translate(state.viewport.x, state.viewport.y);
    ctx.scale(state.viewport.zoom, state.viewport.zoom);

    const fillRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    const drawNode = (id: string, absX: number, absY: number, overrides: Record<string, any> = {}) => {
      const node = state.nodes[id];
      if (!node || !node.visible) return;

      const props = { ...node, ...overrides };
      const x = absX + props.x;
      const y = absY + props.y;

      if (isImageNode(props)) {
        const img = new Image();
        img.src = props.src;
        ctx.fillStyle = '#333';
        if (hasDimensions(props)) {
          ctx.fillRect(x, y, props.width, props.height);
          if (img.complete) {
            ctx.drawImage(img, x, y, props.width, props.height);
          }
        }
      } else if (isFrameNode(props) || isRectangleNode(props)) {
        // Apply opacity
        const opacity = props.opacity !== undefined ? props.opacity : 1;
        ctx.save();
        ctx.globalAlpha = opacity;

        // Fill - Gradient or Solid
        const gradient = props.backgroundGradient;
        if (gradient) {
          // Parse gradient string (simple linear gradient support)
          // Format: linear-gradient(90deg, #3b82f6, #8b5cf6)
          const match = gradient.match(/linear-gradient\((\d+)deg,\s*#([a-f\d]{6}),\s*#([a-f\d]{6})\)/i);
          if (match) {
            const angle = parseInt(match[1]);
            const color1 = hexToColor('#' + match[2]);
            const color2 = hexToColor('#' + match[3]);
            const width = props.width;
            const height = props.height;

            // Calculate gradient line based on angle
            const rad = (angle * Math.PI) / 180;
            const cx = x + width / 2;
            const cy = y + height / 2;
            const length = Math.sqrt(width * width + height * height);
            const x1 = cx - Math.cos(rad) * length / 2;
            const y1 = cy - Math.sin(rad) * length / 2;
            const x2 = cx + Math.cos(rad) * length / 2;
            const y2 = cy + Math.sin(rad) * length / 2;

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${color1.a})`);
            grad.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${color2.a})`);
            ctx.fillStyle = grad;
          } else {
            // Fallback to solid fill
            const fill = props.fill;
            if (fill) {
              ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${fill.a})`;
            }
          }
        } else {
          const fill = props.fill;
          if (fill) {
            ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${fill.a})`;
          }
        }
        // Box shadow (apply before fill)
        const boxShadow = props.boxShadow;
        if (boxShadow) {
          // Parse box shadow: "offsetX offsetY blur color" or "offsetX offsetY blur spread color"
          const shadowMatch = boxShadow.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)/);
          if (shadowMatch) {
            const offsetX = parseFloat(shadowMatch[1]);
            const offsetY = parseFloat(shadowMatch[2]);
            const blur = parseFloat(shadowMatch[3]);
            const color = shadowMatch[5] || 'rgba(0,0,0,0.1)';

            ctx.shadowOffsetX = offsetX;
            ctx.shadowOffsetY = offsetY;
            ctx.shadowBlur = blur;
            ctx.shadowColor = color;
          }
        }

        const r = props.cornerRadius || 0;
        if (r > 0) fillRoundRect(x, y, props.width, props.height, r);
        else ctx.fillRect(x, y, props.width, props.height);

        // Clear shadow after fill
        if (boxShadow) {
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        // Border
        const borderWidth = props.borderWidth;
        const borderColor = props.borderColor;
        const borderStyle = props.borderStyle;
        if (borderWidth && borderColor && borderStyle && borderStyle !== 'none') {
          ctx.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;
          const bw = typeof borderWidth === 'number' ? borderWidth : borderWidth.top;
          ctx.lineWidth = bw;

          if (borderStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
          } else if (borderStyle === 'dotted') {
            ctx.setLineDash([2, 2]);
          } else {
            ctx.setLineDash([]);
          }

          if (r > 0) {
            ctx.beginPath();
            ctx.roundRect(x, y, props.width, props.height, r);
            ctx.stroke();
          } else {
            ctx.strokeRect(x, y, props.width, props.height);
          }
          ctx.setLineDash([]);
        }

        ctx.restore();

        if (props.type !== 'RECTANGLE' && isFrameNode(props)) {
          props.children.forEach(childId => drawNode(childId, x, y));
        }
      } else if (isTextNode(props)) {
        const textNode = props;
        const opacity = textNode.opacity !== undefined ? textNode.opacity : 1;
        ctx.save();
        ctx.globalAlpha = opacity;

        ctx.fillStyle = `rgba(${textNode.fill.r}, ${textNode.fill.g}, ${textNode.fill.b}, ${textNode.fill.a})`;

        // Typography properties
        const fontFamily = textNode.fontFamily || 'Inter, sans-serif';
        const fontWeight = textNode.fontWeight || 'normal';
        const fontSize = textNode.fontSize;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.textAlign = (textNode.textAlign || 'left') as CanvasTextAlign;

        // Letter spacing (approximate with manual spacing)
        if (textNode.letterSpacing) {
          const content = textNode.content;
          let currentX = x;
          for (let i = 0; i < content.length; i++) {
            ctx.fillText(content[i], currentX, y);
            const metrics = ctx.measureText(content[i]);
            currentX += metrics.width + (textNode.letterSpacing || 0);
          }
        } else {
          ctx.fillText(textNode.content, x, y);
        }

        // Text decoration
        if (textNode.textDecoration === 'underline') {
          const metrics = ctx.measureText(textNode.content);
          ctx.beginPath();
          ctx.moveTo(x, y + fontSize + 2);
          ctx.lineTo(x + metrics.width, y + fontSize + 2);
          ctx.stroke();
        } else if (textNode.textDecoration === 'line-through') {
          const metrics = ctx.measureText(textNode.content);
          ctx.beginPath();
          ctx.moveTo(x, y + fontSize / 2);
          ctx.lineTo(x + metrics.width, y + fontSize / 2);
          ctx.stroke();
        }

        ctx.restore();
      } else if (isInstanceNode(props)) {
        const master = state.nodes[props.masterComponentId];
        if (master && hasFill(master)) {
          const fill = master.fill;
          if (fill) {
            ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${fill.a})`;
            if (hasDimensions(props)) {
              ctx.fillRect(x, y, props.width, props.height);
            }
          }
          if (isFrameNode(master)) {
            master.children.forEach(c => drawNode(c, x, y));
          }
        }
      } else if (isCommentNode(props)) {
        const commentNode = props;
        ctx.save();

        // Comment bubble background (yellow/light color)
        ctx.fillStyle = commentNode.resolved
          ? 'rgba(200, 200, 200, 0.9)'
          : 'rgba(255, 242, 204, 0.95)';
        ctx.strokeStyle = commentNode.resolved
          ? 'rgba(150, 150, 150, 0.8)'
          : 'rgba(255, 200, 50, 0.8)';
        ctx.lineWidth = 1 / state.viewport.zoom;

        // Draw rounded rectangle for comment
        const r = 8 / state.viewport.zoom;
        fillRoundRect(x, y, commentNode.width, commentNode.height, r);
        ctx.beginPath();
        ctx.roundRect(x, y, commentNode.width, commentNode.height, r);
        ctx.stroke();

        // Draw comment text
        ctx.fillStyle = commentNode.resolved
          ? 'rgba(100, 100, 100, 0.8)'
          : 'rgba(50, 50, 50, 0.9)';
        ctx.font = `${12 / state.viewport.zoom}px Inter, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Wrap text if needed
        const padding = 8 / state.viewport.zoom;
        const maxWidth = commentNode.width - (padding * 2);
        const lines = wrapText(ctx, commentNode.text, maxWidth);
        const lineHeight = 16 / state.viewport.zoom;
        lines.forEach((line, i) => {
          ctx.fillText(line, x + padding, y + padding + (i * lineHeight));
        });

        // Draw pin/pointer at top-left
        const pinSize = 12 / state.viewport.zoom;
        ctx.fillStyle = commentNode.resolved
          ? 'rgba(150, 150, 150, 0.8)'
          : 'rgba(255, 200, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(x - pinSize / 2, y - pinSize / 2, pinSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Selection and hover rendering
      if (state.mode === 'DEV') {
        if (state.selection.includes(id)) {
          ctx.strokeStyle = '#F87171';
          ctx.lineWidth = 2 / state.viewport.zoom;
          const width = hasWidth(props) ? props.width : 100;
          const height = hasHeight(props) ? props.height : 20;
          ctx.strokeRect(x, y, width, height);
        }
        if (id === hoveredId && !state.selection.includes(id)) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          const width = hasWidth(props) ? props.width : 100;
          const height = hasHeight(props) ? props.height : 20;
          ctx.fillRect(x, y, width, height);
        }
      } else {
        if (state.selection.includes(id)) {
          const width = hasWidth(props) ? props.width : 100;
          const height = hasHeight(props) ? props.height : 20;
          ctx.strokeStyle = '#00a8ff';
          ctx.lineWidth = 1 / state.viewport.zoom;
          ctx.strokeRect(x, y, width, height);

          // Resize handles (8 handles: corners + midpoints)
          ctx.fillStyle = 'white';
          ctx.strokeStyle = '#00a8ff';
          ctx.lineWidth = 1 / state.viewport.zoom;
          const hs = 8 / state.viewport.zoom;
          const handles = [
            { x: x - hs / 2, y: y - hs / 2 }, // top-left
            { x: x + width / 2 - hs / 2, y: y - hs / 2 }, // top
            { x: x + width - hs / 2, y: y - hs / 2 }, // top-right
            { x: x + width - hs / 2, y: y + height / 2 - hs / 2 }, // right
            { x: x + width - hs / 2, y: y + height - hs / 2 }, // bottom-right
            { x: x + width / 2 - hs / 2, y: y + height - hs / 2 }, // bottom
            { x: x - hs / 2, y: y + height - hs / 2 }, // bottom-left
            { x: x - hs / 2, y: y + height / 2 - hs / 2 }, // left
          ];
          handles.forEach(handle => {
            ctx.fillRect(handle.x, handle.y, hs, hs);
            ctx.strokeRect(handle.x, handle.y, hs, hs);
          });
        }
      }
    };

    state.rootIds.forEach(id => drawNode(id, 0, 0));

    // Dev mode distance display
    if (state.mode === 'DEV' && state.selection.length === 1 && hoveredId && hoveredId !== state.selection[0]) {
      const selId = state.selection[0];
      const selAbs = getAbsolutePosition(selId, state.nodes);
      const hovAbs = getAbsolutePosition(hoveredId, state.nodes);
      const selNode = state.nodes[selId];
      const hovNode = state.nodes[hoveredId];
      const selWidth = hasWidth(selNode) ? selNode.width : 100;
      const selHeight = hasHeight(selNode) ? selNode.height : 100;
      const hovWidth = hasWidth(hovNode) ? hovNode.width : 100;
      const hovHeight = hasHeight(hovNode) ? hovNode.height : 100;
      const sx = selAbs.x + selWidth / 2;
      const sy = selAbs.y + selHeight / 2;
      const hx = hovAbs.x + hovWidth / 2;
      const hy = hovAbs.y + hovHeight / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 1 / state.viewport.zoom;
      ctx.moveTo(sx, sy);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      const dist = Math.round(Math.sqrt(Math.pow(hx - sx, 2) + Math.pow(hy - sy, 2)));
      ctx.fillStyle = '#F87171';
      ctx.font = `${12 / state.viewport.zoom}px sans-serif`;
      ctx.fillText(`${dist}px`, (sx + hx) / 2, (sy + hy) / 2);
    }
  }, [state, hoveredId, canvasRef, containerRef]);

  return { renderScene };
}
