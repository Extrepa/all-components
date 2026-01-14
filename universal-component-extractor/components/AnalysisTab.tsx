import React, { useState } from 'react';
import { ExtractedCode } from '../types';

interface AnalysisTabProps {
  extractedCode: ExtractedCode | null;
  className?: string;
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({ extractedCode, className = '' }) => {
  const [activeSection, setActiveSection] = useState<string>('build');

  if (!extractedCode) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-8 text-center ${className}`}>
        <p className="text-gray-400">Extract a component to see analysis</p>
      </div>
    );
  }

  const sections = [
    { id: 'build', label: 'Build Approach', icon: '🔧' },
    { id: 'simplification', label: 'Code Simplification', icon: '✨' },
    { id: 'active', label: 'Active Code', icon: '⚡' },
    { id: 'how', label: 'How It Works', icon: '📖' },
    { id: 'editable', label: 'Editable Sections', icon: '✏️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'build':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Build Approach</h3>
            {extractedCode.buildApproach ? (
              <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: extractedCode.buildApproach
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <div className="text-gray-400">
                <p>Build approach analysis will appear here after extraction.</p>
                <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Recommended Build Tools:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                    <li><strong className="text-white">Vite</strong> - Fast, modern build tool (recommended for React/TypeScript)</li>
                    <li><strong className="text-white">Webpack</strong> - Mature, feature-rich bundler</li>
                    <li><strong className="text-white">Parcel</strong> - Zero-configuration bundler</li>
                    <li><strong className="text-white">Rollup</strong> - Optimized for libraries</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );

      case 'simplification':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Code Simplification</h3>
            {extractedCode.codeSimplification ? (
              <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: extractedCode.codeSimplification
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <div className="text-gray-400">
                <p>Simplification details will show what was cleaned up from the original code.</p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-green-900/20 border border-green-700/30 rounded">
                    <strong className="text-green-300">Removed:</strong> Build dependencies, proprietary imports, clutter
                  </div>
                  <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded">
                    <strong className="text-blue-300">Modernized:</strong> ES6+ syntax, CSS variables, modern patterns
                  </div>
                  <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded">
                    <strong className="text-purple-300">Optimized:</strong> Performance improvements, code size reduction
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'active':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Active Code Analysis</h3>
            {extractedCode.activeCode ? (
              <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: extractedCode.activeCode
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <div className="text-gray-400">
                <p>Active code analysis identifies which parts of the code are actually executed.</p>
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Code Execution Flow:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                      <li>Entry points and initialization code</li>
                      <li>Event handlers and callbacks</li>
                      <li>Rendered components and DOM updates</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded">
                    <strong className="text-yellow-300">Dead Code:</strong> Unused functions, unreachable code, commented-out sections
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'how':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
            {extractedCode.howItWorks ? (
              <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: extractedCode.howItWorks
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <div className="text-gray-400">
                <p>Step-by-step explanation of how the component works.</p>
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Architecture:</h4>
                    <p className="text-sm text-gray-400">Component structure and organization</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Data Flow:</h4>
                    <p className="text-sm text-gray-400">How data moves through the component</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Lifecycle:</h4>
                    <p className="text-sm text-gray-400">Component initialization and updates</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'editable':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Editable Sections</h3>
            {extractedCode.editableSections ? (
              <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: extractedCode.editableSections
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-blue-200 font-mono text-xs">$1</code>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <div className="text-gray-400">
                <p>Guidance on what can be safely edited and what requires caution.</p>
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-900/20 border border-green-700/30 rounded">
                    <strong className="text-green-300">Safe to Edit:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-400">
                      <li>Styling and CSS variables</li>
                      <li>Text content and labels</li>
                      <li>Configuration values</li>
                      <li>Color schemes and themes</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded">
                    <strong className="text-yellow-300">Edit with Caution:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-400">
                      <li>Event handlers and callbacks</li>
                      <li>State management logic</li>
                      <li>Component structure</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-900/20 border border-red-700/30 rounded">
                    <strong className="text-red-300">Avoid Editing:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-400">
                      <li>Core framework code</li>
                      <li>Library initialization</li>
                      <li>Critical dependencies</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-full ${className}`} role="region" aria-label="Analysis">
      {/* Section Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto shrink-0" role="tablist" aria-label="Analysis sections">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === section.id
                ? 'border-blue-500 text-blue-400 bg-gray-800/50'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6" role="tabpanel">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalysisTab;

