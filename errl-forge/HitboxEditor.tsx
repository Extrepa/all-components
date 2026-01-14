import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Save } from 'lucide-react';
import { AssetMetadata } from '../types';

interface HitboxEditorProps {
  imageUrl: string;
  metadata: AssetMetadata;
  onSave: (hitbox: AssetMetadata['hitbox']) => void;
  onClose: () => void;
}

export const HitboxEditor: React.FC<HitboxEditorProps> = ({ imageUrl, metadata, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hitbox, setHitbox] = useState(metadata.hitbox);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Load image and calculate scale
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate scale to fit container
      const containerWidth = container.clientWidth - 40; // Padding
      const containerHeight = container.clientHeight - 100; // Space for controls
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up
      
      setScale(newScale);
      canvas.width = img.width * newScale;
      canvas.height = img.height * newScale;
      
      // Center image
      const offsetX = (containerWidth - canvas.width) / 2;
      const offsetY = (containerHeight - canvas.height) / 2;
      setOffset({ x: offsetX, y: offsetY });

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawHitbox(ctx);
    };
    img.src = imageUrl;
  }, [imageUrl, hitbox]);

  const drawHitbox = (ctx: CanvasRenderingContext2D) => {
    const { x, y, width, height } = hitbox;
    
    // Draw hitbox rectangle
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x * scale, y * scale, width * scale, height * scale);
    
    // Draw fill with transparency
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
    
    // Draw corner handles
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    const handleSize = 8;
    const corners = [
      [x * scale, y * scale], // Top-left
      [(x + width) * scale, y * scale], // Top-right
      [x * scale, (y + height) * scale], // Bottom-left
      [(x + width) * scale, (y + height) * scale] // Bottom-right
    ];
    
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  };

  const isNearCorner = (x: number, y: number, cornerX: number, cornerY: number) => {
    const threshold = 10 / scale;
    return Math.abs(x - cornerX) < threshold && Math.abs(y - cornerY) < threshold;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const { x: hx, y: hy, width, height } = hitbox;

    // Check if clicking on a corner (resize)
    const corners = [
      { x: hx, y: hy },
      { x: hx + width, y: hy },
      { x: hx, y: hy + height },
      { x: hx + width, y: hy + height }
    ];

    for (const corner of corners) {
      if (isNearCorner(pos.x, pos.y, corner.x, corner.y)) {
        setIsResizing(true);
        setDragStart({ x: pos.x - corner.x, y: pos.y - corner.y });
        return;
      }
    }

    // Check if clicking inside hitbox (drag)
    if (pos.x >= hx && pos.x <= hx + width && pos.y >= hy && pos.y <= hy + height) {
      setIsDragging(true);
      setDragStart({ x: pos.x - hx, y: pos.y - hy });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isResizing) return;

    const pos = getMousePos(e);
    
    if (isDragging) {
      setHitbox(prev => ({
        ...prev,
        x: Math.max(0, pos.x - dragStart.x),
        y: Math.max(0, pos.y - dragStart.y)
      }));
    } else if (isResizing) {
      // Resize from bottom-right corner
      setHitbox(prev => ({
        ...prev,
        width: Math.max(10, pos.x - prev.x),
        height: Math.max(10, pos.y - prev.y)
      }));
    }

    // Redraw
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          drawHitbox(ctx);
        };
        img.src = imageUrl;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleReset = () => {
    setHitbox(metadata.hitbox);
  };

  const handleSave = () => {
    onSave(hitbox);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white font-pixel">Hitbox Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div 
            ref={containerRef}
            className="relative bg-gray-950 rounded border border-gray-700 flex items-center justify-center"
            style={{ minHeight: '400px' }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair"
              style={{ 
                position: 'absolute',
                left: offset.x,
                top: offset.y
              }}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-800/50">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={Math.round(hitbox.x)}
                onChange={(e) => setHitbox(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(hitbox.y)}
                onChange={(e) => setHitbox(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(hitbox.width)}
                onChange={(e) => setHitbox(prev => ({ ...prev, width: Math.max(1, Number(e.target.value)) }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(hitbox.height)}
                onChange={(e) => setHitbox(prev => ({ ...prev, height: Math.max(1, Number(e.target.value)) }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Hitbox
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <p>• Drag the hitbox to move it</p>
            <p>• Drag corners to resize</p>
            <p>• Or edit values directly in the inputs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

