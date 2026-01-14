import React from 'react';
import { isPreviewableComponent } from '../utils/isPreviewableComponent';
import './ComponentCard.css';

interface Component {
  name: string;
  path: string;
  type: 'tsx' | 'ts' | 'js' | 'jsx';
  renderable?: boolean;
  previewable?: boolean;
}

interface ComponentCardProps {
  component: Component;
  projectName: string;
  projectPath: string;
  onSelect: () => void;
}

// Components with enhanced preview handlers
const ENHANCED_PREVIEW_COMPONENTS = ['Button', 'Card', 'Input', 'Badge', 'Tabs', 'ScrollArea'];

export function ComponentCard({ component, projectName, projectPath, onSelect }: ComponentCardProps) {
  const hasEnhancedPreview = ENHANCED_PREVIEW_COMPONENTS.includes(component.name);
  const isRenderable = component.renderable ?? (component.type === 'tsx' || component.type === 'jsx');
  const isPreviewable = component.previewable ?? isPreviewableComponent(component.path, component.name);
  const canPreview = isPreviewable && isRenderable;

  const handleSelect = () => {
    if (canPreview) {
      onSelect();
    }
  };
  
  return (
    <div className={`component-card${canPreview ? '' : ' preview-disabled'}`} onClick={handleSelect}>
      <div className="component-name">{component.name}</div>
      <div className="component-path">{projectPath}/{component.path}</div>
      <div className="component-meta">
        <span className={`component-type ${component.type}`}>
          {component.type.toUpperCase()}
        </span>
        {!canPreview && (
          <span className="component-badge" title="Preview disabled for non-UI or non-renderable components">
            Preview Disabled
          </span>
        )}
        {hasEnhancedPreview && (
          <span className="component-badge" title="This component has an enhanced preview with multiple variants and examples">
            Enhanced Preview
          </span>
        )}
      </div>
    </div>
  );
}
