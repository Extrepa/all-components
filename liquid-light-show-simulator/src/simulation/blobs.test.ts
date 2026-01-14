import { describe, test, expect } from 'vitest';
import { createBlobs, updateBlobs } from './blobs';

describe('blob simulation', () => {
  test('createBlobs creates the requested number of blobs', () => {
    const blobs = createBlobs(10);
    expect(blobs).toHaveLength(10);
  });

  test('updateBlobs moves blobs over time', () => {
    const blobs = createBlobs(3);
    const original = blobs.map((b) => ({ x: b.x, y: b.y }));
    const updated = updateBlobs(blobs, 0.016, 800, 600, null);

    const movedCount = updated.filter((b, i) => b.x !== original[i].x || b.y !== original[i].y).length;
    expect(movedCount).toBeGreaterThan(0);
  });
});
