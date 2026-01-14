import React from 'react';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { createUnifiedDiff } from '../utils/diffUtils';

interface DiffViewProps {
  original?: string;
  transformed?: string;
  originalLabel?: string;
  transformedLabel?: string;
}

const DiffView: React.FC<DiffViewProps> = ({
  original,
  transformed,
  originalLabel = 'Original',
  transformedLabel = 'Transformed',
}) => {
  if (!original || !transformed) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        No diff available. Run an extraction from textarea input to see before/after changes.
      </div>
    );
  }

  let fileDiff;
  try {
    const diffText = createUnifiedDiff('original', 'transformed', original, transformed);
    [fileDiff] = parseDiff(diffText);
  } catch (e) {
    console.error('Failed to generate diff', e);
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-400">
        Unable to generate diff for this content.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-900 text-gray-100">
      <Diff
        viewType="unified"
        diffType={fileDiff.type}
        hunks={fileDiff.hunks}
        diffKey="main-diff"
        gutterType="anchor"
        renderHunk={hunk => <Hunk key={hunk.content} hunk={hunk} />}
      >
        {({ children }) => (
          <div className="text-xs font-mono">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-gray-300">{originalLabel}</span>
              <span className="text-gray-300">{transformedLabel}</span>
            </div>
            {children}
          </div>
        )}
      </Diff>
    </div>
  );
};

export default DiffView;
