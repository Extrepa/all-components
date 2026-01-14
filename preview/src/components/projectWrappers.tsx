import React from 'react';
import { ThemeProvider } from '@errl-design-system';
import { AppProvider as SvgEditorAppProvider } from '@svg_editor/src/context/AppContext';

import '@svg_editor/src/index.css';
import '@svg_editor/src/App.css';
import '@figma-clone-engine/src/index.css';
import './ProjectShells.css';

export type PreviewSlot = 'left' | 'right' | 'center' | 'top' | 'bottom' | 'overlay';

interface ShellRenderOptions {
  projectName: string;
  componentName: string;
  componentPath: string;
  component: React.ReactNode;
}

export function wrapWithProjectProviders(projectName: string, children: React.ReactNode) {
  switch (projectName) {
    case 'svg_editor':
      return (
        <ThemeProvider>
          <SvgEditorAppProvider>
            <div className="app-container" style={{ minHeight: '100%', width: '100%' }}>
              {children}
            </div>
          </SvgEditorAppProvider>
        </ThemeProvider>
      );
    case 'errl_scene_builder':
    case 'figma-clone-engine':
      return (
        <ThemeProvider>
          {children}
        </ThemeProvider>
      );
    default:
      return children;
  }
}

function normalizePath(input: string) {
  return input.replace(/\\/g, '/').toLowerCase();
}

function getSvgEditorSlot(componentName: string, componentPath: string): PreviewSlot {
  const name = componentName.toLowerCase();
  const path = normalizePath(componentPath);

  if (path.includes('/components/tools/') || name.includes('tool')) return 'right';
  if (name.includes('rightpanel') || name.includes('attributes') || name.includes('inspector')) return 'right';
  if (name.includes('lefttoolbar') || name.includes('layerspanel') || name.includes('sidebar')) return 'left';
  if (name.includes('historybar')) return 'bottom';
  if (name.includes('header') || name.includes('toolheader')) return 'top';
  if (name.includes('previewarea') || name.includes('canvas')) return 'center';
  if (name.includes('tooltip') || name.includes('modal')) return 'overlay';
  return 'center';
}

function getFigmaSlot(componentName: string, componentPath: string): PreviewSlot {
  const name = componentName.toLowerCase();
  const path = normalizePath(componentPath);

  if (path.includes('/inspector/') || name.includes('inspector') || name.includes('controls') || name.includes('section')) {
    return 'right';
  }
  if (name.includes('layers') || name.includes('layerpanel')) return 'left';
  if (name.includes('dock') || name.includes('bottom')) return 'bottom';
  if (name.includes('menu') || name.includes('toolbar') || name.includes('topnav')) return 'top';
  if (name.includes('contextmenu') || name.includes('popover')) return 'overlay';
  if (name.includes('canvas') || name.includes('viewport') || name.includes('preview')) return 'center';
  return 'center';
}

function getSceneBuilderSlot(componentName: string, componentPath: string): PreviewSlot {
  const name = componentName.toLowerCase();
  const path = normalizePath(componentPath);

  if (name.includes('toolbar') || name.includes('top')) return 'top';
  if (name.includes('inspector') || name.includes('panel')) return 'right';
  if (name.includes('layer') || path.includes('/layers')) return 'left';
  if (name.includes('canvas') || name.includes('viewport') || name.includes('scene')) return 'center';
  if (name.includes('modal') || name.includes('dialog')) return 'overlay';
  return 'center';
}

function getPreviewSlot(projectName: string, componentName: string, componentPath: string): PreviewSlot {
  switch (projectName) {
    case 'svg_editor':
      return getSvgEditorSlot(componentName, componentPath);
    case 'figma-clone-engine':
      return getFigmaSlot(componentName, componentPath);
    case 'errl_scene_builder':
      return getSceneBuilderSlot(componentName, componentPath);
    default:
      return getGenericSlot(componentName, componentPath);
  }
}

function getGenericSlot(componentName: string, componentPath: string): PreviewSlot {
  const name = componentName.toLowerCase();
  const path = normalizePath(componentPath);

  if (name.includes('modal') || name.includes('dialog') || name.includes('overlay') || name.includes('popover')) {
    return 'overlay';
  }
  if (name.includes('header') || name.includes('top') || name.includes('toolbar') || name.includes('navbar') || name.includes('nav')) {
    return 'top';
  }
  if (name.includes('footer') || name.includes('bottom') || name.includes('status')) {
    return 'bottom';
  }
  if (name.includes('sidebar') || name.includes('left') || path.includes('/sidebar/')) {
    return 'left';
  }
  if (name.includes('panel') || name.includes('inspector') || name.includes('drawer') || path.includes('/panel/')) {
    return 'right';
  }
  if (name.includes('canvas') || name.includes('viewport') || name.includes('preview') || path.includes('/canvas/')) {
    return 'center';
  }
  return 'center';
}

function shouldUseGenericShell(projectName: string, componentName: string, componentPath: string) {
  if (['svg_editor', 'figma-clone-engine', 'errl_scene_builder'].includes(projectName)) {
    return false;
  }

  const name = componentName.toLowerCase();
  const path = normalizePath(componentPath);
  const hasLayoutKeyword = [
    'sidebar',
    'panel',
    'toolbar',
    'header',
    'footer',
    'nav',
    'menu',
    'inspector',
    'drawer',
    'modal',
    'dialog',
    'overlay',
    'canvas',
    'viewport',
  ].some((keyword) => name.includes(keyword) || path.includes(`/${keyword}`));

  return hasLayoutKeyword;
}

function ProjectShell({
  labels,
  slot,
  component,
}: {
  labels: { top: string; left: string; center: string; right: string; bottom: string };
  slot: PreviewSlot;
  component: React.ReactNode;
}) {
  const renderSlot = (target: PreviewSlot, label: string) => (
    slot === target
      ? <div className="project-shell-content">{component}</div>
      : <div className="project-shell-placeholder">{label}</div>
  );

  return (
    <div className="project-shell">
      <div className="project-shell-top">{renderSlot('top', labels.top)}</div>
      <div className="project-shell-body">
        <aside className="project-shell-left">{renderSlot('left', labels.left)}</aside>
        <main className="project-shell-center">{renderSlot('center', labels.center)}</main>
        <aside className="project-shell-right">{renderSlot('right', labels.right)}</aside>
      </div>
      <div className="project-shell-bottom">{renderSlot('bottom', labels.bottom)}</div>
      {slot === 'overlay' && (
        <div className="project-shell-overlay">
          <div className="project-shell-overlay-card">{component}</div>
        </div>
      )}
    </div>
  );
}

export function renderWithProjectShell(options: ShellRenderOptions) {
  const { projectName, componentName, componentPath, component } = options;
  const slot = getPreviewSlot(projectName, componentName, componentPath || '');

  switch (projectName) {
    case 'svg_editor':
      return wrapWithProjectProviders(projectName, (
        <ProjectShell
          labels={{
            top: 'Tool Header',
            left: 'Sidebar',
            center: 'Canvas',
            right: 'Inspector',
            bottom: 'History',
          }}
          slot={slot}
          component={component}
        />
      ));
    case 'figma-clone-engine':
      return wrapWithProjectProviders(projectName, (
        <ProjectShell
          labels={{
            top: 'Top Bar',
            left: 'Layers',
            center: 'Canvas',
            right: 'Inspector',
            bottom: 'Dock',
          }}
          slot={slot}
          component={component}
        />
      ));
    case 'errl_scene_builder':
      return wrapWithProjectProviders(projectName, (
        <ProjectShell
          labels={{
            top: 'Toolbar',
            left: 'Assets',
            center: 'Viewport',
            right: 'Inspector',
            bottom: 'Timeline',
          }}
          slot={slot}
          component={component}
        />
      ));
    default:
      if (!shouldUseGenericShell(projectName, componentName, componentPath)) {
        return null;
      }
      return wrapWithProjectProviders(projectName, (
        <ProjectShell
          labels={{
            top: 'Header',
            left: 'Sidebar',
            center: 'Workspace',
            right: 'Panel',
            bottom: 'Footer',
          }}
          slot={slot}
          component={component}
        />
      ));
  }
}
