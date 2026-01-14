import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { getFileTypeInfo, groupFilesByCategory } from '../utils/fileTypeDetector';

interface FileTreeProps {
  files: UploadedFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileRemove: (fileId: string) => void;
  className?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ 
  files, 
  activeFileId, 
  onFileSelect, 
  onFileRemove,
  className = '' 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['markup', 'stylesheet', 'script', 'data'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const groups = groupFilesByCategory(files);

  const categoryLabels: Record<string, string> = {
    markup: 'Markup Files',
    stylesheet: 'Stylesheets',
    script: 'Scripts',
    data: 'Data Files',
    unknown: 'Other Files',
  };

  const categoryIcons: Record<string, string> = {
    markup: '📄',
    stylesheet: '🎨',
    script: '📜',
    data: '📋',
    unknown: '📁',
  };

  if (files.length === 0) {
    return (
      <div className={`p-4 text-gray-500 text-sm ${className}`}>
        No files uploaded
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div className="p-3 bg-gray-900 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Files ({files.length})
        </h3>
      </div>
      
      <div className="overflow-y-auto max-h-[600px]">
        {Object.entries(groups).map(([category, categoryFiles]) => {
          if (categoryFiles.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="border-b border-gray-700 last:border-b-0">
              <button
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                aria-controls={`category-${category}`}
                className="w-full px-3 py-2 text-left text-xs font-medium text-gray-400 hover:bg-gray-700/50 flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{categoryIcons[category]}</span>
                  <span>{categoryLabels[category]}</span>
                  <span className="text-gray-600">({categoryFiles.length})</span>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {isExpanded && (
                <div id={`category-${category}`} className="bg-gray-800/50" role="group">
                  {categoryFiles.map((fileInfo) => {
                    const file = files.find(f => f.name === fileInfo.name);
                    if (!file) return null;
                    
                    const info = getFileTypeInfo(file.type);
                    const isActive = file.id === activeFileId;
                    
                    return (
                      <div
                        key={file.id}
                        className={`px-3 py-2 flex items-center justify-between group hover:bg-gray-700/30 transition-colors ${
                          isActive ? 'bg-blue-900/30 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <button
                          onClick={() => onFileSelect(file.id)}
                          aria-selected={isActive}
                          role="treeitem"
                          className="flex-1 flex items-center gap-2 text-left text-sm text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          <span className="text-base">{info.icon}</span>
                          <span className="truncate flex-1" title={file.name}>
                            {file.name}
                          </span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileRemove(file.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300 transition-all"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTree;

