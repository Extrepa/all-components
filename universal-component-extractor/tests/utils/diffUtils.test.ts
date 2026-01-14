import { describe, it, expect } from 'vitest';
import { parseDiff } from 'react-diff-view';
import { createUnifiedDiff } from '../../utils/diffUtils';

describe('diffUtils', () => {
  it('creates a unified diff with at least one hunk for changed content', () => {
    const original = ['line 1', 'line 2', 'line 3'].join('\n');
    const transformed = ['line 1', 'changed 2', 'line 3'].join('\n');

    const patch = createUnifiedDiff('a/original.txt', 'b/transformed.txt', original, transformed);
    const [fileDiff] = parseDiff(patch);

    expect(fileDiff.hunks.length).toBeGreaterThan(0);
  });

  it('creates an empty-or-small diff when content is identical', () => {
    const original = ['same line', 'another line'].join('\n');
    const transformed = original;

    const patch = createUnifiedDiff('a/file.txt', 'b/file.txt', original, transformed);
    const [fileDiff] = parseDiff(patch);

    // It may still have hunks, but there should be no actual line changes
    const hasChanges = fileDiff.hunks.some(hunk =>
      hunk.changes.some(change => change.type === 'insert' || change.type === 'delete')
    );

    expect(hasChanges).toBe(false);
  });
});
