import React from 'react';
import { CodeAnalysis } from '../utils/codeAnalyzer';

interface CodeAnalysisPanelProps {
  analysis: CodeAnalysis;
  onPreviewAsIs: () => void;
  onWrapAndPreview: () => void;
  onExtract: () => void;
  onClose?: () => void;
  uploadedFilesCount?: number;
}

const CodeTypeLabels: Record<string, string> = {
  html: 'HTML',
  react: 'React/TSX',
  threejs: 'Three.js',
  p5js: 'p5.js',
  vanilla: 'Vanilla JavaScript',
  css: 'CSS',
  json: 'JSON',
  mixed: 'Mixed (HTML/CSS/JS)',
  unknown: 'Unknown'
};

const CompletenessLabels: Record<string, string> = {
  complete: 'Complete',
  fragment: 'Fragment',
  snippet: 'Snippet',
  unknown: 'Unknown'
};

const PreviewModeLabels: Record<string, string> = {
  vanilla: 'Vanilla JS',
  react: 'React',
  browser: 'Browser',
  canvas: 'Canvas'
};

export default function CodeAnalysisPanel({
  analysis,
  onPreviewAsIs,
  onWrapAndPreview,
  onExtract,
  onClose,
  uploadedFilesCount = 0
}: CodeAnalysisPanelProps) {
  const getCodeTypeColor = (type: string) => {
    switch (type) {
      case 'react': return 'text-blue-400';
      case 'threejs': return 'text-purple-400';
      case 'p5js': return 'text-pink-400';
      case 'html': return 'text-green-400';
      case 'vanilla': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getCompletenessColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-400';
      case 'fragment': return 'text-yellow-400';
      case 'snippet': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Code Analysis
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Code Type and Completeness */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Code Type</div>
          <div className={`font-semibold ${getCodeTypeColor(analysis.codeType)}`}>
            {CodeTypeLabels[analysis.codeType] || analysis.codeType}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Completeness</div>
          <div className={`font-semibold ${getCompletenessColor(analysis.completeness)}`}>
            {CompletenessLabels[analysis.completeness] || analysis.completeness}
          </div>
        </div>
      </div>

      {/* Preview Mode Suggestion */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 mb-4">
        <div className="text-xs text-gray-500 mb-1">Suggested Preview Mode</div>
        <div className="font-semibold text-blue-400">
          {PreviewModeLabels[analysis.suggestedPreviewMode] || analysis.suggestedPreviewMode}
        </div>
      </div>

      {/* Multi-file info */}
      {uploadedFilesCount > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-blue-200">
              <strong>Note:</strong> Preview and Wrap & Preview will only use the textarea content. Extract will process all {uploadedFilesCount} uploaded file{uploadedFilesCount > 1 ? 's' : ''} together.
            </div>
          </div>
        </div>
      )}

      {/* Wrapping Needs */}
      {analysis.wrappingNeeds.needsWrapping && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-yellow-300 mb-1">Wrapping Recommended</div>
              <div className="text-sm text-yellow-200/80">{analysis.wrappingNeeds.reason}</div>
              <div className="text-xs text-yellow-200/60 mt-1">{analysis.wrappingNeeds.explanation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {analysis.errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-4">
          <div className="font-semibold text-red-300 mb-2">Errors</div>
          <div className="space-y-2">
            {analysis.errors.map((error, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                {getSeverityIcon(error.severity)}
                <div className="flex-1 text-red-200">
                  {error.message}
                  {error.line && <span className="text-red-300/60 ml-2">(Line {error.line})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4">
          <div className="font-semibold text-yellow-300 mb-2">Warnings</div>
          <div className="space-y-2">
            {analysis.warnings.map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                {getSeverityIcon(warning.severity)}
                <div className="flex-1 text-yellow-200">
                  {warning.message}
                  {warning.line && <span className="text-yellow-300/60 ml-2">(Line {warning.line})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {analysis.detectedDependencies.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 mb-4">
          <div className="text-xs text-gray-500 mb-2">Detected Dependencies</div>
          <div className="flex flex-wrap gap-2">
            {analysis.detectedDependencies.map((dep, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
          <div className="font-semibold text-blue-300 mb-2">Recommendations</div>
          <ul className="space-y-1 text-sm text-blue-200">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        {analysis.canPreviewAsIs && (
          <button
            onClick={onPreviewAsIs}
            className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview As-Is
          </button>
        )}
        {analysis.wrappingNeeds.needsWrapping && (
          <button
            onClick={onWrapAndPreview}
            className="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Wrap & Preview
          </button>
        )}
        {analysis.canExtract && (
          <button
            onClick={onExtract}
            className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Extract Component
          </button>
        )}
      </div>

      {/* Info about what each action does */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <div className="space-y-1">
          {analysis.canPreviewAsIs && (
            <div><strong className="text-gray-400">Preview As-Is:</strong> Preview your code without modifications</div>
          )}
          {analysis.wrappingNeeds.needsWrapping && (
            <div><strong className="text-gray-400">Wrap & Preview:</strong> Add necessary HTML structure and libraries, then preview</div>
          )}
          {analysis.canExtract && (
            <div><strong className="text-gray-400">Extract:</strong> Use AI to analyze and extract structured component code</div>
          )}
        </div>
      </div>
    </div>
  );
}

