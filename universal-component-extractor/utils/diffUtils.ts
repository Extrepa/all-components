import { createTwoFilesPatch } from 'diff';

/**
 * Create a unified diff string between two texts.
 * This is used by DiffView together with react-diff-view.
 */
export function createUnifiedDiff(
  originalPath: string,
  newPath: string,
  original: string,
  transformed: string,
): string {
  const patch = createTwoFilesPatch(originalPath, newPath, original, transformed);
  // react-diff-view (via gitdiff-parser) expects a git-style header line.
  return `diff --git a/${originalPath} b/${newPath}\n${patch}`;
}
