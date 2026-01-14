
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@errl-design-system/styles/errlDesignSystem.css';
import { ThemeProvider } from '@errl-design-system';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050510',
          color: '#f9f5ff',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff00ff' }}>
            Something Went Wrong
          </h1>
          <p style={{ opacity: 0.8, marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Console banner to verify build and layout flag
(() => {
  const ts = new Date().toISOString();
  const params = new URL(window.location.href).searchParams;
  const ui = params.get('ui') || localStorage.getItem('ui:topPanel') || 'default';
  // eslint-disable-next-line no-console
  console.info(`[Liquid] build=${ts} ui=${ui}`);
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
