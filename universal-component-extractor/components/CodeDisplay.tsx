import React, { useState, useCallback, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface CodeDisplayProps {
  language: string;
  code: string;
  onDownload: () => void;
  onChange?: (newCode: string) => void;
  className?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ language, code, onDownload, onChange, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Map language names to syntax highlighter languages
  const syntaxLang = useMemo(() => {
    const langMap: Record<string, string> = {
      'HTML': 'html',
      'CSS': 'css',
      'SCSS': 'scss',
      'TSX': 'tsx',
      'JS': 'javascript',
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
    };
    return langMap[language] || language.toLowerCase();
  }, [language]);

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className={`bg-gray-800 border-gray-700 flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 border-b border-gray-700 shrink-0">
        <span className="text-sm font-semibold text-gray-400 uppercase">{language}</span>
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-gray-900 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-24"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Edit/View Toggle */}
          {onChange && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                isEditing 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-gray-200'
              }`}
              title={isEditing ? 'View mode' : 'Edit mode'}
            >
              {isEditing ? '👁️' : '✏️'}
            </button>
          )}
          
          <button
            onClick={onDownload}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 px-2 py-1"
            disabled={!code}
            aria-label={`Download ${language} file`}
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 px-2 py-1"
            disabled={!code}
            aria-label={`Copy ${language} code`}
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-auto">
        {isEditing && onChange ? (
          <textarea
            value={code || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full bg-gray-800 p-4 text-sm font-mono leading-relaxed text-gray-300 resize-none focus:outline-none focus:ring-0 border-none selection:bg-blue-500/30"
            spellCheck={false}
            placeholder={`// Edit ${language} code here...`}
          />
        ) : (
          <div className="relative">
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
              {code || ''}
            </SyntaxHighlighter>
            
            {/* Search highlight overlay would go here if needed */}
            {searchQuery && code.includes(searchQuery) && (
              <div className="absolute top-2 right-2 bg-yellow-900/50 text-yellow-300 text-xs px-2 py-1 rounded">
                Found: {code.split(searchQuery).length - 1} match(es)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeDisplay;