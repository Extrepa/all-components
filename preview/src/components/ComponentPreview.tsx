import React, { useState, useEffect } from 'react';
import { ComponentRenderer } from './ComponentRenderer';
import { ThemeControls } from './ThemeControls';
import { componentCatalog } from '../data/componentCatalog';
import { isPreviewableComponent } from '../utils/isPreviewableComponent';
import './ComponentPreview.css';

interface ComponentPreviewProps {
  componentId: string;
  onClose: () => void;
}

export function ComponentPreview({ componentId, onClose }: ComponentPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [codePreview, setCodePreview] = useState<string | null>(null);
  const [projectName, componentName] = componentId.split(':');
  
  // Check if we're in embedded mode
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get('embed') === 'true';

  useEffect(() => {
    setError(null);
    setCodePreview(null);
    const project = componentCatalog[projectName];
    const component = project?.components.find((comp) => comp.name === componentName);
    if (!component) return;

    const isRenderable = component.renderable ?? (component.type === 'tsx' || component.type === 'jsx');
    const isPreviewable = component.previewable ?? isPreviewableComponent(component.path, component.name);

    if (!isPreviewable) {
      setError('Preview disabled for non-UI components.');
      return;
    }

    if (!isRenderable) {
      setError('Preview disabled because this UI component is not renderable in the React preview system.');
    }
  }, [componentId]);

  useEffect(() => {
    if (!error) return;
    const project = componentCatalog[projectName];
    const component = project?.components.find((comp) => comp.name === componentName);
    if (!component) return;

    const isRenderable = component.renderable ?? (component.type === 'tsx' || component.type === 'jsx');
    if (!isRenderable) return;

    const buildFileUrl = () => {
      const normalizedPath = `${project.path}/${component.path}`.replace(/\\/g, '/');
      const isDist = window.location.pathname.includes('/preview/dist/');
      return isDist ? `../${normalizedPath}` : `/${normalizedPath}`;
    };

    fetch(buildFileUrl())
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('File not accessible'))))
      .then((text) => setCodePreview(text))
      .catch(() => {
        setCodePreview(null);
      });
  }, [error, componentId, projectName, componentName]);

  // In embedded mode, render without overlay/modal
  if (isEmbedded) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '100%',
        padding: '0',
        background: 'transparent',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        {error ? (
          <div className="preview-error" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--errl-panel, rgba(7, 27, 37, 0.9))',
              border: '1px solid var(--errl-border, #163a4a)',
              borderRadius: '12px',
              maxWidth: '600px',
            }}>
              <p style={{
                color: '#ff6b6b',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}>
                ⚠️ Cannot preview this component
              </p>
              <p className="error-details" style={{
                fontSize: '0.85rem',
                color: 'var(--errl-muted, #8eb7c7)',
                fontFamily: 'Monaco, Menlo, monospace',
                wordBreak: 'break-word',
              }}>
                {error}
              </p>
              {codePreview && (
                <pre style={{
                  marginTop: '1rem',
                  textAlign: 'left',
                  maxHeight: '260px',
                  overflow: 'auto',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(7, 27, 37, 0.7)',
                  border: '1px solid var(--errl-border, #163a4a)',
                  color: 'var(--errl-text, #e6f7ff)',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                }}>
                  {codePreview}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <ComponentRenderer
            projectName={projectName}
            componentName={componentName}
            onError={setError}
            componentId={componentId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{componentName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeControls componentId={componentId} compact={true} showGlobalToggle={false} />
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="preview-content">
          {error ? (
            <div className="preview-error">
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'var(--errl-panel, rgba(7, 27, 37, 0.9))',
                border: '1px solid var(--errl-border, #163a4a)',
                borderRadius: '12px',
                margin: '2rem',
                backdropFilter: 'blur(10px)',
              }}>
                <p style={{
                  color: '#ff6b6b',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  ⚠️ Cannot preview this component
                </p>
                <p className="error-details" style={{
                  fontSize: '0.9rem',
                  color: 'var(--errl-muted, #8eb7c7)',
                  fontFamily: 'Monaco, Menlo, monospace',
                  background: 'var(--errl-surface, #071b25)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--errl-border, #163a4a)',
                  marginTop: '1rem',
                  wordBreak: 'break-word',
                }}>
                  {error}
                </p>
                {codePreview && (
                  <pre style={{
                    marginTop: '1.5rem',
                    textAlign: 'left',
                    maxHeight: '320px',
                    overflow: 'auto',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: 'var(--errl-surface, #071b25)',
                    border: '1px solid var(--errl-border, #163a4a)',
                    color: 'var(--errl-text, #e6f7ff)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                  }}>
                    {codePreview}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <ComponentRenderer
              projectName={projectName}
              componentName={componentName}
              onError={setError}
              componentId={componentId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
