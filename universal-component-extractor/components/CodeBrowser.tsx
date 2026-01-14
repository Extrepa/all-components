import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UploadedFile } from '../types';
import { getSyntaxLanguage, getFileTypeInfo } from '../utils/fileTypeDetector';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface CodeBrowserProps {
  files: UploadedFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  extractedCode?: {
    html?: string;
    css?: string;
    scss?: string;
    tsx?: string;
    vanillaJs?: string;
  };
  showDiff?: boolean;
  className?: string;
}

const CodeBrowser: React.FC<CodeBrowserProps> = ({
  files,
  activeFileId,
  onFileSelect,
  extractedCode,
  showDiff = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeFile = useMemo(() => {
    return files.find(f => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  const fileInfo = activeFile ? getFileTypeInfo(activeFile.type) : null;
  const syntaxLang = activeFile ? getSyntaxLanguage(activeFile.type) : 'text';

  // Get corresponding extracted code if available
  const getExtractedCode = () => {
    if (!activeFile || !extractedCode) return null;
    
    switch (activeFile.type) {
      case 'html':
        return extractedCode.html;
      case 'css':
        return extractedCode.css;
      case 'scss':
        return extractedCode.scss;
      case 'tsx':
        return extractedCode.tsx;
      case 'js':
      case 'jsx':
      case '3js':
        return extractedCode.vanillaJs;
      default:
        return null;
    }
  };

  const extractedCodeContent = getExtractedCode();
  const hasExtractedVersion = extractedCodeContent && extractedCodeContent.trim().length > 0;

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: fileInfo?.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Highlight search matches
  const highlightMatches = (code: string, query: string) => {
    if (!query.trim()) return code;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return code.replace(regex, '<mark class="bg-yellow-500/30">$1</mark>');
  };

  if (files.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-8 text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-400">No files to browse</p>
        <p className="text-sm text-gray-500 mt-2">Upload files to view them here</p>
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-4 ${className}`}>
        <p className="text-gray-400">Select a file to view</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-full ${className}`} role="region" aria-label="Code browser">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-700/50 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg">{fileInfo?.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-300 truncate">{activeFile.name}</h3>
            <p className="text-xs text-gray-500">{fileInfo?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-32"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            onClick={handleDownload}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors px-2 py-1"
            title="Download file"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors px-2 py-1"
            title="Copy code"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto relative">
        <SyntaxHighlighter
          language={syntaxLang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1f2937',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
          showLineNumbers
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6b7280',
            userSelect: 'none',
          }}
        >
          {activeFile.content}
        </SyntaxHighlighter>
        
        {/* Search highlight overlay */}
        {searchQuery && (
          <div
            className="absolute inset-0 pointer-events-none"
            dangerouslySetInnerHTML={{
              __html: highlightMatches(activeFile.content, searchQuery),
            }}
            style={{ display: 'none' }} // Hidden, used for search highlighting logic
          />
        )}
      </div>

      {/* Footer with file info */}
      <div className="px-4 py-2 bg-gray-700/30 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span>Lines: {activeFile.content.split('\n').length}</span>
          <span>Size: {(activeFile.size / 1024).toFixed(2)} KB</span>
          <span>Type: {fileInfo?.description}</span>
        </div>
        {hasExtractedVersion && (
          <button
            onClick={() => {
              // Toggle diff view - would need to implement diff component
              console.log('Diff view not yet implemented');
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Compare with extracted version
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeBrowser;

