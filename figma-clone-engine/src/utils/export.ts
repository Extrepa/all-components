/**
 * Export utilities for rendering nodes to various formats
 */

import { SceneNode, DesignState, FrameNode, RectangleNode, TextNode, VectorNode, ImageNode, InstanceNode, CommentNode, Color } from '../types';
import { hexToColor, colorToCss } from './helpers';

/**
 * Render a node and its children to a canvas
 */
export function renderNodeToCanvas(
  node: SceneNode,
  nodes: Record<string, SceneNode>,
  canvas: HTMLCanvasElement,
  scale: number = 1,
  backgroundColor?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = (node as any).width || 100;
    const height = (node as any).height || 20;
    
    canvas.width = width * scale * dpr;
    canvas.height = height * scale * dpr;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    
    ctx.scale(dpr * scale, dpr * scale);
    
    // Fill background if provided
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    const fillRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    const drawNodeRecursive = (n: SceneNode, offsetX: number, offsetY: number): Promise<void> => {
      return new Promise((nodeResolve) => {
        if (!n.visible) {
          nodeResolve();
          return;
        }

        const x = offsetX + n.x;
        const y = offsetY + n.y;

        if (n.type === 'IMAGE') {
          const imgNode = n as ImageNode;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, x, y, imgNode.width, imgNode.height);
            nodeResolve();
          };
          img.onerror = () => {
            // Draw placeholder if image fails to load
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, imgNode.width, imgNode.height);
            nodeResolve();
          };
          img.src = imgNode.src;
        }
        else if (['RECTANGLE', 'FRAME', 'COMPONENT'].includes(n.type)) {
          const shapeNode = n as FrameNode | RectangleNode;
          const opacity = (shapeNode as any).opacity !== undefined ? (shapeNode as any).opacity : 1;
          ctx.save();
          ctx.globalAlpha = opacity;
          
          // Fill
          const gradient = (shapeNode as any).backgroundGradient;
          if (gradient) {
            const match = gradient.match(/linear-gradient\((\d+)deg,\s*#([a-f\d]{6}),\s*#([a-f\d]{6})\)/i);
            if (match) {
              const angle = parseInt(match[1]);
              const color1 = hexToColor('#' + match[2]);
              const color2 = hexToColor('#' + match[3]);
              
              const rad = (angle * Math.PI) / 180;
              const cx = x + shapeNode.width / 2;
              const cy = y + shapeNode.height / 2;
              const length = Math.sqrt(shapeNode.width * shapeNode.width + shapeNode.height * shapeNode.height);
              const x1 = cx - Math.cos(rad) * length / 2;
              const y1 = cy - Math.sin(rad) * length / 2;
              const x2 = cx + Math.cos(rad) * length / 2;
              const y2 = cy + Math.sin(rad) * length / 2;
              
              const grad = ctx.createLinearGradient(x1, y1, x2, y2);
              grad.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, ${color1.a})`);
              grad.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, ${color2.a})`);
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = colorToCss(shapeNode.fill);
            }
          } else {
            ctx.fillStyle = colorToCss(shapeNode.fill);
          }
          
          // Box shadow (apply before fill)
          const boxShadow = (shapeNode as any).boxShadow;
          if (boxShadow) {
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
          
          const r = shapeNode.cornerRadius || 0;
          if (r > 0) {
            fillRoundRect(x, y, shapeNode.width, shapeNode.height, r);
          } else {
            ctx.fillRect(x, y, shapeNode.width, shapeNode.height);
          }
          
          // Clear shadow after fill
          if (boxShadow) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
          }
          
          // Border
          const borderWidth = (shapeNode as any).borderWidth;
          const borderColor = (shapeNode as any).borderColor;
          const borderStyle = (shapeNode as any).borderStyle;
          if (borderWidth && borderColor && borderStyle && borderStyle !== 'none') {
            ctx.strokeStyle = colorToCss(borderColor);
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
              ctx.roundRect(x, y, shapeNode.width, shapeNode.height, r);
              ctx.stroke();
            } else {
              ctx.strokeRect(x, y, shapeNode.width, shapeNode.height);
            }
            ctx.setLineDash([]);
          }
          
          ctx.restore();
          
          // Draw children if frame
          if (n.type === 'FRAME' || n.type === 'COMPONENT') {
            const frame = n as FrameNode;
            const childPromises = frame.children.map(childId => {
              const child = nodes[childId];
              return child ? drawNodeRecursive(child, x, y) : Promise.resolve();
            });
            Promise.all(childPromises).then(() => nodeResolve());
          } else {
            nodeResolve();
          }
        }
        else if (n.type === 'TEXT') {
          const textNode = n as TextNode;
          const opacity = textNode.opacity !== undefined ? textNode.opacity : 1;
          ctx.save();
          ctx.globalAlpha = opacity;
          
          ctx.fillStyle = colorToCss(textNode.fill);
          const fontFamily = textNode.fontFamily || 'Inter, sans-serif';
          const fontWeight = textNode.fontWeight || 'normal';
          ctx.font = `${fontWeight} ${textNode.fontSize}px ${fontFamily}`;
          ctx.textBaseline = 'top';
          ctx.textAlign = (textNode.textAlign || 'left') as CanvasTextAlign;
          
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
          
          ctx.restore();
          nodeResolve();
        }
        else if (n.type === 'VECTOR') {
          const vectorNode = n as VectorNode;
          ctx.save();
          
          if (vectorNode.fill) {
            ctx.fillStyle = colorToCss(vectorNode.fill);
          }
          ctx.strokeStyle = colorToCss(vectorNode.stroke);
          ctx.lineWidth = vectorNode.strokeWidth;
          
          if (vectorNode.points && vectorNode.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(x + vectorNode.points[0].x, y + vectorNode.points[0].y);
            for (let i = 1; i < vectorNode.points.length; i++) {
              ctx.lineTo(x + vectorNode.points[i].x, y + vectorNode.points[i].y);
            }
            if (vectorNode.fill) {
              ctx.fill();
            }
            ctx.stroke();
          }
          
          ctx.restore();
          nodeResolve();
        }
        else if (n.type === 'INSTANCE') {
          const instanceNode = n as InstanceNode;
          const master = nodes[instanceNode.masterComponentId];
          if (master && master.type === 'COMPONENT') {
            drawNodeRecursive(master, x, y).then(() => nodeResolve());
          } else {
            nodeResolve();
          }
        }
        else if (n.type === 'COMMENT') {
          // Skip comments in export
          nodeResolve();
        }
        else {
          nodeResolve();
        }
      });
    };

    drawNodeRecursive(node, 0, 0).then(() => resolve()).catch(reject);
  });
}

/**
 * Export node as PNG
 */
export async function exportAsPNG(
  node: SceneNode,
  nodes: Record<string, SceneNode>,
  scale: number = 1,
  fileName?: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  await renderNodeToCanvas(node, nodes, canvas, scale, '#ffffff');
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName || `${node.name || 'export'}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Export node as JPG
 */
export async function exportAsJPG(
  node: SceneNode,
  nodes: Record<string, SceneNode>,
  scale: number = 1,
  quality: number = 0.9,
  fileName?: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  await renderNodeToCanvas(node, nodes, canvas, scale, '#ffffff');
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName || `${node.name || 'export'}.jpg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', quality);
}

/**
 * Export node as SVG
 */
export function exportAsSVG(
  node: SceneNode,
  nodes: Record<string, SceneNode>,
  scale: number = 1,
  fileName?: string
): void {
  const width = (node as any).width || 100;
  const height = (node as any).height || 20;
  
  let svg = `<svg width="${width * scale}" height="${height * scale}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Simple SVG generation - can be enhanced
  if (['RECTANGLE', 'FRAME', 'COMPONENT'].includes(node.type)) {
    const shapeNode = node as FrameNode | RectangleNode;
    const fill = colorToCss(shapeNode.fill);
    const r = shapeNode.cornerRadius || 0;
    svg += `<rect x="${node.x}" y="${node.y}" width="${shapeNode.width}" height="${shapeNode.height}" fill="${fill}" rx="${r}" ry="${r}"/>`;
  } else if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    const fill = colorToCss(textNode.fill);
    svg += `<text x="${node.x}" y="${node.y + (textNode.fontSize || 16)}" fill="${fill}" font-size="${textNode.fontSize || 16}" font-family="${textNode.fontFamily || 'Inter, sans-serif'}">${textNode.content}</text>`;
  }
  
  svg += '</svg>';
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName || `${node.name || 'export'}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse scale string (e.g., "2x") to number
 */
export function parseScale(scaleStr: string): number {
  const match = scaleStr.match(/(\d+(?:\.\d+)?)x?/);
  return match ? parseFloat(match[1]) : 1;
}

