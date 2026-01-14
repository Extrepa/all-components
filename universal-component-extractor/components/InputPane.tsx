import React from 'react';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import ConsolePanel, { LogEntry } from './ConsolePanel';
import { LoadingSpinner } from './icons';
import { ExtractedCode, UploadedFile } from '../types';
import { CodeAnalysis } from '../utils/codeAnalyzer';
import { EXAMPLE_CODES } from '../utils/exampleCode';

type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama';

type InteractionMode = 'extract' | 'explain' | 'review';

interface InputPaneProps {
  htmlInput: string;
  setHtmlInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  uploadedFiles: UploadedFile[];
  importedFileName: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  codeAnalysis: CodeAnalysis | null;
  showAnalysisPanel: boolean;
  previewLogs: LogEntry[];
  extractedCode: ExtractedCode | null;
  isDragging: boolean;
  showExplanationModal: boolean;
  getExportRecommendation: () => string;
  // Callbacks
  onPreviewClick: () => void;
  onProcessClick: () => void;
  onClearClick: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPreviewAsIs: () => void;
  onWrapAndPreview: () => void;
  onExtractFromAnalysis: () => void;
  onCloseAnalysisPanel: () => void;
  onClearLogs: () => void;
  onExampleClick: (code: string) => void;
  triggerFileUpload: () => void;
  handleCancelExtraction: () => void;
  setShowExplanationModal: (show: boolean) => void;
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
  setActiveFileId: (id: string | null) => void;
  setImportedFileName: (name: string | null) => void;
  analyzeCode: (code: string) => CodeAnalysis;
  setCodeAnalysis: (analysis: CodeAnalysis | null) => void;
  setPreviewMode: (mode: 'vanilla' | 'react' | 'browser' | 'canvas') => void;
  setShowAnalysisPanel: (show: boolean) => void;
  interactionMode?: InteractionMode;
  provider: ProviderId;
  model: string;
}

const formatProviderLabel = (provider: ProviderId): string => {
  switch (provider) {
    case 'gemini':
      return 'Gemini';
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      // Surface the Claude brand name in the compact pill
      return 'Claude';
    case 'ollama':
    default:
      return 'Ollama';
  }
};

const formatModelLabel = (provider: ProviderId, model: string | undefined): string => {
  if (!model) return '';
  const m = model.toLowerCase();

  if (provider === 'gemini') {
    if (m.includes('3-pro')) return 'Gemini 3 Pro';
    if (m.includes('2.5-pro')) return 'Gemini 2.5 Pro';
    if (m.includes('2.5-flash-lite')) return 'Gemini 2.5 Flash Lite';
    if (m.includes('2.5-flash')) return 'Gemini 2.5 Flash';
    if (m.includes('1.5-pro')) return 'Gemini 1.5 Pro';
    if (m.includes('1.5-flash')) return 'Gemini 1.5 Flash';
    return model;
  }

  if (provider === 'openai') {
    if (m.includes('gpt-5.1')) return 'GPT-5.1';
    if (m.includes('gpt-5-mini')) return 'GPT-5 Mini';
    if (m.includes('gpt-4.1-mini')) return 'GPT-4.1 Mini';
    if (m.includes('gpt-4.1-nano')) return 'GPT-4.1 Nano';
    if (m.includes('gpt-4o-mini')) return 'GPT-4o Mini';
    if (m.includes('gpt-4o')) return 'GPT-4o';
    if (m.includes('gpt-4-turbo')) return 'GPT-4 Turbo';
    if (m.includes('gpt-3.5-turbo')) return 'GPT-3.5 Turbo';
    return model;
  }

  if (provider === 'anthropic') {
    if (m.includes('opus-4')) return 'Claude 4 Opus';
    if (m.includes('sonnet-4')) return 'Claude 4 Sonnet';
    if (m.includes('3.7-sonnet')) return 'Claude 3.7 Sonnet';
    if (m.includes('3.5-sonnet')) return 'Claude 3.5 Sonnet';
    if (m.includes('3.5-haiku')) return 'Claude 3.5 Haiku';
    if (m.includes('3-opus')) return 'Claude 3 Opus';
    if (m.includes('3-haiku')) return 'Claude 3 Haiku';
    return model;
  }

  // Ollama / local models: clean up common tags
  if (m.startsWith('llama3.2')) return 'Llama 3.2';
  if (m.startsWith('llama3.1')) return 'Llama 3.1';
  if (m.startsWith('mistral')) return 'Mistral';
  if (m.includes('codellama')) return 'Code Llama';
  if (m.startsWith('phi4')) return 'Phi-4';
  if (m.startsWith('phi3')) return 'Phi-3';
  if (m.startsWith('gemma2')) return 'Gemma 2';
  if (m.startsWith('qwen2.5')) return 'Qwen 2.5';

  return model;
};

const formatModeLabel = (mode?: InteractionMode): string => {
  if (!mode) return '';
  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const InputPane: React.FC<InputPaneProps> = ({
  htmlInput,
  setHtmlInput,
  isLoading,
  error,
  uploadedFiles,
  importedFileName,
  fileInputRef,
  codeAnalysis,
  showAnalysisPanel,
  previewLogs,
  extractedCode,
  isDragging,
  showExplanationModal,
  getExportRecommendation,
  onPreviewClick,
  onProcessClick,
  onClearClick,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onPreviewAsIs,
  onWrapAndPreview,
  onExtractFromAnalysis,
  onCloseAnalysisPanel,
  onClearLogs,
  onExampleClick,
  triggerFileUpload,
  handleCancelExtraction,
  setShowExplanationModal,
  setUploadedFiles,
  setActiveFileId,
  setImportedFileName,
  analyzeCode,
  setCodeAnalysis,
  setPreviewMode,
  setShowAnalysisPanel,
  interactionMode,
  provider,
  model,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs text-gray-300">1</span>
            INPUT SOURCE
          </h2>
          <p className="text-xs text-gray-500 ml-8">Paste code or drag & drop file</p>
        </div>
        <div className="flex items-center gap-2 relative group">
          <button 
            onClick={triggerFileUpload}
            className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-sm border border-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import File
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={onFileUpload}
            accept=".html,.htm,.jsx,.tsx,.js,.ts,.css,.scss,.3js,.json"
            multiple
          />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-black text-xs text-gray-300 rounded shadow-xl z-20 pointer-events-none border border-gray-700">
            Supported: .html, .jsx, .tsx, .js, .3js, .json
          </div>
        </div>
      </div>

      <div 
        className={`relative group transition-all duration-200 ${isDragging ? 'scale-[1.01] ring-2 ring-blue-500' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {uploadedFiles.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-blue-900/20 text-blue-300 text-xs px-3 py-1 rounded-t border-b border-blue-500/20 flex justify-between items-center z-10">
            <span className="font-mono flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
            </span>
            <button 
              onClick={() => { 
                setUploadedFiles([]); 
                setActiveFileId(null);
                setImportedFileName(null); 
                setHtmlInput(''); 
              }}
              className="hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        {!uploadedFiles.length && importedFileName && (
          <div className="absolute top-0 left-0 right-0 bg-blue-900/20 text-blue-300 text-xs px-3 py-1 rounded-t border-b border-blue-500/20 flex justify-between items-center z-10">
            <span className="font-mono flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              File: {importedFileName}
            </span>
            <button 
              onClick={() => { setImportedFileName(null); setHtmlInput(''); }}
              className="hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        {extractedCode?.explanation && (
          <button
            onClick={() => setShowExplanationModal(true)}
            className="absolute top-2 right-2 z-10 p-1.5 hover:bg-gray-700 text-gray-400 hover:text-blue-400 rounded transition-colors"
            title="How It Works"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
        <textarea
          className={`w-full h-[300px] min-h-[200px] p-3 ${importedFileName || uploadedFiles.length > 0 ? 'pt-7' : ''} ${extractedCode?.explanation ? 'pr-9' : ''} bg-gray-800 text-gray-100 font-mono text-sm rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y shadow-inner`}
          placeholder="// Paste your HTML, JSX, Three.js script, or JSON data here..."
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          spellCheck={false}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center z-10 pointer-events-none">
            <div className="text-blue-200 font-bold text-xl">Drop file to import</div>
          </div>
        )}
      </div>

      {/* AI Model/Provider Pill - Above buttons */}
      {interactionMode && (
        <div className="flex justify-end">
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide border border-blue-600/50 bg-blue-900/30 text-blue-200 max-w-[260px] truncate"
            title={`${formatProviderLabel(provider)} · ${formatModelLabel(provider, model) || model || 'default'} · ${formatModeLabel(interactionMode)} mode`}
          >
            {formatProviderLabel(provider)}
            {model ? ` · ${formatModelLabel(provider, model)}` : ''}
            {` · ${formatModeLabel(interactionMode)}`}
          </span>
        </div>
      )}

      <div className="flex gap-2 relative z-10">
        <button
          onClick={triggerFileUpload}
          className="px-3 py-2 rounded-lg font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Import
        </button>

        <button
          onClick={onPreviewClick}
          disabled={!htmlInput.trim()}
          className={`px-3 py-2 rounded-lg font-semibold text-white shadow-md transform transition-all duration-200 flex items-center gap-2
            ${!htmlInput.trim()
              ? 'bg-gray-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-purple-500/25'
            }`}
          title="Analyze and preview the code automatically"
        >
          Preview
        </button>

        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={onProcessClick}
            disabled={isLoading || (!htmlInput.trim() && uploadedFiles.length === 0)}
            className={`flex-1 py-2 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 flex justify-center items-center gap-2
              ${isLoading || (!htmlInput.trim() && uploadedFiles.length === 0)
                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-blue-500/25'
              }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-5 h-5 mr-2" />
                Analyzing...
              </>
            ) : (
              'Extract Component'
            )}
          </button>
          {isLoading && (
            <button
              onClick={handleCancelExtraction}
              className="px-3 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-700 transition-colors flex items-center gap-2"
              title="Stop extraction"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop
            </button>
          )}
        </div>
        <button
          onClick={onClearClick}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-colors relative z-10"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-start animate-in fade-in slide-in-from-top-2">
          <svg className="w-4 h-4 mr-2 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Code Analysis Panel */}
      {showAnalysisPanel && codeAnalysis && (
        <CodeAnalysisPanel
          analysis={codeAnalysis}
          onPreviewAsIs={onPreviewAsIs}
          onWrapAndPreview={onWrapAndPreview}
          onExtract={onExtractFromAnalysis}
          onClose={onCloseAnalysisPanel}
          uploadedFilesCount={uploadedFiles.length}
        />
      )}

      {/* Example Code Buttons */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-2 w-1/2 max-w-md">
        <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
          <span>💡</span>
          Example Code
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {EXAMPLE_CODES.map((example) => {
            const colorClasses: Record<string, string> = {
              red: 'bg-red-600/30 hover:bg-red-600/40 border-red-500/50 text-red-200',
              blue: 'bg-blue-600/30 hover:bg-blue-600/40 border-blue-500/50 text-blue-200',
              purple: 'bg-purple-600/30 hover:bg-purple-600/40 border-purple-500/50 text-purple-200',
              green: 'bg-green-600/30 hover:bg-green-600/40 border-green-500/50 text-green-200',
              yellow: 'bg-yellow-600/30 hover:bg-yellow-600/40 border-yellow-500/50 text-yellow-200',
              pink: 'bg-pink-600/30 hover:bg-pink-600/40 border-pink-500/50 text-pink-200',
              cyan: 'bg-cyan-600/30 hover:bg-cyan-600/40 border-cyan-500/50 text-cyan-200',
              indigo: 'bg-indigo-600/30 hover:bg-indigo-600/40 border-indigo-500/50 text-indigo-200',
              orange: 'bg-orange-600/30 hover:bg-orange-600/40 border-orange-500/50 text-orange-200',
              teal: 'bg-teal-600/30 hover:bg-teal-600/40 border-teal-500/50 text-teal-200',
            };
            const colorClass = colorClasses[example.color] || 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300';
            
            return (
              <button
                key={example.name}
                onClick={() => {
                  // Load example into input and clear file-related state via parent handler
                  onExampleClick(example.code);
                  // Analysis and preview will happen automatically when user clicks Preview
                  // Just analyze and store for reference
                  const analysis = analyzeCode(example.code);
                  setCodeAnalysis(analysis);
                  setShowAnalysisPanel(false); // Don't show panel - user can click Preview to see it
                }}
                className={`px-1.5 py-1 text-[9px] text-center border rounded transition-colors ${colorClass}`}
                title={example.description}
              >
                <div className="font-semibold truncate">{example.name}</div>
                <div className="opacity-70 text-[8px] mt-0.5 truncate">{example.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Console Panel - Always rendered */}
      <ConsolePanel 
        logs={previewLogs} 
        onClear={onClearLogs}
        className=""
      />

      {/* Explanation Modal */}
      {showExplanationModal && extractedCode?.explanation && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowExplanationModal(false)}
          />
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-gray-800 rounded-lg border border-gray-700 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </h3>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="overflow-y-auto px-4 py-4 flex-1">
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <div dangerouslySetInnerHTML={{ 
                  __html: extractedCode.explanation
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }} />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Export Guide</p>
                <div className="text-sm text-gray-300 bg-blue-900/10 border border-blue-500/20 p-3 rounded flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div dangerouslySetInnerHTML={{ __html: getExportRecommendation().replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300">$1</strong>') }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InputPane;

