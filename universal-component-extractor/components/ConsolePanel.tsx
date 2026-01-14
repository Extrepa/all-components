import React, { useState, useRef, useEffect } from 'react';

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'system';
  message: string;
  timestamp: number;
  stack?: string;
}

interface ConsolePanelProps {
  logs: LogEntry[];
  onClear: () => void;
  onDownload?: (logs: LogEntry[]) => void;
  className?: string;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs, onClear, onDownload, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'system'>('all');
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);
 
   const errorCount = logs.filter(l => l.level === 'error').length;
   const warnCount = logs.filter(l => l.level === 'warn').length;
   const totalCount = logs.length;

  const toggleErrorExpansion = (index: number) => {
    setExpandedErrors(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const copyLog = (log: LogEntry) => {
    const text = log.stack ? `${log.message}\n\n${log.stack}` : log.message;
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(logs);
    } else {
      // Default download behavior
      const formatLog = (log: LogEntry) => {
        const date = new Date(log.timestamp).toLocaleString();
        const level = log.level.toUpperCase().padEnd(7);
        let text = `[${date}] ${level} ${log.message}`;
        if (log.stack) {
          text += `\n${log.stack}`;
        }
        return text;
      };

      const logText = logs.map(formatLog).join('\n\n');
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `console-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'system':
        return '🔧';
      default:
        return '📝';
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'system':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLogBgColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'warn':
        return 'bg-yellow-900/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30';
      case 'system':
        return 'bg-gray-800/50 border-gray-600/30';
      default:
        return 'bg-gray-800/30 border-gray-700/30';
    }
  };

  return (
    <div className={`bg-gray-900 border-t border-gray-700 ${className}`} role="region" aria-label="Console">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="console-logs"
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Console</span>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 bg-gray-800/80 text-gray-300 text-xs rounded-full border border-gray-600/70">
                {totalCount}
              </span>
            )}
            {errorCount > 0 && (
              <span className="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded-full">
                {errorCount}
              </span>
            )}
            {warnCount > 0 && errorCount === 0 && (
              <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-300 text-xs rounded-full">
                {warnCount}
              </span>
            )}
          </button>
          
          {isExpanded && (
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'info', 'warn', 'error', 'system'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-2 py-1 rounded transition-colors ${
                    filter === level
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }`}
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
              title="Download console logs"
              disabled={logs.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button
              onClick={onClear}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
              title="Clear console"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Logs */}
      {isExpanded && (
        <div
          id="console-logs"
          ref={scrollRef}
          className="h-48 overflow-y-auto p-2 space-y-1 font-mono text-xs"
          role="log"
          aria-live="polite"
          aria-label="Console output"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {filter === 'all' 
                ? 'No logs yet. Preview output will appear here.' 
                : `No ${filter} logs`}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isExpanded = expandedErrors.has(index);
              const hasStack = log.stack && log.stack.trim().length > 0;
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded border ${getLogBgColor(log.level)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{getLogIcon(log.level)}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`${getLogColor(log.level)} break-words flex items-center gap-2`}>
                        <span className="break-words">{log.message}</span>
                        {log.level === 'error' && log.message.startsWith('Runtime Error:') && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-900/60 text-red-200 text-[10px] uppercase tracking-wide">
                            Runtime
                          </span>
                        )}
                      </div>
                      {hasStack && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleErrorExpansion(index)}
                            className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
                          >
                            <svg
                              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Stack trace
                          </button>
                          {isExpanded && (
                            <pre className="mt-1 text-xs text-gray-500 bg-gray-900/50 p-2 rounded overflow-x-auto">
                              {log.stack}
                            </pre>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyLog(log)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-all flex-shrink-0"
                      title="Copy log"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ConsolePanel;

