'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Next.js Error Boundary caught an error:', error);
    }

    // TODO: Send error to error reporting service in production
    // Example: Sentry, LogRocket, etc.
  }, [error]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        color: '#ffffff',
        fontFamily: 'JetBrains Mono, monospace',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          color: '#ff00ff',
          fontWeight: 600,
        }}
      >
        Something Went Wrong
      </h1>
      <p
        style={{
          opacity: 0.8,
          marginBottom: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(0, 255, 157, 0.2)',
            border: '1px solid rgba(0, 255, 157, 0.5)',
            borderRadius: '0.5rem',
            color: '#00ff9d',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.2)';
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(0, 255, 255, 0.2)',
            border: '1px solid rgba(0, 255, 255, 0.5)',
            borderRadius: '0.5rem',
            color: '#00ffff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
          }}
        >
          Reload Page
        </button>
      </div>
      {error.digest && (
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            opacity: 0.6,
            fontFamily: 'monospace',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
