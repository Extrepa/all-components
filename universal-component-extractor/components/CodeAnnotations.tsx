import React from 'react';

interface Annotation {
  line: number;
  type: 'safe' | 'caution' | 'warning';
  message: string;
  section?: string;
}

interface CodeAnnotationsProps {
  code: string;
  editableSections?: string;
  className?: string;
}

const CodeAnnotations: React.FC<CodeAnnotationsProps> = ({ 
  code, 
  editableSections,
  className = '' 
}) => {
  // Parse editable sections from the analysis text
  const parseAnnotations = (): Annotation[] => {
    if (!editableSections) return [];
    
    const annotations: Annotation[] = [];
    const lines = code.split('\n');
    
    // Simple keyword-based annotation detection
    // This is a basic implementation - could be enhanced with AI parsing
    const safeKeywords = ['color', 'padding', 'margin', 'font-size', 'background', 'border-radius'];
    const cautionKeywords = ['function', 'event', 'handler', 'callback', 'state', 'useState'];
    const warningKeywords = ['import', 'require', 'window.', 'document.', 'global'];
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      
      if (safeKeywords.some(kw => lowerLine.includes(kw))) {
        annotations.push({
          line: index + 1,
          type: 'safe',
          message: 'Safe to edit: Styling/configuration',
        });
      } else if (cautionKeywords.some(kw => lowerLine.includes(kw))) {
        annotations.push({
          line: index + 1,
          type: 'caution',
          message: 'Edit with caution: Logic/behavior',
        });
      } else if (warningKeywords.some(kw => lowerLine.includes(kw))) {
        annotations.push({
          line: index + 1,
          type: 'warning',
          message: 'Avoid editing: Core dependencies',
        });
      }
    });
    
    return annotations.slice(0, 10); // Limit to first 10 annotations
  };

  const annotations = parseAnnotations();

  if (annotations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800/50 border-l-4 border-blue-500 p-3 rounded-r ${className}`}>
      <div className="text-xs font-semibold text-blue-400 mb-2">Code Annotations</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {annotations.map((annotation, index) => (
          <div
            key={index}
            className={`text-xs p-2 rounded border-l-2 ${
              annotation.type === 'safe'
                ? 'bg-green-900/20 border-green-500 text-green-300'
                : annotation.type === 'caution'
                ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300'
                : 'bg-red-900/20 border-red-500 text-red-300'
            }`}
          >
            <div className="font-mono text-[10px] text-gray-400 mb-1">
              Line {annotation.line}
            </div>
            <div>{annotation.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeAnnotations;

