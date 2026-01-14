import { AnimationSequence, AnimationFrame } from '../types';

export interface SpriteSheetLayout {
  type: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  rows?: number;
}

export interface SpriteSheetMetadata {
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

/**
 * Load an image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Get image dimensions
 */
async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(url);
  return { width: img.width, height: img.height };
}

/**
 * Generate sprite sheet from animation sequences
 */
export async function generateSpriteSheet(
  sequences: AnimationSequence[],
  layout: SpriteSheetLayout = { type: 'horizontal' }
): Promise<{ image: string; metadata: SpriteSheetMetadata }> {
  // Collect all frames
  const allFrames: Array<{ frame: AnimationFrame; sequence: AnimationSequence }> = [];
  sequences.forEach(sequence => {
    sequence.frames.forEach(frame => {
      allFrames.push({ frame, sequence });
    });
  });

  if (allFrames.length === 0) {
    throw new Error('No frames to generate sprite sheet');
  }

  // Get dimensions of first frame (assuming all frames are same size)
  const firstFrameDimensions = await getImageDimensions(allFrames[0].frame.imageUrl);
  const frameWidth = firstFrameDimensions.width;
  const frameHeight = firstFrameDimensions.height;

  // Calculate sprite sheet dimensions based on layout
  let sheetWidth: number;
  let sheetHeight: number;
  let columns: number;
  let rows: number;

  if (layout.type === 'horizontal') {
    columns = allFrames.length;
    rows = 1;
    sheetWidth = frameWidth * columns;
    sheetHeight = frameHeight;
  } else if (layout.type === 'vertical') {
    columns = 1;
    rows = allFrames.length;
    sheetWidth = frameWidth;
    sheetHeight = frameHeight * rows;
  } else {
    // Grid layout
    columns = layout.columns || Math.ceil(Math.sqrt(allFrames.length));
    rows = layout.rows || Math.ceil(allFrames.length / columns);
    sheetWidth = frameWidth * columns;
    sheetHeight = frameHeight * rows;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw frames onto canvas
  const metadata: SpriteSheetMetadata = {
    frames: [],
    meta: {
      app: 'Errl Forge',
      version: '1.0.0',
      image: 'sprite-sheet.png',
      format: 'RGBA8888',
      size: { w: sheetWidth, h: sheetHeight },
      scale: '1'
    }
  };

  for (let i = 0; i < allFrames.length; i++) {
    const { frame, sequence } = allFrames[i];
    
    // Calculate position in sprite sheet
    let x: number, y: number;
    if (layout.type === 'horizontal') {
      x = i * frameWidth;
      y = 0;
    } else if (layout.type === 'vertical') {
      x = 0;
      y = i * frameHeight;
    } else {
      // Grid
      const col = i % columns;
      const row = Math.floor(i / columns);
      x = col * frameWidth;
      y = row * frameHeight;
    }

    // Load and draw image
    const img = await loadImage(frame.imageUrl);
    ctx.drawImage(img, x, y, frameWidth, frameHeight);

    // Add to metadata
    const filename = `${sequence.animationKey}_${frame.frameNumber}.png`;
    metadata.frames.push({
      filename,
      frame: { x, y, w: frameWidth, h: frameHeight },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
      sourceSize: { w: frameWidth, h: frameHeight }
    });
  }

  // Convert canvas to data URL
  const imageDataUrl = canvas.toDataURL('image/png');

  return { image: imageDataUrl, metadata };
}

/**
 * Export sprite sheet as files
 */
export async function exportSpriteSheet(
  sequences: AnimationSequence[],
  layout: SpriteSheetLayout = { type: 'horizontal' },
  filename: string = 'sprite-sheet'
): Promise<void> {
  const { image, metadata } = await generateSpriteSheet(sequences, layout);

  // Download image
  const imageLink = document.createElement('a');
  imageLink.href = image;
  imageLink.download = `${filename}.png`;
  document.body.appendChild(imageLink);
  imageLink.click();
  document.body.removeChild(imageLink);

  // Download metadata JSON
  const jsonStr = JSON.stringify(metadata, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(blob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `${filename}.json`;
  document.body.appendChild(jsonLink);
  jsonLink.click();
  document.body.removeChild(jsonLink);
  URL.revokeObjectURL(jsonUrl);
}

/**
 * Generate Phaser 3 compatible sprite sheet metadata
 */
export function generatePhaserMetadata(sequences: AnimationSequence[]): any {
  const animations: Record<string, { start: number; end: number }> = {};
  let frameIndex = 0;

  sequences.forEach(sequence => {
    animations[sequence.animationKey] = {
      start: frameIndex,
      end: frameIndex + sequence.frames.length - 1
    };
    frameIndex += sequence.frames.length;
  });

  return {
    frames: sequences.flatMap(sequence =>
      sequence.frames.map((frame, index) => ({
        filename: `${sequence.animationKey}_${index}.png`,
        frame: { x: 0, y: 0, w: 0, h: 0 }, // Will be filled by sprite sheet generation
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        sourceSize: { w: 0, h: 0 }
      }))
    ),
    animations,
    meta: {
      app: 'Errl Forge',
      version: '1.0.0',
      image: 'sprite-sheet.png',
      format: 'RGBA8888',
      size: { w: 0, h: 0 },
      scale: '1'
    }
  };
}

