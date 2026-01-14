/**
 * Web Worker for sprite sheet generation
 * Runs heavy canvas operations off the main thread
 */

self.onmessage = async function(e) {
  const { frames, layout, frameWidth, frameHeight } = e.data;

  try {
    // Calculate sprite sheet dimensions
    let sheetWidth, sheetHeight, columns, rows;

    if (layout.type === 'horizontal') {
      columns = frames.length;
      rows = 1;
      sheetWidth = frameWidth * columns;
      sheetHeight = frameHeight;
    } else if (layout.type === 'vertical') {
      columns = 1;
      rows = frames.length;
      sheetWidth = frameWidth;
      sheetHeight = frameHeight * rows;
    } else {
      // Grid layout
      columns = layout.columns || Math.ceil(Math.sqrt(frames.length));
      rows = layout.rows || Math.ceil(frames.length / columns);
      sheetWidth = frameWidth * columns;
      sheetHeight = frameHeight * rows;
    }

    // Create offscreen canvas
    const canvas = new OffscreenCanvas(sheetWidth, sheetHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load and draw images
    const metadata = {
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

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      
      // Calculate position
      let x, y;
      if (layout.type === 'horizontal') {
        x = i * frameWidth;
        y = 0;
      } else if (layout.type === 'vertical') {
        x = 0;
        y = i * frameHeight;
      } else {
        const col = i % columns;
        const row = Math.floor(i / columns);
        x = col * frameWidth;
        y = row * frameHeight;
      }

      // Load image from data URL
      const img = await createImageBitmap(frame.imageData);
      ctx.drawImage(img, x, y, frameWidth, frameHeight);

      // Add to metadata
      metadata.frames.push({
        filename: frame.filename,
        frame: { x, y, w: frameWidth, h: frameHeight },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
        sourceSize: { w: frameWidth, h: frameHeight }
      });

      // Report progress
      self.postMessage({ type: 'progress', progress: (i + 1) / frames.length });
    }

    // Convert canvas to blob
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await blob.arrayBuffer();

    // Send result back
    self.postMessage({
      type: 'complete',
      imageData: arrayBuffer,
      metadata
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

