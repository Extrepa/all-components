/**
 * Wrapper for sprite sheet Web Worker
 */

import { AnimationSequence, AnimationFrame } from '../types';
import { SpriteSheetLayout, SpriteSheetMetadata } from './spriteSheet';

export interface SpriteSheetWorkerMessage {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  imageData?: ArrayBuffer;
  metadata?: SpriteSheetMetadata;
  error?: string;
}

/**
 * Convert image URL to ArrayBuffer via fetch
 */
async function imageUrlToArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  return await response.arrayBuffer();
}

/**
 * Generate sprite sheet using Web Worker
 */
export async function generateSpriteSheetWithWorker(
  sequences: AnimationSequence[],
  layout: SpriteSheetLayout = { type: 'horizontal' },
  onProgress?: (progress: number) => void
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

  // Get dimensions of first frame
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = allFrames[0].frame.imageUrl;
  });
  const frameWidth = img.width;
  const frameHeight = img.height;

  // Convert frames to ArrayBuffers
  const frameData = await Promise.all(
    allFrames.map(async ({ frame, sequence }) => {
      let imageData: ArrayBuffer;
      if (frame.imageUrl.startsWith('data:')) {
        // Data URL - convert to blob then array buffer
        const response = await fetch(frame.imageUrl);
        imageData = await response.arrayBuffer();
      } else {
        imageData = await imageUrlToArrayBuffer(frame.imageUrl);
      }
      return {
        imageData,
        filename: `${sequence.animationKey}_${frame.frameNumber}.png`
      };
    })
  );

  // Create worker
  // Use public path - Vite serves files from public/ at root
  const worker = new Worker('/spriteSheetWorker.js', { type: 'module' });

  return new Promise((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<SpriteSheetWorkerMessage>) => {
      const message = e.data;
      
      if (message.type === 'progress') {
        onProgress?.(message.progress || 0);
      } else if (message.type === 'complete') {
        // Convert ArrayBuffer to data URL
        const blob = new Blob([message.imageData!], { type: 'image/png' });
        const reader = new FileReader();
        reader.onloadend = () => {
          worker.terminate();
          resolve({
            image: reader.result as string,
            metadata: message.metadata!
          });
        };
        reader.readAsDataURL(blob);
      } else if (message.type === 'error') {
        worker.terminate();
        reject(new Error(message.error || 'Unknown error'));
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    // Send work to worker
    worker.postMessage({
      frames: frameData,
      layout,
      frameWidth,
      frameHeight
    });
  });
}

