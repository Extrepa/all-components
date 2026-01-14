import { Color } from '../types';

export const createColor = (r: number, g: number, b: number, a: number = 1): Color => ({ r, g, b, a });
export const generateId = () => `node-${Math.random().toString(36).substr(2, 9)}`;
export const toHex = (c: Color) => `#${[c.r, c.g, c.b].map(x => x.toString(16).padStart(2,'0')).join('')}`;
export const hexToColor = (hex: string): Color => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16), a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
};
export const colorToCss = (c: Color) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

/**
 * Snaps a value to the nearest grid point
 * @param value The value to snap
 * @param gridSize The size of the grid
 * @param enabled Whether grid snapping is enabled
 * @returns The snapped value
 */
export const snapToGrid = (value: number, gridSize: number, enabled: boolean): number => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

