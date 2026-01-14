/**
 * Color Analysis Utilities
 * 
 * Functions to extract and analyze colors from SVG assets for filtering purposes.
 */

type ColorMatch = {
  color: string;
  count: number;
};

/**
 * Extract dominant colors from an SVG file by rendering it to a canvas
 * and analyzing pixel data. Returns an array of hex color strings.
 */
export async function extractColorsFromSvg(svgPath: string, maxColors: number = 5): Promise<string[]> {
  try {
    const response = await fetch(svgPath);
    const svgText = await response.text();
    
    // Create a temporary SVG element
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    
    // Set a reasonable size for analysis
    const size = 200;
    svgElement.setAttribute("width", String(size));
    svgElement.setAttribute("height", String(size));
    
    // Create an image from the SVG
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas and draw image
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          ctx.drawImage(img, 0, 0, size, size);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          
          // Count color occurrences (simplified - group similar colors)
          const colorMap = new Map<string, number>();
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Quantize colors to reduce noise (group similar colors)
            const quantizedR = Math.round(r / 32) * 32;
            const quantizedG = Math.round(g / 32) * 32;
            const quantizedB = Math.round(b / 32) * 32;
            
            const hex = rgbToHex(quantizedR, quantizedG, quantizedB);
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
          }
          
          // Sort by frequency and take top colors
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxColors)
            .map(([color]) => color);
          
          URL.revokeObjectURL(url);
          resolve(sortedColors);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG image"));
      };
      img.src = url;
    });
  } catch (err) {
    console.error("Error extracting colors from SVG:", err);
    return [];
  }
}

/**
 * Convert RGB values to hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Calculate color distance in RGB space
 */
function colorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return Infinity;
  
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Convert hex string to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if a color matches a target color within a threshold
 */
export function colorMatches(targetColor: string, assetColor: string, threshold: number = 50): boolean {
  const distance = colorDistance(targetColor, assetColor);
  return distance <= threshold;
}

/**
 * Cache for color analysis results
 */
const colorCache = new Map<string, string[]>();

/**
 * Get colors for an asset, using cache if available
 */
export async function getAssetColors(assetPath: string): Promise<string[]> {
  if (colorCache.has(assetPath)) {
    return colorCache.get(assetPath)!;
  }
  
  const colors = await extractColorsFromSvg(assetPath);
  colorCache.set(assetPath, colors);
  return colors;
}

