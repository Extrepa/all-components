import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from './designSystem/ThemeProvider';
import { ComponentPreview } from './components/ComponentPreview';
import { ProjectSection } from './components/ProjectSection';
import { StatsBar } from './components/StatsBar';
import { SearchBox } from './components/SearchBox';
import { ThemeControls } from './components/ThemeControls';
import { componentCatalog } from './data/componentCatalog';
import { isPreviewableComponent } from './utils/isPreviewableComponent';
import './App.css';

function App() {
  // Check for component in URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const componentFromUrl = urlParams.get('component');
  const isEmbedded = urlParams.get('embed') === 'true';
  const hideDisabled = urlParams.get('hideDisabled') === 'true';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(componentFromUrl);
  
  // If embedded, hide the main UI and only show the component preview
  useEffect(() => {
    if (isEmbedded && componentFromUrl) {
      document.body.classList.add('embedded-preview');
      // Hide header, stats, search when embedded
      const header = document.querySelector('.app-header');
      const stats = document.querySelector('.stats-bar');
      const search = document.querySelector('.search-box');
      const projects = document.querySelector('.projects-container');
      
      if (header) (header as HTMLElement).style.display = 'none';
      if (stats) (stats as HTMLElement).style.display = 'none';
      if (search) (search as HTMLElement).style.display = 'none';
      if (projects) (projects as HTMLElement).style.display = 'none';
      
      // Optimize for iframe rendering
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      
      const app = document.querySelector('.app');
      if (app) {
        (app as HTMLElement).style.height = '100vh';
        (app as HTMLElement).style.overflow = 'auto';
      }
      
      // Make preview full screen
      const preview = document.querySelector('.preview-overlay');
      if (preview) {
        (preview as HTMLElement).style.position = 'relative';
        (preview as HTMLElement).style.background = 'transparent';
        (preview as HTMLElement).style.height = '100%';
      }
    } else {
      document.body.classList.remove('embedded-preview');
    }
    return () => {
      document.body.classList.remove('embedded-preview');
    };
  }, [isEmbedded, componentFromUrl]);

  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return componentCatalog;

    const query = searchQuery.toLowerCase();
    const filtered: typeof componentCatalog = {};

    Object.entries(componentCatalog).forEach(([projectName, project]) => {
      const filteredComponents = project.components.filter(comp =>
        comp.name.toLowerCase().includes(query) ||
        comp.path.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query)
      );

      if (filteredComponents.length > 0) {
        filtered[projectName] = {
          ...project,
          components: filteredComponents,
        };
      }
    });

    return filtered;
  }, [searchQuery]);

  const { previewableCatalog, disabledCatalog, disabledCount } = useMemo(() => {
    const previewable: typeof componentCatalog = {};
    const disabled: typeof componentCatalog = {};
    let disabledTotal = 0;

    Object.entries(filteredCatalog).forEach(([projectName, project]) => {
      const previewableComponents = [];
      const disabledComponents = [];

      project.components.forEach((component) => {
        if (component.name.startsWith('._')) {
          return;
        }

        const isRenderable = component.renderable ?? (component.type === 'tsx' || component.type === 'jsx');
        const isPreviewable = component.previewable ?? isPreviewableComponent(component.path, component.name);
        const canPreview = isRenderable && isPreviewable;

        if (canPreview) {
          previewableComponents.push(component);
        } else {
          disabledComponents.push(component);
        }
      });

      if (previewableComponents.length > 0) {
        previewable[projectName] = {
          ...project,
          components: previewableComponents,
        };
      }

      if (disabledComponents.length > 0) {
        disabled[projectName] = {
          ...project,
          components: disabledComponents,
        };
        disabledTotal += disabledComponents.length;
      }
    });

    return { previewableCatalog: previewable, disabledCatalog: disabled, disabledCount: disabledTotal };
  }, [filteredCatalog]);

  const stats = useMemo(() => {
    const totalComponents = Object.values(previewableCatalog).reduce(
      (sum, project) => sum + project.components.length,
      0
    );
    const totalProjects = Object.keys(previewableCatalog).length;
    const totalFiles = totalComponents;

    return { totalComponents, totalProjects, totalFiles, disabledComponents: disabledCount };
  }, [previewableCatalog, disabledCount]);

  return (
    <ThemeProvider>
      <div className="app">
        <div className="container">
          <header className="app-header">
            <div>
              <h1>🎨 All Components Preview</h1>
              <p className="subtitle">Browse and preview all components from your projects</p>
            </div>
            <ThemeControls compact={true} showGlobalToggle={false} />
          </header>

          <StatsBar stats={stats} />

          <SearchBox value={searchQuery} onChange={setSearchQuery} />

        {selectedComponent && (
          <ComponentPreview
            componentId={selectedComponent}
            onClose={() => setSelectedComponent(null)}
          />
        )}

        <div className="projects-container">
          {Object.entries(previewableCatalog).map(([projectName, project]) => (
            <ProjectSection
              key={projectName}
              projectName={projectName}
              project={project}
              onComponentSelect={setSelectedComponent}
            />
          ))}
        </div>

          {Object.keys(previewableCatalog).length === 0 && disabledCount === 0 && (
            <div className="empty-state">
              <h2>No components found</h2>
              <p>Try a different search term</p>
            </div>
          )}

          {!isEmbedded && !hideDisabled && disabledCount > 0 && (
            <section className="disabled-components">
              <h2>Preview Disabled Components</h2>
              <div className="disabled-list">
                {Object.entries(disabledCatalog).map(([projectName, project]) => (
                  project.components.map((component) => (
                    <div
                      key={`${projectName}:${component.name}:${component.path}`}
                      className="disabled-item"
                    >
                      <strong>{projectName}: {component.name}</strong>
                      <span>{project.path}/{component.path}</span>
                    </div>
                  ))
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
