/**
 * Rulers Component
 * Shows horizontal and vertical rulers with measurements
 */

import React, { useEffect, useState } from 'react';
import { DesignState } from '../types';

interface RulersProps {
  state: DesignState;
  containerRef: React.RefObject<HTMLDivElement>;
  showRulers?: boolean;
}

export const Rulers: React.FC<RulersProps> = ({
  state,
  containerRef,
  showRulers = true
}) => {
  const [rulerWidth, setRulerWidth] = useState(20);
  const [tickInterval, setTickInterval] = useState(50);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Calculate tick interval based on zoom
    const baseInterval = 50;
    const zoom = state.viewport.zoom;
    let interval = baseInterval;
    
    if (zoom > 2) {
      interval = baseInterval / 2;
    } else if (zoom > 1) {
      interval = baseInterval;
    } else if (zoom > 0.5) {
      interval = baseInterval * 2;
    } else {
      interval = baseInterval * 4;
    }
    
    setTickInterval(interval);
  }, [state.viewport.zoom, containerRef]);

  if (!showRulers || !containerRef.current) return null;

  const rect = containerRef.current.getBoundingClientRect();
  const zoom = state.viewport.zoom;
  const viewportX = state.viewport.x;
  const viewportY = state.viewport.y;

  // Calculate visible range in world coordinates
  const visibleLeft = -viewportX / zoom;
  const visibleRight = (rect.width - viewportX) / zoom;
  const visibleTop = -viewportY / zoom;
  const visibleBottom = (rect.height - viewportY) / zoom;

  // Generate ticks for horizontal ruler
  const generateHorizontalTicks = () => {
    const ticks: Array<{ position: number; value: number; isMajor: boolean }> = [];
    const start = Math.floor(visibleLeft / tickInterval) * tickInterval;
    const end = Math.ceil(visibleRight / tickInterval) * tickInterval;
    
    for (let pos = start; pos <= end; pos += tickInterval) {
      const isMajor = pos % (tickInterval * 5) === 0;
      ticks.push({ position: pos, value: pos, isMajor });
    }
    
    return ticks;
  };

  // Generate ticks for vertical ruler
  const generateVerticalTicks = () => {
    const ticks: Array<{ position: number; value: number; isMajor: boolean }> = [];
    const start = Math.floor(visibleTop / tickInterval) * tickInterval;
    const end = Math.ceil(visibleBottom / tickInterval) * tickInterval;
    
    for (let pos = start; pos <= end; pos += tickInterval) {
      const isMajor = pos % (tickInterval * 5) === 0;
      ticks.push({ position: pos, value: pos, isMajor });
    }
    
    return ticks;
  };

  const horizontalTicks = generateHorizontalTicks();
  const verticalTicks = generateVerticalTicks();

  return (
    <>
      {/* Horizontal Ruler */}
      <div
        className="absolute top-0 left-0 bg-[#1e1e1e] border-b border-gray-700 z-20"
        style={{
          width: `${rect.width}px`,
          height: `${rulerWidth}px`,
          left: `${rect.left}px`,
          top: `${rect.top}px`,
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          {horizontalTicks.map((tick, index) => {
            const screenX = tick.position * zoom + viewportX;
            return (
              <g key={`h-tick-${index}`}>
                <line
                  x1={screenX}
                  y1={tick.isMajor ? 0 : rulerWidth * 0.5}
                  x2={screenX}
                  y2={rulerWidth}
                  stroke="#666"
                  strokeWidth={1}
                />
                {tick.isMajor && (
                  <text
                    x={screenX + 2}
                    y={rulerWidth - 4}
                    fill="#999"
                    fontSize="10px"
                    fontFamily="monospace"
                  >
                    {Math.round(tick.value)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertical Ruler */}
      <div
        className="absolute top-0 left-0 bg-[#1e1e1e] border-r border-gray-700 z-20"
        style={{
          width: `${rulerWidth}px`,
          height: `${rect.height}px`,
          left: `${rect.left}px`,
          top: `${rect.top + rulerWidth}px`,
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          {verticalTicks.map((tick, index) => {
            const screenY = tick.position * zoom + viewportY;
            return (
              <g key={`v-tick-${index}`}>
                <line
                  x1={tick.isMajor ? 0 : rulerWidth * 0.5}
                  y1={screenY}
                  x2={rulerWidth}
                  y2={screenY}
                  stroke="#666"
                  strokeWidth={1}
                />
                {tick.isMajor && (
                  <text
                    x={2}
                    y={screenY + 10}
                    fill="#999"
                    fontSize="10px"
                    fontFamily="monospace"
                    transform={`rotate(-90 ${2} ${screenY + 10})`}
                  >
                    {Math.round(tick.value)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
};

