import React, { useEffect, useState } from 'react';
import { ErrlWrapper } from './ErrlWrapper';
import { useErrlTheme } from '../designSystem/useErrlTheme';
import { ERRL_DESIGN_SYSTEM } from '../designSystem/errlDesignSystem';
import { componentCatalog } from '../data/componentCatalog';
import { componentRegistry, findComponentLoader, getRegistryKey } from './componentRegistry';
import { renderWithProjectShell, wrapWithProjectProviders } from './projectWrappers';

interface ComponentRendererProps {
  projectName: string;
  componentName: string;
  onError: (error: string) => void;
  componentId?: string;
}

interface LoadedComponents {
  [key: string]: React.ComponentType | any;
}

interface ComponentMeta {
  name: string;
  path: string;
  type: 'tsx' | 'ts' | 'js' | 'jsx';
  renderable?: boolean;
  previewable?: boolean;
}

function getProjectAlias(projectName: string): string {
  return `@${projectName}`;
}

// ErrorBoundary component for catching render errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName?: string; themeColors: any },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentName?: string; themeColors: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { componentName, themeColors } = this.props;
      return (
        <div style={{ 
          padding: ERRL_DESIGN_SYSTEM.spacing.xl, 
          textAlign: 'center',
          background: themeColors.panel,
          border: `1px solid ${themeColors.border}`,
          borderRadius: ERRL_DESIGN_SYSTEM.borderStyles.radius.medium,
        }}>
          <p style={{ color: '#ff6b6b', fontSize: '1.1rem', fontWeight: 600, marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm }}>
            ⚠️ Component failed to render
          </p>
          {componentName && (
            <p style={{ color: themeColors.muted, fontSize: '0.9rem', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm }}>
              Component: {componentName}
            </p>
          )}
          <p style={{ 
            fontSize: '0.85rem', 
            marginTop: ERRL_DESIGN_SYSTEM.spacing.sm, 
            color: themeColors.muted,
            fontFamily: 'Monaco, Menlo, monospace',
            opacity: 0.8,
          }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper function for hardcoded imports (fallback)
async function tryHardcodedImport(projectName: string, componentName: string): Promise<LoadedComponents> {
  const loaded: LoadedComponents = {};
  
  switch (projectName) {
    case 'errl-portal':
      if (componentName === 'Button') {
        const mod = await import('@errl-portal/ui/button');
        loaded.Button = mod.Button;
      } else if (componentName === 'Card') {
        const mod = await import('@errl-portal/ui/card');
        loaded.Card = mod.Card;
        loaded.CardHeader = mod.CardHeader;
        loaded.CardTitle = mod.CardTitle;
        loaded.CardContent = mod.CardContent;
      } else if (componentName === 'Input') {
        const mod = await import('@errl-portal/ui/input');
        loaded.Input = mod.Input;
      } else if (componentName === 'Tabs') {
        const mod = await import('@errl-portal/ui/tabs');
        loaded.Tabs = mod.Tabs;
        loaded.TabsList = mod.TabsList;
        loaded.TabsTrigger = mod.TabsTrigger;
        loaded.TabsContent = mod.TabsContent;
      } else if (componentName === 'ScrollArea') {
        const mod = await import('@errl-portal/ui/scroll-area');
        loaded.ScrollArea = mod.ScrollArea;
      }
      break;

    case 'errl-portal-shared':
      if (componentName === 'Button') {
        const mod = await import('@errl-portal-shared/ui/button');
        loaded.Button = mod.Button;
      } else if (componentName === 'Card') {
        const mod = await import('@errl-portal-shared/ui/card');
        loaded.Card = mod.Card;
        loaded.CardHeader = mod.CardHeader;
        loaded.CardTitle = mod.CardTitle;
        loaded.CardContent = mod.CardContent;
      } else if (componentName === 'Input') {
        const mod = await import('@errl-portal-shared/ui/input');
        loaded.Input = mod.Input;
      } else if (componentName === 'Badge') {
        const mod = await import('@errl-portal-shared/ui/badge');
        loaded.Badge = mod.Badge;
      } else if (componentName === 'Tabs') {
        const mod = await import('@errl-portal-shared/ui/tabs');
        loaded.Tabs = mod.Tabs;
        loaded.TabsList = mod.TabsList;
        loaded.TabsTrigger = mod.TabsTrigger;
        loaded.TabsContent = mod.TabsContent;
      } else if (componentName === 'ScrollArea') {
        const mod = await import('@errl-portal-shared/ui/scroll-area');
        loaded.ScrollArea = mod.ScrollArea;
      }
      break;
  }
  
  return loaded;
}

export function ComponentRenderer({ projectName, componentName, onError, componentId }: ComponentRendererProps) {
  const [components, setComponents] = useState<LoadedComponents>({});
  const [loading, setLoading] = useState(true);
  const [componentMeta, setComponentMeta] = useState<ComponentMeta | null>(null);
  const { theme, effect, neonColor, themeColors, styles, getErrlButtonStyle, getErrlCardStyle, getErrlInputStyle } = useErrlTheme(componentId);

  useEffect(() => {
    setLoading(true);
    setComponents({});
    setComponentMeta(null);
    onError('');

    const loadComponent = async () => {
      try {
        const loaded: LoadedComponents = {};
        const project = componentCatalog[projectName];
        
        if (!project) {
          onError(`Project "${projectName}" not found in catalog`);
          setLoading(false);
          return;
        }

        // Try case-insensitive and name variation matching
        let component = project.components.find(c => c.name === componentName);
        
        if (!component) {
          // Try case-insensitive match
          component = project.components.find(c => 
            c.name.toLowerCase() === componentName.toLowerCase()
          );
        }
        
        if (!component) {
          // Try name variations (PascalCase, camelCase, kebab-case)
          const variations = [
            componentName,
            componentName.charAt(0).toUpperCase() + componentName.slice(1), // PascalCase
            componentName.charAt(0).toLowerCase() + componentName.slice(1), // camelCase
            componentName.replace(/([A-Z])/g, '-$1').toLowerCase(), // kebab-case
            componentName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), // kebab to camel
          ];
          
          for (const variation of variations) {
            component = project.components.find(c => 
              c.name === variation || c.name.toLowerCase() === variation.toLowerCase()
            );
            if (component) break;
          }
        }
        
        if (!component) {
          onError(`Component "${componentName}" not found in project "${projectName}". Available: ${project.components.map(c => c.name).join(', ')}`);
          setLoading(false);
          return;
        }

        setComponentMeta(component);

        const registryKey = getRegistryKey(projectName, component.path);
        const loader = findComponentLoader(projectName, component.path);
        const alias = getProjectAlias(projectName);

        // Build import path - remove file extension
        const importPath = `${alias}/${component.path.replace(/\.(tsx?|jsx?)$/, '')}`;
        
        try {
          // Try to dynamically import the component
          const mod = loader ? await loader() : await import(/* @vite-ignore */ importPath);
          
          // Try common export patterns with name variations
          const nameVariations = [
            componentName,
            componentName.charAt(0).toUpperCase() + componentName.slice(1), // PascalCase
            componentName.charAt(0).toLowerCase() + componentName.slice(1), // camelCase
            componentName.replace(/([A-Z])/g, '-$1').toLowerCase(), // kebab-case
            componentName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()), // kebab to camel
            componentName + 'Component',
          ];
          
          let Component = mod.default;
          
          // Try each name variation
          for (const name of nameVariations) {
            if (mod[name]) {
              Component = mod[name];
              break;
            }
          }
          
          // If still not found, try case-insensitive search
          if (!Component || (!Component.$$typeof && typeof Component !== 'function')) {
            const exports = Object.keys(mod);
            const componentExport = exports.find(key => {
              const exportValue = mod[key];
              const keyLower = key.toLowerCase();
              const nameLower = componentName.toLowerCase();
              
              // Check if key matches component name (case-insensitive)
              if (keyLower === nameLower || keyLower === nameLower + 'component') {
                return (
                  typeof exportValue === 'function' || 
                  (exportValue && typeof exportValue === 'object' && (exportValue.$$typeof || exportValue.render))
                );
              }
              return false;
            });
            
            if (componentExport) {
              Component = mod[componentExport];
            } else {
              // Last resort: find any React component in the module
              const anyComponent = exports.find(key => {
                const exportValue = mod[key];
                return (
                  typeof exportValue === 'function' || 
                  (exportValue && typeof exportValue === 'object' && (exportValue.$$typeof || exportValue.render))
                );
              });
              if (anyComponent) {
                Component = mod[anyComponent];
              }
            }
          }

          if (Component && (typeof Component === 'function' || (Component && (Component.$$typeof || Component.render)))) {
            loaded[componentName] = Component;
            
            // Also load related components (for compound components)
            if (mod.CardHeader) loaded.CardHeader = mod.CardHeader;
            if (mod.CardTitle) loaded.CardTitle = mod.CardTitle;
            if (mod.CardContent) loaded.CardContent = mod.CardContent;
            if (mod.CardFooter) loaded.CardFooter = mod.CardFooter;
            if (mod.TabsList) loaded.TabsList = mod.TabsList;
            if (mod.TabsTrigger) loaded.TabsTrigger = mod.TabsTrigger;
            if (mod.TabsContent) loaded.TabsContent = mod.TabsContent;
            if (mod.TabsPanel) loaded.TabsPanel = mod.TabsPanel;
          } else {
            // Fallback: try the old hardcoded approach for known components
            const fallbackLoaded = await tryHardcodedImport(projectName, componentName);
            if (Object.keys(fallbackLoaded).length > 0) {
              Object.assign(loaded, fallbackLoaded);
            } else {
              onError(`Component "${componentName}" exported in unexpected format`);
              setLoading(false);
              return;
            }
          }
        } catch (importError) {
          // Fallback: try the old hardcoded approach for known components
          const fallbackLoaded = await tryHardcodedImport(projectName, componentName);
          if (Object.keys(fallbackLoaded).length > 0) {
            Object.assign(loaded, fallbackLoaded);
          } else {
            // Enhanced error message
            const errorMsg = importError instanceof Error ? importError.message : 'Unknown error';
            let detailedError = `Failed to import component: ${errorMsg}`;
            
            // Check for common issues
            if (errorMsg.includes('Cannot find module') || errorMsg.includes('Failed to resolve')) {
              detailedError += `. The component file may not exist at the expected path: ${importPath}`;
            } else if (errorMsg.includes('Unexpected token') || errorMsg.includes('SyntaxError')) {
              detailedError += `. There may be a syntax error in the component file.`;
            } else if (errorMsg.includes('dependency')) {
              detailedError += `. This component may require additional dependencies.`;
            }
            
            if (!loader) {
              detailedError += ` (registry miss: ${registryKey})`;
            }
            onError(detailedError);
            setLoading(false);
            return;
          }
        }

        if (Object.keys(loaded).length > 0) {
          setComponents(loaded);
        } else {
          onError('Component preview not available. This component may require additional dependencies or context.');
        }
      } catch (err) {
        onError(`Failed to load component: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [projectName, componentName, onError]);

  if (loading) {
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true}>
        <div style={{ textAlign: 'center', padding: '3rem', color: themeColors.text }}>Loading component...</div>
      </ErrlWrapper>
    );
  }

  const Component = components[componentName];
  if (!Component) {
    return null;
  }

  // Render components in realistic usage contexts with Errl Design System
  if (componentName === 'Button') {
    const isPortalShared = projectName === 'errl-portal-shared';
    const Button = Component;
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.xl }}>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Button Variants</h4>
          <div style={{ display: 'flex', gap: ERRL_DESIGN_SYSTEM.spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            {isPortalShared ? (
              <>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
              </>
            ) : (
              <Button variant="ghost">Ghost</Button>
            )}
          </div>
        </div>
        <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.xl }}>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Button Sizes</h4>
          <div style={{ display: 'flex', gap: ERRL_DESIGN_SYSTEM.spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="sm">Small</Button>
            <Button size={isPortalShared ? "md" : "default"}>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        <div>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>In Context</h4>
          <ErrlWrapper 
            componentId={componentId} 
            applyBackground={true}
            applyBorder={true}
            applyGlow={effect === 'neon'}
            style={{ 
              padding: ERRL_DESIGN_SYSTEM.spacing.lg,
              maxWidth: '500px',
            }}
          >
            <p style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, color: themeColors.muted }}>
              Welcome! Please choose an action:
            </p>
            <div style={{ display: 'flex', gap: ERRL_DESIGN_SYSTEM.spacing.sm, flexWrap: 'wrap' }}>
              <Button variant="default">Get Started</Button>
              <Button variant="outline">Learn More</Button>
              {isPortalShared && <Button variant="secondary">Sign Up</Button>}
            </div>
          </ErrlWrapper>
        </div>
      </ErrlWrapper>
    );
  }

  if (componentName === 'Card') {
    const Card = Component;
    const CardHeader = components.CardHeader;
    const CardTitle = components.CardTitle;
    const CardContent = components.CardContent;
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.xl }}>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Basic Card</h4>
          <ErrlWrapper 
            componentId={componentId}
            applyBorder={true}
            applyGlow={effect === 'neon'}
            style={{ maxWidth: '400px' }}
          >
            <Card style={getErrlCardStyle()}>
              {CardHeader && CardTitle && CardContent ? (
                <>
                  <CardHeader>
                    <CardTitle style={{ color: themeColors.accent }}>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ margin: 0, color: themeColors.muted }}>
                      This is the card content. Cards are used to group related information together.
                    </p>
                  </CardContent>
                </>
              ) : (
                <div style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg }}>
                  <h4 style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '1.1rem', fontWeight: 600, color: themeColors.accent }}>
                    Card Title
                  </h4>
                  <p style={{ margin: 0, color: themeColors.muted }}>
                    This is the card content. Cards are used to group related information together.
                  </p>
                </div>
              )}
            </Card>
          </ErrlWrapper>
        </div>
        <div>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Card in Layout</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: ERRL_DESIGN_SYSTEM.spacing.md, maxWidth: '600px' }}>
            <ErrlWrapper componentId={componentId} applyBorder={true} applyGlow={effect === 'neon'}>
              <Card style={getErrlCardStyle()}>
                <div style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg }}>
                  <h5 style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontWeight: 600, color: themeColors.accent }}>Feature 1</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: themeColors.muted }}>Description of feature one</p>
                </div>
              </Card>
            </ErrlWrapper>
            <ErrlWrapper componentId={componentId} applyBorder={true} applyGlow={effect === 'neon'}>
              <Card style={getErrlCardStyle()}>
                <div style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg }}>
                  <h5 style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontWeight: 600, color: themeColors.accent }}>Feature 2</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: themeColors.muted }}>Description of feature two</p>
                </div>
              </Card>
            </ErrlWrapper>
          </div>
        </div>
      </ErrlWrapper>
    );
  }

  if (componentName === 'Input') {
    const Input = Component;
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.xl }}>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Input Types</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: ERRL_DESIGN_SYSTEM.spacing.md, maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                Text Input
              </label>
              <Input placeholder="Enter your name..." style={getErrlInputStyle()} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                Email Input
              </label>
              <Input type="email" placeholder="your.email@example.com" style={getErrlInputStyle()} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                Password Input
              </label>
              <Input type="password" placeholder="Enter password" style={getErrlInputStyle()} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                Disabled Input
              </label>
              <Input disabled placeholder="Cannot edit this" style={{ ...getErrlInputStyle(), opacity: 0.5 }} />
            </div>
          </div>
        </div>
        <div>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>In Form Context</h4>
          <ErrlWrapper 
            componentId={componentId}
            applyBorder={true}
            applyGlow={effect === 'neon'}
            style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg, maxWidth: '400px' }}
          >
            <h5 style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, fontWeight: 600, color: themeColors.accent }}>
              Contact Form
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: ERRL_DESIGN_SYSTEM.spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                  Name
                </label>
                <Input placeholder="John Doe" style={getErrlInputStyle()} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                  Email
                </label>
                <Input type="email" placeholder="john@example.com" style={getErrlInputStyle()} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: ERRL_DESIGN_SYSTEM.spacing.sm, fontSize: '0.9rem', fontWeight: 500, color: themeColors.text }}>
                  Message
                </label>
                <Input placeholder="Your message here..." style={getErrlInputStyle()} />
              </div>
            </div>
          </ErrlWrapper>
        </div>
      </ErrlWrapper>
    );
  }

  if (componentName === 'Badge') {
    const Badge = Component;
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.xl }}>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>Badge Variants</h4>
          <div style={{ display: 'flex', gap: ERRL_DESIGN_SYSTEM.spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge>Custom</Badge>
          </div>
        </div>
        <div>
          <h4 style={{ 
            marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: themeColors.accent,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
          }}>In Context</h4>
          <ErrlWrapper 
            componentId={componentId}
            applyBorder={true}
            applyGlow={effect === 'neon'}
            style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: ERRL_DESIGN_SYSTEM.spacing.md, marginBottom: ERRL_DESIGN_SYSTEM.spacing.md }}>
              <span style={{ fontWeight: 600, color: themeColors.text }}>Notifications</span>
              <Badge>3</Badge>
            </div>
            <div style={{ display: 'flex', gap: ERRL_DESIGN_SYSTEM.spacing.sm, flexWrap: 'wrap' }}>
              <Badge>React</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind</Badge>
              <Badge variant="secondary">New</Badge>
            </div>
          </ErrlWrapper>
        </div>
      </ErrlWrapper>
    );
  }

  if (componentName === 'Tabs') {
    const Tabs = Component;
    const TabsList = components.TabsList;
    const TabsTrigger = components.TabsTrigger;
    const TabsContent = components.TabsContent;
    
    if (!TabsList || !TabsTrigger || !TabsContent) {
      return (
        <ErrlWrapper componentId={componentId} applyBackground={true}>
          <div style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl, textAlign: 'center', color: themeColors.text }}>
            Tabs component requires TabsList, TabsTrigger, and TabsContent
          </div>
        </ErrlWrapper>
      );
    }
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <h4 style={{ 
          marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
          fontSize: '1.1rem', 
          fontWeight: 600,
          color: themeColors.accent,
          borderBottom: `1px solid ${themeColors.border}`,
          paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
        }}>Tabs Component</h4>
        <ErrlWrapper 
          componentId={componentId}
          applyBorder={true}
          applyGlow={effect === 'neon'}
          style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg, maxWidth: '500px' }}
        >
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Settings</TabsTrigger>
              <TabsTrigger value="tab3">About</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" style={{ padding: ERRL_DESIGN_SYSTEM.spacing.md + ' 0' }}>
              <p style={{ margin: 0, color: themeColors.muted }}>
                This is the overview tab content. Here you can see general information.
              </p>
            </TabsContent>
            <TabsContent value="tab2" style={{ padding: ERRL_DESIGN_SYSTEM.spacing.md + ' 0' }}>
              <p style={{ margin: 0, color: themeColors.muted }}>
                This is the settings tab. Configure your preferences here.
              </p>
            </TabsContent>
            <TabsContent value="tab3" style={{ padding: ERRL_DESIGN_SYSTEM.spacing.md + ' 0' }}>
              <p style={{ margin: 0, color: themeColors.muted }}>
                About information goes here. Learn more about this application.
              </p>
            </TabsContent>
          </Tabs>
        </ErrlWrapper>
      </ErrlWrapper>
    );
  }

  if (componentName === 'ScrollArea') {
    const ScrollArea = Component;
    
    return (
      <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
        <h4 style={{ 
          marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
          fontSize: '1.1rem', 
          fontWeight: 600,
          color: themeColors.accent,
          borderBottom: `1px solid ${themeColors.border}`,
          paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
        }}>ScrollArea Component</h4>
        <ErrlWrapper 
          componentId={componentId}
          applyBorder={true}
          applyGlow={effect === 'neon'}
          style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg, maxWidth: '400px' }}
        >
          <ScrollArea style={{ 
            height: '200px', 
            border: `1px solid ${themeColors.border}`, 
            borderRadius: ERRL_DESIGN_SYSTEM.borderStyles.radius.small, 
            padding: ERRL_DESIGN_SYSTEM.spacing.md 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: ERRL_DESIGN_SYSTEM.spacing.md }}>
              {Array.from({ length: 10 }, (_, i) => (
                <ErrlWrapper 
                  key={i}
                  componentId={componentId}
                  applyBorder={true}
                  style={{ padding: ERRL_DESIGN_SYSTEM.spacing.sm }}
                >
                  <div style={{ fontWeight: 600, marginBottom: ERRL_DESIGN_SYSTEM.spacing.xs, color: themeColors.accent }}>
                    Item {i + 1}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: themeColors.muted }}>
                    This is item number {i + 1} in the scrollable area.
                  </div>
                </ErrlWrapper>
              ))}
            </div>
          </ScrollArea>
        </ErrlWrapper>
      </ErrlWrapper>
    );
  }

  const baseComponent = (
    <ErrorBoundary componentName={componentName} themeColors={themeColors}>
      <Component />
    </ErrorBoundary>
  );

  const shellContent = componentMeta
    ? renderWithProjectShell({
      projectName,
      componentName,
      componentPath: componentMeta.path,
      component: baseComponent,
    })
    : null;

  if (shellContent) {
    return shellContent;
  }

  const wrappedComponent = wrapWithProjectProviders(projectName, baseComponent);

  // Generic fallback renderer for all other components
  return (
    <ErrlWrapper componentId={componentId} applyBackground={true} style={{ padding: ERRL_DESIGN_SYSTEM.spacing.xl }}>
      <div style={{ marginBottom: ERRL_DESIGN_SYSTEM.spacing.md }}>
        <h4 style={{ 
          marginBottom: ERRL_DESIGN_SYSTEM.spacing.md, 
          fontSize: '1.1rem', 
          fontWeight: 600,
          color: themeColors.accent,
          borderBottom: `1px solid ${themeColors.border}`,
          paddingBottom: ERRL_DESIGN_SYSTEM.spacing.sm,
        }}>
          {componentName} Preview
        </h4>
      </div>
      <ErrlWrapper 
        componentId={componentId}
        applyBorder={true}
        applyGlow={effect === 'neon'}
        style={{ padding: ERRL_DESIGN_SYSTEM.spacing.lg }}
      >
        {wrappedComponent}
      </ErrlWrapper>
    </ErrlWrapper>
  );
}
