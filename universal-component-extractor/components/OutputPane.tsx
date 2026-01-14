import React, { useState, useEffect, useMemo } from 'react';
import CodeDisplay from './CodeDisplay';
import PreviewDisplay, { PreviewRef } from './PreviewDisplay';
import CodeBrowser from './CodeBrowser';
import AnalysisTab from './AnalysisTab';
import CodeAnnotations from './CodeAnnotations';
import DiffView from './DiffView';
import { ZipIcon, JsonIcon, HtmlIcon, CubeIcon, FileCodeIcon, FileJsIcon } from './icons';
import { ExtractedCode, UploadedFile } from '../types';
import { LogEntry } from './ConsolePanel';

interface OutputPaneProps {
  extractedCode: ExtractedCode | null;
  extractionHistory: ExtractedCode[];
  previewMode: 'vanilla' | 'react' | 'browser' | 'canvas';
  setPreviewMode: (mode: 'vanilla' | 'react' | 'browser' | 'canvas') => void;
  componentName: string;
  setComponentName: (name: string) => void;
  mainTab: 'codebrowser' | 'extracted' | 'analysis' | 'diff';
  setMainTab: (tab: 'codebrowser' | 'extracted' | 'analysis' | 'diff') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  previewLogs: LogEntry[];
  uploadedFiles: UploadedFile[];
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  previewRef: React.RefObject<PreviewRef>;
  // Download handlers
  onDownloadZip: () => void;
  onDownloadSingleHtml: () => void;
  onDownloadJson: () => void;
  onDownloadText: (content: string, filename: string, mimeType: string) => void;
  onDownloadReactPresetZip: () => void;
  onDownloadVanillaPresetZip: () => void;
  onDownloadViteReactPresetZip: () => void;
  onDownloadNextJsPresetZip: () => void;
  onCodeUpdate: (key: keyof ExtractedCode, value: string) => void;
  onSceneExport: (json: string) => void;
  onLogsChange: (logs: LogEntry[]) => void;
  getSafeName: () => string;
}

const OutputPane: React.FC<OutputPaneProps> = ({
  extractedCode,
  extractionHistory,
  previewMode,
  setPreviewMode,
  componentName,
  setComponentName,
  mainTab,
  setMainTab,
  activeTab,
  setActiveTab,
  previewLogs,
  uploadedFiles,
  activeFileId,
  setActiveFileId,
  previewRef,
  onDownloadZip,
  onDownloadSingleHtml,
  onDownloadJson,
  onDownloadText,
  onDownloadReactPresetZip,
  onDownloadVanillaPresetZip,
  onDownloadViteReactPresetZip,
  onDownloadNextJsPresetZip,
  onCodeUpdate,
  onSceneExport,
  onLogsChange,
  getSafeName,
}) => {
  const [selectedRunIndex, setSelectedRunIndex] = useState<number | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [libraryImportStatus, setLibraryImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');

  const currentExtraction = useMemo<ExtractedCode | null>(() => {
    if (selectedRunIndex === null) {
      return extractedCode;
    }
    return extractionHistory[selectedRunIndex] ?? null;
  }, [selectedRunIndex, extractedCode, extractionHistory]);

  async function handleAddToComponentLibrary() {
    if (!currentExtraction) return;

    setLibraryImportStatus('importing');

    try {
      // Create a complete HTML file from the extracted code
      const completeHtml = currentExtraction.isCompleteHtml
        ? currentExtraction.html
        : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName}</title>
    <style>${currentExtraction.css || ''}</style>
</head>
<body>
    ${currentExtraction.html}
    <script>${currentExtraction.vanillaJs || ''}</script>
</body>
</html>`;

      // Save to exported_components directory
      const componentLibraryPath = '/Users/extrepa/Documents/ErrlVault/_Resources/Component-Library/tools';
      const exportedComponentsPath = '/Users/extrepa/Projects/universal-component-extractor/exported_components';
      
      // Create exported_components directory if it doesn't exist
      // Note: In a browser environment, we'd need to use Electron IPC or a backend API
      // For now, we'll show a message and save to localStorage as a fallback
      
      // Try to use the Component Library import API if available
      const response = await fetch('http://localhost:8080/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: componentName || getSafeName(),
          html: completeHtml,
          css: currentExtraction.css,
          js: currentExtraction.vanillaJs,
          description: currentExtraction.explanation || `Component extracted from Universal Component Extractor`,
        }),
      });

      if (response.ok) {
        setLibraryImportStatus('success');
        setTimeout(() => setLibraryImportStatus('idle'), 3000);
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Error adding to component library:', error);
      setLibraryImportStatus('error');
      
      // Fallback: Show instructions
      alert(`To add this component to the Component Library:
      
1. Save the component HTML to:
   ${exportedComponentsPath}/${getSafeName()}.html

2. The file watcher will automatically import it, or run:
   cd ${componentLibraryPath} && node extractor-integration.js
      
Component code has been copied to clipboard.`);
      
      // Copy component code to clipboard as fallback
      const componentCode = currentExtraction.isCompleteHtml 
        ? currentExtraction.html 
        : `${currentExtraction.html}\n<style>${currentExtraction.css}</style>\n<script>${currentExtraction.vanillaJs}</script>`;
      navigator.clipboard.writeText(componentCode);
      
      setTimeout(() => setLibraryImportStatus('idle'), 5000);
    }
  }

  // Reset run selection when a new extraction result arrives
  useEffect(() => {
    setSelectedRunIndex(null);
  }, [extractedCode]);

  // Keep file selection in sync with the currently selected extraction
  useEffect(() => {
    if (currentExtraction?.originalFiles && currentExtraction.originalFiles.length > 0) {
      setSelectedFileName(prev => {
        if (prev && currentExtraction.originalFiles.some(f => f.name === prev)) {
          return prev;
        }
        return currentExtraction.originalFiles[0].name;
      });
    } else {
      setSelectedFileName(null);
    }
  }, [currentExtraction]);

  return (
    <div className="flex flex-col gap-4">
      {/* Extracted Code Tabs */}
      {(extractedCode || uploadedFiles.length > 0) && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex justify-between items-end px-4 pt-4 pb-2">
            <div className="flex flex-col justify-center h-full">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs text-white">1</span>
                {uploadedFiles.length > 0 ? 'UPLOADED FILES' : 'EXTRACTED OUTPUT'}
              </h2>
              <p className="text-xs text-gray-500 ml-8">
                {uploadedFiles.length > 0 ? 'Browse, Preview, Extract' : 'Code, Analysis, Export'}
              </p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex border-b border-gray-700 overflow-x-auto px-4">
            {uploadedFiles.length > 0 && (
              <button
                onClick={() => setMainTab('codebrowser')}
                role="tab"
                aria-selected={mainTab === 'codebrowser'}
                aria-controls="codebrowser-panel"
                id="codebrowser-tab"
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  mainTab === 'codebrowser'
                    ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                }`}
              >
                📂 Code Browser
              </button>
            )}
            {extractedCode && (
              <>
                <button
                  onClick={() => setMainTab('extracted')}
                  role="tab"
                  aria-selected={mainTab === 'extracted'}
                  aria-controls="extracted-panel"
                  id="extracted-tab"
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    mainTab === 'extracted'
                      ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }`}
                >
                  💻 Extracted Code
                </button>
                <button
                  onClick={() => setMainTab('analysis')}
                  role="tab"
                  aria-selected={mainTab === 'analysis'}
                  aria-controls="analysis-panel"
                  id="analysis-tab"
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    mainTab === 'analysis'
                      ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }`}
                >
                  📊 Analysis
                </button>
                <button
                  onClick={() => setMainTab('diff')}
                  role="tab"
                  aria-selected={mainTab === 'diff'}
                  aria-controls="diff-panel"
                  id="diff-tab"
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    mainTab === 'diff'
                      ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }`}
                >
                  🧬 Diff
                </button>
              </>
            )}
          </div>

          {/* Tab Panels */}
          <div className="p-4">
            {mainTab === 'codebrowser' && uploadedFiles.length > 0 && (
              <div id="codebrowser-panel" role="tabpanel" aria-labelledby="codebrowser-tab" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CodeBrowser files={uploadedFiles} activeFileId={activeFileId} onFileSelect={setActiveFileId} />
              </div>
            )}

            {mainTab === 'extracted' && extractedCode && (
              <div id="extracted-panel" role="tabpanel" aria-labelledby="extracted-tab" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Preview Section - Inline in extracted code tab */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs text-white">🎨</span>
                      Live Preview
                      {previewLogs.some(log => log.level === 'error') && (
                        <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-full">
                          Error
                        </span>
                      )}
                    </h2>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 flex items-center gap-4 shadow-sm">
                    <label className="text-sm text-gray-400 font-medium whitespace-nowrap">Component Name</label>
                    <input 
                      type="text" 
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono w-full transition-all"
                      placeholder="MyComponent"
                    />
                  </div>

                  <div className="flex justify-end mb-2">
                    <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 inline-flex">
                      <button
                        onClick={() => setPreviewMode('browser')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          previewMode === 'browser' 
                            ? 'bg-green-600 text-white shadow' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                        title="Browser preview for HTML-only content"
                      >
                        Browser
                      </button>
                      <button
                        onClick={() => setPreviewMode('vanilla')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          previewMode === 'vanilla' 
                            ? 'bg-gray-600 text-white shadow' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Vanilla JS
                      </button>
                      <button
                        onClick={() => setPreviewMode('react')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          previewMode === 'react' 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        React Preview
                      </button>
                      <button
                        onClick={() => setPreviewMode('canvas')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          previewMode === 'canvas' 
                            ? 'bg-purple-600 text-white shadow' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                        title="Optimized for Three.js and p5.js sketches"
                      >
                        Canvas
                      </button>
                    </div>
                  </div>

                  <PreviewDisplay 
                    ref={previewRef}
                    html={extractedCode.html} 
                    css={extractedCode.css} 
                    vanillaJs={extractedCode.vanillaJs}
                    tsx={extractedCode.tsx}
                    componentName={componentName}
                    previewMode={previewMode}
                    isCompleteHtml={extractedCode.isCompleteHtml}
                    onSceneExport={onSceneExport}
                    onLogsChange={onLogsChange}
                  />
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={onDownloadZip}
                    className="col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                  >
                    <ZipIcon className="w-4 h-4" />
                    Full .zip
                  </button>
                  <button
                    onClick={onDownloadSingleHtml}
                    className="col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-700 hover:bg-orange-600 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                  >
                    <HtmlIcon className="w-4 h-4" />
                    Single .html
                  </button>
                  <button
                    onClick={() => previewRef.current?.triggerSceneExport()}
                    className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs font-medium rounded transition-colors shadow-sm border border-purple-700/50 ${previewMode === 'react' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={previewMode === 'react' ? "Switch to Vanilla JS preview for 3D scene export" : "Export Three.js Scene object as JSON"}
                    disabled={previewMode === 'react'}
                  >
                    <CubeIcon className="w-4 h-4" />
                    Export 3D Scene
                  </button>
                  <button
                    onClick={() => onDownloadText(extractedCode.tsx, `${getSafeName()}.tsx`, 'text/typescript-jsx')}
                    className="col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-700/40 hover:bg-blue-600/40 text-blue-200 text-xs font-medium rounded transition-colors shadow-sm border border-blue-600/30"
                  >
                    <FileCodeIcon className="w-4 h-4" />
                    Download .tsx
                  </button>
                  <button
                    onClick={() => onDownloadText(extractedCode.vanillaJs, `${getSafeName()}.js`, 'text/javascript')}
                    className="col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-700/40 hover:bg-yellow-600/40 text-yellow-200 text-xs font-medium rounded transition-colors shadow-sm border border-yellow-600/30"
                  >
                    <FileJsIcon className="w-4 h-4" />
                    Download .js
                  </button>
                  <button
                    onClick={onDownloadJson}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium rounded transition-colors shadow-sm border border-gray-600"
                  >
                    <JsonIcon className="w-4 h-4" />
                    Data .json
                  </button>
                  <button
                    onClick={handleAddToComponentLibrary}
                    disabled={libraryImportStatus === 'importing'}
                    className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white text-xs font-semibold rounded transition-colors shadow-sm border ${
                      libraryImportStatus === 'importing'
                        ? 'bg-cyan-800 cursor-not-allowed border-cyan-700'
                        : libraryImportStatus === 'success'
                        ? 'bg-green-600 border-green-500'
                        : libraryImportStatus === 'error'
                        ? 'bg-red-600 border-red-500'
                        : 'bg-cyan-700 hover:bg-cyan-600 border-cyan-600'
                    }`}
                    title="Add this component to the Component Library"
                  >
                    {libraryImportStatus === 'importing' ? '⏳ Importing...' : 
                     libraryImportStatus === 'success' ? '✅ Added!' :
                     libraryImportStatus === 'error' ? '❌ Error' :
                     '📚 Add to Library'}
                  </button>
                </div>

                {/* Presets */}
                <div className="mb-6 mt-1 flex flex-col gap-1 text-[11px] text-gray-400">
                  <span className="uppercase tracking-wide text-[10px] text-gray-500">Export presets</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={onDownloadReactPresetZip}
                      className="px-3 py-1.5 rounded border border-blue-600/60 bg-blue-900/30 text-blue-100 text-[11px] hover:bg-blue-800/40 transition-colors"
                    >
                      React component (.tsx + .css)
                    </button>
                    <button
                      onClick={onDownloadVanillaPresetZip}
                      className="px-3 py-1.5 rounded border border-amber-600/60 bg-amber-900/30 text-amber-100 text-[11px] hover:bg-amber-800/40 transition-colors"
                    >
                      Vanilla widget (index.html + .js + .css)
                    </button>
                    <button
                      onClick={onDownloadViteReactPresetZip}
                      className="px-3 py-1.5 rounded border border-emerald-600/60 bg-emerald-900/30 text-emerald-100 text-[11px] hover:bg-emerald-800/40 transition-colors"
                    >
                      Vite React preset (src/components)
                    </button>
                    <button
                      onClick={onDownloadNextJsPresetZip}
                      className="px-3 py-1.5 rounded border border-sky-600/60 bg-sky-900/30 text-sky-100 text-[11px] hover:bg-sky-800/40 transition-colors"
                    >
                      Next.js preset (components/)
                    </button>
                  </div>
                </div>

                {/* Code Tabs */}
                <div className="border-b border-gray-700 flex gap-1 mb-0">
                  {['HTML', 'CSS', 'SCSS', 'TSX', 'JS'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                          : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                      } rounded-t-lg`}
                    >
                      {tab}
                      {/* Indicator for preview source */}
                      {((previewMode === 'react' && tab === 'TSX') || ((previewMode === 'vanilla' || previewMode === 'canvas') && tab === 'JS')) && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-sm animate-pulse"></span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-900 border-l border-r border-b border-gray-700 rounded-b-lg h-[600px] flex flex-col overflow-hidden">
                  {activeTab === 'HTML' && (
                    <CodeDisplay language="HTML" code={extractedCode.html} onChange={(val) => onCodeUpdate('html', val)} onDownload={() => onDownloadText(extractedCode.html, `${getSafeName()}.html`, 'text/html')} />
                  )}
                  {activeTab === 'CSS' && (
                    <CodeDisplay language="CSS" code={extractedCode.css} onChange={(val) => onCodeUpdate('css', val)} onDownload={() => onDownloadText(extractedCode.css, `${getSafeName()}.css`, 'text/css')} />
                  )}
                  {activeTab === 'SCSS' && <CodeDisplay language="SCSS" code={extractedCode.scss} onChange={(val) => onCodeUpdate('scss', val)} onDownload={() => onDownloadText(extractedCode.scss, `${getSafeName()}.scss`, 'text/x-scss')} />}
                  {activeTab === 'TSX' && (
                    <CodeDisplay language="TSX" code={extractedCode.tsx} onChange={(val) => onCodeUpdate('tsx', val)} onDownload={() => onDownloadText(extractedCode.tsx, `${getSafeName()}.tsx`, 'text/typescript-jsx')} />
                  )}
                  {activeTab === 'JS' && (
                    <CodeDisplay language="JS" code={extractedCode.vanillaJs} onChange={(val) => onCodeUpdate('vanillaJs', val)} onDownload={() => onDownloadText(extractedCode.vanillaJs, `${getSafeName()}.js`, 'text/javascript')} />
                  )}
                </div>

                {/* Code Annotations Section - Below the code display */}
                {extractedCode.editableSections && (
                  <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      Code Annotations
                    </h3>
                    {activeTab === 'HTML' && (
                      <CodeAnnotations code={extractedCode.html} editableSections={extractedCode.editableSections} />
                    )}
                    {activeTab === 'CSS' && (
                      <CodeAnnotations code={extractedCode.css} editableSections={extractedCode.editableSections} />
                    )}
                    {activeTab === 'TSX' && (
                      <CodeAnnotations code={extractedCode.tsx} editableSections={extractedCode.editableSections} />
                    )}
                    {activeTab === 'JS' && (
                      <CodeAnnotations code={extractedCode.vanillaJs} editableSections={extractedCode.editableSections} />
                    )}
                  </div>
                )}
              </div>
            )}

            {mainTab === 'analysis' && extractedCode && (
              <div id="analysis-panel" role="tabpanel" aria-labelledby="analysis-tab" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AnalysisTab extractedCode={extractedCode} />
              </div>
            )}

            {mainTab === 'diff' && (extractedCode || extractionHistory.length > 0) && (
              <div
                id="diff-panel"
                role="tabpanel"
                aria-labelledby="diff-tab"
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px] flex flex-col gap-3"
              >
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide text-[10px] text-gray-500">Run</span>
                    <select
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
                      value={selectedRunIndex === null ? 'current' : String(selectedRunIndex)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRunIndex(value === 'current' ? null : Number(value));
                      }}
                    >
                      <option value="current">Current extraction</option>
                      {extractionHistory.map((item, idx) => {
                        const parts: string[] = [];
                        if (item.componentName) parts.push(item.componentName);
                        if (item.framework) parts.push(item.framework);
                        const label = parts.length ? parts.join(' · ') : `Run ${idx + 1}`;
                        const displayIndex = extractionHistory.length - idx;
                        return (
                          <option key={idx} value={idx}>{`Previous #${displayIndex}: ${label}`}</option>
                        );
                      })}
                    </select>
                  </div>

                  {currentExtraction?.originalFiles && currentExtraction.originalFiles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-wide text-[10px] text-gray-500">File</span>
                      <select
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 max-w-[240px]"
                        value={selectedFileName ?? ''}
                        onChange={(e) => setSelectedFileName(e.target.value || null)}
                      >
                        {currentExtraction.originalFiles.map((file) => (
                          <option key={file.id} value={file.name}>
                            {file.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0">
                  {(() => {
                    if (!currentExtraction) {
                      return (
                        <div className="h-full flex items-center justify-center text-sm text-gray-400">
                          No diff available yet. Run an extraction to compare changes.
                        </div>
                      );
                    }

                    let originalText: string | undefined;
                    let originalLabel = 'Original Source';

                    if (currentExtraction.originalFiles && currentExtraction.originalFiles.length > 0 && selectedFileName) {
                      const file = currentExtraction.originalFiles.find((f) => f.name === selectedFileName);
                      originalText = file?.content;
                      if (file) {
                        originalLabel = `Original: ${file.name}`;
                      }
                    } else {
                      originalText = currentExtraction.originalSource;
                    }

                    const transformedText =
                      currentExtraction.tsx ||
                      currentExtraction.html ||
                      currentExtraction.vanillaJs ||
                      '';

                    let transformedLabel = 'Transformed';
                    if (currentExtraction.tsx) transformedLabel = 'Extracted TSX';
                    else if (currentExtraction.html) transformedLabel = 'Extracted HTML';
                    else if (currentExtraction.vanillaJs) transformedLabel = 'Extracted JS';

                    return (
                      <DiffView
                        original={originalText}
                        transformed={transformedText}
                        originalLabel={originalLabel}
                        transformedLabel={transformedLabel}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPane;

